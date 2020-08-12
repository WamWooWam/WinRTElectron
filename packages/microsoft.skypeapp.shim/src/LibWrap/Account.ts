import { VectGIString, VectGIFilename, VectUnsignedInt, VectBool } from "./Vect";
import { Binary } from "./Binary";
import { remote } from "electron";
import { ApplicationData } from "winrt-node/Windows.Storage";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";

export class Account {
    static xmppstatus_XMPP_OFFLINE_EXPLICIT: number = 22;
    static xmppstatus_XMPP_OFFLINE_SKYPE: number = 21;
    static xmppstatus_XMPP_DISABLED: number = 20;
    static xmppstatus_XMPP_ERROR_OTHER: number = 11;
    static xmppstatus_XMPP_ERROR_AUTH: number = 10;
    static xmppstatus_XMPP_PAUSING: number = 3;
    static xmppstatus_XMPP_CONNECTING: number = 2;
    static xmppstatus_XMPP_ONLINE: number = 1;
    static xmppstatus_XMPP_UNLINKED: number = 0;
    static servicetype_ST_PREMIUMVIDEO: number = 2;
    static servicetype_ST_PSTN: number = 1;
    static servicetype_ST_NONE: number = 0;
    static packagetype_PT_FREETRIAL: number = 3;
    static packagetype_PT_DAYPASS: number = 2;
    static packagetype_PT_SUBSCRIPTION: number = 1;
    static packagetype_PT_NONE: number = 0;
    static subscriptionstatus_SS_SUSPENDED: number = 3;
    static subscriptionstatus_SS_CANCELLED: number = 2;
    static subscriptionstatus_SS_ACTIVE: number = 1;
    static subscriptionstatus_SS_NONE: number = 0;
    static capabilitystatus_FINAL_EXPIRY_WARNING: number = 4;
    static capabilitystatus_SECOND_EXPIRY_WARNING: number = 3;
    static capabilitystatus_FIRST_EXPIRY_WARNING: number = 2;
    static capabilitystatus_CAPABILITY_EXISTS: number = 1;
    static capabilitystatus_NO_CAPABILITY: number = 0;
    static federatedpresencepolicy_FEDERATED_DISABLE_FLAMINGO: number = 1;
    static shortcircuitsync_SHORTCIRCUITSYNC_ENABLED: number = 1;
    static shortcircuitsync_SHORTCIRCUITSYNC_DISABLED: number = 0;
    static adpolicy_ADS_ENABLED_NOTARGET: number = 4;
    static adpolicy_ADS_RESERVED3: number = 3;
    static adpolicy_ADS_RESERVED2: number = 2;
    static adpolicy_ADS_RESERVED1: number = 1;
    static adpolicy_ADS_ENABLED: number = 0;
    static authrequestpolicy_AUTHREQUEST_DISABLED: number = 9;
    static authrequestpolicy_CHAT_PARTICIPANTS_CAN_AUTHREQ: number = 5;
    static authrequestpolicy_AUTHREQUEST_ENABLED: number = 0;
    static voicemailpolicy_VOICEMAIL_DISABLED: number = 1;
    static voicemailpolicy_VOICEMAIL_ENABLED: number = 0;
    static phonenumberspolicy_PHONENUMBERS_VISIBLE_FOR_EVERYONE: number = 1;
    static phonenumberspolicy_PHONENUMBERS_VISIBLE_FOR_BUDDIES: number = 0;
    static webpresencepolicy_WEBPRESENCE_ENABLED: number = 1;
    static webpresencepolicy_WEBPRESENCE_DISABLED: number = 0;
    static timezonepolicy_TZ_UNDISCLOSED: number = 2;
    static timezonepolicy_TZ_MANUAL: number = 1;
    static timezonepolicy_TZ_AUTOMATIC: number = 0;
    static buddycountpolicy_DISCLOSE_TO_NOONE: number = 1;
    static buddycountpolicy_DISCLOSE_TO_AUTHORIZED: number = 0;
    static avatarpolicy_EVERYONE_CAN_SEE: number = 2;
    static avatarpolicy_BUDDIES_OR_AUTHORIZED_CAN_SEE: number = 0;
    static pstncallpolicy_BUDDY_NUMBERS_CAN_CALL: number = 2;
    static pstncallpolicy_DISCLOSED_NUMBERS_CAN_CALL: number = 1;
    static pstncallpolicy_ALL_NUMBERS_CAN_CALL: number = 0;
    static skypecallpolicy_BUDDIES_OR_AUTHORIZED_CAN_CALL: number = 2;
    static skypecallpolicy_EVERYONE_CAN_CALL: number = 0;
    static chatpolicy_BUDDIES_OR_AUTHORIZED_CAN_ADD: number = 2;
    static chatpolicy_EVERYONE_CAN_ADD: number = 0;
    static commitstatus_COMMIT_FAILED: number = 3;
    static commitstatus_COMMITTING_TO_SERVER: number = 2;
    static commitstatus_COMMITTED: number = 1;
    static pwdchangestatus_PWD_MUST_LOG_IN_TO_CHANGE: number = 7;
    static pwdchangestatus_PWD_INVALID_NEW_PWD: number = 6;
    static pwdchangestatus_PWD_MUST_DIFFER_FROM_OLD: number = 5;
    static pwdchangestatus_PWD_OK_BUT_CHANGE_SUGGESTED: number = 4;
    static pwdchangestatus_PWD_SERVER_CONNECT_FAILED: number = 3;
    static pwdchangestatus_PWD_INVALID_OLD_PASSWORD: number = 2;
    static pwdchangestatus_PWD_CHANGING: number = 1;
    static pwdchangestatus_PWD_OK: number = 0;
    static logoutreason_ACCESS_TOKEN_RENEWAL_FAILED: number = 27;
    static logoutreason_REMOTE_LOGOUT: number = 26;
    static logoutreason_ATO_BLOCKED: number = 25;
    static logoutreason_UNSUPPORTED_VERSION: number = 24;
    static logoutreason_APP_ID_FAILURE: number = 23;
    static logoutreason_INVALID_APP_ID: number = 22;
    static logoutreason_DB_FAILURE: number = 21;
    static logoutreason_DB_CORRUPT: number = 20;
    static logoutreason_DB_IO_ERROR: number = 19;
    static logoutreason_DB_DISK_FULL: number = 18;
    static logoutreason_PERIODIC_UIC_UPDATE_FAILED: number = 17;
    static logoutreason_PASSWORD_HAS_CHANGED: number = 16;
    static logoutreason_TOO_MANY_LOGIN_ATTEMPTS: number = 15;
    static logoutreason_INCORRECT_PASSWORD: number = 14;
    static logoutreason_NO_SUCH_IDENTITY: number = 13;
    static logoutreason_REJECTED_AS_UNDERAGE: number = 12;
    static logoutreason_SKYPENAME_TAKEN: number = 11;
    static logoutreason_UNACCEPTABLE_PASSWORD: number = 10;
    static logoutreason_INVALID_EMAIL: number = 9;
    static logoutreason_INVALID_SKYPENAME: number = 8;
    static logoutreason_DB_IN_USE: number = 7;
    static logoutreason_SERVER_OVERLOADED: number = 6;
    static logoutreason_SERVER_CONNECT_FAILED: number = 5;
    static logoutreason_P2P_CONNECT_FAILED: number = 4;
    static logoutreason_SOCKS_PROXY_AUTH_FAILED: number = 3;
    static logoutreason_HTTPS_PROXY_AUTH_FAILED: number = 2;
    static logoutreason_LOGOUT_CALLED: number = 1;
    static cblsyncstatus_CBL_REMOTE_SYNC_PENDING: number = 6;
    static cblsyncstatus_CBL_SYNC_FAILED: number = 5;
    static cblsyncstatus_CBL_IN_SYNC: number = 4;
    static cblsyncstatus_CBL_SYNC_IN_PROGRESS: number = 3;
    static cblsyncstatus_CBL_SYNC_PENDING: number = 2;
    static cblsyncstatus_CBL_INITIAL_SYNC_PENDING: number = 1;
    static cblsyncstatus_CBL_INITIALIZING: number = 0;
    static status_LOGGED_IN_PARTIALLY: number = 9;
    static status_LOGGING_OUT: number = 8;
    static status_LOGGED_IN: number = 7;
    static status_INITIALIZING: number = 6;
    static status_LOGGING_IN: number = 5;
    static status_CONNECTING_TO_SERVER: number = 4;
    static status_CONNECTING_TO_P2P: number = 3;
    static status_LOGGED_OUT_AND_PWD_SAVED: number = 2;
    static status_LOGGED_OUT: number = 1;

    constructor() {
        return new Proxy(this, new ShimProxyHandler("Account"))
    }

    getObjectID(): number {
        throw new Error('shimmed function Account.getObjectID');
    }

    getDbID(): number {
        throw new Error('shimmed function Account.getDbID');
    }

    getStrProperty(propKey: number): string {
        throw new Error('shimmed function Account.getStrProperty');
    }

    getStrPropertyWithXmlStripped(propKey: number): string {
        throw new Error('shimmed function Account.getStrPropertyWithXmlStripped');
    }

    getIntProperty(propKey: number): number {
        throw new Error('shimmed function Account.getIntProperty');
    }

    setExtendedStrProperty(propKey: number, value: string): void {
        console.warn('shimmed function Account.setExtendedStrProperty');
    }

    setExtendedIntProperty(propKey: number, value: number): void {
        console.warn('shimmed function Account.setExtendedIntProperty');
    }

    getStatusWithProgress(): AccountGetStatusWithProgressResult {
        throw new Error('shimmed function Account.getStatusWithProgress');
    }

    setUIVersion(uiVersionString: string): void {
        console.warn('shimmed function Account.setUIVersion');
    }

    login(setAvailabilityTo: number): void {
        console.warn('shimmed function Account.login');
    }

    beginLogin(setAvailabilityTo: number): void {
        console.warn('shimmed function Account.beginLogin');
    }

    loginWithPassword(password: string, savePwd: Boolean, saveDataLocally: Boolean): void {
        console.warn('shimmed function Account.loginWithPassword');
    }

    loginWithOAuth(partnerId: string, accessToken: string, refreshToken: string, savePwd: Boolean, saveDataLocally: Boolean): void {
        console.warn('shimmed function Account.loginWithOAuth');
    }

    finishLogin(): void {
        console.warn('shimmed function Account.finishLogin');
    }

    register(password: string, savePwd: Boolean, saveDataLocally: Boolean, email: string, allowSpam: Boolean): void {
        console.warn('shimmed function Account.register');
    }

    logout(clearSavedPwd: Boolean): void {
        console.warn('shimmed function Account.logout');
    }

    logoutEx(clearSavedPwd: Boolean, localOnly: Boolean): void {
        console.warn('shimmed function Account.logoutEx');
    }

    logoutOtherEndpoints(): void {
        console.warn('shimmed function Account.logoutOtherEndpoints');
    }

    logoutOtherEndpoint(endpointID: string): void {
        console.warn('shimmed function Account.logoutOtherEndpoint');
    }

    getOwnEndpointsInfo(id: VectGIString, name: VectGIString, type: VectGIString): void {
        console.warn('shimmed function Account.getOwnEndpointsInfo');
    }

    externalLoginResponse(response: Binary): void {
        console.warn('shimmed function Account.externalLoginResponse');
    }

    changePassword(oldPassword: string, newPassword: string, savePwd: Boolean): void {
        console.warn('shimmed function Account.changePassword');
    }

    setPasswordSaved(savePwd: Boolean): void {
        console.warn('shimmed function Account.setPasswordSaved');
    }

    setServersideIntProperty(propKey: number, value: number): Boolean {
        throw new Error('shimmed function Account.setServersideIntProperty');
    }

    setServersideStrProperty(propKey: number, value: string): Boolean {
        throw new Error('shimmed function Account.setServersideStrProperty');
    }

    cancelServerCommit(): void {
        console.warn('shimmed function Account.cancelServerCommit');
    }

    setIntProperty(propKey: number, value: number): Boolean {
        throw new Error('shimmed function Account.setIntProperty');
    }

    setStrProperty(propKey: number, value: string): Boolean {
        throw new Error('shimmed function Account.setStrProperty');
    }

    setBinProperty(propKey: number, value: Binary): Boolean {
        throw new Error('shimmed function Account.setBinProperty');
    }

    setAvailability(availability: number): void {
        console.warn('shimmed function Account.setAvailability');
    }

    setStandby(standby: Boolean): void {
        console.warn('shimmed function Account.setStandby');
    }

    setProfileAttachment(attachmentID: string, attachment: Binary): Boolean {
        throw new Error('shimmed function Account.setProfileAttachment');
    }

    getCapabilityStatus(capability: number, expiryTimestamp: number): number {
        throw new Error('shimmed function Account.getCapabilityStatus');
    }

    getCapabilityStatus_1(capability: number): AccountGetCapabilityStatusResult {
        throw new Error('shimmed function Account.getCapabilityStatus_1');
    }

    getSkypenameHash(): string {
        throw new Error('shimmed function Account.getSkypenameHash');
    }

    getContactObjectID(): number {
        throw new Error('shimmed function Account.getContactObjectID');
    }

    getSubscriptionInfo(name: VectGIString, endtime: VectUnsignedInt, status: VectUnsignedInt, package_type: VectUnsignedInt, service_type: VectUnsignedInt): void {
        console.warn('shimmed function Account.getSubscriptionInfo');
    }

    reconnectXMPP(): void {
        console.warn('shimmed function Account.reconnectXMPP');
    }

    getPartnerChannelStatus(): string {
        throw new Error('shimmed function Account.getPartnerChannelStatus');
    }

    getVerifiedEmail(): string {
        throw new Error('shimmed function Account.getVerifiedEmail');
    }

    getVerifiedCompany(): string {
        throw new Error('shimmed function Account.getVerifiedCompany');
    }

    getDBPath(): string {
        return ApplicationData.current.localFolder.path;
    }

    delete(): void {
        console.warn('shimmed function Account.delete');
    }

    getPartnerUID(partnerId: number): string {
        throw new Error('shimmed function Account.getPartnerUID');
    }

    getLastPartnerId(): number {
        throw new Error('shimmed function Account.getLastPartnerId');
    }

    discard(): void {
        console.warn('shimmed function Account.discard');
    }

    getStatus(): number {
        throw new Error('shimmed function Account.getStatus');
    }

    getStatusProgress(): number {
        throw new Error('shimmed function Account.getStatusProgress');
    }

    hasCapability(capability: number): Boolean {
        throw new Error('shimmed function Account.hasCapability');
    }

    getMoodTextHtml(): string {
        throw new Error('shimmed function Account.getMoodTextHtml');
    }

    close(): void {
        console.warn('shimmed function Account.close');
    }

    static statustoString(val: number): string {
        throw new Error('shimmed function Account.statustoString');
    }

    static cblsyncstatustoString(val: number): string {
        throw new Error('shimmed function Account.cblsyncstatustoString');
    }

    static logoutreasontoString(val: number): string {
        throw new Error('shimmed function Account.logoutreasontoString');
    }

    static pwdchangestatustoString(val: number): string {
        throw new Error('shimmed function Account.pwdchangestatustoString');
    }

    static commitstatustoString(val: number): string {
        throw new Error('shimmed function Account.commitstatustoString');
    }

    static chatpolicytoString(val: number): string {
        throw new Error('shimmed function Account.chatpolicytoString');
    }

    static skypecallpolicytoString(val: number): string {
        throw new Error('shimmed function Account.skypecallpolicytoString');
    }

    static pstncallpolicytoString(val: number): string {
        throw new Error('shimmed function Account.pstncallpolicytoString');
    }

    static avatarpolicytoString(val: number): string {
        throw new Error('shimmed function Account.avatarpolicytoString');
    }

    static buddycountpolicytoString(val: number): string {
        throw new Error('shimmed function Account.buddycountpolicytoString');
    }

    static timezonepolicytoString(val: number): string {
        throw new Error('shimmed function Account.timezonepolicytoString');
    }

    static webpresencepolicytoString(val: number): string {
        throw new Error('shimmed function Account.webpresencepolicytoString');
    }

    static phonenumberspolicytoString(val: number): string {
        throw new Error('shimmed function Account.phonenumberspolicytoString');
    }

    static voicemailpolicytoString(val: number): string {
        throw new Error('shimmed function Account.voicemailpolicytoString');
    }

    static authrequestpolicytoString(val: number): string {
        throw new Error('shimmed function Account.authrequestpolicytoString');
    }

    static adpolicytoString(val: number): string {
        throw new Error('shimmed function Account.adpolicytoString');
    }

    static shortcircuitsynctoString(val: number): string {
        throw new Error('shimmed function Account.shortcircuitsynctoString');
    }

    static federatedpresencepolicytoString(val: number): string {
        throw new Error('shimmed function Account.federatedpresencepolicytoString');
    }

    static capabilitystatustoString(val: number): string {
        throw new Error('shimmed function Account.capabilitystatustoString');
    }

    static subscriptionstatustoString(val: number): string {
        throw new Error('shimmed function Account.subscriptionstatustoString');
    }

    static packagetypetoString(val: number): string {
        throw new Error('shimmed function Account.packagetypetoString');
    }

    static servicetypetoString(val: number): string {
        throw new Error('shimmed function Account.servicetypetoString');
    }

    static xmppstatustoString(val: number): string {
        throw new Error('shimmed function Account.xmppstatustoString');
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`Account::addEventListener: ${name}`);
        switch (name) {
            case "propertychange": // OnPropertyChangeType
            case "endpointschanged": // OnEndpointsChangedType
                break;
        }

    }
}

export class AccountGetCapabilityStatusResult {
    expiryTimestamp: number;
    status: number;
}

export class AccountGetStatusWithProgressResult {
    progress: number;
    status: number;
}