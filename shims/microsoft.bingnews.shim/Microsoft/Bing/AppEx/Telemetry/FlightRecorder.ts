// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

import { CEIPStatus } from "./CEIPStatus";
import { FlightRecorderSettings } from "./FlightRecorderSettings";
import { IAppServices } from "./IAppServices";
import { IFlightEvent } from "./IFlightEvent";
import { Impression } from "./Impression";
import { LogLevel } from "./LogLevel";
import { PaywallEventType } from "./PaywallEventType";
import { RuntimeEnvironment } from "./RuntimeEnvironment";
import { SearchMethod } from "./SearchMethod";
import { UserActionMethod } from "./UserActionMethod";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { uuidv4 } from "winrt/Windows/Foundation/Interop/Utils";

@GenerateShim('Microsoft.Bing.AppEx.Telemetry.FlightRecorder')
export class FlightRecorder implements IStringable { 
    static rootFrame: any = null;
    static readonly settings: FlightRecorderSettings = new FlightRecorderSettings();
    static readonly isRecording: boolean = null;
    static readonly deploymentId: string = null;
    static readonly deviceId: string = null;
    static sessionId: string = null;
    static tests: string[] = null;
    static ceip: CEIPStatus = null;
    static readonly isCEIP: boolean = null;
    static userID: string = null;
    static alternateUserID: string = null;
    static createStringGuid(): string {
        // throw new Error('FlightRecorder#createStringGuid not implemented')
        return uuidv4();
    }
    static initializeDisplay(width: number, height: number, scale: number = 1): void {
        console.warn('FlightRecorder#initializeDisplay2 not implemented')
    }
    static isEventLoggingEnabled(flightEventType: string, level: LogLevel): boolean {
        // throw new Error('FlightRecorder#isEventLoggingEnabled not implemented')
        return true;
    }
    static logAppAction(level: LogLevel, context: string, element: string, operation: string, k: number): void {
        console.warn('FlightRecorder#logAppAction not implemented')
    }
    static logAppActionWithAttributes(level: LogLevel, context: string, element: string, operation: string, k: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logAppActionWithAttributes not implemented')
    }
    static logAppActionWithJsonAttributes(level: LogLevel, context: string, element: string, operation: string, k: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logAppActionWithJsonAttributes not implemented')
    }
    static logCodeError(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string): void {
        console.warn('FlightRecorder#logCodeError not implemented')
    }
    static logCodeErrorWithAttributes(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logCodeErrorWithAttributes not implemented')
    }
    static logCodeErrorWithJsonAttributes(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logCodeErrorWithJsonAttributes not implemented')
    }
    static logContentError(level: LogLevel, uri: string, message: string, httpCode: number, exception: string, latency: number): void {
        console.warn('FlightRecorder#logContentError not implemented')
    }
    static logContentErrorWithAttributes(level: LogLevel, uri: string, message: string, httpCode: number, exception: string, latency: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logContentErrorWithAttributes not implemented')
    }
    static logContentErrorWithJsonAttributes(level: LogLevel, uri: string, message: string, httpCode: number, exception: string, latency: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logContentErrorWithJsonAttributes not implemented')
    }
    static logCrash(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string): void {
        console.warn('FlightRecorder#logCrash not implemented')
    }
    static logCrashWithAttributes(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logCrashWithAttributes not implemented')
    }
    static logCrashWithJsonAttributes(level: LogLevel, runtime: RuntimeEnvironment, message: string, stackTrace: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logCrashWithJsonAttributes not implemented')
    }
    static logCustom(level: LogLevel, eventType: string, jsonText: string, jsonAttributes: string = ""): void {
        console.warn('FlightRecorder#logCustom2 not implemented')
    }
    static logCustomWithAttributes(level: LogLevel, eventType: string, jsonText: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logCustomWithAttributes not implemented')
    }
    static logDisplayChange1(level: LogLevel, width: number, height: number): void {
        console.warn('FlightRecorder#logDisplayChange1 not implemented')
    }
    static logDisplayChange2(level: LogLevel, width: number, height: number, scale: number): void {
        console.warn('FlightRecorder#logDisplayChange2 not implemented')
    }
    static logDisplayChangeWithAttributes(level: LogLevel, width: number, height: number, scale: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logDisplayChangeWithAttributes not implemented')
    }
    static logDisplayChangeWithJsonAttributes(level: LogLevel, width: number, height: number, scale: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logDisplayChangeWithJsonAttributes not implemented')
    }
    static logEvent(flightEvent: IFlightEvent): void {
        console.warn('FlightRecorder#logEvent not implemented')
    }
    static logEventWithAttributes(flightEvent: IFlightEvent, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logEventWithAttributes not implemented')
    }
    static logEventWithJsonAttributes(flightEvent: IFlightEvent, jsonAttributes: string): void {
        console.warn('FlightRecorder#logEventWithJsonAttributes not implemented')
    }
    static logException(level: LogLevel, runtime: RuntimeEnvironment, isCrash: boolean, e: number): void {
        console.warn('FlightRecorder#logException not implemented')
    }
    static logExceptionWithAttributes(level: LogLevel, runtime: RuntimeEnvironment, isCrash: boolean, e: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logExceptionWithAttributes not implemented')
    }
    static logExceptionWithJsonAttributes(level: LogLevel, runtime: RuntimeEnvironment, isCrash: boolean, e: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logExceptionWithJsonAttributes not implemented')
    }
    static logImpressionExit(level: LogLevel): void {
        console.warn('FlightRecorder#logImpressionExit not implemented')
    }
    static logImpressionExitWithAttributes(level: LogLevel, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logImpressionExitWithAttributes not implemented')
    }
    static logImpressionExitWithJsonAttributes(level: LogLevel, jsonAttributes: string): void {
        console.warn('FlightRecorder#logImpressionExitWithJsonAttributes not implemented')
    }
    static logImpressionResume(level: LogLevel, resumedImpression: Impression): void {
        console.warn('FlightRecorder#logImpressionResume not implemented')
    }
    static logImpressionResumeWithAttributes(level: LogLevel, resumedImpression: Impression, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logImpressionResumeWithAttributes not implemented')
    }
    static logImpressionResumeWithJsonAttributes(level: LogLevel, resumedImpression: Impression, jsonAttributes: string): void {
        console.warn('FlightRecorder#logImpressionResumeWithJsonAttributes not implemented')
    }
    static logImpressionStart(level: LogLevel, context: string, impressionType: string, navMethod: string, partnerCode: string): Impression {
        // throw new Error('FlightRecorder#logImpressionStart not implemented')
        return new Impression(context);
    }
    static logImpressionStartWithAttributes(level: LogLevel, context: string, impressionType: string, navMethod: string, partnerCode: string, attributes: IMap<string, string>): Impression {
        // throw new Error('FlightRecorder#logImpressionStartWithAttributes not implemented')
        return new Impression(context);
    }
    static logImpressionStartWithJsonAttributes(level: LogLevel, context: string, impressionType: string, navMethod: string, partnerCode: string, jsonAttributes: string): Impression {
        // throw new Error('FlightRecorder#logImpressionStartWithJsonAttributes not implemented')
        return new Impression(context);
    }
    static logPaywall1(level: LogLevel, paywallEventType: PaywallEventType, partner: string): void {
        console.warn('FlightRecorder#logPaywall1 not implemented')
    }
    static logPaywall2(level: LogLevel, paywallEventType: PaywallEventType, partner: string, article: string): void {
        console.warn('FlightRecorder#logPaywall2 not implemented')
    }
    static logPerf(level: LogLevel, markerText: string, name: string, perfContext: string, duration: number): void {
        console.warn('FlightRecorder#logPerf not implemented')
    }
    static logPerfWithAttributes(level: LogLevel, markerText: string, name: string, perfContext: string, duration: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logPerfWithAttributes not implemented')
    }
    static logPerfWithJsonAttributes(level: LogLevel, markerText: string, name: string, perfContext: string, duration: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logPerfWithJsonAttributes not implemented')
    }
    static logPreferencesAsDictionary(level: LogLevel, preferences: IMap<string, string>): void {
        console.warn('FlightRecorder#logPreferencesAsDictionary not implemented')
    }
    static logPreferencesAsDictionaryWithAttributes(level: LogLevel, preferences: IMap<string, string>, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logPreferencesAsDictionaryWithAttributes not implemented')
    }
    static logPreferencesAsJson(level: LogLevel, jsonPreferences: string): void {
        console.warn('FlightRecorder#logPreferencesAsJson not implemented')
    }
    static logPreferencesAsJsonWithAttributes(level: LogLevel, jsonPreferences: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logPreferencesAsJsonWithAttributes not implemented')
    }
    static logPreload(settings: FlightRecorderSettings): void {
        console.warn('FlightRecorder#logPreload not implemented')
    }
    static logSearch1(level: LogLevel, context: string, query: string): void {
        console.warn('FlightRecorder#logSearch1 not implemented')
    }
    static logSearch2(level: LogLevel, query: string, index: string, method: SearchMethod, inResults: boolean, resultCount: number, isExplicit: boolean, isCOMSCORE: boolean, autoRefresh: boolean, categoryCode: string, details: string): void {
        console.warn('FlightRecorder#logSearch2 not implemented')
    }
    static logSearchWithAttributes(level: LogLevel, query: string, index: string, method: SearchMethod, inResults: boolean, resultCount: number, isExplicit: boolean, isCOMSCORE: boolean, autoRefresh: boolean, categoryCode: string, details: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSearchWithAttributes not implemented')
    }
    static logSearchWithJsonAttributes(level: LogLevel, query: string, index: string, method: SearchMethod, inResults: boolean, resultCount: number, isExplicit: boolean, isCOMSCORE: boolean, autoRefresh: boolean, categoryCode: string, details: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSearchWithJsonAttributes not implemented')
    }
    static logSessionExit(level: LogLevel, reason: string): void {
        console.warn('FlightRecorder#logSessionExit not implemented')
    }
    static logSessionExitWithAttributes(level: LogLevel, reason: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionExitWithAttributes not implemented')
    }
    static logSessionExitWithJsonAttributes(level: LogLevel, reason: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionExitWithJsonAttributes not implemented')
    }
    static logSessionOpenFile(level: LogLevel, args: string, path: string): void {
        console.warn('FlightRecorder#logSessionOpenFile not implemented')
    }
    static logSessionOpenFileWithAttributes(level: LogLevel, args: string, path: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionOpenFileWithAttributes not implemented')
    }
    static logSessionOpenFileWithJsonAttributes(level: LogLevel, args: string, path: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionOpenFileWithJsonAttributes not implemented')
    }
    static logSessionOpenUri(level: LogLevel, args: string, uri: string): void {
        console.warn('FlightRecorder#logSessionOpenUri not implemented')
    }
    static logSessionOpenUriWithAttributes(level: LogLevel, args: string, uri: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionOpenUriWithAttributes not implemented')
    }
    static logSessionOpenUriWithJsonAttributes(level: LogLevel, args: string, uri: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionOpenUriWithJsonAttributes not implemented')
    }
    static logSessionResume(level: LogLevel): void {
        console.warn('FlightRecorder#logSessionResume not implemented')
    }
    static logSessionResumeWithAttributes(level: LogLevel, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionResumeWithAttributes not implemented')
    }
    static logSessionResumeWithJsonAttributes(level: LogLevel, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionResumeWithJsonAttributes not implemented')
    }
    static logSessionSearch(level: LogLevel, args: string, searchQuery: string): void {
        console.warn('FlightRecorder#logSessionSearch not implemented')
    }
    static logSessionSearchWithAttributes(level: LogLevel, args: string, searchQuery: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionSearchWithAttributes not implemented')
    }
    static logSessionSearchWithJsonAttributes(level: LogLevel, args: string, searchQuery: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionSearchWithJsonAttributes not implemented')
    }
    static logSessionShare(level: LogLevel, args: string, uri: string): void {
        console.warn('FlightRecorder#logSessionShare not implemented')
    }
    static logSessionShareWithAttributes(level: LogLevel, args: string, uri: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionShareWithAttributes not implemented')
    }
    static logSessionShareWithJsonAttributes(level: LogLevel, args: string, uri: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionShareWithJsonAttributes not implemented')
    }
    static logSessionStart(level: LogLevel, args: string): void {
        console.warn('FlightRecorder#logSessionStart not implemented')
    }
    static logSessionStartWithAttributes(level: LogLevel, args: string, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionStartWithAttributes not implemented')
    }
    static logSessionStartWithJsonAttributes(level: LogLevel, args: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionStartWithJsonAttributes not implemented')
    }
    static logSessionSuspend(level: LogLevel): void {
        console.warn('FlightRecorder#logSessionSuspend not implemented')
    }
    static logSessionSuspendWithAttributes(level: LogLevel, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSessionSuspendWithAttributes not implemented')
    }
    static logSessionSuspendWithJsonAttributes(level: LogLevel, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSessionSuspendWithJsonAttributes not implemented')
    }
    static logSysInfoAsDictionary(level: LogLevel, name: string, properties: IMap<string, string>): void {
        console.warn('FlightRecorder#logSysInfoAsDictionary not implemented')
    }
    static logSysInfoAsDictionaryWithAttributes(level: LogLevel, name: string, properties: IMap<string, string>, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logSysInfoAsDictionaryWithAttributes not implemented')
    }
    static logSysInfoAsJson(level: LogLevel, name: string, jsonProperties: string): void {
        console.warn('FlightRecorder#logSysInfoAsJson not implemented')
    }
    static logSysInfoAsJsonWithAttributes(level: LogLevel, name: string, jsonProperties: string, jsonAttributes: string): void {
        console.warn('FlightRecorder#logSysInfoAsJsonWithAttributes not implemented')
    }
    static logUserAction(level: LogLevel, context: string, element: string, operation: string, method: UserActionMethod, k: number): void {
        console.warn('FlightRecorder#logUserAction not implemented')
    }
    static logUserActionWithAttributes(level: LogLevel, context: string, element: string, operation: string, method: UserActionMethod, k: number, attributes: IMap<string, string>): void {
        console.warn('FlightRecorder#logUserActionWithAttributes not implemented')
    }
    static logUserActionWithJsonAttributes(level: LogLevel, context: string, element: string, operation: string, method: UserActionMethod, k: number, jsonAttributes: string): void {
        console.warn('FlightRecorder#logUserActionWithJsonAttributes not implemented')
    }
    static setImpressionNavMethod(method: string): void {
        console.warn('FlightRecorder#setImpressionNavMethod not implemented')
    }
    static setImpressionNavMethodWithoutOverride(method: string): void {
        console.warn('FlightRecorder#setImpressionNavMethodWithoutOverride not implemented')
    }
    static start1(settings: FlightRecorderSettings, sourceProcess: string, appServices: IAppServices): void {
        console.warn('FlightRecorder#start1 not implemented')
    }
    static start2(appServices: IAppServices): void {
        console.warn('FlightRecorder#start2 not implemented')
    }
    static start3(sourceProcess: string, appServices: IAppServices): void {
        console.warn('FlightRecorder#start3 not implemented')
    }
    static stop(): void {
        console.warn('FlightRecorder#stop not implemented')
    }
    static testStart(): void {
        console.warn('FlightRecorder#testStart not implemented')
    }
    static testStop(): void {
        console.warn('FlightRecorder#testStop not implemented')
    }
    static uploadNow(wait: boolean = false): void {
        console.warn('FlightRecorder#uploadNow2 not implemented')
    }
    toString(): string {
        throw new Error('FlightRecorder#toString not implemented')
    }
}