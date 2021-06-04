
import { DeviceClass } from "./DeviceClass";
import { DeviceInformationCollection } from "./DeviceInformationCollection";
import { DeviceInformationUpdate } from "./DeviceInformationUpdate";
import { DeviceThumbnail } from "./DeviceThumbnail";
import { DeviceWatcher } from "./DeviceWatcher";
import { EnclosureLocation } from "./EnclosureLocation";
import { IIterable } from "../../Foundation/Collections/IIterable`1";
import { IMapView } from "../../Foundation/Collections/IMapView`2";
import { AsyncOperation, IAsyncOperation } from "../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.Enumeration.DeviceInformation')
export class DeviceInformation { 
    enclosureLocation: EnclosureLocation = null;
    id: string = null;
    isDefault: boolean = null;
    isEnabled: boolean = null;
    name: string = null;
    properties: IMapView<string, any> = null;
    
    static findAllAsync(): IAsyncOperation<DeviceInformationCollection> {
        return AsyncOperation.from(async () => {
            return new DeviceInformationCollection();
        });
    }

    update(updateInfo: DeviceInformationUpdate): void {
        console.warn('DeviceInformation#update not implemented')
    }
    getThumbnailAsync(): IAsyncOperation<DeviceThumbnail> {
        throw new Error('DeviceInformation#getThumbnailAsync not implemented')
    }
    getGlyphThumbnailAsync(): IAsyncOperation<DeviceThumbnail> {
        throw new Error('DeviceInformation#getGlyphThumbnailAsync not implemented')
    }
    static createFromIdAsync(deviceId: string): IAsyncOperation<DeviceInformation> {
        throw new Error('DeviceInformation#createFromIdAsync not implemented')
    }
    static createFromIdAsyncAdditionalProperties(deviceId: string, additionalProperties: IIterable<string>): IAsyncOperation<DeviceInformation> {
        throw new Error('DeviceInformation#createFromIdAsyncAdditionalProperties not implemented')
    }
    static findAllAsyncDeviceClass(deviceClass: DeviceClass): IAsyncOperation<DeviceInformationCollection> {
        throw new Error('DeviceInformation#findAllAsyncDeviceClass not implemented')
    }
    static findAllAsyncAqsFilter(aqsFilter: string): IAsyncOperation<DeviceInformationCollection> {
        throw new Error('DeviceInformation#findAllAsyncAqsFilter not implemented')
    }
    static findAllAsyncAqsFilterAndAdditionalProperties(aqsFilter: string, additionalProperties: IIterable<string>): IAsyncOperation<DeviceInformationCollection> {
        throw new Error('DeviceInformation#findAllAsyncAqsFilterAndAdditionalProperties not implemented')
    }
    static createWatcher(deviceClass: DeviceClass): DeviceWatcher {
        return new DeviceWatcher(deviceClass);
    }
    static createWatcherDeviceClass(deviceClass: DeviceClass): DeviceWatcher {
        throw new Error('DeviceInformation#createWatcherDeviceClass not implemented')
    }
    static createWatcherAqsFilter(aqsFilter: string): DeviceWatcher {
        throw new Error('DeviceInformation#createWatcherAqsFilter not implemented')
    }
    static createWatcherAqsFilterAndAdditionalProperties(aqsFilter: string, additionalProperties: IIterable<string>): DeviceWatcher {
        throw new Error('DeviceInformation#createWatcherAqsFilterAndAdditionalProperties not implemented')
    }
}
