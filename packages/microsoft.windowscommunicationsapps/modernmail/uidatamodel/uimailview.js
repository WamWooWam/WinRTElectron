
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail.UIDataModel, "MailView", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        MailViewType = Plat.MailViewType,
        Forwarder = Mail.PlatformEventForwarder;

    var MailView = Mail.UIDataModel.MailView = function (view, account) {
        Debug.assert(Jx.isInstanceOf(view, Plat.MailView));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(view.accountId === account.objectId || !view.isObjectValid);

        this.initForwarder(view);

        this._view = view;
        this._account = account;
        this._platform = account.platform;

        // Views without source objects will set this to null
        this._sourceObject = undefined;
        this._sourceHook = null;

        // Cache the name since this can get expensive if we keep going
        // back to the source object when sorting lists of views
        this._viewName = null;
        this._sourceType = null;

        Debug.only(Object.seal(this));
    };
    Jx.augment(MailView, Forwarder);
    Debug.Events.define(MailView.prototype, "changed", "deleted");
    var prototype = MailView.prototype;

    MailView.create = function (view, account) {
        Debug.assert(Jx.isNullOrUndefined(view) || Jx.isInstanceOf(view, Plat.MailView));
        return view ? new MailView(view, account) : null;
    };

    Object.defineProperty(prototype, "platformMailView", { get: function () {
        return this._view;
    }, enumerable: true });

    Object.defineProperty(prototype, "objectId", { get: function () {
        return this._view.objectId;
    }, enumerable: true });

    Object.defineProperty(prototype, "objectType", { get: function () {
        return "MailView";
    }, enumerable: true });

    Object.defineProperty(prototype, "platform", { get: function () {
        return this._platform;
    }, enumerable: true });

    Object.defineProperty(prototype, "account", { get: function () {
        return this._account;
    }, enumerable: true });

    Object.defineProperty(prototype, "accountId", { get: function () {
        return this._view.accountId;
    }, enumerable: true });

    Object.defineProperty(prototype, "type", { get: function () {
        return this._view.type;
    }, enumerable: true });

    var viewNames = { };
    viewNames[MailViewType.flagged] = "mailFolderNameFlagged";
    viewNames[MailViewType.newsletter] = "mailViewsNewsletter";
    viewNames[MailViewType.social] = "mailViewsSocial";
    viewNames[MailViewType.allPinnedPeople] = "mailViewsAllFavorites";
    prototype._getViewName = function () {
        var viewName = this._viewName;
        if (viewName === null) {
            var sourceObject = this._getSourceObject();
            if (sourceObject) {
                if (this._getSourceType(sourceObject) === "Folder") {
                    viewName = Mail.UIDataModel.MailFolder.getName(sourceObject);
                } else {
                    try {
                        viewName = sourceObject.calculatedUIName;
                    } catch (ex) {
                        Jx.log.exception("Error retrieving person name", ex);
                        viewName = "";
                    }
                }
            } else {
                var resource = viewNames[this.type];
                viewName = resource ? Jx.res.getString(resource) : "";
            }

            // Only cache the name if we're hooked for changes on the source
            // object so that we can update it when necessary
            if (this._sourceHook || !sourceObject) {
                this._viewName = viewName;
            }
        }
        return viewName;
    };
    Object.defineProperty(prototype, "name", { get: prototype._getViewName, enumerable: true });

    prototype.getSortName = function (lastFirst) {
        var sortName;
        var sourceObject = this._getSourceObject();
        if (this._getSourceType(sourceObject) === "Person") {
            try {
                sortName = lastFirst ?
                    sourceObject.sortNameLastFirst :
                    sourceObject.calculatedYomiDisplayName;
            } catch (ex) {
                Jx.log.exception("Error retrieving person sort name", ex);
            }
        }
        return sortName || this._getViewName();
    };

    prototype._getSourceObject = function () {
        // There are views (newsletter, social, flagged) without a backing source
        // object. Our cached member is explicitly initialized with undefined to
        // avoid attempts at re-accessing the non-existent source object if null.
        var source = this._sourceObject;
        if (source === undefined) {
            source = this._sourceObject = this._view.sourceObject;
            Debug.assert(source !== undefined);
        }
        return source;
    };
    Object.defineProperty(prototype, "sourceObject", { get: prototype._getSourceObject, enumerable: true });

    Object.defineProperty(prototype, "folder", { get: function () {
        var sourceObject = this._getSourceObject();
        if (this._getSourceType(sourceObject) === "Folder") {
            return new Mail.UIDataModel.MailFolder(sourceObject);
        }
        return null;
    }, enumerable: true });

    Object.defineProperty(prototype, "notificationCount", { get: function () {
        return this._view.notificationCount;
    }, enumerable: true });

    Object.defineProperty(prototype, "isPinnedToNavPane", { get: function () {
        return this._view.isPinnedToNavPane;
    }, enumerable: true });

    Object.defineProperty(prototype, "isEnabled", { get: function () {
        return this._view.isEnabled;
    }, enumerable: true });

    Object.defineProperty(prototype, "canChangePinState", { get: function () {
        return this._view.canChangePinState;
    }, enumerable: true });

    Object.defineProperty(prototype, "canServerSearch", { get: function () {
        return this._view.canServerSearch;
    }, enumerable: true });

    Object.defineProperty(prototype, "isObjectValid", { get: function () {
        var isValid = this._view.isObjectValid;
        if (isValid) {
            var sourceObject = this._getSourceObject();
            isValid = !sourceObject || !sourceObject.isValid;
        }
        return isValid;
    }, enumerable: true });

    prototype.getConversations = function (filter) {
        return this._view.getConversations(filter);
    };

    prototype.getMessages = function (filter) {
        return this._view.getMessages(filter);
    };

    prototype.search = function (query, locale, pageSize) {
        return this._platform.mailManager.search(this._view, query, locale, pageSize);
    };

    prototype.getLaunchArguments = function (messageId) {
        return this._view.getLaunchArguments(messageId);
    };

    prototype.clearUnseenMessages = function () {
        this._view.clearUnseenMessages();
    };

    prototype.pinToNavPane = function (pin) {
        Debug.assert(Jx.isBoolean(pin));

        var view = this._view,
            platform = this._platform;
        view.pinToNavPane(pin);
        view.commit();

        if (pin && view.type === MailViewType.person) {
            var person = this._getSourceObject();

            // For purposes of roaming and indexing, implicit contacts need to be saved when pinned
            if (person && !person.isInAddressBook) {
                platform.peopleManager.promoteImplicitContact(this._account.platformObject, person.objectId);
            }
        }
    };

    prototype.canDeleteSource = function () {
        var source = this._getSourceObject(),
            account = this._account;

        // Move is synonomous with delete
        if (source && source.canMove) {
            Debug.assert(this._getSourceType(source) === "Folder");
            if (source.underDeletedItems) {
                // Folder is under deleted and the account supports folder deletes
                return account.canDeleteFolders && source.canDelete;
            } else if (account.canUpdateFolders) {
                // Can the folder be moved to under deleted items
                return Mail.ViewCapabilities.canHaveChildren(account.deletedView);
            }
        }
        return false;
    };

    prototype.deleteSource = function () {
        var source = this._getSourceObject();
        Debug.assert(this.canDeleteSource());

        if (source.underDeletedItems) {
            // Delete the source object (e.g. folder) for the view
            source.deleteObject();
        } else {
            // Pinned, unpin
            if (this.isPinnedToNavPane) {
                this.pinToNavPane(false);
            }

            // Move to deleted items
            source.parentFolder = this._account.deletedView.folder.platformMailFolder;
            source.ensureNameUnique();
            source.commit();
        }
    };

    prototype.setStartScreenTileId = function (tileId, launchArguments) {
        try {
            // this method could return an error if the underlying view in the table has been removed
            this._view.setStartScreenTileId(tileId, launchArguments, true);
        } catch (e) { }
    };

    Object.defineProperty(prototype, "startScreenTileId", { get: function () {
        return this._view.startScreenTileId;
    }, enumerable: true });

    prototype._createChangedHook = function () {
        Forwarder._createChangedHook.call(this);
        this._updateSourceHook();
    };

    prototype._clearChangedHook = function () {
        Forwarder._clearChangedHook.call(this);
        this._sourceHook = null;
        this._viewName = null;
    };

    prototype._updateSourceHook = function () {
        this._sourceObject = undefined;
        this._sourceType = null;
        this._viewName = null;

        var sourceObject = this._getSourceObject();
        var hook = sourceObject ? new Mail.EventHook(sourceObject, "changed", this._onPlatformChanged, this) : null;
        this._sourceHook = this._changedHooks.replace(this._sourceHook, hook);
    };

    prototype._getSourceType = function (sourceObject) {
        var sourceType = this._sourceType;
        if (sourceType === null) {
            sourceType = this._sourceType = (sourceObject ? sourceObject.objectType : "");
        }
        return sourceType;
    };

    var changeMapByType = {
        MailView: { // A map from properties on a platform MailView to properties on this object
            type: [ "type", "name", "sortName", "parentFolder" ],
            sourceObject: [ "sourceObject", "name", "sortName", "folder", "parentFolder", "canRename", "canHaveChildren" ],
            notificationCount: [ "notificationCount" ],
            isPinnedToNavPane: [ "isPinnedToNavPane" ],
            isEnabled: [ "isEnabled" ]
        },
        Folder: {
            mailSpecialFolderType: [ "name", "sortName" ],
            name: [ "name", "sortName" ],
            parentFolder: [ "parentFolder" ],
            canRename: [ "canRename" ],
            canHaveChildren: [ "canHaveChildren" ]
        },
        Person: {
            calculatedUIName: [ "name", "sortName" ],
            calculatedYomiDisplayName: [ "sortName" ],
            sortNameLastFirst: [ "sortName" ]
        }
    };
    prototype._onChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "sourceObject")) {
            this._updateSourceHook();
        }

        var changeMap = changeMapByType[ev.target.objectType];
        if (changeMap) {
            var changes = ev.reduce(function (changes, platformProperty) {
                var affectedProperties = changeMap[platformProperty];
                if (affectedProperties) {
                    changes.push.apply(changes, affectedProperties);
                }
                return changes;
            }, []);

            // Clear the cached name property if necessary
            if (changes.indexOf("name") !== -1) {
                this._viewName = null;
            }

            this.raiseChanged(changes);
        }
    };

    function isCategoryEnabled(account, type) {
        var view = account.getView(type);
        return view && view.isEnabled;
    }

    prototype.containsMessage = function (message) {
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        switch (this._view.type) {
        case MailViewType.inbox:
            // The message needs to be in the Inbox and isInView needs to say it's there as well.
            // Gmail Sent messages might be in the Inbox, but bestDisplayViewId will return Sent Items.
            return message.isInView(this.objectId) &&
                (!message.hasSocialUpdateCategory || !isCategoryEnabled(this._account, MailViewType.social)) &&
                (!message.hasNewsletterCategory || !isCategoryEnabled(this._account, MailViewType.newsletter));
        case MailViewType.flagged:
            return message.flagged;
        case MailViewType.social:
            return message.hasSocialUpdateCategory && message.isInInbox;
        case MailViewType.newsletter:
            return message.hasNewsletterCategory && message.isInInbox;
        case MailViewType.allPinnedPeople:
            return message.isFromPersonPinned;
        case MailViewType.person:
            var fromRecipient = message.from,
                fromPerson = fromRecipient ? fromRecipient.person : null,
                sourcePerson = this._view.sourceObject;
            Debug.assert(sourcePerson);
            return !!fromPerson && !!sourcePerson && fromPerson.objectId === sourcePerson.objectId;
        default:
            var sourceFolder = this._view.sourceObject;
            Debug.assert(sourceFolder);
            return !!sourceFolder && message.isInView(this.objectId);
        }
    };

    prototype.loadMessage = function (messageId) {
        var message = this._account.loadMessage(messageId);
        if (message && this.containsMessage(message)) {
            return message;
        }
        return null;
    };

    MailView.areEqual = function (viewA, viewB) {
        Debug.assert(Jx.isNullOrUndefined(viewA) || Jx.isInstanceOf(viewA, MailView));
        Debug.assert(Jx.isNullOrUndefined(viewB) || Jx.isInstanceOf(viewB, MailView));

        return (!viewA && !viewB) ||
               (viewA && viewB && viewA.objectId === viewB.objectId);
    };
});

