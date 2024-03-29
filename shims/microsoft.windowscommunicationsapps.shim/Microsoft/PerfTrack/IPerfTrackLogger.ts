// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:37 2021
// </auto-generated>
// --------------------------------------------------

import { PerfTrackTimePoint } from "./PerfTrackTimePoint";

export interface IPerfTrackLogger {
    readonly dataUploadEnabled: boolean;
    writeStartEvent(scenarioId: number, scenarioName: string, matchKey: string): void;
    writeStopEvent(scenarioId: number, scenarioName: string, matchKey: string): void;
    writeStopEventWithMetadata(scenarioId: number, scenarioName: string, matchKey: string, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void;
    writeTriggerEvent(scenarioId: number, scenarioName: string, duration: number): void;
    writeLaunchStopEvent(timePoint: PerfTrackTimePoint, activationKind: number): void;
    writeResumeStopEvent(timePoint: PerfTrackTimePoint): void;
    writeResizeStopEvent(timePoint: PerfTrackTimePoint, isMajorChange: boolean, isRotate: boolean, logicalWidth: number, logicalHeight: number): void;
    writeTriggerEventWithMetadata(scenarioId: number, scenarioName: string, duration: number, dword1: number, dword2: number, dword3: number, dword4: number, dword5: number, string1: string, string2: string): void;
    enableDataUpload(): void;
    disableDataUpload(): void;
}
