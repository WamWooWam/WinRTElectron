Jx.delayDefine(Mail, "AccountValidator", function() {
    "use strict";

    function u() {
        this._callback = null;
        this._context = null
    }

    function i(n) {
        Jx.mark("AccountValidator." + n + ",StartTA,AccountValidator")
    }

    function r(n) {
        Jx.mark("AccountValidator." + n + ",StopTA,AccountValidator")
    }
    var n = Microsoft.WindowsLive.Platform,
        t;
    u.prototype = {
        setCallback: function(n, t) {
            this._callback = n;
            this._context = t
        },
        hook: function(n) {
            n.addListener("changed", this._changed, this)
        },
        unhook: function(n) {
            n.removeListener("changed", this._changed, this)
        },
        matches: function(n) {
            return n.isMailEnabled()
        },
        _changed: function(n) {
            Mail.Validators.hasPropertyChanged(n, "mailScenarioState") && this._callback.call(this._context, n.target)
        }
    };
    Mail.AccountValidator = function(t) {
        i("Ctor");
        this._platform = t;
        var f = this._platform.accountManager;
        i("Mail_platform_firstQuery");
        this._query = new Mail.QueryCollection(f.getConnectedAccountsByScenario, f, [n.ApplicationScenario.mail, n.ConnectedFilter.normal, n.AccountSort.name]);
        r("Mail_platform_firstQuery");
        this._mailEnabledAccounts = new Mail.FilteredCollection(new u, new Mail.MappedCollection(this._query, function(t) {
            return new Mail.Account(t, this._platform)
        }, this));
        this._hasValidAccount = this._mailEnabledAccounts.count > 0;
        this._disposer = new Mail.Disposer(this._mailEnabledAccounts, new Mail.EventHook(this._mailEnabledAccounts, "collectionchanged", this._onCollectionChanged, this));
        this._mailEnabledAccounts.unlock();
        r("Ctor")
    };
    Jx.augment(Mail.AccountValidator, Jx.Events);
    t = Mail.AccountValidator.prototype;
    Mail.AccountValidator.create = function(n) {
        return new Mail.AccountValidator(n)
    };
    t.dispose = function() {
        i("dispose");
        Jx.dispose(this._disposer);
        this._disposer = null;
        Jx.dispose(this._query);
        this._query = null;
        this._mailEnabledAccounts = null;
        r("dispose")
    };
    Object.defineProperty(t, "mailAccountAvailable", {
        get: function() {
            return this._mailEnabledAccounts.count > 0
        },
        enumerable: true
    });
    t.waitForAccountAvailable = function() {
        return this.mailAccountAvailable ? WinJS.Promise.wrap(this._mailEnabledAccounts.item(0)) : Mail.Promises.waitForEvent(this, "mailAccountAvailable")
    };
    t._onCollectionChanged = function(t) {
        var i = n.CollectionChangeType,
            r;
        switch (t.eType) {
            case i.itemRemoved:
            case i.itemAdded:
            case i.reset:
                this._mailEnabledAccounts.count === 0 && this._hasValidAccount ? (this._hasValidAccount = false,
                    this.raiseEvent("mailAccountDepleted")) : this._mailEnabledAccounts.count > 0 && !this._hasValidAccount && (r = this._mailEnabledAccounts.item(0),
                    this._hasValidAccount = true,
                    this.raiseEvent("mailAccountAvailable", r))
        }
    }
})