

(function () {
    "use strict";

    var STATE = Skype.UI.Conversation.State,
        VIDEO_PERMISSION = {
            UNDECIDED: 0,
            ACCEPTED: 1,
            DECLINED: 2,
            DECIDING: 3
        };

    var conversationSharedState = MvvmJS.Class.define(
        function conversationSharedState_constructor(options, conversationSoftState) {
            this.identity = options.id;
            this._conversationSoftState = conversationSoftState;
            this.regEventListener(this, "propertychanged", this._logChanges.bind(this));
            this.dispose = function () { }; 
        }, {
            _logChanges: function (evt) {
                var propertyName = evt.detail;
                log("ConversationSharedState[{0}] {1}: {2}".format(this.identity, propertyName, this[propertyName]));
            },

            
            identity: null,
            _state: STATE.CHAT, 
            _acceptIncomingVideos: VIDEO_PERMISSION.UNDECIDED,
            _isInFullLive: false,
            _conversationSoftState: null,

            isIncomingCallRinging: {
                get: function () {
                    return this.state === STATE.INCOMMING_CALL;
                }
            },

            hasEverBeenVideoCall: false,

        }, { 

            
            name: "",

            
            isEmergencyContact: false,

            
            isPstnOnly: false,

            
            isDialog: true,

            
            isPstnContact: false,

            
            isEchoService: false,

            
            isMessengerContact: false,

            
            isLyncContact: false,

            
            isSkypeContact: false,

            
            immersiveMode: false,

            
            isBlocked: false,

            
            isMember: true,

            
            isVideoCall: false,

            
            isScreenShare: false,

            
            
            isChatOpenInLive: false,

            
            acceptIncomingVideos: {
                get: function () {
                    return this._acceptIncomingVideos;
                },
                set: function (value) {
                    if (value !== this._acceptIncomingVideos) {
                        this._acceptIncomingVideos = value;
                        this._conversationSoftState.acceptIncomingVideos = value;
                    }
                }
            },

            
            layout: -1,

            
            state: {
                get: function () {
                    return this._state;
                },

                set: function (value) {
                    if (value !== this._state) {
                        var isInFullLive = Skype.UI.Conversation.isLiveState(value);
                        if (this._isInFullLive !== isInFullLive) {
                            this._isInFullLive = isInFullLive;
                            this.notify("isInFullLive");
                        }
                        this._state = value;
                    }
                }
            },

            
            isInFullLive: {
                get: function () {
                    return this._isInFullLive;
                } 
            },

            
            lastParticipantError: null,
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ConversationSharedState: conversationSharedState,
        VIDEO_PERMISSION: VIDEO_PERMISSION
    });

}());