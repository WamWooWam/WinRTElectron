// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:37 2021
// </auto-generated>
// --------------------------------------------------

import { ImageResizeOption } from "./ImageResizeOption";
import { QueueEmptyHandler } from "./QueueEmptyHandler";
import { IVectorView } from "winrt/Windows/Foundation/Collections/IVectorView`1";
import { StorageFile } from "winrt/Windows/Storage/StorageFile";

export interface IAttachmentManager {
    enableTranscode: boolean;
    imageSize: ImageResizeOption;
    stripImageMetadata: boolean;
    addFiles(fileItems: IVectorView<StorageFile>): void;
    removeFile(attachmentId: string): void;
    isAttaching(attachmentId: string): boolean;
    isTranscoding(attachmentId: string): boolean;
    discard(): void;
    stopAll(): void;
    finalizeForSend(): void;
    dispose(): void;
    onattachqueueempty: QueueEmptyHandler;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
