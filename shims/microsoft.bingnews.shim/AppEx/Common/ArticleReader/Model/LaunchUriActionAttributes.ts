// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { LaunchUriExtraLink } from "./LaunchUriExtraLink";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.Model.LaunchUriActionAttributes')
export class LaunchUriActionAttributes implements IStringable { 
    uri: string = null;
    extraLinks: IMap<string, LaunchUriExtraLink> = null;
    toString(): string {
        throw new Error('LaunchUriActionAttributes#toString not implemented')
    }
}
