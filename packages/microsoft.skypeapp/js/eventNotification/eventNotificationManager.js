

(function () {
    "use strict";
    var instance; 

    var manager = WinJS.Class.define(function(dependecies) {
        this._queue = (dependecies && dependecies.queue) || new Skype.EventNotification.Queue(Skype.EventNotification.Manager.GLOBAL_CONTEXT);
        this._applicationState = (dependecies && dependecies.applicationState) || Skype.Application.state;
        this._eventNotification = (dependecies && dependecies.eventNotification) || Skype.UI.EventNotification;
        this._utilities = (dependecies && dependecies.utilities) || Skype.Utilities;
        this._init();
    }, {
        _container: null,
        _queue: null,
        _eventNotification: null,
        _applicationState: null,
        _animationType: null,
        _currentNotification: null,
        _timeoutHandler: null,
        _visibleNotification: null,

        _init: function() {
            this.regEventListener(this._applicationState, "navigated", this._onNavigated.bind(this));
            this._removeCurrent = this._removeCurrent.bind(this);
        },

        
        _removeCurrent: function() {
            this._remove(this._currentNotification);
        },

        _remove: function(notification) {
            this._queue.remove(notification);
            this._updateNotification(false);
        },

        _onNavigated: function () {
            
            if (this._applicationState && this._applicationState.page && (this._applicationState.page.name === "login" || this._applicationState.page.name === "logout")) {
                this._queue.reset();
            }
            this._updateNotification(true);
        },

        _updateNotification: function(afterNavigation) {
            var newNotification = this._queue.getNext(this._createContext());

            if (this._isAlreadyVisible(newNotification)) {
                if (this._currentNotification.isTransient && !afterNavigation) {
                    
                    this.unregTimeout(this._timeoutHandler);
                    this._registerTimeout();
                    log("EventNotificationManager: Prolonging timeout");

                }
            } else {
                if (this._currentNotification) {
                    this._hide(afterNavigation, newNotification);
                    log("EventNotificationManager: Hiding notification, after navigation=" + afterNavigation);
                }

                
                if (newNotification) {
                    this._show(afterNavigation, newNotification);
                    log("EventNotificationManager: Showing notification, after navigation=" + afterNavigation + this._getLogString(newNotification));                        
                } else {
                    this._currentNotification = null;
                    log("EventNotificationManager: No notification for context");
                }
            }
        },

        _hide: function(afterNavigation, notification) {
            var animation;
            
            if (this._currentNotification.isTransient) {
                this._queue.remove(this._currentNotification);
                this.unregTimeout(this._timeoutHandler);
            }

            if (afterNavigation) {
                
                animation = this._eventNotification.AnimationType.NONE;
            } else {
                animation = this._eventNotification.AnimationType.SLIDE;
            }
            this._visibleNotification.hide(animation);
            this.unregEventListener(this._visibleNotification, this._eventNotification.Event.BUTTON_CLICKED, this._removeCurrent);
        },

        _show: function(afterNavigation, notification) {
            var animation, wide = true;
            if (notification.shown && afterNavigation) {
                
                animation = this._eventNotification.AnimationType.NONE;
            } else {
                
                animation = this._eventNotification.AnimationType.SLIDE;
                if (notification.isTransient) {
                    this._registerTimeout();
                    if (!this._currentNotification || this._currentNotification.isTransient) {
                        wide = false;
                    }
                }
            }

            this._currentNotification = notification;
            this._currentNotification.shown = true;

            var div = document.createElement("div");
            this._visibleNotification = new this._eventNotification(div, {
                animation: animation,
                wide: wide,
                notification: notification
            });
            this.regEventListener(this._visibleNotification, this._eventNotification.Event.BUTTON_CLICKED, this._removeCurrent);
        },

        _registerTimeout: function() {
            this._timeoutHandler = this.regTimeout(this._removeCurrent, Skype.EventNotification.Manager.TRANSIENT_TIMEOUT);
        },
        _createContext: function () {
            var context = this._applicationState.page.name;
            if (context === "conversation" && this._applicationState.page.options) {
                context += this._applicationState.page.options.id;
            }
            return context;
        },
        _isAlreadyVisible: function(notification) {
            return this._utilities.isSameEventNotification(notification, this._currentNotification);
        },
        
        _getLogString: function(notification) {
            return " type={0} context={1} title={2} text={3} transient={4} global={5}"
                .format(notification.type, notification.context, notification.title, notification.text, notification.isTransient, notification.isGlobal);
        },

        onDispose: function() {
            this._hide();
        },

        
        show: function(notification) {
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            if (!notification.context) {
                notification.context = notification.isGlobal ? Skype.EventNotification.Manager.GLOBAL_CONTEXT : this._createContext();
            }
            this._queue.add(notification);
            log("EventNotificationManager: Adding notification to queue" + this._getLogString(notification));

            this._updateNotification();
            return notification;
        },

        hide: function(notification) {
            
            
            
            
            log("EventNotificationManager: Removing notification from queue" + this._getLogString(notification));
            this._remove(notification);
        },

    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.EventNotification.Manager();
                }
                return instance;
            }
        },

        TRANSIENT_TIMEOUT: 3000,
        GLOBAL_CONTEXT: "",

        NotificationType: {
            TWO_BUTTON_AND_TITLE: "twoButtonsAndTitle",
            TWO_BUTTON_AND_ICON: "twoButtonsAndIcon",
            ICON_TEXT: "iconText"
        }
    });
    WinJS.Namespace.define("Skype.EventNotification", {
        Manager: WinJS.Class.mix(manager, Skype.Class.disposableMixin)
    });
})();