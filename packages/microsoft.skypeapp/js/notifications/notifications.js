

(function (global) {
    "use strict";

    function LaunchParams(eventType, nodeSpecificPayload, genericPayload) {
        this.eventType = eventType;
        this.nodeSpecificPayload = nodeSpecificPayload;
        this.genericPayload = genericPayload;
    }

    var storedLaunchParams = null;
    var fullLoginSignal = new WinJS._Signal();

    var LaunchParamType = {
        UNRECOGNIZED: 0,
        WNS_CALLING_TOAST: 1,
        LOCAL_CALLING_TOAST: 2,
        MSN: 3,
        LOCAL_IM: 4
    };
    var msnLaunchParamRegExp = /.*SenderMri=(.+?);.*/gi;

    function init() {
        var loginHandlerManager = Skype.Application.LoginHandlerManager;

        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGIN_FULL, onLogin);
        loginHandlerManager.instance.addEventListener(loginHandlerManager.Events.LOGOUT, onLogout);
    }

    function onLogin() {
        Skype.Notifications.createChannel()
            .done(function (channel) {
                channel.addEventListener("pushnotificationreceived", onNotification);
            },
            function onError(error) {
                log("Error creating a channel: code {0}, message {1}".format(error.number, error.message));
            });
        fullLoginSignal.complete();
    }

    function handleIncomingPushNotification() {
        fullLoginSignal.promise.then(function () {
            if (storedLaunchParams) {
                log("Skype.Notifications: handle push notification eventType [{0}] nodeSpecificPayload [{1}] genericPayload [{2}]".format(storedLaunchParams.eventType, storedLaunchParams.nodeSpecificPayload, storedLaunchParams.genericPayload));
                lib.handleCallNotification(storedLaunchParams.eventType, storedLaunchParams.nodeSpecificPayload, storedLaunchParams.genericPayload);
                storedLaunchParams = null;
            }
        });
    }
    global.traceFunction && (onLogin = global.traceFunction(onLogin, "Notifications,onLogin"));

    function onLogout() {
        
        closeChannelAsync().done(null, function onError(error) {
            log("Error closing existing channel: code {0}, message {1}".format(error.number, error.message));
        });
    }

    function closeChannelAsync() {
        
        var wnsChannelRegistration = new Skype.Notifications.WnsChannelRegistration();
        return wnsChannelRegistration.closeChannelAsync();
    }

    function createChannel() {
        
        var wnsChannelRegistration = new Skype.Notifications.WnsChannelRegistration();
        return wnsChannelRegistration.createChannelAsync();
    }

    function onNotification(pushNotification) {
        try {
            log("Skype.Notifications.onNotification: received notification type {0}".format(pushNotification.notificationType));

            switch (pushNotification.notificationType) {
                
                case Windows.Networking.PushNotifications.PushNotificationType.toast:
                    pushNotification.cancel = true;
                    break;

                
                case Windows.Networking.PushNotifications.PushNotificationType.raw:
                    processRawNotification(pushNotification);
                    break;
                default:
                    break;
            }
        } catch (e) {
            log(pushNotification + " " + e.toString());
        }
    }

    function processRawNotification(pushNotification) {
        var notification = Skype.Notifications.RAW.parse(pushNotification.rawNotification.content);

        switch (notification.type) {
            case Skype.Notifications.RAW.Parsers.ParserBase.MessageType.PNH:
                pushNotification.cancel = true;
                break;
            case Skype.Notifications.RAW.Parsers.ParserBase.MessageType.ABCH:
                pushNotification.cancel = true;
                var abchNotificationCache = new Skype.Notifications.AbchNotificationCache(Windows.Storage.ApplicationData.current.localSettings);
                var abchNotification = new Skype.Notifications.AbchNotification(lib, abchNotificationCache);
                abchNotification.handle(pushNotification.rawNotification.content);
                break;
        }
    }

    function getLaunchParamType(launchParam) {
        if (msnLaunchParamRegExp.test(launchParam)) {
            return LaunchParamType.MSN;
        }

        try {
            var lauchParamJson = JSON.parse(launchParam);

            if (!lauchParamJson.type) {
                return LaunchParamType.WNS_CALLING_TOAST;
            }

            switch (lauchParamJson.type) {
                case "local-toast-im":
                    return LaunchParamType.LOCAL_IM;
                case "local-toast-call":
                    return LaunchParamType.LOCAL_CALLING_TOAST;
                default:
                    log('Unable to determine lauch param type');
                    return LaunchParamType.UNRECOGNIZED;
            }

        } catch (e) {
            log('Unable to determine lauch param type');
            return LaunchParamType.UNRECOGNIZED;
        }
    }

    function parseMsnLaunchParam(launchParam) {
        return launchParam.replace(msnLaunchParamRegExp, function ($0, $1) { return $1; });
    }

    function getStartPageArgumentsFromCallingNotification(notification) {
        var conversationId = Skype.Notifications.RAW.getConversationIdFromCallNotification(notification);
        if (!conversationId) {
            return null;
        }

        var handlePushNotification = false;
        if (notification.eventType && notification.nodeSpecificPayload && notification.genericPayload) {
            storedLaunchParams = new LaunchParams(notification.eventType, notification.nodeSpecificPayload, notification.genericPayload);
            handlePushNotification = true;
        }
        log("Calling notification params: " + JSON.stringify(notification));
        return { conversationId: conversationId, callId: notification.callId, answerType: notification.answerType, handlePushNotification: handlePushNotification };
    }

    function parseLaunchParams(launchParams) {
        var startPageArgs = {};
        var launchParamType = getLaunchParamType(launchParams);

        switch (launchParamType) {
            case LaunchParamType.WNS_CALLING_TOAST:
                var rawNotification;

                var callNotificationParser = new Skype.Notifications.RAW.Parsers.CallNotificationParser(launchParams);
                rawNotification = callNotificationParser.parse();

                if (rawNotification.status === Skype.Notifications.RAW.Parsers.ParserBase.ParsingStatus.COMPLETE) {
                    startPageArgs = getStartPageArgumentsFromCallingNotification(rawNotification.content);
                }
                break;

            case LaunchParamType.LOCAL_CALLING_TOAST:
                var callNotification = JSON.parse(launchParams);
                startPageArgs = getStartPageArgumentsFromCallingNotification(callNotification);
                break;

            case LaunchParamType.MSN:
                var msnArgs = parseMsnLaunchParam(launchParams);

                if (msnArgs) {
                    startPageArgs = { conversationId: msnArgs };
                    log('MSN notification params: identity = ' + msnArgs);
                }
                break;

            case LaunchParamType.LOCAL_IM:
                try {
                    var localIMtoastParam = JSON.parse(launchParams);
                    startPageArgs = { conversationId: localIMtoastParam.identity };
                    log('Local IM toast params: identity = ' + startPageArgs);
                } catch (e) {
                    log('Unable to parse local IM toast launch parameters');
                }
                break;

            case LaunchParamType.UNRECOGNIZED:
                log('Unrecognized launch param type');
                break;
        }

        return startPageArgs;
    }

    WinJS.Namespace.define("Skype.Notifications", {
        init: init,
        createChannel: createChannel,
        closeChannelAsync: closeChannelAsync,
        parseLaunchParams: parseLaunchParams,
        handleIncomingPushNotification: handleIncomingPushNotification
    });
})(this || window);