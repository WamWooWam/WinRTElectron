// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { UsbInterruptInPipe } from "./UsbInterruptInPipe";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TimeSpan } from "../../Foundation/TimeSpan";

@GenerateShim('Windows.Devices.Usb.UsbInterruptInEndpointDescriptor')
export class UsbInterruptInEndpointDescriptor { 
    endpointNumber: number = null;
    interval: number = null;
    maxPacketSize: number = null;
    pipe: UsbInterruptInPipe = null;
}
