// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IImageScannerFormatConfiguration } from "./IImageScannerFormatConfiguration";
import { IImageScannerSourceConfiguration } from "./IImageScannerSourceConfiguration";
import { ImageScannerAutoCroppingMode } from "./ImageScannerAutoCroppingMode";
import { ImageScannerColorMode } from "./ImageScannerColorMode";
import { ImageScannerFormat } from "./ImageScannerFormat";
import { ImageScannerResolution } from "./ImageScannerResolution";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Rect } from "../../Foundation/Rect";
import { Size } from "../../Foundation/Size";
import { PrintMediaSize } from "../../Graphics/Printing/PrintMediaSize";
import { PrintOrientation } from "../../Graphics/Printing/PrintOrientation";

@GenerateShim('Windows.Devices.Scanners.ImageScannerFeederConfiguration')
export class ImageScannerFeederConfiguration implements IImageScannerFormatConfiguration, IImageScannerSourceConfiguration { 
    maxNumberOfPages: number = null;
    pageOrientation: PrintOrientation = null;
    pageSize: PrintMediaSize = null;
    autoDetectPageSize: boolean = null;
    duplex: boolean = null;
    scanAhead: boolean = null;
    canScanDuplex: boolean = null;
    canScanAhead: boolean = null;
    canAutoDetectPageSize: boolean = null;
    pageSizeDimensions: Size = null;
    format: ImageScannerFormat = null;
    defaultFormat: ImageScannerFormat = null;
    contrast: number = null;
    desiredResolution: ImageScannerResolution = null;
    selectedScanRegion: Rect = null;
    colorMode: ImageScannerColorMode = null;
    brightness: number = null;
    autoCroppingMode: ImageScannerAutoCroppingMode = null;
    actualResolution: ImageScannerResolution = null;
    brightnessStep: number = null;
    minBrightness: number = null;
    minContrast: number = null;
    minResolution: ImageScannerResolution = null;
    minScanArea: Size = null;
    opticalResolution: ImageScannerResolution = null;
    maxResolution: ImageScannerResolution = null;
    maxContrast: number = null;
    maxBrightness: number = null;
    defaultContrast: number = null;
    defaultColorMode: ImageScannerColorMode = null;
    defaultBrightness: number = null;
    contrastStep: number = null;
    maxScanArea: Size = null;
    isFormatSupported(value: ImageScannerFormat): boolean {
        throw new Error('ImageScannerFeederConfiguration#isFormatSupported not implemented')
    }
    isAutoCroppingModeSupported(value: ImageScannerAutoCroppingMode): boolean {
        throw new Error('ImageScannerFeederConfiguration#isAutoCroppingModeSupported not implemented')
    }
    isColorModeSupported(value: ImageScannerColorMode): boolean {
        throw new Error('ImageScannerFeederConfiguration#isColorModeSupported not implemented')
    }
    isPageSizeSupported(pageSize: PrintMediaSize, pageOrientation: PrintOrientation): boolean {
        throw new Error('ImageScannerFeederConfiguration#isPageSizeSupported not implemented')
    }
}