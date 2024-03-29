// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { DateTime } from "../../Foundation/DateTime";
import { TimeSpan } from "../../Foundation/TimeSpan";
import { ByteOrder } from "./ByteOrder";
import { DataReaderLoadOperation } from "./DataReaderLoadOperation";
import { IBuffer } from "./IBuffer";
import { IInputStream } from "./IInputStream";
import { InputStreamOptions } from "./InputStreamOptions";
import { UnicodeEncoding } from "./UnicodeEncoding";

export interface IDataReader {
    byteOrder: ByteOrder;
    inputStreamOptions: InputStreamOptions;
    unconsumedBufferLength: number;
    unicodeEncoding: UnicodeEncoding;
    readByte(): number;
    readBytes(): number[];
    readBuffer(length: number): IBuffer;
    readBoolean(): boolean;
    readGuid(): string;
    readInt16(): number;
    readInt32(): number;
    readInt64(): number;
    readUInt16(): number;
    readUInt32(): number;
    readUInt64(): number;
    readSingle(): number;
    readDouble(): number;
    readString(codeUnitCount: number): string;
    readDateTime(): Date;
    readTimeSpan(): number;
    loadAsync(count: number): DataReaderLoadOperation;
    detachBuffer(): IBuffer;
    detachStream(): IInputStream;
}
