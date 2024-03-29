// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Microsoft 255.255.255.255 at Wed Apr 14 20:25:38 2021
// </auto-generated>
// --------------------------------------------------

import { IDisposable } from "./IDisposable";
import { RestartNeededHandler } from "./RestartNeededHandler";

export interface IClientServices {
    flushLogfile(): string;
    requestDelayedResources(): void;
    suspend(): void;
    resume(): void;
    registerForDispose(pDisposable: IDisposable): void;
    unregisterForDispose(pDisposable: IDisposable): void;
    onrestartneeded: RestartNeededHandler;
    addEventListener(name: string, handler: any)
    removeEventListener(name: string, handler: any)
}
