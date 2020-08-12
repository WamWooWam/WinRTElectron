


(function () {
    "use strict";

    var twoButtonDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "twoButtonDialog";
    }, {
        onHide: function () {
            this._completeCallback(this._result);
        },
        
        keyPress: function () {
        },

        onShow: function (title, question, option1, option2) {
            this.vm.title = title;
            this.vm.question = question;
            this.vm.option1 = option1;
            this.vm.option2 = option2;
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                question: "",
                option1: "",
                option2: "",
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        TwoButtonDialog: twoButtonDialog
    });
})();