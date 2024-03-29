// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IVector } from "../../../Foundation/Collections/IVector`1";
import { DateTime } from "../../../Foundation/DateTime";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { Certificate } from "./Certificate";

@GenerateShim('Windows.Security.Cryptography.Certificates.ChainBuildingParameters')
export class ChainBuildingParameters { 
    validationTimestamp: Date = null;
    revocationCheckEnabled: boolean = null;
    networkRetrievalEnabled: boolean = null;
    currentTimeValidationEnabled: boolean = null;
    authorityInformationAccessEnabled: boolean = null;
    enhancedKeyUsages: IVector<string> = null;
    exclusiveTrustRoots: IVector<Certificate> = null;
}
