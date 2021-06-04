// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { ObjectChangedHandler } from "./ObjectChangedHandler";

export interface IObject {
    readonly canDelete: boolean;
    readonly canEdit: boolean;
    readonly isObjectValid: boolean;
    readonly objectId: string;
    readonly objectType: string;
    commit(): void;
    deleteObject(): void;
    getKeepAlive(): ITransientObjectHolder;
    onchanged: ObjectChangedHandler;
    ondeleted: ObjectChangedHandler;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}