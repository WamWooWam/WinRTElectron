// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { IClosable } from "../../Foundation/IClosable";
import { IInputStream } from "./IInputStream";
import { IOutputStream } from "./IOutputStream";

export interface IRandomAccessStream extends IClosable, IInputStream, IOutputStream {
    canRead: boolean;
    canWrite: boolean;
    position: number;
    size: number;
    getInputStreamAt(position: number): IInputStream;
    getOutputStreamAt(position: number): IOutputStream;
    seek(position: number): void;
    cloneStream(): IRandomAccessStream;
}
