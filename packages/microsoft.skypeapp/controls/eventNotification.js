

(function () {
    "use strict";

    var AnimationType = {
        NONE: 0,
        SLIDE: 1
    };

    var Event = {
        BUTTON_CLICKED: "button_clicked",
        HIDE_ANIMATION_COMPLETE: "hide_animation_completed"
    };

    var eventNotification = Skype.UI.Control.define(function (element, options) {
        var type = options.notification.type;
        var animation = options.animation;
        var wide = options.wide;
        var data = options.notification;

        this._container = options.container || document.getElementById("eventNotifications");
        this._liveRegion = options._liveRegion || document.getElementById("eventNotificationsLiveRegion");

        this.init(animation, wide, type, data);
    }, {
        _vm: null,
        _container: null,

        init: function (animation, wide, type, data) {
            
            data.ariaCompoundText = data.aria + " " + (data.title ? Skype.Utilities.unEscapeHTML(data.title) + ". " : "") + Skype.Utilities.unEscapeHTML(data.text);

            
            this._vm = WinJS.Binding.as(data);
            

            
            WinJS.Utilities.addClass(this.element, type);
            WinJS.Utilities.addClass(this.element, "notification");

            if (wide) {
                WinJS.Utilities.addClass(this.element, "WIDE");
            }

            if (animation === AnimationType.SLIDE) {
                WinJS.Utilities.addClass(this.element, "SLIDE_IN");
            }

            var url = "/controls/eventNotifications/{0}.html".format(type);
            WinJS.UI.Fragments.render(url, this.element).then(this._onRendered.bind(this), this._onError.bind(this));
        },

        _onRendered: function() {
            this.regEventListener(this.element, "animationend", this._onAnimationEnd.bind(this));
            this.regEventListener(this.element, "click", this._onClicked.bind(this));

            this._liveRegion.innerHTML = this._vm.ariaCompoundText;

            
            WinJS.Resources.processAll(this.element);
            WinJS.Binding.processAll(this.element, this._vm);

            this._container.appendChild(this.element);
        },

        hide: function (animation) {
            if (animation === AnimationType.NONE) {
                Skype.UI.Util.removeFromDOM(this.element);
            } else {
                WinJS.Utilities.addClass(this.element, "SLIDE_OUT");
            }
        },

        _onError: function(e) {
            log("couldn't find notification html template");
            Skype.UI.Util.removeFromDOM(this.element);
        },

        _onClicked: function(e) {
            
            if (e.target.nodeName == "BUTTON") {
                this.dispatchEvent(Event.BUTTON_CLICKED);
            }
        },

        _onAnimationEnd: function(e) {
            if (e.animationName === "notificationSlideOut") {
                Skype.UI.Util.removeFromDOM(this.element);
                this.dispatchEvent(Event.HIDE_ANIMATION_COMPLETE);
            }
        }
    }, {
        Event: Event,
        AnimationType: AnimationType,

    });
    WinJS.Namespace.define("Skype.UI", {
        EventNotification: WinJS.Class.mix(eventNotification, WinJS.Utilities.eventMixin)
    });
})();