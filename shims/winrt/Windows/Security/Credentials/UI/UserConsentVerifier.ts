// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { UserConsentVerificationResult } from "./UserConsentVerificationResult";
import { UserConsentVerifierAvailability } from "./UserConsentVerifierAvailability";

@GenerateShim('Windows.Security.Credentials.UI.UserConsentVerifier')
export class UserConsentVerifier { 
    static checkAvailabilityAsync(): IAsyncOperation<UserConsentVerifierAvailability> {
        throw new Error('UserConsentVerifier#checkAvailabilityAsync not implemented')
    }
    static requestVerificationAsync(message: string): IAsyncOperation<UserConsentVerificationResult> {
        throw new Error('UserConsentVerifier#requestVerificationAsync not implemented')
    }
}