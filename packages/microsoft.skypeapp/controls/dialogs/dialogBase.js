


(function () {
    "use strict";

    
    
    
    
    
    

    
    var dialogBase = Skype.UI.ObservableControl.define(function (element) {
        this._element = element;
        this.okAction = this.setResultAndHide.bind(this, true);
        this.cancelAction = this.setResultAndHide.bind(this, false);
        this.keyPress = this.keyPress.bind(this);
    }, {
        name: null,
        flyout: null,
        vm: null,

        _element: null,
        _isVisible: false,
        _result: null,
        outerEventsHandler: null,

        _onAfterHide: function () {
            this._isVisible = false;
            Skype.UI.TabConstrainer.suppressed = false;
            this.onHide();
            roboSky.write("Dialog,hide");
            this.outerEventsHandler.onAfterHide();
        },

        keyPress: function (e) {
            
            if (e.keyCode === WinJS.Utilities.Key.enter && !e.shiftKey) {
                e.preventDefault();
                this.setResultAndHide(true);
            }
        },

        _onBeforeShow: function () {
            this.onBeforeShow();
            this.outerEventsHandler.onBeforeShow();
        },
        
        _onNavigated: function () {
            this.flyout.hide();
        },

        _onAfterShow: function () {
            this._isVisible = true;
            Skype.UI.TabConstrainer.suppressed = true;
            this.onAfterShow();
            roboSky.write("Dialog,show");
            this.outerEventsHandler.onAfterShow();
        },

        _onKeyboardVisibilityChanged: function () {
            if (Skype.Application.state.keyboardOccludedRectangle) { 
                this.onKeyboardVisibilityChanged(Skype.Application.state.isShowingKeyboard, Skype.Application.state.keyboardOccludedRectangle);
            }
        },

        setResultAndHide: function (result) {
            if (this._isVisible && !(result && !this.isAcceptPermitted())) {
                this._result = result;
                this.flyout.hide();
            }
        },

        
        show: function () {
            var anchor = arguments[0],
                position = arguments[1],
                newArgs = Array.prototype.splice.call(arguments, 2);
            
            this.onShow.apply(this, newArgs);
            this._result = null;

            return new WinJS.Promise(function (completeCallback, errorCallback) {
                return WinJS.Promise.timeout().then(function () {
                    
                    
                    return WinJS.Promise.timeout();
                }).then(function () {
                    this._completeCallback = completeCallback;
                    this._errorCallback = errorCallback;

                    

                    return this.flyout.show(anchor, position);
                }.bind(this));
            }.bind(this));
        },

        init: function (outerEventsHandler) {
            this.outerEventsHandler = outerEventsHandler;
            return WinJS.UI.processAll(this._element, true).then(function (element) {                
                this.flyout = element.querySelector(".dialogFlyout").winControl;                
                this.regEventListener(this.flyout, "afterhide", this._onAfterHide.bind(this));
                this.regEventListener(this.flyout, "aftershow", this._onAfterShow.bind(this));
                this.regEventListener(this.flyout, "beforeshow", this._onBeforeShow.bind(this));
                this.regBind(Skype.Application.state, "isShowingKeyboard", this._onKeyboardVisibilityChanged.bind(this));
                this.regEventListener(Skype.Application.state, "navigated", this._onNavigated.bind(this));

                WinJS.Resources.processAll(element);
                this.onInit();
                return WinJS.Binding.processAll(element, this);
            }.bind(this));
        },

        

        
        onInit: function () { },

        
        onHide: function () { },

        
        onShow: function () { },

        
        onBeforeShow: function () { },

        
        onAfterShow: function () { },

        
        onKeyboardVisibilityChanged: function (visible, occludedRectangle) { },

        
        isAcceptPermitted: function () { return true; }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        DialogBase: dialogBase
    });
})();