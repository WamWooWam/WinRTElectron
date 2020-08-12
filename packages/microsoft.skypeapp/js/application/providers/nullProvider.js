

(function () {
    "use strict";
    
    
    
    var nullProvider = WinJS.Class.define(function () {
    }, {
        alive: function () {},
    });

    WinJS.Namespace.define("Skype.Application.Providers", {
        NullProvider: WinJS.Class.mix(nullProvider, Skype.Class.disposableMixin)
    });
}());