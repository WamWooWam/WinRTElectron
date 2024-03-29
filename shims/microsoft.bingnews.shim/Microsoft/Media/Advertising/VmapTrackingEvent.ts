// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { VmapTrackingEventType } from "./VmapTrackingEventType";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.Advertising.VmapTrackingEvent')
export class VmapTrackingEvent implements IStringable { 
    trackingUri: Uri = null;
    eventType: VmapTrackingEventType = null;
    toString(): string {
        throw new Error('VmapTrackingEvent#toString not implemented')
    }
}
