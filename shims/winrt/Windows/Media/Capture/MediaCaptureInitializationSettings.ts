// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { AudioProcessing } from "../AudioProcessing";
import { MediaCategory } from "./MediaCategory";
import { PhotoCaptureSource } from "./PhotoCaptureSource";
import { StreamingCaptureMode } from "./StreamingCaptureMode";

@GenerateShim('Windows.Media.Capture.MediaCaptureInitializationSettings')
export class MediaCaptureInitializationSettings { 
    videoDeviceId: string = null;
    streamingCaptureMode: StreamingCaptureMode = null;
    photoCaptureSource: PhotoCaptureSource = null;
    audioDeviceId: string = null;
    mediaCategory: MediaCategory = null;
    audioProcessing: AudioProcessing = null;
}
