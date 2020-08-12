

(function () {
    "use strict";

    var ARIA_NOTIFICATION_THROTTLE_IN_MS = 10e3; 

    var fileTransferMessageVM = MvvmJS.Class.define(function (container, ariaMessageUpdater) {
        this._transfersContainer = container;
        this._fileTransfers = [];
        this._ariaMessageUpdater = ariaMessageUpdater;
        this._onTransferStateChanged = this._onTransferStateChanged.bind(this);
        this._sendTransferStateUpdate = this._sendTransferStateUpdate.bind(this);
    }, {
        _fileTransfers: null, 
        _transfersContainer: null,
        _ariaMessageUpdater: null,
        _libMessageId: null,

        _clean: function () {
            this._transfersContainer.innerHTML = "";
            this._fileTransfers.clear();
        },

        _renderTransfers: function () {
            var promises = [];

            
            this._fileTransfers.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            for (var i = 0; i < this._fileTransfers.length ; i++) {
                promises.push(this._fileTransfers[i].transfer.render(this._transfersContainer));
            }
            return WinJS.Promise.join(promises);
        },

        _addMultiUserTransfers: function (libMessageId, transfersIds) {
            var transMap = {}, transferPaths = [], transferId, transfer, filePath, item, name;
            for (var i = 0; i < transfersIds.getCount() ; i++) {
                transferId = transfersIds.get(i);
                transfer = lib.getTransfer(transferId);
                filePath = transfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
                if (!transMap[filePath]) {
                    name = transfer.getStrProperty(LibWrap.PROPKEY.transfer_FILENAME);
                    transMap[filePath] = { name: name, transferIds: [] };
                    transferPaths.push(filePath);
                }
                transfer.discard();
                transMap[filePath].transferIds.push(transferId);
            }
            for (i = 0; i < transferPaths.length ; i++) {
                item = transMap[transferPaths[i]];
                this._fileTransfers.push({ name: item.name, transfer: new Skype.UI.FileTransferGroup(this._transfersContainer, libMessageId, item.transferIds, null) });
            }
        },

        _sendTransferStateUpdate: function () {
            this._ariaMessageUpdater.updateMessageAria(this._libMessageId);
        },

        _onTransferStateChanged: function (event) {
            var force = event && event.detail && event.detail.force;
            if (force) {
                this._sendTransferStateUpdate();
                return;
            }
            this.throttle(ARIA_NOTIFICATION_THROTTLE_IN_MS, this._sendTransferStateUpdate);
        },

        _registerTransferChangeListeners: function (allTransferRenderedPromise) {
            allTransferRenderedPromise.then(function () {
                this._fileTransfers.forEach(function (item) {
                    this.regEventListener(item.transfer, Skype.UI.FileTransfer.Events.TransferStateChanged, this._onTransferStateChanged);
                }.bind(this));
            }.bind(this));
        },

        
        addTransfers: function (libMessageId) {
            this._clean();
            this._libMessageId = libMessageId;
           
            var libMessage = lib.getConversationMessage(libMessageId);
            if (!libMessage) {
                return;
            }

            var transfersEx = Skype.FileTransfer.getTransfersEx(libMessage);
            if (!transfersEx) {
                return;
            }

            var libTransfer,
                transferId,
                name,
                length,
                i,
                isGroupTransfer = Skype.FileTransfer.isGroupTransfer(libMessage),
                FileTransfer = isGroupTransfer ? Skype.UI.FileTransferGroup : Skype.UI.FileTransfer;

            if (transfersEx.type === Skype.FileTransfer.TransferType.OutgoingNextGen) {
                length = transfersEx.controllers.length;
                this.isMultifileTransfer = length > 1;
                for (i = 0; i < length; i++) {
                    transferId = transfersEx.controllers[i].controllerId;
                    libTransfer = lib.getTransfer(transferId);
                    if (libTransfer) {
                        name = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILENAME);
                        this._fileTransfers.push({
                            name: name,
                            transfer: new FileTransfer(this._transfersContainer, {
                                libMessageId: libMessageId,
                                fileTransferId: transferId
                            })
                        });
                        libTransfer.discard();
                    }
                }
            } else {                                
                var transfersIds = new LibWrap.VectUnsignedInt();
                if (libMessage.getTransfers(transfersIds)) {
                    var fileCount = Skype.FileTransfer.getFileTransferCount(libMessage);

                    this.isMultiuserTransfer = Skype.FileTransfer.isMultiUserTransfer(libMessage);
                    this.isOneHalfLayout = (fileCount === 2 || fileTransferMessageVM.calculateNumberOfColumns(fileCount) === 2);
                    this.isMultifileTransfer = fileCount > 1;

                    if (this.isMultiuserTransfer) {
                        this._addMultiUserTransfers(libMessageId, transfersIds);
                    } else {
                        length = transfersIds.getCount(); 
                        for (i = 0; i < length ; i++) {
                            transferId = transfersIds.get(i);
                            libTransfer = lib.getTransfer(transferId);
                            name = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILENAME);
                            this._fileTransfers.push({
                                name: name,
                                transfer: new Skype.UI.FileTransfer(this._transfersContainer, {
                                    libMessageId: libMessageId,
                                    fileTransferId: transferId
                                })
                            });
                            libTransfer.discard();
                        }
                    }
                }
            }

            var allTransferRenderedPromise = this._renderTransfers();
            if (Skype.Application.state.view.isTouchSupported) {
                this._registerTransferChangeListeners(allTransferRenderedPromise);
                
                this._ariaMessageUpdater.updateMessageAria(this._libMessageId);
            }
            libMessage.discard();
            return allTransferRenderedPromise;
        },

        
        
        
        
        
        
        addPlaceholderFiles: function (files) {
            this.isMultifileTransfer = files && files.size > 1;
            for (var i = 0; i < files.size; i++) {
                this._fileTransfers.push({
                    name: files[i].name,
                    transfer: new Skype.UI.FileTransfer(this._transfersContainer, {storageFile: files[i]})
                });
            }
            this._renderTransfers();
        },

        
        
        
        onPreparingSendFileFailed: function (errorCode) {
            for (var i = 0; i < this._fileTransfers.length ; i++) {
                this._fileTransfers[i].transfer.onPreparingSendFileFailed(errorCode);
            }
        },

        getMessageAria: function () {
            var messageAria = "", separator;

            for (var i = 0; i < this._fileTransfers.length ; i++) {
                separator = i === 0 ? " " : " . ";
                messageAria += separator + this._fileTransfers[i].transfer.getTransferAria();
            }

            return messageAria;
        }

    }, { 
        
        isOneHalfLayout: false,
        isMultifileTransfer: false,
        isMultiuserTransfer: false,
    }, {
        TRANSFER_ITEM_MINWIDTH: 320, 

        calculateMessageHeight: function (objectId, files) {
            var libMessage = objectId ? lib.getConversationMessage(objectId) : null;
            var count = 0;

            if (libMessage) {
                count = Skype.FileTransfer.getFileTransferCount(libMessage);
                libMessage.discard();
            } else if (files) {
                count = files.length;
            }

            var cols = fileTransferMessageVM.calculateNumberOfColumns(count);

            return Skype.ViewModel.FileTransferBaseVM.TRANSFER_ITEM_HEIGHT * Math.ceil(count / cols);
        },

        calculateNumberOfColumns: function (count) {
            var availableWidth = document.getElementById("atConversationTextArea").offsetWidth, 
                minCols = 1,
                maxCols = Math.floor(availableWidth / fileTransferMessageVM.TRANSFER_ITEM_MINWIDTH),
                cols,
                isFullScreen = Skype.Application.state.view.size.width === screen.width,
                isHorizontal = !Skype.Application.state.view.isVertical;

            if (count > 1) {
                
                if (isHorizontal && isFullScreen) {
                    
                    maxCols = maxCols == 0 ? 2 : maxCols;
                    maxCols = Math.min(2, maxCols); 
                    cols = Math.max(minCols, maxCols);
                } else {
                    cols = 1;
                }
            } else {
                
                cols = 1;
            }
            return cols;
        }
    });

    WinJS.Namespace.define("Skype.ViewModel", {
        FileTransferMessageVM: WinJS.Class.mix(fileTransferMessageVM, Skype.Class.disposableMixin)
    });

}());