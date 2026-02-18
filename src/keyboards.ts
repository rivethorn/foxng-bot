import { Keyboard } from "grammy";
import { mySubTxt, tutorialBtnTxt, renewSubBtn, buySubBtn } from "./messages";

export const shareContactKey = new Keyboard()
  .requestContact("☎️ ارسال شماره موبایل")
  .resized()
  .oneTime();

export const mainMenu = new Keyboard()
  .text(renewSubBtn)
  .text(buySubBtn)
  .row()
  .text(tutorialBtnTxt)
  .text(mySubTxt)
  .resized();
