// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IDebug } from "./IDebug";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Util.Debug')
export class Debug implements IDebug { 
    outputDebugString(text: string): void {
        console.warn('Debug#outputDebugString not implemented')
    }
}