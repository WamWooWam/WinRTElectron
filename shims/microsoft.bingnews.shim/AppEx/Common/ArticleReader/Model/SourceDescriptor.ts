// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { ImageResourceDescriptor } from "./ImageResourceDescriptor";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.Model.SourceDescriptor')
export class SourceDescriptor implements IStringable { 
    name: string = null;
    favicon: ImageResourceDescriptor = null;
    toString(): string {
        throw new Error('SourceDescriptor#toString not implemented')
    }
}
