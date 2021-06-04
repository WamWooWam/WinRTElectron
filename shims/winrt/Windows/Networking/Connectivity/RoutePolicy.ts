// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { ConnectionProfile } from "./ConnectionProfile";
import { DomainNameType } from "../DomainNameType";
import { HostName } from "../HostName";

@GenerateShim('Windows.Networking.Connectivity.RoutePolicy')
export class RoutePolicy { 
    connectionProfile: ConnectionProfile = null;
    hostName: HostName = null;
    hostNameType: DomainNameType = null;
    constructor(connectionProfile: ConnectionProfile, hostName: HostName, type: DomainNameType) {
        console.warn('RoutePolicy.ctor not implemented')
    }
}