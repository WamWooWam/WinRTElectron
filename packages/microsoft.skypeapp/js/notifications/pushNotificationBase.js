

(function () {
    "use strict";

    var pushNotification = WinJS.Class.define(function constructor() {
    }, {
        
        
        
        _getDisplayName: function (identity, notificationName) {
            var name = this._getDisplayNameFromContact(identity);
            if (!name || name === identity) {
                name = this._getDisplayNameFromConversation(identity);
                if (!name || name === identity) {
                    name = notificationName;
                }
            }
            return name;
        },
        
        
        _getConversationDisplayName: function (identity, notificationName) {
            var name = this._getDisplayNameFromConversation(identity);
            return (name && name !== identity) ? name : notificationName;
        },
        
        
        _getContactDisplayName: function (identity, notificationName) {
            var name = this._getDisplayNameFromContact(identity);
            return (name && name !== identity) ? name : notificationName;
        },
        
        
        _getDisplayNameFromConversation: function (identity) {
            var name, libObj;

            if (lib) {
                libObj = lib.getConversationByIdentity(identity);
                if (libObj) {
                    name = libObj.getStrProperty(LibWrap.PROPKEY.conversation_DISPLAYNAME);
                    libObj.discard();
                }
            }
            
            return name;
        },
        
        _getDisplayNameFromContact: function (identity) {
            var name, libObj;

            if (lib) {
                libObj = lib.getContactByIdentity(identity);
                if (libObj) {
                    name = libObj.getStrProperty(LibWrap.PROPKEY.contact_DISPLAYNAME);
                    libObj.discard();
                }
            }

            return name;
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        PushNotificationBase: pushNotification
    });

}());


