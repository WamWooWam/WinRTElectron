// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IMediaEncodingProperties } from "./IMediaEncodingProperties";
import { MediaPropertySet } from "./MediaPropertySet";

@GenerateShim('Windows.Media.MediaProperties.AudioEncodingProperties')
export class AudioEncodingProperties implements IMediaEncodingProperties { 
    subtype: string = null;
    properties: MediaPropertySet = null;
    type: string = null;
    sampleRate: number = null;
    channelCount: number = null;
    bitsPerSample: number = null;
    bitrate: number = null;
    setFormatUserData(value: number[]): void {
        console.warn('AudioEncodingProperties#setFormatUserData not implemented')
    }
    getFormatUserData(): number[] {
        throw new Error('AudioEncodingProperties#getFormatUserData not implemented')
    }
    static createAac(sampleRate: number, channelCount: number, bitrate: number): AudioEncodingProperties {
        throw new Error('AudioEncodingProperties#createAac not implemented')
    }
    static createAacAdts(sampleRate: number, channelCount: number, bitrate: number): AudioEncodingProperties {
        throw new Error('AudioEncodingProperties#createAacAdts not implemented')
    }
    static createMp3(sampleRate: number, channelCount: number, bitrate: number): AudioEncodingProperties {
        throw new Error('AudioEncodingProperties#createMp3 not implemented')
    }
    static createPcm(sampleRate: number, channelCount: number, bitsPerSample: number): AudioEncodingProperties {
        throw new Error('AudioEncodingProperties#createPcm not implemented')
    }
    static createWma(sampleRate: number, channelCount: number, bitrate: number): AudioEncodingProperties {
        throw new Error('AudioEncodingProperties#createWma not implemented')
    }
}
