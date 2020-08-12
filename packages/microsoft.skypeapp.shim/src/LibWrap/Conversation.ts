import { VectGIString, VectGIFilename, VectUnsignedInt, VectBool } from "./Vect";
import { Binary } from "./Binary";
import { Filename } from "./Filename";
import { ConversationPostFilesResult } from "./ConversationPostFilesResult";

export class Conversation {
    participants: /* System.Object */ any[] = null;
    partnerContact: /* Contact */ any;
    partner: /* Participant */ any;
    myself: /* Participant */ any;
    static subscription_CHECK_CONTEXT_USER_IS_ABOUT_TO_START_VIDEO: number = 1;
    static subscription_CHECK_CONTEXT_USER_IS_ABOUT_TO_START_SCREENSHARE: number = 0;
    static capability_CAPABILITY_COUNT: number = 24;
    static capability_CAN_SEND_STATIC_LOCATION_MESSAGE: number = 23;
    static capability_CAN_SEND_MEDIAMESSAGE: number = 22;
    static capability_CAN_SEND_VIDEOMESSAGE: number = 21;
    static capability_CAN_SPAWN: number = 20;
    static capability_CAN_KICK: number = 19;
    static capability_CAN_RETIRE: number = 18;
    static capability_CAN_ADD: number = 17;
    static capability_CAN_CHANGE_PICTURE: number = 16;
    static capability_CAN_CHANGE_TOPIC: number = 15;
    static capability_CAN_EDIT_OTHERS: number = 14;
    static capability_CAN_EDIT_MYSELF: number = 13;
    static capability_CAN_SEND_CONTACTS: number = 12;
    static capability_CAN_SEND_VOICEMAIL: number = 11;
    static capability_CAN_SEND_FILE: number = 10;
    static capability_CAN_SEND_TEXT: number = 9;
    static capability_CAN_SEND_SMS: number = 8;
    static capability_CAN_CHECK_QUALITY: number = 7;
    static capability_CAN_HOLD_LIVE_SESSION: number = 6;
    static capability_CAN_SHARE_SCREEN: number = 5;
    static capability_CAN_RING_PSTN: number = 4;
    static capability_CAN_RING_VIDEO: number = 3;
    static capability_CAN_RING_ALL: number = 2;
    static capability_CAN_RING: number = 1;
    static capability_CAN_GO_LIVE: number = 0;
    static list_TYPE_REALLY_ALL_CONVERSATIONS: number = 5;
    static list_TYPE_PINNED_CONVERSATIONS: number = 4;
    static list_TYPE_LIVE_CONVERSATIONS: number = 3;
    static list_TYPE_BOOKMARKED_CONVERSATIONS: number = 2;
    static list_TYPE_INBOX_CONVERSATIONS: number = 1;
    static list_TYPE_ALL_CONVERSATIONS: number = 0;
    static participantfilter_OTHER_CONSUMERS: number = 5;
    static participantfilter_MYSELF: number = 4;
    static participantfilter_CONSUMERS_AND_APPLICANTS: number = 3;
    static participantfilter_APPLICANTS: number = 2;
    static participantfilter_CONSUMERS: number = 1;
    static participantfilter_ALL: number = 0;
    static picture_FORMAT_PICTURE_SINGLE_URL: number = 1;
    static picture_FORMAT_PICTURE_DEFAULT: number = 0;
    static live_SESSION_EVENT_USER_REJECTED_BECAUSE_OF_CONF_PARTICIPANTS_LIMIT: number = 1;
    static live_SESSION_EVENT_DOWNGRADED_TO_AUDIO_BECAUSE_OF_VIDEO_PARTICIPANTS_LIMIT: number = 0;
    static premium_VIDEO_STATUS_RESULT_503_SERVICE_TIMEOUT: number = 16;
    static premium_VIDEO_STATUS_RESULT_500_GENERAL_SERVICE_ERROR: number = 15;
    static premium_VIDEO_STATUS_RESULT_430_GRACE_TIME_EXPIRED: number = 14;
    static premium_VIDEO_STATUS_RESULT_424_FAIR_USAGE_POLICY_VIOLATION_SPONSORS_MONTH_LIMIT_REACHED: number = 13;
    static premium_VIDEO_STATUS_RESULT_422_FAIR_USAGE_POLICY_VIOLATION_SPONSORS_DAY_LIMIT_REACHED: number = 12;
    static premium_VIDEO_STATUS_RESULT_420_FAIR_USAGE_POLICY_VIOLATION_CALL_LIMIT_REACHED: number = 11;
    static premium_VIDEO_STATUS_RESULT_416_SUBSCRIPTION_IS_ALREADY_IN_USE: number = 10;
    static premium_VIDEO_STATUS_RESULT_414_NO_SUBSCRIPTION: number = 9;
    static premium_VIDEO_STATUS_RESULT_412_SUBSCRIPTION_INSUFFICENT_FOR_THIS_CALL: number = 8;
    static premium_VIDEO_STATUS_RESULT_410_NO_VALID_SUBSCRIPTION_BUT_TRIAL_IS_AVAILABLE: number = 7;
    static premium_VIDEO_STATUS_RESULT_405_GROUP_TOO_LARGE: number = 6;
    static premium_VIDEO_STATUS_RESULT_404_CONVERSATION_ID_NOT_FOUND_OR_CALL_ALREADY_TERMINATED: number = 5;
    static premium_VIDEO_STATUS_RESULT_403_PAID_SERVICE_BLOCK: number = 4;
    static premium_VIDEO_STATUS_RESULT_401_P2P_BLOCK: number = 3;
    static premium_VIDEO_STATUS_RESULT_400_BAD_REQUEST_SOME_FIELDS_MISSING: number = 2;
    static premium_VIDEO_STATUS_RESULT_200_OK: number = 1;
    static premium_VIDEO_STATUS_NOT_MULTIPARTY_VIDEO: number = 0;
    static allowed_ACTIVITY_SPEAK_AND_WRITE: number = 8;
    static allowed_ACTIVITY_SPEAK: number = 4;
    static allowed_ACTIVITY_ADD_CONSUMERS: number = 2;
    static allowed_ACTIVITY_SET_META: number = 1;
    static local_LIVESTATUS_ACTIVATING: number = 13;
    static local_LIVESTATUS_TRANSFERRING: number = 12;
    static local_LIVESTATUS_RECENTLY_LIVE: number = 10;
    static local_LIVESTATUS_RECORDING_VOICE_MESSAGE: number = 9;
    static local_LIVESTATUS_PLAYING_VOICE_MESSAGE: number = 8;
    static local_LIVESTATUS_OTHERS_ARE_LIVE_FULL: number = 11;
    static local_LIVESTATUS_OTHERS_ARE_LIVE: number = 7;
    static local_LIVESTATUS_ON_HOLD_REMOTELY: number = 6;
    static local_LIVESTATUS_ON_HOLD_LOCALLY: number = 5;
    static local_LIVESTATUS_IM_LIVE: number = 3;
    static local_LIVESTATUS_RINGING_FOR_ME: number = 2;
    static local_LIVESTATUS_STARTING: number = 1;
    static local_LIVESTATUS_NONE: number = 0;
    static my_STATUS_RETIRED_VOLUNTARILY: number = 10;
    static my_STATUS_RETIRED_FORCEFULLY: number = 9;
    static my_STATUS_CONSUMER: number = 8;
    static my_STATUS_INVALID_ACCESS_TOKEN: number = 7;
    static my_STATUS_APPLICATION_DENIED: number = 6;
    static my_STATUS_APPLICANT: number = 5;
    static my_STATUS_QUEUED_TO_ENTER: number = 4;
    static my_STATUS_DOWNLOADING_MESSAGES: number = 3;
    static my_STATUS_RETRY_CONNECTING: number = 2;
    static my_STATUS_CONNECTING: number = 1;
    static type_LEGACY_SHAREDGROUP: number = 5;
    static type_LEGACY_VOICE_CONFERENCE: number = 4;
    static type_TERMINATED_CONFERENCE: number = 3;
    static type_CONFERENCE: number = 2;
    static type_DIALOG: number = 1;
    static setupkey_KEEP_IN_INBOX_WHEN_BLOCKING: string = 'Lib/Conversation/KeepInInboxWhenBlocking';
    static setupkey_INCOMING_AUTH_REQUEST_IN_CONV: string = 'Lib/Conversation/IncomingAuthRequestInConv';
    static setupkey_ENABLE_REACHBACK_CALLING: string = 'Lib/Reachback/Enable';
    static setupkey_HASH_LINK_URL: string = 'UI/General/HashLinkURL';
    static setupkey_ENABLE_DIFF_HIGHLIGHTING: string = 'Lib/Chat/HighlightDiffs';
    static setupkey_CALL_SEAMLESS_UPGRADE_CAPABLE: string = '*Lib/Call/SeamlessUpgradeCapable';
    static setupkey_CALL_EMERGENCY_COUNTRY: string = 'Lib/Call/EmergencyCountry';
    static setupkey_CALL_INCOMING_IN_ROUTING_STATUS: string = '*Lib/Call/IncomingInRoutingStatus';
    static setupkey_CALL_APPLY_CF: string = 'Lib/Call/ApplyCF';
    static setupkey_CALL_SEND_TO_VM: string = 'Lib/Call/SendToVM';
    static setupkey_CALL_NOANSWER_TIMEOUT: string = 'Lib/Call/NoAnswerTimeout';
    static setupkey_DISABLE_CHAT_ACTIVITY_INDICATION: string = 'Lib/Chat/DisableActivityIndication';
    static setupkey_CHATDB_LIMIT_KB: string = 'Lib/Chat/ChatDBLimitKb';
    static setupkey_CHAT_HISTORY_DAYS: string = 'Lib/Chat/HistoryDays';
    static setupkey_DISABLE_CHAT_HISTORY: string = 'Lib/Message/DisableHistory';
    static setupkey_DISABLE_P2P_CHAT: string = '*Lib/Chat/Disable';
    static setupkey_DISABLE_CHAT: string = 'Lib/Chat/DisableChat';
    static setupkey_QUIET_P2P_IN_CALL: string = '*Lib/Conversation/QuietP2PInCall';
    static setupkey_RECENTLY_LIVE_TIMEOUT: string = 'Lib/Conversation/RecentlyLiveTimeout';
    static setupkey_INBOX_LIMIT_DAYS: string = 'Lib/Conversation/InboxLimitDays';
    static setupkey_UPDATE_INBOX_MESSAGE_ID_METHOD: string = 'Lib/Conversation/UpdateInboxMessageIDMethod';
    static setupkey_DISABLE_INBOX_UPDATE_ON_TYPING: string = 'Lib/Conversation/DisableInboxUpdateOnTyping';
    static setupkey_INBOX_UPDATE_TIMEOUT: string = 'Lib/Conversation/InboxUpdateTimeout';
    static setupkey_ENABLE_EXTERNAL_CONTACTS: string = 'Lib/Contacts/EnableExternalContacts';
    static setupkey_ENABLE_BIRTHDAY_NOTIFICATION: string = 'Lib/Conversation/EnableBirthday';

    getObjectID(): number {
        throw new Error('shimmed function Conversation.getObjectID');
    }

    getDbID(): number {
        throw new Error('shimmed function Conversation.getDbID');
    }

    getStrProperty(propKey: number): string {
        throw new Error('shimmed function Conversation.getStrProperty');
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Conversation.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        throw new Error('shimmed function Conversation.getIntProperty');
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Conversation.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Conversation.setExtendedIntProperty');
    }

    setOption(propKey: number, value: number): Boolean {
        throw new Error('shimmed function Conversation.setOption');
    }

    setTopic(topic: string, isXML: Boolean): Boolean {
        throw new Error('shimmed function Conversation.setTopic');
    }

    setPicture(jpeg: Binary): Boolean {
        throw new Error('shimmed function Conversation.setPicture');
    }

    getChatname(): string {
        throw new Error('shimmed function Conversation.getChatname');
    }

    spawnConference(identitiesToAdd: VectGIString, autoRingAddedParticipantsIfLive: Boolean): number {
        throw new Error('shimmed function Conversation.spawnConference');
    }

    addConsumers(identities: VectGIString, autoRingAddedParticipantsIfLive: Boolean): Boolean {
        throw new Error('shimmed function Conversation.addConsumers');
    }

    canAddConsumersOrSpawn(identities: VectGIString): Boolean {
        throw new Error('shimmed function Conversation.canAddConsumersOrSpawn');
    }

    assimilate(otherConversationObjectID: number): number {
        throw new Error('shimmed function Conversation.assimilate');
    }

    joinLiveSession(accessToken: string): Boolean {
        throw new Error('shimmed function Conversation.joinLiveSession');
    }

    ringOthers(identities: VectGIString, videoCall: Boolean, origin: string): Boolean {
        throw new Error('shimmed function Conversation.ringOthers');
    }

    ringSeamless(videoCall: Boolean): Boolean {
        throw new Error('shimmed function Conversation.ringSeamless');
    }

    muteMyMicrophone(): Boolean {
        throw new Error('shimmed function Conversation.muteMyMicrophone');
    }

    unmuteMyMicrophone(): Boolean {
        throw new Error('shimmed function Conversation.unmuteMyMicrophone');
    }

    holdMyLiveSession(): Boolean {
        throw new Error('shimmed function Conversation.holdMyLiveSession');
    }

    resumeMyLiveSession(): Boolean {
        throw new Error('shimmed function Conversation.resumeMyLiveSession');
    }

    leaveLiveSession(postVoiceAutoresponse: Boolean): Boolean {
        throw new Error('shimmed function Conversation.leaveLiveSession');
    }

    startVoiceMessage(): Boolean {
        throw new Error('shimmed function Conversation.startVoiceMessage');
    }

    transferLiveSession(identities: VectGIString, transferTopic: string, context: Binary): Boolean {
        throw new Error('shimmed function Conversation.transferLiveSession');
    }

    canTransferLiveSession(identity: string): Boolean {
        throw new Error('shimmed function Conversation.canTransferLiveSession');
    }

    sendDTMF(dtmf: number, lengthInMS: number): Boolean {
        throw new Error('shimmed function Conversation.sendDTMF');
    }

    stopSendDTMF(): Boolean {
        throw new Error('shimmed function Conversation.stopSendDTMF');
    }

    provideLiveSessionQualityFeedback(questionaryID: string, trackingReason: string, qualityRating: number, problemTokens: string, cdr_id: string): Boolean {
        throw new Error('shimmed function Conversation.provideLiveSessionQualityFeedback');
    }

    setMyTextStatusTo(status: number): Boolean {
        throw new Error('shimmed function Conversation.setMyTextStatusTo');
    }

    postText(text: string, isXML: Boolean): number {
        throw new Error('shimmed function Conversation.postText');
    }

    postContacts(contacts: VectUnsignedInt, altText: string): Boolean {
        throw new Error('shimmed function Conversation.postContacts');
    }

    postFiles(paths: VectGIFilename, body: string, error_file: Filename): ConversationPostFilesResult {
        throw new Error('shimmed function Conversation.postFiles');
    }

    postVoiceMessage(voicemailObjectID: number, body: string): Boolean {
        throw new Error('shimmed function Conversation.postVoiceMessage');
    }

    postSMS(smsObjectID: number, body: string): Boolean {
        throw new Error('shimmed function Conversation.postSMS');
    }

    postVideoMessage(videoMessageObjectID: number, legacyMessage: string): Boolean {
        throw new Error('shimmed function Conversation.postVideoMessage');
    }

    postMediaDocument(documentObjectID: number, legacyMessage: string): Boolean {
        throw new Error('shimmed function Conversation.postMediaDocument');
    }

    postExternalMessage(type: number, bodyXml: string): number {
        throw new Error('shimmed function Conversation.postExternalMessage');
    }

    postLocationMessage(latitude: number, longitude: number, altitude: number, horizontalAccuracy: number, verticalAccuracy: number, speed: number, course: number, timeStamp: number, address: string, pointOfInterest: string, legacyMessage: string): number {
        throw new Error('shimmed function Conversation.postLocationMessage');
    }

    postSystemMessage(text: string, isXML: Boolean): number {
        throw new Error('shimmed function Conversation.postSystemMessage');
    }

    getJoinBlob(): string {
        throw new Error('shimmed function Conversation.getJoinBlob');
    }

    getNonseWord(): string {
        throw new Error('shimmed function Conversation.getNonseWord');
    }

    setDeferredSetup(deferred: Boolean): Boolean {
        throw new Error('shimmed function Conversation.setDeferredSetup');
    }

    join_(): Boolean {
        throw new Error('shimmed function Conversation.join_');
    }

    enterPassword(password: string): Boolean {
        throw new Error('shimmed function Conversation.enterPassword');
    }

    setPassword(password: string, hint: string): Boolean {
        throw new Error('shimmed function Conversation.setPassword');
    }

    retireFrom(): Boolean {
        throw new Error('shimmed function Conversation.retireFrom');
    }

    delete(): Boolean {
        throw new Error('shimmed function Conversation.delete');
    }

    renameTo(name: string): Boolean {
        throw new Error('shimmed function Conversation.renameTo');
    }

    setBookmark(bookmark: Boolean): Boolean {
        throw new Error('shimmed function Conversation.setBookmark');
    }

    setAlertString(alertString: string): Boolean {
        throw new Error('shimmed function Conversation.setAlertString');
    }

    removeFromInbox(): Boolean {
        throw new Error('shimmed function Conversation.removeFromInbox');
    }

    addToInbox(timestamp: number): Boolean {
        throw new Error('shimmed function Conversation.addToInbox');
    }

    setConsumedHorizon(timestamp: number, also_unconsume: Boolean): Boolean {
        throw new Error('shimmed function Conversation.setConsumedHorizon');
    }

    markUnread(): Boolean {
        throw new Error('shimmed function Conversation.markUnread');
    }

    isMemberOf(groupObjectID: number): Boolean {
        throw new Error('shimmed function Conversation.isMemberOf');
    }

    pinFirst(): Boolean {
        throw new Error('shimmed function Conversation.pinFirst');
    }

    pinAfter(previousConversationObjectID: number): Boolean {
        throw new Error('shimmed function Conversation.pinAfter');
    }

    unPin(): Boolean {
        throw new Error('shimmed function Conversation.unPin');
    }

    getParticipants(participants: VectUnsignedInt, filter: number): void {
        console.warn('shimmed function Conversation.getParticipants');
    }

    getLastMessages(contextMessages: VectUnsignedInt, unconsumedMessages: VectUnsignedInt, requireTimestamp: number): void {
        console.warn('shimmed function Conversation.getLastMessages');
    }

    loadMessages(timestampExcl: number, count: number, returnNewer: Boolean, messages: VectUnsignedInt): void {
        console.warn('shimmed function Conversation.loadMessages');
    }

    findMessage(text: string, fromTimestampUp: number): number {
        throw new Error('shimmed function Conversation.findMessage');
    }

    attachVideoToLiveSession(sendVideoObjectID: number): Boolean {
        throw new Error('shimmed function Conversation.attachVideoToLiveSession');
    }

    getCapabilities(): VectBool {
        throw new Error('shimmed function Conversation.getCapabilities');
    }

    checkPremiumVideoSubscription(context: number): number {
        throw new Error('shimmed function Conversation.checkPremiumVideoSubscription');
    }

    getChatNameFromThreadId(): string {
        throw new Error('shimmed function Conversation.getChatNameFromThreadId');
    }

    getThreadIdFromChatName(): string {
        throw new Error('shimmed function Conversation.getThreadIdFromChatName');
    }

    getIdentity(): string {
        throw new Error('shimmed function Conversation.getIdentity');
    }

    getDisplayNameHtml(): string {
        throw new Error('shimmed function Conversation.getDisplayNameHtml');
    }

    getTopicHtml(): string {
        throw new Error('shimmed function Conversation.getTopicHtml');
    }

    subscribePropChanges(propKeys: number[]): void {
        console.warn('shimmed function Conversation.subscribePropChanges');
    }

    discard(): void {
        console.warn('shimmed function Conversation.discard');
    }

    close(): void {
        console.warn('shimmed function Conversation.close');
    }

    static typetoString(val: number): string {
        throw new Error('shimmed function Conversation.typetoString');
    }

    static my_STATUSToString(val: number): string {
        throw new Error('shimmed function Conversation.my_STATUSToString');
    }

    static local_LIVESTATUSToString(val: number): string {
        throw new Error('shimmed function Conversation.local_LIVESTATUSToString');
    }

    static allowed_ACTIVITYToString(val: number): string {
        throw new Error('shimmed function Conversation.allowed_ACTIVITYToString');
    }

    static premium_VIDEO_STATUSToString(val: number): string {
        throw new Error('shimmed function Conversation.premium_VIDEO_STATUSToString');
    }

    static live_SESSION_EVENTToString(val: number): string {
        throw new Error('shimmed function Conversation.live_SESSION_EVENTToString');
    }

    static picture_FORMATToString(val: number): string {
        throw new Error('shimmed function Conversation.picture_FORMATToString');
    }

    static participantfiltertoString(val: number): string {
        throw new Error('shimmed function Conversation.participantfiltertoString');
    }

    static list_TYPEToString(val: number): string {
        throw new Error('shimmed function Conversation.list_TYPEToString');
    }

    static capabilitytoString(val: number): string {
        throw new Error('shimmed function Conversation.capabilitytoString');
    }

    static subscription_CHECK_CONTEXTToString(val: number): string {
        throw new Error('shimmed function Conversation.subscription_CHECK_CONTEXTToString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Conversation::addEventListener: ${name}`);
        switch (name) {
            case "propertieschanged": // PropertiesChangedEventType
            case "participantlistchange": // ParticipantListChangeEventType
            case "propertychange": // OnPropertyChangeType
            case "livesessionevent": // OnLiveSessionEventType
            case "livesessionmoved": // OnLiveSessionMovedType
            case "premiumvideosubscriptioncheckresult": // OnPremiumVideoSubscriptionCheckResultType
            case "capabilitieschanged": // OnCapabilitiesChangedType
            case "spawnedconference": // OnSpawnConferenceType
            case "incomingmessage": // ConversationOnMessageType
                break;
        }

    }
}