// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { IBackgroundTrigger } from "./IBackgroundTrigger";
import { LocationTriggerType } from "./LocationTriggerType";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Background.LocationTrigger')
export class LocationTrigger implements IBackgroundTrigger { 
    triggerType: LocationTriggerType = null;
    constructor(triggerType: LocationTriggerType) {
        console.warn('LocationTrigger.ctor not implemented')
    }
}