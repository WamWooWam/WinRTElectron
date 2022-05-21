
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    var U = Mail.UnitTest;

    function setup (tc) {
        tc.cleanup = function () {
            Jx.scheduler.testFlush();
            tc.searchCollection = null;
            tc.fetcher = null;
            if (tc.preserve) {
                tc.preserve.restore();
            }
        };

        tc.searchCollection = null;
        tc.fetcher = null;
        tc.preserve = null;

        // create the searchCollection
        var mockMailSearch = Jm.mock(NoShip.MailSearch);

        // preserving
        tc.preserve = Jm.preserve(NoShip, "MailSearch");
        NoShip.MailSearch = mockMailSearch;

        var MockSearchCollection = {
            beginServerSearch : function () {},
            fetchMoreItems : function () {},
            count : 0,
            totalCount : 0
        };
        tc.searchCollection = Jm.mock(MockSearchCollection);
        tc.searchCollection.mockedType = Microsoft.WindowsLive.Platform.SearchCollection;
        tc.fetcher = new Mail.ServerSearchResultsFetcher(tc.searchCollection, Jx.scheduler);
    }

    // Conditions:
    // Local Search returns no result.  Server side results no result
    //
    // Expected:
    // Verify that we fetch for one more page upon localSearchComplete
    Tx.test("SearchResultsFetchers_UnitTest.test_localSearchNoResults", function (tc) {
        setup(tc);

        Jm.when(tc.searchCollection).count.thenReturn(0);
        Jm.when(tc.searchCollection).totalCount.thenReturn(0);

        U.ensureSynchronous(function () {
            tc.fetcher.localSearchComplete();
        }.bind(this));

        tc.isFalse(tc.fetcher._isFirstServerBatchFetched, "the first server batch should not be fetched");
        var inOrder = Jm.inOrder();
        inOrder.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);
        inOrder.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);
    });


    // Conditions:
    // Local Search returns 2 pages.  Server side no result
    //
    // Expected:
    // Verify that we fetch for one more page upon localSearchComplete
    Tx.test("SearchResultsFetchers_UnitTest.test_serverNoResults", function (tc) {
        setup(tc);

        Jm.when(tc.searchCollection).count.thenReturn(0);
        Jm.when(tc.searchCollection).totalCount.thenReturn(20);

        U.ensureSynchronous(function () {
            tc.fetcher.localSearchComplete();
        }.bind(this));

        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);
        Jm.when(tc.searchCollection).count.thenReturn(10);

        // fetching local page 1
        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
        }.bind(this));
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        // fetching local page 2
        Jm.when(tc.searchCollection).count.thenReturn(20);
        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
        }.bind(this));

        // should keep on fetching because server count may not be ready
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        U.ensureSynchronous(function () {
            tc.fetcher.serverSearchComplete();
        }.bind(this));
        // Ensure everything is completed at this point
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);
    });

    // Conditions:
    // Local Search returns 1 page.  Server side has 1 more page
    //
    // Expected:
    // After we have fetched all local pages, we will stop and only fetch more pages as needed
    Tx.test("SearchResultsFetchers_UnitTest.test_localServerSearch", function (tc) {
        setup(tc);

        Jm.when(tc.searchCollection).count.thenReturn(0);
        Jm.when(tc.searchCollection).totalCount.thenReturn(10);

        U.ensureSynchronous(function () {
            tc.fetcher.localSearchComplete();
        }.bind(this));
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        // fetching local page 1
        Jm.when(tc.searchCollection).count.thenReturn(10);
        Jm.when(tc.searchCollection).totalCount.thenReturn(30); // server has 2 more page

        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
        }.bind(this));

        // fetching server page 1 automatically
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);
        Jm.when(tc.searchCollection).count.thenReturn(20);
        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
        }.bind(this));

        // We should not fetch server results at this point as we have seen that the count has changed
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);


        // Kick off another page 2 manually
        U.ensureSynchronous(function () {
            tc.fetcher.fetchMoreItems();
        }.bind(this));

        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);
        Jm.when(tc.searchCollection).count.thenReturn(30);
        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
            tc.fetcher.serverSearchComplete();
        }.bind(this));

        // Ensure everything is completed at this point and no more pages should be fetched
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);
    });

    // Conditions:
    // Execute a fetch request while the fetcher is fetching
    // Expected:
    // No fetches should be made
    Tx.test("SearchResultsFetchers_UnitTest.test_fetch_pendingFetch", function (tc) {
        setup(tc);

        // call localSearchComplete to trigger a fetch
        Jm.when(tc.searchCollection).count.thenReturn(0);
        Jm.when(tc.searchCollection).totalCount.thenReturn(10);
        U.ensureSynchronous(function () {
            tc.fetcher.localSearchComplete();
        }.bind(this));
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        // execute another fetch request
        U.ensureSynchronous(function () {
            tc.fetcher.fetchMoreItems();
        }.bind(this));

        // Expected: No fetches should be made
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);

        Jm.when(tc.searchCollection).count.thenReturn(10);
        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
        }.bind(this));
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);

        U.ensureSynchronous(function () {
            tc.fetcher.endChanges();
        }.bind(this));
    });

    // Conditions:
    // Execute a fetch request while the fetcher is processing notifications
    // Expected:
    // Fetches should be made only on end changes
    Tx.test("SearchResultsFetchers_UnitTest.test_fetch_processingNotifications", function (tc) {
        setup(tc);

        // call localSearchComplete to trigger a fetch
        Jm.when(tc.searchCollection).count.thenReturn(0);
        Jm.when(tc.searchCollection).totalCount.thenReturn(20);

        U.ensureSynchronous(function () {
            tc.fetcher.localSearchComplete();
        }.bind(this));
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        // The first page is returned
        Jm.when(tc.searchCollection).count.thenReturn(20);
        Jm.when(tc.searchCollection).totalCount.thenReturn(40);

        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            tc.fetcher.endChanges();
        }.bind(this));

        // Expected : kick off another fetch since we haven't fetch the first server page yet
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);

        Jm.when(tc.searchCollection).count.thenReturn(30);
        Jm.when(tc.searchCollection).totalCount.thenReturn(40);

        U.ensureSynchronous(function () {
            tc.fetcher.beginChanges();
            // execute another fetch request in the middle of change notifications
            tc.fetcher.fetchMoreItems();
        }.bind(this));

        // Expected: No fetches should be made
        Jm.verifyNot(tc.searchCollection).fetchMoreItems(Jm.ANY);

        // When we are done with notifications, kick off another fetch
        U.ensureSynchronous(function () {
            tc.fetcher.endChanges();
        }.bind(this));
        Jm.verify(tc.searchCollection).fetchMoreItems(Jm.ANY);
    });
})();
