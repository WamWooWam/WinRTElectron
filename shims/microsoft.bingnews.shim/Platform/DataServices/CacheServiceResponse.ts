// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.DataServices.CacheServiceResponse')
export class CacheServiceResponse implements IStringable { 
    readonly fileName: string = null;
    readonly expiryTime: Date = null;
    readonly data: string = null;
    readonly etag: string = null;
    toString(): string {
        throw new Error('CacheServiceResponse#toString not implemented')
    }
}
