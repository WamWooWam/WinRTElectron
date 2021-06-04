
import { DateTime } from "../Foundation/DateTime";
import { AsyncAction, IAsyncAction } from "../Foundation/IAsyncAction";
import { AsyncOperation, IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { Uri } from "../Foundation/Uri";
import { FileAccessMode } from "./FileAccessMode";
import { FileAttributes } from "./FileAttributes";
import { BasicProperties } from "./FileProperties/BasicProperties";
import { StorageItemContentProperties } from "./FileProperties/StorageItemContentProperties";
import { StorageItemThumbnail } from "./FileProperties/StorageItemThumbnail";
import { ThumbnailMode } from "./FileProperties/ThumbnailMode";
import { ThumbnailOptions } from "./FileProperties/ThumbnailOptions";
import { IStorageFile } from "./IStorageFile";
import { IStorageFilePropertiesWithAvailability } from "./IStorageFilePropertiesWithAvailability";
import { IStorageFolder } from "./IStorageFolder";
import { IStorageItem } from "./IStorageItem";
import { IStorageItem2 } from "./IStorageItem2";
import { IStorageItemProperties } from "./IStorageItemProperties";
import { IStorageItemProperties2 } from "./IStorageItemProperties2";
import { IStorageItemPropertiesWithProvider } from "./IStorageItemPropertiesWithProvider";
import { NameCollisionOption } from "./NameCollisionOption";
import { StorageDeleteOption } from "./StorageDeleteOption";
import { StorageFolder } from "./StorageFolder";
import { StorageItemTypes } from "./StorageItemTypes";
import { StorageProvider } from "./StorageProvider";
import { StorageStreamTransaction } from "./StorageStreamTransaction";
import { StreamedFileDataRequestedHandler } from "./StreamedFileDataRequestedHandler";
import { IInputStream } from "./Streams/IInputStream";
import { IInputStreamReference } from "./Streams/IInputStreamReference";
import { IRandomAccessStream } from "./Streams/IRandomAccessStream";
import { IRandomAccessStreamReference } from "./Streams/IRandomAccessStreamReference";
import { IRandomAccessStreamWithContentType } from "./Streams/IRandomAccessStreamWithContentType";

import * as fs from "fs";
import * as _path from "path";
import * as mime from "mime-types"
const fsp = fs.promises;

// @GenerateShim('Windows.Storage.StorageFile')
export class StorageFile implements IStorageFile, IInputStreamReference, IRandomAccessStreamReference, IStorageItem, IStorageItemProperties, IStorageItemProperties2, IStorageItem2, IStorageItemPropertiesWithProvider, IStorageFilePropertiesWithAvailability {
    attributes: FileAttributes = null;
    dateCreated: Date = null;
    name: string = null;
    path: string = null;
    provider: StorageProvider = null;
    isAvailable: boolean = true;
    displayType: string = null;
    folderRelativeId: string = null;
    properties: StorageItemContentProperties = new StorageItemContentProperties(this);
    #parent: StorageFolder;

    constructor(name: string, parent: StorageFolder) {
        if (parent != null) {
            this.path = _path.join(parent.path, name);
            this.name = name;
            this.#parent = parent;
        }
        else {
            this.name = _path.basename(name);
            this.path = name;
            this.#parent = StorageFolder.getFolderFromPathSync(_path.dirname(name), false);
        }
    }

    get fileType(): string {
        return _path.extname(this.name);
    }

    get displayName(): string {
        return _path.basename(this.name, this.fileType);
    }

    get contentType(): string {
        return mime.contentType(this.fileType) || "application/octet-stream"
    }

    deleteAsync(option: StorageDeleteOption): IAsyncAction {
        return AsyncAction.from(async () => {
            await fsp.unlink(this.path);
        });
    }

    openAsync(accessMode: FileAccessMode): IAsyncOperation<IRandomAccessStream> {
        throw new Error('StorageFile#openAsync not implemented')
    }
    openTransactedWriteAsync(): IAsyncOperation<StorageStreamTransaction> {
        throw new Error('StorageFile#openTransactedWriteAsync not implemented')
    }
    copyOverloadDefaultNameAndOptions(destinationFolder: IStorageFolder): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#copyOverloadDefaultNameAndOptions not implemented')
    }
    copyOverloadDefaultOptions(destinationFolder: IStorageFolder, desiredNewName: string): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#copyOverloadDefaultOptions not implemented')
    }
    copyOverload(destinationFolder: IStorageFolder, desiredNewName: string, option: NameCollisionOption): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#copyOverload not implemented')
    }
    copyAndReplaceAsync(fileToReplace: IStorageFile): IAsyncAction {
        throw new Error('StorageFile#copyAndReplaceAsync not implemented')
    }
    moveOverloadDefaultNameAndOptions(destinationFolder: IStorageFolder): IAsyncAction {
        throw new Error('StorageFile#moveOverloadDefaultNameAndOptions not implemented')
    }
    moveOverloadDefaultOptions(destinationFolder: IStorageFolder, desiredNewName: string): IAsyncAction {
        throw new Error('StorageFile#moveOverloadDefaultOptions not implemented')
    }
    moveOverload(destinationFolder: IStorageFolder, desiredNewName: string, option: NameCollisionOption): IAsyncAction {
        throw new Error('StorageFile#moveOverload not implemented')
    }
    moveAndReplaceAsync(fileToReplace: IStorageFile): IAsyncAction {
        throw new Error('StorageFile#moveAndReplaceAsync not implemented')
    }
    renameAsyncOverloadDefaultOptions(desiredName: string): IAsyncAction {
        throw new Error('StorageFile#renameAsyncOverloadDefaultOptions not implemented')
    }
    renameAsync(desiredName: string, option: NameCollisionOption): IAsyncAction {
        throw new Error('StorageFile#renameAsync not implemented')
    }
    deleteAsyncOverloadDefaultOptions(): IAsyncAction {
        throw new Error('StorageFile#deleteAsyncOverloadDefaultOptions not implemented')
    }
    getBasicPropertiesAsync(): IAsyncOperation<BasicProperties> {
        throw new Error('StorageFile#getBasicPropertiesAsync not implemented')
    }
    isOfType(type: StorageItemTypes): boolean {
        throw new Error('StorageFile#isOfType not implemented')
    }
    openReadAsync(): IAsyncOperation<IRandomAccessStreamWithContentType> {
        throw new Error('StorageFile#openReadAsync not implemented')
    }
    openSequentialReadAsync(): IAsyncOperation<IInputStream> {
        throw new Error('StorageFile#openSequentialReadAsync not implemented')
    }
    getThumbnailAsyncOverloadDefaultSizeDefaultOptions(mode: ThumbnailMode): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getThumbnailAsyncOverloadDefaultSizeDefaultOptions not implemented')
    }
    getThumbnailAsyncOverloadDefaultOptions(mode: ThumbnailMode, requestedSize: number): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getThumbnailAsyncOverloadDefaultOptions not implemented')
    }
    getThumbnailAsync(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getThumbnailAsync not implemented')
    }
    getScaledImageAsThumbnailAsyncOverloadDefaultSizeDefaultOptions(mode: ThumbnailMode): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getScaledImageAsThumbnailAsyncOverloadDefaultSizeDefaultOptions not implemented')
    }
    getScaledImageAsThumbnailAsyncOverloadDefaultOptions(mode: ThumbnailMode, requestedSize: number): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getScaledImageAsThumbnailAsyncOverloadDefaultOptions not implemented')
    }
    getScaledImageAsThumbnailAsync(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('StorageFile#getScaledImageAsThumbnailAsync not implemented')
    }
    getParentAsync(): IAsyncOperation<StorageFolder> {
        throw new Error('StorageFile#getParentAsync not implemented')
    }
    isEqual(item: IStorageItem): boolean {
        throw new Error('StorageFile#isEqual not implemented')
    }
    static getFileFromPath(path: string): StorageFile {
        return new StorageFile(path, null);
    }
    static getFileFromPathAsync(path: string): IAsyncOperation<StorageFile> {
        return AsyncOperation.from(async () => {
            return new StorageFile(path, null);
        })
    }
    static getFileFromApplicationUriAsync(uri: Uri): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#getFileFromApplicationUriAsync not implemented')
    }
    static createStreamedFileAsync(displayNameWithExtension: string, dataRequested: StreamedFileDataRequestedHandler, thumbnail: IRandomAccessStreamReference): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#createStreamedFileAsync not implemented')
    }
    static replaceWithStreamedFileAsync(fileToReplace: IStorageFile, dataRequested: StreamedFileDataRequestedHandler, thumbnail: IRandomAccessStreamReference): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#replaceWithStreamedFileAsync not implemented')
    }
    static createStreamedFileFromUriAsync(displayNameWithExtension: string, uri: Uri, thumbnail: IRandomAccessStreamReference): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#createStreamedFileFromUriAsync not implemented')
    }
    static replaceWithStreamedFileFromUriAsync(fileToReplace: IStorageFile, uri: Uri, thumbnail: IRandomAccessStreamReference): IAsyncOperation<StorageFile> {
        throw new Error('StorageFile#replaceWithStreamedFileFromUriAsync not implemented')
    }
}
