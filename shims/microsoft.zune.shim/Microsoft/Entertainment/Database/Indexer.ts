import { AsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { ApplicationData } from "winrt/Windows/Storage/ApplicationData";
import { CreationCollisionOption } from "winrt/Windows/Storage/CreationCollisionOption";
import { FileIO } from "winrt/Windows/Storage/FileIO";
import { KnownLibraryId } from "winrt/Windows/Storage/KnownLibraryId";
import { StorageFile } from "winrt/Windows/Storage/StorageFile";
import { StorageLibrary } from "winrt/Windows/Storage/StorageLibrary";
import { MediaStore } from "../Platform/MediaStore";
import { StorageFolder } from "winrt/Windows/Storage/StorageFolder";
import { GenreIds } from "../Database/GenreIds";
import { DBAlbum, DBArtist, DBGenre, dbPromise, DBTrack } from "../Database/Utils";
import { CollectionBuildingManager } from "../Platform/CollectionBuildingManager";

import * as crypto from "crypto"
import * as mime from "mime-types"
import * as mm from "music-metadata"
import { CollectionBuildingSource } from "../Platform/CollectionBuildingSource";
// import { File } from "node-taglib-sharp"

function parseGenre(genre: string) {
    let id = genre.match(/\(?(\d+)\)?/)
    if (id && id[1]) {
        return GenreIds[parseInt(id[1])];
    }

    return genre;
}

export class Indexer {

    static isIndexing: boolean = false;

    static async indexAsync() {
        if (Indexer.isIndexing)
            return;

        Indexer.isIndexing = true;

        await (MediaStore.instance ?? new MediaStore()).ensureDatabaseOpenedAsync();

        let database = MediaStore.instance.database;
        let manager = CollectionBuildingManager.instance;

        manager?.dispatchEvent('collectionbuildbeginevent', [CollectionBuildingSource.local]);

        let localFolder = ApplicationData.current.localFolder;
        let library = await AsyncOperation.to(StorageLibrary.getLibraryAsync(KnownLibraryId.music));
        let folders = [...library.folders];
        let total = 0;
        for (const folder of folders) {
            folders.push(...await AsyncOperation.to(folder.getFoldersAsync()));

            let files = await AsyncOperation.to(folder.getFilesAsync());
            for (const file of files) {
                let mimeType = mime.lookup(file.fileType);
                if (!mimeType || !mimeType.startsWith("audio")) {
                    console.debug("skipping " + mimeType);
                    continue;
                }

                {
                    let transaction = database.transaction(['track'], 'readonly');
                    let trackStore = transaction.objectStore('track');
                    let trackfilePath = trackStore.index('filePath');
                    let track = await dbPromise(trackfilePath.get(file.path))
                    if (track)
                        continue;
                }

                try {
                    let metadata = await mm.parseFile(file.path);
                    // let tag = File.createFromPath(file.path);

                    total++;
                    if ((total % 20) == 0)
                        manager?.dispatchEvent('collectionbuildprogressevent', { itemsCompleted: total, isCompleted: false });

                    let trackName = metadata.common.title ?? file.displayName;
                    let trackSortName = metadata.common.title ?? file.displayName;
                    let albumName = metadata.common.album ?? "Unknown Album";
                    let albumSortName = metadata.common.album ?? "Unknown Album";
                    let artistName = metadata.common.artist ?? "Unknown Artist";
                    let genreName = metadata.common.genre ? parseGenre(metadata.common.genre[0]) : "Unknown";
                    let albumArt = mm.selectCover(metadata.common.picture)
                    let albumArtPath = null;
                    if (albumArt && typeof albumArt != 'string' && albumArt.data) {
                        let hash = crypto.createHash('md5');
                        hash.update(albumArt.data);

                        let ext = albumArt.format.includes('/') ? albumArt.format.substr(albumArt.format.indexOf('/') + 1) : albumArt.format;
                        let fileName = `${hash.digest('hex')}.${ext}`;
                        let albumArtFolder = await AsyncOperation.to(localFolder.createFolderAsync("AlbumArt", CreationCollisionOption.openIfExists));
                        let albumArtFile = await AsyncOperation.to(albumArtFolder.tryGetItemAsync(fileName)) as StorageFile;
                        if (albumArtFile == null) {
                            albumArtFile = await AsyncOperation.to(albumArtFolder.createFileAsync(fileName, CreationCollisionOption.failIfExists));
                            console.log(albumArtFile.path);
                            await FileIO.writeBufferAsync(albumArtFile, albumArt.data)
                        }

                        albumArtPath = albumArtFile.path;
                    }

                    let transaction = database.transaction(['album', 'artist', 'genre', 'track'], 'readwrite');
                    let albumStore = transaction.objectStore('album');
                    let albumIndex = albumStore.index("title");
                    let artistStore = transaction.objectStore('artist');
                    let artistIndex = artistStore.index("name");
                    let genreStore = transaction.objectStore('genre');
                    let genreIndex = genreStore.index("name");
                    let trackStore = transaction.objectStore('track');
                    let trackIndex = trackStore.index('name');

                    let genre = await dbPromise(genreIndex.get(genreName)) as DBGenre
                    if (genre === undefined) {
                        genre = { name: genreName }
                        genre.id = await dbPromise(genreStore.put(genre)) as number;
                    }

                    let artist = await dbPromise(artistIndex.get(artistName)) as DBArtist;
                    if (artist === undefined) {
                        artist = { name: artistName, sortName: artistName };
                        artist.id = await dbPromise(artistStore.put(artist)) as number;
                    }

                    let album = await dbPromise(albumIndex.get(albumName)) as DBAlbum;
                    if (album === undefined) {
                        album = {
                            title: albumName,
                            sortTitle: albumSortName,
                            description: "",
                            releaseDate: new Date(),
                            imageUrl: albumArtPath,
                            artistIds: [artist.id],
                            genreIds: [genre.id],
                            trackCount: 1
                        }
                        album.id = await dbPromise(albumStore.put(album)) as number;
                    }
                    else {
                        if (album.artistIds.indexOf(artist.id) == -1) {
                            album.artistIds.push(artist.id);
                        }
                        if (album.genreIds.indexOf(genre.id) == -1) {
                            album.genreIds.push(genre.id);
                        }

                        await dbPromise(albumStore.put(album))
                    }

                    // let track = await dbPromise(trackIndex.get(trackName)) as DBTrack;
                    // if (track === undefined) {
                    let track = {
                        name: trackName,
                        sortName: trackSortName,
                        albumId: album.id,
                        artistId: artist.id,
                        genreId: genre.id,
                        filePath: file.path,
                        imageUrl: albumArtPath,
                        duration: (metadata.format.duration ?? 0) * 1000,
                        number: metadata.common.track.no ?? 0,
                        date: new Date(Date.parse(metadata.common.date))
                    } as DBTrack;
                    track.id = await dbPromise(trackStore.put(track)) as number;
                    // }
                } catch (error) {
                    console.error("indexer error", error);
                }
            }
        }

        let transaction = database.transaction(['album', 'track'], 'readwrite');
        let store = transaction.objectStore('album');
        let tracks = transaction.objectStore('track').index('albumId');
        let albums = await dbPromise(store.getAll()) as DBAlbum[];
        for (const album of albums) {
            let albumTracks = await dbPromise(tracks.getAll(album.id)) as DBTrack[];
            album.trackCount = albumTracks.length;

            await dbPromise(store.put(album));
        }

        manager?.dispatchEvent('collectionbuildprogressevent', { itemsCompleted: total, isCompleted: true });
        Indexer.isIndexing = false;
    }

}