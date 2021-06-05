// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IAdSource } from "../../../Media/Advertising/IAdSource";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.PlayerFramework.Js.Advertising.AdSource')
export class AdSource implements IAdSource, IStringable { 
    payload: any = null;
    key: string = null;
    type: string = null;
    allowMultipleAds: boolean = null;
    maxRedirectDepth: number | null = null;
    // constructor();
    // constructor(type: string);
    // constructor(payload: any, type: string);
    constructor(...args) { }
    toString(): string {
        throw new Error('AdSource#toString not implemented')
    }
}
