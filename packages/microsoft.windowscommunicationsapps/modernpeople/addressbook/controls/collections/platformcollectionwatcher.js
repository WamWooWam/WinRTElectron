
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../Shared/JSUtil/Namespace.js"/>
/// <reference path="../../../Shared/JSUtil/Callback.js"/>
/// <reference path="../../../Shared/Mocks/Platform/Collection.js"/>
/// <reference path="DeferredCollection.js"/>
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js"/>

/// <disable>JS2052.UsePrefixOrPostfixOperatorsConsistently</disable>

Jx.delayDefine(People, "PlatformCollectionWatcher", function () {

var P = window.People;
var Plat = Microsoft.WindowsLive.Platform;

/// <disable>JS2076.IdentifierIsMiscased</disable>
var PlatformCollectionWatcher = P.PlatformCollectionWatcher = /* @constructor*/function (collection, callback) {
    ///<summary>The stated purpose of the PlatformCollectionWatcher, the one it will fill when we ship, is to manage 
    ///the event subscription to a platform collection, hooking the change event on creation and unhooking it on
    ///dispose.  Because hooking that event sets up a circular reference, it is imperative that these objects are
    ///manually disposed: otherwise they will remain active even after all other references are gone, keeping the
    ///platform collections alive, listening to changes in the database and updating.  To keep the client from having 
    ///to juggle multiple objects, the PlatformCollectionWatcher will take ownership over the collection and forward
    ///methods through.
    ///
    ///The secondary, debug purpose of this code is to watch for discrepencies in the collection.  This is a historical
    ///trouble spot: when a notification is lost or inaccurate, an event-drive UX can drift out of sync.  A virtualized
    ///UI may fail as it attempts to realize items that no longer exist.  To that end, this class maintains a parallel
    ///array of ids and performs a customizable set of verifications.  At its minimal level, it makes sure that subsequent
    ///requests for the same index return the same object, and that notifications about that index have the right id.
    ///Beyond that, it can check for duplicates in the collection, and verify that the contents of the collection match 
    ///what has been recorded to varying degrees of breadth and frequency.</summary>
    ///<param name="collection" type="Mocks.Microsoft.WindowsLive.Platform.Collection">The platform collection to monitor</param>
    ///<param name="callback" type="P.Callback">The callback to invoke when the collection changes</param>
    this._collection = collection;
    var listener = this._listener = this._collectionChanged.bind(this);
    collection.addEventListener("collectionchanged", listener);
    this._callback = callback;

    
    if (isVerificationEnabled()) {
        this._initializeTracking();
    }
    
};
/// <enable>JS2076.IdentifierIsMiscased</enable>

PlatformCollectionWatcher.prototype._initializeTracking = function () {
    ///<summary>Allocates the tracking array, and populates it if desired</summary>
        ///<param name="collection" type="Mocks.Microsoft.WindowsLive.Platform.Collection"/>
    ///<returns type="Boolean">True if this function initializes tracking.  False if it is already initialized</returns>
    if (this._trackedIds === null) {
        this._trackedIds = Array(this._collection.count);
        if (checkLevel(Level.paranoid)) {
            this._performFullScan();
        }
        return true;
    }
    return false;
};

PlatformCollectionWatcher.prototype.getCount = function () {
    var count = this._collection.count;
    Debug.assert(!isVerificationEnabled() || count === this._trackedIds.length, "Collection length mismatch");
    return count;
};
PlatformCollectionWatcher.prototype.item = function (index) {
    ///<summary>Calls item on the underlying collection and verifies the legitimacy of the result</summary>
    ///<param name="index" type="Number"/>
        ///<returns type="Mocks.Microsoft.WindowsLive.Platform.Object"/>
    var item = this._collection.item(index);
    
    if (isVerificationEnabled()) {

        this._initializeTracking();

        // Check whether the id of the item we just retrieved matches our map
        if (item !== null) {
            var itemId = item.objectId;
            var expectedId = this._trackedIds[index];
            Debug.assert(itemId === undefined || expectedId === undefined || itemId === expectedId, "Unexpected item in collection"); 

            // If the item is new to us, make sure it wasn't already seen elsewhere
            Debug.assert(!checkLevel(Level.aggressive) || expectedId !== undefined || this._trackedIds.indexOf(itemId) === -1, "Duplicate item in collection");

            // Track the item
            this._trackedIds[index] = itemId;
        }
    }
    
    return item;
};
PlatformCollectionWatcher.prototype.dispose = function () {
    ///<summary>Unhooks the change event and disposes the collection</summary>
    var collection = this._collection,
        listener = this._listener;

    this._collection = null;
    this._listener = null;

    if (collection) {
        collection.removeEventListener("collectionchanged", listener);
        collection.dispose();
    }
};

PlatformCollectionWatcher.prototype._performFullScan = function () {
    ///<summary>Can be called to check the entire contents of a collection</summary>
        ///<param name="collection" type="Mocks.Microsoft.WindowsLive.Platform.Collection"/>
    if (isVerificationEnabled()) {
        for (var i = 0, len = this.getCount(); i < len; ++i) {
            this.item(i);
        }
    }
};

PlatformCollectionWatcher.prototype._collectionChanged = function (ev) {
    ///<summary>Called when the consumer receives a notification about the collection, to verify the validity of the notification and to update the
    ///tracking information.</summary>
    ///<param name="ev" type="ABIEvent">A projection of CollectionChangedHandler into the DOM L2 events pattern</param>

    
    if (isVerificationEnabled()) {
 
        if (!this._initializeTracking()) { // If we just initialized the tracking array, we will have done so looking at
                                           // a collection that already contains this change. So skip the update. 
            var collection = /*@static_cast(Plat.Collection)*/ev.target;
            var change = /*@static_cast(Plat.CollectionChangedEventArgs)*/ev.detail[0];
            switch (change.eType) {
                case Plat.CollectionChangeType.itemAdded:
                    // Verify that the insertion is in bounds
                    Debug.assert(change.index <= this._trackedIds.length, "Index out of bounds during add notification");

                    // Verify that the inserted item hasn't already been seen
                    Debug.assert(!checkLevel(Level.aggressive) || this._trackedIds.indexOf(change.objectId) === -1, "Duplicate item in add notification");

                    // Verify that the item in the notification matches the collection
                    Debug.assert(!checkLevel(Level.suspicious) || collection.item(change.index).objectId === change.objectId, "Mismatch between add notification and collection state");

                    // Update tracking
                    this._trackedIds.splice(change.index, 0, change.objectId);
                    break;
                case Plat.CollectionChangeType.itemRemoved:
                    // Verify that the removal is in bounds
                    Debug.assert(change.index < this._trackedIds.length, "Index out of bounds during remove notification");

                    // Verify that the item being removed matches what's being tracked
                    var expectedId = this._trackedIds[change.index];
                    Debug.assert(expectedId === undefined || expectedId === change.objectId, "Item being removed does not match expectation");

                    // Update tracking
                    this._trackedIds.splice(change.index, 1);
                    break;
                case Plat.CollectionChangeType.itemChanged:
                    // Verify that the move is in bounds
                    Debug.assert(change.previousIndex < this._trackedIds.length, "Source index out of bounds during move notification");
                    Debug.assert(change.index < this._trackedIds.length, "Destination index out of bounds during move notification");

                    // Verify that the item in the notification matches the collection
                    Debug.assert(!checkLevel(Level.suspicious) || collection.item(change.index).objectId === change.objectId, "Mismatch between move notification and collection state");

                    // Verify that the item being moved matches what's being tracked
                    expectedId = this._trackedIds[change.previousIndex];
                    Debug.assert(expectedId === undefined || expectedId === change.objectId, "Item being moved does not match expectation");

                    // Update tracking
                    this._trackedIds.splice(change.previousIndex, 1);
                    this._trackedIds.splice(change.index, 0, change.objectId);
                    break;
                case Plat.CollectionChangeType.reset:
                    // Reset tracking
                    this._trackedIds = Array(collection.count);
                    break;
                case Plat.CollectionChangeType.batchBegin:
                case Plat.CollectionChangeType.batchEnd:
                    break;
                default:
                    Debug.assert(false, "Unrecognized change type: " + change.eType);
                    break;
            }
            Debug.assert(collection.count === this._trackedIds.length, "Collection length mismatch during notification");
            if (checkLevel(Level.obsessive)) {
                this._performFullScan();
            }
        }
    }
    
    this._callback.invoke([this, ev.detail[0]]);
};


PlatformCollectionWatcher.prototype._trackedIds = /* @static_cast(Array)*/null;

/// <disable>JS2076.IdentifierIsMiscased</disable>
var Level = PlatformCollectionWatcher.VerificationLevel = {
    none:       0, // Disables all verifications
    passive:    1, // Will track ids, but will not issue any new calls
    suspicious: 2, // Will fetch items and double-check their ids
    aggressive: 3, // Will actively search the collection for duplicates
    paranoid:   4, // Will track every id in the collection at startup
    obsessive:  5  // Will track every id in the collection on every change
};
/// <enable>JS2076.IdentifierIsMiscased</enable>

PlatformCollectionWatcher.verificationLevel = Level.passive;
function checkLevel(levelRequired) {
    ///<summary>Returns true if the current level is at the requested level or higher</summary>
    ///<param name="levelRequired" type="Number"/>
    ///<returns type="Boolean"/>
    return PlatformCollectionWatcher.verificationLevel >= levelRequired;
}
function isVerificationEnabled() {
    ///<summary>Returns true if any sort of verification is required. Used to shortcircuit the entire class</summary>
    ///<returns type="Boolean"/>
    return PlatformCollectionWatcher.verificationLevel !== Level.none;
}


});
