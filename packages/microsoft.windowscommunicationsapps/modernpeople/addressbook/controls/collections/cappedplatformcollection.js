
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="PlatformCollectionWatcher.js" />

/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, "CappedPlatformCollection", function () {
    
    "use strict";
    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    P.CappedPlatformCollection = /* @constructor*/function (collection, cappedCount) {
        ///<summary>A capped platform collection is a fairly thin wrapper around a platform collection object (ICollection).
        ///It has the same interface as platform collection and the interaction is (essentially) the same. The
        ///difference is that this case treats the collection as if there were only x-number of items in the collection,
        ///where 'x' is value specified by the host object.
        ///</summary>
        ///<param name="collection" type="Mocks.Microsoft.WindowsLive.Platform.Collection"/>
        ///<param name="cappedCount" type="Number"/>
        Jx.initEvents(this);
        this._realCollection = new P.PlatformCollectionWatcher(collection, new P.Callback(this._collectionChanged, this));
        this._cappedCount = cappedCount;

        Debug.only(Object.seal(this));
    };
    Debug.Events.define(P.CappedPlatformCollection.prototype, "collectionchanged");
    Object.defineProperty(P.CappedPlatformCollection.prototype, "count", {
        get: function () {
            return Math.min(this._cappedCount, this._realCollection.getCount());
        }
    });
    P.CappedPlatformCollection.prototype.unlock = function () {
        this._realCollection._collection.unlock();
    };
    P.CappedPlatformCollection.prototype.item = function (index) {
        ///<param name="index" type="Number"/>
        Debug.assert(index < this._cappedCount, "Index out of bounds!");
        var item;

        // Check to make sure we don't access anything beyound the capped value.
        // NOTE: we're intentionally ignoring the case where the actual count is less than the capped.
        // Handling that is external to the indention of this class.
        if (index < this._cappedCount) {
            item = this._realCollection.item(index);
        }
        return item;
    };
    P.CappedPlatformCollection.prototype.addEventListener = function (type, fn, /* @dynamic*/context) {
        ///<summary>Modelled after the platform collection events for easy conversion.  Adds an optional context parameter for easier binding.</summary>
        ///<param name="type" type="String">The event to hook</param>
        ///<param name="fn" type="Function">The callback function</param>
        ///<param name="context" optional="true">The callback object</param>
        Jx.addListener(this, type, fn, context);
    };
    P.CappedPlatformCollection.prototype.removeEventListener = function (type, fn, /* @dynamic*/context) {
        ///<summary>The inverse of addEventListener</summary>
        ///<param name="type" type="String">The event to unhook</param>
        ///<param name="fn" type="Function">The callback function</param>
        ///<param name="context" optional="true">The callback object</param>
        Jx.removeListener(this, type, fn, context);
    };
    P.CappedPlatformCollection.prototype.dispose = function () {
        ///<summary>Cleans up</summary>
        this._realCollection.dispose();
        this._realCollection = null;
    };
    P.CappedPlatformCollection.prototype._collectionChanged = function (sender, change) {
        ///<summary>Called when the real collection changes.</summary>
        ///<param name="change" type="Mocks.Microsoft.WindowsLive.Platform.CollectionChangedEventArgs" />
        Debug.assert(sender === this._realCollection);

        switch (change.eType) {
            case Plat.CollectionChangeType.itemAdded:
                // For adds, only send on the notification if it's whithin the bound of the capped value.
                if (change.index < this._cappedCount) {
                    // The change is within the capped bounds. Now we need
                    // to check if anything is getting (virtually) removed.
                    // That is, if our we're "full" we'll need to signal a removal
                    // of the last item in the collection.
                    if (this._realCollection.getCount() > this._cappedCount) {
                        // Signal a removal of an item
                        this._simulateRemoval(sender, this._cappedCount - 1);
                    }

                    // Now, signal the item add
                    this._fireCollectionChangeEvent(sender, change);
                };
                break;
            case Plat.CollectionChangeType.itemRemoved:
                // For removes, only on the notification if it's withing the capped bounds.
                if (change.index < this._cappedCount) {
                    var count = this._realCollection.getCount();
                    this._fireCollectionChangeEvent(sender, change);

                    // Now check to see if anything "new" will be added to the
                    // end of the list.
                    if (count >= this._cappedCount) {
                        // Signal an addition of an item
                        this._simulateAddition(sender, this._cappedCount - 1);
                    }
                }
                break;
            case Plat.CollectionChangeType.itemChanged:
                // Check to make sure we're within our bounds
                if (change.index < this._cappedCount || change.previousIndex < this._cappedCount) {
                    if (change.previousIndex >= this._cappedCount) {
                        // This should be handled like an addition
                        this._simulateRemoval(sender, this._cappedCount - 1);
                        this._simulateAddition(sender, change.index);
                    } else if (change.index >= this._cappedCount) {
                        // This should be handled like a removal
                        this._simulateRemoval(sender, change.previousIndex);
                        this._simulateAddition(sender, this._cappedCount - 1);
                    } else {
                        // Both the old and new indices are within the bounds, no extra events needed.
                        this._fireCollectionChangeEvent(sender, change);
                    }
                }
                break;
            case Plat.CollectionChangeType.reset:
                this._fireCollectionChangeEvent(sender, change);
                break;
            default:
                Debug.assert(false, "Unrecognized change type: " + String(change.eType));
                break;
        }
    };
    P.CappedPlatformCollection.prototype._simulateAddition = function (sender, indexAdded) {
        var additionChange = { eType: Plat.CollectionChangeType.itemAdded,
            index: indexAdded,
            previousIndex: -1,
            objectId: this._realCollection.item(indexAdded).objectId
        };
        this._fireCollectionChangeEvent(sender, additionChange);
    };
    P.CappedPlatformCollection.prototype._simulateRemoval = function (sender, indexRemoved) {
        var removalChange = { eType: Plat.CollectionChangeType.itemRemoved,
            index: indexRemoved,
            previousIndex: -1,
            objectId: this._realCollection.item(indexRemoved).objectId
        };
        this._fireCollectionChangeEvent(sender, removalChange);
    };
    P.CappedPlatformCollection.prototype._fireCollectionChangeEvent = function (sender, change) {
        ///<param name="change" type="Mocks.Microsoft.WindowsLive.Platform.CollectionChangedEventArgs" />
        Jx.raiseEvent(this, "collectionchanged", { target: sender, detail: [change] });
    };

});
