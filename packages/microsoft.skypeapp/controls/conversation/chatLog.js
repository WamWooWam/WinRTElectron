

(function (Skype) {
    "use strict";
    var app = WinJS.Application;
    var MessageType = Skype.Model.MessageType;
    var etw = new Skype.Diagnostics.ETW.Tracer("Skype.UI.Conversation.ChatLog");

    var timeFormatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter.shortTime;

    var SUPPORTED_MESSAGE_TYPES = [LibWrap.Message.type_POSTED_TEXT, LibWrap.Message.type_POSTED_SMS, LibWrap.Message.type_ENDED_LIVESESSION, LibWrap.Message.type_STARTED_LIVESESSION,
        LibWrap.Message.type_RETIRED_OTHERS, LibWrap.Message.type_RETIRED, LibWrap.Message.type_SET_METADATA, LibWrap.Message.type_POSTED_CONTACTS,
        LibWrap.Message.type_POSTED_FILES, LibWrap.Message.type_POSTED_EMOTE, LibWrap.Message.type_REQUESTED_AUTH, LibWrap.Message.type_SPAWNED_CONFERENCE, LibWrap.Message.type_ADDED_CONSUMERS,
        LibWrap.Message.type_POSTED_VIDEO_MESSAGE, LibWrap.Message.type_POSTED_VOICE_MESSAGE, LibWrap.Message.type_GRANTED_AUTH, LibWrap.Message.type_BLOCKED,
        LibWrap.Message.type_ADDED_LEGACY_CONSUMERS, LibWrap.Message.type_LEGACY_MEMBER_UPGRADED];

    var SUPPORTED_CALL_STATUSES = [Skype.Model.CallStatus.done, Skype.Model.CallStatus.noAnswer, Skype.Model.CallStatus.missed, Skype.Model.CallStatus.declined, Skype.Model.CallStatus.busy];

    var NOTIFICATION_TYPE_GROUP = "group",
        NOTIFICATION_TYPE_P2P_CHAT = "p2pChat",
        NOTIFICATION_TYPES = [NOTIFICATION_TYPE_GROUP, NOTIFICATION_TYPE_P2P_CHAT],
        MAX_ANIMATED_EMOTICONS_COUNT = 100,
        SCROLL_LOAD_OFFSET = 250,
        ADD_MESSAGE_ON_SCROLL_DELAY = 300,
        SCROLL_HANDLER_THRESHHOLD = 200,
        MINIMAL_FORCED_MESSAGE_CONTAINER_SCROLL = 30;

    var p2pChatMessageId = -2; 

    var chatLog = Skype.UI.Control.define(function (element, options) {
        this._init(element, options);
    }, {
        messagesContainer: null,
        _ariaLiveContainer: null,

        
        _listNavigator: null,
        _liveAriaNarrator: null,
        _ariaMessageUpdater: null,

        conversation: null,
        conversationWrapper: null,
        _messages: null,
        _conversationState: null,
        _typingIndicator: null,
        _typingIndicatorEl: null,
        _lastScroll: null,
        scrollBottom: {
            get: function () {
                return this._conversationState.chatLog_scrollBottom || 0;
            },
            set: function (value) {
                this._conversationState.chatLog_scrollBottom = value;
            }
        },
        neededScrollTop: {
            get: function () {
                return this.messagesContainer.scrollHeight - this.messagesContainer.offsetHeight - this.scrollBottom;
                
            }
        },
        _today: Skype.Utilities.days.today,
        _midnightTimeout: null,
        _callRatingControl: null,
        _wholeCallRatingElement: null,
        _noMessages: null,
        avatarCounter: 0,
        _discardedMessages: null,
        _lastAuthMessage: null,
        _prevKeyboardScrollTop: 0,
        _keyboardHeight: 0,

        
        _noMessagesVisible: false,
        _isShowingAuthReqMessage: false,
        _isVisible: true, 
        _consumeFocusEvent: false,
        _chatLogControlIsReady: false,

        _templates: null,

        _init: function (element, options) {
            this._templatesProvider = options.templateProvider;
            this.conversation = options.conversationWrapper.libConversation;
            this.conversationWrapper = options.conversationWrapper;
            this._conversationSharedState = options.conversationSharedState;
            this._messages = [];
            this._discardedMessages = [];
        },

        render: function () {
            return this._templatesProvider.loadAsync()
                .then(function (templates) {
                    this._templates = templates;
                    
                    return WinJS.UI.Fragments.render("/controls/conversation/chatLog.html", this.element);
                }.bind(this)).then(this._onReady.bind(this));
        },

        _registerEvents: function () {
            this.regEventListener(this.conversation, "incomingmessage", this._handleNewMessage.bind(this));
            this.regEventListener(lib, "objectpropertychange", this._handleLibPropChange);
            this.regEventListener(this.element, "focus", this._onContainerFocused.bind(this));
            this.regEventListener(this.element, "keydown", this._onElementKeyDown.bind(this));
            this.regEventListener(this.element, "pointerdown", this._preventChatHandlingInLive.bind(this));
            this.regEventListener(this.messagesContainer, "scroll", this._onMessagesContainerScroll.bind(this));
            this.regEventListener(this.messagesContainer, "MSGestureHold", this._onHoldGesture.bind(this));
            this.regEventListener(this.messagesContainer, "pointerdown", this._onHoldGesture.bind(this));
            this.regEventListener(window, "resize", this.onChatResized.bind(this));
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationShow, this._onConversationShow.bind(this));
            this.registerCaptureEvent(Skype.UI.Conversation.Events.ConversationHide, this._onConversationHide.bind(this));
            this.regEventListener(this._listNavigator, Skype.UI.ListStyleNavigation.Events.ListItemFocused, this._onBeforeListItemFocus.bind(this));
            this.regEventListener(this._listNavigator, Skype.UI.ListStyleNavigation.Events.ListItemActivated, this._onListItemActivated.bind(this));
            this.regEventListener(this._liveAriaNarrator, Skype.UI.Conversation.ChatLogLiveAriaNarrator.Events.ReadNewMessages, this._onReadNewMessage.bind(this));
            this.regEventListener(Skype.Application.state, "historyCleared", this._onHistoryCleared.bind(this));
        },

        _onReady: function () {
            this.messagesContainer = this.element.querySelector('div.messagesContainer');
            this._ariaLiveContainer = this.element.querySelector("div.ariaLiveContainer");
            this._noMessages = this.element.parentNode.querySelector("div.noMessagesContainer"); 
            var options = this.options;
            this._conversationState = app.sessionState.conversations[options.conversationSessionStateId]; 
            this._listNavigator = new Skype.UI.ListStyleNavigation(this.messagesContainer);
            this._liveAriaNarrator = new Skype.UI.Conversation.ChatLogLiveAriaNarrator();
            this._updateMessageAria = this._updateMessageAria.bind(this);
            this._ariaMessageUpdater = { updateMessageAria: this._updateMessageAria };

            this._handleLibPropChange = this._handleLibPropChange.bind(this);
            this.scrollToBottom = this.scrollToBottom.bind(this);
            this.onScroll = this.onScroll.bind(this);
            this._lastScrollTimeoutId = null;

            this._registerEvents();

            this._initTypingIndicator();
            
            this._showP2PHistory();
            this.readData();
            this._showHideNoMessages(); 

            
            var now = new Date();
            var msToMidnight = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 900) - now) + 500;
            this._midnightTimeout = this.regTimeout(this.onDateChanged.bind(this), msToMidnight);
            this._chatLogControlIsReady = true;
        },

        _preventChatHandlingInLive: function (evt) {
            
            if (event.currentPoint && event.currentPoint.pointerDevice.pointerDeviceType === Windows.Devices.Input.PointerDeviceType.mouse) {
                evt.stopPropagation();
            }
        },

        getTypers: function () {
            var result = [];
            for (var i = 0; i < this.conversation.participants.length; i++) {
                if ([LibWrap.Participant.text_STATUS_WRITING,
                    LibWrap.Participant.text_STATUS_WRITING_AS_ANGRY,
                    LibWrap.Participant.text_STATUS_WRITING_AS_CAT].indexOf(this.conversation.participants[i].getIntProperty(LibWrap.PROPKEY.participant_TEXT_STATUS)) > -1) {
                    result.push(this.conversation.participants[i].getDisplayNameHtml()); 
                }
            }
            return result;
        },

        updateTypingIndicator: function () {
            var writers = this.getTypers();
            this._typingIndicator.update(writers);

            if (writers.length) {
                var isLastScrollScreenPartiallyInView = this.messagesContainer.scrollTop + this.messagesContainer.offsetHeight > this.messagesContainer.scrollHeight - this.messagesContainer.offsetHeight;

                if (this._listNavigator.focusedListElement && this._listNavigator.focusedListElement == document.activeElement) {
                    var scrollBy = this.messagesContainer.scrollHeight - this.messagesContainer.scrollTop - this.messagesContainer.offsetHeight;
                    
                    if (this._listNavigator.focusedListElement.offsetTop - scrollBy < this.messagesContainer.scrollHeight - this.messagesContainer.offsetHeight) {
                        isLastScrollScreenPartiallyInView = false;  
                    }
                }

                if (isLastScrollScreenPartiallyInView && !this._typingIndicator.isVisible) {
                    
                    
                    this._showTypingIndicator();
                }
                if (isLastScrollScreenPartiallyInView) {
                    this.scrollToBottom();
                } else {
                    this._hideTypingIndicator();
                }
            }
        },

        onChatPossitionInLiveChanged: function (chatOpenInLive) {
            if (chatOpenInLive && this._chatLogControlIsReady) { 
                this.regImmediate(this.scrollToBottom);
            }
        },

        _initTypingIndicator: function () {
            this._typingIndicatorEl = this.messagesContainer.querySelector("div.typingIndicatorControl");
            this._typingIndicator = new Skype.UI.Conversation.TypingIndicator(this._typingIndicatorEl);
            return this._typingIndicator.render();
        },

        onDateChanged: function () {
            
            var dateHeaders = this.messagesContainer.querySelectorAll("div.dateHeader");
            for (var i = 0; i < dateHeaders.length; i++) {
                this.messagesContainer.removeChild(dateHeaders[i]);
            }

            this.reRenderMessages();

            this.onScroll();
        },
        _rerenderMessage: function (i) {
            var item = this._messages[i];
            if (item.isPlaceholder) {
                return; 
            }
            var libMessage = lib.getConversationMessage(item.id);
            if (libMessage) {
                this.renderMessage(this._uiMessageFromLibMessage(libMessage), i, true);
                libMessage.discard();
            }
        },

        reRenderMessages: function (identity) {
            for (var j = 0; j < this._messages.length; j++) {
                if (!identity || identity === this._messages[j].authorid) {
                    this._rerenderMessage(j);
                }
            }
            this._initMessagesComplexMessages();
        },

        readData: function () {
            var session = etw.startSession("LoadMessages");
            var timestamp = ((new Date()).getTime() / 1000) | 0;
            var count = 30;
            var context = new LibWrap.VectUnsignedInt();
            var libMessage;

            this.conversation.loadMessages(timestamp, count, false, context);

            
            for (var i = Math.min(context.getCount(), count) - 1; i > -1; i--) {
                libMessage = lib.getConversationMessage(context.get(i));
                if (libMessage) {
                    this.addLibMessage(libMessage);
                }
            }

            this._onMessagesAdded();
            this._resumeScrollState();

            session.stop();
        },

        _resumeScrollState: function () {
            if (this.scrollBottom) {
                
                if (this.neededScrollTop >= 0) {
                    this.messagesContainer.scrollTop = this.neededScrollTop;
                } else {
                    this.scrollToBottom();
                }
            } else {
                this.scrollToBottom();
            }
        },

        _onMessagesAdded: function () {
            this._initMessagesComplexMessages();
            if (this._listNavigator.focusedListElement && document.activeElement == this._listNavigator.focusedListElement) {
                
                
                this._listNavigator.focusedListElement.focus();
            }
        },

        _updateMessageAria: function (libMessageId) {
            var message = this.messagesContainer.querySelector("#" + this._createMessageId(libMessageId));
            if (message) {
                var ariaLabel = this._getAriaLabelForListMessage(message, true);
                if (ariaLabel) {
                    message.setAttribute("aria-label", ariaLabel);
                }
            }
        },

        _initMessagesComplexMessages: function () {
            

            var elem;
            var messElms = WinJS.Utilities.query("div.complexControl", this.messagesContainer);
            for (var i = messElms.length - 1; i >= 0; i--) {
                elem = messElms[i];
                if (elem.winControl && !elem.winControl.initialized) {
                    elem.winControl.init(this._ariaMessageUpdater);
                }
            }
        },

        _showTypingIndicator: function () {
            if (!this._conversationSharedState.isBlocked) {
                this._typingIndicator.show();
            }
        },

        _hideTypingIndicator: function () {
            this._typingIndicator.hide();
        },

        _handleNewMessage: function (messageID) {
            var libMessage = lib.getConversationMessage(messageID);
            if (!libMessage) {
                return;
            }

            this._hideTypingIndicator();

            var outgoingMessage = this._isMessageOutgoingMessage(libMessage);
            var scrolledToBottom = this.messagesContainer.scrollTop + this.messagesContainer.clientHeight > this.messagesContainer.scrollHeight - 100;
            var isOutgoingViM = outgoingMessage && libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE) == LibWrap.Message.type_POSTED_VIDEO_MESSAGE;

            var added = this.addLibMessage(libMessage);
            if (!added) {
                return;
            }

            this._onMessagesAdded();
            if (!outgoingMessage) {
                this._liveAriaNarrator.onNewMessageArrived(messageID);
                this.dispatchEvent(Skype.UI.Conversation.ChatLog.Events.IncomingMessageAdded, messageID);
            }

            if (scrolledToBottom || isOutgoingViM) {
                this.scrollToBottom();
            }
        },

        _handleLibPropChange: function (e) {
            var objID = e.detail[0],
                propKey = e.detail[1],
                item,
                itemPos,
                message;

            if (propKey == LibWrap.PROPKEY.message_BODY_XML) {
                message = lib.getConversationMessage(objID);
                if (!message) {
                    return;
                }

                if (message.getIntProperty(LibWrap.PROPKEY.message_CONVO_ID) !== this.conversation.getDbID()) {
                    return;
                }

                var messageType = message.getIntProperty(LibWrap.PROPKEY.message_TYPE);
                if ((messageType === LibWrap.Message.type_POSTED_FILES) || (messageType === LibWrap.Message.type_POSTED_VIDEO_MESSAGE)) {
                    return;
                }

                for (var i = this._messages.length - 1; i >= 0; i--) {
                    if (this._messages[i].id == objID) {
                        item = this._uiMessageFromLibMessage(message);
                        itemPos = i;
                        break;
                    }
                }

                message.discard();

                item && this.renderMessage(item, itemPos, true);
            } else if (propKey == LibWrap.PROPKEY.sms_STATUS) {
                for (var j = this._messages.length - 1; j >= 0; j--) {
                    if (this._messages[j].smsObjID == objID) {
                        message = lib.getConversationMessage(this._messages[j].id);
                        if (message) {
                            item = this._uiMessageFromLibMessage(message);
                            itemPos = j;
                            message.discard();
                        }
                        break;
                    }
                }

                item && this.renderMessage(item, itemPos, true);
            }
        },

        _removePreviousAuthRequest: function (message, firstAuthMessage) {
            
            if (!firstAuthMessage) {
                this._lastAuthMessage && this._removeAuthMessage(this._lastAuthMessage.id);
            }
            this._lastAuthMessage = message;
        },

        addLibMessage: function (libMessage) {
            if (!libMessage) {
                return false;
            }

            var type = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);
            if (!Skype.Model.MessageFactory.isSupportedMessageType(type, SUPPORTED_MESSAGE_TYPES)) {
                return false;
            }

            if (type === LibWrap.Message.type_RETIRED && libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR) == lib.myIdentity) {
                return false; 
            }

            if (type == LibWrap.Message.type_RETIRED_OTHERS && libMessage.getStrProperty(LibWrap.PROPKEY.message_IDENTITIES).indexOf(lib.myIdentity) > -1) {
                return false; 
            }

            var message = this._uiMessageFromLibMessage(libMessage);
            if (type == LibWrap.Message.type_REQUESTED_AUTH) {
                if (this.conversationWrapper.contact && this.conversationWrapper.contact.isContactWaitingAuthRequest) {
                    if (this._isShowingAuthReqMessage) {
                        this._removePreviousAuthRequest(message, false);
                    } else {
                        this._removePreviousAuthRequest(message, true);
                    }
                } else {
                    if (!this._isMessageOutgoingMessage(libMessage)) {
                        return false;
                    }
                }
            }

            if (message.type === MessageType.call && message.subtype !== Skype.Model.CallStatus.done && !message.endMessage) {
                return false; 
            }

            if (message.type === MessageType.call && !SUPPORTED_CALL_STATUSES.contains(message.subtype)) {
                return false; 
            }

            this._addMessage(message);

            if (type == LibWrap.Message.type_REQUESTED_AUTH) {
                this._isShowingAuthReqMessage = true;
                roboSky.write("Contact,receiveRequest");
            }

            return true;
        },

        _addMessage: function (message) {
            var insertionPoint = 0;

            for (var i = this._messages.length - 1; i >= 0; i--) {
                if (this._messages[i].timestamp <= message.timestamp) {
                    insertionPoint = i + 1;
                    break;
                }
            }

            
            if (message.type === MessageType.call && message.subtype === Skype.Model.CallStatus.done) {
                var conversationMessage = lib.getConversationMessage(message.id);
                var otherLiveMessageId = conversationMessage.getOtherLiveMessage();
                conversationMessage.discard();

                var prevMessage = insertionPoint > 0 ? this._messages[insertionPoint - 1] : null;
                var nextMessage = insertionPoint < this._messages.length ? this._messages[insertionPoint] : null;

                if (message.endMessage) {
                    if (prevMessage && prevMessage.type === MessageType.call && !prevMessage.endMessage && otherLiveMessageId === prevMessage.id) {
                        this._removeMessage(prevMessage.id);
                        message.notification = "chatitem_call".translate();
                        message.notificationtype = message.callType + "call";
                        insertionPoint--;
                    }
                } else { 
                    if (nextMessage && nextMessage.type === MessageType.call && nextMessage.endMessage && otherLiveMessageId === nextMessage.id) {
                        var nextLibMessage = lib.getConversationMessage(nextMessage.id);
                        if (nextLibMessage) {
                            var nMsg = this._uiMessageFromLibMessage(nextLibMessage); 
                            nMsg.notification = "chatitem_call".translate();
                            nMsg.notificationtype = message.callType + "call";
                            this.renderMessage(nMsg, insertionPoint, true);
                            nextLibMessage.discard();
                        }
                        this._discardedMessages.push(message.id);
                        return; 
                    }
                }
            }
            this._insertMessage(message, insertionPoint);
        },

        _insertMessage: function (message, insertionPoint) {
            var referenceItem = { id: message.id, timestamp: message.timestamp, authorid: message.authorid, notificationtype: message.notificationtype, unsupported: message.unsupported, type: message.type, endMessage: message.endMessage, isPlaceholder: message.isPlaceholder };
            if (message.sms) {
                referenceItem.smsObjID = message.smsObjID;
            }
            
            
            if (message.type === MessageType.file && this.replaceSendMessagePlaceholder(message.id, referenceItem)) {
                return;
            }

            if (insertionPoint == this._messages.length) {
                this._messages.push(referenceItem);
            } else {
                this._messages.splice(insertionPoint, 0, referenceItem);
            }

            this.renderMessage(message, insertionPoint);

            
            if (insertionPoint < this._messages.length - 1) {
                var libMessage = lib.getConversationMessage(this._messages[insertionPoint + 1].id);
                if (libMessage) {
                    this.renderMessage(this._uiMessageFromLibMessage(libMessage), insertionPoint + 1, true);
                    libMessage.discard();
                }
            }
            
            this._showHideNoMessages();
        },

        _replaceMessageInContainer: function (newNode, oldNode) {
            assert(oldNode.parentNode == this.messagesContainer, "BEWARE. What are you trying to remove ?!");
            this.messagesContainer.replaceChild(newNode, oldNode);
            this._listNavigator.onContainerChildReplaced(newNode, oldNode);
            WinJS.Utilities.disposeSubTree(oldNode);
        },

        _removeMessageFromContainer: function (elmToDelete) {
            assert(WinJS.Utilities.hasClass(elmToDelete, "list-selectable") && elmToDelete.parentNode == this.messagesContainer, "BEWARE. What are you trying to remove ?!");

            this._listNavigator.onContainerChildRemoved(elmToDelete);
            this.messagesContainer.removeChild(elmToDelete);
            WinJS.Utilities.disposeSubTree(elmToDelete);
        },

        _removeMessage: function (id) {
            var index = -1;
            for (var i = this._messages.length - 1; i >= 0; i--) {
                if (this._messages[i].id === id) {
                    index = i;
                    this._discardedMessages.push(id);
                    break;
                }
            }

            if (index !== -1) {
                this._messages.splice(index, 1);
                var elmToDelete = document.getElementById(this._createMessageId(id));
                if (elmToDelete) {
                    
                    var previousElement = elmToDelete.previousSibling;
                    if (previousElement.hasAttribute("data-label")) {
                        var nextElement = elmToDelete.nextSibling;
                        var nextIsTypingIndicator = WinJS.Utilities.hasClass(nextElement, "typingIndicatorControl");
                        if (nextIsTypingIndicator || nextElement.hasAttribute("data-label")) {
                            this.messagesContainer.removeChild(previousElement);
                        }
                    }
                    this._removeMessageFromContainer(elmToDelete);
                }
                this._showHideNoMessages();

                
                if (index < this._messages.length) {
                    var libMessage = lib.getConversationMessage(this._messages[index].id);
                    if (libMessage) {
                        this.renderMessage(this._uiMessageFromLibMessage(libMessage), index, true);
                        libMessage.discard();
                    }
                }
            }
            return index;
        },

        getMessageTemplate: function (item, isFollowingMessage) {
            
            if (item.notificationtype && NOTIFICATION_TYPES.contains(item.notificationtype)) {
                return this._templates.notificationTemplate;
            }

            if (item.type === MessageType.auth || item.type === MessageType.authorized) {
                return isFollowingMessage ? this._templates.authMessageFollowTemplate : this._templates.authMessageTemplate;
            }

            if (item.type === MessageType.initialAuthRequest) {
                return isFollowingMessage ? this._templates.initialAuthRequestMessageFollowTemplate : this._templates.initialAuthRequestMessageTemplate;
            }

            
            if (item.type === MessageType.text || item.type === MessageType.sms) {
                return isFollowingMessage ? this._templates.chatMessageFollowTemplate : this._templates.chatMessageTemplate;
            }

            if (item.type === MessageType.videomessage) {
                return isFollowingMessage ? this._templates.videoMessageFollowTemplate : this._templates.videoMessageTemplate;
            }

            
            if (item.unsupported) {
                return this._templates.chatMessageUnsupportedTemplate;
            }

            
            if (item.type === MessageType.call) {
                return this._templates.chatMessageNotificationTemplate;
            }

            
            if (item.type === MessageType.file) {
                return isFollowingMessage ? this._templates.fileTransferFollowTemplate : this._templates.fileTransferTemplate;
            }

            if (item.type === MessageType.blocked) {
                return this._templates.chatMessageBlockTemplate;
            }


            return null;
        },

        _addLinkNavigateAction: function (actionElement, conversationIdentity) {
            if (actionElement) {
                if (actionElement.nodeName == "A") {
                    
                    WinJS.Utilities.addClass(actionElement, "navigable");
                }
                this.regEventListener(actionElement, 'click', function (e) {
                    Skype.UI.Util.animateInvoke(e.currentTarget, function () {
                        Actions.invoke("focusConversation", conversationIdentity);
                    });
                });
            }
        },

        renderMessage: function (item, order, replace) {
            var oldItem = document.getElementById(this._createMessageId(item.id));
            var itemAlreadyExists = !!oldItem;
            if (itemAlreadyExists && !replace) { 
                return;
            }

            if (!itemAlreadyExists && replace) {
                log("#8520: Message not found - {0} - messages - {1} (can happen removeFromDOM in uiUtil)".format(item.id, this._messages.map(function (msg) { return msg.id; }).join(",")));
                return;
            }

            var isFollowingMessage = (order !== 0) && this._messages[order - 1].authorid == item.authorid && !this._messages[order - 1].notificationtype && !this._messages[order - 1].unsupported;

            var hasAvatar = false;
            if (isFollowingMessage) {
                var date1 = new Date();
                var date2 = new Date();
                date1.setTime(item.timestamp * 1000);
                date2.setTime(this._messages[order - 1].timestamp * 1000);

                if (date1.toDateString() != date2.toDateString()) {
                    isFollowingMessage = false;
                }

                
                if (date1.getMinutes() == date2.getMinutes() && date1.getHours() == date2.getHours() && !item.sms) {
                    item.time = "&nbsp;";
                }
            }

            
            var template = this.getMessageTemplate(item, isFollowingMessage);
            if (!template) {
                assert(false, "#8520: Not rendering message ! - {0} - messages - {1} {2} {3}".format(item.id, isFollowingMessage, item.type, item.notificationtype));
                return;
            }

            if (lib.myIdentity == item.authorid) {
                item.name = "chatlog_ME".translate();
            }

            
            if (!isFollowingMessage || NOTIFICATION_TYPES.contains(item.notificationtype)) {
                item.avatarUri = item.avatarUri || Skype.Model.AvatarUpdater.instance.getAvatarURI(item.authorid);
                item.avatarMessageType = item.type;
                if (item.avatarUri) {
                    hasAvatar = true;
                }
            }

            if (!item.isPlaceholder) {
                item.objectId = item.id; 
            }

            template.renderItem(WinJS.Promise.wrap({ data: item })).renderComplete.
                then(this._onMessageRendered.bind(this, item, oldItem, order, replace, hasAvatar));
        },

        _onMessageRendered: function (item, oldItem, order, replace, hasAvatar, newChild) {

            var node = newChild.querySelector("div.node");
            node.setAttribute("id", this._createMessageId(item.id));

            Array.prototype.slice.call(node.querySelectorAll("a"), 0).forEach(function (link) {
                link.setAttribute("tabindex", "-1");
            });

            
            if (item.type) {
                node.setAttribute("type", item.type);
            }

            if (item.sms) {
                WinJS.Utilities.addClass(node, "SMS");
                if (item.smsStatus) {
                    node.setAttribute("smsstatus", item.smsStatus);
                }
            }

            if (item.edited) {
                WinJS.Utilities.addClass(node, "EDITED");
            }

            if (lib.myIdentity === item.authorid) {
                WinJS.Utilities.addClass(node, "me");
            }

            if (lib.myIdentity === item.authorid && item.type && item.type === MessageType.text) {
                var anchor = node.querySelector("div.edited");
                this.regEventListener(anchor, "click", this._showHoldMenuForMessage.bind(this, item.id, anchor, "bottom"), true);
            }

            if (item.isPlaceholder) {
                node.setAttribute("data-placeholderguid", item.id); 
            }

            if (item.notificationtype && item.notificationtype == NOTIFICATION_TYPE_GROUP) {
                this.regEventListener(node, "click", function (e) {
                    if (e.target.nodeName == "A" && e.target.dataset && e.target.dataset.conversation_id) {
                        e.preventDefault();
                        Actions.invoke("focusConversation", e.target.dataset.conversation_id);
                    }
                }, true);
            }

            
            this.regEventListener(node, "mousedown", function (e) {
                if (e.target == node) {
                    e.preventDefault();
                }
            });

            
            if (lib.myIdentity != item.authorid && !this.conversationWrapper.isDialog) {
                this._addLinkNavigateAction(node.querySelector("div.message a.meInnerLink"), item.authorid);
                if (hasAvatar) {
                    this._addLinkNavigateAction(node.querySelector("div.avatar div.img"), item.authorid);
                    this._addLinkNavigateAction(node.querySelector("div.message h3.name a"), item.authorid);
                }
            }

            if (replace) {
                var wasFocused = document.activeElement == oldItem;
                this._replaceMessageInContainer(node, oldItem);

                if (wasFocused) {
                    node.focus();
                }
            } else if (order == this._messages.length - 1) {
                this.messagesContainer.insertBefore(node, this._typingIndicatorEl);
            } else {
                if (item._isFake && item.notificationtype == NOTIFICATION_TYPE_P2P_CHAT) {
                    this.messagesContainer.insertBefore(node, this.messagesContainer.firstChild);
                } else {
                    var previousElement = document.getElementById(this._createMessageId(this._messages[order + 1].id));
                    this.messagesContainer.insertBefore(node, previousElement);
                }
            }

            if (item.notificationtype != NOTIFICATION_TYPE_P2P_CHAT) { 
                this._addDateHeader(item.date, node);
            }

            var emoticonCount = node.querySelectorAll("span.emoticon").length;
            if (emoticonCount < MAX_ANIMATED_EMOTICONS_COUNT) {
                WinJS.Utilities.removeClass(node, "init");
            }

            if (Skype.Application.state.view.isTouchSupported) {
                
                

                if (item.type != MessageType.file) {
                    var msgBody = node.querySelector("div.body"); 
                    var ariaLabel = this._getAriaLabelForUIMessage(item, order + 1, msgBody ? msgBody.textContent : "", node, true);
                    if (ariaLabel) {
                        node.setAttribute("aria-label", ariaLabel);
                    }
                }
            }

            roboSky.write("Conversation,messageReady");
        },

        _onConversationShow: function () {
            
            
            this._resumeScrollState();
            this._isVisible = true;
        },

        _onConversationHide: function () {
            if (this._wholeCallRatingElement) {
                if (this._callRatingControl && this._callRatingControl.winControl && !this._callRatingControl.winControl.disabled) {
                    this.dispatchEvent(Skype.UI.Conversation.ChatLog.Events.CallRatingCancelled);
                }
                this._dismissCallRatingElement();
            }
            this._isVisible = false;
        },

        onChatResized: function () {
            if (this._isVisible) {
                this.scrollToBottom(); 
            }
        },

        _hasAnyMessages: function () {
            return this._messages.length > 0;
        },

        _onContainerFocused: function () {
            if (this._hasAnyMessages() && !this._consumeFocusEvent && this._listNavigator) {
                this._listNavigator.setFocus(this._typingIndicatorEl.previousSibling);
            }
            this._consumeFocusEvent = false;
        },

        _getAriaLabelForUIMessage: function (uiMessage, messagePosition, msgText, listElement, readInstructions) {
            var instruction = "";

            switch (uiMessage.type) {
                case MessageType.initialAuthRequest:
                    return "aria_chat_message_authrequest_base".translate(uiMessage.name, msgText, uiMessage.date, uiMessage.time, messagePosition, this._messages.length, "aria_chat_message_authrequest_message_instruction".translate());
                case MessageType.file:
                    var fileTransferControl = listElement.querySelector("div.complexControl").winControl;
                    var transferDetails = fileTransferControl ? fileTransferControl.getMessageAria() : "";
                    msgText = "aria_chat_filetransfer_message_text".translate(uiMessage.message, transferDetails);
                    instruction = "aria_chat_message_complex_message_instruction".translate();
                    break;
                case MessageType.videomessage:
                    msgText = "aria_chat_videomessage_text".translate();
                    instruction = "aria_chat_message_complex_message_instruction".translate();
                    break;
                case MessageType.group:
                case MessageType.text:
                case MessageType.call:
                case MessageType.sms:
                case MessageType.blocked:
                case MessageType.auth:
                case MessageType.authorized:
                case MessageType.contacts:
                case MessageType.voicemail:
                    break;
            }
            if (!instruction && readInstructions && listElement.querySelector(Skype.UI.ListStyleNavigation.NAVIGABLE_ELEMENTS)) {
                instruction = "aria_chat_message_with_links_instruction".translate();
            }

            if (uiMessage.notificationtype == NOTIFICATION_TYPE_P2P_CHAT) { 
                return "aria_chat_message_link_history".translate(msgText, messagePosition, this._messages.length, readInstructions ? instruction : "");
            } else {
                return "aria_chat_message_base".translate(msgText, uiMessage.name, uiMessage.date, uiMessage.time, messagePosition, this._messages.length, readInstructions ? instruction : "");
            }
        },

        _getAriaLabelForListMessage: function (listItem, readInstructions) {
            var msgId = this._getIdFromMessage(listItem);
            assert(msgId != -1, "Every node needs to have id !");

            var msgIndex = this._messages.index(function (itm) {
                return itm.id === msgId;
            });
            if (msgIndex === -1) {
                log("_onBeforeListItemFocus: somehow we focus message that is not cached");
                return ""; 
            }

            var msgBody = listItem.querySelector("div.body");
            var msgText = msgBody ? msgBody.textContent : "";
            var msg = this._messages[msgIndex];
            var uiMessage = null;
            if (this._messages[msgIndex].notificationtype == NOTIFICATION_TYPE_P2P_CHAT) { 
                uiMessage = this._messages[msgIndex];
            } else {
                var libMessage = lib.getConversationMessage(msg.id);
                uiMessage = this._uiMessageFromLibMessage(libMessage);
            }
            if (uiMessage) {
                return this._getAriaLabelForUIMessage(uiMessage, msgIndex + 1, msgText, listItem, readInstructions);
            }
            return "";
        },

        _onBeforeListItemFocus: function (event) {
            
            

            var listItem = event.detail.item;

            assert(WinJS.Utilities.hasClass(listItem, "list-selectable"), "Cannot generate aria for some strange node !");
            if (WinJS.Utilities.hasClass(listItem, "rateCallQualityNode")) {
                return; 
            }

            var ariaLabel = this._getAriaLabelForListMessage(listItem, true);
            if (ariaLabel) {
                listItem.setAttribute("aria-label", ariaLabel);
            }
        },

        _onReadNewMessage: function (event) {
            var messageIds = event.detail.messageIds;
            var messageCount = messageIds.length;

            if (messageCount === 1) {
                var message = this.messagesContainer.querySelector("#" + this._createMessageId(messageIds[0]));
                if (!message) {
                    
                    return;
                }
                
                
                var ariaLabel = this._getAriaLabelForListMessage(message, false);
                this._ariaLiveContainer.innerText = ariaLabel;
            } else {
                this._ariaLiveContainer.innerText = Skype.Globalization.formatNumericID("aria_chat_new_messages_arrived", messageCount).translate(messageCount);
            }
        },

        _onMessagesContainerScroll: function () {
            this.unregTimeout(this._lastScrollTimeoutId);

            if (this.messagesContainer.scrollTop < MINIMAL_FORCED_MESSAGE_CONTAINER_SCROLL) {
                this.onScroll();
            } else {
                this._lastScrollTimeoutId = this.regTimeout(this.onScroll, SCROLL_HANDLER_THRESHHOLD);
            }
        },

        _onElementKeyDown: function (event) {
            if (event.keyCode === WinJS.Utilities.Key.tab && document.activeElement != this.element) {
                
                this._consumeFocusEvent = true;
                
                this.element.focus();
            }
        },

        scrollToBottom: function () {
            this._lastScroll = this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.onScroll();
        },

        _addDateHeader: function (label, messageNode) {
            
            messageNode.data = label;

            var existing = this.messagesContainer.querySelector("div.dateHeader[data-label='" + label.replace("'", "") + "']");
            if (existing) {
                

                
                var previousSibling = messageNode;
                do {
                    previousSibling = previousSibling.previousSibling;
                } while (previousSibling != null && !previousSibling.data);

                if (previousSibling) {
                    var prevMessageLabel = previousSibling.data;
                    var prevIsDateHeader = WinJS.Utilities.hasClass(previousSibling, "dateHeader");

                    if (!prevIsDateHeader && prevMessageLabel != label) {
                        
                        this.messagesContainer.insertBefore(existing, messageNode);
                    }
                }
            } else {
                
                var template = this._templates.dateTemplate;
                var result = template.renderItem(WinJS.Promise.wrap({ data: { label: label } }));
                result.renderComplete.then(function (newChild) {
                    var node = newChild.querySelector("div.node");
                    node.data = label;
                    node.setAttribute("data-label", label.replace("'", ""));
                    this.messagesContainer.insertBefore(node, messageNode);
                }.bind(this));
            }
        },

        _setNotificationToUIMessage: function (item, baseMessage) {
            item.notificationtype = baseMessage.details.status;
            item.subtype = baseMessage.details.status;
            item.callType = baseMessage.details.callType;
            item.notificationdetail = "";

            switch (baseMessage.details.status) {
                case Skype.Model.CallStatus.done:
                    item.notificationtype = baseMessage.endMessage ? "call" : item.callType + "call";
                    item.notification = (baseMessage.endMessage ? "chatitem_call_ended" : "chatitem_call").translate();
                    if (baseMessage.details.formattedDuration) {
                        item.notificationdetail = " " + "chatitem_call_duration".translate([baseMessage.details.formattedDuration]); 
                    } else {
                        item.notificationdetail = "";
                    }
                    break;
                case Skype.Model.CallStatus.missed:
                    item.notification = "chatitem_call_missed_full".translate();
                    break;
                case Skype.Model.CallStatus.declined:
                case Skype.Model.CallStatus.noAnswer:
                    item.notification = "chatitem_call_unanswered_full".translate();
                    break;
                case Skype.Model.CallStatus.busy:
                    item.notification = "chatitem_call_busy_full".translate();
                    break;
            }
        },

        _uiMessageFromLibMessage: function (libMessage) {
            var baseItem = Skype.Model.MessageFactory.createMessage(libMessage);
            var timestamp = baseItem.timestamp;
            var dateObj = new Date(timestamp * 1000);

            
            var time = timeFormatter.format(dateObj);

            var date = Skype.Utilities.dateAsHeaderString(dateObj);

            var item = {
                id: baseItem.id,
                name: libMessage.getAuthorDisplayNameHtml(),
                authorid: libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR),
                timestamp: timestamp,
                members: null,
                time: time,
                date: date,
                unsupported: false,
                type: MessageType.text
            };

            switch (baseItem.type) {
                case MessageType.group:
                    item.notificationtype = NOTIFICATION_TYPE_GROUP;
                    item.notification = baseItem.details;
                    item.notificationdetail = "";
                    item.members = baseItem.members;
                    item.type = baseItem.type;
                    break;
                case MessageType.call:
                    this._setNotificationToUIMessage(item, baseItem);
                    item.type = baseItem.type;
                    item.endMessage = baseItem.endMessage;
                    break;
                case MessageType.sms:
                    item.sms = true;
                    var sms = new LibWrap.Sms();
                    libMessage.getSMS(sms);
                    if (sms) {
                        item.smsObjID = sms.getObjectID();
                        switch (sms.getIntProperty(LibWrap.PROPKEY.sms_STATUS)) {
                            case LibWrap.Sms.status_DELIVERED:
                                item.smsStatus = "delivered";
                                roboSky.write("Conversation,smsState,delivered");
                                break;
                            case LibWrap.Sms.status_SOME_TARGETS_FAILED:
                            case LibWrap.Sms.status_FAILED:
                                item.smsStatus = "failed";
                                roboSky.write("Conversation,smsState,failed");
                                break;
                            default:
                                item.smsStatus = "sent";
                                roboSky.write("Conversation,smsState,sent");
                                break;
                        }

                    }
                    item.message = baseItem.details;
                    item.type = baseItem.type;
                    break;
                case MessageType.blocked:
                    item.notificationtype = baseItem.type;
                    item.message = baseItem.details;
                    item.type = baseItem.type;
                    break;
                case MessageType.text:
                    item.message = baseItem.details;
                    item.type = baseItem.type;
                    item.edited = baseItem.edited;
                    break;
                case MessageType.auth:
                    if (this._isMessageOutgoingMessage(libMessage)) {
                        
                        item.type = baseItem.type;
                    } else {
                        
                        item.type = MessageType.initialAuthRequest;
                    }
                    item.message = baseItem.details;
                    item = this._uiAuthRequestMessage(item);
                    break;
                case MessageType.authorized:
                    item.message = baseItem.details;
                    item.type = baseItem.type;
                    break;
                case MessageType.file:
                    item.message = baseItem.simpleDetails;
                    item.type = baseItem.type;
                    break;
                case MessageType.videomessage:
                    item.type = baseItem.type;
                    item.message = baseItem.details;
                    break;
                    
                case MessageType.contacts:
                case MessageType.voicemail:
                    item.message = baseItem.details;
                    item.type = baseItem.type;
                    item.unsupported = true;
                    break;
            }

            return item;
        },

        _isMessageOutgoingMessage: function (libMessage) {
            return libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR) === lib.myIdentity;
        },

        _uiAuthRequestMessage: function (item) {
            var libContact = this.conversation.partnerContact,
                displayName = libContact.getDisplayNameHtml(),
                identity = libContact.getIdentity();

            item.name = (displayName) ? "authrequest_author".translate(displayName, identity) : identity,
            item.authorid = identity;

            item.accept = function () {
                libContact.setBuddyStatus(true, true);
                libContact.refreshProfile(); 
                this._removeAuthMessage(item.id);
            }.bind(this);

            item.decline = function (evt) {
                Skype.UI.Dialogs.showDeclineContactDialog(evt.srcElement).then(function (value) {
                    if (value.result) {
                        if (value.remove || value.spam) {
                            libContact.setBlocked(true, value.spam);
                        } else {
                            libContact.ignoreAuthRequest();
                        }
                        this._removeAuthMessage(item.id);
                        this.conversation.removeFromInbox(); 
                        Actions.invoke("home");
                    }
                }.bind(this));
            }.bind(this);

            return item;
        },

        _removeAuthMessage: function (id) {
            this._removeMessage(id);
        },

        _lastAddMessagesAboveCall: null,
        checkIfNeedsMessagesAbove: function () {
            var hasScroll = this.messagesContainer.scrollHeight > this.messagesContainer.clientHeight;

            

            if (!hasScroll || this.messagesContainer.scrollTop < SCROLL_LOAD_OFFSET) {
                
                var now = +new Date();

                if (!this._lastAddMessagesAboveCall || now - this._lastAddMessagesAboveCall > ADD_MESSAGE_ON_SCROLL_DELAY) {
                    this._lastAddMessagesAboveCall = +new Date();
                    this.addMessagesAbove();
                }
            }
        },

        addMessagesAbove: function () {
            if (!this._hasAnyMessages()) {
                return;
            }

            
            var topMessage = this._messages[0];
            if (topMessage.notificationtype == NOTIFICATION_TYPE_P2P_CHAT) {
                if (this._messages[1]) {
                    topMessage = this._messages[1];
                } else {
                    return;
                }
            }
            var timestamp = topMessage.timestamp;

            
            if (this._loadTimestamp == timestamp) {
                return; 
            }
            this._loadTimestamp = timestamp;

            var count = 20;
            var context = new LibWrap.VectUnsignedInt();

            this.conversation.loadMessages(timestamp, count, false, context);

            var d = new Date();
            d.setTime(timestamp * 1000);
            

            if (context.getCount() === 0) {
                return;
            }

            var heightOld = this.messagesContainer.scrollHeight;

            for (var i = context.getCount() - 1; i > -1; i--) {
                var libMessage = lib.getConversationMessage(context.get(i));
                if (libMessage && !this._discardedMessages.contains(context.get(i))) {
                    this.addLibMessage(libMessage);
                }
            }
            var heightChange = this.messagesContainer.scrollHeight - heightOld;

            
            if (heightChange !== 0) {
                this.regImmediate(function () {
                    this.messagesContainer.scrollTop += heightChange;
                    this._onMessagesAdded();
                    
                }.bind(this));
            } else {
                this._onMessagesAdded();
            }
        },

        _showP2PHistory: function () {
            
            
            
            
            
            

            var p2pChatName = this.conversation.getChatNameFromThreadId();
            
            if (p2pChatName !== "") {
                var conv = lib.getConversationByIdentity(p2pChatName);
                if (conv) {
                    conv.discard();

                    var link = "skype:" + encodeURIComponent(p2pChatName) + "?chat",
                        message = {
                            id: p2pChatMessageId--, 
                            timestamp: 0, 
                            _isFake: true, 
                            notificationtype: NOTIFICATION_TYPE_P2P_CHAT,
                            type: NOTIFICATION_TYPE_P2P_CHAT,
                            notification: "msnp24_link_to_p2p_chat".translate(link)
                        };
                    this._insertMessage(message, 0);
                }
            }
        },

        _showHideNoMessages: function () {
            if (this.messagesContainer) { 
                var shouldBeVisible = !this._hasAnyMessages();

                if (this._noMessagesVisible === shouldBeVisible) {
                    return;
                }

                Skype.UI.Util.setClass(this._noMessages, 'VISIBLE', shouldBeVisible);
                this._noMessagesVisible = shouldBeVisible;
            }            
        },

        
        onScroll: function (event) {
            var logEl = this.messagesContainer;

            if (!this._hasAnyMessages()) {
                return;
            }

            
            
            var viewTop = logEl.scrollTop;
            var viewBottom = viewTop + logEl.clientHeight + 100;

            
            var nodes = this.messagesContainer.querySelectorAll("div.node");
            var e,
                n = nodes.length;

            
            while (n--) {
                e = nodes[n];

                var elemTop = e.offsetTop;
                var elemBottom = elemTop + e.offsetHeight;

                var isInView = ((elemTop <= viewBottom) && (elemBottom >= viewTop));
                Skype.UI.Util.setClass(e, "offscreen", !isInView);
            }

            
            this.checkIfNeedsMessagesAbove();

            this._lastScroll = logEl.scrollTop;
            this.scrollBottom = logEl.scrollHeight - logEl.scrollTop - logEl.offsetHeight;
        },

        rateCallQuality: function () {
            this._dismissCallRatingElement();
            var template = this._templates.rateCallQualityTemplate;
            template.renderItem(WinJS.Promise.wrap({})).renderComplete.
                then(this._onRateCallQualityRendered.bind(this));
        },

        _onRateCallQualityRendered: function (newChild) {
            var node = newChild.querySelector("div.rateCallQualityNode");
            this.messagesContainer.insertBefore(node, this._typingIndicatorEl);
            var qualityLabel = node.querySelector("label");
            var ariaPrefix = "aria_chat_callqualityrating_rate_";
            var rating = node.querySelector("div.rating");
            rating.setAttribute("tabindex", "-1"); 
            rating.winControl.tooltipStrings = ["", "", "", "", ""];
            this._callRatingControl = rating;
            this._wholeCallRatingElement = node;
            this.regEventListener(rating, "previewchange", function (e) {
                var rate = e.detail.tentativeRating;
                qualityLabel.innerHTML = ("conversation_ratecallquality_rate_" + rate).translate();
                node.setAttribute("aria-label", (ariaPrefix + rate).translate());
            });
            this.regEventListener(rating, "change", function () {
                var rate = rating.winControl.userRating;
                qualityLabel.innerHTML = ("conversation_ratecallquality_rate_" + rate).translate();
                node.setAttribute("aria-label", (ariaPrefix + rate).translate());
            });
            this.regEventListener(rating, "change", this.notifyCallRatingChoice.bind(this));
            this.scrollToBottom();
        },

        notifyCallRatingChoice: function () {
            if (this._callRatingControl) {
                this._callRatingControl.winControl.disabled = true;
                this.dispatchEvent(Skype.UI.Conversation.ChatLog.Events.CallRatingSelected, { rating: this._callRatingControl.winControl.userRating });
            }
        },

        _dismissCallRatingElement: function () {
            if (this._wholeCallRatingElement) {
                this._removeMessageFromContainer(this._wholeCallRatingElement);
                this._wholeCallRatingElement = null;
            }
        },

        showSendMessagePlaceholder: function (files, messageGuid) {
            var now = new Date();
            var timestamp = now.valueOf() / 1000;
            
            var transfersCount = files.length;
            var isGroupTransfer = this.conversation.participants.length > 1;
            var langToken = isGroupTransfer ? "chatitem_send_file_group" : "chatitem_send_file";
            var langTokenNum = Skype.Globalization.formatNumericID(langToken, transfersCount);

            var time = timeFormatter.format(now);
            var date = Skype.Utilities.dateAsHeaderString(now);

            var item = {
                id: messageGuid, 
                isPlaceholder: true,
                placeholderGuid: messageGuid,
                authorid: lib.myIdentity,
                timestamp: timestamp,
                members: null,
                time: time,
                date: date,
                unsupported: false,
                type: MessageType.file,
                message: langTokenNum.translate(transfersCount),
                files: files,
            };

            this._addMessage(item);

            var fileTransferControl = this._getPlaceholderFileTransferControl(messageGuid);
            if (!fileTransferControl) {
                log("showSendMessagePlaceholder: Couldn't initialize");
                return;
            }
            
            fileTransferControl.init(this._ariaMessageUpdater);
            this.scrollToBottom();
        },

        _getPlaceholderFileTransferControl: function (placeHolderMessageGuid) {
            var placeholderMessageNode = this.messagesContainer.querySelector("[data-placeholderguid='" + placeHolderMessageGuid + "']");
            if (!placeholderMessageNode) {
                log("_getPlaceholderFileTransferElm: Couldn't replace message");
                return null;
            }
            var fileTransferElm = placeholderMessageNode.querySelector("div.fileTransferMessage");
            return fileTransferElm ? fileTransferElm.winControl : null;
        },

        replaceSendMessagePlaceholder: function (messageId, realMessage) {
            var placeHolderMessageGuid = Skype.SendingTempStorage.instance.getPlaceholderMessageGuid(messageId);
            if (!placeHolderMessageGuid) {
                return false;
            }

            var fileTransferControl = this._getPlaceholderFileTransferControl(placeHolderMessageGuid);
            if (!fileTransferControl) {
                log("replaceSendMessagePlaceholder: Couldn't replace message; appending/inserting normally 2");
                return false;
            }

            
            var placeholderMsgIndex = this._messages.index(function (item) {
                return item.id === placeHolderMessageGuid;
            });

            if (placeholderMsgIndex) {
                this._messages[placeholderMsgIndex] = realMessage; 
                
                var placeholderMessageNode = this.messagesContainer.querySelector("[data-placeholderguid='" + placeHolderMessageGuid + "']");
                if (placeholderMessageNode) {
                    placeholderMessageNode.setAttribute("id", this._createMessageId(realMessage.id));
                    placeholderMessageNode.removeAttribute("data-placeholderguid");
                }
            } else {
                log("replaceSendMessagePlaceholder: Couldn't replace message in message queue !");
            }

            fileTransferControl.objectId = messageId; 
            Skype.SendingTempStorage.instance.onMessagePlaceholderRemoved(messageId);
            return true;
        },

        onPreparingSendFileFailed: function (placeHolderMessageGuid, errorCode) {
            var fileTransferControl = this._getPlaceholderFileTransferControl(placeHolderMessageGuid);
            if (!fileTransferControl) {
                log("onPreparingSendFileFailed: Couldn't find placeholder message !");
                return;
            }
            fileTransferControl.onPreparingSendFileFailed(errorCode);
        },

        _createMessageId: function (id) {
            return "msg" + id;
        },

        _getIdFromMessage: function (message) {
            var id = message.getAttribute("id");
            return id ? parseInt(id.substr(3)) : -1;
        },

        adjustScrollPositionOnKeyboardShow: function () {
            if (!this._prevKeyboardScrollTop) {
                this._prevKeyboardScrollTop = this.messagesContainer.scrollTop;
                this._keyboardHeight = Skype.Application.state.keyboardOccludedRectangle.height;
                this.messagesContainer.scrollTop += this._keyboardHeight;
            } else {
                this.messagesContainer.scrollTop = (this._prevKeyboardScrollTop != this._lastScroll) ? this._lastScroll - this._keyboardHeight : this._prevKeyboardScrollTop;
                this._prevKeyboardScrollTop = 0;
            }
        },
        
        _onHistoryCleared: function (e) {
            var idsToRemove = [];
            this._messages.forEach(function (m) {
                idsToRemove.push(m.id);
            });
            
            idsToRemove.forEach(function (m) {
                this._removeMessage(m);
            }.bind(this));
        },

        

        _onListItemActivated: function (event) {
            var listItem = event.detail.item;

            assert(WinJS.Utilities.hasClass(listItem, "list-selectable"), "Cannot activate non-list item !");

            var msgId = this._getIdFromMessage(listItem);
            assert(msgId != -1, "Every node needs to have id !");

            this._showHoldMenuForMessage(msgId, listItem.querySelector("div.message"), "top");
        },

        _getLastEditableMessageId: function () {
            var i = this._messages.length - 1, message;

            while (i >= 0) {
                message = this._messages[i--];
                if (message && message.type === Skype.Model.MessageType.text && message.authorid === lib.myIdentity) {
                    return message.id; 
                }
            }
            return null;
        },

        _getMessageText: function (conversationMessage) {
            try {
                return Skype.Utilities.unEscapeHTML(conversationMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML));
            } catch (e) {
                return conversationMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML);
            }
        },

        getLastEditableMessage: function () {
            var msg = null, text;
            var lastDisplayedId = this._getLastEditableMessageId();
            if (lastDisplayedId) {
                var conversationMessage = lib.getConversationMessage(lastDisplayedId);
                if (conversationMessage && conversationMessage.canEdit()) {
                    text = this._getMessageText(conversationMessage);
                    if (text) {
                        msg = { text: text, id: lastDisplayedId };
                    }
                }
                conversationMessage && conversationMessage.discard();
            }
            return msg;
        },

        _isTextSelected: function () {
            return (document.getSelection().toString().length > 0);
        },

        _onEditMessage: function (msgId) {
            var conversationMessage = lib.getConversationMessage(msgId);
            if (conversationMessage) {
                this.dispatchEvent(Skype.UI.Conversation.Chat.Events.EditMessageRequested, { text: this._getMessageText(conversationMessage), id: msgId, edit: true });
                conversationMessage.discard();
            }
        },

        _onRemoveMessage: function (msgId) {
            var conversationMessage = lib.getConversationMessage(msgId);
            if (conversationMessage) {
                conversationMessage.edit("", true, false, "chatlog_message_removed_legacy_text".translate());
                conversationMessage.discard();
            }
        },

        _showHoldMenuForMessage: function (msgId, anchor, position) {
            var conversationMessage = lib.getConversationMessage(msgId);
            if (!conversationMessage) {
                return;
            }
            var permissions = conversationMessage.getPermissions(),
                libType = conversationMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE),
                authorIdentity = conversationMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR),
                isDeletedMessage = conversationMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML) === "";

            conversationMessage.discard();
            if (libType !== LibWrap.Message.type_POSTED_TEXT || authorIdentity !== lib.myIdentity) {
                return; 
            }

            var menuCommands = [{
                id: 'edit',
                disabled: !(permissions & LibWrap.Message.permissions_PERM_EDITABLE) || isDeletedMessage,
                type: 'button',
                label: "chatlog_holdmenu_item_edit_message".translate(),
                onclick: this._onEditMessage.bind(this, msgId)
            }, {
                id: 'remove',
                disabled: !(permissions & LibWrap.Message.permissions_PERM_DELETABLE) || isDeletedMessage,
                type: 'button',
                label: "chatlog_holdmenu_item_remove_message".translate(),
                onclick: this._onRemoveMessage.bind(this, msgId)
            }];

            this.holdMenu = this.holdMenu || Skype.UI.Menu.create("CHATLOG_HOLD_MENU");
            if (this.holdMenu.hidden) {
                this.holdMenu.commands = menuCommands;
                this.holdMenu.show(anchor, position, Skype.Globalization.isRightToLeft() ? 'right' : 'left');
            }
        },

        _onHoldGesture: function (evt) {
            if (this._isTextSelected()) {
                return;
            }

            switch (evt.type) {
                case "pointerdown":
                    Skype.UI.Util.getGestureObjectForEvent(evt).addPointer(evt.pointerId);
                    break;
                case "MSGestureHold":
                    var listItem = WinJS.Utilities.hasClass(event.target, "list-selectable") ? event.target :
                        Skype.UI.Util.getParentElementByClass(event.target, "list-selectable");
                    if (listItem) {
                        var msgId = this._getIdFromMessage(listItem);
                        if (msgId !== -1) {
                            this._showHoldMenuForMessage(msgId, listItem.querySelector("div.message"), "top");
                        }
                    }
                    break;
            }
        },

    }, {
        Events: {
            CallRatingSelected: "CallRatingSelected",
            CallRatingCancelled: "CallRatingCancelled",
            IncomingMessageAdded: "IncomingMessageAdded",
        }
    });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        ChatLog: WinJS.Class.mix(chatLog, Skype.Model.hierarchicalMixin)
    });

})(Skype);