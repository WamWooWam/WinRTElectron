// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FlexibleOffset')
export class FlexibleOffset implements IStringable { 
    isAbsolute: boolean = null;
    relativeOffset: number = null;
    absoluteOffset: number = null;
    static fromPercent(relativeOffset: number): FlexibleOffset {
        throw new Error('FlexibleOffset#fromPercent not implemented')
    }
    static fromTimeSpan(absoluteOffset: number): FlexibleOffset {
        throw new Error('FlexibleOffset#fromTimeSpan not implemented')
    }
    static parse(skippableOffset: string): FlexibleOffset {
        throw new Error('FlexibleOffset#parse not implemented')
    }
    toString(): string {
        throw new Error('FlexibleOffset#toString not implemented')
    }
}
