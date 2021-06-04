
import { IAsyncAction } from "../Foundation/IAsyncAction";
import { Enumerable } from "../Foundation/Interop/Enumerable";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { getCurrentPackageName } from "../Foundation/Interop/Utils";
import { TypedEventHandler } from "../Foundation/TypedEventHandler`2";
import { ApplicationDataContainer } from "./ApplicationDataContainer";
import { ApplicationDataLocality } from "./ApplicationDataLocality";
import { ApplicationDataSetVersionHandler } from "./ApplicationDataSetVersionHandler";
import { StorageFolder } from "./StorageFolder";

const { remote } = require("electron");
const path = require('path');
const app = remote.app;

@GenerateShim('Windows.Storage.ApplicationData')
export class ApplicationData { 
    roamingStorageQuota: number = null;
    version: number = null;

    static get current(): ApplicationData {
        return new ApplicationData();
    }

    public get roamingSettings(): ApplicationDataContainer {
        return new ApplicationDataContainer("roamingSettings", ApplicationDataLocality.roaming);
    }
    public get localSettings(): ApplicationDataContainer {
        return new ApplicationDataContainer("localSettings", ApplicationDataLocality.local);
    }
    public get localFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "local"), true);
    }

    public get roamingFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "roaming"), true);
    }

    public get temporaryFolder(): StorageFolder {
        return StorageFolder.getFolderFromPathSync(path.join(app.getPath("userData"), "packages", getCurrentPackageName(), "temp"), true);
    }

    setVersionAsync(desiredVersion: number, handler: ApplicationDataSetVersionHandler): IAsyncAction {
        throw new Error('ApplicationData#setVersionAsync not implemented')
    }
    clearAllAsync(): IAsyncAction {
        throw new Error('ApplicationData#clearAllAsync not implemented')
    }
    clearAsync(locality: ApplicationDataLocality): IAsyncAction {
        throw new Error('ApplicationData#clearAsync not implemented')
    }
    signalDataChanged(): void {
        console.warn('ApplicationData#signalDataChanged not implemented')
    }

    #dataChanged: Set<TypedEventHandler<ApplicationData, any>> = new Set();
    @Enumerable(true)
    set ondatachanged(handler: TypedEventHandler<ApplicationData, any>) {
        this.#dataChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'datachanged':
                this.#dataChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'datachanged':
                this.#dataChanged.delete(handler);
                break;
        }
    }
}
