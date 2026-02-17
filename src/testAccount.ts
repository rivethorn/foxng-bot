import { sleep } from "bun";
import { bot } from ".";
import { creatingTestConfTxt } from "./messages";
import {
    GB,
    unix24Hours,
    MAIN_ADDRESS,
    BASE_PATH,
    ADD_CLIENT_PATH,
    authToken,
    loginToPanel,
    getUUID,
    generateConfigURL,
    getInbounds,
} from "./panelUtil";

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

/**
 * Wrapper function around add the bits and pieces for adding a test client.
 * @param userId Telegram User ID of the user you want to add to the clients.
 * @param inboundID The ID of the inbound you want to add the client to.
 */
export async function HandleTestAccount(userId: number, inboundID: number) {
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
