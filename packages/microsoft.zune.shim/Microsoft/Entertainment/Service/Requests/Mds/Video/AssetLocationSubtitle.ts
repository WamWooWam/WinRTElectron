// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Thu Apr  8 00:47:24 2021
// </auto-generated>
// --------------------------------------------------

import { IAssetLocationSubtitle } from "./IAssetLocationSubtitle";
import { SubtitleType } from "./SubtitleType";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Service.Requests.Mds.Video.AssetLocationSubtitle')
export class AssetLocationSubtitle implements IAssetLocationSubtitle { 
    locale: string = null;
    subType: string = null;
    type: SubtitleType = null;
    url: string = null;
}