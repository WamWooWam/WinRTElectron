
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "SyncListener", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        CollectionChangeType = Plat.CollectionChangeType;

    function ResourceWrapper(resource, callback, context) {
        Debug.assert(Jx.isInstanceOf(resource, Plat.AccountMailResource));
        Debug.assert(Jx.isFunction(callback));
        this._resource = resource;
        this._hook = new Mail.EventHook(resource, "changed", callback, context);
    }
    ResourceWrapper.prototype = {
        dispose: function () {
            Debug.assert(this._hook);
            this._hook.dispose();
            this._hook = null;
        },
        isSyncing: function () {
            var resource = this._resource;
            return (resource.isSynchronizing || resource.isSyncNeeded || !resource.isInitialSyncFinished);
        }
    };

    var Listener = Mail.Worker.SyncListener = function (platform) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        this._platform = platform;
        this._isSyncing = false;
        this._resources = {};
        this._disposer = new Mail.Disposer();
        this._accounts = null;

        this.initEvents();
        Debug.only(Object.seal(this));

        this._init();
        _markStop("ctor");
    };
    Jx.augment(Listener, Jx.Events);
    var prototype = Listener.prototype;
    Debug.Events.define(prototype, "syncStatusChanged");

    prototype.dispose = function () {
        _markStart("dispose");
        this._disposer.dispose();
        _markStop("dispose");
    };
    prototype.isSyncing = function () {
        return this._isSyncing;
    };
    prototype._init = function () {
        _markStart("_init");
        Debug.assert(this._accounts === null);
        Debug.assert(Object.keys(this._resources).length === 0);
        var accounts = this._accounts = this._disposer.add(
            this._platform.accountManager.getConnectedAccountsByScenario(
                Plat.ApplicationScenario.mail,
                Plat.ConnectedFilter.normal,
                Plat.AccountSort.name
            )
        );
        Mail.Collection.forEach(accounts, this._addResource, this);
        this._disposer.add(new Mail.EventHook(accounts, "collectionchanged", this._accountsChanged, this));
        accounts.unlock();
        _markStop("_init");
    };
    prototype._accountsChanged = function (evt) {
        var details = evt.detail[0];
        switch(details.eType) {
            case CollectionChangeType.itemAdded:
                this._addResource(this._accounts.item(details.index));
                break;
            case CollectionChangeType.itemRemoved:
                this._removeResourceById(details.objectId);
                break;
            case CollectionChangeType.reset:
                _markStart("_accountsChanged-reset");
                for (var accountId in this._resources) {
                    this._removeResourceById(accountId);
                }
                Debug.assert(Object.keys(this._resources).length === 0);
                Mail.Collection.forEach(this._accounts, this._addResource, this);
                _markStop("_accountsChanged-reset");
                break;
            default:
                Debug.assert(details.eType === CollectionChangeType.itemChanged);
                break;
        }
    };
    prototype._addResource = function (account) {
        Debug.assert(Jx.isInstanceOf(account, Plat.Account));
        Debug.assert(Jx.isUndefined(this._resources[account.objectId]));
        var accountResource = account.getResourceByType(Plat.ResourceType.mail);
        if (accountResource) {
            this._resources[account.objectId] = this._disposer.add(new ResourceWrapper(accountResource, this._resourceChanged, this));
            this._recalculateSyncing();
        }
    };
    prototype._removeResourceById = function (accountId) {
        var logString = "_removeResourceById:" + accountId;
        _markStart(logString);
        Debug.assert(Jx.isNonEmptyString(accountId));

        var resources = this._resources;
        this._disposer.disposeNow(resources[accountId]);
        delete resources[accountId];
        this._recalculateSyncing();
        _markStop(logString);
    };
    prototype._resourceChanged = function () {
        this._recalculateSyncing();
    };
    prototype._recalculateSyncing = function () {
        var isSyncing = Object.keys(this._resources).some(function (id) { return this._resources[id].isSyncing(); }, this);
        if (isSyncing !== this._isSyncing) {
            this._isSyncing = isSyncing;
            _mark("_isSyncing=" + isSyncing);
            this.raiseEvent("syncStatusChanged", {isSyncing: isSyncing});
        }
    };

    function _mark(s) { Jx.mark("SyncListener." + s); }
    function _markStart(s) { Jx.mark("SyncListener." + s + ",StartTA,SyncListener"); }
    function _markStop(s) { Jx.mark("SyncListener." + s + ",StopTA,SyncListener"); }
    //function _markAsyncStart(s) { Jx.mark("SyncListener:" + s + ",StartTM,SyncListener"); }
    //function _markAsyncStop(s) { Jx.mark("SyncListener:" + s + ",StopTM,SyncListener"); }

});
