// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { IActivatedEventArgs } from "./IActivatedEventArgs";
import { ILaunchActivatedEventArgs } from "./ILaunchActivatedEventArgs";
import { LockScreenCallUI } from "../Calls/LockScreenCallUI";

export interface ILockScreenCallActivatedEventArgs extends ILaunchActivatedEventArgs, IActivatedEventArgs {
    callUI: LockScreenCallUI;
}