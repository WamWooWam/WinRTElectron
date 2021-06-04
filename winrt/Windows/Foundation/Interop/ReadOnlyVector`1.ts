import { IVectorView } from "../Collections/IVectorView`1"
import { IIterator } from "../Collections/IIterator`1";

export class ReadOnlyVector<T> implements IVectorView<T> {
    protected _array: T[];

    constructor(array: T[] = null) {
        this._array = array ?? [];
        return new Proxy(this, new ReadOnlyVectorProxy())
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
    count() {
        return this._array.length;
    }

    getAt(i: number) {
        return this._array[i];
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

    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T) {
        return this._array.reduce(callbackfn);
    }

    first(): IIterator<T> {
        throw new Error("should never be called");
    }
}

export class ReadOnlyVectorProxy<T> implements ProxyHandler<ReadOnlyVector<T>> {
    get(target: ReadOnlyVector<T>, p: PropertyKey, receiver: any): any {
        let num = parseInt(String(p));
        if (!isNaN(num)) {
            return target.getAt(num);
        }

        return target[p];
    }
}