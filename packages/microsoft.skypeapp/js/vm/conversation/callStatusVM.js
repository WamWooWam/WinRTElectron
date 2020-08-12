

(function () {
    "use strict";
    var STATE = Skype.UI.Conversation.State;

    var callStatusVM = MvvmJS.Class.define(function(conversationWrapper, isInPreLive, conversationSharedState) {
        this._conversationWrapper = conversationWrapper;
        this._conversation = this._conversationWrapper.libConversation;
        this._conversationIdentity = this._conversationWrapper.identity;
        this._peer = conversationSharedState.isDialog ? this._conversationWrapper.contact : null;
        this.sharedState = conversationSharedState;
        this._updateCallStatusLabel = this._updateCallStatusLabel.bind(this);
    }, {
        
        _isVisible: true,

        
        _conversationWrapper: null,
        _conversation: null,
        _conversationIdentity: null,
        sharedState: null,
        _peer: Skype.Utilities.nondisposableProperty(),
        _ariaDurationNeeded: false,
        _numberOfParticipantsInLive: 0,

        _updateDurationTimer: function () {
            if (this._durationIntervalTimer) {
                this.unregInterval(this._durationIntervalTimer);
            }
            if (this.sharedState.state === STATE.LIVE && this._isVisible) {
                this._durationIntervalTimer = this.regInterval(this._updateCallStatusLabel, 1000);
            }
        },

        _updateCallStatusLabel: function () {
            this._ariaDurationNeeded = false;
            switch (this.sharedState.state) {
                case STATE.ERROR_IN_LIVE:
                    this.headerCallStatus = this._getErrorCallStatus();
                    break;
                case STATE.LIVE:
                    this.headerCallStatus = this._getLiveCallStatus();
                    break;
                case STATE.PRE_LIVE:
                    this.headerCallStatus = "liveconversation_state_connecting".translate();
                    break;
                default:
                    this.headerCallStatus = "";
                    break;
            }
            this.liveConversationAriaStatus = this._ariaDurationNeeded ? "aria_liveconversation_state_duration".translate(Skype.Utilities.normalizeDurationForAria(this.headerCallStatus)) : this.headerCallStatus;
        },

        _getErrorCallStatus: function () {
            var token = Skype.UI.Conversation.CallErrorsMap[this.sharedState.lastParticipantError];
            if (token) {
                return ("call_error_" + token).translate();
            }
            return "";
        },

        _getLiveCallStatus: function () {
            var statusText = "";
            var recoveryMode = this.sharedState.isDialog ? 
                        !!this._conversation.partner.getIntProperty(LibWrap.PROPKEY.participant_LIVESESSION_RECOVERY_IN_PROGRESS) : false;
            var localLivestatus = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);

            if (localLivestatus === LibWrap.Conversation.local_LIVESTATUS_STARTING && !recoveryMode) {  
                statusText = "liveconversation_state_calling".translate();
                if (this._conversation.partner) { 
                    var number = this._conversation.partner.getStrProperty(LibWrap.PROPKEY.participant_LIVE_IDENTITY);
                    if (number !== this._conversationIdentity) {
                        var phones = this._peer.phones;
                        var phoneType = Skype.Model.PhoneType;
                        for (var i = 0; i < phones.length; i++) {
                            if (phones[i].number === number) {
                                statusText = ("liveconversation_state_calling_" + phoneType.asArray[phones[i].type].name).translate();
                                break;
                            }
                        }
                    }
                }
            } else {
                if (this.sharedState.isDialog && this._conversationWrapper.duration < 7) {
                var livePrice = this._conversationWrapper.getLivePrice();
                    if (livePrice) {
                        if (livePrice.fundingType === Skype.Model.DialogConversation.LivePriceFundingType.tbyb) {
                            statusText = "liveconversation_state_free".translate();
                        } else if (livePrice.fundingType === Skype.Model.DialogConversation.LivePriceFundingType.package) {
                            statusText = "liveconversation_state_covered".translate();
                        } else if (livePrice.fundingType === Skype.Model.DialogConversation.LivePriceFundingType.skypeout) {
                            statusText = "liveconversation_state_price".translate(Skype.Globalization.formatPrice(livePrice.price, livePrice.currency));
                        }
                    } else {
                        statusText = this._conversationWrapper.formattedDuration;
                        this._ariaDurationNeeded = true;
                    }
                } else {
                    statusText = this._conversationWrapper.formattedDuration;
                    this._ariaDurationNeeded = true;
                }
            }
            return statusText;
        },

        _handleConversationPropertyChange: function (e) {
            if (e.detail[0].indexOf(LibWrap.PROPKEY.conversation_LIVE_START_TIMESTAMP).returnValue) {
                this._updateCallStatusLabel();
            }
        },

        _onConversationStateChanged: function (state) {
            if (state === STATE.LIVE) {
                this._updateDurationTimer();
            }

            this._updateVisibilityOfParticipantsCounter();
            this._updateCallStatusLabel();
        },

        
        init: function () {
            this.isPstnOnly = this._conversationWrapper.isPstnOnly;

            this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LIVE_START_TIMESTAMP]);
            this.regEventListener(this._conversation, "propertieschanged", this._handleConversationPropertyChange.bind(this));
            this.regBind(this.sharedState, "state", this._onConversationStateChanged.bind(this));
            this.liveConversationAriaTitle = "aria_liveconversation_title".translate(this.sharedState.name);
        },

        onNumberOfLiveParticipantsChanged: function (numberOfParticipantsInLive) {
            this._numberOfParticipantsInLive = numberOfParticipantsInLive;
            if (this._isVisible) {
                this.numberOfParticipantsInLive = Skype.Globalization.formatNumericID("liveconversation_number_of_participants_in_call", numberOfParticipantsInLive).translate(numberOfParticipantsInLive);
                this.numberOfParticipantsInLiveAria = "{0} {1}".format(this.numberOfParticipantsInLive,"aria_liveconversation_participant_list_link".translate());
            }
        },

        setVisible: function (visible) {
            this._isVisible = visible;
            this._updateDurationTimer();
            if (this._isVisible) {
                this.onNumberOfLiveParticipantsChanged(this._numberOfParticipantsInLive);
                this._updateCallStatusLabel();
            }
        },

        _updateVisibilityOfParticipantsCounter: function () {
            this.isNumberOfParticipantsVisible = this.sharedState.state === STATE.LIVE && !this.sharedState.isDialog;
        },

    }, { 

        
        isPstnOnly: false,

        
        liveConversationAriaTitle: "",
        liveConversationAriaStatus: "",
        headerCallStatus: "",
        numberOfParticipantsInLive: "",
        numberOfParticipantsInLiveAria: "",
        isNumberOfParticipantsVisible: false
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        CallStatusVM: WinJS.Class.mix(callStatusVM, Skype.Class.disposableMixin)
    });

}());
