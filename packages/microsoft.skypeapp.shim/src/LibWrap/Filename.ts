export class Filename {
    constructor(fromString: string) { }

    setFromString(fromString: string): Boolean {
        return true;
    }

    close(): void {
        console.warn('shimmed function Filename.close');
    }
}