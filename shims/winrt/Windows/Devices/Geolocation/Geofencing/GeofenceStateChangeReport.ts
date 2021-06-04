// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { Geofence } from "./Geofence";
import { GeofenceRemovalReason } from "./GeofenceRemovalReason";
import { GeofenceState } from "./GeofenceState";
import { Geoposition } from "../Geoposition";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.Geolocation.Geofencing.GeofenceStateChangeReport')
export class GeofenceStateChangeReport { 
    geofence: Geofence = null;
    geoposition: Geoposition = null;
    newState: GeofenceState = null;
    removalReason: GeofenceRemovalReason = null;
}