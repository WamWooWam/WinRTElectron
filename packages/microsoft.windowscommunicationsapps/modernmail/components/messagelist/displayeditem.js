
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "DisplayedItem", function () {
    "use strict";

    function SimpleDisplayedItem(node) {
        this._node = node;
    }
    
    SimpleDisplayedItem.prototype = {
        get parentId() {
            return this._node.parentId;
        },
        get objectId() {
            return this._node.objectId;
        },
        get message() {
            return (!this._node.pendingRemoval) ? this._node.data : null;
        },
        updateMessage: Jx.fnEmpty,
        dispose: Jx.fnEmpty,
        addListener: Jx.fnEmpty,
        removeListener: Jx.fnEmpty
    };

    Mail.DisplayedItem = function (view, node, /*@optional*/ childId, /*@optional*/ nodeSelection) {
        // Given a converation node, this class is responsible for figuring out when child message should be shown
        // as the active message.  It is also responsible for listening for changes in the child message collection.
        // If a new message is added, it should fire the requestExpansion event.
        // If the active message is deleted, it should select another message and fire the message changed event.
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(node, Mail.ConversationNode));
        Debug.assert(Jx.isNullOrUndefined(childId) || Jx.isNonEmptyString(childId));
        Debug.assert(Jx.isNullOrUndefined(nodeSelection) || Jx.isInstanceOf(nodeSelection, Mail.ConversationSelection));
        
        this._node = node;
        this._itemRetriever = Mail.DisplayedItemRetriever.create(view, this._node);
        this._nodeSelection = nodeSelection;
        this.updateMessage(childId);

        this._itemAddedId = null;
        this._messageDeleted = false;

        this._parentId = node.objectId;
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._node, "itemAdded", this._onItemAdded, this),
            new Mail.EventHook(this._node, "itemRemoved", this._onItemRemoved, this),
            new Mail.EventHook(this._node, "endChanges", this._onEndChanges, this)
        );
        this._node.unlock();
    };

    Mail.DisplayedItem.prototype = {
        get parentId() {
            return this._parentId;
        },
        get objectId() {
            return this._node.objectId;
        },
        get message() {
            return (this._message && !this._message.pendingRemoval) ? this._message.data : null;
        },
        dispose: function () {
            Jx.dispose(this._hooks);
            this._hooks = null;
            this._itemRetriever = null;
            this._node = null;
            this._nodeSelection = null;
        },
        updateMessage: function (childId) {
            var nodeSelection = this._nodeSelection;
            if (nodeSelection && nodeSelection.hasCustomSelection) {
                var selectedChildren = nodeSelection.getSelectedChildren(-1 /*baseIndex*/),
                    indexOfChildId = selectedChildren.ids.indexOf(childId),
                    indexToSelect = (indexOfChildId === -1) ? selectedChildren.indices[0] : selectedChildren.indices[indexOfChildId];
                this._message = this._node.item(indexToSelect);
            } else {
                this._message = this._itemRetriever.findMessage(childId).item;
            }
        },
        _onItemRemoved: function (ev) {
            if (this._message && this._message.objectId === ev.objectId) {
                this._messageDeleted = true;
            }
        },
        _onItemAdded: function (ev) {
            this._itemAddedId = ev.objectId;
        },
        _onEndChanges: function () {
            if (this._itemAddedId) {
                this.raiseEvent("requestExpansion", { messageId: this._itemAddedId });
            } else if (this._messageDeleted) {
                if (this._node.children.count > 0) {
                    // if the last message is deleted, do not fire the event, the entire displayedItem will soon be removed
                    this.updateMessage();
                    this.raiseEvent("messageChanged");
                }
            }
            this._messageDeleted = false;
        }
    };

    Jx.augment(Mail.DisplayedItem, Jx.Events);
    Debug.Events.define(Mail.DisplayedItem.prototype, "messageChanged", "requestExpansion");

    Mail.DisplayedItem.create = function (view, node, /*@optional*/ childId, /*@optional*/ nodeSelection) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(node, Mail.MessageListTreeNode));
        Debug.assert(Jx.isNullOrUndefined(childId) || Jx.isNonEmptyString(childId));
        Debug.assert(Jx.isNullOrUndefined(nodeSelection) || Jx.isInstanceOf(nodeSelection, Mail.ConversationSelection));

        if (node.type === "conversation") {
            return new Mail.DisplayedItem(view, node, childId, nodeSelection);
        } else {
            return new SimpleDisplayedItem(node);
        }
    };
});
