

(function () {
    "use strict";

    var imCache = WinJS.Class.define(function () {
        log("Skype.Notifications.imCache.ctor()");

        this._cache = this._load();
    }, {
        _cache: null,

        
        
        
        
        
        
        add: function (notification) {
            log("Skype.Notifications.imCache.add()");
            this._cache.messages.push(notification);
            this._save();
        },

        
        
        
        
        
        
        process: function (notification) {
            if (!lib) {
                log("Skype.Notifications.imCache.process() error - no library instance");
                return;
            }

            var count = this._cache.messages.length;
            log("Skype.Notifications.imCache.process() [{0}] notification(s)".format(notification ? count + 1 : count));
            for (var i = 0; i < this._cache.messages.length; i++) {
                lib.handleNotification(this._cache.messages[i]);
            }
            notification && lib.handleNotification(notification);
        },

        
        
        
        
        
        
        clear: function (timestamp) {
            log("Skype.Notifications.imCache.clear()");
            this._cache = {
                messages: [],
                timestamp: timestamp
            };

            this._save();
        },

        
        _load: function () {
            var data = LibWrap.IMCache.load();
            var empty = {
                messages: [],
                timestamp: 0
            };

            if (data.length === 0) {
                return empty;
            } else {
                try {
                    var result = JSON.parse(data);
                    return result ? result : empty;
                } catch (e) {
                    return empty;
                }
            }
        },

        
        _save: function () {
            LibWrap.IMCache.save(JSON.stringify(this._cache));
        },
    },
    {
        
        
        
        
        Handle: function () {
            var cache = new Skype.Notifications.IMCache();
            cache.process();
            cache.clear(0);
        }
    });

    WinJS.Namespace.define("Skype.Notifications", {
        IMCache: imCache
    });
})();