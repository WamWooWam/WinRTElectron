
/*global Mail,Debug,Tx,Jx,WinJS,Microsoft*/
/*jshint browser:true*/

(function () {
    "use strict";

    var SearchStatusCode = Microsoft.WindowsLive.Platform.SearchStatusCode;

    function MockSearchCollection(tc, count) {
        this._tc = tc;
        this.count = count;
        this._numFetchMoreItemsCalled = 0;
    }

    MockSearchCollection.prototype = {
        fetchMoreItems: function () {
            this._numFetchMoreItemsCalled++;
        },
        mock$fireComplete: function () {
            this.raiseEvent("searchComplete");
        },
        mock$fireError: function (errorCode) {
            this.raiseEvent("searchError", errorCode);
        },
        verifyItemsFetched: function (numFetched) {
            this._tc.areEqual(this._numFetchMoreItemsCalled, numFetched);
            this._numFetchMoreItemsCalled = 0;
        },
        mockedType: Mail.SearchCollection
    };
    Jx.augment(MockSearchCollection, Jx.Events);
    Debug.Events.define(MockSearchCollection.prototype, "searchComplete", "searchError");

    function MockListView(tc, lastVisibleIndex) {
        this.indexOfLastVisible = lastVisibleIndex;
        this._tc = tc;
        this._loadingState = "complete";
    }

    MockListView.prototype = {
        scrollToEnd: function () {
            this._tc.collection.count = 50;
            this.indexOfLastVisible = this._tc.collection.count - 1;
            this.raiseEvent("loadingstatechanged");
            this._loadingState = "complete";
        },
        get loadingState() {
            return this._loadingState;
        },
        mockedType: WinJS.UI.ListView
    };
    Jx.augment(MockListView, Jx.Events);
    Debug.Events.define(MockListView.prototype, "loadingstatechanged");

    function MockScopeSwitcher(tc, canServerSearch) {
        this._upsell = {
            description: "foo"
        };
        this._tc = tc;
        this._canServerSearch = canServerSearch;
        this._numRescoped = 0;
    }

    MockScopeSwitcher.prototype = {
        get canServerSearch() {
            return this._canServerSearch;
        },
        get upsell() {
            return this._upsell;
        },
        canUpsell: function () {
            return Jx.isObject(this._upsell);
        },
        rescopeToUpsell: function () {
            if (this._upsell) {
                this._numRescoped++;
            }
        },
        verifyRecoped: function (numRescoped) {
            this._tc.areEqual(this._numRescoped, numRescoped);
            this._numRescoped = 0;
        },
        mockedType: Mail.SearchScopeSwitcher
    };

    function setup(tc, options) {
        tc.scopeSwitcher = new MockScopeSwitcher(tc, options.canServerSearch);
        tc.collection = new MockSearchCollection(tc, options.count);
        tc.listView = new MockListView(tc, options.lastVisibleIndex);
        tc.target = new Mail.SearchEndOfListItem(tc.collection, tc.scopeSwitcher, tc.listView);
        tc.host = tc.target.getElement();
        tc.addCleanup(function () {
            Jx.dispose(tc.scopeSwitcher);
            tc.scopeSwitcher = null;
            Jx.dispose(tc.collection);
            tc.collection = null;
            Jx.dispose(tc.listView);
            tc.listView = null;
            Jx.dispose(tc.target);
            tc.target = null;
            tc.host = null;
        });
    }

    function verifyUI(tc, options) {
        var element = tc.host,
            innerHTML = element.innerHTML;

        // whether the item is interactive. Clicking on an interactive element has no press animation
        tc.areEqual(innerHTML.indexOf("win-interactive") === -1, options.interactive);
        tc.isTrue(innerHTML.indexOf(options.fragment) !== -1);

        // whether the item is selectable
        tc.isTrue(element.classList.contains("win-nonselectable"));
        tc.isTrue(element.classList.contains("win-nondraggable"));
        tc.isTrue(element.classList.contains("win-nonswipeable"));
        tc.isFalse(tc.target.selectable);
        tc.areEqual(tc.target.objectId, "Mail.SearchEndOfListItem.objectId");
        // visibility
        tc.areEqual(options.visible, tc.target.visible);
    }

    Tx.test("SearchEndOfListItem.test_searching", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        verifyUI(tc, {
            visible: true,
            interactive: false,
            fragment: "progress"
        });

        // invoke is a no-op
        tc.target.onInvoke();
        tc.scopeSwitcher.verifyRecoped(0);
        tc.collection.verifyItemsFetched(0);

        // scrolling
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(1);
        tc.scopeSwitcher.verifyRecoped(0);
    });
    
    
    Tx.test("SearchEndOfListItem.test_error", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        tc.collection.mock$fireError(SearchStatusCode.serverError);

        // verify UI
        verifyUI(tc, {
            visible: true,
            interactive: true,
            fragment: Jx.res.getString("mailSearchError")
        });

        // scrolling is no-op
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);

        // invoke should execute the search again
        tc.target.onInvoke();
        tc.collection.verifyItemsFetched(1);
        verifyUI(tc, {
            visible: true,
            interactive: false,
            fragment: "progress"
        });
    });

    
    Tx.test("SearchEndOfListItem.test_moreResults", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        tc.collection.mock$fireError(SearchStatusCode.endOfRetrievableRange);

        // verify UI
        verifyUI(tc, {
            visible: true,
            interactive: false,
            fragment: Jx.res.getString("mailSearchEndofListItemMoreResultsLabel")
        });

        // scrolling is no-op
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);

        // invoke is no-op
        tc.target.onInvoke();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);
    });

    Tx.test("SearchEndOfListItem.test_complete_upsell_serverSearch", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        tc.scopeSwitcher.upsell.description = "Foo";
        tc.collection.mock$fireComplete();

        // verify UI
        verifyUI(tc, {
            visible: true,
            interactive: true,
            fragment: tc.scopeSwitcher.upsell.description
        });

        var innerHTML = tc.host.innerHTML;

        // verify it is not saying show recent results
        tc.areEqual(innerHTML.indexOf(Jx.res.getString("mailMessageListSearchShowRecentResults")), -1);

        // scrolling is no-op
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);

        // invoke with cause it to upsell
        tc.target.onInvoke();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(1);
    });

    Tx.test("SearchEndOfListItem.test_complete_noUpsell_noServerSearch", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        tc.scopeSwitcher._canServerSearch = false;
        tc.scopeSwitcher._upsell = null;
        tc.collection.mock$fireComplete();

        // verify UI
        verifyUI(tc, {
            visible: true,
            interactive: false,
            fragment: "mailMessageListEntryContainer"
        });

        tc.isTrue(tc.host.innerHTML.indexOf(Jx.res.getString("mailMessageListSearchShowRecentResults")) !== -1);

        // scrolling is no-op
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);

        // invoke is no-op
        tc.target.onInvoke();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);
    });

    Tx.test("SearchEndOfListItem.test_complete_noUpsell_serverSearch", { owner: "kepoon" }, function (tc) {
        setup(tc, {
            canServerSearch: true,
            count: 0,
            lastVisibleIndex: 0
        });

        tc.scopeSwitcher._canServerSearch = true;
        tc.scopeSwitcher._upsell = null;
        tc.collection.mock$fireComplete();

        // verify UI
        tc.isFalse(tc.target.visible);
      
        // scrolling is no-op
        tc.listView.scrollToEnd();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);

        // invoke is no-op
        tc.target.onInvoke();
        tc.collection.verifyItemsFetched(0);
        tc.scopeSwitcher.verifyRecoped(0);
    });
})();
