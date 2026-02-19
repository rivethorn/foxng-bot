import { InlineKeyboard } from "grammy";
import { bot } from ".";
import { lookingForSubText, noSubFoundTxt, subFoundTxt } from "./messages";
import { renewCache, userHasAccount } from "./panelUtil";

export async function HandleRenewAccount(ctx: any) {
  const looking = await ctx.reply(lookingForSubText);

  const configs = await userHasAccount(ctx.from.id);

  await bot.api.deleteMessage(ctx.from.id, looking.message_id);
  if (configs.length === 0) {
    await ctx.reply(noSubFoundTxt);
  } else {
    const keyboard = new InlineKeyboard();

    configs.forEach((config, idx) => {
      keyboard.text(config.email, `renew:${idx}`).row();
    });

    renewCache[ctx.from.id] = configs;

    await ctx.reply(subFoundTxt, {
      reply_markup: keyboard,
    });
  }
}
