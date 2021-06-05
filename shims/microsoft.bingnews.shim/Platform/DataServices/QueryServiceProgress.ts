// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { QueryServiceStatusCode } from "./QueryServiceStatusCode";
import { ResponseData } from "../ResponseData";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.DataServices.QueryServiceProgress')
export class QueryServiceProgress implements IStringable { 
    message: string = null;
    statusCode: QueryServiceStatusCode = null;
    cachedResponse: ResponseData = null;
    toString(): string {
        throw new Error('QueryServiceProgress#toString not implemented')
    }
}
