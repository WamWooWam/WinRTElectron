

(function () {
    "use strict";

    var ParserBase = Skype.Notifications.RAW.Parsers.ParserBase;

    var abchNotificationParser = WinJS.Class.derive(ParserBase, function constructor(notification) {
        ParserBase.prototype.constructor.call(this, notification);
    }, {
        
        _getResultTemplate: function () {
            return [];
        },

        _parseNotification: function () {
            var parsingResult = {
                type: ParserBase.MessageType.UNKNOWN,
                status: null
            }, message;

            var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
            try {                
                xmlDoc.loadXml(this._notification);
                message = xmlDoc.selectSingleNode("/Notification/FolderList/Folder");
                if (message) {
                    parsingResult.type = ParserBase.MessageType.ABCH;
                }
                parsingResult.status = ParserBase.ParsingStatus.COMPLETE;
            } catch (exception) {
                parsingResult.status = ParserBase.ParsingStatus.ERROR;
            }
            return parsingResult;
        },
    }, {
        canParse: function (notification) {
            var xmlDoc = new Windows.Data.Xml.Dom.XmlDocument();
            try {
                xmlDoc.loadXml(notification);
                return true;
            } catch(exception) {
                return false;
            }            
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        AbchNotificationParser: abchNotificationParser
    });
})();