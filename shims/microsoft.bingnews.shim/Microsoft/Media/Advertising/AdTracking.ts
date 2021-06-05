// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { TrackingFailureEventArgs } from "./TrackingFailureEventArgs";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.Advertising.AdTracking')
export class AdTracking implements IStringable { 
    static readonly current: AdTracking = null;
    fireTracking(trackingUrl: string): void {
        console.warn('AdTracking#fireTracking not implemented')
    }
    fireTrackingUri(trackingUri: Uri): void {
        console.warn('AdTracking#fireTrackingUri not implemented')
    }
    toString(): string {
        throw new Error('AdTracking#toString not implemented')
    }

    private __trackingFailed: Set<EventHandler<TrackingFailureEventArgs>> = new Set();
    @Enumerable(true)
    set ontrackingfailed(handler: EventHandler<TrackingFailureEventArgs>) {
        this.__trackingFailed.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'trackingfailed':
                this.__trackingFailed.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'trackingfailed':
                this.__trackingFailed.delete(handler);
                break;
        }
    }
}
