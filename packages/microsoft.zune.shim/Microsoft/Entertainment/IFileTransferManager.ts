// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { IFileDownload } from "./IFileDownload";
import { IFileTransferQuery } from "./IFileTransferQuery";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { EventHandler } from "winrt/Windows/Foundation/EventHandler`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";

export interface IFileTransferManager {
    getFileDownloadsAsync(): IAsyncOperation<IVectorView<IFileDownload>>;
    getFileDownloadByIdAsync(taskId: number): IAsyncOperation<IFileDownload>;
    getFileDownloadsByQueryAsync(query: IFileTransferQuery): IAsyncOperation<IVectorView<IFileDownload>>;
    cancelAllDownloadsAsync(): IAsyncAction;
    scheduleProgressCheck(): void;
    initializeEvents(): void;
    ondownloadschanged: EventHandler<IVectorView<IFileDownload>>;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}