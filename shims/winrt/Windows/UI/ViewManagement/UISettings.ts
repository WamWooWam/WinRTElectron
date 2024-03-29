// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Size } from "../../Foundation/Size";
import { Color } from "../Color";
import { HandPreference } from "./HandPreference";
import { UIElementType } from "./UIElementType";

// @GenerateShim('Windows.UI.ViewManagement.UISettings')
export class UISettings {
    animationsEnabled: boolean = true;
    caretBlinkRate: number = 1000;
    caretBrowsingEnabled: boolean = false;
    caretWidth: number = 1;
    cursorSize: Size = { width: 16, height: 16 };
    doubleClickTime: number = 2;
    handPreference: HandPreference = HandPreference.leftHanded;
    messageDuration: number = 5;
    mouseHoverTime: number = 500;
    scrollBarArrowSize: Size = null;
    scrollBarSize: Size = null;
    scrollBarThumbBoxSize: Size = null;
    uielementColor(desiredElement: UIElementType): Color {
        throw new Error('UISettings#uielementColor not implemented')
    }
}
