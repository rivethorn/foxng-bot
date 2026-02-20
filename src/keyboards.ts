import { Keyboard } from "grammy";
import {
  tutorialBtnTxt,
  renewSubBtn,
  buySubBtn,
  mySubBtn,
  contactTxt,
} from "./messages";

export const shareContactKey = new Keyboard()
  .requestContact("☎️ ارسال شماره موبایل")
  .resized()
  .oneTime();

export const mainMenu = new Keyboard()
  .text(renewSubBtn)
  .text(buySubBtn)
  .row()
  .text(tutorialBtnTxt)
  .text(mySubBtn)
  .row()
  .text(contactTxt)
  .resized();
