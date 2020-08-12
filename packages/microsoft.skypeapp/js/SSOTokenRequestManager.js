

(function () {
    "use strict";

    var REQUEST_TIMEOUT = 5e3; 

    var ssoTokenRequestManager = WinJS.Class.define(function () {
        lib.addEventListener("authtokenresult", this._handleAuthTokenResult.bind(this));
        lib.addEventListener("logout", this._handleLogout.bind(this));
        this._requests = [];
    }, {
        _requests: null,

        _handleAuthTokenResult: function (e) {
            var success = e.detail[0];
            var requestId = e.detail[1];
            var token = e.detail[2];

            log("onauthtokenresult called, success=" + success + ", requestId=" + requestId + ", token=" + token);

            
            var i;
            for (i = 0; i < this._requests.length ; i++) {
                if (this._requests[i].requestId === requestId) {
                    var signal = this._requests[i].signal;
                    success ? signal.complete(token) : signal.error();
                    clearTimeout(this._requests[i].timeoutId);
                    this._requests.splice(i, 1); 
                    break;
                }
            }
        },

        _handleLogout: function (e) {
            for (var i = 0; i < this._requests.length; i++) {
                clearTimeout(this._requests[i].timeoutId);
            }
            this._requests = [];
        },

        requestTokenAsync: function () {     
            var requestId = lib.requestSSOToken();
            log('SSO token requested, requestId = ' + requestId);

            if (requestId === 0) {
                return WinJS.Promise.wrapError();
            }

            var signal = new WinJS._Signal();
            var timeoutId = setTimeout(function () {
                signal.cancel();
            }, REQUEST_TIMEOUT);

            this._requests.push({ requestId: requestId, signal: signal, timeoutId: timeoutId });

            return signal.promise;
        }
    }, {
        getSSOLoginUrl: function (token) {
            var url = (LibWrap.Build.getBuildType() === LibWrap.BuildType.buildtype_REAL_ENV) ? "https://secure.skype.com/login" : "https://qasecure.skype.net/login";
            url += "/sso?nonce=" + token;
            return url;
        },

        getSSOUrlWithGoLink: function (token, goLink) {
            return Skype.SSOTokenRequestManager.getSSOLoginUrl(token) + "&go=" + goLink;
        },

        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.SSOTokenRequestManager();
                }
                return instance;
            }
        }
    });

    var instance;

    WinJS.Namespace.define("Skype", {
        SSOTokenRequestManager: ssoTokenRequestManager
    });
})();