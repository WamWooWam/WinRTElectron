// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.NewsCluster.Response.ImageDescriptor')
export class ImageDescriptor implements IStringable { 
    url: string = null;
    altText: string = null;
    width: number = null;
    height: number = null;
    attribution: string = null;
    toString(): string {
        throw new Error('ImageDescriptor#toString not implemented')
    }
}
