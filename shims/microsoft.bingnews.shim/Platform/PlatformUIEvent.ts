// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.PlatformUIEvent')
export class PlatformUIEvent implements IStringable { 
    message: string = null;
    code: number = null;
    logEvent(): void {
        console.warn('PlatformUIEvent#logEvent not implemented')
    }
    toString(): string {
        throw new Error('PlatformUIEvent#toString not implemented')
    }
}