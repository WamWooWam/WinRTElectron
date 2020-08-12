import { IAsyncOperation, Collections } from "./Windows.Foundation";
import { IpcHelper } from "./IpcHelper";

export class Contact {
    id: string;
}

export class ContactPicker {
    commitButtonText: string;
    selectionMode: ContactSelectionMode;

    pickContactsAsync(): IAsyncOperation<Collections.Vector<Contact>> {
        return IAsyncOperation.wrap((async () => {
            let resp = await IpcHelper.send("contact-picker", { commitButtonText: this.commitButtonText, selectionMode: this.selectionMode });

            return new Collections.Vector<Contact>([]);
        })())
    }
}

export enum ContactSelectionMode {
    contacts, fields
}