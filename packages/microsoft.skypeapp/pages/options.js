

(function () {
  "use strict";

  Skype.UI.Page.define("/pages/options.html", "div.optionsPage", {
    
    
    _element: null,
    _privacy_accept_calls_el: null,
    _privacy_accept_skypein_calls_el: null,
    _privacy_accept_im_el: null,
    _privacy_ads_el: null,
    _incoming_video_el: null,
    _clear_history_button: null,
    _auto_answer_calls_el: null,
    _auto_answer_calls_v_element: null,
    _video_source_el: null,
    _video_preview_el: null,
    _mic_source_element: null,
    _speaker_source_element: null,
    _speaker_level_el: null,
    _mic_level_el: null,
    _currentVideoDeviceHandle: null,
    _audioLevelsTimer: null,
    _speaker_play_el: null,
    _my_account_label: null,
    _signout_button: null,
    _flyout: null,
    _my_country_el: null,
    _isVideoPreviewRunning: null,

    ready: function (element, options) {
      WinJS.Resources.processAll(element);
      this.handleAfterShow = this.handleAfterShow.bind(this);
      this.regEventListener(element, "aftershow", this.handleAfterShow);
      this.handleBeforeHide = this.handleBeforeHide.bind(this);
      this.regEventListener(element, "beforehide", this.handleBeforeHide);
      this.regEventListener(element, "afterhide", function () {
        Skype.UI.Framework.disposeSubTree(element);
      });

      lib.startRecordingTest(false);

      this._isVideoPreviewRunning = Skype.SendVideoManager.instance.isVideoPreviewRunning();

      this._element = element;

      this._flyout = element.querySelector("div.optionsSettingsFlyout");
      

      this._initialFocusElement = element.querySelector("button.win-backbutton");

      this._privacy_accept_calls_el = element.querySelector("div.privacy_accept_calls select");
      this._privacy_accept_calls_el.addEventListener("change", this.handlePrivacyAcceptCallsChange.bind(this));
      this._privacy_accept_calls_el.appendChild(new Option("options_contacts".translate(), LibWrap.Account.skypecallpolicy_BUDDIES_OR_AUTHORIZED_CAN_CALL));
      this._privacy_accept_calls_el.appendChild(new Option("options_everyone".translate(), LibWrap.Account.skypecallpolicy_EVERYONE_CAN_CALL));
      this._privacy_accept_calls_el.value = Skype.Model.Options.privacy_accept_calls;

      this._privacy_accept_skypein_calls_el = element.querySelector("div.privacy_accept_skypein_calls select");
      this._privacy_accept_skypein_calls_el.addEventListener("change", this.handlePrivacyAcceptSkypeInCallsChange.bind(this));
      this._privacy_accept_skypein_calls_el.appendChild(new Option("options_contacts".translate(), LibWrap.Account.pstncallpolicy_BUDDY_NUMBERS_CAN_CALL));
      this._privacy_accept_skypein_calls_el.appendChild(new Option("options_no_hidden".translate(), LibWrap.Account.pstncallpolicy_DISCLOSED_NUMBERS_CAN_CALL));
      this._privacy_accept_skypein_calls_el.appendChild(new Option("options_everyone".translate(), LibWrap.Account.pstncallpolicy_ALL_NUMBERS_CAN_CALL));
      this._privacy_accept_skypein_calls_el.value = Skype.Model.Options.privacy_accept_skypein_calls;

      this._privacy_accept_im_el = element.querySelector("div.privacy_accept_im select");
      this._privacy_accept_im_el.addEventListener("change", this.handlePrivacyAcceptIMChange.bind(this));
      this._privacy_accept_im_el.appendChild(new Option("options_contacts".translate(), LibWrap.Account.chatpolicy_BUDDIES_OR_AUTHORIZED_CAN_ADD));
      this._privacy_accept_im_el.appendChild(new Option("options_everyone".translate(), LibWrap.Account.chatpolicy_EVERYONE_CAN_ADD));
      this._privacy_accept_im_el.value = Skype.Model.Options.privacy_accept_im;

      this._clear_history_button = element.querySelector("div.clearhistory button");
      this._clear_history_button.addEventListener("click", this.handleClearHistoryClick.bind(this));

      this._incoming_video_el = element.querySelector("div.options_incoming_video select");
      this._incoming_video_el.addEventListener("change", this.handleIncomingVideoChange.bind(this));
      this._incoming_video_el.appendChild(new Option("options_incoming_video_accept".translate(), "1"));
      this._incoming_video_el.appendChild(new Option("options_incoming_video_ask".translate(), "0"));
      this._incoming_video_el.value = Skype.Model.Options.incoming_video_autostart;

      this._privacy_ads_el = element.querySelector("div.personal_ads div");
      this._privacy_ads_el.addEventListener("change", this.handleAdsChange.bind(this));
      this._privacy_ads_el.winControl.labelOn = "options_yes".translate();
      this._privacy_ads_el.winControl.labelOff = "options_no".translate();
      this._privacy_ads_el.winControl.checked = Skype.Model.Options.privacy_ads_policy == LibWrap.Account.adpolicy_ADS_ENABLED;

      this._auto_answer_calls_el = element.querySelector("div.answer_automatically div");
      this._auto_answer_calls_el.addEventListener("change", this.handleAnswerAutomaticallyChange.bind(this));
      this._auto_answer_calls_el.winControl.labelOn = "options_yes".translate();
      this._auto_answer_calls_el.winControl.labelOff = "options_no".translate();
      this._auto_answer_calls_el.winControl.title = "options_answer_auto".translate();
      this._auto_answer_calls_el.winControl.checked = Skype.Model.Options.auto_answer_calls;

      this._auto_answer_calls_v_element = element.querySelector("div.answer_automatically_video div");
      this._auto_answer_calls_v_element.addEventListener("change", this.handleAnswerAutomaticallyVideoChange.bind(this));
      this._auto_answer_calls_v_element.winControl.labelOn = "options_yes".translate();
      this._auto_answer_calls_v_element.winControl.labelOff = "options_no".translate();
      this._auto_answer_calls_v_element.winControl.title = "options_answer_video_auto".translate();
      this._auto_answer_calls_v_element.winControl.checked = Skype.Model.Options.auto_answer_calls_with_video;

      this._notifications_imsounds_el = element.querySelector("div.options_notifications_imsound div");
      this._notifications_imsounds_el.addEventListener("change", this.handleImSoundsChange.bind(this));
      this._notifications_imsounds_el.winControl.labelOn = "options_yes".translate();
      this._notifications_imsounds_el.winControl.labelOff = "options_no".translate();
      this._notifications_imsounds_el.winControl.title = "options_notifications_imsound".translate();
      this._notifications_imsounds_el.winControl.checked = Skype.Model.Options.play_im_sounds;

      this._notifications_imsounds_current_chat_el = element.querySelector("div.options_notifications_imsound_current_chat div");
      this._notifications_imsounds_current_chat_el.addEventListener("change", this.handleImSoundForCurrentChatChange.bind(this));
      this._notifications_imsounds_current_chat_el.winControl.labelOn = "options_yes".translate();
      this._notifications_imsounds_current_chat_el.winControl.labelOff = "options_no".translate();
      this._notifications_imsounds_current_chat_el.winControl.title = "options_notifications_imsound_current_chat".translate();
      this._notifications_imsounds_current_chat_el.winControl.checked = Skype.Model.Options.mute_im_sounds_in_current_chat;

      this._video_source_el = element.querySelector("div.options_camera select");
      this._video_source_el.addEventListener("change", this.handleVideoSourceComboChange.bind(this));
      if (this._isVideoPreviewRunning) { this._video_source_el.setAttribute("disabled", "disabled"); }
      this.regEventListener(lib, "availablevideodevicelistchange", this.handleVideoListChange.bind(this));

      this._mic_source_element = element.querySelector("div.options_microphone select");
      this._mic_source_element.addEventListener("change", this.handleMicrophoneComboChange.bind(this));
      this._mic_level_el = element.querySelector("div.options_microphone div.volumeLevel");

      this._speaker_source_element = element.querySelector("div.options_speakers select");
      this._speaker_source_element.addEventListener("change", this.handleSpeakersComboChange.bind(this));
      this._speaker_level_el = element.querySelector("div.options_speakers div.volumeLevel");
      this._speaker_play_el = element.querySelector("div.options_speakers button.playButton");
      this._speaker_play_el.addEventListener("click", this.handleSpeakerPlayClick.bind(this));

      this._my_country_el = element.querySelector("div.emergency_country select");
      this._my_country_el.addEventListener("change", this.handleMyCountryComboChange.bind(this));
      this.regEventListener(Skype.Model.Options.emergencyCalling, "countryChanged", this.handleEmergencyCountryChanged.bind(this));
      this.updateCountryLists();

      this._video_preview_el = element.querySelector("div.myselfVideo");
      this._video_preview = this._video_preview_el.winControl;
      this._video_preview_init_promise = this._video_preview.init(null);

      this.handleVideoListChange();
      this.handleMicAndSpeakerListChangeAsync();
        
      this.updateVisibleItems();

      this._audioLevelsTimer = setInterval(this.handleAudioLevelsInterval.bind(this), 200);
      element.addEventListener("keydown", this.handleAltLeft.bind(this));
      element.addEventListener("keypress", this.handleBackspace.bind(this));
    },

    unload: function () {
      
      
      
      
    },

    handleAfterShow: function () {
      this._initialFocusElement.focus();
    },

    handleBeforeHide: function () {
      this.stopVideoPreview();
      clearInterval(this._audioLevelsTimer);
      lib.stopRecordingTest();
    },

    handleEmergencyCountryChanged: function () {
      this._my_country_el.value = Skype.Model.Options.emergencyCalling.emergencyCountry;
      var limited = this._element.querySelector("div.emergency_info.limited");
      var noCall = this._element.querySelector("div.emergency_info.nocall");
      var emeInfoContainer = this._element.querySelector("div.emergency_info_container");
      if (!this._my_country_el.value) {
        WinJS.Utilities.addClass(limited, "hidden");
        WinJS.Utilities.addClass(noCall, "hidden");
        WinJS.Utilities.addClass(emeInfoContainer, "EMPTY");
      } else if (Skype.Model.Options.emergencyCalling.emergencyCallingAllowed()) {
        WinJS.Utilities.removeClass(limited, "hidden");
        WinJS.Utilities.addClass(noCall, "hidden");
        WinJS.Utilities.removeClass(emeInfoContainer, "EMPTY");
      } else {
        WinJS.Utilities.addClass(limited, "hidden");
        WinJS.Utilities.removeClass(noCall, "hidden");
        WinJS.Utilities.removeClass(emeInfoContainer, "EMPTY");
      }
    },

    updateCountryLists: function () {
      var list = Skype.Model.CountriesRepository.instance.countries;

      for (var i = 0; i < list.length; i++) {
        var item = list.getAt(i);
        this._my_country_el.appendChild(new Option(item.name, item.code));
      }
      this._my_country_el.selectedIndex = -1;
      this.handleEmergencyCountryChanged();
    },

    handleAudioLevelsInterval: function () {
      var speaker = lib.getSpeakerLevel();
      var mic = lib.getMicLevel();
      this._mic_level_el.setAttribute("data-value", mic);
      this._speaker_level_el.setAttribute("data-value", speaker);
    },

    updateVisibleItems: function () {
        var autoVideoElement = this._element.querySelector("div.answer_automatically_video");
        Skype.Model.Options.auto_answer_calls ? WinJS.Utilities.removeClass(autoVideoElement, "hidden") : WinJS.Utilities.addClass(autoVideoElement, "hidden");

        var skypeInElement = this._element.querySelector("div.privacy_accept_skypein_calls");
        lib.account.hasCapability(LibWrap.Contact.capability_CAPABILITY_SKYPEIN) ? WinJS.Utilities.removeClass(skypeInElement, "hidden") : WinJS.Utilities.addClass(skypeInElement, "hidden");
        
        var playImSoundsInCurrentChatElement = this._element.querySelector("div.options_notifications_imsound_current_chat");
        Skype.Model.Options.play_im_sounds ? WinJS.Utilities.removeClass(playImSoundsInCurrentChatElement, "hidden") : WinJS.Utilities.addClass(playImSoundsInCurrentChatElement, "hidden");

        autoVideoElement = skypeInElement = playImSoundsInCurrentChatElement = null;
    },

    handleMicAndSpeakerListChangeAsync: function () {
        Skype.Application.DeviceManager.updateSkypeAudioSettingsAsync().then(function () {
            this.handleAudioDeviceListChangeAsync(
                this._mic_source_element,
                Skype.Application.DeviceManager.micDeviceNamesAsync,
                Skype.Application.DeviceManager.getSelectedMicDeviceNameAsync);
            this.handleAudioDeviceListChangeAsync(
                this._speaker_source_element,
                Skype.Application.DeviceManager.speakerDeviceNamesAsync,
                Skype.Application.DeviceManager.getSelectedSpeakerDeviceNameAsync);
        }.bind(this));
    },

    handleAudioDeviceListChangeAsync: function (sourceElement, namesFuncAsync, getSelectedDeviceNameFuncAsync) {
        sourceElement.innerHTML = "";
        sourceElement.appendChild(new Option("options_same_as_windows".translate(), ""));
        return namesFuncAsync().then(function (names) {
            for (var i = 0; i < names.getCount() ; i++) {
                var name = names.get(i);
                sourceElement.appendChild(new Option(name, name));
            }
            return getSelectedDeviceNameFuncAsync().then(function (value) {
                sourceElement.value = value;
            });
        });
    },

    handleSpeakerPlayClick: function () {
      Skype.Sounds.play(0, Skype.Sounds.SoundTypes.CallRingIn, false, true);
    },

    stopVideoPreview: function () {
      this._video_preview.stopVideo();
    },

    startVideoPreview: function (videoDevice) {
      if (this._currentVideoDeviceHandle !== videoDevice && !this._isVideoPreviewRunning) {
        this._currentVideoDeviceHandle = videoDevice;
        this._video_preview_init_promise.then(function () {
          this.stopVideoPreview();
          this._video_preview.startVideo(this._currentVideoDeviceHandle);
        }.bind(this));
      }
    },

    handleVideoListChange: function () {
      var list = lib.getVideoDeviceHandles();
      this._video_source_el.innerHTML = "";
      
      for (var i = 0; i < list.size; i++) {
        this._video_source_el.appendChild(new Option(list[i], list[i]));
      }
      if (!lib.defaultVideoDeviceHandle) { 
        var defHandle = lib.getActiveVideoDeviceHandle();
        if (defHandle) { 
          lib.defaultVideoDeviceHandle = defHandle;
        }
        
      }
      var videoDevice = lib.defaultVideoDeviceHandle;
      this.startVideoPreview(videoDevice);
      this._video_source_el.value = videoDevice;
    },

    handleMicrophoneComboChange: function () {
      Skype.Application.DeviceManager.setSelectedMicDeviceName(this._mic_source_element.value);
    },

    handleSpeakersComboChange: function () {
      Skype.Application.DeviceManager.setSelectedSpeakerDeviceName(this._speaker_source_element.value);
    },

    handleVideoSourceComboChange: function () {
      if (lib.defaultVideoDeviceHandle !== this._video_source_el.value) {
        this.startVideoPreview(this._video_source_el.value);
        lib.defaultVideoDeviceHandle = this._video_source_el.value;
      }
    },

    handleAnswerAutomaticallyVideoChange: function () {
      Skype.Model.Options.auto_answer_calls_with_video = this._auto_answer_calls_v_element.winControl.checked;
    },

    handleAnswerAutomaticallyChange: function () {
      Skype.Model.Options.auto_answer_calls = this._auto_answer_calls_el.winControl.checked;
      if (!Skype.Model.Options.auto_answer_calls) {
        Skype.Model.Options.auto_answer_calls_with_video = false;
      }
      this.updateVisibleItems();
    },

    handleImSoundsChange: function () {
        Skype.Model.Options.play_im_sounds = this._notifications_imsounds_el.winControl.checked;
        if (!Skype.Model.Options.play_im_sounds) {
            Skype.Model.Options.mute_im_sounds_in_current_chat = false;
        }
        this.updateVisibleItems();
    },

    handleImSoundForCurrentChatChange: function () {
      Skype.Model.Options.mute_im_sounds_in_current_chat = this._notifications_imsounds_current_chat_el.winControl.checked;
    },

    handleAdsChange: function () {
      Skype.Model.Options.privacy_ads_policy = this._privacy_ads_el.winControl.checked ? LibWrap.Account.adpolicy_ADS_ENABLED : LibWrap.Account.adpolicy_ADS_ENABLED_NOTARGET;
    },

    handleIncomingVideoChange: function () {
      Skype.Model.Options.incoming_video_autostart = this._incoming_video_el.value;
    },

    handlePrivacyAcceptCallsChange: function () {
      Skype.Model.Options.privacy_accept_calls = this._privacy_accept_calls_el.value;
    },

    handlePrivacyAcceptSkypeInCallsChange: function () {
      Skype.Model.Options.privacy_accept_skypein_calls = this._privacy_accept_skypein_calls_el.value;
    },

    handlePrivacyAcceptIMChange: function () {
      Skype.Model.Options.privacy_accept_im = this._privacy_accept_im_el.value;
    },

    handleClearHistoryClick: function (e) {
      
      this._flyout.winControl._sticky = true;

      Skype.UI.Dialogs.showConfirmDialogAsync(this._clear_history_button, "options_clear_history_confirm".translate(),
          "options_clear_history_confirm2".translate()).done(function (result) {
            if (result) {
              Skype.VideoMessaging.Capturer.cleanupViMsAsync();
              lib.deleteAllMessages();
              Skype.Application.state.historyCleared.dispatch();
            }
            this._flyout.winControl._sticky = false;
          }.bind(this));
    },

    handleMyCountryComboChange: function (e) {
      Skype.Model.Options.emergencyCalling.emergencyCountry = this._my_country_el.value;

    },

    updateLayout: function (element, viewState, lastViewState) {
      

      
    },

    handleBackspace: function (evt) {
      if (evt.key === 'Backspace') {
        evt.preventDefault();
        WinJS.UI.SettingsFlyout.show();
      }
    },

    handleAltLeft: function (evt) {
      
      if (evt.altKey && evt.key === 'Left') {
        WinJS.UI.SettingsFlyout.show();
      }
    }
  });
})();
