

(function () {
    "use strict";

    
    var LazyInitializedControl = Skype.UI.Control.define(function (element, options) {
    }, {
        _initStarted: false,
        _isReady: false,

        _initAsync: function () {
            
            if (this._isReady) {
                return WinJS.Promise.as();
            } else if (this._initStarted) {
                return WinJS.Promise.wrapError();
            } else {
                this._initStarted = true;
                return this.lazyInitAsync().then(function () {
                    this._isReady = true;
                    this._initStarted = false;
                }.bind(this));
            }
        },

        _onDispose: function () {
            
            this._onLazyDispose && this._onLazyDispose();

            
            Skype.UI.Framework.disposeInnerHTML(this.element);
            this.element.winControl = null;

            
        },

        
        
        
        _onShow: function () {
        }
    }, {
        
        
        
        
        
        
        
        
        initAsync: function (panel) {
            var winControl = Skype.UI.LazyInitializedControl._getControl(panel);
            return winControl._initAsync().then(
                function complete() {
                    winControl._onShow();
                    return winControl;
                },
                function error() {
                    
                });
        },
        
        
        
        
        _getControl: function (panel) {
            if (!panel.winControl || panel.winControl.isDisposed) {
                WinJS.UI.processAll(panel);
            }
            return panel.winControl;
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        LazyInitializedControl: LazyInitializedControl
    });
})();