
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function() {

    var U = Mail.UnitTest,
        P = Microsoft.WindowsLive.Platform,
        MP = Mocks.Microsoft.WindowsLive.Platform,
        D = MP.Data;


    function setup (tc) {
        tc.cleanup = function () {
            Jx.scheduler.testFlush();
            if (tc.preserve) {
                tc.preserve.restore();
            }
            Mail.Globals = {};
        };
        tc.preserve = null;

        // force NoShip.MailSearch to load
        Mail.SearchCollection;

        // Mocking
        var mockMailSearch = Jm.mock(NoShip.MailSearch);
        var provider = new D.JsonProvider({
            Account: {
                all: [ { objectId: "account" } ]
            }
        });

        Mail.Globals = { platform: provider.getClient() };

        // preserving
        tc.preserve = Jm.preserve(Mail, "SearchSettings");
        tc.preserve.preserve(NoShip, "MailSearch");
        tc.preserve.preserve(Mail.Globals);

        // Stubbing
        NoShip.MailSearch = mockMailSearch;
    }

    Tx.test("SearchCollection_UnitTest.test_events", function (tc) {
        setup(tc);

        var calls = new U.CallVerifier(tc),
            pageSize = Mail.SearchCollection.pageSize,
            scope = { };

        calls.initialize(scope, ["search"]);

        var platformCollection = new MP.Collection("MailMessage", { clone: function (item) { return item; } });
        platformCollection.mockedType = P.SearchCollection;
        calls.initialize(platformCollection, ["unlock", "fetchMoreItems"]);

        // Create the search collection
        calls.expectOnce(scope, "search", ["query", "locale", pageSize], function () { return platformCollection; });

        var account = {
                accountType: Microsoft.WindowsLive.Platform.AccountType.imap,
                mockedType: Mail.Account
            },
            search = new Mail.SearchCollection(scope, account, "query", "locale"),
            listener = calls.hookEvents(search, ["beginChanges", "itemAdded", "itemRemoved", "reset", "endChanges", "localSearchComplete"]);
        calls.verify();

        // Execute the query
        calls.expectOnce(platformCollection, "unlock");
        search.execute();
        calls.verify();

        // Complete the search, should result in items being fetched
        calls.expectOnce(listener, "localSearchComplete", [{ totalCount: pageSize+1 }]);
        calls.expectOnce(platformCollection, "fetchMoreItems", [pageSize]);
        platformCollection.mock$initVirtualized(Array(pageSize + 1));
        U.ensureSynchronous(function () {
            platformCollection.mock$searchComplete(Jx.fnEmpty);
        });
        calls.verify();

        // Should have a total but no actual items should be realized
        tc.areEqual(search.totalCount, pageSize + 1);
        tc.areEqual(search.count, 0);

        // Realize the first pageSize items, events shouldn't be raised until the batchEnd
        U.ensureSynchronous(function () {
            calls.expectOnce(listener, "beginChanges");
            platformCollection.mock$batchBegin();
            calls.expectMany(pageSize, listener, "itemAdded");
            for (var i = 0; i < pageSize; i++) {
                platformCollection.mock$addItem({objectId: String(i), accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage}, i);
            }
        });
        calls.verify();
        calls.expectOnce(listener, "endChanges");
        // All the events should raised and the collection should continue fetching items
        calls.expectOnce(platformCollection, "fetchMoreItems", [pageSize]);
        U.ensureSynchronous(function () {
            platformCollection.mock$batchEnd();
        });
        calls.verify();

        // Validate the items in the search collection
        tc.areEqual(search.count, pageSize);
        for (i = 0; i < pageSize; i++) {
            tc.areEqual(search.item(i).objectId, String(i));
        }

        // Realize the last item
        U.ensureSynchronous(function () {
            calls.expectOnce(listener, "beginChanges");
            platformCollection.mock$batchBegin();
            calls.expectOnce(listener, "itemAdded", [{ objectId: String(pageSize), index: pageSize }]);
            platformCollection.mock$addItem({ objectId: String(pageSize), accountId: "account", mockedType: Microsoft.WindowsLive.Platform.MailMessage }, pageSize);
        });
        calls.verify();

        // Again, events should be fired at the end.
        calls.expectOnce(listener, "endChanges");
        U.ensureSynchronous(function () {
            platformCollection.mock$batchEnd();
        });
        calls.verify();
        tc.areEqual(search.count, pageSize+1);
        tc.areEqual(search.item(pageSize).objectId, String(pageSize));
    });

})();
