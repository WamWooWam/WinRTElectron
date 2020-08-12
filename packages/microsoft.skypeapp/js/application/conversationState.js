

(function () {
    "use strict";

    var DIRECTLY_LINKED_PROPS = ["immersiveMode", "state", "isVideoCall", "isChatOpenInLive", "isInFullLive"],
        STATE = Skype.UI.Conversation.State;

    var conversationState = MvvmJS.Class.define(function () {
    }, {

        _conversationSharedState: null,

        _resetConversationState: function () {
            this.identity = null;
            this.unregObjectBinds(this._conversationSharedState);
            this._conversationSharedState = null;
            this.state = -1;
        },

        _setBindConnections: function (conversationSharedState) {
            this.unregObjectBinds(this._conversationSharedState);
            DIRECTLY_LINKED_PROPS.forEach(function (property) {
                this.regBind(conversationSharedState, property, function (value) { 
                    this[property] = value;
                }.bind(this));
            }.bind(this));
        },

        
        setConversationSharedState: function (conversationDataState) {
            if (!conversationDataState) {
                this._resetConversationState();
                return;
            }

            log("Skype.Application.ConversationState setConversationSharedState('{0}')".format(conversationDataState.identity));
            this._conversationSharedState = conversationDataState;
            this.identity = conversationDataState.identity;
            this._setBindConnections(conversationDataState);
        },
    }, {

        
        identity: null,

        
        immersiveMode: false,

        
        state: -1,

        
        isVideoCall: false,

        
        isChatOpenInLive: false,

        
        isInFullLive: false,
    });

    WinJS.Namespace.define("Skype.Application", {
        ConversationState: conversationState
    });

}());
