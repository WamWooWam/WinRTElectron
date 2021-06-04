
import { GenerateShim } from "../../../Foundation/Interop/GenerateShim";
import { CryptographicHash } from "./CryptographicHash";
import { IBuffer } from "../../../Storage/Streams/IBuffer";
import crypto from "crypto";

@GenerateShim('Windows.Security.Cryptography.Core.HashAlgorithmProvider')
export class HashAlgorithmProvider { 
    constructor(algorithm: string) {
        this.algorithmName = algorithm.toLowerCase();
    }

    algorithmName: string = null;    
    hashLength: number = null;

    hashData(data: IBuffer): IBuffer {
        let hash = crypto.createHash(this.algorithmName);
        hash.update(data);

        return hash.digest();
    }

    createHash(): CryptographicHash {
        throw new Error('HashAlgorithmProvider#createHash not implemented')
    }

    static openAlgorithm(algorithm: string): HashAlgorithmProvider {
        return new HashAlgorithmProvider(algorithm);
    }
}
