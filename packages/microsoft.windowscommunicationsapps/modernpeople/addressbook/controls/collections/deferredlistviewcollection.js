
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="DeferredCollection.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>  Caused by namespace definition

Jx.delayDefine(People, "DeferredListviewCollection", function () {

var P = window.People;
var Plat = Microsoft.WindowsLive.Platform;
var ChangeType = Plat.CollectionChangeType;

var DeferredListviewCollection = P.DeferredListviewCollection = /* @constructor*/function (collection, listener) {
    ///<summary> The DeferredListviewCollection is a specialized DeferredCollection for use with the Listview, which
    /// requires the keys of the previous or next sibling in a collection for updates (when inserting or moving).  We
    /// augment the collection change event with these IDs as well as the underlying object associated with the change
    /// to better suit the Listview's needs.</summary>
    P.DeferredCollection.call(this, collection, listener);
};
Jx.inherit(DeferredListviewCollection, P.DeferredCollection);

DeferredListviewCollection.prototype._getAugmentedChange = function (change) {
    ///<summary>Augments the platform change with prevId or nextId and the underlying object itself if it's an
    /// add or change event.</summary>
    ///<param name="change" type="Plat.CollectionChangedEventArgs" />
    var changeType = change.eType;
    if (ChangeType.itemAdded === changeType || ChangeType.itemChanged === changeType) {
        var index = change.index,
            prevId = null,
            nextId = null;
        if (index > 0) {
            prevId = this._realCollection.item(index - 1).objectId;
        } else if (index + 1 < this._realCollection.getCount()) {
            nextId = this._realCollection.item(index + 1).objectId;
        }
        var augmentedChange = {
            eType: change.eType,
            index: change.index,
            previousIndex: change.previousIndex,
            objectId: change.objectId,
            prevId: prevId,
            nextId: nextId,
            data: this._realCollection.item(index),
            detail: change.detail,
            target: change.target
        };
        // Ensure we aren't losing any information with our newly created object literal
        Debug.assert(Object.keys(change).every(function (key) { return change[key] === augmentedChange[key]; }));
        return augmentedChange;
    }
    return change;
};

});

