
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../Scheduler/Scheduler.js"/>
/// <reference path="BaseCollection.js"/>

Jx.delayDefine(People, "IndexedSearchCollection", function () {
    
    "use strict";

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    var pageSize = 50;

    P.IndexedSearchCollection = /* @constructor*/function (peopleManager, query, locale) {
        ///<summary>This wraps a platform search collection that is backed by the indexer. It exposes the same methods/events as
        ///the other platform collection wrappers, abstracting away the differences of an indexed search collection. That said,
        ///the queries are executed asynchronously and need to be manually populated by calling fetchMoreItems. The initial phase
        ///of a search is to figure out how many items are in the collection. The searchComplete event from the platform signals
        ///when this has finished, at which point the totalCount property is valid. However, the normal count property will be zero
        ///since no items are realized. At this point we begin calling fetchMoreItems so that items are populated in the collection.
        ///Each fetchMoreItems call results in the batchBegin, multiple itemAdded, and batchEnd events which we map to a single
        ///changesPending event. This flow continues until totalCount === count. Additionally, this class relies on that fact that
        ///items are always added at the end of the underlying platform collection and items are never moved/deleted. This simplifies
        ///managing pending changes since we don't use DeferredCollection and these assumptions are asserted throughout.</summary>
        ///<param name="query" type="String"/>
        ///<param name="locale" type="String"/>
        ///<param name="peopleManager" type="Plat.PeopleManager"/>
        Debug.assert(Jx.isNonEmptyString(query));
        Debug.assert(Jx.isNonEmptyString(locale));
        Debug.assert(Jx.isObject(peopleManager));

        P.Collection.call(this, "search:" + query);
        this._query = query;
        this._locale = locale;
        this._peopleManager = peopleManager;
        this._collection = /*@static_cast(Plat.Collection)*/null;
        this._listener = this._collectionChanged.bind(this);
        this._pendingChanges = [];
        this._reportedPending = false;
        this._jobSet = /*@static_cast(P.JobSet)*/null;
        this._searchTimer = 0;
        this._searchTimerFired = false;

        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.IndexedSearchCollection, P.Collection);

    Object.defineProperty(P.IndexedSearchCollection.prototype, "totalCount", { get: /*@bind(P.IndexedSearchCollection)*/function () {
        return this._searchTimerFired ? this._collection.count : this._collection.totalCount;
    }});

    P.IndexedSearchCollection.prototype.dispose = function () {
        if (this._collection) {
            this._collection.removeEventListener("collectionchanged", this._listener);
            this._collection.dispose();
        }
        this._clearTimer();
    };

    P.IndexedSearchCollection.prototype.getItem = function (index) {
        /// <param name="index" type="Number"/>
        Debug.assert(this._collection !== null, "Attempting to get an item before the collection has been queried");
        Debug.assert(index >= 0 && index < this.length, "Index out of bounds");

        return {
            type: "person",
            data: this._collection.item(index)
        };
    };

    P.IndexedSearchCollection.prototype.load = function (jobSet) {
        ///<summary>Queues the query to run asynchronously</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        Debug.assert(!this.isLoaded, "Attempting to load an already loaded collection");
        this._jobSet = jobSet;

        jobSet.addUIJob(this, this._runQuery, null, P.Priority.query);
    };

    P.IndexedSearchCollection.prototype.acceptPendingChanges = function () {
        ///<summary>Called when the owner is ready to handle the pending changes</summary>
        var pendingChanges = this._pendingChanges;
        Debug.assert(pendingChanges.length > 0);
        Debug.assert(this._reportedPending);
        Debug.assert(this.length + pendingChanges.length === this._collection.count);

        this.length = this._collection.count;
        this._pendingChanges = [];
        this._reportedPending = false;
        this.raiseEvent("changesApplied", { target: this, changes: pendingChanges });
        return pendingChanges;
    };

    // We don't want to hydrate the search collections
    P.IndexedSearchCollection.prototype.hydrate = Jx.fnEmpty;
    P.IndexedSearchCollection.prototype.dehydrate = Jx.fnEmpty;

    P.IndexedSearchCollection.prototype._runQuery = function () {
        ///<summary>Called when the query should be run</summary>
        Debug.assert(!this._collection, "Redundant query call");
        var collection = this._collection = this._peopleManager.search(Plat.PeopleSearchType.searchCharm, this._query, this._locale, pageSize);
        collection.addEventListener("collectionchanged", this._listener);
        collection.unlock();
        
        this._searchTimer = window.setTimeout(this._onTimer.bind(this), 5000);
    };

    P.IndexedSearchCollection.prototype._collectionChanged = function (change) {
        ///<summary>Called when the real collection changes. Stores the change away for future application and notifies the consumer.
        ///Additionally, this method validates our assumptions around the type/ordering of events.</summary>
        ///<param name="change" type="Plat.CollectionChangedEventArgs" />
        Debug.assert(change.target === this._collection);
        var changeType = Plat.CollectionChangeType;
        var collection = this._collection;

        if (change.eType === changeType.localSearchComplete) {
            Debug.assert(this.length === 0);
            if (collection.totalCount > 0) {
                collection.fetchMoreItems(pageSize);
            } else {
                // Mark the collection as loaded now since there aren't any results
                this._markLoaded();
            }
        } else if (change.eType === changeType.itemAdded) {
            // Validate our assumptions that we only get item adds at the end of the existing collection. Also, wait until batchEnd
            // to report that pending changes are available if needed.
            Debug.assert(change.index === collection.count - 1);
            Debug.assert(change.index === this.length + this._pendingChanges.length);
            this._pendingChanges.push(change);
        } else if (change.eType === changeType.batchEnd) {
            if (!this.isLoaded) {
                // First batch of results, ignore pending changes since we're firing the initial load event
                this._pendingChanges = [];
                this._markLoaded();
            } else if (!this._reportedPending) {
                this._reportedPending = true;
                this.raiseEvent("changesPending", { target: this });
            }

            // Continue fetching search results if more are available
            if (collection.count < collection.totalCount) {
                this._jobSet.addUIJob(collection, collection.fetchMoreItems, [pageSize], P.Priority.query);
            }
        } else {
            // The only other event that search collections should fire is the batchBegin. We should never get delete/move/reset.
            Debug.assert(change.eType === changeType.batchBegin);
        }
    };

    P.IndexedSearchCollection.prototype._markLoaded = function () {
        this._clearTimer();

        // In rare instances the _collection could be in a pending state at this time. If it is then attempting to access count
        // and/or totalCount could result in an E_PENDING exception being thrown. We safeguard around this by wrapping the 
        // accesses in try/catch block. Unfortunatly for the count we can only assume 0 in an exception case, for totalCount we
        // can be slightly smarter and assume a minimum of count.
        var collectionLength = 0;
        try {
            collectionLength = this._collection.count;
        } catch (e) {
            if (e.number !== -2147483638 /* E_PENDING */) {
                throw e;
            }
        }

        this.length = collectionLength;
        this.isLoaded = true;

        var collectionTotalCount = collectionLength;
        try {
            collectionTotalCount = this._collection.totalCount;
        } catch (e) {
            if (e.number !== -2147483638 /* E_PENDING */) {
                throw e;
            }
        }

        this.raiseEvent("load", { target: this, length: this.length, totalCount: collectionTotalCount });
    };
    
    P.IndexedSearchCollection.prototype._onTimer = function () {
        Jx.log.warning("Search hasn't completed in the time allowed. Timer fired to finish the search.");
        Debug.assert(!this._searchTimerFired);
        this._searchTimerFired = true;
        this._markLoaded();
    };
    
    P.IndexedSearchCollection.prototype._clearTimer = function () {
        if (this._searchTimer) {
            window.clearTimeout(this._searchTimer);
            this._searchTimer = 0;
        }
    };
});

