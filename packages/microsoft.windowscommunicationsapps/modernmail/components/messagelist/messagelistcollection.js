
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,Microsoft*/

/*jshint browser:true*/
/*global Jx, Mail, Debug, Mail, Jx*/

Jx.delayDefine(Mail, "MessageListCollection", function () {
    "use strict";
    var P = Microsoft.WindowsLive.Platform,
        ChangeType = P.CollectionChangeType;

    Mail.MessageListCollection = /*@constructor*/function (platformCollection, locked, factory, /*@optional,@dynamic*/ context, /*@optional*/collectionName) {
        ///<summary>This class wraps a deferred collection and raises events that are meaningful to components of the message list. Internally
        ///the class uses a deferred collection to support batching of changes from the platform. However, instead of a single listener model,
        ///it raises one notification per change and these are bookended by a begin and end. While changes are being fired it still provides a
        ///consistent view of the collection since internally it maintains the list of changes that deferred collection created. That means
        ///unless the item is pending delete, calling item() or count from an event listener works as expected. If the item is pending delete
        ///the collection returns null in that case (same behavior as deferred collection).</summary>
        ///<param name="platformCollection" type="Mail.Collection"/>
        ///<param name="locked" type="Boolean">Whether the collection is locked
        ///For performance issue, we can only fire notifications to the listView if it is ready
        ///</param>
        ///<param name="factory" type="Function">Wrapper for the items returned from this collection. Receives arguments: (item).</param>
        ///<param name="context" optional="true" dyanmic="true">The context of the factory function</param>
        Debug.assert(Jx.isObject(platformCollection));
        Debug.assert(Jx.isBoolean(locked));
        Debug.assert(Jx.isFunction(factory));
        this._deferredCollection = new Mail.MappedDeferredCollection(platformCollection, this, factory, context, collectionName);
        this._deferredCollection.addEventListener("collectionchanged", this._onCollectionChanged, this);
        this._locked = locked;
        this._acceptPendingChangesJob = null;
        this._treeView = new Mail.EmptyMessageListTreeView();
    };
    Jx.inherit(Mail.MessageListCollection, Jx.Events);

    var proto = Mail.MessageListCollection.prototype;

    Debug.Events.define(proto, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges");

    proto._start = function (evt) {
        Jx.mark("MessageListCollection." + evt + ":" + this._deferredCollection.name + ",StartTA,Mail");
    };

    proto._stop = function (evt) {
        Jx.mark("MessageListCollection." + evt + ":" + this._deferredCollection.name + ",StopTA,Mail");
    };

    proto._info = function (evt) {
        Jx.mark("MessageListCollection." + evt + ":" + this._deferredCollection.name);
    };

    Mail.MessageListCollection.createForMessages = function (query, view, locked, parentNode) {
        ///<summary>Returns a new MessageListCollection designed to wrap Mail Messages.</summary>
        ///<param name="query" type="Mail.Collection"/>
        ///<param name="locked" type="Boolean"/>
        ///For performance issue, we can only fire notifications to the listView if it is ready
        ///</param>
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        var collectionName = Boolean(parentNode) ? "conversation_children:=" + parentNode.objectId : "UnthreadedMessages",
            account = view.account;
        return new Mail.MessageListCollection(query, locked, function (item) {
            /// <param name="item" type="P.IMailMessage"></param>
            var listViewItem = null;

            if (Jx.isInstanceOf(item, P.MailMessage)) {
                listViewItem = new Mail.UIDataModel.MailMessage(item, account);
            } else {
                listViewItem = item;
            }
            return new Mail.MessageListTreeNode(listViewItem, "message", parentNode);
        }, null /*context*/, collectionName);
    };

    Mail.MessageListCollection.createForConversations = function (query, view, locked) {
        ///<summary>Returns a new MessageListCollection designed to wrap Mail Conversations.</summary>
        ///<param name="query" type="Mail.Collection"/>
        ///<param name="locked" type="Boolean"/>
        ///For performance issue, we can only fire notifications to the listView if it is ready
        ///</param>
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        return new Mail.MessageListCollection(query, locked, function (item) {
            var listViewItem = null;
            if (Jx.isInstanceOf(item, P.MailConversation)) {
                listViewItem = new Mail.UIDataModel.MailConversation(item);
            } else {
                // The item can be a placeholder if it has already been deleted from the platform
                listViewItem = item;
            }
            return new Mail.ConversationNode(listViewItem, view);
        }, null /*context*/, "conversation");
    };

    // Make this wrapper collection look like a platform collection
    Object.defineProperty(proto, "count", {
        get: function () {
            return this._deferredCollection.count;
        }
    });
    // Need to have the same properties as SearchCollection
    Object.defineProperty(proto, "isEmpty", { get: function () { return this.count === 0; } });

    proto.item = function (index) {
        ///<summary>Gets the item from the deferred collection if it still exists</summary>
        /// <param name="index" type="Number"></param>
        Debug.assert(Jx.isValidNumber(index) && index >= 0 && index < this.count, "index :=" + index + " count:=" + this.count);
        var item = this._deferredCollection.item(index);

        // The deferredCollection is on top of a mappedCollection which can always return a place holder
        // the item should never be null
        Debug.assert(Jx.isObject(item));
        return item;
    };

    proto.findIndexByMessageId = function (messageId, indexHint) {
        return Mail.CollectionHelper.indexOf(this._deferredCollection, messageId, indexHint);
    };

    proto.dispose = function () {
        this._start("dispose");
        this._clearAcceptPendingChangesJob();
        this._deferredCollection.removeEventListener("collectionchanged", this._onCollectionChanged, this);
        this._deferredCollection.dispose();
        this._treeView = null;
        this._stop("dispose");
    };

    Mail.MessageListCollection.prototype._clearAcceptPendingChangesJob = function () {
        this._start("_clearAcceptPendingChangesJob");
        Jx.dispose(this._acceptPendingChangesJob);
        this._acceptPendingChangesJob = null;
        this._stop("_clearAcceptPendingChangesJob");
    };

    proto.lock = function () {
        this._info("lock");
        this._locked = true;
    };

    proto.unlock = function () {
        this._info("unlock");
        this._locked = false;
        this._acceptPendingChanges();
    };

    proto.onChangesPending = function () {
        ///<summary>Accept any pending platform changes asynchronously. However, if we're still processing and there are additional
        ///changes (e.g. re-entered) just add them to the end of the list.</summary>
        if (!this._locked && this._deferredCollection.hasPendingChanges) {
            // If the UI is ready, we accept the changes in a separate callstack to avoid reentrancy.
            // Async callback is smart enough to clear the pending callbacks
            this._start("onChangesPending");
            this._clearAcceptPendingChangesJob();
            this._acceptPendingChangesJob = Jx.scheduler.addJob(null,
                Mail.Priority.messageListAcceptPendingChanges,
                "message list collection - accept pending changes",
                this._acceptPendingChanges,
                this
            );
            this._stop("onChangesPending");
        }
    };

    proto.getTreeView = function () {
        // returns a no-op implementation of the tree view
        return this._treeView;
    };

    proto._acceptPendingChanges = function () {
        ///<summary>Tells deferred collection to apply any changes and fires a notification per change. While events are being fired
        ///it's still safe to call back into this collection and get the count or item()s.</summary>
        /// <returns>True if changes were made to the listview as a result of this call</returns>

        // We are servicing the timer request now, canceling all pending requests
        this._clearAcceptPendingChangesJob();

        /// The list view state may not be ready because other events changed its state.
        /// The changes will be picked up again in the loading state change handler.
        if (!this._locked && this._deferredCollection.hasPendingChanges) {
            this._start("_acceptPendingChanges");
            this.raiseEvent("beginChanges", { target: this });
            this._deferredCollection.acceptPendingChanges();
            this.raiseEvent("endChanges", { target: this });
            this._stop("_acceptPendingChanges");
        }
    };

    proto._onCollectionChanged = function (change) {
        /// <param name="change" type="P.CollectionChangedEventArgs"></param>
        Debug.assert(change);

        change.target = this;
        switch (change.eType) {
            case ChangeType.itemAdded:
                this.raiseEvent("itemAdded", change);
                break;
            case ChangeType.itemRemoved:
                this.raiseEvent("itemRemoved", change);
                break;
            case ChangeType.itemChanged:
                this.raiseEvent("itemMoved", change);
                break;
            case ChangeType.reset:
                // Ignore reset as they are raised through the onResetPending callback
                break;
            default:
                Debug.assert(false, "Unexpected eventType " + change.eType);
                break;
        }
    };

    proto.onResetPending = function () {
        /// <summary>This function is called by the deferredCollection if there is a reset event
        /// The job of the deferredCollection is to maintain a frozen state of the platform collection, thereby allowing
        /// the UI to take changes only when it is ready.
        /// However, if there is a reset event, the deferredCollection can longer maintain the ID's of the items in the collection
        /// and we need to process the change immediately.
        /// The reset event should only be fired when we come back from resume, this should be re-entrant safe
        /// </summary>
        this._start("_onReset");
        // We are servicing the timer request now, canceling all pending requests
        this._clearAcceptPendingChangesJob();
        this._deferredCollection.acceptPendingChanges();
        this.raiseEvent("reset", { target: this });
        this._stop("_onReset");
    };

    Object.defineProperty(proto, "hasPendingChanges", { get: function () {
        return this._deferredCollection.hasPendingChanges;
    }, enumerable: true
    });
});

