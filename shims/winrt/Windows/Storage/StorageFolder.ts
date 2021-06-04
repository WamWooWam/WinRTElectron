
import { IVectorView } from "../Foundation/Collections/IVectorView`1";
import { DateTime } from "../Foundation/DateTime";
import { IAsyncAction } from "../Foundation/IAsyncAction";
import { AsyncOperation, IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { CreationCollisionOption } from "./CreationCollisionOption";
import { FileAttributes } from "./FileAttributes";
import { BasicProperties } from "./FileProperties/BasicProperties";
import { StorageItemContentProperties } from "./FileProperties/StorageItemContentProperties";
import { StorageItemThumbnail } from "./FileProperties/StorageItemThumbnail";
import { ThumbnailMode } from "./FileProperties/ThumbnailMode";
import { ThumbnailOptions } from "./FileProperties/ThumbnailOptions";
import { IStorageFolder } from "./IStorageFolder";
import { IStorageFolder2 } from "./IStorageFolder2";
import { IStorageItem } from "./IStorageItem";
import { IStorageItem2 } from "./IStorageItem2";
import { IStorageItemProperties } from "./IStorageItemProperties";
import { IStorageItemProperties2 } from "./IStorageItemProperties2";
import { IStorageItemPropertiesWithProvider } from "./IStorageItemPropertiesWithProvider";
import { NameCollisionOption } from "./NameCollisionOption";
import { CommonFileQuery } from "./Search/CommonFileQuery";
import { CommonFolderQuery } from "./Search/CommonFolderQuery";
import { IStorageFolderQueryOperations } from "./Search/IStorageFolderQueryOperations";
import { IndexedState } from "./Search/IndexedState";
import { QueryOptions } from "./Search/QueryOptions";
import { StorageFileQueryResult } from "./Search/StorageFileQueryResult";
import { StorageFolderQueryResult } from "./Search/StorageFolderQueryResult";
import { StorageItemQueryResult } from "./Search/StorageItemQueryResult";
import { StorageDeleteOption } from "./StorageDeleteOption";
import { StorageFile } from "./StorageFile";
import { StorageItemTypes } from "./StorageItemTypes";
import { StorageProvider } from "./StorageProvider";

import * as fs from "fs";
const fsp = fs.promises;
import * as _path from "path";
import { randstr } from "../Foundation/Interop/Utils";
import { Vector } from "../Foundation/Interop/Vector`1";

// @GenerateShim('Windows.Storage.StorageFolder')
export class StorageFolder implements IStorageFolder, IStorageItem, IStorageFolderQueryOperations, IStorageItemProperties, IStorageItemProperties2, IStorageItem2, IStorageFolder2, IStorageItemPropertiesWithProvider {
    attributes: FileAttributes = null;
    dateCreated: Date = null;
    name: string = null;
    path: string = null;
    displayName: string = null;
    displayType: string = null;
    folderRelativeId: string = null;
    properties: StorageItemContentProperties = null;
    provider: StorageProvider = null;

    private _exists: boolean;
    constructor(path: string, exists: boolean = true) {
        this.name = _path.basename(path);
        this.path = path;
        this._exists = exists;
    }

    private async _ensureInitialised(): Promise<StorageFolder> {
        if (this._exists)
            return this;

        if (!fs.existsSync(this.path)) {
            await fsp.mkdir(this.path);
        }

        this._exists = true;
    }

    static getFolderFromPathSync(path: string, allowCreate: boolean): StorageFolder {
        if (!fs.existsSync(path) && allowCreate) {
            fs.mkdirSync(path, { recursive: true });
            console.log("creating folder:" + path);
        }

        return new StorageFolder(path, allowCreate || fs.existsSync(path));
    }

    static getFolderFromPathAsync(path: string): IAsyncOperation<StorageFolder> {
        path = `${path}`;

        return AsyncOperation.from(async () => {
            if (!fs.existsSync(path) || !fs.lstatSync(path).isDirectory())
                throw new Error("Folder doesn't exist!");

            return new StorageFolder(path, true);
        });
    }

    getFileAsync(name: string): IAsyncOperation<StorageFile> {
        name = `${name}`;

        return AsyncOperation.from(async () => {
            let filePath = _path.join(this.path, name);
            if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile())
                throw new Error("File doesn't exist!");

            return new StorageFile(name, this);
        });
    }

    getFolderAsync(name: string): IAsyncOperation<StorageFolder> {
        name = `${name}`;

        return AsyncOperation.from(async () => {
            let filePath = _path.join(this.path, name);
            if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isDirectory())
                throw new Error("Folder doesn't exist!");

            return new StorageFolder(filePath, true);
        });
    }

    getItemAsync(name: string): IAsyncOperation<IStorageItem> {
        name = `${name}`;

        return AsyncOperation.from(async () => {
            let filePath = _path.join(this.path, name);
            if (!fs.existsSync(filePath))
                throw new Error("Folder doesn't exist!");

            let stat = fs.lstatSync(filePath);
            if (stat.isFile())
                return new StorageFile(name, this);
            else if (stat.isDirectory())
                return new StorageFolder(filePath, true);
            else
                throw new Error("Unsupported filetype!");
        });
    }

    tryGetItemAsync(name: string): IAsyncOperation<IStorageItem> {
        name = `${name}`;

        return AsyncOperation.from(async () => {
            let filePath = _path.join(this.path, name);
            if (!fs.existsSync(filePath))
                return null;

            let stat = fs.lstatSync(filePath);
            if (stat.isFile())
                return new StorageFile(name, this);
            else if (stat.isDirectory())
                return new StorageFolder(filePath, true);
            else
                return null;
        });
    }

    createFileAsync(desiredName: string, options: CreationCollisionOption): IAsyncOperation<StorageFile> {
        return AsyncOperation.from(async () => {
            desiredName = `${desiredName}`;
            await this._ensureInitialised();

            let filePath = _path.join(this.path, desiredName);
            if (fs.existsSync(filePath)) {
                if (options == CreationCollisionOption.openIfExists) {
                    return await AsyncOperation.to(this.getFileAsync(desiredName));
                }
                else if (options == CreationCollisionOption.failIfExists) {
                    throw new Error("File exists!");
                }
                else if (options == CreationCollisionOption.generateUniqueName) {
                    let ext = _path.extname(desiredName);
                    desiredName = desiredName.split('.').slice(0, -1).join('.') + "-" + randstr(6) + "." + ext;
                    console.log("unique name:" + desiredName);
                }
                else if (options == CreationCollisionOption.replaceExisting) {
                    let file = await AsyncOperation.to(this.getFileAsync(desiredName));
                    await AsyncOperation.to(file.deleteAsync(StorageDeleteOption.default));
                    return await AsyncOperation.to(this.createFileAsync(desiredName, options));
                }
            }

            return new StorageFile(desiredName, this);
        });
    }

    createFolderAsync(desiredName: string, options: CreationCollisionOption): IAsyncOperation<StorageFolder> {
        return AsyncOperation.from(async () => {
            desiredName = `${desiredName}`;
            await this._ensureInitialised();

            let filePath = _path.join(this.path, desiredName);
            if (fs.existsSync(filePath)) {
                if (options == CreationCollisionOption.openIfExists) {
                    return await AsyncOperation.to(this.getFolderAsync(desiredName));
                }
                else if (options == CreationCollisionOption.failIfExists) {
                    throw new Error("Folder exists!");
                }
                else if (options == CreationCollisionOption.generateUniqueName) {
                    let ext = _path.extname(desiredName);
                    desiredName = desiredName.split('.').slice(0, -1).join('.') + "-" + randstr(6) + "." + ext;
                    console.log("unique name:" + desiredName);
                }
                else if (options == CreationCollisionOption.replaceExisting) {
                    let folder = await AsyncOperation.to(this.getFolderAsync(desiredName));
                    await AsyncOperation.to(folder.deleteAsync(StorageDeleteOption.default));
                    return await AsyncOperation.to(this.createFolderAsync(desiredName, options));
                }
            }

            return new StorageFolder(filePath, false);
        });
    }

    getFilesAsync(query?: CommonFileQuery, startIndex?: number, maxItemsToRetrieve?: number): IAsyncOperation<IVectorView<StorageFile>> {
        query = query ?? CommonFileQuery.defaultQuery;
        startIndex = startIndex ?? 0;
        maxItemsToRetrieve = maxItemsToRetrieve ?? -1;

        return AsyncOperation.from(async () => {
            await this._ensureInitialised();

            let vector = new Vector<StorageFile>();
            let paths = await fsp.readdir(this.path);
            for (let path of paths) {
                path = _path.join(this.path, path);
                if ((await fsp.lstat(path)).isFile()) {
                    vector.append(await AsyncOperation.to(StorageFile.getFileFromPathAsync(path)));
                }
            }

            return vector;
        });
    }

    getFoldersAsync(query?: CommonFolderQuery, startIndex?: number, maxItemsToRetrieve?: number): IAsyncOperation<IVectorView<StorageFolder>> {
        query = query ?? CommonFolderQuery.defaultQuery;
        startIndex = startIndex ?? 0;
        maxItemsToRetrieve = maxItemsToRetrieve ?? -1;

        return AsyncOperation.from(async () => {
            await this._ensureInitialised();

            let vector = new Vector<StorageFolder>();
            let paths = await fsp.readdir(this.path);
            for (let path of paths) {
                path = _path.join(this.path, path);
                if ((await fsp.lstat(path)).isDirectory()) {
                    vector.append(await AsyncOperation.to(StorageFolder.getFolderFromPathAsync(path)));
                }
            }

            return vector;
        });
    }

    createFileAsyncOverloadDefaultOptions(desiredName: string): IAsyncOperation<StorageFile> {
        throw new Error('StorageFolder#createFileAsyncOverloadDefaultOptions not implemented')
    }
    createFolderAsyncOverloadDefaultOptions(desiredName: string): IAsyncOperation<StorageFolder> {
        throw new Error('StorageFolder#createFolderAsyncOverloadDefaultOptions not implemented')
    }
    getFilesAsyncOverloadDefaultOptionsStartAndCount(): IAsyncOperation<IVectorView<StorageFile>> {
        throw new Error('StorageFolder#getFilesAsyncOverloadDefaultOptionsStartAndCount not implemented')
    }
    getFoldersAsyncOverloadDefaultOptionsStartAndCount(): IAsyncOperation<IVectorView<StorageFolder>> {
        throw new Error('StorageFolder#getFoldersAsyncOverloadDefaultOptionsStartAndCount not implemented')
    }
    getItemsAsyncOverloadDefaultStartAndCount(): IAsyncOperation<IVectorView<IStorageItem>> {
        throw new Error('StorageFolder#getItemsAsyncOverloadDefaultStartAndCount not implemented')
    }
    renameAsyncOverloadDefaultOptions(desiredName: string): IAsyncAction {
        throw new Error('StorageFolder#renameAsyncOverloadDefaultOptions not implemented')
    }
    renameAsync(desiredName: string, option: NameCollisionOption): IAsyncAction {
        throw new Error('StorageFolder#renameAsync not implemented')
    }
    deleteAsyncOverloadDefaultOptions(): IAsyncAction {
        throw new Error('StorageFolder#deleteAsyncOverloadDefaultOptions not implemented')
    }
    deleteAsync(option: StorageDeleteOption): IAsyncAction {
        throw new Error('StorageFolder#deleteAsync not implemented')
    }
    getBasicPropertiesAsync(): IAsyncOperation<BasicProperties> {
        throw new Error('StorageFolder#getBasicPropertiesAsync not implemented')
    }
    isOfType(type: StorageItemTypes): boolean {
        throw new Error('StorageFolder#isOfType not implemented')
    }
    getIndexedStateAsync(): IAsyncOperation<IndexedState> {
        throw new Error('StorageFolder#getIndexedStateAsync not implemented')
    }
    createFileQueryOverloadDefault(): StorageFileQueryResult {
        throw new Error('StorageFolder#createFileQueryOverloadDefault not implemented')
    }
    createFileQuery(query: CommonFileQuery): StorageFileQueryResult {
        throw new Error('StorageFolder#createFileQuery not implemented')
    }
    createFileQueryWithOptions(queryOptions: QueryOptions): StorageFileQueryResult {
        throw new Error('StorageFolder#createFileQueryWithOptions not implemented')
    }
    createFolderQueryOverloadDefault(): StorageFolderQueryResult {
        throw new Error('StorageFolder#createFolderQueryOverloadDefault not implemented')
    }
    createFolderQuery(query: CommonFolderQuery): StorageFolderQueryResult {
        throw new Error('StorageFolder#createFolderQuery not implemented')
    }
    createFolderQueryWithOptions(queryOptions: QueryOptions): StorageFolderQueryResult {
        throw new Error('StorageFolder#createFolderQueryWithOptions not implemented')
    }
    createItemQuery(): StorageItemQueryResult {
        throw new Error('StorageFolder#createItemQuery not implemented')
    }
    createItemQueryWithOptions(queryOptions: QueryOptions): StorageItemQueryResult {
        throw new Error('StorageFolder#createItemQueryWithOptions not implemented')
    }
    getFilesAsyncOverloadDefaultStartAndCount(query: CommonFileQuery): IAsyncOperation<IVectorView<StorageFile>> {
        throw new Error('StorageFolder#getFilesAsyncOverloadDefaultStartAndCount not implemented')
    }
    getFoldersAsyncOverloadDefaultStartAndCount(query: CommonFolderQuery): IAsyncOperation<IVectorView<StorageFolder>> {
        throw new Error('StorageFolder#getFoldersAsyncOverloadDefaultStartAndCount not implemented')
    }
    getItemsAsync(startIndex: number, maxItemsToRetrieve: number): IAsyncOperation<IVectorView<IStorageItem>> {
        throw new Error('StorageFolder#getItemsAsync not implemented')
    }
    areQueryOptionsSupported(queryOptions: QueryOptions): boolean {
        throw new Error('StorageFolder#areQueryOptionsSupported not implemented')
    }
    isCommonFolderQuerySupported(query: CommonFolderQuery): boolean {
        throw new Error('StorageFolder#isCommonFolderQuerySupported not implemented')
    }
    isCommonFileQuerySupported(query: CommonFileQuery): boolean {
        throw new Error('StorageFolder#isCommonFileQuerySupported not implemented')
    }
    getThumbnailAsyncOverloadDefaultSizeDefaultOptions(mode: ThumbnailMode): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getThumbnailAsyncOverloadDefaultSizeDefaultOptions not implemented')
    }
    getThumbnailAsyncOverloadDefaultOptions(mode: ThumbnailMode, requestedSize: number): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getThumbnailAsyncOverloadDefaultOptions not implemented')
    }
    getThumbnailAsync(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getThumbnailAsync not implemented')
    }
    getScaledImageAsThumbnailAsyncOverloadDefaultSizeDefaultOptions(mode: ThumbnailMode): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getScaledImageAsThumbnailAsyncOverloadDefaultSizeDefaultOptions not implemented')
    }
    getScaledImageAsThumbnailAsyncOverloadDefaultOptions(mode: ThumbnailMode, requestedSize: number): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getScaledImageAsThumbnailAsyncOverloadDefaultOptions not implemented')
    }
    getScaledImageAsThumbnailAsync(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFolder#getScaledImageAsThumbnailAsync not implemented')
    }
    getParentAsync(): IAsyncOperation<StorageFolder> {
        throw new Error('StorageFolder#getParentAsync not implemented')
    }
    isEqual(item: IStorageItem): boolean {
        throw new Error('StorageFolder#isEqual not implemented')
    }
}
