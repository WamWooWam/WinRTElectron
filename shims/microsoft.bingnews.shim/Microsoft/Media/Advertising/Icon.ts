// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IResource } from "./IResource";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.Media.Advertising.Icon')
export class Icon implements IStringable { 
    item: IResource = null;
    readonly clickTracking: IVector<string> = null;
    clickThrough: Uri = null;
    readonly viewTracking: IVector<string> = null;
    program: string = null;
    width: number | null = null;
    height: number | null = null;
    xposition: string = null;
    yposition: string = null;
    offset: number | null = null;
    duration: number | null = null;
    apiFramework: string = null;
    toString(): string {
        throw new Error('Icon#toString not implemented')
    }
}
