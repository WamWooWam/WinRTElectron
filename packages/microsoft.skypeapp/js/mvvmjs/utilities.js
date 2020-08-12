

(function(undefined) {
    "use strict";

    function createEventProperties(events) {

        WinJS.Utilities.createEventProperties(events);

        var props = { };
        for (var i = 0, len = arguments.length; i < len; i++) {
            var name = arguments[i];
            props["_on" + name] = function(details) {
                this.dispatchEvent(name, details);
            };

        }
        return props;
    }

    WinJS.Namespace.define("MvvmJS.Utilities", {
        createEventProperties: createEventProperties
    });
}());