// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWAdReference } from "./FWAdReference";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";

export interface IFWAdSlot {
    readonly selectedAds: IVector<FWAdReference>;
    customId: string;
    adUnit: string;
    height: number | null;
    width: number | null;
    compatibleDimensions: string;
}
