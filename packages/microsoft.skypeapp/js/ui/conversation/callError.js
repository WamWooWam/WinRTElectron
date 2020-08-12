

(function () {
    "use strict";

    var callErrorsMap = [];
    
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_MANUAL] = "noanswer"; 
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_BUSY] = "busy"; 
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_CONNECTION_DROPPED] = "drop";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_NO_SKYPEOUT_SUBSCRIPTION] = "nosub";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_INSUFFICIENT_FUNDS] = "nocredit";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_INTERNET_CONNECTION_LOST] = "nointernet";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_SKYPEOUT_ACCOUNT_BLOCKED] = "blocked";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_COULD_NOT_CONNECT_TO_SKYPE_PROXY] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_INVALID_NUMBER] = "invalid";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_NUMBER_FORBIDDEN] = "invalid";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_CALL_TIMED_OUT] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_BUSY] = "busy";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_CALL_TERMINATED] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_NETWORK_ERROR] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_NUMBER_UNAVAILABLE] = "blocked";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_CALL_REJECTED] = "noanswer";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_MISC_ERROR] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_INTERNAL_ERROR] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_UNABLE_TO_CONNECT] = "noanswer";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_RECORDING_FAILED] = "recording_failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PLAYBACK_ERROR] = "playback_failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_LEGACY_ERROR] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_BLOCKED_BY_PRIVACY_SETTINGS] = "privacy";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_ERROR] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_TRANSFER_FAILED] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_TRANSFER_INSUFFICIENT_FUNDS] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_BLOCKED_BY_US] = "blocked";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_EMERGENCY_CALL_DENIED] = "emergency";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_PLUGIN_INSTALL_NEEDED] = "failed";
    callErrorsMap[LibWrap.WrSkyLib.leave_REASON_LIVE_TOO_MANY_IDENTITIES] = "failed";

    WinJS.Namespace.define("Skype.UI.Conversation", {
        CallErrorsMap: callErrorsMap,
    });
})();
