

(function () {
    "use strict";

    var conversationProfileInfoVM = WinJS.Class.mix(MvvmJS.Class.define(function(conversationconversationState, avatar) {
        this._conversationIdentity = conversationconversationState.identity;
        this._conversation = lib.getConversationByIdentity(this._conversationIdentity);
        this._conversationWrapper = Skype.Model.ConversationFactory.createConversation(this._conversation);
        this._peer = conversationconversationState.isDialog ? this._conversationWrapper.contact : null;
        this._avatar = avatar;
        this.sharedState = conversationconversationState;
    }, {
        
        _conversationIdentity: null,
        _conversationWrapper: null,
        _conversation: null,
        _peer: Skype.Utilities.nondisposableProperty(),

        
        callMenu: null,
        moreMenu: null,
        joinCallMenu: null,
        _avatar: null,
        sharedState: null,

        
        _callMenuInitialized: false,

        
        _profileUpdateTimeout: null,

        _showCallMenu: function(evt) {
            if (!this._callMenuInitialized) {
                var isLyncContact = this._conversationWrapper.contact.isLyncContact;

                this.callMenu.init(false, this._makeCall.bind(this), null, isLyncContact);
                this._callMenuInitialized = true;
            }
            this.callMenu.display(evt.currentTarget, "top", this._peer.phones);
        },

        _checkVideo: function() {
            var caps = this._conversationWrapper.capabilities;
            var convoSendVideoEnabled = caps && caps.get(LibWrap.Conversation.capability_CAN_RING_VIDEO);
            var emptyGroup = !this.sharedState.isDialog && this._conversation.participants && this._conversation.participants.length === 0;
            this.videoSendDisabled = emptyGroup || !Skype.Application.DeviceManager.isVideoDevicePresent() || !convoSendVideoEnabled;
        },

        _updateMoreButtonVisibility: function() {
            var caps = this._conversationWrapper.capabilities;
            this.moreButtonDisabled = !caps || caps && !(caps.get(LibWrap.Conversation.capability_CAN_SEND_VIDEOMESSAGE) ||
                caps.get(LibWrap.Conversation.capability_CAN_ADD) ||
                caps.get(LibWrap.Conversation.capability_CAN_SEND_FILE));
        },

        _checkAudio: function () { 
            var caps = this._conversationWrapper.capabilities;
            var XXXconvoCallEnabled = caps && (caps.get(LibWrap.Conversation.capability_CAN_RING) || caps.get(LibWrap.Conversation.capability_CAN_RING_PSTN));
            var emptyGroup = !this.sharedState.isDialog && this._conversation.participants && this._conversation.participants.length === 0;
            var maxCallableGroup = lib.getIntLibProp(LibWrap.WrSkyLib.libprop_LIBPROP_MAX_CONFCALL_PARTICIPANTS);
            var noCallGroup = this._conversation.participants && this._conversation.participants.length > maxCallableGroup;
            this.audioCallDisabled = emptyGroup || noCallGroup || !XXXconvoCallEnabled;
        },

        _handleEmergencyCountryChanged: function() {
            var emergencyCallingAllowed = Skype.Model.Options.emergencyCalling.emergencyCallingAllowed();

            this.callingDisabled = this._peer && this._peer.isEmergencyContact && !emergencyCallingAllowed;
            this.emergencyCountryName = Skype.Model.Options.emergencyCalling.emergencyCountryName; 

            if (!Skype.Model.Options.emergencyCalling.emergencyCountry) {
                this.restrictionType = "noCountry";
            } else {
                this.restrictionType = emergencyCallingAllowed ? "allowedCountry" : "restrictedCountry";
            }
        },

        _makeCall: function(phone) {
            Actions.invoke("call", [this._conversationIdentity], phone ? { identityToUse: phone.number } : null);
            this.callMenu && this.callMenu.hide();

            
            if (phone) {
                this._sendCallStats(phone);
            }
        },

        _sendCallStats: function (phone) {
            var skypeCall = phone.phoneType == Skype.Model.PhoneType.skype;
            var skypeContactPstnNumber = !!phone && phone.number && !skypeCall;

            if (skypeCall) {
                Skype.Statistics.sendStats(Skype.Statistics.event.conversation_s2sSkypeContact);
            } else if (skypeContactPstnNumber) {
                Skype.Statistics.sendStats(Skype.Statistics.event.conversation_skypeoutSkypeContact);
            } else if (this.sharedState.isPstnContact) {
                Skype.Statistics.sendStats(Skype.Statistics.event.conversation_skypeoutPSTNContact);
            }
        },

        _updateLocationInfo: function() {
            var city = this._peer.libContact.getStrProperty(LibWrap.PROPKEY.contact_CITY);
            if (!city) {
                log("_updateLocationInfo: Couldn't get peer city !");
                return;
            }

            var country = Skype.Lib.countryISO2Name(this._peer.libContact.getStrProperty(LibWrap.PROPKEY.contact_COUNTRY));
            if (!country && this._peer && this._peer.isPstnContact && this._peer.identity) { 
                var countryCode = Skype.Lib.getCountryCode(this._peer.identity);
                country = countryCode ? Skype.Lib.countryISO2Name(countryCode) : country;
            }

            if (city.length && country.length) {
                this.locationInfo = city + ", " + country;
            } else {
                this.locationInfo = city + country;
            }
        },

        _updateTimeZone: function() {
            
            
            var timezone = this._peer.libContact.getIntProperty(LibWrap.PROPKEY.contact_TIMEZONE);
            if (!timezone) {
                log("_updateLocationInfo: Couldn't get peer timezone !");
                return;
            }

            if (!this._peer.isEchoService && !this._peer.isPstnContact) {
                var contactUTCDiff = this._peer.libContact.getIntProperty(LibWrap.PROPKEY.contact_TIMEZONE) - 24 * 3600;
                var timestamp = new Date();
                timestamp.setHours(timestamp.getUTCHours(), timestamp.getUTCMinutes(), timestamp.getUTCSeconds() + contactUTCDiff);
                var formatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortTime;

                this.timeInfo = formatter.format(timestamp);

                this.unregTimeout(this._profileUpdateTimeout);
                this._profileUpdateTimeout = this.regTimeout(this._updateTimeZone.bind(this), 1000 * (60 - timestamp.getSeconds()));
            }
        },

        _updateProfile: function() {
            this._handleCapabilitiesChanged();
            this.updateProfileInfo();
        },

        _handleConversationWrapperPropertyChange: function(e) {
            if (e.detail == "avatarUri") {
                this._avatar.updateAvatar();
            }
            if (["name", "formattedMood", "p2pMigrated"].contains(e.detail)) { 
                this._updateProfile();
            }
        },

        _handleCapabilitiesChanged: function () {
            log("ConversationProfileInfoVM _handleCapabilitiesChanged()");
            this._updateMoreButtonVisibility();
            this._checkAudio();
            this._checkVideo();
        },

        _handleMoodMessage: function() { 
            if (this._peer) {
                this.moodMessage = (Skype.Application.state.view.isVertical) ? Skype.Utilities.trimHtmlNewlines(this._peer.formattedMood, " ") : this._peer.formattedMood;
            }
            
            
        },

        _updateActionFlags: function() {
            this.fileTransferInapplicable = !Actions.isActionApplicable("sendFilesAction", this._conversationIdentity);

            var action = Actions.sendVideoMessage(this._conversationIdentity);
            this.sendVideoMessageMenuItemHidden = !action.isApplicable();
            this.sendVideoMessageMenuItemEnabled = action.isEnabled();
            var multipleActionsAvailable = !this.fileTransferInapplicable || !this.sendVideoMessageMenuItemHidden;
            return multipleActionsAvailable;
        },

        
        alive: function() {
            log("ConversationProfileInfoVM alive()");
            this.regEventListener(Skype.Model.Options.emergencyCalling, "countryChanged", this._handleEmergencyCountryChanged.bind(this)); 
            this.regEventListener(this._conversation, "participantlistchange", this._updateProfile.bind(this));
            this.regEventListener(this._conversationWrapper, "propertychanged", this._handleConversationWrapperPropertyChange.bind(this));
            this.regEventListener(Skype.Application.state, "deviceListChanged", this._checkVideo.bind(this));
            this.regEventListener(this._conversationWrapper.capabilities, Skype.Model.ConversationCapabilities.Events.CapabilitiesChanged, this._handleCapabilitiesChanged.bind(this));
            this._conversationWrapper.alive();
            var bla = this._conversationWrapper.avatarUri;
 
            this.regBind(this._conversationWrapper, "isAvailable", function(isAvailable) {
                this.isAvailable = isAvailable; 
                this._handleMoodMessage();
            }.bind(this));

            this._handleEmergencyCountryChanged();
            this._updateProfile();
        },
        
        onWindowResize: function() {
            this._handleMoodMessage();
        },

        updateProfileInfo: function() {
            if (!this.sharedState.isDialog) {
                
                var nParticipants = this._conversation.participants.size;
                this.participantCount = Skype.Globalization.formatNumericID("participant_count", nParticipants).translate(nParticipants);
                (nParticipants > 0) ? this.disabled = "" : this.disabled = "disabled";
                return;
            }
            
            this.isAvailable = this._peer.isAvailable;
            this._updateLocationInfo();
            this._updateTimeZone();
            this.isPstnOnly = this._conversationWrapper.isPstnOnly;
        },

        onShow: function() {
            this.isActive = true;
        },

        onHide: function() {
            this.isActive = false;
        },

        
        call: function(evt) {
            if (this.callingDisabled || this.audioCallDisabled) {
                return; 
            }
            if (this._peer) {
                var phones = this._peer.phones;
                if (phones && phones.length === 1) {
                    this._makeCall(this._conversationIdentity);
                } else {
                    this._showCallMenu(evt);
                }
            } else {
                this._makeCall();
            }
        },

        videoCall: function() {
            if (!this.callingDisabled && !this.videoSendDisabled) {
                Actions.invoke("videoCall", [this._conversationIdentity]);
            }
        },

        doMore: function(evt) {
            if (this._updateActionFlags()) {
                this.moreMenu.anchor = evt.currentTarget;
                this.moreMenu.placement = "top";
                this.moreMenu.alignment = "center";
                
                this.regImmediate(function() {
                    this.moreMenu.show();
                    roboSky.write("Conversation,moreMenu,show");
                }.bind(this));
            } else {
                this.showAddParticipants();
            }
        },

        doJoinGroupCall: function(evt) {
            this.joinCallMenu.anchor = evt.currentTarget;
            this.joinCallMenu.placement = "top";
            this.joinCallMenu.alignment = "center";
            
            this.regImmediate(function() {
                this.joinCallMenu.show();
                roboSky.write("Conversation,joinCallMenu,show");
            }.bind(this));
        },

        sendVideoMessage: function() {
            
            if (Skype.UI.Conversation.VideoMessageDialog.isActive) {
                return;
            }

            Actions.invoke("sendVideoMessage", this._conversationIdentity);
        },

        showParticipantsList: function() {
            Skype.UI.navigate("participantList", { id: this._conversationIdentity });
        },

        showAddParticipants: function() {
            Actions.invoke("addParticipants", this._conversationIdentity);
        },

        showSendFile: function() {
            var promise = Actions.invoke("sendFilesAction", [this._conversationIdentity]);
            this.dispatchEvent(conversationProfileInfoVM.Events.FileSent, { promise: promise });
        },

        changeCountry: function() {
            Skype.UI.navigate("dialer", { number: this._conversationIdentity });
        },
    }, {
        
        fileTransferInapplicable: false,
        sendVideoMessageMenuItemHidden: true,
        sendVideoMessageMenuItemEnabled: false,
        callingDisabled: false,
        videoSendDisabled: true,
        audioCallDisabled: true,
        moreButtonDisabled: false,
        isActive: false,
        isPstnOnly: false,

        
        disabled: "",

        
        isAvailable: false,
        
        restrictionType: "noCountry",
        emergencyCountryName: "",
        participantCount: 1,
        locationInfo: "",
        moodMessage: "",
        timeInfo: "",

        
        presenceAriaLabel: ""
    }, {
        Events: {
            FileSent: "FileSent"
        }
    }), WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationProfileInfoVM: WinJS.Class.mix(conversationProfileInfoVM, Skype.Class.disposableMixin)
    });

}());

