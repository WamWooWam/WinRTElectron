
(function () {
    /*global Mail, Microsoft,Tx,Mocks,Jx*/
    /*jshint browser:true*/

    "use strict";

    var MockData = Mocks.Microsoft.WindowsLive.Platform.Data,
        Plat = Microsoft.WindowsLive.Platform,
        provider = null,
        platform = null,
        validator = null,
        platformCollection = null,
        listener = null;

    function Listener(validator) {
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(validator, "mailAccountDepleted", this._onAccountDepleted, this));
        this.accountAvailableFired = 0;
        this.accountDepletedFired = 0;
        validator.waitForAccountAvailable().then(this._onAccountAvailable.bind(this));
    }

    Listener.prototype = {
        dispose: function () {
            Jx.dispose(this._hooks);
        },
        _onAccountAvailable: function (account) {
            this.accountAvailableFired++;
            this.defaultAccount = account;
        },
        _onAccountDepleted: function () {
            this.accountDepletedFired++;
        },
    };

    function verifyDefaultAccount(tc, objectId) {
        if (objectId) {
            tc.isTrue(validator.mailAccountAvailable);
            tc.isTrue(Jx.isInstanceOf(listener.defaultAccount, Mail.Account));
            tc.areEqual(listener.defaultAccount.objectId, objectId);
        } else {
            tc.isFalse(validator.mailAccountAvailable);
        }
    }

    function addAccount(accountId, fireReset) {
        var newAccount = provider.loadObject("Account", {
            objectId: accountId,
            mailScenarioState: Plat.ScenarioState.connected,
            isDefault: false
        });
        if (fireReset) {
            platformCollection.mock$suspendNotifications();
            platformCollection.mock$addItem(newAccount, 0);
            platformCollection.mock$resumeNotifications();
        } else {
            platformCollection.mock$addItem(newAccount, 0);
        }
        return newAccount;
    }

    function setup(tc, accountInfo, testOverride) {
        Mail.UnitTest.stubJx(tc, "appData");

        if (testOverride) {
            Jx.appData.localSettings().set("EASI_IsEasi", Mail.AccountValidator.OverrideState.overrideEnabled);
        }

        provider = new MockData.JsonProvider({
            Account: accountInfo
        }, MockData.MethodHandlers),
        platform = provider.getClient();
        validator = Mail.AccountValidator.create(platform);
        listener = new Listener(validator);
        platformCollection = validator.isMock ? null : validator._query._collection;

        tc.addCleanup(function () {
            Jx.dispose(listener);
            listener = null;
            Jx.dispose(validator);
            validator = null;
            provider = null;
            platform = null;
            validator = null;
        });
    }

    Tx.test("AccountValidator.test_accountsAvailableOnStartUp", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            connected: [{
                objectId: "account1",
                mailScenarioState: Plat.ScenarioState.connected,
                isDefault: true
            }]
        });

        verifyDefaultAccount(tc, "account1");
        // change the scenarioState of the object to disconnected, event should be fired
        var defaultAccount = validator._query.item(0);
        defaultAccount.mock$setProperty("mailScenarioState", Plat.ScenarioState.connectedButDisabled);
        verifyDefaultAccount(tc, null);

        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 1);
    });

    Tx.test("AccountValidator.test_defaultAccountBecomesAvailable", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            connected: [{
                objectId: "account1",
                mailScenarioState: Plat.ScenarioState.connectedButDisabled,
                isDefault: true
            }]
        });

        verifyDefaultAccount(tc, null);
        var defaultAccount = validator._query.item(0);
        defaultAccount.mock$setProperty("mailScenarioState", Plat.ScenarioState.connected);

        verifyDefaultAccount(tc, "account1");

        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);
    });

    Tx.test("AccountValidator.test_accountAdded", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            connected: [{
                objectId: "account1",
                mailScenarioState: Plat.ScenarioState.connectedButDisabled,
                isDefault: true
            }]
        });

        verifyDefaultAccount(tc, null);

        // Add the account
        addAccount("account2");
        verifyDefaultAccount(tc, "account2");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);

        // Another account is added, verify no-op
        addAccount("account3");
        verifyDefaultAccount(tc, "account2");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);

    });

    Tx.test("AccountValidator.test_reset", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            connected: [{
                objectId: "account1",
                mailScenarioState: Plat.ScenarioState.connectedButDisabled,
                isDefault: true
            }]
        });

        verifyDefaultAccount(tc, null);

        // neww account 2 is added
        addAccount("account2", true /*fireReset*/);
        verifyDefaultAccount(tc, "account2");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);

        // account 1 is enabled, verify no-op
        platformCollection.mock$suspendNotifications();
        var account1 = validator._query.item(0);
        account1.mock$setProperty("mailScenarioState", Plat.ScenarioState.connected);
        platformCollection.mock$resumeNotifications();

        verifyDefaultAccount(tc, "account2");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);


        // all accounts are removed
        platformCollection.mock$suspendNotifications();
        platformCollection.mock$removeItem(0);
        platformCollection.mock$removeItem(0);
        platformCollection.mock$resumeNotifications();

        verifyDefaultAccount(tc, null);
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 1);
    });

    Tx.test("AccountValidator.test_accountRemoved", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            connected: [{
                objectId: "account1",
                mailScenarioState: Plat.ScenarioState.connected,
                isDefault: true
            }, {
                objectId: "account2",
                mailScenarioState: Plat.ScenarioState.connected,
                isDefault: true
            }]
        });

        verifyDefaultAccount(tc, "account1");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);

        // remove account 1
        platformCollection.mock$removeItem(0);
        verifyDefaultAccount(tc, "account1"); // initial account won't change even it is removed
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);


        // remove account 2
        platformCollection.mock$removeItem(0);
        verifyDefaultAccount(tc, null);
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 1);
    });

    Tx.test("AccountValidator.test_override", { owner: "kepoon", priority: 0 }, function (tc) {
        setup(tc, {
            default: [{
                objectId: "defaultAccount"
            }],
            connected: []
        }, true /*testOverride*/);

        verifyDefaultAccount(tc, "defaultAccount");
        tc.areEqual(listener.accountAvailableFired, 1);
        tc.areEqual(listener.accountDepletedFired, 0);
    });
})();
