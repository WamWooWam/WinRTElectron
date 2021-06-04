// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:09 2021
// </auto-generated>
// --------------------------------------------------

import { BackgroundTaskCanceledEventHandler } from "../../ApplicationModel/Background/BackgroundTaskCanceledEventHandler";
import { BackgroundTaskDeferral } from "../../ApplicationModel/Background/BackgroundTaskDeferral";
import { BackgroundTaskRegistration } from "../../ApplicationModel/Background/BackgroundTaskRegistration";
import { IBackgroundTaskInstance } from "../../ApplicationModel/Background/IBackgroundTaskInstance";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IWebUIBackgroundTaskInstance } from "./IWebUIBackgroundTaskInstance";

@GenerateShim('Windows.UI.WebUI.WebUIBackgroundTaskInstanceRuntimeClass')
export class WebUIBackgroundTaskInstanceRuntimeClass implements IWebUIBackgroundTaskInstance, IBackgroundTaskInstance { 
    succeeded: boolean = null;
    progress: number = null;
    instanceId: string = null;
    suspendedCount: number = null;
    task: BackgroundTaskRegistration = null;
    triggerDetails: any = null;
    getDeferral(): BackgroundTaskDeferral {
        throw new Error('WebUIBackgroundTaskInstanceRuntimeClass#getDeferral not implemented')
    }

    #canceled: Set<BackgroundTaskCanceledEventHandler> = new Set();
    @Enumerable(true)
    set oncanceled(handler: BackgroundTaskCanceledEventHandler) {
        this.#canceled.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'canceled':
                this.#canceled.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'canceled':
                this.#canceled.delete(handler);
                break;
        }
    }
}