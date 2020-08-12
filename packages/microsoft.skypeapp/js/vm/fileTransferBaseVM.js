

(function () {
    "use strict";

    var NOTIFICATION_THROTTLE_IN_MS = 10e3; 

    var fileTransferBaseVM = MvvmJS.Class.define(function (libMessageId, fileTransferIds, storageFile) {
        this._init(libMessageId, fileTransferIds, storageFile);
        this._sendTransferStateUpdate = this._sendTransferStateUpdate.bind(this);
    }, {
        _storageFile: null, 
        transferType: -1,  
        cancelActionEl: null,
        _initialized: false,
        _libMessageId: 0,

        afterInit: function () {
        },

        _init: function (libMessageId, fileTransferIds, storageFile) {
            this._libMessageId = libMessageId;
            if (fileTransferIds) {
                this._initWrappers(fileTransferIds);
                this._initTransfers();
            } else if (storageFile) {
                
                this._initTemporaryCopyTransfer(storageFile);
            }
            this.afterInit();
        },

        _initTransfer: function (fileTransferId) {
            var transferWrapper = Skype.FileTransferManager.instance.getTransfer(fileTransferId);
            if (!transferWrapper) {
                
                log("fileTransferBaseVM: transferWrapper hasn't been added to the FT object repository yet");
                Skype.FileTransferManager.instance.addTransfers(this._libMessageId, false);
                transferWrapper = Skype.FileTransferManager.instance.getTransfer(fileTransferId);
            }
            transferWrapper.subscribeBytesTransfered(this.updateBytesTransfered.bind(this));
            this.regBind(transferWrapper, "statusEx", this._handleStatusEx.bind(this, fileTransferId));

            return transferWrapper;
        },

        _initWrappers: function (transfersIds) {
        },

        _initTransfers: function (transfersIds) {
            this._initialized = true;
            this.updateBytesTransfered();
        },

        _initTemporaryCopyTransfer: function (storageFile) {
            this._storageFile = storageFile;
            storageFile.getBasicPropertiesAsync().then(function (basicProperties) {
                this.fileSize = basicProperties.size;
            }.bind(this));
            this.isCopyingFile = true;
        },

        _sendTransferStateUpdate: function () {
            this.dispatchEvent(Skype.UI.FileTransfer.Events.TransferStateChanged);
        },

        updateBytesTransfered: function () {
            var progressInfo = this.getProgressInfo();
            this.bytesTransfered = progressInfo.bytesTransfered;
            this.bytesPerSecond = progressInfo.bytesPerSecond;
            this.percentTransferred = progressInfo.percentTransferred;

            var timeToFinish;
            if (this.bytesPerSecond > 1024) {
                this.isRemainingFinite = true;
                timeToFinish = Math.ceil((this.fileSize - this.bytesTransfered) / this.bytesPerSecond);
            } else {
                this.isRemainingFinite = false;
                timeToFinish = 0;
            }
            this.remainingTime = Skype.Utilities.formatDuration(timeToFinish, true);
            this.onBytesTransferedUpdated && this.onBytesTransferedUpdated();
            this.notifyTransferWasUpdated();
        },

        getSingleTransferInfo: function (transferWrapper) {
            var bytesTransfered = transferWrapper.bytesTransfered;
            var bytesPerSecond = transferWrapper.bytesPerSecond;
            var percentTransferred;
            if (!transferWrapper.isInFinalState) {
                if (this.fileSize > 0) {
                    percentTransferred = Math.ceil(bytesTransfered / this.fileSize * 100); 
                } else {
                    percentTransferred = 0; 
                }
            } else {
                percentTransferred = 100;
            }
            return { bytesTransfered: bytesTransfered, bytesPerSecond: bytesPerSecond, percentTransferred: percentTransferred };
        },

        notifyTransferWasUpdated: function (force) {
            if (force) {
                this.dispatchEvent(Skype.UI.FileTransfer.Events.TransferStateChanged, { force: true });
                return;
            }

            if (Skype.Application.state.view.isTouchSupported) {
                this.throttle(NOTIFICATION_THROTTLE_IN_MS, this._sendTransferStateUpdate);
            }
        },

        fileName: {
            get: function () {
                return this.transferWrapper ? this.transferWrapper.fileName : this._storageFile ? this._storageFile.name : "";
            }
        },
    }, { 

        
        statusString: "",
        statusClass: "", 
        bytesTransfered: 0,
        percentTransferred: 0,
        fileSize: 0,
        remainingTime: 0,
        ariaLabel: "",

        
        isCopyingFile: false,
        isIncoming: false,
        isRemainingFinite: false,
    }, {
        TRANSFER_ITEM_HEIGHT: 67,
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        FileTransferBaseVM: WinJS.Class.mix(fileTransferBaseVM, Skype.Class.disposableMixin, WinJS.Utilities.eventMixin)
    });

}());