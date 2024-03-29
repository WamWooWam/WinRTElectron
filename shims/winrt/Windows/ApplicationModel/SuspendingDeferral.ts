// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ISuspendingDeferral } from "./ISuspendingDeferral";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IpcHelper } from "../../IpcHelper";
import { SuspendingDeferralV1 } from "../Foundation/Interop/IpcConstants";

@GenerateShim('Windows.ApplicationModel.SuspendingDeferral')
export class SuspendingDeferral implements ISuspendingDeferral { 
    private __deferralId : string;
    constructor(deferralId: string) {
        this.__deferralId = deferralId;
    }

    complete(): void {
        IpcHelper.post(SuspendingDeferralV1, { deferralId: this.__deferralId, type: 'complete' })
    }
}
