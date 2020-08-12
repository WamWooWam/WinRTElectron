

(function () {
    "use strict";

    var SUPPORTED_MESSAGE_TYPES = [LibWrap.Message.type_POSTED_TEXT, LibWrap.Message.type_POSTED_EMOTE, LibWrap.Message.type_POSTED_SMS, LibWrap.Message.type_POSTED_FILES];
    var TEXT_SIZE_CLASSES = ['TEXTSIZE1', 'TEXTSIZE2', 'TEXTSIZE3'];
    var BIG_EMOTICONS_CLASSES = ['bigEmoticons', 'bigEmoticons80'];


    var messageNotificationVM = MvvmJS.Class.define(function (conversation) {
            this._conversation = conversation;
            this._isDialog = this._conversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_DIALOG;
        }, {
            _conversation: null,
            _avatar: null,

            _notifQueue: [],
            _updateTimer: null,
            _hideTimer: null,

            _listening: false,
            _isDialog: true,

            
            _handleNewMessage: function(messageID) {
                var libMessage = lib.getConversationMessage(messageID);
                if (!libMessage) {
                    return;
                }

                var type = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);
                if (!Skype.Model.MessageFactory.isSupportedMessageType(type, SUPPORTED_MESSAGE_TYPES)) {
                    return;
                }
                var baseMessage = Skype.Model.MessageFactory.createMessage(libMessage);
                var message = {
                    id: baseMessage.id,
                    name: libMessage.getAuthorDisplayNameHtml(),
                    authorid: libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR),
                    message: type == LibWrap.Message.type_POSTED_FILES ? baseMessage.simpleDetails : baseMessage.details
                };

                if (lib.myIdentity == message.authorid) {
                    return;
                }

                this._notifQueue.push(message);
                if (!this._updateTimer) {
                    this._updateMessage();
                }
            },

            
            _updateMessage: function() {
                if (this._updateTimer) {
                    this.unregTimeout(this._updateTimer);
                    this._updateTimer = null;
                }

                if (this._notifQueue.length == 0) {
                    return;
                }

                
                while (this._notifQueue.length > Skype.ViewModel.MessageNotificationVM.MAX_MESSAGES_IN_PIPE) {
                    this._notifQueue.shift();
                }

                if (this._hideTimer) {
                    this.unregTimeout(this._hideTimer);
                }
                this._hideTimer = this.regTimeout(this._hide.bind(this), Skype.ViewModel.MessageNotificationVM.MESSAGE_SHOW_TIME);
                this._updateTimer = this.regTimeout(this._updateMessage.bind(this), Skype.ViewModel.MessageNotificationVM.MESSAGE_UPDATE_TIME);

                this._displayMessage(this._notifQueue[0]);

                this._notifQueue.shift();
            },

            _displayMessage: function (msg) {
                if (this._avatar) {
                    this._avatar.identity = msg.authorid;
                    this._avatar.updateAvatar();
                }

                var msgText = this._isDialog ? msg.message : msg.name + ": " + msg.message;

                this.visible = true;

                var isFromEmptyState = this.message === '';
                if (!isFromEmptyState) {
                    this.resetPulse = true; 
                }

                var textLen = msgText
                    .replace(/<span class="emoticon(.*?)"><span class="emoSprite">(.*?)<\/span><\/span>/gi, '<E>')
                    .replace(/<span class="flag(.*?)<\/span>/gi, '<F>')
                    .replace(/<br.*>/gi, ' ').trim().length;

                this.regTimeout(function () {
                    this.message = "";

                    if (textLen <= 6) { 
                        this.textSize = TEXT_SIZE_CLASSES[0];
                        this.bigEmoticons = BIG_EMOTICONS_CLASSES[1];
                    } else if (textLen <= 18) {
                        this.textSize = TEXT_SIZE_CLASSES[1];
                        this.bigEmoticons = BIG_EMOTICONS_CLASSES[0];
                    } else {
                        this.textSize = TEXT_SIZE_CLASSES[2];
                        this.bigEmoticons = "";
                    }

                    this.message = window.toStaticHTML(msgText);
                    this.resetPulse = false;
                }.bind(this), isFromEmptyState ? 0 : 600); 
            },

            _hide: function() {
                if (this._updateTimer) {
                    this.unregTimeout(this._updateTimer);
                    this._updateTimer = null;
                }
                if (this._hideTimer) {
                    this.unregTimeout(this._hideTimer);
                    this._hideTimer = null;
                }
                this._notifQueue = [];

                this.message = "";
                this.visible = false;
            },

            init: function(avatar) {
                this._notifQueue = [];
                this._avatar = avatar;
            },

            onStop: function() {
                if (this._listening) {
                    this.unregObjectEventListeners(this._conversation);
                    this._hide();
                    this._listening = false;
                }
            },

            onStart: function() {
                if (!this._listening) {
                    this._listening = true;
                    this.regEventListener(this._conversation, "incomingmessage", this._handleNewMessage.bind(this));
                }
            }
        }, {
            
            message: "",
            visible: false,
            resetPulse: false,
            textSize: "",
            bigEmoticons: ""
        }, {
            
            MAX_MESSAGES_IN_PIPE: 3,
            MESSAGE_UPDATE_TIME: 3000,
            MESSAGE_SHOW_TIME: 6000,

        });

    WinJS.Namespace.define("Skype.ViewModel", {
        MessageNotificationVM: WinJS.Class.mix(messageNotificationVM, Skype.Class.disposableMixin)
    });
})();
