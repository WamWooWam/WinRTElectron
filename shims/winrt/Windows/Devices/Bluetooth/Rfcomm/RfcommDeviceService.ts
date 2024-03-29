// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:01 2021
// </auto-generated>
// --------------------------------------------------

import { BluetoothCacheMode } from "../BluetoothCacheMode";
import { RfcommServiceId } from "./RfcommServiceId";
import { IMapView } from "../../../Foundation/Collections/IMapView`2";
import { IAsyncOperation } from "../../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { HostName } from "../../../Networking/HostName";
import { SocketProtectionLevel } from "../../../Networking/Sockets/SocketProtectionLevel";
import { IBuffer } from "../../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Devices.Bluetooth.Rfcomm.RfcommDeviceService')
export class RfcommDeviceService { 
    connectionHostName: HostName = null;
    connectionServiceName: string = null;
    maxProtectionLevel: SocketProtectionLevel = null;
    protectionLevel: SocketProtectionLevel = null;
    serviceId: RfcommServiceId = null;
    getSdpRawAttributesAsync(): IAsyncOperation<IMapView<number, IBuffer>> {
        throw new Error('RfcommDeviceService#getSdpRawAttributesAsync not implemented')
    }
    getSdpRawAttributesWithCacheModeAsync(cacheMode: BluetoothCacheMode): IAsyncOperation<IMapView<number, IBuffer>> {
        throw new Error('RfcommDeviceService#getSdpRawAttributesWithCacheModeAsync not implemented')
    }
    static fromIdAsync(deviceId: string): IAsyncOperation<RfcommDeviceService> {
        throw new Error('RfcommDeviceService#fromIdAsync not implemented')
    }
    static getDeviceSelector(serviceId: RfcommServiceId): string {
        throw new Error('RfcommDeviceService#getDeviceSelector not implemented')
    }
}
