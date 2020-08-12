

(function () {
    "use strict";

    var lockScreenCallVm = MvvmJS.Class.define(function lockScreenCallVm_constructor(conversationIdentity, callUI, answerType, appCoverHandler) {
        this._callUI = callUI;
        this._answerType = answerType;
        this._appCoverHandler = appCoverHandler;
        var conversation = lib.getConversationByIdentity(conversationIdentity);
        this._dismissCallUI = this._dismissCallUI.bind(this);
        this._assignConversation(conversation);
        this._initEvents();
    }, {
        
        _conversationIdentity: null,
        _conversation: null,
        _conversationWrapper: null,

        
        _callUI: null,
        _answerType: null,

        
        _isInCall: false,
        _endCallRequestedByUser: false,
        _answerCallRequested: false,

        NONLIVE_STATUSES: [LibWrap.Conversation.local_LIVESTATUS_NONE, LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE],

        _initEvents: function () {
            Skype.Application.Suspending.regHandler(this, this._dismissCallUI);
            this.regEventListener(this._callUI, "endrequested", this._onEndCallRequest.bind(this));
            this.regEventListener(this._callUI, "closed", this._onClose.bind(this));
            this.regEventListener(document, "preLiveEnded", this._dismissCallUI);
            this.regBind(Skype.Application.state.focusedConversation, "state", this._onConversationStateChanged.bind(this));
        },

        _assignConversation: function (conversation) {
            if (this._conversation) {
                log("LockScreenCall: disposing previous conversation '{0}'".format(this._conversationIdentity));
                this.unregObjectEventListeners(this._conversation);
                this._conversation.discard();
            }

            this._conversation = conversation;
            this._conversationIdentity = conversation.getIdentity();
            log("LockScreenCall: _assignConversation '{0}'".format(this._conversationIdentity));

            this._conversationWrapper = Skype.Model.ConversationFactory.createConversation(conversation);
            this.regBind(this._conversationWrapper, "name", this._onConversationNameChanged.bind(this));

            this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS]);
            this.regEventListener(this._conversation, "propertieschanged", this._onLiveStatusChange.bind(this));
            this.regEventListener(this._conversation, "spawnedconference", this._handleSpawnConference.bind(this));
        },

        _onConversationNameChanged: function (name) {
            log("LockScreenCall: _onConversationNameChanged='{0}'".format(name));
            if (this._callUI) {
                this._callUI.callTitle = name;
            }
        },


        _dismissCallUI: function () {
            if (this._callUI) {
                log("LockScreenCall: dismiss callUI '{0}'".format(this._conversationIdentity));
                this._callUI.dismiss();
                this._callUI = null;
            } else {
                log("LockScreenCall: dismiss callUI couldn't be executed !");
            }
        },

        _handleSpawnConference: function (e) {
            log("LockScreenCall: _handleSpawnConference");
            var objID = e.detail[0];
            var newConversation = lib.getConversation(objID);
            if (newConversation) {
                this._assignConversation(newConversation);
                var liveStatus = newConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                if (!this.NONLIVE_STATUSES.contains(liveStatus)) { 
                    Actions.invoke("focusConversation", [this._conversationIdentity], { goDirectlyToLive: true });
                }
            }
        },

        _onEndCallRequest: function (args) {
            log("LockScreenCall: onEndCallRequested '{0}'".format(this._conversationIdentity));
            this._endCallRequestedByUser = true;
            this._answerCallRequested = false;
            this._tryToEndCall();
        },

        _onLiveStatusChange: function () {
            var status = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            log("LockScreenCall: onLiveStatusChange '{0}' '{1}'".format(this._conversationIdentity, LibWrap.Conversation.local_LIVESTATUSToString(status)));

            if (this.NONLIVE_STATUSES.contains(status)) {
                log("LockScreenCall: call hangup '{0}'".format(this._conversationIdentity));
                
                this._dismissCallUI();
            } else if (!this._endCallRequestedByUser) {
                
                this._tryAnswerCall();
            }
        },

        _onDispose: function () {
            log("LockScreenCall: _onDispose '{0}'".format(this._conversationIdentity));
            Skype.Application.Suspending.unregHandler(this, this._dismissCallUI);
            this._conversation.discard();
            this._conversation = null;
        },

        _onClose: function () {
            log("LockScreenCall: closing and disposing '{0}'".format(this._conversationIdentity));
            Skype.Application.state.view.isOnLockScreen = false;
            Skype.ViewModel.LockScreenCall.activatedConversationId = null;
            this.regImmediate(this.dispose.bind(this));
        },

        _tryAnswerCall: function () {
            log("LockScreenCall: trying to join live session '{0}'".format(this._conversationIdentity));

            if (this._isInCall) {
                log("LockScreenCall: already in the call '{0}'".format(this._conversationIdentity));
                return;
            }

            var isVideoCall = this._answerType === "video";
            this._isInCall = Actions.invoke(isVideoCall ? "answerVideo" : "answer", this._conversationIdentity);
        },

        _tryToEndCall: function () {
            if (!this._conversation) {
                log("LockScreenCall: _tryToEndCall - couldn't end call as conversation is null");
                return;
            }

            var status = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
            if (this.NONLIVE_STATUSES.contains(status)) {
                log("LockScreenCall: _tryToEndCall - skipping as conversation has already ended '{0}'".format(this._conversationIdentity));
            } else if (status === LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME) {
                Actions.invoke("reject", [this._conversationIdentity]);
            } else {
                var result = Actions.invoke("hangup", [this._conversationIdentity]);
                if (!result) {
                    log("LockScreenCall: _tryToEndCall - Couldn't properly hangup call trying to force hang up '{0}'".format(this._conversationIdentity));
                    this._conversation.leaveLiveSession(false);
                }
            }
        },

        _onConversationStateChanged: function (state) {
            log("LockScreenCall('{0}'): _onConversationStateChanged({1}) state: '{2}' | FLAGS: {3} {4}".format(
                this._conversationIdentity, Skype.Application.state.focusedConversation.identity, Skype.UI.Conversation.translateStateToClassName(state),
                this._answerCallRequested, Skype.Application.state.view.isOnLockScreen));

            if (this._answerCallRequested && Skype.Application.state.view.isOnLockScreen &&  
                Skype.UI.Conversation.isLiveState(state) && 
                this._conversationIdentity == Skype.Application.state.focusedConversation.identity) {
                this._tryAnswerCall(); 
                this._answerCallRequested = false;
                this._navigationCompleted();
            }
        },

        _navigationCompleted: function () {
            log("LockScreenCall: _navigationCompleted");

            
            
            this._appCoverHandler.hideAPPCover();
        },


        
        answerCall: function () {
            log("LockScreenCall: answerCallAsync {0} call '{1}'".format(this._answerType, this._conversationIdentity));
            log('LockScreenCall: answerCallAsync screen - viewstate: {0}, dimensions: {1}x{2}'.format(Skype.UI.Util.getCurrentViewStateName(), document.body.offsetWidth, document.body.offsetHeight));

            Skype.Application.state.view.isOnLockScreen = true;
            this._answerCallRequested = true;

            var result = Actions.invoke("focusConversation", [this._conversationIdentity], { goDirectlyToLive: true });
            if (!result) {
                log("LockScreenCall: ERROR focusConversation failed !");
                this._navigationCompleted(); 
            }
            return WinJS.Promise.as();
        }
    });

    var activatedConversationId = null;

    WinJS.Namespace.define("Skype.ViewModel", {
        LockScreenCallVM: WinJS.Class.mix(lockScreenCallVm, Skype.Class.disposableMixin),
        LockScreenCall: {
            activatedConversationId: activatedConversationId
        }
    });

}());