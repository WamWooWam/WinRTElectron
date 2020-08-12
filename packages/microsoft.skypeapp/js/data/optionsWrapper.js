

(function () {
    "use strict";

    var emergencyCalling;

    WinJS.Namespace.define("Skype.Model.Options", {
        privacy_accept_calls: {
            get: function () {
                return lib.account.getIntProperty(LibWrap.PROPKEY.account_SKYPE_CALL_POLICY);
            },
            set: function (value) {
                lib.account.setServersideIntProperty(LibWrap.PROPKEY.account_SKYPE_CALL_POLICY, value);
            }
        },
        privacy_accept_skypein_calls: {
            get: function () {
                return lib.account.getIntProperty(LibWrap.PROPKEY.account_PSTN_CALL_POLICY);
            },
            set: function (value) {
                lib.account.setServersideIntProperty(LibWrap.PROPKEY.account_PSTN_CALL_POLICY, value);
            }
        },
        privacy_accept_im: {
            get: function () {
                return lib.account.getIntProperty(LibWrap.PROPKEY.account_CHAT_POLICY);
            },
            set: function (value) {
                lib.account.setServersideIntProperty(LibWrap.PROPKEY.account_CHAT_POLICY, value);
            }
        },
        privacy_ads_policy: {
            get: function () {
                return lib.account.getIntProperty(LibWrap.PROPKEY.account_AD_POLICY);
            },
            set: function (value) {
                lib.account.setServersideIntProperty(LibWrap.PROPKEY.account_AD_POLICY, value);
            }
        },
        incoming_video_autostart: {
            get: function () {
                return lib.setup.getInt('UI/General/IncomingVideoAutoStart', true);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/IncomingVideoAutoStart', value);
            }
        },
        auto_answer_calls: {
            get: function () {
                return lib.setup.getInt('UI/General/AutoAnswerCalls', false);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/AutoAnswerCalls', value);
            }
        },
        play_im_sounds: {
            get: function () {
                return lib.setup.getInt('UI/General/PlayImSounds', true);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/PlayImSounds', value);
            }
        },
        mute_im_sounds_in_current_chat: {
            get: function () {
                return lib.setup.getInt('UI/General/MuteImSoundsInThisChat', true);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/MuteImSoundsInThisChat', value);
            }
        },
        auto_answer_calls_with_video: {
            get: function () {
                return lib.setup.getInt('UI/General/AutoAnswerCallsVideo', false);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/AutoAnswerCallsVideo', value);
            }
        },
        use_windows_camera: {
            get: function () {
                return lib.setup.getInt('UI/General/WindowsCamera', false);
            },
            set: function (value) {
                lib.setup.setInt('UI/General/WindowsCamera', value);
            }
        },
        mic_device: {
            get: function () {
                return lib.setup.getStr('UI/Devices/Microphone', "");
            },
            set: function (value) {
                lib.setup.setStr('UI/Devices/Microphone', value);
            }
        },
        speaker_device: {
            get: function () {
                return lib.setup.getStr('UI/Devices/Speakers', "");
            },
            set: function (value) {
                lib.setup.setStr('UI/Devices/Speakers', value);
            }
        },
        emergency_country: {
            get: function () {
                return lib.setup.getStr('Lib/Call/EmergencyCountry', "");
            },
            set: function (value) {
                lib.setup.setStr('Lib/Call/EmergencyCountry', value);
            }
        },
        
        emergencyCalling: {
            get : function () {
                if (!emergencyCalling) {
                    emergencyCalling = new Skype.Model.EmergencyCalling();
                }
                return emergencyCalling;
            }
        }

    });
    

}());