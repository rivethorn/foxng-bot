import dotenv from "dotenv";
import { Bot } from "grammy";
import { mainMenu } from "./keyboards";
import {
  greet,
  testConfTxt,
  buySubTxt,
  buySubBtn,
  renewSubBtn,
} from "./messages";
import { HandleTestAccount } from "./evaluationAcc";

dotenv.config({ quiet: true });

const ADMIN_ID = process.env.ADMIN_ID!;

export const bot = new Bot(process.env.BOT_TOKEN!);

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
  switch (ctx.message.text) {
    case testConfTxt:
      console.log("test config requested");
      console.log(ctx.from.id);
      await HandleTestAccount(ctx.from.id, 2);
      break;

    case buySubBtn:
      await ctx.reply(buySubTxt);
      break;

    case renewSubBtn:
      // await HandleRenewAccount(ctx);
      break;

    default:
      break;
  }
});

console.log("starting...");
await bot.start();
