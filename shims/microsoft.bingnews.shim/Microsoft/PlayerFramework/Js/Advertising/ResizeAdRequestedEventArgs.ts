// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.PlayerFramework.Js.Advertising.ResizeAdRequestedEventArgs')
export class ResizeAdRequestedEventArgs implements IStringable { 
    readonly width: number = null;
    readonly height: number = null;
    readonly viewMode: string = null;
    toString(): string {
        throw new Error('ResizeAdRequestedEventArgs#toString not implemented')
    }
}