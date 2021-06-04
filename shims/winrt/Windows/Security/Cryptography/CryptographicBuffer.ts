
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { BinaryStringEncoding } from "./BinaryStringEncoding";
import { IBuffer } from "../../Storage/Streams/IBuffer";

@GenerateShim('Windows.Security.Cryptography.CryptographicBuffer')
export class CryptographicBuffer {

    static encodeToHexString(buffer: IBuffer): string {
        return Buffer.from(buffer).toString("hex")
    }

    static encodeToBase64String(buffer: IBuffer): string {
        return Buffer.from(buffer).toString("base64")
    }

    static convertStringToBinary(value: string, encoding: BinaryStringEncoding): IBuffer {
        var encoder = new TextEncoder(); // we cant really use encoding :c
        return encoder.encode(value);
    }

    static compare(object1: IBuffer, object2: IBuffer): boolean {
        throw new Error('CryptographicBuffer#compare not implemented')
    }
    static generateRandom(length: number): IBuffer {
        throw new Error('CryptographicBuffer#generateRandom not implemented')
    }
    static generateRandomNumber(): number {
        throw new Error('CryptographicBuffer#generateRandomNumber not implemented')
    }
    static createFromByteArray(value: number[]): IBuffer {
        throw new Error('CryptographicBuffer#createFromByteArray not implemented')
    }
    static copyToByteArray(buffer: IBuffer): number[] {
        throw new Error('CryptographicBuffer#copyToByteArray not implemented')
    }
    static decodeFromHexString(value: string): IBuffer {
        throw new Error('CryptographicBuffer#decodeFromHexString not implemented')
    }
    static decodeFromBase64String(value: string): IBuffer {
        throw new Error('CryptographicBuffer#decodeFromBase64String not implemented')
    }
    static convertBinaryToString(encoding: BinaryStringEncoding, buffer: IBuffer): string {
        throw new Error('CryptographicBuffer#convertBinaryToString not implemented')
    }
}
