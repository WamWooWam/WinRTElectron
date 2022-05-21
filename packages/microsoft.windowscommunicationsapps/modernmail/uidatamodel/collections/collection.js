
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft */

Jx.delayDefine(Mail, ["Collection","CollectionWrapper"], function () {
    "use strict";

    Mail.Collection = /*@constructor*/function (collectionName) {
        /// <summary>Base class for all collection interfaces/wrappers in mail. This intentionally
        /// mimics the platform interface so that this can be used in any piece of code that currently
        /// operates on a collection.</summary>
        /// <param name='collectionName' type='String' optional='true' />
        this.initEvents();
        this.name = collectionName || "<unnamed>";
        var logString = this._logString = "collection=" + Jx.uid() + " name=" + this.name;
        this.locked = true;

        _mark("ctor:" + logString);
    };

    Jx.augment(Mail.Collection, Jx.Events);
    Debug.Events.define(Mail.Collection.prototype, "collectionchanged", "unlocked");
    Mail.Collection.prototype.dispose = Jx.fnEmpty;

    // Delegate add/remove event listener to Jx.Events. These just won't have the third context param.
    Mail.Collection.prototype.addEventListener = Mail.Collection.prototype.addListener;
    Mail.Collection.prototype.removeEventListener = Mail.Collection.prototype.removeListener;

    
    Object.defineProperty(Mail.Collection.prototype, "count", { get: function () {
        Debug.assert(false, "Derived class must provide a count property");
    }, enumerable: true });

    Mail.Collection.prototype.item = function (index) {
        Debug.assert(false, "Derived class must provide an item indexer");
    };
    

    Mail.Collection.prototype.unlock = function () {
        if (this.locked) {
            this.locked = false;
            this.raiseEvent("unlocked", { target: this });
        }
    };

    // Helper for firing collection changes, ensures that target and detail are included
    Mail.Collection.prototype._raiseChange = function (/*@dynamic*/ev) {
        Debug.assert(!this.locked, "change while locked: " + this.name);
        Debug.assert(Jx.isDefined(ev.eType));

        _mark("_raiseChange:" + this._logString + " type=" + ev.eType +
            " id=" + ev.objectId + " index=" + ev.index + " prev=" + ev.previousIndex);

        ev.target = ev.target || this;
        ev.detail = ev.detail || [ev];
        this.raiseEvent("collectionchanged", ev);
    };

    Mail.Collection.prototype._raiseAdded = function (/*@dynamic*/item, index) {
        this._raiseChange({
            eType: Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded,
            objectId: item.objectId,
            index: index
        });
    };

    Mail.Collection.prototype._raiseRemoved = function (/*@dynamic*/item, index) {
        this._raiseChange({
            eType: Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved,
            objectId: item.objectId,
            index: index,
            removed: [item]
        });
    };

    Mail.Collection.prototype._raiseMoved = function (/*@dynamic*/item, previousIndex, index) {
        this._raiseChange({
            eType: Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged,
            objectId: item.objectId,
            index: index,
            previousIndex: previousIndex
        });
    };

    // Instance enumerators to make mail collections more like array
    Mail.Collection.prototype.forEach = function (fn, /*@optional,@dynamic*/context) { return Mail.Collection.forEach(this, fn, context); };
    Mail.Collection.prototype.indexOf = function (item) { return Mail.Collection.indexOf(this, item); };
    Mail.Collection.prototype.map = function (fn, /*@optional,@dynamic*/context) { return Mail.Collection.map(this, fn, context); };
    Mail.Collection.prototype.reduce = function (fn, /*@optional*/initial) { return Mail.Collection.reduce(this, fn, initial); };

    // Instance helpers for finding items in the collections
    Mail.Collection.prototype.find = function (fn, /*@optional*/context) { return Mail.Collection.find(this, fn, context); };
    Mail.Collection.prototype.findIndex = function (fn, /*@optional*/context) { return Mail.Collection.findIndex(this, fn, context); };
    Mail.Collection.prototype.findById = function (id) { return Mail.Collection.findById(this, id); };
    Mail.Collection.prototype.findIndexById = function (id) { return Mail.Collection.findIndexById(this, id); };

    // Static enumerators like those on array. These work on both on mail collections and platform collections
    Mail.Collection.forEach = function (/*@dynamic*/collection, /*@type(Function)*/fn, /*@optional*/context) {
        for (var i = 0, len = collection.count; i < len; i++) {
            fn.call(context, collection.item(i), i, collection);
        }
    };

    Mail.Collection.indexOf = function (/*@dynamic*/collection, /*@dynamic*/item) {
        // This uses findById instead of an object equality comparison because we may not get the same
        // instance across calls to a platform collection's item() method.
        return item ? Mail.Collection.findIndexById(collection, item.objectId) : -1;
    };

    Mail.Collection.map = function (/*@dynamic*/collection, /*@type(Function)*/fn, /*@optional*/context) {
        var len = collection.count,
            arr = Array(len);
        for (var i = 0; i < len; i++) {
            arr[i] = fn.call(context, collection.item(i), i, collection);
        }
        return arr;
    };

    Mail.Collection.reduce = function (/*@dynamic*/collection, /*@type(Function)*/fn, /*@optional*/initial) {
        var len = collection.count, index = 0, current;

        if (arguments.length < 3) {
            Debug.assert(len > 0, "Must provide an initial value");
            current = collection.item(0);
            index = 1;
        } else {
            current = initial;
        }

        for (; index < len; index++) {
            current = fn(current, collection.item(index), index, collection);
        }
        return current;
    };

    // Static find helpers to find the items in mail or platform collections
    Mail.Collection.find = function (/*@dynamic*/collection, /*@type(Function)*/fn, /*@optional*/context) {
        var index = Mail.Collection.findIndex(collection, fn, context);
        return index !== -1 ? collection.item(index) : null;
    };

    Mail.Collection.findIndex = function (/*@dynamic*/collection, /*@type(Function)*/fn, /*@optional*/context) {
        for (var i = 0, len = collection.count; i < len; i++) {
            if (fn.call(context, collection.item(i), i, collection)) {
                return i;
            }
        }
        return -1;
    };

    Mail.Collection.findById = function (/*@dynamic*/collection, /*@type(String)*/id) {
        var index = Mail.Collection.findIndexById(collection, id);
        return index !== -1 ? collection.item(index) : null;
    };

    Mail.Collection.findIndexById = function (/*@dynamic*/collection, /*@type(String)*/id) {
        return Mail.Collection.findIndex(collection, function (/*@dynamic*/candidate) { return candidate.objectId === id; });
    };


    // Base class for collections which wrap other collections to transform them in some way
    Mail.CollectionWrapper = /*@constructor*/function (/*@type(Mail.Collection)*/collection, /*@optional*/collectionName) {
        Debug.assert(Jx.isObject(collection));

        Mail.Collection.call(this, collectionName || ("wrap:" + collection.name));
        this._collection = collection;
        collection.addListener("collectionchanged", this._onCollectionChanged, this);

        // Inherit locked state from the inner collection
        this.locked = collection.locked;
        if (this.locked) {
            collection.addListener("unlocked", this._onCollectionUnlocked, this);
        }
    };

    Jx.inherit(Mail.CollectionWrapper, Mail.Collection);

    Mail.CollectionWrapper.prototype.dispose = function () {
        if (this.locked) {
            this._collection.removeListener("unlocked", this._onCollectionUnlocked, this);
        }
        this._collection.removeListener("collectionchanged", this._onCollectionChanged, this);
    };

    Mail.CollectionWrapper.prototype.unlock = function () {
        // Unlock the inner collection, we'll update our state in response to the unlocked event
        if (this.locked) {
            this._collection.unlock();
        }
    };

    Object.defineProperty(Mail.CollectionWrapper.prototype, "count", { get: function () {
        return this._collection.count;
    }, enumerable: true });

    Mail.CollectionWrapper.prototype._onCollectionUnlocked = function (/*@dynamic*/ev) {
        Debug.assert(ev.target === this._collection);
        Debug.assert(this.locked);

        this._collection.removeListener("unlocked", this._onCollectionUnlocked, this);
        Mail.Collection.prototype.unlock.call(this);
    };

    
    Mail.CollectionWrapper.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        Debug.assert(false, "Wrappers must respond to collection changes");
    };
    
    
    function _mark(str) {
        Jx.mark("Mail.Collection." + str);
    }

});

