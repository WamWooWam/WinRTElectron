

(function () {
    "use strict";

    var policy = WinJS.Class.define(function (pstn, calls, app, flags) {
        

        assert(typeof pstn === "boolean", "Skype.Application.Policy ctor missing pstn");
        assert(typeof calls === "boolean", "Skype.Application.Policy ctor missing calls");
        assert(typeof app === "boolean", "Skype.Application.Policy ctor missing app");

        this.PSTN.enabled = pstn;
        this.calling.enabled = calls;
        this.application.enabled = app;

        if (flags) {
            this.disabledFlags = flags;
        } else {
            this.disabledFlags = [];
        }
    }, {
        
        PSTN: {
            enabled: null
        },

        calling: {
            enabled: null
        },

        application: {
            enabled: null
        },

        disabledFlags: null,

        toString: function() {
            return "PSTN: {0}, Calls: {1}, Application: {2}".format(this.PSTN.enabled, this.calling.enabled, this.application.enabled);
        },
    }, {
        

        
        
        
        create: function(jsonString) {
            if (!jsonString) {
                return new Skype.Application.Policy(true, true, true);
            }

            try {
                var object = JSON.parse(jsonString);
                if (typeof object.FeaturesPolicy.PSTN.enabled !== "boolean" ||
                    typeof object.FeaturesPolicy.Calls.enabled !== "boolean" ||
                    typeof object.FeaturesPolicy.Application.enabled !== "boolean") {
                    return null;
                }
                var policyObject = new Skype.Application.Policy(object.FeaturesPolicy.PSTN.enabled, object.FeaturesPolicy.Calls.enabled, object.FeaturesPolicy.Application.enabled, object.FeaturesPolicy.DisabledFlags);
                return policyObject;
            } catch(exception) {
                return null;
            }
        }
    });

    WinJS.Namespace.define("Skype.Application", {
        Policy: WinJS.Class.mix(policy, Skype.Class.disposableMixin)
    });

}());
