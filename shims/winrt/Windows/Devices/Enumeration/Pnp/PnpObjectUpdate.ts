// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { PnpObjectType } from "./PnpObjectType";
import { IMapView } from "../../../Foundation/Collections/IMapView`2";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.Enumeration.Pnp.PnpObjectUpdate')
export class PnpObjectUpdate { 
    id: string = null;
    properties: IMapView<string, any> = null;
    type: PnpObjectType = null;
}
