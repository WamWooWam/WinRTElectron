// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Media.Advertising.FWAsset')
export class FWAsset implements IStringable { 
    content: string = null;
    id: string = null;
    contentType: string = null;
    mimeType: string = null;
    name: string = null;
    url: string = null;
    bytes: number = null;
    toString(): string {
        throw new Error('FWAsset#toString not implemented')
    }
}
