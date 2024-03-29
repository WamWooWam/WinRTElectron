// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { ISharingPackage } from "./ISharingPackage";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Share.SharingPackage')
export class SharingPackage implements ISharingPackage { 
    uri: string = null;
    title: string = null;
    text: string = null;
    shouldShareFiles: boolean = null;
    mediaType: string = null;
    mediaTitle: string = null;
    mediaId: string = null;
    mediaDescription: string = null;
    mediaAvailabilityFilter: number = null;
    libraryTypes: IVectorView<number> = null;
    libraryIds: IVectorView<number> = null;
    html: string = null;
    description: string = null;
    hasData: boolean = null;
}
