// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:01 2021
// </auto-generated>
// --------------------------------------------------

import { ProductListing } from "./ProductListing";
import { IMapView } from "../../Foundation/Collections/IMapView`2";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Store.ListingInformation')
export class ListingInformation { 
    ageRating: number = null;
    currentMarket: string = null;
    description: string = null;
    formattedPrice: string = null;
    name: string = null;
    productListings: IMapView<string, ProductListing> = null;
}