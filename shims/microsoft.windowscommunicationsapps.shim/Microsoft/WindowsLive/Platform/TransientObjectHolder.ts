// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:39 2021
// </auto-generated>
// --------------------------------------------------

import { IDisposable } from "./IDisposable";
import { ITransientObjectHolder } from "./ITransientObjectHolder";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";

@GenerateShim('Microsoft.WindowsLive.Platform.TransientObjectHolder')
export class TransientObjectHolder implements ITransientObjectHolder, IDisposable { 
    readonly objectId: string = null;
    dispose(): void {
        console.warn('TransientObjectHolder#dispose not implemented')
    }
}