// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Media.PlayReadyClient 255.255.255.255 at Wed Mar 31 18:10:04 2021
// </auto-generated>
// --------------------------------------------------

import { PlayReadySoapMessage } from "./PlayReadySoapMessage";
import { HResult } from "winrt/Windows/Foundation/HResult";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { Uri } from "winrt/Windows/Foundation/Uri";
import { IMediaProtectionServiceRequest } from "winrt/Windows/Media/Protection/IMediaProtectionServiceRequest";

export interface IPlayReadyServiceRequest extends IMediaProtectionServiceRequest {
    challengeCustomData: string;
    responseCustomData: string;
    uri: Uri;
    beginServiceRequest(): IAsyncAction;
    nextServiceRequest(): IPlayReadyServiceRequest;
    generateManualEnablingChallenge(): PlayReadySoapMessage;
    processManualEnablingResponse(responseBytes: number[]): number;
}