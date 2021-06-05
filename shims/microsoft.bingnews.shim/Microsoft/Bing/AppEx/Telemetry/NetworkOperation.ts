// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

type JsonItem = any
import { NetworkWebResponseStatus } from "./NetworkWebResponseStatus";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Bing.AppEx.Telemetry.NetworkOperation')
export class NetworkOperation implements IStringable { 
    time: Date = null;
    contentSource: string = null;
    contentId: string = null;
    webUri: string = null;
    webLatency: number = null;
    webStatus: NetworkWebResponseStatus = null;
    webHttpStatus: string = null;
    webHttpStatusCode: number = null;
    webContentSize: number = null;
    webContentType: string = null;
    webIsCached: boolean = null;
    webHeaders: string[] = null;
    dnsLatency: number = null;
    dnsHost: string = null;
    dnsAddress: string = null;
    dnsError: string = null;
    // constructor();
    // constructor(json: JsonItem);
    constructor(...args) { }
    toJson(): JsonItem {
        throw new Error('NetworkOperation#toJson not implemented')
    }
    toString(): string {
        throw new Error('NetworkOperation#toString not implemented')
    }
}
