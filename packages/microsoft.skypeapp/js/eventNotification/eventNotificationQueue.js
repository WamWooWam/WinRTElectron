

(function () {
    "use strict";
    
    var eventQueue = WinJS.Class.define(function (globalContext, dependencies) {
        this._globalContext = globalContext;
        this._transientNotifications = [];
        this._persistentNotifications = [];
        this._utilities = (dependencies && dependencies.utilities) || Skype.Utilities;
    }, {
        _transientNotifications: null,
        _persistentNotifications: null,
        _globalContext: "",
        _utilities: null,        

        _addToQueue: function (queue, notification) {
            if (this._indexInQueue(queue, notification) === -1) {
                queue.push(notification);
            }
        },

        _removeFromQueue: function (queue, notification) {
            var index = this._indexInQueue(queue, notification);
            if (index !== -1) {
                queue.splice(index, 1);
            }
        },

        _indexInQueue: function (queue, notification) {
            return queue.index(function (item) {
                return this._utilities.isSameEventNotification(notification, item);
            }.bind(this));
        },

        getNext: function (context) {
            for (var i = 0; i < this._transientNotifications.length; i++) {
                if (this._transientNotifications[i].context === this._globalContext || this._transientNotifications[i].context === context) {
                    return this._transientNotifications[i];
                }
            }

            for (i = 0; i < this._persistentNotifications.length; i++) {
                if (this._persistentNotifications[i].context === this._globalContext || this._persistentNotifications[i].context === context) {
                    return this._persistentNotifications[i];
                }
            }
            return null;
        },
        
        add: function (notification) {
            if (notification.isTransient) {
                this._addToQueue(this._transientNotifications, notification);
            } else {
                this._addToQueue(this._persistentNotifications, notification);
            }
        },

        remove: function (notification) {
            if (notification.isTransient) {
                this._removeFromQueue(this._transientNotifications, notification);
            } else {
                this._removeFromQueue(this._persistentNotifications, notification);
            }
        },
        
        reset: function () {
            this._transientNotifications = [];
            this._persistentNotifications = [];
        },
    });

    WinJS.Namespace.define("Skype.EventNotification", {
        Queue: eventQueue
    });
})();