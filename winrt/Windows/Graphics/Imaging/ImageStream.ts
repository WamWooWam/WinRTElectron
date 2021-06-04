// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperationWithProgress } from "../../Foundation/IAsyncOperationWithProgress`2";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { IClosable } from "../../Foundation/IClosable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IBuffer } from "../../Storage/Streams/IBuffer";
import { IContentTypeProvider } from "../../Storage/Streams/IContentTypeProvider";
import { IInputStream } from "../../Storage/Streams/IInputStream";
import { IOutputStream } from "../../Storage/Streams/IOutputStream";
import { IRandomAccessStream } from "../../Storage/Streams/IRandomAccessStream";
import { IRandomAccessStreamWithContentType } from "../../Storage/Streams/IRandomAccessStreamWithContentType";
import { InputStreamOptions } from "../../Storage/Streams/InputStreamOptions";

@GenerateShim('Windows.Graphics.Imaging.ImageStream')
export class ImageStream implements IRandomAccessStreamWithContentType, IContentTypeProvider, IRandomAccessStream, IOutputStream, IClosable, IInputStream { 
    size: number = null;
    canRead: boolean = null;
    canWrite: boolean = null;
    position: number = null;
    contentType: string = null;
    getInputStreamAt(position: number): IInputStream {
        throw new Error('ImageStream#getInputStreamAt not implemented')
    }
    getOutputStreamAt(position: number): IOutputStream {
        throw new Error('ImageStream#getOutputStreamAt not implemented')
    }
    seek(position: number): void {
        console.warn('ImageStream#seek not implemented')
    }
    cloneStream(): IRandomAccessStream {
        throw new Error('ImageStream#cloneStream not implemented')
    }
    close(): void {
        console.warn('ImageStream#close not implemented')
    }
    readAsync(buffer: IBuffer, count: number, options: InputStreamOptions): IAsyncOperationWithProgress<IBuffer, number> {
        throw new Error('ImageStream#readAsync not implemented')
    }
    writeAsync(buffer: IBuffer): IAsyncOperationWithProgress<number, number> {
        throw new Error('ImageStream#writeAsync not implemented')
    }
    flushAsync(): IAsyncOperation<boolean> {
        throw new Error('ImageStream#flushAsync not implemented')
    }
}