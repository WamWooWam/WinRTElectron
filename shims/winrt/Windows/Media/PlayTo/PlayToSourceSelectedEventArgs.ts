// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IRandomAccessStreamWithContentType } from "../../Storage/Streams/IRandomAccessStreamWithContentType";

@GenerateShim('Windows.Media.PlayTo.PlayToSourceSelectedEventArgs')
export class PlayToSourceSelectedEventArgs { 
    friendlyName: string = null;
    icon: IRandomAccessStreamWithContentType = null;
    supportsAudio: boolean = null;
    supportsImage: boolean = null;
    supportsVideo: boolean = null;
}