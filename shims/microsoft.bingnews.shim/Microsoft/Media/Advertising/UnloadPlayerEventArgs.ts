// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IVpaid } from "./IVpaid";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.UnloadPlayerEventArgs')
export class UnloadPlayerEventArgs implements IStringable { 
    readonly player: IVpaid = null;
    constructor(player: IVpaid) {
        console.warn('UnloadPlayerEventArgs.ctor not implemented')
    }
    toString(): string {
        throw new Error('UnloadPlayerEventArgs#toString not implemented')
    }
}