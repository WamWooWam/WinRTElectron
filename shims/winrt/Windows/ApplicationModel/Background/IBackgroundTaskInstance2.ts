// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { BackgroundTaskThrottleCounter } from "./BackgroundTaskThrottleCounter";
import { IBackgroundTaskInstance } from "./IBackgroundTaskInstance";

export interface IBackgroundTaskInstance2 extends IBackgroundTaskInstance {
    getThrottleCount(counter: BackgroundTaskThrottleCounter): number;
}