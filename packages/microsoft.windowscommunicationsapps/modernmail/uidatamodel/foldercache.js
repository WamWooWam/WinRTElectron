
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, self, Microsoft, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.UIDataModel, "FolderCache", function () {
    "use strict";

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var UIDataModel = self.Mail.UIDataModel,
        Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    // This is a map between account ids and the special folders for that account
    var specialFoldersMap = {};

    // This is a map between accounts ids and the views for that account
    var viewsMap = {};

    UIDataModel.FolderCache = {
        _onFolderChange : function (evt) {
            /// <param name="evt" type="Event" />
            if (Mail.Validators.hasPropertyChanged(evt, "specialMailFolderType")) {
                var folder = /*@static_cast(Microsoft.WindowsLive.Platform.Folder)*/evt.target;
                Debug.assert(Jx.isInstanceOf(folder, Plat.Folder));
                UIDataModel.FolderCache._purgeAccount(folder.accountId);
            }
        },
        _onAllFolderCollectionChange: function (evt) {
            /// <param name="evt" type="Microsoft.WindowsLive.Platform.CollectionChangedEventArgs" />
            Mail.writeProfilerMark("FolderCache._onAllFolderCollectionChange", Mail.LogEvent.start);
            Debug.assert(evt);
            Debug.assert(evt.detail);
            Debug.assert(evt.detail.length > 0);
            var eventType = evt.detail[0].eType,
                collectionChangeType = Plat.CollectionChangeType;
            switch (eventType) {
                case collectionChangeType.itemAdded:
                case collectionChangeType.itemRemoved:
                case collectionChangeType.reset:
                case collectionChangeType.itemChanged:
                    for (var accountId in specialFoldersMap) {
                        if (evt.target === specialFoldersMap[accountId].allFolderCollection) {
                            UIDataModel.FolderCache._purgeAccount(accountId);
                        }
                    }
                    break;
                case collectionChangeType.batchBegin:
                case collectionChangeType.batchEnd:
                    break;
                default:
                    Debug.assert(false);
                    break;
            }
            Mail.writeProfilerMark("FolderCache._onAllFolderCollectionChange", Mail.LogEvent.stop);
        },
        _purgeFolder: function (accountId, folderType) {
            ///<param name="accountId" type="String"/>
            ///<param name="folderType" type="Microsoft.WindowsLive.Platform.MailFolderType"/>
            var accountMap = specialFoldersMap[accountId];
            if (accountMap) {
                var folder = /*@static_cast(Microsoft.WindowsLive.Platform.Folder)*/ accountMap[folderType];
                if (folder) {
                    var folderId = folder.objectId;
                    Debug.assert(Jx.isInstanceOf(folder, Plat.Folder));
                    folder.removeEventListener("changed", UIDataModel.FolderCache._onFolderChange);
                    delete accountMap[folderType];
                    UIDataModel.FolderCache.raiseEvent(UIDataModel.FolderCache.Events.folderPurged, folderId);
                }
            }
        },

        _purgeAccount : function (accountId) {
            ///<param name="accountId" type="String"/>
            Debug.assert(Jx.isNonEmptyString(accountId));

            delete viewsMap[accountId];

            var accountMap = specialFoldersMap[accountId];
            // If we've never gotten anything from this account, then we don't need to do anything
            if (Jx.isNullOrUndefined(accountMap)) {
                return;
            }

            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            var allFolders = /*@static_cast(Microsoft.WindowsLive.Platform.Collection)*/ accountMap.allFolderCollection;
            Debug.assert(Jx.isInstanceOf(allFolders, Plat.Collection));
            allFolders.removeEventListener("collectionchanged", UIDataModel.FolderCache._onAllFolderCollectionChange);
            allFolders.dispose();
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            /// <disable>JS2078.DoNotDeleteObjectProperties</disable>
            delete accountMap.allFolderCollection;
            /// <enable>JS2078.DoNotDeleteObjectProperties</enable>

            for (var folderType in accountMap) {
                UIDataModel.FolderCache._purgeFolder(accountId, folderType);
            }
            delete specialFoldersMap[accountId];

            UIDataModel.FolderCache.raiseEvent(UIDataModel.FolderCache.Events.accountPurged, accountId);
        },
        dispose : function () {
            for (var accountId in specialFoldersMap) {
                UIDataModel.FolderCache._purgeAccount(accountId);
            }
            Debug.assert(Object.keys(specialFoldersMap).length === 0);
        },
        _initAccount : function (account) {
            ///<param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
            Debug.assert(Jx.isInstanceOf(account, Plat.Account));
            Mail.writeProfilerMark("FolderCache._initAccount", Mail.LogEvent.start);
            var accountId = account.objectId;
            Debug.assert(Jx.isNonEmptyString(accountId));
            if (Jx.isNullOrUndefined(specialFoldersMap[accountId])) {
                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform;
                var allFolders = platform.folderManager.getAllFoldersCollection(Plat.FolderType.mail, account);
                Debug.assert(Jx.isInstanceOf(allFolders, Plat.Collection));
                allFolders.addEventListener("collectionchanged", UIDataModel.FolderCache._onAllFolderCollectionChange);
                allFolders.unlock();
                specialFoldersMap[accountId] = {
                    allFolderCollection: allFolders
                };
                viewsMap[accountId] = {};
            }
            Mail.writeProfilerMark("FolderCache._initAccount", Mail.LogEvent.stop);
        },
        getPlatformFolder : function (account, folderType) {
            ///<param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
            ///<param name="folderType" type="Microsoft.WindowsLive.Platform.MailFolderType"/>
            Debug.assert(Jx.isInstanceOf(account, Plat.Account));
            Debug.assert(Jx.isNumber(folderType));
            Debug.Mail.writeProfilerMark("FolderCache.getPlatformFolder", Mail.LogEvent.start);
            UIDataModel.FolderCache._initAccount(account);
            var accountId = account.objectId;
            Debug.assert(specialFoldersMap[accountId]);

            var folder = specialFoldersMap[accountId][folderType];
            if (Jx.isNullOrUndefined(folder)) {
                Mail.writeProfilerMark("FolderCache.getPlatformFolder - work", Mail.LogEvent.start);
                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform;
                Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
                folder = /*@static_cast(Microsoft.WindowsLive.Platform.IFolder)*/ platform.folderManager.getSpecialMailFolder(account, folderType);
                if (!Jx.isNullOrUndefined(folder)) {
                    Debug.assert(Jx.isInstanceOf(folder, Plat.Folder));
                    folder.addEventListener("changed", UIDataModel.FolderCache._onFolderChange);
                    specialFoldersMap[accountId][folderType] = folder;
                }
                Mail.writeProfilerMark("FolderCache.getPlatformFolder - work", Mail.LogEvent.stop);
            }
            // The junk folder doesn't always exist
            Debug.assert((folderType === Plat.MailFolderType.junkMail) || Jx.isInstanceOf(folder, Plat.Folder));
            Debug.Mail.writeProfilerMark("FolderCache.getPlatformFolder", Mail.LogEvent.stop);
            return folder;
        },
        getPlatformView : function (account, viewType) {
            ///<param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
            ///<param name="viewType" type="Microsoft.WindowsLive.Platform.MailViewType"/>
            Debug.assert(Jx.isInstanceOf(account, Plat.Account));
            Debug.assert(Jx.isNumber(viewType));
            Debug.Mail.writeProfilerMark("FolderCache.getPlatformView", Mail.LogEvent.start);
            UIDataModel.FolderCache._initAccount(account);
            var accountId = account.objectId;
            Debug.assert(viewsMap[accountId]);

            var view = viewsMap[accountId][viewType];
            if (Jx.isNullOrUndefined(view)) {
                Mail.writeProfilerMark("FolderCache.getPlatformFolder - work", Mail.LogEvent.start);
                var platform = /*@static_cast(Microsoft.WindowsLive.Platform.Client)*/Mail.Globals.platform;
                Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
                view = /*@static_cast(Microsoft.WindowsLive.Platform.MailView)*/ platform.mailManager.getMailView(viewType, account);
                Debug.assert(Jx.isInstanceOf(view, Plat.MailView));
                viewsMap[accountId][viewType] = view;
                Mail.writeProfilerMark("FolderCache.getPlatformFolder - work", Mail.LogEvent.stop);
            }
            Debug.Mail.writeProfilerMark("FolderCache.getPlatformView", Mail.LogEvent.stop);
            return view;
        },
        getFolder : function (account, folderType) {
            ///<param name="account" type="Microsoft.WindowsLive.Platform.IAccount"/>
            ///<param name="folderType" type="Microsoft.WindowsLive.Platform.MailFolderType"/>
            Debug.assert(Jx.isInstanceOf(account, Plat.Account));
            Debug.assert(Jx.isNumber(folderType));
            var platformMailFolder = UIDataModel.FolderCache.getPlatformFolder(account, folderType),
                mailFolder = null;
            if (platformMailFolder) {
                mailFolder = new UIDataModel.MailFolder(platformMailFolder);
            }
            // The junk folder doesn't always exist
            Debug.assert((folderType === Plat.MailFolderType.junkMail) || Jx.isInstanceOf(mailFolder, UIDataModel.MailFolder));
            return mailFolder;
        },
        Events: {
            accountPurged: "accountPurged",
            folderPurged: "folderPurged"
        }
    };
    Jx.mix(UIDataModel.FolderCache, Jx.Events);
    Debug.Events.define.apply(Debug.Events, [UIDataModel.FolderCache].concat(Object.keys(UIDataModel.FolderCache.Events)));

});
