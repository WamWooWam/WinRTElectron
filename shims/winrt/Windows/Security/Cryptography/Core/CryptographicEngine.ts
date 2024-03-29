// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:06 2021
// </auto-generated>
// --------------------------------------------------

import { IAsyncOperation } from "../../../Foundation/IAsyncOperation`1";
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { CryptographicKey } from "./CryptographicKey";
import { EncryptedAndAuthenticatedData } from "./EncryptedAndAuthenticatedData";
import { KeyDerivationParameters } from "./KeyDerivationParameters";
import { IBuffer } from "../../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Security.Cryptography.Core.CryptographicEngine')
export class CryptographicEngine { 
    static signHashedData(key: CryptographicKey, data: IBuffer): IBuffer {
        throw new Error('CryptographicEngine#signHashedData not implemented')
    }
    static verifySignatureWithHashInput(key: CryptographicKey, data: IBuffer, signature: IBuffer): boolean {
        throw new Error('CryptographicEngine#verifySignatureWithHashInput not implemented')
    }
    static decryptAsync(key: CryptographicKey, data: IBuffer, iv: IBuffer): IAsyncOperation<IBuffer> {
        throw new Error('CryptographicEngine#decryptAsync not implemented')
    }
    static signAsync(key: CryptographicKey, data: IBuffer): IAsyncOperation<IBuffer> {
        throw new Error('CryptographicEngine#signAsync not implemented')
    }
    static signHashedDataAsync(key: CryptographicKey, data: IBuffer): IAsyncOperation<IBuffer> {
        throw new Error('CryptographicEngine#signHashedDataAsync not implemented')
    }
    static encrypt(key: CryptographicKey, data: IBuffer, iv: IBuffer): IBuffer {
        throw new Error('CryptographicEngine#encrypt not implemented')
    }
    static decrypt(key: CryptographicKey, data: IBuffer, iv: IBuffer): IBuffer {
        throw new Error('CryptographicEngine#decrypt not implemented')
    }
    static encryptAndAuthenticate(key: CryptographicKey, data: IBuffer, nonce: IBuffer, authenticatedData: IBuffer): EncryptedAndAuthenticatedData {
        throw new Error('CryptographicEngine#encryptAndAuthenticate not implemented')
    }
    static decryptAndAuthenticate(key: CryptographicKey, data: IBuffer, nonce: IBuffer, authenticationTag: IBuffer, authenticatedData: IBuffer): IBuffer {
        throw new Error('CryptographicEngine#decryptAndAuthenticate not implemented')
    }
    static sign(key: CryptographicKey, data: IBuffer): IBuffer {
        throw new Error('CryptographicEngine#sign not implemented')
    }
    static verifySignature(key: CryptographicKey, data: IBuffer, signature: IBuffer): boolean {
        throw new Error('CryptographicEngine#verifySignature not implemented')
    }
    static deriveKeyMaterial(key: CryptographicKey, parameters: KeyDerivationParameters, desiredKeySize: number): IBuffer {
        throw new Error('CryptographicEngine#deriveKeyMaterial not implemented')
    }
}
