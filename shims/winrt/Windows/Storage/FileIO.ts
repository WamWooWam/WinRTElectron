
import { IIterable } from "../Foundation/Collections/IIterable`1";
import { IVector } from "../Foundation/Collections/IVector`1";
import { IAsyncAction } from "../Foundation/IAsyncAction";
import { IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IStorageFile } from "./IStorageFile";
import { PathIO } from "./PathIO";
import { IBuffer } from "./Streams/IBuffer";
import { UnicodeEncoding } from "./Streams/UnicodeEncoding";

@GenerateShim('Windows.Storage.FileIO')
export class FileIO { 
    static readTextAsync(file: IStorageFile): IAsyncOperation<string> {
        return PathIO.readTextAsync(file.path);
    }
    static readTextWithEncodingAsync(file: IStorageFile, encoding: UnicodeEncoding): IAsyncOperation<string> {
        throw new Error('FileIO#readTextWithEncodingAsync not implemented')
    }
    static writeTextAsync(file: IStorageFile, contents: string): IAsyncAction {
        return PathIO.writeTextAsync(file.path, contents);
    }
    static writeTextWithEncodingAsync(file: IStorageFile, contents: string, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('FileIO#writeTextWithEncodingAsync not implemented')
    }
    static appendTextAsync(file: IStorageFile, contents: string): IAsyncAction {
        throw new Error('FileIO#appendTextAsync not implemented')
    }
    static appendTextWithEncodingAsync(file: IStorageFile, contents: string, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('FileIO#appendTextWithEncodingAsync not implemented')
    }
    static readLinesAsync(file: IStorageFile): IAsyncOperation<IVector<string>> {
        throw new Error('FileIO#readLinesAsync not implemented')
    }
    static readLinesWithEncodingAsync(file: IStorageFile, encoding: UnicodeEncoding): IAsyncOperation<IVector<string>> {
        throw new Error('FileIO#readLinesWithEncodingAsync not implemented')
    }
    static writeLinesAsync(file: IStorageFile, lines: IIterable<string>): IAsyncAction {
        throw new Error('FileIO#writeLinesAsync not implemented')
    }
    static writeLinesWithEncodingAsync(file: IStorageFile, lines: IIterable<string>, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('FileIO#writeLinesWithEncodingAsync not implemented')
    }
    static appendLinesAsync(file: IStorageFile, lines: IIterable<string>): IAsyncAction {
        throw new Error('FileIO#appendLinesAsync not implemented')
    }
    static appendLinesWithEncodingAsync(file: IStorageFile, lines: IIterable<string>, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('FileIO#appendLinesWithEncodingAsync not implemented')
    }
    static readBufferAsync(file: IStorageFile): IAsyncOperation<IBuffer> {
        return PathIO.readBufferAsync(file.path);
    }
    static writeBufferAsync(file: IStorageFile, buffer: IBuffer): IAsyncAction {
        return PathIO.writeBufferAsync(file.path, buffer);
    }
    static writeBytesAsync(file: IStorageFile, buffer: number[]): IAsyncAction {
        throw new Error('FileIO#writeBytesAsync not implemented')
    }
}
