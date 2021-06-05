// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { ComputePrefetchEndStateFunc } from "./ComputePrefetchEndStateFunc";
import { PrefetchItem } from "./PrefetchItem";
import { PrefetchItemStatusEventArgs } from "./PrefetchItemStatusEventArgs";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncAction } from "winrt/Windows/Foundation/Interop/AsyncAction";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.DataServices.PrefetchManager')
export class PrefetchManager implements IStringable { 
    static readonly isPrefetchEnabled: boolean = null;
    static readonly isPrefetchCloudEnabled: boolean = null;
    static readonly isPrefetchUserEnabled: boolean = null;
    static cancelAll(): void {
        console.warn('PrefetchManager#cancelAll not implemented')
    }
    static clearPrefetchManagersForUnitTest(): void {
        console.warn('PrefetchManager#clearPrefetchManagersForUnitTest not implemented')
    }
    static getPrefetchManager(groupId: string): PrefetchManager {
        throw new Error('PrefetchManager#getPrefetchManager not implemented')
    }
    cancel(): void {
        console.warn('PrefetchManager#cancel not implemented')
    }
    initializeForUnitTest(prefetchItemCompleteHandler: EventHandler<PrefetchItemStatusEventArgs>): IAsyncAction {
        return AsyncAction.from(async () => console.warn('PrefetchManager#initializeForUnitTest not implemented'));
    }
    initialize(clientComputePrefetchEndState: ComputePrefetchEndStateFunc): IAsyncAction {
        return AsyncAction.from(async () => console.warn('PrefetchManager#initialize not implemented'));
    }
    onNetworkStatusChanged(sender: any): void {
        console.warn('PrefetchManager#onNetworkStatusChanged not implemented')
    }
    onPrefetchItemComplete(sender: any, args: PrefetchItemStatusEventArgs): void {
        console.warn('PrefetchManager#onPrefetchItemComplete not implemented')
    }
    prefetchItemsForJSUnitTests(itemsFromJS: PrefetchItem[]): number {
        throw new Error('PrefetchManager#prefetchItemsForJSUnitTests not implemented')
    }
    prefetchItems(items: IVector<PrefetchItem>): number {
        throw new Error('PrefetchManager#prefetchItems not implemented')
    }
    registerToSendUIEvents(): void {
        console.warn('PrefetchManager#registerToSendUIEvents not implemented')
    }
    toString(): string {
        throw new Error('PrefetchManager#toString not implemented')
    }
}
