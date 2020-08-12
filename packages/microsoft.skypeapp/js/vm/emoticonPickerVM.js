

(function () {
    "use strict";

    var emoticonPickerVM = MvvmJS.Class.define(function (container, options) {
        this._init();
    }, {

        _init: function () {

            this.emoticonsData = new WinJS.Binding.List(Skype.UI.emoticonDefinitions).createFiltered(function (item) {
                if (!item.file || !item.visible) {
                    return false;
                }
                return true;
            });

        },

    }, {
        emoticonsData: null
    });

    emoticonPickerVM = WinJS.Class.mix(emoticonPickerVM, Skype.Class.disposableMixin);

    WinJS.Namespace.define("Skype.ViewModel", {
        EmoticonPickerVM: emoticonPickerVM
    });
}());

