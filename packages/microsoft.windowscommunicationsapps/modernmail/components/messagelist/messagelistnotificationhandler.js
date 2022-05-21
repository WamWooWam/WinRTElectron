
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/
Jx.delayDefine(Mail, "MessageListNotificationHandler", function () {
    "use strict";

    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    Mail.MessageListNotificationHandler = function (collection, listView, notificationHandler) {
        Debug.assert(Jx.isObject(collection));
        Debug.assert(Jx.isObject(listView));
        Debug.assert(Jx.isObject(notificationHandler));
        this._collection = collection;
        this._notificationHandler = new Mail.ListViewVDSMonitor(collection, listView, notificationHandler);

        collection.addListener("beginChanges", this._beginChanges, this);
        collection.addListener("endChanges", this._endChanges, this);
        collection.addListener("itemAdded", this._itemAdded, this);
        collection.addListener("itemRemoved", this._itemRemoved, this);
        collection.addListener("itemMoved", this._itemMoved, this);
    };

    Mail.MessageListNotificationHandler.prototype.dispose = function () {
        this._collection.removeListener("beginChanges", this._beginChanges, this);
        this._collection.removeListener("endChanges", this._endChanges, this);
        this._collection.removeListener("itemAdded", this._itemAdded, this);
        this._collection.removeListener("itemRemoved", this._itemRemoved, this);
        this._collection.removeListener("itemMoved", this._itemMoved, this);

        // The message list owns the collection and is responsible for disposing it
        this._collection = null;
        Jx.dispose(this._notificationHandler);
        this._notificationHandler = null;
    };

    Mail.MessageListNotificationHandler.prototype._beginChanges = function () {
        this._notificationHandler.beginNotifications();
    };

    Mail.MessageListNotificationHandler.prototype._endChanges = function () {
        this._notificationHandler.endNotifications();
    };

    Mail.MessageListNotificationHandler.prototype._itemAdded = function (ev) {
        ///<summary>Tells the list view about the new item to add</summary>
        var params = this._prepareNotificationParameters(ev);
        this._notificationHandler.inserted(params.item, params.prevKey, params.nextKey, ev.index);
    };

    Mail.MessageListNotificationHandler.prototype._itemRemoved = function (ev) {
        ///<summary>Tells the list view about the item to remove</summary>
        this._notificationHandler.removed(ev.objectId);
    };

    Mail.MessageListNotificationHandler.prototype._itemMoved = function (ev) {
        ///<summary>Tells the list view about the item to remove</summary>
        var params = this._prepareNotificationParameters(ev);
        this._notificationHandler.moved(params.item, params.prevKey, params.nextKey, ev.previousIndex, ev.index);
    };

    Mail.MessageListNotificationHandler.prototype._prepareNotificationParameters = function (ev) {
        /// <summary>
        /// Prepare the parameters (prevKey, nextKey, data) for the removed/moved function of the notificationHandler
        /// </summary>
        /// <returns type="dynamic"/>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(ev.eType === ChangeType.itemAdded || ev.eType === ChangeType.itemChanged);
        Debug.assert(Jx.isNumber(ev.index));

        var prevKey = null, nextKey = null;

        // Fix up the prevId and nextId of the event
        if (!ev.prevId && !ev.nextId) {
            var index = ev.index;
            if (index > 0 ) {
                prevKey = this._collection.item(index - 1).objectId;
            } else if (index + 1 < this._collection.count) {
                nextKey = this._collection.item(index + 1).objectId;
            }
        } else if (ev.prevId) {
            prevKey = ev.prevId;
        } else if (ev.nextId) {
            nextKey = ev.nextId;
        }

        if (!ev.data) {
            ev.data = this._collection.item(ev.index);
        }
        Debug.assert(ev.objectId === ev.data.objectId, "The key should match the objectId of the data");
        return {
            item: {
                key: ev.objectId,
                data: ev.data
            },
            prevKey: prevKey,
            nextKey: nextKey
        };
    };
});

