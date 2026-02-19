import { bot } from ".";
import { lookingForSubText, noSubFoundTxt } from "./messages";
import { userHasAccount } from "./panelUtil";

export async function HandleCheckAccount(ctx: any) {
  const looking = await ctx.reply(lookingForSubText);

  const configs = await userHasAccount(ctx.from.id);

  await bot.api.deleteMessage(ctx.from.id, looking.message_id);

  if (configs.length === 0) {
    await ctx.reply(noSubFoundTxt);
  } else {
    let statusTxt = "وضعیت حساب شما:\n\n";

    for (const conf of configs) {
      statusTxt += `${conf.email} - ${conf.status ? "فعال" : "به اتمام رسیده"}\n`;
    }

    await ctx.reply(statusTxt);
  }
}
