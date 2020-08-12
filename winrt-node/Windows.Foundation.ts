import { URL } from "url"
import * as _ from "lodash"
import * as path from 'path'

export class IAsyncOperation<T> extends Promise<T> {
    done(t: any, c: any) {
        this.then(t, c);
    }

    static wrap<T>(p: Promise<T>): IAsyncOperation<T> {
        return new IAsyncOperation<T>((res, rej) => p.then(res, rej));
    }

    asPromise(): Promise<T> {
        return <Promise<T>>this;
    }
}

export class IAsyncAction extends Promise<void> {
    done(t: any, c: any) {
        this.then(t).catch(c);
    }

    static asOperation(p: Promise<void>): IAsyncAction {
        return new IAsyncAction((res, rej) => p.then(res, rej));
    }

    asPromise(): Promise<void> {
        return <Promise<void>>this;
    }
}

export class Uri {
    private _url: URL;
    private _rawUri: string;

    constructor(url: string, baseUrl?: string) {
        this._url = new URL(url, baseUrl);
        this._rawUri = url;
    }

    get absoluteCanonicalUri(): string { return this._url.toString(); }
    get absoluteUri(): string { return this._url.toString(); }
    get displayIri(): string { return decodeURI(this._url.toString()); }
    get displayUri(): string { return decodeURI(this._url.toString()); }
    get domain(): string { return this._url.hostname; }
    get extension(): string { return path.extname(this._url.pathname); }
    get fragment(): string { return this._url.hash; }
    get host(): string { return this._url.host; }
    get password(): string { return this._url.password; }
    get path(): string { return this._url.pathname; }
    get port(): string { return this._url.port; }
    get query(): string { return this._url.search; }
    get rawUri(): string { return this._rawUri; }
    get schemeName(): string { return this._url.protocol; }
    get suspicious(): boolean { return false; }
    get userName(): string { return this._url.username; }

    toString(): string {
        return this._url.toString();
    }
}

export class IsFakeWWA {
    // this class exists only under the fake WWAHost this shim creates
    // and as such can be used by custom apps to ensure the current environment
}

export function Enumerable(value: boolean = true) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}


export interface Rect {
    height: number,
    width: number,
    x: number,
    y: number
}

export class EventTarget {
    targetElement: Element;

    constructor() {
        if (self["document"] != undefined) {
            this.targetElement = document.createElement("div");
        }
    }

    addEventListener(event: any, handler: any) {
        console.warn("::addEventListener " + event)
        this.targetElement?.addEventListener(event, handler);
    }

    removeEventListener(event: any, handler: any) {
        console.warn("::removeEventListener " + event)
        this.targetElement?.removeEventListener(event, handler);
    }

    dispatchEvent(event: Event) {
        this.targetElement?.dispatchEvent(event);
    }
}

export class Shim {
    static callerName() {
        try {
            throw new Error();
        } catch (e) {
            try {
                return e.stack.split('at ')[3].split(' ')[0];
            } catch (e) {
                return '';
            }
        }
    }

    static shimmedFunction(...args) {
        console.warn("shim: " + Shim.callerName(), args);
    }

    static shimmedAsyncFunction<T>(...args): IAsyncOperation<T> {
        var callerName = Shim.callerName();
        return new IAsyncOperation<T>((resolve, reject) => {
            console.warn("async shim: " + callerName, args);
            resolve();
        });
    }

    static failShimmedAsyncFunction<T>(...args): IAsyncOperation<T> {
        var callerName = Shim.callerName();
        return new IAsyncOperation<T>((resolve, reject) => {
            console.warn("async shim: " + callerName, args);
            reject();
        });
    }
}

export namespace Collections {
    export class Vector<T> implements IVector<T>, IVectorView<T> {
        private _array: T[];

        constructor(array: T[]) {
            this._array = array;
            this.size = array.length;
        }

        public size: number;

        append(t: T) {
            this._array.push(t);
        }

        clear() {
            this._array = [];
        }

        count() {
            return this._array.length;
        }

        getAt(i: number) {
            return this._array[i];
        }

        getMany(i: number, t: T[]) {
            let j = i + t.length;
            for (; i < j; i++)
                t[j - i] = this._array[i];

            return i - j;
        }

        insertAt(i: number, t: T) {
            this._array = [...this._array.slice(0, i), t, ...this._array.slice(i)];
        }

        indexOf(t: T) {
            for (let i = 0; i < this._array.length; i++) {
                const el = this._array[i];
                if (el === t) {
                    return { returnValue: true, index: i };
                }
            }

            return { returnValue: false, index: -1 };
        }

        removeAt(i: number) {
            this._array = this._array.splice(i, 1);
        }

        removeAtEnd() {
            this._array.pop();
        }

        replaceAll(t: T[]) {
            this._array = t;
        }

        setAt(i: number, t: T) {
            this._array[i] = t;
        }

        getArray() {
            return this._array;
        }

        forEach(func: (item: T) => void) {
            for (let i = 0; i < this._array.length; i++) {
                const element = this._array[i];
                func(element);
            }
        }

        some(func: (item: T) => boolean) {
            for (let i = 0; i < this._array.length; i++) {
                const element = this._array[i];
                if (func(element)) return true;
            }

            return false;
        }

        first() : IIterator<T> {
            throw new Error("should never be called");
        }
    }

    export enum CollectionChange {
        reset,
        itemInserted,
        itemRemoved,
        itemChanged,
    }
    export interface IIterable<T> {
        first(): IIterator<T>;
    }
    export interface IIterator<T> {
        current: T;
        hasCurrent: Boolean;
        moveNext(): Boolean;
        getMany(items: T[]): number;
    }
    export interface IKeyValuePair<K, V> {
        key: K;
        value: V;
    }
    export interface IMap<K, V> extends IIterable<IKeyValuePair<K, V>> {
        size: number;
        lookup(key: K): V;
        hasKey(key: K): Boolean;
        getView(): K[];
        insert(key: K, value: V): Boolean;
        clear(): void;
    }
    export interface IMapChangedEventArgs<K> {
        collectionChange: CollectionChange;
        key: K;
    }
    export interface IMapView<K, V> extends IIterable<IKeyValuePair<K, V>> {
        size: number;
        lookup(key: K): V;
        hasKey(key: K): Boolean;
        split(): { first: K[], second: K[] };
    }
    export interface IObservableMap<K, V> extends IMap<K, V>, IIterable<IKeyValuePair<K, V>> {
    }
    export interface IObservableVector<T> extends IVector<T>, IIterable<T> {
    }
    export interface IPropertySet extends IObservableMap<string, any>, IMap<string, any>, IIterable<IKeyValuePair<string, any>> {
    }
    export interface IVector<T> extends IIterable<T> {
        size: number;
        getAt(index: number): T;
        // getView(): T[];
        indexOf(value: T): { returnValue: Boolean, index: number };
        setAt(index: number, value: T): void;
        insertAt(index: number, value: T): void;
        removeAt(index: number): void;
        append(value: T): void;
        removeAtEnd(): void;
        clear(): void;
        getMany(startIndex: number, items: T[]): number;
        replaceAll(items: T[]): void;
    }
    export interface IVectorChangedEventArgs {
        collectionChange: CollectionChange;
        index: number;
    }
    export interface IVectorView<T> extends IIterable<T> {
        size: number;
        getAt(index: number): T;
        indexOf(value: T): { returnValue: Boolean, index: number };
        getMany(startIndex: number, items: T[]): number;
    }
    export type MapChangedEventHandler<K, V> = (event: IMapChangedEventArgs<K>) => void;
    export class PropertySet implements IPropertySet, IObservableMap<string, any>, IMap<string, any>, IIterable<IKeyValuePair<string, any>> {
        size: number;

        lookup(key: string): any {
            throw new Error('shimmed function PropertySet.lookup');
        }

        hasKey(key: string): Boolean {
            throw new Error('shimmed function PropertySet.hasKey');
        }

        getView(): string[] {
            throw new Error('shimmed function PropertySet.getView');
        }

        insert(key: string, value: any): Boolean {
            throw new Error('shimmed function PropertySet.insert');
        }

        clear(): void {
            console.warn('shimmed function PropertySet.clear');
        }

        first(): IIterator<IKeyValuePair<string, any>> {
            throw new Error('shimmed function PropertySet.first');
        }

        addEventListener(name: string, handler: Function) {
            console.warn(`PropertySet::addEventListener: ${name}`);
            switch (name) {
                case "mapchanged": // MapChangedEventHandler<string,any>
                    break;
            }

        }
    }
    export class StringMap implements IMap<string, string>, IIterable<IKeyValuePair<string, string>>, IObservableMap<string, string> {
        size: number;

        lookup(key: string): string {
            throw new Error('shimmed function StringMap.lookup');
        }

        hasKey(key: string): Boolean {
            throw new Error('shimmed function StringMap.hasKey');
        }

        getView(): string[] {
            throw new Error('shimmed function StringMap.getView');
        }

        insert(key: string, value: string): Boolean {
            throw new Error('shimmed function StringMap.insert');
        }

        clear(): void {
            console.warn('shimmed function StringMap.clear');
        }

        first(): IIterator<IKeyValuePair<string, string>> {
            throw new Error('shimmed function StringMap.first');
        }

        addEventListener(name: string, handler: Function) {
            console.warn(`StringMap::addEventListener: ${name}`);
            switch (name) {
                case "mapchanged": // MapChangedEventHandler<string,string>
                    break;
            }

        }
    }
    export class ValueSet implements IPropertySet, IObservableMap<string, any>, IMap<string, any>, IIterable<IKeyValuePair<string, any>> {
        size: number;

        lookup(key: string): any {
            throw new Error('shimmed function ValueSet.lookup');
        }

        hasKey(key: string): Boolean {
            throw new Error('shimmed function ValueSet.hasKey');
        }

        getView(): string[] {
            throw new Error('shimmed function ValueSet.getView');
        }

        insert(key: string, value: any): Boolean {
            throw new Error('shimmed function ValueSet.insert');
        }

        clear(): void {
            console.warn('shimmed function ValueSet.clear');
        }

        first(): IIterator<IKeyValuePair<string, any>> {
            throw new Error('shimmed function ValueSet.first');
        }

        addEventListener(name: string, handler: Function) {
            console.warn(`ValueSet::addEventListener: ${name}`);
            switch (name) {
                case "mapchanged": // MapChangedEventHandler<string,any>
                    break;
            }

        }
    }
    export type VectorChangedEventHandler<T> = (event: IVectorChangedEventArgs) => void;
}