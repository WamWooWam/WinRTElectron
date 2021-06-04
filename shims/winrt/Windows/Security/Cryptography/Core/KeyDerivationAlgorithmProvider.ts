// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:07 2021
// </auto-generated>
// --------------------------------------------------

import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { CryptographicKey } from "./CryptographicKey";
import { IBuffer } from "../../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Security.Cryptography.Core.KeyDerivationAlgorithmProvider')
export class KeyDerivationAlgorithmProvider { 
    algorithmName: string = null;
    createKey(keyMaterial: IBuffer): CryptographicKey {
        throw new Error('KeyDerivationAlgorithmProvider#createKey not implemented')
    }
    static openAlgorithm(algorithm: string): KeyDerivationAlgorithmProvider {
        throw new Error('KeyDerivationAlgorithmProvider#openAlgorithm not implemented')
    }
}