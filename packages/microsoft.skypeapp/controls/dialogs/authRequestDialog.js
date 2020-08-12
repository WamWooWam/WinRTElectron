


(function () {
    "use strict";

    var authRequestDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "authRequestDialog";
        this.autoselect = this.autoselect.bind(this);
    }, {
        _clickEater: null,

        onHide: function () {
            WinJS.Utilities.removeClass(this._clickEater, "AUTHREQUEST");
            this.flyout.element.style.marginTop = "";

            this._completeCallback({
                result: this._result,
                inputText: this.vm.inputText
            });
        },

        _repositionFlyout: function (height) {
            var dialog = this.flyout.element;
            var centerY = (document.body.clientHeight - dialog.clientHeight) / 2;
            var marginTop = (centerY + dialog.clientHeight > height) ? height - dialog.clientHeight : centerY;

            dialog.style.marginTop = marginTop < 0 ? "0px" : marginTop + "px";
        },

        autoselect: function () {
            arguments[0].currentTarget && arguments[0].currentTarget.select();
        },

        onKeyboardVisibilityChanged: function (visible, occludedRectangle) {
            this._repositionFlyout(document.body.clientHeight - occludedRectangle.height);
        },

        onBeforeShow: function () {
            this._repositionFlyout(document.body.clientHeight);
        },

        onShow: function (contactName, avatarUri, maxLength) {
            this.vm.title = "authrequest_title".translate(contactName),
            this.vm.okTitle = "authrequest_send".translate(),
            this.vm.cancelTitle = "dialogs_cancel".translate(),
            this.vm.inputText = "authrequest_placeholder".translate(contactName),
            this.vm.maxLength = maxLength;
            this.vm.avatarUri = avatarUri;

            this._clickEater = document.querySelector(".win-flyoutmenuclickeater");
            WinJS.Utilities.addClass(this._clickEater, "AUTHREQUEST");
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
                cancelTitle: "",
                inputText: "",
                maxLength: 999,
                avatarUri: ""
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        AuthRequestDialog: authRequestDialog
    });
})();