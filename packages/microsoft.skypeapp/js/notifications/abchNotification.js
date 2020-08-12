

(function () {

    "use strict";

    var abchNotification = WinJS.Class.define(function constructor(lib, notificationCache) {
        this._lib = lib;
        this._notificationCache = notificationCache;
    }, {

        _handleInternally: function(rawNotification) {
            log("pass abchNotification to lib.handleNotification");
            this._lib.handleNotification(rawNotification);

            
            this._notificationCache.clear();
        },

        
        handle: function (rawNotification) {
            log("abchNotification.handle()");
            this._handleInternally(rawNotification);
        },

        handleCachedNotification: function () {
            log("abchNotification.handleCachedNotification()");

            if (!this._notificationCache.hasNotification()) {
                log("No cached abchNotification");
                return;
            }

            this._handleInternally(this._notificationCache.getNotification());
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        AbchNotification: abchNotification
    });

}());