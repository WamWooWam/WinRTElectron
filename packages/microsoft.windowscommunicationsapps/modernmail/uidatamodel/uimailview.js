Jx.delayDefine(Mail.UIDataModel, "MailView", function() {
    "use strict";
    function o(n, t) {
        var i = n.getView(t);
        return i && i.isEnabled
    }
    var u = Microsoft.WindowsLive.Platform, t = u.MailViewType, f = Mail.PlatformEventForwarder, i = Mail.UIDataModel.MailView = function(n, t) {
        this.initForwarder(n);
        this._view = n;
        this._account = t;
        this._platform = t.platform;
        this._sourceObject = undefined;
        this._sourceHook = null;
        this._viewName = null;
        this._sourceType = null
    }
    , n, r, e;
    Jx.augment(i, f);
    n = i.prototype;
    i.create = function(n, t) {
        return n ? new i(n,t) : null
    }
    ;
    Object.defineProperty(n, "platformMailView", {
        get: function() {
            return this._view
        },
        enumerable: true
    });
    Object.defineProperty(n, "objectId", {
        get: function() {
            return this._view.objectId
        },
        enumerable: true
    });
    Object.defineProperty(n, "objectType", {
        get: function() {
            return "MailView"
        },
        enumerable: true
    });
    Object.defineProperty(n, "platform", {
        get: function() {
            return this._platform
        },
        enumerable: true
    });
    Object.defineProperty(n, "account", {
        get: function() {
            return this._account
        },
        enumerable: true
    });
    Object.defineProperty(n, "accountId", {
        get: function() {
            return this._view.accountId
        },
        enumerable: true
    });
    Object.defineProperty(n, "type", {
        get: function() {
            return this._view.type
        },
        enumerable: true
    });
    r = {};
    r[t.flagged] = "mailFolderNameFlagged";
    r[t.newsletter] = "mailViewsNewsletter";
    r[t.social] = "mailViewsSocial";
    r[t.allPinnedPeople] = "mailViewsAllFavorites";
    n._getViewName = function() {
        var n = this._viewName, t, i;
        if (n === null) {
            if (t = this._getSourceObject(),
            t)
                if (this._getSourceType(t) === "Folder")
                    n = Mail.UIDataModel.MailFolder.getName(t);
                else
                    try {
                        n = t.calculatedUIName
                    } catch (u) {
                        Jx.log.exception("Error retrieving person name", u);
                        n = ""
                    }
            else
                i = r[this.type],
                n = i ? Jx.res.getString(i) : "";
            (this._sourceHook || !t) && (this._viewName = n)
        }
        return n
    }
    ;
    Object.defineProperty(n, "name", {
        get: n._getViewName,
        enumerable: true
    });
    n.getSortName = function(n) {
        var i, t = this._getSourceObject();
        if (this._getSourceType(t) === "Person")
            try {
                i = n ? t.sortNameLastFirst : t.calculatedYomiDisplayName
            } catch (r) {
                Jx.log.exception("Error retrieving person sort name", r)
            }
        return i || this._getViewName()
    }
    ;
    n._getSourceObject = function() {
        var n = this._sourceObject;
        return n === undefined && (n = this._sourceObject = this._view.sourceObject),
        n
    }
    ;
    Object.defineProperty(n, "sourceObject", {
        get: n._getSourceObject,
        enumerable: true
    });
    Object.defineProperty(n, "folder", {
        get: function() {
            var n = this._getSourceObject();
            return this._getSourceType(n) === "Folder" ? new Mail.UIDataModel.MailFolder(n) : null
        },
        enumerable: true
    });
    Object.defineProperty(n, "notificationCount", {
        get: function() {
            return this._view.notificationCount
        },
        enumerable: true
    });
    Object.defineProperty(n, "isPinnedToNavPane", {
        get: function() {
            return this._view.isPinnedToNavPane
        },
        enumerable: true
    });
    Object.defineProperty(n, "isEnabled", {
        get: function() {
            return this._view.isEnabled
        },
        enumerable: true
    });
    Object.defineProperty(n, "canChangePinState", {
        get: function() {
            return this._view.canChangePinState
        },
        enumerable: true
    });
    Object.defineProperty(n, "canServerSearch", {
        get: function() {
            return this._view.canServerSearch
        },
        enumerable: true
    });
    Object.defineProperty(n, "isObjectValid", {
        get: function() {
            var n = this._view.isObjectValid, t;
            return n && (t = this._getSourceObject(),
            n = !t || !t.isValid),
            n
        },
        enumerable: true
    });
    n.getConversations = function(n) {
        return this._view.getConversations(n)
    }
    ;
    n.getMessages = function(n) {
        return this._view.getMessages(n)
    }
    ;
    n.search = function(n, t, i) {
        return this._platform.mailManager.search(this._view, n, t, i)
    }
    ;
    n.getLaunchArguments = function(n) {
        return this._view.getLaunchArguments(n)
    }
    ;
    n.clearUnseenMessages = function() {
        this._view.clearUnseenMessages()
    }
    ;
    n.pinToNavPane = function(n) {
        var i, u, r;
        i = this._view;
        u = this._platform;
        i.pinToNavPane(n);
        i.commit();
        n && i.type === t.person && (r = this._getSourceObject(),
        r && !r.isInAddressBook && u.peopleManager.promoteImplicitContact(this._account.platformObject, r.objectId))
    }
    ;
    n.canDeleteSource = function() {
        var n = this._getSourceObject()
          , t = this._account;
        if (n && n.canMove) {
            if (n.underDeletedItems)
                return t.canDeleteFolders && n.canDelete;
            if (t.canUpdateFolders)
                return Mail.ViewCapabilities.canHaveChildren(t.deletedView)
        }
        return false
    }
    ;
    n.deleteSource = function() {
        var n = this._getSourceObject();
        n.underDeletedItems ? n.deleteObject() : (this.isPinnedToNavPane && this.pinToNavPane(false),
        n.parentFolder = this._account.deletedView.folder.platformMailFolder,
        n.ensureNameUnique(),
        n.commit())
    }
    ;
    n.setStartScreenTileId = function(n, t) {
        try {
            this._view.setStartScreenTileId(n, t, true)
        } catch (i) {}
    }
    ;
    Object.defineProperty(n, "startScreenTileId", {
        get: function() {
            return this._view.startScreenTileId
        },
        enumerable: true
    });
    n._createChangedHook = function() {
        f._createChangedHook.call(this);
        this._updateSourceHook()
    }
    ;
    n._clearChangedHook = function() {
        f._clearChangedHook.call(this);
        this._sourceHook = null;
        this._viewName = null
    }
    ;
    n._updateSourceHook = function() {
        this._sourceObject = undefined;
        this._sourceType = null;
        this._viewName = null;
        var n = this._getSourceObject()
          , t = n ? new Mail.EventHook(n,"changed",this._onPlatformChanged,this) : null;
        this._sourceHook = this._changedHooks.replace(this._sourceHook, t)
    }
    ;
    n._getSourceType = function(n) {
        var t = this._sourceType;
        return t === null && (t = this._sourceType = n ? n.objectType : ""),
        t
    }
    ;
    e = {
        MailView: {
            type: ["type", "name", "sortName", "parentFolder"],
            sourceObject: ["sourceObject", "name", "sortName", "folder", "parentFolder", "canRename", "canHaveChildren"],
            notificationCount: ["notificationCount"],
            isPinnedToNavPane: ["isPinnedToNavPane"],
            isEnabled: ["isEnabled"]
        },
        Folder: {
            mailSpecialFolderType: ["name", "sortName"],
            name: ["name", "sortName"],
            parentFolder: ["parentFolder"],
            canRename: ["canRename"],
            canHaveChildren: ["canHaveChildren"]
        },
        Person: {
            calculatedUIName: ["name", "sortName"],
            calculatedYomiDisplayName: ["sortName"],
            sortNameLastFirst: ["sortName"]
        }
    };
    n._onChanged = function(n) {
        var t, i;
        Mail.Validators.hasPropertyChanged(n, "sourceObject") && this._updateSourceHook();
        t = e[n.target.objectType];
        t && (i = n.reduce(function(n, i) {
            var r = t[i];
            return r && n.push.apply(n, r),
            n
        }, []),
        i.indexOf("name") !== -1 && (this._viewName = null),
        this.raiseChanged(i))
    }
    ;
    n.containsMessage = function(n) {
        var f;
        switch (this._view.type) {
        case t.inbox:
            return n.isInView(this.objectId) && (!n.hasSocialUpdateCategory || !o(this._account, t.social)) && (!n.hasNewsletterCategory || !o(this._account, t.newsletter));
        case t.flagged:
            return n.flagged;
        case t.social:
            return n.hasSocialUpdateCategory && n.isInInbox;
        case t.newsletter:
            return n.hasNewsletterCategory && n.isInInbox;
        case t.allPinnedPeople:
            return n.isFromPersonPinned;
        case t.person:
            var i = n.from
              , r = i ? i.person : null
              , u = this._view.sourceObject;
            return !!r && !!u && r.objectId === u.objectId;
        default:
            return f = this._view.sourceObject,
            !!f && n.isInView(this.objectId)
        }
    }
    ;
    n.loadMessage = function(n) {
        var t = this._account.loadMessage(n);
        return t && this.containsMessage(t) ? t : null
    }
    ;
    i.areEqual = function(n, t) {
        return !n && !t || n && t && n.objectId === t.objectId
    }
})
