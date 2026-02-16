const addresses = process.env.PANEL_ADDRESS!.split(",");

const MAIN_ADDRESS = addresses[0]!;
const BASE_PATH = "/panel/api/inbounds";
const LOGIN_PATH = "/login/";
const ADD_CLIENT_PATH = "/addClient";
const GET_CLIENT_PATH = `/get/{id}`;
const UUID_PATH = "/panel/api/server/getNewUUID";

interface User {
    username: string;
    password: string;
}

interface UUID {
    success?: string;
    msg?: string;
    obj: {
        uuid: string;
    };
}

interface AddClientBody {
    id: number;
    settings: string;
}

let authToken: string | null = null;

export function printAd() {
    console.log(addresses[0]);
}

export function unix24Hours() {
    const now = Date.now();
    return now + 24 * 60 * 60 * 1000;
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
                    totalGB: 1073741824,
                    expiryTime: unix24Hours(),
                    enable: true,
                    tgId: "",
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
    const status = await res.json();
    console.log(status);
}

export async function HandleTestAccount(userId: number) {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

    // Login if needed
    if (!authToken) {
        await loginToPanel(headers);
    }

    const uuid = await getUUID(headers);

    await addTestClient(headers, uuid, 2, userId);
}
