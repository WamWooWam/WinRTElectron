// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { IManifestStream } from "./IManifestStream";
import { IManifestTrack } from "./IManifestTrack";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.AdaptiveStreaming.ManifestTrack')
export class ManifestTrack implements IManifestTrack { 
    readonly audioTag: number = null;
    readonly bitrate: number = null;
    readonly codecPrivateData: number[] = null;
    readonly customAttributeNames: IVectorView<string> = null;
    readonly fourCC: number = null;
    readonly hardwareProfile: number = null;
    readonly maxHeight: number = null;
    readonly maxWidth: number = null;
    readonly nalunitLength: number = null;
    readonly nominalBitrate: number = null;
    readonly stream: IManifestStream = null;
    readonly trackIndex: number = null;
    getAttribute(name: string): string {
        throw new Error('ManifestTrack#getAttribute not implemented')
    }
    getCustomAttribute(name: string): string {
        throw new Error('ManifestTrack#getCustomAttribute not implemented')
    }
}
