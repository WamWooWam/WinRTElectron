// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { MediaStreamType } from "../Capture/MediaStreamType";
import { PowerlineFrequency } from "../Capture/PowerlineFrequency";
import { CaptureUse } from "./CaptureUse";
import { ExposureCompensationControl } from "./ExposureCompensationControl";
import { ExposureControl } from "./ExposureControl";
import { FlashControl } from "./FlashControl";
import { FocusControl } from "./FocusControl";
import { IMediaDeviceController } from "./IMediaDeviceController";
import { IsoSpeedControl } from "./IsoSpeedControl";
import { LowLagPhotoControl } from "./LowLagPhotoControl";
import { LowLagPhotoSequenceControl } from "./LowLagPhotoSequenceControl";
import { MediaDeviceControl } from "./MediaDeviceControl";
import { RegionsOfInterestControl } from "./RegionsOfInterestControl";
import { SceneModeControl } from "./SceneModeControl";
import { TorchControl } from "./TorchControl";
import { WhiteBalanceControl } from "./WhiteBalanceControl";
import { IMediaEncodingProperties } from "../MediaProperties/IMediaEncodingProperties";

@GenerateShim('Windows.Media.Devices.VideoDeviceController')
export class VideoDeviceController implements IMediaDeviceController { 
    backlightCompensation: MediaDeviceControl = null;
    brightness: MediaDeviceControl = null;
    contrast: MediaDeviceControl = null;
    exposure: MediaDeviceControl = null;
    focus: MediaDeviceControl = null;
    hue: MediaDeviceControl = null;
    pan: MediaDeviceControl = null;
    roll: MediaDeviceControl = null;
    tilt: MediaDeviceControl = null;
    whiteBalance: MediaDeviceControl = null;
    zoom: MediaDeviceControl = null;
    primaryUse: CaptureUse = null;
    exposureCompensationControl: ExposureCompensationControl = null;
    exposureControl: ExposureControl = null;
    flashControl: FlashControl = null;
    focusControl: FocusControl = null;
    isoSpeedControl: IsoSpeedControl = null;
    lowLagPhoto: LowLagPhotoControl = null;
    lowLagPhotoSequence: LowLagPhotoSequenceControl = null;
    regionsOfInterestControl: RegionsOfInterestControl = null;
    sceneModeControl: SceneModeControl = null;
    torchControl: TorchControl = null;
    whiteBalanceControl: WhiteBalanceControl = null;
    trySetPowerlineFrequency(value: PowerlineFrequency): boolean {
        throw new Error('VideoDeviceController#trySetPowerlineFrequency not implemented')
    }
    tryGetPowerlineFrequency(): { succeeded: boolean, value: PowerlineFrequency } {
        throw new Error('VideoDeviceController#tryGetPowerlineFrequency not implemented')
    }
    getAvailableMediaStreamProperties(mediaStreamType: MediaStreamType): IVectorView<IMediaEncodingProperties> {
        throw new Error('VideoDeviceController#getAvailableMediaStreamProperties not implemented')
    }
    getMediaStreamProperties(mediaStreamType: MediaStreamType): IMediaEncodingProperties {
        throw new Error('VideoDeviceController#getMediaStreamProperties not implemented')
    }
    setMediaStreamPropertiesAsync(mediaStreamType: MediaStreamType, mediaEncodingProperties: IMediaEncodingProperties): IAsyncAction {
        throw new Error('VideoDeviceController#setMediaStreamPropertiesAsync not implemented')
    }
    setDeviceProperty(propertyId: string, propertyValue: any): void {
        console.warn('VideoDeviceController#setDeviceProperty not implemented')
    }
    getDeviceProperty(propertyId: string): any {
        throw new Error('VideoDeviceController#getDeviceProperty not implemented')
    }
}
