
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint strict:true*/
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "TrailingItemCollection", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ChangeType = Plat.CollectionChangeType,
        T = Mail.TrailingItemCollection = /*@constructor*/ function (collection, trailingItem) {
        /// <summary>
        /// The TrailingItemCollection takes a collection and an end of list Item and it mimics the interface of a single collection.
        /// Instead of interfacing directly with the MessageListCollection, the MessageList now interface with this TrailingItemCollection,
        /// so that it doesn't need to know whether the underlying collection has an end of list item.
        /// The TrailingItemCollection is also responsible for showing, hiding and retrieving the trailing item.
        /// It knows nothing about the type of the underlying collection and the trailing item
        /// </summary>
        /// <param name="collection" type="Mail.MessageListCollection"></param>
        /// <param name="trailingItem" type="Mail.EndOfListItem"></param>
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(trailingItem));

        this._collection = collection;
        this._trailingItem = trailingItem;
        this._isTrailingItemVisible = trailingItem.visible;
        this._isProcessingEvents = false;

        // forward all events from the collection
        this._hook = new Mail.Disposer(
            new Mail.EventHook(collection, "beginChanges", this._beginChanges, this),
            new Mail.EventHook(collection, "itemAdded", this._forwardEvent.bind(this, "itemAdded"), this),
            new Mail.EventHook(collection, "itemRemoved", this._forwardEvent.bind(this, "itemRemoved"), this),
            new Mail.EventHook(collection, "itemMoved", this._forwardEvent.bind(this, "itemMoved"), this),
            new Mail.EventHook(collection, "reset", this._forwardEvent.bind(this, "reset"), this),
            new Mail.EventHook(collection, "endChanges", this._endChanges, this),
            new Mail.EventHook(trailingItem, "visibilityChanged", this._onTrailingItemVisibilityChanged, this));
    };

    Jx.augment(Mail.TrailingItemCollection, Jx.Events);

    // Standard collection events
    Debug.Events.define(T.prototype, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges");

    // A standard set of collection Interface
    T.prototype.item = function (index) {
        /// <param name="index" type="Number"></param>
        /// <returns type="Mail.UIDataModel.MailItem"/>
        Debug.assert(Jx.isValidNumber(index));
        if (index === this._collection.count) {
            Mail.writeProfilerMark("TrailingItemCollection.item - accessing the end of list item");
            Debug.assert(this._isTrailingItemVisible);
            return this._trailingItem;
        }
        return this._collection.item(index);
    };

    T.prototype.findIndexByMessageId = function (id, indexHint) {
        return this._collection.findIndexByMessageId(id, indexHint);
    };

    T.prototype.dispose = function () {
        this._trailingItem.dispose();
        this._trailingItem = null;
        this._collection.dispose();
        this._collection = null;
        this._hook.dispose();
        this._hook = null;
    };

    T.prototype.lock = function () {
        this._collection.lock();
    };

    T.prototype.unlock = function () {
        this._collection.unlock();
    };

    T.prototype.getTreeView = function () {
        /// <summary>
        /// Returns an interface to edit the collection
        /// This is currently used by the SelectionController for expanding/collapsing a node
        /// The motivation of this function is to pull all editing function in its private interface so that all collection
        /// can expose a homogeneous interface to the dataSource/notificationHandler for basic item retrievals
        /// For now, this interface just returns itself.
        /// </summary>
        return this._collection.getTreeView();
    };

    Object.defineProperty(T.prototype, "count", { get: function () {
        var lengthAdjustment = this._isTrailingItemVisible ? 1 : 0;
        return this._collection.count + lengthAdjustment;
    }, enumerable: true});

    Object.defineProperty(T.prototype, "mailItems", { get: function () {
        return this._collection;
    }, enumerable: true});

    T.prototype._beginChanges = function (/*@dynamic*/ evt) {
        this._isProcessingEvents = true;
        this.raiseEvent("beginChanges", evt);
    };

    T.prototype._endChanges = function (/*@dynamic*/ evt) {
        this._isProcessingEvents = false;
        this.raiseEvent("endChanges", evt);
    };

    T.prototype._forwardEvent = function (eventName, /*@dynamic*/ evt) {
        /// <summary>
        /// Blindly forward the event from the underlying event from the collection to the outer collection
        /// Since the trailingItem is appended at the end, we don't need to fix up the indices
        /// </summary>
        /// <param name="eventName" type="String"></param>
        /// <param name="evt" optional="true"></param>
        this.raiseEvent(eventName, evt);
    };

    T.prototype._raiseEvent = function (eventName, change) {
        /// <param name="eventName" type="String"></param>
        /// <param name="change" dynamic="true"></param>
        Debug.assert(Jx.isNonEmptyString(eventName));
        Debug.assert(Jx.isObject(change));
        if (this._isProcessingEvents) {
            this.raiseEvent(eventName, change);
        } else {
            this.raiseEvent("beginChanges");
            this.raiseEvent(eventName, change);
            this.raiseEvent("endChanges");
        }
    };

    T.prototype._showTrailingItem = function () {
        /// <summary>
        /// Show the trailing item via an itemAdded event
        /// </summary>
        if (this._isTrailingItemVisible) {
            // already visible, early return
            // If all other cases, we should always fire an event when the trailing item changes its visibility.
            // Or else, the count of the collection and the reported count to the listeners will not match
            return;
        }

        var change = {
                eType: ChangeType.itemAdded,
                index: this._collection.count,
                previousIndex: 0,
                objectId: this._trailingItem.objectId,
                data: this._trailingItem
            };
        this._raiseEvent("itemAdded", change);
        this._isTrailingItemVisible = true;
    };

    T.prototype._hideTrailingItem = function () {
        /// <summary>
        /// Hide the trailing item via an itemRemoved event
        /// </summary>
        if (!this._isTrailingItemVisible) {
            return;
        }

        var change = {
            eType: ChangeType.itemRemoved,
            index: this._collection.count,
            previousIndex: 0,
            objectId: this._trailingItem.objectId,
            data: this._trailingItem
        };
        this._raiseEvent("itemRemoved", change);
        this._isTrailingItemVisible = false;
    };

    T.prototype._onTrailingItemVisibilityChanged = function () {
        if (this._trailingItem.visible) {
            this._showTrailingItem();
        } else {
            this._hideTrailingItem();
        }
    };
});
