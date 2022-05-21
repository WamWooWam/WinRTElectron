
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(Mail, "ConcatenatedCollection", function () {
    "use strict";

    Mail.ConcatenatedCollection = function (collections, collectionName) {
        /// <summary>Merges multiple sub-collections into a single concatenated collection</summary>
        /// <param name='collections' type='Array'/>
        /// <param name='collectionName' type='String' optional='true' />
        Mail.Collection.call(this, collectionName || "<concat>");
        this._collections = collections;

        // Aggregate the locked state of all the sub-collections
        this.locked = collections.every(function (collection) { return collection.locked; });

        // Listen for changes on all the sub-collections
        this._hook("collectionchanged", this._onCollectionChanged);
        if (this.locked) {
            this._hook("unlocked", this._onCollectionUnlocked);
        }
    };

    Jx.inherit(Mail.ConcatenatedCollection, Mail.Collection);

    Mail.ConcatenatedCollection.prototype.dispose = function () {
        if (this._collections) {
            if (this.locked) {
                this._unhook("unlocked", this._onCollectionUnlocked);
            }
            this._unhook("collectionchanged", this._onCollectionChanged);
            this._collections.forEach(Jx.dispose);
            this._collections = null;
        }
    };

    Object.defineProperty(Mail.ConcatenatedCollection.prototype, "count", { get: function () {
        /// <summary>Length of all the sub-collections</summary>
        return this._collections.reduce(function (count, /*@type(Mail.Collection)*/collection) {
            return count + collection.count;
        }, 0);
    } });

    Mail.ConcatenatedCollection.prototype.item = function (index) {
        /// <summary>Finds the desired item in the appropriate sub-collection</summary>
        Debug.assert(index >= 0 && index < this.count);
        for (var i = 0, len = this._collections.length; i < len; i++) {
            var collection  = /*@static_cast(Mail.Collection)*/this._collections[i];
            if (index < collection.count) {
                return collection.item(index);
            }
            index -= collection.count;
        }
        return null;
    };

    Mail.ConcatenatedCollection.prototype.unlock = function () {
        /// <summary>Ensure all our sub-collections are unlocked</summary>
        this._collections.forEach(function (/*@type(Mail.Collection)*/collection) {
            collection.unlock();
        });
    };

    Mail.ConcatenatedCollection.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        if (ev.eType === Microsoft.WindowsLive.Platform.CollectionChangeType.reset) {
            this._handleReset(ev);
        } else {
            this._handleChange(ev);
        }
    };

    Mail.ConcatenatedCollection.prototype._handleChange = function (/*@dynamic*/ev) {
        /// <summary>Finds changing sub-collection, performing the necessary index math on the notification</summary>
        var offset = 0, candidate;
        for (var i = 0, len = this._collections.length; i < len; i++) {
            candidate = /*@static_cast(Mail.Collection)*/this._collections[i];
            if (ev.target === candidate) {
                break;
            }
            offset += candidate.count;
        }
        Debug.assert(candidate === ev.target, "Sub-collection not found");

        this._raiseChange({
            eType: ev.eType,
            objectId: ev.objectId,
            previousIndex: ev.previousIndex + offset,
            index: ev.index + offset,
            removed: ev.removed
        });
    };

    Mail.ConcatenatedCollection.prototype._handleReset = function (/*@dynamic*/ev) {
        /// <summary>Handles a reset in the sub collection</summary>
        Debug.assert(ev.eType === Microsoft.WindowsLive.Platform.CollectionChangeType.reset);
        var removed = this._collections.reduce(function (/*@type(Array)*/prev, /*@type(Mail.Collection)*/collection) {
            if (collection === ev.target) {
                // Use the removed items from the specific colleciton being reset
                return prev.concat(ev.removed);
            } else {
                // TODO WinBlue Bug 131333
                // This isn't ideal because it will de-virtualize an entire sub-collection. For now
                // we'll rely on the assumption that these collections aren't backed by real queries.
                return prev.concat(collection.map(function (item) { return item; }));
            }
        }, []);

        this._raiseChange({ eType: ev.eType, removed: removed });
    };

    Mail.ConcatenatedCollection.prototype._onCollectionUnlocked = function (/*@dynamic*/ev) {
        Debug.assert(this.locked);
        this._unhook("unlocked", this._onCollectionUnlocked);
        Mail.Collection.prototype.unlock.call(this);
    };

    Mail.ConcatenatedCollection.prototype._hook = function (eventName, callback) {
        this._collections.forEach(/*@bind(Mail.ConcatenatedCollection)*/function (/*@type(Mail.Collection)*/collection) {
            collection.addListener(eventName, callback, this);
        }, this);
    };

    Mail.ConcatenatedCollection.prototype._unhook = function (eventName, callback) {
        this._collections.forEach(/*@bind(Mail.ConcatenatedCollection)*/function (/*@type(Mail.Collection)*/collection) {
            collection.removeListener(eventName, callback, this);
        }, this);
    };

});

