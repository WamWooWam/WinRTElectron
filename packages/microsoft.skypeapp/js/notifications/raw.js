

(function () {
    "use strict";

    var parsers = [
        Skype.Notifications.RAW.Parsers.CallNotificationParser,
        Skype.Notifications.RAW.Parsers.MsnCntParser,
        Skype.Notifications.RAW.Parsers.MsnOutParser,
        Skype.Notifications.RAW.Parsers.MsnSdgParser,
        Skype.Notifications.RAW.Parsers.AbchNotificationParser
    ];

    function parse(notification) {
        for (var i = 0; i < parsers.length; i++) {
            var Parser = parsers[i];
            if (Parser.canParse(notification)) {
                var parserInstance = new Parser(notification);
                return parserInstance.parse();
            }
        }

        log("Skype.Notifications.RAW: no parser for notification.");
        return {
            type: Skype.Notifications.RAW.Parsers.ParserBase.MessageType.UNKNOWN,
            status: Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.ERROR,
            content: {}
        };
    }

    
    function getConversationIdFromCallNotification(notification) {
        var conversationId = notification.conversationIdentity ? notification.conversationIdentity : notification.callerId;
        return conversationId;
    }

    WinJS.Namespace.define("Skype.Notifications.RAW", {
        parse: parse,
        getConversationIdFromCallNotification: getConversationIdFromCallNotification
    });
})();