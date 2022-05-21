
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="../../../shared/Jx/Core/Jx.dep.js" />
/// <reference path="%_NTTREE%\drop\published\ModernContactPlatform\Microsoft.WindowsLive.Platform.js"/>
/// <reference path="../JSUtil/Include.js"/>
/// <reference path="../JSUtil/Namespace.js"/>
/// <reference path="../../AddressBook/Controls/Scheduler/JobSet.js"/>

Jx.delayDefine(People, "FetchContacts", function () {
    
    var P = People,
        Plat = Microsoft.WindowsLive.Platform;

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var FetchContacts = P.FetchContacts = /*@constructor*/function (platform, jobSet) {
        ///<summary>As a background task, this class prefetches the full set of contacts into memory, to avoid
        ///RPC hits during scrolling</summary>
        ///<param name="platform" type="Plat.Client"/>
        ///<param name="jobSet" type="P.JobSet"/>
        Debug.assert(Jx.isObject(platform), "Invalid parameter: platform");
        Debug.assert(Jx.isObject(jobSet), "Invalid parameter: jobSet");

        this._platform = platform;
        this._jobSet = jobSet.createChild();

        this._items = /*@static_cast(Array)*/null;
        this._position = 0;
        this._collection = /*@static_cast(Plat.ICollection)*/null;

        this._listener = this._onCollectionChanged.bind(this);

        var activation = Jx.activation;
        activation.addListener(activation.suspending, this._suspend, this);
        activation.addListener(activation.resuming, this._resume, this);

        this._queued = false;
        this._enqueue();
    };
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    FetchContacts.prototype.dispose = function () {
        this._reset();
        Jx.dispose(this._jobSet);
    };

    FetchContacts.prototype._suspend = function () {
        ///<summary>On suspend, drop the prefetched objects to reduce idle working set.  They will be reacquired on resume.</summary>
        this._reset();
    };

    FetchContacts.prototype._resume = function () {
        this._enqueue();
    };

    FetchContacts.prototype._reset = function () {
        ///<summary>Cleans up all fetched objects and the collection, and stops any queued work.</summary>
        this._items = null;
        this._position = 0;
        var collection = this._collection;
        if (collection !== null) {
            this._collection = null;
            try {
                collection.removeEventListener("collectionchanged", this._listener);
                collection.dispose();
            } catch (ex) {
                Jx.log.exception("Fetch contacts cleanup failed", ex);
            }
        }
        this._queued = false;
        this._jobSet.cancelJobs();
    };

    FetchContacts.prototype._backgroundFetch = function () {
        ///<summary>Issues the query for contacts and fetches them.  This function queues itself to be called again until its task is complete.</summary>
        msWriteProfilerMark("prefetch_start");
        
        if (!this._items) {
            Debug.assert(!this._collection);
            var collection = this._collection = this._platform.peopleManager.getPeopleNameBetween(Plat.OnlineStatusFilter.all, "", true, "", true);
            this._items = Array(collection.count);
            this._position = 0;
            collection.addEventListener("collectionchanged", this._listener);
            collection.unlock();
        } else {
            for (var i = itemsPerCall; i--; ) {
                this._fetchOneItem();
            }
        }

        msWriteProfilerMark("prefetch_stop");

        this._queued = false;
        this._enqueue();
    };

    FetchContacts.prototype._fetchOneItem = function () {
        ///<summary>Fetches a single item from the collection</summary>
        var person;
        var items = this._items;
        if (items) {
            var position = this._position;
            var len = items.length;
            while (position < len && items[position]) {
                position++;
            }
            if (position < len) {
                person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/this._collection.item(position);
                items[position++] = person;
            }
            this._position = position;
        }

        if (person) {
            try {
                // Potential reentrancy here, retain no state beyond this point
                // Access and discard a property to force realization of this item
                person.onlineStatus;
            } catch (ex) { }
        }
    };

    FetchContacts.prototype._enqueue = function () {
        ///<summary>Queues up a call to backgroundFetch if there is work to be done</summary>
        if (!this._queued && this._position < maxItems && (!this._items || this._position < this._items.length)) {
            this._queued = true;
            this._jobSet.addUIJob(this, this._backgroundFetch, null, P.Priority.fetchContacts);
        }
    };

    FetchContacts.prototype._onCollectionChanged = function (change) {
        ///<summary>Handles changes to the platform collection.</summary>
        ///<param name="change" type="Plat.CollectionChangedEventArgs"/>
        Debug.assert(Jx.isObject(change), "Invalid argument: change");

        // Don't update position if we removed the item located at position (or some item after position)
        if (Plat.CollectionChangeType.itemRemoved !== change.eType || change.index < this._position) {
            this._position = P.DeferredCollection.updateIndex([change], this._position);
        }

        switch (change.eType) {
            case Plat.CollectionChangeType.itemAdded:
                this._items.splice(change.index, 0, null);
                if (change.index < this._position) {
                    this._position = change.index;
                }
                break;
            case Plat.CollectionChangeType.itemChanged:
                var item = this._items.splice(change.previousIndex, 1)[0];
                this._items.splice(change.index, 0, item);
                if (!item && change.index < this._position) {
                    this._position = change.index;
                }
                break;
            case Plat.CollectionChangeType.itemRemoved:
                this._items.splice(change.index, 1);
                break;
            case Plat.CollectionChangeType.reset:
                // This should not happen, assuming suspend/resume events were correctly handled.  Start over.
                this._reset();
                break;
        }
        this._enqueue();
    };

    var maxItems = 2000; // Maximum number of items we will fetch
    var itemsPerCall = 5; // The number of items we will fetch per call to _backgroundFetch.
                          // This is tuned for performance on a loaded netbook, and needs to be small to avoid
                          // interrupting UI work.  If it goes quickly, the scheduler will make several calls
                          // per timeslice.

});
