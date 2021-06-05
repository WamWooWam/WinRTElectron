// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWAdReference } from "./FWAdReference";
import { IFWAdSlot } from "./IFWAdSlot";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWAdSlot')
export class FWAdSlot implements IFWAdSlot, IStringable { 
    height: number | null = null;
    width: number | null = null;
    compatibleDimensions: string = null;
    customId: string = null;
    adUnit: string = null;
    readonly selectedAds: IVector<FWAdReference> = null;
    toString(): string {
        throw new Error('FWAdSlot#toString not implemented')
    }
}