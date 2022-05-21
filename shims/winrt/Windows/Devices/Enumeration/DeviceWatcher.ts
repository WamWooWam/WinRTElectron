import { DeviceInformation } from "./DeviceInformation";
import { DeviceInformationUpdate } from "./DeviceInformationUpdate";
import { DeviceWatcherStatus } from "./DeviceWatcherStatus";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { DeviceClass } from "./DeviceClass";
import { InvokeEvent } from "../../Foundation/Interop/InvokeEvent";
import { EnclosureLocation } from "./EnclosureLocation";
import { Dictionary } from "../../Foundation/Interop/Dictionary`2";

@GenerateShim('Windows.Devices.Enumeration.DeviceWatcher')
export class DeviceWatcher {
    private __deviceClass: DeviceClass;
    status: DeviceWatcherStatus = null;

    constructor(deviceClass: DeviceClass) {
        this.status = DeviceWatcherStatus.created;
        this.__deviceClass = deviceClass;
    }

    start(): void {
        this.status = DeviceWatcherStatus.started;
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => this.invokeEvents(devices))
            .then(() => this.status = DeviceWatcherStatus.enumerationCompleted);
    }


    private invokeEvents(devices: MediaDeviceInfo[]) {
        for (const device of devices) {
            if (device.kind == "audioinput" && this.hasDeviceClass(DeviceClass.audioCapture)) {
                this.invokeAdded(device);
            }
            if (device.kind == "audiooutput" && this.hasDeviceClass(DeviceClass.audioRender)) {
                this.invokeAdded(device);
            }
            if (device.kind == "videoinput" && this.hasDeviceClass(DeviceClass.videoCapture)) {
                this.invokeAdded(device);
            }
        }
    }

    private invokeAdded(device: MediaDeviceInfo) {
        let info = new DeviceInformation();
        info.id = device.deviceId;
        info.name = device.label;
        info.isEnabled = true;

        InvokeEvent(this.__added, "added", info);
    }

    private hasDeviceClass(deviceClass: DeviceClass): boolean {
        return this.__deviceClass == DeviceClass.all || this.__deviceClass == deviceClass;
    }

    stop(): void {
        console.warn('DeviceWatcher#stop not implemented')
    }

    __added: Set<TypedEventHandler<DeviceWatcher, DeviceInformation>> = new Set();
    @Enumerable(true)
    set onadded(handler: TypedEventHandler<DeviceWatcher, DeviceInformation>) {
        this.__added.add(handler);
    }

    __enumerationCompleted: Set<TypedEventHandler<DeviceWatcher, any>> = new Set();
    @Enumerable(true)
    set onenumerationcompleted(handler: TypedEventHandler<DeviceWatcher, any>) {
        this.__enumerationCompleted.add(handler);
    }

    __removed: Set<TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>> = new Set();
    @Enumerable(true)
    set onremoved(handler: TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>) {
        this.__removed.add(handler);
    }

    __stopped: Set<TypedEventHandler<DeviceWatcher, any>> = new Set();
    @Enumerable(true)
    set onstopped(handler: TypedEventHandler<DeviceWatcher, any>) {
        this.__stopped.add(handler);
    }

    __updated: Set<TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>> = new Set();
    @Enumerable(true)
    set onupdated(handler: TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>) {
        this.__updated.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'added':
                this.__added.add(handler);
                break;
            case 'enumerationcompleted':
                this.__enumerationCompleted.add(handler);
                break;
            case 'removed':
                this.__removed.add(handler);
                break;
            case 'stopped':
                this.__stopped.add(handler);
                break;
            case 'updated':
                this.__updated.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'added':
                this.__added.delete(handler);
                break;
            case 'enumerationcompleted':
                this.__enumerationCompleted.delete(handler);
                break;
            case 'removed':
                this.__removed.delete(handler);
                break;
            case 'stopped':
                this.__stopped.delete(handler);
                break;
            case 'updated':
                this.__updated.delete(handler);
                break;
        }
    }
}
