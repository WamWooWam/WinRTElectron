// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../Foundation/IAsyncAction";
import { IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { FileAccessMode } from "./FileAccessMode";
import { IStorageFolder } from "./IStorageFolder";
import { IStorageItem } from "./IStorageItem";
import { NameCollisionOption } from "./NameCollisionOption";
import { StorageFile } from "./StorageFile";
import { StorageStreamTransaction } from "./StorageStreamTransaction";
import { IInputStreamReference } from "./Streams/IInputStreamReference";
import { IRandomAccessStream } from "./Streams/IRandomAccessStream";
import { IRandomAccessStreamReference } from "./Streams/IRandomAccessStreamReference";

export interface IStorageFile extends IStorageItem, IRandomAccessStreamReference, IInputStreamReference {
    contentType: string;
    fileType: string;
    openAsync(accessMode: FileAccessMode): IAsyncOperation<IRandomAccessStream>;
    openTransactedWriteAsync(): IAsyncOperation<StorageStreamTransaction>;
    copyOverloadDefaultNameAndOptions(destinationFolder: IStorageFolder): IAsyncOperation<StorageFile>;
    copyOverloadDefaultOptions(destinationFolder: IStorageFolder, desiredNewName: string): IAsyncOperation<StorageFile>;
    copyOverload(destinationFolder: IStorageFolder, desiredNewName: string, option: NameCollisionOption): IAsyncOperation<StorageFile>;
    copyAndReplaceAsync(fileToReplace: IStorageFile): IAsyncAction;
    moveOverloadDefaultNameAndOptions(destinationFolder: IStorageFolder): IAsyncAction;
    moveOverloadDefaultOptions(destinationFolder: IStorageFolder, desiredNewName: string): IAsyncAction;
    moveOverload(destinationFolder: IStorageFolder, desiredNewName: string, option: NameCollisionOption): IAsyncAction;
    moveAndReplaceAsync(fileToReplace: IStorageFile): IAsyncAction;
}
