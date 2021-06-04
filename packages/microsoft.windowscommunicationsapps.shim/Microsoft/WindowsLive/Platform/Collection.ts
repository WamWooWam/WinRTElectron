import { CollectionChangedHandler } from "./CollectionChangedHandler";
import { CollectionNotificationHandler } from "./CollectionNotificationHandler";
import { ICollection } from "./ICollection";
import { IDisposable } from "./IDisposable";
import { INotificationCollection } from "./INotificationCollection";
import { IObject } from "./IObject";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

// i now realise why this exists! it's for the ability to fetch more items
@GenerateShim('Microsoft.WindowsLive.Platform.Collection')
export class Collection implements ICollection, IDisposable, INotificationCollection {
    private _items: IObject[];

    public constructor(items?: IObject[]) {
        this._items = items ?? [];
    }

    @Enumerable(true)
    get count(): number {
        return this._items.length;
    }

    @Enumerable(true)
    get totalCount(): number {
        return this._items.length;
    }

    item(index: number): IObject {
        return this._items[index]
    }

    // internal helper methods 
    _add(obj: IObject) {
        this._items.push(obj);
    }

    fetchMoreItems(dwFetchSize: number): void {
        console.warn('Collection#fetchMoreItems not implemented')
    }
    lock(): void {
        console.warn('Collection#lock not implemented')
    }
    unlock(): void {
        console.warn('Collection#unlock not implemented')
    }
    dispose(): void {
        console.warn('Collection#dispose not implemented')
    }
    dispatchEvents(): void {
        console.warn('Collection#dispatchEvents not implemented')
    }
    cancelSynchronousDispatch(): void {
        console.warn('Collection#cancelSynchronousDispatch not implemented')
    }

    private __collectionChanged: Set<CollectionChangedHandler> = new Set();
    @Enumerable(true)
    set oncollectionchanged(handler: CollectionChangedHandler) {
        this.__collectionChanged.add(handler);
    }

    private __notificationReceived: Set<CollectionNotificationHandler> = new Set();
    @Enumerable(true)
    set onnotificationreceived(handler: CollectionNotificationHandler) {
        this.__notificationReceived.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'collectionchanged':
                this.__collectionChanged.add(handler);
                break;
            case 'notificationreceived':
                this.__notificationReceived.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'collectionchanged':
                this.__collectionChanged.delete(handler);
                break;
            case 'notificationreceived':
                this.__notificationReceived.delete(handler);
                break;
        }
    }
}
