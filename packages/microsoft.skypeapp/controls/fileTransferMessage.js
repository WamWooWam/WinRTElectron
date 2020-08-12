

(function () {
    "use strict";

    var SEND_FILE_FAILED_TIMEOUT = 500;

    var fileTransferMessage = Skype.UI.Control.define(function FileTransferMessage_ctor() {
        
        
    }, {
        _objectId: null,
        _files: null,
        initialized: false,
        viewModel: null,
        _fileTransfersContainer: null,
        _ariaMessageUpdater: null,

        _onReady: function (frag) {
            return new WinJS.Promise(function (completeCallback) {
                this.regImmediate(function () {
                    this._fileTransfersContainer = frag.querySelector("div.fileTransfersContainer");
                    this.viewModel = new Skype.ViewModel.FileTransferMessageVM(this._fileTransfersContainer, this._ariaMessageUpdater);

                    var isPlaceholder = (this._files && !this._objectId);
                    assert(this._files || this._objectId, "Object id not defined!");
                    
                    if (isPlaceholder) {
                        this.viewModel.addPlaceholderFiles(this._files);
                    } else {
                        this.viewModel.addTransfers(this._objectId);
                        completeCallback();
                    }

                    this.element.style.minHeight = "0px"; 
                    
                    this.regEventListener(this.element, "focus", this._onContainerFocused.bind(this));
                    this.regEventListener(this.element, "keydown", this._onElementKeyDown.bind(this));

                    WinJS.Binding.processAll(frag, this.viewModel); 
                }.bind(this));
            }.bind(this));
        },

        _onContainerFocused: function () {
            this._fileTransfersContainer.firstChild.firstElementChild.focus();
        },

        _onElementKeyDown: function (event) {
            if (event.keyCode === WinJS.Utilities.Key.tab) {

                var transfers = Array.prototype.slice.call(this._fileTransfersContainer.querySelectorAll("div.fileTransfer, div.fileTransferGroup"), 0);
                if (transfers < 2) {
                    return;
                }

                var transferElPos = transfers.indexOf(event.target);

                if ((event.shiftKey && transferElPos === 0) ||
                    (!event.shiftKey && transferElPos === transfers.length - 1)) {
                    return;
                }

                var focusShift = event.shiftKey ? -1 : 1;

                transfers[transferElPos + focusShift].focus();
                event.preventDefault();
                event.stopPropagation();
            }
        },

        _prepareMessageSize: function () {
            if (!this._objectId && !this._files) {
                return;
            }

            
            var height = Skype.ViewModel.FileTransferMessageVM.calculateMessageHeight(this._objectId, this._files);
            if (height > 0 && this.element) {
                this.element.style.minHeight = height + "px";
            }
        },

        
        objectId: {
            set: function (value) {
                if (value) {
                    this._objectId = value;
                    if (this.viewModel) { 
                        this.viewModel.addTransfers(value);
                    } else {
                        this._prepareMessageSize();
                    }
                }
            }
        },

        files: {
            set: function (value) {
                this._files = value;
                this._prepareMessageSize();
            }
        },

        init: function (ariaMessageUpdater) {
            
            
            

            if (!this.initialized) {
                log('FileTransferMessage init()');
                this.initialized = true;
                this._ariaMessageUpdater = ariaMessageUpdater;
                return WinJS.UI.Fragments.renderCopy("/controls/fileTransferMessage.html", this.element).then(this._onReady.bind(this));
            }
            return WinJS.Promise.as();
        },

        onPreparingSendFileFailed: function (errorCode) {
            
            
            
            
            
            

            if (this.viewModel) {
                this.viewModel.onPreparingSendFileFailed(errorCode);
            } else {
                log("onPreparingSendFileFailed: error. Probably placeholder message didn't have a time to be rendered");
                this.regTimeout(function () {
                    this.viewModel && this.viewModel.onPreparingSendFileFailed(errorCode);
                }.bind(this), SEND_FILE_FAILED_TIMEOUT);
            }
        },

        getMessageAria: function () {
            
            
            

            return this.viewModel ? this.viewModel.getMessageAria() : "";
        }
    });

    WinJS.Namespace.define("Skype.UI", {
        FileTransferMessage: fileTransferMessage
    });
})();