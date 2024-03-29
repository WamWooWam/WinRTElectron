// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { IClosable } from "../../Foundation/IClosable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IPrintDocumentSource } from "../../Graphics/Printing/IPrintDocumentSource";
import { PrintContent } from "./PrintContent";

@GenerateShim('Windows.UI.WebUI.HtmlPrintDocumentSource')
export class HtmlPrintDocumentSource implements IPrintDocumentSource, IClosable { 
    topMargin: number = null;
    shrinkToFit: boolean = null;
    rightMargin: number = null;
    percentScale: number = null;
    leftMargin: number = null;
    enableHeaderFooter: boolean = null;
    content: PrintContent = null;
    bottomMargin: number = null;
    pageRange: string = null;
    trySetPageRange(strPageRange: string): boolean {
        throw new Error('HtmlPrintDocumentSource#trySetPageRange not implemented')
    }
    close(): void {
        console.warn('HtmlPrintDocumentSource#close not implemented')
    }
}
