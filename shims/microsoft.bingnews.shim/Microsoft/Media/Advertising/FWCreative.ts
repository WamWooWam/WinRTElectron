// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { FWBaseUnit } from "./FWBaseUnit";
import { FWCreativeRendition } from "./FWCreativeRendition";
import { FWParameter } from "./FWParameter";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWCreative')
export class FWCreative implements IStringable { 
    adUnit: string = null;
    baseUnit: FWBaseUnit = null;
    duration: number | null = null;
    id: string = null;
    redirectUrl: string = null;
    readonly creativeRenditions: IVector<FWCreativeRendition> = null;
    readonly parameters: IVector<FWParameter> = null;
    toString(): string {
        throw new Error('FWCreative#toString not implemented')
    }
}
