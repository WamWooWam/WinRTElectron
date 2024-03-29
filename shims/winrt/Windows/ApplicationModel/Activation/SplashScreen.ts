// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { InvokeEvent } from "../../Foundation/Interop/InvokeEvent";
import { SplashScreenV2 } from "../../Foundation/Interop/IpcConstants";
import { Rect } from "../../Foundation/Rect";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";

const { ipcRenderer } = require("electron");

@GenerateShim('Windows.ApplicationModel.Activation.SplashScreen')
export class SplashScreen { 
    constructor(rect?: Rect) {
        this.imageLocation = rect;
        ipcRenderer.once(SplashScreenV2, () => {
            InvokeEvent(this.__dismissed, "dismissed", null);
        });
    }

    imageLocation: Rect = null;

    __dismissed: Set<TypedEventHandler<SplashScreen, any>> = new Set();
    @Enumerable(true)
    set ondismissed(handler: TypedEventHandler<SplashScreen, any>) {
        this.__dismissed.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'dismissed':
                this.__dismissed.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'dismissed':
                this.__dismissed.delete(handler);
                break;
        }
    }
}
