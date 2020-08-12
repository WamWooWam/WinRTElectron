

(function () {
    "use strict";
    
    var viewStateProvider = WinJS.Class.define(function () {
    }, {
        _onResize: function () {
            var size = {
                width: window.innerWidth,
                height: window.innerHeight
            };

            log("resize event {0}:{1}".format(size.width, size.height));

            var oldOrient = Skype.Application.state.view.orientation;
            Skype.Application.state.view.orientation = size.width <= size.height ? WinJS.UI.Orientation.vertical : WinJS.UI.Orientation.horizontal;
            
            Skype.Application.state.view.size = size;
            Skype.Diagnostics.PerfTrack.instance.writeResizeStopEvent(oldOrient !== Skype.Application.state.view.orientation, size.width, size.height);
        },
        
        _addWindowResizeListener: function () {
            this.regEventListener(window, "resize", this._onResize.bind(this));
        },

        _onAppVisibleChanged: function () {
            Skype.Application.state.isApplicationActive = !document.msHidden;
            log("UIStateProvider _onAppVisibleChanged isApplicationActive= " + Skype.Application.state.isApplicationActive);
        },

        _addVisibilityListener: function () {
            this.regEventListener(document, "visibilitychange", this._onAppVisibleChanged.bind(this));
        },
        
        alive: function () {
            this._addWindowResizeListener();
            this._onResize();
            
            this._addVisibilityListener();
            this._onAppVisibleChanged();
        }
    });

    WinJS.Namespace.define("Skype.Application", {
        ViewStateProvider: WinJS.Class.mix(viewStateProvider, Skype.Class.disposableMixin)
    });
}());