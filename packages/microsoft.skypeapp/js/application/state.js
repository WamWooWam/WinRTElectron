

(function () {
    "use strict";

    var instance;
    WinJS.Namespace.define("Skype.Application", {
        state: {
            get: function () {
                if (!instance) {
                    instance = new Skype.Application.GlobalState([
                        new Skype.Application.KeyboardVisibilityProvider(),
                        new Skype.Application.ViewStateProvider(),
                        new Skype.Application.SearchProvider(),
                        Skype.Application.Providers.OrientationProvider.getInstance(),
                        Skype.Application.DeviceManager]);
                }
                return instance;
            },
            set: function (value) {
                instance = value;
            }
        },
    });

}());

