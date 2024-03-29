// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "./IIterable`1";
import { IIterator } from "./IIterator`1";
import { IKeyValuePair } from "./IKeyValuePair`2";
import { IMapView } from "./IMapView`2";
import { IMap } from "./IMap`2";
import { IObservableMap } from "./IObservableMap`2";
import { IPropertySet } from "./IPropertySet";
import { MapChangedEventHandler } from "./MapChangedEventHandler`2";
import { Enumerable } from "../Interop/Enumerable";
import { GenerateShim } from "../Interop/GenerateShim";
import { Dictionary } from "../Interop/Dictionary`2";
import { InvokeEvent } from "../Interop/InvokeEvent";

export class PropertySet extends Dictionary<string, any> implements IPropertySet, IObservableMap<string, any> {

    constructor(entries?: readonly (readonly [string, any])[] | null) {
        super(entries);
        this.__mapChanged = new Set();
    }

    [Symbol.iterator]() {
        return super[Symbol.iterator]();
    }

    get(key: string) {
        // not technically part of the projection but makes some stuff cleaner
        return super[key];
    }

    set(key: string, value: any) {
        return super[key] = value;
    }

    insert(key: string, value: any): boolean {
        var retVal = super.insert(key, value);
        InvokeEvent(this.__mapChanged, "mapchanged", null);
        return retVal;
    }

    remove(key: string): void {
        super.remove(key);
        InvokeEvent(this.__mapChanged, "mapchanged", null);
    }

    clear(): void {
        super.clear();
        InvokeEvent(this.__mapChanged, "mapchanged", null);
    }

    __mapChanged: Set<MapChangedEventHandler<string, any>>
    @Enumerable(true)
    set onmapchanged(handler: MapChangedEventHandler<string, any>) {
        this.__mapChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'mapchanged':
                this.__mapChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'mapchanged':
                this.__mapChanged.delete(handler);
                break;
        }
    }
}
