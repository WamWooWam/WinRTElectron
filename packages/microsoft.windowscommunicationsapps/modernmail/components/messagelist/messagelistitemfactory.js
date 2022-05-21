
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "MessageListItemFactory", function () {
    "use strict";
    var MLIFactory = Mail.MessageListItemFactory = {
        _listView: /*@static_cast(WinJS.UI.ListView)*/ null,
        _realizedItems: [],
        _toBeRemoved: {},
        _lastRealizedItemIndex: 0,
        _finishUpdateJob: null,
        _unRealizeJob: null,
        resetAll: function () {
            this._cancelJobs();
            // Move the realized items to the _toBeRemoved map
            this._realizedItems.forEach(function (messageListItem) {
                /// <param name="messageListItem" type="Mail.MessageListItem" />
                Debug.assert(Jx.isInstanceOf(messageListItem, Mail.MessageListItem));
                messageListItem.markForCleanup();
                MLIFactory._toBeRemoved[Jx.uid()] = messageListItem;
            });
            this._realizedItems = [];
            this._unRealizeJob = Jx.scheduler.addJob(null,
                Mail.Priority.unrealizeMessageListItem,
                "MessageListItemFactory.dispose - _toBeRemoved",
                this._unRealize,
                this
            );
        },
        resetItemById: function (id) {
            /// <param name="id" type="String" />
            Debug.assert(Jx.isNonEmptyString(id));
            var index = this._indexOfRealizedItem(id);
            if (index >= 0) {
                Debug.assert(index < this._realizedItems.length);
                var mailItem = /*@static_cast(Mail.MessageListItem)*/ this._realizedItems[index];
                this._realizedItems.splice(index, 1);
                mailItem.markForCleanup();
                this._toBeRemoved[Jx.uid()] = mailItem;
            }
        },
        getElement: function (selectionHandler, mailItemNode, selection, isThreading) {
            Debug.assert(Jx.isInstanceOf(mailItemNode, Mail.MessageListTreeNode));
            Debug.assert(Jx.isInstanceOf(mailItemNode.data, Mail.UIDataModel.MailItem));
            Debug.assert(Jx.isInstanceOf(selectionHandler, Mail.SelectionHandler));
            Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
            Debug.assert(Jx.isBoolean(isThreading));
            var mailItem = mailItemNode.data,
                objectId = mailItemNode.objectId;
            Debug.Mail.log("Rendering - " + mailItem.subject + "(id:" + objectId + ")");

            this.resetItemById(objectId);
            Debug.assert(this._indexOfRealizedItem(objectId) === -1);
            var messageListItem = new Mail.MessageListItem(mailItemNode, selectionHandler, selection, isThreading);
            this._realizedItems.push(messageListItem);
            return messageListItem.getElement();
        },
        getElementById: function (objectId) {
            var index = this._indexOfRealizedItem(objectId);
            if (index < 0) {
                return null;
            }
            return this._realizedItems[index].getElement();
        },
        _indexOfRealizedItem: function (id) {
            /// <param name="id" type="String" />
            Mail.writeProfilerMark("MessageListItemFactory_indexOfRealizedItem", Mail.LogEvent.start);
            Debug.assert(Jx.isNonEmptyString(id));
            for (var ii = 0, iiMax = this._realizedItems.length; ii < iiMax; ii++) {
                var messageListItem = /*@static_cast(Mail.MessageListItem)*/ this._realizedItems[ii];
                Debug.assert(Jx.isInstanceOf(messageListItem, Mail.MessageListItem));
                if (messageListItem.objectId === id) {
                    Mail.writeProfilerMark("MessageListItemFactory_indexOfRealizedItem", Mail.LogEvent.stop);
                    return ii;
                }
            }
            Mail.writeProfilerMark("MessageListItemFactory_indexOfRealizedItem", Mail.LogEvent.stop);
            return -1;
        },
        _unRealize: function () {
            for (var id in this._toBeRemoved) {
                Debug.Mail.log("MessageListItemFactory._unrealizeMessageListItem - removing id: " + id);
                Debug.assert(Jx.isInstanceOf(this._toBeRemoved[id], Mail.MessageListItem));
                this._toBeRemoved[id].dispose();
                delete this._toBeRemoved[id];
                return Jx.Scheduler.repeat(true);   // hasMoreWork
            }
            this._unRealizeJob = null;
            return Jx.Scheduler.repeat(false);   // hasMoreWork
        },
        _secondPassJob: function () {
            // We're going to loop through all the realized items looking for one we haven't finished yet.
            // However, we're trying to take a hint from the last iteration and start where the last left off.
            // Instead of making two loops, we're just walking through 'arrayLength' items starting at
            // 'this._lastRealizedItemIndex' and using modulus (%) to clip at valid indices.
            // The extra loop is necessary because it is possible elements were removed from the array and
            // our hint is too far advanced.
            var arrayLength = this._realizedItems.length;
            for (var ii = this._lastRealizedItemIndex, iiMax = arrayLength + this._lastRealizedItemIndex; ii < iiMax; ii++) {
                var messageListItem = /*@static_cast(Mail.MessageListItem)*/this._realizedItems[ii % arrayLength];
                Debug.assert(Jx.isInstanceOf(messageListItem, Mail.MessageListItem));
                if (messageListItem.finishUpdates()) {
                    this._lastRealizedItemIndex = ii % arrayLength;
                    return Jx.Scheduler.repeat(true);   // hasMoreWork
                }
            }
            this._finishUpdateJob = null;
            Mail.log("MessageListItemFactory_secondPassJob_finished");
            return Jx.Scheduler.repeat(false);   // hasMoreWork
        },
        _cancelJobs: function () {
            Jx.dispose(this._unRealizeJob);
            this._unRealizeJob = null;
            Jx.dispose(this._finishUpdateJob);
            this._finishUpdateJob = null;
        },
        _onListViewLoadingStateChanged: function () {
            var state = this._listView.loadingState;
            Debug.assert(Jx.isNonEmptyString(state));
            if (state === "complete") {
                this._onListViewStateComplete();
            } else {
                this._cancelJobs();
            }
        },
        _onListViewStateComplete: function () {
            Mail.log("MessageListItemFactory_onListViewStateComplete", Mail.LogEvent.start);
            this._cancelJobs();
            this._unRealizeJob = Jx.scheduler.addJob(null,
                Mail.Priority.unrealizeMessageListItem,
                "_onListViewStateComplete - _toBeRemoved",
                this._unRealize,
                this
            );
            this._lastRealizedItemIndex = 0;
            this._finishUpdateJob = Jx.scheduler.addJob(null,
                Mail.Priority.finishMessageListItem,
                "_onListViewStateComplete - _realizedItems",
                this._secondPassJob,
                this
            );
            Mail.log("MessageListItemFactory_onListViewStateComplete", Mail.LogEvent.stop);
        }
    };

    var listener = MLIFactory._onListViewLoadingStateChanged.bind(MLIFactory);
    Object.defineProperty(MLIFactory, "listView", {
        set: function (listView) {
            ///<param name="listView" type="WinJS.UI.ListView" />
            if (MLIFactory._listView !== listView) {
                if (MLIFactory._listView) {
                    MLIFactory._listView.removeEventListener("loadingstatechanged", listener, false);
                }
                MLIFactory._listView = listView;
                if (MLIFactory._listView) {
                    MLIFactory._listView.addEventListener("loadingstatechanged", listener, false);
                }
            }
        },
        get: function () {
            return MLIFactory._listView;
        },
        enumerable: true
    });

});
