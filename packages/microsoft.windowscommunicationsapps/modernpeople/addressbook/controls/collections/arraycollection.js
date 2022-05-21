
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Hydration.js"/>
/// <reference path="BaseCollection.js"/>
/// <reference path="CollectionItem.ref.js" />

/// <disable>JS3057.AvoidImplicitTypeCoercion</disable>

Jx.delayDefine(People, "ArrayCollection", function () {

    "use strict";
    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.ArrayCollection = /* @constructor*/function (collectionName) {
        ///<summary>This is an implementation of Collection that is backed by an array</summary>
        ///<param name="collectionName" type="String">An identifier for debugging</param>
        P.Collection.call(this, collectionName);
        this._items = [];
        this._pendingDelta = 0;
        this._pendingChanges = [];
        this._pendingItems = {};

        Debug.only(Object.seal(this));
    };
    Jx.inherit(P.ArrayCollection, P.Collection);
    P.ArrayCollection.prototype.getItem = function (index) {
        /// <summary>Retreives an item from the collection by index</summary>
        /// <param name="index" type="Number"/>
        /// <returns type="Object"/>
        Debug.assert(this.isLoaded, "Attempting to retrieve items from collection [" + this.name + "] before it is loaded");
        return this._items[index];
    };
    P.ArrayCollection.prototype.hydrate = function (data) {
        ///<summary>If this is a collection-of-collections, hydrates the subcollections</summary>
        ///<param name="data" type="Object">The last value returned from dehydrate</param>
        this.isHydrated = true;
        this._items.forEach(function (/* @type(People.CollectionItem)*/item) {
            var collection = /* @static_cast(P.Collection)*/item.collection;
            if (Jx.isObject(collection)) {
                collection.hydrate(P.Hydration.get(data, collection.name));
                if (!collection.isHydrated) {
                    this.isHydrated = false;
                }
            }
        }, this);
    };
    P.ArrayCollection.prototype.dehydrate = function () {
        ///<summary>Dehydrates the subscollections</summary>
        ///<returns type="Object">The value to pass to the next call to hydrate</returns>
        return this._items.reduce(
            function (data, item) {
                var collection = /* @static_cast(People.Collection)*/item["collection"];
                if (collection !== null) {
                    P.Hydration.set(data, collection.name, collection.dehydrate());
                }
                return data;
            },
            { }
        );
    };
    P.ArrayCollection.prototype.dispose = function () {
        ///<summary>Disposes the subcollections</summary>
        this._items.forEach(function (/* @type(People.CollectionItem)*/ item) {
            var collection = /* @static_cast(P.Collection)*/ item.collection;
            if (collection !== null) {
                collection.dispose();
            }
        });
    };
    P.ArrayCollection.prototype._raiseChangesPending = function () {
        if (this._pendingChanges.length === 1) {
            this.raiseEvent("changesPending", { target: this });
        }
    };
    P.ArrayCollection.prototype.addItem = function (item, index) {
        /// <summary>Adds an item to the collection at the specified index</summary>
        /// <param name="item" type="Object"/>
        /// <param name="index" type="Number"/>
        Debug.assert(this.isLoaded, "Attempting to add items to collection [" + this.name + "] before it is loaded");
        if (index >= 0 && index <= (this.length + this._pendingDelta)) {
            Debug.assert(this._pendingItems[this._pendingChanges.length] === undefined);
            this._pendingItems[this._pendingChanges.length] = item;
            this._pendingChanges.push({ 
                eType: Plat.CollectionChangeType.itemAdded, 
                index: index
            });
            
            ++this._pendingDelta;
            this._raiseChangesPending();
        } else {
            throw new Error("Collection index out of bounds");
        }
    };
    P.ArrayCollection.prototype.removeItem = function (index) {
        /// <summary>Removes an item from the collection at the specified index</summary>
        /// <param name="index" type="Number"/>
        Debug.assert(this.isLoaded, "Attempting to remove items from collection [" + this.name + "] before it is loaded");
        if (index >= 0 && index < (this.length + this._pendingDelta)) {
            this._pendingChanges.push({ 
                eType: Plat.CollectionChangeType.itemRemoved, 
                index: index
            });
            --this._pendingDelta;
            this._raiseChangesPending();
        } else {
            throw new Error("Collection index out of bounds");
        }
    };
    P.ArrayCollection.prototype.moveItem = function (indexFrom, indexTo) {
        /// <summary>Removes an item from one position in the collection to another</summary>
        /// <param name="indexFrom" type="Number"/>
        /// <param name="indexTo" type="Number"/>
        Debug.assert(this.isLoaded, "Attempting to move items within collection [" + this.name + "] before it is loaded");
        var pendingLength = this.length + this._pendingDelta;
        if (indexFrom >= 0 && indexFrom < pendingLength && indexTo >= 0 && indexTo < pendingLength) {
            this._pendingChanges.push({ 
                    eType: Plat.CollectionChangeType.itemChanged, 
                    previousIndex: indexFrom, 
                    index: indexTo
            });
            this._raiseChangesPending();
        } else {
            throw new Error("Collection index out of bounds");
        }
    };
    P.ArrayCollection.prototype.appendItem = function (item) {
        /// <summary>Adds data into the collection before it is loaded</summary>
        /// <param name="item" type="Object"/>
        Debug.assert(!this.isLoaded, "Attempting to populate collection [" + this.name + "] after it is loaded");
        this._items.push(item);
    };
    P.ArrayCollection.prototype.loadComplete = function () {
        /// <summary>Marks the collection as loaded</summary>
        Debug.assert(!this.isLoaded, "Attempting to mark collection [" + this.name + "] as loaded redundantly");
        this.length = this._items.length;

        this.isLoaded = true;
        this.raiseEvent("load", { target: this, length: this.length });
    };
    /* @bind(P.ArrayCollection) */function handleChange(change) {
        /// <param name="change" type="Plat.CollectionChangedEventArgs" />
        this._changeHandlers[change.eType].apply(this, arguments);
    };
    P.ArrayCollection.prototype._changeHandlers = {};
    P.ArrayCollection.prototype._changeHandlers[Plat.CollectionChangeType.itemAdded] = /*@bind(P.ArrayCollection)*/function (change, index) {
        /// <param name="change" type="Plat.CollectionChangedEventArgs" />
        this._items.splice(change.index, 0, this._pendingItems[index]);
    };
    P.ArrayCollection.prototype._changeHandlers[Plat.CollectionChangeType.itemRemoved] = /*@bind(P.ArrayCollection)*/function (change) {
        /// <param name="change" type="Plat.CollectionChangedEventArgs" />
        this._items.splice(change.index, 1);
    };
    P.ArrayCollection.prototype._changeHandlers[Plat.CollectionChangeType.itemChanged] = /*@bind(P.ArrayCollection)*/function (change) {
        /// <param name="change" type="Plat.CollectionChangedEventArgs" />
        var indexFrom = change.previousIndex;
        var indexTo = change.index;
        var item = this._items.splice(indexFrom, 1)[0];
        this._items.splice(indexTo > indexFrom ? indexTo - 1 : indexTo, 0, item);
    };
    P.ArrayCollection.prototype.acceptPendingChanges = function () {
        var changesPending = this._pendingChanges;
        changesPending.forEach(handleChange, this);
        Debug.assert(this._items.length === this._pendingDelta + this.length);

        this.length = this._items.length;
        this._pendingChanges = [];
        this._pendingItems = {};
        this._pendingDelta = 0;
        this.raiseEvent("changesApplied", { target: this, changes: changesPending });
        return changesPending;
    };

    P.TotalCounter = /* @constructor*/function (collection, listener) {
        ///<param name='collection' type='P.Collection'/>
        Debug.assert(collection.isLoaded);
        this._collection = collection;
        this._listener = listener;
        this.count = 0;
        for (var i = 0, len = collection.length; i < len; i++) {
            var inner = /*@static_cast(P.Collection)*/collection.getItem(i).collection;
            inner.addListener("load", this._onLoaded, this);
            inner.addListener("changesApplied", this._onChanges, this);
            this.count += inner.length;
        }
    };

    P.TotalCounter.prototype.dispose = function () {
        var collection = this._collection;
        this._collection = null;
        this._listener = null;
        for (var i = 0, len = collection.length; i < len; i++) {
            var inner = /*@static_cast(P.Collection)*/collection.getItem(i).collection;
            inner.removeListener("load", this._onLoaded, this);
            inner.removeListener("changesApplied", this._onChanges, this);
        }
    };

    P.TotalCounter.prototype._onLoaded = function (/*@dynamic*/ev) {
        this._reset();
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._listener.totalCountChanged(this.count);
    };

    P.TotalCounter.prototype._reset = function () {
        this.count = 0;
        var collection = this._collection;
        for (var i = 0, len = collection.length; i < len; i++) {
            var inner = /*@static_cast(P.Collection)*/collection.getItem(i).collection;
            this.count += inner.length;
        }
    };

    P.TotalCounter.prototype._onChanges = function (/*@dynamic*/ev) {
        if (ev.changes.length === 1 && ev.changes[0].eType === Plat.CollectionChangeType.reset) {
            this._reset();
        } else {
            ev.changes.forEach(/*@bind(P.TotalCounter)*/function (/*@type(Plat.CollectionChangedEventArgs)*/change) {
                if (change.eType === Plat.CollectionChangeType.itemAdded) {
                    this.count++;
                } else if (change.eType === Plat.CollectionChangeType.itemRemoved) {
                    this.count--;
                }
            }, this);
        }
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._listener.totalCountChanged(this.count);
    };
});
