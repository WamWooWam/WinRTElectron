// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Limits.MusicLimitsManager')
export class MusicLimitsManager { 
    static freeIndividualTrackAllowance: number = null;
    static isFreeTrialCompleted: boolean = null;
    static isMonthlyFreeLimitExceeded: boolean = null;
    static monthlyFreeMinutesAllowance: number = null;
    static nextMonthlyFreeLimitResetDate: string = null;
    static totalUnauthenticatedTrackAllowance: number = null;
    static totalUnauthenticatedTracksUsed: number = null;
    static getLimitsAsync(): IAsyncOperation<string> {
        throw new Error('MusicLimitsManager#getLimitsAsync not implemented')
    }

    private static __freeTrialCompleted: Set<EventHandler<number>> = new Set();
    @Enumerable(true)
    static set onfreetrialcompleted(handler: EventHandler<number>) {
        MusicLimitsManager.__freeTrialCompleted.add(handler);
    }

    private static __freeTrialStarted: Set<EventHandler<number>> = new Set();
    @Enumerable(true)
    static set onfreetrialstarted(handler: EventHandler<number>) {
        MusicLimitsManager.__freeTrialStarted.add(handler);
    }

    private static __monthlyFreeLimitExceeded: Set<EventHandler<number>> = new Set();
    @Enumerable(true)
    static set onmonthlyfreelimitexceeded(handler: EventHandler<number>) {
        MusicLimitsManager.__monthlyFreeLimitExceeded.add(handler);
    }

    private static __monthlyFreeLimitReset: Set<EventHandler<number>> = new Set();
    @Enumerable(true)
    static set onmonthlyfreelimitreset(handler: EventHandler<number>) {
        MusicLimitsManager.__monthlyFreeLimitReset.add(handler);
    }

    private static __trackFreeLimitExceeded: Set<EventHandler<string>> = new Set();
    @Enumerable(true)
    static set ontrackfreelimitexceeded(handler: EventHandler<string>) {
        MusicLimitsManager.__trackFreeLimitExceeded.add(handler);
    }

    private static __trackFreeLimitsReset: Set<EventHandler<number>> = new Set();
    @Enumerable(true)
    static set ontrackfreelimitsreset(handler: EventHandler<number>) {
        MusicLimitsManager.__trackFreeLimitsReset.add(handler);
    }

    static addEventListener(name: string, handler: any) {
        switch (name) {
            case 'freetrialcompleted':
                MusicLimitsManager.__freeTrialCompleted.add(handler);
                break;
            case 'freetrialstarted':
                MusicLimitsManager.__freeTrialStarted.add(handler);
                break;
            case 'monthlyfreelimitexceeded':
                MusicLimitsManager.__monthlyFreeLimitExceeded.add(handler);
                break;
            case 'monthlyfreelimitreset':
                MusicLimitsManager.__monthlyFreeLimitReset.add(handler);
                break;
            case 'trackfreelimitexceeded':
                MusicLimitsManager.__trackFreeLimitExceeded.add(handler);
                break;
            case 'trackfreelimitsreset':
                MusicLimitsManager.__trackFreeLimitsReset.add(handler);
                break;
        }
    }

    static removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'freetrialcompleted':
                MusicLimitsManager.__freeTrialCompleted.delete(handler);
                break;
            case 'freetrialstarted':
                MusicLimitsManager.__freeTrialStarted.delete(handler);
                break;
            case 'monthlyfreelimitexceeded':
                MusicLimitsManager.__monthlyFreeLimitExceeded.delete(handler);
                break;
            case 'monthlyfreelimitreset':
                MusicLimitsManager.__monthlyFreeLimitReset.delete(handler);
                break;
            case 'trackfreelimitexceeded':
                MusicLimitsManager.__trackFreeLimitExceeded.delete(handler);
                break;
            case 'trackfreelimitsreset':
                MusicLimitsManager.__trackFreeLimitsReset.delete(handler);
                break;
        }
    }
}