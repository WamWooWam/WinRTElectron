// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IMediaStreamDescriptor } from "./IMediaStreamDescriptor";
import { AudioEncodingProperties } from "../MediaProperties/AudioEncodingProperties";

@GenerateShim('Windows.Media.Core.AudioStreamDescriptor')
export class AudioStreamDescriptor implements IMediaStreamDescriptor { 
    encodingProperties: AudioEncodingProperties = null;
    name: string = null;
    language: string = null;
    isSelected: boolean = null;
    constructor(encodingProperties: AudioEncodingProperties) {
        console.warn('AudioStreamDescriptor.ctor not implemented')
    }
}
