

(function (global) {
    "use strict";
    var Windows, lib;

    function updateDependencies(dependencies) {
        dependencies = dependencies || {};
        Windows = dependencies.Windows || global.Windows;
        lib = dependencies.lib || global.lib;
    }

    var registrationConfig = {
        MAX_CHANNEL_EXPIRATION: 30 * 24 * 60 * 60, 
        PLATFORM_IDENTIFIER: "Windows8.1",
        TEMPLATES_KEY: {
            raw: "Windows8.1:Microsoft.SkypeApp_8.1.20140203_raw",
            toast: "Windows8.1:Microsoft.SkypeApp_8.1.20140203_toast"
        }
    };

    var wnsChannelRegistration = WinJS.Class.define(function (dependencies) {
        updateDependencies(dependencies);
    }, {
        _getRegistrationTemplate: function () {
            var background = Windows.ApplicationModel.Background;
            var statusValues = background.BackgroundAccessStatus;

            try {
                var accessStatus = background.BackgroundExecutionManager.getAccessStatus();
                switch (accessStatus) {
                    case statusValues.allowedMayUseActiveRealTimeConnectivity:
                    case statusValues.allowedWithAlwaysOnRealTimeConnectivity:
                        return registrationConfig.TEMPLATES_KEY.raw;
                    default:
                        return registrationConfig.TEMPLATES_KEY.toast;
                }
            } catch (ex) {
                log("BackgroundExecutionManager.getAccessStatus error:" + JSON.stringify(ex));
                return registrationConfig.TEMPLATES_KEY.toast;
            }
        },

        _diffNormalizedForDaylightSaving: function (t1, t2) {
            
            var d1 = new Date(t1),
                d2 = new Date(t2),
                dst = 1000 * 60 * (d1.getTimezoneOffset() - d2.getTimezoneOffset());
            return d1 - d2 - dst;
        },

        
        
        
        
        
        
        createChannelAsync: function () {
            log("WnsChannelRegistration: createChannel");
            return new WinJS.Promise(function (completed, errorHandler) {
                try {
                    Windows.Networking.PushNotifications.PushNotificationChannelManager
                        .createPushNotificationChannelForApplicationAsync().then(function (channel) {
                            var currentTimestamp = new Date();
                            var ttl = this._diffNormalizedForDaylightSaving(channel.expirationTime, currentTimestamp) / 1000;

                            if (ttl > registrationConfig.MAX_CHANNEL_EXPIRATION || ttl < 0) {
                                ttl = registrationConfig.MAX_CHANNEL_EXPIRATION;  
                            }
                            log("WnsChannelRegistration: Channel created with URI [{0}] expiration [{1}] TTL [{2}]".format(channel.uri, channel.expirationTime, ttl));

                            var templatesKey = this._getRegistrationTemplate();
                            lib.registerContextsWin8(registrationConfig.PLATFORM_IDENTIFIER, templatesKey, channel.uri, ttl);
                            log("WnsChannelRegistration: Registered channel with template:" + templatesKey);

                            completed(channel);
                        }.bind(this), errorHandler);
                } catch (ex) {
                    errorHandler(ex);
                }
            }.bind(this));
        },

        closeChannelAsync: function () {
            return new WinJS.Promise(function (completed, error) {
                try {
                    Windows.Networking.PushNotifications.PushNotificationChannelManager
                        .createPushNotificationChannelForApplicationAsync().then(function (channel) {
                            if (channel) {
                                channel.close();
                            }
                            completed && completed();
                        }, error);
                } catch (e) {
                    error(e);
                }
            });
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        WnsChannelRegistration: wnsChannelRegistration
    });

}(this));