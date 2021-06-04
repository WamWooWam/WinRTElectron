// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:02 2021
// </auto-generated>
// --------------------------------------------------

import { MagneticStripeReaderAuthenticationLevel } from "./MagneticStripeReaderAuthenticationLevel";
import { UnifiedPosPowerReportingType } from "./UnifiedPosPowerReportingType";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.Devices.PointOfService.MagneticStripeReaderCapabilities')
export class MagneticStripeReaderCapabilities { 
    authenticationLevel: MagneticStripeReaderAuthenticationLevel = null;
    cardAuthentication: string = null;
    isIsoSupported: boolean = null;
    isJisOneSupported: boolean = null;
    isJisTwoSupported: boolean = null;
    isStatisticsReportingSupported: boolean = null;
    isStatisticsUpdatingSupported: boolean = null;
    isTrackDataMaskingSupported: boolean = null;
    isTransmitSentinelsSupported: boolean = null;
    powerReportingType: UnifiedPosPowerReportingType = null;
    supportedEncryptionAlgorithms: number = null;
}