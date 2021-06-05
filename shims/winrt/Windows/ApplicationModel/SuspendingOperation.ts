// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { ISuspendingOperation } from "./ISuspendingOperation";
import { SuspendingDeferral } from "./SuspendingDeferral";
import { DateTime } from "../Foundation/DateTime";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IpcHelper } from "../../IpcHelper";
import { SuspendingDeferralV1 } from "../Foundation/Interop/IpcConstants";
import { uuidv4 } from "../Foundation/Interop/Utils";

@GenerateShim('Windows.ApplicationModel.SuspendingOperation')
export class SuspendingOperation implements ISuspendingOperation { 
    deadline: Date = null;
    getDeferral(): SuspendingDeferral {
        let deferralId = uuidv4();
        let deferral = new SuspendingDeferral(deferralId);
        IpcHelper.post(SuspendingDeferralV1, { deferralId, type: 'captured' })
        return deferral;
    }
}
