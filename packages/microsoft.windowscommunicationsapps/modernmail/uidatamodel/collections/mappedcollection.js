
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Collection.js"/>

Jx.delayDefine(Mail, "MappedCollection", function () {
    "use strict";

    Mail.MappedCollection = /*@constructor*/function (collection, /*@type(Function)*/factory, /*@optional*/context, /*@optional*/collectionName) {
        /// <summary>Provides a simple mechanism for generically extending items in collections. This makes it
        /// easy to map from one type of item to another without having to worry about keeping the collections
        /// in sync. This class handles all of collection change events, creating/removing the wrapper items as
        /// needed and forwarding on these events. It's important to note that this class takes ownership of the
        /// provided collection and disposes the collection when it's disposed.</summary>
        /// <param name="collection" type="Mail.Collection"/>
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isFunction(factory));

        Mail.CollectionWrapper.call(this, collection, collectionName || ("map:" + collection.name));
        this._factory = factory;
        this._context = context;
        this._items = Array(collection.count);
    };

    Jx.inherit(Mail.MappedCollection, Mail.CollectionWrapper);

    Mail.MappedCollection.prototype.dispose = function () {
        if (this._collection) {
            Mail.CollectionWrapper.prototype.dispose.call(this);

            this._items.forEach(Jx.dispose);

            Jx.dispose(this._collection);
            this._collection = null;
        }
    };

    Object.defineProperty(Mail.MappedCollection.prototype, "count", {
        get: function () { return this._items.length; }, enumerable: true
    });

    Mail.MappedCollection.prototype._createItem = function (/*@dynamic*/ data, index) {
        return this._factory.call(this._context, data, index);
    };

    Mail.MappedCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._items.length);
        var item = this._items[index];
        if (!item) {
            item = this._items[index] = this._createItem(this._collection.item(index), index);
        }
        return item;
    };

    Mail.MappedCollection.prototype._onCollectionChanged = function (/*@dynamic*/ev) {
        var items = this._items, removed = [];

        var ChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;
        switch (ev.eType) {
            case ChangeType.itemAdded:
                var added = this._createItem(this._collection.item(ev.index), ev.index);
                items.splice(ev.index, 0, added);
                break;
            case ChangeType.itemRemoved:
                removed = items.splice(ev.index, 1);
                break;
            case ChangeType.itemChanged:
                var moved = items.splice(ev.previousIndex, 1)[0];
                items.splice(ev.index, 0, moved);
                break;
            case ChangeType.reset:
                // Rebuild the collection
                removed = items;
                this._items = Array(this._collection.count);
                break;
            case ChangeType.batchBegin:
            case ChangeType.batchEnd:
                break;
            default:
                Debug.assert(false, "Unexpected change type");
                break;
        }

        // Forward the event
        this._raiseChange({
            eType: ev.eType,
            objectId: ev.objectId,
            index: ev.index,
            previousIndex: ev.previousIndex,
            removed: removed
        });

        // Dispose any removed/reset items
        removed.forEach(Jx.dispose);
    };

});

