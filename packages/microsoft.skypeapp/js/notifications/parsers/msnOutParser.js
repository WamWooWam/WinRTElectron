

(function () {
    "use strict";

    
    var MsnParserBase = Skype.Notifications.RAW.Parsers.MsnParserBase;

    var msnOutParser = WinJS.Class.derive(MsnParserBase, function constructor(notification) {
        MsnParserBase.prototype.constructor.call(this, notification);
    }, {
        
        _getResultTemplate: function() {
            return {
                sessionId: "",
                command: Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.OUT
            };
        },

        _parseNotification: function () {
            var parsingResult = MsnParserBase.prototype._parseNotification.call(this);

            if (parsingResult.status === Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.COMPLETE) {
                this._parseHeaders(this._incomingMessage.headers);
                this._rawMessage.sessionId = this._headersMap["session-id"];
            }
            return parsingResult;
        },
    }, {
        canParse: function (notification) {
            return MsnParserBase.isMsnMessage(notification, Skype.Notifications.RAW.Parsers.MsnParserBase.Commands.OUT);
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        MsnOutParser: msnOutParser
    });
})();