
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft,WinJS*/

Jx.delayDefine(Mail, "ThreadedListCollection", function () {
    "use strict";

    var SelectionHelper = Mail.SelectionHelper,
        invalidIndex = -1;     // Constant for having no expanded thread

    // Implements most of the MessageListCollection functions.
    // Does not need to implement:
    //   - onChangesPending - only called from a DeferredCollection, which this implementation does not use.

    Mail.ThreadedListCollection = function (platform, platformCollection, view, locked, options) {
        ///<summary>Manages routing calls between two separate collections, the open thread, and the overall list of threads.</summary>
        ///<param name="options" type="Object" optional="true">
        /// - name="initialExpansion" type="Number" - Index of conversation to pre-expand.
        /// - name="initialExpansionId" type="String" - Id of message within a conversation with which we should pre-expand (will use the initialExpansion as a hint if available)
        ///</param>
        _markStart("ctor");

        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isObject(platformCollection));
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isBoolean(locked));
        Debug.assert(Jx.isUndefined(options) || Jx.isObject(options));

        options = options || {};
        this._platform = platform;
        this._locked = locked;
        this._batchDepth = 0; // Prevents us from firing nested beginChanges/endChanges events

        // initialize the event handlers
        var handlers = ["_onMessageItemAdded", "_onMessageItemRemoved", "_onConversationAdded", "_onConversationRemoved", "_onConversationMoved", "_onMessageItemMoved"];
        handlers.forEach(/*@bind(Mail.ThreadedListCollection)*/ function (handlerName) {
            /// <param name="handlerName" type="String"></param>
            Debug.assert(Jx.isNonEmptyString(handlerName));
            Debug.assert(Jx.isFunction(this[handlerName]));
            this[handlerName] = this._createEventHandler(this[handlerName]);
        }.bind(this));

        // Handles the collection for the overall threaded message view
        this._conversationCollection = Mail.MessageListCollection.createForConversations(platformCollection, view, locked);
        this._convCollectionEventHooks = null;
        this._initConversationCollection(this._conversationCollection);

        // Keep track of currently open thread
        this._activeConversation = null;
        // The activeConversationIndex is set when a thread is activated (selected), and cleared when the activeConversation is deleted
        // Collapsing a thread does not clear the activeConversationIndex
        this._activeConversationIndex = invalidIndex;
        this._activeConversationEventHooks = null;

        // Keep track of pending operation
        this._pendingCollapseExpand = null;

        // Special case - caller can choose to have a conversation expanded upon creation
        var initialExpansionIndexHint = options.initialExpansion,
            initialExpansionId = options.initialExpansionId;
        if (this.count > 0 && (Jx.isNumber(initialExpansionIndexHint) || Jx.isNonEmptyString(initialExpansionId))) {
            this._tryInitialExpansion(initialExpansionIndexHint, initialExpansionId);
        }
        _markStop("ctor");
    };
    Jx.inherit(Mail.ThreadedListCollection, Jx.Events);

    var proto = Mail.ThreadedListCollection.prototype;
    Debug.Events.define(proto, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges", "collapsing", "collapsed", "expanded");

    // Make this wrapper collection look like a platform collection
    Object.defineProperty(proto, "count", {
        get: function () {
            var numConversations = this._conversationCollection.count;
            return (numConversations > 0) ? numConversations + this._visibleExpandedItemsCount : numConversations;
        }
    });

    Object.defineProperty(proto, "_visibleExpandedItemsCount", { get: function () {
        /// <summary>
        /// Returns the number of visible expanded items. If the number of expanded items is 1 or less, then 0 are visible.
        /// Else the number is just equal to the number of messages in the currently expanded conversation.
        /// </summary>
        return (this._activeConversation) ? this._activeConversation.visibleChildrenCount : 0;
    }, enumerable : true});

    // Need to have the same properties as SearchCollection
    Object.defineProperty(proto, "isEmpty", { get: function () { return this.count === 0; } });

    Object.defineProperty(proto, "expanded", { get: function () {
        return this._activeConversation ? this._activeConversation.expanded : false;
    } });

    Object.defineProperty(proto, "activeConversationIndex", {
        get: function () {
            /// <summary>Returns the index of the currently expanded thread. Returns -1 if no thread is expanded.</summary>
            return this._activeConversationIndex;
        }
    });

    Object.defineProperty(proto, "activeConversation", {
        get: function () {
            /// <summary>Returns the index of the currently expanded thread. Returns -1 if no thread is expanded.</summary>
            return this._activeConversation;
        }
    });


    proto.findIndexByThreadId = function (threadId, indexHint) {
        /// <summary>Returns the index of the thread for the given thread id. Returns -1 if the conversation is not found.</summary>
        /// <param name="threadId" type="String" />
        /// <param name="indexHint" type="Number" optional="true" />
        Debug.assert(Jx.isNonEmptyString(threadId));
        if (this._activeConversation && (this._activeConversation.objectId === threadId) && this._isValidIndex(this._activeConversationIndex)) {
            return this._activeConversationIndex;
        }

        var index = invalidIndex,
            threadIndex = Mail.Collection.findIndexById(this._conversationCollection, threadId, indexHint);

        if (threadIndex !== invalidIndex) {
            index = this._conversationIndexToOverallIndex(threadIndex);
            Debug.assert(this._isValidIndex(index));
        }
        return index;
    };

    proto.findIndexByMessageId = function (messageId, indexHint) {
        /// <summary>Returns the index of the conversation for the given message id. Returns -1 if the conversation is not found.</summary>
        /// <param name="messageId" type="String" optional="true" />
        /// <param name="indexHint" type="Number" optional="true" />
        Debug.assert(Jx.isNullOrUndefined(messageId) || Jx.isString(messageId));
        Debug.assert(Jx.isNullOrUndefined(indexHint) || Jx.isNumber(indexHint));
        if (messageId) {
            // This expansion id is for a message under a conversation that we should immediately expand.
            // We will first find the conversation id for which we should look for, and then we should search for it using the indexHint as a hint for where to start.
            var parentConversationId = null;
            try {
                parentConversationId = this._platform.mailManager.loadMessage(messageId).parentConversationId;
            } catch (e) {}
            if (parentConversationId) {
                // parentConversationId can be null if the item has since been deleted.
                var threadIndex = this.findIndexByThreadId(parentConversationId, indexHint);
                if (threadIndex !== -1) {
                    var node = this.item(threadIndex),
                        childIndex = node.findIndexById(messageId);
                    if (childIndex !== -1) {
                        return threadIndex;
                    }
                }
            }
        }
        return -1;
    };

    proto.clearPendingExpandCollapse = function () {
        /// <summary>Clears any pending expand or collapse operations</summary>
        Jx.dispose(this._pendingCollapseExpand);
        this._pendingCollapseExpand = null;
    };

    proto._isThreadIndex = function (index) {
        return this._isValidIndex(index) && !this._isIndexWithinExpandedConversation(index);
    };

    proto.expand = function (index, childIdToSelect) {
        /// <summary>Expands the thread at the given index</summary>
        /// <param name="index" type="Number">Index of thread to expand</param>
        /// <param name="childIdToSelect" type="String" optional="true"></param>

        if (this._isValidIndex(index) && this._isThreadIndex(index) &&
            /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
            !this.item(index).pendingRemoval) {
            /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>

            if (!this._locked) {
                _markStart("expand - index:=" + index);

                // Adjust the index for the current open thread before we collapse it
                var conversationIndex = this._overallIndexToConversationIndex(index);

                this._beginChanges();

                if ((this._activeConversationIndex !== invalidIndex) && (this._activeConversationIndex !== index)) {
                    // Fire "collapsing" event before calling beginChanges
                    this._collapseHelper();
                }
                this._expandHelper(conversationIndex, childIdToSelect);
                this._endChanges();
                _markStop("expand - index:=" + index);
            } else {
                _mark("expand - delaying expand until listview is ready. index:=" + index);
                this.clearPendingExpandCollapse();
                this._pendingCollapseExpand = new Mail.Promises.AsyncJob(this.expand, this, [index]);
            }
        }
        return WinJS.Promise.as((this._pendingCollapseExpand) ? this._pendingCollapseExpand.promise : null);
    };

    proto.collapse = function () {
        if (this.expanded) {
            if (!this._locked) {
                _markStart("collapse - index:" + this._activeConversationIndex);
                this._beginChanges();
                this._collapseHelper();
                this._endChanges();
                _markStop("collapse - index:" + this._activeConversationIndex);
            } else {
                _mark("collapse - delaying collapse until listview is ready. index:=" + this._activeConversationIndex);
                this.clearPendingExpandCollapse();
                this._pendingCollapseExpand = new Mail.Promises.AsyncJob(this.collapse, this);
            }
        }
        return WinJS.Promise.as((this._pendingCollapseExpand) ? this._pendingCollapseExpand.promise : null);
    };

    proto.item = function (index) {
        /// <returns type="Mai.UIDataModel.MailItem"/>
        // Determine which collection to retrieve from

        var item = null,
            isWithinExpandedConversation = this._isIndexWithinExpandedConversation(index);
        Debug.assert(this._isValidIndex(index), "Invalid index:=" + index +
            " conversationCount:=" + this._conversationCollection.count +
            " activeConversationIndex:=" + this._activeConversationIndex +
            " visibleChildren:= " + this._visibleExpandedItemsCount +
            " isWithinActiveConversation:= " + isWithinExpandedConversation +
            " count:= " + this.count);

        if (!isWithinExpandedConversation) {
            item = this._conversationCollection.item(this._overallIndexToConversationIndex(index));
        } else {
            Debug.assert(this._activeConversation);
            item = this._activeConversation.item(index - this._activeConversationIndex - 1);
        }
        return item;
    };

    proto.getTreeView = function () {
        /// <summary>
        /// Returns an interface to edit the collection
        /// This is currently used by the SelectionController for expanding/collapsing the thread
        /// The motivation of this function is to pull all editing function in its private interface so that all collection
        /// can expose a homogeneous interface to the dataSource/notificationHandler for basic item retrievals
        /// For now, this interface just returns itself.
        /// </summary>
        return this;
    };

    proto.dispose = function () {
        _markStart("dispose");
        this.clearPendingExpandCollapse();

        // clean up the active Thread
        this._unhookActiveConversation();
        Jx.dispose(this._activeConversation);
        this._activeConversation = null;
        this._activeConversationIndex = invalidIndex;

        // Clean up the collection
        Jx.dispose(this._conversationCollection);
        this._conversationCollection = null;
        Jx.dispose(this._convCollectionEventHooks);
        this._convCollectionEventHooks = null;
        this._platform = null;
        _markStop("dispose");
    };

    proto.lock = function () {
        if (this._locked) {
            return;
        }

        _markStart("lock");
        this._locked = true;
        this._conversationCollection.lock();
        if (this._activeConversation) {
            this._activeConversation.lock();
        }
        _markStop("lock");
    };

    proto.unlock = function () {
        /// <summary>The function is called by the messageList when the loading state of the listView changes.
        /// As per the guidance of the ListView team, we can only fire notifications when the listView is ready,
        /// such that their listView won't be interrupted by notifications while it is laying items out, etc.
        /// As a result, whenever there are pending changes from the platform, we only report the changes if the listView is ready,
        /// Otherwise, we set the hasPendingChanges flag and wait for the listView to be ready
        /// </summary>
        if (!this._locked) {
            return;
        }

        this._locked = false;
        // Process any collapse/expand requests if the view is ready
        if (this._pendingCollapseExpand) {
            _markStart("unlock - running pending collapse/expand");
            this._beginChanges();
            this._pendingCollapseExpand.execute();
            this.clearPendingExpandCollapse();
            // If we are doing a pending expand collapse, do not process further changes synchronously, let the expand/collapse go through first
            this._endChanges();
            _markStop("unlock - running pending collapse/expand");
        }

        _markStart("unlock - accept pending changes");
        this._beginChanges();
        this._conversationCollection.unlock();
        if (this._activeConversation) {
            this._activeConversation.unlock();
        }
        this._endChanges();
        _markStop("unlock - accept pending changes");
    };

    // Listeners

    proto._onReset = function (ev) {
        if (this._filterAndAdjustEvent(ev)) {
            _markStart("._onReset");
            // There is no longer an expanded thread
            // Unhook the expanded node as we don't want to fire itemRemoved events
            this.clearPendingExpandCollapse();
            this._unhookActiveConversation();
            // Collapse the thread
            if (this._activeConversation) {
                this._activeConversation.collapse();
            }
            // Clear the active Thread
            this._clearActiveConversation();
            this.raiseEvent("reset", ev);
            _markStop("._onReset");
        }
    };

    proto._baseEventHandler = function (/*@dynamic*/ ev, handler) {
        /// <param name="event" type="dynamic"></param>
        /// <param name="handler" type="Function"></param>
        Debug.assert(Jx.isFunction(handler));
        Debug.assert(Jx.isObject(ev.target));
        Debug.assert(Jx.isNumber(ev.index));

        var type = SelectionHelper.getEventType(ev.eType);
        // map the index and the previous index of the event to the flattened list index
        if (!this._filterAndAdjustEvent(ev)) {
            return;
        }

        ev.originalExpandedConversationIndex = this._activeConversationIndex;
        this._activeConversationIndex = SelectionHelper.getUpdatedIndex(type, ev, this._activeConversationIndex);
        handler.call(this, ev);
    };

    proto._createEventHandler = function (handler) {
        /// <param name="handler" type="Function"></param>
        Debug.assert(Jx.isFunction(handler));
        return /*@bind(Mail.ThreadedListCollection)*/ function (ev) {
            this._baseEventHandler(ev, handler);
        }.bind(this);
    };

    /// Conversation Collection Event Handlers
    proto._onConversationAdded = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        _markStart("_onConversationAdded index:=" + ev.index + " key:=" + ev.objectId);
        this.raiseEvent("itemAdded", ev);
        _markStop("_onConversationAdded index:=" + ev.index + " key:=" + ev.objectId);
    };

    proto._onConversationRemoved = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNullOrUndefined(ev.prevId), "Do we need to start updating prevId on delete?");

        // In case we call _collapseHelper or _ensureVisibleInvisible, make sure we're in an operation here
        this._beginChanges();

        // If this is the open thread, we need to remove all our child elements as well
        if (ev.index === ev.originalExpandedConversationIndex) {
            _markStart("_onConversationRemoved - activeConversation:=true index:=" + ev.originalExpandedConversationIndex);
            var removedIndex = this._activeConversationIndex,
                removedNode = this._activeConversation;

            // reset the activeConversationIndex so that the internal state is correct in the event handler of the collapsing and collapsed event
            this._activeConversationIndex = -1;
            this._activeConversation = null;

            // collapse the thread
            this._collapseHelper(removedNode, removedIndex);

            // unhook the events
            Jx.dispose(this._activeConversationEventHooks);
            this._activeConversationEventHooks = null;

            _markStop("_onConversationRemoved - activeConversation:=true index:=" + ev.originalExpandedConversationIndex);
        }
        // Original item removed
        _markStart("_onConversationRemoved activeConversation:=false index:=" + ev.index);
        this.raiseEvent("itemRemoved", ev);
        _markStop("_onConversationRemoved activeConversation:=false index:=" + ev.index);
        this._endChanges();
    };

    proto._onConversationMoved = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNumber(ev.previousIndex));
        // If this moves the currently expanded thread, we need to move all our child elements as well.
        // This means we need to handle all move events that either move from the expanded thread, or to the expanded thread.
        // Any moves that do not touch the expanded thread directly will be handled correctly by the listview.
        var shouldMoveExpandedConversation = (ev.previousIndex === ev.originalExpandedConversationIndex) && this.expanded;
        if (shouldMoveExpandedConversation) {
            this._beginChanges();
            this._onExpandedConversationMoved(ev);
            this._endChanges();
        } else {
            // If this item is moving down the list to the spot where our expanded conversation currently sits, adjust it now that the expanded thread will be below it
            if (ev.originalExpandedConversationIndex !== invalidIndex && ev.index === ev.originalExpandedConversationIndex && ev.index > ev.previousIndex) {
                ev.index += this._visibleExpandedItemsCount;
            }
            this.raiseEvent("itemMoved", ev);
        }
    };

    proto._onExpandedConversationMoved = function (/*@dynamic*/ev) {
        /// <summary> When the expanded conversation is moved, we need to fire a move event for each of its children messages.</summary>
        /// <param name="ev"></param>
        _markStart("onExpandedConversationMoved");
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNumber(ev.previousIndex));

        var oldExpandedConversationIndex = ev.originalExpandedConversationIndex,
            moveDown = ev.index > ev.previousIndex;

        Debug.assert(this._activeConversationIndex > 0 || !moveDown, "If the expanded thread is moving downward, the destination cannot be 0");
        Debug.assert(this._activeConversationIndex < (this._conversationCollection.count - 1) || moveDown, "If the expanded thread is moving upward, the destination cannot be the last item");

        /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
        // if we are moving down, use the prevId, so that we can re-use the same prevId across all child messages, else use the nextId
        var ChangeType = Microsoft.WindowsLive.Platform.CollectionChangeType,
            prevId = (moveDown) ? this._conversationCollection.item(this._activeConversationIndex - 1).objectId : null,
            nextId = (moveDown) ? null : this._conversationCollection.item(this._activeConversationIndex + 1).objectId,
        /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            moveEvents = this._activeConversation.map(/*@bind(Mail.ThreadedListCollection)*/ function (message, index) {
                /// <param name="message" type="Mail.MessageListTreeNode"></param>
                /// <param name="index" type="Number"></param>
                var prevIndex = oldExpandedConversationIndex + index + 1,
                    newIndex = this._activeConversationIndex + index + 1;
                Debug.assert(Jx.isNonEmptyString(prevId) || Jx.isNonEmptyString(nextId), "A move event should have either a prevId or a nextId");
                return {
                    eType:          ChangeType.itemChanged,
                    data:           message,
                    previousIndex:  prevIndex,
                    index:          newIndex,
                    prevId:         prevId,
                    nextId:         nextId,
                    objectId:       message.objectId
                };
            }, this);

        // insert the original event at the front and fixes up its prev and nextId
        ev.prevId = prevId;
        ev.nextId = nextId;
        moveEvents.unshift(ev);

        // if we are moving down, reverse the order of the move events, as we want to move the last child message first and the header last
        // This will ensure every index in the expanded thread remains unchanged other that the index that we are currently moving.
        // The SelectionController relies on this property to update the last displayed index
        if (moveDown) {
            moveEvents.reverse();
        }

        // raise the move events
        moveEvents.forEach(function (/*@dynamic*/ moveEvent) {
            Debug.only(_mark("_onExpandedConversationMoved - key: " + moveEvent.objectId +
                    " previousIndex:" +  moveEvent.previousIndex +
                    " index:" + moveEvent.index +
                    " prevId:" + moveEvent.prevId +
                    " nextId:" + moveEvent.nextId));
            this.raiseEvent("itemMoved", moveEvent);
        }, this);
        _markStop("onExpandedConversationMoved");
    };

    /// Expanded Thread Collection Event Handlers
    proto._onMessageItemAdded = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isObject(this._activeConversation));
        _markStart("_onMessageItemAdded");
        if (this._activeConversation.expanded) {
            Debug.Mail.log("ThreadedListCollection._onMessageItemAdded - raising itemAdded for index:" + String(ev.index), Mail.LogEvent.start);
            this.raiseEvent("itemAdded", ev);
            Debug.Mail.log("ThreadedListCollection._onMessageItemAdded - raising itemAdded for index:" + String(ev.index), Mail.LogEvent.stop);
        }
        _markStop("_onMessageItemAdded");
    };

    proto._onMessageItemRemoved = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNullOrUndefined(ev.prevId), "Do we need to start updating prevId on delete?");
        Debug.assert(Jx.isObject(this._activeConversation) || Jx.isNumber(ev.parentIndex));
        Debug.assert(Jx.isInstanceOf(ev.target, Mail.ConversationNode));

        // Also filter any "removeItem" calls from a non-visible expanded thread
        if (!ev.target.expanded) {
            Debug.Mail.log("ThreadedListCollection._onItemRemoved - suppressing itemRemoved event since this conversation is not visibly expanded, conversation index:" +
                String(ev.originalExpandedConversationIndex));
            return;
        }
        this._beginChanges();
        // Original item removed
        Debug.Mail.log("ThreadedListCollection._onMessageItemRemoved - raising itemRemoved for index:" + String(ev.index), Mail.LogEvent.start);
        this.raiseEvent("itemRemoved", ev);
        Debug.Mail.log("ThreadedListCollection._onMessageItemRemoved - raising itemRemoved for index:" + String(ev.index), Mail.LogEvent.stop);
        // If this remove event took us down to <=1 visible item, ensure we collapse it
        this._endChanges();
    };

    proto._onMessageItemMoved = function (/*@dynamic*/ev) {
        /// <param name="Event" type="dynamic"></param>
        Debug.assert(Jx.isObject(ev));
        Debug.assert(Jx.isNumber(ev.previousIndex));
        Debug.assert(Jx.isObject(this._activeConversation));
        Debug.Mail.log("ThreadedListCollection._onItemMoved - raising itemMoved for previousIndex:" + String(ev.previousIndex) + " index:" + String(ev.index), Mail.LogEvent.start);
        this.raiseEvent("itemMoved", ev);
        Debug.Mail.log("ThreadedListCollection._onItemMoved - raising itemMoved for previousIndex:" + String(ev.previousIndex) + " index:" + String(ev.index), Mail.LogEvent.stop);
    };

    // Private
    proto._fireCollapsingEvent = function (node, index) {
        Debug.assert(Jx.isInstanceOf(node, Mail.ConversationNode));
        Debug.assert(Jx.isNumber(index));
        if (node.expanded) {
            var firstIndex = index + 1,
                lastIndex = index + node.visibleChildrenCount;
            Debug.assert(index !== invalidIndex);
            this.raiseEvent("collapsing", {
                target: this,
                index: index,
                firstMessageIndex: firstIndex,
                lastMessageIndex: lastIndex
            });
        }
    };

    proto._expandHelper = function (index, childIdToSelect) {
        /// <summary>Does the actual expanding part of the whole "expand" operation, which also includes collapsing</summary>
        /// <param name="index" type="Number"></param>
        Debug.assert(this._isValidIndex(index), "Invalid index:" + String(index));
        _markStart("_expandHelper");

        this.clearPendingExpandCollapse();
        var conversationNode = /*@static_cast(Mail.ConversationNode)*/this._conversationCollection.item(index);

        if (/*@static_cast(Boolean)*/conversationNode && !conversationNode.pendingRemoval && !conversationNode.expanded) {

            Debug.assert(Jx.isNonEmptyString(conversationNode.objectId));
            if (this._activeConversation !== conversationNode) {
                this._setActiveConversation(index, conversationNode);
            }

            if (this._activeConversation.expand()) {
                // Notify the listview that we are adding these items
                this.raiseEvent("expanded", {
                    target: this,
                    index : this._activeConversationIndex,
                    newValue: this._activeConversation,
                    childIdToSelect : childIdToSelect
                });
            }
        }
        _markStop("_expandHelper");
    };

    proto._collapseHelper = function (/*@optional*/ nodeToCollapse, /*@optional*/ indexToCollapse) {
        var node = Jx.isUndefined(nodeToCollapse) ? this._activeConversation : nodeToCollapse,
            index = Jx.isUndefined(indexToCollapse) ? this._activeConversationIndex : indexToCollapse;

        _markStart("_collapseHelper index:=" + index);
        Debug.assert(Jx.isInstanceOf(node, Mail.ConversationNode));
        Debug.assert(Jx.isNumber(index) && index !== invalidIndex);

        this.clearPendingExpandCollapse();
        // Notify the listview that we are removing these items
        this._fireCollapsingEvent(node, index);

        // Directly pass the value of indexToCollapse from the caller to node.collapse.
        // Calling collapse with a non empty index is generally not preferred as it will bypass a few checks in our event handlers
        if (node.collapse(indexToCollapse)) {
            // Notify the app State
            this.raiseEvent("collapsed", { target: this, index: index, newValue: null });
        }
        _markStop("_collapseHelper index:=" + index);
    };

    proto._setActiveConversation = function (index, thread) {
        /// <param name="index" type="Number"></param>
        /// <param name="thread" type="Mail.ConversationNode" optional="true"></param>
        _mark("_setActiveConversation - index:=" + index + " key:=" + thread ? thread.objectId : null);
        Debug.assert(Jx.isInstanceOf(thread, Mail.ConversationNode));
        Debug.assert((/*@static_cast(Mail.ConversationNode)*/this._conversationCollection.item(index)) === thread);

        this._activeConversationIndex = index;
        if (thread !== this._activeConversation) {
            this._unhookActiveConversation();
            this._activeConversation = thread;
            if (this._locked) {
                this._activeConversation.lock();
            } else {
                this._activeConversation.unlock();
            }
            this._hookActiveConversation(this._activeConversation);
        }
    };

    proto._clearActiveConversation = function () {
        /// <summary>Clear the active thread and release the activeConversation index</summary>
        _mark("_clearActiveConversation");
        this._unhookActiveConversation();
        this._activeConversation = null;
        this._activeConversationIndex = -1;
    };

    proto._beginChanges = function () {
        if (this._batchDepth === 0) {
            var count = this.count;
            _markStart("_beginChanges count:=" + count);
            this.raiseEvent("beginChanges", { target: this });
            _markStop("_beginChanges count:=" + count);
        }
        this._batchDepth++;
    };

    proto._endChanges = function () {
        if (this._batchDepth === 1) {
            // Ensure our currently expanded conversation is in the correct state after this latest change
            this._ensureVisibleInvisible();

            // Sanity Check
            Debug.ThreadedListCollection.verifyExpansionState(this);

            var logInfo = "_endChanges count:=" + this.count;
            _markStart(logInfo);
            this.raiseEvent("endChanges", { target: this });
            _markStop(logInfo);
        }

        this._batchDepth--;
    };

    proto._initConversationCollection = function (collection) {
        /// <param name="collection" type="Mail.MessageListCollection"></param>
        _markStart("_initConversationCollection");
        Debug.assert(Jx.isInstanceOf(collection, Mail.MessageListCollection));
        this._convCollectionEventHooks = new Mail.Disposer(
            new Mail.EventHook(collection,  "beginChanges", this._beginChanges,             this),
            new Mail.EventHook(collection,  "endChanges",   this._endChanges,               this),
            new Mail.EventHook(collection,  "itemAdded",    this._onConversationAdded,      this),
            new Mail.EventHook(collection,  "itemRemoved",  this._onConversationRemoved,    this),
            new Mail.EventHook(collection,  "itemMoved",    this._onConversationMoved,      this),
            new Mail.EventHook(collection,  "reset",        this._onReset,                  this));
        _markStop("_initConversationCollection");
    };

    proto._hookActiveConversation = function (expandedNode) {
        /// <param name="collection" type="Mail.MessageListCollection"></param>
        _markStart("_hookActiveConversation");
        Debug.assert(Jx.isInstanceOf(expandedNode, Mail.ConversationNode));
        Debug.assert(!this._activeConversationEventHooks, "We must unhook the previous expandedNode before hooking the new node");
        this._activeConversationEventHooks = new Mail.Disposer(
            new Mail.EventHook(expandedNode,  "beginChanges", this._beginChanges,           this),
            new Mail.EventHook(expandedNode,  "endChanges",   this._endChanges,             this),
            new Mail.EventHook(expandedNode,  "itemAdded",    this._onMessageItemAdded,     this),
            new Mail.EventHook(expandedNode,  "itemRemoved",  this._onMessageItemRemoved,   this),
            new Mail.EventHook(expandedNode,  "itemMoved",    this._onMessageItemMoved,     this),
            new Mail.EventHook(expandedNode,  "reset",        this._onReset,                this));
        _markStop("_hookActiveConversation");
    };

    proto._unhookActiveConversation = function () {
        /// <summary>Dispose the collection and unhook the events in the event map</summary>
        _markStart("_unhookActiveConversation");
        Jx.dispose(this._activeConversationEventHooks);
        this._activeConversationEventHooks = null;
        _markStop("_unhookActiveConversation");
    };

    proto._tryUpdateConversationEventIndex = function (/*@dynamic*/ev, prop) {
        var original = ev[prop],
            changeType = Microsoft.WindowsLive.Platform.CollectionChangeType,
            isExpandedConvMoved = (ev.eType === changeType.itemChanged) && (ev.previousIndex === this._activeConversationIndex);

        if (isExpandedConvMoved) {
            // Since we are moving the expanded conversation, any offset we adjusted the index for will be cancelled out.
            // As in, if we added 5 to the new index because it is moved after all of our expanded items, all of those
            // expanded items are going to be moved as well, so we should use the original index instead.
            return;
        }

        if (!Jx.isNumber(original)) {
            return;
        }

        var newVal = ev[prop] = this._conversationIndexToOverallIndex(original);
        if (original !== newVal) {
            Debug.only(_mark("_tryUpdateConversationEventIndex - property:=" + prop + " from:=" + original + " to:=" + newVal));
        }
    };

    proto._tryUpdateMessageEventIndex = function (/*@dynamic*/ev, prop) {
        var original = ev[prop],
            parentIndex = Jx.isNumber(ev.parentIndex) ? ev.parentIndex : this._activeConversationIndex;
        if (Jx.isNumber(original)) {
            var newVal = ev[prop] = parentIndex + original + 1;
            Debug.only(_mark("_tryUpdateConversationEventIndex - property:=" + prop + " from:=" + original + " to:=" + newVal));
        }
    };

    proto._filterAndAdjustEvent = function (/*@dynamic*/ev) {
        /// <summary>Adjusts the index of the given event. Also returns false if the event should be suppressed.</summary>
        var source = ev.target;
        Debug.assert(Jx.isObject(ev.target));

        var suppressEvent = true;
        if (source === this._conversationCollection) {
            // Adjust index in case this conversation is after an expanded thread
            ev.originalIndex = ev.index;
            this._tryUpdateConversationEventIndex(ev, "index");
            this._tryUpdateConversationEventIndex(ev, "previousIndex");
            suppressEvent = false;
        // If the collapse is due to the activeConversation being deleted, this._activeConversation will be null.
        // In this case, the event should have the parentIndex field set
        } else if (source === this._activeConversation || Jx.isValidNumber(ev.parentIndex)) {
            // Adjust index for this expanded thread message
            ev.originalIndex = ev.index;
            this._tryUpdateMessageEventIndex(ev, "index");
            this._tryUpdateMessageEventIndex(ev, "previousIndex");
            suppressEvent = false;
        } else {
            Debug.only(_mark("_filterAndAdjustEvent - event is filtered as it comes from an already collapsed conversation"));
        }
        // This will be true only if we received an event from an already collapsed thread (timing issue)
        return !suppressEvent;
    };
    proto._ensureVisibleInvisible = function () {
        /// <summary>
        /// If we are at the end of a batch operation, ensure the currently opened thread is visibly expanded or not,
        /// depending on the number of items in the list.
        /// </summary>
        if (this._activeConversation) {
            _markStart("_ensureVisibleInvisible index:= " + this._activeConversationIndex);
            if (this._activeConversation.pendingCollapse) {
                this._collapseHelper();
            }
            _markStop("_ensureVisibleInvisible index:= " + this._activeConversationIndex);
        }
    };

    proto._isIndexWithinExpandedConversation = function (index) {
        /// <param name="index" type="Number"></param>
        return this._activeConversationIndex !== invalidIndex && index > this._activeConversationIndex && index <= this._activeConversationIndex + this._visibleExpandedItemsCount;
    };

    proto._overallIndexToConversationIndex = function (index) {
        /// <summary>Takes the given overall index and adjusts it to the intended conversation</summary>
        Debug.assert(!this._isIndexWithinExpandedConversation(index), "The index:=" + index + " is within the expanded conversation");
        var result = index;
        if (this._activeConversationIndex >= 0 &&
            this._activeConversationIndex < this._conversationCollection.count &&
            index > this._activeConversationIndex) {
            Debug.assert(index > this._visibleExpandedItemsCount);
            result -= this._visibleExpandedItemsCount;
        }
        Debug.assert((result >= 0 && result < this._conversationCollection.count), "index:=" + index +
            " result:=" + result +
            " conversationCount:=" + this._conversationCollection.count +
            " activeConversationIndex:= " + this._activeConversationIndex +
            " visibleExpandedItemsCount:= " + this._visibleExpandedItemsCount
        );
        return result;
    };

    proto._conversationIndexToOverallIndex = function (index) {
        /// <summary>Takes the given conversation index and adjusts it to an overall list index</summary>
        var result = index;
        if (this._activeConversationIndex >= 0 &&
            this._activeConversationIndex < this._conversationCollection.count &&
            index > this._activeConversationIndex) {
            result += this._visibleExpandedItemsCount;
        }
        // Not asserting here as this function in called during index adjustment in response to collectionchanged events
        // It is possible that the original index is adjusted out of bound of the new collection in the case of a delete
        Debug.only(_mark("_conversationIndexToOverallIndex index:=" + index +
            " result:=" + result +
            " conversationCount:=" + this._conversationCollection.count +
            " activeConversationIndex:=" + this._activeConversationIndex +
            " visibleExpandedItemsCount:= " + this._visibleExpandedItemsCount
        ));
        return result;
    };

    proto._isValidIndex = function (index) {
        return index >= 0 && index < this.count;
    };

    proto._tryInitialExpansion = function (initialExpansionIndexHint, initialExpansionMessageId) {
        /// <summary>Try pre-expanding the conversation corresponding to the given index or message id</summary>
        /// <param name="initialExpansionIndexHint" type="Number" optional="true"></param>
        /// <param name="initialExpansionMessageId" type="String" optional="true"></param>
        Debug.assert(Jx.isNumber(initialExpansionIndexHint) || Jx.isNonEmptyString(initialExpansionMessageId), "Need at least on of: initialExpansionIndexHint, initialExpansionMessageId");
        initialExpansionIndexHint = Jx.isNumber(initialExpansionIndexHint) ? initialExpansionIndexHint : -1;

        var initialExpansionIndex = -1;
        if (Jx.isNonEmptyString(initialExpansionMessageId)) {
            initialExpansionIndex = this.findIndexByMessageId(initialExpansionMessageId, initialExpansionIndexHint);
        } else {
            // We have no initialExpansionMessageId, so we'll take the hint as is
            initialExpansionIndex = initialExpansionIndexHint;
        }

        // Special case - If we could not find the initial expansion, we will fall back to the first index if we can
        if (!this._isValidIndex(initialExpansionIndex) && this._conversationCollection.count > 0) {
            initialExpansionIndex = 0;
        }
        Debug.assert(this._isValidIndex(initialExpansionIndex));

        if (initialExpansionIndex !== -1) {
            Debug.Mail.log("ThreadedListCollection_ctor - expanding thread", Mail.LogEvent.start);
            this._expandHelper(initialExpansionIndex);
            Debug.Mail.log("ThreadedListCollection_ctor - expanding thread", Mail.LogEvent.stop);
        }
    };

    Debug.ThreadedListCollection = {};
    Debug.ThreadedListCollection.verifyExpansionState = function (collection) {
        /// <summary>
        /// Ensure we always have the correct state for an expanded thread.
        /// Helps catch issues where the thread messages become detached from their header.
        /// </summary>
        /// <param name="collection" type="Mail.ThreadedListCollection" />
        if (!collection._activeConversation) {
            return;
        }

        var activeConversationIndex = collection.activeConversationIndex,
            metaData = " :: expandedIndex:" + String(activeConversationIndex);

        // Verify the thread header is correct
        var threadHeader = collection.activeConversation;
        Debug.assert(Boolean(threadHeader), "Expected object at expanded index" + metaData);
        Debug.assert(Jx.isInstanceOf(threadHeader, Mail.ConversationNode), "Expected MailConversation object at expanded index" + metaData);

        var headerId = threadHeader.objectId;
        Debug.assert(Jx.isNonEmptyString(headerId), "Empty objectId for expanded conversation" + metaData);
        metaData += ", headerId:" + headerId;

        var numChild = threadHeader.visibleChildrenCount;

        // Verify all child messages are in the correct location
        if (collection._activeConversation.expanded) {
            for (var i = activeConversationIndex + 1; i < activeConversationIndex + numChild + 1; i++) {
                Debug.assert(collection._isValidIndex(i), "Index is invalid, but expected child message at index:" + String(i) + metaData);
                var messageNode = collection.item(i);

                Debug.assert(Jx.isInstanceOf(messageNode, Mail.MessageListTreeNode), "Expected MailMessage object at index:" + String(i) + metaData);
                Debug.assert((messageNode.type === "message"), "Expected child message index and got a thread index at index:" + String(i) + metaData);

                var messageParentId = messageNode.parentId;
                metaData += ", messageParentId:" + String(messageParentId);
                Debug.assert(messageParentId === headerId, "Message at index:" + String(i) + " should be a child of parent conversation" + metaData);
            }
        }

        // Verify the next item after the last expanded message is a thread (or does not exist)
        var indexOfNextThread = activeConversationIndex + numChild + 1;
        if (!collection._isValidIndex(indexOfNextThread)) {
            return;
        }

        Debug.assert(collection._isThreadIndex(indexOfNextThread),
            "Expected thread index after last expanded message at index:" + String(indexOfNextThread) + metaData);
        var nextConversationNode = collection.item(indexOfNextThread);
        Debug.assert(Jx.isInstanceOf(nextConversationNode, Mail.ConversationNode), "Expected MailConversation object at next thread index:" + String(indexOfNextThread) + metaData);
    };

    function _mark(s) { Jx.mark("ThreadedListCollection." + s); }
    function _markStart(s) { Jx.mark("ThreadedListCollection." + s + ",StartTA,ThreadedListCollection"); }
    function _markStop(s) { Jx.mark("ThreadedListCollection." + s + ",StopTA,ThreadedListCollection"); }
});
