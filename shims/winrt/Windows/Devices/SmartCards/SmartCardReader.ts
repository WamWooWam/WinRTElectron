// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { CardAddedEventArgs } from "./CardAddedEventArgs";
import { CardRemovedEventArgs } from "./CardRemovedEventArgs";
import { SmartCard } from "./SmartCard";
import { SmartCardReaderKind } from "./SmartCardReaderKind";
import { SmartCardReaderStatus } from "./SmartCardReaderStatus";
import { IVectorView } from "../../Foundation/Collections/IVectorView`1";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";

@GenerateShim('Windows.Devices.SmartCards.SmartCardReader')
export class SmartCardReader { 
    deviceId: string = null;
    kind: SmartCardReaderKind = null;
    name: string = null;
    getStatusAsync(): IAsyncOperation<SmartCardReaderStatus> {
        throw new Error('SmartCardReader#getStatusAsync not implemented')
    }
    findAllCardsAsync(): IAsyncOperation<IVectorView<SmartCard>> {
        throw new Error('SmartCardReader#findAllCardsAsync not implemented')
    }
    static getDeviceSelector(): string {
        throw new Error('SmartCardReader#getDeviceSelector not implemented')
    }
    static getDeviceSelectorWithKind(kind: SmartCardReaderKind): string {
        throw new Error('SmartCardReader#getDeviceSelectorWithKind not implemented')
    }
    static fromIdAsync(deviceId: string): IAsyncOperation<SmartCardReader> {
        throw new Error('SmartCardReader#fromIdAsync not implemented')
    }

    #cardAdded: Set<TypedEventHandler<SmartCardReader, CardAddedEventArgs>> = new Set();
    @Enumerable(true)
    set oncardadded(handler: TypedEventHandler<SmartCardReader, CardAddedEventArgs>) {
        this.#cardAdded.add(handler);
    }

    #cardRemoved: Set<TypedEventHandler<SmartCardReader, CardRemovedEventArgs>> = new Set();
    @Enumerable(true)
    set oncardremoved(handler: TypedEventHandler<SmartCardReader, CardRemovedEventArgs>) {
        this.#cardRemoved.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'cardadded':
                this.#cardAdded.add(handler);
                break;
            case 'cardremoved':
                this.#cardRemoved.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'cardadded':
                this.#cardAdded.delete(handler);
                break;
            case 'cardremoved':
                this.#cardRemoved.delete(handler);
                break;
        }
    }
}
