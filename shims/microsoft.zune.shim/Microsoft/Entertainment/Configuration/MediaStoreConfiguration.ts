// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IMediaStoreConfiguration } from "./IMediaStoreConfiguration";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.Entertainment.Configuration.MediaStoreConfiguration')
export class MediaStoreConfiguration implements IMediaStoreConfiguration { 
    writeOutMetadata: boolean = null;
    overwriteAllMetadata: boolean = null;
    maxTrackDurationDeltaMS: number = null;
    lastOpenedDatabaseUserId: string = null;
    executeMediaRightTableCleanup: boolean = null;
    enableFuzzyMatching: boolean = null;
    dbMigrationProgress: number = null;
    currentDbSchemaVersion: number = null;
    bypassDbSchemaVersionCheck: boolean = null;
}
