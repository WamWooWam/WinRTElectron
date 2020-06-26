import { Manager } from "./ManagerBase"
import { Client } from "./Client"
import { Collection } from "./Utils"
import { Account } from "./Account";
import { Contact } from "./Contact";
import * as _ from "lodash";
import { WindowsLive } from "../Enums";

export class PeopleManager extends Manager {

    constructor(client: Client) {
        super(client)
    }

    initialiseDatabase(db: IDBDatabase) {
        let contacts_store = db.createObjectStore("contacts_store", { keyPath: "objectId", autoIncrement: true });
        contacts_store.createIndex("firstName", "firstName", { unique: false });
        contacts_store.createIndex("middleName", "middleName", { unique: false });
        contacts_store.createIndex("lastName", "lastName", { unique: false });
        contacts_store.createIndex("nickName", "nickName", { unique: false });
        contacts_store.createIndex("emailAddress", "emailAddress", { unique: false });
        contacts_store.createIndex("accountId", "accountId", { unique: false });
    }

    createContactForDefaultAccount() {
        
    }

    createContact(account: Account) {
        let contact = new Contact(this)
        contact.accountId = account.objectId;
        return contact;
    }

    saveContact(contact: Contact) {
        let transaction = this.client.db.transaction(['contacts_store'], 'readwrite');
        let objectStore = transaction.objectStore('contacts_store');
        let request = objectStore.add(contact);
    }

    tryLoadPerson(id: string) {
        return null;
    }

    getFavoritePeople() {
        return new Collection([]);
    }

    getPeopleNameBetween(onlineFilter: WindowsLive.Platform.OnlineStatusFilter, lowerBound: string, lowerBoundInclusive: boolean, upperBound: string, upperBoundInclusive: boolean) {
        return new Collection([])
    }
}