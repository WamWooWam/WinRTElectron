// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { LanguageFont } from "./LanguageFont";

@GenerateShim('Windows.Globalization.Fonts.LanguageFontGroup')
export class LanguageFontGroup {
    documentAlternate1Font: LanguageFont = null;
    documentAlternate2Font: LanguageFont = null;
    documentHeadingFont: LanguageFont = new LanguageFont("Calibri Light");
    fixedWidthTextFont: LanguageFont = new LanguageFont("Consolas");
    modernDocumentFont: LanguageFont = new LanguageFont("Calibri");
    traditionalDocumentFont: LanguageFont = new LanguageFont("Times New Roman");
    uicaptionFont: LanguageFont = null;
    uiheadingFont: LanguageFont = null;
    uinotificationHeadingFont: LanguageFont = null;
    uitextFont: LanguageFont = null;
    uititleFont: LanguageFont = null;
    constructor(languageTag: string) {
        console.warn('LanguageFontGroup.ctor not implemented')
    }
}
