// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Vector } from "winrt/Windows/Foundation/Interop/Vector`1";

@GenerateShim('LibWrap.VectGIString')
export class VectGIString implements IClosable {  
    private vals: Vector<string>;

    constructor(vals?: IVector<string>) {
        this.vals = vals as Vector<string> ?? new Vector<string>();
    }

    getCount(): number {
        return this.vals.size;
    }
    append(val: string): string {
        this.vals.append(val);
        return val;
    }
    get(index: number): string {
        return this.vals.getAt(index);
    }
    close(): void {
        console.warn('VectGIString#close not implemented')
    }
}
