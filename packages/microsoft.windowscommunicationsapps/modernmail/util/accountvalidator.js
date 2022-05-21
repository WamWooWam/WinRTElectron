
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,WinJS,Debug,Microsoft*/

Jx.delayDefine(Mail, "AccountValidator", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    function FilterByMailEnabled() {
        this._callback = null;
        this._context = null;
        Debug.only(Object.seal(this));
    }

    FilterByMailEnabled.prototype = {
        setCallback: function (callback, context) {
            this._callback = callback;
            this._context = context;
        },
        hook: function (account) {
            Debug.assert(Jx.isInstanceOf(account, Mail.Account));
            account.addListener("changed", this._changed, this);
        },
        unhook: function (account) {
            Debug.assert(Jx.isInstanceOf(account, Mail.Account));
            account.removeListener("changed", this._changed, this);
        },
        matches: function (account) {
            Debug.assert(Jx.isInstanceOf(account, Mail.Account));
            return account.isMailEnabled();
        },
        _changed: function (ev) {
            if (Mail.Validators.hasPropertyChanged(ev, "mailScenarioState")) {
                this._callback.call(this._context, ev.target);
            }
        }
    };

    Mail.AccountValidator = /* @constructor*/function (platform) {
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client" />
        _markStart("Ctor");
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
        this._platform = platform;

        var accountManager = this._platform.accountManager;
        // caching the query for disposal as FilteredCollection does not dispose the underlying query
        _markStart("Mail_platform_firstQuery");
        this._query = new Mail.QueryCollection(
            accountManager.getConnectedAccountsByScenario,
            accountManager,
            [Plat.ApplicationScenario.mail, Plat.ConnectedFilter.normal, Plat.AccountSort.name]
        );
        _markStop("Mail_platform_firstQuery");

        this._mailEnabledAccounts = new Mail.FilteredCollection(new FilterByMailEnabled(),
            // FilteredCollection must be wrapped on top of a MappedCollection for handling reset/itemRemoved events
            new Mail.MappedCollection(this._query,
                function (platformAccount) {
                    Debug.assert(Jx.isInstanceOf(platformAccount, Plat.Account));
                    return new Mail.Account(platformAccount, this._platform);
                }, this)
            );
        this._hasValidAccount = this._mailEnabledAccounts.count > 0; 

        this._disposer = new Mail.Disposer(
            this._mailEnabledAccounts,
            new Mail.EventHook(this._mailEnabledAccounts, "collectionchanged", this._onCollectionChanged, this));
        this._mailEnabledAccounts.unlock();
        _markStop("Ctor");
    };
    Jx.augment(Mail.AccountValidator, Jx.Events);

    var proto = Mail.AccountValidator.prototype;
    Debug.Events.define(proto, "mailAccountDepleted", "mailAccountAvailable");

    Mail.AccountValidator.create = function (platform) {
        
        if (Mail.AccountValidator.isOverrideEnabled()) {
            return {
                mailAccountAvailable: true,
                dispose: Jx.fnEmpty,
                addEventListener: Jx.fnEmpty,
                removeEventListener: Jx.fnEmpty,
                isMock: true,
                waitForAccountAvailable: function () {
                    return new WinJS.Promise.wrap(new Mail.Account(platform.accountManager.defaultAccount, platform));
                }
            }
        }
        
        return new Mail.AccountValidator(platform);
    };

    proto.dispose = function () {
        _markStart("dispose");
        Jx.dispose(this._disposer);       
        this._disposer = null;
        Jx.dispose(this._query);
        this._query = null;
        this._mailEnabledAccounts = null;
        _markStop("dispose");
    };


    Object.defineProperty(proto, "mailAccountAvailable", {
        get: function () {          
            return this._mailEnabledAccounts.count > 0;
        },
        enumerable: true
    });

    proto.waitForAccountAvailable = function () {    
        if (!this.mailAccountAvailable) {
            return Mail.Promises.waitForEvent(this, "mailAccountAvailable");
        }
        return WinJS.Promise.wrap(this._mailEnabledAccounts.item(0));
    };

    proto._onCollectionChanged = function (ev) {
        var ChangeType = Plat.CollectionChangeType;

        switch (ev.eType) {
        case ChangeType.itemRemoved:
        case ChangeType.itemAdded:
        case ChangeType.reset:
            if (this._mailEnabledAccounts.count === 0 && this._hasValidAccount) {
                this._hasValidAccount = false;
                this.raiseEvent("mailAccountDepleted");
            } else if (this._mailEnabledAccounts.count > 0 && !this._hasValidAccount) {
                var newAccount = this._mailEnabledAccounts.item(0);
                Debug.assert(Jx.isInstanceOf(newAccount, Mail.Account));
                this._hasValidAccount = true;
                this.raiseEvent("mailAccountAvailable", newAccount);
            }
            break;
        case ChangeType.itemChanged:
        case ChangeType.batchBegin:
        case ChangeType.batchEnd:
            break;
        default:
            Debug.assert(false, "Unexpected change type: " + ev.eType);
            break;
        }
    };


    
    Mail.AccountValidator.OverrideState = {
        overrideEnabled: "0"
    };

    Mail.AccountValidator.isOverrideEnabled = function () {
        /// Mail's BVTs use EASI Ids. Normally, Mail would launch into the EASI-ID experience, causing most BVTs to fail.
        /// Instead of making tests run with real Hotmail IDs (it has been tried, but not very reliable), we resort to this
        /// flag that test sets. Since BVTs run in retail, we have to ship the override code.
        return Jx.appData.localSettings().get("EASI_IsEasi") === Mail.AccountValidator.OverrideState.overrideEnabled;
    };
    

    function _markStart(s) { Jx.mark("AccountValidator." + s + ",StartTA,AccountValidator"); }
    function _markStop(s) { Jx.mark("AccountValidator." + s + ",StopTA,AccountValidator"); }
});
