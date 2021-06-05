// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:08 2021
// </auto-generated>
// --------------------------------------------------

import { WindowsProviderConfigurationDataModel } from "./WindowsProviderConfigurationDataModel";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Amp.PersonalDataPlatform.DataClient.News.DataModel.Windows.WindowsCategoryDataModel')
export class WindowsCategoryDataModel implements IStringable { 
    server: boolean = null;
    pinned: boolean = null;
    title: string = null;
    id: string = null;
    guid: string = null;
    clusterType: string = null;
    providerConfiguration: WindowsProviderConfigurationDataModel = null;
    append: boolean = null;
    minReleaseNumber: number = null;
    semanticZoomThumbnailUrl: string = null;
    equals(category: any): boolean {
        throw new Error('WindowsCategoryDataModel#equals not implemented')
    }
    getHashCode(): number {
        throw new Error('WindowsCategoryDataModel#getHashCode not implemented')
    }
    isHero(): boolean {
        throw new Error('WindowsCategoryDataModel#isHero not implemented')
    }
    toString(): string {
        throw new Error('WindowsCategoryDataModel#toString not implemented')
    }
}