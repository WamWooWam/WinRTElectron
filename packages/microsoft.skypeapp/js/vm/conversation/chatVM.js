

(function () {
    "use strict";

    var callQualityTokens = {
        QUALITY_SO: 20,
        QUALITY_S2S: 21,
        QUALITY_GAC: 22,
        QUALITY_MPV: 23
    };

    var ratingType = {
        RANDOM_RATING: "random",
        CANCEL_RATING: "cancel"
    };

    var chatVM = MvvmJS.Class.define(function chatVM_constructor (conversationWrapper, sessionStateId, conversationSharedState) {
        this._conversationWrapper = conversationWrapper;
        this._peer = conversationSharedState.isDialog ? this._conversationWrapper.contact : null;
        this._convStateSoft = Skype.UI.softSessionState.conversations[sessionStateId]; 
        this._conversation = this._conversationWrapper.libConversation;
        this.sharedState = conversationSharedState;
        this._editMessageRequested = this._editMessageRequested.bind(this);
    }, {
        
        _chatOpenInLive: false,
        _noCallRateAsWeSpawned: false,

        
        _conversationWrapper: null,
        _conversation: null,
        _peer: Skype.Utilities.nondisposableProperty(),

        
        _chatInput: null,
        _chatLog: null,

        
        _convStateSoft: null,
        _chatLogDataTabIndex: null,
        sharedState: null,

        
        _requestContactName: "",
        _buddyStatusClass: "",

        _userText: {
            get: function () {
                return typeof this._convStateSoft.userText !== 'undefined' ? this._convStateSoft.userText : '';
            },
            set: function (value) {
                this._convStateSoft.userText = value;
            }
        },

        _checkClosedInLive: function () {
            this.closedInLive = this.sharedState.isInFullLive && !this._chatOpenInLive;
            this._updateChatlogTabIndex();
        },

        _isLiveIdentityPSTN: function () {
            if (!this._conversation || !this._conversation.partner) {
                return false;
            }
            var liveIdentity = this._conversation.partner.getStrProperty(LibWrap.PROPKEY.participant_LIVE_IDENTITY);
            var type = lib.getContactType(liveIdentity);
            return [LibWrap.Contact.type_PSTN, LibWrap.Contact.type_FREE_PSTN, LibWrap.Contact.type_UNDISCLOSED_PSTN].contains(type);
        },

        _onConversationStateChanged: function (state) {
            switch (state) {
                case Skype.UI.Conversation.State.CHAT:
                    this.CQFF && this._showCallQualityRate();
                    this.CQFF = false;
                    break;
                case Skype.UI.Conversation.State.LIVE:
                    this.CQFF = true;
                    this.isLiveIdentityPSTN = this._isLiveIdentityPSTN();
                    break;
            }

            if (this.sharedState.isInFullLive) {
                this._noCallRateAsWeSpawned = false;
            }

            this._checkClosedInLive();
        },

        _updateChatlogTabIndex: function () {
            
            if (this.closedInLive) {
                if (this.chatLogTabIndex !== -1) {
                    this._chatLogDataTabIndex = this.chatLogTabIndex;
                }
                this.chatLogTabIndex = -1;
            } else {
                if (this._chatLogDataTabIndex) {
                    this.chatLogTabIndex = this._chatLogDataTabIndex; 
                }
            }
        },

        _updateNoMessages: function () {
            this.noMessageslaceholder = "chatlog_placeholder".translate(this._conversation.getDisplayNameHtml());
        },

        _updateRequestPanel: function () {
            this.resendRequestText = "authrequest_not_accepted_yet".translate(this._conversationWrapper.name);
        },

        _getCallQualityRatingToken: function () {
            var token;

            if (this.sharedState.isDialog) {
                if (this.sharedState.isPstnContact) {
                    token = callQualityTokens.QUALITY_SO;
                } else {
                    token = callQualityTokens.QUALITY_S2S;
                }
            } else {
                if (this.sharedState.hasEverBeenVideoCall) {
                    token = callQualityTokens.QUALITY_MPV;
                } else {
                    token = callQualityTokens.QUALITY_GAC;
                }
            }

            return token;
        },

        _provideRating: function (ratingType, rating) {
            var token = this._getCallQualityRatingToken();
            this._conversation.provideLiveSessionQualityFeedback(token, ratingType, rating, "", "");
            log("ChatVM._provideRating token={0} rating={1} ratingType={2}".format(token, rating, ratingType));
        },

        _sendCallQualityRating: function (event) {
            this._provideRating(ratingType.RANDOM_RATING, event.detail.rating - 1);
        },

        _sendCallQualityRatingCancelled: function (event) {
            var ratingCancelledValue = 0;
            this._provideRating(ratingType.CANCEL_RATING, ratingCancelledValue);
        },

        _onMessageSent: function () {
            this._chatLog.scrollToBottom(); 
        },

        _onInputTextChanged: function (event) {
            this._userText = event.detail.userText;
        },

        _shouldShowRandomCallQualityFeedback: function () {
            return Math.random() <= 0.1;
        },

        _shouldShowCallQualityFeedback: function () {
            var should = false;

            if (this.sharedState.isDialog) {
                if (this.sharedState.isPstnContact || this.isLiveIdentityPSTN) {
                    should = true;
                } else {
                    should = this._shouldShowRandomCallQualityFeedback();
                }
            } else {
                if (!this._noCallRateAsWeSpawned) {
                    should = this._shouldShowRandomCallQualityFeedback();
                }
            }

            return should;
        },

        _showCallQualityRate: function () {
            if (this._shouldShowCallQualityFeedback()) {
                log("ChatVM._showCallQualityRate");
                this._chatLog.rateCallQuality();
            }
        },

        _editMessageRequested: function (event) {
            var edit = event.detail.edit,
                id = event.detail.id,
                text = event.detail.text;

            if (!edit) {
                
                this._onMessageEdited(false);
                return;
            }

            
            if (!id) {
                var lastMessage = this._chatLog.getLastEditableMessage();
                if (lastMessage) {
                    id = lastMessage.id;
                    text = lastMessage.text;
                }
            }

            if (id) {
                
                this._chatInput.editMessage(id, text);
                this._onMessageEdited(true);
            }
        },

        _onMessageEdited: function (isEditingMessage) {
            this.isEditingMessage = isEditingMessage;
        },

        _handleSpawnConference: function (e) {
            
            var objID = e.detail[0];
            var newConversation = lib.getConversation(objID);
            var liveStatus = newConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (![LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE].contains(liveStatus)) {
                this._noCallRateAsWeSpawned = true;
            }
        },

        _initEvents: function () {
            this.regEventListener(this._chatLog, Skype.UI.Conversation.ChatLog.Events.CallRatingSelected, this._sendCallQualityRating.bind(this));
            this.regEventListener(this._chatLog, Skype.UI.Conversation.ChatLog.Events.CallRatingCancelled, this._sendCallQualityRatingCancelled.bind(this));
            this.regEventListener(this._chatInput.viewModel, Skype.ViewModel.ChatInputVM.Events.MessageSent, this._onMessageSent.bind(this));
            this.regEventListener(this._chatInput.viewModel, Skype.ViewModel.ChatInputVM.Events.InputTextChanged, this._onInputTextChanged.bind(this));
            this.regEventListener(this._chatLog, Skype.UI.Conversation.Chat.Events.EditMessageRequested, this._editMessageRequested);
            this.regEventListener(this._chatInput, Skype.UI.Conversation.Chat.Events.EditMessageRequested, this._editMessageRequested);
            this.regEventListener(this._chatInput, Skype.UI.Conversation.Textarea.Events.TextEdited, this._onMessageEdited.bind(this, false));
            this.regEventListener(this._conversation, "spawnedconference", this._handleSpawnConference.bind(this));

            this.regBind(this.sharedState, "state", this._onConversationStateChanged.bind(this));
            this.regBind(this.sharedState, "name", this._onConversationNameChanged.bind(this));
        },

        _setCanResendRequest: function () {
            if (this.sharedState.isLyncContact) { 
                this.canResendRequest = this._peer && this._lyncContactHasFailedRequest();
                return;
            }
            this.canResendRequest = this._peer && this._peer.hasPendingAuthorization;
        },

        _lyncContactHasFailedRequest: function () {
            return !this._peer.hasAuthorizedMe && this._peer.isBuddy;
        },

        _onPendingAuthorizationChanged: function (hasPendingAuthorization) {
            if (!hasPendingAuthorization) { 
                this._setCanResendRequest();
            }
        },

        
        _getAria: function (aria) {
            if (this.buddyStatusClass !== "notAuthorizedWithRequest".toUpperCase()) {
                aria += " " + 'authrequest_add_to_contacts'.translate();
            }
            return aria;
        },

        _onConversationNameChanged: function () {
            this._updateRequestPanel();
            this._updateNoMessages();
        },

        
        init: function (chatLog, chatInput) {
            this._chatLog = chatLog;
            this._chatInput = chatInput;

            this._initEvents();

            var contactWrapper = this._conversationWrapper.contact;
            if (contactWrapper) {
                this.requestContactName = "authrequest_not_contact".translate(this._conversationWrapper.contact.name);
                if (this.sharedState.isSkypeContact || this.sharedState.isLyncContact) {
                    this.regBind(contactWrapper, "hasPendingAuthorization", this._onPendingAuthorizationChanged.bind(this));
                    this.regBind(contactWrapper, "buddyStatus", this._onBuddyStatusChange.bind(this));
                }
            }
        },

        _onBuddyStatusChange: function (newValue) {
            this.buddyStatusClass = newValue.toUpperCase();
        },

        onChatPossitionInLiveChanged: function (chatOpenInLive) {
            this._chatOpenInLive = chatOpenInLive;
            this._checkClosedInLive();
        },

        onShow: function () {
            this._setCanResendRequest();
        },

        
        sendAuthRequest: function () {
            var contact = this._peer;
            if (this.sharedState.isLyncContact) {
                var result = contact.libContact.setBuddyStatus(true, true);
                if (result) {
                    result = contact.libContact.sendAuthRequest('', 0);
                    if (!result) {
                        log("sending lync auth request was NOT successfull!");
                    }
                }
            } else {
                Actions.invoke("createSendAuthRequestAction", [this.sharedState.identity], { name: contact.nonHtmlName, avatarUri: contact.avatarUri, libContact: contact.libContact });
            }
        }
    }, { 

        
        closedInLive: false,
        canResendRequest: false,
        isEditingMessage: false,

        
        requestContactName: {
            get: function () {
                return this._requestContactName;
            },

            set: function (value) {
                if (value !== this._requestContactName) {
                    this._requestContactName = value;
                    
                    this.buddyStatusAria = this._getAria(value);
                }
            }
        },
        noMessageslaceholder: "",
        resendRequestText: "",
        chatLogTabIndex: 8,
        buddyStatusClass: {
            get: function () {
                return this._buddyStatusClass;
            },

            set: function (value) {
                if (value !== this._buddyStatusClass) {
                    this._buddyStatusClass = value;
                    
                    this.buddyStatusAria = this._getAria(this.requestContactName);
                }
            }
        },

        buddyStatusAria: ""

    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ChatVM: WinJS.Class.mix(chatVM, Skype.Class.disposableMixin)
    });

}());