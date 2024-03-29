// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IMastAdapter } from "./IMastAdapter";
import { MAST } from "./MAST";
import { TriggerEventArgs } from "./TriggerEventArgs";
import { TriggerFailureEventArgs } from "./TriggerFailureEventArgs";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncAction } from "winrt/Windows/Foundation/Interop/AsyncAction";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";
import { IInputStream } from "winrt/Windows/Storage/Streams/IInputStream";

@GenerateShim('Microsoft.Media.Advertising.Mainsail')
export class Mainsail implements IStringable { 
    mastInterface: IMastAdapter = null;
    // constructor();
    // constructor(mastInterface: IMastAdapter);
    constructor(...args) { }
    addMastDoc1(mast: MAST): void {
        console.warn('Mainsail#addMastDoc1 not implemented')
    }
    addMastDoc2(mastStream: IInputStream): void {
        console.warn('Mainsail#addMastDoc2 not implemented')
    }
    clear(): void {
        console.warn('Mainsail#clear not implemented')
    }
    evaluateTriggers(): void {
        console.warn('Mainsail#evaluateTriggers not implemented')
    }
    loadSource(source: Uri): IAsyncAction {
        return AsyncAction.from(async () => console.warn('Mainsail#loadSource not implemented'));
    }
    toString(): string {
        throw new Error('Mainsail#toString not implemented')
    }

    private __activateTrigger: Set<EventHandler<TriggerEventArgs>> = new Set();
    @Enumerable(true)
    set onactivatetrigger(handler: EventHandler<TriggerEventArgs>) {
        this.__activateTrigger.add(handler);
    }

    private __deactivateTrigger: Set<EventHandler<TriggerEventArgs>> = new Set();
    @Enumerable(true)
    set ondeactivatetrigger(handler: EventHandler<TriggerEventArgs>) {
        this.__deactivateTrigger.add(handler);
    }

    private __triggerEvaluationFailed: Set<EventHandler<TriggerFailureEventArgs>> = new Set();
    @Enumerable(true)
    set ontriggerevaluationfailed(handler: EventHandler<TriggerFailureEventArgs>) {
        this.__triggerEvaluationFailed.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'activatetrigger':
                this.__activateTrigger.add(handler);
                break;
            case 'deactivatetrigger':
                this.__deactivateTrigger.add(handler);
                break;
            case 'triggerevaluationfailed':
                this.__triggerEvaluationFailed.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'activatetrigger':
                this.__activateTrigger.delete(handler);
                break;
            case 'deactivatetrigger':
                this.__deactivateTrigger.delete(handler);
                break;
            case 'triggerevaluationfailed':
                this.__triggerEvaluationFailed.delete(handler);
                break;
        }
    }
}
