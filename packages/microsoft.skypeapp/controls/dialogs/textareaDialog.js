


(function () {
    "use strict";

    var textareaDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "textareaDialog";
    }, {
        onHide: function () {
            this._completeCallback({
                result: this._result,
                value: this.vm.inputText
            });
        },

        onShow: function (title, okTitle, inputText, maxLength) {
            this.vm.title = title;
            this.vm.okTitle = okTitle;
            this.vm.inputText = inputText;
            this.vm.maxLength = maxLength;
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
                inputText: "",
                maxLength: 999,
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        TextareaDialog: textareaDialog
    });
})();