import { Conversation } from "./Conversation";
import { VectGIString, VectUnsignedInt } from "./Vect";
import { Binary } from "./Binary";
import { uuidv4 } from "winrt-node/util";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";
import { PROPKEY } from "./PROPKEY";

export class Contact {
    static capabilitystatus_CAPABILITY_EXISTS: number = 2;
    static capabilitystatus_CAPABILITY_MIXED: number = 1;
    static capabilitystatus_NO_CAPABILITY: number = 0;
    static capability_CAPABILITY_PUBLIC_CONTACT: number = 14;
    static capability_CAPABILITY_MOBILE_DEVICE: number = 13;
    static capability_CAPABILITY_VOICE_EVER: number = 12;
    static capability_CAPABILITY_TEXT_EVER: number = 11;
    static capability_CAPABILITY_PSTN_TRANSFER: number = 10;
    static capability_CAPABILITY_COMMERCIAL_CONTACT: number = 9;
    static capability_CAPABILITY_LARGE_CONFERENCE: number = 8;
    static capability_CAPABILITY_SERVICE_PROVIDER: number = 7;
    static capability_CAPABILITY_TEXT: number = 6;
    static capability_CAPABILITY_VIDEO: number = 5;
    static capability_CAPABILITY_CALL_FORWARD: number = 4;
    static capability_CAPABILITY_CAN_BE_SENT_VM: number = 3;
    static capability_CAPABILITY_SKYPEIN: number = 2;
    static capability_CAPABILITY_SKYPEOUT: number = 1;
    static capability_CAPABILITY_VOICEMAIL: number = 0;
    static extra_AUTHREQ_FIELDS_SEND_VERIFIED_COMPANY: number = 2;
    static extra_AUTHREQ_FIELDS_SEND_VERIFIED_EMAIL: number = 1;
    static availability_SKYPE_ME_FROM_MOBILE: number = 20;
    static availability_DO_NOT_DISTURB_FROM_MOBILE: number = 18;
    static availability_NOT_AVAILABLE_FROM_MOBILE: number = 17;
    static availability_AWAY_FROM_MOBILE: number = 16;
    static availability_ONLINE_FROM_MOBILE: number = 15;
    static availability_CONNECTING: number = 14;
    static availability_INVISIBLE: number = 6;
    static availability_SKYPE_ME: number = 7;
    static availability_DO_NOT_DISTURB: number = 5;
    static availability_NOT_AVAILABLE: number = 4;
    static availability_AWAY: number = 3;
    static availability_ONLINE: number = 2;
    static availability_OFFLINE_BUT_CF_ABLE: number = 13;
    static availability_OFFLINE_BUT_VM_ABLE: number = 12;
    static availability_OFFLINE: number = 1;
    static availability_SKYPEOUT: number = 10;
    static availability_BLOCKED_SKYPEOUT: number = 11;
    static availability_BLOCKED: number = 9;
    static availability_PENDINGAUTH: number = 8;
    static availability_UNKNOWN: number = 0;
    static authlevel_BLOCKED_BY_ME: number = 2;
    static authlevel_AUTHORIZED_BY_ME: number = 1;
    static authlevel_NONE: number = 0;
    static type_LYNC: number = 9;
    static type_PASSPORT: number = 8;
    static type_XMPP: number = 7;
    static type_EXTERNAL: number = 6;
    static type_UNDISCLOSED_PSTN: number = 5;
    static type_FREE_PSTN: number = 4;
    static type_EMERGENCY_PSTN: number = 3;
    static type_PSTN: number = 2;
    static type_SKYPE: number = 1;
    static type_UNRECOGNIZED: number = 0;

    private _id: number;
    private _identity: string;
    private _moodText: string;

    constructor(identity?: string) {
        this._id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this._identity = identity ?? uuidv4();
        this._moodText = "I <b>HATE</b> JavaScript";

        return new Proxy(this, new ShimProxyHandler(`Contact (${this._id}/${this._identity})`));
    }

    getObjectID(): number {
        return this._id;
    }

    getDbID(): number {
        return this._id;
    }

    getStrProperty(propKey: number): string {
        console.warn('shimmed function Contact.getStrProperty:' + propKey);

        switch (propKey) {
            case PROPKEY.contact_MOOD_TEXT:
                return this._moodText;
        }
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Contact.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        console.warn('shimmed function Contact.getIntProperty');

        switch (propKey) {
            case PROPKEY.contact_AVAILABILITY:
                return Contact.availability_ONLINE;
        }
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Contact.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Contact.setExtendedIntProperty');
    }

    getContactType(): number {
        return Contact.type_SKYPE;
    }

    getIdentity(): string {
        return this._identity;
    }

    getAvatar(avatar: Binary): Boolean {
        throw new Error('shimmed function Contact.getAvatar');
    }

    getProfileAttachment(attachmentID: string, attachment: Binary): Boolean {
        throw new Error('shimmed function Contact.getProfileAttachment');
    }

    getVerifiedEmail(): string {
        throw new Error('shimmed function Contact.getVerifiedEmail');
    }

    getVerifiedCompany(): string {
        throw new Error('shimmed function Contact.getVerifiedCompany');
    }

    isMemberOf(groupObjectID: number): Boolean {
        throw new Error('shimmed function Contact.isMemberOf');
    }

    isMemberOfHardwiredGroup(groupType: number): Boolean {
        throw new Error('shimmed function Contact.isMemberOfHardwiredGroup');
    }

    getUnifiedMasters(masters: VectUnsignedInt): void {
        console.warn('shimmed function Contact.getUnifiedMasters');
    }

    getUnifiedServants(servants: VectUnsignedInt): void {
        console.warn('shimmed function Contact.getUnifiedServants');
    }

    setBlocked(blocked: Boolean, abuse: Boolean): Boolean {
        throw new Error('shimmed function Contact.setBlocked');
    }

    ignoreAuthRequest(): Boolean {
        throw new Error('shimmed function Contact.ignoreAuthRequest');
    }

    giveDisplayName(name: string): Boolean {
        throw new Error('shimmed function Contact.giveDisplayName');
    }

    assignSpeedDial(dial: string): Boolean {
        throw new Error('shimmed function Contact.assignSpeedDial');
    }

    setBuddyStatus(isMyBuddy: Boolean, syncAuth: Boolean): Boolean {
        throw new Error('shimmed function Contact.setBuddyStatus');
    }

    sendAuthRequest(message: string, extras_bitmask: number): Boolean {
        throw new Error('shimmed function Contact.sendAuthRequest');
    }

    hasAuthorizedMe(): Boolean {
        throw new Error('shimmed function Contact.hasAuthorizedMe');
    }

    setPhoneNumber(num: number, label: string, number: string): Boolean {
        throw new Error('shimmed function Contact.setPhoneNumber');
    }

    copyLocalDataFrom(fromContactObjectID: number): Boolean {
        throw new Error('shimmed function Contact.copyLocalDataFrom');
    }

    openConversation(conversation: Conversation): Boolean {
        throw new Error('shimmed function Contact.openConversation');
    }

    hasCapability(capability: number, queryServer: Boolean): Boolean {
        throw new Error('shimmed function Contact.hasCapability');
    }

    getCapabilityStatus(capability: number, queryServer: Boolean): number {
        throw new Error('shimmed function Contact.getCapabilityStatus');
    }

    refreshProfile(): void {
        console.warn('shimmed function Contact.refreshProfile');
    }

    getKnownRemoteVersions(versions: VectGIString, useMSNPPresence: Boolean): void {
        console.warn('shimmed function Contact.getKnownRemoteVersions');
    }

    discard(): void {
        console.warn('shimmed function Contact.discard');
    }

    getAuthRequestMessageHtml(): string {
        throw new Error('shimmed function Contact.getAuthRequestMessageHtml');
    }

    getDisplayNameHtml(): string {
        console.warn('shimmed function Contact.getDisplayNameHtml');
        return "Thomas May";
    }

    getFullNameHtml(): string {
        console.warn('shimmed function Contact.getFullNameHtml');
        return "Thomas May";
    }

    getMoodTextHtml(): string {
        console.warn('shimmed function Contact.getMoodTextHtml');
        return this._moodText;
    }

    close(): void {
        console.warn('shimmed function Contact.close');
    }

    static typetoString(val: number): string {
        throw new Error('shimmed function Contact.typetoString');
    }

    static authleveltoString(val: number): string {
        throw new Error('shimmed function Contact.authleveltoString');
    }

    static availabilitytoString(val: number): string {
        throw new Error('shimmed function Contact.availabilitytoString');
    }

    static extra_AUTHREQ_FIELDSToString(val: number): string {
        throw new Error('shimmed function Contact.extra_AUTHREQ_FIELDSToString');
    }

    static capabilitytoString(val: number): string {
        throw new Error('shimmed function Contact.capabilitytoString');
    }

    static capabilitystatustoString(val: number): string {
        throw new Error('shimmed function Contact.capabilitystatustoString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Contact::addEventListener: ${name}`);
        switch (name) {
            case "propertychange": // OnPropertyChangeType
                break;
        }

    }
}