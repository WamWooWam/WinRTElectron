// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../Foundation/IAsyncAction";
import { IClosable } from "../Foundation/IClosable";
import { GenerateShim } from "../Foundation/Interop/GenerateShim";
import { IRandomAccessStream } from "./Streams/IRandomAccessStream";

@GenerateShim('Windows.Storage.StorageStreamTransaction')
export class StorageStreamTransaction implements IClosable { 
    stream: IRandomAccessStream = null;
    commitAsync(): IAsyncAction {
        throw new Error('StorageStreamTransaction#commitAsync not implemented')
    }
    close(): void {
        console.warn('StorageStreamTransaction#close not implemented')
    }
}
