// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.Diagnostics.PlatformEventSourceAccessor')
export class PlatformEventSourceAccessor implements IStringable { 
    static profilerMarkStart(id: string): void {
        console.warn('PlatformEventSourceAccessor#profilerMarkStart not implemented')
    }
    static profilerMarkStop(id: string): void {
        console.warn('PlatformEventSourceAccessor#profilerMarkStop not implemented')
    }
    static startTraceSession(newFile: boolean): void {
        console.warn('PlatformEventSourceAccessor#startTraceSession not implemented')
    }
    static stopTraceSession(): void {
        console.warn('PlatformEventSourceAccessor#stopTraceSession not implemented')
    }
    processActivateStart(): void {
        console.warn('PlatformEventSourceAccessor#processActivateStart not implemented')
    }
    processActivateStop(): void {
        console.warn('PlatformEventSourceAccessor#processActivateStop not implemented')
    }
    processCheckpointStart(): void {
        console.warn('PlatformEventSourceAccessor#processCheckpointStart not implemented')
    }
    processCheckpointStop(): void {
        console.warn('PlatformEventSourceAccessor#processCheckpointStop not implemented')
    }
    processResumeStart(): void {
        console.warn('PlatformEventSourceAccessor#processResumeStart not implemented')
    }
    processResumeStop(): void {
        console.warn('PlatformEventSourceAccessor#processResumeStop not implemented')
    }
    processSuspendStart(): void {
        console.warn('PlatformEventSourceAccessor#processSuspendStart not implemented')
    }
    processSuspendStop(): void {
        console.warn('PlatformEventSourceAccessor#processSuspendStop not implemented')
    }
    traceCritical(message: string): void {
        console.warn('PlatformEventSourceAccessor#traceCritical not implemented')
    }
    traceError(message: string): void {
        console.warn('PlatformEventSourceAccessor#traceError not implemented')
    }
    traceInfo(message: string): void {
        console.warn('PlatformEventSourceAccessor#traceInfo not implemented')
    }
    traceVerbose(message: string): void {
        console.warn('PlatformEventSourceAccessor#traceVerbose not implemented')
    }
    traceWarning(message: string): void {
        console.warn('PlatformEventSourceAccessor#traceWarning not implemented')
    }
    toString(): string {
        throw new Error('PlatformEventSourceAccessor#toString not implemented')
    }
}
