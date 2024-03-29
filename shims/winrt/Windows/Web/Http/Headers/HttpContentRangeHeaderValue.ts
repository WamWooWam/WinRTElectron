// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "../../../Foundation/IStringable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Web.Http.Headers.HttpContentRangeHeaderValue')
export class HttpContentRangeHeaderValue implements IStringable { 
    unit: string = null;
    firstBytePosition: number | null = null;
    lastBytePosition: number | null = null;
    length: number | null = null;
    // constructor(length: number);
    // constructor(from: number, to: number);
    // constructor(from: number, to: number, length: number);
    constructor(...args) { }
    toString(): string {
        throw new Error('HttpContentRangeHeaderValue#toString not implemented')
    }
    static parse(input: string): HttpContentRangeHeaderValue {
        throw new Error('HttpContentRangeHeaderValue#parse not implemented')
    }
    static tryParse(input: string): { succeeded: boolean, contentRangeHeaderValue: HttpContentRangeHeaderValue } {
        throw new Error('HttpContentRangeHeaderValue#tryParse not implemented')
    }
}
