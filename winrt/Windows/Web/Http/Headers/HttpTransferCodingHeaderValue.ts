// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "../../../Foundation/Collections/IVector`1";
import { IStringable } from "../../../Foundation/IStringable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { HttpNameValueHeaderValue } from "./HttpNameValueHeaderValue";

@GenerateShim('Windows.Web.Http.Headers.HttpTransferCodingHeaderValue')
export class HttpTransferCodingHeaderValue implements IStringable { 
    parameters: IVector<HttpNameValueHeaderValue> = null;
    value: string = null;
    constructor(input: string) {
        console.warn('HttpTransferCodingHeaderValue.ctor not implemented')
    }
    toString(): string {
        throw new Error('HttpTransferCodingHeaderValue#toString not implemented')
    }
    static parse(input: string): HttpTransferCodingHeaderValue {
        throw new Error('HttpTransferCodingHeaderValue#parse not implemented')
    }
    static tryParse(input: string): { succeeded: boolean, transferCodingHeaderValue: HttpTransferCodingHeaderValue } {
        throw new Error('HttpTransferCodingHeaderValue#tryParse not implemented')
    }
}