// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('MicrosoftAdvertising.Shared.WinRT.Advertisement')
export class Advertisement implements IStringable { 
    readonly guid: string = null;
    readonly rendererUrl: string = null;
    readonly adParameters: string = null;
    readonly prmParameters: string = null;
    toString(): string {
        throw new Error('Advertisement#toString not implemented')
    }
}
