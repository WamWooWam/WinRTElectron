// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:09 2021
// </auto-generated>
// --------------------------------------------------

import { AdSystem } from "./AdSystem";
import { Extension } from "./Extension";
import { ICreative } from "./ICreative";
import { Pricing } from "./Pricing";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.Advertising.Ad')
export class Ad implements IStringable { 
    id: string = null;
    adSystem: AdSystem = null;
    readonly impressions: IVector<string> = null;
    readonly creatives: IVector<ICreative> = null;
    readonly extensions: IVector<Extension> = null;
    title: string = null;
    description: string = null;
    advertiser: string = null;
    pricing: Pricing = null;
    survey: Uri = null;
    errors: IVector<string> = null;
    fallbackAds: IVector<Ad> = null;
    toString(): string {
        throw new Error('Ad#toString not implemented')
    }
}
