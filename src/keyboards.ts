import { Keyboard } from "grammy";
import {
  testConfTxt,
  mySubTxt,
  contactTxt,
  buySubTxt,
  tutorialBtnTxt,
} from "./messages";

export const mainMenu = new Keyboard()
  .text(testConfTxt)
  .text(mySubTxt)
  .row()
  .text(contactTxt)
  .text(buySubTxt)
  .row()
  .text(tutorialBtnTxt)
  .resized();
