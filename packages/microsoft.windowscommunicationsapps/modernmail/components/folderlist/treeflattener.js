
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "TreeFlattener", function () {

    var P = Microsoft.WindowsLive.Platform;
    var ChangeType = P.CollectionChangeType;

    Mail.TreeFlattener = /*@constructor*/function (/*@type(Mail.FolderNode)*/root) {
        // Performs a depth first flattening of a tree of items into a list. Note that the
        // root of the tree isn't included in the list. This is generally the desired behavior
        // for UI, e.g. the folder list has many roots. If the actual root needs to be included
        // simply make it the only child of a new outer root.
        Mail.writeProfilerMark("TreeFlattener_ctor", Mail.LogEvent.start);
        Mail.Collection.call(this, "<flat>");

        this._root = root;
        this._hook(root);
        this._items = /*@static_cast(Array)*/flatten(root.children);
        this._items.forEach(this._hook, this);
        Mail.writeProfilerMark("TreeFlattener_ctor", Mail.LogEvent.stop);
    };

    Mail.TreeFlattener.create = function (collection) {
        return new Mail.TreeFlattener(new Mail.ViewHierarchy(collection));
    };

    Jx.inherit(Mail.TreeFlattener, Mail.Collection);

    Mail.TreeFlattener.prototype.dispose = function () {
        if (this._root !== null) {
            this._items.forEach(this._unhook, this);
            this._unhook(this._root);
            Jx.dispose(this._root);
            this._root = null;
        }
    };

    Object.defineProperty(Mail.TreeFlattener.prototype, "count", { get: function () {
        return this._items.length;
    }, enumerable: true });

    Mail.TreeFlattener.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this._items.length);
        return this._items[index];
    };

    Mail.TreeFlattener.prototype.unlock = function () {
        this._root.unlock();
        Mail.Collection.prototype.unlock.call(this);
    };

    Mail.TreeFlattener.prototype._onNodeChanged = function (/*@dynamic*/ev) {
        switch (ev.eType) {
            case ChangeType.itemAdded: this._itemAdded(ev); break;
            case ChangeType.itemRemoved: this._itemRemoved(ev); break;
            case ChangeType.itemChanged: this._itemChanged(ev); break;
            case ChangeType.reset: this._reset(); break;
        }
    };

    Mail.TreeFlattener.prototype._itemAdded = function (/*@dynamic*/ev) {
        var parentNode = /*@static_cast(Mail.FolderNode)*/ev.target,
            insertIndex = this._mapIndex(parentNode, this._items.indexOf(parentNode), ev.index),
            childNode = /*@static_cast(Mail.FolderNode)*/parentNode.children.item(ev.index);

        Debug.assert(childNode.objectId === ev.objectId);

        var insert = /*@static_cast(Array)*/flatten(childNode.children, [childNode]);
        insert.forEach(/*@bind(Mail.TreeFlattener)*/function (/*@type(Mail.FolderNode)*/item, i) {
            this._items.splice(insertIndex + i, 0, item);
            this._raiseAdded(item, insertIndex + i);
            this._hook(item);
        }, this);
    };

    Mail.TreeFlattener.prototype._itemRemoved = function (/*@dynamic*/ev) {
        var parentNode = /*@static_cast(Mail.FolderNode)*/ev.target,
            removeIndex = this._mapIndex(parentNode, this._items.indexOf(parentNode), ev.index),
            childNode = /*@static_cast(Mail.FolderNode)*/this._items[removeIndex];

        Debug.assert(childNode.objectId === ev.objectId);

        for (var i = 0, len = childNode.totalCount; i < len; i++) {
            var item = /*@static_cast(Mail.FolderNode)*/this._items.splice(removeIndex, 1)[0];
            this._raiseRemoved(item, removeIndex);
            this._unhook(item);
        }
    };

    Mail.TreeFlattener.prototype._itemChanged = function (/*@dynamic*/ev) {
        var parentNode = /*@static_cast(Mail.FolderNode)*/ev.target,
            parentIndex = this._items.indexOf(parentNode),
            childNode = /*@static_cast(Mail.FolderNode)*/parentNode.children.item(ev.index),
            previousIndex, newIndex;

        if (ev.previousIndex < ev.index) {
            // Moving down the list. Accounts for the moving item "crossing" its children in the new index.
            previousIndex = this._mapIndex(parentNode, parentIndex, ev.previousIndex);
            newIndex = this._mapIndex(parentNode, parentIndex, ev.index) + childNode.descendantCount;
        } else {
            // Moving up the list. Discount the moving item and its children from previous index because mapIndex
            // is looking at an already updated parentNode.children array
            previousIndex = this._mapIndex(parentNode, parentIndex, ev.previousIndex + 1) - childNode.totalCount;
            newIndex = this._mapIndex(parentNode, parentIndex, ev.index);
        }

        Debug.assert(childNode.objectId === ev.objectId);
        Debug.assert(childNode === this._items[previousIndex]);

        // Move the item and all its children
        for (var i = 0, len = childNode.totalCount; i < len; i++) {
            var item = /*@static_cast(Mail.FolderNode)*/this._items.splice(previousIndex, 1)[0];
            this._items.splice(newIndex, 0, item);
            this._raiseMoved(item, previousIndex, newIndex);

            // Shift the index when moving up the list
            if (newIndex < previousIndex) {
                previousIndex++;
                newIndex++;
            }
        }
    };

    Mail.TreeFlattener.prototype._reset = function () {
        // Re-build the flatten list of items in response to a reset
        var removed = this._items;
        this._items = [];

        removed.forEach(this._unhook, this);
        this._items = /*@static_cast(Array)*/flatten(this._root.children);
        this._items.forEach(this._hook, this);

        this._raiseChange({ eType: ChangeType.reset, removed: removed });
    };

    Mail.TreeFlattener.prototype._mapIndex = function (parentNode, parentIndex, childIndex) {
        // Map a child's parent-relative index to an absoulete index in our flattened list.
        Debug.assert(this.indexOf(parentNode) === parentIndex);
        var children = parentNode.children,
            absoluteIndex = parentIndex + 1;

        Debug.assert(childIndex <= children.count);
        while (--childIndex >= 0) {
            absoluteIndex += children.item(childIndex).totalCount;
        }

        Debug.assert(absoluteIndex - parentIndex <= parentNode.totalCount);
        return absoluteIndex;
    };

    Mail.TreeFlattener.prototype._hook = function (/*@dynamic*/child) {
        child.addListener("childrenChanged", this._onNodeChanged, this);
    };

    Mail.TreeFlattener.prototype._unhook = function (/*@dynamic*/child) {
        child.removeListener("childrenChanged", this._onNodeChanged, this);
    };

    function flatten (/*@type(Mail.Collection)*/children, /*@optional*/list) {
        // Depth first flattening of a sub-tree tree into a list
        return children.reduce(function (/*@type(Array)*/previous, /*@type(Mail.FolderNode)*/child) {
            previous.push(child);
            return flatten(child.children, previous);
        }, list || []);
    }
});

