
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint strict:true*/
/*global Mail,Jx,Debug,Microsoft,NoShip*/

Jx.delayDefine(Mail, ["SearchResultsFetcher", "ServerSearchResultsFetcher"], function () {
    "use strict";

    var Status = Mail.SearchResultsFetcherStatus = {
        idle : 0,
        fetching : 1,
        processingNotifications : 2
    };

    Mail.SearchResultsFetcher = /*@constructor*/ function (collection, scheduler) {
        ///<summary>
        /// This class responds to the events - beginChanges, endChanges, etc - of the search collection and determine
        /// whether more results should be fetched automatically.
        /// Also, calling fetchMoreItems on the platform pumps event and thus this class schedule fetch request asynchronously
        /// using the scheduler to prevent reentrancy
        /// To prevent race condition in event handling with its owner, Mail.SearchCollection, this class does not hook events
        /// on the collection directly but expose public functions
        /// e.g. onBatchBegin() for its owner to call when the state of the collection is changed.
        ///</summary>
        ///<param name="collection" type="Microsoft.WindowsLive.Platform.SearchCollection" />
        ///<param name="scheduler" type="Jx.Scheduler"></param>
        Mail.writeProfilerMark("Mail.SearchResultsFetcher_Ctor", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(collection, Microsoft.WindowsLive.Platform.SearchCollection));
        Debug.assert(Jx.isObject(scheduler));
        this._collection = collection;
        this._status = Status.idle;
        this._fetchJob = null;
        this._scheduler = /*@static_cast(Jx.Scheduler)*/ scheduler;
        Mail.writeProfilerMark("Mail.SearchResultsFetcher_Ctor", Mail.LogEvent.stop);
    };

    ///
    /// Public Functions
    ///
    Mail.SearchResultsFetcher.prototype.beginChanges = function () {
        this._setStatus(Status.processingNotifications);
    };

    Mail.SearchResultsFetcher.prototype.endChanges = function () {
        this._setStatus(Status.idle);
        this._fetchAsync(false);
    };

    Mail.SearchResultsFetcher.prototype.localSearchComplete = function () {
        this._fetchAsync(false);
    };

    Mail.SearchResultsFetcher.prototype.serverSearchComplete = function () {
        this._setStatus(Status.idle);
    };

    Mail.SearchResultsFetcher.prototype.serverSearchError = function () {
        this._setStatus(Status.idle);
    };

    Mail.SearchResultsFetcher.prototype.fetchMoreItems = function () {};

    Mail.SearchResultsFetcher.prototype.dispose = function () {
        // clean up async fetches
        Jx.dispose(this._fetchJob);
        this._fetchJob = null;

        // Null out the reference to the platform collection to prevent leaking
        this._collection = null;
        this._scheduler = null;
    };
    ///
    /// Private Functions
    ///
    Mail.SearchResultsFetcher.prototype._setStatus = function (fetchStatus) {
        this._status = fetchStatus;
        NoShip.MailSearch.logFetcherStatus(this._status);
    };

    Mail.SearchResultsFetcher.prototype._fetchMoreItems = function (forceFetch) {
        /// <summary>
        /// Ask the collection for more items if we haven't fetched all the items yet.
        /// If forceFetch is set to true.  We will ask the platform for items anyways.
        /// </summary>
        /// <param name="forceFetch" type="boolean"></param>
        Debug.assert(Jx.isBoolean(forceFetch));
        this._fetchJob = null;

        if (!forceFetch && (this._collection.totalCount === this._collection.count)) {
            // we have fetched all results already
            return;
        }
        // logging
        NoShip.MailSearch.logFetchMoreItems(Mail.SearchCollection.pageSize);
        Mail.log("SearchCollection_fetch", Mail.LogEvent.start);

        // update status
        this._setStatus(Status.fetching);
        // fetch
        this._collection.fetchMoreItems(Mail.SearchCollection.pageSize);
    };

    Mail.SearchResultsFetcher.prototype._fetchAsync = function (forceFetch) {
        // The platform calls pumps events, we need to process fetches async to avoid reentrancy in the caller
        if (!this._fetchJob) {
            this._fetchJob = this._scheduler.addJob(null,
                Mail.Priority.searchResultsFetch,
                "Mail.SearchResultsFetcher.fetchMoreItems",
                this._fetchMoreItems,
                this,
                [forceFetch]
            );
        }
    };

    Mail.ServerSearchResultsFetcher = /*@constructor*/ function (collection, scheduler) {
        ///<summary>
        /// An subclass of SearchResultsFetcher that provides more robust checking when fetching items in a server search
        /// In server search, fetch request can be a result of scrolling or platform events and thus it must be co-ordinated.
        /// To prevent race condition in event handling with its owner,
        /// Mail.SearchCollection, this class does not hook events on the collection directly but expose public functions
        /// e.g. serverSearchComplete() for its owner to call when the state of the collection is changed.
        ///</summary>
        ///<param name="collection" type="Microsoft.WindowsLive.Platform.SearchCollection" />
        ///<param name="scheduler" type="Jx.Scheduler"></param>
        Mail.writeProfilerMark("Mail.ServerSearchResultsFetcher", Mail.LogEvent.start);
        Debug.assert(Jx.isInstanceOf(collection, Microsoft.WindowsLive.Platform.SearchCollection));
        Debug.assert(Jx.isObject(scheduler));
        this._collection = collection;
        this._collection.beginServerSearch();
        this._scheduler = scheduler;

        this._fetchJob = null;
        this._status = Status.idle;
        this._localResultsCount = -1;
        this._hasPendingFetch = false;
        this._serverSearchCompleted = false;
        Mail.writeProfilerMark("Mail.ServerSearchResultsFetcher", Mail.LogEvent.stop);
    };
    Jx.inherit(Mail.ServerSearchResultsFetcher, Mail.SearchResultsFetcher);

    ///
    /// Overriding Public Functions
    ///
    Mail.ServerSearchResultsFetcher.prototype.endChanges = function () {
        this._setStatus(Status.idle);
        // At the end of a batch, the server search may not have returned yet.
        // As a result, the total count may not have changed and we need to call force fetch
        if (this._hasPendingFetch || !this._isFirstServerBatchFetched) {
            this._scheduleFetch(!this._isFirstServerBatchFetched /*forceFetch*/);
        }
    };

    Mail.ServerSearchResultsFetcher.prototype.localSearchComplete = function () {
        this._localResultsCount = this._collection.totalCount;
        /// Setting forceFetch to true. This is because during a local search with no items,
        /// the collection will report there are no items in the collection but we still need to
        /// kick off at least one server-side search.
        this._scheduleFetch(true /*forceFetch*/);
    };

    Mail.ServerSearchResultsFetcher.prototype.serverSearchComplete = function () {
        this._setStatus(Status.idle);
        this._serverSearchCompleted = true;
    };

    Mail.ServerSearchResultsFetcher.prototype.fetchMoreItems = function () {
        this._scheduleFetch(true /*forceFetch*/);
    };

    ///
    /// Private Properties
    ///
    Object.defineProperty(Mail.ServerSearchResultsFetcher.prototype, "_isFirstServerBatchFetched", { get : function () {
        return this._serverSearchCompleted || (this._collection.count > this._localResultsCount);
    }});

    ///
    /// Private Functions
    ///
    Mail.ServerSearchResultsFetcher.prototype._scheduleFetch = function (forceFetch) {
        /// <summary>
        /// Schedule a pending fetch request
        /// 1. It will kick off the fetch right away if it is idle
        /// 2. It will schedule a fetch if it is processing notifications
        /// 3. It will ignore the request it there is an outgoing fetch request
        /// </summary>
        /// <param name="forceFetch" type="boolean"></param>
        Debug.assert(Jx.isBoolean(forceFetch));

        switch (this._status) {
            case Status.idle:
                this._hasPendingFetch = false;
                this._fetchAsync(forceFetch);
                break;
            case Status.processingNotifications:
                // The collection is progressing notifications, we can't fetch now.
                // Instead we set a flag so that we can execute the pendingSearch at the end
                this._hasPendingFetch = true;
                break;
            case Status.fetching:
                // We are already fetching new results, just ignore this request
                break;
            default:
                Debug.assert(false, "Unexpected State");
                break;
        }
    };
});

