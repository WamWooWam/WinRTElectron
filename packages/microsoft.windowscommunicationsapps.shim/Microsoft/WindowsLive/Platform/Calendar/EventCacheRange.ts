// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { IEventCacheRange } from "./IEventCacheRange";
import { RangeState } from "./RangeState";
import { RangeType } from "./RangeType";
import { IDisposable } from "../IDisposable";
import { IObject } from "../IObject";
import { ITransientObjectHolder } from "../ITransientObjectHolder";
import { ObjectChangedHandler } from "../ObjectChangedHandler";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Platform.Calendar.EventCacheRange')
export class EventCacheRange implements IObject, IDisposable, IEventCacheRange { 
    readonly canDelete: boolean = null;
    readonly canEdit: boolean = null;
    readonly isObjectValid: boolean = null;
    readonly objectId: string = null;
    readonly objectType: string = null;
    readonly end: Date = null;
    readonly rangeState: RangeState = null;
    readonly rangeType: RangeType = null;
    readonly start: Date = null;
    commit(): void {
        console.warn('EventCacheRange#commit not implemented')
    }
    deleteObject(): void {
        console.warn('EventCacheRange#deleteObject not implemented')
    }
    getKeepAlive(): ITransientObjectHolder {
        throw new Error('EventCacheRange#getKeepAlive not implemented')
    }
    dispose(): void {
        console.warn('EventCacheRange#dispose not implemented')
    }

    private __changed: Set<ObjectChangedHandler> = new Set();
    @Enumerable(true)
    set onchanged(handler: ObjectChangedHandler) {
        this.__changed.add(handler);
    }

    private __deleted: Set<ObjectChangedHandler> = new Set();
    @Enumerable(true)
    set ondeleted(handler: ObjectChangedHandler) {
        this.__deleted.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.add(handler);
                break;
            case 'deleted':
                this.__deleted.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.delete(handler);
                break;
            case 'deleted':
                this.__deleted.delete(handler);
                break;
        }
    }
}