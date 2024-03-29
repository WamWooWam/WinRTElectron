// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { IPrefetchProvider } from "../../../Platform/DataServices/IPrefetchProvider";
import { PrefetchItemStatusEventArgs } from "../../../Platform/DataServices/PrefetchItemStatusEventArgs";
import { PrefetchQueryServiceOptions } from "../../../Platform/DataServices/PrefetchQueryServiceOptions";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.NewsCluster.EntityClusterImageProvider')
export class EntityClusterImageProvider implements IPrefetchProvider, IStringable { 
    prefetchItem(id: string, options: PrefetchQueryServiceOptions): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('EntityClusterImageProvider#prefetchItem not implemented') });
    }
    isPrefetchItemValid(itemValidityDataList: IVector<string>): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => { throw new Error('EntityClusterImageProvider#isPrefetchItemValid not implemented') });
    }
    toString(): string {
        throw new Error('EntityClusterImageProvider#toString not implemented')
    }

    private __prefetchItemComplete: Set<EventHandler<PrefetchItemStatusEventArgs>> = new Set();
    @Enumerable(true)
    set onprefetchitemcomplete(handler: EventHandler<PrefetchItemStatusEventArgs>) {
        this.__prefetchItemComplete.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'prefetchitemcomplete':
                this.__prefetchItemComplete.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'prefetchitemcomplete':
                this.__prefetchItemComplete.delete(handler);
                break;
        }
    }
}
