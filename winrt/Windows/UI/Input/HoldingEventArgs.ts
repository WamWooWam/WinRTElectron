// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { PointerDeviceType } from "../../Devices/Input/PointerDeviceType";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Point } from "../../Foundation/Point";
import { HoldingState } from "./HoldingState";

@GenerateShim('Windows.UI.Input.HoldingEventArgs')
export class HoldingEventArgs { 
    holdingState: HoldingState = null;
    pointerDeviceType: PointerDeviceType = null;
    position: Point = null;
}