// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:06 2021
// </auto-generated>
// --------------------------------------------------

import { ImageResourceDescriptor } from "./Model/ImageResourceDescriptor";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";

export interface IImageProvider {
    getImages(): IVector<ImageResourceDescriptor>;
}
