

(function (Skype) {
    "use strict";

    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.ChatInput");

    var chatInput = Skype.UI.Control.define(function () {
        this._init();
    }, {
        
        _smsBtnMenuEl: null,

        
        viewModel: null, 
        initPromise: null,

        _init: function () {
            this.initPromise = new WinJS.Promise(function () { });
            this.viewModel = new Skype.ViewModel.ChatInputVM(this.options.conversationWrapper, this.options.sessionStateId, this.options.conversationSharedState);
        },

        _initTextareaControl: function (userTextFromSessionCache) {
            this._textareaControl = new Skype.UI.Conversation.Textarea(this.element.querySelector("div.inputs div.textbox textarea"), {
                text: userTextFromSessionCache || '',
                smileyElement: this.element.querySelector("div.inputs div.textbox .smiley")
            });
            this.addChildNode(this._textareaControl);
            this._textareaControl.init();
            
            
            this.regEventListener(this._textareaControl.element, "focus", this.viewModel.setAriaReadOnly.bind(this.viewModel, false));
        },

        _initSms: function () {
            this._messagingChannelBtn = this._messagingChannelBtn || this.element.querySelector("div.inputs div.channelButton .sms");
            this._messagingChannelMenu = new Skype.UI.PhoneListMenu(this._smsBtnMenuEl);
        },

        _registerEvents: function () {
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
            this.forwardEvent(this._textareaControl, Skype.UI.Conversation.Chat.Events.EditMessageRequested);
            this.forwardEvent(this._textareaControl, Skype.UI.Conversation.Textarea.Events.TextEdited);
        },

        _onReady: function () {
            this._smsBtnMenuEl = this.element.querySelector("div.smsBtnMenu");
            this._initTextareaControl(this.options.userTextFromSessionCache);
            this._registerEvents();

            WinJS.Resources.processAll(this.element);
            WinJS.Binding.processAll(this.element, this.viewModel).then(function () {
                this._initSms();
                this.viewModel.init(this._messagingChannelMenu, this._textareaControl, this._messagingChannelBtn);

                
                
                var parentElm = this.element.querySelector(".textbox .serverBasedChat"),
                    elm = parentElm && parentElm.querySelector("a");
                if (parentElm && elm) {
                    elm.tabIndex = parentElm.tabIndex;
                }

                this.initPromise.complete();
            }.bind(this));
        },

        _onConversationShow: function () {
            this.viewModel && this.viewModel.onShow();
        },

        
        render: function () {
            return WinJS.UI.Fragments.renderCopy("/controls/conversation/chatInput.html", this.element).then(this._onReady.bind(this));
        },

        onChatPossitionInLiveChanged: function (chatOpenInLive) {
            if (chatOpenInLive && this._textareaControl) {
                
                
                this._textareaControl._resizeAndKeybHidingHandler();
            }
        },
        
        notifyNewMessageAdded: function () {
            
            this.viewModel.setAriaReadOnly(true);
        },

        editMessage: function (messageId, messageText) {
            this._textareaControl.editMessage(messageId, messageText);
        },
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ChatInput: WinJS.Class.mix(chatInput, Skype.Model.hierarchicalMixin)
    });

})(Skype);
