import { AccessSession } from "./AccessSession";
import { Account } from "./Account";
import { Alert } from "./Alert";
import { AvatarManager } from "./AvatarManager";
import { Binary } from "./Binary";
import { Contact } from "./Contact";
import { ContactGroup } from "./ContactGroup";
import { ContactSearch } from "./ContactSearch";
import { Conversation } from "./Conversation";
import { Filename } from "./Filename";
import { MediaDocument } from "./MediaDocument";
import { Message } from "./Message";
import { NotifyEventType } from "./NotifyEventType";
import { OnAccessConnectedType } from "./OnAccessConnectedType";
import { OnAccessConnectionFailureType } from "./OnAccessConnectionFailureType";
import { OnAccessDetectFailureType } from "./OnAccessDetectFailureType";
import { OnAccessDetectingType } from "./OnAccessDetectingType";
import { OnAccessDisconnectedType } from "./OnAccessDisconnectedType";
import { OnAccessEventType } from "./OnAccessEventType";
import { OnAccountAvatarResultType } from "./OnAccountAvatarResultType";
import { OnAccountPartnerLinkResultType } from "./OnAccountPartnerLinkResultType";
import { OnApp2AppDatagramType } from "./OnApp2AppDatagramType";
import { OnApp2AppStreamListChangeType } from "./OnApp2AppStreamListChangeType";
import { OnAuthTokenRequestType } from "./OnAuthTokenRequestType";
import { OnAuthTokenResultType } from "./OnAuthTokenResultType";
import { OnAuthTokenResultWithTimeoutType } from "./OnAuthTokenResultWithTimeoutType";
import { OnAvailableDeviceListChangeType } from "./OnAvailableDeviceListChangeType";
import { OnAvailableVideoDeviceListChangeType } from "./OnAvailableVideoDeviceListChangeType";
import { OnCallerIDOptionsChangeType } from "./OnCallerIDOptionsChangeType";
import { OnCheckUpgradeResultType } from "./OnCheckUpgradeResultType";
import { OnContactGoneOfflineType } from "./OnContactGoneOfflineType";
import { OnContactOnlineAppearanceType } from "./OnContactOnlineAppearanceType";
import { OnContentItemChangeType } from "./OnContentItemChangeType";
import { OnContentListingResultType } from "./OnContentListingResultType";
import { OnConversationListChangeType } from "./OnConversationListChangeType";
import { OnExternalLoginRequestType } from "./OnExternalLoginRequestType";
import { OnFileTransferInitiatedType } from "./OnFileTransferInitiatedType";
import { OnH264ActivatedType } from "./OnH264ActivatedType";
import { OnHttpResponseType } from "./OnHttpResponseType";
import { OnHttpStreamResponseType } from "./OnHttpStreamResponseType";
import { OnIncomingAlertType } from "./OnIncomingAlertType";
import { OnIncomingPriceQuoteType } from "./OnIncomingPriceQuoteType";
import { OnInitialEasSyncDoneType } from "./OnInitialEasSyncDoneType";
import { OnLibPropChangeType } from "./OnLibPropChangeType";
import { OnNewCustomContactGroupType } from "./OnNewCustomContactGroupType";
import { OnNrgLevelsChangeType } from "./OnNrgLevelsChangeType";
import { OnObjectDeleteType } from "./OnObjectDeleteType";
import { OnObjectPropertyChangeType } from "./OnObjectPropertyChangeType";
import { OnOperationModeChangedType } from "./OnOperationModeChangedType";
import { OnPartnerLinkInfoResultType } from "./OnPartnerLinkInfoResultType";
import { OnPartnerQueryResultType } from "./OnPartnerQueryResultType";
import { OnPromotedSCDContactsFoundType } from "./OnPromotedSCDContactsFoundType";
import { OnPublicAPINotificationType } from "./OnPublicAPINotificationType";
import { OnPushHandlingCompleteType } from "./OnPushHandlingCompleteType";
import { OnQualityTestResultType } from "./OnQualityTestResultType";
import { OnRegisterContextsCompleteType } from "./OnRegisterContextsCompleteType";
import { OnSeamlessCapableResultType } from "./OnSeamlessCapableResultType";
import { OnSearchMessagesResultType } from "./OnSearchMessagesResultType";
import { OnServerTimeAvailableType } from "./OnServerTimeAvailableType";
import { OnStatsReportedType } from "./OnStatsReportedType";
import { OnSuggestedAccountsResultType } from "./OnSuggestedAccountsResultType";
import { OnUnifiedMastersChangedType } from "./OnUnifiedMastersChangedType";
import { OnUnifiedServantsChangedType } from "./OnUnifiedServantsChangedType";
import { OnUpgradeNoticeType } from "./OnUpgradeNoticeType";
import { OnVideoAspectRatioChanged } from "./OnVideoAspectRatioChanged";
import { OnVideoMessagingEntitlementChangedType } from "./OnVideoMessagingEntitlementChangedType";
import { Participant } from "./Participant";
import { PriceQuote } from "./PriceQuote";
import { Setup } from "./Setup";
import { SkyLibAccessPaymentGetIntResult } from "./SkyLibAccessPaymentGetIntResult";
import { SkyLibAccessPaymentGetStringResult } from "./SkyLibAccessPaymentGetStringResult";
import { SkyLibCanUnifyContactsResult } from "./SkyLibCanUnifyContactsResult";
import { SkyLibContentEncodeResult } from "./SkyLibContentEncodeResult";
import { SkyLibContentGetEditableResult } from "./SkyLibContentGetEditableResult";
import { SkyLibContentGetRichEditableResult } from "./SkyLibContentGetRichEditableResult";
import { SkyLibContentItemGetChildItemResult } from "./SkyLibContentItemGetChildItemResult";
import { SkyLibContentItemGetResult } from "./SkyLibContentItemGetResult";
import { SkyLibContentStripXMLResult } from "./SkyLibContentStripXMLResult";
import { SkyLibFindContactByPstnNumberResult } from "./SkyLibFindContactByPstnNumberResult";
import { SkyLibGetAudioDeviceCapabilitiesResult } from "./SkyLibGetAudioDeviceCapabilitiesResult";
import { SkyLibGetCallerIDOptionsResult } from "./SkyLibGetCallerIDOptionsResult";
import { SkyLibGetDefaultContentIdResult } from "./SkyLibGetDefaultContentIdResult";
import { SkyLibGetNrgLevelsResult } from "./SkyLibGetNrgLevelsResult";
import { SkyLibGetVideoMessagingEntitlementResult } from "./SkyLibGetVideoMessagingEntitlementResult";
import { SkyLibIsMicrophoneMutedResult } from "./SkyLibIsMicrophoneMutedResult";
import { SkyLibIsSpeakerMutedResult } from "./SkyLibIsSpeakerMutedResult";
import { SkyLibNormalizeIdentityResult } from "./SkyLibNormalizeIdentityResult";
import { SkyLibNormalizePSTNWithCountryResult } from "./SkyLibNormalizePSTNWithCountryResult";
import { SkyLibOnMessageType } from "./SkyLibOnMessageType";
import { SkyLibQueryContentListingResult } from "./SkyLibQueryContentListingResult";
import { SkyLibUnifyContactsResult } from "./SkyLibUnifyContactsResult";
import { SkyLibValidateAvatarResult } from "./SkyLibValidateAvatarResult";
import { SkyLibValidateProfileStringResult } from "./SkyLibValidateProfileStringResult";
import { SkyLibVerifyAndUnpackResult } from "./SkyLibVerifyAndUnpackResult";
import { SkyMetadata } from "./SkyMetadata";
import { Sms } from "./Sms";
import { Transfer } from "./Transfer";
import { VectGIString } from "./VectGIString";
import { VectUnsignedInt } from "./VectUnsignedInt";
import { Video } from "./Video";
import { VideoMessage } from "./VideoMessage";
import { Voicemail } from "./Voicemail";
import { IMap } from "winrt/Windows/Foundation/Collections/IMap`2";
import { IVector } from "winrt/Windows/Foundation/Collections/IVector`1";
import { IAsyncAction } from "winrt/Windows/Foundation/IAsyncAction";
import { AsyncOperation, IAsyncOperation } from "winrt/Windows/Foundation/IAsyncOperation`1";
import { IClosable } from "winrt/Windows/Foundation/IClosable";
import { Enumerable } from "winrt/Windows/Foundation/Interop/Enumerable";
import { GenerateShim } from "winrt/Windows/Foundation/Interop/GenerateShim";
import { InvokeEvent } from "winrt/Windows/Foundation/Interop/InvokeEvent";

import { Client, TextChannel, Message as DiscordMessage } from "discord.js"
import path from "path";
import { ApplicationData } from "winrt/Windows/Storage/ApplicationData";

const GUILD_ID: string = "185067273613082634";

@GenerateShim('LibWrap.WrSkyLib')
export class WrSkyLib implements IClosable {

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

    defaultVideoDeviceHandle: string = null;
    logoutReason: number = null;
    myIdentity: string = null;
    loginInProgress: boolean = null;
    loggedIn: boolean = null;
    myself: Contact = null;
    account: Account = null;
    setup: Setup = null;
    avatarmanager: AvatarManager = null;

    private static __instance: WrSkyLib;
    private status: number = WrSkyLib.libstatus_CONSTRUCTED;
    client: Client;
    private sound: HTMLAudioElement;
    private channelMap: Map<number, TextChannel>;
    private messageMap: Map<number, DiscordMessage>;
    private uiSettings: Map<number, any> = new Map();

    constructor(skypeVersion: string) {
        this.channelMap = new Map();
        this.messageMap = new Map();
        this.setup = new Setup();
        this.client = new Client({})
        this.avatarmanager = new AvatarManager(this.client);
        this.sound = document.createElement("audio");
        this.uiSettings = new Map(ApplicationData.current.localSettings.values["__uisettings"] ?? []);

        document.body.appendChild(this.sound);

        console.warn('WrSkyLib.ctor not implemented')
    }

    static getInstance(): WrSkyLib {
        if (!WrSkyLib.__instance)
            WrSkyLib.__instance = new WrSkyLib("");

        return WrSkyLib.__instance;
    }
    static initPlatform(): IAsyncAction {
        return new AsyncOperation((resolve, reject) => resolve());
    }
    static log(subsystem: string, message: string): void {
        console.log(`[${subsystem}]: ${message}`)
    }

    getLibStatus(): number {
        return this.status;
    }

    start(block: boolean): void {
        console.warn('WrSkyLib#start not implemented')
        InvokeEvent(this.__libReady, "libready", null)

        this.client.on('guildCreate', guild => {
            if (guild.id == GUILD_ID) {

                // var conversationObjectId = args.detail[0];
                // var filterType = args.detail[1];
                // var added = args.detail[2];

                InvokeEvent(this.__conversationListChange, "conversationlistchange", [GUILD_ID, Conversation.list_TYPE_ALL_CONVERSATIONS, guild.channels.cache.size, true]);
            }
        });


        this.client.on('message', msg => {
            this.messageMap.set(msg.createdTimestamp, msg);
            InvokeEvent(this.__incomingMessage, "incomingmessage", [msg.createdTimestamp,])
        })

        this.client.on('ready', () => {
            this.status = WrSkyLib.libstatus_RUNNING;
            this.loggedIn = true;
            this.myIdentity = this.client.user.id;
            this.account = new Account(this.client.user);
            this.myself = new Contact(this.client.user);
            InvokeEvent(this.__login, "login", null)
        });

        
    }

    getConversationList(conversations: VectUnsignedInt, type: number): void {
        let guild = this.client.guilds.cache.get("185067273613082634");

        if (guild != null) {
            for (const channel of guild.channels.cache.values()) {
                if (channel.type == "text" && !(channel as TextChannel).nsfw) {
                    conversations.append(this.channelMap.size);
                    this.channelMap.set(this.channelMap.size, channel as TextChannel);
                }
            }
        }
    }

    getUnconsumedConversationsCount(type: number): number {
        throw new Error('WrSkyLib#getUnconsumedConversationsCount not implemented')
    }

    getAvailableOutputDevicesAsync(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => {
            var devices = await navigator.mediaDevices.enumerateDevices();
            for (const device of devices) {
                if (device.kind != "audiooutput")
                    continue;
                handleList.append(device.deviceId);
                nameList.append(device.label);
                productIdList.append(device.deviceId);
            }
            return true;
        })
    }

    getAvailableRecordingDevicesAsync(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): IAsyncOperation<boolean> {
        return AsyncOperation.from(async () => {
            var devices = await navigator.mediaDevices.enumerateDevices();
            for (const device of devices) {
                if (device.kind != "audiooutput")
                    continue;
                handleList.append(device.deviceId);
                nameList.append(device.label);
                productIdList.append(device.deviceId);
            }
            return true;
        })
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

    getContactByIdentity(identity: string): Contact {
        if (identity == this.myIdentity)
            return this.myself
    }

    playStart(soundid: number, sound: Binary, loop: boolean, useCallOutDevice: boolean): void {
        console.warn('WrSkyLib#playStart not implemented')
    }

    playStop(soundid: number): void {
        this.sound.pause();
    }

    playStartFromFile(soundid: number, datafile: Filename, loop: boolean, useCallOutDevice: Boolean): number {
        const basename = path.basename(datafile.filePath, path.extname(datafile.filePath))
        const newPath = path.join(path.dirname(datafile.filePath), basename + ".mp3")

        this.sound.loop = loop;
        this.sound.src = newPath;
        this.sound.play();
        return 0;
    }

    getConversation(objectID: number): Conversation {
        if (this.channelMap.has(objectID))
            return new Conversation(this.channelMap.get(objectID), objectID);

        return null;
    }

    getConversationMessage(objectId: number): Message {
        return new Message(this.messageMap.get(objectId), objectId);
    }

    getConversationByIdentity(identity: string): Conversation {
        if (identity.startsWith("channel_")) {
            const id = identity.substr(8);
            const guild = this.client.guilds.cache.get("185067273613082634");
            const channel = guild.channels.cache.get(id) as TextChannel;

            return new Conversation(channel, [...this.channelMap.values()].indexOf(channel));
        }

        return null;
    }

    getConversationByIdentity_(convoIdentity: string, conversation: Conversation, matchPSTN: boolean): boolean {
        return false;
    }

    getSupportedUILanguageList(uiLanguageCodeList: VectGIString): void {
        console.warn('WrSkyLib#getSupportedUILanguageList not implemented')
    }

    setUIIntProp(key: number, value: number): void {
        console.info('shimmed function WrSkyLib.setUIIntProp');
        this.uiSettings.set(key, value);
        ApplicationData.current.localSettings.values["__uisettings"] = [...this.uiSettings];
    }

    setUIStrProp(key: number, value: string): void {
        console.info('shimmed function WrSkyLib.setUIStrProp');
        this.uiSettings.set(key, value);
        ApplicationData.current.localSettings.values["__uisettings"] = [...this.uiSettings];
    }

    getUIIntProp(key: number): number {
        console.info('shimmed function WrSkyLib.getUIIntProp');
        return this.uiSettings.get(key);
    }

    getUIStrProp(key: number, defaultValue: string): string {
        console.info('shimmed function WrSkyLib.getUIStrProp');
        return this.uiSettings.get(key) ?? defaultValue;
    }

    deleteUIProp(key: number): void {
        console.info('shimmed function WrSkyLib.deleteUIProp');
        this.uiSettings.delete(key);

        ApplicationData.current.localSettings.values["__uisettings"] = [...this.uiSettings];
    }

    isMe(identity: string): boolean {
        return this.myIdentity == identity;
    }

    setIMEI(imei: string): void {
        console.warn('WrSkyLib#setIMEI not implemented')
    }
    setAndroidId(androidId: string): void {
        console.warn('WrSkyLib#setAndroidId not implemented')
    }
    getContactGroup(objectId: number): ContactGroup {
        throw new Error('WrSkyLib#getContactGroup not implemented')
    }
    getHardwiredContactGroup(type: number): number {
        throw new Error('WrSkyLib#getHardwiredContactGroup not implemented')
    }
    getCustomContactGroups(groups: VectUnsignedInt): void {
        console.warn('WrSkyLib#getCustomContactGroups not implemented')
    }
    createCustomContactGroup(group: ContactGroup): boolean {
        throw new Error('WrSkyLib#createCustomContactGroup not implemented')
    }
    getContactType(identity: string): number {
        throw new Error('WrSkyLib#getContactType not implemented')
    }
    getContact__(identity: string, contact: Contact): boolean {
        throw new Error('WrSkyLib#getContact__ not implemented')
    }
    findContactBySpeedDial(dial: string, contact: Contact): boolean {
        throw new Error('WrSkyLib#findContactBySpeedDial not implemented')
    }
    findContactByPstnNumber(number: string, contact: Contact): SkyLibFindContactByPstnNumberResult {
        throw new Error('WrSkyLib#findContactByPstnNumber not implemented')
    }
    findContactsByEmail(email: string, contacts: VectUnsignedInt): void {
        console.warn('WrSkyLib#findContactsByEmail not implemented')
    }
    static identitytypetoString(val: number): string {
        throw new Error('WrSkyLib#identitytypetoString not implemented')
    }
    getIdentityType(identity: string): number {
        throw new Error('WrSkyLib#getIdentityType not implemented')
    }
    static normalizeresulttoString(val: number): string {
        throw new Error('WrSkyLib#normalizeresulttoString not implemented')
    }
    static identitiesMatch(identityA: string, identityB: string): boolean {
        throw new Error('WrSkyLib#identitiesMatch not implemented')
    }
    static normalizeIdentity_(original: string, isNewSkypeName: boolean): SkyLibNormalizeIdentityResult {
        throw new Error('WrSkyLib#normalizeIdentity_ not implemented')
    }
    static normalizePSTNWithCountry_(original: string, countryPrefix: number): SkyLibNormalizePSTNWithCountryResult {
        throw new Error('WrSkyLib#normalizePSTNWithCountry_ not implemented')
    }
    static unifyresulttoString(val: number): string {
        throw new Error('WrSkyLib#unifyresulttoString not implemented')
    }
    canUnifyContacts(contacts: VectUnsignedInt): SkyLibCanUnifyContactsResult {
        throw new Error('WrSkyLib#canUnifyContacts not implemented')
    }
    unifyContacts(contacts: VectUnsignedInt): SkyLibUnifyContactsResult {
        throw new Error('WrSkyLib#unifyContacts not implemented')
    }
    unUnifyContact(masterObjectID: number, servantObjectID: number): boolean {
        throw new Error('WrSkyLib#unUnifyContact not implemented')
    }
    forceEasContactsSync(): void {
        console.warn('WrSkyLib#forceEasContactsSync not implemented')
    }
    getContactSearch(objectId: number): ContactSearch {
        throw new Error('WrSkyLib#getContactSearch not implemented')
    }
    static getOptimalAgeRanges(rangeList: VectUnsignedInt): void {
        console.warn('WrSkyLib#getOptimalAgeRanges not implemented')
    }
    createContactSearch(search: ContactSearch): void {
        console.warn('WrSkyLib#createContactSearch not implemented')
    }
    createBasicContactSearch(text: string, search: ContactSearch): boolean {
        throw new Error('WrSkyLib#createBasicContactSearch not implemented')
    }
    createIdentitySearch(identity: string, search: ContactSearch): boolean {
        throw new Error('WrSkyLib#createIdentitySearch not implemented')
    }
    findPromotedSCDContacts(updatesOnly: boolean): number {
        throw new Error('WrSkyLib#findPromotedSCDContacts not implemented')
    }
    static contact_SYNC_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#contact_SYNC_TYPEToString not implemented')
    }
    static transfer_SENDFILE_ERRORToString(val: number): string {
        throw new Error('WrSkyLib#transfer_SENDFILE_ERRORToString not implemented')
    }
    static leave_REASONToString(val: number): string {
        throw new Error('WrSkyLib#leave_REASONToString not implemented')
    }
    static livesession_QUALITYRATINGToString(val: number): string {
        throw new Error('WrSkyLib#livesession_QUALITYRATINGToString not implemented')
    }
    static codec_COMPATIBILITYToString(val: number): string {
        throw new Error('WrSkyLib#codec_COMPATIBILITYToString not implemented')
    }
    getParticipant(objectId: number): Participant {
        throw new Error('WrSkyLib#getParticipant not implemented')
    }
    createConference1(): Conversation {
        throw new Error('WrSkyLib#createConference1 not implemented')
    }
    createConference2(conference: Conversation): boolean {
        throw new Error('WrSkyLib#createConference2 not implemented')
    }
    getConversationByConvoID_(convoID: number, conversation: Conversation): boolean {
        throw new Error('WrSkyLib#getConversationByConvoID_ not implemented')
    }
    getConversationByParticipants(participantIdentities: VectGIString, conversation: Conversation, createIfNonExisting: boolean, ignoreBookmarkedOrNamed: boolean): boolean {
        throw new Error('WrSkyLib#getConversationByParticipants not implemented')
    }
    getConversationByBlob1(joinBlob: string, alsoJoin: boolean): Conversation {
        throw new Error('WrSkyLib#getConversationByBlob1 not implemented')
    }
    getConversationByBlob2(joinBlob: string, conversation: Conversation, alsoJoin: boolean): boolean {
        throw new Error('WrSkyLib#getConversationByBlob2 not implemented')
    }
    getConversationByCallGUID1(callGUID: string): Conversation {
        throw new Error('WrSkyLib#getConversationByCallGUID1 not implemented')
    }
    getConversationByCallGUID2(callGUID: string, conversation: Conversation): boolean {
        throw new Error('WrSkyLib#getConversationByCallGUID2 not implemented')
    }
    joinExistingConferenceCall(hostIdentity: string, accessToken: string): boolean {
        throw new Error('WrSkyLib#joinExistingConferenceCall not implemented')
    }
    callExistingConference(participants: VectGIString, conversationIdentity: string, conversation: Conversation, accessToken: string, callId: string): boolean {
        throw new Error('WrSkyLib#callExistingConference not implemented')
    }
    getMessageByGuid(guid: Binary, message: Message): boolean {
        throw new Error('WrSkyLib#getMessageByGuid not implemented')
    }
    getMessageList(messages: VectUnsignedInt, fromTimestampInc: number, toTimestampExc: number): void {
        console.warn('WrSkyLib#getMessageList not implemented')
    }
    getMessageListByType(type: number, latestPerConvOnly: boolean, messages: VectUnsignedInt, fromTimestampInc: number, toTimestampExc: number): void {
        console.warn('WrSkyLib#getMessageListByType not implemented')
    }
    searchMessages(text: string, limit: number): number {
        throw new Error('WrSkyLib#searchMessages not implemented')
    }
    hasCalled(identity: string): boolean {
        throw new Error('WrSkyLib#hasCalled not implemented')
    }
    clearInbox(upToTimestamp: number): void {
        console.warn('WrSkyLib#clearInbox not implemented')
    }
    fillInbox(lookBackTimestamp: number, dryRun: boolean): boolean {
        throw new Error('WrSkyLib#fillInbox not implemented')
    }
    consumeAllConversations(): void {
        console.warn('WrSkyLib#consumeAllConversations not implemented')
    }
    deleteAllMessages(): void {
        console.warn('WrSkyLib#deleteAllMessages not implemented')
    }
    static contentEncode_(source: string, raw_xml: boolean): SkyLibContentEncodeResult {
        throw new Error('WrSkyLib#contentEncode_ not implemented')
    }
    static contentStripXML(source: string): SkyLibContentStripXMLResult {
        throw new Error('WrSkyLib#contentStripXML not implemented')
    }
    static contentGetEditable(xml_source: string): SkyLibContentGetEditableResult {
        throw new Error('WrSkyLib#contentGetEditable not implemented')
    }
    static contentGetRichEditable(xml_source: string, preserve_tags: VectGIString): SkyLibContentGetRichEditableResult {
        throw new Error('WrSkyLib#contentGetRichEditable not implemented')
    }
    getChatMemberCountLimit(): number {
        throw new Error('WrSkyLib#getChatMemberCountLimit not implemented')
    }
    getVideo(objectId: number): Video {
        throw new Error('WrSkyLib#getVideo not implemented')
    }
    getAvailableVideoDevices(deviceNames: VectGIString, devicePaths: VectGIString): number {
        throw new Error('WrSkyLib#getAvailableVideoDevices not implemented')
    }
    static video_DEVICE_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#video_DEVICE_TYPEToString not implemented')
    }
    getVideoDeviceType(deviceName: string, devicePath: string): number {
        throw new Error('WrSkyLib#getVideoDeviceType not implemented')
    }
    hasVideoDeviceCapability(deviceName: string, devicePath: string, cap: number): boolean {
        throw new Error('WrSkyLib#hasVideoDeviceCapability not implemented')
    }
    displayVideoDeviceTuningDialog(deviceName: string, devicePath: string): void {
        console.warn('WrSkyLib#displayVideoDeviceTuningDialog not implemented')
    }
    createLocalVideo1(deviceHandle: string): Video {
        throw new Error('WrSkyLib#createLocalVideo1 not implemented')
    }
    createLocalVideo2(type: number, deviceName: string, devicePath: string): number {
        throw new Error('WrSkyLib#createLocalVideo2 not implemented')
    }
    createPreviewVideo1(deviceHandle: string): Video {
        throw new Error('WrSkyLib#createPreviewVideo1 not implemented')
    }
    createPreviewVideo2(type: number, deviceName: string, devicePath: string): number {
        throw new Error('WrSkyLib#createPreviewVideo2 not implemented')
    }
    videoCommand(command: string): string {
        throw new Error('WrSkyLib#videoCommand not implemented')
    }
    static qualitytesttypetoString(val: number): string {
        throw new Error('WrSkyLib#qualitytesttypetoString not implemented')
    }
    static qualitytestresulttoString(val: number): string {
        throw new Error('WrSkyLib#qualitytestresulttoString not implemented')
    }
    startMonitoringQuality(withUser: string, excludeNetworkTest: boolean): void {
        console.warn('WrSkyLib#startMonitoringQuality not implemented')
    }
    stopMonitoringQuality(withUser: string, justStop: boolean): number {
        throw new Error('WrSkyLib#stopMonitoringQuality not implemented')
    }
    getVoicemail(objectId: number): Voicemail {
        throw new Error('WrSkyLib#getVoicemail not implemented')
    }
    getGreeting(skypeName: string, greeting: Voicemail): boolean {
        throw new Error('WrSkyLib#getGreeting not implemented')
    }
    static preparesoundresulttoString(val: number): string {
        throw new Error('WrSkyLib#preparesoundresulttoString not implemented')
    }
    prepareSound(data: Binary, sound: Binary): number {
        throw new Error('WrSkyLib#prepareSound not implemented')
    }
    prepareSoundFromFile(datafile: Filename, sound: Binary): number {
        throw new Error('WrSkyLib#prepareSoundFromFile not implemented')
    }
    static audiodevice_CAPABILITIESToString(val: number): string {
        throw new Error('WrSkyLib#audiodevice_CAPABILITIESToString not implemented')
    }
    startRecordingTest(recordAndPlaybackData: boolean): void {
        console.warn('WrSkyLib#startRecordingTest not implemented')
    }
    stopRecordingTest(): void {
        console.warn('WrSkyLib#stopRecordingTest not implemented')
    }
    stopPlayDTMF(): void {
        console.warn('WrSkyLib#stopPlayDTMF not implemented')
    }
    getAvailableOutputDevices(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): boolean {
        throw new Error('WrSkyLib#getAvailableOutputDevices not implemented')
    }
    getAvailableRecordingDevices(handleList: VectGIString, nameList: VectGIString, productIdList: VectGIString): boolean {
        throw new Error('WrSkyLib#getAvailableRecordingDevices not implemented')
    }
    selectSoundDevices(callInDevice: string, callOutDevice: string, waveOutDevice: string): void {
        console.warn('WrSkyLib#selectSoundDevices not implemented')
    }
    getAudioDeviceCapabilities(deviceHandle: string): SkyLibGetAudioDeviceCapabilitiesResult {
        throw new Error('WrSkyLib#getAudioDeviceCapabilities not implemented')
    }
    getNrgLevels(): SkyLibGetNrgLevelsResult {
        throw new Error('WrSkyLib#getNrgLevels not implemented')
    }
    voiceCommand(command: string): string {
        throw new Error('WrSkyLib#voiceCommand not implemented')
    }
    getSpeakerVolume(): number {
        throw new Error('WrSkyLib#getSpeakerVolume not implemented')
    }
    setSpeakerVolume(volume: number): void {
        console.warn('WrSkyLib#setSpeakerVolume not implemented')
    }
    getMicVolume(): number {
        throw new Error('WrSkyLib#getMicVolume not implemented')
    }
    setMicVolume(volume: number): void {
        console.warn('WrSkyLib#setMicVolume not implemented')
    }
    isSpeakerMuted(): SkyLibIsSpeakerMutedResult {
        throw new Error('WrSkyLib#isSpeakerMuted not implemented')
    }
    isMicrophoneMuted(): SkyLibIsMicrophoneMutedResult {
        throw new Error('WrSkyLib#isMicrophoneMuted not implemented')
    }
    muteSpeakers(mute: boolean): boolean {
        throw new Error('WrSkyLib#muteSpeakers not implemented')
    }
    muteMicrophone(mute: boolean): boolean {
        throw new Error('WrSkyLib#muteMicrophone not implemented')
    }
    static operating_MEDIAToString(val: number): string {
        throw new Error('WrSkyLib#operating_MEDIAToString not implemented')
    }
    setOperatingMedia(media: number, maxUplinkBps: number, maxDownlinkBps: number): void {
        console.warn('WrSkyLib#setOperatingMedia not implemented')
    }
    static mobile_DATA_USAGE_LEVELToString(val: number): string {
        throw new Error('WrSkyLib#mobile_DATA_USAGE_LEVELToString not implemented')
    }
    setMobileDataUsageLevel(usage: number): void {
        console.warn('WrSkyLib#setMobileDataUsageLevel not implemented')
    }
    getSms(objectId: number): Sms {
        throw new Error('WrSkyLib#getSms not implemented')
    }
    requestConfirmationCode(type: number, number: string, sms: Sms): boolean {
        throw new Error('WrSkyLib#requestConfirmationCode not implemented')
    }
    submitConfirmationCode(number: string, code: string, sms: Sms): boolean {
        throw new Error('WrSkyLib#submitConfirmationCode not implemented')
    }
    createOutgoingSms(sms: Sms): boolean {
        throw new Error('WrSkyLib#createOutgoingSms not implemented')
    }
    getValidatedSmsNumbers(numbers: VectGIString): void {
        console.warn('WrSkyLib#getValidatedSmsNumbers not implemented')
    }
    getLastConfirmationNumber(): string {
        throw new Error('WrSkyLib#getLastConfirmationNumber not implemented')
    }
    static callerid_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#callerid_TYPEToString not implemented')
    }
    static callerid_IDCONFIGToString(val: number): string {
        throw new Error('WrSkyLib#callerid_IDCONFIGToString not implemented')
    }
    static callerid_OPTIONS_CHANGEToString(val: number): string {
        throw new Error('WrSkyLib#callerid_OPTIONS_CHANGEToString not implemented')
    }
    static callerid_STATEToString(val: number): string {
        throw new Error('WrSkyLib#callerid_STATEToString not implemented')
    }
    setCallerIDOptions(smsID: string, callerID: string, idconfig: number): number {
        throw new Error('WrSkyLib#setCallerIDOptions not implemented')
    }
    getCallerIDOptions(): SkyLibGetCallerIDOptionsResult {
        throw new Error('WrSkyLib#getCallerIDOptions not implemented')
    }
    getTransfer(objectId: number): Transfer {
        throw new Error('WrSkyLib#getTransfer not implemented')
    }
    contentItemGet(uri: string, block: boolean): SkyLibContentItemGetResult {
        throw new Error('WrSkyLib#contentItemGet not implemented')
    }
    contentItemDelete(id: number): void {
        console.warn('WrSkyLib#contentItemDelete not implemented')
    }
    contentItemGetType(id: number): string {
        throw new Error('WrSkyLib#contentItemGetType not implemented')
    }
    contentItemGetUri(id: number): string {
        throw new Error('WrSkyLib#contentItemGetUri not implemented')
    }
    contentItemGetBody(id: number, body: Binary): boolean {
        throw new Error('WrSkyLib#contentItemGetBody not implemented')
    }
    contentItemGetMeta(id: number): string {
        throw new Error('WrSkyLib#contentItemGetMeta not implemented')
    }
    contentItemExposingNow(id: number, yes: boolean): void {
        console.warn('WrSkyLib#contentItemExposingNow not implemented')
    }
    contentItemExecuted(id: number): void {
        console.warn('WrSkyLib#contentItemExecuted not implemented')
    }
    contentItemClosed(id: number, count: boolean): void {
        console.warn('WrSkyLib#contentItemClosed not implemented')
    }
    contentItemGetChildNames(id: number, list: VectGIString): boolean {
        throw new Error('WrSkyLib#contentItemGetChildNames not implemented')
    }
    contentItemGetChildItem(id: number, suburi: string): SkyLibContentItemGetChildItemResult {
        throw new Error('WrSkyLib#contentItemGetChildItem not implemented')
    }
    contentItemRunBytecode(id: number): number {
        throw new Error('WrSkyLib#contentItemRunBytecode not implemented')
    }
    contentItemGetChildCount(id: number, suburi: string, any: boolean): number {
        throw new Error('WrSkyLib#contentItemGetChildCount not implemented')
    }
    setInstallContentBundleName(filename: Filename): boolean {
        throw new Error('WrSkyLib#setInstallContentBundleName not implemented')
    }
    getAlert(objectId: number): Alert {
        throw new Error('WrSkyLib#getAlert not implemented')
    }
    getRecentAlerts(maxPageResults: number, page: number, alerts: VectUnsignedInt): boolean {
        throw new Error('WrSkyLib#getRecentAlerts not implemented')
    }
    getRecentAlertsOfType(maxPageResults: number, page: number, types: VectUnsignedInt, alerts: VectUnsignedInt): boolean {
        throw new Error('WrSkyLib#getRecentAlertsOfType not implemented')
    }
    getPriceQuote(objectId: number): PriceQuote {
        throw new Error('WrSkyLib#getPriceQuote not implemented')
    }
    issuePriceQuote(buyer: string, type: number, description: string, price: number, precision: number, currency: string, referredObjectID: number, priceQuote: PriceQuote): boolean {
        throw new Error('WrSkyLib#issuePriceQuote not implemented')
    }
    createSignedToken(target: string, token: Binary): boolean {
        throw new Error('WrSkyLib#createSignedToken not implemented')
    }
    static partner_QUERY_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#partner_QUERY_TYPEToString not implemented')
    }
    static partner_QUERY_PARAMSToString(val: number): string {
        throw new Error('WrSkyLib#partner_QUERY_PARAMSToString not implemented')
    }
    static partner_QUERY_IDToString(val: number): string {
        throw new Error('WrSkyLib#partner_QUERY_IDToString not implemented')
    }
    static partner_QUERY_ERRORToString(val: number): string {
        throw new Error('WrSkyLib#partner_QUERY_ERRORToString not implemented')
    }
    partnerQueryData(qt: number, partner: number, params: Binary): number {
        throw new Error('WrSkyLib#partnerQueryData not implemented')
    }
    static partner_IDToString(val: number): string {
        throw new Error('WrSkyLib#partner_IDToString not implemented')
    }
    getAccount(objectId: number): Account {
        throw new Error('WrSkyLib#getAccount not implemented')
    }
    getAccount_(identity: string, account: Account): boolean {
        throw new Error('WrSkyLib#getAccount_ not implemented')
    }
    getExistingAccounts(accountNameList: VectGIString): boolean {
        throw new Error('WrSkyLib#getExistingAccounts not implemented')
    }
    getDefaultAccountName(): string {
        throw new Error('WrSkyLib#getDefaultAccountName not implemented')
    }
    static getSuggestedSkypename(fullname: string): string {
        throw new Error('WrSkyLib#getSuggestedSkypename not implemented')
    }
    static validateresulttoString(val: number): string {
        throw new Error('WrSkyLib#validateresulttoString not implemented')
    }
    static validateAvatar(value: Binary): SkyLibValidateAvatarResult {
        throw new Error('WrSkyLib#validateAvatar not implemented')
    }
    static validateProfileString(propKey: number, strValue: string, forRegistration: boolean): SkyLibValidateProfileStringResult {
        throw new Error('WrSkyLib#validateProfileString not implemented')
    }
    static validatePassword(username: string, password: string): number {
        throw new Error('WrSkyLib#validatePassword not implemented')
    }
    getAccessSession(objectId: number): AccessSession {
        throw new Error('WrSkyLib#getAccessSession not implemented')
    }
    createAccessSession(session: AccessSession): boolean {
        throw new Error('WrSkyLib#createAccessSession not implemented')
    }
    static accesseventtypetoString(val: number): string {
        throw new Error('WrSkyLib#accesseventtypetoString not implemented')
    }
    static sa_PAYMENT_PRODUCTToString(val: number): string {
        throw new Error('WrSkyLib#sa_PAYMENT_PRODUCTToString not implemented')
    }
    static sa_PAYMENT_CARDTYPEToString(val: number): string {
        throw new Error('WrSkyLib#sa_PAYMENT_CARDTYPEToString not implemented')
    }
    static sa_PAYMENT_SIDToString(val: number): string {
        throw new Error('WrSkyLib#sa_PAYMENT_SIDToString not implemented')
    }
    static sa_PAYMENT_IIDToString(val: number): string {
        throw new Error('WrSkyLib#sa_PAYMENT_IIDToString not implemented')
    }
    accessPaymentSubmit(): boolean {
        throw new Error('WrSkyLib#accessPaymentSubmit not implemented')
    }
    accessPaymentPoll(): number {
        throw new Error('WrSkyLib#accessPaymentPoll not implemented')
    }
    accessPaymentReset(): void {
        console.warn('WrSkyLib#accessPaymentReset not implemented')
    }
    accessPaymentSetString(id: number, value: string): boolean {
        throw new Error('WrSkyLib#accessPaymentSetString not implemented')
    }
    accessPaymentGetString(id: number): SkyLibAccessPaymentGetStringResult {
        throw new Error('WrSkyLib#accessPaymentGetString not implemented')
    }
    accessPaymentSetInt(id: number, value: number): boolean {
        throw new Error('WrSkyLib#accessPaymentSetInt not implemented')
    }
    accessPaymentGetInt(id: number): SkyLibAccessPaymentGetIntResult {
        throw new Error('WrSkyLib#accessPaymentGetInt not implemented')
    }
    static httpfe_METHODToString(val: number): string {
        throw new Error('WrSkyLib#httpfe_METHODToString not implemented')
    }
    static webgw_RESULTToString(val: number): string {
        throw new Error('WrSkyLib#webgw_RESULTToString not implemented')
    }
    sendHttpRequest(method: number, uri: string, payload: string, headers: string, userdata: number): number {
        throw new Error('WrSkyLib#sendHttpRequest not implemented')
    }
    createHttpStream(method: number, uri: string, headers: string, userdata: number): number {
        throw new Error('WrSkyLib#createHttpStream not implemented')
    }
    sendHttpStream(streamID: number, payload: Binary): boolean {
        throw new Error('WrSkyLib#sendHttpStream not implemented')
    }
    clearHttpCookies(): void {
        console.warn('WrSkyLib#clearHttpCookies not implemented')
    }
    getVCard(vcard: Binary): boolean {
        throw new Error('WrSkyLib#getVCard not implemented')
    }
    getVCardOwner(vcard: Binary): string {
        throw new Error('WrSkyLib#getVCardOwner not implemented')
    }
    importProfile(vcard: Binary): boolean {
        throw new Error('WrSkyLib#importProfile not implemented')
    }
    importBuddylist(vcard: Binary): boolean {
        throw new Error('WrSkyLib#importBuddylist not implemented')
    }
    parseVCard(vcard: Binary, dest: SkyMetadata): boolean {
        throw new Error('WrSkyLib#parseVCard not implemented')
    }
    contactToVCard(contactObjectID: number): string {
        throw new Error('WrSkyLib#contactToVCard not implemented')
    }
    vcardToContact(vcard: string): number {
        throw new Error('WrSkyLib#vcardToContact not implemented')
    }
    attachPublicAPIClient(allowFilterCommand: boolean): number {
        throw new Error('WrSkyLib#attachPublicAPIClient not implemented')
    }
    detachPublicAPIClient(clientID: number): void {
        console.warn('WrSkyLib#detachPublicAPIClient not implemented')
    }
    publicAPIRequest(clientID: number, request: string): string {
        throw new Error('WrSkyLib#publicAPIRequest not implemented')
    }
    static content_LIST_RESULTToString(val: number): string {
        throw new Error('WrSkyLib#content_LIST_RESULTToString not implemented')
    }
    static content_LIST_CONTEXTToString(val: number): string {
        throw new Error('WrSkyLib#content_LIST_CONTEXTToString not implemented')
    }
    queryContentListing(src: string, clc: number): SkyLibQueryContentListingResult {
        throw new Error('WrSkyLib#queryContentListing not implemented')
    }
    static livesession_END_DETAILSToString(val: number): string {
        throw new Error('WrSkyLib#livesession_END_DETAILSToString not implemented')
    }
    static policy_DISABLE_VIDEO_OPTIONSToString(val: number): string {
        throw new Error('WrSkyLib#policy_DISABLE_VIDEO_OPTIONSToString not implemented')
    }
    static skypemanager_MEMBER_STATUSESToString(val: number): string {
        throw new Error('WrSkyLib#skypemanager_MEMBER_STATUSESToString not implemented')
    }
    static user_LIKENESSESToString(val: number): string {
        throw new Error('WrSkyLib#user_LIKENESSESToString not implemented')
    }
    static uiproptoString(val: number): string {
        throw new Error('WrSkyLib#uiproptoString not implemented')
    }
    static nrt_CAPABILITIESToString(val: number): string {
        throw new Error('WrSkyLib#nrt_CAPABILITIESToString not implemented')
    }
    static libproptoString(val: number): string {
        throw new Error('WrSkyLib#libproptoString not implemented')
    }
    getIntLibProp(key: number): number {
        throw new Error('WrSkyLib#getIntLibProp not implemented')
    }
    getStrLibProp(key: number, defaultValue: string): string {
        throw new Error('WrSkyLib#getStrLibProp not implemented')
    }
    getStrLibPropInternal(lib_key: number, defaultValue: string): string {
        throw new Error('WrSkyLib#getStrLibPropInternal not implemented')
    }
    getTotalOnlineUserCount(): number {
        throw new Error('WrSkyLib#getTotalOnlineUserCount not implemented')
    }
    reportStatsEvent(statsType: number, attributes: Binary, samplingValue: string): boolean {
        throw new Error('WrSkyLib#reportStatsEvent not implemented')
    }
    static upgraderesulttoString(val: number): string {
        throw new Error('WrSkyLib#upgraderesulttoString not implemented')
    }
    checkClientUpgrade(): boolean {
        throw new Error('WrSkyLib#checkClientUpgrade not implemented')
    }
    changeBackgroundMode(inBackground: boolean): void {
        console.warn('WrSkyLib#changeBackgroundMode not implemented')
    }
    setNetworkActivityLevel(level: number): boolean {
        throw new Error('WrSkyLib#setNetworkActivityLevel not implemented')
    }
    executeBackgroundTask(): void {
        console.warn('WrSkyLib#executeBackgroundTask not implemented')
    }
    changeOperationMode(level: number): void {
        console.warn('WrSkyLib#changeOperationMode not implemented')
    }
    getISOLanguageInfo(languageCodeList: VectGIString, languageNameList: VectGIString): void {
        console.warn('WrSkyLib#getISOLanguageInfo not implemented')
    }
    getISOCountryInfo(countryCodeList: VectGIString, countryNameList: VectGIString, countryPrefixList: VectUnsignedInt, countryDialExampleList: VectGIString): void {
        console.warn('WrSkyLib#getISOCountryInfo not implemented')
    }
    getISOFormattedCurrency(amount: string, precision: number, countryCode: string): string {
        throw new Error('WrSkyLib#getISOFormattedCurrency not implemented')
    }
    getISOCountryCodebyPhoneNo(number: string): string {
        throw new Error('WrSkyLib#getISOCountryCodebyPhoneNo not implemented')
    }
    storeLocal(key: string, value: Binary): boolean {
        throw new Error('WrSkyLib#storeLocal not implemented')
    }
    fetchLocal(key: string, value: Binary): boolean {
        throw new Error('WrSkyLib#fetchLocal not implemented')
    }
    static unpack_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#unpack_TYPEToString not implemented')
    }
    static unpack_RESULTToString(val: number): string {
        throw new Error('WrSkyLib#unpack_RESULTToString not implemented')
    }
    static verifyAndUnpack(sourcePath: string, destPath: string, key_id: number): SkyLibVerifyAndUnpackResult {
        throw new Error('WrSkyLib#verifyAndUnpack not implemented')
    }
    app2AppCreate(appname: string): boolean {
        throw new Error('WrSkyLib#app2AppCreate not implemented')
    }
    app2AppDelete(appname: string): boolean {
        throw new Error('WrSkyLib#app2AppDelete not implemented')
    }
    app2AppConnect(appname: string, skypename: string): boolean {
        throw new Error('WrSkyLib#app2AppConnect not implemented')
    }
    app2AppDisconnect(appname: string, stream: string): boolean {
        throw new Error('WrSkyLib#app2AppDisconnect not implemented')
    }
    app2AppWrite(appname: string, stream: string, data: Binary): boolean {
        throw new Error('WrSkyLib#app2AppWrite not implemented')
    }
    app2AppDatagram(appname: string, stream: string, data: Binary): boolean {
        throw new Error('WrSkyLib#app2AppDatagram not implemented')
    }
    app2AppRead(appname: string, stream: string, data: Binary): boolean {
        throw new Error('WrSkyLib#app2AppRead not implemented')
    }
    app2AppGetConnectableUsers(appname: string, users: VectGIString): boolean {
        throw new Error('WrSkyLib#app2AppGetConnectableUsers not implemented')
    }
    static app2app_STREAMSToString(val: number): string {
        throw new Error('WrSkyLib#app2app_STREAMSToString not implemented')
    }
    app2AppGetStreamsList(appname: string, listType: number, streams: VectGIString, receivedSizes: VectUnsignedInt): boolean {
        throw new Error('WrSkyLib#app2AppGetStreamsList not implemented')
    }
    getVideoMessage(objectId: number): VideoMessage {
        throw new Error('WrSkyLib#getVideoMessage not implemented')
    }
    createVideoMessageWithFile(filename: string, title: string, description: string, result: VideoMessage, thumbnail: string, type: string): boolean {
        throw new Error('WrSkyLib#createVideoMessageWithFile not implemented')
    }
    getMediaDocument(objectId: number): MediaDocument {
        throw new Error('WrSkyLib#getMediaDocument not implemented')
    }
    createMediaDocument(type: number, mediaDocument: MediaDocument): boolean {
        throw new Error('WrSkyLib#createMediaDocument not implemented')
    }
    getDefaultContentId(type: number): SkyLibGetDefaultContentIdResult {
        throw new Error('WrSkyLib#getDefaultContentId not implemented')
    }
    static auth_RESULTToString(val: number): string {
        throw new Error('WrSkyLib#auth_RESULTToString not implemented')
    }
    requestSSOToken(): number {
        throw new Error('WrSkyLib#requestSSOToken not implemented')
    }
    requestWebSession(): number {
        throw new Error('WrSkyLib#requestWebSession not implemented')
    }
    requestWebSessionWithPassword(skypename: string, password: string): number {
        throw new Error('WrSkyLib#requestWebSessionWithPassword not implemented')
    }
    requestSkypeToken(): number {
        throw new Error('WrSkyLib#requestSkypeToken not implemented')
    }
    requestAccessToken(partnerId: string, scope: string, bypassCache: boolean): number {
        throw new Error('WrSkyLib#requestAccessToken not implemented')
    }
    putAuthTokens(partnerId: string, scopes: VectGIString, accessToken: string, expirationTime: number, refreshToken: string): boolean {
        throw new Error('WrSkyLib#putAuthTokens not implemented')
    }
    linkAccountWithPartner(partnerId: string, accessToken: string, skypename: string, password: string, reason: string, allowSpam: boolean, allowSms: boolean): boolean {
        throw new Error('WrSkyLib#linkAccountWithPartner not implemented')
    }
    getSkypeLinkInfo(partnerId: string, accessToken: string): boolean {
        throw new Error('WrSkyLib#getSkypeLinkInfo not implemented')
    }
    getPartnerLinkInfo(partnerId: string, skypename: string, password: string): boolean {
        throw new Error('WrSkyLib#getPartnerLinkInfo not implemented')
    }
    getSuggestedAccounts(partnerId: string, accessToken: string): boolean {
        throw new Error('WrSkyLib#getSuggestedAccounts not implemented')
    }
    getAccountAvatar(partnerId: string, accessToken: string, username: string, password: string, skypename: string): boolean {
        throw new Error('WrSkyLib#getAccountAvatar not implemented')
    }
    static service_TYPEToString(val: number): string {
        throw new Error('WrSkyLib#service_TYPEToString not implemented')
    }
    handlePushNotification(eventType: number, nodeSpecificNotificationPayload: Binary, genericNotificationPayload: Binary): number {
        throw new Error('WrSkyLib#handlePushNotification not implemented')
    }
    registerContexts(serviceType: number, platform: string, templateKey: string, contexts: VectGIString, registrationTokens: VectGIString, registrationTTLs: VectUnsignedInt): number {
        throw new Error('WrSkyLib#registerContexts not implemented')
    }
    unregisterContexts(contexts: VectGIString): number {
        throw new Error('WrSkyLib#unregisterContexts not implemented')
    }
    reregisterContexts(): number {
        throw new Error('WrSkyLib#reregisterContexts not implemented')
    }
    static pushhandlingresulttoString(val: number): string {
        throw new Error('WrSkyLib#pushhandlingresulttoString not implemented')
    }
    static pnm_REGISTER_CONTEXTS_RESULTToString(val: number): string {
        throw new Error('WrSkyLib#pnm_REGISTER_CONTEXTS_RESULTToString not implemented')
    }
    static localized_STRINGToString(val: number): string {
        throw new Error('WrSkyLib#localized_STRINGToString not implemented')
    }
    setLocalizedString(localizedString: number, value: string): void {
        console.warn('WrSkyLib#setLocalizedString not implemented')
    }
    getServerTime(): number {
        throw new Error('WrSkyLib#getServerTime not implemented')
    }
    getSeamlessCapable(identity: string): void {
        console.warn('WrSkyLib#getSeamlessCapable not implemented')
    }
    setSeamlessCapable(capable: boolean): void {
        console.warn('WrSkyLib#setSeamlessCapable not implemented')
    }
    setUserActive(isActive: boolean): void {
        console.warn('WrSkyLib#setUserActive not implemented')
    }
    static debug_STRINGToString(val: number): string {
        throw new Error('WrSkyLib#debug_STRINGToString not implemented')
    }
    getDebugString(debugString: number): string {
        throw new Error('WrSkyLib#getDebugString not implemented')
    }
    static objecttypetoString(val: number): string {
        throw new Error('WrSkyLib#objecttypetoString not implemented')
    }
    findObjectByDbID(type: number, dbID: number): number {
        throw new Error('WrSkyLib#findObjectByDbID not implemented')
    }
    getObjectType(objectID: number): number {
        throw new Error('WrSkyLib#getObjectType not implemented')
    }
    static contentEncode(source: string, raw_xml: boolean): string {
        throw new Error('WrSkyLib#contentEncode not implemented')
    }
    getAccountByIdentity(identity: string): Account {
        throw new Error('WrSkyLib#getAccountByIdentity not implemented')
    }
    getContact(objectID: number): Contact {
        throw new Error('WrSkyLib#getContact not implemented')
    }
    getConversationByConvoId(convoID: number): Conversation {
        throw new Error('WrSkyLib#getConversationByConvoId not implemented')
    }
    getConversationTable(type: number, properties: IVector<number>): IMap<number, IMap<number, number>> {
        throw new Error('WrSkyLib#getConversationTable not implemented')
    }
    loginWithOAuth(partnerId: string, accessToken: string, refreshToken: string, savePwd: boolean, saveDataLocally: boolean): void {
        console.warn('WrSkyLib#loginWithOAuth not implemented')
    }
    finishLogin(): void {
        console.warn('WrSkyLib#finishLogin not implemented')
    }
    logoutUser(clearCachedCredentials: boolean): void {
        console.warn('WrSkyLib#logoutUser not implemented')
    }
    invalidateUserLogin(): void {
        console.warn('WrSkyLib#invalidateUserLogin not implemented')
    }
    subscribePropChange(props: IVector<number>): void {
        console.warn('WrSkyLib#subscribePropChange not implemented')
    }
    static validateIdentity(identity: string, isNewUser: boolean): number {
        throw new Error('WrSkyLib#validateIdentity not implemented')
    }
    static normalizeIdentity(identity: string): string {
        throw new Error('WrSkyLib#normalizeIdentity not implemented')
    }
    static normalizePSTNWithCountry(original: string, countryPrefix: number): string {
        throw new Error('WrSkyLib#normalizePSTNWithCountry not implemented')
    }
    static wrapCodeCheckPublic(): boolean {
        throw new Error('WrSkyLib#wrapCodeCheckPublic not implemented')
    }
    registerContextsWin8(platform: string, templateKey: string, uri: string, ttl: number): void {
        console.warn('WrSkyLib#registerContextsWin8 not implemented')
    }
    handleCallNotification(eventType: number, nodeSpecificPayload: string, genericPayload: string): number {
        throw new Error('WrSkyLib#handleCallNotification not implemented')
    }
    handleNotification(notificationContent: string): void {
        console.warn('WrSkyLib#handleNotification not implemented')
    }
    declareExtendedProp(objectType: number, columnName: string, propKey: number, valueType: number): void {
        console.warn('WrSkyLib#declareExtendedProp not implemented')
    }
    getSpeakerLevel(): number {
        throw new Error('WrSkyLib#getSpeakerLevel not implemented')
    }
    getMicLevel(): number {
        throw new Error('WrSkyLib#getMicLevel not implemented')
    }
    getVideoDevicePath(deviceHandle: string): string {
        throw new Error('WrSkyLib#getVideoDevicePath not implemented')
    }
    getVideoDeviceHandles(): IVector<string> {
        throw new Error('WrSkyLib#getVideoDeviceHandles not implemented')
    }
    getActiveVideoDeviceHandle(): string {
        throw new Error('WrSkyLib#getActiveVideoDeviceHandle not implemented')
    }
    close(): void {
        console.warn('WrSkyLib#close not implemented')
    }

    private __videoAspectRatioChanged: Set<OnVideoAspectRatioChanged> = new Set();
    @Enumerable(true)
    set onvideoaspectratiochanged(handler: OnVideoAspectRatioChanged) {
        this.__videoAspectRatioChanged.add(handler);
    }

    private __libReady: Set<NotifyEventType> = new Set();
    @Enumerable(true)
    set onlibready(handler: NotifyEventType) {
        this.__libReady.add(handler);
    }

    private __loginStart: Set<NotifyEventType> = new Set();
    @Enumerable(true)
    set onloginstart(handler: NotifyEventType) {
        this.__loginStart.add(handler);
    }

    private __logout: Set<NotifyEventType> = new Set();
    @Enumerable(true)
    set onlogout(handler: NotifyEventType) {
        this.__logout.add(handler);
    }

    private __loginPartially: Set<NotifyEventType> = new Set();
    @Enumerable(true)
    set onloginpartially(handler: NotifyEventType) {
        this.__loginPartially.add(handler);
    }

    private __login: Set<NotifyEventType> = new Set();
    @Enumerable(true)
    set onlogin(handler: NotifyEventType) {
        this.__login.add(handler);
    }

    private __objectPropertyChange: Set<OnObjectPropertyChangeType> = new Set();
    @Enumerable(true)
    set onobjectpropertychange(handler: OnObjectPropertyChangeType) {
        this.__objectPropertyChange.add(handler);
    }

    private __objectDelete: Set<OnObjectDeleteType> = new Set();
    @Enumerable(true)
    set onobjectdelete(handler: OnObjectDeleteType) {
        this.__objectDelete.add(handler);
    }

    private __seamlessCapableResult: Set<OnSeamlessCapableResultType> = new Set();
    @Enumerable(true)
    set onseamlesscapableresult(handler: OnSeamlessCapableResultType) {
        this.__seamlessCapableResult.add(handler);
    }

    private __serverTimeAvailable: Set<OnServerTimeAvailableType> = new Set();
    @Enumerable(true)
    set onservertimeavailable(handler: OnServerTimeAvailableType) {
        this.__serverTimeAvailable.add(handler);
    }

    private __registerContextsComplete: Set<OnRegisterContextsCompleteType> = new Set();
    @Enumerable(true)
    set onregistercontextscomplete(handler: OnRegisterContextsCompleteType) {
        this.__registerContextsComplete.add(handler);
    }

    private __pushHandlingComplete: Set<OnPushHandlingCompleteType> = new Set();
    @Enumerable(true)
    set onpushhandlingcomplete(handler: OnPushHandlingCompleteType) {
        this.__pushHandlingComplete.add(handler);
    }

    private __accountAvatarResult: Set<OnAccountAvatarResultType> = new Set();
    @Enumerable(true)
    set onaccountavatarresult(handler: OnAccountAvatarResultType) {
        this.__accountAvatarResult.add(handler);
    }

    private __suggestedAccountsResult: Set<OnSuggestedAccountsResultType> = new Set();
    @Enumerable(true)
    set onsuggestedaccountsresult(handler: OnSuggestedAccountsResultType) {
        this.__suggestedAccountsResult.add(handler);
    }

    private __partnerLinkInfoResult: Set<OnPartnerLinkInfoResultType> = new Set();
    @Enumerable(true)
    set onpartnerlinkinforesult(handler: OnPartnerLinkInfoResultType) {
        this.__partnerLinkInfoResult.add(handler);
    }

    private __accountPartnerLinkResult: Set<OnAccountPartnerLinkResultType> = new Set();
    @Enumerable(true)
    set onaccountpartnerlinkresult(handler: OnAccountPartnerLinkResultType) {
        this.__accountPartnerLinkResult.add(handler);
    }

    private __authTokenRequest: Set<OnAuthTokenRequestType> = new Set();
    @Enumerable(true)
    set onauthtokenrequest(handler: OnAuthTokenRequestType) {
        this.__authTokenRequest.add(handler);
    }

    private __authTokenResultWithTimeout: Set<OnAuthTokenResultWithTimeoutType> = new Set();
    @Enumerable(true)
    set onauthtokenresultwithtimeout(handler: OnAuthTokenResultWithTimeoutType) {
        this.__authTokenResultWithTimeout.add(handler);
    }

    private __authTokenResult: Set<OnAuthTokenResultType> = new Set();
    @Enumerable(true)
    set onauthtokenresult(handler: OnAuthTokenResultType) {
        this.__authTokenResult.add(handler);
    }

    private __videoMessagingEntitlementChanged: Set<OnVideoMessagingEntitlementChangedType> = new Set();
    @Enumerable(true)
    set onvideomessagingentitlementchanged(handler: OnVideoMessagingEntitlementChangedType) {
        this.__videoMessagingEntitlementChanged.add(handler);
    }

    private __app2AppStreamListChange: Set<OnApp2AppStreamListChangeType> = new Set();
    @Enumerable(true)
    set onapp2appstreamlistchange(handler: OnApp2AppStreamListChangeType) {
        this.__app2AppStreamListChange.add(handler);
    }

    private __incomingApp2AppDatagram: Set<OnApp2AppDatagramType> = new Set();
    @Enumerable(true)
    set onincomingapp2appdatagram(handler: OnApp2AppDatagramType) {
        this.__incomingApp2AppDatagram.add(handler);
    }

    private __operationModeChanged: Set<OnOperationModeChangedType> = new Set();
    @Enumerable(true)
    set onoperationmodechanged(handler: OnOperationModeChangedType) {
        this.__operationModeChanged.add(handler);
    }

    private __upgradeNotice: Set<OnUpgradeNoticeType> = new Set();
    @Enumerable(true)
    set onupgradenotice(handler: OnUpgradeNoticeType) {
        this.__upgradeNotice.add(handler);
    }

    private __checkUpgradeResult: Set<OnCheckUpgradeResultType> = new Set();
    @Enumerable(true)
    set oncheckupgraderesult(handler: OnCheckUpgradeResultType) {
        this.__checkUpgradeResult.add(handler);
    }

    private __statsReported: Set<OnStatsReportedType> = new Set();
    @Enumerable(true)
    set onstatsreported(handler: OnStatsReportedType) {
        this.__statsReported.add(handler);
    }

    private __libPropChange: Set<OnLibPropChangeType> = new Set();
    @Enumerable(true)
    set onlibpropchange(handler: OnLibPropChangeType) {
        this.__libPropChange.add(handler);
    }

    private __contentListingResult: Set<OnContentListingResultType> = new Set();
    @Enumerable(true)
    set oncontentlistingresult(handler: OnContentListingResultType) {
        this.__contentListingResult.add(handler);
    }

    private __publicAPINotification: Set<OnPublicAPINotificationType> = new Set();
    @Enumerable(true)
    set onpublicapinotification(handler: OnPublicAPINotificationType) {
        this.__publicAPINotification.add(handler);
    }

    private __httpStreamResponse: Set<OnHttpStreamResponseType> = new Set();
    @Enumerable(true)
    set onhttpstreamresponse(handler: OnHttpStreamResponseType) {
        this.__httpStreamResponse.add(handler);
    }

    private __httpResponse: Set<OnHttpResponseType> = new Set();
    @Enumerable(true)
    set onhttpresponse(handler: OnHttpResponseType) {
        this.__httpResponse.add(handler);
    }

    private __accessEvent: Set<OnAccessEventType> = new Set();
    @Enumerable(true)
    set onaccessevent(handler: OnAccessEventType) {
        this.__accessEvent.add(handler);
    }

    private __accessConnectionFailure: Set<OnAccessConnectionFailureType> = new Set();
    @Enumerable(true)
    set onaccessconnectionfailure(handler: OnAccessConnectionFailureType) {
        this.__accessConnectionFailure.add(handler);
    }

    private __accessDisconnected: Set<OnAccessDisconnectedType> = new Set();
    @Enumerable(true)
    set onaccessdisconnected(handler: OnAccessDisconnectedType) {
        this.__accessDisconnected.add(handler);
    }

    private __accessConnected: Set<OnAccessConnectedType> = new Set();
    @Enumerable(true)
    set onaccessconnected(handler: OnAccessConnectedType) {
        this.__accessConnected.add(handler);
    }

    private __accessDetectFailure: Set<OnAccessDetectFailureType> = new Set();
    @Enumerable(true)
    set onaccessdetectfailure(handler: OnAccessDetectFailureType) {
        this.__accessDetectFailure.add(handler);
    }

    private __accessDetecting: Set<OnAccessDetectingType> = new Set();
    @Enumerable(true)
    set onaccessdetecting(handler: OnAccessDetectingType) {
        this.__accessDetecting.add(handler);
    }

    private __externalLoginRequest: Set<OnExternalLoginRequestType> = new Set();
    @Enumerable(true)
    set onexternalloginrequest(handler: OnExternalLoginRequestType) {
        this.__externalLoginRequest.add(handler);
    }

    private __partnerQueryResult: Set<OnPartnerQueryResultType> = new Set();
    @Enumerable(true)
    set onpartnerqueryresult(handler: OnPartnerQueryResultType) {
        this.__partnerQueryResult.add(handler);
    }

    private __incomingPriceQuote: Set<OnIncomingPriceQuoteType> = new Set();
    @Enumerable(true)
    set onincomingpricequote(handler: OnIncomingPriceQuoteType) {
        this.__incomingPriceQuote.add(handler);
    }

    private __incomingAlert: Set<OnIncomingAlertType> = new Set();
    @Enumerable(true)
    set onincomingalert(handler: OnIncomingAlertType) {
        this.__incomingAlert.add(handler);
    }

    private __contentItemChange: Set<OnContentItemChangeType> = new Set();
    @Enumerable(true)
    set oncontentitemchange(handler: OnContentItemChangeType) {
        this.__contentItemChange.add(handler);
    }

    private __callerIDOptionsChange: Set<OnCallerIDOptionsChangeType> = new Set();
    @Enumerable(true)
    set oncalleridoptionschange(handler: OnCallerIDOptionsChangeType) {
        this.__callerIDOptionsChange.add(handler);
    }

    private __nrgLevelsChange: Set<OnNrgLevelsChangeType> = new Set();
    @Enumerable(true)
    set onnrglevelschange(handler: OnNrgLevelsChangeType) {
        this.__nrgLevelsChange.add(handler);
    }

    private __availableDeviceListChange: Set<OnAvailableDeviceListChangeType> = new Set();
    @Enumerable(true)
    set onavailabledevicelistchange(handler: OnAvailableDeviceListChangeType) {
        this.__availableDeviceListChange.add(handler);
    }

    private __qualityTestResult: Set<OnQualityTestResultType> = new Set();
    @Enumerable(true)
    set onqualitytestresult(handler: OnQualityTestResultType) {
        this.__qualityTestResult.add(handler);
    }

    private __h264activated: Set<OnH264ActivatedType> = new Set();
    @Enumerable(true)
    set onh264activated(handler: OnH264ActivatedType) {
        this.__h264activated.add(handler);
    }

    private __availableVideoDeviceListChange: Set<OnAvailableVideoDeviceListChangeType> = new Set();
    @Enumerable(true)
    set onavailablevideodevicelistchange(handler: OnAvailableVideoDeviceListChangeType) {
        this.__availableVideoDeviceListChange.add(handler);
    }

    private __fileTransferInitiated: Set<OnFileTransferInitiatedType> = new Set();
    @Enumerable(true)
    set onfiletransferinitiated(handler: OnFileTransferInitiatedType) {
        this.__fileTransferInitiated.add(handler);
    }

    private __incomingMessage: Set<SkyLibOnMessageType> = new Set();
    @Enumerable(true)
    set onincomingmessage(handler: SkyLibOnMessageType) {
        this.__incomingMessage.add(handler);
    }

    private __searchMessagesResult: Set<OnSearchMessagesResultType> = new Set();
    @Enumerable(true)
    set onsearchmessagesresult(handler: OnSearchMessagesResultType) {
        this.__searchMessagesResult.add(handler);
    }

    private __conversationListChange: Set<OnConversationListChangeType> = new Set();
    @Enumerable(true)
    set onconversationlistchange(handler: OnConversationListChangeType) {
        this.__conversationListChange.add(handler);
    }

    private __initialEasSyncDone: Set<OnInitialEasSyncDoneType> = new Set();
    @Enumerable(true)
    set oninitialeassyncdone(handler: OnInitialEasSyncDoneType) {
        this.__initialEasSyncDone.add(handler);
    }

    private __promotedSCDContactsFound: Set<OnPromotedSCDContactsFoundType> = new Set();
    @Enumerable(true)
    set onpromotedscdcontactsfound(handler: OnPromotedSCDContactsFoundType) {
        this.__promotedSCDContactsFound.add(handler);
    }

    private __unifiedMastersChanged: Set<OnUnifiedMastersChangedType> = new Set();
    @Enumerable(true)
    set onunifiedmasterschanged(handler: OnUnifiedMastersChangedType) {
        this.__unifiedMastersChanged.add(handler);
    }

    private __unifiedServantsChanged: Set<OnUnifiedServantsChangedType> = new Set();
    @Enumerable(true)
    set onunifiedservantschanged(handler: OnUnifiedServantsChangedType) {
        this.__unifiedServantsChanged.add(handler);
    }

    private __contactGoneOffline: Set<OnContactGoneOfflineType> = new Set();
    @Enumerable(true)
    set oncontactgoneoffline(handler: OnContactGoneOfflineType) {
        this.__contactGoneOffline.add(handler);
    }

    private __contactOnlineAppearance: Set<OnContactOnlineAppearanceType> = new Set();
    @Enumerable(true)
    set oncontactonlineappearance(handler: OnContactOnlineAppearanceType) {
        this.__contactOnlineAppearance.add(handler);
    }

    private __newCustomContactGroup: Set<OnNewCustomContactGroupType> = new Set();
    @Enumerable(true)
    set onnewcustomcontactgroup(handler: OnNewCustomContactGroupType) {
        this.__newCustomContactGroup.add(handler);
    }

    addEventListener(name: string, handler: any) {
        switch (name) {
            case 'videoaspectratiochanged':
                this.__videoAspectRatioChanged.add(handler);
                break;
            case 'libready':
                this.__libReady.add(handler);
                break;
            case 'loginstart':
                this.__loginStart.add(handler);
                break;
            case 'logout':
                this.__logout.add(handler);
                break;
            case 'loginpartially':
                this.__loginPartially.add(handler);
                break;
            case 'login':
                this.__login.add(handler);
                break;
            case 'objectpropertychange':
                this.__objectPropertyChange.add(handler);
                break;
            case 'objectdelete':
                this.__objectDelete.add(handler);
                break;
            case 'seamlesscapableresult':
                this.__seamlessCapableResult.add(handler);
                break;
            case 'servertimeavailable':
                this.__serverTimeAvailable.add(handler);
                break;
            case 'registercontextscomplete':
                this.__registerContextsComplete.add(handler);
                break;
            case 'pushhandlingcomplete':
                this.__pushHandlingComplete.add(handler);
                break;
            case 'accountavatarresult':
                this.__accountAvatarResult.add(handler);
                break;
            case 'suggestedaccountsresult':
                this.__suggestedAccountsResult.add(handler);
                break;
            case 'partnerlinkinforesult':
                this.__partnerLinkInfoResult.add(handler);
                break;
            case 'accountpartnerlinkresult':
                this.__accountPartnerLinkResult.add(handler);
                break;
            case 'authtokenrequest':
                this.__authTokenRequest.add(handler);
                break;
            case 'authtokenresultwithtimeout':
                this.__authTokenResultWithTimeout.add(handler);
                break;
            case 'authtokenresult':
                this.__authTokenResult.add(handler);
                break;
            case 'videomessagingentitlementchanged':
                this.__videoMessagingEntitlementChanged.add(handler);
                break;
            case 'app2appstreamlistchange':
                this.__app2AppStreamListChange.add(handler);
                break;
            case 'incomingapp2appdatagram':
                this.__incomingApp2AppDatagram.add(handler);
                break;
            case 'operationmodechanged':
                this.__operationModeChanged.add(handler);
                break;
            case 'upgradenotice':
                this.__upgradeNotice.add(handler);
                break;
            case 'checkupgraderesult':
                this.__checkUpgradeResult.add(handler);
                break;
            case 'statsreported':
                this.__statsReported.add(handler);
                break;
            case 'libpropchange':
                this.__libPropChange.add(handler);
                break;
            case 'contentlistingresult':
                this.__contentListingResult.add(handler);
                break;
            case 'publicapinotification':
                this.__publicAPINotification.add(handler);
                break;
            case 'httpstreamresponse':
                this.__httpStreamResponse.add(handler);
                break;
            case 'httpresponse':
                this.__httpResponse.add(handler);
                break;
            case 'accessevent':
                this.__accessEvent.add(handler);
                break;
            case 'accessconnectionfailure':
                this.__accessConnectionFailure.add(handler);
                break;
            case 'accessdisconnected':
                this.__accessDisconnected.add(handler);
                break;
            case 'accessconnected':
                this.__accessConnected.add(handler);
                break;
            case 'accessdetectfailure':
                this.__accessDetectFailure.add(handler);
                break;
            case 'accessdetecting':
                this.__accessDetecting.add(handler);
                break;
            case 'externalloginrequest':
                this.__externalLoginRequest.add(handler);
                break;
            case 'partnerqueryresult':
                this.__partnerQueryResult.add(handler);
                break;
            case 'incomingpricequote':
                this.__incomingPriceQuote.add(handler);
                break;
            case 'incomingalert':
                this.__incomingAlert.add(handler);
                break;
            case 'contentitemchange':
                this.__contentItemChange.add(handler);
                break;
            case 'calleridoptionschange':
                this.__callerIDOptionsChange.add(handler);
                break;
            case 'nrglevelschange':
                this.__nrgLevelsChange.add(handler);
                break;
            case 'availabledevicelistchange':
                this.__availableDeviceListChange.add(handler);
                break;
            case 'qualitytestresult':
                this.__qualityTestResult.add(handler);
                break;
            case 'h264activated':
                this.__h264activated.add(handler);
                break;
            case 'availablevideodevicelistchange':
                this.__availableVideoDeviceListChange.add(handler);
                break;
            case 'filetransferinitiated':
                this.__fileTransferInitiated.add(handler);
                break;
            case 'incomingmessage':
                this.__incomingMessage.add(handler);
                break;
            case 'searchmessagesresult':
                this.__searchMessagesResult.add(handler);
                break;
            case 'conversationlistchange':
                this.__conversationListChange.add(handler);
                break;
            case 'initialeassyncdone':
                this.__initialEasSyncDone.add(handler);
                break;
            case 'promotedscdcontactsfound':
                this.__promotedSCDContactsFound.add(handler);
                break;
            case 'unifiedmasterschanged':
                this.__unifiedMastersChanged.add(handler);
                break;
            case 'unifiedservantschanged':
                this.__unifiedServantsChanged.add(handler);
                break;
            case 'contactgoneoffline':
                this.__contactGoneOffline.add(handler);
                break;
            case 'contactonlineappearance':
                this.__contactOnlineAppearance.add(handler);
                break;
            case 'newcustomcontactgroup':
                this.__newCustomContactGroup.add(handler);
                break;
        }
    }

    removeEventListener(name: string, handler: any) {
        switch (name) {
            case 'videoaspectratiochanged':
                this.__videoAspectRatioChanged.delete(handler);
                break;
            case 'libready':
                this.__libReady.delete(handler);
                break;
            case 'loginstart':
                this.__loginStart.delete(handler);
                break;
            case 'logout':
                this.__logout.delete(handler);
                break;
            case 'loginpartially':
                this.__loginPartially.delete(handler);
                break;
            case 'login':
                this.__login.delete(handler);
                break;
            case 'objectpropertychange':
                this.__objectPropertyChange.delete(handler);
                break;
            case 'objectdelete':
                this.__objectDelete.delete(handler);
                break;
            case 'seamlesscapableresult':
                this.__seamlessCapableResult.delete(handler);
                break;
            case 'servertimeavailable':
                this.__serverTimeAvailable.delete(handler);
                break;
            case 'registercontextscomplete':
                this.__registerContextsComplete.delete(handler);
                break;
            case 'pushhandlingcomplete':
                this.__pushHandlingComplete.delete(handler);
                break;
            case 'accountavatarresult':
                this.__accountAvatarResult.delete(handler);
                break;
            case 'suggestedaccountsresult':
                this.__suggestedAccountsResult.delete(handler);
                break;
            case 'partnerlinkinforesult':
                this.__partnerLinkInfoResult.delete(handler);
                break;
            case 'accountpartnerlinkresult':
                this.__accountPartnerLinkResult.delete(handler);
                break;
            case 'authtokenrequest':
                this.__authTokenRequest.delete(handler);
                break;
            case 'authtokenresultwithtimeout':
                this.__authTokenResultWithTimeout.delete(handler);
                break;
            case 'authtokenresult':
                this.__authTokenResult.delete(handler);
                break;
            case 'videomessagingentitlementchanged':
                this.__videoMessagingEntitlementChanged.delete(handler);
                break;
            case 'app2appstreamlistchange':
                this.__app2AppStreamListChange.delete(handler);
                break;
            case 'incomingapp2appdatagram':
                this.__incomingApp2AppDatagram.delete(handler);
                break;
            case 'operationmodechanged':
                this.__operationModeChanged.delete(handler);
                break;
            case 'upgradenotice':
                this.__upgradeNotice.delete(handler);
                break;
            case 'checkupgraderesult':
                this.__checkUpgradeResult.delete(handler);
                break;
            case 'statsreported':
                this.__statsReported.delete(handler);
                break;
            case 'libpropchange':
                this.__libPropChange.delete(handler);
                break;
            case 'contentlistingresult':
                this.__contentListingResult.delete(handler);
                break;
            case 'publicapinotification':
                this.__publicAPINotification.delete(handler);
                break;
            case 'httpstreamresponse':
                this.__httpStreamResponse.delete(handler);
                break;
            case 'httpresponse':
                this.__httpResponse.delete(handler);
                break;
            case 'accessevent':
                this.__accessEvent.delete(handler);
                break;
            case 'accessconnectionfailure':
                this.__accessConnectionFailure.delete(handler);
                break;
            case 'accessdisconnected':
                this.__accessDisconnected.delete(handler);
                break;
            case 'accessconnected':
                this.__accessConnected.delete(handler);
                break;
            case 'accessdetectfailure':
                this.__accessDetectFailure.delete(handler);
                break;
            case 'accessdetecting':
                this.__accessDetecting.delete(handler);
                break;
            case 'externalloginrequest':
                this.__externalLoginRequest.delete(handler);
                break;
            case 'partnerqueryresult':
                this.__partnerQueryResult.delete(handler);
                break;
            case 'incomingpricequote':
                this.__incomingPriceQuote.delete(handler);
                break;
            case 'incomingalert':
                this.__incomingAlert.delete(handler);
                break;
            case 'contentitemchange':
                this.__contentItemChange.delete(handler);
                break;
            case 'calleridoptionschange':
                this.__callerIDOptionsChange.delete(handler);
                break;
            case 'nrglevelschange':
                this.__nrgLevelsChange.delete(handler);
                break;
            case 'availabledevicelistchange':
                this.__availableDeviceListChange.delete(handler);
                break;
            case 'qualitytestresult':
                this.__qualityTestResult.delete(handler);
                break;
            case 'h264activated':
                this.__h264activated.delete(handler);
                break;
            case 'availablevideodevicelistchange':
                this.__availableVideoDeviceListChange.delete(handler);
                break;
            case 'filetransferinitiated':
                this.__fileTransferInitiated.delete(handler);
                break;
            case 'incomingmessage':
                this.__incomingMessage.delete(handler);
                break;
            case 'searchmessagesresult':
                this.__searchMessagesResult.delete(handler);
                break;
            case 'conversationlistchange':
                this.__conversationListChange.delete(handler);
                break;
            case 'initialeassyncdone':
                this.__initialEasSyncDone.delete(handler);
                break;
            case 'promotedscdcontactsfound':
                this.__promotedSCDContactsFound.delete(handler);
                break;
            case 'unifiedmasterschanged':
                this.__unifiedMastersChanged.delete(handler);
                break;
            case 'unifiedservantschanged':
                this.__unifiedServantsChanged.delete(handler);
                break;
            case 'contactgoneoffline':
                this.__contactGoneOffline.delete(handler);
                break;
            case 'contactonlineappearance':
                this.__contactOnlineAppearance.delete(handler);
                break;
            case 'newcustomcontactgroup':
                this.__newCustomContactGroup.delete(handler);
                break;
        }
    }
}
