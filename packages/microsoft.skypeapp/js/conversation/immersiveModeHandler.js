

(function () {
    "use strict";

    var immersiveModeHandler = WinJS.Class.define(function (conversationSharedState, liveGroupConversation) {
        this._sharedState = conversationSharedState;
        this._liveConversation = liveGroupConversation;

        this._startImmersiveMode = this._startImmersiveMode.bind(this);

        this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.VideoCallChange, this._handleVideoCallChange.bind(this));
        this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.LiveConversationBlockImmersive, this._liveConvImmersiveBlockUnblockHandler.bind(this));
        this.regEventListener(this._liveConversation, Skype.UI.LiveGroupConversation.Events.UserInteractionInLive, this._handleUserInteractionInLive.bind(this));
        this.regEventListener(this._liveConversation, Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
        this.regEventListener(this._liveConversation, Skype.UI.Conversation.Events.ConversationHide, this._onConversationHide.bind(this));
        this.regEventListener(document, "keydown", this._onKeyDown.bind(this));

        this.regBind(this._sharedState, "isChatOpenInLive", this._onChatPositionChanged.bind(this));
        this.regBind(this._sharedState, "state", this._onStateChanged.bind(this));

        this.regEventListener(Skype.Application.state, "navigated", this._onNavigated.bind(this));
        this._onNavigated();
    },
    {
        _sharedState: null,
        _liveConversation: null,

        _videoRunning: false,
        _immersiveModeTimer: null,
        _immersiveStartBlockedByLiveConv: false,

        _canImmerse: { get: function () { return this._sharedState.state === Skype.UI.Conversation.State.LIVE || this._videoRunning; } },

        _onNavigated: function () {
            this._stopImmersiveModeTimer(); 
        },

        _onConversationShow: function () {
            this._setImmersiveModeTimer();
        },
        
        _onConversationHide: function () {
            this._stopImmersiveModeTimer();
        },

        _handleVideoCallChange: function (e) {
            this._videoRunning = e.detail.videoRunning;
            this._onStateChanged();
        },

        _onStateChanged: function () {
            if (!this._canImmerse) {
                this._stopImmersiveMode();
            } else {
                this._setImmersiveModeTimer();
            }
        },

        _handleUserInteractionInLive: function (evt) {
            if (this._canImmerse) {
                
                var isMouseMove = evt.detail.type === 'pointermove';
                if (this._sharedState.immersiveMode) { 
                    this._stopImmersiveMode();
                } else {
                    if (!isMouseMove && evt.detail.isImmersiveStarting) { 
                        this._startImmersiveMode();
                    } else if (isMouseMove || evt.detail.isImmersiveStopping) { 
                        this._setImmersiveModeTimer();
                    }
                }
            }
        },

        _onKeyDown: function (evt) {
            
            if (this._sharedState.immersiveMode && evt.keyCode === WinJS.Utilities.Key.tab) {
                evt.stopPropagation();
                evt.preventDefault();
            }
            this._stopImmersiveMode();
        },

        _liveConvImmersiveBlockUnblockHandler: function (evt) {
            var block = evt.detail.block;

            
            this._immersiveStartBlockedByLiveConv = block;
            if (!block && this._canImmerse) {
                this._setImmersiveModeTimer();
            }
        },

        _onChatPositionChanged: function () {
            if (this._sharedState.immersiveMode) {
                this._stopImmersiveMode();  
            }
        },

        _startImmersiveMode: function () {
            this._stopImmersiveModeTimer();

            if (!this._immersiveStartBlockedByLiveConv && !this._sharedState.immersiveMode && this._canImmerse) {
                this._sharedState.immersiveMode = true;
            }
        },

        _stopImmersiveMode: function () {
            this._sharedState.immersiveMode = false;
            
            this._setImmersiveModeTimer();
        },

        _setImmersiveModeTimer: function () {
            if (!this._sharedState.immersiveMode && this._canImmerse) {
                this._stopImmersiveModeTimer();
                this._immersiveModeTimer = this.regTimeout(this._startImmersiveMode, Skype.UI.Conversation.ImmersiveModeHandler.IMMERSIVE_TIMEOUT);
            }
        },
        
        _stopImmersiveModeTimer: function () {
            this._immersiveModeTimer && this.unregTimeout(this._immersiveModeTimer);
        },
    },
    {
        IMMERSIVE_TIMEOUT: 15000
    });


    WinJS.Namespace.define("Skype.UI.Conversation", {
        ImmersiveModeHandler: WinJS.Class.mix(immersiveModeHandler, Skype.Class.disposableMixin)
    });

}());