// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { ImageDescriptor } from "./ImageDescriptor";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.NewsCluster.Response.NewsDescriptor')
export class NewsDescriptor implements IStringable { 
    articleUrl: string = null;
    title: string = null;
    category: string = null;
    snippet: string = null;
    source: string = null;
    sourceImageUrl: string = null;
    publishTime: string = null;
    thumbnail: ImageDescriptor = null;
    byline: string = null;
    toString(): string {
        throw new Error('NewsDescriptor#toString not implemented')
    }
}
