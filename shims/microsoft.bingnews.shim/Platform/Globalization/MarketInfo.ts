// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { GeographicRegion } from "winrt/Windows/Globalization/GeographicRegion";
import { Language } from "winrt/Windows/Globalization/Language";

@GenerateShim('Platform.Globalization.MarketInfo')
export class MarketInfo implements IStringable { 
    static readonly defaultMarket: MarketInfo = null;
    readonly language: Language = null;
    readonly geographicRegion: GeographicRegion = null;
    readonly valueAsString: string = null;
    readonly displayName: string = null;
    constructor(language: Language, region: GeographicRegion) {
        console.warn('MarketInfo.ctor not implemented')
    }
    static isDefaultMarket(marketInfo: MarketInfo): boolean {
        throw new Error('MarketInfo#isDefaultMarket not implemented')
    }
    static parse(marketString: string): MarketInfo {
        throw new Error('MarketInfo#parse not implemented')
    }
    equals(obj: any): boolean {
        throw new Error('MarketInfo#equals not implemented')
    }
    getHashCode(): number {
        throw new Error('MarketInfo#getHashCode not implemented')
    }
    toString(): string {
        throw new Error('MarketInfo#toString not implemented')
    }
}
