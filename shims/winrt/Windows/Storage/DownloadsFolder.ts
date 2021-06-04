// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { CreationCollisionOption } from "./CreationCollisionOption";
import { StorageFile } from "./StorageFile";
import { StorageFolder } from "./StorageFolder";

@GenerateShim('Windows.Storage.DownloadsFolder')
export class DownloadsFolder { 
    static createFileAsync(desiredName: string): IAsyncOperation<StorageFile> {
        throw new Error('DownloadsFolder#createFileAsync not implemented')
    }
    static createFolderAsync(desiredName: string): IAsyncOperation<StorageFolder> {
        throw new Error('DownloadsFolder#createFolderAsync not implemented')
    }
    static createFileWithCollisionOptionAsync(desiredName: string, option: CreationCollisionOption): IAsyncOperation<StorageFile> {
        throw new Error('DownloadsFolder#createFileWithCollisionOptionAsync not implemented')
    }
    static createFolderWithCollisionOptionAsync(desiredName: string, option: CreationCollisionOption): IAsyncOperation<StorageFolder> {
        throw new Error('DownloadsFolder#createFolderWithCollisionOptionAsync not implemented')
    }
}