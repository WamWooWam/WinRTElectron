
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, ["MessageListDataProvider", "ViewDataProvider", "SearchDataProvider"], function () {
    "use strict";

    // Base class
    Mail.MessageListDataProvider = function () {};
    Mail.MessageListDataProvider.prototype.dispose = Jx.fnEmpty;

    Object.defineProperty(Mail.MessageListDataProvider.prototype, "collection", { get: function () {
        Debug.assert(Jx.isObject(this._collection));
        return this._collection;
    }, enumerable: true});

    Object.defineProperty(Mail.MessageListDataProvider.prototype, "query", { get: function () {
        Debug.assert(Jx.isObject(this._query));
        return this._query;
    }, enumerable: true});

    Object.defineProperty(Mail.MessageListDataProvider.prototype, "selectionMode", { get: function () {  return "multi"; }, enumerable: true });

    var ViewProvider = Mail.ViewDataProvider = function (view, options, filter) {
        /// <param name="view" type="Mail.UIDataModel.MailView"></param>
        /// <param name="options">Contains syncMonitor, threaded and isViewReady</param>
        /// <param name="filter" type="Mail.MessageListFilter"></param>
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isObject(options));
        Debug.assert(Jx.isInstanceOf(filter, Mail.MessageListFilter));

        var syncMonitor = this._syncMonitor = options.syncMonitor,
            unlock = options.isViewReady && (syncMonitor.getSyncStatus() === Mail.ViewSyncMonitor.SyncStatus.completed),
            query = this._query = new Mail.QueryCollection(filter.apply, filter, [view, options.threaded], true /*async*/);

        // Delay the folder query to the moment when the folder is sycned such that the collection will appear to be empty
        // before the folder has finished syncing. This would prevent us from showing a message is the readingPane while
        // the spinner is up if an user moves messages to an unsynced folder
        this._whenSyncComplete = WinJS.Promise.then(waitForSyncComplete(syncMonitor), function () {
            query.unlock();
            query.execQuery();
        });

        var messages = options.threaded ? new Mail.ThreadedListCollection(Mail.Globals.platform, query, view, !unlock, options) :
                                          Mail.MessageListCollection.createForMessages(query, view, !unlock, null),
            trailingItem = new Mail.FolderEndOfListItem(syncMonitor);

        this._collection = new Mail.TrailingItemCollection(messages, trailingItem);
    };
    Jx.inherit(ViewProvider, Mail.MessageListDataProvider);

    ViewProvider.prototype.dispose = function () {
        if (this._whenSyncComplete) {
            this._whenSyncComplete.cancel();
            this._whenSyncComplete = null;
        }
    };

    var SearchProvider = Mail.SearchDataProvider = function (collection, scopeSwitcher, listView, statusElement) {
        Debug.assert(Jx.isInstanceOf(collection, Mail.SearchCollection));
        Debug.assert(Jx.isInstanceOf(scopeSwitcher, Mail.SearchScopeSwitcher));
        Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));
        Debug.assert(Jx.isHTMLElement(statusElement));

        var trailingItem = new Mail.SearchEndOfListItem(collection, scopeSwitcher, listView);
        this._collection = new Mail.TrailingItemCollection(collection, trailingItem);

        // Disable multi-select if not all messages are editable (i.e. move, junk, delete, flag)
        this._selectionMode = collection.searchResultsEditable ? "multi" : "single";

        this._accessibilityHelper = new Mail.SearchAccessibility(collection, statusElement);
    };
    Jx.inherit(SearchProvider, Mail.MessageListDataProvider);

    Mail.SearchDataProvider.prototype.dispose = function () {
        this._accessibilityHelper.dispose();
    };

    Object.defineProperty(SearchProvider.prototype, "selectionMode", { get: function () {
        return this._selectionMode;
    }, enumerable: true });

    function waitForSyncComplete(syncMonitor) {
        if (!syncMonitor.isSyncCompleted) {
            return Mail.Promises.waitForEvent(syncMonitor, "syncStatusChanged", function () {
                return syncMonitor.isSyncCompleted;
            });
        }
    }
});
