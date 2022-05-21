
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true */
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "AccountSwitcherAggregator", function () {
    "use strict";

    Mail.AccountSwitcherAggregator = function (accounts) {
        /// <param name="items" type="Mail.MappedCollection"/>
        Mail.log("AccountSwitcherAggregator_Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(accounts));

        this.initComponent();
        this._accounts = accounts;

        this._disposer = new Mail.Disposer(
            Mail.ItemDemux.createHook(accounts, this._onAccountChanged, this),
            new Mail.EventHook(accounts, "collectionchanged", this._onAccountsCollectionChanged, this)
        );

        Mail.log("AccountSwitcherAggregator_Ctor", Mail.LogEvent.stop);
    };

    Jx.augment(Mail.AccountSwitcherAggregator, Jx.Component);
    var proto = Mail.AccountSwitcherAggregator.prototype;

    proto.shutdownComponent = function () {
        Jx.dispose(this._disposer);
        Jx.Component.prototype.shutdownComponent.call(this);
    };

    function getDisplayCount(count) { return count > 999 ? "999" : count; }
    function getOverflowGlyph(count) { return count > 999 ? "\u207A" /* '+' glyph */ : ""; }

    proto.getUI = function (ui) {
        var unseenInboxCount = this._unseenInboxCount();

        ui.html =
            "<div id='" + this._id + "' class='accountSwitcherAggregator" + (this._hasError() ? " showError" : "") +
                (unseenInboxCount > 0 ? " showUnseenInbox" : "") + (this._hasUnseenFav() ? " showUnseenFav" : "") + "' tabIndex='-1'>" +
                "<div class='aggregatedError icon-acError'></div>" +
                "<div class='aggregatedUnseenInbox'>" +
                    "<span class='unseenCount'>" + getDisplayCount(unseenInboxCount) + "</span>" +
                    "<span class='unseenPlus'>" + getOverflowGlyph(unseenInboxCount) + "</span>" +
                "</div>" +
                "<div class='aggregatedUnseenFav'>\uE13D</div>" + // buddy glyph
            "</div>";
    };

    proto._onAccountChanged = function (ev) {
        var root = document.getElementById(this._id);
        if (root) {
            if (Mail.Validators.hasPropertyChanged(ev, "unseenInboxCount")) {
                this._updateUnseenInbox(root);
            }
            if (Mail.Validators.hasPropertyChanged(ev, "hasUnseenFav")) {
                this._updateUnseenFav(root);
            }
            if (Mail.Validators.hasPropertyChanged(ev, "hasError")) {
                this._updateErrorState(root);
            }
        }
    };

    proto._onAccountsCollectionChanged = function (ev) {
        var ChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;
        if (ev.eType === ChangeType.itemRemoved || ev.eType === ChangeType.itemAdded || ev.eType === ChangeType.reset) {
            var root = document.getElementById(this._id);
            if (root) {
                this._updateUnseenInbox(root);
                this._updateUnseenFav(root);
                this._updateErrorState(root);
            }
        }
    };

    proto._updateUnseenInbox = function (root) {
        Debug.assert(Jx.isHTMLElement(root));
        var unseenInboxCount = this._unseenInboxCount();
        Jx.setClass(root, "showUnseenInbox", unseenInboxCount > 0);
        root.querySelector(".unseenCount").innerText = getDisplayCount(unseenInboxCount);
        root.querySelector(".unseenPlus").innerText = getOverflowGlyph(unseenInboxCount);
    };

    proto._updateUnseenFav = function (root) {
        Debug.assert(Jx.isHTMLElement(root));
        Jx.setClass(root, "showUnseenFav", this._hasUnseenFav());
    };

    proto._updateErrorState = function (root) {
        Debug.assert(Jx.isHTMLElement(root));
        Jx.log.error("updateAggregatedError: " + this._hasError());
        Jx.setClass(root, "showError", this._hasError());
    };

    proto._hasError = function () {
        return this._accounts.reduce(function (hasError, account) { return hasError || account.hasError; }, false);
    };

    proto._unseenInboxCount = function () {
        return this._accounts.reduce(function (count, account) { return count + account.unseenInboxCount; }, 0);
    };

    proto._hasUnseenFav = function () {
        return this._accounts.reduce(function (hasUnseen, account) { return hasUnseen || account.hasUnseenFav; }, false);
    };

});

