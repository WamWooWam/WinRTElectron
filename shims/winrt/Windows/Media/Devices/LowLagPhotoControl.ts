// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IMediaEncodingProperties } from "../MediaProperties/IMediaEncodingProperties";
import { MediaRatio } from "../MediaProperties/MediaRatio";
import { MediaThumbnailFormat } from "../MediaProperties/MediaThumbnailFormat";

@GenerateShim('Windows.Media.Devices.LowLagPhotoControl')
export class LowLagPhotoControl { 
    thumbnailFormat: MediaThumbnailFormat = null;
    thumbnailEnabled: boolean = null;
    desiredThumbnailSize: number = null;
    hardwareAcceleratedThumbnailSupported: number = null;
    getHighestConcurrentFrameRate(captureProperties: IMediaEncodingProperties): MediaRatio {
        throw new Error('LowLagPhotoControl#getHighestConcurrentFrameRate not implemented')
    }
    getCurrentFrameRate(): MediaRatio {
        throw new Error('LowLagPhotoControl#getCurrentFrameRate not implemented')
    }
}