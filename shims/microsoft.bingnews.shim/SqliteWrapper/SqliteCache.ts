// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:12 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { AsyncAction } from "winrt/Windows/Foundation/Interop/AsyncAction";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('SqliteWrapper.SqliteCache')
export class SqliteCache { 
    static initializeAsync(): IAsyncAction {
        return AsyncAction.from(async () => console.warn('SqliteCache#initializeAsync not implemented'));
    }
}
