
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "DisplayedItemRetriever", function () {
    "use strict";

    function SimpleDisplayedItemRetriever(node) {
        Debug.assert(Jx.isInstanceOf(node, Mail.MessageListTreeNode));
        this._node = node;
    }

    SimpleDisplayedItemRetriever.prototype = {
        findMessage : function () {
            return {
                offset: 0,
                item: this._node
            };
        }
    };

    Mail.DisplayedItemRetriever = function (view, node) {
        // Given a converation node, this class is responsible for figuring out when child message should be shown
        // as the active message.
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(node, Mail.ConversationNode));
        this._view = view;
        this._node = node;
    };

    var proto = Mail.DisplayedItemRetriever.prototype;

    Mail.DisplayedItemRetriever.create = function (view, node) {
        if (node.type === "conversation") {
            return new Mail.DisplayedItemRetriever(view, node);
        } else {
            return new SimpleDisplayedItemRetriever(node);
        }
    };

    proto.findMessage = function (messageId) {
        var index = this._getDisplayedIndex(messageId),
            offset = (index === -1) ? -1 : index + 1,
            item = (index === -1) ? null : this._node.item(index);

        return {
            offset: offset,
            item : item
        };
    };

    proto._getDisplayedIndex = function (id) {
        /// <summary>
        /// First try to find the index with the matching ID
        /// if it fails, it will find the first non-sent item
        /// if it fails, it will find the first index
        /// </summary>
        /// <param name="id" type="String" optional="true"></param>
        /// <returns type="Number"></returns>
        Debug.assert(Jx.isNullOrUndefined(id) || Jx.isNonEmptyString(id));
        var index = -1;

        // First, try to find the specified message by id
        if (Jx.isNonEmptyString(id)) {
            index = this._node.findIndexById(id);
        }

        // Failing that, find the most recent message, based on view-specific rules
        if (index === -1) {
            index = this._findIndexForDefaultItem();
        }

        // Otherwise, grab the first message
        if (index === -1 && this._node.children.count >= 1) {
            index = 0;
        }
        return index;
    };

    proto._findIndexForDefaultItem = function () {
        ///<summary>Different views have different logic for which message should be selected.</summary>
        return Mail.Collection.findIndex(this._node.children, function (item) {
            return !item.pendingRemoval && Mail.ViewCustomizations.shouldBeDefaultSelection(this._node.data, item.data, this._view);
        }, this);
    };
});
