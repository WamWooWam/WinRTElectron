
import { IVector } from "../Collections/IVector`1"
import { IVectorView } from "../Collections/IVectorView`1"
import { IIterator } from "../Collections/IIterator`1";
import { IObservableVector } from "../Collections/IObservableVector`1";
import { VectorChangedEventHandler } from "../Collections/VectorChangedEventHandler`1";
import { Enumerable } from "./Enumerable";

// we have to provide basically a whole ass JS array as well as IVector functionality :)
export class Vector<T> implements IObservableVector<T>, IVector<T>, IVectorView<T> {
    private _array: T[];

    constructor(array: T[] = null) {
        this._array = array ?? [];
        return new Proxy(this, new VectorProxy());
    }

    public get size() {
        return this._array.length;
    };

    public get length() {
        return this._array.length;
    };

    [Symbol.iterator](): Iterator<T> {
        return this._array[Symbol.iterator]();
    }

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

    getView(): IVectorView<T> {
        return this;
    }

    // getMany(i: number) {
    //     let j = i + t.length;
    //     for (; i < j; i++)
    //         t[j - i] = this._array[i];

    //     return i - j;
    // }

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

    // so IE seems to provide these functions on winrt IVectors, which
    // return native javascript arrays
    slice(start?: number, end?: number) {
        return this._array.slice(start, end)
    }

    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T) {
        return this._array.reduce(callbackfn);
    }

    first(): IIterator<T> {
        throw new Error("should never be called");
    }

    #vectorChanged: Set<VectorChangedEventHandler<T>>
    @Enumerable(true)
    set onvectorchanged(handler: VectorChangedEventHandler<T>) {
        this.#vectorChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'mapchanged':
                this.#vectorChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'mapchanged':
                this.#vectorChanged.delete(handler);
                break;
        }
    }
}
export class VectorProxy<T> implements ProxyHandler<Vector<T>> {
    get(target: Vector<T>, p: PropertyKey, receiver: any): any {
        let num = parseInt(String(p));
        if (!isNaN(num)) {
            return target.getAt(num);
        }

        return target[p];
    }

    set(target: Vector<T>, p: PropertyKey, value: any, receiver: any): boolean {
        let num = parseInt(String(p));
        if (!isNaN(num)) {
            target.setAt(num, <T><unknown>value);
        }

        return target[p] = value;
    }
}