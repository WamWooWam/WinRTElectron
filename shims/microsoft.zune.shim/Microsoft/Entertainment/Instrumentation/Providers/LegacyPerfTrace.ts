// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { ILegacyPerfTrace } from "./ILegacyPerfTrace";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Instrumentation.Providers.LegacyPerfTrace')
export class LegacyPerfTrace implements ILegacyPerfTrace { 
    isLegacyPerfTraceClientEventEnabled: boolean = null;
    isLegacyPerfTraceCollectionEventEnabled: boolean = null;
    isLegacyPerfTraceDBMutexEventEnabled: boolean = null;
    isLegacyPerfTraceDownloadEventEnabled: boolean = null;
    isLegacyPerfTraceDriverEventEnabled: boolean = null;
    isLegacyPerfTraceGenericEventEnabled: boolean = null;
    isLegacyPerfTraceHttpEventEnabled: boolean = null;
    isLegacyPerfTraceLaunchEventEnabled: boolean = null;
    isLegacyPerfTraceQRSEventEnabled: boolean = null;
    isLegacyPerfTraceQuickMixEventEnabled: boolean = null;
    isLegacyPerfTraceSyncEventEnabled: boolean = null;
    isLegacyPerfTraceWMPPlaybackEventEnabled: boolean = null;
    traceLegacyPerfTraceHttpEvent(httpEvent: number, url: string): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceHttpEvent not implemented')
    }
    traceLegacyPerfTraceClientEvent(reporterTag: number, actionType: number, reason: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceClientEvent not implemented')
    }
    traceLegacyPerfTraceWMPPlaybackEvent(type: number, fileName: string, graphType: number, lastHR: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceWMPPlaybackEvent not implemented')
    }
    traceLegacyPerfTraceDBMutexEvent(dbmutexEvent: number, threadId: number, time: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceDBMutexEvent not implemented')
    }
    traceLegacyPerfTraceLaunchEvent(launchEvent: number, launchEventData: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceLaunchEvent not implemented')
    }
    traceLegacyPerfTraceSyncEvent(syncEvent: number, syncEventData: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceSyncEvent not implemented')
    }
    traceLegacyPerfTraceQRSEvent(qrsevent: number, qrseventData: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceQRSEvent not implemented')
    }
    traceLegacyPerfTraceGenericEvent(reporterTag: number, type: number, action: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceGenericEvent not implemented')
    }
    traceLegacyPerfTraceDriverEvent(driverEvent: number, driverEventData: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceDriverEvent not implemented')
    }
    traceLegacyPerfTraceCollectionEvent(collectionEvent: number, detail: string): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceCollectionEvent not implemented')
    }
    traceLegacyPerfTraceQuickMixEvent(quickMixEvent: number, quickMixEventData: number): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceQuickMixEvent not implemented')
    }
    traceLegacyPerfTraceDownloadEvent(downloadEvent: number, id: string): void {
        console.warn('LegacyPerfTrace#traceLegacyPerfTraceDownloadEvent not implemented')
    }
}
