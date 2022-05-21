
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

Jx.delayDefine(Mail, "ViewNode", function () {
    "use strict";

    var ViewNode = Mail.ViewNode = function (view, depth, tree) {
        this.depth = depth;

        this._view = view;
        this._tree = tree;
        this._sorted = null;
        this._children = null;
        this._listeners = new Mail.Disposer();

        this.initEvents();
    };

    Jx.augment(ViewNode, Jx.Events);
    var prototype = ViewNode.prototype;
    Debug.Events.define(prototype, "childrenChanged");

    prototype.dispose = function () {
        this._listeners.dispose();
    };

    prototype.unlock = function () {
        this._children.forEach(function (child) { child.unlock(); });
        this._children.unlock();
    };

    prototype.setChildren = function (children) {
        prototype.dispose.call(this);

        // Build our list of child views
        this._sorted = new Mail.SortedCollection(this, children);
        this._children = new Mail.MappedCollection(this._sorted, function (item) {
            var node = new Mail.ViewNode(item, this.depth + 1, this._tree);
            node.setChildren(this._tree.getChildren(item));
            return node;
        }, this);

        this._listeners.addMany(this._sorted, this._children);
        this._listeners.add(new Mail.EventHook(this._children, "collectionchanged", this._onChildrenChanged, this));
    };

    Object.defineProperty(prototype, "objectId", { get: function () {
        // The root node in the tree doesn't have a view
        Debug.assert(this._view || this.depth === -1);
        return this._view ? this._view.objectId : "-1";
    }, enumerable: true });

    Object.defineProperty(prototype, "view", { get: function () {
        return this._view;
    }, enumerable: true });

    Object.defineProperty(prototype, "children", { get: function () {
        return this._children;
    }, enumerable: true });

    Object.defineProperty(prototype, "totalCount", { get: function () {
        // Total count of nodes in a subtree including 'this' node
        return this._children.reduce(function (previous, child) {
            return child.totalCount + previous;
        }, 1);
    }, enumerable: true });

    Object.defineProperty(prototype, "descendantCount", { get: function () {
        // Total count of all children, not including 'this' node
        return this.totalCount - 1;
    }, enumerable: true });

    prototype.viewChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "name")) {
            this._sorted.update(ev.target);
        }
    };

    // Listen for changes on the children
    prototype.hook = function (view) {
        view.addListener("changed", this.viewChanged, this);
    };
    prototype.unhook = function (view) {
        view.removeListener("changed", this.viewChanged, this);
    };
    prototype.setCallback = Jx.fnEmpty;

    prototype.compare = function (a, b) {
        // Ensures a stable sort by using object id in case view names are equal
        return a.name.localeCompare(b.name) || a.objectId.localeCompare(b.objectId);
    };

    prototype._onChildrenChanged = function (ev) {
        // Generate events when our child collection changes
        this.raiseEvent("childrenChanged", {
            target: this,
            eType: ev.eType,
            objectId: ev.objectId,
            index: ev.index,
            previousIndex: ev.previousIndex
        });
    };

});

Jx.delayDefine(Mail, "ViewHierarchy", function () {

    var P = Microsoft.WindowsLive.Platform,
        ChangeType = P.CollectionChangeType,
        ViewType = P.MailViewType;

    var ViewHierarchy = Mail.ViewHierarchy = function (views) {
        /// <summary>Collection that sorts the views into a hierarchy. Currently only folder views can have a parent/child relationship and
        /// all other views are considered to be top-level.</summary>
        Mail.writeProfilerMark("ViewHierarchy.ctor", Mail.LogEvent.start);
        Mail.ViewNode.call(this, null, -1, this);

        // We are being told that we have an account as soon as the email address is available, before the account credentials are verified.
        // So on adding first account, views.count could be 0 if the account doesn't have validated credentials.
        Debug.assert(!views.count || Jx.isInstanceOf(views.item(0), Mail.UIDataModel.MailView));

        this._hooks = [];
        this._views = views;

        this._disposer = new Mail.Disposer(views, this._hooks,
            new Mail.EventHook(views, "collectionchanged", this._onCollectionChanged, this));

        this._reset();

        Mail.writeProfilerMark("ViewHierarchy.ctor", Mail.LogEvent.stop);
    };

    ViewHierarchy.wrapFlat = function (collection) {
        /// <summary>Wraps a views collection as a flat list of top-level view nodes
        /// Useful for presenting the same data-model as a ViewHierarchy, but without the hierarchy.</summary>
        return new Mail.MappedCollection(
            Mail.ViewFilters.sortFolders(collection),
            function (view) { return new Mail.ViewNode(view, 0, null); }
        );
    };

    Jx.inherit(ViewHierarchy, Mail.ViewNode);
    var prototype = ViewHierarchy.prototype;

    prototype.dispose = function () {
        Mail.writeProfilerMark("ViewHierarchy.dispose", Mail.LogEvent.start);
        Mail.ViewNode.prototype.dispose.call(this);
        Jx.dispose(this._disposer);
        Mail.writeProfilerMark("ViewHierarchy.dispose", Mail.LogEvent.stop);
    };

    prototype.unlock = function () {
        this._views.unlock();
    };

    prototype.getChildren = function (view) {
        return this._getCollection(view.objectId);
    };

    prototype._onCollectionChanged = function (ev) {
        Debug.assert(ev.target === this._views);

        switch (ev.eType) {
            case ChangeType.itemAdded:
                var view = this._views.item(ev.index);
                this._updateSourceMapping(view);
                this._addView(view, ev.index);
                break;
            case ChangeType.itemRemoved:
                this._removeView(ev.objectId, ev.index);
                break;
            case ChangeType.itemMoved:
                var hooks = this._hooks;
                hooks.splice(ev.index, 0, hooks.splice(ev.previousIndex, 1)[0]);
                break;
            case ChangeType.reset:
                this._reset();
                this.raiseEvent("childrenChanged", { target: this, eType: ChangeType.reset });
                break;
        }
    };

    prototype._reset = function () {
        this._initialized = false;

        this._hooks = this._disposer.replace(this._hooks, []);
        var childCollections = this._childCollections = {}; // view ID to collection of child views
        this._sourceMapping = {}; // source ID to view ID

        // Need to generate the the source to view mapping first in case child
        // items are ordered before their parent in the collection
        this._views.forEach(this._updateSourceMapping, this);

        // Ensure our root collection exists before mapping all the children
        var roots = this._getCollection("roots");
        this._views.forEach(this._addView, this);
        this.setChildren(roots);

        // Unlock all the collections now that they're setup
        for (var parentId in childCollections) {
            childCollections[parentId].unlock();
        }

        this._initialized = true;
    };

    prototype._addView = function (view, index) {
        // Hook for changes on the view so we can update the child collection it belongs to if its parent changes
        this._hooks.splice(index, 0, new Mail.EventHook(view, "changed", this._onViewChanged, this));
        // Find and update the parent that contians this folder
        this._addChild(view);
    };

    prototype._removeView = function (viewId, index) {
        // Remove the child view from its parent collection that contains it
        this._removeChild(viewId);
        // Unhook from changes for the deleted view
        Jx.dispose(this._hooks.splice(index, 1)[0]);
        // Remove child views of the deleted view
        delete this._childCollections[viewId];
    };

    prototype._addChild = function (view) {
        // Update the parents collection of child views to contain this new child. It doesn't matter
        // where in the collection it's add since the entire thing is sorted later.
        var collection = this._getCollection(this._parentId(view));
        collection.insertItem(view, 0);
    };

    prototype._removeChild = function (viewId) {
        // Remove the child view from its parent collection that contains it
        var childCollections = this._childCollections;
        for (var parentId in childCollections) {
            var collection = childCollections[parentId];
            var index = collection.findIndexById(viewId);
            if (index !== -1) {
                collection.removeItem(index);
                return;
            }
        }
    };

    prototype._onViewChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "parentFolder", "sourceObject")) {
            // Move this view/folder to be a child of its new parent
            var view = ev.target;
            this._updateSourceMapping(view);
            this._removeChild(view.objectId);
            this._addChild(view);
        }
    };

    prototype._getCollection = function (id) {
        var collection = this._childCollections[id];
        if (!collection) {
            collection = this._childCollections[id] = new Mail.ArrayCollection([], id + "-children");
            if (this._initialized) {
                collection.unlock();
            }
        }
        return collection;
    };

    prototype._updateSourceMapping = function (view) {
        var source = view.sourceObject;
        if (source) {
            this._sourceMapping[source.objectId] = view.objectId;
        }
    };

    prototype._parentId = function (view) {
        if (view.type === ViewType.userGeneratedFolder) {
            Debug.assert(view.sourceObject);
            var parentFolder = view.sourceObject.parentFolder;

            // It's possible to nest mail folders under non-mail folders. These parent
            // folders won't be in our query so treat their children as roots
            if (parentFolder && parentFolder.folderType === P.FolderType.mail) {
                Debug.assert(parentFolder.objectId in this._sourceMapping);
                return this._sourceMapping[parentFolder.objectId];
            }
        }
        return "roots";
    };

    var rootSortOrder = { }, increment = 1;
    rootSortOrder[ViewType.inbox] = increment++;
    rootSortOrder[ViewType.draft] = increment++;
    rootSortOrder[ViewType.sentItems] = increment++;
    rootSortOrder[ViewType.outbox] = increment++;
    rootSortOrder[ViewType.junkMail] = increment++;
    rootSortOrder[ViewType.deletedItems] = increment++;
    rootSortOrder[ViewType.userGeneratedFolder] = increment++;

    // Unspecified view types in the above map sort to the end
    function getSortOrder(type) { return rootSortOrder[type] || increment; }

    // Top level views have a custom sort order
    prototype.compare = function (viewA, viewB) {
        return (getSortOrder(viewA.type) - getSortOrder(viewB.type)) ||
            Mail.ViewNode.prototype.compare.call(this, viewA, viewB);
    };

    prototype.viewChanged = function (ev) {
        if (Mail.Validators.hasPropertyChanged(ev, "type")) {
            this._sorted.update(ev.target);
        }
        Mail.ViewNode.prototype.viewChanged.call(this, ev);
    };
    
});
