
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true,strict:true*/
/*global Mail,Jx,Debug,WinJS,Microsoft*/

Jx.delayDefine(Mail, "SearchEndOfListItem", function () {
    "use strict";

    var SearchStatus = {
        progress : 0,
        error : 1,
        complete : 2,
        moreResults: 3
    };

    Mail.SearchEndOfListItem = function (searchCollection, scopeSwitcher, listView) {
        /// <summary>
        /// Represents the end of list item in the message list to communicate search progress.
        /// It has two modes: progress and error.
        /// When it is in progress mode, a spinner is shown and it is non-clickable
        /// When it is in error mode, clicking on it will retry the server side search
        /// It also listens for the scroll position of the listView to ask the collection to fetchMoreItems
        /// when it is onscreen.
        /// </summary>
        /// <param name="searchCollection" type="Mail.SearchCollection"></param>
        /// <param name="scrollHandler" type="Mail.SearchScrollHandler"></param>

        Debug.assert(Jx.isInstanceOf(searchCollection, Mail.SearchCollection));
        Debug.assert(Jx.isInstanceOf(scopeSwitcher, Mail.SearchScopeSwitcher));
        Debug.assert(Jx.isInstanceOf(listView, WinJS.UI.ListView));

        this._listView = listView;
        this._collection = searchCollection;

        this._hooks = null;
        this._isVisible = true;
        this._element = /*@static_cast(HTMLElement)*/null;
        this._scopeSwitcher = scopeSwitcher;

        this._element = document.createElement("div");
        this._element.classList.add("win-nondraggable");
        this._element.classList.add("win-nonswipeable");
        this._element.classList.add("win-nonselectable");

        this._initStatusHandlers();
        this._updateSearchStatus(SearchStatus.progress);
        this._onLoadingStateChanged = this._onLoadingStateChanged.bind(this);
    };
    Jx.inherit(Mail.SearchEndOfListItem, Mail.EndOfListItem);

    ///
    /// Public Functions
    ///
    Mail.SearchEndOfListItem.prototype.getElement = function () {
        Mail.writeProfilerMark("SearchEndOfListItem.getElement", Mail.LogEvent.start);
        // Now since the element is on screen, we can start listening for events
        this._listenForUpdates();
        Mail.writeProfilerMark("SearchEndOfListItem.getElement", Mail.LogEvent.stop);
        return this._element;
    };

    Mail.SearchEndOfListItem.prototype.fetchMoreItems = function () {
        this._collection.fetchMoreItems();
        this._updateSearchStatus(SearchStatus.progress);
    };

    Mail.SearchEndOfListItem.prototype.onInvoke = function () {
        this._current.onInvoke();
    };

    Mail.SearchEndOfListItem.prototype.dispose = function () {
        Jx.dispose(this._hooks);
        this._hooks = null;
        this._element = null;
        this._collection = null;
    };

    ///
    /// Private functions
    ///
    Mail.SearchEndOfListItem.prototype._initStatusHandlers = function () {
        this._initStatusHandlers = Jx.fnEmpty;
        this._handlers = {};
        this._handlers[SearchStatus.progress] = new Mail.SearchProgressHandler();
        this._handlers[SearchStatus.error] = new Mail.SearchErrorHandler(this);
        this._handlers[SearchStatus.complete] = new Mail.SearchCompleteHandler(this._scopeSwitcher);
        this._handlers[SearchStatus.moreResults] = new Mail.SearchMoreResultsHandler();
    };

    Mail.SearchEndOfListItem.prototype._getStatusHandler = function () {
        Debug.assert(Jx.isNumber(this._searchStatus));
        Debug.assert(Jx.isObject(this._handlers[this._searchStatus]));
        return this._handlers[this._searchStatus];
    };

    Mail.SearchEndOfListItem.prototype._updateSearchStatus = function (searchStatus) {
        if (this._searchStatus === searchStatus) {
            return;
        }
        this._searchStatus = searchStatus;
        this._current = this._getStatusHandler();

        this._adjustVisibility();
        if (this._isVisible) {
            // Update the UI to reflect the current search status
            // only do this after showing or hiding the item to prevent flashing
            this._element.innerHTML = this._current.getUI();
        }
        this._fireEtwEvents();
    };

    Mail.SearchEndOfListItem.prototype._adjustVisibility = function () {
        // Show the item if needed
        var showItem = this._current.calculateVisibility();
        if (showItem !== this._isVisible) {
            this._isVisible = showItem;
            Mail.writeProfilerMark("The visibility of the end of list item is changed to _isVisible" + String(showItem));
            this.raiseEvent("visibilityChanged", this._isVisible);
        }
    };

    var statusToEtwEvent = {};
    statusToEtwEvent[SearchStatus.progress] = "SearchEndOfListItem_showSearchProgress";
    statusToEtwEvent[SearchStatus.error] = "SearchEndOfListItem_showSearchError";
    statusToEtwEvent[SearchStatus.moreResults] = "SearchEndOfListItem_showMoreResults";
    statusToEtwEvent[SearchStatus.complete] = "SearchEndOfListItem_showSearchComplete";
    Mail.SearchEndOfListItem.prototype._fireEtwEvents = function () {
        // Fire ETW Events so that our test code can listen to them in automation
        var eventName = statusToEtwEvent[this._searchStatus];
        Debug.assert(Jx.isNonEmptyString(eventName));
        Mail.writeProfilerMark(eventName);
    };

    Mail.SearchEndOfListItem.prototype._onServerSearchError = function (platformStatus) {
        /// <param name="platformStatus" type="Number"></param>
        Debug.assert(Jx.isNumber(platformStatus));
        var PlatformSearchStatus = Microsoft.WindowsLive.Platform.SearchStatusCode,
            newStatus = (PlatformSearchStatus.endOfRetrievableRange === platformStatus) ? SearchStatus.moreResults : SearchStatus.error;
        this._updateSearchStatus(newStatus);
    };

    Mail.SearchEndOfListItem.prototype._listenForUpdates = function () {
        Jx.dispose(this._hooks);
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._collection, "searchComplete", function () { this._updateSearchStatus(SearchStatus.complete); }, this),
            new Mail.EventHook(this._collection, "searchError", this._onServerSearchError, this),
            new Mail.EventHook(this._listView, "loadingstatechanged", this._onLoadingStateChanged, this)
        );
    };

    Mail.SearchEndOfListItem.prototype._onLoadingStateChanged = function () {
        /// This event fires whenever the scroll position of the listView starts changing, even no items are realized in view
        var isLastItemVisible = this._listView.indexOfLastVisible >= (this._collection.count - 1),
            isSearching = (this._searchStatus === SearchStatus.progress);
        if (this._listView.loadingState === "complete" && isLastItemVisible && isSearching) {
            this._collection.fetchMoreItems();
        }
    };

    Object.defineProperty(Mail.SearchEndOfListItem.prototype, "visible", {
        get: function () {
            return this._isVisible;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SearchEndOfListItem.prototype, "objectId", {
        get: function () {
            return "Mail.SearchEndOfListItem.objectId";
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SearchEndOfListItem.prototype, "selectable", {
        get: function () {
            return false;
        },
        enumerable: true
    });

    ///
    /// SearchStatusHandler - base handler for search status changes
    ///
    Mail.SearchStatusHandler = function () {};
    Mail.SearchStatusHandler.prototype.getUI = function () { Debug.assert(false, "Not implemented"); return ""; };
    Mail.SearchStatusHandler.prototype.onInvoke = function () { };
    Mail.SearchStatusHandler.prototype.calculateVisibility = function () { return true; };

    ///
    /// SearchCompleteHandler
    ///
    Mail.SearchCompleteHandler = function (scopeSwitcher) {
        Debug.assert(Jx.isInstanceOf(scopeSwitcher, Mail.SearchScopeSwitcher));
        this._scopeSwitcher = scopeSwitcher;
        Mail.SearchStatusHandler.call(this);
    };
    Jx.inherit(Mail.SearchCompleteHandler, Mail.SearchStatusHandler);

    Mail.SearchCompleteHandler.prototype._getFirstRow = function () {
        if (this._scopeSwitcher.canServerSearch) {
            return "";
        }
        var label = getResString("mailMessageListSearchShowRecentResults");
        Debug.assert(Jx.isNonEmptyString(label));
        return "<div class='mailSearchEndOfListErrorLabel typeSizeNormal'>" + label + "</div>";
    };

    Mail.SearchCompleteHandler.prototype._getSecondRow = function () {
        if (!this._scopeSwitcher.canUpsell()) {
            return "";
        }
        var upsell = this._scopeSwitcher.upsell;
        Debug.assert(Jx.isObject(upsell));
        return "<div class='mailSearchEndOfListErrorTryAgain typeSizeNormal'>" + upsell.description + "</div>";
    };

    Mail.SearchCompleteHandler.prototype.getUI = function () {
        var canUpsell = this._scopeSwitcher.canUpsell();
        return getEndOfListTemplate(this._getFirstRow() + this._getSecondRow(), !canUpsell);
    };

    Mail.SearchCompleteHandler.prototype.calculateVisibility = function () {
        return !this._scopeSwitcher.canServerSearch || this._scopeSwitcher.canUpsell();
    };

    Mail.SearchCompleteHandler.prototype.onInvoke = function () {
        this._scopeSwitcher.rescopeToUpsell();
    };

    ///
    /// SearchProgressHandler
    ///
    Mail.SearchProgressHandler = function () {
        Mail.SearchStatusHandler.call(this);
    };
    Jx.inherit(Mail.SearchProgressHandler, Mail.SearchStatusHandler);

    Mail.SearchProgressHandler.prototype.getUI = function () {
        var progressLabel = getResString("mailSearchProgress");
        return "<div class='mailMessageListEntryContainer win-interactive' aria-hidden='false'>" +
                   "<progress class='mailSearchEndOfListProgressElement'></progress>" +
                   "<div class='mailSearchEndOfListProgressLabel typeSizeNormal'>" + progressLabel + "</div>" +
               "</div>";
    };

    ///
    /// SearchErrorHandler
    ///
    Mail.SearchErrorHandler = function (controller) {
        Debug.assert(Jx.isInstanceOf(controller, Mail.SearchEndOfListItem));
        this._controller = controller;
        Mail.SearchStatusHandler.call(this);
    };
    Jx.inherit(Mail.SearchErrorHandler, Mail.SearchStatusHandler);

    Mail.SearchErrorHandler.prototype.getUI = function () {
        var errorLabel = getResString("mailSearchError"),
            retryLabel = getResString("mailSearchEndOfListItemRetryLabel");
        return getEndOfListTemplate(
            "<div class='mailSearchEndOfListErrorLabel typeSizeNormal'>" + errorLabel + "</div>" +
            "<div class='mailSearchEndOfListErrorTryAgain typeSizeNormal'>" + retryLabel + "</div>");
    };

    Mail.SearchErrorHandler.prototype.onInvoke = function () {
        this._controller.fetchMoreItems();
    };

    ///
    /// SearchMoreResultsHandler
    ///
    Mail.SearchMoreResultsHandler = function () {
        Mail.SearchStatusHandler.call(this);
    };
    Jx.inherit(Mail.SearchMoreResultsHandler, Mail.SearchStatusHandler);

    Mail.SearchMoreResultsHandler.prototype.getUI = function () {
        var label = getResString("mailSearchEndofListItemMoreResultsLabel");
        Debug.assert(Jx.isNonEmptyString(label));
        return getEndOfListTemplate(label, true /*interactive*/);
    };
        
    function getEndOfListTemplate(content, /*@optional*/interactive) {
        Debug.assert(Jx.isNonEmptyString(content));
        var interactiveClass = (interactive) ? "win-interactive" : "";
        return "<div class='mailMessageListEntryContainer typeSizeNormal " + interactiveClass + "' aria-hidden='false'>" +
            "<div class='mailSearchEndOfListContainer'>" + content + "</div>" +
        "</div>";
    }

    function getResString(resId) {
        return Jx.escapeHtml(Jx.res.getString(resId));
    }
});
