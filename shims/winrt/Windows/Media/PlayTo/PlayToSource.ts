// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { PlayToConnection } from "./PlayToConnection";

@GenerateShim('Windows.Media.PlayTo.PlayToSource')
export class PlayToSource { 
    next: PlayToSource = null;
    connection: PlayToConnection = null;
    preferredSourceUri: Uri = null;
    playNext(): void {
        console.warn('PlayToSource#playNext not implemented')
    }
}
