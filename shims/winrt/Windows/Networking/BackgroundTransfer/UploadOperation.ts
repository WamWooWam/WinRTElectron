// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperationWithProgress } from "../../Foundation/IAsyncOperationWithProgress`2";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Uri } from "../../Foundation/Uri";
import { BackgroundTransferCostPolicy } from "./BackgroundTransferCostPolicy";
import { BackgroundTransferGroup } from "./BackgroundTransferGroup";
import { BackgroundTransferPriority } from "./BackgroundTransferPriority";
import { BackgroundUploadProgress } from "./BackgroundUploadProgress";
import { IBackgroundTransferOperation } from "./IBackgroundTransferOperation";
import { IBackgroundTransferOperationPriority } from "./IBackgroundTransferOperationPriority";
import { ResponseInformation } from "./ResponseInformation";
import { IStorageFile } from "../../Storage/IStorageFile";
import { IInputStream } from "../../Storage/Streams/IInputStream";

@GenerateShim('Windows.Networking.BackgroundTransfer.UploadOperation')
export class UploadOperation implements IBackgroundTransferOperation, IBackgroundTransferOperationPriority { 
    progress: BackgroundUploadProgress = null;
    sourceFile: IStorageFile = null;
    costPolicy: BackgroundTransferCostPolicy = null;
    group: string = null;
    guid: string = null;
    method: string = null;
    requestedUri: Uri = null;
    priority: BackgroundTransferPriority = null;
    transferGroup: BackgroundTransferGroup = null;
    startAsync(): IAsyncOperationWithProgress<UploadOperation, UploadOperation> {
        throw new Error('UploadOperation#startAsync not implemented')
    }
    attachAsync(): IAsyncOperationWithProgress<UploadOperation, UploadOperation> {
        throw new Error('UploadOperation#attachAsync not implemented')
    }
    getResultStreamAt(position: number): IInputStream {
        throw new Error('UploadOperation#getResultStreamAt not implemented')
    }
    getResponseInformation(): ResponseInformation {
        throw new Error('UploadOperation#getResponseInformation not implemented')
    }
}
