// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { IBackgroundTrigger } from "./IBackgroundTrigger";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Background.MaintenanceTrigger')
export class MaintenanceTrigger implements IBackgroundTrigger { 
    freshnessTime: number = null;
    oneShot: boolean = null;
    constructor(freshnessTime: number, oneShot: boolean) {
        console.warn('MaintenanceTrigger.ctor not implemented')
    }
}
