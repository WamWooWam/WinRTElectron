import { Filename } from "./Filename";

export class Transfer {
    static failurereason_PLACEHOLDER_TIMEOUT: number = 10;
    static failurereason_TOO_MANY_PARALLEL: number = 9;
    static failurereason_REMOTE_OFFLINE_FOR_TOO_LONG: number = 8;
    static failurereason_REMOTE_DOES_NOT_SUPPORT_FT: number = 7;
    static failurereason_FAILED_REMOTE_WRITE: number = 6;
    static failurereason_FAILED_WRITE: number = 5;
    static failurereason_FAILED_REMOTE_READ: number = 4;
    static failurereason_FAILED_READ: number = 3;
    static failurereason_REMOTELY_CANCELLED: number = 2;
    static failurereason_SENDER_NOT_AUTHORISED: number = 1;
    static status_CANCELLED_BY_REMOTE: number = 12;
    static status_OFFER_FROM_OTHER_INSTANCE: number = 11;
    static status_PLACEHOLDER: number = 10;
    static status_FAILED: number = 9;
    static status_COMPLETED: number = 8;
    static status_CANCELLED: number = 7;
    static status_REMOTELY_PAUSED: number = 6;
    static status_PAUSED: number = 5;
    static status_TRANSFERRING_OVER_RELAY: number = 4;
    static status_TRANSFERRING: number = 3;
    static status_WAITING_FOR_ACCEPT: number = 2;
    static status_CONNECTING: number = 1;
    static status_NEW: number = 0;
    static type_OUTGOING: number = 2;
    static type_INCOMING: number = 1;

    getObjectID(): number {
        throw new Error('shimmed function Transfer.getObjectID');
    }

    getDbID(): number {
        throw new Error('shimmed function Transfer.getDbID');
    }

    getStrProperty(propKey: number): string {
        throw new Error('shimmed function Transfer.getStrProperty');
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Transfer.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        throw new Error('shimmed function Transfer.getIntProperty');
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Transfer.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Transfer.setExtendedIntProperty');
    }

    accept(filenameWithPath: Filename): Boolean {
        throw new Error('shimmed function Transfer.accept');
    }

    pause(): Boolean {
        throw new Error('shimmed function Transfer.pause');
    }

    resume(): Boolean {
        throw new Error('shimmed function Transfer.resume');
    }

    cancel(): Boolean {
        throw new Error('shimmed function Transfer.cancel');
    }

    isController(): Boolean {
        throw new Error('shimmed function Transfer.isController');
    }

    discard(): void {
        console.warn('shimmed function Transfer.discard');
    }

    close(): void {
        console.warn('shimmed function Transfer.close');
    }

    static typetoString(val: number): string {
        throw new Error('shimmed function Transfer.typetoString');
    }

    static statustoString(val: number): string {
        throw new Error('shimmed function Transfer.statustoString');
    }

    static failurereasontoString(val: number): string {
        throw new Error('shimmed function Transfer.failurereasontoString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Transfer::addEventListener: ${name}`);
        switch (name) {
            case "propertychange": // OnPropertyChangeType
                break;
        }

    }
}