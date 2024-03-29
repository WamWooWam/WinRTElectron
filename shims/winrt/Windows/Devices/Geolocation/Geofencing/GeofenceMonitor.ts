// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { Geofence } from "./Geofence";
import { GeofenceMonitorStatus } from "./GeofenceMonitorStatus";
import { GeofenceStateChangeReport } from "./GeofenceStateChangeReport";
import { Geoposition } from "../Geoposition";
import { IVectorView } from "../../../Foundation/Collections/IVectorView`1";
import { IVector } from "../../../Foundation/Collections/IVector`1";
import { Enumerable } from "../../../Foundation/Interop/Enumerable";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { TypedEventHandler } from "../../../Foundation/TypedEventHandler`2";

@GenerateShim('Windows.Devices.Geolocation.Geofencing.GeofenceMonitor')
export class GeofenceMonitor { 
    geofences: IVector<Geofence> = null;
    lastKnownGeoposition: Geoposition = null;
    status: GeofenceMonitorStatus = null;
    static current: GeofenceMonitor = null;
    readReports(): IVectorView<GeofenceStateChangeReport> {
        throw new Error('GeofenceMonitor#readReports not implemented')
    }

    #geofenceStateChanged: Set<TypedEventHandler<GeofenceMonitor, any>> = new Set();
    @Enumerable(true)
    set ongeofencestatechanged(handler: TypedEventHandler<GeofenceMonitor, any>) {
        this.#geofenceStateChanged.add(handler);
    }

    #statusChanged: Set<TypedEventHandler<GeofenceMonitor, any>> = new Set();
    @Enumerable(true)
    set onstatuschanged(handler: TypedEventHandler<GeofenceMonitor, any>) {
        this.#statusChanged.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'geofencestatechanged':
                this.#geofenceStateChanged.add(handler);
                break;
            case 'statuschanged':
                this.#statusChanged.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'geofencestatechanged':
                this.#geofenceStateChanged.delete(handler);
                break;
            case 'statuschanged':
                this.#statusChanged.delete(handler);
                break;
        }
    }
}
