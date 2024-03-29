// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:37 2021
// </auto-generated>
// --------------------------------------------------

import { IAccountCalendarResource } from "./IAccountCalendarResource";
import { IAccountResource } from "./IAccountResource";
import { IObject } from "./IObject";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { ObjectChangedHandler } from "./ObjectChangedHandler";
import { ResourceState } from "./ResourceState";
import { ResourceType } from "./ResourceType";
import { SignatureType } from "./SignatureType";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Platform.AccountCalendarResource')
export class AccountCalendarResource implements IAccountResource, IObject, IAccountCalendarResource { 
    readonly canDelete: boolean = null;
    readonly canEdit: boolean = null;
    readonly isObjectValid: boolean = null;
    readonly objectId: string = null;
    readonly objectType: string = null;
    isSyncNeeded: boolean = null;
    isEnabled: boolean = null;
    readonly hasEverSynchronized: boolean = null;
    readonly isInitialSyncFinished: boolean = null;
    readonly isSynchronizing: boolean = null;
    readonly lastPushResult: number = null;
    readonly lastSyncResult: number = null;
    readonly lastSyncTime: Date = null;
    readonly resourceState: ResourceState = null;
    readonly resourceType: ResourceType = null;
    signatureType: SignatureType = null;
    commit(): void {
        console.warn('AccountCalendarResource#commit not implemented')
    }
    deleteObject(): void {
        console.warn('AccountCalendarResource#deleteObject not implemented')
    }
    getKeepAlive(): ITransientObjectHolder {
        throw new Error('AccountCalendarResource#getKeepAlive not implemented')
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
