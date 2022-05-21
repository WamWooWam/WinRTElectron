
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail.UIDataModel, "MailFolder", function () {
    "use strict";

    var UIDataModel = Mail.UIDataModel,
        Plat = Microsoft.WindowsLive.Platform,
        MailFolderType = Plat.MailFolderType;

    UIDataModel.MailFolder = function (platformMailFolder) {
        /// <param name="platformMailFolder" type="Plat.IFolder" />
        Debug.assert(Jx.isObject(platformMailFolder));
        Debug.assert(platformMailFolder.folderType === Plat.FolderType.mail);
        this._platformMailFolder = platformMailFolder;
        this._folderHook = null;
        Debug.only(this._listenerCount = 0);

        this._accountSourceId = null;
        this._account = null;
    };

    // MailFolder forwards events from the underlying platform object. Note, we don't hook
    // events on the platform object until a consumer of this class needs to hook.
    Jx.augment(UIDataModel.MailFolder, Jx.Events);
    Debug.Events.define(UIDataModel.MailFolder.prototype, "changed");

    UIDataModel.MailFolder.prototype.dispose = function () {
        Debug.assert(this._listenerCount === 0);
        Jx.dispose(this._folderHook);
    };

    UIDataModel.MailFolder.prototype.addListener = function (type, fn, /*@dynamic,@optional*/context) {
        Debug.assert(type === "changed");
        Debug.only(this._listenerCount++);

        if (!this._folderHook) {
            this._folderHook = new Mail.EventHook(this._platformMailFolder, "changed", function (ev) {
                this._raiseChanged(Array.prototype.slice.call(ev));
            }, this);
        }
        Jx.Events.addListener.call(this, type, fn, context);
    };
    UIDataModel.MailFolder.prototype.addEventListener = UIDataModel.MailFolder.prototype.addListener;

    UIDataModel.MailFolder.prototype.removeListener = function (type, fn, /*@dynamic,@optional*/context) {
        Debug.assert(type === "changed");
        Debug.assert(this._folderHook);
        Debug.assert(this._listenerCount-- > 0);

        Jx.Events.removeListener.call(this, type, fn, context);
    };
    UIDataModel.MailFolder.prototype.removeEventListener = UIDataModel.MailFolder.prototype.removeListener;

    UIDataModel.MailFolder.prototype.ensureSyncEnabled = function () {
        Mail.writeProfilerMark("MailFolder.ensureSyncEnabled", Mail.LogEvent.start);
        var folder = this._platformMailFolder,
            account = this.account,
            shouldSyncAccount = account ? (account.syncType !== Plat.SyncType.manual) : false;
        /* We can't force sync local folders or folders that are selection disabled.
           Syncing a folder on an account that is manually syncing is also undesirable as
           it will lead to extraneous syncs. */
        if (!folder.isLocalMailFolder && !folder.selectionDisabled && shouldSyncAccount) {
            var folderLogIdentifier = folder.objectId;
            
            folderLogIdentifier = folderLogIdentifier + " <" + this.folderName + ">";
            
            Mail.writeProfilerMark("MailFolder.ensureSyncEnabled - startSyncFolderContents for folder - " + folderLogIdentifier);
            try {
                folder.startSyncFolderContents(false /*fForceSynchronization*/);
            } catch (e) {
                Jx.log.exception("folder.startSyncFolderContents id=" + folder.objectId, e);
            }
        }
        Mail.writeProfilerMark("MailFolder.ensureSyncEnabled", Mail.LogEvent.stop);
    };

    UIDataModel.MailFolder.prototype._platformMailFolder = /* @static_cast(Microsoft.WindowsLive.Platform.MailFolder)*/null;

    Object.defineProperty(UIDataModel.MailFolder.prototype, "platformMailFolder", { get: function () { return this._platformMailFolder; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "objectId", { get: function () { return this._platformMailFolder.objectId; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "accountId", { get: function () { return this._platformMailFolder.accountId; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "isPinnedToNavPane", { get: function () { return this._platformMailFolder.isPinnedToNavPane; }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "specialMailFolderType", { get: function () {
        return this._platformMailFolder.specialMailFolderType;
    }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "folderName", { get: function () { return this._getFolderName(); }, enumerable: true });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "shouldShowUnreadCount", { get: function () { return this._platformMailFolder.isLocalMailFolder || this._platformMailFolder.syncFolderContents; }, enumerable: true });

    Object.defineProperty(UIDataModel.MailFolder.prototype, "isOutbox", { get: function () {
        var specialFolderType = /*@static_cast(Number)*/this.specialMailFolderType;
        return (specialFolderType === MailFolderType.outbox);
    }, enumerable: true
    });
    Object.defineProperty(UIDataModel.MailFolder.prototype, "isOutboundFolder", { get: function () {
        var specialFolderType = /*@static_cast(Number)*/this.specialMailFolderType;
        return (specialFolderType === MailFolderType.outbox) || (specialFolderType === MailFolderType.sentItems) || (specialFolderType === MailFolderType.drafts);
    }, enumerable: true
    });

    Object.defineProperty(UIDataModel.MailFolder.prototype, "accountSourceId", { get: function () {
        if (!Jx.isNonEmptyString(this._accountSourceId)) {
            var account = this.account;
            this._accountSourceId = account.sourceId;
        }

        return this._accountSourceId;
    }, enumerable: true});

    Object.defineProperty(UIDataModel.MailFolder.prototype, "account", { get: function () {
        if (!this._account) {
            Debug.assert(Jx.isNonEmptyString(this.accountId));
            var platform = /*@static_cast(Microsoft.WindowsLive.Platform.IClient)*/Mail.Globals.platform;
            this._account = platform.accountManager.loadAccount(this.accountId);
            Debug.assert(Jx.isInstanceOf(this._account, Microsoft.WindowsLive.Platform.Account));
        }
        return this._account;
    }, enumerable : true
    });

    var folderTypeToViewType = null;
    UIDataModel.MailFolder.prototype.getView = function (platform) {
        var ViewType = Plat.MailViewType;

        if (!folderTypeToViewType) {
            folderTypeToViewType = {};
            folderTypeToViewType[MailFolderType.inbox] = ViewType.inbox;
            folderTypeToViewType[MailFolderType.deletedItems] = ViewType.deletedItems;
            folderTypeToViewType[MailFolderType.drafts] = ViewType.draft;
            folderTypeToViewType[MailFolderType.junkMail] = ViewType.junkMail;
            folderTypeToViewType[MailFolderType.outbox] = ViewType.outbox;
            folderTypeToViewType[MailFolderType.sentItems] = ViewType.sentItems;
            folderTypeToViewType[MailFolderType.userGenerated] = ViewType.userGeneratedFolder;
            folderTypeToViewType[MailFolderType.allMail] = ViewType.userGeneratedFolder;
            folderTypeToViewType[MailFolderType.starred] = ViewType.userGeneratedFolder;
            folderTypeToViewType[MailFolderType.important] = ViewType.userGeneratedFolder;
        }
        Debug.assert(Jx.isNonEmptyString(this.accountId));

        var account = new Mail.Account(this.account, platform),
            viewType = folderTypeToViewType[this._platformMailFolder.specialMailFolderType],
            view = null;

        Debug.assert(Jx.isNumber(viewType), "Unknown incoming specialMailFolderType");

        if (viewType === ViewType.userGeneratedFolder) {
            Debug.assert(Jx.isNonEmptyString(this.objectId));
            view = account.queryView(viewType, this.objectId);
        } else {
            view = account.getView(viewType);
        }
        return view;
    };

    UIDataModel.MailFolder.prototype.getChildFolderCollection = function () {
        return this._platformMailFolder.getChildFolderCollection(/*allFolderTypes*/false);
    };

    UIDataModel.MailFolder.prototype.recordAction = function (action) {
        this._platformMailFolder.recordAction(action);
    };

    UIDataModel.MailFolder.prototype._raiseChanged = function (/*@dynamic*/ev) {
        ev.target = this;
        ev.detail = [ev];
        this.raiseEvent("changed", ev);
    };

    // Caches the ResID of each special folder type
    var folderResIDs = {};
    folderResIDs[Plat.MailFolderType.inbox] = "mailFolderNameInbox";
    folderResIDs[Plat.MailFolderType.drafts] = "mailFolderNameDrafts";
    folderResIDs[Plat.MailFolderType.deletedItems] = "mailFolderNameDeletedItems";
    folderResIDs[Plat.MailFolderType.sentItems] = "mailFolderNameSentItems";
    folderResIDs[Plat.MailFolderType.outbox] = "mailFolderNameOutbox";
    folderResIDs[Plat.MailFolderType.junkMail] = "mailFolderNameJunkMail";
    folderResIDs[Plat.MailFolderType.allMail] = "mailFolderNameAllMail";
    folderResIDs[Plat.MailFolderType.starred] = "mailFolderNameStarred";
    folderResIDs[Plat.MailFolderType.important] = "mailFolderNameImportant";
    folderResIDs[Plat.MailFolderType.userGenerated] = "mailMessageListFolderNameDefault";

    UIDataModel.MailFolder.prototype._getFolderName = function () {
        return UIDataModel.MailFolder.getName(this._platformMailFolder);
    };

    UIDataModel.MailFolder.getName = function (folder) {
        Debug.assert(Jx.isObject(folder));
        return folder.folderName ||
               Jx.res.getString(folderResIDs[folder.specialMailFolderType]);
    };

    
    Object.defineProperty(UIDataModel.MailFolder.prototype, "uniqueId", {
        get: function () {
            return this.accountId + "-" + this.objectId + ":" + this.folderName;
        },
        enumerable: true
    });
    

});
