// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IMap } from "../../Foundation/Collections/IMap`2";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IIndexableContent } from "./IIndexableContent";
import { IRandomAccessStream } from "../Streams/IRandomAccessStream";

@GenerateShim('Windows.Storage.Search.IndexableContent')
export class IndexableContent implements IIndexableContent { 
    streamContentType: string = null;
    stream: IRandomAccessStream = null;
    id: string = null;
    properties: IMap<string, any> = null;
}