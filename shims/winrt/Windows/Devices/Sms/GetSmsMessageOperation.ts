// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { ISmsMessage } from "./ISmsMessage";
import { AsyncOperationCompletedHandler } from "../../Foundation/AsyncOperationCompletedHandler`1";
import { AsyncStatus } from "../../Foundation/AsyncStatus";
import { HResult } from "../../Foundation/HResult";
import { IAsyncInfo } from "../../Foundation/IAsyncInfo";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.Sms.GetSmsMessageOperation')
export class GetSmsMessageOperation implements IAsyncOperation<ISmsMessage> { 
    completed: AsyncOperationCompletedHandler<ISmsMessage> = null;
    errorCode: number = null;
    id: number = null;
    status: AsyncStatus = null;
    getResults(): ISmsMessage {
        throw new Error('GetSmsMessageOperation#getResults not implemented')
    }
    cancel(): void {
        console.warn('GetSmsMessageOperation#cancel not implemented')
    }
    close(): void {
        console.warn('GetSmsMessageOperation#close not implemented')
    }
}
