// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ActivationKind } from "./ActivationKind";
import { ApplicationExecutionState } from "./ApplicationExecutionState";
import { SplashScreen } from "./SplashScreen";

export interface IActivatedEventArgs {
    kind: ActivationKind;
    previousExecutionState: ApplicationExecutionState;
    splashScreen: SplashScreen;
}
