
//
// Copyright (C) Microsoft. All rights reserved.
//
/*jshint browser:true*/
/*global Mail,Jx,Debug,People,Microsoft*/

Jx.delayDefine(Mail, ["DeferredCollection", "MappedDeferredCollection"], function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ChangeType = Plat.CollectionChangeType;

    var DeferredCollection = Mail.DeferredCollection = /* @constructor*/function (collection, listener) {
        ///<summary>A deferred collection looks similar to a contacts platform collection.  It updates on the callers terms,
        ///not on its own.  The collection is effectively maintained in a frozen state.  When changes occur, the collection
        ///calls its listener's onChangesPending function.  The caller can continue using the collection as if those changes
        ///have not occurred.  At some point, he can call acceptPendingChanges to inspect the changes onto which the deferred
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
        ///<param name="collection" type="Mail.Collection" />
        ///<param name="listener" dynamic="true">An object that will be notified when changes are coming</param>
        Debug.assert(collection);
        Debug.assert(listener);
        Debug.assert(Jx.isFunction(listener.onChangesPending));
        this._realCollection = new People.PlatformCollectionWatcher(collection, new People.Callback(this._collectionChanged, this));
        this._pendingChanges = [];
        this._length = collection.count;
        this._listener = listener;
        collection.unlock();
    };

    Jx.inherit(DeferredCollection, Mail.Collection);

    var proto = DeferredCollection.prototype;
    Object.defineProperty(proto, "count", { get: function () {  return this._length; }});

    DeferredCollection.updateIndex = function (pendingChanges, index) {
        return Mail.DeferredCollection.updateIndexEx(pendingChanges, index).index;
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
            var pendingChange = /* @static_cast(Plat.CollectionChangedEventArgs)*/ pendingChanges[iChange];
            switch (pendingChange.eType) {
            case ChangeType.reset:
                return {
                    removedObjectId : "",
                    index : Mail.DeferredCollection.removed
                };
            case ChangeType.itemRemoved:
                if (pendingChange.index === index) {
                    // The item at the desired index was removed.
                    return {
                        removedObjectId : pendingChange.objectId,
                        index: Mail.DeferredCollection.removed
                    };
                } else if (pendingChange.index < index) {
                    // The desired item was after this removal, which shifted the index down.
                    index--;
                }
                break;

            case ChangeType.itemAdded:
                if (pendingChange.index <= index) {
                    // The desired item was after this insertion, which pushed the index up.
                    index++;
                }
                break;

            case ChangeType.itemChanged:
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

            case ChangeType.batchBegin:
            case ChangeType.batchEnd:
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

    proto.item = function (index) {
        ///<param name="index" type="Number"/>
        Debug.assert(!this._isReset(), "When there is a pending reset, the client can only request for items after it calls acceptPendingChanges");
        var result = Mail.DeferredCollection.updateIndexEx(this._pendingChanges, index);
        if (result.index === Mail.DeferredCollection.removed) {
            return {
                objectId : result.removedObjectId,
                pendingRemoval : true
            };
        }
        return this._realCollection.item(result.index);

    };
    var changeOffset = {};
    changeOffset[ChangeType.itemAdded] = 1;
    changeOffset[ChangeType.itemRemoved] = -1;
    changeOffset[ChangeType.itemChanged] = 0;
    
    function addChanges(sum, change) {
        ///<param name="change" type="Plat.CollectionChangedEventArgs" />
        return sum + changeOffset[change.eType];
    }
    

    proto.acceptPendingChanges = function () {
        ///<summary>Returns the pending change array.</summary>
        ///<returns type="Array">The pending changes</returns>
        Debug.assert(this._isReset() || this._realCollection.getCount() === this._pendingChanges.reduce(addChanges, this._length),
            " realCount:=" + this._realCollection.getCount() +
            " length:=" + this._length +
            " pendingChanges:= [" + this._pendingChanges.map(function (change) { return change.eType; }).join(" ") + "]"
            );

        var logInfo = "acceptPendingChanges numChanges:=" + this._pendingChanges.length;
        _markStart(logInfo);
        while (this.hasPendingChanges) {
            var change = this._getFirstPendingChange();
            this.raiseEvent("collectionchanged", change);
        }
        _markStop(logInfo);
    };

    proto._getFirstPendingChange = function () {
        /// <summary>returns the first pendingChange from the buffer and updates its length.
        /// This function is used extensively by Mail in MessageListCollection
        /// </summary>
        var change = this._pendingChanges.shift();

        // Adjust the length of the collection
        if (change.eType === ChangeType.reset) {
            this._length = this._realCollection.getCount();
        } else {
            var countOffset = changeOffset[change.eType];
            Debug.assert(Jx.isNumber(countOffset));
            this._length += countOffset;
        }
        return change;
    };

    proto.dispose = function () {
        ///<summary>Cleans up</summary>
        this._realCollection.dispose();
    };

    proto._reportReset = function (change) {
        /// <summary>
        /// if the listener has a reset handler, then we will invoke the onResetPending handler
        /// </summary>
        ///<param name="change" type="Plat.CollectionChangedEventArgs" />
        /// <returns type="Boolean">Whether the reset event is notified</returns>
        this._pendingChanges = [ change ];

        if (Jx.isFunction(this._listener.onResetPending)) {
            _markStart("_reportReset");
            this._listener.onResetPending();
            _markStop("_reportReset");
            return true;
        }
        return false;
    };

    proto._collectionChanged = function (sender, change) {
        ///<summary>Called when the real collection changes.  Stores the change away for future application and notifies the consumer.</summary>
        ///<param name="sender" type="People.PlatformCollectionWatcher" />
        ///<param name="change" type="Plat.CollectionChangedEventArgs" />
        Debug.assert(sender === this._realCollection);

        var isIncomingReset = (change.eType === ChangeType.reset),
            reportChangesPending = (this._pendingChanges.length === 0) || isIncomingReset;

        // if there is an existing reset, ignore the incoming changes, as we can no longer maintain the frozen state of the collection
        if (this._isReset() ||
        // if there is an incoming reset and it is reported to the listener, early return
            (isIncomingReset && this._reportReset(change))) {
            return;
        }

        switch (change.eType) {
        case ChangeType.itemRemoved:
        case ChangeType.itemAdded:
        case ChangeType.itemChanged:
            this._pendingChanges.push(change);
            break;
        }

        if (reportChangesPending) {
            this._listener.onChangesPending(sender, this);
        }
    };

    proto._isReset = function () {
        return this._pendingChanges.length === 1 && this._pendingChanges[0].eType === ChangeType.reset;
    };

    Object.defineProperty(proto, "hasPendingChanges", { get: function () { return this._pendingChanges.length !== 0; }});
    Object.defineProperty(proto, "pendingChangesCount", { get: function () { return this._pendingChanges.length; }});

    function _markStart(s) { Jx.mark("DeferredCollection." + s + ",StartTA,DeferredCollection"); }
    function _markStop(s) { Jx.mark("DeferredCollection." + s + ",StopTA,DeferredCollection"); }

    DeferredCollection.removed = -1;


    var MappedDeferredCollection = Mail.MappedDeferredCollection =  /*@constructor*/ function (collection, listener, factory, /*@dynamic,@optional*/ context, /*@optional*/collectionName) {
        ///<summary>
        ///A deferred collection on top of a collection that support caching, i.e it has a temporary reference to the deleted item.
        ///Such collection will fire the itemRemoved event with the item removed, which could be taken advantage of by the deferredCollection to
        ///never return a null item.
        ///</summary>
        ///<param name="collection" type="Mail.Collection" />
        ///<param name="listener" dynamic="true">An object that will be notified when changes are coming</param>
        ///<param name="factory" type="Function">Factory function to wrapped items</param>
        Mail.MappedCollection.call(this, new Mail.DeferredCollection(collection, listener), factory, context, collectionName);
    };

    Jx.inherit(MappedDeferredCollection, Mail.MappedCollection);

    var mappedPrototype = MappedDeferredCollection.prototype;
    mappedPrototype.acceptPendingChanges = function () {
        this._collection.acceptPendingChanges();
    };

    Object.defineProperty(mappedPrototype, "hasPendingChanges", { get: function () {
        return this._collection.hasPendingChanges;
    }, enumerable: true
    });

    Object.defineProperty(mappedPrototype, "pendingChangesCount", { get: function () {
        return this._collection.pendingChangesCount;
    }, enumerable: true
    });
});

