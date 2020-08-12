


(function () {
    "use strict";

    var nameWithNumberDialog = MvvmJS.Class.derive(Skype.UI.Dialogs.DialogBase, function (element) {
        this.base(element);
        this.name = "nameWithNumberDialog";
        this.countryInputModel = {};
    }, {
        _preventEmptyName: false,
        countryInputModel: null,

        onHide: function () {
            var countriesVm = this.countryInputModel;
            this._completeCallback({
                result: this._result,
                prefix: countriesVm.country.data.prefix,
                number: countriesVm.input, 
                phoneType: this.vm.contactNumberType,
                contactName: this.vm.contactName
            });
            countriesVm.onHide();
        },

        isAcceptPermitted: function () {
            return !this.vm.okDisabled;
        },

        onAfterShow: function () {
            if (!this.vm.numberHidden) {
                this.countryInputModel.bind("isInputCallable", function (callable) {
                    this.vm.isCallable = callable;
                    this.updateOkButton();
                }.bind(this));
                this.countryInputModel.selectCountryByInput(this.vm.contactNumber);
            }
        },

        keyPress: function (e) {
            
            if (e.target.nodeName == "INPUT") {
                Skype.UI.Dialogs.DialogBase.prototype.keyPress.call(this, e);
            }
        },

        onKeyboardVisibilityChanged: function (visible) {
            if (!visible && this.flyout.element && this.flyout.element.style.visibility === "visible") { 
                WinJS.Promise.timeout(400).then(function () { 
                    this.flyout._findPosition(); 
                }.bind(this));
            }
        },

        updateOkButton: function () {
            this.vm.okDisabled = (!this.vm.numberHidden && !this.vm.isCallable) || 
                (this._preventEmptyName && !this.vm.nameHidden && (!this.vm.contactName || this.vm.contactName.trim() === "")); 
        },

        onShow: function (title, number, showNumber, contactName, showName, preventEmptyName) {
            this.vm.title = title;
            this.vm.okTitle = "addnumber_save".translate();
            this.vm.okDisabled = true;
            this.vm.contactNumberType = "mobile";
            this.vm.contactName = contactName;
            this.vm.contactNumber = number;
            this.vm.autofocus = showName ? 0 : 1;
            this.vm.nameHidden = !showName;
            this.vm.isCallable = false;
            this.vm.numberHidden = !showNumber;
            this._preventEmptyName = preventEmptyName;
            this.updateOkButton();
            this.vm.ariaContactNumberType = "aria_add_number_dialog_type_of_number".translate("");
        },

        onInit: function () {
            this.vm = WinJS.Binding.as({
                title: "",
                okTitle: "",
                okDisabled: true,
                contactNumberType: "mobile",
                contactName: "",
                contactNumber: "",
                autofocus: 0,
                nameHidden: false,
                isCallable: false,
                numberHidden: false,
                ariaContactNumberType: "aria_add_number_dialog_type_of_number".translate(""),
            });
        }
    });

    WinJS.Namespace.define("Skype.UI.Dialogs", {
        NameWithNumberDialog: nameWithNumberDialog
    });
})();