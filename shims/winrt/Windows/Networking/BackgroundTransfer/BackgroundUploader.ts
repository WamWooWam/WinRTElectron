// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { BackgroundTransferContentPart } from "./BackgroundTransferContentPart";
import { BackgroundTransferCostPolicy } from "./BackgroundTransferCostPolicy";
import { BackgroundTransferGroup } from "./BackgroundTransferGroup";
import { IBackgroundTransferBase } from "./IBackgroundTransferBase";
import { UnconstrainedTransferRequestResult } from "./UnconstrainedTransferRequestResult";
import { UploadOperation } from "./UploadOperation";
import { PasswordCredential } from "../../Security/Credentials/PasswordCredential";
import { IStorageFile } from "../../Storage/IStorageFile";
import { IInputStream } from "../../Storage/Streams/IInputStream";
import { TileNotification } from "../../UI/Notifications/TileNotification";
import { ToastNotification } from "../../UI/Notifications/ToastNotification";

@GenerateShim('Windows.Networking.BackgroundTransfer.BackgroundUploader')
export class BackgroundUploader implements IBackgroundTransferBase { 
    transferGroup: BackgroundTransferGroup = null;
    successToastNotification: ToastNotification = null;
    successTileNotification: TileNotification = null;
    failureToastNotification: ToastNotification = null;
    failureTileNotification: TileNotification = null;
    serverCredential: PasswordCredential = null;
    proxyCredential: PasswordCredential = null;
    method: string = null;
    group: string = null;
    costPolicy: BackgroundTransferCostPolicy = null;
    createUpload(uri: Uri, sourceFile: IStorageFile): UploadOperation {
        throw new Error('BackgroundUploader#createUpload not implemented')
    }
    createUploadFromStreamAsync(uri: Uri, sourceStream: IInputStream): IAsyncOperation<UploadOperation> {
        throw new Error('BackgroundUploader#createUploadFromStreamAsync not implemented')
    }
    createUploadWithFormDataAndAutoBoundaryAsync(uri: Uri, parts: IIterable<BackgroundTransferContentPart>): IAsyncOperation<UploadOperation> {
        throw new Error('BackgroundUploader#createUploadWithFormDataAndAutoBoundaryAsync not implemented')
    }
    createUploadWithSubTypeAsync(uri: Uri, parts: IIterable<BackgroundTransferContentPart>, subType: string): IAsyncOperation<UploadOperation> {
        throw new Error('BackgroundUploader#createUploadWithSubTypeAsync not implemented')
    }
    createUploadWithSubTypeAndBoundaryAsync(uri: Uri, parts: IIterable<BackgroundTransferContentPart>, subType: string, boundary: string): IAsyncOperation<UploadOperation> {
        throw new Error('BackgroundUploader#createUploadWithSubTypeAndBoundaryAsync not implemented')
    }
    setRequestHeader(headerName: string, headerValue: string): void {
        console.warn('BackgroundUploader#setRequestHeader not implemented')
    }
    static getCurrentUploadsForTransferGroupAsync(group: BackgroundTransferGroup): IAsyncOperation<IVectorView<UploadOperation>> {
        throw new Error('BackgroundUploader#getCurrentUploadsForTransferGroupAsync not implemented')
    }
    static requestUnconstrainedUploadsAsync(operations: IIterable<UploadOperation>): IAsyncOperation<UnconstrainedTransferRequestResult> {
        throw new Error('BackgroundUploader#requestUnconstrainedUploadsAsync not implemented')
    }
    static getCurrentUploadsAsync(): IAsyncOperation<IVectorView<UploadOperation>> {
        throw new Error('BackgroundUploader#getCurrentUploadsAsync not implemented')
    }
    static getCurrentUploadsForGroupAsync(group: string): IAsyncOperation<IVectorView<UploadOperation>> {
        throw new Error('BackgroundUploader#getCurrentUploadsForGroupAsync not implemented')
    }
}
