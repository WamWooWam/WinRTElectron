// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { WindowsCategoryDataModel } from "./WindowsCategoryDataModel";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Vector } from "winrt/Windows/Foundation/Interop/Vector`1";

@GenerateShim('Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsCategoriesDataModel')
export class WindowsCategoriesDataModel implements IStringable { 
    readonly followedCategories: IVector<WindowsCategoryDataModel> = new Vector();
    readonly deletedCategories: IVector<WindowsCategoryDataModel> = new Vector();
    market: string = null;
    toString(): string {
        throw new Error('WindowsCategoriesDataModel#toString not implemented')
    }
}
