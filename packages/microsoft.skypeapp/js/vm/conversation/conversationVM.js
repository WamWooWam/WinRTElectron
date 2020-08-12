

(function () {
    "use strict";

    var STATE = Skype.UI.Conversation.State;

    var conversationVM = MvvmJS.Class.define(function (conversationSharedState, conversationWrapper, conversationStateMachine, goDirectlyToLive) {
        this._conversationIdentity = conversationWrapper.identity;
        this._conversation = conversationWrapper.libConversation;
        this._conversationWrapper = conversationWrapper;
        this._conversationStateMachine = conversationStateMachine;
        this.sharedState = conversationSharedState;
        this.sharedState.name = this._conversationWrapper.name; 
        this._peer = this._conversationWrapper.isDialog ? this._conversationWrapper.contact : null;
        this._participants = [];
        this._onSuspend = this._onSuspend.bind(this);
        this.sharedState.isDialog = this._conversationWrapper.isDialog;

        this._blockingInit(); 
    }, {
        
        _conversationIdentity: null,
        _conversationWrapper: null,
        _conversation: null,
        _peer: null,
        _participants: null,

        
        _liveConversation: null,
        _chat: null,
        _profileInfo: null,
        sharedState: null,
        _conversationStateMachine: null,

        
        _isActive: false,
        _eventsRegistered: false,

        
        _participantsAvatarHandlers: null,
        _avatarSubscription: null,
        _state: 0,

        _handleDissmisLiveConversation: function () {
            Actions.invoke("stopVideo", this._conversationIdentity);  
            this._conversationStateMachine.forceChat();
        },

        _updateChatVisiblity: function () {
            this.hideChat = Skype.Application.state.view.isVertical && this.sharedState.state === STATE.INCOMMING_CALL;
        },

        _updateIsBlocked: function (isBlocked) {
            this.sharedState.isBlocked = isBlocked;
        },

        _onMembershipChanged: function () {
            this.sharedState.isMember = this._conversationWrapper && this._conversationWrapper.libConversation.myself;
            if (!this.sharedState.isMember) {
                roboSky.write("Conversation,leaveGroup");
            }
        },

        _onOrientation: function () {
            this._updateChatVisiblity();
        },

        _onLiveConversationFragmentRendered: function () {
            log('liveConversation fragment render end');
            this._registerLiveConversationEvents();
        },

        _renderLiveConversationFragment: function () {
            log('liveConversation fragment render begin');
            if (!this._liveConversationFragmentRendering) {
                this._liveConversationFragmentRendering = true;
                this._liveConversation.render().then(this._onLiveConversationFragmentRendered.bind(this));
            }
        },

        _hideAllFlyouts: function () {
            WinJS.UI._Overlay._hideAllFlyouts(); 
        },

        _updateConsumptionHorizon: function () { 
            if (this._isActive) { 
                this._conversationWrapper.markAsRead();
            }
        },

        _handleConversationPropertyChange: function (e) { 
            log("conversation handleConversationPropertyChange() ({0})".format(this._conversationIdentity));
            if (e.detail[0].indexOf(LibWrap.PROPKEY.conversation_INBOX_MESSAGE_ID).returnValue) {
                this._updateConsumptionHorizon();
            }
        },

        _initStaticTypeClasses: function () {
            var contactWrapper = this._conversationWrapper.contact;
            this.sharedState.isEmergencyContact = this.sharedState.isDialog && contactWrapper.isEmergencyContact;
            this.sharedState.isPstnOnly = this._conversationWrapper.isPstnOnly;
            this.sharedState.isEmergencyContact = this.sharedState.isDialog && contactWrapper.isEmergencyContact;
            this.sharedState.isPstnContact = this.sharedState.isDialog && contactWrapper.isPstnContact;
            this.sharedState.isEchoService = this.sharedState.isDialog && contactWrapper.isEchoService;
            this.sharedState.isMessengerContact = this.sharedState.isDialog && contactWrapper.isMessengerContact;
            this.sharedState.isLyncContact = this.sharedState.isDialog && contactWrapper.isLyncContact;
            this.sharedState.isSkypeContact = this.sharedState.isDialog && contactWrapper.isSkypeContact; 
        },

        _checkChatPositionInLive: function () {
            
            this._chat && this._chat.onChatPossitionInLiveChanged(this.sharedState.isChatOpenInLive); 
        },

        _sendFiles: function () {
            var promise = Actions.invoke("sendFilesAction", [this._conversationIdentity]);
            if (promise) {
                promise.then(null,
                    function (args) {
                        this._chat.onPreparingSendFileFailed(args.messageGuid, args.errorCode);
                    }.bind(this),
                    function (args) {
                        if (args && args.files && args.messageGuid) {
                            this._chat.showSendMessagePlaceholder(args.files, args.messageGuid);
                        }
                    }.bind(this));
            }
        },

        _handleSpawnConference: function (e) {
        	if (Skype.Application.state.view.isOnLockScreen) {
                return; 
            }
            var objID = e.detail[0];
            var newConversation = lib.getConversation(objID);
            if (newConversation) {
                var liveStatus = newConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                var nonActionableStates = [
                    LibWrap.Conversation.local_LIVESTATUS_NONE,
                    LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE,
                    LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME
                ];
                if (!nonActionableStates.contains(liveStatus)) {
                    Actions.invoke("focusConversation", [newConversation.getIdentity()], { goDirectlyToLive: true, acceptIncomingVideos: this.sharedState.acceptIncomingVideos });
                }
                newConversation.discard();
            }
        },

        _filesPickedCallback: function (args) {
            this._chat.showSendMessagePlaceholder(args.detail.files, args.detail.messageGuid);
        },

        _fileTransferErrorCallback: function (args) {
            this._chat.onPreparingSendFileFailed(args.detail.messageGuid, args.detail.errorCode);
        },

        _onSuspend: function () {
            Skype.EventNotification.Manager.instance.hide(this._getMicNotification());
            
            
            log("Hangup active call on application suspend for conversation " + this._conversationIdentity);
            this._conversation.leaveLiveSession(false); 
        },

        _removeParticipant: function (participant) {
            var partId = participant.getObjectID();
            this.unregObjectEventListeners(participant);
            this._participantsAvatarHandlers[partId].dispose();
            delete this._participantsAvatarHandlers[partId];
            participant.discard();
        },

        _handleParticipantAvatarChange: function (uri, identity) {
            this._chat && this._chat.reRenderMessages(identity); 
        },

        _updateTypingIndicator: function () {
            this._chat && this._chat.updateTypingIndicator(); 
        },

        _onDispose: function () {
            Skype.Application.Suspending.unregHandler(this, this._onSuspend);

            for (var i = 0, length = this._participants.length; i < length; i++) {
                this._removeParticipant(this._participants[i]);
            }
            this._participants.clear();
        },

        _handleParticipantPropertyChange: function (e) {
            var prop = e.detail[0];

            if (prop === LibWrap.PROPKEY.participant_TEXT_STATUS) {
                this._updateTypingIndicator(); 
            }
        },

        _addParticipant: function (participantId) {
            var newParticipant = lib.getParticipant(participantId);
            var identity = newParticipant.getStrProperty(LibWrap.PROPKEY.participant_IDENTITY);

            this._participantsAvatarHandlers[participantId] = Skype.Model.AvatarUpdater.instance.subscribe(identity, this._handleParticipantAvatarChange);
            this.regEventListener(newParticipant, "propertychange", this._handleParticipantPropertyChange.bind(this));
            this._participants.push(newParticipant);
        },

        _handleParticipantListChange: function () {
            var i, nParticipants = this._participants.length,
                nNewParticipants = this._conversation.participants.length,
                newParticipantsIds = [],
                currentParticipantsIds = [];

            this._participants = this._participants || [];
            this._participantsAvatarHandlers = this._participantsAvatarHandlers || {};

            for (i = 0; i < nNewParticipants ; i++) {
                newParticipantsIds.push(this._conversation.participants[i].getObjectID());
            }

            for (i = 0; i < nParticipants ; i++) {
                currentParticipantsIds.push(this._participants[i].getObjectID());
            }

            
            for (i = 0; i < this._participants.length; i++) { 
                if (!newParticipantsIds.contains(this._participants[i].getObjectID())) {
                    this._removeParticipant(this._participants[i]);
                    this._participants.removeAt(i--);
                    roboSky.write("Conversation,removeParticipant");
                }
            }

            
            for (i = 0; i < nNewParticipants ; i++) {
                if (!currentParticipantsIds.contains(newParticipantsIds[i])) {
                    this._addParticipant(newParticipantsIds[i]);
                }
            }

            this._updateTypingIndicator(); 
            this._onMembershipChanged();
        },

        _handleConversationWrapperPropertyChange: function (e) {
            log("ConversationVM _handleConversationWrapperPropertyChange(): " + e.detail);
            if (e.detail === "name") {
                this.sharedState.name = this._conversationWrapper.name;
            } 
        },

        _goDirectlyToLive: function () {
            this._conversationStateMachine.forcePreLive();
            this._displayRingingPanel(false);
            
            this._renderLiveConversationFragment();
        },

        _displayRingingPanel: function (show) {
            if (this.showingRingingPanel === show) {
                return;
            }

            this.showingRingingPanel = show;
            
            var goingToLive = this.sharedState.state == STATE.LIVE || this.sharedState.state == STATE.PRE_LIVE;
            this.dispatchEvent(conversationVM.Events.OnLiveRinging, { skipPanelAnimation: !show && goingToLive });
        },

        _checkNavigationToChat: function (newState, previousState) {
            var preventNavigationToChat = (newState === STATE.CHAT && Skype.UI.Conversation.isLiveState(previousState)) && 
                (this.sharedState.isEmergencyContact ||
                (this.sharedState.lastParticipantError === LibWrap.WrSkyLib.leave_REASON_LIVE_PSTN_INVALID_NUMBER &&
                !(this._peer && this._peer.isBuddy))); 

            if (preventNavigationToChat) {
                this.regImmediate(Skype.UI.navigate, "dialer", { number: this._conversationIdentity });
            }
        },

        _onConversationStateChanged: function (state) {

            switch (state) {
                case STATE.CHAT:
                    if (!this._eventsRegistered) {
                        break; 
                    }
                    this._hideAllFlyouts(); 
                    
                    
                    this.dispatchEvent(conversationVM.Events.OnLiveModeEnd);
                    break;
                case STATE.INCOMMING_CALL:
                    this._hideAllFlyouts();
                    break;
                case STATE.LIVE:
                    this.dispatchEvent(conversationVM.Events.OnLiveStart);
                    this._checkChatPositionInLive();
                    Skype.EventNotification.Manager.instance.hide(this._getMicNotification());
                    break;
                case STATE.PRE_LIVE:
                    this.dispatchEvent(conversationVM.Events.OnLiveStarting);
                    break;
            }

            this._displayRingingPanel(state === STATE.INCOMMING_CALL);
            if (state != STATE.CHAT) { 
                Skype.UI.EmoticonPicker && Skype.UI.EmoticonPicker.hide(); 
                this._renderLiveConversationFragment();
            }

            this._updateChatVisiblity();
            this._updateConversationWindowAriaLabel();
            this._checkNavigationToChat(state, this._state);

            this._state = state;
        },

        _updateConversationWindowAriaLabel: function () {
            if (this.sharedState.isInFullLive) {
                this.callConnectionWindowAriaLabel = "aria_call_connection_window_label".translate(this._conversationWrapper.name);
            } else {
                this.callConnectionWindowAriaLabel = "aria_conversation_window_label".translate(this._conversationWrapper.name);
            }
        },

        _blockingInit: function () {
            this._initStaticTypeClasses(); 
            this.regEventListener(this._conversationWrapper, "propertychanged", this._handleConversationWrapperPropertyChange.bind(this));
            this._handleParticipantAvatarChange = this._handleParticipantAvatarChange.bind(this);
            Skype.Application.Suspending.regHandler(this, this._onSuspend);
        },

        _registerLiveConversationEvents: function () {
            this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.DismissLiveConversation, this._handleDissmisLiveConversation.bind(this));
            this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.FilesPicked, this._filesPickedCallback.bind(this));
            this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.FileTransferError, this._fileTransferErrorCallback.bind(this));
        },

        _getMicNotification: function () {
            return {
                type: Skype.EventNotification.Manager.NotificationType.TWO_BUTTON_AND_TITLE,
                isTransient: false,
                isGlobal: true,
                context: "",
                aria: "aria_notification_notification".translate(),
                title: "notification_mic_error_header".translate(),
                text: "notification_mic_error_body".translate(),
                leftButtonLabel: "notification_mic_error_learn_more_button".translate(),
                rightButtonLabel: "notification_mic_error_dismiss_button".translate(),
                leftButtonAria: "aria_notification_mic_error_learn_more_button".translate(),
                rightButtonAria: "aria_notification_mic_error_dismiss_button".translate(),
                leftButtonHandler: function () {
                    Windows.System.Launcher.launchUriAsync(Windows.Foundation.Uri("https://www.skype.com/go/microphoneerror"));
                },
                rightButtonHandler: null
            };
        },

        _onErrorScreenEnded: function () {
            if (this.sharedState.lastParticipantError === LibWrap.WrSkyLib.leave_REASON_LIVE_RECORDING_FAILED) {
                var that = this;
                Skype.Permissions.getMicStatusAsync().done(function (status) {
                    if (status === Skype.Permissions.DevicesAccessStatuses.blocked) {
                        Skype.EventNotification.Manager.instance.show(that._getMicNotification());
                    }
                });
            }
        },

        _onBeforeConversationStateChanged: function (evt) {
            if (this._isActive) {
                var disableAppBarHint = Skype.UI.Conversation.isLiveState(evt.detail.state);
                Skype.UI.AppBarHint.setHintInConversation(disableAppBarHint);
            }
        },

        _initEvents: function () {
            this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_INBOX_MESSAGE_ID]);
            this.regEventListener(this._conversation, "propertieschanged", this._handleConversationPropertyChange.bind(this));
            this.regEventListener(this._conversation, "spawnedconference", this._handleSpawnConference.bind(this));
            this.regEventListener(this._conversation, "participantlistchange", this._handleParticipantListChange.bind(this));

            this._avatarSubscription = Skype.Model.AvatarUpdater.instance.subscribe(lib.myIdentity, this._handleParticipantAvatarChange); 

            this.regEventListener(this._profileInfo, Skype.UI.ConversationProfileInfo.Events.FilesPicked, this._filesPickedCallback.bind(this));
            this.regEventListener(this._profileInfo, Skype.UI.ConversationProfileInfo.Events.FileTransferError, this._fileTransferErrorCallback.bind(this)); 

            this.regBind(Skype.Application.state.view, "orientation", this._onOrientation.bind(this));
            this.regBind(this.sharedState, "state", this._onConversationStateChanged.bind(this));
            this.regBind(this.sharedState, "isChatOpenInLive", this._checkChatPositionInLive.bind(this));
            this.regBind(this._conversationWrapper, "isBlocked", this._updateIsBlocked.bind(this));

            this.regEventListener(this._conversationStateMachine, Skype.UI.Conversation.ConversationStateMachine.Events.ErrorScreenEnded, this._onErrorScreenEnded.bind(this));
            this.regEventListener(this._conversationStateMachine, Skype.UI.Conversation.ConversationStateMachine.Events.BeforeStateChange, this._onBeforeConversationStateChanged.bind(this));

            this._eventsRegistered = true;
        },

        
        init: function (chat, profileInfo, liveConversation) {
            log('ConversationVM: init()');
            this._chat = chat;
            this._profileInfo = profileInfo;
            this._liveConversation = liveConversation;

            this.callConnectionWindowAriaLabel = "aria_conversation_window_label".translate(this._conversationWrapper.name);
            this._initEvents();
            this._handleParticipantListChange();
        },

        onBeforeShow: function (goDirectlyToLive) {
            Skype.UI.AppBarHint.setHintInConversation(goDirectlyToLive || Skype.UI.Conversation.isLiveState(this.sharedState.state));
        },

        onShow: function (goDirectlyToLive) {
            this._isActive = true;
            if (goDirectlyToLive) {
                this._goDirectlyToLive();
            }

            Skype.UI.AppBar.instance.updateContext({ conversation: this._conversationWrapper });
            Skype.Application.state.focusedConversation.setConversationSharedState(this.sharedState);

            this._updateConsumptionHorizon();
        },

        onHide: function () {
            Skype.UI.AppBar.instance.updateContext();
            Skype.UI.PeoplePicker && Skype.UI.PeoplePicker.hide();
            Skype.Application.state.focusedConversation.setConversationSharedState(null);
            this._isActive = false;  
            
            this.sharedState.immersiveMode = false;
        },

        
        navigateBack: function () {
            Skype.UI.navigateBack();
        }

    }, { 

        
        hideChat: false, 
        showingRingingPanel: false,

        
        callConnectionWindowAriaLabel: ""
    }, {
        Events: {
            OnLiveModeEnd: "OnLiveModeEnd",
            OnLiveStart: "OnLiveStart",
            OnLiveStarting: "OnLiveStarting",
            OnLiveRinging: "OnLiveRinging",
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        ConversationVM: WinJS.Class.mix(conversationVM, WinJS.Utilities.eventMixin, Skype.Class.disposableMixin)
    });

}());