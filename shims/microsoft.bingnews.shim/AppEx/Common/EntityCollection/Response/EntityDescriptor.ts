// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:07 2021
// </auto-generated>
// --------------------------------------------------

import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('AppEx.Common.EntityCollection.Response.EntityDescriptor')
export class EntityDescriptor implements IStringable { 
    id: string = null;
    image: string = null;
    title: string = null;
    subtitle: string = null;
    group: string = null;
    attributes: IMap<string, string> = null;
    toString(): string {
        throw new Error('EntityDescriptor#toString not implemented')
    }
}