// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

import { LogLevel } from "./LogLevel";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Bing.AppEx.Telemetry.FlightRecorderSettings')
export class FlightRecorderSettings implements IStringable { 
    static readonly atfVersion: number = null;
    publisher: string = null;
    publisherGroup: string = null;
    appName: string = null;
    appVersion: string = null;
    appRelease: string = null;
    collectorUri: string = null;
    folderPath: string = null;
    isEnabled: boolean = null;
    minLogLevel: LogLevel = null;
    uploadInterval: number = null;
    uploadTimeout: number = null;
    uploadNowWaitInterval: number = null;
    maxUploadAttempts: number = null;
    compress: boolean = null;
    maxQueuedEvents: number = null;
    maxBatchedEvents: number = null;
    uploadOnSuspend: boolean = null;
    uploadOnExit: boolean = null;
    debugTrace: boolean = null;
    diagnosticHeaders: boolean = null;
    static parse(jsonText: string): FlightRecorderSettings {
        throw new Error('FlightRecorderSettings#parse not implemented')
    }
    toString(): string {
        throw new Error('FlightRecorderSettings#toString not implemented')
    }
}