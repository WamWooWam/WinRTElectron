// --------------------------------------------------
// <auto-generated>
//     This code was generated by tswinrt.
//     Generated from LibWrap 255.255.255.255 at Fri Mar 26 17:24:55 2021
// </auto-generated>
// --------------------------------------------------

import { Binary } from "./Binary";
import { Contact } from "./Contact";
import { OnIncomingDTMFType } from "./OnIncomingDTMFType";
import { OnLiveSessionVideosChangedType } from "./OnLiveSessionVideosChangedType";
import { OnPropertyChangeType } from "./OnPropertyChangeType";
import { VectUnsignedInt } from "./VectUnsignedInt";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { User } from "discord.js";
import { PROPKEY } from "./PROPKEY";

@GenerateShim('LibWrap.Participant')
export class Participant implements IClosable {
    participantContact: Contact = null;

    static dtmf_DTMF_POUND: number = 11;
    static dtmf_DTMF_STAR: number = 10;
    static dtmf_DTMF_9: number = 9;
    static dtmf_DTMF_8: number = 8;
    static dtmf_DTMF_7: number = 7;
    static dtmf_DTMF_6: number = 6;
    static dtmf_DTMF_5: number = 5;
    static dtmf_DTMF_4: number = 4;
    static dtmf_DTMF_3: number = 3;
    static dtmf_DTMF_2: number = 2;
    static dtmf_DTMF_1: number = 1;
    static dtmf_DTMF_0: number = 0;
    static voice_STATUS_PLAYING_VOICE_AUTORESPONSE: number = 10;
    static voice_STATUS_VOICE_STOPPED: number = 9;
    static voice_STATUS_VOICE_ON_HOLD: number = 8;
    static voice_STATUS_SPEAKING: number = 7;
    static voice_STATUS_LISTENING: number = 6;
    static voice_STATUS_EARLY_MEDIA: number = 5;
    static voice_STATUS_RINGING: number = 4;
    static voice_STATUS_VOICE_CONNECTING: number = 3;
    static voice_STATUS_VOICE_AVAILABLE: number = 2;
    static voice_STATUS_VOICE_NA: number = 1;
    static voice_STATUS_VOICE_UNKNOWN: number = 0;
    static text_STATUS_WRITING_AS_CAT: number = 5;
    static text_STATUS_WRITING_AS_ANGRY: number = 4;
    static text_STATUS_WRITING: number = 3;
    static text_STATUS_READING: number = 2;
    static text_STATUS_TEXT_NA: number = 1;
    static text_STATUS_TEXT_UNKNOWN: number = 0;
    static rank_OUTLAW: number = 8;
    static rank_RETIRED: number = 7;
    static rank_APPLICANT: number = 6;
    static rank_SPECTATOR: number = 5;
    static rank_WRITER: number = 4;
    static rank_SPEAKER: number = 3;
    static rank_ADMIN: number = 2;
    static rank_CREATOR: number = 1;

    private __user: Contact;
    constructor(user: Contact) {
        if(!user) throw new Error("how the actual fuck");
        this.__user = user;
    }

    getObjectID() {
        // throw new Error('Participant#getObjectID not implemented')
        return this.__user.getUser().id;
    }

    getDbID() {
        return this.__user.getDbID();
        // throw new Error('Participant#getDbID not implemented')
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

        return 0;
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('Participant#setExtendedStrProperty not implemented')
    }
    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('Participant#setExtendedIntProperty not implemented')
    }
    static ranktoString(val: number): string {
        throw new Error('Participant#ranktoString not implemented')
    }
    static text_STATUSToString(val: number): string {
        throw new Error('Participant#text_STATUSToString not implemented')
    }
    static voice_STATUSToString(val: number): string {
        throw new Error('Participant#voice_STATUSToString not implemented')
    }
    static dtmftoString(val: number): string {
        throw new Error('Participant#dtmftoString not implemented')
    }
    canSetRankTo(rank: number): boolean {
        throw new Error('Participant#canSetRankTo not implemented')
    }
    setRankTo(rank: number): boolean {
        throw new Error('Participant#setRankTo not implemented')
    }
    ring(identityToUse: string, videoCall: boolean, nrofRedials: number, redialPeriod: number, autoStartVM: boolean, origin: string, nonseWord: string, callerConversationId: string): boolean {
        throw new Error('Participant#ring not implemented')
    }
    ringNodeInfo(identityToUse: string, videoCall: boolean, nodeInfo: Binary, nonseWord: string): boolean {
        throw new Error('Participant#ringNodeInfo not implemented')
    }
    ringIt(videoCall: boolean): boolean {
        throw new Error('Participant#ringIt not implemented')
    }
    setLiveIdentityToUse(identityToUse: string): boolean {
        throw new Error('Participant#setLiveIdentityToUse not implemented')
    }
    hangup(): boolean {
        throw new Error('Participant#hangup not implemented')
    }
    retire(): boolean {
        throw new Error('Participant#retire not implemented')
    }
    setPosition(position: number): boolean {
        throw new Error('Participant#setPosition not implemented')
    }
    getLiveSessionVideos(videos: VectUnsignedInt): boolean {
        throw new Error('Participant#getLiveSessionVideos not implemented')
    }
    getDisplayNameHtml(): string {
        // throw new Error('Participant#getDisplayNameHtml not implemented')
        return this.__user.getDisplayNameHtml();
    }
    discard(): void {
        console.warn('Participant#discard not implemented')
    }
    close(): void {
        console.warn('Participant#close not implemented')
    }

    private __propertyChange: Set<OnPropertyChangeType> = new Set();
    @Enumerable(true)
    set onpropertychange(handler: OnPropertyChangeType) {
        this.__propertyChange.add(handler);
    }

    private __liveSessionVideosChanged: Set<OnLiveSessionVideosChangedType> = new Set();
    @Enumerable(true)
    set onlivesessionvideoschanged(handler: OnLiveSessionVideosChangedType) {
        this.__liveSessionVideosChanged.add(handler);
    }

    private __incomingDTMF: Set<OnIncomingDTMFType> = new Set();
    @Enumerable(true)
    set onincomingdtmf(handler: OnIncomingDTMFType) {
        this.__incomingDTMF.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertychange':
                this.__propertyChange.add(handler);
                break;
            case 'livesessionvideoschanged':
                this.__liveSessionVideosChanged.add(handler);
                break;
            case 'incomingdtmf':
                this.__incomingDTMF.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'propertychange':
                this.__propertyChange.delete(handler);
                break;
            case 'livesessionvideoschanged':
                this.__liveSessionVideosChanged.delete(handler);
                break;
            case 'incomingdtmf':
                this.__incomingDTMF.delete(handler);
                break;
        }
    }
}
