

(function () {
    "use strict";

    var keyboardVisibilityProvider = WinJS.Class.define(function () {
    }, {

        _handleSoftKeyboard: function (shown, evt) {
            Skype.Application.state.isShowingKeyboard = { shown: shown, occludedRect: evt.occludedRect };
        },

        _addSoftKeyboardListener: function () {
            var inputPane = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            if (!inputPane) {
                log("KeyboardVisibilityProvider: couldn't get input pane !");
                return;
            }
            this.regEventListener(inputPane, "showing", this._handleSoftKeyboard.bind(this, true));
            this.regEventListener(inputPane, "hiding", this._handleSoftKeyboard.bind(this, false));
        },

        alive: function () {
            this._addSoftKeyboardListener();
        },
    });

    WinJS.Namespace.define("Skype.Application", {
        KeyboardVisibilityProvider: WinJS.Class.mix(keyboardVisibilityProvider, Skype.Class.disposableMixin)
    });
}());