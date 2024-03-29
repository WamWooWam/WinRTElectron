// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IAlbumProvider } from "./IAlbumProvider";
import { IArtistProvider } from "./IArtistProvider";
import { IMediaProvider } from "./IMediaProvider";
import { IOfflineDetailProvider } from "./IOfflineDetailProvider";
import { IPlaylistProvider } from "./IPlaylistProvider";
import { IRatingProvider } from "./IRatingProvider";
import { ISeriesProvider } from "./ISeriesProvider";
import { ISharingProvider } from "./ISharingProvider";
import { ITrackProvider } from "./ITrackProvider";
import { IVideoProvider } from "./IVideoProvider";
import { IWatchlistProvider } from "./IWatchlistProvider";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";

export interface IMediaStore {
    albumProvider: IAlbumProvider;
    artistProvider: IArtistProvider;
    databaseNeedsUpgrade: boolean;
    mediaProvider: IMediaProvider;
    offlineDetailProvider: IOfflineDetailProvider;
    playlistProvider: IPlaylistProvider;
    ratingProvider: IRatingProvider;
    seriesProvider: ISeriesProvider;
    sharingProvider: ISharingProvider;
    trackProvider: ITrackProvider;
    videoProvider: IVideoProvider;
    watchlistProvider: IWatchlistProvider;
    prepareDatabaseForSuspend(prepareForSuspend: boolean): void;
    closeDatabase(): void;
    ensureDatabaseOpenedAsync(): IAsyncAction;
    getMemoryUsageStats(): string;
    clearMemoryUsageStats(): void;
}
