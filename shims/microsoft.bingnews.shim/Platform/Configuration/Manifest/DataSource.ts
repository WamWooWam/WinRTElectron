// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:11 2021
// </auto-generated>
// --------------------------------------------------

import { DictionaryConfigurationItem } from "../DictionaryConfigurationItem";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { Vector } from "winrt/Windows/Foundation/Interop/Vector`1";

@GenerateShim('Platform.Configuration.Manifest.DataSource')
export class DataSource implements IStringable {
    __configurationItem: DictionaryConfigurationItem;

    id: string = null;
    @Enumerable(true)
    get urlTemplate(): string {
        return this.__configurationItem.getString("URLTemplate");
    }

    constructor(item: DictionaryConfigurationItem) {
        this.__configurationItem = item;
    }
}