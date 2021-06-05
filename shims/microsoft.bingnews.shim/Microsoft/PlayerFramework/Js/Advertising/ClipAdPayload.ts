// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { IClipAdPayload } from "../../../Media/Advertising/IClipAdPayload";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";

@GenerateShim('Microsoft.PlayerFramework.Js.Advertising.ClipAdPayload')
export class ClipAdPayload implements IClipAdPayload, IStringable { 
    mediaSource: Uri = null;
    mimeType: string = null;
    clickThrough: Uri = null;
    toString(): string {
        throw new Error('ClipAdPayload#toString not implemented')
    }
}