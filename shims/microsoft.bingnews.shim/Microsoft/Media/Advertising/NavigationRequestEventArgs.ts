// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.NavigationRequestEventArgs')
export class NavigationRequestEventArgs implements IStringable { 
    readonly url: string = null;
    cancel: boolean = null;
    constructor(url: string) {
        console.warn('NavigationRequestEventArgs.ctor not implemented')
    }
    toString(): string {
        throw new Error('NavigationRequestEventArgs#toString not implemented')
    }
}