// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncAction } from "../../../Foundation/IAsyncAction";
import { IAsyncOperation } from "../../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { CertificateRequestProperties } from "./CertificateRequestProperties";
import { ExportOption } from "./ExportOption";
import { InstallOptions } from "./InstallOptions";
import { KeyProtectionLevel } from "./KeyProtectionLevel";

@GenerateShim('Windows.Security.Cryptography.Certificates.UserCertificateEnrollmentManager')
export class UserCertificateEnrollmentManager { 
    createRequestAsync(request: CertificateRequestProperties): IAsyncOperation<string> {
        throw new Error('UserCertificateEnrollmentManager#createRequestAsync not implemented')
    }
    installCertificateAsync(certificate: string, installOption: InstallOptions): IAsyncAction {
        throw new Error('UserCertificateEnrollmentManager#installCertificateAsync not implemented')
    }
    importPfxDataAsync(pfxData: string, password: string, exportable: ExportOption, keyProtectionLevel: KeyProtectionLevel, installOption: InstallOptions, friendlyName: string): IAsyncAction {
        throw new Error('UserCertificateEnrollmentManager#importPfxDataAsync not implemented')
    }
    importPfxDataToKspAsync(pfxData: string, password: string, exportable: ExportOption, keyProtectionLevel: KeyProtectionLevel, installOption: InstallOptions, friendlyName: string, keyStorageProvider: string): IAsyncAction {
        throw new Error('UserCertificateEnrollmentManager#importPfxDataToKspAsync not implemented')
    }
}