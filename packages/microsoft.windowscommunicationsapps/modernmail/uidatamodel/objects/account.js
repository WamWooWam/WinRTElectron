
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "Account", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ViewType = Plat.MailViewType,
        MailView = Mail.UIDataModel.MailView;

    var Account = Mail.Account = function (account, platform) {
        Debug.assert(Jx.isInstanceOf(account, Plat.Account));
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));

        this._platform = platform;
        this._account = account;
        this._resource = account.getResourceByType(Plat.ResourceType.mail);

        // Cache of special views, e.g. not folder or person
        this._views = {};

        this.initForwarder(account);
        Debug.only(Object.seal(this));
    };

    var prototype = Account.prototype = {
        // Properties essential any platform wrapper
        get platform () { return this._platform; },
        get platformObject () { return this._account; },
        get objectId () { return this._account.objectId; },
        get objectType () { return "Account"; },

        // Properties forwarded from account
        get accountType () { return this._account.accountType; },
        get name () { return this._account.displayName; },
        get syncType () { return this._account.syncType; },
        get sourceId () { return this._account.sourceId; },

        // Easy access to "known" views pre-packaged in UI wrappers
        get inboxView () { return this.getView(ViewType.inbox); },
        get flaggedView () { return this.getView(ViewType.flagged); },
        get draftsView () { return this.getView(ViewType.draft); },
        get outboxView () { return this.getView(ViewType.outbox); },
        get deletedView () { return this.getView(ViewType.deletedItems); },
        get sentView () { return this.getView(ViewType.sentItems); },
        get junkView () { return this.getView(ViewType.junkMail); },
        get pinnedPeopleView () { return this.getView(ViewType.allPinnedPeople); },
        get newsletterView () { return this.getView(ViewType.newsletter); },
        get socialView () { return this.getView(ViewType.social); },

        // Account state/capabilities
        get isConnected () {
            return this._account.mailScenarioState === Plat.ScenarioState.connected;
        },
        get mailResource () {
            return this._resource || (this._resource = this._account.getResourceByType(Plat.ResourceType.mail));
        },
        get peopleViewComplete () {
            return this._account.peopleViewComplete;
        },
        get settingsResult () {
            return this._account.settingsResult;
        },

        // Folder manipulation capabilities
        get canCreateFolders () {
            var resource = this._resource;
            return resource && resource.canCreateFolders;
        },
        get canUpdateFolders () {
            var resource = this._resource;
            return resource && resource.canUpdateFolders;
        },
        get canDeleteFolders () {
            var resource = this._resource;
            return resource && resource.canDeleteFolders;
        },
        get emailAddress () {
            return this._account.emailAddress;
        }
    };
    Jx.augment(Account, Mail.PlatformEventForwarder);

    prototype.queryViews = function (scenario, /*optional*/name) {
        // Creates a mapped collection of views wrapped in UIMailView objects
        var mailManager = this._platform.mailManager;

        return new Mail.MappedCollection(
            new Mail.QueryCollection(
                mailManager.getMailViews,
                mailManager,
                [scenario, this._account.objectId],
                false, /*synchronous*/
                name || "getMailViews(" + scenario + ")"
            ),
            function (view) { return MailView.create(view, this); },
            this
        );
    };

    prototype.queryView = function (type, sourceId) {
        // Query for a view corresponding to a specific person or folder
        Debug.assert(Jx.isNonEmptyString(sourceId));
        Debug.assert(type === ViewType.userGeneratedFolder || type === ViewType.person);
        return this._queryView(type, sourceId);
    };

    prototype._queryView = function (type, sourceId) {
        // Query the platform for a specific view wrapped in our UI object
        var view = this._platform.mailManager.ensureMailView(type, this._account.objectId, sourceId);
        return MailView.create(view, this);
    };

    prototype.getView = function (type) {
        // Ensure we have a local cached copy of the desired special view. Queries
        // the platform if not already cached locally.
        Debug.assert(type !== ViewType.userGeneratedFolder && type !== ViewType.person);

        var views = this._views, view = views[type];
        if (!view || !view.isObjectValid || view.type !== type) {
            view = views[type] = this._queryView(type, "");
        }
        return view;
    };

    prototype.createFolder = function (folderName, /*optional*/parentFolder) {
        // Creates a new folder in this account, optionally parented to the specified folder
        Debug.assert(Jx.isNonEmptyString(folderName));
        Debug.assert(this.canCreateFolders);

        var folder = this._platform.folderManager.createFolder(this._account);
        folder.folderName = folderName;
        folder.folderType = Plat.FolderType.mail;
        if (parentFolder) {
            Debug.assert(Jx.isInstanceOf(parentFolder, Mail.UIDataModel.MailFolder));
            var parentMailFolder = parentFolder.platformMailFolder;
            if (parentMailFolder && parentMailFolder.canHaveChildren) {
                folder.parentFolder = parentMailFolder;
            }
        }
        folder.ensureNameUnique();
        folder.commit();
        return folder;
    };

    // Helpers to load platform objects by and wrap in corresponding UI objects
    Account.load = function (accountId, platform) {
        markStart("load");
        var account = platform.accountManager.loadAccount(accountId);
        if (account) {
            markStop("load");
            return new Mail.Account(account, platform);
        }
        markStop("load");
        return null;
    };

    prototype.loadView = function (viewId) {
        var view = this._platform.mailManager.tryLoadMailView(viewId);
        if (view && view.accountId === this.objectId) {
            return new MailView(view, this);
        }
        return null;
    };

    prototype.loadMessage = function (messageId) {
        var message = this._platform.mailManager.loadMessage(messageId);
        if (message && message.accountId === this.objectId) {
            return new Mail.UIDataModel.MailMessage(message, this);
        }
        return null;
    };

    prototype.search = function (query, locale, pageSize) {
        return this._platform.mailManager.search(this._account, query, locale, pageSize);
    };

    prototype.isMailEnabled = function () {
        var resource = this.mailResource;
        return false ||
            
            Mail.AccountValidator.isOverrideEnabled() ||
            
            this.isConnected && resource && resource.isEnabled;
    };

    Account.isMailEnabled = function (account, platform) {
        Debug.assert(Jx.isInstanceOf(account, Plat.Account));
        return new Account(account, platform || Mail.Globals.platform).isMailEnabled();
    };

    prototype.isWlasSupported = function () {
        // Outlook.com accounts are only supported over EAS. If this account doesn't have
        // EAS settings, it is not an Outlook.com account. Outlook.com accounts are differentiated
        // from other EAS accounts by supporting the WLAS extensions.
        var easSettings = this._account.getServerByType(Plat.ServerType.eas);
        return easSettings && easSettings.isWlasSupported;
    };

    Account.isWlasSupported = function (account, platform) {
        Debug.assert(Jx.isInstanceOf(account, Plat.Account));
        Debug.assert(Jx.isObject(platform));

        return new Account(account, platform).isWlasSupported();
    };

    function markStart(s) {
        Jx.mark("Mail.Account." + s + ",StartTA,Mail");
    }
    function markStop(s) {
        Jx.mark("Mail.Account." + s + ",StopTA,Mail");
    }
});

