// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { BitmapAlphaMode } from "./BitmapAlphaMode";
import { BitmapPixelFormat } from "./BitmapPixelFormat";
import { BitmapPropertiesView } from "./BitmapPropertiesView";
import { BitmapTransform } from "./BitmapTransform";
import { ColorManagementMode } from "./ColorManagementMode";
import { ExifOrientationMode } from "./ExifOrientationMode";
import { IBitmapFrame } from "./IBitmapFrame";
import { ImageStream } from "./ImageStream";
import { PixelDataProvider } from "./PixelDataProvider";

@GenerateShim('Windows.Graphics.Imaging.BitmapFrame')
export class BitmapFrame implements IBitmapFrame { 
    bitmapAlphaMode: BitmapAlphaMode = null;
    bitmapPixelFormat: BitmapPixelFormat = null;
    bitmapProperties: BitmapPropertiesView = null;
    dpiX: number = null;
    dpiY: number = null;
    orientedPixelHeight: number = null;
    orientedPixelWidth: number = null;
    pixelHeight: number = null;
    pixelWidth: number = null;
    getThumbnailAsync(): IAsyncOperation<ImageStream> {
        throw new Error('BitmapFrame#getThumbnailAsync not implemented')
    }
    getPixelDataAsync(): IAsyncOperation<PixelDataProvider> {
        throw new Error('BitmapFrame#getPixelDataAsync not implemented')
    }
    getPixelDataTransformedAsync(pixelFormat: BitmapPixelFormat, alphaMode: BitmapAlphaMode, transform: BitmapTransform, exifOrientationMode: ExifOrientationMode, colorManagementMode: ColorManagementMode): IAsyncOperation<PixelDataProvider> {
        throw new Error('BitmapFrame#getPixelDataTransformedAsync not implemented')
    }
}