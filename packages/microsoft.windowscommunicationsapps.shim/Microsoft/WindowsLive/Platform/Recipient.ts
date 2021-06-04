// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IDisposable } from "./IDisposable";
import { IPerson } from "./IPerson";
import { IRecipient } from "./IRecipient";
import { IRelevanceEntity } from "./IRelevanceEntity";
import { RecipientChangeHandler } from "./RecipientChangeHandler";
import { RelevanceEntityType } from "./RelevanceEntityType";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Platform.Recipient')
export class Recipient implements IRecipient, IDisposable, IRelevanceEntity { 
    readonly relevanceEntityId: string = null;
    readonly relevanceEntityType: RelevanceEntityType = null;
    readonly calculatedUIName: string = null;
    readonly emailAddress: string = null;
    readonly fastName: string = null;
    readonly objectType: string = null;
    readonly person: IPerson = null;
    dispose(): void {
        console.warn('Recipient#dispose not implemented')
    }

    private __changed: Set<RecipientChangeHandler> = new Set();
    @Enumerable(true)
    set onchanged(handler: RecipientChangeHandler) {
        this.__changed.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'changed':
                this.__changed.delete(handler);
                break;
        }
    }
}