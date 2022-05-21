
//
// Copyright (C) Microsoft. All rights reserved.
//

/*global Jx,Chat,Debug,Microsoft*/

Jx.delayDefine(Chat, "ProxyAuthenticator", function () {
    "use strict";

    var plat = Microsoft.WindowsLive.Platform;

    Chat.ProxyAuthenticator = /*constructor*/function () {};

    var proto = Chat.ProxyAuthenticator.prototype;

    proto._platform = null;
    proto._accounts = null;
    proto._accountMap = {};
    proto._appScenario = null;

    proto.init = function (platform, appScenario) {
        Debug.assert(platform);
        Debug.assert(!Jx.isNullOrUndefined(appScenario));

        this._platform = platform;
        this._appScenario = appScenario;

        this._accountChanged = this._accountChanged.bind(this);
        this._collectionChanged = this._collectionChanged.bind(this);

        // Get all of the relevant accounts
        this._accounts = platform.accountManager.getConnectedAccountsByScenario(this._appScenario, plat.ConnectedFilter.normal, plat.AccountSort.name);
        if (!Jx.isNullOrUndefined(this._accounts)) {
            this._accounts.addEventListener("collectionchanged", this._collectionChanged);
            for (var i = 0; i < this._accounts.count; i++) {
                // On each account add a "changed" listener
                var account = this._accounts.item(i);
                this._accountMap[account.objectId] = account;
                account.addEventListener("changed", this._accountChanged);
                this._checkErrorState(account);
            }
            this._accounts.unlock();
        }
    };

    proto.shutdown = function () {
        // Remove all the listeners we added
        for (var key in this._accountMap) {
            var account = this._accountMap[key];
            account.removeEventListener("changed", this._accountChanged);
        }

        if (this._accounts) {
            this._accounts.removeEventListener("collectionchanged", this._collectionChanged);
            this._accounts.dispose();
        }
    };

    proto._collectionChanged = function (ev) {
        var args = ev.detail[0];
        var type = plat.CollectionChangeType;
        var account = null;
        if (args.eType === type.itemAdded) {
            account = this._accounts.item(args.index);
            this._accountMap[account.objectId] = account;
            account.addEventListener("changed", this._accountChanged);
            this._checkErrorState(account);
        } else if (args.eType === type.itemRemoved) {
            account = this._accountMap[args.objectId];
            if (!Jx.isNullOrUndefined(account)) {
                this._checkErrorState(account);
                account.removeEventListener("changed", this._accountChanged);
                delete this._accountMap[account.objectId];
            }
        }
    };

    proto._accountChanged = function (ev) {
        this._checkErrorState(ev.target);
    };

     proto._checkErrorState = function (account) {
        if (!Jx.isNullOrUndefined(account)) {
            var lastAuthResult = account.lastAuthResult;
            if (lastAuthResult === plat.Result.e_HTTP_PROXY_AUTH_REQ) {
                this._authenticateProxy(account);
            }
        }
    };

    proto._authenticateProxy = function (account) {
        // This method sends an XHR request to the server which will have the side effect of prompting
        // the user for proxy credentials. Upon successful return, a sync is kicked off.
        Debug.assert(!Jx.isNullOrUndefined(account));

        try {
            Jx.log.info("Sending canary request to trigger proxy authentication dialog.");
            var server = account.getServerByType(Microsoft.WindowsLive.Platform.ServerType.eas);

            if (Jx.isNullOrUndefined(server)) {
                // If there isn't an EAS server, ignore this. There will always be at least one EAS
                // account to send the canary on.
                return;
            }

            var url = "http://" + server.server;
            var request = new XMLHttpRequest();

            request.open("OPTIONS", url);

            var listener = function () {
                // Attempt to sync on response status code that is not 407, as that means the user probably authenticated.
                if (request.status !== 407) {
                    Jx.log.info("Proxy canary returned successfully, kicking off sync.");

                    if (this._platform) {
                        Jx.forceSync(this._platform, Microsoft.WindowsLive.Platform.ApplicationScenario.mail);
                    }
                } else {
                    Jx.log.error("Status Error " + request.status.toString() + ": " + request.responseText);
                }

                request.removeEventListener("load", listener);
            }.bind(this);

            request.addEventListener("load", listener);

            request.send();
        } catch (e) {
            Jx.log.exception("_authenticateProxy exception", e);
        }
    };

});
