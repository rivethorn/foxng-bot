import { Keyboard } from "grammy";
import { buySubTxt, contactTxt, mySubTxt, testConfTxt } from "./messages";

export const mainMenu = new Keyboard()
    .text(testConfTxt)
    .text(mySubTxt)
    .row()
    .text(contactTxt)
    .text(buySubTxt)
    .resized();
