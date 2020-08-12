

 (function () {
     "use strict";
     var MessageType = Skype.Model.MessageType;
     var CallMessageDetails = Skype.Model.CallMessageDetails;
     var CallType = Skype.Model.CallType;
     var CallStatus = Skype.Model.CallStatus;
     var SYSTEM_IDENTITY = "sys";

     var MessageFactory = WinJS.Class.define(null, null, {
        createMessage: function (libMessage) {
            var message = new Skype.Model.Message(libMessage);
            var libType = libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE);
            var me = lib.myIdentity;
            var author = libMessage.getAuthorDisplayNameHtml();
            var authorIdentity = libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR);
            var editor;
            var msgText;
            var iAmAuthor = authorIdentity === me;
            switch (libType) {
                case LibWrap.Message.type_POSTED_TEXT:
                case LibWrap.Message.type_POSTED_EMOTE:
                    message.type = MessageType.text;

                    var isLyncContact = authorIdentity.substring(0, 1) === "2";
                    var txt = isLyncContact ? Skype.UI.Util.decodeHTMLEntities(libMessage.getBodyHtml()) : libMessage.getBodyHtml();

                    
                    msgText = authorIdentity === SYSTEM_IDENTITY ? txt : Skype.Globalization.createBiDiString(txt);
                                        
                    editor = libMessage.getStrProperty(LibWrap.PROPKEY.message_EDITED_BY);
                    message.edited = editor !== "" && msgText !== "";
                    if ((editor !== "") && (libMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML) === "")) {
                        message.details = '<span class="deleted">' + "chat_message_removed".translate() + "</span>";
                    } else {
                        if (libType === LibWrap.Message.type_POSTED_EMOTE) {
                            msgText = "<a class='meInnerLink kb-accessible'>{0}</a> ".format(author) + msgText;
                        }
                        message.details = msgText;
                    }
                    break;
                case LibWrap.Message.type_REQUESTED_AUTH:
                    message.type = MessageType.auth;
                    
                    if (!iAmAuthor) {
                        
                        message.details = libMessage.getBodyHtml() != "" ? libMessage.getBodyHtml() : "authrequest_placeholder".translate(me);
                    } else {
                        
                        message.details = libMessage.getBodyHtml();
                    }
                    break;
                case LibWrap.Message.type_GRANTED_AUTH:
                    message.type = MessageType.authorized;
                    message.details = "chatitem_authorized".translate(author);
                    break;
                case LibWrap.Message.type_POSTED_CONTACTS:
                    message.type = MessageType.contacts;
                    if (iAmAuthor) {
                        message.details = "chatitem_sent_contact".translate();
                    } else {
                        message.details = "chatitem_receive_contact".translate(author);
                    }
                    break;
                case LibWrap.Message.type_POSTED_FILES:
                    message.type = MessageType.file;
                    var transfersCount = Skype.FileTransfer.getFileTransferCount(libMessage);
                    var isGroupTransfer = Skype.FileTransfer.isGroupTransfer(libMessage);
                    var transferType = Skype.FileTransfer.getTransferType(libMessage);
                    var isIncomingTransfer = transferType === Skype.FileTransfer.TransferType.Incoming;
                    var langToken, langTokenNum, langTokenNumSimple, details;

                    if (!isIncomingTransfer) { 
                        langToken = isGroupTransfer ? "chatitem_send_file_group" : "chatitem_send_file";
                        langTokenNum = Skype.Globalization.formatNumericID(langToken, transfersCount);
                        details = langTokenNum.translate(transfersCount);
                        message.details = details;
                        message.simpleDetails = details;
                    } else {
                        langToken = isGroupTransfer ? "chatitem_receive_file_group" : "chatitem_receive_file";
                        langTokenNum = Skype.Globalization.formatNumericID(langToken, transfersCount);
                        langTokenNumSimple = Skype.Globalization.formatNumericID("chatitem_receive_file", transfersCount);
                        message.details = isGroupTransfer ? langTokenNum.translate(author, transfersCount) : langTokenNum.translate(transfersCount);
                        message.simpleDetails = langTokenNumSimple.translate(transfersCount);
                    }
                    break;
                case LibWrap.Message.type_POSTED_VOICE_MESSAGE:
                    message.type = MessageType.voicemail;
                    if (iAmAuthor) {
                        message.details = "chatitem_sent_voicemail".translate();
                    } else {
                        message.details = "chatitem_receive_voicemail".translate(author);
                    }
                    break;
                case LibWrap.Message.type_POSTED_VIDEO_MESSAGE:
                    message.type = MessageType.videomessage;
                    message.details = {};
                    message.details.libMsgId = libMessage.getObjectID();
                    if (iAmAuthor) {
                        message.details.infoMsg = "chatitem_sent_videomessage".translate();
                    } else {
                        message.details.infoMsg = "chatitem_received_videomessage".translate();
                    }
                    break;
                case LibWrap.Message.type_POSTED_SMS:
                    message.type = MessageType.sms;
                    message.details = Skype.Utilities.trimHtmlWhitespaces(libMessage.getBodyHtml()); 
                    break;
                case LibWrap.Message.type_SPAWNED_CONFERENCE:

                    var newConv = libMessage.getStrProperty(LibWrap.PROPKEY.message_CONVO_GUID);
                    message.type = MessageType.group;
                    message.details = "chatitem_created_group".translate(author, newConv);
                    break;
                case LibWrap.Message.type_SET_METADATA:
                    message.type = MessageType.group;
                    var what = libMessage.getIntProperty(LibWrap.PROPKEY.message_PARAM_KEY);
                    switch (what) {
                        case LibWrap.Message.set_METADATA_KEY_SET_META_TOPIC:
                            message.details = "chatitem_topic_set".translate(author, libMessage.getBodyHtml());
                            break;
                        case LibWrap.Message.set_METADATA_KEY_SET_META_PICTURE:
                            message.details = "chatitem_picture_set".translate(author);
                            break;
                    }
                    break;
                case LibWrap.Message.type_BLOCKED:
                case LibWrap.Message.type_ADDED_CONSUMERS:
                case LibWrap.Message.type_RETIRED:
                case LibWrap.Message.type_RETIRED_OTHERS:
                case LibWrap.Message.type_ADDED_LEGACY_CONSUMERS:
                case LibWrap.Message.type_LEGACY_MEMBER_UPGRADED:
                    message.type = MessageType.group;
                    var memberIdentities = libMessage.getStrProperty(LibWrap.PROPKEY.message_IDENTITIES);

                    if (memberIdentities.length) {
                        memberIdentities = memberIdentities.split(" ");
                    }

                    var memberNames = [];
                    for (var i = 0; i < memberIdentities.length; i++) {
                        var libContact = lib.getContactByIdentity(memberIdentities[i]);
                        if (libContact) {
                            memberNames.push(libContact.getDisplayNameHtml());
                            libContact.discard();
                        }
                    }

                    switch (libType) {
                        case LibWrap.Message.type_ADDED_CONSUMERS:
                            
                            if (memberNames.length == 1 && author == memberNames[0]) {
                                message.details = "chatitem_participant_joined".translate(author);
                            } else {
                                message.details = "chatitem_participant_added".translate(author, memberNames.join(", "));
                            }
                            message.members = memberIdentities;
                            break;
                        case LibWrap.Message.type_ADDED_LEGACY_CONSUMERS:
                            message.details = this._composeMsnp24LegacyClientAddedInfo(memberNames);
                            break;
                        case LibWrap.Message.type_LEGACY_MEMBER_UPGRADED:
                            message.details = "msnp24_legacy_participant_upgraded".translate(memberNames[0]); 
                            break;
                        case LibWrap.Message.type_RETIRED_OTHERS:
                            if (memberIdentities.indexOf(me) >= 0) {
                                message.details = "chatitem_you_left".translate();
                            } else {
                                message.details = "chatitem_removed_participant".translate(author, memberNames.join(", "));
                            }
                            break;
                        case LibWrap.Message.type_RETIRED:
                            message.details = (authorIdentity === me) ? "chatitem_you_left".translate() : "chatitem_participant_left".translate(author);
                            break;
                        case LibWrap.Message.type_BLOCKED:
                            message.details = "chatitem_blocked".translate(author, memberNames.join(", "));
                            message.type = MessageType.blocked;
                            break;
                    }
                    break;
                case LibWrap.Message.type_STARTED_LIVESESSION:
                case LibWrap.Message.type_ENDED_LIVESESSION:
                    var body = libMessage.getStrProperty(LibWrap.PROPKEY.message_BODY_XML);
                    message.type = MessageType.call;
                    message.details = this._handleStartEndLivesession(body, libMessage, me, libType === LibWrap.Message.type_ENDED_LIVESESSION);
                    message.endMessage = libType === LibWrap.Message.type_ENDED_LIVESESSION;
                    break;
                
                default:
                    if (this.isSupportedMessageType(libType)) {
                        message.type = MessageType.text;
                        message.details = libMessage.getBodyHtml();
                    }
                    break;
            }

            if (!message.type) {
                return null;
            } else {
                return message;
            }
        },
        isSupportedMessageType: function (type, supportedMessages) {
            return (supportedMessages && supportedMessages.indexOf(type) !== -1) || (type > LibWrap.Message.type_MESSAGE_EXPANSION_START && type < LibWrap.Message.type_MESSAGE_EXPANSION_END);
        },
        _composeMsnp24LegacyClientAddedInfo: function (names) {
            var learnMoreUrl = "https://support.skype.com/faq/FA12361/";
            switch (names.length) {
                case 1:
                    return "msnp24_legacy_participant_added".translate(names[0], learnMoreUrl);
                case 2:
                    return "msnp24_legacy_participant_added_two".translate(names[0], names[1], learnMoreUrl);
                case 3:
                    return "msnp24_legacy_participant_added_three".translate(names[0], names[1], names[2], learnMoreUrl);
                case 4:
                    return "msnp24_legacy_participant_added_four".translate(names[0], names[1], names[2], names[3], learnMoreUrl);
                default:
                    return "msnp24_legacy_participant_added_morethanfour".translate(names[0], names[1], names[2], names[3], names.length - 4, learnMoreUrl);
            }
        },

        _getCallType: function (libMessage, me, sessionEnd) {
            var otherMsgId = libMessage.getOtherLiveMessage();
            var messageAuthor, otherMessage = otherMsgId != 0 ? lib.getConversationMessage(otherMsgId) : null;
            if (otherMessage) { 

                if (sessionEnd) {
                    messageAuthor = otherMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR);
                } else {
                    messageAuthor = libMessage.getStrProperty(LibWrap.PROPKEY.message_AUTHOR);
                }

                if (messageAuthor) {
                    return messageAuthor == me ? CallType.outgoing : CallType.incoming;
                }
                
                otherMessage.discard();
            }
            return CallType.unknown;
        },

        _handleStartEndLivesession: function (messageBody, libMessage, me, sessionEnd) {
            var callType = this._getCallType(libMessage, me, sessionEnd);
            if (messageBody) {
                var details, json = Skype.Utilities.xml2Json(messageBody);
                var leaveReason = libMessage.getIntProperty(LibWrap.PROPKEY.message_LEAVEREASON);
                var parts = json.partlist && json.partlist.part;
                var hadMultipleParticipants = Array.isArray(parts);

                if (hadMultipleParticipants) {
                    var notInParticipants = parts.every(function (item) { return item && item.identity !== me; });
                    if (notInParticipants) {
                        details = new CallMessageDetails(CallStatus.missed, callType);
                    } else {
                        if (leaveReason == LibWrap.WrSkyLib.leave_REASON_LIVE_BUSY) {
                            details = new CallMessageDetails(CallStatus.declined, callType);
                        } else {
                            var duration = null;
                            var result = parts.filter(function (x) { return x.identity == me; });
                            if (result && result.length === 1) {
                                duration = result[0].duration;
                            }
                            duration = duration && sessionEnd ? Skype.Utilities.formatDuration(parseInt(duration, 10), true) : "";
                            details = new CallMessageDetails(CallStatus.done, callType, duration);
                        }
                    }
                } else {
                    if (parts && parts.identity == me) {
                        var status;
                        switch (leaveReason) {
                            case LibWrap.WrSkyLib.leave_REASON_LIVE_NO_ANSWER:
                            case LibWrap.WrSkyLib.leave_REASON_LIVE_MANUAL:
                                status = CallStatus.noAnswer;
                                break;
                            case LibWrap.WrSkyLib.leave_REASON_LIVE_BUSY:
                                status = CallStatus.busy;
                                break;
                            default:
                                status = CallStatus.noAnswer;
                                break;
                        }
                        details = new CallMessageDetails(status, callType);
                    } else {
                        details = new CallMessageDetails(CallStatus.missed, callType);
                    }
                }
            } else {
                details = new CallMessageDetails(CallStatus.current, callType);
            }
            return details;
        },
    });

    WinJS.Namespace.define("Skype.Model", {
        MessageFactory: MessageFactory
    });

}());