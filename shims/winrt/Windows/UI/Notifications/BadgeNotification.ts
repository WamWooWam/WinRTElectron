// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { XmlDocument } from "../../Data/Xml/Dom/XmlDocument";
import { DateTime } from "../../Foundation/DateTime";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";

@GenerateShim('Windows.UI.Notifications.BadgeNotification')
export class BadgeNotification { 
    expirationTime: Date | null = null;
    content: XmlDocument = null;
    constructor(content: XmlDocument) {
        console.warn('BadgeNotification.ctor not implemented')
    }
}
