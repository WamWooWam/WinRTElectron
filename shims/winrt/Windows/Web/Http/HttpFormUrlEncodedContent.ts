// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:10 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IKeyValuePair } from "../../Foundation/Collections/IKeyValuePair`2";
import { IAsyncOperationWithProgress } from "../../Foundation/IAsyncOperationWithProgress`2";
import { IClosable } from "../../Foundation/IClosable";
import { IStringable } from "../../Foundation/IStringable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IBuffer } from "../../Storage/Streams/IBuffer";
import { IInputStream } from "../../Storage/Streams/IInputStream";
import { IOutputStream } from "../../Storage/Streams/IOutputStream";
import { HttpContentHeaderCollection } from "./Headers/HttpContentHeaderCollection";
import { IHttpContent } from "./IHttpContent";

@GenerateShim('Windows.Web.Http.HttpFormUrlEncodedContent')
export class HttpFormUrlEncodedContent implements IHttpContent, IClosable, IStringable { 
    headers: HttpContentHeaderCollection = null;
    constructor(content: IIterable<IKeyValuePair<string, string>>) {
        console.warn('HttpFormUrlEncodedContent.ctor not implemented')
    }
    bufferAllAsync(): IAsyncOperationWithProgress<number, number> {
        throw new Error('HttpFormUrlEncodedContent#bufferAllAsync not implemented')
    }
    readAsBufferAsync(): IAsyncOperationWithProgress<IBuffer, number> {
        throw new Error('HttpFormUrlEncodedContent#readAsBufferAsync not implemented')
    }
    readAsInputStreamAsync(): IAsyncOperationWithProgress<IInputStream, number> {
        throw new Error('HttpFormUrlEncodedContent#readAsInputStreamAsync not implemented')
    }
    readAsStringAsync(): IAsyncOperationWithProgress<string, number> {
        throw new Error('HttpFormUrlEncodedContent#readAsStringAsync not implemented')
    }
    tryComputeLength(): { succeeded: boolean, length: number } {
        throw new Error('HttpFormUrlEncodedContent#tryComputeLength not implemented')
    }
    writeToStreamAsync(outputStream: IOutputStream): IAsyncOperationWithProgress<number, number> {
        throw new Error('HttpFormUrlEncodedContent#writeToStreamAsync not implemented')
    }
    close(): void {
        console.warn('HttpFormUrlEncodedContent#close not implemented')
    }
    toString(): string {
        throw new Error('HttpFormUrlEncodedContent#toString not implemented')
    }
}