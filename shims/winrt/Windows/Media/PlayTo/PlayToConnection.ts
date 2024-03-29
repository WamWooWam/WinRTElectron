// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { PlayToConnectionErrorEventArgs } from "./PlayToConnectionErrorEventArgs";
import { PlayToConnectionState } from "./PlayToConnectionState";
import { PlayToConnectionStateChangedEventArgs } from "./PlayToConnectionStateChangedEventArgs";
import { PlayToConnectionTransferredEventArgs } from "./PlayToConnectionTransferredEventArgs";

@GenerateShim('Windows.Media.PlayTo.PlayToConnection')
export class PlayToConnection { 
    state: PlayToConnectionState = null;

    #error: Set<TypedEventHandler<PlayToConnection, PlayToConnectionErrorEventArgs>> = new Set();
    @Enumerable(true)
    set onerror(handler: TypedEventHandler<PlayToConnection, PlayToConnectionErrorEventArgs>) {
        this.#error.add(handler);
    }

    #stateChanged: Set<TypedEventHandler<PlayToConnection, PlayToConnectionStateChangedEventArgs>> = new Set();
    @Enumerable(true)
    set onstatechanged(handler: TypedEventHandler<PlayToConnection, PlayToConnectionStateChangedEventArgs>) {
        this.#stateChanged.add(handler);
    }

    #transferred: Set<TypedEventHandler<PlayToConnection, PlayToConnectionTransferredEventArgs>> = new Set();
    @Enumerable(true)
    set ontransferred(handler: TypedEventHandler<PlayToConnection, PlayToConnectionTransferredEventArgs>) {
        this.#transferred.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'error':
                this.#error.add(handler);
                break;
            case 'statechanged':
                this.#stateChanged.add(handler);
                break;
            case 'transferred':
                this.#transferred.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'error':
                this.#error.delete(handler);
                break;
            case 'statechanged':
                this.#stateChanged.delete(handler);
                break;
            case 'transferred':
                this.#transferred.delete(handler);
                break;
        }
    }
}
