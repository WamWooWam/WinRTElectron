// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { MediaFileDelivery } from "./MediaFileDelivery";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.Advertising.MediaFile')
export class MediaFile implements IStringable { 
    id: string = null;
    delivery: MediaFileDelivery = null;
    type: string = null;
    value: Uri = null;
    width: number = null;
    height: number = null;
    bitrate: number | null = null;
    minBitrate: number | null = null;
    maxBitrate: number | null = null;
    scalable: boolean | null = null;
    maintainAspectRatio: boolean | null = null;
    apiFramework: string = null;
    codec: string = null;
    ranking: number = null;
    toString(): string {
        throw new Error('MediaFile#toString not implemented')
    }
}