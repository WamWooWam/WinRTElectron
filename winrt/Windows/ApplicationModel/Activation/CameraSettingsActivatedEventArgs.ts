// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ActivationKind } from "./ActivationKind";
import { ApplicationExecutionState } from "./ApplicationExecutionState";
import { IActivatedEventArgs } from "./IActivatedEventArgs";
import { ICameraSettingsActivatedEventArgs } from "./ICameraSettingsActivatedEventArgs";
import { SplashScreen } from "./SplashScreen";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Activation.CameraSettingsActivatedEventArgs')
export class CameraSettingsActivatedEventArgs implements ICameraSettingsActivatedEventArgs, IActivatedEventArgs { 
    kind: ActivationKind = null;
    previousExecutionState: ApplicationExecutionState = null;
    splashScreen: SplashScreen = null;
    videoDeviceController: any = null;
    videoDeviceExtension: any = null;
}