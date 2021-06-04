// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncActionWithProgress } from "../../Foundation/IAsyncActionWithProgress`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TranscodeFailureReason } from "./TranscodeFailureReason";

@GenerateShim('Windows.Media.Transcoding.PrepareTranscodeResult')
export class PrepareTranscodeResult { 
    canTranscode: boolean = null;
    failureReason: TranscodeFailureReason = null;
    transcodeAsync(): IAsyncActionWithProgress<number> {
        throw new Error('PrepareTranscodeResult#transcodeAsync not implemented')
    }
}