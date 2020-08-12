

(function () {
    "use strict";
    
    
    var MsnParserBase = Skype.Notifications.RAW.Parsers.MsnParserBase;
    var ParserBase = Skype.Notifications.RAW.Parsers.ParserBase;

    var msnCntParser = WinJS.Class.derive(MsnParserBase, function constructor(notification) {
        MsnParserBase.prototype.constructor.call(this, notification);
    }, {
        
        _getResultTemplate: function() {
            return {
                sessionId: "",
                sessionTimeout: 0,
                command: Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.CNT
            };
        },

        _parseNotification: function () {
            var parsingResult = MsnParserBase.prototype._parseNotification.call(this);

            if (parsingResult.status !== Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.COMPLETE) {
                return parsingResult;
            }
            
            var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
            try {
                xmlDoc.loadXml(this._incomingMessage.body);
                this._rawMessage.sessionId = xmlDoc.selectSingleNode("/connect-response/session/id").innerText;
                this._rawMessage.sessionTimeout = Number(xmlDoc.selectSingleNode("/connect-response/session/timeout").innerText);
            } catch (exception) {
                parsingResult.status = ParserBase.ParsingStatus.ERROR;
            }
            return parsingResult;
        },
    }, {
        canParse: function(notification) {
            return MsnParserBase.isMsnMessage(notification, Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.CNT);
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        MsnCntParser: msnCntParser
    });
})();