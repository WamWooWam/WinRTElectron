// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IObject } from "./IObject";
import { ResourceState } from "./ResourceState";
import { ResourceType } from "./ResourceType";

export interface IAccountResource extends IObject {
    readonly hasEverSynchronized: boolean;
    isEnabled: boolean;
    readonly isInitialSyncFinished: boolean;
    isSyncNeeded: boolean;
    readonly isSynchronizing: boolean;
    readonly lastPushResult: number;
    readonly lastSyncResult: number;
    readonly lastSyncTime: Date;
    readonly resourceState: ResourceState;
    readonly resourceType: ResourceType;
}