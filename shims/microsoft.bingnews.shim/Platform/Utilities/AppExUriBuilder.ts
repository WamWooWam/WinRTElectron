// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { AppExUri } from "./AppExUri";
import { IIterable } from "winrt/Windows/Foundation/Collections/IIterable`1";
import { IKeyValuePair } from "winrt/Windows/Foundation/Collections/IKeyValuePair`2";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Platform.Utilities.AppExUriBuilder')
export class AppExUriBuilder implements IStringable { 
    controllerId: string = null;
    commandId: string = null;
    entityId: string = null;
    readonly queryParameters: IMap<string, any> = null;
    static toUriString(controllerId: string, commandId: string, entityId: string, queryParameters: IIterable<IKeyValuePair<string, any>>): string {
        throw new Error('AppExUriBuilder#toUriString not implemented')
    }
    toString(): string {
        throw new Error('AppExUriBuilder#toString not implemented')
    }
    toUri(): AppExUri {
        throw new Error('AppExUriBuilder#toUri not implemented')
    }
}
