
/// <reference path="../../../shared/Jx/core/Jx.js"/>
/// <reference path="../../../shared/Jx/core/Events.js"/>
/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/Namespace.js"/>
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />

Jx.delayDefine(People.Accounts, "AccountSynchronization", function () {
    
    var A = People.Accounts;

    A.AccountSynchronization = /*@constructor*/function (platform) {
        /// <summary>Some pieces of UI (the upsell and that what's new section) aren't shown until the set of 
        /// connected accounts is synchronized, to avoid showing up in the wrong state or with misleading offers.
        /// This code encapsulates that check.</summary>
        /// <param name="platform" type="Microsoft.WindowsLive.Platform.Client"/>
        this._settings = Jx.appData.localSettings().container("People");
        this._callback = /*@static_cast(Function)*/null;
        this._context = null;

        this._ready = this._settings.get("AccountSyncComplete"); // First do a check against settings, to avoid a platform call in the common case.
        if (!this._ready) {
            // On first run, we'll have to check.
            var resource = platform.accountManager.defaultAccount.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.accounts);
            if (resource.isInitialSyncFinished) {
                this._ready = true;
                this._settings.set("AccountSyncComplete", true);
            } else {
                this._ready = false;
                this._listener = this._onResourceChange.bind(this);
                resource.addEventListener("changed", this._listener);
                this._resource = resource;
            }
        }
    };
    Jx.augment(A.AccountSynchronization, Jx.Events);
    Debug.Events.define(A.AccountSynchronization.prototype, "accountsAvailable");

    A.AccountSynchronization.prototype.areAccountsAvailable = function (callback, context) {
        /// <summary>Returns if account sync is finished. If not ready, hook up the callback with account sync complete event.</summary>
        /// <param name="callback" type="Function" optional="true"/>
        /// <param name="context" type="dynamic" optional="true"/>
        if (!this._ready && callback) {
            this._callback = callback;
            this._context = context ? context : null;
        }
        return this._ready;
    };

    A.AccountSynchronization.prototype.dispose = function () {
        this._unhook();

        this._callback = null;
        this._context = null;
        Jx.dispose(this._settings);
    };

    A.AccountSynchronization.prototype._onResourceChange = function (ev) {
        /// <summary>Listen for the list of accounts to sync</summary>
        if (Array.prototype.indexOf.call(ev, "isInitialSyncFinished") !== -1 && this._resource.isInitialSyncFinished) {
            this._settings.set("AccountSyncComplete", true);
            this._ready = true;
            if (this._callback) {
                this._callback.call(this._context);
                this._callback = null;
                this._context = null;
            }

            this.raiseEvent("accountsAvailable");
            this._unhook();
        }
    };

    A.AccountSynchronization.prototype._unhook = function () {
        if (this._listener) {
            this._resource.removeEventListener("changed", this._listener);
            this._listener = null;
        }
        this._resource = null;
    };

});
