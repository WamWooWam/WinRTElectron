// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { ActivationKind } from "../../ApplicationModel/Activation/ActivationKind";
import { ApplicationExecutionState } from "../../ApplicationModel/Activation/ApplicationExecutionState";
import { IActivatedEventArgs } from "../../ApplicationModel/Activation/IActivatedEventArgs";
import { IApplicationViewActivatedEventArgs } from "../../ApplicationModel/Activation/IApplicationViewActivatedEventArgs";
import { IProtocolActivatedEventArgs } from "../../ApplicationModel/Activation/IProtocolActivatedEventArgs";
import { SplashScreen } from "../../ApplicationModel/Activation/SplashScreen";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { ActivatedOperation } from "./ActivatedOperation";
import { IActivatedEventArgsDeferral } from "./IActivatedEventArgsDeferral";

@GenerateShim('Windows.UI.WebUI.WebUIProtocolActivatedEventArgs')
export class WebUIProtocolActivatedEventArgs implements IProtocolActivatedEventArgs, IActivatedEventArgs, IApplicationViewActivatedEventArgs, IActivatedEventArgsDeferral { 
    currentlyShownApplicationViewId: number = null;
    kind: ActivationKind = null;
    previousExecutionState: ApplicationExecutionState = null;
    splashScreen: SplashScreen = null;
    activatedOperation: ActivatedOperation = null;
    uri: Uri = null;
}