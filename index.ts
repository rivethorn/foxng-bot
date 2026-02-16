import dotenv from "dotenv";
import { Bot } from "grammy";
import { greet, testConfTxt } from "./messages";
import { mainMenu } from "./keyboards";
import { HandleTestAccount, printAd } from "./panel";

dotenv.config({ quiet: true });

const bot = new Bot(process.env.BOT_TOKEN!);

bot.command("start", (ctx) => ctx.reply(greet, { reply_markup: mainMenu }));

bot.on("message", async (ctx) => {
    switch (ctx.message.text) {
        case testConfTxt:
            console.log("test config requested");
            console.log(ctx.from.id);
            await HandleTestAccount(ctx.from.id);

            break;

        default:
            break;
    }
});

bot.start();
console.log("running");
printAd();
