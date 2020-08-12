

(function () {
    "use strict";

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

    var parserBase = WinJS.Class.define(function constructor(notification) {
        this._notification = notification;
    }, {
        _rawMessage: null,
        
        
        _notification: null,
        
        
        _getResultTemplate: function () {
            
            
            throw "RAW parser must implement _getResultTemplate method";    
        },
        
        
        _parseNotification: function() {
            throw "RAW parser must implement _parseNotification method";
        },

        parse: function() {
            if (!this._notification) {
                return null;
            }

            this._rawMessage = this._getResultTemplate();
            var parseResult = this._parseNotification();
            
            return {
                type: parseResult.type,
                status: parseResult.status,
                content: this._rawMessage
            };
        }
    }, {
        canParse: function (notification) {
            
            return false;
        },
        ParsingStatus: {
            ERROR: 0,
            VALIDATION_ERROR: 1,
            COMPLETE: 2,
            INCOMPLETE: 3
        },
        MessageType: {
            UNKNOWN: 0,
            MSN: 1, 
            PNH: 2, 
            ABCH: 3   
        }
    });

    WinJS.Namespace.define("Skype.Notifications.RAW.Parsers", {
        ParserBase: parserBase
    });
})();