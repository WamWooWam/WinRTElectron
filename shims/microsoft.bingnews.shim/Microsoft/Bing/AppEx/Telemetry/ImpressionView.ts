// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

type JsonItem = any
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Bing.AppEx.Telemetry.ImpressionView')
export class ImpressionView implements IStringable { 
    time: Date = null;
    duration: number = null;
    isNew: boolean = null;
    // constructor();
    // constructor(json: JsonItem);
    constructor(...args) { }
    clone(): ImpressionView {
        throw new Error('ImpressionView#clone not implemented')
    }
    equals(obj: any): boolean {
        throw new Error('ImpressionView#equals not implemented')
    }
    getHashCode(): number {
        throw new Error('ImpressionView#getHashCode not implemented')
    }
    toJson(): JsonItem {
        throw new Error('ImpressionView#toJson not implemented')
    }
    toString(): string {
        throw new Error('ImpressionView#toString not implemented')
    }
}
