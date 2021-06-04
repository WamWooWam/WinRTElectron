// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from Windows 255.255.255.255 at Fri Mar 26 17:23:08 2021
// </auto-generated>
// --------------------------------------------------

import { XmlDocument } from "../../Data/Xml/Dom/XmlDocument";
import { GenerateShim } from "../../Foundation/Interop/GenerateShim";
import { BadgeTemplateType } from "./BadgeTemplateType";
import { BadgeUpdater } from "./BadgeUpdater";

@GenerateShim('Windows.UI.Notifications.BadgeUpdateManager')
export class BadgeUpdateManager { 
    static createBadgeUpdaterForApplication(): BadgeUpdater {
        throw new Error('BadgeUpdateManager#createBadgeUpdaterForApplication not implemented')
    }
    static createBadgeUpdaterForApplicationWithId(applicationId: string): BadgeUpdater {
        throw new Error('BadgeUpdateManager#createBadgeUpdaterForApplicationWithId not implemented')
    }
    static createBadgeUpdaterForSecondaryTile(tileId: string): BadgeUpdater {
        throw new Error('BadgeUpdateManager#createBadgeUpdaterForSecondaryTile not implemented')
    }
    static getTemplateContent(type: BadgeTemplateType): XmlDocument {
        throw new Error('BadgeUpdateManager#getTemplateContent not implemented')
    }
}