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

@GenerateShim('Windows.Web.Http.Headers.HttpContentDispositionHeaderValue')
export class HttpContentDispositionHeaderValue implements IStringable { 
    size: number | null = null;
    name: string = null;
    fileNameStar: string = null;
    fileName: string = null;
    dispositionType: string = null;
    parameters: IVector<HttpNameValueHeaderValue> = null;
    constructor(dispositionType: string) {
        console.warn('HttpContentDispositionHeaderValue.ctor not implemented')
    }
    toString(): string {
        throw new Error('HttpContentDispositionHeaderValue#toString not implemented')
    }
    static parse(input: string): HttpContentDispositionHeaderValue {
        throw new Error('HttpContentDispositionHeaderValue#parse not implemented')
    }
    static tryParse(input: string): { succeeded: boolean, contentDispositionHeaderValue: HttpContentDispositionHeaderValue } {
        throw new Error('HttpContentDispositionHeaderValue#tryParse not implemented')
    }
}
