// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { UssdMessage } from "./UssdMessage";
import { UssdReply } from "./UssdReply";

@GenerateShim('Windows.Networking.NetworkOperators.UssdSession')
export class UssdSession { 
    sendMessageAndGetReplyAsync(message: UssdMessage): IAsyncOperation<UssdReply> {
        throw new Error('UssdSession#sendMessageAndGetReplyAsync not implemented')
    }
    close(): void {
        console.warn('UssdSession#close not implemented')
    }
    static createFromNetworkAccountId(networkAccountId: string): UssdSession {
        throw new Error('UssdSession#createFromNetworkAccountId not implemented')
    }
    static createFromNetworkInterfaceId(networkInterfaceId: string): UssdSession {
        throw new Error('UssdSession#createFromNetworkInterfaceId not implemented')
    }
}