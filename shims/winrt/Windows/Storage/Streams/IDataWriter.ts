// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { DateTime } from "../../Foundation/DateTime";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { TimeSpan } from "../../Foundation/TimeSpan";
import { ByteOrder } from "./ByteOrder";
import { DataWriterStoreOperation } from "./DataWriterStoreOperation";
import { IBuffer } from "./IBuffer";
import { IOutputStream } from "./IOutputStream";
import { UnicodeEncoding } from "./UnicodeEncoding";

export interface IDataWriter {
    byteOrder: ByteOrder;
    unicodeEncoding: UnicodeEncoding;
    unstoredBufferLength: number;
    writeByte(value: number): void;
    writeBytes(value: number[]): void;
    writeBuffer(buffer: IBuffer): void;
    writeBufferRange(buffer: IBuffer, start: number, count: number): void;
    writeBoolean(value: boolean): void;
    writeGuid(value: string): void;
    writeInt16(value: number): void;
    writeInt32(value: number): void;
    writeInt64(value: number): void;
    writeUInt16(value: number): void;
    writeUInt32(value: number): void;
    writeUInt64(value: number): void;
    writeSingle(value: number): void;
    writeDouble(value: number): void;
    writeDateTime(value: Date): void;
    writeTimeSpan(value: number): void;
    writeString(value: string): number;
    measureString(value: string): number;
    storeAsync(): DataWriterStoreOperation;
    flushAsync(): IAsyncOperation<boolean>;
    detachBuffer(): IBuffer;
    detachStream(): IOutputStream;
}
