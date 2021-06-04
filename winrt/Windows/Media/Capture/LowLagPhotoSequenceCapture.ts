// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:04 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { PhotoCapturedEventArgs } from "./PhotoCapturedEventArgs";

@GenerateShim('Windows.Media.Capture.LowLagPhotoSequenceCapture')
export class LowLagPhotoSequenceCapture { 
    startAsync(): IAsyncAction {
        throw new Error('LowLagPhotoSequenceCapture#startAsync not implemented')
    }
    stopAsync(): IAsyncAction {
        throw new Error('LowLagPhotoSequenceCapture#stopAsync not implemented')
    }
    finishAsync(): IAsyncAction {
        throw new Error('LowLagPhotoSequenceCapture#finishAsync not implemented')
    }

    #photoCaptured: Set<TypedEventHandler<LowLagPhotoSequenceCapture, PhotoCapturedEventArgs>> = new Set();
    @Enumerable(true)
    set onphotocaptured(handler: TypedEventHandler<LowLagPhotoSequenceCapture, PhotoCapturedEventArgs>) {
        this.#photoCaptured.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'photocaptured':
                this.#photoCaptured.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'photocaptured':
                this.#photoCaptured.delete(handler);
                break;
        }
    }
}