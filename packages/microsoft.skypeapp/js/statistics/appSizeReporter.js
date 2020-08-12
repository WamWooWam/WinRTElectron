

(function () {
    "use strict";
    var APP_SIZE_EVENT_DELAY = 4e3;

    var appSizeReporter = WinJS.Class.define(function () {
        this._handleEvent = this._handleEvent.bind(this);
    }, {
        _delayTimeoutId: null,

        init: function () {
            this.regEventListener(Skype.Application.state, "navigated", this._handleEvent);
            this.regBind(Skype.Application.state.focusedConversation, "state", this._handleEvent);
        },

        _handleEvent: function () {
            switch (Skype.Application.state.page.name) {
                case Skype.UI.Navigation.Pages.HUB:
                    this._reportEventDelayed("Hub");
                    break;
                case Skype.UI.Navigation.Pages.CONVERSATION:
                    var conversation = Skype.Application.state.focusedConversation;
                    if (conversation && conversation.isInFullLive) {
                        this._reportEventDelayed(conversation.isVideoCall ? "Video call" : "Audio call");
                    } else {
                        this._reportEventDelayed("Chat");
                    }
                    break;
                default:
                    this._abortCurrentDelayedEvent();
                    break;
            }
        },

        _reportEventDelayed: function (pageName) {
            this._abortCurrentDelayedEvent();
            this._delayTimeoutId = this.regTimeout(this._sendAppSizeEvent.bind(this, pageName), APP_SIZE_EVENT_DELAY);
        },

        _abortCurrentDelayedEvent: function () {
            this.unregTimeout(this._delayTimeoutId);
        },

        _sendAppSizeEvent: function (pageName) {
            var appSizeInfo = "{0}; screen={1}x{2}; scale={3}".format(pageName, window.innerWidth, window.innerHeight, Windows.Graphics.Display.DisplayProperties.resolutionScale);
            log("[Stats] AppSizeReporter: {0}".format(appSizeInfo));
            var data = encodeURIComponent(appSizeInfo);
            Skype.Statistics.sendStats(Skype.Statistics.event.applicationSize, data);
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Statistics.AppSizeReporter();
                }
                return instance;
            }
        }
    });

    var instance;

    WinJS.Namespace.define("Skype.Statistics", {
        AppSizeReporter: WinJS.Class.mix(appSizeReporter, Skype.Class.disposableMixin)
    });    
}());