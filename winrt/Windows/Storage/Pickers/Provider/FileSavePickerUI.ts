// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { IVectorView } from "../../../Foundation/Collections/IVectorView`1";
import { Enumerable } from "../../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../../Foundation/TypedEventHandler`2";
import { SetFileNameResult } from "./SetFileNameResult";
import { TargetFileRequestedEventArgs } from "./TargetFileRequestedEventArgs";

@GenerateShim('Windows.Storage.Pickers.Provider.FileSavePickerUI')
export class FileSavePickerUI { 
    title: string = null;
    allowedFileTypes: IVectorView<string> = null;
    fileName: string = null;
    settingsIdentifier: string = null;
    trySetFileName(value: string): SetFileNameResult {
        throw new Error('FileSavePickerUI#trySetFileName not implemented')
    }

    #fileNameChanged: Set<TypedEventHandler<FileSavePickerUI, any>> = new Set();
    @Enumerable(true)
    set onfilenamechanged(handler: TypedEventHandler<FileSavePickerUI, any>) {
        this.#fileNameChanged.add(handler);
    }

    #targetFileRequested: Set<TypedEventHandler<FileSavePickerUI, TargetFileRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set ontargetfilerequested(handler: TypedEventHandler<FileSavePickerUI, TargetFileRequestedEventArgs>) {
        this.#targetFileRequested.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'filenamechanged':
                this.#fileNameChanged.add(handler);
                break;
            case 'targetfilerequested':
                this.#targetFileRequested.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'filenamechanged':
                this.#fileNameChanged.delete(handler);
                break;
            case 'targetfilerequested':
                this.#targetFileRequested.delete(handler);
                break;
        }
    }
}