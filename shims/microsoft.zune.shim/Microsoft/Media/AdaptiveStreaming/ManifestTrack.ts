// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Media.AdaptiveStreaming 255.255.255.255 at Mon Mar 29 16:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IManifestStream } from "./IManifestStream";
import { IManifestTrack } from "./IManifestTrack";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.AdaptiveStreaming.ManifestTrack')
export class ManifestTrack implements IManifestTrack { 
    audioTag: number = null;
    bitrate: number = null;
    codecPrivateData: number[] = null;
    customAttributeNames: IVectorView<string> = null;
    fourCC: number = null;
    hardwareProfile: number = null;
    maxHeight: number = null;
    maxWidth: number = null;
    nalunitLength: number = null;
    nominalBitrate: number = null;
    stream: IManifestStream = null;
    trackIndex: number = null;
    getAttribute(name: string): string {
        throw new Error('ManifestTrack#getAttribute not implemented')
    }
    getCustomAttribute(name: string): string {
        throw new Error('ManifestTrack#getCustomAttribute not implemented')
    }
}
