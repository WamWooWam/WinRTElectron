// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IShareableContent } from "./IShareableContent";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Platform.ShareableContent')
export class ShareableContent implements IShareableContent { 
    mediaDescription: string = null;
    storageFiles: IVectorView<any> = null;
}
