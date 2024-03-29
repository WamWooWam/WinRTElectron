// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { CollectionChangedHandler } from "./CollectionChangedHandler";
import { IDisposable } from "./IDisposable";
import { IObject } from "./IObject";

export interface ICollection extends IDisposable {
    readonly count: number;
    readonly totalCount: number;
    item(index: number): IObject;
    fetchMoreItems(dwFetchSize: number): void;
    lock(): void;
    unlock(): void;
    oncollectionchanged: CollectionChangedHandler;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
