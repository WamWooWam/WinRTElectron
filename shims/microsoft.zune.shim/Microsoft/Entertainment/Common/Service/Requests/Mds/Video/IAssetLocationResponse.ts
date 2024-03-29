// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { Encoding } from "./Encoding";
import { IAssetLocationSubtitle } from "./IAssetLocationSubtitle";
import { Resolution } from "./Resolution";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";

export interface IAssetLocationResponse {
    encoding: Encoding;
    licenseKeyId: string;
    offerId: string;
    resolution: Resolution;
    serviceMediaId: string;
    serviceMediaInstanceId: string;
    signedLicensePolicyTicket: string;
    subtitles: IVectorView<IAssetLocationSubtitle>;
    url: string;
}
