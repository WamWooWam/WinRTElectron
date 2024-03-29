// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:00 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../../Foundation/Collections/IIterable`1";
import { IIterator } from "../../../Foundation/Collections/IIterator`1";
import { IKeyValuePair } from "../../../Foundation/Collections/IKeyValuePair`2";
import { IMapView } from "../../../Foundation/Collections/IMapView`2";
import { IMap } from "../../../Foundation/Collections/IMap`2";
import { IObservableMap } from "../../../Foundation/Collections/IObservableMap`2";
import { MapChangedEventHandler } from "../../../Foundation/Collections/MapChangedEventHandler`2";
import { Enumerable } from "../../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Resources.Core.ResourceQualifierObservableMap')
export class ResourceQualifierObservableMap implements IObservableMap<string, string>, IMap<string, string>, IIterable<IKeyValuePair<string, string>> { 
    [Symbol.iterator]() {
        return null;
    }

    size: number = null;
    lookup(key: string): string {
        throw new Error('ResourceQualifierObservableMap#lookup not implemented')
    }
    hasKey(key: string): boolean {
        throw new Error('ResourceQualifierObservableMap#hasKey not implemented')
    }
    getView(): IMapView<string, string> {
        throw new Error('ResourceQualifierObservableMap#getView not implemented')
    }
    insert(key: string, value: string): boolean {
        throw new Error('ResourceQualifierObservableMap#insert not implemented')
    }
    remove(key: string): void {
        console.warn('ResourceQualifierObservableMap#remove not implemented')
    }
    clear(): void {
        console.warn('ResourceQualifierObservableMap#clear not implemented')
    }
    first(): IIterator<IKeyValuePair<string, string>> {
        throw new Error('ResourceQualifierObservableMap#first not implemented')
    }

    __mapChanged: Set<MapChangedEventHandler<string, string>> = new Set();
    @Enumerable(true)
    set onmapchanged(handler: MapChangedEventHandler<string, string>) {
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
