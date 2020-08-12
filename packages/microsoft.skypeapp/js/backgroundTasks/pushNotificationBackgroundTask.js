

(function () {
    "use strict";

    importScripts("/js/backgroundTasks/backgroundTaskBase.js");

    var pushNotification = WinJS.Class.derive(Skype.BackgroundTasks.BackgroundTaskBase, function constructor(webUIBackgroundTaskInstance, bgEventsDispatcher) {
        Skype.BackgroundTasks.BackgroundTaskBase.call(this, "pushNotification", webUIBackgroundTaskInstance);
        this._eventsDispatcher = bgEventsDispatcher;
    }, {
        _executeAsync: function () {
            importScripts("/js/globalextensions.js");
            importScripts("/js/globalization.js");
            importScripts("/js/loginManager.js");
            
            if (!Skype.LoginManager.isValidCurrentUser()) {
                return WinJS.Promise.as();
            }

            
            importScripts("/js/notifications/parsers/parserBase.js");
            importScripts("/js/notifications/parsers/msnParserBase.js");
            importScripts("/js/notifications/parsers/msnCntParser.js");
            importScripts("/js/notifications/parsers/msnSdgParser.js");
            importScripts("/js/notifications/parsers/msnOutParser.js");
            importScripts("/js/notifications/parsers/callNotificationParser.js");
            importScripts("/js/notifications/parsers/abchNotificationParser.js");
            
            importScripts("/js/notifications/raw.js");
            importScripts("/js/notifications/tiles.js");

            var notificationContent = this._backgroundTaskInstance.triggerDetails.content;
            log("RAW notification: " + notificationContent.split('\n')[0]);
            var notification = Skype.Notifications.RAW.parse(notificationContent);

            var ParserBase = Skype.Notifications.RAW.Parsers.ParserBase;
            switch (notification.type) {
                case ParserBase.MessageType.PNH:
                    log("Skype.Notifications.RAW.Type.PNH notification");

                    importScripts("/js/disposable.js");
                    importScripts("/js/notifications/toasts/callToast.js");
                    importScripts("/js/notifications/pushNotificationBase.js");
                    importScripts("/js/notifications/callPushNotification.js");

                    var callPushNotification = new Skype.Notifications.CallPushNotification(notification.content, this._eventsDispatcher);
                    return callPushNotification.handleAsync();

                case ParserBase.MessageType.MSN:
                    log("Skype.Notifications.RAW.Type.MSN notification");

                    importScripts("/js/application/backgroundState.js");
                    importScripts("/js/notifications/toasts.js");
                    importScripts("/js/notifications/imCache.js");
                    importScripts("/js/notifications/pushNotificationBase.js");
                    importScripts("/js/notifications/messagePushNotification.js");

                    var messagePushNotification = new Skype.Notifications.MessagePushNotification(notification.content, notificationContent);
                    return messagePushNotification.handleAsync();

                case ParserBase.MessageType.ABCH:
                    log("Skype.Notifications.RAW.Type.ABCH notification");
                    
                    importScripts("/js/notifications/abchNotificationCache.js");

                    
                    var abchNotificationCache = new Skype.Notifications.AbchNotificationCache(Windows.Storage.ApplicationData.current.localSettings);
                    abchNotificationCache.save(notificationContent);
                    return WinJS.Promise.as();

                default:
                    return WinJS.Promise.wrapError("Invalid notification type: " + notification.type);
            }
        },

        _fakeCloseTask: function () {
            
            
            
            close();
        }
    });

    WinJS.Namespace.define("Skype.BackgroundTasks", {
        PushNotification: pushNotification
    });

})();

Skype.BackgroundTasks.BackgroundTaskBase.run(Skype.BackgroundTasks.PushNotification, Skype.BackgroundTasks.BackgroundTaskBase.ExecutionPolicy.executeAlways);