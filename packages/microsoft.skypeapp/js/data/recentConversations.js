

(function () {
    "use strict";

    var MESSAGE_LESS_LOCAL_STATUSES = [LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME, LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE,
                                        LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY, LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY];

    var recentConversation = MvvmJS.Class.define(function (libConv) {
        this.conversation = Skype.Model.ConversationFactory.createConversation(libConv);
        this.libConversation = libConv;
        this._initData();
    },
        {
            conversation: null,

            id: {
                get: function () {
                    return this.conversation.id;
                }
            },

            identity: {
                get: function () {
                    return this.conversation.identity;
                }
            },
            contact: {
                get: function () {
                    return this.conversation.contact;
                }
            },

            liveStatus: {
                get: function () {
                    return this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS);
                }
            },

            formatTime: function () {
                this.formattedMessageFooter = Skype.Utilities.dateAsRecentConversationTime(this.time, this.contact && this.contact.type);
            },

            formatMessageFooter: function () {
                var isLive = this.liveStatus === LibWrap.Conversation.local_LIVESTATUS_IM_LIVE;
                var isHold = this.liveStatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY ||
                             this.liveStatus === LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY;

                if (isHold) {
                    this.formattedMessageFooter = "recent_callonhold".translate();
                } else if (isLive) {
                    this.formattedMessageFooter = "recent_currentcall_status".translate();
                } else {
                    this.formatTime();
                }
            },
            _initData: function () {
                this._refreshMessageFooter();
                this._refreshUnread();
            },
            alive: function () {
                this.conversation.alive();

                this._reloadLastMessage();

                if (this._propertyChangeSubscription) {
                    return;
                }

                var prop2handlerMap = {};
                prop2handlerMap[LibWrap.PROPKEY.conversation_UNCONSUMED_NORMAL_MESSAGES] = this._refreshUnread.bind(this);
                prop2handlerMap[LibWrap.PROPKEY.conversation_UNCONSUMED_SUPPRESSED_MESSAGES] = this._refreshUnread.bind(this);
                prop2handlerMap[LibWrap.PROPKEY.conversation_CONSUMPTION_HORIZON] = this._refreshUnread.bind(this);
                prop2handlerMap[LibWrap.PROPKEY.conversation_INBOX_MESSAGE_ID] = this._reloadLastMessage.bind(this);
                prop2handlerMap[LibWrap.PROPKEY.conversation_LOCAL_LIVESTATUS] = this._refreshLiveStatus.bind(this);
                prop2handlerMap[LibWrap.PROPKEY.conversation_INBOX_TIMESTAMP] = this._refreshMessageFooter.bind(this);

                this._propertyChangeSubscription = this.conversation.subscribePropertyChanges(prop2handlerMap);
            },

            _onDispose: function () {
                this._libMessage && this._libMessage.discard();
                this.conversation && this.conversation.dispose();
            },

            _createLiveStatusMessage: function () {
                var message = new Skype.Model.Message();
                message.type = Skype.Model.MessageType.call;
                message.details = new Skype.Model.CallMessageDetails(Skype.Model.CallStatus.current, Skype.Model.CallType.incoming); 

                return message;
            },

            _refreshLiveStatus: function () {

                var isLiveStatusMessage = MESSAGE_LESS_LOCAL_STATUSES.contains(this.liveStatus);

                var message = isLiveStatusMessage ? this._createLiveStatusMessage() : this.message;

                if (message) {
                    this._updateCallMessage(message);
                    this.message = message;
                } else {
                    log("RecentConversation._refreshLiveStatus: could not update call message because this.message doesn't exist");
                }
            },

            _refreshUnread: function () {
                var unreadNormalMessages = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_UNCONSUMED_NORMAL_MESSAGES);
                var unreadSuppressedMessages = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_UNCONSUMED_SUPPRESSED_MESSAGES);
                var hasUnreadMessages = unreadNormalMessages !== 0 || unreadSuppressedMessages !== 0;

                var isUnread = false;
                if (hasUnreadMessages) {
                    isUnread = true;
                }
                this.isUnread = isUnread;
                this.formattedAriaUnreadLabel = this.isUnread ? "aria_hub_recent_unread_msg".translate("", "", "") : "";
            },
            _refreshMessageFooter: function () {
                var timestamp = this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_INBOX_TIMESTAMP);
                if (isNaN(timestamp)) {
                    return;
                }

                var messageTimestamp = this.message && this.message.timestamp;
                timestamp = Math.max(timestamp, messageTimestamp);
                if (isNaN(timestamp)) {
                    return;
                }

                this.time = new Date(timestamp * 1000);
                this.formatMessageFooter();
            },

            _getPreviousMessage: function (message) {
                var context = new LibWrap.VectUnsignedInt();

                this.conversation.libConversation.loadMessages(message.timestamp + 1, 2, false, context);
                if (context.getCount() > 1) {
                    return lib.getConversationMessage(context.get(1));
                }
                return null;
            },

            _reloadLastMessage: function () {
                log("Going to update {0}'s recent message".format(this.identity));

                var message = this.conversation.getLastMessage();
                if (!message) {
                    log("RecentConversation._reloadLastMessage: could not get last conversation message");
                    return;
                }

                var libMessage = lib.getConversationMessage(message.id);
                this._updateLastMessage(libMessage, message);
                this._refreshMessageFooter();
            },

            _updateCallMessage: function (message, libMessage) {
                log("RecentConversation._updateCallMessage: message.type = " + message.type);

                var resultState;

                if (message.type === Skype.Model.MessageType.call) {

                    switch (this.liveStatus) {
                        case LibWrap.Conversation.local_LIVESTATUS_RINGING_FOR_ME:
                            resultState = Skype.Model.CallStatus.incoming;
                            break;
                        case LibWrap.Conversation.local_LIVESTATUS_IM_LIVE:
                            resultState = Skype.Model.CallStatus.current;
                            break;
                        case LibWrap.Conversation.local_LIVESTATUS_NONE:
                        case LibWrap.Conversation.local_LIVESTATUS_RECENTLY_LIVE:
                             
                            if (message.details.status === Skype.Model.CallStatus.canJoin) {
                                resultState = Skype.Model.CallStatus.missed;
                            } else {
                                resultState = message.details.status === Skype.Model.CallStatus.current ? Skype.Model.CallStatus.done : message.details.status;
                            }
                            break;
                        case LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE:
                        case LibWrap.Conversation.local_LIVESTATUS_OTHERS_ARE_LIVE_FULL:
                            resultState = Skype.Model.CallStatus.canJoin;
                            message.details.callMsgText = "recent_join_call".translate();
                            break;
                        case LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_LOCALLY:
                        case LibWrap.Conversation.local_LIVESTATUS_ON_HOLD_REMOTELY:
                            
                            resultState = Skype.Model.CallStatus.hold;
                            break;
                        case LibWrap.Conversation.local_LIVESTATUS_STARTING:
                            resultState = Skype.Model.CallStatus.starting;
                            break;
                            
                        default:
                            resultState = Skype.Model.CallStatus.current;
                            break;
                    }

                    message.details.status = resultState;
                    if (resultState === Skype.Model.CallStatus.current ||
                        resultState === Skype.Model.CallStatus.hold) {
                        if (!this.updateDurationTimer) {
                            message.details.formattedDuration = this.conversation.formattedDuration;
                            this.updateDurationTimer = this.regInterval(function () {
                                
                                this.message.details.formattedDuration = this.conversation.formattedDuration;
                            }.bind(this), 1000);
                        }
                        this._refreshMessageFooter();
                        return;
                    }

                    
                    if (resultState === Skype.Model.CallStatus.done) {
                        var prevLibMessage = this._getPreviousMessage(message);
                        var someMessagesBetween = prevLibMessage && libMessage && libMessage.getOtherLiveMessage() !== prevLibMessage.getObjectID();
                        message.details.callMsgText = (someMessagesBetween ? "recent_call_ended" : "recent_call").translate();
                        if (someMessagesBetween) {
                            message.details.callType = Skype.Model.CallType.unknown;
                        }
                    }

                    
                    if (resultState === Skype.Model.CallStatus.incoming) {
                        var msgText = this.conversation.isIncomingVideoCall() ? "recent_incomingvideocall" : "recent_incomingcall";
                        message.details.callMsgText = msgText.translate();
                    }
                }

                if (this.updateDurationTimer) {
                    this.unregInterval(this.updateDurationTimer);
                    this.updateDurationTimer = 0;
                }
                this._refreshMessageFooter();
            },

            _updateLastMessage: function (libMessage, message) {
                var id = libMessage && libMessage.getObjectID() || -1;
                var libType = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);

                log("Updating recent message - identity {0} message ID {1} type {2}".format(this.identity, id, libType));
                message = message || Skype.Model.MessageFactory.createMessage(libMessage);
                if (message) {
                    this._updateCallMessage(message, libMessage);

                    this.message = message;
                    this._handleMessageTextChanged(this.message, libMessage);
                    this._monitorTextChanged(libMessage);
                } else {
                    this.message = {
                        id: 0,
                        type: Skype.Model.MessageType.unknown,
                        details: "\"{0}\" is not supported on this device".format(LibWrap.Message.typetoString(libType))
                    };
                }
                roboSky.write("RecentConversation,updated");
                },

            _monitorTextChanged: function (libMessage) {
                this._messageMonitoring && this._messageMonitoring.dispose();
                this._libMessage && this._libMessage.discard();

                this._libMessage = libMessage;

                var prop2handlerMap = {};
                prop2handlerMap[LibWrap.PROPKEY.message_BODY_XML] = [this._refreshLastMessageText.bind(this)];

                this._messageMonitoring = Skype.Utilities.subscribePropertyChanges(this._libMessage, prop2handlerMap);
            },
            _refreshLastMessageText: function () {
                if (this._libMessage) {
                    var message = Skype.Model.MessageFactory.createMessage(this._libMessage);
                    if (message) {
                        this.message = message;
                        this._updateCallMessage(this.message, this._libMessage);
                        this._handleMessageTextChanged(this.message, this._libMessage);                        
                    }
                }
            },
            _handleMessageTextChanged: function(message, libMessage) {
                if ([Skype.Model.MessageType.text, Skype.Model.MessageType.sms].contains(message.type)) {
                    message.details = Skype.Utilities.trimHtmlWhitespaces(message.details);
                    if (this.libConversation.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_CONFERENCE) {
                        message.details = "recent_group_named_msg".translate(libMessage.getAuthorDisplayNameHtml(), message.details);
                    }
                }
            }
        }, {
            message: null,
            isUnread: false,
            formattedAriaUnreadLabel: "",

            time: null,
            formattedMessageFooter: null
        });

    WinJS.Namespace.define("Skype.Model", {
        RecentConversation: recentConversation
    });

    window.traceClassMethods && window.traceClassMethods(recentConversation, "RecentConversation",
        ["alive", "_reloadLastMessage"]);

}());

