
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="BaseCollection.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "ConcatenatedCollection", function () {
    
    "use strict";
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.ConcatenatedCollection = /* @constructor*/function (subCollections, collectionName) {
        /// <summary>The concatenated collection creates a single collection made up of several different sub-collections
        /// layed end-to-end.  It is largely an exercise in index math.</summary>
        /// <param name="subCollections" type="Array">The collections to concatenate</param>
        /// <param name="collectionName" type="String"/>
        P.Collection.call(this, collectionName);

        // Store the subCollections.  No point in examining them until after hydration.
        this._subCollections = subCollections;
        this._changesPending = false;
        this._unloadedCollections = 0;

        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.ConcatenatedCollection, P.Collection);
    P.ConcatenatedCollection.prototype.getItem = function (index) {
        ///<summary>Retreives an item from the collection by index</summary>
        ///<param name="index" type="Number"/>
        ///<returns type="Object"/>
        var subCollections = this._subCollections;
        for (var i = 0, len = subCollections.length; i < len; ++i) {
            var subCollection = /* @static_cast(P.Collection)*/subCollections[i];
            if (index < subCollection.length) {
                return subCollection.getItem(index);
            }
            index -= subCollection.length;
        }
        Debug.assert(false, "Access out of bounds.  Index=" + String(index) + ", Length=" + String(this.length));
        return null;
    };
    P.ConcatenatedCollection.prototype.hydrate = function (data) {
        ///<summary>Hydrates the subcollections, then computes the initial state of this collection</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        this.isHydrated = true;
        this._subCollections.forEach(function (/* @type(People.Collection)*/subCollection) {
            subCollection.hydrate(P.Hydration.get(data, subCollection.name));
            if (!subCollection.isHydrated) {
                this.isHydrated = false;
            }
        }, this);
        
        var unloadedCollections = 0;
        var totalLength = 0;
        this._subCollections.forEach(/* @bind(P.ConcatenatedCollection)*/function (/* @type(People.Collection)*/subCollection) {
            totalLength += subCollection.length;
            if (!subCollection.isLoaded) {
                unloadedCollections++;
                subCollection.addListener("load", this._onLoad, this);
            }
        }, this);

        this.length = totalLength;
        this._unloadedCollections = unloadedCollections;
        if (unloadedCollections === 0) {
            this._allLoaded();
        }
    };
    P.ConcatenatedCollection.prototype.dehydrate = function () {
        ///<summary>Dehydrates the subscollections</summary>
        ///<returns type="Object">The value to pass to the next call to hydrate</returns>
        return this._subCollections.reduce(
            function (data, /* @type(People.Collection)*/subCollection) {
                P.Hydration.set(data, subCollection.name, subCollection.dehydrate());
                return data;
            },
            { }
        );
    };
    P.ConcatenatedCollection.prototype.dispose = function () {
        ///<summary>Disposes of the subcollections</summary>
        var subCollections = this._subCollections;
        this._subCollections = null;
        for (var i = 0, len = subCollections.length; i < len; ++i) {
            subCollections[i].dispose();
        }
    };
    P.ConcatenatedCollection.prototype.load = function (jobSet) {
        ///<summary>Asks all unloaded subcollections to load</summary>
        ///<param name="jobSet" type="P.JobSet"/>
        this._subCollections.forEach(function (/*@type(People.Collection)*/subCollection) {
            if (!subCollection.isLoaded) {
                subCollection.load(jobSet);
            }
        });
    };
    P.ConcatenatedCollection.prototype._allLoaded = function () {
        ///<summary>Called when all of the subcollections are loaded.  Hooks up events, sets the length and fires the load event</summary>
        this.isLoaded = true;
        var totalLength = 0;
        this._subCollections.forEach(/* @bind(P.ConcatenatedCollection)*/function (/* @type(People.Collection)*/subCollection) {
            subCollection.addListener("changesPending", this._onChangesPending, this);
            totalLength += subCollection.length;
        }, this);
        this.length = totalLength;
        this.raiseEvent("load", { target: this, length: totalLength });
    };
    P.ConcatenatedCollection.prototype._onLoad = function (/*@dynamic*/ev) {
        ///<summary>Called when a child collection is loaded</summary>
        ///<param name="ev" />
        ev.target.removeListener("load", this._onLoad, this);
        if (--this._unloadedCollections === 0) {
            this._allLoaded();
        }
    };
    P.ConcatenatedCollection.prototype._onChangesPending = function (ev) {
        ///<summary>Called when an item is added to a child collection</summary>
        ///<param name="ev" type="Object"/>
        if (!this._changesPending) {
            this._changesPending = true;
            this.raiseEvent("changesPending", { target: this });
        }
    };

    P.ConcatenatedCollection.prototype.acceptPendingChanges = function () {
        ///<summary>Returns aggregate pending changes. Updates the indices of succeeding collections with the *latest*
        ///length of the preceding collections</summary>
        var pendingChanges = [];
        var totalLength = 0;
        var reset;

        this._subCollections.forEach(/* @bind(P.ConcatenatedCollection)*/function (/* @type(People.Collection)*/subCollection) {
            subCollection.acceptPendingChanges().forEach(function (change) {
                ///<param name="change" type="Plat.CollectionChangedEventArgs" />
                change.index += totalLength;
                if (change.eType === Plat.CollectionChangeType.reset) { 
                    reset = change;
                } else if (change.eType === Plat.CollectionChangeType.itemChanged) {
                    change.previousIndex += totalLength;
                }
                pendingChanges.push(change);
            });
            totalLength += subCollection.length;
        });

        if (reset) {  // If we had a reset, just deliver that.
            pendingChanges = [ reset ];
        }

        this.length = totalLength;
        this._changesPending = false;
        this.raiseEvent("changesApplied", { target: this, changes: pendingChanges });
        return pendingChanges;
    };
    P.ConcatenatedCollection.prototype.replace = function (collections, jobSet) {
        /// <param name="collections" type="Array">An array of replacement objects that get forwarded to
        /// the actual collections being concatenated. The length and order of 'replacement' should match
        /// exactly what was passed to the constructor.</param>
        var subCollections = this._subCollections;
        Debug.assert(collections.length === subCollections.length);
        return WinJS.Promise.join(subCollections.map(function (/* @type(People.QueryCollection)*/subCollection, i) {
            return subCollection.replace(collections[i], jobSet);
        }));
    };

});
