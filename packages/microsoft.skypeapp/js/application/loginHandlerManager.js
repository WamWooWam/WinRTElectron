

(function () {
    "use strict";

    var instance = null;

    var loginHandlerManager = WinJS.Class.mix(WinJS.Class.define(function () {
        this._partialHandler = this._partialHandler.bind(this);
        this._fullHandler = this._fullHandler.bind(this);
        this._logoutHandler = this._logoutHandler.bind(this);

        this._partially = false;
    }, {
        _partially: false,

        _partialHandler: function () {
            this._partially = true;
            this.dispatchEvent(Skype.Application.LoginHandlerManager.Events.LOGIN_READONLY);
        },

        _fullHandler: function () {
            if (!this._partially) {
                this._partialHandler();
            }
            this.dispatchEvent(Skype.Application.LoginHandlerManager.Events.LOGIN_FULL);
        },

        _logoutHandler: function () {
            this._partially = false;
            this.dispatchEvent(Skype.Application.LoginHandlerManager.Events.LOGOUT);
        },

        init: function (lib) {
            this.regEventListener(lib, "loginpartially", this._partialHandler);
            this.regEventListener(lib, "login", this._fullHandler);
            this.regEventListener(lib, "logout", this._logoutHandler);

            
            this.init = function () { };
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Application.LoginHandlerManager();
                }
                return instance;
            },

            set: function (lhm) {
                instance = lhm;
            }
        },

        Events: {
            LOGIN_READONLY: "loginpartially",
            LOGIN_FULL: "login",
            LOGOUT: "logout"
        }
    }), WinJS.Utilities.eventMixin, Skype.Class.disposableMixin);


    WinJS.Namespace.define("Skype.Application", {
        LoginHandlerManager: loginHandlerManager
    });
}());
