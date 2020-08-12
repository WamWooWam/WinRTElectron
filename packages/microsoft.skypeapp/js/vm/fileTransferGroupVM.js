

(function () {
    "use strict";

    var groupStatus = {
        WAITING: "WAITING",
        PROGRESS: "PROGRESS",
        CANCELLED: "CANCELLED",
        COMPLETED: "COMPLETED",
        MIXED: "MIXED",
    };

    var statusLocalizationMap = {};
    statusLocalizationMap[groupStatus.WAITING] = "chatitem_send_file_group_waiting";
    statusLocalizationMap[groupStatus.PROGRESS] = "chatitem_send_file_group_in_progress";
    statusLocalizationMap[groupStatus.CANCELLED] = "chatitem_send_file_group_cancelled";
    statusLocalizationMap[groupStatus.COMPLETED] = "chatitem_send_file_group_completed";

    var fileTransferGroupVM = MvvmJS.Class.derive(Skype.ViewModel.FileTransferBaseVM, function (libMessageId, fileTransferIds, storageFile) {
        

        Skype.ViewModel.FileTransferBaseVM.call(this, libMessageId, fileTransferIds ? [fileTransferIds] : null, storageFile);
    }, {
        _globalStatus: groupStatus.MIXED,
        _transferWrappers: Skype.Utilities.nondisposableProperty(null),
        _isNextGenTransfer: true,

        afterInit: function () {
            if (this._transferWrappers) {
                this._updateGroupStatus();
            } else { 
                this.statusString = "transfer_preparing".translate();
            }
        },

        _initWrappers: function (transfersIds) {
            this._transferWrappers = [];
            var transferWrapper, i;
            for (i = 0; i < transfersIds.length; i++) {
                transferWrapper = this._initTransfer(transfersIds[i]);
                this._transferWrappers.push(transferWrapper);
            }

            this._isNextGenTransfer = (this._transferWrappers.length > 0) && (this._transferWrappers[0].typeEx === Skype.FileTransfer.TransferType.OutgoingNextGen);
            if (this._isNextGenTransfer) {
                this.regBind(this._transferWrappers[0], "groupStatus", this._handleGroupStatus.bind(this));
                for (i = 0; i < this._transferWrappers.length; i++) {
                    this._transferWrappers[i].subscribeTransferAdded(this._transferAdded.bind(this));
                }
            }
        },

        _transferAdded: function () {
            this._updateGroupStatus();
        },

        _handleGroupStatus: function () {
            this._updateNextGenOutogingTransferStatus();
        },

        _initTransfers: function () {
            var wrapper = this._transferWrappers[0];
            this.transferType = wrapper.type;
            this.isIncoming = this.transferType === LibWrap.Transfer.type_INCOMING;
            this.fileSize = wrapper.fileSize;
            fileTransferGroupVM.base._initTransfers.call(this);
        },

        getProgressInfo: function () {
            var bytesTransferedSum = 0, bytesPerSecondSum = 0, percentTransferredSum = 0, transferInfo;
            var cnt = this._transferWrappers.length; 

            for (var i = 0; i < cnt; i++) {
                transferInfo = this.getSingleTransferInfo(this._transferWrappers[i]);
                bytesTransferedSum += transferInfo.bytesTransfered;
                bytesPerSecondSum += transferInfo.bytesPerSecond;
                percentTransferredSum += transferInfo.percentTransferred;
            }

            return {
                bytesTransfered: bytesTransferedSum,
                bytesPerSecond: bytesPerSecondSum / cnt,
                percentTransferred: percentTransferredSum / cnt 
            };
        },

        onBytesTransferedUpdated: function () {
            this._updateProgressIndicatorVisibility();
        },

        _updateProgressIndicatorVisibility: function () {
            this.isInProgress = this._globalStatus !== groupStatus.CANCELLED &&
                this.percentTransferred != 0 && this.percentTransferred != 100 ||
                    this._globalStatus === groupStatus.WAITING || this._globalStatus === groupStatus.PROGRESS;
        },

        _handleStatusEx: function () {
            if (!this._initialized) {
                return; 
            }
            this._updateGroupStatus();
            this.updateBytesTransfered();
        },

        _updateNextGenOutogingTransferStatus: function () {
            var transfer = this._transferWrappers[0];
            if (!transfer) {
                return;
            }

            if (this.globalStatus === groupStatus.CANCELLED) { 
                return;
            }
            var ngGroupStatus = transfer.groupStatus;
            if (ngGroupStatus.expired) {
                this.globalStatus = groupStatus.CANCELLED;
            } else if (ngGroupStatus.transferringCnt > 0) {
                this.globalStatus = groupStatus.PROGRESS;
            } else if (ngGroupStatus.waitingCnt === 0) {
                this.globalStatus = groupStatus.COMPLETED;
            } else {
                this.globalStatus = groupStatus.WAITING;
            }
        },

        _updateGroupStatus: function () {
            if (this._isNextGenTransfer) {
                this._updateNextGenOutogingTransferStatus();
                return;
            }

            if (this.globalStatus === groupStatus.COMPLETED || this.globalStatus === groupStatus.CANCELLED) {
                return;
            }

            var waitingCnt = 0,
                cancelledCnt = 0,
                finishedCnt = 0,
                transferWrapper,
                transfersCnt = this._transferWrappers.length;
            for (var i = 0; i < transfersCnt; i++) {
                transferWrapper = this._transferWrappers[i];
                if (!transferWrapper) {
                    continue;
                }
                if (transferWrapper.isInFinalState) {
                    finishedCnt++;
                }
                if ((transferWrapper.statusEx === LibWrap.Transfer.status_NEW) || (transferWrapper.statusEx === LibWrap.Transfer.status_WAITING_FOR_ACCEPT)) {
                    waitingCnt++;
                }
                if ((transferWrapper.statusEx === LibWrap.Transfer.status_CANCELLED) || (transferWrapper.statusEx === LibWrap.Transfer.status_CANCELLED_BY_REMOTE)) {
                    cancelledCnt++;
                }
            }

            if (cancelledCnt === transfersCnt) {
                this.globalStatus = groupStatus.CANCELLED;
                return;
            }

            if (waitingCnt === transfersCnt) {
                this.globalStatus = groupStatus.WAITING;
                return;
            }

            if (finishedCnt === transfersCnt) {
                this.globalStatus = groupStatus.COMPLETED;
                return;
            }

            this.globalStatus = groupStatus.MIXED;
            this._updateMixedStatusString();
        },

        _updateMixedStatusString: function () {
            var transferringCnt = 0,
                completedCnt = 0,
                i,
                transferWrapper;
            for (i = 0; i < this._transferWrappers.length; i++) {
                transferWrapper = this._transferWrappers[i];
                if (!transferWrapper) {
                    continue;
                }
                if ((transferWrapper.statusEx === LibWrap.Transfer.status_TRANSFERRING) || (transferWrapper.statusEx === LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY)) {
                    transferringCnt++;
                }
                if (transferWrapper.statusEx === LibWrap.Transfer.status_COMPLETED) {
                    completedCnt++;
                }
            }
            if (transferringCnt > 0) {
                this.statusString = Skype.Globalization.formatNumericID(statusLocalizationMap[groupStatus.PROGRESS], transferringCnt).translate(transferringCnt);
            } else if (completedCnt > 0) {
                this.statusString = Skype.Globalization.formatNumericID(statusLocalizationMap[groupStatus.COMPLETED], completedCnt).translate(completedCnt);
            } else {
                this.statusString = "";
            }
        },

        _updateNextGenStatusString: function () {
            var transfer = this._transferWrappers[0];
            if (!transfer) {
                return;
            }
            var ngGroupStatus = transfer.groupStatus;
            var completedCnt = ngGroupStatus.completedCnt;
            var transferringCnt = ngGroupStatus.transferringCnt;
            if (transferringCnt > 0) {
                this.statusString = Skype.Globalization.formatNumericID(statusLocalizationMap[groupStatus.PROGRESS], transferringCnt).translate(transferringCnt);
            } else if (completedCnt > 0) {
                this.statusString = Skype.Globalization.formatNumericID(statusLocalizationMap[groupStatus.COMPLETED], completedCnt).translate(completedCnt);
            } else {
                this.statusString = "";
            }
        },

        globalStatus: {
            get: function () {
                return this._globalStatus;
            },
            set: function (value) {
                if (value === groupStatus.MIXED) {
                    this._updateMixedStatusString();
                    this.notifyTransferWasUpdated(true);
                    return;
                }
                if (this._isNextGenTransfer) {
                    this._updateNextGenStatusString();
                    this.notifyTransferWasUpdated(true);
                }
                if (this._globalStatus != value) {
                    this._globalStatus = value;
                    this.statusClass = value;
                    if (value === groupStatus.COMPLETED) {
                        var completedCnt = 0,
                            i,
                            transferWrapper;
                        for (i = 0; i < this._transferWrappers.length; i++) {
                            transferWrapper = this._transferWrappers[i];
                            if (!transferWrapper) {
                                continue;
                            }
                            if (transferWrapper.statusEx === LibWrap.Transfer.status_COMPLETED) {
                                completedCnt++;
                            }
                        }
                        this.statusString = Skype.Globalization.formatNumericID(statusLocalizationMap[groupStatus.COMPLETED], completedCnt).translate(completedCnt);
                    } else {
                        this.statusString = statusLocalizationMap[value].translate();
                    }
                    this._updateProgressIndicatorVisibility();
                    this.notifyTransferWasUpdated(true);
                }
            }
        },

        onTap: function () {
            if ([groupStatus.WAITING, groupStatus.PROGRESS, groupStatus.MIXED].contains(this.globalStatus)) {
                this.cancelFile();
            }
        },

        fileName: {
            get: function () {
                var fileName = "";
                if (this._transferWrappers.length > 0) {
                    fileName = this._transferWrappers[0].fileName;
                } else if (this._storageFile) {
                    fileName = this._storageFile.name;
                }
                return fileName;
            }
        },

        getTransferAria: function () {
            var actionString = "";
            if ([groupStatus.WAITING, groupStatus.PROGRESS, groupStatus.MIXED].contains(this.globalStatus)) {
                actionString = "aria_chat_filetransfergroup_action_cancel".translate();
            }
            
            
            var completeString = this.percentTransferred !== 100 ? "aria_chat_filetransfer_progress".translate(this.percentTransferred) : "";
            this.ariaLabel = "aria_chat_filetransfergroup_text".translate(actionString, this.fileName, Skype.UI.Util.getFormattedFileSize(this.fileSize), this.statusString, completeString);

            return this.ariaLabel;
        },

        
        cancelFile: function () {
            Skype.UI.Dialogs.showConfirmDialogAsync(this.cancelActionEl, "transfer_outgoing_cancel_download_title".translate(),
                "transfer_outgoing_cancel_download_button_title".translate()).then(function (result) {
                    if (result) {
                        for (var i = 0; i < this._transferWrappers.length; i++) {
                            this._transferWrappers[i].cancel();
                        }
                        this.globalStatus = groupStatus.CANCELLED;
                    }
                }.bind(this));
        },
    }, {
        isInProgress: false
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        FileTransferGroupVM: fileTransferGroupVM
    });

}());