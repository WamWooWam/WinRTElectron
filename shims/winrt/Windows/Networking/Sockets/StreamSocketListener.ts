// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../../Foundation/IAsyncAction";
import { IClosable } from "../../Foundation/IClosable";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { NetworkAdapter } from "../Connectivity/NetworkAdapter";
import { HostName } from "../HostName";
import { SocketProtectionLevel } from "./SocketProtectionLevel";
import { StreamSocketListenerConnectionReceivedEventArgs } from "./StreamSocketListenerConnectionReceivedEventArgs";
import { StreamSocketListenerControl } from "./StreamSocketListenerControl";
import { StreamSocketListenerInformation } from "./StreamSocketListenerInformation";

@GenerateShim('Windows.Networking.Sockets.StreamSocketListener')
export class StreamSocketListener implements IClosable { 
    control: StreamSocketListenerControl = null;
    information: StreamSocketListenerInformation = null;
    bindServiceNameAsync(localServiceName: string): IAsyncAction {
        throw new Error('StreamSocketListener#bindServiceNameAsync not implemented')
    }
    bindEndpointAsync(localHostName: HostName, localServiceName: string): IAsyncAction {
        throw new Error('StreamSocketListener#bindEndpointAsync not implemented')
    }
    close(): void {
        console.warn('StreamSocketListener#close not implemented')
    }
    bindServiceNameWithProtectionLevelAsync(localServiceName: string, protectionLevel: SocketProtectionLevel): IAsyncAction {
        throw new Error('StreamSocketListener#bindServiceNameWithProtectionLevelAsync not implemented')
    }
    bindServiceNameWithProtectionLevelAndAdapterAsync(localServiceName: string, protectionLevel: SocketProtectionLevel, adapter: NetworkAdapter): IAsyncAction {
        throw new Error('StreamSocketListener#bindServiceNameWithProtectionLevelAndAdapterAsync not implemented')
    }

    #connectionReceived: Set<TypedEventHandler<StreamSocketListener, StreamSocketListenerConnectionReceivedEventArgs>> = new Set();
    @Enumerable(true)
    set onconnectionreceived(handler: TypedEventHandler<StreamSocketListener, StreamSocketListenerConnectionReceivedEventArgs>) {
        this.#connectionReceived.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'connectionreceived':
                this.#connectionReceived.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'connectionreceived':
                this.#connectionReceived.delete(handler);
                break;
        }
    }
}