

(function () {
    "use strict";

    var ParserBase = Skype.Notifications.RAW.Parsers.ParserBase;

    var msnParserBase = WinJS.Class.derive(Skype.Notifications.RAW.Parsers.ParserBase, function constructor(notification) {
        ParserBase.prototype.constructor.call(this, notification);
        this._incomingMessage = {
            command: null,
            trid: 0,
            namespace: null,
            length: 0,
            headers: null,
            body: null
        };
        this._headersMap = {};
    }, {
        _incomingMessage: null,
        _headersMap: null,


        _parseNotification: function () {
            var parsingResult = {
                type: ParserBase.MessageType.MSN,
                status: ParserBase.ParsingStatus.COMPLETE
            };

            var commandLineString = this._notification.substring(0, this._notification.indexOf("\r\n"));
            var parts = commandLineString.split(" ");

            this._incomingMessage.command = parts[0];
            this._incomingMessage.trid = Number(parts[1]);
            this._incomingMessage.namespace = parts[2];
            this._incomingMessage.length = Number(parts[3]);

            
            var rest = this._notification.substr(commandLineString.length + 2, this._incomingMessage.length + 2);

            
            
            if (rest.length !== this._incomingMessage.length && this._getUTF8BytesCount(rest) !== this._incomingMessage.length) {
                parsingResult.status = ParserBase.ParsingStatus.INCOMPLETE;
            } else {
                this._incomingMessage.headers = rest.substring(0, rest.indexOf("\r\n\r\n"));
                if (this._incomingMessage.headers.length) {
                    this._incomingMessage.body = rest.substring(this._incomingMessage.headers.length + 4);
                } else {
                    this._incomingMessage.body = rest.substring(rest.indexOf("\r\n") + 2);
                }
            }
            return parsingResult;
        },
        
        _parseHeaders: function(headersString) {
            this._headersMap = {};
            headersString.split("\r\n").forEach(function (line) {
                var header = line.split(": ");
                if (header.length > 1) {
                    var valueStartPosition = header[0].length + 2; 
                    this._headersMap[header[0].toLocaleLowerCase()] = line.substring(valueStartPosition);
                }
            }.bind(this));
        },

        _getUTF8BytesCount: function (inputString) {
            var bytesCount = 0;
            for (var i = 0; i < inputString.length; i++) {
                var c = inputString.charCodeAt(i);
                if (c < 128) {
                    bytesCount++;
                } else if ((c > 127) && (c < 2048)) {
                    bytesCount = bytesCount + 2;
                } else {
                    bytesCount = bytesCount + 3;
                }
            }
            return bytesCount;
        }

    }, {
        isMsnMessage: function(notification, command) {
            return notification && notification.startsWith(command);
        },
        Commands: {
            SDG: "SDG",
            CNT: "CNT",
            OUT: "OUT"
        },
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        MsnParserBase: msnParserBase
    });
})();