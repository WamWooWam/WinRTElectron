// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:11 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperationWithProgress } from "../../Foundation/IAsyncOperationWithProgress`2";
import { IClosable } from "../../Foundation/IClosable";
import { IBuffer } from "../../Storage/Streams/IBuffer";
import { IInputStream } from "../../Storage/Streams/IInputStream";
import { IOutputStream } from "../../Storage/Streams/IOutputStream";
import { HttpContentHeaderCollection } from "./Headers/HttpContentHeaderCollection";

export interface IHttpContent extends IClosable {
    headers: HttpContentHeaderCollection;
    bufferAllAsync(): IAsyncOperationWithProgress<number, number>;
    readAsBufferAsync(): IAsyncOperationWithProgress<IBuffer, number>;
    readAsInputStreamAsync(): IAsyncOperationWithProgress<IInputStream, number>;
    readAsStringAsync(): IAsyncOperationWithProgress<string, number>;
    tryComputeLength(): { succeeded: boolean, length: number };
    writeToStreamAsync(outputStream: IOutputStream): IAsyncOperationWithProgress<number, number>;
}
