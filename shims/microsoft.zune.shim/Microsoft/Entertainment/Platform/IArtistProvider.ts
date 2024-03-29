// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { GetLibraryIdFromMediaIdReturnValue } from "./GetLibraryIdFromMediaIdReturnValue";
import { HasMediaReturnValue } from "./HasMediaReturnValue";
import { IPlayableMediaData } from "./IPlayableMediaData";
import { MediaAvailability } from "./MediaAvailability";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IArtistProvider {
    getLibraryIdFromMediaIdAsync(mediaId: string): IAsyncOperation<GetLibraryIdFromMediaIdReturnValue>;
    getPlayabilityByLibraryIdAsync(nLibraryId: number, availabilityFilter: MediaAvailability): IAsyncOperation<IVectorView<IPlayableMediaData>>;
    hasLocalMediaAsync(libraryId: number): IAsyncOperation<HasMediaReturnValue>;
    hasRemoteMediaAsync(libraryId: number): IAsyncOperation<HasMediaReturnValue>;
}
