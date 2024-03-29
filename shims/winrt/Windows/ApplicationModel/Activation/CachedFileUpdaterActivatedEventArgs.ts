// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ActivationKind } from "./ActivationKind";
import { ApplicationExecutionState } from "./ApplicationExecutionState";
import { IActivatedEventArgs } from "./IActivatedEventArgs";
import { ICachedFileUpdaterActivatedEventArgs } from "./ICachedFileUpdaterActivatedEventArgs";
import { SplashScreen } from "./SplashScreen";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { CachedFileUpdaterUI } from "../../Storage/Provider/CachedFileUpdaterUI";

@GenerateShim('Windows.ApplicationModel.Activation.CachedFileUpdaterActivatedEventArgs')
export class CachedFileUpdaterActivatedEventArgs implements ICachedFileUpdaterActivatedEventArgs, IActivatedEventArgs { 
    cachedFileUpdaterUI: CachedFileUpdaterUI = null;
    kind: ActivationKind = null;
    previousExecutionState: ApplicationExecutionState = null;
    splashScreen: SplashScreen = null;
}
