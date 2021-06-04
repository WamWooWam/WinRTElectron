// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IAlbumProvider } from "./IAlbumProvider";
import { IArtistProvider } from "./IArtistProvider";
import { IMediaProvider } from "./IMediaProvider";
import { IMediaStore } from "./IMediaStore";
import { IOfflineDetailProvider } from "./IOfflineDetailProvider";
import { IPlaylistProvider } from "./IPlaylistProvider";
import { IRatingProvider } from "./IRatingProvider";
import { ISeriesProvider } from "./ISeriesProvider";
import { ISharingProvider } from "./ISharingProvider";
import { ITrackProvider } from "./ITrackProvider";
import { IVideoProvider } from "./IVideoProvider";
import { IWatchlistProvider } from "./IWatchlistProvider";
import { AsyncAction, IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { PlaylistProvider } from "./PlaylistProvider";
import { AlbumProvider } from "./AlbumProvider";
import { ArtistProvider } from "./ArtistProvider";
import { MediaProvider } from "./MediaProvider";
import { OfflineDetailProvider } from "./OfflineDetailProvider";
import { RatingProvider } from "./RatingProvider";
import { TrackProvider } from "./TrackProvider";
import { SharingProvider } from "./SharingProvider";

@GenerateShim('Microsoft.Entertainment.Platform.MediaStore')
export class MediaStore implements IMediaStore {
    static instance: MediaStore;

    constructor() {
        MediaStore.instance = this;
    }

    database: IDBDatabase;
    albumProvider: IAlbumProvider = new AlbumProvider();
    artistProvider: IArtistProvider = new ArtistProvider();
    databaseNeedsUpgrade: boolean = true;
    mediaProvider: IMediaProvider = new MediaProvider();
    offlineDetailProvider: IOfflineDetailProvider = new OfflineDetailProvider();
    playlistProvider: IPlaylistProvider = new PlaylistProvider();
    ratingProvider: IRatingProvider = new RatingProvider();
    seriesProvider: ISeriesProvider = null;
    sharingProvider: ISharingProvider = new SharingProvider();
    trackProvider: ITrackProvider = new TrackProvider();
    videoProvider: IVideoProvider = null;
    watchlistProvider: IWatchlistProvider = null;

    prepareDatabaseForSuspend(prepareForSuspend: boolean): void {
        console.warn('MediaStore#prepareDatabaseForSuspend not implemented')
    }
    closeDatabase(): void {
        console.warn('MediaStore#closeDatabase not implemented')
    }
    ensureDatabaseOpenedAsync(): IAsyncAction {
        return AsyncAction.from(() => new Promise((res, rej) => {
            let request = indexedDB.open('music-database', 1);
            request.onsuccess = (e) => {
                this.database = request.result;
                res();
            }

            request.onupgradeneeded = (e) => {
                let db = request.result;

                let albumStore = db.createObjectStore('album', { keyPath: "id", autoIncrement: true });
                albumStore.createIndex("title", "title", { unique: false })
                albumStore.createIndex("description", "description", { unique: false });
                albumStore.createIndex("artistIds", "artistIds", { unique: false, multiEntry: true });
                albumStore.createIndex("genreIds", "genreIds", { unique: false, multiEntry: true });

                let artistStore = db.createObjectStore('artist', { keyPath: "id", autoIncrement: true });
                artistStore.createIndex("name", "name", { unique: true })

                let genreStore = db.createObjectStore('genre', { keyPath: "id", autoIncrement: true });
                genreStore.createIndex("name", "name", { unique: true })

                let trackStore = db.createObjectStore('track', { keyPath: "id", autoIncrement: true });
                trackStore.createIndex("name", "name", { unique: false })
                trackStore.createIndex("albumId", "albumId", { unique: false })
                trackStore.createIndex("artistId", "artistId", { unique: false })
                trackStore.createIndex("filePath", "filePath", { unique: true })
            }
        }));
    }
    getMemoryUsageStats(): string {
        throw new Error('MediaStore#getMemoryUsageStats not implemented')
    }
    clearMemoryUsageStats(): void {
        console.warn('MediaStore#clearMemoryUsageStats not implemented')
    }
}