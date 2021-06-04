// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:03 2021
// </auto-generated>
// --------------------------------------------------

import { SmartCard } from "./SmartCard";
import { SmartCardChallengeContext } from "./SmartCardChallengeContext";
import { SmartCardPinPolicy } from "./SmartCardPinPolicy";
import { SmartCardPinResetHandler } from "./SmartCardPinResetHandler";
import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IBuffer } from "../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Devices.SmartCards.SmartCardProvisioning')
export class SmartCardProvisioning { 
    smartCard: SmartCard = null;
    getIdAsync(): IAsyncOperation<string> {
        throw new Error('SmartCardProvisioning#getIdAsync not implemented')
    }
    getNameAsync(): IAsyncOperation<string> {
        throw new Error('SmartCardProvisioning#getNameAsync not implemented')
    }
    getChallengeContextAsync(): IAsyncOperation<SmartCardChallengeContext> {
        throw new Error('SmartCardProvisioning#getChallengeContextAsync not implemented')
    }
    requestPinChangeAsync(): IAsyncOperation<boolean> {
        throw new Error('SmartCardProvisioning#requestPinChangeAsync not implemented')
    }
    requestPinResetAsync(handler: SmartCardPinResetHandler): IAsyncOperation<boolean> {
        throw new Error('SmartCardProvisioning#requestPinResetAsync not implemented')
    }
    static fromSmartCardAsync(card: SmartCard): IAsyncOperation<SmartCardProvisioning> {
        throw new Error('SmartCardProvisioning#fromSmartCardAsync not implemented')
    }
    static requestVirtualSmartCardCreationAsync(friendlyName: string, administrativeKey: IBuffer, pinPolicy: SmartCardPinPolicy): IAsyncOperation<SmartCardProvisioning> {
        throw new Error('SmartCardProvisioning#requestVirtualSmartCardCreationAsync not implemented')
    }
    static requestVirtualSmartCardCreationAsyncWithCardId(friendlyName: string, administrativeKey: IBuffer, pinPolicy: SmartCardPinPolicy, cardId: string): IAsyncOperation<SmartCardProvisioning> {
        throw new Error('SmartCardProvisioning#requestVirtualSmartCardCreationAsyncWithCardId not implemented')
    }
    static requestVirtualSmartCardDeletionAsync(card: SmartCard): IAsyncOperation<boolean> {
        throw new Error('SmartCardProvisioning#requestVirtualSmartCardDeletionAsync not implemented')
    }
}