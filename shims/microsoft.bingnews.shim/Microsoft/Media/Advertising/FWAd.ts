// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWCreative } from "./FWCreative";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWAd')
export class FWAd implements IStringable { 
    adUnit: string = null;
    id: string = null;
    noPreload: boolean = null;
    noLoad: boolean = null;
    bundleId: number = null;
    readonly creatives: IVector<FWCreative> = null;
    toString(): string {
        throw new Error('FWAd#toString not implemented')
    }
}
