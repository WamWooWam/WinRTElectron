

(function () {
    "use strict";
    
    var fileTransferManager = WinJS.Class.define(function () {
    }, {
        _transfers: null,

        init: function () {
            lib.addEventListener("incomingmessage", this._handleIncominMessage.bind(this));
            lib.addEventListener("filetransferinitiated", this._handleFileTransferInitiated.bind(this));
            Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_READONLY, this._onLogin.bind(this));
        },

        _onLogin: function () {
            Skype.FileTransferManager.TMP_STORAGE_ROOT_DIR = lib.account.getDBPath();
            this._transfers = [];
            this._getTransfers();
        },

        _handleFileTransferInitiated: function (event) {
            var messageObjectID = event.detail[1];
            var transferObjectID = event.detail[2];
            
            this._addNextGenTransfer(transferObjectID, messageObjectID);
        },

        _getTransfers: function () {
            log("FileTransferManager: _getTransfers started");
            
            var nowTimestampInSec = (Date.now().valueOf()) / 1000;
            var msgIds = new LibWrap.VectUnsignedInt();
            lib.getMessageListByType(LibWrap.Message.type_POSTED_FILES, false, msgIds, 0, nowTimestampInSec);

            
            var msgCount = msgIds.getCount();
            for (var i = 0; i < msgCount; i++) {
                var libMessage = lib.getConversationMessage(msgIds.get(i));
                if (libMessage) {
                    var libMessageId = libMessage.getObjectID();
                    this.addTransfers(libMessageId, false);
                    libMessage.discard();
                }
            }
            log("FileTransferManager: _getTransfers finished");
        },

        _addNextGenTransfer: function(transferId, libMessageId) {
            var libTransfer = lib.getTransfer(transferId);
            if (!libTransfer) {
                throw "no transfer found for the given id";
            }

            try {
                var filePath = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
                for (var i = 0; i < this._transfers.length; i++) {
                    if ((this._transfers[i].libMessageId === libMessageId) && (this._transfers[i].filePath === filePath)) {
                        this._transfers[i].addTransfer(transferId);
                        return;
                    }
                }
            } finally {
                libTransfer.discard();
            }

            throw "transfer couldn't be added - controller missing?";
        },

        addTransfers: function (libMessageId, checkForDuplicates) {
            var i;
            if (checkForDuplicates) {
                for (i = 0; i < this._transfers.length; i++) {
                    if (this._transfers[i].libMessageId === libMessageId) {
                        return;
                    }
                }
            }

            var libMessage = lib.getConversationMessage(libMessageId);
            if (!libMessage) {
                log("addTransfers: unable to get conversation message");
                return;
            }
            
            var transfersEx = Skype.FileTransfer.getTransfersEx(libMessage);
            var isNextGenOutgoingGroup = transfersEx && transfersEx.type === Skype.FileTransfer.TransferType.OutgoingNextGen && Skype.FileTransfer.isGroupTransfer(libMessage);
            libMessage.discard();
            if (!transfersEx) {
                log("addTransfers: unable to analyze file transfer message");
                return;
            }

            var j, controller;
            switch (transfersEx.type) {
                case Skype.FileTransfer.TransferType.Incoming:
                    for (i = 0; i < transfersEx.controllers.length ; i++) {
                        controller = new Skype.Model.IncomingTransfer(transfersEx.controllers[i].controllerId, libMessageId);
                        this._transfers.push(controller);
                    }
                    break;
                case Skype.FileTransfer.TransferType.OutgoingLegacy:
                    for (i = 0; i < transfersEx.controllers.length ; i++) {
                        controller = new Skype.Model.LegacyOutgoingTransfer(transfersEx.controllers[i].controllerId, libMessageId);
                        this._transfers.push(controller);
                    }
                    break;
                case Skype.FileTransfer.TransferType.OutgoingNextGen:
                    var CtorRef = isNextGenOutgoingGroup ? Skype.Model.NextGenOutgoingGroupTransfer : Skype.Model.NextGenOutgoingTransfer;
                    for (i = 0; i < transfersEx.controllers.length ; i++) {
                        controller = new CtorRef(transfersEx.controllers[i].controllerId, libMessageId);
                        for (j = 0; j < transfersEx.controllers[i].transfers.length ; j++) {
                            controller.addTransfer(transfersEx.controllers[i].transfers[j]);
                        }
                        this._transfers.push(controller);
                    }
                    break;
            }
        },

        getTransfer: function (transferId) {
            return this._transfers.first(function(item) {
                return item.objectId === transferId;
            });
        },

        _handleIncominMessage: function (event) {
            var libMessage = lib.getConversationMessage(event.detail[0]);
            if (libMessage) {
                if (libMessage.getIntProperty(LibWrap.PROPKEY.message_TYPE) === LibWrap.Message.type_POSTED_FILES) {
                    var libMessageId = libMessage.getObjectID();
                    this.addTransfers(libMessageId, true);
                }
                libMessage.discard();
            }
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.FileTransferManager();
                }
                return instance;
            }
        },

        RECEIVE_ROOT_DIR: "ReceiveStorage",
        TMP_STORAGE_ROOT_DIR: null,
    });

    var instance;
    
    WinJS.Namespace.define("Skype", {
        FileTransferManager: fileTransferManager
    });

    window.traceClassMethods && window.traceClassMethods(fileTransferManager, "FileTransferManager", ["_onLogin", "_handleFileTransferInitiated", "_handleIncominMessage"]);
}());