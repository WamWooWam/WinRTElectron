

(function () {
    "use strict";

    var fileTransferGroup = Skype.UI.Control.derive(Skype.UI.FileTransfer, function (element, options) {
        Skype.UI.FileTransfer.call(this, element, options);
    }, {

        initViewModel: function (libMessageId, fileTransferIds, storageFile) {
            this.viewModel = new Skype.ViewModel.FileTransferGroupVM(libMessageId, fileTransferIds, storageFile);
        },

        getPageName: function () {
            return "/controls/fileTransferGroup.html";
        },
    });

    WinJS.Namespace.define("Skype.UI", {
        FileTransferGroup: fileTransferGroup
    });
})();

