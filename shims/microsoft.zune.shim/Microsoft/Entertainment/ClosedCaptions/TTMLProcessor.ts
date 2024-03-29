// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft.Entertainment 255.255.255.255 at Mon Mar 29 16:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { ITTMLProcessor } from "./ITTMLProcessor";
import { IAsyncActionWithProgress } from "winrt/Windows/Foundation/IAsyncActionWithProgress`1";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { IStorageFile } from "winrt/Windows/Storage/IStorageFile";

@GenerateShim('Microsoft.Entertainment.ClosedCaptions.TTMLProcessor')
export class TTMLProcessor implements ITTMLProcessor { 
    loadFromString(xml: string): void {
        console.warn('TTMLProcessor#loadFromString not implemented')
    }
    loadFromStorageFile(pFile: IStorageFile): IAsyncActionWithProgress<number> {
        throw new Error('TTMLProcessor#loadFromStorageFile not implemented')
    }
    renderAt(streamTimeMsec: number): string {
        throw new Error('TTMLProcessor#renderAt not implemented')
    }
}
