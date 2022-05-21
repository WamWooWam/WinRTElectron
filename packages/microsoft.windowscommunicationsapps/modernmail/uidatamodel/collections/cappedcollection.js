
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail, "CappedCollection", function () {

    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    Mail.CappedCollection = /*@constructor*/function (cap, collection, collectionName) {
        Debug.assert(Jx.isValidNumber(cap) && (cap > 0));
        Mail.CollectionWrapper.call(this, collection, collectionName || ("cap:" + collection.name));

        this._cap = cap;
    };

    Jx.inherit(Mail.CappedCollection, Mail.CollectionWrapper);

    Mail.CappedCollection.prototype.dispose = function () {
        Mail.CollectionWrapper.prototype.dispose.call(this);
        Jx.dispose(this._collection);
        this._collection = null;
    };

    Mail.CappedCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._collection.count && index <= this._cap);
        return this._collection.item(index);
    };

    Object.defineProperty(Mail.CappedCollection.prototype, "count", { get: function () {
        return Math.min(this._cap, this._collection.count);
    }, enumerable: true });

    Mail.CappedCollection.prototype._onCollectionChanged = function (/*@type(P.CollectionChangedEventArgs)*/ev) {
        // Respond to changes in the underlying collection changes
        switch (ev.eType) {
            case ChangeType.itemRemoved: this._itemRemoved(ev); break;
            case ChangeType.itemAdded:   this._itemAdded(ev); break;
            case ChangeType.itemChanged: this._itemChanged(ev); break;
            case ChangeType.reset:
            case ChangeType.batchBegin:
            case ChangeType.batchEnd:
                this._raiseChange({ eType: ev.eType });
                break;
            default:
                Debug.assert(false, "Unexpected change type: " + ev.eType);
                break;
        }
    };

    Mail.CappedCollection.prototype._itemAdded = function (ev) {
        var cap = this._cap;
        if (ev.index < cap) {
            this._cap++;
            var addIndex = ev.index;
            this._raiseAdded(this._collection.item(addIndex), addIndex);
            this._cap--;

            // Need to check that the collection is valid in case someone disposed us inside an event handler
            if (this._collection && this._collection.count > cap) {
                this._raiseRemoved(this._collection.item(cap), cap);
            }
        }
    };

    Mail.CappedCollection.prototype._itemRemoved = function (ev) {
        var cap = this._cap;
        if (ev.index < cap) {
            this._cap--;
            var removeIndex = ev.index;
            this._raiseRemoved({objectId: ev.objectId}, removeIndex);
            this._cap++;

            // Need to check that the collection is valid in case someone disposed us inside an event handler
            if (this._collection && this._collection.count >= cap) {
                var addIndex = cap - 1;
                this._raiseAdded(this._collection.item(addIndex), addIndex);
            }
        }
    };

    Mail.CappedCollection.prototype._itemChanged = function (ev) {
        Debug.assert(Jx.isValidNumber(ev.index));
        Debug.assert(Jx.isValidNumber(ev.previousIndex));
        var cap = this._cap;
        if (ev.index < cap && ev.previousIndex < cap) {
            this._raiseMoved(this._collection.item(ev.index), ev.previousIndex, ev.index);
        } else if (ev.index < cap) {
            Debug.assert(ev.previousIndex >= cap);
            this._itemAdded({index: ev.index, objectId: ev.objectId});
        } else if (ev.previousIndex < cap) {
            Debug.assert(ev.index >= cap);
            this._itemRemoved({index: ev.previousIndex, objectId: ev.objectId});
        }
    };
});

