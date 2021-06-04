// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { MagneticStripeReaderTrackData } from "./MagneticStripeReaderTrackData";
import { IMapView } from "../../Foundation/Collections/IMapView`2";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { IBuffer } from "../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Devices.PointOfService.MagneticStripeReaderReport')
export class MagneticStripeReaderReport { 
    additionalSecurityInformation: IBuffer = null;
    cardAuthenticationData: IBuffer = null;
    cardAuthenticationDataLength: number = null;
    cardType: number = null;
    properties: IMapView<string, string> = null;
    track1: MagneticStripeReaderTrackData = null;
    track2: MagneticStripeReaderTrackData = null;
    track3: MagneticStripeReaderTrackData = null;
    track4: MagneticStripeReaderTrackData = null;
}