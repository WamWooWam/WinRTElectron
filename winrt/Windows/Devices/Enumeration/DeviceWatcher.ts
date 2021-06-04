import { DeviceInformation } from "./DeviceInformation";
import { DeviceInformationUpdate } from "./DeviceInformationUpdate";
import { DeviceWatcherStatus } from "./DeviceWatcherStatus";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";
import { DeviceClass } from "./DeviceClass";
import { InvokeEvent } from "../../Foundation/Interop/InvokeEvent";

@GenerateShim('Windows.Devices.Enumeration.DeviceWatcher')
export class DeviceWatcher {
    private deviceClass: DeviceClass;
    status: DeviceWatcherStatus = null;

    constructor(deviceClass: DeviceClass) {
        this.deviceClass = deviceClass;
    }

    start(): void {
        navigator.mediaDevices.enumerateDevices()
            .then((devices) => this.invokeEvents(devices))
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

        InvokeEvent(this.#added, "added", info);
    }

    private hasDeviceClass(deviceClass: DeviceClass): boolean {
        return this.deviceClass == DeviceClass.all || this.deviceClass == deviceClass;
    }

    stop(): void {
        console.warn('DeviceWatcher#stop not implemented')
    }

    #added: Set<TypedEventHandler<DeviceWatcher, DeviceInformation>> = new Set();
    @Enumerable(true)
    set onadded(handler: TypedEventHandler<DeviceWatcher, DeviceInformation>) {
        this.#added.add(handler);
    }

    #enumerationCompleted: Set<TypedEventHandler<DeviceWatcher, any>> = new Set();
    @Enumerable(true)
    set onenumerationcompleted(handler: TypedEventHandler<DeviceWatcher, any>) {
        this.#enumerationCompleted.add(handler);
    }

    #removed: Set<TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>> = new Set();
    @Enumerable(true)
    set onremoved(handler: TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>) {
        this.#removed.add(handler);
    }

    #stopped: Set<TypedEventHandler<DeviceWatcher, any>> = new Set();
    @Enumerable(true)
    set onstopped(handler: TypedEventHandler<DeviceWatcher, any>) {
        this.#stopped.add(handler);
    }

    #updated: Set<TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>> = new Set();
    @Enumerable(true)
    set onupdated(handler: TypedEventHandler<DeviceWatcher, DeviceInformationUpdate>) {
        this.#updated.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'added':
                this.#added.add(handler);
                break;
            case 'enumerationcompleted':
                this.#enumerationCompleted.add(handler);
                break;
            case 'removed':
                this.#removed.add(handler);
                break;
            case 'stopped':
                this.#stopped.add(handler);
                break;
            case 'updated':
                this.#updated.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'added':
                this.#added.delete(handler);
                break;
            case 'enumerationcompleted':
                this.#enumerationCompleted.delete(handler);
                break;
            case 'removed':
                this.#removed.delete(handler);
                break;
            case 'stopped':
                this.#stopped.delete(handler);
                break;
            case 'updated':
                this.#updated.delete(handler);
                break;
        }
    }
}
