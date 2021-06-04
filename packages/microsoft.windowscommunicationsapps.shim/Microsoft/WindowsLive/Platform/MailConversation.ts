// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { ICollection } from "./ICollection";
import { IMailConversation } from "./IMailConversation";
import { IObject } from "./IObject";
import { IRecipient } from "./IRecipient";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { MailMessageImportance } from "./MailMessageImportance";
import { MailMessageLastVerb } from "./MailMessageLastVerb";
import { ObjectChangedHandler } from "./ObjectChangedHandler";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Platform.MailConversation')
export class MailConversation implements IMailConversation, IObject { 
    readonly flagged: boolean = null;
    readonly fromRecipient: IRecipient = null;
    readonly hasCalendarInvite: boolean = null;
    readonly hasCalendarRequest: boolean = null;
    readonly hasDraft: boolean = null;
    readonly hasOnlyDraftOrSent: boolean = null;
    readonly hasOrdinaryAttachments: boolean = null;
    readonly importance: MailMessageImportance = null;
    readonly instanceNumber: number = null;
    readonly irmHasTemplate: boolean = null;
    readonly lastVerb: MailMessageLastVerb = null;
    readonly latestReceivedTime: Date | null = null;
    readonly read: boolean = null;
    readonly subject: string = null;
    readonly toRecipients: IVector<IRecipient> = null;
    readonly totalCount: number = null;
    readonly canDelete: boolean = null;
    readonly canEdit: boolean = null;
    readonly isObjectValid: boolean = null;
    readonly objectId: string = null;
    readonly objectType: string = null;
    getChildMessages(): ICollection {
        throw new Error('MailConversation#getChildMessages not implemented')
    }
    commit(): void {
        console.warn('MailConversation#commit not implemented')
    }
    deleteObject(): void {
        console.warn('MailConversation#deleteObject not implemented')
    }
    getKeepAlive(): ITransientObjectHolder {
        throw new Error('MailConversation#getKeepAlive not implemented')
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