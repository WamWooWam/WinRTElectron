import { PlatformObject } from "./PlatformObject";
import { Collection } from "./Utils";
import { UserTile } from "./UserTile";
import { WindowsLive } from "../Enums";
import { Account } from "./Account";
import { Person } from "./Person";
import { PeopleManager } from "./PeopleManager";
import { Enumerable } from "winrt-node/Windows.Foundation";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";

export class Contact extends PlatformObject {
    yomiLastName: string;
    yomiFirstName: string;
    yomiCompanyName: string;
    webSite: string;
    trustLevel: WindowsLive.Platform.ContactTrustLevel;
    title: string;
    suffix: string;
    significantOther: string;
    personalEmailAddress: string;
    pagerNumber: string;
    notes: string;
    homePhoneNumber: string;
    homeLocation: Location;
    homeFaxNumber: string;
    home2PhoneNumber: string;
    mobilePhoneNumber: string;
    companyName: string;
    mobile2PhoneNumber: string;
    otherEmailAddress: string;
    businessPhoneNumber: string;
    businessLocation: Location;
    businessFaxNumber: string;
    otherLocation: Location;
    business2PhoneNumber: string;
    birthdate: Date;
    anniversary: Date;
    alias: string;
    jobTitle: string;
    officeLocation: string;
    businessEmailAddress: string;
    imtype: WindowsLive.Platform.ContactIMType;
    person: Person;
    account: Account;
    cid: number;
    canIMNow: Boolean;
    supportsMobileIM: Boolean;
    thirdPartyObjectId: string;
    canOIM: Boolean;
    federatedEmailAddress: string;
    verbs: Collection;
    isBuddy: Boolean;
    windowsLiveEmailAddress: string;
    yahooEmailAddress: string;
    isPublicEntity: Boolean;
    mainMri: string;
    linkType: WindowsLive.Platform.ContactLinkingType;
    nickname: string;
    middleName: string;
    lastName: string;
    firstName: string;
    onlineStatus: WindowsLive.Platform.ContactStatus;
    calculatedUIName: string;
    isGal: Boolean;

    constructor(manager: PeopleManager) {
        super("Contact");
    }

    unlink(): void {
        console.warn('shimmed function Contact.unlink');
    }

    commit(): void {
        console.warn('shimmed function Contact.commit');
    }

    deleteObject(): void {
        console.warn('shimmed function Contact.deleteObject');
    }

    getKeepAlive(): any {
        throw new Error('shimmed function Contact.getKeepAlive');
    }

    getUserTile(size: WindowsLive.Platform.UserTileSize, cachedOnly: Boolean): UserTile {
        throw new Error('shimmed function Contact.getUserTile');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Contact::addEventListener: ${name}`);
        switch (name) {
            case "changed": // ObjectChangedHandler
            case "deleted": // ObjectChangedHandler
                break;
        }

    }
}