// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Size } from "../../Foundation/Size";
import { CameraCaptureUIMaxPhotoResolution } from "./CameraCaptureUIMaxPhotoResolution";
import { CameraCaptureUIPhotoFormat } from "./CameraCaptureUIPhotoFormat";

@GenerateShim('Windows.Media.Capture.CameraCaptureUIPhotoCaptureSettings')
export class CameraCaptureUIPhotoCaptureSettings { 
    maxResolution: CameraCaptureUIMaxPhotoResolution = null;
    format: CameraCaptureUIPhotoFormat = null;
    croppedSizeInPixels: Size = null;
    croppedAspectRatio: Size = null;
    allowCropping: boolean = null;
}