// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { UsbBulkOutEndpointDescriptor } from "./UsbBulkOutEndpointDescriptor";
import { UsbWriteOptions } from "./UsbWriteOptions";
import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IOutputStream } from "../../Storage/Streams/IOutputStream";

@GenerateShim('Windows.Devices.Usb.UsbBulkOutPipe')
export class UsbBulkOutPipe { 
    writeOptions: UsbWriteOptions = null;
    endpointDescriptor: UsbBulkOutEndpointDescriptor = null;
    outputStream: IOutputStream = null;
    clearStallAsync(): IAsyncAction {
        throw new Error('UsbBulkOutPipe#clearStallAsync not implemented')
    }
}
