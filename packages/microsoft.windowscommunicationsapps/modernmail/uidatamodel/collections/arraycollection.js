
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Collection.js"/>

Jx.delayDefine(Mail, "ArrayCollection", function () {
    "use strict";

    Mail.ArrayCollection = /*@constructor*/function (items, collectionName) {
        /// <summary>Wrapper for building a heterogeneous collection of platform-like objects</summary>
        /// <param name='items' type='Array'>Initial set of items</param>
        /// <param name='collectionName' type='String' optional='true' />
        Mail.Collection.call(this, collectionName || "<array>");

        // Copy the initial set of items into our array
        this._items = items.slice(0);
    };

    Jx.inherit(Mail.ArrayCollection, Mail.Collection);

    Object.defineProperty(Mail.ArrayCollection.prototype, "count", { get: function () {
        return this._items.length;
    } });

    Mail.ArrayCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._items.length);
        return this._items[index];
    };

    Mail.ArrayCollection.prototype.insertItem = function (/*@dynamic*/item, /*@type(Number)*/index) {
        /// <summary>Adds the item at the specified index</summary>
        Debug.assert(0 <= index && index <= this._items.length);

        this._items.splice(index, 0, item);
        if (!this.locked) {
            this._raiseAdded(item, index);
        }
    };

    Mail.ArrayCollection.prototype.removeItem = function (/*@type(Number)*/index) {
        /// <summary>Removes the item at the specified index</summary>
        Debug.assert(0 <= index && index < this._items.length);

        var item = this._items.splice(index, 1)[0];
        if (!this.locked) {
            this._raiseRemoved(item, index);
        }
        return item;
    };

    Mail.ArrayCollection.prototype.moveItem = function (/*@type(Number)*/previousIndex, /*@type(Number)*/index) {
        /// <summary>Moves the item to the new position</summary>
        Debug.assert(0 <= previousIndex && previousIndex < this._items.length);
        Debug.assert(0 <= index && index < this._items.length);

        var item = this._items.splice(previousIndex, 1)[0];
        this._items.splice(index, 0, item);
        if (!this.locked) {
            this._raiseMoved(item, previousIndex, index);
        }
    };
});

