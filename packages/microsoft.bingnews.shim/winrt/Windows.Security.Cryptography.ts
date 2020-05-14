export namespace Security.Cryptography {
    export class CryptographicBuffer {
        static encodeToBase64String(buff: Uint8Array) {
            var decoder = new TextDecoder('utf8');
            return btoa(decoder.decode(buff));
        }
    }
}