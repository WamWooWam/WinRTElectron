// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { ISuspendingEventArgs } from "../../ApplicationModel/ISuspendingEventArgs";
import { SuspendingOperation } from "../../ApplicationModel/SuspendingOperation";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.UI.WebUI.SuspendingEventArgs')
export class SuspendingEventArgs implements ISuspendingEventArgs { 
    suspendingOperation: SuspendingOperation = null;
}
