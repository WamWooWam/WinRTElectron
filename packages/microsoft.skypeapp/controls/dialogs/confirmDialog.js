


(function () {
    "use strict";

    var confirmDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "confirmDialog";
    }, {
        onHide: function () {
            this._completeCallback(this._result);
        },

        onShow: function (title, okTitle) {
            this.vm.title = title;
            this.vm.okTitle = okTitle;            
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        ConfirmDialog: confirmDialog
    });
})();