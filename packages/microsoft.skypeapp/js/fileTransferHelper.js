

(function () {
    "use strict";

    var transferType = {
        Incoming: "incoming",
        OutgoingLegacy: "outgoingLegacy",
        OutgoingNextGen: "outgoingNextGen",
        Unrecognized: "unrecognized"
    };

    function getTransferType(libMessage) {
        var transfersIds = new LibWrap.VectUnsignedInt();
        if (!libMessage.getTransfers(transfersIds)) {
            return Skype.FileTransfer.TransferType.Unrecognized;
        }

        var transfersCount = transfersIds.getCount();
        if (transfersCount === 0) {
            return Skype.FileTransfer.TransferType.Unrecognized;
        }

        var transfer = lib.getTransfer(transfersIds.get(0));
        if (!transfer) {
            return Skype.FileTransfer.TransferType.Unrecognized;
        }

        var transferLibType = transfer.getIntProperty(LibWrap.PROPKEY.transfer_TYPE);
        if (transferLibType === LibWrap.Transfer.type_INCOMING) {
            return Skype.FileTransfer.TransferType.Incoming;
        } else {
            
            var hasTransferToMyself = false;
            for (var i = 0; i < transfersCount; i++) {
                var libTransfer = lib.getTransfer(transfersIds.get(i));
                if (libTransfer) {
                    var participantName = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_PARTNER_HANDLE);
                    if (participantName === lib.myIdentity) {
                        hasTransferToMyself = true;
                    }
                    libTransfer.discard();
                    if (hasTransferToMyself) {
                        break;
                    }
                }
            }
            if (hasTransferToMyself) {
                return Skype.FileTransfer.TransferType.OutgoingNextGen;
            } else {
                return Skype.FileTransfer.TransferType.OutgoingLegacy;
            }
        }
    }

    function getFileTransferCount(libMessage) {
        var transferType = getTransferType(libMessage);
        if (transferType === Skype.FileTransfer.TransferType.Unrecognized) {
            return 0;
        }

        var count = 0;
        var transfersIds = new LibWrap.VectUnsignedInt();
        if (!libMessage.getTransfers(transfersIds)) {
            log("Unable to get transfers");
            return 0;
        }

        var transfersCount = transfersIds.getCount();

        switch (transferType) {
            case Skype.FileTransfer.TransferType.Incoming:
            case Skype.FileTransfer.TransferType.OutgoingLegacy:
                var participantCount = isMultiUserTransfer(libMessage) ? getParticipantCountForLegacyTransfer(libMessage) : 1;
                if (participantCount === 0) {
                    throw "Unexpected particiapnt count";
                }
                if ((transfersCount / participantCount) % 1 != 0) {
                    throw "Unexpected count of transfer objects";
                }
                count = transfersCount / participantCount;
                break;
            case Skype.FileTransfer.TransferType.OutgoingNextGen:
                var filePathMap = {};
                for (var i = 0; i < transfersCount; i++) {
                    var libTransfer = lib.getTransfer(transfersIds.get(i));
                    if (libTransfer) {
                        var filePath = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
                        if (!filePathMap[filePath]) {
                            filePathMap[filePath] = true;
                            count++;
                        }
                        libTransfer.discard();
                    }
                }
                break;
        }
        return count;       
    }

    function _isController(transferId) {
        var result = false;
        var libTransfer = lib.getTransfer(transferId);
        if (libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_STATUS) === LibWrap.Transfer.status_WAITING_FOR_ACCEPT) {
            result = true;
        }
        libTransfer.discard();
        return result;
    }

    function _getFilePath(transferId) {
        var filePath;
        var libTransfer = lib.getTransfer(transferId);
        if (libTransfer) {
            filePath = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH);
            libTransfer.discard();
        }
        return filePath;
    }
    
    function getTransfersEx(libMessage) {
        if (!libMessage) {
            return;
        }

        var transfersIds = new LibWrap.VectUnsignedInt();
        if (!libMessage.getTransfers(transfersIds)) {
            log("getTransfersEx: Unable to get transfers");
            return;
        }

        var oneTransferJSON = {};
        var libTransferId;
        var filePath;
        var i;

        var transferType = Skype.FileTransfer.getTransferType(libMessage);
        var msgTransfersJSON = { type: transferType, controllers: [] };
        switch (transferType) {
            case Skype.FileTransfer.TransferType.Incoming:
            case Skype.FileTransfer.TransferType.OutgoingLegacy:
                for (i = 0; i < transfersIds.getCount() ; i++) {
                    msgTransfersJSON.controllers.push({ controllerId: transfersIds.get(i) });
                }
                break;
            case Skype.FileTransfer.TransferType.OutgoingNextGen:
                
                var transferGroups = {};
                for (i = 0; i < transfersIds.getCount() ; i++) {
                    var transferId = transfersIds.get(i);
                    filePath = _getFilePath(transferId);
                    if (!transferGroups[filePath]) {
                        transferGroups[filePath] = [];
                    }
                    transferGroups[filePath].push(transferId);
                }
                
                for (var path in transferGroups) {
                    var actControllerId = null;
                    for (i = 0; i < transferGroups[path].length; i++) {
                        libTransferId = transferGroups[path][i];
                        if (_isController(libTransferId)) {
                            oneTransferJSON = { controllerId: libTransferId, transfers: [] };
                            actControllerId = libTransferId;
                            break;
                        }
                    }
                    
                    for (i = 0; i < transferGroups[path].length; i++) {
                        libTransferId = transferGroups[path][i];
                        if (!_isController(libTransferId)) {
                            if (!actControllerId) {
                                
                                oneTransferJSON = { controllerId: libTransferId, transfers: [] };
                                actControllerId = libTransferId;
                            } else {
                                oneTransferJSON.transfers.push(libTransferId);
                            }
                        }
                    }
                    msgTransfersJSON.controllers.push(oneTransferJSON);
                }
                break;
        }
        return msgTransfersJSON;
    }

    
    
    
    
    
    
    function isGroupTransfer(libMessage) {
        var conv = lib.getConversationByConvoId(libMessage.getIntProperty(LibWrap.PROPKEY.message_CONVO_ID));
        if (!conv) {
            log("isGroupTransfer: Couldn't get conversation");
            return false;
        }
        var isGroup = conv.getIntProperty(LibWrap.PROPKEY.conversation_TYPE) === LibWrap.Conversation.type_CONFERENCE;
        conv.discard();

        return isGroup;
    }

    
    
    
    
    
    
    function isMultiUserTransfer(libMessage) {
        var transfersIds = new LibWrap.VectUnsignedInt();
        libMessage.getTransfers(transfersIds);
        var transfersCount = transfersIds.getCount();

        var sending = false;
        if (transfersCount > 0) {
            var libTransfer = lib.getTransfer(transfersIds.get(0));
            if (libTransfer) {
                sending = (libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_TYPE) === LibWrap.Transfer.type_OUTGOING);
                libTransfer.discard();
            }
        }
        return sending && isGroupTransfer(libMessage);
    }

    function getParticipantCountForLegacyTransfer(libMessage) {
        if (!libMessage) {
            log("getParticipantCountForLegacyTransfer: libMessage is null!");
            return -1;
        }

        var transfersIds = new LibWrap.VectUnsignedInt();
        libMessage.getTransfers(transfersIds);

        var transfersCount = transfersIds.getCount();
        if (transfersCount === 0) {
            log("getParticipantCountForLegacyTransfer: transfersCount = zero !");
            return 0;
        }
        var participantHashMap = {};
        var participantCount = 0;

        for (var i = 0; i < transfersCount; i++) {
            var libTransfer = lib.getTransfer(transfersIds.get(i));
            if (libTransfer) {
                var participantName = libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_PARTNER_HANDLE);
                if (!participantHashMap[participantName]) {
                    participantHashMap[participantName] = true;
                    participantCount++;
                }
                libTransfer.discard();
            }
        }
        return participantCount;
    }

    function assignLocalFileNameFromMap(libMessage, localFileNameMap) {
        if (!libMessage) {
            return;
        }

        var localFileName;
        var transfersIds = new LibWrap.VectUnsignedInt();
        libMessage.getTransfers(transfersIds);
        var transferCount = transfersIds.getCount();
        for (var i = 0; i < transferCount; i++) {
            var libTransfer = lib.getTransfer(transfersIds.get(i));
            if (libTransfer) {
                localFileName = localFileNameMap[Skype.Utilities.extractLastSubfolder(libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH))];
                if (localFileName) {
                    libTransfer.setExtendedStrProperty(LibWrap.EXTPROPKEY.ft_LOCALFILENAME, localFileName);
                }
                libTransfer.discard();
            }
        }
    }

    function allTransfersInTerminalState(libMessageId, filePath) {
        var libMessage = lib.getConversationMessage(libMessageId);
        if (!libMessage) {
            return false;
        }

        var transfersIds = new LibWrap.VectUnsignedInt();
        libMessage.getTransfers(transfersIds);
        libMessage.discard();

        var i, transferCount = transfersIds.getCount(), terminal = true;

        for (i = 0; i < transferCount; i++) {
            var libTransfer = lib.getTransfer(transfersIds.get(i));
            if (libTransfer) {
                if (libTransfer.getStrProperty(LibWrap.PROPKEY.transfer_FILEPATH) === filePath) {
                    terminal = Skype.Model.TransferBase.TerminalStates.contains(libTransfer.getIntProperty(LibWrap.PROPKEY.transfer_STATUS));
                }
                libTransfer.discard();
                if (!terminal) {
                    return false;
                }
            }
        }
        return true;
    }

    WinJS.Namespace.define("Skype.FileTransfer", {
        getFileTransferCount: getFileTransferCount,
        isGroupTransfer: isGroupTransfer,
        isMultiUserTransfer: isMultiUserTransfer,
        assignLocalFileNameFromMap: assignLocalFileNameFromMap,
        allTransfersInTerminalState: allTransfersInTerminalState,
        TransferType: transferType,
        getTransferType: getTransferType,
        getTransfersEx: getTransfersEx
    });

}());