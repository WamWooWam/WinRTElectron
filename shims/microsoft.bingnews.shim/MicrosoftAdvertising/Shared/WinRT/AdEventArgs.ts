// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { Advertisement } from "./Advertisement";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('MicrosoftAdvertising.Shared.WinRT.AdEventArgs')
export class AdEventArgs implements IStringable { 
    readonly ad: Advertisement = null;
    toString(): string {
        throw new Error('AdEventArgs#toString not implemented')
    }
}
