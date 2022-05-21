
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "AccountItem", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;

    Mail.AccountItem = function (account, scheduler) {
        Mail.log("AccountListItem_Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(account));
        Debug.assert(Jx.isObject(scheduler));

        this.initComponent();
        this._account = account;
        this._resource = account.getResourceByType(P.ResourceType.mail);
        // It's possible platform returns null resource if the account has become invalid.
        Debug.assert(this._resource || !account.isObjectValid);

        // Error handler handles null resource fine.
        this._errorHandler = Mail.AccountSettings.createErrorHandler(this._account, this._resource);

        // Create an async query since we can update the unseen count post-startup
        this._unseenInboxCounter = new Mail.CollectionCounter(
            new Mail.ScheduledQueryCollection(
                function () {
                    return Mail.AccountItem._getUnseenCollection(account, P.MailViewType.inbox);
                }, this, [],
                Mail.Priority.queryCount,
                scheduler,
                "unseenInbox:" + this.displayName)
        );
        this._unseenInboxCounter.unlock();

        this._unseenFavCounter = new Mail.CollectionCounter(
            new Mail.ScheduledQueryCollection(
                function () {
                    return Mail.AccountItem._getUnseenCollection(account, P.MailViewType.allPinnedPeople);
                }, this, [],
                Mail.Priority.queryCount,
                scheduler,
                "unseenFavorite:" + this.displayName)
        );
        this._unseenFavCounter.unlock();

        this._hasOof = false;
        this._oofIndicator = new Mail.OofIndicatorSwitcher(this._updateOof.bind(this, true), this._updateOof.bind(this, false), false /* respectIgnoredTime */);
        this._oofIndicator.setAccount(account);

        this._disposables = new Mail.Disposer(
            new Mail.EventHook(this._account, "changed", this._onAccountChanged, this),
            new Mail.EventHook(this._unseenInboxCounter, "collectionchanged", this._onUnseenInboxCollectionChanged, this),
            this._unseenInboxCounter,
            new Mail.EventHook(this._unseenFavCounter, "collectionchanged", this._onUnseenFavCollectionChanged, this),
            this._unseenFavCounter,
            this._oofIndicator
        );
        
        // Only add event hook with a valid resource.
        if (this._resource) {
            this._disposables.add(new Mail.EventHook(this._resource, "changed", this._onAccountChanged, this));
        }

        Mail.log("AccountListItem_Ctor", Mail.LogEvent.stop);
    };
    Jx.augment(Mail.AccountItem, Jx.Component);
    Jx.augment(Mail.AccountItem, Jx.Events);

    var proto = Mail.AccountItem.prototype;
    Debug.Events.define(proto, "changed");

    proto.dispose = function () {
        Jx.dispose(this._disposables);
    };

    Mail.AccountItem._getUnseenCollection = function (account, viewType) {
        ///<param name="account" type="P.IAccount"/>
        ///<param name="viewType" type="P.MailViewType"/>
        var view = Mail.Globals.platform.mailManager.ensureMailView(viewType, account.objectId, "");
        if (view) {
            return view.getMessages(P.FilterCriteria.unseen);
        } else {
            // Return empty collection if we didn't get a view.
            return new Mail.ArrayCollection([]);
        }
    };

    Object.defineProperty(proto, "platformAccount", { get: function () { return this._account; } });
    Object.defineProperty(proto, "resource", { get: function () { return this._resource; } });
    Object.defineProperty(proto, "objectId", { get: function () { return this._account.objectId; } });

    Object.defineProperty(proto, "displayName", { get: function () {
        return this._account.displayName;
    } });

    Object.defineProperty(proto, "hasError", { get: function () {
        return this._errorHandler.hasError;
    } });

    Object.defineProperty(proto, "errorText", { get: function () {
        return this._errorHandler.errorText;
    } });

    Object.defineProperty(proto, "hasOof", { get: function () {
        return this._hasOof;
    } });

    Object.defineProperty(proto, "hasUnseenInbox", { get: function () {
        return Jx.isNonEmptyString(this._unseenInboxCounter.displayCount);
    } });

    Object.defineProperty(proto, "hasUnseenFav", { get: function () {
        return (this._unseenFavCounter && this._unseenFavCounter.count > 0);
    } });

    Object.defineProperty(proto, "unseenInboxCount", { get: function () {
        return this._unseenInboxCounter.count;
    } });

    Object.defineProperty(proto, "ariaLabel", { get: function () {
        var unseenFavString = this.hasUnseenFav ? Jx.res.getString("mailAccountListUnseenFav") : "",
            statusString =  this.hasError ? this._errorHandler.errorText : (this._hasOof ? Jx.res.getString("mailOofAccountListMessage") : ""),
            count = this._unseenInboxCounter.count;
        if (count === 1) {
            return Jx.res.loadCompoundString("mailAccountListAriaTemplateSingular", this.displayName, unseenFavString, statusString);
        } else {
            return Jx.res.loadCompoundString("mailAccountListAriaTemplatePlural", this.displayName, count, unseenFavString, statusString);
        }
    } });

    proto.getUI = function (ui) {
        var displayName = Jx.escapeHtml(this.displayName);
        var ariaLabel = Jx.escapeHtml(this.ariaLabel);

        ui.html = "<div id='" + this._id + "' role='option' title='" + displayName + "' aria-label='" + ariaLabel +
                    "' class='accountItem" + (this.hasError ? " showError" : "") + (this.hasUnseenInbox ? " showUnseenInbox" : "") + 
                      (this.hasUnseenFav ? " showUnseenFav" : "") + (this._hasOof ? " showOof" : "") + "' tabIndex='-1'>" +
                        "<div class='accountInfo typeSizeNormal' aria-hidden='true'>" + 
                            "<div class='accountName '>" + displayName + "</div>" +
                            "<div class='unseenInbox'>" + 
                                "<span class='unseenCount'>" + this._unseenInboxCounter.displayCount + "</span>" +
                                "<span class='unseenPlus'>" + this._unseenInboxCounter.overflowGlyph + "</span>" +
                            "</div>" +
                            "<div class='unseenFav'>\uE13D</div>" +  // Buddy glyph to indicate if there's unseen mail from favorites
                        "</div>" + 
                        "<div class='errorText accountStatus typeSizeNormal' aria-hidden='true'>" + Jx.escapeHtml(this._errorHandler.errorText) + "</div>" +
                        "<div class='oofText accountStatus typeSizeNormal' aria-hidden='true'>" + Jx.escapeHtml(Jx.res.getString("mailOofAccountListMessage")) + "</div>" +
                  "</div>";
    };

    proto.onClick = function () {
        if (this._errorHandler.hasError) {
            this._errorHandler.handler(true /*explicit invoke*/);
        }
    };

    proto._onAccountChanged = function (ev) {
        // Possible to get changes before we're hosted in the UI
        var root = document.getElementById(this._id);
        if (root) {
            if (Mail.Validators.hasPropertyChanged(ev, "displayName")) {
                root.querySelector(".accountName").innerText = this.displayName;
                root.title = this.displayName;
                Mail.setAttribute(root, "aria-label", this.ariaLabel);
            } else if (Mail.Validators.hasPropertyChanged(ev, "settingsResult")) {
                this._updateError(root);
                Mail.setAttribute(root, "aria-label", this.ariaLabel);
            } else if (Mail.Validators.hasPropertyChanged(ev, "lastSyncResult") ||
                       Mail.Validators.hasPropertyChanged(ev, "lastPushResult") ||
                       Mail.Validators.hasPropertyChanged(ev, "lastSendMailResult")) {
                this._updateError(root);
                this._updateUnseenCount(root);
                Mail.setAttribute(root, "aria-label", this.ariaLabel);
            }
        }
    };

    proto._raiseChangedEvent = function (properties) {
        // Fabricates a change event when a calculated property is updated
        Debug.assert(Jx.isArray(properties));
        properties.target = this;
        this.raiseEvent("changed", properties);
    };

    proto._onUnseenInboxCollectionChanged = function () {
        // Possible to get changes before we're hosted in the UI
        var root = document.getElementById(this._id);
        if (root) {
            this._updateUnseenCount(root);
            Mail.setAttribute(root, "aria-label", this.ariaLabel);
        }

        this._raiseChangedEvent(["hasUnseenInbox", "unseenInboxCount"]);
    };

    proto._onUnseenFavCollectionChanged = function () {
        // Possible to get changes before we're hosted in the UI
        var root = document.getElementById(this._id);
        if (root) {
            this._updateUnseenFav(root);
            Mail.setAttribute(root, "aria-label", this.ariaLabel);
        }

        this._raiseChangedEvent(["hasUnseenFav"]);
    };

    proto._updateError = function (root) {
        this._errorHandler = Mail.AccountSettings.createErrorHandler(this._account, this._resource);
        root.querySelector(".errorText").innerText = this._errorHandler.errorText;
        
        var hasError = this.hasError;
        // If hasError state has changed, update it. Otherwise skip.
        if (Jx.hasClass(root, "showError") !== hasError) {
            Jx.setClass(root, "showError", hasError);
            this._raiseChangedEvent(["hasError"]);
        }
    };

    proto._updateUnseenCount = function (root) {
        root.querySelector(".unseenCount").innerText = this._unseenInboxCounter.displayCount;
        root.querySelector(".unseenPlus").innerText = this._unseenInboxCounter.overflowGlyph;
        Jx.setClass(root, "showUnseenInbox", this.hasUnseenInbox);
    };

    proto._updateUnseenFav = function (root) {
        Jx.setClass(root, "showUnseenFav", this.hasUnseenFav);
    };

    proto._updateOof = function (hasOof) {
        this._hasOof = hasOof;
        var root = document.getElementById(this._id);
        if (root) {
            Jx.setClass(root, "showOof", hasOof);
            Mail.setAttribute(root, "aria-label", this.ariaLabel);
        }
        this._raiseChangedEvent(["hasOof"]);
    };

});

