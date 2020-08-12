

(function () {
    "use strict";

    var ParserBase = Skype.Notifications.RAW.Parsers.ParserBase;

    var callNotificationParser = WinJS.Class.derive(ParserBase, function constructor(notification) {
        ParserBase.prototype.constructor.call(this, notification);
    }, {
        _getResultTemplate: function () {
            return {
                eventType: 0,
                genericPayload: "",
                nodeSpecificPayload: "",
                callerId: "",
                displayName: "",
                conversationIdentity: "",
                callId: "",
                answerType: null
            };
        },

        _parseNotification: function () {
            var parsingResult = {
                type: ParserBase.MessageType.PNH,
                status: null
            },
            message;

            try {
                message = JSON.parse(this._notification);
                if (message.id && message.evt && message.nsp && message.gp) {
                    
                    this._rawMessage.eventType = Number(message.evt);
                    this._rawMessage.genericPayload = message.gp;
                    this._rawMessage.nodeSpecificPayload = message.nsp;
                    this._rawMessage.displayName = message.displayName;
                    this._rawMessage.callerId = this._parseIdentity(this._rawMessage.eventType, message.id);
                    this._rawMessage.conversationIdentity = this._parseIdentity(this._rawMessage.eventType, message.convoId);
                    this._rawMessage.callId = message.convoCallId;
                    this._rawMessage.answerType = message.answerType; 
                    parsingResult.status = ParserBase.ParsingStatus.COMPLETE;
                } else if (message.identity && message.action) {
                    
                    this._rawMessage.callerId = message.identity;
                    this._rawMessage.conversationIdentity = message.identity;
                    this._rawMessage.answerType = message.action === "audio" ? "voice" : message.action; 
                    parsingResult.status = ParserBase.ParsingStatus.COMPLETE;
                } else {
                    log("CallNotificationParser: At least one of mandatory properties is missing.");
                    parsingResult.status = ParserBase.ParsingStatus.VALIDATION_ERROR;
                }

            } catch (exception) {
                log("CallNotificationParser: Error while parsing notification. " + exception);
                parsingResult.type = ParserBase.MessageType.UNKNOWN;
                parsingResult.status = ParserBase.ParsingStatus.ERROR;
            }
            return parsingResult;
        },

        _parseIdentity: function (eventType, conversationId) {
            if (!conversationId) {
                return conversationId;
            }

            if (eventType === Skype.Notifications.RAW.Parsers.CallNotificationParser.EventTypes.INCOMING_LYNC_CALL) {
                
                if (!conversationId.startsWith("2:")) {
                    return "2:" + conversationId;
                }
            }

            return conversationId;
        }

    }, {
        canParse: function (notification) {
            try {
                var message = JSON.parse(notification);
                
                return message.id && message.evt && message.nsp && message.gp || message.identity && message.action;
            } catch (exception) {
                return false;
            }
        },

        EventTypes: {
            INCOMING_CALL: 100,
            INCOMING_LYNC_CALL: 103
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        CallNotificationParser: callNotificationParser
    });
})();