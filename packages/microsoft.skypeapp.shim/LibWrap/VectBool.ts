// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('LibWrap.VectBool')
export class VectBool implements IClosable { 
    getCount(): number {
        throw new Error('VectBool#getCount not implemented')
    }
    append(val: boolean): number {
        throw new Error('VectBool#append not implemented')
    }
    get(index: number): boolean {
        throw new Error('VectBool#get not implemented')
    }
    close(): void {
        console.warn('VectBool#close not implemented')
    }
}