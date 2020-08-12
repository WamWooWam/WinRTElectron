

(function () {
    "use strict";

    var fileTransfer = Skype.UI.Control.define(function (element, options) {
        this.initViewModel(options.libMessageId, options.fileTransferId, options.storageFile);
    }, {
        viewModel: null,
        element: null,

        _onReady: function () {
            
            this._handlePointerEvent = this._handlePointerEvent.bind(this);
            this.regEventListener(this.element, "keydown", this._handleKeyEvent.bind(this));
            this.regEventListener(this.element, "pointerdown", this._handlePointerEvent);
            this.regEventListener(this.element, "pointerup", this._handlePointerEvent);
            this.regEventListener(this.element, "click", this._handlePointerEvent);
            this.regEventListener(this.element, "pointerout", this._handlePointerEvent);
            this.regEventListener(this.element, "focus", this._onFocused.bind(this));
            this.forwardEvent(this.viewModel, fileTransfer.Events.TransferStateChanged);

            WinJS.Utilities.addClass(this.element, "kb-accessible");

            WinJS.Resources.processAll(this.element);
            var bindPromise = WinJS.Binding.processAll(this.element, this.viewModel);
            bindPromise.then(function() {
                roboSky.write("Conversation,fileTransferReady");
            });
            return bindPromise;
        },

        _onFocused: function () {
            
            Skype.UI.Util.addTemporaryTabIndex(this, this.element);
        },

        _handleKeyEvent: function (evt) {
            if (evt.type === "keydown" && evt.keyCode === WinJS.Utilities.Key.enter) {
                this.viewModel.onTap();
            }
        },

        _handlePointerEvent: function (evt) {
            switch (evt.type) {
                case "pointerdown":
                    WinJS.UI.Animation['pointerDown'](this.element);
                    break;
                case "click":
                    this.viewModel.onTap();
                    break;
                case "pointerout":
                case "pointerup":
                    WinJS.UI.Animation['pointerUp'](this.element);
                    break;
            }
        },

        

        
        render: function (element) {
            this.element = document.createElement('div'); 
            element.appendChild(this.element);
            return WinJS.UI.Fragments.renderCopy(this.getPageName(), this.element).then(this._onReady.bind(this));
        },

        initViewModel: function (libMessageId, fileTransferId, storageFile) {
            this.viewModel = new Skype.ViewModel.FileTransferVM(libMessageId, fileTransferId, storageFile);
        },

        onPreparingSendFileFailed: function (errorCode) {
            
            
            
            
            
            

            this.viewModel && this.viewModel.onPreparingSendFileFailed(errorCode);
        },

        getPageName: function () {
            return "/controls/fileTransfer.html";
        },

        getTransferAria: function () {
            
            
            

            
            return this.viewModel.getTransferAria();
        },
    }, {
        Events: {
            TransferStateChanged: "TransferStateChanged"
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        FileTransfer: WinJS.Class.mix(fileTransfer, WinJS.Utilities.eventMixin)
    });
})();
