
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js" />
/// <reference path="../Scheduler/Scheduler.js"/>
/// <reference path="BaseCollection.js"/>

Jx.delayDefine(People, "GALSearchCollection", function () {
    
    "use strict";

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.GALSearchCollection = /* @constructor*/function (platform, query, accountEmail) {
        ///<summary>This wraps a platform search collection from an Exchange Active Sync (EAS) account.</summary>
        ///<param name="query" type="String"/>
        ///<param name="accountEmail" type="String"/>
        ///<param name="peopleManager" type="Plat.PeopleManager"/>
        ///<param name="platform" type="Plat"/>
        Debug.assert(Jx.isNonEmptyString(query));
        Debug.assert(Jx.isNonEmptyString(accountEmail));
        Debug.assert(Jx.isObject(platform));

        P.Collection.call(this, "search:" + query);
        this._query = query;
        this._accountEmail = accountEmail;
        this._peopleManager = platform.peopleManager;
        this._collection = /*@static_cast(Plat.Collection)*/null;
        this._listener = this._collectionChanged.bind(this);
        this._pendingChanges = [];
        this._reportedPending = false;
        this._jobSet = /*@static_cast(P.JobSet)*/null;
        this._searchTimer = 0;
        this._searchTimerFired = false;
        this._platform = platform;

        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.GALSearchCollection, P.Collection);

    Debug.Events.define(P.Collection.prototype, "load", "changesPending", "changesApplied", "updateHeader");

    Object.defineProperty(P.GALSearchCollection.prototype, "totalCount", { get: /*@bind(P.GALSearchCollection)*/function () {
        return this._collection.count;
    }});

    P.GALSearchCollection.prototype.dispose = function () {
        if (this._collection) {
            this._collection.removeEventListener("collectionchanged", this._listener);
            this._collection.dispose();
        }
        this._clearTimer();
    };

    P.GALSearchCollection.prototype.getItem = function (index) {
        /// <param name="index" type="Number"/>
        Debug.assert(this._collection !== null, "Attempting to get an item before the collection has been queried");
        Debug.assert(index >= 0 && index < this.length, "Index out of bounds");

        return {
            type: "person",
            data: this._collection.item(index)
        };
    };

    P.GALSearchCollection.prototype.load = function (jobSet) {
        ///<summary>Queues the query to run asynchronously</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        Debug.assert(!this.isLoaded, "Attempting to load an already loaded collection");
        this._jobSet = jobSet;

        jobSet.addUIJob(this, this._runQuery, null, P.Priority.query);
    };

    P.GALSearchCollection.prototype.acceptPendingChanges = function () {
        ///<summary>Called when the owner is ready to handle the pending changes</summary>
        var pendingChanges = this._pendingChanges;
        Debug.assert(pendingChanges.length > 0);

        this.length = this._collection.count;
        this._pendingChanges = [];
        this._reportedPending = false;
        this.raiseEvent("changesApplied", { target: this, changes: pendingChanges });
        this.raiseEvent("updateHeader", { target: this, length: this.length, error: false, searching: false });
        return pendingChanges;
    };

    // We don't want to hydrate the search collections
    P.GALSearchCollection.prototype.hydrate = Jx.fnEmpty;
    P.GALSearchCollection.prototype.dehydrate = Jx.fnEmpty;

    P.GALSearchCollection.prototype._runQuery = function () {
        ///<summary>Called when the query should be run</summary>
        Debug.assert(!this._collection, "Redundant query call");

        var accounts = this._platform.accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.peopleSearch,
                                                                          Plat.ConnectedFilter.normal,
                                                                          Plat.AccountSort.name);

        if (accounts.count > 0) {
            var account = null;
            if (Jx.isNonEmptyString(this._accountEmail)) {
                for (var i = 0; i < accounts.count; i++) {
                    if (accounts.item(i).emailAddress === this._accountEmail) {
                        account = accounts.item(i);
                        break;
                    }
                }
            }

            if (account == null) {
                var account = accounts.item(0);
            }
            var collection = this._collection = this._peopleManager.searchServer(this._query, 50, account, 0);
            collection.addEventListener("collectionchanged", this._listener);
            collection.unlock();

            // Even though the search is still occuring, mark the collection as loaded so that the page transitions
            // immediatly. When the search results are return the collecitonchanged event will be handled via
            // changesPending in order to update the collection.
            this._markLoaded();
            this.raiseEvent("updateHeader", { target: this, error: false, searching: true})
        }
    };

    P.GALSearchCollection.prototype._collectionChanged = function (ev) {
        ///<summary>Called when the real collection changes. Handles the server search completed event.</summary>
        ///<param name="change" type="Plat.CollectionChangedEventArgs" />
        var collectionChangeType = /* @static_cast(Number) */ ev.eType;
        if (collectionChangeType === Microsoft.WindowsLive.Platform.CollectionChangeType.serverSearchComplete) {
            if (ev.index === 1) {
                if (this._collection.count > 0 && !this._reportedPending) {
                    // The first batch of search results have been successfully retrieved. We are limiting the search results
                    // to the initial count (50) so mark the collection as loaded.
                    this._reportedPending = true;
                    this._pendingChanges.push(ev);
                    this.raiseEvent("changesPending", { target: this });
                }
                else {
                    this.raiseEvent("updateHeader", { target: this, length: 0, error: false, searching: false });
                }
            } else {
                Jx.log.info("Server failure " + ev.index + " trying to get search results for " + this._accountEmail);
                this.raiseEvent("updateHeader", { target: this, length: 0, error: true, searching: false });
            }
        }
    };

    P.GALSearchCollection.prototype._markLoaded = function () {
        this.length = this._collection.count;
        this.isLoaded = true;
        this.raiseEvent("load", { target: this, length: this.length, totalCount: this.length });
    };
    
    P.GALSearchCollection.prototype._onTimer = function () {
        Jx.log.warning("Search hasn't completed in the time allowed. Timer fired to finish the search.");
        Debug.assert(!this._searchTimerFired);
        this._searchTimerFired = true;
        // TODO: Make this a time limit for the search or add UI to tell the user the search is taking longer than expected?
    };
    
    P.GALSearchCollection.prototype._clearTimer = function () {
        if (this._searchTimer) {
            window.clearTimeout(this._searchTimer);
            this._searchTimer = 0;
        }
    };
});

