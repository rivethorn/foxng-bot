import { Keyboard } from "grammy";
import {
  tutorialBtnTxt,
  renewSubBtn,
  buySubBtn,
  mySubBtn,
  contactTxt,
  resetBtn,
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
  .resized()
  .persistent();

export const oneM40G = "اشتراک 1 ماهه 40 گیگابایت - 250 هزار تومان";
export const oneM80G = "اشتراک 1 ماهه 80 گیگابایت - 450 هزار تومان";

export const renewMenu = new Keyboard()
  .text(oneM40G)
  .row()
  .text(oneM80G)
  .row()
  .text(resetBtn)
  .resized();
