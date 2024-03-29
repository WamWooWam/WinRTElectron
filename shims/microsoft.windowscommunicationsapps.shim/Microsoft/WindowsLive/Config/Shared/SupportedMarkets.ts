// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:37 2021
// </auto-generated>
// --------------------------------------------------

import { IMarket } from "./IMarket";
import { ISupportedMarkets } from "./ISupportedMarkets";
import { IMapView } from "winrt/Windows/Foundation/Collections/IMapView`2";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Config.Shared.SupportedMarkets')
export class SupportedMarkets implements ISupportedMarkets { 
    readonly market: IMapView<string, IMarket> = null;
}
