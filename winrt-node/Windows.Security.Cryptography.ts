import * as crypto from 'crypto'

export namespace Security.Cryptography {
    export class CryptographicBuffer {
        static encodeToBase64String(buff: Uint8Array) {
            return Buffer.from(buff).toString('base64');
        }

        static encodeToHexString(buff: Uint8Array) {
            return Buffer.from(buff).toString('hex');
        }

        static convertStringToBinary(str: string, encoding: BinaryStringEncoding){
            var encoder = new TextEncoder(); // we cant really use encoding :c
            return encoder.encode(str);
        }
    }

    export enum BinaryStringEncoding {
        utf8,
        utf16LE,
        utf16BE
    }

    export namespace Core {
        export class HashAlgorithmProvider {
            static openAlgorithm(algorithm: string): HashAlgorithmProvider {
                return new HashAlgorithmProvider(algorithm);
            }

            private algo: string;

            constructor(algorithm: string) {
                this.algo = algorithm.toLowerCase();
            }

            hashData(data: Uint8Array): Uint8Array {
                let hash = crypto.createHash(this.algo);
                hash.update(data);

                return hash.digest();
            }
        }

        export class HashAlgorithmNames {
            static md5: string = "MD5";
            static sha1: string = "SHA1";
            static sha256: string = "SHA256";
            static sha384: string = "SHA384";
            static sha512: string = "SHA512";
        }
    }
}