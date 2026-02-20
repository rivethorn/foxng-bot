import dotenv from "dotenv";
import { Bot } from "grammy";
import { mainMenu } from "./keyboards";
import {
  greet,
  testConfBtn,
  buySubTxt,
  buySubBtn,
  renewSubBtn,
  statusEnabledTxt,
  mySubBtn,
  renewTxt,
  reciptReceiveTxt,
  tutorialBtnTxt,
} from "./messages";
import { HandleTestAccount } from "./evaluationAcc";
import { HandleRenewAccount } from "./renewAcc";
import {
  ADMIN_ID,
  authToken,
  BASE_PATH,
  GB,
  getEmailFromTelID,
  loginToPanel,
  MAIN_ADDRESS,
  renewCache,
  unix30Days,
  UPDATE_CLIENT_PATH,
} from "./panelUtil";
import { HandleCheckAccount } from "./checkAcc";
import { InformUserExipry } from "./reminder";
import nodeCron from "node-cron";

dotenv.config({ quiet: true });

export const bot = new Bot(process.env.BOT_TOKEN!);

const waitingForRenewImage = new Set<number>();

// Track pending renewals by userId
const pendingRenewals = new Map<number, { photoFileId: string }>();
const pendingUUID = new Map<number, { UUID: string; inboundID: number }>();

bot.command("start", async (ctx) => {
  await ctx.reply(greet, {
    reply_markup: mainMenu,
  });
});

bot.on("message:contact", async (ctx) => {
  const contact = ctx.message.contact;

  await ctx.reply(greet, { reply_markup: mainMenu });

  await ctx.api.sendMessage(ADMIN_ID, `the contact of ${contact.first_name}`);
  await ctx.api.sendContact(ADMIN_ID, contact.phone_number, contact.first_name);
});

bot.on("message", async (ctx) => {
  // Renewal screenshot flow (must run first)
  if (waitingForRenewImage.has(ctx.from.id)) {
    if (ctx.message.photo) {
      const userId = ctx.from.id;
      const photo = ctx.message.photo.at(-1);
      if (!photo) return;

      waitingForRenewImage.delete(userId);

      // Save pending renewal
      pendingRenewals.set(userId, { photoFileId: photo.file_id });

      const email = await getEmailFromTelID(userId);

      // Send to admin with inline buttons to accept or decline
      await ctx.api.sendPhoto(ADMIN_ID, photo.file_id, {
        caption: `درخواست تمدید از طرف کاربر ${userId}  ${email}`,
        reply_markup: {
          inline_keyboard: [
            [
              { text: "✅ قبول", callback_data: `renewAccept:${userId}` },
              { text: "❌ رد", callback_data: `renewDecline:${userId}` },
            ],
          ],
        },
      });

      await ctx.reply(reciptReceiveTxt);
      return;
    }
  }

  // 🧾 Normal text commands
  if (!ctx.message.text) return;

  switch (ctx.message.text) {
    case testConfBtn:
      console.log("test config requested");
      console.log(ctx.from.id);
      await HandleTestAccount(ctx.from.id, 2);
      break;

    case buySubBtn:
      await ctx.reply(buySubTxt);
      break;

    case renewSubBtn:
      await HandleRenewAccount(ctx);
      break;

    case mySubBtn:
      await HandleCheckAccount(ctx);
      break;

    case tutorialBtnTxt:
      break;

    default:
      break;
  }
});

/**
 * Callback Query for handling account renewal inline keys.
 */
bot.callbackQuery(/^renew:/, async (ctx) => {
  const index = Number(ctx.callbackQuery.data.replace("renew:", ""));
  const userId = ctx.from.id;

  const configs = renewCache[userId];
  if (!configs) return;

  const selected = configs[index];
  const cleaned = selected?.email.replace(/^\p{Extended_Pictographic}\s*/u, "");

  console.log("selected:", cleaned, selected?.status);

  await ctx.deleteMessage();

  if (selected?.status) {
    await ctx.reply(statusEnabledTxt);
    await ctx.answerCallbackQuery();
  } else {
    waitingForRenewImage.add(userId);
    pendingUUID.set(userId, {
      UUID: selected?.uuid!,
      inboundID: selected?.inbound_id!,
    });
    await ctx.reply(renewTxt, { parse_mode: "Markdown" });
    await ctx.answerCallbackQuery();
  }
});

// Admin accepts renewal
bot.callbackQuery(/^renewAccept:/, async (ctx) => {
  const adminId = ctx.from.id;
  if (adminId !== ADMIN_ID)
    return await ctx.answerCallbackQuery({ text: "Not allowed" });

  const userId = Number(ctx.callbackQuery.data.replace("renewAccept:", ""));
  const pending = pendingRenewals.get(userId);
  if (!pending)
    return await ctx.answerCallbackQuery({ text: "No pending request" });

  const uuid = pendingUUID.get(userId)?.UUID!;
  const inbound_id = pendingUUID.get(userId)?.inboundID!;

  pendingRenewals.delete(userId);

  // Update the user's config status or call your backend logic here
  // e.g., mark account as active
  const configs = renewCache[userId]?.filter(
    (v) => v.status === false && v.uuid === uuid,
  );

  const cleaned = configs
    ?.at(0)!
    .email.replace(/^\p{Extended_Pictographic}\s*/u, "")!;

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");
  // Login if needed
  if (!authToken) {
    await loginToPanel(headers);
  }
  headers.set("Cookie", authToken!);

  const settings = JSON.stringify({
    clients: [
      {
        id: uuid,
        flow: "",
        email: cleaned,
        limitIp: 0,
        totalGB: GB(20),
        expiryTime: unix30Days(),
        enable: true,
        tgId: userId,
        subId: "",
        comment: String(userId),
        reset: 0,
      },
    ],
  });

  console.log(settings);

  const body: AddClientBody = {
    id: inbound_id,
    settings: settings,
  };

  const url = `${MAIN_ADDRESS}${BASE_PATH}${UPDATE_CLIENT_PATH}/${uuid}`;
  console.log(url);

  const req = new Request(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "include",
  });

  console.log("UUID:", uuid);
  console.log("User configs in renewCache:", renewCache[userId]);
  console.log("Settings JSON:", settings);
  console.log("URL:", url);

  const res = await fetch(req);
  console.log(res.status);
  const status = (await res.json()) as Partial<ListResp>;

  console.log(status);

  await ctx.api.sendMessage(userId, "✅ درخواست شما تایید شد و حساب فعال شد!");
  await ctx.reply("تایید شد ✅");
  await ctx.answerCallbackQuery();
});

// Admin declines renewal
bot.callbackQuery(/^renewDecline:/, async (ctx) => {
  const adminId = ctx.from.id;
  if (adminId !== ADMIN_ID)
    return await ctx.answerCallbackQuery({ text: "Not allowed" });

  const userId = Number(ctx.callbackQuery.data.replace("renewDecline:", ""));
  const pending = pendingRenewals.get(userId);
  if (!pending)
    return await ctx.answerCallbackQuery({ text: "No pending request" });

  pendingRenewals.delete(userId);

  await ctx.api.sendMessage(userId, "❌ درخواست شما رد شد.");
  await ctx.reply("رد شد ❌");
  await ctx.answerCallbackQuery();
});

console.log("starting...");

nodeCron.schedule(
  "0 22 * * *",
  () => {
    InformUserExipry();
  },
  {
    timezone: "Asia/Tehran",
  },
);

await bot.start();
