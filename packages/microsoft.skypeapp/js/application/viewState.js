

(function () {
    "use strict";

    var viewState = MvvmJS.Class.define(function () {
        var touchCapabilities = new Windows.Devices.Input.TouchCapabilities();
        this.isTouchSupported = touchCapabilities.touchPresent > 0; 
    }, {
        
        isVertical: {
            get: function () {
                return this.orientation === WinJS.UI.Orientation.vertical;
            }
        },

        isPortrait: {
            get: function () {
                switch (Windows.Graphics.Display.DisplayInformation.getForCurrentView().currentOrientation) {
                    case Windows.Graphics.Display.DisplayOrientations.portrait:
                    case Windows.Graphics.Display.DisplayOrientations.portraitFlipped:
                        return true;
                }
                return false;
            }
        },

        isTouchSupported: false

    }, {
        
        orientation: WinJS.UI.Orientation.horizontal,
        
        
        rotation: null,

        
        size: null,

        
        page: null,

        
        isOnLockScreen: false,

        appReady: false
    });


    WinJS.Namespace.define("Skype.Application", {
        ViewState: viewState

    });

}());
