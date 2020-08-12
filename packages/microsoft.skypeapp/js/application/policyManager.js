

(function () {
    "use strict";

    var _instance = null;

    var policyManager = WinJS.Class.mix(WinJS.Class.define(function () {
    }, {
        

        policyUpdatePromise: null,

        _ecsTimeDiff: null,
        _retriesOnError: 0,
        _requestNo: 0,
        _host: Math.random() < 0.5 ? "a" : "b",

        
        update: function (force) {
            
            
            
            Skype.Version.init().done(function () {
                
                var appVersion = Skype.Version.skypeVersion.split("/").join("_");

                if (this._retriesOnError > 0) {
                    this._host = this._host == "a" ? "b" : "a";  
                }
                var requestURI = Skype.Application.PolicyManager.serviceURI.format(this._host, appVersion);
                log("Skype.Application.PolicyManager: fetch policy from " + requestURI);

                if (this._ecsTimeDiff === null) {
                    
                    force = true;
                }

                try {
                    WinJS.xhr({
                        url: requestURI,
                        headers: this._requestHeaders(force)
                    })
                    .done(this._handleServiceResponse.bind(this, requestURI), this._handleRequestError.bind(this, requestURI));
                } catch (ex) {
                    this._handleRequestError.bind(this, requestURI);
                }
            }.bind(this));
        },

        _handleServiceResponse: function (requestURI, result) {
            log("Skype.Application.PolicyManager._handleServiceResponse: response received from [{0}]".format(requestURI));
            var policy = Skype.Application.Policy.create(result.responseText);

            if (!policy) {
                log("Skype.Application.PolicyManager._handleServiceResponse: response invalid");
                if (this._retriesOnError++ < 1) {
                    WinJS.Promise.timeout(0).then(this.update.bind(this));
                    return;
                } else {
                    policy = Skype.Application.state.policy;
                }
            } else {
                log("Skype.Application.PolicyManager._handleServiceResponse: response valid, updating policy");
                this._retriesOnError = 0;
                roboSky.write("FeaturePolicy,updated");
            }

            this._setPolicy(policy);

            if (this.policyUpdatePromise) {
                this.policyUpdatePromise.cancel();
            }
            this.policyUpdatePromise = null;

            var expiration = result.getResponseHeader("Expires");
            var ecsDate = result.getResponseHeader("Date");  
            var ms = Skype.Application.PolicyManager.FALLBACK_EXPIRATION;

            if (expiration && (ecsDate || this._ecsTimeDiff !== null)) {
                var retry = Date.parse(expiration);
                var serverNow;
                
                if (ecsDate) {
                    serverNow = Date.parse(ecsDate);
                    this._ecsTimeDiff = serverNow - new Date();  
                } else {
                    serverNow = new Date() - this._ecsTimeDiff;  
                }

                if (retry && serverNow) {
                    ms = retry - serverNow;
                }
            }

            ms += Skype.Application.PolicyManager.EXPIRATION_MARGIN;  

            this.policyUpdatePromise = WinJS.Promise.timeout(ms).then(this.update.bind(this));
        },

        _handleRequestError: function (requestURI, result) {
            log("Skype.Application.PolicyManager._handleRequestError: setting default policy due to error when sending request to [{0}]".format(requestURI));

            if (this.policyUpdatePromise) {
                this.policyUpdatePromise.cancel();
            }
            this.policyUpdatePromise = WinJS.Promise.timeout(this._retriesOnError++ < 1 ? 0 : Skype.Application.PolicyManager.FALLBACK_EXPIRATION).then(this.update.bind(this));
        },

        _generateUniqueId: function () {
            var hardwareToken = Windows.System.Profile.HardwareIdentification.getPackageSpecificToken(null);
            return Windows.Security.Cryptography.CryptographicBuffer.encodeToBase64String(hardwareToken.id);
        },

        _requestHeaders: function (force) {
            var hdr = force ? { "If-None-Match": "ignore", "Cache-Control": "max-age=0" } : {};
            hdr["X-Tag"] = this._generateUniqueId();
            hdr["X-Resent"] = this._requestNo++;

            return hdr;
        },

        
        _setPolicy: function (policy) {
            log("Skype.Application.PolicyManager set policy to " + policy.toString());
            var disabledFlagsAdded = [],
                disabledFlagsRemoved = [];

            policy.disabledFlags.forEach(function (flag) {
                if (!Skype.Application.state.policy.disabledFlags.contains(flag)) {
                    disabledFlagsAdded.push(flag);
                }
            });
            Skype.Application.state.policy.disabledFlags.forEach(function (flag) {
                if (!policy.disabledFlags.contains(flag)) {
                    disabledFlagsRemoved.push(flag);
                }
            });

            Skype.Application.state.policy = policy;
            this.dispatchEvent(Skype.Application.PolicyManager.Events.PolicyUpdate, {
                policy: policy
            });

            if (disabledFlagsAdded.length != 0 || disabledFlagsRemoved.length != 0) {  
                this.dispatchEvent(Skype.Application.PolicyManager.Events.FlagUpdate, {
                    disabledFlagsAdded: disabledFlagsAdded,
                    disabledFlagsRemoved: disabledFlagsRemoved
                });
            }
        }
    }, {
        
        FALLBACK_EXPIRATION: 1 * 60 * 60 * 1000,  
        EXPIRATION_MARGIN:   2000,  

        serviceURI: "https://{0}.config.skype.com/config/v1/Skype/{1}/Modern",

        instance: {
            get: function () {
                if (!_instance) {
                    _instance = new Skype.Application.PolicyManager();
                }
                return _instance;
            }
        },

        dispose: function () {
            if (_instance) {
                if (_instance.policyUpdatePromise) {
                    _instance.policyUpdatePromise.cancel();
                }
                _instance.dispose();
            }
            _instance = null;
        },

        Events: {
            PolicyUpdate: "PolicyUpdate",
            FlagUpdate: "FlagUpdate",
        }
    }),
    WinJS.Utilities.eventMixin);

    WinJS.Namespace.define("Skype.Application", {
        PolicyManager: WinJS.Class.mix(policyManager, Skype.Class.disposableMixin)
    });
}());