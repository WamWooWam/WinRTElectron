
import { IIterable } from "../Foundation/Collections/IIterable`1";
import { IVector } from "../Foundation/Collections/IVector`1";
import { IAsyncAction } from "../Foundation/IAsyncAction";
import { AsyncOperation, IAsyncOperation } from "../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IBuffer } from "./Streams/IBuffer";
import { UnicodeEncoding } from "./Streams/UnicodeEncoding";

import * as fs from "fs";
import * as _path from "path";
const fsp = fs.promises;

@GenerateShim('Windows.Storage.PathIO')
export class PathIO { 
    static readTextAsync(absolutePath: string): IAsyncOperation<string> {
        return AsyncOperation.from(async() => {
            if(!fs.existsSync(absolutePath)) {
                throw new Error("File doesn't exist!");
            }

            let decoder = new TextDecoder();
            let buff = await fsp.readFile(absolutePath);
            return decoder.decode(buff);
        });
    }

    static writeTextAsync(absolutePath: string, contents: string): IAsyncAction {
        return AsyncOperation.from(async() => {
            await fsp.writeFile(absolutePath, contents);
        });
    }

    static readTextWithEncodingAsync(absolutePath: string, encoding: UnicodeEncoding): IAsyncOperation<string> {
        throw new Error('PathIO#readTextWithEncodingAsync not implemented')
    }
    static writeTextWithEncodingAsync(absolutePath: string, contents: string, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('PathIO#writeTextWithEncodingAsync not implemented')
    }
    static appendTextAsync(absolutePath: string, contents: string): IAsyncAction {
        throw new Error('PathIO#appendTextAsync not implemented')
    }
    static appendTextWithEncodingAsync(absolutePath: string, contents: string, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('PathIO#appendTextWithEncodingAsync not implemented')
    }
    static readLinesAsync(absolutePath: string): IAsyncOperation<IVector<string>> {
        throw new Error('PathIO#readLinesAsync not implemented')
    }
    static readLinesWithEncodingAsync(absolutePath: string, encoding: UnicodeEncoding): IAsyncOperation<IVector<string>> {
        throw new Error('PathIO#readLinesWithEncodingAsync not implemented')
    }
    static writeLinesAsync(absolutePath: string, lines: IIterable<string>): IAsyncAction {
        throw new Error('PathIO#writeLinesAsync not implemented')
    }
    static writeLinesWithEncodingAsync(absolutePath: string, lines: IIterable<string>, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('PathIO#writeLinesWithEncodingAsync not implemented')
    }
    static appendLinesAsync(absolutePath: string, lines: IIterable<string>): IAsyncAction {
        throw new Error('PathIO#appendLinesAsync not implemented')
    }
    static appendLinesWithEncodingAsync(absolutePath: string, lines: IIterable<string>, encoding: UnicodeEncoding): IAsyncAction {
        throw new Error('PathIO#appendLinesWithEncodingAsync not implemented')
    }
    static readBufferAsync(absolutePath: string): IAsyncOperation<IBuffer> {
        return AsyncOperation.from(async () => {
            return await fsp.readFile(absolutePath);
        })
    }
    static writeBufferAsync(absolutePath: string, buffer: IBuffer): IAsyncAction {
        return AsyncOperation.from(async () => {
            let file = await fsp.open(absolutePath, 'w');
            await file.write(buffer);
            await file.close();
        })
    }
    static writeBytesAsync(absolutePath: string, buffer: number[]): IAsyncAction {
        throw new Error('PathIO#writeBytesAsync not implemented')
    }
}
