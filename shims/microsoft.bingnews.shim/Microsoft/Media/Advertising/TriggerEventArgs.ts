// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { Trigger } from "./Trigger";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.TriggerEventArgs')
export class TriggerEventArgs implements IStringable { 
    readonly trigger: Trigger = null;
    toString(): string {
        throw new Error('TriggerEventArgs#toString not implemented')
    }
}
