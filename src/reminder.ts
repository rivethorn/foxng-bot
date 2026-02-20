import { bot } from ".";
import { authToken, getInbounds, loginToPanel } from "./panelUtil";

async function getAllClients() {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  // Login if needed
  if (!authToken) {
    await loginToPanel(headers);
  }
  headers.set("Cookie", authToken!);

  const inbounds = await getInbounds(headers);
  const clients: Client[] = [];

  for (const inbound of inbounds.obj) {
    for (const v of inbound.settings.clients) {
      clients.push(v);
    }
  }

  return clients;
}

export async function InformUserExipry() {
  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
  const clients = await getAllClients();
  const now = Date.now();

  clients.forEach((client) => {
    if (client.expiryTime <= now + TWO_DAYS) {
      bot.api.sendMessage(
        client.tgId || client.comment,
        `
مشترک عزیز
حساب شما به اسم ${client.email} تا دو روز دیگر به اتمام میرسد.

جهت تمدید اشتراک از دکمه "♻️ تمدید اشتراک" استفاده کنید.

با تشکر
        `,
      );
    }
  });
}
