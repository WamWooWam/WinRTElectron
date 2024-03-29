// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { DateTime } from "../../Foundation/DateTime";
import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { IStorageItemInformation } from "./IStorageItemInformation";
import { CreationCollisionOption } from "../CreationCollisionOption";
import { FileAttributes } from "../FileAttributes";
import { BasicProperties } from "../FileProperties/BasicProperties";
import { DocumentProperties } from "../FileProperties/DocumentProperties";
import { ImageProperties } from "../FileProperties/ImageProperties";
import { MusicProperties } from "../FileProperties/MusicProperties";
import { StorageItemContentProperties } from "../FileProperties/StorageItemContentProperties";
import { StorageItemThumbnail } from "../FileProperties/StorageItemThumbnail";
import { ThumbnailMode } from "../FileProperties/ThumbnailMode";
import { ThumbnailOptions } from "../FileProperties/ThumbnailOptions";
import { VideoProperties } from "../FileProperties/VideoProperties";
import { IStorageFolder } from "../IStorageFolder";
import { IStorageFolder2 } from "../IStorageFolder2";
import { IStorageItem } from "../IStorageItem";
import { IStorageItem2 } from "../IStorageItem2";
import { IStorageItemProperties } from "../IStorageItemProperties";
import { IStorageItemPropertiesWithProvider } from "../IStorageItemPropertiesWithProvider";
import { NameCollisionOption } from "../NameCollisionOption";
import { CommonFileQuery } from "../Search/CommonFileQuery";
import { CommonFolderQuery } from "../Search/CommonFolderQuery";
import { IStorageFolderQueryOperations } from "../Search/IStorageFolderQueryOperations";
import { IndexedState } from "../Search/IndexedState";
import { QueryOptions } from "../Search/QueryOptions";
import { StorageFileQueryResult } from "../Search/StorageFileQueryResult";
import { StorageFolderQueryResult } from "../Search/StorageFolderQueryResult";
import { StorageItemQueryResult } from "../Search/StorageItemQueryResult";
import { StorageDeleteOption } from "../StorageDeleteOption";
import { StorageFile } from "../StorageFile";
import { StorageFolder } from "../StorageFolder";
import { StorageItemTypes } from "../StorageItemTypes";
import { StorageProvider } from "../StorageProvider";

@GenerateShim('Windows.Storage.BulkAccess.FolderInformation')
export class FolderInformation implements IStorageItemInformation, IStorageFolder, IStorageItem, IStorageItemProperties, IStorageFolderQueryOperations, IStorageItem2, IStorageFolder2, IStorageItemPropertiesWithProvider { 
    provider: StorageProvider = null;
    basicProperties: BasicProperties = null;
    documentProperties: DocumentProperties = null;
    imageProperties: ImageProperties = null;
    musicProperties: MusicProperties = null;
    thumbnail: StorageItemThumbnail = null;
    videoProperties: VideoProperties = null;
    displayName: string = null;
    displayType: string = null;
    folderRelativeId: string = null;
    properties: StorageItemContentProperties = null;
    attributes: FileAttributes = null;
    dateCreated: Date = null;
    name: string = null;
    path: string = null;
    createFileAsyncOverloadDefaultOptions(desiredName: string): IAsyncOperation<StorageFile> {
        throw new Error('FolderInformation#createFileAsyncOverloadDefaultOptions not implemented')
    }
    createFileAsync(desiredName: string, options: CreationCollisionOption): IAsyncOperation<StorageFile> {
        throw new Error('FolderInformation#createFileAsync not implemented')
    }
    createFolderAsyncOverloadDefaultOptions(desiredName: string): IAsyncOperation<StorageFolder> {
        throw new Error('FolderInformation#createFolderAsyncOverloadDefaultOptions not implemented')
    }
    createFolderAsync(desiredName: string, options: CreationCollisionOption): IAsyncOperation<StorageFolder> {
        throw new Error('FolderInformation#createFolderAsync not implemented')
    }
    getFileAsync(name: string): IAsyncOperation<StorageFile> {
        throw new Error('FolderInformation#getFileAsync not implemented')
    }
    getFolderAsync(name: string): IAsyncOperation<StorageFolder> {
        throw new Error('FolderInformation#getFolderAsync not implemented')
    }
    getItemAsync(name: string): IAsyncOperation<IStorageItem> {
        throw new Error('FolderInformation#getItemAsync not implemented')
    }
    getFilesAsyncOverloadDefaultOptionsStartAndCount(): IAsyncOperation<IVectorView<StorageFile>> {
        throw new Error('FolderInformation#getFilesAsyncOverloadDefaultOptionsStartAndCount not implemented')
    }
    getFoldersAsyncOverloadDefaultOptionsStartAndCount(): IAsyncOperation<IVectorView<StorageFolder>> {
        throw new Error('FolderInformation#getFoldersAsyncOverloadDefaultOptionsStartAndCount not implemented')
    }
    getItemsAsyncOverloadDefaultStartAndCount(): IAsyncOperation<IVectorView<IStorageItem>> {
        throw new Error('FolderInformation#getItemsAsyncOverloadDefaultStartAndCount not implemented')
    }
    renameAsyncOverloadDefaultOptions(desiredName: string): IAsyncAction {
        throw new Error('FolderInformation#renameAsyncOverloadDefaultOptions not implemented')
    }
    renameAsync(desiredName: string, option: NameCollisionOption): IAsyncAction {
        throw new Error('FolderInformation#renameAsync not implemented')
    }
    deleteAsyncOverloadDefaultOptions(): IAsyncAction {
        throw new Error('FolderInformation#deleteAsyncOverloadDefaultOptions not implemented')
    }
    deleteAsync(option: StorageDeleteOption): IAsyncAction {
        throw new Error('FolderInformation#deleteAsync not implemented')
    }
    getBasicPropertiesAsync(): IAsyncOperation<BasicProperties> {
        throw new Error('FolderInformation#getBasicPropertiesAsync not implemented')
    }
    isOfType(type: StorageItemTypes): boolean {
        throw new Error('FolderInformation#isOfType not implemented')
    }
    getThumbnailAsyncOverloadDefaultSizeDefaultOptions(mode: ThumbnailMode): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('FolderInformation#getThumbnailAsyncOverloadDefaultSizeDefaultOptions not implemented')
    }
    getThumbnailAsyncOverloadDefaultOptions(mode: ThumbnailMode, requestedSize: number): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('FolderInformation#getThumbnailAsyncOverloadDefaultOptions not implemented')
    }
    getThumbnailAsync(mode: ThumbnailMode, requestedSize: number, options: ThumbnailOptions): IAsyncOperation<StorageItemThumbnail> {
        throw new Error('FolderInformation#getThumbnailAsync not implemented')
    }
    getIndexedStateAsync(): IAsyncOperation<IndexedState> {
        throw new Error('FolderInformation#getIndexedStateAsync not implemented')
    }
    createFileQueryOverloadDefault(): StorageFileQueryResult {
        throw new Error('FolderInformation#createFileQueryOverloadDefault not implemented')
    }
    createFileQuery(query: CommonFileQuery): StorageFileQueryResult {
        throw new Error('FolderInformation#createFileQuery not implemented')
    }
    createFileQueryWithOptions(queryOptions: QueryOptions): StorageFileQueryResult {
        throw new Error('FolderInformation#createFileQueryWithOptions not implemented')
    }
    createFolderQueryOverloadDefault(): StorageFolderQueryResult {
        throw new Error('FolderInformation#createFolderQueryOverloadDefault not implemented')
    }
    createFolderQuery(query: CommonFolderQuery): StorageFolderQueryResult {
        throw new Error('FolderInformation#createFolderQuery not implemented')
    }
    createFolderQueryWithOptions(queryOptions: QueryOptions): StorageFolderQueryResult {
        throw new Error('FolderInformation#createFolderQueryWithOptions not implemented')
    }
    createItemQuery(): StorageItemQueryResult {
        throw new Error('FolderInformation#createItemQuery not implemented')
    }
    createItemQueryWithOptions(queryOptions: QueryOptions): StorageItemQueryResult {
        throw new Error('FolderInformation#createItemQueryWithOptions not implemented')
    }
    getFilesAsync(query: CommonFileQuery, startIndex: number, maxItemsToRetrieve: number): IAsyncOperation<IVectorView<StorageFile>> {
        throw new Error('FolderInformation#getFilesAsync not implemented')
    }
    getFilesAsyncOverloadDefaultStartAndCount(query: CommonFileQuery): IAsyncOperation<IVectorView<StorageFile>> {
        throw new Error('FolderInformation#getFilesAsyncOverloadDefaultStartAndCount not implemented')
    }
    getFoldersAsync(query: CommonFolderQuery, startIndex: number, maxItemsToRetrieve: number): IAsyncOperation<IVectorView<StorageFolder>> {
        throw new Error('FolderInformation#getFoldersAsync not implemented')
    }
    getFoldersAsyncOverloadDefaultStartAndCount(query: CommonFolderQuery): IAsyncOperation<IVectorView<StorageFolder>> {
        throw new Error('FolderInformation#getFoldersAsyncOverloadDefaultStartAndCount not implemented')
    }
    getItemsAsync(startIndex: number, maxItemsToRetrieve: number): IAsyncOperation<IVectorView<IStorageItem>> {
        throw new Error('FolderInformation#getItemsAsync not implemented')
    }
    areQueryOptionsSupported(queryOptions: QueryOptions): boolean {
        throw new Error('FolderInformation#areQueryOptionsSupported not implemented')
    }
    isCommonFolderQuerySupported(query: CommonFolderQuery): boolean {
        throw new Error('FolderInformation#isCommonFolderQuerySupported not implemented')
    }
    isCommonFileQuerySupported(query: CommonFileQuery): boolean {
        throw new Error('FolderInformation#isCommonFileQuerySupported not implemented')
    }
    getParentAsync(): IAsyncOperation<StorageFolder> {
        throw new Error('FolderInformation#getParentAsync not implemented')
    }
    isEqual(item: IStorageItem): boolean {
        throw new Error('FolderInformation#isEqual not implemented')
    }
    tryGetItemAsync(name: string): IAsyncOperation<IStorageItem> {
        throw new Error('FolderInformation#tryGetItemAsync not implemented')
    }

    #propertiesUpdated: Set<TypedEventHandler<IStorageItemInformation, any>> = new Set();
    @Enumerable(true)
    set onpropertiesupdated(handler: TypedEventHandler<IStorageItemInformation, any>) {
        this.#propertiesUpdated.add(handler);
    }

    #thumbnailUpdated: Set<TypedEventHandler<IStorageItemInformation, any>> = new Set();
    @Enumerable(true)
    set onthumbnailupdated(handler: TypedEventHandler<IStorageItemInformation, any>) {
        this.#thumbnailUpdated.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertiesupdated':
                this.#propertiesUpdated.add(handler);
                break;
            case 'thumbnailupdated':
                this.#thumbnailUpdated.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertiesupdated':
                this.#propertiesUpdated.delete(handler);
                break;
            case 'thumbnailupdated':
                this.#thumbnailUpdated.delete(handler);
                break;
        }
    }
}
