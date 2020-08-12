

(function () {
    "use strict";

    var LIVE_WAITING_TIMEOUT = 20e3, 
        ENDING_LIVE_TIMEOUT = 500,
        ERROR_SCREEN_TIMEOUT_IN_MS = 3e3,
        callErrorsMap = Skype.UI.Conversation.CallErrorsMap,
        STATE = Skype.UI.Conversation.State,
        FORCED_LIB_CHANGE_STATES = {};

    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY] = STATE.LIVE_HOLD_LOCAL;
    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY] = STATE.LIVE_HOLD_REMOTE;
    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_IM_LIVE] = STATE.LIVE;
    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME] = STATE.INCOMMING_CALL;
    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE] = STATE.CHAT_CAN_JOIN;
    FORCED_LIB_CHANGE_STATES[LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL] = STATE.CHAT; 

    var conversationStateMachine = WinJS.Class.define(
        function conversationStateMachine_constructor(conversation, conversationSharedState, goDirectlyToLive) {
            this._conversation = conversation;
            this._conversationIdentity = conversation.getIdentity();
            this._conversationSharedState = conversationSharedState;
            this._onErrorSreenTimeoutEnd = this._onErrorSreenTimeoutEnd.bind(this);
            this._init(goDirectlyToLive);
        }, {
            _conversation: null,
            _conversationIdentity: null,
            _conversationSharedState: null,
            _preLiveModeTimer: null,
            _endingLiveTimer: null,
            _showingLiveErrorTimer: null,

            _shouldBeAlive: function (localLiveStatus) {
                return !([LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME,
                               LibWrap.Conversation.local_LIVESTATUS_NONE,
                               LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE,
                               LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE,
                               LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL].contains(localLiveStatus));
            },

            _checkLiveError: function () {
                var participantError = this._conversationSharedState.lastParticipantError;

                if (participantError && typeof callErrorsMap[participantError] !== 'undefined') {
                    log("ConversationStateMachine({0}) _checkLiveError start".format(this._conversationIdentity));
                    this._clearErrorStateTimer(); 
                    this._showingLiveErrorTimer = this.regTimeout(this._onErrorSreenTimeoutEnd, ERROR_SCREEN_TIMEOUT_IN_MS);
                    this._changeState(STATE.ERROR_IN_LIVE);
                    return true;
                }
                return false;
            },

            _onErrorSreenTimeoutEnd: function () {
                log("ConversationStateMachine({0}) _onErrorSreenTimeoutEnd".format(this._conversationIdentity));
                this.dispatchEvent(Skype.UI.Conversation.ConversationStateMachine.Events.ErrorScreenEnded);
                this._changeState(STATE.CHAT);
                this._clearErrorStateTimer();
            },

            
            _localStatusTransition: function (localLiveStatus, forceStatusChange) {
                log("ConversationStateMachine({0}) _localStatusTransition: status: {1}".
                    format(this._conversationIdentity, LibWrap.Conversation.local_LIVESTATUSToString(localLiveStatus)));

                
                if (FORCED_LIB_CHANGE_STATES[localLiveStatus]) {
                    this._clearErrorStateTimer(); 
                    this._clearConnectingStateTimer();
                    this._clearEndingStateTimer();
                    return FORCED_LIB_CHANGE_STATES[localLiveStatus];
                }

                var shouldBeAlive = this._shouldBeAlive(localLiveStatus);
                var state = this._conversationSharedState.state;

                if ([STATE.LIVE_ENDING, STATE.ERROR_IN_LIVE].contains(state) && !forceStatusChange) {
                    
                    return state;
                }

                switch (state) {
                    case STATE.CHAT:
                    case STATE.INCOMMING_CALL:
                    case STATE.CHAT_CAN_JOIN:
                        return shouldBeAlive ? STATE.PRE_LIVE : STATE.CHAT; 
                    case STATE.LIVE:
                    case STATE.PRE_LIVE:
                        if (localLiveStatus === LibWrap.Conversation.local_LIVESTATUS_STARTING) {
                            this._clearConnectingStateTimer(); 
                            return state;
                        }
                        break;
                }
                return shouldBeAlive ? STATE.PRE_LIVE : STATE.LIVE_ENDING;
            },

            _clearErrorStateTimer: function () {
                if (this._showingLiveErrorTimer !== null) {
                    this.unregTimeout(this._showingLiveErrorTimer);
                    this._showingLiveErrorTimer = null;
                }
            },

            _clearConnectingStateTimer: function () {
                if (this._preLiveModeTimer !== null) {
                    this.unregTimeout(this._preLiveModeTimer);
                    this._preLiveModeTimer = null;
                }
            },

            _clearEndingStateTimer: function () {
                if (this._endingLiveTimer !== null) {
                    this.unregTimeout(this._endingLiveTimer);
                    this._endingLiveTimer = null;
                }
            },

            _registerConnectingStateTimer: function () {
                
                this._clearConnectingStateTimer();
                this._preLiveModeTimer = this.regTimeout(function () {
                    log("ConversationStateMachine: PRELIVE timeout");
                    if (this._conversationSharedState.state === STATE.PRE_LIVE) {
                        var localLiveStatus = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                        
                        if (localLiveStatus !== LibWrap.Conversation.local_LIVESTATUS_STARTING) {
                            this.dispatchEvent(Skype.UI.Conversation.ConversationStateMachine.Events.PreLiveTimeout);
                            this.forceChat();
                            Skype.UI.Util.sendEvent("preLiveEnded");
                        }
                    }
                }.bind(this), LIVE_WAITING_TIMEOUT);
            },

            _registerEndingStateTimer: function () {
                
                this._clearEndingStateTimer();
                this._endingLiveTimer = this.regTimeout(function () {
                    log("ConversationStateMachine: _endingLiveTimer timeout");
                    
                    if (Skype.Application.state.view.isOnLockScreen) {
                        
                        
                        
                        this._changeState(STATE.PRE_LIVE);
                    } else {
                        this._changeState(STATE.CHAT);
                    }
                    this._endingLiveTimer = null;
                    
                }.bind(this), ENDING_LIVE_TIMEOUT);
            },

            _isStateChangePermited: function (newState) {
                var currentState = this._conversationSharedState.state;

                if (newState === currentState ||
                    (newState === STATE.INCOMMING_CALL && [STATE.PRE_LIVE, STATE.LIVE].contains(currentState)) || 
                    (newState === STATE.PRE_LIVE && Skype.UI.Conversation.isLiveState(currentState)) || 
                    (Skype.Application.state.view.isOnLockScreen && [STATE.INCOMMING_CALL, STATE.CHAT].contains(newState))) { 
                    return false;
                }
                return true;
            },

            _handleStateChanged: function (newState) {
                switch (newState) {
                    case STATE.PRE_LIVE:
                        this._registerConnectingStateTimer();
                        break;
                    case STATE.LIVE:
                        this._conversationSharedState.lastParticipantError = 0;
                        break;
                    case STATE.LIVE_ENDING:
                        var hasError = false;
                        if (this._conversationSharedState.isDialog) {
                            hasError = this._checkLiveError();
                        }
                        if (!hasError) {
                            this._registerEndingStateTimer();
                        }
                        break;
                }

                if (newState !== STATE.PRE_LIVE) {
                    this._clearConnectingStateTimer();
                }
            },

            _changeState: function (newState) {
                if (!this._isStateChangePermited(newState)) {
                    return;
                }

                log("ConversationStateMachine({0}) changingState: {1} -> {2}".
                    format(this._conversationIdentity, Skype.UI.Conversation.translateStateToClassName(this._conversationSharedState.state),
                        Skype.UI.Conversation.translateStateToClassName(newState)));

                this.dispatchEvent(Skype.UI.Conversation.ConversationStateMachine.Events.BeforeStateChange, { state: newState });
                this._conversationSharedState.state = newState;
                this._handleStateChanged(newState);
            },

            _getLocalStateTransition: function (forceStatusChange) {
                var localLiveStatus = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                return this._localStatusTransition(localLiveStatus, forceStatusChange);
            },

            _handleConversationPropertyChange: function (e) {
                if (e.detail[0].indexOf(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS).returnValue) {
                    var newState = this._getLocalStateTransition(false);
                    this._changeState(newState);
                }
            },

            _onLockscreenStateChanged: function (isOnLockscreen) {
                if (this._isOnLockscreen && !isOnLockscreen) {
                    log("ConversationStateMachine({0}) leaving lockscreen".format(this._conversationIdentity));
                    
                    
                    var newState = this._getLocalStateTransition(true);
                    if (newState === STATE.LIVE_ENDING && !this._endingLiveTimer) {
                        newState = STATE.CHAT;  
                    }
                    this._changeState(newState);
                }
                this._isOnLockscreen = isOnLockscreen;
            },

            _handleParticipantPropertyChange: function (e) {
                var prop = e.detail[0];
                if (prop === LibWrap.PROPKEY.participant_LAST_LEAVEREASON) {
                    this._conversationSharedState.lastParticipantError = this._conversation.partner.getIntProperty(LibWrap.PROPKEY.participant_LAST_LEAVEREASON);
                }
            },

            _stateApplied: function (newState) {
                roboSky.write("Conversation,{0}".format(Skype.UI.Conversation.translateStateToClassName(newState)));
            },

            _init: function (goDirectlyToLive) {
                log("ConversationStateMachine({0}): _init".format(this._conversationIdentity));
                this._conversation.subscribePropChanges([LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS]);
                this.regEventListener(this._conversation, "propertieschanged", this._handleConversationPropertyChange.bind(this));
                this.regBind(Skype.Application.state.view, "isOnLockScreen", this._onLockscreenStateChanged.bind(this));
                this.regBind(this._conversationSharedState, "state", this._stateApplied.bind(this));
                if (this._conversation.partner) { 
                    this.regEventListener(this._conversation.partner, "propertychange", this._handleParticipantPropertyChange.bind(this));
                }

                var newState = this._getLocalStateTransition(false);

                if (goDirectlyToLive && !Skype.UI.Conversation.isLiveState(newState)) {
                    this.forcePreLive();
                } else {
                    this._changeState(newState);
                }
            },

            
            forcePreLive: function () {
                log("ConversationStateMachine: forcePreLive");
                this._changeState(STATE.PRE_LIVE);
            },

            forceChat: function () {
                log("ConversationStateMachine: forceChat");
                this._changeState(STATE.LIVE_ENDING);
            }
        }, {
            Events: {
                ErrorScreenEnded: "ErrorScreenEnded",
                BeforeStateChange: "BeforeStateChange",
                PreLiveTimeout: "PreLiveTimeout"
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationStateMachine: WinJS.Class.mix(conversationStateMachine, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());