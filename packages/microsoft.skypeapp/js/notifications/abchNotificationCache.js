

(function () {

    "use strict";

    var localSettingsKeyName = "ABCH_NOTIFICATION";

    var abchNotificationCache = WinJS.Class.define(function constructor(localSettings) {
        
        this._localSettings = localSettings;
    }, {
        _cachedNotification: {
            get: function () {
                return this._localSettings[localSettingsKeyName];
            },
            set: function (rawNotification) {
                this._localSettings[localSettingsKeyName] = rawNotification;
            }
        },

        hasNotification: function () {
            return this._localSettings.values.hasKey(localSettingsKeyName);
        },

        clear: function () {
            if (this.hasNotification()) {
                log("delete cached abchNotification");
                this._localSettings.values.remove(localSettingsKeyName);
            }
        },

        save: function (rawNotification) {
            log("abchNotification.handle()");
            this._cachedNotification = rawNotification;
        },

        getNotification: function() {
            return this._cachedNotification;
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        AbchNotificationCache: abchNotificationCache
    });

}());