
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, "AccessibilityHelper", function () {
    "use strict";

    var AH = Mail.AccessibilityHelper = /* @constructor */ function (listView, collection) {
        /// <param name="listView" type="WinJS.UI.ListView" />
        /// <param name="collection" type="Mail.TrailingItemCollection" />
        Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
        Debug.assert(Jx.isInstanceOf(collection, Mail.TrailingItemCollection));

        Mail.writeProfilerMark("AccessibilityHelper.ctor", Mail.LogEvent.start);
        this._collection = collection;
        this._listView = listView;
        this._updateAccessibility = this._updateAccessibility.bind(this);

        this._expandedConvLength = null;
        this._expandedConvNode = null;
        this._positionById = {};

        this._conversationTree = this._collection.getTreeView();
        Debug.assert(this._conversationTree);

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._listView, "accessibilityannotationcomplete", this._updateAccessibility, this),
            new Mail.EventHook(this._conversationTree, "expanded", this._onExpandedConversationChanged, this),
            new Mail.EventHook(this._conversationTree, "collapsed", this._onExpandedConversationChanged, this),
            new Mail.EventHook(this._conversationTree, "reset", this._onReset, this)
            );

        this._setExpandedConversation(this._conversationTree.activeConversation);
        Debug.only(Object.seal(this));
        Mail.writeProfilerMark("AccessibilityHelper.ctor", Mail.LogEvent.stop);
    };

    AH.prototype.dispose = function () {
        Mail.writeProfilerMark("AccessibilityHelper.dispose", Mail.LogEvent.start);
        this._clearExpandedConversation();

        Jx.dispose(this._disposer);
        this._disposer = null;
        this._listView = null;

        this._collection = null;
        Mail.writeProfilerMark("AccessibilityHelper.dispose", Mail.LogEvent.stop);
    };

    AH.prototype._updateAccessibility = function (evt) {
        ///<param name="evt" type="Event"/>
        Mail.writeProfilerMark("AccessibilityHelper._updateAccessibility", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isObject(evt.detail));
        Debug.assert(Jx.isValidNumber(evt.detail.firstIndex));
        Debug.assert(Jx.isValidNumber(evt.detail.lastIndex));
        var details = evt.detail,
            first = details.firstIndex,
            last = details.lastIndex;
        Debug.assert(first <= last);

        // Since we do not dispose the list View across folder switches, it is possible that the list View
        // fires events for the previous folder with indices that is out of bound.
        // In this case, we should ignore the update
        if (last >= this._collection.count) {
            return;
        }

        if (last >= 0) {
            Debug.assert(first >= 0);
            for (var ii = first; ii <= last; ii++) {
                var item = this._collection.item(ii);
                this._updateMessage(item.objectId);
            }
        }
        Mail.writeProfilerMark("AccessibilityHelper._updateAccessibility", Mail.LogEvent.stop);
    };

    AH.prototype._onExpandedConversationChanged = function (/*@dynamic*/ evt) {
        Debug.assert(Jx.isObject(evt));
        Mail.writeProfilerMark("AccessibilityHelper._onExpandedConversationChanged", Mail.LogEvent.start);
        var newExpandedConversation = evt.newValue;
        this._setExpandedConversation(newExpandedConversation);
        Mail.writeProfilerMark("AccessibilityHelper._onExpandedConversationChanged", Mail.LogEvent.stop);
    };

    AH.prototype._clearExpandedConversation = function () {
        if (this._expandedConvNode) {
            this._expandedConvNode.removeListener("endChanges", this._updateExpandedMessages, this);
            this._expandedConvNode = null;
        }
    };

    AH.prototype._onReset = function () {
        // Clear off the expanded conversation on reset.
        this._setExpandedConversation(null);  
    };

    AH.prototype._setExpandedConversation = function (newConversation) {
        /// <param name="newConversation" type="Mail.ConversationNode" />
        Mail.writeProfilerMark("AccessibilityHelper._setExpandedConversation", Mail.LogEvent.start);
        this._clearExpandedConversation();

        if (newConversation) {
            this._expandedConvNode = newConversation;
            this._expandedConvNode.addListener("endChanges", this._updateExpandedMessages, this);
        }
        this._updateExpandedMessages();
        Debug.assert(((this._expandedConvNode === null) && (this._expandedConvLength === 0)) || (this._expandedConvLength === this._expandedConvNode.totalCount));
        Mail.writeProfilerMark("AccessibilityHelper._setExpandedConversation", Mail.LogEvent.stop);
    };

    AH.prototype._updateExpandedMessages = function () {
        Mail.writeProfilerMark("AccessibilityHelper._updateExpandedMessages", Mail.LogEvent.start);
        this._expandedConvLength = 0;
        this._positionById = {};

        if (this._expandedConvNode) {
            this._expandedConvLength = this._expandedConvNode.totalCount;
            for (var ii = 0; ii < this._expandedConvLength; ii++) {
                var message = this._expandedConvNode.item(ii);
                this._positionById[message.objectId] = ii + 1;
            }
        }
        Mail.writeProfilerMark("AccessibilityHelper._updateExpandedMessages", Mail.LogEvent.stop);
    };

    AH.prototype._updateMessage = function (objectId) {
        Debug.Mail.writeProfilerMark("AccessibilityHelper._updateMessage - " + objectId, Mail.LogEvent.start);
        var positionInThread = this._getMessagePosition(objectId);
        if (positionInThread !== -1) {
            var element = Mail.MessageListItemFactory.getElementById(objectId);
            if (element) {
                Debug.assert(Jx.isHTMLElement(element));
                Mail.setAttribute(element, "aria-setsize", String(this._expandedConvLength));
                Mail.setAttribute(element, "aria-posinset", String(positionInThread));
                var isLastItem = (positionInThread === this._expandedConvLength);
                Jx.setClass(element, "mailMessageListLastItemInConversation", isLastItem);
            }
        }
        Debug.Mail.writeProfilerMark("AccessibilityHelper._updateMessage - " + objectId, Mail.LogEvent.stop);
    };

    AH.prototype._getMessagePosition = function (objectId) {
        var pos = this._positionById[objectId];
        if (Jx.isValidNumber(pos)) {
            return pos;
        }
        return -1;
    };
});
