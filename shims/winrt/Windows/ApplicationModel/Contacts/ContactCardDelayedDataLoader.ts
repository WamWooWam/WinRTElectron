// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:00 2021
// </auto-generated>
// --------------------------------------------------

import { Contact } from "./Contact";
import { IClosable } from "../../Foundation/IClosable";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.ApplicationModel.Contacts.ContactCardDelayedDataLoader')
export class ContactCardDelayedDataLoader implements IClosable { 
    setData(contact: Contact): void {
        console.warn('ContactCardDelayedDataLoader#setData not implemented')
    }
    close(): void {
        console.warn('ContactCardDelayedDataLoader#close not implemented')
    }
}
