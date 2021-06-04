// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.PerfTrack 255.255.255.255 at Mon Mar 29 22:41:48 2021
// </auto-generated>
// --------------------------------------------------

import { IPerfTrackLogger } from "./IPerfTrackLogger";
import { PerfTrackTimePoint } from "./PerfTrackTimePoint";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.PerfTrack.PerfTrackLogger')
export class PerfTrackLogger implements IPerfTrackLogger { 
    dataUploadEnabled: boolean = null;
    static windowsDataUploadEnabled: boolean = null;
    constructor(dataUploadEnabled: boolean) {
        console.warn('PerfTrackLogger.ctor not implemented')
    }
    writeStartEvent(scenarioId: number, scenarioName: string, matchKey: string): void {
        console.warn('PerfTrackLogger#writeStartEvent not implemented')
    }
    writeStopEvent(scenarioId: number, scenarioName: string, matchKey: string): void {
        console.warn('PerfTrackLogger#writeStopEvent not implemented')
    }
    writeStopEventWithMetadata(scenarioId: number, scenarioName: string, matchKey: string, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void {
        console.warn('PerfTrackLogger#writeStopEventWithMetadata not implemented')
    }
    writeTriggerEvent(scenarioId: number, scenarioName: string, duration: number): void {
        console.warn('PerfTrackLogger#writeTriggerEvent not implemented')
    }
    writeLaunchStopEvent(timePoint: PerfTrackTimePoint, activationKind: number): void {
        console.warn('PerfTrackLogger#writeLaunchStopEvent not implemented')
    }
    writeResumeStopEvent(timePoint: PerfTrackTimePoint): void {
        console.warn('PerfTrackLogger#writeResumeStopEvent not implemented')
    }
    writeResizeStopEvent(timePoint: PerfTrackTimePoint, isMajorChange: boolean, isRotate: boolean, logicalWidth: number, logicalHeight: number): void {
        console.warn('PerfTrackLogger#writeResizeStopEvent not implemented')
    }
    writeTriggerEventWithMetadata(scenarioId: number, scenarioName: string, duration: number, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void {
        console.warn('PerfTrackLogger#writeTriggerEventWithMetadata not implemented')
    }
    enableDataUpload(): void {
        console.warn('PerfTrackLogger#enableDataUpload not implemented')
    }
    disableDataUpload(): void {
        console.warn('PerfTrackLogger#disableDataUpload not implemented')
    }
}