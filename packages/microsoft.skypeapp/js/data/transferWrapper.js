

(function () {
    "use strict";

    
    var localStatusBase = 1000;
    var localStatus = {
        NotApplicable: localStatusBase,
        Finishing: localStatusBase + 1,
        FinishingFailed: localStatusBase + 2,
        Preparing: localStatusBase + 3, 
        PreparingFailed: localStatusBase + 4,
        ReceivingFinished: localStatusBase + 5 
    };

    var libStatusInitValue = -1;

    var transferBase = WinJS.Class.mix(MvvmJS.Class.define(function (transferId, libMessageId) {
        this._libMessageId = libMessageId;
        this._libStatus = libStatusInitValue;
        this._libTransfer = null;
        if (transferId) {
            this._libTransfer = lib.getTransfer(transferId);
            if (this._libTransfer) {
                this._initTransfer();
                this.regEventListener(this._libTransfer, "propertychange", this._onPropertyChange.bind(this));
            } else {
                log("TransferWrapper: getTransfer failed");
            }
        }
    }, {
        _initTransfer: function () {
            this._updateLibStatus();
            this._updateStatusEx();
        },

        _onPropertyChange: function (prop) {
            if (prop.detail[0] === LibWrap.PROPKEY.transfer_STATUS) {
                this._updateLibStatus();
                this._updateStatusEx();
            }
        },

        _sendStatsOnLibStatusChange: function (transferType, status, libMessageId) {
            if (transferType === LibWrap.Transfer.type_OUTGOING) {
                if (status === LibWrap.Transfer.status_COMPLETED) {
                    Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_completed_send, libMessageId);
                } else if (status === LibWrap.Transfer.status_FAILED) {
                    Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_failed_sending, libMessageId);
                }
            } else {
                if (status === LibWrap.Transfer.status_COMPLETED) {
                    Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_completed_receive, libMessageId);
                } else if (status === LibWrap.Transfer.status_FAILED) {
                    Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_failed_receiving, libMessageId);
                }
            }
            if (status === LibWrap.Transfer.status_CANCELLED) {
                Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_cancel_locally, libMessageId);
            } else if (status === LibWrap.Transfer.status_CANCELLED_BY_REMOTE) {
                Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_cancel_remotely, libMessageId);
            }
        },

        _updateLibStatus: function () {
            if (this._libTransfer) {
                var newLibStatus = this._getLibStatus();
                if (this._libStatus !== newLibStatus) {
                    var prevLibStatus = this._libStatus;
                    this._libStatus = newLibStatus;
                    var transferType = this._libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_TYPE);
                    if (transferType === LibWrap.Transfer.type_OUTGOING) {
                        if (Skype.Model.TransferBase.TerminalStates.contains(this._libStatus) &&
                            Skype.FileTransfer.allTransfersInTerminalState(this._libMessageId, this.filePath)) {
                            Skype.SendingTempStorage.instance.removeTempStorage(this.filePath);
                        }
                    } else {
                        if (this._libStatus === LibWrap.Transfer.status_COMPLETED) {
                            this.tryMovingToDestinationLocation();
                        } else if (Skype.Model.TransferBase.TerminalStates.indexOf(this._libStatus) !== -1) {
                            this._removeTempStorage();
                        }
                    }
                    
                    if ((prevLibStatus !== libStatusInitValue) &&
                        Skype.Model.TransferBase.TerminalStates.contains(prevLibStatus) &&
                        Skype.Model.TransferBase.TerminalStates.contains(this._libStatus)) {
                        this._sendStatsOnLibStatusChange(transferType, newLibStatus, this._libMessageId);
                    }
                }
            }
        },
        
        _updateStatusEx: function () {
            if ((this.localStatus === Skype.Model.TransferBase.LocalStatus.NotApplicable) || (this.localStatus === Skype.Model.TransferBase.LocalStatus.ReceivingFinished)) {
                this.statusEx = this._libStatus;
            } else {
                this.statusEx = this.localStatus;
            }
        },

        filePath: {
            get: function () {
                return this._libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
            }
        },

        _getLibStatus: function () {
            return this._libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_STATUS);
        },

        localStatus: {
            get: function () {
                var defaultLocalStatus = Skype.Model.TransferBase.LocalStatus.NotApplicable;
                if (this._libTransfer) {
                    var status = this._libTransfer.getIntProperty(LibWrap.EXTPROPKEY.ft_LOCALSTATUS);
                    if (!status) {
                        status = defaultLocalStatus;
                    }
                    return status;
                }
                return defaultLocalStatus;
            },
            set: function (value) {
                if (this._libTransfer) {
                    this._libTransfer.setExtendedIntProperty(LibWrap.EXTPROPKEY.ft_LOCALSTATUS, value);
                }
                this._updateStatusEx();
            }
        },

        cancel: function () {
            if (this._libTransfer) {
                if (!this._libTransfer.cancel()) {
                    log("TransferWrapper: cancelling failed");
                }
            }
        },

        _bytesTransferedSubscription: null,

        subscribeBytesTransfered: function (handler) {
            var prop2handlerMap = {};
            prop2handlerMap[LibWrap.PROPKEY.transfer_BYTESTRANSFERRED] = [handler];

            this._bytesTransferedSubscription = Skype.Utilities.subscribePropertyChanges(this._libTransfer, prop2handlerMap);
        },

        objectId: {
            get: function () {
                return this._libTransfer.getObjectID();
            }
        },

        targetFileName: {
            get: function () {
                return this._libTransfer.getStrProperty(LibWrap.EXTPROPKEY.ft_LOCALFILENAME);
            },
            set: function (fileName) {
                if (this._libTransfer) {
                    this._libTransfer.setExtendedStrProperty(LibWrap.EXTPROPKEY.ft_LOCALFILENAME, fileName);
                }
            }
        },

        fileName: {
            get: function () {
                return this._libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILENAME);
            }
        },

        fileSize: {
            get: function () {
                return parseInt(this._libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILESIZE));
            }
        },

        bytesTransfered: {
            get: function () {
                return parseInt(this._libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_BYTESTRANSFERRED));
            }
        },

        bytesPerSecond: {
            get: function () {
                return this._libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_BYTESPERSECOND);
            }
        },

        failureReason: {
            get: function () {
                return this._libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_FAILUREREASON);
            }
        },

        isInFinalState: {
            get: function () {
                return Skype.Model.TransferBase.TerminalStates.contains(this.statusEx);
            }
        },

        libMessageId: {
            get: function () {
                return this._libMessageId;
            }
        }
    }, {
        statusEx: 0
    }, {
        LocalStatus: localStatus,
        TerminalStates: [LibWrap.Transfer.status_COMPLETED, LibWrap.Transfer.status_CANCELLED, LibWrap.Transfer.status_CANCELLED_BY_REMOTE, LibWrap.Transfer.status_FAILED],

        
        
        
        transferStatusToString: function (transferStatus) {
            switch (transferStatus) {
                case localStatus.Preparing: return "PREPARING";
                case localStatus.Finishing: return "FINISHING";
                case localStatus.FinishingFailed: return "FINISHING_FAILED";
                case localStatus.PreparingFailed: return "PREPARING_FAILED";
            }
            return LibWrap.Transfer.statustoString(transferStatus);
        },

        
        
        
        
        getFileTransferStatusString: function (status, failureReason) {
            var key;
            switch (status) {
                case LibWrap.Transfer.status_PAUSED:
                    key = "transfer_paused";
                    break;
                case LibWrap.Transfer.status_REMOTELY_PAUSED:
                    key = "transfer_remotely_paused";
                    break;
                case LibWrap.Transfer.status_CANCELLED:
                case LibWrap.Transfer.status_CANCELLED_BY_REMOTE:
                    key = "transfer_cancelled";
                    break;
                case LibWrap.Transfer.status_COMPLETED:
                    key = "transfer_complete";
                    break;
                case LibWrap.Transfer.status_FAILED:
                    key = "transfer_failed";
                    switch (failureReason) {
                        case LibWrap.Transfer.failurereason_SENDER_NOT_AUTHORISED:
                        case LibWrap.Transfer.failurereason_FAILED_READ:
                        case LibWrap.Transfer.failurereason_FAILED_REMOTE_READ:
                        case LibWrap.Transfer.failurereason_FAILED_WRITE:
                        case LibWrap.Transfer.failurereason_FAILED_REMOTE_WRITE:
                        case LibWrap.Transfer.failurereason_REMOTE_DOES_NOT_SUPPORT_FT:
                        case LibWrap.Transfer.failurereason_TOO_MANY_PARALLEL:
                            break;
                        case LibWrap.Transfer.failurereason_REMOTELY_CANCELLED:
                        case LibWrap.Transfer.failurereason_REMOTE_OFFLINE_FOR_TOO_LONG:
                        case LibWrap.Transfer.failurereason_PLACEHOLDER_TIMEOUT:
                            key = "transfer_placeholder";
                            break;
                    }
                    break;
                case LibWrap.Transfer.status_OFFER_FROM_OTHER_INSTANCE:
                    key = "transfer_offer_from_other_instance";
                    break;
                case LibWrap.Transfer.status_PLACEHOLDER:
                    key = "transfer_placeholder";
                    break;
                case LibWrap.Transfer.status_CONNECTING:
                case LibWrap.Transfer.status_WAITING_FOR_ACCEPT:
                case Skype.Model.TransferBase.LocalStatus.Preparing:
                    key = "transfer_waiting";
                    break;
                case Skype.Model.TransferBase.LocalStatus.Finishing:
                    key = "transfer_finishing";
                    break;
                case Skype.Model.TransferBase.LocalStatus.FinishingFailed:
                    key = "transfer_finishing_failed";
                    break;
                case Skype.Model.TransferBase.LocalStatus.PreparingFailed:
                    key = "transfer_preparing_failed";
                    break;
            }
            if (key) {
                return WinJS.Resources.getString(key).value;
            } else {
                return "";
            }
        }
    }), Skype.Class.disposableMixin);

    var incomingTransfer = MvvmJS.Class.derive(transferBase, function (transferId, libMessageId) {
        this.base(transferId, libMessageId);
    }, {
        _getReceiveFileLocation: function () {
            return Skype.FileTransferManager.TMP_STORAGE_ROOT_DIR + "\\" + Skype.FileTransferManager.RECEIVE_ROOT_DIR + "\\" + this.objectId;
        },

        _acceptToTempStorage: function () {
            var fileName = this.fileName;
            var transferId = this.objectId;
            var tempFileLocation = this._getReceiveFileLocation() + "\\" + fileName;
            var tempFile = new LibWrap.Filename(tempFileLocation);
            var that = this;
            Windows.Storage.StorageFolder.getFolderFromPathAsync(Skype.FileTransferManager.TMP_STORAGE_ROOT_DIR).then(function (dbFolder) {
                return dbFolder.createFolderAsync(Skype.FileTransferManager.RECEIVE_ROOT_DIR, Windows.Storage.CreationCollisionOption.openIfExists);
            }).then(function (rootFolder) {
                return rootFolder.createFolderAsync(transferId, Windows.Storage.CreationCollisionOption.openIfExists);
            }).done(function () {
                if (that._libTransfer.accept(tempFile)) {
                    var statParam = "files={0}&msgId={1}".format(1, that._libMessageId);
                    Skype.Statistics.sendStats(Skype.Statistics.event.fileTransfer_receive, statParam);
                } else {
                    log("TransferWrapper: transfer.accept() failed");
                }
            }, function () {
                log("TransferWrapper: acceptToTempStorage failed");
                that.localStatus = Skype.Model.TransferBase.LocalStatus.PreparingFailed;
            });
        },

        _removeTempStorage: function () {
            Skype.Utilities.cleanUpFolder(this._getReceiveFileLocation()).done(function () {
                log("TransferWrapper: temp storage for file receiving was cleaned up");
            }, function (error) {
                log("TransferWrapper: unable to delete file from temp file receiving storage: code {0}, message {1}".format(error.number, error.message));
            });
        },

        tryMovingToDestinationLocation: function () {
            if (this._libStatus !== LibWrap.Transfer.status_COMPLETED) {
                return;
            }

            if (this.localStatus !== Skype.Model.TransferBase.LocalStatus.NotApplicable) {
                return;
            }

            var fileName = this.fileName;
            var _tempFile;
            this.localStatus = Skype.Model.TransferBase.LocalStatus.Finishing;
            var that = this;
            var tempFolder;
            var targetFile;
            Windows.Storage.StorageFolder.getFolderFromPathAsync(this._getReceiveFileLocation()).then(function (receiveTempFolder) {
                tempFolder = receiveTempFolder;
                return receiveTempFolder.getFileAsync(fileName);
            }).then(function (tempFile) {
                _tempFile = tempFile;
                return Windows.Storage.DownloadsFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.generateUniqueName);
            }).then(function (outputFile) {
                targetFile = outputFile;
                return _tempFile.moveAndReplaceAsync(outputFile);
            }).then(function () {
                return tempFolder.deleteAsync();
            }).then(function () {
                return Skype.AccessTokenManager.instance.addAsync(targetFile);
            }).done(function (accessToken) {
                that.localStatus = Skype.Model.TransferBase.LocalStatus.ReceivingFinished;
                that.targetFileName = accessToken;
            }, function () {
                log("TransferWrapper: tryMovingToDestinationLocation failed");
                if (tempFolder) {
                    tempFolder.deleteAsync().done(function () {
                        log("TransferWrapper: tempFolder deleted");
                    }, function () {
                        log("TransferWrapper: tempFolder delete failed");
                    });
                }
                that.localStatus = Skype.Model.TransferBase.LocalStatus.FinishingFailed;
            });
        },

        accept: function () {
            this._acceptToTempStorage();
        },

        type: {
            get: function () {
                return LibWrap.Transfer.type_INCOMING;
            }
        },
    });

    var outgoingTransfer = MvvmJS.Class.derive(transferBase, function (transferId, libMessageId) {
        this.base(transferId, libMessageId);
    }, {
        type: {
            get: function () {
                return LibWrap.Transfer.type_OUTGOING;
            }
        }
    });

    var legacyOutgoingTransfer = MvvmJS.Class.derive(outgoingTransfer, function (transferId, libMessageId) {
        this.base(transferId, libMessageId);
    }, {
        typeEx: {
            get: function () {
                return Skype.FileTransfer.TransferType.OutgoingLegacy;
            }
        }
    });

    var nextGenOutgoingTransfer = MvvmJS.Class.derive(outgoingTransfer, function (conrollerId, libMessageId) {
        this.base(null, libMessageId);
        this._transferController = lib.getTransfer(conrollerId);
        if (this._transferController) {
            this.regEventListener(this._transferController, "propertychange", this._onControllerPropertyChange.bind(this));
            this._updateControllerStatus();
        }
        this._bytesTransferredHandler = null;
        this._transferAddedHandler = null;
        this._libTransfers = [];
        this._updateLibStatus();
        this._updateStatusEx();
    }, {
        addTransfer: function (transferId) {
            var transfer = lib.getTransfer(transferId);
            if (transfer) {
                this._libTransfers.push(transfer);
                this.regEventListener(transfer, "propertychange", this._onPropertyChange.bind(this));
                this._updateStatus();
                if (this._transferAddedHandler) {
                    this._transferAddedHandler();
                }
            }
        },

        _onPropertyChange: function (prop) {
            if (prop.detail[0] === LibWrap.PROPKEY.transfer_STATUS) {
                this._updateStatus();
            } else if ((prop.detail[0] === LibWrap.PROPKEY.transfer_BYTESTRANSFERRED) && (this._bytesTransferredHandler)) {
                this._updateBytesTransferred();
            }
        },

        _updateBytesTransferred: function () {
            this._bytesTransferredHandler();
        },

        _updateControllerStatus: function () {
            
            if (this._transferController) {
                var controllerStatus = this._transferController.getIntProperty(LibWrap.PROPKEY.transfer_STATUS);
                if (Skype.Model.TransferBase.TerminalStates.contains(controllerStatus)) {
                    Skype.SendingTempStorage.instance.removeTempStorage(this.filePath);
                }
            }
        },

        _onControllerPropertyChange: function (prop) {
            if (prop.detail[0] === LibWrap.PROPKEY.transfer_STATUS) {
                this._updateStatus();
                this._updateControllerStatus();
            }
        },

        _updateLibStatus: function () {
            var newLibStatus = this._getAggregatedStatus();
            if (this._libStatus !== newLibStatus) {
                this._libStatus = newLibStatus;
            }
        },

        _updateStatusEx: function () {
            if ((this.localStatus === Skype.Model.TransferBase.LocalStatus.NotApplicable) || (this.localStatus === Skype.Model.TransferBase.LocalStatus.ReceivingFinished)) {
                this.statusEx = this._libStatus;
            } else {
                this.statusEx = this.localStatus;
            }
        },

        _updateStatus: function () {
            this._updateLibStatus();
            this._updateStatusEx();
        },

        _getAggregatedStatus: function () {
            if ((this._transferController) &&
                (this._transferController.getIntProperty(LibWrap.PROPKEY.transfer_STATUS) === LibWrap.Transfer.status_WAITING_FOR_ACCEPT) &&
                (this._libTransfers.length === 0)) {
                return LibWrap.Transfer.status_WAITING_FOR_ACCEPT;
            }

            if ((this._transferController) && (this._transferController.getIntProperty(LibWrap.PROPKEY.transfer_STATUS) === LibWrap.Transfer.status_CANCELLED)) {
                return LibWrap.Transfer.status_CANCELLED;
            }

            var i, transferringCnt = 0, completedCnt = 0, failedCnt = 0, cancelledByRemoteCnt = 0, connectingCnt = 0, remotelyPausedCnt = 0;
            for (i = 0; i < this._libTransfers.length; i++) {
                switch (this._libTransfers[i].getIntProperty(LibWrap.PROPKEY.transfer_STATUS)) {
                    case LibWrap.Transfer.status_TRANSFERRING:
                    case LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY:
                        transferringCnt++;
                        break;
                    case LibWrap.Transfer.status_COMPLETED:
                        completedCnt++;
                        break;
                    case LibWrap.Transfer.status_CONNECTING:
                        connectingCnt++;
                        break;
                    case LibWrap.Transfer.status_FAILED:
                        failedCnt++;
                        break;
                    case LibWrap.Transfer.status_CANCELLED_BY_REMOTE:
                        cancelledByRemoteCnt++;
                        break;
                    case LibWrap.Transfer.status_REMOTELY_PAUSED:
                        remotelyPausedCnt++;
                        break;
                }
            }

            if (transferringCnt > 0) {
                return LibWrap.Transfer.status_TRANSFERRING;
            } else if (completedCnt > 0) {
                return LibWrap.Transfer.status_COMPLETED;
            } else if (failedCnt > 0) {
                return LibWrap.Transfer.status_FAILED;
            } else if (cancelledByRemoteCnt > 0) {
                return LibWrap.Transfer.status_CANCELLED_BY_REMOTE;
            } else if (connectingCnt > 0) {
                return LibWrap.Transfer.status_CONNECTING;
            } else if (remotelyPausedCnt > 0) {
                return LibWrap.Transfer.status_REMOTELY_PAUSED;
            }

            return null;
        },

        objectId: {
            get: function () {
                return this._transferController.getObjectID();
            }
        },

        filePath: { 
            get: function () {
                return this._transferController.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
            }
        },

        subscribeBytesTransfered: function (handler) {
            this._bytesTransferredHandler = handler;
        },

        subscribeTransferAdded: function (handler) {
            this._transferAddedHandler = handler;
        },

        fileSize: {
            get: function () {
                return parseInt(this._transferController.getStrProperty(LibWrap.PROPKEY.transfer_FILESIZE));
            }
        },

        fileName: {
            get: function () {
                return this._transferController.getStrProperty(LibWrap.PROPKEY.transfer_FILENAME);
            }
        },

        bytesTransfered: {
            get: function () {
                var bytes, status;
                for (var i = 0; i < this._libTransfers.length; i++) {
                    status = this._libTransfers[i].getIntProperty(LibWrap.PROPKEY.transfer_STATUS);
                    if ((status === LibWrap.Transfer.status_TRANSFERRING) ||
                        (status === LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY)) {
                        bytes = this._libTransfers[i].getStrProperty(LibWrap.PROPKEY.transfer_BYTESTRANSFERRED);
                        break;
                    }
                }

                if (bytes) {
                    return parseInt(bytes);
                } else {
                    return 0;
                }
            }
        },

        bytesPerSecond: {
            get: function () {
                var bps, status;
                for (var i = 0; i < this._libTransfers.length; i++) {
                    status = this._libTransfers[i].getIntProperty(LibWrap.PROPKEY.transfer_STATUS);
                    if ((status === LibWrap.Transfer.status_TRANSFERRING) ||
                        (status === LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY)) {
                        bps = this._libTransfers[i].getIntProperty(LibWrap.PROPKEY.transfer_BYTESPERSECOND);
                        break;
                    }
                }

                if (bps) {
                    return bps;
                } else {
                    return 0;
                }
            }
        },

        targetFileName: {
            get: function () {
                return this._transferController.getStrProperty(LibWrap.EXTPROPKEY.ft_LOCALFILENAME);
            },
            set: function (fileName) {
                if (this._transferController) {
                    this._transferController.setExtendedStrProperty(LibWrap.EXTPROPKEY.ft_LOCALFILENAME, fileName);
                }
            }
        },

        _participantCount: {
            get: function () {
                var result = 0;
                var libMessage = lib.getConversationMessage(this.libMessageId);
                if (libMessage) {
                    result = libMessage.getIntProperty(LibWrap.PROPKEY.message_PARTICIPANT_COUNT);
                    libMessage.discard();
                } else {
                    log("get participantCount failed");
                }
                return result;
            }
        },

        cancel: function () {
            if (this._transferController) {
                if (!this._transferController.cancel()) {
                    log("transferOutgoing: cancelling transferController failed");
                }
            }

            
            for (var i = 0; i < this._libTransfers.length; i++) {
                if (!this._libTransfers[i].cancel()) {
                    log("transferOutgoing: cancelling associated transfer failed");
                }
            }
        },

        typeEx: {
            get: function () {
                return Skype.FileTransfer.TransferType.OutgoingNextGen;
            }
        }
    });

   
    var nextGenOutgoingGroupTransfer = MvvmJS.Class.derive(nextGenOutgoingTransfer, function (conrollerId, libMessageId) {
        this.base(conrollerId, libMessageId);
    }, {
        _updateLibStatus: function () {
            nextGenOutgoingGroupTransfer.base._updateLibStatus.call(this);
            this._updateGroupStatus();
        },

        _updateGroupStatus: function () {
            var completedCnt = 0,
                cancelledCnt = 0,
                transferringCnt = 0,
                partStates = {},
                i,
                status;
            for (i = 0; i < this._libTransfers.length; i++) {
                status = this._libTransfers[i].getIntProperty(LibWrap.PROPKEY.transfer_STATUS);
                if (status === LibWrap.Transfer.status_COMPLETED) {
                    completedCnt++;
                } else if (status === LibWrap.Transfer.status_CANCELLED) {
                    cancelledCnt++;
                } else if ((status === LibWrap.Transfer.status_TRANSFERRING) || (status === LibWrap.Transfer.status_TRANSFERRING_OVER_RELAY)) {
                    transferringCnt++;
                }
                
                var participantName = this._libTransfers[i].getStrProperty(LibWrap.PROPKEY.transfer_PARTNER_HANDLE);
                if (!partStates[participantName]) {
                    partStates[participantName] = [];
                }
                partStates[participantName].push(status);
            }

            var uniqueCompletedCnt = 0;
            for (participantName in partStates) {
                for (i = 0; i < partStates[participantName].length; i++) {
                    if (partStates[participantName][i] === LibWrap.Transfer.status_COMPLETED) {
                        
                        uniqueCompletedCnt++;
                        break;
                    }
                }
            }

            var waitingCnt = this._participantCount - uniqueCompletedCnt - 1; 

            this.groupStatus = {
                expired:  this._libStatus === LibWrap.Transfer.status_CANCELLED,
                completedCnt: uniqueCompletedCnt,
                waitingCnt: waitingCnt,
                cancelledCnt: cancelledCnt,
                transferringCnt: transferringCnt
            };
        }
    }, {
        groupStatus: null
    });

    WinJS.Namespace.define("Skype.Model", {
        TransferBase:  transferBase,
        IncomingTransfer: incomingTransfer,
        LegacyOutgoingTransfer: legacyOutgoingTransfer,
        NextGenOutgoingTransfer: nextGenOutgoingTransfer,
        NextGenOutgoingGroupTransfer: nextGenOutgoingGroupTransfer
    });
}());