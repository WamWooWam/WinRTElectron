

(function () {
    "use strict";

    var storageRootDir = null;
    var copyFileFailureReason = {
        TempFolderCreationError: "unable to create temp folder",
        FileCopyError: "unable to copy file",
        AccessTokenError: "unable to get access token"
    };

    var sendingTempStorage = WinJS.Class.define(function () {
    },
    {
        
        placeholderMessagesMap: null,

        init: function () {
            Skype.Application.LoginHandlerManager.instance.addEventListener(Skype.Application.LoginHandlerManager.Events.LOGIN_READONLY, this._onLogin.bind(this));
        },

        _onLogin: function () {
            this.placeholderMessagesMap = {},
            storageRootDir = lib.account.getDBPath();
        },

        _copyFile: function (file, convoId, guid, fileIdx) {
            var uniqueTmpPath = convoId + "_" + guid + "_" + fileIdx;
            var _tempFolder;
            var _fileCopy;
            var _accessToken;
            log("SendingTempStorage: Copying file, file = " + file.path + ", path = " + uniqueTmpPath);
            return Windows.Storage.StorageFolder.getFolderFromPathAsync(storageRootDir)
                    .then(function (dbFolder) {
                        return dbFolder.createFolderAsync(Skype.SendingTempStorage.SEND_ROOT_DIR, Windows.Storage.CreationCollisionOption.openIfExists);
                    })
                    .then(function (rootFolder) {
                        return rootFolder.createFolderAsync(uniqueTmpPath, Windows.Storage.CreationCollisionOption.openIfExists);
                    })
                    .then(function (uniqueTempFolder) {
                        _tempFolder = uniqueTempFolder;
                        return file.copyAsync(uniqueTempFolder);
                    })
                    .then(function (fileCopy) {
                        _fileCopy = fileCopy;
                        return Skype.AccessTokenManager.instance.addAsync(file);
                    })
                    .then(function (accessToken) {
                        _accessToken = accessToken;
                        return {
                            tmpPath: _fileCopy.path,
                            srcFileAccessToken: accessToken
                        };
                    })
                    .then(null, function (e) {
                        var failureReason;
                        if (!_tempFolder) {
                            failureReason = copyFileFailureReason.TempFolderCreationError;
                        } else if (!_fileCopy) {
                            failureReason = copyFileFailureReason.FileCopyError;
                        } else if (!_accessToken) {
                            failureReason = copyFileFailureReason.AccessTokenError;
                        }
                        log("SendingTempStorage: _copyFile failed, reason: {0} ({1})".format(failureReason, e));

                        if ((failureReason === copyFileFailureReason.FileCopyError) || (failureReason === copyFileFailureReason.AccessTokenError)) {
                            log("SendingTempStorage: temp folder cleanup");
                            _tempFolder.deleteAsync().done(function () {
                                log("SendingTempStorage: tempFolder deleted");
                            }, function (ex) {
                                log("SendingTempStorage: tempFolder delete failed ({0})".format(ex));
                            });
                        }
                    });
        },

        copyFilesToTempStorage: function (files, convId) {
            var fileTransferGuid = Skype.Utilities.getGuid();
            log("SendingTempStorage: copying file(s) in temp storage, guid = " + fileTransferGuid);
            var promises = [];
            for (var i = 0; i < files.size; i++) {
                promises.push(this._copyFile(files[i], convId, fileTransferGuid, i));
            }
            return WinJS.Promise.join(promises).then(function (filesInfo) {
                var anyFileFailed = false;
                for (var i = 0; i < filesInfo.length; i++) {
                    if (!filesInfo[i]) {
                        anyFileFailed = true;
                        break;
                    }
                }

                if (anyFileFailed) {
                    log("SendingTempStorage: starting copyFilesToTempStorage cleanup");
                    var path;
                    for (var j = 0; j < filesInfo.length; j++) {
                        if (filesInfo[j]) {
                            if (filesInfo[j].srcFileAccessToken) {
                                Windows.Storage.AccessCache.StorageApplicationPermissions.futureAccessList.remove(filesInfo[j].srcFileAccessToken);
                            }
                            path = Skype.Utilities.extractFilePath(filesInfo[j].tmpPath);
                            if (path) {
                                Windows.Storage.StorageFolder.getFolderFromPathAsync(path).then(function (folder) {
                                    return folder.deleteAsync();
                                }).done(function () {
                                    log("SendingTempStorage: copyFilesToTempStorage cleanup - folder {0} removed".format(path));
                                }, function (ex) {
                                    log("SendingTempStorage: copyFilesToTempStorage cleanup - could not remove folder {0} ({1})".format(path, ex));
                                });
                            }
                        }
                    }
                    throw "whole file transfer failed";
                }
                return filesInfo;
            });
        },

        
        
        
        
        
        
        
        
        
        
        onMessageSent: function (messageId, messageGuid) {
            this.placeholderMessagesMap[messageId] = messageGuid;
        },

        
        
        
        
        
        
        
        onMessagePlaceholderRemoved: function (messageId) {
            delete this.placeholderMessagesMap[messageId];
        },

        
        
        
        
        
        
        
        getPlaceholderMessageGuid: function (messageId) {
            return this.placeholderMessagesMap[messageId];
        },

        removeTempStorage: function (fileName) {
            Skype.Utilities.cleanUpFolder(Skype.Utilities.extractFilePath(fileName)).done(function () {
                log("SendingTempStorage: Temp storage for file sending was cleaned up");
            }, function (error) {
                
                log("SendingTempStorage: Unable to delete file from temp file sending storage: code {0}, message {1}".format(error.number, error.message));
            });
        }
    }, {
        instance: {
            get: function () {
                if (!instance) {
                    instance = new Skype.SendingTempStorage();
                }
                return instance;
            }
        },

        SEND_ROOT_DIR: "SendingStorage",
    });

    var instance;

    WinJS.Namespace.define("Skype", { 
        SendingTempStorage: sendingTempStorage
    });
}());