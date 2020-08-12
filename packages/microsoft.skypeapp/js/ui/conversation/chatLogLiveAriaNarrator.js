

(function () {
    "use strict";

    var SINGLE_MESSAGE_INTERVAL = 1e3; 
    var BATCH_MESSAGES_INTERVAL = 10e3; 

    var chatLogLiveAriaNarrator = WinJS.Class.define(
        function chatLogLiveAriaNarrator_constructor() {
            this._messagesIds = [];
            this._playMessagesCallback = this._playMessagesCallback.bind(this);
            this._playSingleMessageCallback = this._playSingleMessageCallback.bind(this);
        }, {

            _messagesIds: null,
            _singleMessageTimeout: null,
            _batchMessagesTimeout: null,

            _sendEvent: function () {
                if (this._messagesIds.length > 0) {
                    this.dispatchEvent(chatLogLiveAriaNarrator.Events.ReadNewMessages, { messageIds: this._messagesIds });
                    this._messagesIds.clear();
                }
            },

            _playSingleMessageCallback: function () {
                this._sendEvent();               
                this._singleMessageTimeout = null;
            },

            _playMessagesCallback: function () {
                this._sendEvent();
                this._batchMessagesTimeout = null;
            },

            
            onNewMessageArrived: function (messageId) {
                
                
                
                
                
                

                if (this._batchMessagesTimeout === null && this._singleMessageTimeout === null) {
                    
                    
                    this._singleMessageTimeout = this.regTimeout(this._playSingleMessageCallback, SINGLE_MESSAGE_INTERVAL);
                    this._batchMessagesTimeout = this.regTimeout(this._playMessagesCallback, BATCH_MESSAGES_INTERVAL);
                } else if (this._singleMessageTimeout !== null) {
                    
                    
                    this.unregTimeout(this._singleMessageTimeout);
                    this._singleMessageTimeout = null;
                }

                this._messagesIds.push(messageId);
            },
        }, {
            Events: {
                ReadNewMessages: "ReadNewMessages"
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ChatLogLiveAriaNarrator: WinJS.Class.mix(chatLogLiveAriaNarrator, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());