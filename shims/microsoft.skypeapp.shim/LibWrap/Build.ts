// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { BuildType } from "./BuildType";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('LibWrap.Build')
export class Build { 
    static release: boolean = true;
    static getBuildType(): BuildType {
        return BuildType.buildtype_REAL_ENV;
    }
}