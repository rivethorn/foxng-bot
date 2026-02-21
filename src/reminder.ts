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
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const GB = (n: number) => n * 1024 * 1024 * 1024;
  const clients = await getAllClients();
  const now = Date.now();

  clients.forEach((client) => {
    if (
      (client.expiryTime <= now + THREE_DAYS &&
        client.expiryTime !== 0 &&
        client.enable) ||
      (client.totalGB <= GB(3) && client.totalGB !== 0 && client.enable)
    ) {
      bot.api.sendMessage(
        client.tgId || client.comment,
        `
مشترک عزیز
حساب شما به اسم ${client.email}
به زودی منقضی خواهد شد. لطفا برای جلوگیری از قطع شدن سرویس و ادامه استفاده از حساب خود، نسبت به تمدید اشتراک اقدام کنید.

جهت تمدید اشتراک از دکمه " ♻️ تمدید اشتراک"
یا /renew استفاده کن

با تشکر
        `,
      );
    }
  });
}
