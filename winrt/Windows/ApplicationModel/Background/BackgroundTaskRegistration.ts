// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:22:59 2021
// </auto-generated>
// --------------------------------------------------

import { BackgroundTaskCompletedEventHandler } from "./BackgroundTaskCompletedEventHandler";
import { BackgroundTaskProgressEventHandler } from "./BackgroundTaskProgressEventHandler";
import { IBackgroundTaskRegistration } from "./IBackgroundTaskRegistration";
import { IMapView } from "../../Foundation/Collections/IMapView`2";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { Dictionary } from "../../Foundation/Interop/Dictionary`2";

@GenerateShim('Windows.ApplicationModel.Background.BackgroundTaskRegistration')
export class BackgroundTaskRegistration implements IBackgroundTaskRegistration { 
    name: string = null;
    taskId: string = null;
    static allTasks: IMapView<string, IBackgroundTaskRegistration> = new Dictionary();
    unregister(cancelTask: boolean): void {
        console.warn('BackgroundTaskRegistration#unregister not implemented')
    }

    #completed: Set<BackgroundTaskCompletedEventHandler> = new Set();
    @Enumerable(true)
    set oncompleted(handler: BackgroundTaskCompletedEventHandler) {
        this.#completed.add(handler);
    }

    #progress: Set<BackgroundTaskProgressEventHandler> = new Set();
    @Enumerable(true)
    set onprogress(handler: BackgroundTaskProgressEventHandler) {
        this.#progress.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'completed':
                this.#completed.add(handler);
                break;
            case 'progress':
                this.#progress.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'completed':
                this.#completed.delete(handler);
                break;
            case 'progress':
                this.#progress.delete(handler);
                break;
        }
    }
}