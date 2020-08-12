

(function () {
    "use strict";
    var instance;

    var HelpBubblesStarter = WinJS.Class.define(function () {
    }, {
        _container: null,
        _bubblesControl: null,

        init: function () {
            var loginHandlerManager = Skype.Application.LoginHandlerManager.instance;
            loginHandlerManager.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_FULL, this._onLogin.bind(this));
            loginHandlerManager.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGOUT, this._onLogout.bind(this));
        },

        _onLogin: function () {
            if (Skype.Model.HelpBubbles.allBubblesShown()) {
                return log("HelpBubbles all bubbles done!");
            }

            this._container = document.getElementById("helpBubbles");
            if (!this._container) {
                return log("HelpBubbles container not found from DOM");
            }

            if (Skype.UI.HelpBubbles.Control) {
                this._createInstance();
            } else {
                this._loadControlAsync().then(this._createInstance.bind(this));
            }
        },

        _onLogout: function () {
            if (this._bubblesControl && !this._bubblesControl.isDisposed) {
                this._bubblesControl.dispose();
            }
        },

        _loadControlAsync: function () {
            return WinJS.UI.Fragments.render("/controls/helpBubbles.html", this._container);
        },

        _createInstance: function () {
            
            WinJS.UI.processAll(this._container);

            this._bubblesControl = new Skype.UI.HelpBubbles.Control(this._container);
        }

    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.UI.HelpBubbles.Starter();
                }
                return instance;
            }
        }
    });

    WinJS.Namespace.define("Skype.UI.HelpBubbles", {
        Starter: HelpBubblesStarter
    });
})();