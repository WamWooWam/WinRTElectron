import { IAsyncAction, EventTarget, IAsyncOperation } from "winrt-node/Windows.Foundation";
import { AvatarManager } from "./AvatarManager";
import { Contact } from "./Contact";
import { VectGIString, VectUnsignedInt } from "./Vect";
import { Setup } from "./Setup";
import { ApplicationData } from "winrt-node/Windows.Storage";
import { ShimProxyHandler } from "winrt-node/ShimProxyHandler";
import { Account } from "./Account";
import { Filename } from "./Filename";

export class WrSkyLib extends EventTarget {
    constructor(skypeVersion: string) {
        super();

        this._uiSettings = new Map(ApplicationData.current.localSettings.lookup("__uisettings") ?? []);
        return new Proxy(this, new ShimProxyHandler("WrSkyLib"));
    }

    private _uiSettings: Map<number, any> = new Map();

    defaultVideoDeviceHandle: string;
    logoutReason: number;
    myIdentity: string = "me";
    loginInProgress: Boolean;
    loggedIn: Boolean = true;
    myself: Contact = new Contact(this.myIdentity);
    account: Account = new Account();
    setup: Setup = new Setup();
    avatarmanager: AvatarManager = new AvatarManager();
    
    static libstatus_FATAL_ERROR: number = 5;
    static libstatus_STOPPED: number = 4;
    static libstatus_STOPPING: number = 3;
    static libstatus_RUNNING: number = 2;
    static libstatus_STARTING: number = 1;
    static libstatus_CONSTRUCTED: number = 0;
    static objecttype_MEDIADOCUMENT: number = 22;
    static objecttype_VIDEOMESSAGE: number = 21;
    static objecttype_ACCESSSESSION: number = 20;
    static objecttype_ACCOUNT: number = 5;
    static objecttype_PRICEQUOTE: number = 17;
    static objecttype_ALERT: number = 16;
    static objecttype_CONTENTITEM: number = 14;
    static objecttype_TRANSFER: number = 6;
    static objecttype_SMS: number = 12;
    static objecttype_VOICEMAIL: number = 7;
    static objecttype_VIDEO: number = 11;
    static objecttype_MESSAGE: number = 9;
    static objecttype_CONVERSATION: number = 18;
    static objecttype_PARTICIPANT: number = 19;
    static objecttype_CONTACTSEARCH: number = 1;
    static objecttype_CONTACT: number = 2;
    static objecttype_CONTACTGROUP: number = 10;
    static debug_STRING_DEBUG_STRING_MSNP_LOG: number = 2;
    static debug_STRING_DEBUG_STRING_MSNP_SUMMARY: number = 1;
    static debug_STRING_DEBUG_STRING_DEFAULT: number = 0;
    static localized_STRING_LOCALIZED_COUNT: number = 1;
    static localized_STRING_LOCALIZED_UPGRADE_MESSAGE_IN_P2P: number = 0;
    static pnm_REGISTER_CONTEXTS_RESULT_REGISTER_CONTEXTS_FAILED: number = 1;
    static pnm_REGISTER_CONTEXTS_RESULT_REGISTER_CONTEXTS_SUCCEEDED: number = 0;
    static pushhandlingresult_CALL_SETUP_FAILED: number = 2;
    static pushhandlingresult_CALL_SETUP_SUCCEEDED: number = 1;
    static pushhandlingresult_BAD_NOTIFICATION_PAYLOAD: number = 0;
    static service_TYPE_NNA: number = 10;
    static service_TYPE_ADM: number = 9;
    static service_TYPE_GRIFFIN: number = 8;
    static service_TYPE_TROUTER: number = 7;
    static service_TYPE_GOOGLE_AC2DM: number = 6;
    static service_TYPE_HOTMAIL: number = 5;
    static service_TYPE_GOOGLE_AGCM: number = 4;
    static service_TYPE_APPLE_APN: number = 3;
    static service_TYPE_MICROSOFT_WP7NS: number = 2;
    static service_TYPE_MICROSOFT_WNS: number = 1;
    static service_TYPE_TESTING: number = 0;
    static auth_RESULT_AUTH_PARTNER_TIMEOUT: number = 9;
    static auth_RESULT_AUTH_PARTNER_INTERNAL_ERROR: number = 8;
    static auth_RESULT_AUTH_USER_IS_UNDERAGE: number = 7;
    static auth_RESULT_AUTH_INVALID_OAUTH_AUTHENTICATION: number = 6;
    static auth_RESULT_AUTH_INVALID_SKYPE_AUTHENTICATION: number = 5;
    static auth_RESULT_AUTH_ANOTHER_MAPPING_EXISTS: number = 4;
    static auth_RESULT_AUTH_INVALID_PARAMETER: number = 3;
    static auth_RESULT_AUTH_MISSING_PARAMETER: number = 2;
    static auth_RESULT_AUTH_INTERNAL_ERROR: number = 1;
    static auth_RESULT_AUTH_OK: number = 0;
    static app2APP_STREAMS_RECEIVED_STREAMS: number = 2;
    static app2APP_STREAMS_SENDING_STREAMS: number = 1;
    static app2APP_STREAMS_ALL_STREAMS: number = 0;
    static unpack_RESULT_UNPACK_SIGNATURE_ERROR: number = 3;
    static unpack_RESULT_UNPACK_BLOB_ERROR: number = 2;
    static unpack_RESULT_UNPACK_FILE_ERROR: number = 1;
    static unpack_RESULT_UNPACK_OK: number = 0;
    static unpack_TYPE_UP_SKYPEHOME_BUNDLE: number = 4106;
    static unpack_TYPE_UP_MAC_UPGRADE: number = 4103;

    static upgraderesult_UPGRADE_CHECK_FAILED: number = 20;
    static upgraderesult_GOLD_AND_BETA_AVAILABLE: number = 12;
    static upgraderesult_BETA_AVAILABLE: number = 11;
    static upgraderesult_GOLD_AVAILABLE: number = 10;
    static upgraderesult_DISCONTINUED: number = 5;
    static upgraderesult_FORCED_STEALTH_UPGRADE: number = 4;
    static upgraderesult_FORCED_UPGRADE: number = 3;
    static upgraderesult_RECOMMENDED_STEALTH_UPGRADE: number = 2;
    static upgraderesult_RECOMMENDED_UPGRADE: number = 1;
    static upgraderesult_NO_UPGRADE: number = 0;

    static libprop_LIBPROP_NRT_CAPABILITIES: number = 44;
    static libprop_LIBPROP_API_ALLOWLIST_LOCK: number = 43;
    static libprop_LIBPROP_LOGIN_STATS_SAMPLING: number = 42;
    static libprop_LIBPROP_DISABLE_VIRAL_UPGRADES: number = 41;
    static libprop_LIBPROP_VIDEO_MESSAGE_SENDING_ENABLED: number = 40;
    static libprop_LIBPROP_DISABLED_AUTH_PARTNERS: number = 39;
    static libprop_LIBPROP_AD_ALLOWED_RICH: number = 38;
    static libprop_LIBPROP_AD_ALLOWED_BASIC: number = 37;
    static libprop_LIBPROP_BILLING_TYPE: number = 36;
    static libprop_LIBPROP_NETCONF_IS_LATEST: number = 35;
    static libprop_LIBPROP_USER_LIKENESS: number = 34;
    static libprop_LIBPROP_SKYPEMANAGER_MEMBER_STATUS: number = 33;
    static libprop_LIBPROP_POLICY_DISABLE_VIDEO: number = 32;
    static libprop_LIBPROP_SKYPEHOME_CHANNEL_DISABLED: number = 31;
    static libprop_LIBPROP_MESH_PROBLEMS: number = 30;
    static libprop_LIBPROP_CURCALL_TBYB_SECONDS_REMAINING: number = 29;
    static libprop_LIBPROP_UPGRADE_SIGNER_NAME: number = 27;
    static libprop_LIBPROP_ALL_LASTCALL_PROPERTIES_SET: number = 26;
    static libprop_LIBPROP_POSTCALL_JUNCTION_DISABLED: number = 25;
    static libprop_LIBPROP_LASTCALL_END_DETAILS: number = 24;
    static libprop_LIBPROP_AUTO_TOPUP_STATUS: number = 23;
    static libprop_LIBPROP_MPV_ENABLED: number = 22;
    static libprop_LIBPROP_DISABLE_WEB_SEARCH: number = 21;
    static libprop_LIBPROP_3G_FREE_TRIAL_IS_OVER: number = 20;
    static libprop_LIBPROP_MAX_VIDEOCONFCALL_PARTICIPANTS: number = 19;
    static libprop_LIBPROP_POLICY_DISABLE_FLAMINGO_CHANNEL: number = 18;
    static libprop_LIBPROP_LASTCALL_REMOTE_PROBLEMS: number = 17;
    static libprop_LIBPROP_LASTCALL_LOCAL_PROBLEMS: number = 16;
    static libprop_LIBPROP_POLICY_DISABLE_LOGOUT: number = 15;
    static libprop_LIBPROP_OLD_CAMERA_DRIVER: number = 14;
    static libprop_LIBPROP_POLICY_DISABLE_SCREENSHARING: number = 13;
    static libprop_LIBPROP_POLICY_DISABLE_DRAGONFLY: number = 12;
    static libprop_LIBPROP_POLICY_DISABLE_MICROPAYMENTS: number = 11;
    static libprop_LIBPROP_DISABLE_SENDMONEY: number = 10;
    static libprop_LIBPROP_POLICY_DISABLE_LANGUAGE_EDIT: number = 9;
    static libprop_LIBPROP_POLICY_DISABLE_PERSONALISE: number = 8;
    static libprop_LIBPROP_POLICY_DISABLE_VERSION_CHECK: number = 7;
    static libprop_LIBPROP_POLICY_DISABLE_CONTACT_IMPORT: number = 6;
    static libprop_LIBPROP_POLICY_DISABLE_FILE_TRANSFER: number = 5;
    static libprop_LIBPROP_POLICY_DISABLE_PUBLIC_API: number = 4;
    static libprop_LIBPROP_BW_CUROUT_KB: number = 3;
    static libprop_LIBPROP_BW_CURIN_KB: number = 2;
    static libprop_LIBPROP_IS_HTTPFE_ENABLED: number = 1;
    static libprop_LIBPROP_MAX_CONFCALL_PARTICIPANTS: number = 0;
    static nrt_CAPABILITIES_NRT_LYNC_PHASE2_ENABLED: number = 2;
    static nrt_CAPABILITIES_NRT_ENABLED: number = 1;
    static nrt_CAPABILITIES_NRT_DISABLED: number = 0;
    static uiprop_UIPROP_POLICY_LISTEN_RANGE_END: number = 19;
    static uiprop_UIPROP_POLICY_LISTEN_RANGE_BEGIN: number = 18;
    static uiprop_UIPROP_NOTIFICATIONS_LANGUAGE: number = 17;
    static uiprop_UIPROP_CALL_QUALITY_FEEDBACK_EXPECTED_WITH_NEXT_CALL: number = 16;
    static uiprop_UIPROP_IS_MOBILE_DEVICE: number = 15;
    static uiprop_UIPROP_SELECTED_CONTACT_IDENTITY: number = 14;
    static uiprop_UIPROP_POLICY_PROXY_USERNAME: number = 13;
    static uiprop_UIPROP_POLICY_PROXY_ADDRESS: number = 12;
    static uiprop_UIPROP_POLICY_PROXY_SETTING: number = 11;
    static uiprop_UIPROP_POLICY_LISTEN_HTTP_PORTS: number = 10;
    static uiprop_UIPROP_POLICY_LISTEN_PORT: number = 9;
    static uiprop_UIPROP_EXPRESSIVECONTENT_ITEMS: number = 8;
    static uiprop_UIPROP_LAST_CALL_ORIGIN: number = 7;
    static uiprop_UIPROP_TOOLBARITEM_USED_IN_LAST_MINUTE: number = 6;
    static uiprop_UIPROP_MENUITEM_USED_IN_LAST_MINUTE: number = 5;
    static uiprop_UIPROP_IC_LAST_YIELD: number = 4;
    static uiprop_UIPROP_IC_TOTAL_YIELD: number = 3;
    static uiprop_UIPROP_IC_RUN_COMPLETED_COUNT: number = 2;
    static uiprop_UIPROP_IC_RUN_STARTUP_COUNT: number = 1;
    static uiprop_UIPROP_LANGUAGE: number = 0;
    static user_LIKENESSES_USERLIKE_BUSINESS: number = 1;
    static user_LIKENESSES_USERLIKE_REGULAR: number = 0;
    static skypemanager_MEMBER_STATUSES_SM_ADMIN: number = 3;
    static skypemanager_MEMBER_STATUSES_SM_MANAGED: number = 2;
    static skypemanager_MEMBER_STATUSES_SM_MEMBER: number = 1;
    static skypemanager_MEMBER_STATUSES_SM_NONE: number = 0;
    static policy_DISABLE_VIDEO_OPTIONS_POLICY_VIDEO_DISABLED: number = 3;
    static policy_DISABLE_VIDEO_OPTIONS_POLICY_VIDEO_RECEIVE_DISABLED: number = 2;
    static policy_DISABLE_VIDEO_OPTIONS_POLICY_VIDEO_SEND_DISABLED: number = 1;
    static policy_DISABLE_VIDEO_OPTIONS_POLICY_VIDEO_ENABLED: number = 0;
    static livesession_END_DETAILS_LED_HOST_WENT_OFFLINE: number = 64;
    static livesession_END_DETAILS_LED_ENDED_NORMALLY_WITH_SUCCESSFUL_RECOVERY: number = 32;
    static livesession_END_DETAILS_LED_REMOTE_USER_TERMINATED_DURING_RECOVERY: number = 16;
    static livesession_END_DETAILS_LED_LOCAL_USER_TERMINATED_DURING_RECOVERY: number = 8;
    static livesession_END_DETAILS_LED_RECOVERY_UNSUCCESSFUL: number = 4;
    static livesession_END_DETAILS_LED_NO_REMOTE_CONNECTIVITY: number = 2;
    static livesession_END_DETAILS_LED_NO_LOCAL_CONNECTIVITY: number = 1;
    static content_LIST_CONTEXT_CL_CONTEXT_SDK_ALLOWLIST: number = 8;
    static content_LIST_CONTEXT_CL_CONTEXT_SDK_BLOCKLIST: number = 7;
    static content_LIST_CONTEXT_CL_CONTEXT_SF_BLOCKLIST: number = 6;
    static content_LIST_CONTEXT_CL_CONTEXT_PLUGIN_ALLOWLIST: number = 5;
    static content_LIST_CONTEXT_CL_CONTEXT_API_BLOCKLIST: number = 4;
    static content_LIST_CONTEXT_CL_CONTEXT_API_ALLOWLIST: number = 3;
    static content_LIST_CONTEXT_CL_CONTEXT_HTTPS_DIRECT: number = 2;
    static content_LIST_CONTEXT_CL_CONTEXT_DF_BLOCKED: number = 1;
    static content_LIST_RESULT_CL_FILE_ERROR: number = 4;
    static content_LIST_RESULT_CL_QUERY_FAILED: number = 3;
    static content_LIST_RESULT_CL_QUERY_PENDING: number = 2;
    static content_LIST_RESULT_CL_NOT_LISTED: number = 1;
    static content_LIST_RESULT_CL_LISTED: number = 0;
    static webgw_RESULT_WG_COOKIE_ERROR: number = 10;
    static webgw_RESULT_WG_REDIRECT_ERROR: number = 9;
    static webgw_RESULT_WG_INVALID_HOST: number = 8;
    static webgw_RESULT_WG_INVALID_URI_FORMAT: number = 7;
    static webgw_RESULT_WG_INVALID_URI_SCHEME: number = 6;
    static webgw_RESULT_WG_NO_ROUTES: number = 5;
    static webgw_RESULT_WG_WEB_TIMEOUT: number = 4;
    static webgw_RESULT_WG_TRANSFER_FAILED: number = 3;
    static webgw_RESULT_WG_ERROR: number = 2;
    static webgw_RESULT_WG_LOCAL_ERROR: number = 1;
    static webgw_RESULT_WG_SUCCESS: number = 0;
    static httpfe_METHOD_HTTPFE_POST: number = 1;
    static httpfe_METHOD_HTTPFE_GET: number = 0;
    static setupkey_HTTPFE_ACCEPT_DEFLATE: string = 'Lib/Pic/AcceptDeflate';
    static setupkey_HTTPFE_DISABLE_COOKIES: string = 'Lib/Pic/DisableCookies';
    static sa_PAYMENT_IID_SA_PAYMENT_IID_ATU: number = 5;
    static sa_PAYMENT_IID_SA_PAYMENT_IID_EXPDATE_YEAR: number = 4;
    static sa_PAYMENT_IID_SA_PAYMENT_IID_EXPDATE_MON: number = 3;
    static sa_PAYMENT_IID_SA_PAYMENT_IID_CARDTYPE: number = 2;
    static sa_PAYMENT_IID_SA_PAYMENT_IID_PRODUCT: number = 1;
    static sa_PAYMENT_IID_SA_PAYMENT_IID_AMOUNT_NUM: number = 0;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_ORDER_ID: number = 8;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_COUNTRY: number = 7;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_CURRENCY: number = 6;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_AMOUNT_STR: number = 5;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_CARD_VAL_NO: number = 4;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_CARD_NO: number = 3;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_CARDHOLDER: number = 2;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_SKYPERPWD: number = 1;
    static sa_PAYMENT_SID_SA_PAYMENT_SID_SKYPENAME: number = 0;
    static sa_PAYMENT_CARDTYPE_SA_PAYMENT_CARDTYPE_AMEX: number = 3;
    static sa_PAYMENT_CARDTYPE_SA_PAYMENT_CARDTYPE_MC: number = 2;
    static sa_PAYMENT_CARDTYPE_SA_PAYMENT_CARDTYPE_VISA: number = 1;
    static sa_PAYMENT_CARDTYPE_SA_PAYMENT_CARDTYPE_UNKNOWN: number = 0;
    static sa_PAYMENT_PRODUCT_SA_PAYMENT_PRODUCT_SKYPE_CREDIT: number = 0;
    static accesseventtype_EV_IS_HOTSPOT: number = 2003;
    static accesseventtype_EV_IS_ONLINE: number = 2002;
    static accesseventtype_EV_DISABLE_TEST_MODE: number = 2001;
    static accesseventtype_EV_ENABLE_TEST_MODE: number = 2000;
    static accesseventtype_EV_DISABLE_ACCESS: number = 1013;
    static accesseventtype_EV_ENABLE_ACCESS: number = 1012;
    static accesseventtype_EV_SET_SESSION_LENGTH: number = 1011;
    static accesseventtype_EV_LOGIN_OPERATOR: number = 1010;
    static accesseventtype_EV_REPORT_LOCATION: number = 1009;
    static accesseventtype_EV_RATE_HOTSPOT: number = 1008;
    static accesseventtype_EV_WIFI_CHANGED_DISABLED: number = 1007;
    static accesseventtype_EV_WIFI_CHANGED_UNSUPPORTED: number = 1006;
    static accesseventtype_EV_WIFI_CHANGED_SUPPORTED: number = 1005;
    static accesseventtype_EV_START_PAYMENT: number = 1004;
    static accesseventtype_EV_EXTEND: number = 1003;
    static accesseventtype_EV_REDETECT: number = 1002;
    static accesseventtype_EV_LOGOUT: number = 1001;
    static accesseventtype_EV_LOGIN: number = 1000;
    static accesseventtype_SA_SESSION_RECOVERABLE: number = 3;
    static accesseventtype_SA_SESSION_LOST: number = 2;
    static accesseventtype_SA_SESSION_AUTO_END: number = 1;
    static accesseventtype_SA_OBJECT_INVALIDATED: number = 0;
    static setupkey_ACCESS_SESSION_LEN: string = '*Lib/Access/SessionLen';
    static setupkey_ACCESS_ENABLED: string = '*Lib/Access/Enabled';
    static validateresult_STARTS_WITH_INVALID_CHAR: number = 10;
    static validateresult_TOO_SIMPLE: number = 9;
    static validateresult_CONTAINS_INVALID_WORD: number = 8;
    static validateresult_INVALID_FORMAT: number = 7;
    static validateresult_SAME_AS_USERNAME: number = 6;
    static validateresult_CONTAINS_SPACE: number = 5;
    static validateresult_CONTAINS_INVALID_CHAR: number = 4;
    static validateresult_TOO_LONG: number = 3;
    static validateresult_TOO_SHORT: number = 2;
    static validateresult_VALIDATED_OK: number = 1;
    static validateresult_NOT_VALIDATED: number = 0;
    static partner_ID_PARTNER_MICROSOFT: number = 999;
    static partner_ID_PARTNER_FACEBOOK: number = 95;
    static partner_ID_PARTNER_SKYPE: number = 1;
    static partner_ID_PARTNER_NONE: number = 0;
    static setupkey_ENDPOINT_NAME: string = 'Lib/MSNP/EndpointName';
    static setupkey_DISABLE_XMPP: string = '*Lib/XMPP/Disable';
    static setupkey_PRIVATE_SKYPE_MODE: string = 'Lib/Account/PrivateSkypeMode';
    static setupkey_IDLE_TIME_FOR_NA: string = 'Lib/Account/IdleTimeForNA';
    static setupkey_IDLE_TIME_FOR_AWAY: string = 'Lib/Account/IdleTimeForAway';
    static partner_QUERY_ERROR_PQ_SERVER_NOCONNECT: number = 2;
    static partner_QUERY_ERROR_PQ_SERVER_NOSUCCESS: number = 1;
    static partner_QUERY_ERROR_PQ_SUCCESS: number = 0;
    static partner_QUERY_ID_PQ_MANDALAY: number = 0;
    static partner_QUERY_PARAMS_PQ_USERID: number = 35;
    static partner_QUERY_PARAMS_PQ_PASSWORD: number = 34;
    static partner_QUERY_PARAMS_PQ_EMAIL: number = 33;
    static partner_QUERY_PARAMS_PQ_PARTNER_ID: number = 32;
    static partner_QUERY_TYPE_PQ_USERID_QUERY: number = 3;
    static partner_QUERY_TYPE_PQ_PROFILE_URL: number = 2;
    static partner_QUERY_TYPE_PQ_PICTURE_URL: number = 1;
    static partner_QUERY_TYPE_PQ_SESSIONTOKEN: number = 0;
    static setupkey_DC_NOPERSONAL: string = 'Lib/DynContent/DisablePersonal';
    static setupkey_DC_NOPROMO: string = 'Lib/DynContent/DisablePromo';
    static setupkey_DC_NOTIPS: string = 'Lib/DynContent/DisableTip';
    static setupkey_FT_INCOMING_LIMIT: string = 'Lib/FileTransfer/IncomingLimit';
    static setupkey_FT_SAVEPATH: string = 'Lib/FileTransfer/SavePath';
    static setupkey_FT_AUTOACCEPT: string = 'Lib/FileTransfer/AutoAccept';
    static callerid_STATE_CLI_BLOCKED: number = 5;
    static callerid_STATE_CLI_FAILED: number = 4;
    static callerid_STATE_CLI_ACTIVE: number = 3;
    static callerid_STATE_CLI_VERIFIED: number = 2;
    static callerid_STATE_CLI_PENDING: number = 1;
    static callerid_OPTIONS_CHANGE_CLI_LOADED_NEW: number = 3;
    static callerid_OPTIONS_CHANGE_CLI_SET_FAILED: number = 2;
    static callerid_OPTIONS_CHANGE_CLI_SET_SUCCESS: number = 1;
    static callerid_IDCONFIG_AUTOSELECT_CLI: number = 4;
    static callerid_IDCONFIG_USE_SMS_FOR_CLI: number = 2;
    static callerid_IDCONFIG_USE_CLI_FOR_SMS: number = 1;
    static callerid_TYPE_CLI_T_SKYPEIN: number = 3;
    static callerid_TYPE_CLI_T_MOBILE: number = 2;
    static callerid_TYPE_CLI_T_SMS: number = 1;
    static mobile_DATA_USAGE_LEVEL_UNLIMITED: number = 100;
    static mobile_DATA_USAGE_LEVEL_MEDIUM: number = 20;
    static mobile_DATA_USAGE_LEVEL_LOW: number = 10;
    static operating_MEDIA_OM_4G: number = 4;
    static operating_MEDIA_OM_3G: number = 3;
    static operating_MEDIA_OM_FREE_WIRELESS: number = 2;
    static operating_MEDIA_OM_FREE: number = 1;
    static operating_MEDIA_OM_UNKNOWN: number = 0;
    static audiodevice_CAPABILITIES_HAS_BLUETOOTH_INTERFACE: number = 4096;
    static audiodevice_CAPABILITIES_HAS_VIDEO_RENDERING: number = 2048;
    static audiodevice_CAPABILITIES_POSSIBLY_WEBCAM: number = 256;
    static audiodevice_CAPABILITIES_IS_HEADSET: number = 128;
    static audiodevice_CAPABILITIES_IS_WEBCAM: number = 64;
    static audiodevice_CAPABILITIES_HAS_LOWBANDWIDTH_CAPTURE: number = 32;
    static audiodevice_CAPABILITIES_HAS_AUDIO_RENDERING: number = 16;
    static audiodevice_CAPABILITIES_HAS_AUDIO_CAPTURE: number = 8;
    static audiodevice_CAPABILITIES_POSSIBLY_HEADSET: number = 4;
    static audiodevice_CAPABILITIES_HAS_USB_INTERFACE: number = 2;
    static audiodevice_CAPABILITIES_HAS_VIDEO_CAPTURE: number = 1;
    static preparesoundresult_PREPARESOUND_PLAYBACK_NOT_SUPPORTED: number = 6;
    static preparesoundresult_PREPARESOUND_UNSUPPORTED_FILE_FORMAT: number = 5;
    static preparesoundresult_PREPARESOUND_FILE_READ_ERROR: number = 4;
    static preparesoundresult_PREPARESOUND_FILE_TOO_BIG: number = 3;
    static preparesoundresult_PREPARESOUND_FILE_NOT_FOUND: number = 2;
    static preparesoundresult_PREPARESOUND_MISC_ERROR: number = 1;
    static preparesoundresult_PREPARESOUND_SUCCESS: number = 0;
    static setupkey_DISABLE_AUDIO_DEVICE_PROBING: string = '*Lib/QualityMonitor/DisableAudioDeviceProbing';
    static setupkey_BEAMFORMER_MIC_SPACING: string = '*Lib/Audio/BeamformerMicSpacing';
    static setupkey_DISABLE_DIGITAL_FAR_END_AGC: string = '*Lib/Audio/DisableDigitalFarEndAGC';
    static setupkey_DISABLE_DIGITAL_NEAR_END_AGC: string = '*Lib/Audio/DisableDigitalNearEndAGC';
    static setupkey_DISABLE_AGC: string = '*Lib/Audio/DisableAGC';
    static setupkey_DISABLE_NOISE_SUPPRESSOR: string = '*Lib/Audio/DisableNS';
    static setupkey_DISABLE_AEC: string = '*Lib/Audio/DisableAEC';
    static setupkey_DISABLED_CODECS: string = '*Lib/Audio/DisableCodecs';
    static qualitytestresult_QTR_EXCELLENT: number = 5;
    static qualitytestresult_QTR_GOOD: number = 4;
    static qualitytestresult_QTR_AVERAGE: number = 3;
    static qualitytestresult_QTR_POOR: number = 2;
    static qualitytestresult_QTR_CRITICAL: number = 1;
    static qualitytestresult_QTR_UNDEFINED: number = 0;
    static qualitytesttype_QTT_VIDEO_IN: number = 5;
    static qualitytesttype_QTT_NETWORK: number = 4;
    static qualitytesttype_QTT_CPU: number = 3;
    static qualitytesttype_QTT_VIDEO_OUT: number = 2;
    static qualitytesttype_QTT_AUDIO_OUT: number = 1;
    static qualitytesttype_QTT_AUDIO_IN: number = 0;
    static video_DEVICE_TYPE_VIDEO_DEVICE_VIRTUAL: number = 2;
    static video_DEVICE_TYPE_VIDEO_DEVICE_CAPTURE_ADAPTER: number = 1;
    static video_DEVICE_TYPE_VIDEO_DEVICE_USB_CAMERA: number = 0;
    static codec_COMPATIBILITY_CODEC_NOT_COMPATIBLE: number = 2;
    static codec_COMPATIBILITY_CODEC_NOT_COMPATIBLE_BUT_PLATFORM_IS_GVC_SUPPORTED: number = 1;
    static codec_COMPATIBILITY_CODEC_COMPATIBLE: number = 0;
    static livesession_QUALITYRATING_VERY_GOOD: number = 4;
    static livesession_QUALITYRATING_GOOD: number = 3;
    static livesession_QUALITYRATING_AVERAGE: number = 2;
    static livesession_QUALITYRATING_BAD: number = 1;
    static livesession_QUALITYRATING_VERY_BAD: number = 0;
    static leave_REASON_LIVE_PARTICIPANT_COUNT_LIMIT_REACHED: number = 131;
    static leave_REASON_LIVE_TOO_MANY_IDENTITIES: number = 130;
    static leave_REASON_LIVE_PLUGIN_INSTALL_NEEDED: number = 129;
    static leave_REASON_LIVE_EMERGENCY_CALL_DENIED: number = 128;
    static leave_REASON_LIVE_BLOCKED_BY_US: number = 127;
    static leave_REASON_LIVE_TRANSFER_INSUFFICIENT_FUNDS: number = 126;
    static leave_REASON_LIVE_TRANSFER_FAILED: number = 125;
    static leave_REASON_LIVE_ERROR: number = 124;
    static leave_REASON_LIVE_BLOCKED_BY_PRIVACY_SETTINGS: number = 123;
    static leave_REASON_LIVE_LEGACY_ERROR: number = 122;
    static leave_REASON_LIVE_PLAYBACK_ERROR: number = 121;
    static leave_REASON_LIVE_RECORDING_FAILED: number = 120;
    static leave_REASON_LIVE_UNABLE_TO_CONNECT: number = 119;
    static leave_REASON_LIVE_INTERNAL_ERROR: number = 118;
    static leave_REASON_LIVE_PSTN_MISC_ERROR: number = 117;
    static leave_REASON_LIVE_PSTN_CALL_REJECTED: number = 116;
    static leave_REASON_LIVE_NUMBER_UNAVAILABLE: number = 115;
    static leave_REASON_LIVE_PSTN_NETWORK_ERROR: number = 114;
    static leave_REASON_LIVE_PSTN_CALL_TERMINATED: number = 113;
    static leave_REASON_LIVE_PSTN_BUSY: number = 112;
    static leave_REASON_LIVE_PSTN_CALL_TIMED_OUT: number = 111;
    static leave_REASON_LIVE_PSTN_NUMBER_FORBIDDEN: number = 110;
    static leave_REASON_LIVE_PSTN_INVALID_NUMBER: number = 109;
    static leave_REASON_LIVE_PSTN_COULD_NOT_CONNECT_TO_SKYPE_PROXY: number = 108;
    static leave_REASON_LIVE_SKYPEOUT_ACCOUNT_BLOCKED: number = 107;
    static leave_REASON_LIVE_INTERNET_CONNECTION_LOST: number = 106;
    static leave_REASON_LIVE_INSUFFICIENT_FUNDS: number = 105;
    static leave_REASON_LIVE_NO_SKYPEOUT_SUBSCRIPTION: number = 104;
    static leave_REASON_LIVE_CONNECTION_DROPPED: number = 103;
    static leave_REASON_LIVE_BUSY: number = 102;
    static leave_REASON_LIVE_MANUAL: number = 101;
    static leave_REASON_LIVE_NO_ANSWER: number = 100;
    static leave_REASON_RETIRED_INTERNAL_ERROR: number = 8;
    static leave_REASON_RETIRED_CHAT_FULL: number = 7;
    static leave_REASON_RETIRED_UNSUBSCRIBE: number = 6;
    static leave_REASON_RETIRED_DECLINE_ADD: number = 5;
    static leave_REASON_RETIRED_ADDER_MUST_BE_AUTHORIZED: number = 4;
    static leave_REASON_RETIRED_ADDER_MUST_BE_FRIEND: number = 3;
    static leave_REASON_RETIRED_USER_INCAPABLE: number = 2;
    static leave_REASON_LEAVE_REASON_NONE: number = 0;
    static transfer_SENDFILE_ERROR_TRANSFER_TOO_MANY_PARALLEL: number = 3;
    static transfer_SENDFILE_ERROR_TRANSFER_OPEN_FAILED: number = 2;
    static transfer_SENDFILE_ERROR_TRANSFER_BAD_FILENAME: number = 1;
    static transfer_SENDFILE_ERROR_TRANSFER_OPEN_SUCCESS: number = 0;
    static contact_SYNC_TYPE_CONTACT_SCD: number = 0;
    static unifyresult_UNIFY_TOO_MANY_OUTLOOK: number = 4;
    static unifyresult_UNIFY_TOO_MANY_SKYPE: number = 3;
    static unifyresult_UNIFY_ALREADY_UNIFIED: number = 2;
    static unifyresult_UNIFY_INVALID_IDENTITY: number = 1;
    static unifyresult_UNIFY_OK: number = 0;
    static normalizeresult_SKYPENAME_SHORTER_THAN_6_CHARS: number = 7;
    static normalizeresult_SKYPENAME_STARTS_WITH_NONALPHA: number = 6;
    static normalizeresult_PSTN_NUMBER_HAS_INVALID_PREFIX: number = 5;
    static normalizeresult_PSTN_NUMBER_TOO_SHORT: number = 4;
    static normalizeresult_IDENTITY_CONTAINS_INVALID_CHAR: number = 3;
    static normalizeresult_IDENTITY_TOO_LONG: number = 2;
    static normalizeresult_IDENTITY_EMPTY: number = 1;
    static normalizeresult_IDENTITY_OK: number = 0;
    static identitytype_LYNC: number = 12;
    static identitytype_PASSPORT: number = 11;
    static identitytype_XMPP: number = 10;
    static identitytype_EXTERNAL: number = 9;
    static identitytype_CONFERENCE: number = 8;
    static identitytype_PSTN_UNDISCLOSED: number = 7;
    static identitytype_PSTN_FREE: number = 6;
    static identitytype_PSTN_EMERGENCY: number = 5;
    static identitytype_PSTN: number = 4;
    static identitytype_SKYPE_UNDISCLOSED: number = 3;
    static identitytype_SKYPE_MYSELF: number = 2;
    static identitytype_SKYPE: number = 1;
    static identitytype_UNRECOGNIZED: number = 0;
    static setupkey_ALLOW_INCOMING_LYNC_ID: string = '*Lib/Call/AllowIncomingLyncId';
    static setupkey_ALLOW_DEBUG_DATA_COLLECTION: string = 'Lib/Sherlock/AllowDebugDataCollection';
    static setupkey_DB_PAGE_SIZE: string = '*Lib/DbManager/PageSize';
    static setupkey_DB_STORAGE_QUOTA_KB: string = '*Lib/DbManager/StorageQuotaKb';

    static log() {

    }

    start(block: Boolean): void {
        console.warn('shimmed function WrSkyLib.start');
        setTimeout(() => {
            this.dispatchEvent(new CustomEvent("libready"))
            this.dispatchEvent(new CustomEvent("login"))
        }, 5000);
    }

    getLibStatus(): number {
        return WrSkyLib.libstatus_RUNNING;
    }

    subscribePropChange(props: number[]): void {
        console.warn('shimmed function WrSkyLib.subscribePropChange');
    }

    getSupportedUILanguageList(uiLanguageCodeList: VectGIString): void {
        console.warn('shimmed function WrSkyLib.getSupportedUILanguageList', uiLanguageCodeList);
    }

    setUIIntProp(key: number, value: number): void {
        console.info('shimmed function WrSkyLib.setUIIntProp');
        this._uiSettings.set(key, value);
        ApplicationData.current.localSettings.set("__uisettings", [...this._uiSettings]);
    }

    setUIStrProp(key: number, value: string): void {
        console.info('shimmed function WrSkyLib.setUIStrProp');
        this._uiSettings.set(key, value);
        ApplicationData.current.localSettings.set("__uisettings", [...this._uiSettings]);
    }

    getUIIntProp(key: number): number {
        console.info('shimmed function WrSkyLib.getUIIntProp');
        return this._uiSettings.get(key);
    }

    getUIStrProp(key: number, defaultValue: string): string {
        console.info('shimmed function WrSkyLib.getUIStrProp');
        return this._uiSettings.get(key);
    }

    deleteUIProp(key: number): void {
        console.info('shimmed function WrSkyLib.deleteUIProp');
        this._uiSettings.delete(key);
    }

    getIntLibProp(key: number): number {
        throw new Error('shimmed function WrSkyLib.getIntLibProp');
    }

    getStrLibProp(key: number, defaultValue: string): string {
        throw new Error('shimmed function WrSkyLib.getStrLibProp');
    }

    getStrLibPropInternal(lib_key: number, defaultValue: string): string {
        throw new Error('shimmed function WrSkyLib.getStrLibPropInternal');
    }

    setLocalizedString(localizedString: number, value: string): void {
        console.warn('shimmed function WrSkyLib.setLocalizedString');
    }

    handleNotification(notificationContent: string): void {
        console.warn('shimmed function WrSkyLib.handleNotification');
    }

    getAvailableOutputDevicesAsync(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): IAsyncOperation<boolean> {
        console.warn('shimmed function WrSkyLib.getAvailableOutputDevicesAsync');
        return IAsyncOperation.wrap((async () => {
            try {
                let devices = await navigator.mediaDevices.enumerateDevices();
                for (const device of devices) {
                    if (device.kind == "audiooutput") {
                        handleList.append(device.deviceId);
                        nameList.append(device.label);
                        productIdList.append(device.groupId);
                    }
                }

                return true;
            }
            catch{ }

            return false;
        })());
    }

    getAvailableRecordingDevicesAsync(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): IAsyncOperation<Boolean> {
        console.warn('shimmed function WrSkyLib.getAvailableRecordingDevicesAsync');
        return IAsyncOperation.wrap((async () => {
            try {
                let devices = await navigator.mediaDevices.enumerateDevices();
                for (const device of devices) {
                    if (device.kind == "audioinput") {
                        handleList.append(device.deviceId);
                        nameList.append(device.label);
                        productIdList.append(device.groupId);
                    }
                }

                return true;
            }
            catch{ }

            return false;
        })());
    }

    getConversationList(conversations: VectUnsignedInt, type: number): void {
        console.warn('shimmed function WrSkyLib.getConversationList');
    }

    getContactByIdentity(identity: string): Contact {
        if (identity == this.myIdentity) {
            return this.myself;
        }

        return null;
    }

    getMessageListByType(type: number, latestPerConvOnly: Boolean, messages: VectUnsignedInt, fromTimestampInc: number, toTimestampExc: number): void {
        console.warn('shimmed function WrSkyLib.getMessageListByType');
    }

    getVideoMessagingEntitlement(ids: VectGIString, values: VectUnsignedInt): SkyLibGetVideoMessagingEntitlementResult {

        ids.append("messages_left");
        values.append(0);
        ids.append("send_enabled");
        values.append(1);

        return {
            planName: "wankerr-co-ltd-super-plan",
            isEntitled: true
        }
    }

    playStartFromFile(soundid: number, datafile: Filename, loop: Boolean, useCallOutDevice: Boolean): number {
        console.error('shimmed function WrSkyLib.playStartFromFile');
        return 0;
    }

    selectSoundDevices(callInDevice: string, callOutDevice: string, waveOutDevice: string): void {
        console.warn('shimmed function WrSkyLib.selectSoundDevices');
    }

    static initPlatform(): IAsyncAction {
        return new IAsyncAction((resolve, reject) => resolve());
    }

    static contentEncode(source: string, raw_xml: Boolean): string {
        return source;
    }

    addEventListener(name: string, handler: Function) {
        console.warn(`WrSkyLib::addEventListener: ${name}`);
        switch (name) {
            case "videoaspectratiochanged": // OnVideoAspectRatioChanged
            case "libready": // NotifyEventType
            case "loginstart": // NotifyEventType
            case "logout": // NotifyEventType
            case "loginpartially": // NotifyEventType
            case "login": // NotifyEventType
            case "objectpropertychange": // OnObjectPropertyChangeType
            case "objectdelete": // OnObjectDeleteType
            case "seamlesscapableresult": // OnSeamlessCapableResultType
            case "servertimeavailable": // OnServerTimeAvailableType
            case "registercontextscomplete": // OnRegisterContextsCompleteType
            case "pushhandlingcomplete": // OnPushHandlingCompleteType
            case "accountavatarresult": // OnAccountAvatarResultType
            case "suggestedaccountsresult": // OnSuggestedAccountsResultType
            case "partnerlinkinforesult": // OnPartnerLinkInfoResultType
            case "accountpartnerlinkresult": // OnAccountPartnerLinkResultType
            case "authtokenrequest": // OnAuthTokenRequestType
            case "authtokenresultwithtimeout": // OnAuthTokenResultWithTimeoutType
            case "authtokenresult": // OnAuthTokenResultType
            case "videomessagingentitlementchanged": // OnVideoMessagingEntitlementChangedType
            case "app2appstreamlistchange": // OnApp2AppStreamListChangeType
            case "incomingapp2appdatagram": // OnApp2AppDatagramType
            case "operationmodechanged": // OnOperationModeChangedType
            case "upgradenotice": // OnUpgradeNoticeType
            case "checkupgraderesult": // OnCheckUpgradeResultType
            case "statsreported": // OnStatsReportedType
            case "libpropchange": // OnLibPropChangeType
            case "contentlistingresult": // OnContentListingResultType
            case "publicapinotification": // OnPublicAPINotificationType
            case "httpstreamresponse": // OnHttpStreamResponseType
            case "httpresponse": // OnHttpResponseType
            case "accessevent": // OnAccessEventType
            case "accessconnectionfailure": // OnAccessConnectionFailureType
            case "accessdisconnected": // OnAccessDisconnectedType
            case "accessconnected": // OnAccessConnectedType
            case "accessdetectfailure": // OnAccessDetectFailureType
            case "accessdetecting": // OnAccessDetectingType
            case "externalloginrequest": // OnExternalLoginRequestType
            case "partnerqueryresult": // OnPartnerQueryResultType
            case "incomingpricequote": // OnIncomingPriceQuoteType
            case "incomingalert": // OnIncomingAlertType
            case "contentitemchange": // OnContentItemChangeType
            case "calleridoptionschange": // OnCallerIDOptionsChangeType
            case "nrglevelschange": // OnNrgLevelsChangeType
            case "availabledevicelistchange": // OnAvailableDeviceListChangeType
            case "qualitytestresult": // OnQualityTestResultType
            case "h264activated": // OnH264ActivatedType
            case "availablevideodevicelistchange": // OnAvailableVideoDeviceListChangeType
            case "filetransferinitiated": // OnFileTransferInitiatedType
            case "incomingmessage": // SkyLibOnMessageType
            case "searchmessagesresult": // OnSearchMessagesResultType
            case "conversationlistchange": // OnConversationListChangeType
            case "initialeassyncdone": // OnInitialEasSyncDoneType
            case "promotedscdcontactsfound": // OnPromotedSCDContactsFoundType
            case "unifiedmasterschanged": // OnUnifiedMastersChangedType
            case "unifiedservantschanged": // OnUnifiedServantsChangedType
            case "contactgoneoffline": // OnContactGoneOfflineType
            case "contactonlineappearance": // OnContactOnlineAppearanceType
            case "newcustomcontactgroup": // OnNewCustomContactGroupType
                break;
        }

        super.addEventListener(name, handler);
    }
}

export class SkyLibGetVideoMessagingEntitlementResult {
    planName: string;
    isEntitled: Boolean;
}