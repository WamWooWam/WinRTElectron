
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="../../../Shared/Mocks/Platform/Collection.js"/>
/// <reference path="../Scheduler/Scheduler.js"/>
/// <reference path="BaseCollection.js"/>
/// <reference path="DeferredCollection.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "QueryCollection", function () {

    "use strict";
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.QueryCollection = /* @constructor*/function (itemType, queryCallback, collectionName) {
        ///<summary>A QueryCollection wraps a platform collection into the People.Collection interface.  It supports hydration of length, and
        ///deferred loading and updates.</summary>
        ///<param name="itemType" type="String">The type of items that will be returned.  Used to populate the type: field in returned type/data pairs</param>
        ///<param name="queryCallback" type="P.Callback">A callback that will return a platform collection</param>
        ///<param name="collectionName" type="String">An identifier used for hydration/dehydration and debugging</param>
        Debug.assert(Jx.isNonEmptyString(itemType));
        Debug.assert(Jx.isObject(queryCallback));
        Debug.assert(Jx.isNonEmptyString(collectionName));

        P.Collection.call(this, collectionName);
        this._itemType = itemType;
        this._queryCallback = queryCallback;
        this._pendingReplace = null;
        this._deferredCollection = /*@static_cast(P.DeferredCollection)*/null;

        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.QueryCollection, P.Collection);
    P.QueryCollection.prototype.getItem = function (index) {
        /// <summary>Retrieves an item from the collection by index</summary>
        /// <param name="index" type="Number"/>
        /// <returns type="Object"/>
        Debug.assert(this._deferredCollection !== null, "Attempting to get an item before the collection has been queried");
        Debug.assert(this.length === this._deferredCollection.length, "Length mismatch");
        Debug.assert(index >= 0 && index < this.length, "Index out of bounds");

        var item = this._deferredCollection.getItem(index);
        if (item === null) {

            // If we have no item, return a placeholder
            return {
                type: "none"
            };

        } else {

            return {
                type: this._itemType,
                data: item
            };
        }
    };
    P.QueryCollection.prototype.hydrate = function (data) {
        ///<summary>Hydrates the length of the collection</summary>
        Debug.assert(!this.isLoaded, "Attempting to hydrate an already loaded collection");
        if (Jx.isNumber(data)) {
            this.length = data;
            this.isHydrated = true;
        }
    };
    P.QueryCollection.prototype.dehydrate = function () {
        ///<summary>Dehydrates the length, if known, and null if not</summary>
        return this.isLoaded ? this.length : null;
    };
    P.QueryCollection.prototype.dispose = function () {
        ///<summary>Disposes the platform collection</summary>
        if (this._deferredCollection !== null) {
            this._deferredCollection.dispose();
        }
        this._queryCallback = null;
    };
    P.QueryCollection.prototype.load = function (jobSet) {
        ///<summary>Queues the query to run asynchronously</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        Debug.assert(!this.isLoaded, "Attempting to load an already loaded collection");

        jobSet.addUIJob(this, this._query, null, P.Priority.query);
    };
    P.QueryCollection.prototype.replace = function (queryCallback, jobSet) {
        ///<summary>Replaces the underlying platform query with a new one</summary>
        ///<param name='queryCallback' type='P.Callback'/>
        ///<param name='jobSet' type='P.JobSet'/>
        if (!this.isLoaded) {
            // We haven't loaded the collection yet, just replace the query
            this._queryCallback = queryCallback;
            return WinJS.Promise.wrap();
        }
        var that = this;
        return new WinJS.Promise(function (c,e,r) {
            jobSet.addUIJob(that, function () {
                this._pendingReplace = queryCallback.invoke();
                this.raiseEvent("changesPending", { target: this });
                c();
            }, null, P.Priority.query);
        });
    };
    P.QueryCollection.prototype._acceptPendingReplace = function () {
        ///<summary>Applies the pending replace and generates the appropriate add or remove events. This
        ///works under the assumption that one of these collections is a strict subset of the other and
        ///the sort remains the same. If this assumption isn't met we'll fire a collection reset.</summary>
        var pendingChanges = [], i, j, len,
            newCollection = new P.DeferredCollection(this._pendingReplace, this),
            oldCollection = this._deferredCollection;
        this._pendingReplace = null;

        if (newCollection.length < oldCollection.length) {
            // The new collection is shorter, generate deletes
            for (i = oldCollection.length - 1, j = newCollection.length - 1; i >= 0; i--) {
                if (j < 0 || oldCollection.getItemId(i) !== newCollection.getItemId(j)) {
                    pendingChanges.push({
                        index: i,
                        eType: Plat.CollectionChangeType.itemRemoved
                    });
                } else {
                    j--;
                }
            }
            if (j !== -1) {
                // The new collection wasn't a subset of the old
                pendingChanges = [{ eType: Plat.CollectionChangeType.reset }];
            }
        } else {
            // The new collection is longer, generate adds
            for (i = 0, j = 0, len = newCollection.length; i < len; i++) {
                if (j >= oldCollection.length || newCollection.getItemId(i) !== oldCollection.getItemId(j)) {
                    pendingChanges.push({
                        index: i,
                        eType: Plat.CollectionChangeType.itemAdded
                    });
                } else {
                    j++;
                }
            }
            if (j !== oldCollection.length) {
                // New collection wasn't a a super set of the old
                pendingChanges = [{ eType: Plat.CollectionChangeType.reset }];
            }
        }

        // Get rid of the old collection that is no longer needed
        Jx.dispose(this._deferredCollection);
        this._deferredCollection = newCollection;
        return pendingChanges;
    };
    P.QueryCollection.prototype._query = function () {
        ///<summary>Called when the query has finished</summary>
        Debug.assert(!this.isLoaded, "Redundant query call");

        // Store the collection, hook events on the collection, and raise the load event
        var collection = this._queryCallback.invoke();
        var deferredCollection = this._deferredCollection = new P.DeferredCollection(collection, this);
        this.length = deferredCollection.length;
        this.isLoaded = true;
        this.raiseEvent("load", { target: this, length: this.length });
    };
    P.QueryCollection.prototype.onChangesPending = function (sender, deferredCollection) {
        ///<summary>Called when deferred collection has queued changes</summary>
        ///<param name="sender" type="Mocks.Microsoft.WindowsLive.Platform.Collection"/>
        ///<param name="deferredCollection" type="P.DeferredCollection"/>
        Debug.assert(deferredCollection === this._deferredCollection);
        this.raiseEvent("changesPending", { target: this });
    };
    P.QueryCollection.prototype.acceptPendingChanges = function () {
        ///<summary>Called when deferred collection has queued changes</summary>
        ///<returns type="Array">The pending changes</returns>
        var pendingChanges;
        if (this._pendingReplace) {
            pendingChanges = this._acceptPendingReplace();
        } else {
            pendingChanges = this._deferredCollection.acceptPendingChanges();
        }
        this.length = this._deferredCollection.length;
        this.raiseEvent("changesApplied", { target: this, changes: pendingChanges });
        return pendingChanges;
    };

});
