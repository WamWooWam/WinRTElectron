// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { IManifestStream } from "./IManifestStream";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";

export interface IManifestTrack {
    readonly audioTag: number;
    readonly bitrate: number;
    readonly codecPrivateData: number[];
    readonly customAttributeNames: IVectorView<string>;
    readonly fourCC: number;
    readonly hardwareProfile: number;
    readonly maxHeight: number;
    readonly maxWidth: number;
    readonly nalunitLength: number;
    readonly nominalBitrate: number;
    readonly stream: IManifestStream;
    readonly trackIndex: number;
    getAttribute(name: string): string;
    getCustomAttribute(name: string): string;
}