import { StorageFolder } from "./Windows.Storage.FileSystem";

export * from "./Windows.Storage.FileSystem"

export class ApplicationData {
    public static get current(): ApplicationData {
        return new ApplicationData();
    }
    public get roamingSettings(): ApplicationDataContainer {
        return self.localStorage != undefined ? new LocalStorageBackedContainer("roamingSettings") : new WebWorkerBackedContainer("roamingSettings");
    }
    public get localSettings(): ApplicationDataContainer {
        return self.localStorage != undefined ? new LocalStorageBackedContainer("roamingSettings") : new WebWorkerBackedContainer("roamingSettings");
    }

    public get localCacheFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(__dirname + "/appdata/localCache");
    }

    public get localFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(__dirname + "/appdata/local");
    }

    public get roamingFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(__dirname + "/appdata/roaming");
    }

    public get temporaryFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(__dirname + "/temp");
    }
}

export abstract class ApplicationDataContainer {
    protected name: string;
    protected containers: Map<string, ApplicationDataContainer>

    protected _values: Map<string, any>;

    public get values() {
        return Object.fromEntries(this._values);
    }
    public locality: ApplicationDataLocality;

    constructor(name) {
        this.name = name;
        this._values = new Map<string, any>();
        this.containers = new Map<string, WebWorkerBackedContainer>();
        this.locality = name.includes("local") ? ApplicationDataLocality.local : ApplicationDataLocality.roaming;
    }

    abstract lookup(key: string): any;
    abstract set(key: string, value: any): void
    abstract remove(key: string): void;
    abstract createContainer(name: string, disposition: ApplicationDataCreateDisposition): ApplicationDataContainer;
    abstract deleteContainer(name: string): void;
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

export class WebWorkerBackedContainer extends ApplicationDataContainer {

    constructor(name: string) {
        super(name)

        // let data = localStorage.getItem(name);
        // if (data !== null) {
        //     this.values = new Map(JSON.parse(data));
        // }

        // localStorage.setItem(name, JSON.stringify([...this.values]));
    }

    lookup(key: string): any {
        return this._values.get(key);
    }

    set(key: string, value: any) {
        this._values.set(key, value);
    }

    remove(key: string) {
        this._values.delete(key);
        //localStorage.setItem(name, JSON.stringify([...this.values]));
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

    lookup(key: string): any {
        return this._values.get(key);
    }

    set(key: string, value: any) {
        this._values.set(key, value);
        localStorage.setItem(this.name, JSON.stringify([...this._values]));
    }

    remove(key: string) {
        this._values.delete(key);
        localStorage.setItem(this.name, JSON.stringify([...this._values]));
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
