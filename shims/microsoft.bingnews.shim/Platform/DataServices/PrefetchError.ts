// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { PlatformExceptionCode } from "../PlatformExceptionCode";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { HttpStatusCode } from "winrt/Windows/Web/Http/HttpStatusCode";

@GenerateShim('Platform.DataServices.PrefetchError')
export class PrefetchError implements IStringable { 
    readonly uri: string = null;
    readonly isImage: boolean = null;
    readonly platformExceptionCode: PlatformExceptionCode = null;
    readonly httpStatusCode: HttpStatusCode = null;
    toString(): string {
        throw new Error('PrefetchError#toString not implemented')
    }
}
