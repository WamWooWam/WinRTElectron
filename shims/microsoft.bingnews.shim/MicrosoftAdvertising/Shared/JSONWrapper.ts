// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IJSONWrapper } from "./IJSONWrapper";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('MicrosoftAdvertising.Shared.JSONWrapper')
export class JSONWrapper implements IJSONWrapper, IStringable { 
    parse(jsonData: string): any {
        throw new Error('JSONWrapper#parse not implemented')
    }
    extractStringPropertyValue(jsonNode: any, keyName: string, isOptional: boolean): string {
        throw new Error('JSONWrapper#extractStringPropertyValue not implemented')
    }
    extractNumberPropertyValue(jsonNode: any, keyName: string, isOptional: boolean): number | null {
        throw new Error('JSONWrapper#extractNumberPropertyValue not implemented')
    }
    extractBooleanPropertyValue(jsonNode: any, keyName: string, isOptional: boolean): boolean {
        throw new Error('JSONWrapper#extractBooleanPropertyValue not implemented')
    }
    extractNamedJsonArray(jsonNode: any, keyName: string, isOptional: boolean): IVector<any> {
        throw new Error('JSONWrapper#extractNamedJsonArray not implemented')
    }
    extractNamedJsonObject(jsonNode: any, keyName: string, isOptional: boolean): any {
        throw new Error('JSONWrapper#extractNamedJsonObject not implemented')
    }
    extractNamedJsonAsString(jsonNode: any, keyName: string, isOptional: boolean): string {
        throw new Error('JSONWrapper#extractNamedJsonAsString not implemented')
    }
    buildJsonArrayAndStringify(objectName: string, values: IVector<IMap<string, string>>): string {
        throw new Error('JSONWrapper#buildJsonArrayAndStringify not implemented')
    }
    toString(): string {
        throw new Error('JSONWrapper#toString not implemented')
    }
}