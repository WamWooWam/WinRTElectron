export class Binary {

    set(bytes: /* System.Byte[] */ any): void {
        console.warn('shimmed function Binary.set');
    }

    getAsBase64(): string {
        throw new Error('shimmed function Binary.getAsBase64');
    }

    append(other: Binary): void {
        console.warn('shimmed function Binary.append');
    }

    close(): void {
        console.warn('shimmed function Binary.close');
    }

}