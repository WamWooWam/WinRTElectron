
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Collection.js"/>
/// <reference path="SortedCollection.js"/>

Jx.delayDefine(Mail, "FilteredCollection", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    Mail.FilteredCollection = /*@constructor*/function (filter, collection, collectionName) {
        /// <summary>Collection wrapper that enables filtering an underlying collection. This is
        /// only suitable for relatively SMALL collections. This should NEVER be used in a place
        /// where virtualization is required.</summary>
        /// <param name='filter'>Class that controls the filter of
        /// the underlying collection via a matches method. Additionally, FilteredCollection provides
        /// this class an opportunity to hook and unhook changes as items are added/removed so that
        /// it can tell us to re-filter when necessary.</param>
        /// <param name='collection' type='Mail.Collection'/>
        /// <param name='collectionName' type='String' optional='true'/>
        Mail.CollectionWrapper.call(this, collection, collectionName || ("filter:" + collection.name));

        this._filter = filter;
        this._filter.setCallback(this.update, this);

        // Apply the initial filter
        this._init();
        Debug.only(Object.seal(this));
    };

    Jx.inherit(Mail.FilteredCollection, Mail.CollectionWrapper);

    Mail.FilteredCollection.prototype.dispose = function () {
        if (this._collection) {
            this._collection.forEach(this._filter.unhook, this._filter);
            Mail.CollectionWrapper.prototype.dispose.call(this);
            this._collection = null;
        }
    };

    Object.defineProperty(Mail.FilteredCollection.prototype, "count", { get: function () {
        return this._filtered.length;
    } });

    Mail.FilteredCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._filtered.length);
        return this._filtered[index].item;
    };

    Mail.FilteredCollection.prototype.update = function (item) {
        // Allow the filter state of an item to be updated
        var index = this.indexOf(item);
        if (!this._filter.matches(item)) {
            // Item no longer matches, remove it
            this._remove(item, index);
        } else if (index === -1) {
            // Item matches and isn't in our filter, add it
            this._add(this._collection.indexOf(item), item);
        }
    };

    Mail.FilteredCollection.prototype._onCollectionChanged = function (/*@type(P.CollectionChangedEventArgs)*/ev) {
        // Respond to changes in the underlying collection changes
        var oldIndex = adjustEntries(this._filtered, ev);
        switch (ev.eType) {
            case ChangeType.itemRemoved: this._itemRemoved(ev, oldIndex); break;
            case ChangeType.itemAdded:   this._itemAdded(ev); break;
            case ChangeType.itemChanged: this._itemChanged(ev, oldIndex); break;
            case ChangeType.reset:       this._reset(ev); break;
            case ChangeType.batchBegin:
            case ChangeType.batchEnd:
                this._raiseChange({ eType: ev.eType });
                break;
            default:
                Debug.assert(false, "Unexpected change type: " + ev.eType);
                break;
        }
    };

    Mail.FilteredCollection.prototype._itemAdded = function (ev) {
        // Add the item to our cloned array and hook for changes
        var added = this._collection.item(ev.index);
        this._filter.hook(added);

        // Add the new item if it matches our filter
        if (this._filter.matches(added)) {
            this._add(ev.index, added);
        }
    };

    Mail.FilteredCollection.prototype._add = function (originalIndex, item) {
        if (originalIndex !== -1) {
            // Add the item to our filter and fire the change
            var entry = { item: item, baseIndex: originalIndex };
            var index = binarySearch(this._filtered, entry, compareBaseIndex);
            this._filtered.splice(index, 0, entry);
            this._raiseAdded(item, index);
        }
    };

    Mail.FilteredCollection.prototype._itemRemoved = function (ev, index) {
        // Remove the item if it was previously in our filter
        var removed = ev.removed[0];
        this._remove(removed, index);

        // Unhook changes
        this._filter.unhook(removed);
    };

    Mail.FilteredCollection.prototype._remove = function (item, index) {
        if (index !== -1) {
            // Remove the item and fire the change
            var entry = this._filtered.splice(index, 1)[0];
            Debug.assert(entry.item.objectId === item.objectId);

            this._raiseRemoved(item, index);
        }
    };

    Mail.FilteredCollection.prototype._itemChanged = function (ev, oldIndex) {
        // Respond to items moving in the underlying collection
        if (oldIndex !== -1) {
            // Move the entry to its updated position
            var filtered = this._filtered;
            var entry = filtered.splice(oldIndex, 1)[0];
            var newIndex = binarySearch(filtered, entry, compareBaseIndex);
            filtered.splice(newIndex, 0, entry);

            // Fire the change
            if (oldIndex !== newIndex) {
                this._raiseMoved(entry.item, oldIndex, newIndex);
            }
        }
    };

    Mail.FilteredCollection.prototype._reset = function (ev) {

        ev.removed.forEach(this._filter.unhook, this._filter);

        var removed = this._filtered.map(function (entry) { return entry.item; });

        // Recreate the filtered items
        this._init();

        this._raiseChange({ eType: ChangeType.reset, removed: removed });
    };

    Mail.FilteredCollection.prototype._init = function () {
        _markStart("_init:" + this._logString);
        this._filtered = [];
        this._collection.forEach(function (item, index) {
            this._filter.hook(item);
            if (this._filter.matches(item)) {
                this._filtered.push({ item: item, baseIndex: index });
            }
        }, this);
        _markStop("_init:" + this._logString);
    };

    function compareBaseIndex(a, b) { return a.baseIndex - b.baseIndex; }

    var binarySearch = Mail.SortedCollection.binarySearch,
        adjustEntries = Mail.SortedCollection.adjustEntries;


    function _markStart(str) {
        Jx.mark("Mail.FilteredCollection." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.FilteredCollection." + str + ",StopTA,Mail");
    }
        
});

