// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Media.AdaptiveStreaming 255.255.255.255 at Mon Mar 29 16:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { AdaptiveSourceManagerFailedType } from "./AdaptiveSourceManagerFailedType";
import { HResult } from "winrt/Windows/Foundation/HResult";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.AdaptiveStreaming.AdaptiveSourceManagerFailedEventArgs')
export class AdaptiveSourceManagerFailedEventArgs { 
    failType: AdaptiveSourceManagerFailedType = null;
    result: number = null;
}
