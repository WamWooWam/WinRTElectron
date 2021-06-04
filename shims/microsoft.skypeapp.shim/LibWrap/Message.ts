// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { MediaDocument } from "./MediaDocument";
import { MessageGetLocationResult } from "./MessageGetLocationResult";
import { OnPropertyChangeType } from "./OnPropertyChangeType";
import { Sms } from "./Sms";
import { VectUnsignedInt } from "./VectUnsignedInt";
import { VideoMessage } from "./VideoMessage";
import { Voicemail } from "./Voicemail";
import { IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { Message as DiscordMessage } from "discord.js"
import { PROPKEY } from "./PROPKEY";

@GenerateShim('LibWrap.Message')
export class Message implements IClosable {
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

    private message: DiscordMessage;
    private objectId: number;
    constructor(message: DiscordMessage, id: number) {
        this.message = message;
        this.objectId = id;
    }

    getObjectID(): number {
        return this.objectId;
    }
    getDbID(): number {
        return this.objectId;
    }

    getStrProperty(propKey: number): string {
        for (const key of Object.keys(PROPKEY)) {
            if (PROPKEY[key] == propKey) {
                console.warn("string PROPKEY." + key);
            }
        }

        return "";
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        for (const key of Object.keys(PROPKEY)) {
            if (PROPKEY[key] == propKey) {
                console.warn("string w/o Xml PROPKEY." + key);
            }
        }

        return "";
    }

    getIntProperty(propKey: number): number {
        for (const key of Object.keys(PROPKEY)) {
            if (PROPKEY[key] == propKey) {
                console.warn("int PROPKEY." + key);
            }
        }

        if (propKey == PROPKEY.message_TYPE)
            return Message.type_POSTED_TEXT

        if (propKey == PROPKEY.message_CONSUMPTION_STATUS)
            return Message.consumption_STATUS_UNCONSUMED_NORMAL;

        if (propKey == PROPKEY.message_TIMESTAMP)
            return this.message.createdTimestamp;
            
        return 0;
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('Message#setExtendedStrProperty not implemented')
    }
    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('Message#setExtendedIntProperty not implemented')
    }
    static typetoString(val: number): string {
        throw new Error('Message#typetoString not implemented')
    }
    static sending_STATUSToString(val: number): string {
        throw new Error('Message#sending_STATUSToString not implemented')
    }
    static consumption_STATUSToString(val: number): string {
        throw new Error('Message#consumption_STATUSToString not implemented')
    }
    static set_METADATA_KEYToString(val: number): string {
        throw new Error('Message#set_METADATA_KEYToString not implemented')
    }
    static set_OPTION_KEYToString(val: number): string {
        throw new Error('Message#set_OPTION_KEYToString not implemented')
    }
    static leavereasontoString(val: number): string {
        throw new Error('Message#leavereasontoString not implemented')
    }
    static permissionstoString(val: number): string {
        throw new Error('Message#permissionstoString not implemented')
    }
    canEdit(): boolean {
        throw new Error('Message#canEdit not implemented')
    }
    getPermissions(): number {
        throw new Error('Message#getPermissions not implemented')
    }
    edit(newText: string, isXML: boolean, undo: boolean, legacyPrefix: string): boolean {
        throw new Error('Message#edit not implemented')
    }
    getContacts(contacts: VectUnsignedInt): boolean {
        throw new Error('Message#getContacts not implemented')
    }
    getTransfers(transfers: VectUnsignedInt): boolean {
        throw new Error('Message#getTransfers not implemented')
    }
    getVoiceMessage(voicemail: Voicemail): boolean {
        throw new Error('Message#getVoiceMessage not implemented')
    }
    getSMS(sms: Sms): boolean {
        throw new Error('Message#getSMS not implemented')
    }
    deleteLocally(): boolean {
        throw new Error('Message#deleteLocally not implemented')
    }
    getOtherLiveMessage(): number {
        throw new Error('Message#getOtherLiveMessage not implemented')
    }
    getVideoMessage(videoMessage: VideoMessage): boolean {
        throw new Error('Message#getVideoMessage not implemented')
    }
    getLocation(): MessageGetLocationResult {
        throw new Error('Message#getLocation not implemented')
    }
    getMediaDocument(document: MediaDocument): boolean {
        throw new Error('Message#getMediaDocument not implemented')
    }
    discard(): void {
        console.warn('Message#discard not implemented')
    }
    getBodyHtml(): string {
        return this.message.content;
    }
    getBodyText(): string {
        return this.message.content;
    }
    getAuthorDisplayNameHtml(): string {
        throw new Error('Message#getAuthorDisplayNameHtml not implemented')
    }
    getVideoMessageAsync(): IAsyncOperation<VideoMessage> {
        throw new Error('Message#getVideoMessageAsync not implemented')
    }
    close(): void {
        console.warn('Message#close not implemented')
    }

    private __propertyChange: Set<OnPropertyChangeType> = new Set();
    @Enumerable(true)
    set onpropertychange(handler: OnPropertyChangeType) {
        this.__propertyChange.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertychange':
                this.__propertyChange.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertychange':
                this.__propertyChange.delete(handler);
                break;
        }
    }
}