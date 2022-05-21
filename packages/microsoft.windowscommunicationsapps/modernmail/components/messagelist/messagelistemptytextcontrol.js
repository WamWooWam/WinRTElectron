
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, ["EmptyTextControl", "SearchEmptyTextControl"], function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        SyncWindowSize = Plat.SyncWindowSize,
        SyncStatus = Mail.ViewSyncMonitor.SyncStatus;

    ///
    /// EmptyTextControl
    ///
    Mail.EmptyTextControl = function (host, syncMonitor, view) {
        /// <summary> A control to show a custom UI when the collection is empty</summary>
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isInstanceOf(syncMonitor, Mail.FolderSyncMonitor));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        this._host = host;
        this._syncMonitor = syncMonitor;
        this._lastSyncStatus = null;
        this._view = view;
        this._linkHook = null;
        this._disposer = new Mail.Disposer(new Mail.EventHook(this._syncMonitor, "syncWindowChanged", this._updateEmptyText, this));
    };

    Mail.EmptyTextControl.create = function (host, syncMonitor, view) {
        if (view.type === Plat.MailViewType.allPinnedPeople) {
            return new Mail.AllPinnedEmptyTextControl(host, syncMonitor, view);
        } else {
            return new Mail.EmptyTextControl(host, syncMonitor, view);
        }
    };

    var noMessagesResources = [];
    noMessagesResources[SyncWindowSize.all] = "mailMessageListNoMessagesAnyTime";
    noMessagesResources[SyncWindowSize.oneDay] = "mailMessageListNoMessagesOneDay";
    noMessagesResources[SyncWindowSize.threeDays] = "mailMessageListNoMessagesThreeDays";
    noMessagesResources[SyncWindowSize.oneWeek] = "mailMessageListNoMessagesOneWeek";
    noMessagesResources[SyncWindowSize.twoWeeks] = "mailMessageListNoMessagesTwoWeeks";
    noMessagesResources[SyncWindowSize.oneMonth] = "mailMessageListNoMessagesOneMonth";
    noMessagesResources[SyncWindowSize.threeMonths] = "mailMessageListNoMessagesThreeMonths";
    noMessagesResources[SyncWindowSize.sixMonths] = "mailMessageListNoMessagesSixMonths";

    function getEmptyText(syncMonitor) {
        var resource = "";
        switch (syncMonitor.getSyncStatus()) {
        case SyncStatus.failed:
            resource = "mailMessageListFailedToSync";
            break;
        case SyncStatus.completed:
            resource = noMessagesResources[syncMonitor.getSyncWindow()];
            break;
        case SyncStatus.offline:
            resource = "mailMessageListOfflineStatusText";
            break;
        }
        var emptyText = resource ? Jx.res.getString(resource) : "";
        return emptyText;
    }

    var showSettingsSyncWindows = [
        SyncWindowSize.oneDay, SyncWindowSize.threeDays, SyncWindowSize.oneWeek,
        SyncWindowSize.twoWeeks, SyncWindowSize.oneMonth, SyncWindowSize.threeMonths, SyncWindowSize.sixMonths
    ];

    function getSettingsText(syncMonitor) {
        if ((syncMonitor.getSyncStatus() === SyncStatus.completed) &&
            (showSettingsSyncWindows.indexOf(syncMonitor.getSyncWindow()) !== -1)) {
            return Jx.res.getString("mailMessageListGetOlderMessages");
        }
        return "";
    }

    function createOpenSettingsHandler(account) {
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        return function (ev) {
            Mail.AppSettings.openAccountUI(account);
            ev.preventDefault(); // prevent navigation
        };
    }

    Mail.EmptyTextControl.prototype.setVisibility = function (visible, showProgress) {
        Debug.assert(Jx.isBoolean(visible));
        if (visible) {
            var syncStatus = this._syncMonitor.getSyncStatus();
            if (syncStatus !== this._lastSyncStatus) {
                this._lastSyncStatus = syncStatus;
                this._updateEmptyText();
            }
        }
        Jx.setClass(this._host, "hidden", !visible);
    };

    Mail.EmptyTextControl.prototype.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._linkHook = null;
    };

    Mail.EmptyTextControl.prototype._updateEmptyText = function () {
        this._disposer.disposeNow(this._linkHook);
        this._linkHook = null;

        var settingsText = getSettingsText(this._syncMonitor),
            settingsLink = settingsText ? "<a class='mailMessageListSettingsLink' href='' tabIndex='0' role='button'>" + Jx.escapeHtml(settingsText) + "</a>" : "";
        this._host.innerHTML = "<div>" +
            "<span>" + Jx.escapeHtml(getEmptyText(this._syncMonitor)) + "</span>&nbsp;" +
                 settingsLink +
            "</div>";
        if (settingsText) {
            var linkElement = this._host.querySelector("a"),
                account = this._view.account.platformObject;
            this._linkHook = this._disposer.add(new Mail.EventHook(linkElement, "click", createOpenSettingsHandler(account), this));
        }
    };

    ///
    /// AllPinnedEmptyTextControl
    ///
    Mail.AllPinnedEmptyTextControl = function (host, syncMonitor, view) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isInstanceOf(syncMonitor, Mail.AllPinnedSyncMonitor));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        this._host = host;
        this._syncMonitor = syncMonitor;
        this._textElement = this._linkElement = null;
        this._collection = null;
        this._account = view.account;
        this._disposer = new Mail.Disposer(new Mail.EventHook(this._syncMonitor, "syncWindowChanged", this._updateEmptyText, this));
        this._linkHandler = null;
    };

    Mail.AllPinnedEmptyTextControl.prototype.dispose = function () {
        Jx.dispose(this._disposer);
    };

    Mail.AllPinnedEmptyTextControl.prototype.setVisibility = function (showEmpty, showProgress) {
        var host = this._host;
        if (showEmpty || showProgress) {
            host.classList.remove("hidden");

            var textElement = this._textElement,
                linkElement = this._linkElement;

            if (!textElement) {
                host.innerHTML = "<span class='text'></span> <a class='mailMessageListSettingsLink' href='' tabIndex='0' role='button'></a>";
                textElement = this._textElement = host.querySelector(".text");
                linkElement = this._linkElement = host.querySelector("a");
            }

            Jx.setClass(linkElement, "hidden", showProgress); // Hide the linkElement to prevent it from receiving tab focus

            if (showProgress) {
                textElement.innerText = Jx.res.getString("mailMessageListAllPinnedFirstRun");
            } else {
                var syncStatus = this._syncMonitor.getSyncStatus();
                if (syncStatus === SyncStatus.completed && !this._collection) {
                    var collection = this._collection = this._account.queryViews(Plat.MailViewScenario.navPane);
                    this._disposer.addMany(
                        collection,
                        new Mail.EventHook(collection, "collectionchanged", this._onCollectionChange, this)
                    );
                    collection.unlock();
                }
                this._updateEmptyText();
            }
        } else {
            host.classList.add("hidden");
        }
    };

    Mail.AllPinnedEmptyTextControl.prototype._onClick = function (ev) {
        Mail.PeopleFlyout.pickPeople(this._account);
        ev.stopPropagation();
        ev.preventDefault();
    };

    Mail.AllPinnedEmptyTextControl.prototype._onCollectionChange = function () {
        this._updateEmptyText();
    };

    Mail.AllPinnedEmptyTextControl.prototype._updateEmptyText = function () {
        var collection = this._collection,
            anyPinnedPeople = false,
            showLink = false;

        if (collection) {
            for (var i = 0, len = collection.count; i < len; ++i) {
                if (collection.item(i).type === Plat.MailViewType.person) {
                    anyPinnedPeople = true;
                    break;
                }
            }
        }

        if (collection && !anyPinnedPeople) {
            this._textElement.innerText = Jx.res.getString("mailMessageListAllPinnedEmpty");
            this._linkElement.innerText = Jx.res.getString("mailMessageListAllPinnedEmptyLink");
            this._linkHandler = this._disposer.replace(this._linkHandler,
                new Mail.EventHook(this._linkElement, "click", this._onClick, this));
            showLink = true;
        } else {
            this._textElement.innerText = getEmptyText(this._syncMonitor);
            var settingsText = getSettingsText(this._syncMonitor);
            if (settingsText) {
                this._linkElement.innerText = settingsText;
                this._linkHandler = this._disposer.replace(this._linkHandler,
                    new Mail.EventHook(this._linkElement, "click", createOpenSettingsHandler(this._account.platformObject), this));
                showLink = true;
            }
        }
        Jx.setClass(this._linkElement, "hidden", !showLink);
    };

    ///
    /// SearchEmptyTextControl
    ///
    Mail.SearchEmptyTextControl = function (host, selection, scopeSwitcher) {
        /// <summary> A control to show a custom UI when the search collection is empty</summary>
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(scopeSwitcher, Mail.SearchScopeSwitcher));
        this._host = host;
        this._scopeSwitcher = scopeSwitcher;
        this._account = selection.account;
        this._hook = null;
    };

    Mail.SearchEmptyTextControl.prototype.setVisibility = function (visible, showProgress) {
        Debug.assert(Jx.isBoolean(visible));
        if (visible) {
            this._activateUI();
        }
        Jx.setClass(this._host, "hidden", !visible);
    };

    Mail.SearchEmptyTextControl.prototype.dispose = function () {
        Jx.dispose(this._hook);
    };

    Mail.SearchEmptyTextControl.prototype._getUpsellUI = function () {
        if (this._scopeSwitcher.canUpsell()) {
            return "<div><a class='mailMessageListSettingsLink' href='' tabIndex='0'>" + this._scopeSwitcher.upsell.description + "</a></div>";
        }
        return "";
    };

    Mail.SearchEmptyTextControl.prototype._activateUI = function () {
        this._activateUI = Jx.fnEmpty;
        var upsellUI = this._getUpsellUI();
        this._host.innerHTML = "<div>" + Jx.escapeHtml(Jx.res.getString("mailMessageListEmptySearch")) + "</div>" + upsellUI;
        if (upsellUI) {
            var linkElement = this._host.querySelector("a");
            this._hook = new Mail.EventHook(linkElement, "click", this._onInvoke, this);
        }
    };

    Mail.SearchEmptyTextControl.prototype._onInvoke = function (ev) {
        this._scopeSwitcher.rescopeToUpsell();
        ev.preventDefault(); // prevent navigation
    };
});