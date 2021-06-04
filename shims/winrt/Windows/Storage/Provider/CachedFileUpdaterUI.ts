// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { CachedFileTarget } from "./CachedFileTarget";
import { FileUpdateRequestedEventArgs } from "./FileUpdateRequestedEventArgs";
import { UIStatus } from "./UIStatus";

@GenerateShim('Windows.Storage.Provider.CachedFileUpdaterUI')
export class CachedFileUpdaterUI { 
    title: string = null;
    uistatus: UIStatus = null;
    updateTarget: CachedFileTarget = null;

    #fileUpdateRequested: Set<TypedEventHandler<CachedFileUpdaterUI, FileUpdateRequestedEventArgs>> = new Set();
    @Enumerable(true)
    set onfileupdaterequested(handler: TypedEventHandler<CachedFileUpdaterUI, FileUpdateRequestedEventArgs>) {
        this.#fileUpdateRequested.add(handler);
    }

    #uirequested: Set<TypedEventHandler<CachedFileUpdaterUI, any>> = new Set();
    @Enumerable(true)
    set onuirequested(handler: TypedEventHandler<CachedFileUpdaterUI, any>) {
        this.#uirequested.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'fileupdaterequested':
                this.#fileUpdateRequested.add(handler);
                break;
            case 'uirequested':
                this.#uirequested.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'fileupdaterequested':
                this.#fileUpdateRequested.delete(handler);
                break;
            case 'uirequested':
                this.#uirequested.delete(handler);
                break;
        }
    }
}