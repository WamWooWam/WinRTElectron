// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Platform 3.0.0.0 at Fri Jun  4 19:45:10 2021
// </auto-generated>
// --------------------------------------------------

import { Vmap } from "./Vmap";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IStringable } from "winrt/Windows/Foundation/IStringable";
import { AsyncOperation } from "winrt/Windows/Foundation/Interop/AsyncOperation`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Uri } from "winrt/Windows/Foundation/Uri";
import { IInputStream } from "winrt/Windows/Storage/Streams/IInputStream";

@GenerateShim('Microsoft.Media.Advertising.VmapFactory')
export class VmapFactory implements IStringable { 
    static createFromMVmap(stream: IInputStream): Vmap {
        throw new Error('VmapFactory#createFromMVmap not implemented')
    }
    static loadSource(source: Uri): IAsyncOperation<Vmap> {
        return AsyncOperation.from(async () => { throw new Error('VmapFactory#loadSource not implemented') });
    }
    toString(): string {
        throw new Error('VmapFactory#toString not implemented')
    }
}
