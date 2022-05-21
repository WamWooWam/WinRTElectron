
import { IMap } from "../Collections/IMap`2"
import { IMapView } from "../Collections/IMapView`2"
import { IIterator } from "../Collections/IIterator`1"
import { IKeyValuePair } from "../Collections/IKeyValuePair`2"
import { IObservableMap } from "../Collections/IObservableMap`2";
import { MapChangedEventHandler } from "../Collections/MapChangedEventHandler`2";
import { Enumerable } from "./Enumerable";

export class ObservableDictionary<K, V> implements IMap<K, V>, IMapView<K, V>, IObservableMap<K,V> {
    _container: Map<K, V>;
    constructor(entries?: readonly (readonly [K, V])[] | null) {
        this._container = new Map(entries);
        return new Proxy(this, new ObservableDictionaryProxy());
    }

    [Symbol.iterator]() {
        return this._container[Symbol.iterator]();
    }

    get size(): number {
        return this._container.size;
    }
    lookup(key: K): V {
        let retVal = this._container.get(key);
        return retVal;
    }
    hasKey(key: K): boolean {
        return this._container.has(key);
    }
    getView(): IMapView<K, V> {
        return this;
    }
    insert(key: K, value: V): boolean {
        if (!this.hasKey(key)) {
            this._container.set(key, value);
            return true;
        }
        return false;
    }
    remove(key: K): void {
        this._container.delete(key);
    }
    clear(): void {
        this._container.clear();
    }
    first(): IIterator<IKeyValuePair<K, V>> {
        return { hasCurrent: false, current: null, moveNext: function () { return false }, getMany: function () { return null; } }
    }
    split(): { first: IMapView<K, V>; second: IMapView<K, V> } {
        return { first: null, second: null };
    }
    toString() {
        return JSON.stringify(this._container);
    }
    
    __mapChanged: Set<MapChangedEventHandler<K, V>> = new Set();
    @Enumerable(true)
    set onmapchanged(handler: MapChangedEventHandler<K, V>) {
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

export class ObservableDictionaryProxy<K, V> implements ProxyHandler<ObservableDictionary<K, V>> {
    get(target: ObservableDictionary<K, V>, p: PropertyKey, receiver: any): any {
        if (p in target || target instanceof Symbol || p.toString().startsWith("__")) {
            return target[p];
        }

        console.warn(`ObservableDictionary<K,V> getting ${String(p)}`);
        return target.lookup(<K><unknown>p.valueOf());
    }

    set(target: ObservableDictionary<K, V>, p: PropertyKey, value: any, receiver: any): boolean {
        if (p in target || target instanceof Symbol || p.toString().startsWith("__")) {
            target[p] = value;
            return true;
        }

        console.warn(`ObservableDictionary<K,V> getting ${String(p)}`);
        target.insert(<K><unknown>p.valueOf(), value);

        return true;
    }

    ownKeys(target: ObservableDictionary<K, V>) {
        return [...target._container.keys()].map(s => String(s));
    }
}