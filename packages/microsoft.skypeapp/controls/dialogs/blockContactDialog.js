


(function () {
    "use strict";

    var blockContactDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "blockContactDialog";
    }, {

        onHide: function () {
            this._completeCallback({
                result: this._result,
                spam: this.vm.spam,
                remove: this.vm.remove
            });
        },

        onAfterShow: function () {
            this.vm.bind("spam", function (isSpam) {
                this.vm.remove = isSpam;
                this.vm.disableRemove = isSpam;
            }.bind(this));
        },

        onShow: function (title, okTitle, removeTitle, spamTitle, ariaTitle, ariaOkTitle, ariaRemoveTitle, ariaSpamTitle, extraClass) {
            this.vm.title = title;
            this.vm.okTitle = okTitle;
            this.vm.spam = false;
            this.vm.remove = false;
            this.vm.disableRemove = false;
            this.vm.spamTitle = spamTitle;
            this.vm.removeTitle = removeTitle;
            this.vm.extraClass = extraClass;
            this.vm.ariaTitle = ariaTitle;
            this.vm.ariaOkTitle = ariaOkTitle;
            this.vm.ariaRemoveTitle = ariaRemoveTitle;
            this.vm.ariaSpamTitle = ariaSpamTitle;
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
                spam: false,
                remove: false,
                disableRemove: false,
                removeTitle: "",
                spamTitle: "",
                extraClass: "",
                ariaTitle: "",
                ariaOkTitle: "",
                ariaRemoveTitle: "",
                ariaSpamTitle: ""
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        BlockContactDialog: blockContactDialog
    });
})();