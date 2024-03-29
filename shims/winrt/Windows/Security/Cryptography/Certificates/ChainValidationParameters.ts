// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { HostName } from "../../../Networking/HostName";
import { CertificateChainPolicy } from "./CertificateChainPolicy";

@GenerateShim('Windows.Security.Cryptography.Certificates.ChainValidationParameters')
export class ChainValidationParameters { 
    serverDnsName: HostName = null;
    certificateChainPolicy: CertificateChainPolicy = null;
}
