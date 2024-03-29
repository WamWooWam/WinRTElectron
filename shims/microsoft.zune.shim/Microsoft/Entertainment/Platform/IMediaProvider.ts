// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { MediaAvailability } from "./MediaAvailability";
import { MediaStorageLocation } from "./MediaStorageLocation";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";

export interface IMediaProvider {
    deleteMediaAsync(libraryType: number, piLibraryIds: IVectorView<number>, availabilityFilter: MediaAvailability): IAsyncAction;
    copyMediaAsync(from: MediaStorageLocation, to: MediaStorageLocation, libraryType: number, piLibraryIds: IVectorView<number>): IAsyncAction;
    addMediaToCloudAsync(libraryType: number, piLibraryIds: IVectorView<number>): IAsyncAction;
    destroyDatabase(): void;
    deleteFilesForMediaAsync(libraryType: number, piLibraryIds: IVectorView<number>, availabilityFilter: MediaAvailability): IAsyncAction;
}
