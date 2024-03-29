// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWAdSlot } from "./FWAdSlot";
import { FWVideoAsset } from "./FWVideoAsset";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWVideoPlayer')
export class FWVideoPlayer implements IStringable { 
    videoAsset: FWVideoAsset = null;
    readonly adSlots: IVector<FWAdSlot> = null;
    toString(): string {
        throw new Error('FWVideoPlayer#toString not implemented')
    }
}
