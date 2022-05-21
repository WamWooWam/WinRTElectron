
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Debug,NoShip,Microsoft*/

Jx.delayDefine(Mail, "SearchCollection", function () {
    "use strict";

    var Platform = Microsoft.WindowsLive.Platform,
        CollectionChangeType = Platform.CollectionChangeType;

    Mail.SearchCollection = function (scope, account, query, locale) {
        /// <summary>This wraps a platform search collection for consumption by the list view. It exposes the same methods/events
        /// as MessageListCollection, abstracting away the differences between a platform search collection and a normal collection.
        /// That being, a search collection is executed asynchronously and needs to be populated by manually calling fetchMoreItems.
        /// The initial phase of a search is to figure out how many items are in the collection. The searchComplete event from the
        /// platform signals when this has finished, at which point the totalCount property is valid. However, the normal count property
        /// will be zero since no items are realized. At this point we can begin calling fetchMoreItems so that items are populated in
        /// the collection. Each fetchMoreItems call results in the batchBegin, multiple itemAdded, and batchEnd events to signal when
        /// items are available. This flow continues until totalCount === count.</summary>
        Debug.assert(Jx.isObject(scope));
        Debug.assert(Jx.isInstanceOf(account, Mail.Account));
        Debug.assert(Jx.isNonEmptyString(query));
        Debug.assert(Jx.isNonEmptyString(locale));

        Mail.writeProfilerMark("SearchCollection.Ctor", Mail.LogEvent.start);
        this._collection = scope.search(query, locale, pageSize);
        this._account = account;
        this._isServerSearchEnabled = scope.canServerSearch;
        this._searchResultsEditable = (account.accountType === Platform.AccountType.imap);

        // Assume server-side search is completed if it is not enabled
        this._isServerSearchCompleted = !this._isServerSearchEnabled;
        var Fetcher = this._isServerSearchEnabled ?  Mail.ServerSearchResultsFetcher : Mail.SearchResultsFetcher;
        this._fetcher =  new Fetcher(this._collection, Jx.scheduler);
        this._collectionChanged = this._collectionChanged.bind(this);
        this._collection.addEventListener("collectionchanged", this._collectionChanged);
        this._treeView = new Mail.EmptyMessageListTreeView();
        Mail.writeProfilerMark("SearchCollection.Ctor", Mail.LogEvent.stop);

    };
    Jx.inherit(Mail.SearchCollection, Jx.Events);
    Debug.Events.define(Mail.SearchCollection.prototype, "beginChanges", "itemAdded", "itemRemoved", "itemMoved", "reset", "endChanges", "localSearchComplete", "searchComplete", "searchError");


    ///
    /// Constants
    ///
    var pageSize = Mail.SearchCollection.pageSize = 50;

    ///
    /// Collection like wrapper functions
    ///
    Object.defineProperty(Mail.SearchCollection.prototype, "isEmpty", {
        get: function () {
            return this.count === 0 && this.isServerSearchCompleted;
        }
    });
    Object.defineProperty(Mail.SearchCollection.prototype, "count", {
        get: function () { return this._collection.count; }
    });
    Object.defineProperty(Mail.SearchCollection.prototype, "totalCount", {
        get: function () { return this._collection.totalCount; }
    });

    Mail.SearchCollection.prototype.findIndexByMessageId = function (id, indexHint) {
        return Mail.CollectionHelper.indexOf(this, id, indexHint);
    };

    Mail.SearchCollection.prototype.getTreeView = function () {
        // returns a no-op implementation of the tree view
        return this._treeView;
    };

    Mail.SearchCollection.prototype.lock = Jx.fnEmpty;
    Mail.SearchCollection.prototype.unlock = Jx.fnEmpty;

    Mail.SearchCollection.prototype.item = function (index) {
        Debug.assert(index >= 0 && index < this.count);
        var platformMessage = this._collection.item(index),
            message = new Mail.UIDataModel.MailMessage(platformMessage, this._account);
        return new Mail.MessageListTreeNode(message, "message", null /*parentNode*/ );
    };

    Mail.SearchCollection.prototype.dispose = function () {
        this._collection.removeEventListener("collectionchanged", this._collectionChanged);
        this._collection.dispose();
        this._collection = null;
        this._fetcher.dispose();
        this._fetcher = null;
    };

    Mail.SearchCollection.prototype.execute = function () {
        ///<summary>Starts executing the search query asynchronously. Listeners should hook the searchComplete event
        ///before calling this method. That event won't fire until the collection is unlocked.</summary>
        this._collection.unlock();
    };


    Mail.SearchCollection.prototype._collectionChanged = function (change) {
        ///<summary>Starts queueing inserts during the batchBegin and fires them all during the batchEnd</summary>
        ///<param name="change" type="Platform.CollectionChangedEventArgs"/>
        NoShip.MailSearch.logPlatformCollectionChanged(change);

        switch (change.eType) {
        case CollectionChangeType.localSearchComplete:
            this.raiseEvent("localSearchComplete", { target: this, totalCount: this.totalCount });
            this._fetcher.localSearchComplete();
            break;
        case CollectionChangeType.batchBegin:
            this.raiseEvent("beginChanges", { target: this });
            break;
        case CollectionChangeType.itemAdded:
            this._onItemAdded(change);
            break;
        case CollectionChangeType.itemRemoved:
            // The platform search collection does not wrap delete notifications in batches.
            // Delete notifications for search results are implemented by hooking the MailChangeHandler upon deletion of any messages.
            // For each message removed, the platform queue an async query to figure out whether the search collection
            // is affected.  As a result, it is not possible to for the platform to batch the item removed events correctly.
            // Since the listeners expect notifications to come in batches (e.g. for showing/hiding the empty text), we manually fire
            // beginChanges/endChanges here
            this.raiseEvent("beginChanges", { target: this });
            this.raiseEvent("itemRemoved", {
                target: this,
                index: change.index,
                objectId: change.objectId,
                eType: change.eType
            });
            this.raiseEvent("endChanges", { target: this });            
            break;
        case CollectionChangeType.batchEnd:
            this._fetcher.endChanges();
            this.raiseEvent("endChanges", { target: this });
            if (!this._isServerSearchEnabled && (this.totalCount === this.count)) {
                this.raiseEvent("searchComplete");
            }
            break;
        case CollectionChangeType.serverSearchComplete:
            if (change.index === Platform.SearchStatusCode.success) {
                this._isServerSearchCompleted = true;
                this._fetcher.serverSearchComplete();
                this.raiseEvent("searchComplete");
            } else {
                this._fetcher.serverSearchError();
                this.raiseEvent("searchError", change.index);
            }
            break;
        default:
            // Delete, Move and Reset not supported on search collections
            Debug.assert(false, "Unexpected change type: " + change.eType);
            break;
        }
    };

    Mail.SearchCollection.prototype._onItemAdded = function (change) {
        Debug.assert(Jx.isNumber(change.index));
        // BEGIN_TODO: Remove this when BLUE:286315 is fixed
        var data = this.item(change.index),
            objectId = data.objectId;
        // END_TODO

        NoShip.MailSearch.logFireChanges.call(this, change);
        this.raiseEvent("itemAdded", {
            target: this,
            index: change.index,
            objectId: objectId,
            eType: change.eType
        });
    };

    Mail.SearchCollection.prototype.fetchMoreItems = function () {
        this._fetcher.fetchMoreItems();
    };

    Object.defineProperty(Mail.SearchCollection.prototype, "isServerSearchCompleted", { get: function () {
        return this._isServerSearchCompleted;
    }, enumerable: true
    });

    Object.defineProperty(Mail.SearchCollection.prototype, "isServerSearchEnabled", { get: function () {
        return this._isServerSearchEnabled;
    }, enumerable: true
    });

    Object.defineProperty(Mail.SearchCollection.prototype, "searchResultsEditable", { get: function () {
        return !this._isServerSearchEnabled || this._searchResultsEditable;
    }, enumerable: true
    });
});


Jx.delayDefine(NoShip, "MailSearch", function () {
    NoShip.MailSearch = {};

    var Platform = Microsoft.WindowsLive.Platform,
        CollectionChangeType = Platform.CollectionChangeType,
        LogLevels = NoShip.MailSearch.logLevels = {
        off: 0,
        platform: 1,
        ui: 2
    };

    function isLoggingEnabledForLevel(logLevel) {
        /// <param name="logLevel" type="Number"></param>
        Debug.assert(Jx.isNumber(logLevel));
        return logLevel <= NoShip.MailSearch.logLevel;
    }
    Object.defineProperty(NoShip.MailSearch, "logLevel", {
        get: function () {
            var result = JSON.parse(Mail.Globals.appSettings.getLocalSettings().container("search").get("logLevel"));
            return Jx.isNullOrUndefined(result) ? LogLevels.platform : result;
        },
        set: function (logLevel) {
            /// <param name="logLevel" type="Number"></param>
            Debug.assert(Jx.isNumber(logLevel));
            Mail.Globals.appSettings.getLocalSettings().container("search").set("logLevel", logLevel);
        },
        enumerable: true
    });

    function getEnumNameByValue(value, enumType) {
        /// <param name="eventType" type="CollectionChangeType"></param>
        var result = null;
        for (var enumKey in enumType) {
            if (enumType[enumKey] === value) {
                result = enumKey;
                break;
            }
        }
        Debug.assert(Jx.isNonEmptyString(result));
        return result;
    }

    NoShip.MailSearch.logPlatformCollectionChanged = function (evt) {
        /// <param name="evt" type="Platform.CollectionChangedEventArgs"></param>
        if (!isLoggingEnabledForLevel(LogLevels.platform)) {
            return;
        }
        var collection = evt.target;
        switch (evt.eType) {
        case CollectionChangeType.localSearchComplete:
            Jx.log.error("NoShip.MailSearch.collectionChanged - localSearchComplete  - count: " +
                String(collection.count) + " totalCount: " + String(collection.totalCount));
            break;
        case CollectionChangeType.serverSearchComplete:
            Jx.log.error("NoShip.MailSearch.collectionChanged - serverSearchComplete - status: " + String(evt.index));
            break;
        case CollectionChangeType.itemAdded:
            Jx.log.error("NoShip.MailSearch.collectionChanged - itemAdded            - count: " +
                String(collection.count) + " totalCount: " + String(collection.totalCount) +
                " index: " + String(evt.index));
            break;
        case CollectionChangeType.itemRemoved:
            Jx.log.error("NoShip.MailSearch.collectionChanged - itemRemoved          - count: " +
                String(collection.count) + " totalCount: " + String(collection.totalCount) +
                " index: " + String(evt.index));
            break;
        case CollectionChangeType.batchBegin:
            Jx.log.error("NoShip.MailSearch.collectionChanged - batchBegin           - count: " +
                String(collection.count) + " totalCount: " + String(collection.totalCount));
            break;
        case CollectionChangeType.batchEnd:
            Jx.log.error("NoShip.MailSearch.collectionChanged - batchEnd             - count: " +
                String(collection.count) + " totalCount: " + String(collection.totalCount));
            break;
        }
    };

    NoShip.MailSearch.logFireChanges = function (change) {
        /// <param name="change" type="Platform.CollectionChangedEventArgs"></param>
        if (!isLoggingEnabledForLevel(LogLevels.ui)) {
            return;
        }
        var collection = change.target;
        Jx.log.info("NoShip.MailSearch - firingChanges" + getEnumNameByValue(change.eType, CollectionChangeType) +
            " index: " + String(change.index) +
            " _collection.count: " + String(collection.count));
    };


    NoShip.MailSearch.logFetchMoreItems = function (size) {
        /// <param name="pageSize" type="Number"></param>
        Debug.assert(Jx.isNumber(size));
        if (!isLoggingEnabledForLevel(LogLevels.platform)) {
            return;
        }
        Jx.log.warning("NoShip.MailSearch - platformCollection.fetchMoreItems - pageSize: " + String(size));
    };

    NoShip.MailSearch.logFetcherStatus = function (/*@type(Number)*/ fetchStatus) {
        if (!isLoggingEnabledForLevel(LogLevels.platform)) {
            return;
        }
        Jx.log.error("NoShip.MailSearch - SearchResultFetched status : " + getEnumNameByValue(fetchStatus, Mail.SearchResultsFetcherStatus));
    };
});


