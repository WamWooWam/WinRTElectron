// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:05 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { LanIdentifierData } from "./LanIdentifierData";

@GenerateShim('Windows.Networking.Connectivity.LanIdentifier')
export class LanIdentifier { 
    infrastructureId: LanIdentifierData = null;
    networkAdapterId: string = null;
    portId: LanIdentifierData = null;
}
