

(function () {

    "use strict";

    var messagePushNotification = WinJS.Class.derive(Skype.Notifications.PushNotificationBase, function constructor(notification, rawNotification) {
        this._notification = notification;
        this._rawNotification = rawNotification;
        this._dispose = this._dispose.bind(this);
    }, {
        
        _canShowMessage: function () {
            return this._notification.isVisualNotification &&
                !this._notification.ignore &&
                Skype.Application.BackgroundState.isInBackground();
        },

        _isSdgMessage: function () {
            var MsnParserBase = Skype.Notifications.RAW.Parsers.MsnParserBase;
            return this._notification.command === MsnParserBase.Commands.SDG;
        },

        _notifyUser: function () {
            if (!this._canShowMessage()) {
                return;
            }

            var identity, displayName, content;
            if (this._notification.to.group) {
                identity = this._notification.to.identity;
                displayName = this._notification.body.threadTopic || this._getConversationDisplayName(identity, this._notification.from.name);
                content = "{0}: {1}".format(this._getContactDisplayName(this._notification.from.identity, this._notification.from.name), this._notification.body.content);
            } else {
                identity = this._notification.from.identity;
                displayName = this._getContactDisplayName(identity, this._notification.from.name);
                content = this._notification.body.content;
            }

            Skype.Notifications.Tiles.update(identity, displayName, content);
            Skype.Notifications.Toasts.show(identity, displayName, content);
        },

        _handleNotification: function (completedHandler) {
            var imCache = new Skype.Notifications.IMCache();
            if (!lib) {
                imCache.add(this._rawNotification);
                completedHandler();
                return;
            }

            if (this._isSdgMessage()) {
                var timestamp = Date.now();

                var shouldProcessNotification = (timestamp - imCache._cache.timestamp > Skype.Notifications.MessagePushNotification.EXECUTION_CONFIG.SdgTimeout);

                if (shouldProcessNotification) {
                    imCache.process(this._rawNotification);
                    imCache.clear(timestamp);
                } else {
                    imCache.add(this._rawNotification);
                    completedHandler();
                }
            } else {
                log("pass MSN non-SDG notification to lib.handleNotification()");
                lib.handleNotification(this._rawNotification);
            }
        },

        _dispose: function () {
            
        },

        
        handleAsync: function () {
            var handlePromise = new WinJS.Promise(function (completedHandler, errorHandler) {
                this._notifyUser();
                this._handleNotification(completedHandler);
            }.bind(this));

            var config = Skype.Notifications.MessagePushNotification.EXECUTION_CONFIG;
            var timeout = this._isSdgMessage() ? config.SdgTimeToHandle : config.OthersTimeToHandle;

            return WinJS.Promise.timeout(timeout, handlePromise).then(this._dispose, this._dispose);
        }

    }, {
        EXECUTION_CONFIG: {
            
            SdgTimeout: 600000,
            
            SdgTimeToHandle: 5000,
            
            OthersTimeToHandle: 10000
        }
    });
    
    WinJS.Namespace.define("Skype.Notifications", {
        MessagePushNotification: messagePushNotification
    });

}());