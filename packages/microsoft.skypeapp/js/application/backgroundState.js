

(function() {
    "use strict";

    
    
    var state = {
        Foreground: 0,
        Background: 1
    };

    var stateKeyName = "bgState";

    function setState(newState) {
        log("Skype.Application.BackgroundState setState.background: {0}".format(!!newState));

        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        localSettings.values[stateKeyName] = newState;
    }

    function isInBackground() {
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var appState = localSettings.values[stateKeyName];

        if (!lib && appState === state.Foreground) {
            
            
            
            return true;
        }
        return appState === state.Background;    
    }

    WinJS.Namespace.define("Skype.Application.BackgroundState", {
        State: state,
        setState: setState,
        isInBackground: isInBackground
    });

})();