export function dbPromise(request: IDBRequest) {
    return new Promise((res, rej) => {
        request.onsuccess = (ev) => res(request.result);
        request.onerror = (ev) => rej(request.error);
    })
}


export interface DBAlbum {
    id?: number;
    title: string;
    sortTitle: string;
    description: string;
    releaseDate: Date;
    trackCount: number;
    imageUrl: string;

    artistIds: number[];
    genreIds: number[];
}

export interface DBArtist {
    id?: number;
    name: string;
    sortName: string;
    imageUrl?: string;
}

export interface DBGenre {
    id?: number;
    name: string;
}

export interface DBTrack {
    id?: number;
    name: string;
    sortName: string;
    albumId: number;
    artistId: number;
    genreId: number;
    filePath: string;
    duration: number;
    number: number;
    date: Date;
}
