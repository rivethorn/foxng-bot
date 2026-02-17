import dotenv from "dotenv";
import { Bot } from "grammy";
import { mainMenu } from "./keyboards";
import { greet, testConfTxt, contactTxt } from "./messages";
import { HandleTestAccount } from "./testAccount";

dotenv.config({ quiet: true });

export const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", (ctx) => ctx.reply(greet, { reply_markup: mainMenu }));

bot.on("message", async (ctx) => {
    switch (ctx.message.text) {
        case testConfTxt:
            console.log("test config requested");
            console.log(ctx.from.id);
            await HandleTestAccount(ctx.from.id);
            break;

        case contactTxt:
            break;

        default:
            break;
    }
});

console.log("starting...");
await bot.start();
