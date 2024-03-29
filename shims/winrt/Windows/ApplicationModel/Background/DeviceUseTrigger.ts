// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { DeviceTriggerResult } from "./DeviceTriggerResult";
import { IBackgroundTrigger } from "./IBackgroundTrigger";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Background.DeviceUseTrigger')
export class DeviceUseTrigger implements IBackgroundTrigger { 
    requestAsyncSimple(deviceId: string): IAsyncOperation<DeviceTriggerResult> {
        throw new Error('DeviceUseTrigger#requestAsyncSimple not implemented')
    }
    requestAsyncWithArguments(deviceId: string, __arguments: string): IAsyncOperation<DeviceTriggerResult> {
        throw new Error('DeviceUseTrigger#requestAsyncWithArguments not implemented')
    }
}
