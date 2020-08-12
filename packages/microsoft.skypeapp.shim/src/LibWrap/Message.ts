import { VectUnsignedInt } from "./Vect";
import { IAsyncOperation } from "winrt-node/Windows.Foundation";

export class Message {
    static permissions_PERM_DELETABLE: number = 2;
    static permissions_PERM_EDITABLE: number = 1;
    static permissions_PERM_NONE: number = 0;
    static leavereason_INTERNAL_ERROR: number = 8;
    static leavereason_CHAT_FULL: number = 7;
    static leavereason_UNSUBSCRIBE: number = 6;
    static leavereason_DECLINE_ADD: number = 5;
    static leavereason_ADDER_MUST_BE_AUTHORIZED: number = 4;
    static leavereason_ADDER_MUST_BE_FRIEND: number = 3;
    static leavereason_USER_INCAPABLE: number = 2;
    static leavereason_USER_NOT_FOUND: number = 1;
    static set_OPTION_KEY_SET_OPTION_ADMIN_ONLY_ACTIVITIES: number = 3637;
    static set_OPTION_KEY_SET_OPTION_HISTORY_LIMIT_IN_DAYS: number = 3633;
    static set_OPTION_KEY_SET_OPTION_DISCLOSE_HISTORY: number = 3629;
    static set_OPTION_KEY_SET_OPTION_ENTRY_LEVEL_RANK: number = 3625;
    static set_OPTION_KEY_SET_OPTION_JOINING_ENABLED: number = 3689;
    static set_METADATA_KEY_SET_META_PICTURE: number = 3658;
    static set_METADATA_KEY_SET_META_GUIDELINES: number = 3652;
    static set_METADATA_KEY_SET_META_TOPIC: number = 3644;
    static set_METADATA_KEY_SET_META_NAME: number = 3640;
    static consumption_STATUS_UNCONSUMED_ELEVATED: number = 3;
    static consumption_STATUS_UNCONSUMED_NORMAL: number = 2;
    static consumption_STATUS_UNCONSUMED_SUPPRESSED: number = 1;
    static consumption_STATUS_CONSUMED: number = 0;
    static sending_STATUS_FAILED_TO_SEND: number = 3;
    static sending_STATUS_SENT: number = 2;
    static sending_STATUS_SENDING: number = 1;
    static sending_STATUS_SENDING_STATUS_UNKNOWN: number = 0;
    static type_RECEIVED_DELIVERY_FAILURE_NOTIFICATION: number = 80;
    static type_POSTED_DTMF: number = 62;
    static type_UNBLOCKED: number = 54;
    static type_REVOKED_AUTH: number = 52;
    static type_EJECTED_FROM_LIVESESSION: number = 38;
    static type_LEFT_LIVESESSION: number = 37;
    static type_HAD_VIDEO_ERROR: number = 36;
    static type_HAD_VOICE_ERROR: number = 35;
    static type_PAUSED_LIVESESSION: number = 34;
    static type_JOINED_LIVESESSION: number = 33;
    static type_STOPPED_RINGING: number = 32;
    static type_STARTED_RINGING_OTHERS: number = 31;
    static type_TERMINATED_CONVERSATION: number = 3;
    static type_POSTED_VOICE_AUTORESPONSE: number = 66;
    static type_REQUESTED_RANK: number = 20;
    static type_SET_OPTION: number = 1;
    static type_MESSAGE_EXPANSION_END: number = 250;
    static type_POSTED_SKYPECHAT_MESSAGE: number = 203;
    static type_POSTED_LOCATION: number = 202;
    static type_POSTED_MEDIA_MESSAGE: number = 201;
    static type_MESSAGE_EXPANSION_START: number = 200;
    static type_HAS_BIRTHDAY: number = 110;
    static type_LEGACY_MESSAGE: number = 100;
    static type_MISSING_MESSAGES: number = 90;
    static type_POSTED_VIDEO_MESSAGE: number = 70;
    static type_POSTED_INVOICE: number = 69;
    static type_POSTED_FILES: number = 68;
    static type_POSTED_VOICE_MESSAGE: number = 67;
    static type_POSTED_ALERT: number = 65;
    static type_POSTED_SMS: number = 64;
    static type_POSTED_CONTACTS: number = 63;
    static type_POSTED_EMOTE: number = 60;
    static type_POSTED_TEXT: number = 61;
    static type_BLOCKED: number = 53;
    static type_GRANTED_AUTH: number = 51;
    static type_REQUESTED_AUTH: number = 50;
    static type_ENDED_LIVESESSION: number = 39;
    static type_STARTED_LIVESESSION: number = 30;
    static type_SET_RANK: number = 21;
    static type_RETIRED: number = 13;
    static type_RETIRED_OTHERS: number = 12;
    static type_ADDED_APPLICANTS: number = 11;
    static type_ADDED_CONSUMERS: number = 10;
    static type_ADDED_LEGACY_CONSUMERS: number = 9;
    static type_LEGACY_MEMBER_UPGRADED: number = 8;
    static type_SPAWNED_CONFERENCE: number = 4;
    static type_SET_METADATA: number = 2;

    getObjectID(): number {
        throw new Error('shimmed function Message.getObjectID');
    }

    getDbID(): number {
        throw new Error('shimmed function Message.getDbID');
    }

    getStrProperty(propKey: number): string {
        throw new Error('shimmed function Message.getStrProperty');
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Message.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        throw new Error('shimmed function Message.getIntProperty');
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Message.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Message.setExtendedIntProperty');
    }

    canEdit(): Boolean {
        throw new Error('shimmed function Message.canEdit');
    }

    getPermissions(): number {
        throw new Error('shimmed function Message.getPermissions');
    }

    edit(newText: string, isXML: Boolean, undo: Boolean, legacyPrefix: string): Boolean {
        throw new Error('shimmed function Message.edit');
    }

    getContacts(contacts: VectUnsignedInt): Boolean {
        throw new Error('shimmed function Message.getContacts');
    }

    getTransfers(transfers: VectUnsignedInt): Boolean {
        throw new Error('shimmed function Message.getTransfers');
    }

    // getVoiceMessage(voicemail: Voicemail): Boolean {
    //     throw new Error('shimmed function Message.getVoiceMessage');
    // }

    // getSMS(sms: Sms): Boolean {
    //     throw new Error('shimmed function Message.getSMS');
    // }

    deleteLocally(): Boolean {
        throw new Error('shimmed function Message.deleteLocally');
    }

    getOtherLiveMessage(): number {
        throw new Error('shimmed function Message.getOtherLiveMessage');
    }

    // getVideoMessage(videoMessage: VideoMessage): Boolean {
    //     throw new Error('shimmed function Message.getVideoMessage');
    // }

    // getLocation(): MessageGetLocationResult {
    //     throw new Error('shimmed function Message.getLocation');
    // }

    // getMediaDocument(document: MediaDocument): Boolean {
    //     throw new Error('shimmed function Message.getMediaDocument');
    // }

    discard(): void {
        console.warn('shimmed function Message.discard');
    }

    getBodyHtml(): string {
        throw new Error('shimmed function Message.getBodyHtml');
    }

    getBodyText(): string {
        throw new Error('shimmed function Message.getBodyText');
    }

    getAuthorDisplayNameHtml(): string {
        throw new Error('shimmed function Message.getAuthorDisplayNameHtml');
    }

    // getVideoMessageAsync(): IAsyncOperation<VideoMessage> {
    //     throw new Error('shimmed function Message.getVideoMessageAsync');
    // }

    close(): void {
        console.warn('shimmed function Message.close');
    }

    static typetoString(val: number): string {
        throw new Error('shimmed function Message.typetoString');
    }

    static sending_STATUSToString(val: number): string {
        throw new Error('shimmed function Message.sending_STATUSToString');
    }

    static consumption_STATUSToString(val: number): string {
        throw new Error('shimmed function Message.consumption_STATUSToString');
    }

    static set_METADATA_KEYToString(val: number): string {
        throw new Error('shimmed function Message.set_METADATA_KEYToString');
    }

    static set_OPTION_KEYToString(val: number): string {
        throw new Error('shimmed function Message.set_OPTION_KEYToString');
    }

    static leavereasontoString(val: number): string {
        throw new Error('shimmed function Message.leavereasontoString');
    }

    static permissionstoString(val: number): string {
        throw new Error('shimmed function Message.permissionstoString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Message::addEventListener: ${name}`);
        switch (name) {
            case "propertychange": // OnPropertyChangeType
                break;
        }

    }
}