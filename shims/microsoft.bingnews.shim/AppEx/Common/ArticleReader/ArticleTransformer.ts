// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { IDataTransform } from "../../../Platform/IDataTransform";
import { ResponseData } from "../../../Platform/ResponseData";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.ArticleTransformer')
export class ArticleTransformer implements IDataTransform, IStringable { 
    static readonly instance: ArticleTransformer = null;
    transformData(data: string): ResponseData {
        throw new Error('ArticleTransformer#transformData not implemented')
    }
    toString(): string {
        throw new Error('ArticleTransformer#toString not implemented')
    }
}