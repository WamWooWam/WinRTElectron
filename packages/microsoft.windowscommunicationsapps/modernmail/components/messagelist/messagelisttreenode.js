
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, ["MessageListTreeNode", "EmptyMessageListTreeView"], function () {
    "use strict";

    Mail.MessageListTreeNode = /*@constructor*/ function (/*@dynamic*/ data, /*@type(String)*/ type, /*@dynamic,@optional*/ parentNode) {
        Debug.assert(data);
        Debug.assert(Jx.isNonEmptyString(type));
        Debug.assert(Jx.isNonEmptyString(data.objectId));
        Debug.assert(Jx.isNullOrUndefined(parentNode) || Jx.isInstanceOf(parentNode, Mail.MessageListTreeNode));
        this._data = /*@static_cast(Mail.UIDataModel.MailItem)*/data;
        this._parent = parentNode;
        this._type = type;
        this._id = data.objectId;
        this._children = /*@static_cast(Mail.MessageListCollection)*/ null;
        this._expanded = false;
    };

    Jx.inherit(Mail.MessageListTreeNode, Jx.Events);
    Debug.Events.define(Mail.MessageListTreeNode.prototype, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges", "toggleExpansion", "disposed");

    Mail.MessageListTreeNode.prototype.expand = function () {
        return false; // expanded
    };

    Mail.MessageListTreeNode.prototype.collapse = function () {
        return false; // collapsed
    };

    Mail.MessageListTreeNode.prototype.dispose = function () {
        this.raiseEvent("disposed", { target : this});
    };

    Mail.MessageListTreeNode.prototype.isParent = function (/*childId*/) {
        return false;
    };

    Mail.MessageListTreeNode.prototype.isDescendant = function (id) {
        if (!id) {
            return false;
        }
        var currentNode = this;
        while (currentNode) {
            if (currentNode.objectId === id) {
                return true;
            }
            currentNode = currentNode.parent;
        }
        return false;
    };

    Mail.MessageListTreeNode.prototype.lock = Jx.fnEmpty;
    Mail.MessageListTreeNode.prototype.unlock = Jx.fnEmpty;

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "objectId", { get : function () {
        return this._id;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "parentId", { get : function () {
        return this._parent ? this._parent.objectId : "";
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "data", { get : function () {
        return this._data;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "children", { get : function () {
        return this._children;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "totalCount", { get : function () {
        return (this._children) ? this._children.count : 1;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "parent", { get : function () {
        return this._parent;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "type", { get : function () {
        return this._type;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "pendingRemoval", { get : function () {
        return this._data ? this._data.pendingRemoval : true;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "selectable", { get : function () {
        return true;
    }});

    Object.defineProperty(Mail.MessageListTreeNode.prototype, "expanded", { get : function () {
        return this._expanded;
    }, enumerable : true});

    Mail.EmptyMessageListTreeView = function () {
        /// <summary>
        /// There are three types of collections in the message list: MessageListCollection, ThreadedListCollection and SearchCollection.
        /// Each collection has a tree view control interface that support tree operations (expand/collapse, clearPendingExpandCollapse),
        /// which is consumed by SelectionController as it responds to selection events (selectionchanging, selectionchanged, itemInvoked)
        /// The NoOpMessageListTreeView provides a no-op implementation of the treeView.
        /// </summary>
    };

    Mail.EmptyMessageListTreeView.prototype = {
        expand: Jx.fnEmpty,
        collapse : Jx.fnEmpty,
        clearPendingExpandCollapse : Jx.fnEmpty,
        addListener : Jx.fnEmpty,
        removeListener : Jx.fnEmpty,
        expanded : false,
        activeConversationIndex : -1,
        activeConversation : null
    };
});
