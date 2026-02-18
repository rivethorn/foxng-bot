import { InlineKeyboard } from "grammy";
import { bot } from ".";
import { lookingForSubText, noSubFoundTxt, subFoundTxt } from "./messages";
import { userHasAccount } from "./panelUtil";

//! THIS DOES NOT WORK
export async function HandleRenewAccount(ctx: any) {
  const looking = await ctx.reply(lookingForSubText);
  const configs = await userHasAccount(ctx.from.id);
  if (configs.length === 0) {
    await bot.api.deleteMessage(ctx.from.id, looking.message_id);
    await ctx.reply(noSubFoundTxt);
  } else {
    await bot.api.deleteMessage(ctx.from.id, looking.message_id);

    const keyboard = new InlineKeyboard();

    configs.forEach(({ email, status }) => {
      const cleaned = email.replace(/^\p{Extended_Pictographic}\s*/u, "");

      console.log(cleaned);
      keyboard.text(email, cleaned).row();
    });

    bot.callbackQuery("714056642", async (ctx) => {
      if (true) {
        await ctx.answerCallbackQuery({ text: "hello" });
      }
    });

    await ctx.reply(subFoundTxt, {
      reply_markup: keyboard,
    });
  }
}
