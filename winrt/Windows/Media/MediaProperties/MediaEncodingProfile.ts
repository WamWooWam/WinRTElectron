// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { AudioEncodingProperties } from "./AudioEncodingProperties";
import { AudioEncodingQuality } from "./AudioEncodingQuality";
import { ContainerEncodingProperties } from "./ContainerEncodingProperties";
import { VideoEncodingProperties } from "./VideoEncodingProperties";
import { VideoEncodingQuality } from "./VideoEncodingQuality";
import { IStorageFile } from "../../Storage/IStorageFile";
import { IRandomAccessStream } from "../../Storage/Streams/IRandomAccessStream";

@GenerateShim('Windows.Media.MediaProperties.MediaEncodingProfile')
export class MediaEncodingProfile { 
    video: VideoEncodingProperties = null;
    container: ContainerEncodingProperties = null;
    audio: AudioEncodingProperties = null;
    static createWav(quality: AudioEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createWav not implemented')
    }
    static createAvi(quality: VideoEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createAvi not implemented')
    }
    static createM4a(quality: AudioEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createM4a not implemented')
    }
    static createMp3(quality: AudioEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createMp3 not implemented')
    }
    static createWma(quality: AudioEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createWma not implemented')
    }
    static createMp4(quality: VideoEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createMp4 not implemented')
    }
    static createWmv(quality: VideoEncodingQuality): MediaEncodingProfile {
        throw new Error('MediaEncodingProfile#createWmv not implemented')
    }
    static createFromFileAsync(file: IStorageFile): IAsyncOperation<MediaEncodingProfile> {
        throw new Error('MediaEncodingProfile#createFromFileAsync not implemented')
    }
    static createFromStreamAsync(stream: IRandomAccessStream): IAsyncOperation<MediaEncodingProfile> {
        throw new Error('MediaEncodingProfile#createFromStreamAsync not implemented')
    }
}