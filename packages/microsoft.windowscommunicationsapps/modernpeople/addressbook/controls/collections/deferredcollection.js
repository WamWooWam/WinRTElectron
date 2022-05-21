
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/Mocks/Platform/Collection.js"/>
/// <reference path="PlatformCollectionWatcher.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>
/// <disable>JS2076.IdentifierIsMiscased</disable>  Caused by namespace definition

Jx.delayDefine(People, "DeferredCollection", function () {
    
"use strict";
var P = window.People;
var Plat = Microsoft.WindowsLive.Platform;

var DeferredCollection = P.DeferredCollection = /* @constructor*/function (collection, listener) {
    ///<summary>A deferred collection looks similar to a contacts platform collection.  It updates on the callers terms,
    ///not on its own.  The collection is effectively maintained in a frozen state.  When changes occur, the colllection
    ///calls its listener's onChangesPending function.  The caller can continue using the collection as if those changes
    ///have not occured.  At some point, he can call acceptPendingChanges to inspect the changes onto which the deferred
    ///collection is holding and to apply those changes to the collection.  The collection will reset its internal
    ///pendingChanges array to a zero-length array and start accruing a new set of pending changes as they come in.
    ///
    ///The only exception is when the platform fires a reset event, in this case the deferredCollection is incapable
    ///of maintaining the id's of the existing items.  If the listener cares about the consistency of the ID's across the
    ///the reset, it will have a onResetPending function defined such that it could be notified in case of a reset.
    ///Otherwise, the collection will call the listener's onChangesPending function.
    ///
    ///While this can be easily accomplished using a clone of the collection, it is desirable to avoid this sort of
    ///unnecessary duplication, particularly when the collection may be quite large.  Instead, the collection will
    ///perform a series of index adjustments to maintain the illusion of a frozen copy of the array.
    ///
    ///This approach has one limitation: when an item is removed from the collection, no index translation can bring it
    ///back.  Attempts to access that item will return null.
    ///</summary>
    ///<param name="collection" type="Mocks.Microsoft.WindowsLive.Platform.Collection" />
    this._realCollection = new P.PlatformCollectionWatcher(collection, new P.Callback(this._collectionChanged, this));
    this._pendingChanges = [];
    this._length = collection.count;
    this._listener = listener;
    this._pendingBatchNotifications = 0;

    collection.unlock();

    Debug.only(Object.seal(this));
};
Object.defineProperty(DeferredCollection.prototype, "length", {
    get: function () {
        return this._length;
    }
});

DeferredCollection.updateIndex = function (pendingChanges, index) {
    return DeferredCollection.updateIndexEx(pendingChanges, index).index;
};

DeferredCollection.updateIndexEx = function (pendingChanges, index) {
    /// <summary>
    /// This function takes the index of an element in the collection before any changes are applied
    /// and returns the index of the element in the new collection.
    /// Consider the following,
    /// Before      [0, 1, 2, $]     After     [0, *, $]
    /// The changes in this case would be {Remove at index 1}, {insert at index 1}, {Remove at index 1}
    /// Calling updateIndex(changes, 3) is equivalent to "Tell me the index of $ in the new collection"
    /// updateIndex would return 2.  $ is now at index 2
    /// </summary>
    /// <param name="pendingChanges" type="Array">This list of pending change notifications</param>
    /// <param name="index" type="Number">The index to retrieve </param>

    Debug.assert(Jx.isArray(pendingChanges));
    Debug.assert(Jx.isValidNumber(index) && index >= 0);

    for (var iChange = 0, len = pendingChanges.length; iChange < len; iChange++) {
        var pendingChange = /* @static_cast(Mocks.Microsoft.WindowsLive.Platform.CollectionChangedEventArgs)*/pendingChanges[iChange];
        switch (pendingChange.eType) {
            case Plat.CollectionChangeType.reset:
                return {
                    removedObjectId : "",
                    index : DeferredCollection.removed
                };
            case Plat.CollectionChangeType.itemRemoved:
                if (pendingChange.index === index) {
                    // The item at the desired index was removed.
                    return {
                        removedObjectId : pendingChange.objectId,
                        index : DeferredCollection.removed
                    };
                } else if (pendingChange.index < index) {
                    // The desired item was after this removal, which shifted the index down.
                    index--;
                }
            break;

        case Plat.CollectionChangeType.itemAdded:
            if (pendingChange.index <= index) {
                // The desired item was after this insertion, which pushed the index up.
                index++;
            }
            break;

        case Plat.CollectionChangeType.itemChanged:
            if (pendingChange.previousIndex === index) {
                // The desired item moved.  Update the index to follow it.
                index = pendingChange.index;
            } else {
                if (pendingChange.previousIndex < index) {
                    // An item moved from before the desired item, shifting its index down.
                    index--;
                }
                if (pendingChange.index <= index) {
                    // An item moved in before the desired item, bumping its index up.
                    index++;
                }
            }
            break;

        case Plat.CollectionChangeType.batchBegin:
        case Plat.CollectionChangeType.batchEnd:
            break;

        default:
            Debug.assert(false, "Unrecognized change type: " + String(pendingChange.eType));
            break;
        }
    }

    Debug.assert(index >= 0);
    return {
        removedObjectId: "",
        index: index
    };
};

DeferredCollection.prototype.getItemId = function (index) {
    /// <summary>This function returns the objectId of an item, regardless of whether it is deleted or not</summary>
    var objectId = "";
    var result = DeferredCollection.updateIndexEx(this._pendingChanges, index);
    if (result.index === DeferredCollection.removed) {
        objectId = result.removedObjectId;
    } else {
        var item = this._realCollection.item(result.index);
        objectId = item.objectId;
    }
    Debug.assert(Jx.isNonEmptyString(objectId));
    return objectId;
};

DeferredCollection.prototype.getItem = function (index) {
    ///<param name="index" type="Number"/>
    var updatedIndex = DeferredCollection.updateIndex(this._pendingChanges, index);
    return (updatedIndex !== DeferredCollection.removed) ?  this._realCollection.item(updatedIndex) : null;
};
var changeOffset = {};
changeOffset[Plat.CollectionChangeType.itemAdded] = 1;
changeOffset[Plat.CollectionChangeType.itemRemoved] = -1;
changeOffset[Plat.CollectionChangeType.itemChanged] = 0;

function addChanges(sum, change) {
    ///<param name="change" type="Plat.CollectionChangedEventArgs" />
    return sum + changeOffset[change.eType];
}

DeferredCollection.prototype.acceptPendingChanges = function () {
    ///<summary>Returns the pending change array.</summary>
    ///<returns type="Array">The pending changes</returns>
    Debug.assert(this._isReset() || this._realCollection.getCount() === /*@static_cast(Number)*/this._pendingChanges.reduce(addChanges, this._length));
    this._length = this._realCollection.getCount();
    var pendingChanges = this._pendingChanges;
    this._pendingChanges = [];
    return pendingChanges;
};

DeferredCollection.prototype.getFirstPendingChange = function () {
    /// <summary>returns the first pendingChange from the buffer and updates its length.
    /// This function is used extensively by Mail in MessageListCollection
    /// </summary>
    var change = /*@static_cast(Plat.CollectionChangedEventArgs)*/ this._pendingChanges.shift();

    // Adjust the length of the collection
    if (this._isReset()) {
        this._length = this._realCollection.getCount();
    } else {
        var countOffset = changeOffset[change.eType];
        Debug.assert(Jx.isNumber(countOffset));
        this._length += countOffset;
    }
    return change;
};

DeferredCollection.prototype.dispose = function () {
    ///<summary>Cleans up</summary>
    this._realCollection.dispose();
};
DeferredCollection.prototype._getAugmentedChange = function (change) {
    ///<param name="change" type="Plat.CollectionChangedEventArgs" />
    return change;
};

DeferredCollection.prototype._reportReset = function (change) {
    /// <summary>
    /// if the listener has a reset handler, then we will invoke the onResetPending handler
    /// </summary>
    ///<param name="change" type="Plat.CollectionChangedEventArgs" />
    /// <returns type="Boolean">Whether the reset event is notified</returns>
    this._pendingChanges = [ change ];

    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
    if (Jx.isFunction(this._listener.onResetPending)) {
        this._listener.onResetPending();
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
        return true;
    }
    return false;
};

DeferredCollection.prototype._collectionChanged = function (sender, change) {
    ///<summary>Called when the real collection changes.  Stores the change away for future application and notifies the consumer.</summary>
    ///<param name="sender" type="P.PlatformCollectionWatcher" />
    ///<param name="change" type="Plat.CollectionChangedEventArgs" />
    Debug.assert(sender === this._realCollection);

    var reportChangesPending = (this._pendingChanges.length === 0);
    // if this is a reset event and it is reported to the listener, early return
    if (change.eType === Plat.CollectionChangeType.reset && this._reportReset(change)) {
        return;
    }
    if (!this._isReset() && change.eType !== Plat.CollectionChangeType.batchBegin && change.eType !== Plat.CollectionChangeType.batchEnd) {
        this._pendingChanges.push(this._getAugmentedChange(change));
    } else if (change.eType === Plat.CollectionChangeType.batchBegin) {
        this._pendingBatchNotifications++;
    } else if (change.eType === Plat.CollectionChangeType.batchEnd) {
        Debug.assert(this._pendingBatchNotifications > 0);
        this._pendingBatchNotifications--;
    }

    if (reportChangesPending) {
        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        this._listener.onChangesPending(sender, this);
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
    }
};
DeferredCollection.prototype._isReset = function () {
    return this._pendingChanges.length === 1 && this._pendingChanges[0].eType === Plat.CollectionChangeType.reset;
};

Object.defineProperty(DeferredCollection.prototype, "hasPendingChanges", { get: function () { return this._pendingChanges.length !== 0; }});
Object.defineProperty(DeferredCollection.prototype, "isProcessingBatchNotifications", { get: function () { return this._pendingBatchNotifications !== 0; }});

DeferredCollection.removed = -1;
});

