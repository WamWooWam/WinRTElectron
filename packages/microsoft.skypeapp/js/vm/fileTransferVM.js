

(function () {
    "use strict";

    var fileActions = {
        FILE_OPEN: "openFile",
        FILE_ACCEPT: "acceptFile",
        FILE_CANCEL: "cancelFile",
        FILE_UKNOWN: "FILE_UKNOWN"
    };

    var fileTransferVM = MvvmJS.Class.derive(Skype.ViewModel.FileTransferBaseVM, function (libMessageId, fileTransferId, storageFile) {
        Skype.ViewModel.FileTransferBaseVM.call(this, libMessageId, fileTransferId ? [fileTransferId] : null, storageFile);
    }, {
        _status: -1,
        transferWrapper: Skype.Utilities.nondisposableProperty(null),

        
        afterInit: function () {
            if (this.transferWrapper) {
                this.status = this.transferWrapper.statusEx;
            } else { 
                this.status = Skype.Model.TransferBase.LocalStatus.Preparing;
            }
        },

        _initWrappers: function (transfersIds) {
            this.transferWrapper = this._initTransfer(transfersIds[0]);
        },

        _initTransfers: function () {
            this.transferType = this.transferWrapper.type;
            this.isIncoming = this.transferType === LibWrap.Transfer.type_INCOMING;
            this.fileSize = this.transferWrapper.fileSize;
            fileTransferVM.base._initTransfers.call(this);
        },

        getProgressInfo: function () {
            var transferInfo = this.getSingleTransferInfo(this.transferWrapper);
            return {
                bytesTransfered: transferInfo.bytesTransfered,
                bytesPerSecond: transferInfo.bytesPerSecond,
                percentTransferred: transferInfo.percentTransferred
            };
        },

        
        _handleStatusEx: function (fileTransferId, status) {
            this.status = status;
        },

        _getAction: function () {
            switch (this._status) {
                case LibWrap.Transfer.status_NEW:
                    if (this.isIncoming) {
                        return fileActions.FILE_ACCEPT;
                    }
                    return fileActions.FILE_CANCEL;
                case LibWrap.Transfer.status_TRANSFERRING:
                case LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY:
                case LibWrap.Transfer.status_CONNECTING:
                case LibWrap.Transfer.status_WAITING_FOR_ACCEPT:
                case LibWrap.Transfer.status_REMOTELY_PAUSED:
                case LibWrap.Transfer.status_PAUSED:
                    return fileActions.FILE_CANCEL;
                case LibWrap.Transfer.status_COMPLETED:
                    return fileActions.FILE_OPEN;
                case LibWrap.Transfer.status_CANCELLED:
                case LibWrap.Transfer.status_FAILED:
                    if (!this.isIncoming) {
                        return fileActions.FILE_OPEN;
                    }
                    break;
            }
            return fileActions.FILE_UKNOWN;
        },

        

        
        
        
        status: {
            get: function () {
                return this._status;
            },
            set: function (value) {
                if (isNaN(value)) {
                    log("Invalid status ! expected number");
                    return;
                }
                if (this._status !== value) {
                    this._status = value;
                    this.statusString = Skype.Model.TransferBase.getFileTransferStatusString(value, (value === LibWrap.Transfer.status_FAILED && this.transferWrapper) ? this.transferWrapper.failureReason : null);
                    this.statusClass = Skype.Model.TransferBase.transferStatusToString(value);
                    if (value == LibWrap.Transfer.status_COMPLETED) {
                        roboSky.write("Conversation,fileTransferCompleted");
                    }
                    this.notifyTransferWasUpdated(true);
                }
            }
        },

        onPreparingSendFileFailed: function (errorCode) {
            if (!errorCode) {
                
                this.status = Skype.Model.TransferBase.LocalStatus.PreparingFailed;
            } else {
                
                switch (errorCode) {
                    case LibWrap.WrSkyLib.transfer_SENDFILE_ERROR_TRANSFER_TOO_MANY_PARALLEL:
                    case LibWrap.WrSkyLib.transfer_SENDFILE_ERROR_TRANSFER_OPEN_FAILED:
                    case LibWrap.WrSkyLib.transfer_SENDFILE_ERROR_TRANSFER_BAD_FILENAME:
                        this.status = LibWrap.Transfer.status_FAILED;
                        break;
                }
            }
        },

        onTap: function () {
            var action = this._getAction();
            switch (action) {
                case fileActions.FILE_OPEN:
                    this.openFile();
                    break;
                case fileActions.FILE_ACCEPT:
                    this.acceptFile();
                    break;
                case fileActions.FILE_CANCEL:
                    this.cancelFile();
                    break;
            }
        },

        getTransferAria: function () {
            var action = this._getAction();
            
            var actionString = action === fileActions.FILE_OPEN ? "aria_chat_filetransfer_action_open".translate() :
                action === fileActions.FILE_ACCEPT ? "aria_chat_filetransfer_action_accept".translate() : action === fileActions.FILE_CANCEL ? "aria_chat_filetransfer_action_cancel".translate() : "";

            var completeString = this.percentTransferred !== 100 ? "aria_chat_filetransfer_progress".translate(this.percentTransferred) : "";
            this.ariaLabel = "aria_chat_filetransfer_text".translate(actionString, this.fileName, Skype.UI.Util.getFormattedFileSize(this.fileSize), this.statusString, completeString);
            return this.ariaLabel;
        },

        fileName: {
            get: function () {
                return this.transferWrapper ? this.transferWrapper.fileName : this._storageFile ? this._storageFile.name : "";
            }
        },

        
        cancelFile: function () {
            var title = this.isIncoming ? "transfer_incoming_cancel_download_title" : "transfer_outgoing_cancel_download_title";
            var buttonTitle = this.isIncoming ? "transfer_incoming_cancel_download_button_title" : "transfer_outgoing_cancel_download_button_title";

            Skype.UI.Dialogs.showConfirmDialogAsync(this.cancelActionEl, title.translate(), buttonTitle.translate()).then(function (result) {
                if (result && this.transferWrapper) {
                    this.transferWrapper.cancel();
                }
            }.bind(this));
        },

        acceptFile: function () {
            if (this.transferWrapper) {
                this.transferWrapper.accept();
            }
        },
      
        _launchFile: function (file) {
            Windows.System.Launcher.launchFileAsync(file).done(function (success) {
                if (success) {
                    log("Launched {0}".format(file.path));
                } else {
                    log("{0} is not allowed to open".format(file.path));
                }
            }, function (error) {
                log("Unable to launch {0}: message {1}".format(file.path, error));
            });
        },

        openFile: function () {
            if (!this.transferWrapper) {
                return;
            }

            var fileName = this.transferWrapper.targetFileName;
            if (!fileName) {
                return;
            }

            if (!Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.containsItem(fileName)) {
                log("Invalid access token");
                return;
            }

            var that = this;
            Skype.AccessTokenManager.instance.getFileAsync(fileName).then(function (storageFile) {
                that._launchFile(storageFile);
            }, function () {
                log("Unable to access file " + fileName);
            });
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        FileTransferVM: fileTransferVM
    });
}());