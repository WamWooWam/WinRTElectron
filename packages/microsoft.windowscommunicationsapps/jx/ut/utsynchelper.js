
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../core/SyncHelper.js" />

/*global Tx,Jx*/

(function () {

    var platformNamespace = {
        ApplicationScenario: {
            calendar: 1,
            chat: 2,
            mail: 3,
            people: 4
        },
        ResourceType: {
            calendar: 1,
            contacts: 2,
            mail: 3
        },
        ConnectedFilter: {
            normal: 1
        },
        AccountSort: {
            name: 1
        },
        SyncType: {
            manual: 1,
            push: 2,
            poll: 3
        }
    };

    function makeMockResource() {
        return {
            canEdit : true,
            isSyncNeeded : false,
            _isCommitted : false,
            commit: function () {
                this._isCommitted = true;
            }
        };
    }

    function makeMockAccount() {
        return {
            syncType : platformNamespace.SyncType.push,
            _isCommitted: false,
            _mockResource: null,
            getResourceByType: function (/*accountResourceType*/) {
                this._mockResource = makeMockResource();
                return this._mockResource;
            },
            commit: function () {
                this._isCommitted = true;
            }
        };
    }

    function makeMockAccountCollection (tc, count) {
        var array = [];
        for (var ii = 0; ii < count; ii++) {
            array.push(makeMockAccount());
        }
        return {
            _accounts : array,
            _isDisposed : false,
            count : count,
            item: function (index) {
                tc.isTrue(index >= 0);
                tc.isTrue(index < this.count);
                return this._accounts[index];
            },
            dispose: function () {
                this._isDisposed = true;
            }
        };
    }

    function makeMockClient (tc) {
        return {
            accountManager : {
                _mockAccountCollection: makeMockAccountCollection(tc, 4),
                getConnectedAccountsByScenario: function () {
                    return this._mockAccountCollection;
                }
            }
        };
    }

    function verifyAccounts (tc, mockClient) {
        var accountCollection = mockClient.accountManager._mockAccountCollection;

        // Verify IsSyncNeeded
        for (var ii = 0; ii < accountCollection.count; ii++) {
            var account = accountCollection.item(ii),
                resource = account._mockResource;

            tc.isTrue(resource.isSyncNeeded);
            tc.isTrue(resource._isCommitted);
            tc.isTrue(account._isCommitted);
        }

        // Verify cleanup
        tc.isTrue(accountCollection._isDisposed);
    }

    Tx.test("SyncHelperTests.testSyncScenarios", function (tc) {
        var origPlatformNamespace = Jx._platformNamespace;
        Jx._platformNamespace = platformNamespace;

        // Calendar scenario
        var calendarClient = makeMockClient(tc);
        Jx.forceSync(calendarClient, platformNamespace.ApplicationScenario.calendar);
        verifyAccounts(tc, calendarClient);

        // Mail scenario
        var mailClient = makeMockClient(tc);
        Jx.startupSync(mailClient, platformNamespace.ApplicationScenario.mail);
        verifyAccounts(tc, mailClient);

        // People scenario
        var peopleClient = makeMockClient(tc);
        Jx.forceSync(peopleClient, platformNamespace.ApplicationScenario.people);
        verifyAccounts(tc, peopleClient);

        Jx._platformNamespace = origPlatformNamespace;
    });

})();