import { sleep } from "bun";
import { bot } from ".";
import { creatingTestConfTxt } from "./messages";

const addresses = process.env.PANEL_ADDRESS!.split(",");

const MAIN_ADDRESS = addresses[0]!;
const BASE_PATH = "/panel/api/inbounds";
const LOGIN_PATH = "/login/";
const ADD_CLIENT_PATH = "/addClient";
const GET_INBOUNDS_PATH = "/list";
const UUID_PATH = "/panel/api/server/getNewUUID";

let authToken: string | null = null;

function unix24Hours() {
    const now = Date.now();
    return now + 24 * 60 * 60 * 1000;
}

function unix30Days() {
    const now = Date.now();
    return now + 24 * 30 * 60 * 60 * 1000;
}

function GB(gbs: number) {
    return gbs * 1073741824;
}

async function loginToPanel(headers: Headers) {
    console.log("start login...");
    const user: User = {
        username: process.env.USERNAME!,
        password: process.env.PASSWORD!,
    };
    const req = new Request(`${MAIN_ADDRESS}${LOGIN_PATH}`, {
        method: "POST",
        headers,
        body: JSON.stringify(user),
        credentials: "include",
    });

    const res = await fetch(req);
    const status = await res.json();
    console.log(status);

    // Extract 3x-ui cookie value from Set-Cookie header
    const setCookieHeader = res.headers.get("Set-Cookie");
    if (setCookieHeader?.includes("3x-ui=")) {
        // Extract just the cookie name=value part
        const cookiePart = setCookieHeader.split(";")[0];
        authToken = cookiePart!;
        console.log("Login successful, cookie set");
    }
}

async function getUUID(headers: Headers) {
    console.log("getting uuid...");

    // Add cookie to request if we have it
    if (authToken) {
        headers.set("Cookie", authToken);
    }

    const req = new Request(`${MAIN_ADDRESS}${UUID_PATH}`, {
        method: "GET",
        headers,
        credentials: "include",
    });

    const res = await fetch(req);
    const body = (await res.json()) as UUID;
    const uuid = body.obj.uuid;

    console.log(body.obj.uuid);
    return uuid;
}

async function addTestClient(
    headers: Headers,
    uuid: string,
    inbound: number,
    userId: number,
) {
    console.log(`adding test to ${inbound}`);
    const body: AddClientBody = {
        id: inbound,
        settings: JSON.stringify({
            clients: [
                {
                    id: uuid,
                    flow: "",
                    email: userId.toString(),
                    limitIp: 0,
                    totalGB: GB(1),
                    expiryTime: unix24Hours(),
                    enable: true,
                    tgId: userId,
                    subId: "",
                    comment: "",
                    reset: 0,
                },
            ],
        }),
    };

    const req = new Request(`${MAIN_ADDRESS}${BASE_PATH}${ADD_CLIENT_PATH}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        credentials: "include",
    });

    const res = await fetch(req);
    const status = (await res.json()) as Partial<ListResp>;
    return status;
}

export async function HandleTestAccount(userId: number) {
    const waitMgs = await bot.api.sendMessage(userId, creatingTestConfTxt);
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    // Login if needed
    if (!authToken) {
        await loginToPanel(headers);
    }

    const uuid = await getUUID(headers);

    const addResult = await addTestClient(headers, uuid, 2, userId);

    if (addResult.msg?.includes("Duplicate")) {
        await sleep(500);

        await bot.api.deleteMessage(userId, waitMgs.message_id);

        await bot.api.sendMessage(userId, "شرمنده، هر کی فقط یکی!!");

        return;
    }

    const listInbound = await getInbounds(headers);

    const conf = await generateConfigURL(userId, listInbound);

    console.log("Config: ", conf);

    await sleep(500);

    await bot.api.deleteMessage(userId, waitMgs.message_id);

    const confirmMsg = `<b>کانفیگ شما با موفقیت ساخته شد</b>
    
<code>${conf}</code>
    `;
    await bot.api.sendMessage(userId, confirmMsg, { parse_mode: "HTML" });
}

async function getInbounds(headers: Headers) {
    console.log("start getInbounds");

    // Login if needed
    if (authToken) {
        headers.set("Cookie", authToken);
    }

    const req = new Request(`${MAIN_ADDRESS}${BASE_PATH}${GET_INBOUNDS_PATH}`, {
        method: "GET",
        headers,
        credentials: "include",
    });

    const res = await fetch(req);

    const js = (await res.json()) as Omit<ListResp, "obj"> & {
        obj: (Omit<Obj, "settings" | "streamSettings"> & {
            settings: string;
            streamSettings: string;
        })[];
    };

    // Parse settings JSON strings to objects
    const parsed: ListResp = {
        ...js,
        obj: js.obj.map((obj) => ({
            ...obj,
            settings: JSON.parse(obj.settings) as Settings,
            streamSettings: JSON.parse(obj.streamSettings) as StreamSettings,
        })),
    };

    return parsed;
}

async function generateConfigURL(tgID: number, inbounds: ListResp) {
    for (let obj of inbounds.obj) {
        for (let client of obj.settings.clients) {
            if (tgID === client.tgId) {
                return `${obj.protocol}://${client.id}@${new URL(MAIN_ADDRESS).hostname}:${obj.port}?type=${obj.streamSettings.network}&encryption=${obj.settings.encryption || "none"}&security=${obj.streamSettings.security}#${obj.remark}-${client.email}`;
            }
        }
    }
}
