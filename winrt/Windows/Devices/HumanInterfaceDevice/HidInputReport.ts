// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { HidBooleanControl } from "./HidBooleanControl";
import { HidBooleanControlDescription } from "./HidBooleanControlDescription";
import { HidNumericControl } from "./HidNumericControl";
import { HidNumericControlDescription } from "./HidNumericControlDescription";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IBuffer } from "../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Devices.HumanInterfaceDevice.HidInputReport')
export class HidInputReport { 
    activatedBooleanControls: IVectorView<HidBooleanControl> = null;
    data: IBuffer = null;
    id: number = null;
    transitionedBooleanControls: IVectorView<HidBooleanControl> = null;
    getBooleanControl(usagePage: number, usageId: number): HidBooleanControl {
        throw new Error('HidInputReport#getBooleanControl not implemented')
    }
    getBooleanControlByDescription(controlDescription: HidBooleanControlDescription): HidBooleanControl {
        throw new Error('HidInputReport#getBooleanControlByDescription not implemented')
    }
    getNumericControl(usagePage: number, usageId: number): HidNumericControl {
        throw new Error('HidInputReport#getNumericControl not implemented')
    }
    getNumericControlByDescription(controlDescription: HidNumericControlDescription): HidNumericControl {
        throw new Error('HidInputReport#getNumericControlByDescription not implemented')
    }
}