


(function () {
    "use strict";

    var inputDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "inputDialog";
        this.checkDisabled = this.checkDisabled.bind(this);
    }, {
        _preventEmpty: false,

        onHide: function () {
            this._completeCallback({
                result: this._result,
                inputText: this.vm.inputText
            });
        },

        checkDisabled: function () {
            if (this._preventEmpty) {
                this.vm.okDisabled = !this.vm.inputText || this.vm.inputText.trim() === "";
            }
        },

        isAcceptPermitted: function () {
            return !this.vm.okDisabled;
        },

        onShow: function (title, okTitle, ariaInputLabel, inputText, maxLength, preventEmpty) {
            this.vm.title = title;
            this.vm.okTitle = okTitle;
            this.vm.inputText = inputText;
            this.vm.ariaInputLabel = ariaInputLabel;
            this.vm.maxLength = maxLength;
            this._preventEmpty = preventEmpty;
            this.checkDisabled();
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
                inputText: "",
                ariaInputLabel: "",
                maxLength: 999,
                okDisabled: false,
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        InputDialog: inputDialog
    });
})();