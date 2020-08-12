

(function (Skype) {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.Chat");

    var chat = Skype.UI.Control.define(function () {
        this._init();
    }, {
        
        _container: null,
        _viewModel: null,
        _chatLogEl: null,

        
        _conversationWrapper: null,
        _sessionStateId: null,
        _userTextFromSessionCache: null,
        _conversationSharedState: null,

        
        _chatInput: null,
        _chatLog: null,

        
        _isRendered: false,

        _init: function () {
            this._conversationWrapper = this.options.conversationWrapper;
            this._conversationSharedState = this.options.conversationSharedState;
            this._sessionStateId = this.options.conversationSessionStateId;
            var convStateSoft = Skype.UI.softSessionState.conversations[this._sessionStateId];
            this._userTextFromSessionCache = typeof convStateSoft.userText !== 'undefined' ? convStateSoft.userText : '';
        },

        _initEvents: function () {
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
            
            this.regEventListener(this._chatLog, Skype.UI.Conversation.ChatLog.Events.IncomingMessageAdded, this._chatInput.notifyNewMessageAdded.bind(this._chatInput));
        },

        _onReady: function () {
            

            this._container = this.element.querySelector("div.chat");
            WinJS.Resources.processAll(this.element);
            this._initChildControls();

            this._renderChildControlsAsync().then(function () {
                this._isRendered = true;
            }.bind(this));

            this._viewModel = new Skype.ViewModel.ChatVM(this._conversationWrapper, this._sessionStateId, this._conversationSharedState);
            this._initEvents();

            WinJS.Binding.processAll(this.element, this._viewModel).then(function () {
                this._viewModel.init(this._chatLog, this._chatInput);
            }.bind(this));
        },

        _renderChildControlsAsync: function () {
            return this._chatInput.render().then(function () {
                return this._chatLog.render();
            }.bind(this));
        },

        _initChildControls: function () {
            var chatInputEl = this.element.querySelector("div.inputsContainer");
            this._chatLogEl = this.element.querySelector("div.chatLogContainer");

            this._chatInput = new Skype.UI.Conversation.ChatInput(chatInputEl, {
                sessionStateId: this._sessionStateId,
                conversationSharedState: this._conversationSharedState,
                userTextFromSessionCache: this._userTextFromSessionCache,
                conversationWrapper: this._conversationWrapper
            });
            this.addChildNode(this._chatInput);

            this._chatLog = new Skype.UI.Conversation.ChatLog(this._chatLogEl, {
                conversationSessionStateId: this._sessionStateId,
                conversationWrapper: this._conversationWrapper,
                conversationSharedState: this._conversationSharedState,
                templateProvider: Skype.UI.Conversation.TemplateProvider.instance
            });
            this.addChildNode(this._chatLog);
        },

        _onConversationShow: function () {
            this._viewModel.onShow();
        },

        
        renderAsync: function () {
            return WinJS.UI.Fragments.renderCopy("/controls/conversation/chat.html", this.element).then(this._onReady.bind(this));
        },

        reRenderMessages: function (participantIdentity) {
            if (this._chatLog) { 
                this._chatLog.reRenderMessages(participantIdentity);
            }
        },

        onKeyboardAnimationEnded: function () {
            
            
            
            if (this._isRendered && Skype.Application.state.keyboardOccludedRectangle) {
                this._chatLog.adjustScrollPositionOnKeyboardShow(); 
            }
        },

        updateTypingIndicator: function () {
            if (this._isRendered) {
                this._chatLog.updateTypingIndicator(); 
            }
        },

        onChatPossitionInLiveChanged: function (chatOpenInLive) {
            
            this._viewModel && this._viewModel.onChatPossitionInLiveChanged(chatOpenInLive);
            this._chatInput && this._chatInput.onChatPossitionInLiveChanged(chatOpenInLive);
            this._chatLog && this._chatLog.onChatPossitionInLiveChanged(chatOpenInLive);
        },

        onChatResized: function () {
            this._chatLog && this._chatLog.onChatResized();
        },

        onPreparingSendFileFailed: function (messageGuid, errorCode) {
            this._chatLog.onPreparingSendFileFailed(messageGuid, errorCode);
        },

        showSendMessagePlaceholder: function (files, messageGuid) {
            this._chatLog.showSendMessagePlaceholder(files, messageGuid);
        }
    }, {
        Events: {
            EditMessageRequested: "EditMessageRequested"
        }
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        Chat: WinJS.Class.mix(chat, Skype.Model.hierarchicalMixin)
    });

})(Skype);