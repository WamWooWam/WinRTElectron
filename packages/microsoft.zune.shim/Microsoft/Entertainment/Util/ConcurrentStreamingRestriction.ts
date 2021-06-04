// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { EStreamingActionType } from "./EStreamingActionType";
import { IConcurrentStreamingRestriction } from "./IConcurrentStreamingRestriction";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "winrt/Windows/Foundation/TypedEventHandler`2";

@GenerateShim('Microsoft.Entertainment.Util.ConcurrentStreamingRestriction')
export class ConcurrentStreamingRestriction implements IConcurrentStreamingRestriction { 
    initializeAsync(leaseUrl: string, guidServiceMediaId: string, guidLicenseKeyId: string, guidProductId: string): IAsyncAction {
        throw new Error('ConcurrentStreamingRestriction#initializeAsync not implemented')
    }
    reportStreamingAction(type: EStreamingActionType): void {
        console.warn('ConcurrentStreamingRestriction#reportStreamingAction not implemented')
    }

    private __blockStreaming: Set<TypedEventHandler<IConcurrentStreamingRestriction, number>> = new Set();
    @Enumerable(true)
    set onblockstreaming(handler: TypedEventHandler<IConcurrentStreamingRestriction, number>) {
        this.__blockStreaming.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'blockstreaming':
                this.__blockStreaming.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'blockstreaming':
                this.__blockStreaming.delete(handler);
                break;
        }
    }
}