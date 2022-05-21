
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

Jx.delayDefine(Mail, "ItemDemux", function () {
    "use strict";

    // This class acts as a property change aggregator for items in a collection. It
    // hooks the "changed" event on every item and sources a singular "itemchanged"
    // event. This looks similar to a normal "changed" event with the item and collection
    // exposed as members of the event arguments. This allows for a single event listener
    // on item changes without having to manage when items are added or removed from
    // the owning collection.

    var ItemDemux = Mail.ItemDemux = function (collection) {
        Debug.assert(Jx.isObject(collection));
        this.initEvents();

        this._collection = collection;
        this._disposer = new Mail.Disposer(new Mail.EventHook(collection, "collectionchanged", this._onCollectionChanged, this));
        this._initHooks();

        Debug.only(Object.seal(this));
    };
    Jx.augment(ItemDemux, Jx.Events);

    ItemDemux.createHook = function (collection, func, target) {
        return new Mail.EventHook(new ItemDemux(collection), "itemchanged", func, target);
    };

    var prototype = ItemDemux.prototype;
    Debug.Events.define(prototype, "itemchanged");

    prototype.dispose = function () {
        this._disposer.dispose();
    };

    prototype._initHooks = function () {
        // Map each item in the collection to an event hook. Since disposer supports arrays
        // we can give it a reference to that and manipulate
        this._hooks = this._disposer.replace(this._hooks, Mail.Collection.map(this._collection, this._makeHook, this));
    };

    prototype._makeHook = function (item) {
        return new Mail.EventHook(item, "changed", this._onItemChanged, this);
    };

    prototype._onCollectionChanged = function (ev) {
        // Keep the array of event hooks in lock-step with items in the collection
        var ChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType;

        var index = ev.index, hooks = this._hooks;
        switch (ev.eType) {
            case ChangeType.itemAdded:
                hooks.splice(index, 0, this._makeHook(this._collection.item(index)));
                break;
            case ChangeType.itemRemoved:
                Jx.dispose(hooks.splice(index, 1)[0]);
                break;
            case ChangeType.itemChanged:
                hooks.splice(index, 0, hooks.splice(ev.previousIndex, 1)[0]);
                break;
            case ChangeType.reset:
                this._initHooks();
                break;
        }
    };

    prototype._onItemChanged = function (ev) {
        // Tranform the "changed" event into an "itemchanged"
        var changes = Array.prototype.slice.call(ev);
        changes.target = this;
        changes.collection = this._collection;
        changes.item = ev.target;
        this.raiseEvent("itemchanged", changes);
    };

});

