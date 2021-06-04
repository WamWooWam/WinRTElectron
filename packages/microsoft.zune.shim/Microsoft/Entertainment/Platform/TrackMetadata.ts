// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { ITrackMetadata } from "./ITrackMetadata";
import { SmartDJState } from "./SmartDJState";
import { SmartVJState } from "./SmartVJState";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Platform.TrackMetadata')
export class TrackMetadata implements ITrackMetadata { 
    uniqueFileId: string = null;
    unblockFromCloud: boolean = null;
    trackNumber: number = null;
    trackMediaId: string = null;
    trackBingId: string = null;
    title: string = null;
    sortTitle: string = null;
    sortArtist: string = null;
    requestId: string = null;
    releaseDate: string = null;
    period: string = null;
    genre: string = null;
    explicitLyrics: string = null;
    editedFields: number = null;
    discNumber: number = null;
    contentId: string = null;
    canSmartVJ: SmartVJState = null;
    canSmartDJ: SmartDJState = null;
    artistMediaId: string = null;
    artistImageUrl: string = null;
    artistBingId: string = null;
    artist: string = null;
    actionableMediaId: string = null;
}