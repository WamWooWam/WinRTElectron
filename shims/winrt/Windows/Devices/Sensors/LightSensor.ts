// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { LightSensorReading } from "./LightSensorReading";
import { LightSensorReadingChangedEventArgs } from "./LightSensorReadingChangedEventArgs";
import { Enumerable } from "../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../Foundation/TypedEventHandler`2";

@GenerateShim('Windows.Devices.Sensors.LightSensor')
export class LightSensor { 
    reportInterval: number = null;
    minimumReportInterval: number = null;
    getCurrentReading(): LightSensorReading {
        throw new Error('LightSensor#getCurrentReading not implemented')
    }
    static getDefault(): LightSensor {
        throw new Error('LightSensor#getDefault not implemented')
    }

    #readingChanged: Set<TypedEventHandler<LightSensor, LightSensorReadingChangedEventArgs>> = new Set();
    @Enumerable(true)
    set onreadingchanged(handler: TypedEventHandler<LightSensor, LightSensorReadingChangedEventArgs>) {
        this.#readingChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'readingchanged':
                this.#readingChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'readingchanged':
                this.#readingChanged.delete(handler);
                break;
        }
    }
}
