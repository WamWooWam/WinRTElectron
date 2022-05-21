
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Collection.js"/>

Jx.delayDefine(Mail, "SortedCollection", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    Mail.SortedCollection = /*@constructor*/function (host, collection, collectionName) {
        /// <summary>Collection wrapper that enables re-sorting an underlying collection. This is
        /// only suitable for relatively SMALL collections. This should NEVER be used in a place
        /// where virtualization is required.</summary>
        /// <param name='host'>Class that controls the sort of
        /// the underlying collection via a compare method. Additionally, SortedCollection provides
        /// this class an opportunity to hook and unhook changes as items are added/removed so that
        /// it can tell us to re-sort when necessary. The hook/unhook methods are called before items
        /// are inserted and after they're removed, respectively. These callouts are made while we
        /// update internal state, before firing events so it's important not to access these items
        /// via the params and not call back into the SortedCollection.</param>
        /// <param name='collection' type='Mail.Collection'/>
        /// <param name='collectionName' type='String' optional='true'/>
        Mail.CollectionWrapper.call(this, collection, collectionName || ("sort:" + collection.name));

        this._host = host;
        this._host.setCallback(this.update, this);

        // Sort the initial set of items
        this._init();
        Object.seal(this);
    };

    Jx.inherit(Mail.SortedCollection, Mail.CollectionWrapper);

    Mail.SortedCollection.prototype.dispose = function () {
        if (this._sorted) {
            Mail.CollectionWrapper.prototype.dispose.call(this);
            this._sorted.forEach(this._unhook, this);
            this._sorted = null;
        }
    };

    Object.defineProperty(Mail.SortedCollection.prototype, "count", { get: function () {
        return this._sorted.length;
    } });

    Mail.SortedCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._sorted.length);
        return this._sorted[index].item;
    };

    Mail.SortedCollection.prototype.update = function (item) {
        return this.updateById(item.objectId);
    };

    Mail.SortedCollection.prototype.updateById = function (id) {
        /// <summary>Recalculates the sort of an item when it changes.</summary>
        Debug.assert(!this.locked);

        // Find and remove the item from its old position
        var previousIndex = this.findIndexById(id);
        if (previousIndex !== -1) {
            this._updateIndex(previousIndex);
        }
    };

    Mail.SortedCollection.prototype._updateIndex = function (previousIndex) {
        var sorted = this._sorted;

        // Move the entry to it's new position
        var entry = sorted.splice(previousIndex, 1)[0];
        var newIndex = binarySearch(sorted, entry, this._compare, this);
        sorted.splice(newIndex, 0, entry);

        // Fire a change if it actually moved
        if (previousIndex !== newIndex) {
            this._raiseChange({
                eType: Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged,
                objectId: entry.item.objectId,
                index: newIndex,
                previousIndex: previousIndex
            });
        }
    };

    Mail.SortedCollection.prototype._init = function () {
        // Clear out our internal array during the duration of this call to help detect if
        // the host attempts to access the collection while given the hook/unhook opportunity.
        _markStart("_init:" + this._logString);
        this._sorted = [];

        // Create a new array of items and recalculate the sort
        var items = this._collection.map(function (item, index) {
            return { item: item, baseIndex: index };
        });
        items.sort(this._compare.bind(this));

        // Give the host the opportunity to hook changes on new items and apply the new sort
        items.forEach(this._hook, this);
        this._sorted = items;
        _markStop("_init:" + this._logString);
    };

    Mail.SortedCollection.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        /// <summary>Handles add/removes in the underlying collections, mapping them
        /// into our sorted array as appropriate</summary>
        var sorted = this._sorted,
            index = adjustEntries(sorted, ev),
            removed;

        switch (ev.eType) {
            case ChangeType.itemAdded:
                // Sort the new item into the collection
                var added = { item: this._collection.item(ev.index), baseIndex: ev.index };
                this._hook(added);
                index = binarySearch(sorted, added, this._compare, this);
                sorted.splice(index, 0, added);
                break;
            case ChangeType.itemRemoved:
                // Remove the item from the sorted collection
                removed = sorted.splice(index, 1);
                break;
            case ChangeType.reset:
                // Re-sort the entire collection
                removed = this._sorted;
                this._init();
                break;
            case ChangeType.batchBegin:
            case ChangeType.batchEnd:
                // Simply forward the batch change events
                break;
            case ChangeType.itemChanged:
                this._updateIndex(index);
                return; // The updateIndex call will fire any necessary event
            default:
                Debug.assert(false, "Unexpected change type: " + ev.eType);
                return;
        }

        if (removed) {
            removed.forEach(this._unhook, this);
        }

        Debug.assert(this._sorted.slice().sort(function (a, b) { return a.baseIndex - b.baseIndex; }).every(function (entry, index) { return entry.baseIndex === index; }));
        this._raiseChange({
            eType: ev.eType,
            objectId: ev.objectId,
            index: index,
            removed: removed ? removed.map(function (entry) { return entry.item; }) : null
        });
    };

    Mail.SortedCollection.prototype._compare = function (a, b) {
        return this._host.compare(a.item, b.item) ||
               (a.baseIndex - b.baseIndex); // Equal items fall back to base collection order
    };

    Mail.SortedCollection.prototype._hook = function (entry) {
        this._host.hook(entry.item);
    };

    Mail.SortedCollection.prototype._unhook = function (entry) {
        this._host.unhook(entry.item);
    };

    var adjustEntries = Mail.SortedCollection.adjustEntries = function (entries, ev) {
        var index = -1,
            collection = ev.target;
        switch (ev.eType) {
            case ChangeType.itemAdded:
                index = adjustBaseIndex(entries, collection.count, ev.index);
                break;
            case ChangeType.itemRemoved:
                index = adjustBaseIndex(entries, ev.index, collection.count);
                break;
            case ChangeType.itemChanged:
                index = adjustBaseIndex(entries, ev.previousIndex, ev.index);
                break;
        }
        Debug.assert(
            ev.eType === ChangeType.reset ||
            entries.every(function (entry, i) {
                return (index === i && entry.baseIndex === collection.count && ev.eType === ChangeType.itemRemoved) ||
                       collection.item(entry.baseIndex).objectId === entry.item.objectId;
            })
        );
        Debug.assert(index === -1 || entries[index].item.objectId === ev.objectId);
        return index;
    };

    function adjustBaseIndex(entries, baseFrom, baseTo) {
        /// <summary>Adjust the baseIndex values of the entries array to compensate for an item moving in the underlying
        /// collection.</summary>
        /// <returns type='Number'>The index in entries of the item that was moved, if present.  -1 if not.</returns>
        var fromIndex = -1;
        for (var i = 0, len = entries.length; i < len; i++) {
            var entry = entries[i],
                baseIndex = entry.baseIndex;
            if (baseIndex === baseFrom) {
                fromIndex = i;
                entry.baseIndex = baseTo;
            } else if (baseIndex > baseFrom && baseIndex <= baseTo) {
                entry.baseIndex = baseIndex - 1;
            } else if (baseIndex < baseFrom && baseIndex >= baseTo) {
                entry.baseIndex = baseIndex + 1;
            }
        }
        return fromIndex;
    }

    var binarySearch = Mail.SortedCollection.binarySearch = function (arr, item, compare, /*@optional*/context) {
        Debug.assert(arr.length !== undefined);
        Debug.ensureSorted(arr, compare, context);
        var beg = 0, end = arr.length;

        while (end > beg) {
            var mid = beg + ((end - beg) >>> 1);
            var cmp = compare.call(context, item, arr[mid]);

            if (cmp === 0) {
                return mid;
            } else if (cmp > 0) {
                beg = mid + 1;
            } else {
                end = mid;
            }
        }
        return beg;
    };

    
    Debug.ensureSorted = function (arr, compare, /*@optional*/context) {
        if (arr.length > 1) {
            arr.reduce(function (prev, next) { Debug.assert(compare.call(context, prev, next) < 0); return next; });
        }
    };
    

    function _markStart(str) {
        Jx.mark("Mail.SortedCollection." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.SortedCollection." + str + ",StopTA,Mail");
    }
});
