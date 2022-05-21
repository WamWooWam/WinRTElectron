
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "FolderNameHeader", function () {
    "use strict";

    Mail.FolderNameHeader = function (selection) {
        Debug.assert(Jx.isObject(selection));
        Mail.log("FolderNameRenderer_ctor", Mail.LogEvent.start);
        var account = selection.account.platformObject;

        this._hooks = new Mail.Disposer(
            new Mail.EventHook(selection.view, "changed", this._onViewChanged, this),
            new Mail.EventHook(account, "changed", this._onAccountChanged, this)
        );

        this._updateView(selection.view);
        this._updateAccount(account);

        Mail.log("FolderNameRenderer_ctor", Mail.LogEvent.stop);
        Debug.only(Object.seal(this));
    };
    var prototype = Mail.FolderNameHeader.prototype;

    prototype.dispose = function () {
        this._hooks.dispose();
    };

    function updateName(id, name) {
        var element = document.getElementById(id);
        element.title = element.innerText = name;
    }

    prototype._updateView = function (view) {
        updateName("mailMessageListFolderName", view.name);
    };

    prototype._updateAccount = function (account) {
        updateName("mailMessageListAccountName", account.displayName);
    };

    prototype._onViewChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "name")) {
            this._updateView(ev.target);
        }
    };

    prototype._onAccountChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "displayName")) {
            this._updateAccount(ev.target);
        }
    };
});
