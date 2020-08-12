import { StorageFolder } from "./Windows.Storage.FileSystem";
import { ApplicationModel } from "./Windows.ApplicationModel";
import { getCurrentPackageName } from "./util";
export * from "./Windows.Storage.FileSystem"

const { remote } = require("electron");
const path = require('path');
const app = remote.app;

export class ApplicationData {
    public static get current(): ApplicationData {
        return new ApplicationData();
    }
    public get roamingSettings(): ApplicationDataContainer {
        return self.localStorage !== undefined ? new LocalStorageBackedContainer("roamingSettings") : new WebWorkerBackedContainer("roamingSettings");
    }
    public get localSettings(): ApplicationDataContainer {
        return self.localStorage !== undefined ? new LocalStorageBackedContainer("localSettings") : new WebWorkerBackedContainer("localSettings");
    }

    public get localCacheFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "cache"));
    }

    public get localFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "local"));
    }

    public get roamingFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "roaming"));
    }

    public get temporaryFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "temp"));
    }
}

class ApplicationDataValueContainer {

    __baseContainer: ApplicationDataContainer;

    constructor(mutated: ApplicationDataContainer) {
        this.__baseContainer = mutated;
    }

    get(key: string) {
        return this.__baseContainer.lookup(key);
    }

    set(key: string, value: any) {
        this.__baseContainer.set(key, value);
    }

    hasKey(key: string) {
        return this.__baseContainer.lookup(key) !== null;
    }

    remove(key: string) {
        return this.__baseContainer.remove(key);
    }
}

class ApplicationDataValueProxy implements ProxyHandler<ApplicationDataValueContainer> {
    get(target: ApplicationDataValueContainer, p: PropertyKey, receiver: any): any {
        if (p in target) {
            return target[p];
        }

        console.log(`getting ${String(p)} from ${target.__baseContainer.name}`);

        return target.get(String(p));
    }

    set(target: ApplicationDataValueContainer, p: PropertyKey, value: any, receiver: any): boolean {
        console.log(`setting ${String(p)} to ${value} in ${target.__baseContainer.name}`);
        target.set(String(p), value);

        return true;
    }
}

export abstract class ApplicationDataContainer {
    name: string;

    protected containers: Map<string, ApplicationDataContainer>
    protected _values: Map<string, any>;
    private _valueContainer: ApplicationDataValueContainer;

    public get values() {
        return this._valueContainer ?? (this._valueContainer = new Proxy(new ApplicationDataValueContainer(this), new ApplicationDataValueProxy()));
    }

    public locality: ApplicationDataLocality;

    constructor(name) {
        this.name = name;
        this._values = new Map<string, any>();
        this.containers = new Map<string, ApplicationDataContainer>();
        this.locality = name.includes("local") ? ApplicationDataLocality.local : ApplicationDataLocality.roaming;
    }

    abstract mutated(): void;
    abstract lookup(key: string): any;
    abstract set(key: string, value: any): void
    abstract remove(key: string): void;
    abstract createContainer(name: string, disposition: ApplicationDataCreateDisposition): ApplicationDataContainer;
    abstract deleteContainer(name: string): void;
}


export class WebWorkerBackedContainer extends ApplicationDataContainer {

    constructor(name: string) {
        super(name)

        // let data = localStorage.getItem(name);
        // if (data !== null) {
        //     this.values = new Map(JSON.parse(data));
        // }

        // localStorage.setItem(name, JSON.stringify([...this.values]));
    }

    mutated() {

    }

    lookup(key: string): any {
        return this._values.get(key);
    }

    set(key: string, value: any) {
        this._values.set(key, value);
        this.mutated();
    }

    remove(key: string) {
        this._values.delete(key);
        this.mutated();
    }

    createContainer(name: string, disposition: ApplicationDataCreateDisposition) {
        var storage = new WebWorkerBackedContainer(this.name + "." + name);
        return this.containers.has(name) ? this.containers.get(name) : this.containers.set(name, storage).get(name);
    }

    deleteContainer(name: string) {
        this.containers.delete(name);
        //localStorage.removeItem(this.name + "." + name);
    }
}

export class LocalStorageBackedContainer extends ApplicationDataContainer {
    constructor(name: string) {
        super(name);

        let data = localStorage.getItem(name);
        if (data !== null) {
            this._values = new Map(JSON.parse(data));
        }

        localStorage.setItem(this.name, JSON.stringify([...this._values]));
    }

    mutated() {
        const jsonData = JSON.stringify([...this._values]);
        localStorage.setItem(this.name, jsonData);
    }

    lookup(key: string): any {
        return this._values.get(key);
    }

    set(key: string, value: any) {
        this._values.set(key, value);
        this.mutated();
    }

    remove(key: string) {
        this._values.delete(key);
        this.mutated();
    }

    createContainer(name: string, disposition: ApplicationDataCreateDisposition) {
        var storage = new LocalStorageBackedContainer(this.name + "." + name);
        return this.containers.has(name) ? this.containers.get(name) : this.containers.set(name, storage).get(name);
    }

    deleteContainer(name: string) {
        this.containers.delete(name);
        localStorage.removeItem(this.name + "." + name);
    }
}


export namespace Streams {
    export class RandomAccessStreamReference {
        static createFromStream() {

        }
    }
}

export enum ApplicationDataCreateDisposition {
    always,
    existing
}

export enum ApplicationDataLocality {
    local,
    roaming,
    temporaray,
    localCache
}

export namespace AccessCache {
    export enum AccessCacheOptions {
        none,
        disallowUserInput,
        fastLocationsOnly,
        useReadOnlyCachedCopy = 4,
        suppressAccessTimeUpdate = 8,
    }
    export enum RecentStorageItemVisibility {
        appOnly,
        appAndSystem,
    }
}

export namespace Compression {
    export enum CompressAlgorithm {
        invalidAlgorithm,
        nullAlgorithm,
        mszip,
        xpress,
        xpressHuff,
        lzms,
    }
}
export enum CreationCollisionOption {
    generateUniqueName,
    replaceExisting,
    failIfExists,
    openIfExists,
}
export enum FileAccessMode {
    read,
    readWrite,
}
export enum FileAttributes {
    normal,
    readOnly,
    directory = 16,
    archive = 32,
    temporary = 256,
    locallyIncomplete = 512,
}
export namespace FileProperties {
    export enum PhotoOrientation {
        unspecified,
        normal,
        flipHorizontal,
        rotate180,
        flipVertical,
        transpose,
        rotate270,
        transverse,
        rotate90,
    }
    export enum PropertyPrefetchOptions {
        none,
        musicProperties,
        videoProperties,
        imageProperties = 4,
        documentProperties = 8,
        basicProperties = 16,
    }
    export enum ThumbnailMode {
        picturesView,
        videosView,
        musicView,
        documentsView,
        listView,
        singleItem,
    }
    export enum ThumbnailOptions {
        none,
        returnOnlyIfCached,
        resizeThumbnail,
        useCurrentScale = 4,
    }
    export enum ThumbnailType {
        image,
        icon,
    }
    export enum VideoOrientation {
        normal,
        rotate90 = 90,
        rotate180 = 180,
        rotate270 = 270,
    }
}
export enum KnownFolderId {
    appCaptures,
    cameraRoll,
    documentsLibrary,
    homeGroup,
    mediaServerDevices,
    musicLibrary,
    objects3D,
    picturesLibrary,
    playlists,
    recordedCalls,
    removableDevices,
    savedPictures,
    screenshots,
    videosLibrary,
    allAppMods,
    currentAppMods,
}
export enum KnownLibraryId {
    music,
    pictures,
    videos,
    documents,
}
export enum NameCollisionOption {
    generateUniqueName,
    replaceExisting,
    failIfExists,
}
export namespace Pickers {
    export enum PickerLocationId {
        documentsLibrary,
        computerFolder,
        desktop,
        downloads,
        homeGroup,
        musicLibrary,
        picturesLibrary,
        videosLibrary,
        objects3D,
        unspecified,
    }
    export enum PickerViewMode {
        list,
        thumbnail,
    }
    export namespace Provider {
        export enum AddFileResult {
            added,
            alreadyAdded,
            notAllowed,
            unavailable,
        }
        export enum FileSelectionMode {
            single,
            multiple,
        }
        export enum SetFileNameResult {
            succeeded,
            notAllowed,
            unavailable,
        }
    }
}

export enum StorageItemTypes {
    none,
    file,
    folder,
}

export class BasicProperties {

}