import { URL } from "url"
import * as _ from "lodash"

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

}

export class IsFakeWWA {
    // this class exists only under the fake WWAHost this shim creates
    // and as such can be used by custom apps to ensure the current environment
}

export namespace Collections {
    export class Vector<T> {
        private _array: T[];

        constructor(array: T[]) {
            this._array = array;
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

        getMany(i: number, t: T[]) {
            let j = i + t.length;
            for (; i < j; i++)
                t[j - i] = this._array[i];
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

            return { returnValue: false };
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
    }
}

export function Enumerable(value: boolean) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        descriptor.enumerable = value;
    };
}

export class ShimProxyHandler<T extends Object> implements ProxyHandler<T> {
    get(target: T, key: any) {
        let f = target[key];

        if (key != "constructor")
            (f === undefined ? console.error : console.info)("shim: " + target.constructor?.name + "." + key);

        return f;
    }
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
        if (self["document"] != undefined)
            this.targetElement = document.createElement("div");
    }

    addEventListener(event: any, handler: any) {
        this.targetElement?.addEventListener(event, handler);
    }

    removeEventListener(event: any, handler: any) {
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