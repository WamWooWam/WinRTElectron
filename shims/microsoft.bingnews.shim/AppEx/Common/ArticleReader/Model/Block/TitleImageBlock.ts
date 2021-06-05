// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { ImageDescriptor } from "../ImageDescriptor";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.ArticleReader.Model.Block.TitleImageBlock')
export class TitleImageBlock implements IStringable { 
    readonly type: string = null;
    image: ImageDescriptor = null;
    sizeHint: number | null = null;
    locationHint: string = null;
    toString(): string {
        throw new Error('TitleImageBlock#toString not implemented')
    }
}
