
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Microsoft, Tx, Chat */
/*jshint browser:true*/

(function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform;

    function setup(tc) {
        Mail.UnitTest.stubJx(tc, "activation");

        var oldGetString = Jx.res.getString;
        Jx.res.getString = function (id) { return id; };
        var oldLoadCompoundString = Jx.res.loadCompoundString;
        Jx.res.loadCompoundString = function () { return Array.prototype.join.call(arguments, " "); };

        tc.addCleanup(function () {
            Jx.res.getString = oldGetString;
            Jx.res.loadCompoundString = oldLoadCompoundString;
        });

        var resource = {
            lastPushResult: 0,
            lastSyncTime: null
        };
        var account = {
            objectId: "account-objectId",
            mailResource: resource,
            emailAddress: "emailAddress",
            syncType: Platform.SyncType.push,
            mockedType: Mail.Account
        };
        var messageBar = {
            _shown: false,
            addStatusMessage: function (id, pri, options) {
                tc.isTrue(id === "AccountSyncStatus");
                tc.isTrue(pri === Chat.MessageBar.Priority.superLow);
                tc.isTrue(Jx.isObject(options));
                tc.isTrue(options.messageText === options.tooltip);
                tc.isTrue(options.cssClass === "mailMessageBar");
                tc.isFalse(this._shown);

                this._id = id;
                this._pri = pri;
                this._options = options;
                this._shown = true;
            },
            removeMessage: function (id) {
                tc.isTrue(id === "AccountSyncStatus");
                tc.isTrue(this._shown);
                this._shown = false;
            },
            mockedType: Chat.MessageBar
        };
        var selection = {
            addEventListener: function (eventName) {
                tc.isTrue(eventName === "navChanged");
            },
            removeEventListener: function (eventName) {
                tc.isTrue(eventName === "navChanged");
            },
            account: account,
            mockedType: Mail.Selection
        };
        var platform = {
            accountManager : {
                getConnectedAccountsByScenario: function () { return null; }
            },
            mockedType: Platform.Client
        };

        return {
            resource: resource,
            account: account,
            messageBar: messageBar,
            selection: selection,
            platform: platform
        };
    }

    Tx.test("AccountSyncStatus._getStringForAccount", function (tc) {
        var mocks = setup(tc);
        var syncStatus;
        Mail.UnitTest.ensureSynchronous(function () {
            syncStatus = new Mail.AccountSyncStatus(mocks.messageBar, mocks.selection, mocks.platform);
        });
        var template = {
                pushResult: Platform.Result.success,
                syncTime: 0,
                accountCount: 1,
                now: 1,
                syncType: Platform.SyncType.push
            };
        var errorCode = Platform.Result.invalidAuthenticationTarget;    // arbitrary error code

        var tests = [
            { expected: "mailSyncUpToDate" },                       // 1 sec ago
            { expected: "mailSyncUpToDate", now: 31 },              // 31 sec ago
            { expected: "mailSyncUpToDate", now: 90 },              // 1.5 min ago (rounded to 2)
            { expected: "mailSyncUpToDate", now: 60*60 },           // 1 hour ago
            { expected: "mailSyncUpToDate", now: 60*60*2.5 },       // 2.5 hours ago (rounded to 3)
            { expected: "mailSyncUpToDate", now: 60*60*24 },        // 1 day ago
            { expected: "mailSyncUpToDate", now: 60*60*24*3.5 },    // 3.5 days ago (rounded to 4)
            { expected: "mailSyncUpToDate", now: 60*60*24*400 },    // 400 days ago
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 31},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 90},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 60*60},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 60*60*2.5},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 60*60*24},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 60*60*24*3.5},
            { expected: "mailSyncUpToDate_withEmail emailAddress", accountCount: 3, now: 60*60*24*400},
            { expected: "mailSyncLastUpdated mailSyncInterval_seconds", pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_minute", now: 31, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_minutes 2", now: 90, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_hour", now: 60*60, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_hours 3", now: 60*60*2.5, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_day", now: 60*60*24, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_days 4", now: 60*60*24*3.5, pushResult: errorCode},
            { expected: null, now: 60*60*24*400, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_seconds", accountCount: 3, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minute", accountCount: 3, now: 31, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minutes 2", accountCount: 3, now: 90, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hour", accountCount: 3, now: 60*60, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hours 3", accountCount: 3, now: 60*60*2.5, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_day", accountCount: 3, now: 60*60*24, pushResult: errorCode},
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_days 4", accountCount: 3, now: 60*60*24*3.5, pushResult: errorCode},
            { expected: null, accountCount: 3, now: 60*60*24*400, pushResult: errorCode},
            { expected: "mailSyncLastUpdated mailSyncInterval_seconds", syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_minute", now: 31, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_minutes 2", now: 90, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_hour", now: 60*60, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_hours 3", now: 60*60*2.5, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_day", now: 60*60*24, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_days 4", now: 60*60*24*3.5, syncType: Platform.SyncType.poll },
            { expected: null, now: 60*60*24*400, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_seconds", accountCount: 3, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minute", accountCount: 3, now: 31, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minutes 2", accountCount: 3, now: 90, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hour", accountCount: 3, now: 60*60, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hours 3", accountCount: 3, now: 60*60*2.5, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_day", accountCount: 3, now: 60*60*24, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_days 4", accountCount: 3, now: 60*60*24*3.5, syncType: Platform.SyncType.poll },
            { expected: null, accountCount: 3, now: 60*60*24*400, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_seconds", pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_minute", now: 31, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_minutes 2", now: 90, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_hour", now: 60*60, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_hours 3", now: 60*60*2.5, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_day", now: 60*60*24, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated mailSyncInterval_days 4", now: 60*60*24*3.5, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: null, now: 60*60*24*400, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_seconds", accountCount: 3, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minute", accountCount: 3, now: 31, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_minutes 2", accountCount: 3, now: 90, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hour", accountCount: 3, now: 60*60, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_hours 3", accountCount: 3, now: 60*60*2.5, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_day", accountCount: 3, now: 60*60*24, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: "mailSyncLastUpdated_withEmail emailAddress mailSyncInterval_days 4", accountCount: 3, now: 60*60*24*3.5, pushResult: errorCode, syncType: Platform.SyncType.poll },
            { expected: null, accountCount: 3, now: 60*60*24*400, pushResult: errorCode, syncType: Platform.SyncType.poll }
        ];
        tests.forEach(function (test) {
            var pushResult = test.pushResult || template.pushResult;
            var syncTime = test.syncTime || template.syncTime;
            var accountCount = test.accountCount || template.accountCount;
            var now = test.now || template.now;
            var syncType = test.syncType || template.syncType;

            mocks.resource.lastPushResult = pushResult;
            mocks.resource.lastSyncTime = syncTime;
            mocks.account.syncType = syncType;
            syncStatus._accounts = { count: accountCount };
            Mail.AccountSyncStatus._getNow = function () { return now * 1000; };
            tc.areEqual(test.expected, syncStatus._getStringForAccount(mocks.account));

        });
    });

    Tx.test("AccountSyncStatus._showMessage", function (tc) {
        var mocks = setup(tc);
        var now = 123456;
        Mail.AccountSyncStatus._getNow = function () { return now * 1000; };

        // Verify we haven't already shown anything yet
        tc.isFalse(mocks.messageBar._shown);
        tc.isTrue(Jx.isNullOrUndefined(mocks.messageBar._id));
        var syncStatus;
        Mail.UnitTest.ensureSynchronous(function () {
            syncStatus = new Mail.AccountSyncStatus(mocks.messageBar, mocks.selection, mocks.platform);
        });
        // Verify we set an initial string at startup and then removed it
        tc.isTrue(mocks.messageBar._id === "AccountSyncStatus");
        tc.isFalse(mocks.messageBar._shown);

        mocks.messageBar._id = null;
        now += 1;
        Mail.UnitTest.ensureSynchronous(function () {
            syncStatus._showMessage();
        });
        // Verify that we do NOT display a new message when only 1 second has passed
        tc.isTrue(mocks.messageBar._id === null);
        tc.isFalse(mocks.messageBar._shown);

        now += 60;
        Mail.UnitTest.ensureSynchronous(function () {
            syncStatus._showMessage();
        });
        // Verify that we DO display a new message when 60 seconds have passed
        tc.isTrue(mocks.messageBar._id === "AccountSyncStatus");
        tc.isFalse(mocks.messageBar._shown);    // But it still should be dismissed by now

    });

})();

