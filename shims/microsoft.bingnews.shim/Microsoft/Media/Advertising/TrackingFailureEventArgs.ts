// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.TrackingFailureEventArgs')
export class TrackingFailureEventArgs implements IStringable { 
    readonly error: number = null;
    readonly url: string = null;
    constructor(url: string, error: number) {
        console.warn('TrackingFailureEventArgs.ctor not implemented')
    }
    toString(): string {
        throw new Error('TrackingFailureEventArgs#toString not implemented')
    }
}
