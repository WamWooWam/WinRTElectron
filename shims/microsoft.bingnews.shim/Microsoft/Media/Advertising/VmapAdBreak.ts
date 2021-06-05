// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { VmapAdSource } from "./VmapAdSource";
import { VmapExtension } from "./VmapExtension";
import { VmapTrackingEvent } from "./VmapTrackingEvent";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.VmapAdBreak')
export class VmapAdBreak implements IStringable { 
    timeOffset: string = null;
    breakType: string = null;
    breakId: string = null;
    adSource: VmapAdSource = null;
    readonly trackingEvents: IVector<VmapTrackingEvent> = null;
    readonly extensions: IVector<VmapExtension> = null;
    toString(): string {
        throw new Error('VmapAdBreak#toString not implemented')
    }
}