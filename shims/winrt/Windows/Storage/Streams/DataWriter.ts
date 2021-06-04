// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { DateTime } from "../../Foundation/DateTime";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { IClosable } from "../../Foundation/IClosable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TimeSpan } from "../../Foundation/TimeSpan";
import { ByteOrder } from "./ByteOrder";
import { DataWriterStoreOperation } from "./DataWriterStoreOperation";
import { IBuffer } from "./IBuffer";
import { IDataWriter } from "./IDataWriter";
import { IOutputStream } from "./IOutputStream";
import { UnicodeEncoding } from "./UnicodeEncoding";

@GenerateShim('Windows.Storage.Streams.DataWriter')
export class DataWriter implements IDataWriter, IClosable { 
    unicodeEncoding: UnicodeEncoding = null;
    byteOrder: ByteOrder = null;
    unstoredBufferLength: number = null;
    // constructor();
    // constructor(outputStream: IOutputStream);
    constructor(...args) { }
    writeByte(value: number): void {
        console.warn('DataWriter#writeByte not implemented')
    }
    writeBytes(value: number[]): void {
        console.warn('DataWriter#writeBytes not implemented')
    }
    writeBuffer(buffer: IBuffer): void {
        console.warn('DataWriter#writeBuffer not implemented')
    }
    writeBufferRange(buffer: IBuffer, start: number, count: number): void {
        console.warn('DataWriter#writeBufferRange not implemented')
    }
    writeBoolean(value: boolean): void {
        console.warn('DataWriter#writeBoolean not implemented')
    }
    writeGuid(value: string): void {
        console.warn('DataWriter#writeGuid not implemented')
    }
    writeInt16(value: number): void {
        console.warn('DataWriter#writeInt16 not implemented')
    }
    writeInt32(value: number): void {
        console.warn('DataWriter#writeInt32 not implemented')
    }
    writeInt64(value: number): void {
        console.warn('DataWriter#writeInt64 not implemented')
    }
    writeUInt16(value: number): void {
        console.warn('DataWriter#writeUInt16 not implemented')
    }
    writeUInt32(value: number): void {
        console.warn('DataWriter#writeUInt32 not implemented')
    }
    writeUInt64(value: number): void {
        console.warn('DataWriter#writeUInt64 not implemented')
    }
    writeSingle(value: number): void {
        console.warn('DataWriter#writeSingle not implemented')
    }
    writeDouble(value: number): void {
        console.warn('DataWriter#writeDouble not implemented')
    }
    writeDateTime(value: Date): void {
        console.warn('DataWriter#writeDateTime not implemented')
    }
    writeTimeSpan(value: number): void {
        console.warn('DataWriter#writeTimeSpan not implemented')
    }
    writeString(value: string): number {
        throw new Error('DataWriter#writeString not implemented')
    }
    measureString(value: string): number {
        throw new Error('DataWriter#measureString not implemented')
    }
    storeAsync(): DataWriterStoreOperation {
        throw new Error('DataWriter#storeAsync not implemented')
    }
    flushAsync(): IAsyncOperation<boolean> {
        throw new Error('DataWriter#flushAsync not implemented')
    }
    detachBuffer(): IBuffer {
        throw new Error('DataWriter#detachBuffer not implemented')
    }
    detachStream(): IOutputStream {
        throw new Error('DataWriter#detachStream not implemented')
    }
    close(): void {
        console.warn('DataWriter#close not implemented')
    }
}