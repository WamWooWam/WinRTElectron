// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IPlayReadyHandler } from "./IPlayReadyHandler";
import { IAsyncActionWithProgress } from "winrt/Windows/Foundation/IAsyncActionWithProgress`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Util.PlayReadyHandler')
export class PlayReadyHandler implements IPlayReadyHandler { 
    // constructor(hstrTicket: string);
    // constructor(hstrTicket: string, hstrMeteringCertificate: string);
    // constructor(hstrTicket: string, hstrRight: string, fLogToDownloadHistory: boolean, guidOfferId: string, guidServiceMediaInstanceId: string);
    constructor(...args) { }
    beginServiceRequest(pRequest: any): IAsyncActionWithProgress<string> {
        throw new Error('PlayReadyHandler#beginServiceRequest not implemented')
    }
    static acquireRootLicense(hstrTicket: string): IAsyncActionWithProgress<string> {
        throw new Error('PlayReadyHandler#acquireRootLicense not implemented')
    }
    static reportMetering(hstrTicket: string, hstrMeteringCertificate: string): IAsyncActionWithProgress<string> {
        throw new Error('PlayReadyHandler#reportMetering not implemented')
    }
    static createForVideoServiceMediaId(serviceMediaId: string, isStreaming: boolean): PlayReadyHandler {
        throw new Error('PlayReadyHandler#createForVideoServiceMediaId not implemented')
    }
    static createForVideoLicensePolicyTicket(hstrSignedLicensePolicyTicket: string, isStreaming: boolean): PlayReadyHandler {
        throw new Error('PlayReadyHandler#createForVideoLicensePolicyTicket not implemented')
    }
}
