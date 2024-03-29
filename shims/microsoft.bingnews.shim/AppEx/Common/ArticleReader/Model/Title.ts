// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { TitleImageBlock } from "./Block/TitleImageBlock";
import { SourceDescriptor } from "./SourceDescriptor";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.Model.Title')
export class Title implements IStringable { 
    style: number = null;
    headline: string = null;
    kicker: string = null;
    byline: string = null;
    author: string = null;
    date: any = null;
    lastUpdatedDate: any = null;
    titleImage: TitleImageBlock = null;
    ads: number | null = null;
    publisher: SourceDescriptor = null;
    pgCode: string = null;
    free: boolean | null = null;
    abstract: string = null;
    customId: string = null;
    customType: string = null;
    toString(): string {
        throw new Error('Title#toString not implemented')
    }
}
