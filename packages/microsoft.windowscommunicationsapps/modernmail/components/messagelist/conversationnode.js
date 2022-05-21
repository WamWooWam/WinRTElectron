
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug, Microsoft*/

Jx.delayDefine(Mail, "ConversationNode", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        ChangeType = Plat.CollectionChangeType;

    Mail.ConversationNode = function (conversation, view) {
        Debug.assert(Jx.isObject(conversation));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        this._locked = true;
        this._children = null;
        this._disposer = null;
        this._view = view;

        if (!Jx.isInstanceOf(conversation, Mail.UIDataModel.MailConversation)) {
            _markInfo("Ctor - creating placeholder", conversation.objectId);
            conversation = this._createPlaceHolder(conversation);
        }
        Mail.MessageListTreeNode.call(this, conversation, "conversation", null);
    };

    Jx.inherit(Mail.ConversationNode, Mail.MessageListTreeNode);

    var proto = Mail.ConversationNode.prototype;

    proto.dispose = function () {
        Mail.MessageListTreeNode.prototype.dispose.call(this);
        this._disposeChildren();
    };

    proto._disposeChildren = function () {       
        Jx.dispose(this._children);
        this._unhook();
        this._children = null;
        this._expanded = false;
    };

    //
    // Expand/collapse
    //
    proto.expand = function () {
        /// <returns type="Boolean">Whether the conversation is expanded</returns>
        _markStart("expand", this.objectId);

        // if it has more than one children fire events
        if (this.children.count > 1) {
            _markStart("expand - firing itemAdded events for child messages", this.objectId);

            // Set the expanded flag before firing the events to prevent the event listeners from thinking
            // items are added to a thread that is pending for expansion
            this._setExpanded(true);

            var prevId = this.objectId;
            Mail.Collection.forEach(this.children, function (messageNode, index) {
                /// <param name="messageNode" type="Mail.MessageListTreeNode"></param>
                /// <param name="index" type="Number"></param>
                this.raiseEvent("itemAdded", {
                    eType: ChangeType.itemAdded,
                    target: this,
                    prevId: prevId,
                    data: messageNode,
                    objectId: messageNode.objectId,
                    index: index
                });
                prevId = messageNode.objectId;
            }, this);
            _markStop("expand - firing itemAdded events for child messages", this.objectId);
        }
        _markStop("expand", this.objectId);
        return this._expanded;
    };

    proto.collapse = function (/*optional*/ index) {
        Debug.assert(Jx.isUndefined(index) || (Jx.isNumber(index) && index !== -1));
        _markStart("collapse index:=" + index, this.objectId);
        var result = this._expanded;
        if (this._expanded) {
            _markStart("collapse - firing itemRemoved events for child messages", this.objectId);

            // It is possible for the count to be 1 if the last message in the node is removed
            for (var i = 0; i < this.children.count; i++) {
                var childNode = this.item(i);
                this.raiseEvent("itemRemoved", {
                    eType : ChangeType.itemRemoved,
                    target : this,
                    objectId: childNode.objectId,
                    index: i,
                    parentIndex: index
                });
            }

            // Set the expanded flag after firing the events to prevent the event listeners from thinking
            // items are removed from a thread that is already collapsed
            this._setExpanded(false);
            _markStop("collapse - firing itemRemoved events for child messages", this.objectId);
        }
        this._disposeChildren();        
        _markStop("collapse index:=" + index, this.objectId);
        return result;
    };

    proto.isParent = function (childId) {
        /// <param name="childId" type="String"></param>
        Debug.assert(Jx.isNonEmptyString(childId));
        return this.findIndexById(childId) !== -1;
    };

    //
    // Collection parity interfaces
    //
    proto.item = function (i) {
        /// <param name="i" type="Number"></param>
        Debug.assert(i >= 0 && i < this.children.count);
        return this.children.item(i);
    };

    proto.map = function (fn, /*@optional,@dynamic*/context) {
        return Mail.Collection.map(this.children, fn, context);
    };

    proto.findIndexById = function (childId) {
        return Mail.Collection.findIndexById(this.children, childId);
    };

    proto.forEach = function (fn, context) {
        if (this.pendingRemoval) {
            return;
        }
        Mail.Collection.forEach(this.children, fn, context);
    };

    proto.lock = function () {
        _markInfo("lock", this.objectId);
        this._locked = true;
        if (this._children) {
            this._children.lock();
        }
    };

    proto.unlock = function () {
        _markInfo("unlock", this.objectId);
        this._locked = false;
        if (this._children) {
            this._children.unlock();
        }
    };

    proto._createPlaceHolder = function (placeHolder) {
        /// <summary>
        /// Return meaingful defaults for all properties/functions that this class accesses or calls on the this._data member variable
        /// </summary>
        Debug.assert(Jx.isObject(placeHolder));
        Debug.assert(Jx.isNonEmptyString(placeHolder.objectId));
        return {
            objectId: placeHolder.objectId,
            totalCount: 0,
            getChildMessageCollection: function () {
                return new Mail.ArrayCollection([]);
            },
            pendingRemoval: true
        };
    };

    Object.defineProperty(proto, "totalCount", {
        get : function () {
            // if we have children, do not reply on the totalCount property as aggregated property can go out of sync during deletes
            return (this._children) ? this._children.count : this._data.totalCount;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "children", { get : function () {
        this._ensureChildren();
        return this._children;
    }, enumerable : true});

    Object.defineProperty(proto, "visibleChildrenCount", { get : function () {
        return (this.expanded) ? this.children.count : 0;
    }, enumerable : true});

    Object.defineProperty(proto, "pendingCollapse", { get : function () {
        return this._expanded && this.totalCount <= 1;
    }, enumerable : true});

    Object.defineProperty(proto, "pendingRemoval", { get : function () {
        return this._data.pendingRemoval;
    }, enumerable : true});

    proto._setExpanded = function (isExpanded) {
        this._expanded = isExpanded;
        this.raiseEvent("toggleExpansion");
    };

    proto._hook = function () {
        Debug.assert(this._disposer === null);
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(this._children, "beginChanges", this._beginChanges, this),
            new Mail.EventHook(this._children, "endChanges", function (event) { this._forwardEvent("endChanges", event); }, this),
            new Mail.EventHook(this._children, "itemAdded", function (event) { this._forwardEvent("itemAdded", event); }, this),
            new Mail.EventHook(this._children, "itemRemoved", function (event) { this._forwardEvent("itemRemoved", event); }, this),
            new Mail.EventHook(this._children, "itemMoved", function (event) { this._forwardEvent("itemMoved", event); }, this),
            new Mail.EventHook(this._children, "reset", function (event) { this._forwardEvent("reset", event); }, this)
        );
    };

    proto._unhook = function () {
        Jx.dispose(this._disposer);
        this._disposer = null;
    };

    proto._ensureChildren = function () {
        if (this._children) {
            return;
        }
        _markStart("_ensureChildren", this.objectId);

        // create the children
        var query = new Mail.QueryCollection(this._data.getChildMessageCollection, this._data);
        this._children = Mail.MessageListCollection.createForMessages(query, this._view, this._locked, this);

        // listen for events
        this._hook();

        // Sanity Check
        Debug.assert(this._children, "The children must be valid after _ensureChildren");
        _markStop("_ensureChildren", this.objectId);
    };

    proto._beginChanges = function (ev) {
        this._forwardEvent("beginChanges", ev);
    };

    proto._forwardEvent = function (type, ev) {
        ev.target = this;
        this.raiseEvent(type, ev);
    };

    function _markInfo(evt, id) { Jx.mark("Mail.ConversationNode." + evt + " - " + id); }
    function _markStart(evt, id) { Jx.mark("Mail.ConversationNode." + evt + " - " + id + ",StartTA,Mail"); }
    function _markStop(evt, id) { Jx.mark("Mail.ConversationNode." + evt + " - " + id + ",StopTA,Mail"); }

});
