// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IIterator } from "../../Foundation/Collections/IIterator`1";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { StorageFile } from "../StorageFile";

@GenerateShim('Windows.Storage.Pickers.FilePickerSelectedFilesArray')
export class FilePickerSelectedFilesArray implements IVectorView<StorageFile>, IIterable<StorageFile> { 
    [Symbol.iterator](): Iterator<StorageFile> {
        return null;
    }
    size: number = null;
    getAt(index: number): StorageFile {
        throw new Error('FilePickerSelectedFilesArray#getAt not implemented')
    }
    getMany(startIndex: number): { returnValue: number, items: StorageFile[] } {
        throw new Error('FilePickerSelectedFilesArray#getMany not implemented')
    }
    first(): IIterator<StorageFile> {
        throw new Error('FilePickerSelectedFilesArray#first not implemented')
    }
}