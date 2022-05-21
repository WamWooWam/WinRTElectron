
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "AccountNameHeader", function () {
    "use strict";

    Mail.AccountNameHeader = function (selection) {
        this.initComponent();
        this._selection = selection;
        this._element = null;
        this._disposer = null;
        this._hooks = null;
    };
    Jx.augment(Mail.AccountNameHeader, Jx.Component);

    Mail.AccountNameHeader.prototype.getUI = function (ui) {
        ui.html = "<div id='mailNavPaneHeader' role='heading'>" + Jx.escapeHtml(this._selection.account.name) + "</div>";
    };

    Mail.AccountNameHeader.prototype.activateUI = function () {
        var selection = this._selection;
        this._disposer = new Mail.Disposer(new Mail.EventHook(selection, "navChanged", this._onNavigation, this));
        this._hookAccount(selection.account);
        this._element = document.getElementById("mailNavPaneHeader");
        this._launchUpdateDialogIfNeeded();
    };

    Mail.AccountNameHeader.prototype.deactivateUI = function () {
        Jx.dispose(this._disposer);
    };

    Mail.AccountNameHeader.prototype._onAccountChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "displayName")) {
            this._element.title = this._element.innerText = this._selection.account.name;
        }
    };

    Mail.AccountNameHeader.prototype._onResourceChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "lastSyncResult") ||
            Mail.Validators.hasPropertyChanged(ev, "lastPushResult")) {
            this._launchUpdateDialogIfNeeded();
        }
    };

    Mail.AccountNameHeader.prototype._onNavigation = function (ev) {
        Debug.assert(Jx.isHTMLElement(this._element));
        if (ev.accountChanged) {
            var account = this._selection.account;
            this._hookAccount(account);
            this._element.title = this._element.innerText = account.name;
        }
    };

    Mail.AccountNameHeader.prototype._hookAccount = function (account) {
        this._hooks = this._disposer.replace(this._hooks, [new Mail.EventHook(account, "changed", this._onAccountChanged, this)]);

        // The account resource can be null if the new account is an EASI ID that is not mail connected
        var resource = account.mailResource;
        if (resource) {
            // Listen for changes in the lastSyncResult to pop the update account dialog if needed
            this._hooks.push(new Mail.EventHook(resource, "changed", this._onResourceChanged, this));
        }
    };

    Mail.AccountNameHeader.prototype._launchUpdateDialogIfNeeded = function () {
        // If this account is in a recoverable error state launch the dialog to fix it
        var account = this._selection.account,
            errorHandler = Mail.AccountSettings.createErrorHandler(account.platformObject, account.mailResource);
        errorHandler.handler(false /*explicitLaunch*/);
    };

});
