

(function () {
    "use strict";

    var SDG_LAYERS = {
        ROUTING: 0,
        RELIABILITY: 1,
        MESSAGING: 2,
        BODY: 3
    };

    var SDG_BODY_TYPE = {
        Files: "RichText/Files",
        Contacts: "RichText/Contacts",
        Sms: "RichText/Sms",
        Text: "Text",
        RichText: "RichText",
        VideoMessage: "Event/SkypeVideoMessage",
    };
    
    
    var entitiesMap = {
        "&lt;": "<",
        "&gt;": ">",
        "&amp;": "&",
        "&quot;": "\"",
        "&apos;": "'"
    };

    
    
    var SKYPE_IDENTITY_NAMESPACE = "8:";

    
    var MsnParserBase = Skype.Notifications.RAW.Parsers.MsnParserBase;

    var msnSdgParser = WinJS.Class.derive(MsnParserBase, function constructor(notification) {
        MsnParserBase.prototype.constructor.call(this, notification);
    }, {

        _getResultTemplate: function () {
            return {
              from: {
                  identity: "",
                  name: ""
              },
              to: {
                  identity: "",
                  group: false,
              },
              body: {
                  type: "",
                  content: ""
              },
              ignore: true,
              isVisualNotification: false,
              command: Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.SDG
            };
        },

        _isVisualNotification: function() {
            for (var key in SDG_BODY_TYPE) {
                if (SDG_BODY_TYPE[key] === this._rawMessage.body.type) {
                    return true;
                }
            }
            return false;
        },

        _parseNotification: function () {
            var parsingResult = MsnParserBase.prototype._parseNotification.call(this);

            if (parsingResult.status !== Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.COMPLETE) {
                return parsingResult;
            }

            var layers = this._incomingMessage.body.split("\r\n\r\n");
            this._parseHeaders(layers.slice(SDG_LAYERS.ROUTING, SDG_LAYERS.MESSAGING + 1).join("\r\n"));

            
            this._rawMessage.from.identity = this._parseIdentity("from");
            this._rawMessage.from.name = this._headersMap["im-display-name"];
            this._rawMessage.body.type = this._headersMap["message-type"];
            this._rawMessage.body.threadTopic = this._headersMap["thread-topic"];
            if (this._rawMessage.body.threadTopic) {
                this._rawMessage.body.threadTopic = this._decodeSpecialEntities(this._rawMessage.body.threadTopic);
            }
            this._rawMessage.body.content = layers[SDG_LAYERS.BODY];
            this._rawMessage.ignore = this._headersMap["skype-ignore"] === "1" ? true : false;
            
            this._rawMessage.isVisualNotification = this._isVisualNotification();

            
            if (!this._rawMessage.from.name) {
                this._rawMessage.from.name = this._rawMessage.from.identity;
            }

            
            if (this._headersMap["to"].startsWith("19:")) {
                this._rawMessage.to.identity = this._headersMap["to"];
                this._rawMessage.to.group = true;
            } else {
                this._rawMessage.to.identity = this._parseIdentity("to");
            }

            this._parseBody();

            return parsingResult;
        },

        _parseIdentity: function(headerId) {
            var identity = this._headersMap[headerId];
            if (!identity) {
                return "";
            }

            
            var parts = identity.split(";");
            if (parts.length > 0) {
                identity = parts[0];
                

                if (identity.startsWith(SKYPE_IDENTITY_NAMESPACE)) {
                    
                    identity = identity.substr(SKYPE_IDENTITY_NAMESPACE.length);
                }
            }
            return identity;
        },

        _parseBody: function () {
            
            
            switch (this._rawMessage.body.type) {
                case SDG_BODY_TYPE.Files:
                    var xml = new Windows.Data.Xml.Dom.XmlDocument();
                    var filesSent;
                    try {
                        xml.loadXml(this._rawMessage.body.content);
                        filesSent = xml.selectNodes("/files/file").size;
                    } catch (exception) {
                        
                        filesSent = 1;
                    }
                    this._rawMessage.body.content = Skype.Globalization.formatNumericID("chatitem_receive_file", filesSent).translate(filesSent);
                    break;
                case SDG_BODY_TYPE.Contacts:
                    this._rawMessage.body.content = "chatitem_receive_contact".translate("").trim();
                    break;
                case SDG_BODY_TYPE.Sms:
                    var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
                    try {
                        xmlDoc.loadXml(this._rawMessage.body.content);
                        this._rawMessage.body.content = xmlDoc.selectSingleNode("/sms/encoded_body").innerText;
                    } catch (exception) {
                    }
                    break;
                case SDG_BODY_TYPE.VideoMessage:
                    this._rawMessage.body.content = "chatitem_received_videomessage".translate();
                    break;
                default:                    
                    this._rawMessage.body.content = this._decodeSpecialEntities(this._rawMessage.body.content);
                    break;
            }
        },
        
        _decodeSpecialEntities: function (content) {
            
            var decodedContent = content.replace(/<(?:.|\n)*?>/gm, '');
            decodedContent = decodedContent.replace(/&[a-z]*;/g, function (entity) {
                return (entity in entitiesMap) ? entitiesMap[entity] : entity;
            });
            return decodedContent;
        }
    }, {
        canParse: function (notification) {
            return MsnParserBase.isMsnMessage(notification, Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.SDG);
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        MsnSdgParser: msnSdgParser
    });
})();