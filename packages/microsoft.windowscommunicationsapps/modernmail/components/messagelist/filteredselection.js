
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, ["FilteredSelection"], function () {
    "use strict";

    var FilteredSelection = Mail.FilteredSelection = function (indices, collection) {
        /// <summary>
        /// A object that filters out invalid items in the selection.  It also provides utility functions around the selection, e.g.
        /// indexOfObject, isIndexSelected, items, diff, etc.
        /// This helper object updates the selection indices lazily if the collection changes
        /// </summary>
        _markStart("Ctor");
        Debug.assert(Jx.isArray(indices));
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));
        this._selectedIndices = indices;
        this._collection = collection;


        this._collectionEventHook = new Mail.Disposer(
            new Mail.EventHook(this._collection, "itemAdded", this._onCollectionChanged, this),
            new Mail.EventHook(this._collection, "itemRemoved", this._onCollectionChanged, this),
            new Mail.EventHook(this._collection, "itemMoved", this._onCollectionChanged, this),
            new Mail.EventHook(this._collection, "reset", this._onCollectionChanged, this)
            );
        this._deletedItems = [];
        this._selectedItems = [];
        this._selectedIndices = [];
        this._logicalSelectedItems = null;
        this._objectIndexMap = {};

        indices.forEach(function (index) {
            if (index >= 0 && index < this._collection.count) {
                var node = this._collection.item(index);
                if (!node.pendingRemoval && node.selectable) {
                    this._selectedItems.push(node);
                    this._selectedIndices.push(index);
                    this._objectIndexMap[node.objectId] = index;
                }
            }
        }, this);
        this._dirty = false;
        _markStop("Ctor");
    };

    var prototype = FilteredSelection.prototype;
    prototype._ensure = function () {
        _markStart("_ensure");
        // rebuild the indices to reflect collection changes
        if (this._dirty) {
            var oldObjectIndexMap = this._objectIndexMap,
                oldSelectedItems = this._selectedItems,
                numSelectedItemsToRecover = oldSelectedItems.length;
            this._objectIndexMap = {};
            this._selectedIndices = [];
            this._selectedItems = [];

            for (var i = 0, count = this._collection.count; i < count; i++) {
                var item = this._collection.item(i),
                    id = item.objectId;
                // if the current item is in part of the selectedIds, put it in the data structure
                if (id in oldObjectIndexMap) {
                    this._objectIndexMap[id] = i;
                    this._selectedIndices.push(i);
                    this._selectedItems.push(item);
                    delete oldObjectIndexMap[id];
                    numSelectedItemsToRecover--;
                }

                // if we have gone through all the selected ids, early return
                if (numSelectedItemsToRecover === 0) {
                    break;
                }
            }
            // append the list of ids that are deleted
            oldSelectedItems.forEach(function (item) {
                if (item.objectId in oldObjectIndexMap) {
                    this._deletedItems.push(item);
                }
            }, this);
        }
        this._dirty = false;
        _markStop("_ensure");
    };

    prototype.dispose = function () {
        this._collectionEventHook.dispose();
    };

    prototype._onCollectionChanged = function () {
        this._dirty = true;
    };

    prototype.indexOfObject = function (objectId) {
        this._ensure();
        Debug.assert(Jx.isNonEmptyString(objectId));
        var index = this._objectIndexMap[objectId];
        return Jx.isNumber(index) ? index : -1;
    };

    prototype.isIndexSelected = function (index) {
        this._ensure();
        return this._selectedIndices.indexOf(index) !== -1;
    };

    
    function ensureSorted(array) {
        Debug.assert(Jx.isArray(array));
        if (array.length < 2) {
            return true;
        }
        for (var i = 1; i < array.length; i++) {
            if (array[i] <= array[i - 1]) {
                Debug.assert(false, "the input array is not sorted");
                return false;
            }
        }
        return true;
    }
    

    FilteredSelection.diff = function (oldSelection, newSelection) {
        Debug.assert(Jx.isArray(newSelection));
        Debug.assert(Jx.isArray(oldSelection));
        Debug.assert(ensureSorted(newSelection));
        _markStart("diff");
        var removed = [],
            added = [],
            i = 0,
            j = 0;

        while (i < newSelection.length || j < oldSelection.length) {
            if (i >= newSelection.length) {
                removed.push(oldSelection[j]);
                j++;
            } else if (j >= oldSelection.length) {
                added.push(newSelection[i]);
                i++;
            } else if (newSelection[i] === oldSelection[j]) {
                i++;
                j++;
            } else if (newSelection[i] < oldSelection[j]) {
                added.push(newSelection[i]);
                i++;
            } else if (newSelection[i] > oldSelection[j]) {
                removed.push(oldSelection[j]);
                j++;
            } else {
                Debug.assert(false, "infinite loop");
            }
        }
        _markStop("diff");
        return {
            added : added,
            removed : removed
        };
    };

    prototype.diff = function (newSelection) {
        this._ensure();
        var diff = Mail.FilteredSelection.diff(this._selectedIndices, newSelection);
        diff.deletedItems = this._deletedItems;
        return diff;
    };

    Object.defineProperty(prototype, "length", {
        get: function () {
            this._ensure();
            return this._selectedIndices.length;
        },
        enumerable: true
    });

    Object.defineProperty(prototype, "indices", {
        get: function () {
            this._ensure();
            return this._selectedIndices;
        },
        enumerable: true
    });

    Object.defineProperty(prototype, "items", {
        get: function () {
            this._ensure();
            return this._selectedItems;
        },
        enumerable: true
    });

    Object.defineProperty(prototype, "logicalItems", {
        get: function () {
            return this._logicalSelectedItems ? this._logicalSelectedItems : this._selectedItems;
        },
        set: function (items) {
            this._logicalSelectedItems = items;
        },
        enumerable: true
    });

    function _markStart(s) { Jx.mark("FilteredSelection." + s + ",StartTA,FilteredSelection"); }
    function _markStop(s) { Jx.mark("FilteredSelection." + s + ",StopTA,FilteredSelection"); }
});

