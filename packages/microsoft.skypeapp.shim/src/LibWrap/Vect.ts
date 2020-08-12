import { Filename } from "./Filename";

class Vect<T> {
    private arr: T[];

    constructor(arr?: T[]) {
        this.arr = arr ?? [];
    }

    getCount() {
        return this.arr.length
    }

    append(val: T) {
        return this.arr.push(val);
    }

    get(index: number): T {
        return this.arr[index];
    }

    close() {

    }
}

export class VectBool extends Vect<boolean> {}
export class VectGIFilename extends Vect<Filename> {}
export class VectGIString extends Vect<string> {}
export class VectInt extends Vect<number> {}
export class VectUnsignedInt extends Vect<number> {}