
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "SearchHandler", function () {
    "use strict";

    var instance = null,
        SearchState = {
            notSearching: 0,
            enteredSearch: 1,
            executedSearch: 2
        };

    Mail.SearchHandler = function (selection, animator) {
        Debug.assert(Jx.isObject(selection));
        this._searchState = SearchState.notSearching;

        this._searchCollection = null;

        var searchHeader = this._searchHeader = new Mail.SearchHeader(selection, animator);
        this._disposer = new Mail.Disposer(
            searchHeader,
            new Mail.EventHook(searchHeader, "querySubmitted", this._executeSearch, this),
            new Mail.EventHook(searchHeader, "startSearchInvoked", this.startSearch, this),
            new Mail.EventHook(searchHeader, "dismissSearchInvoked", this.dismissSearch, this),
            new Mail.EventHook(searchHeader, "scopeChanged", this._rescope, this)
        );

        this._onSearchCompleted = this.raiseEvent.bind(this, "searchComplete");

        Mail.Globals.commandManager.registerShortcuts(["enterSearch", "dismissSearch"]);

        // Set up the instance
        Debug.assert(Jx.isNullOrUndefined(instance), "Only one instance should be active at a time");
        instance = this;

        this._selection = selection;
        this._searchTerm = "";
        this._language = "";
    };

    var MSHProto = Mail.SearchHandler.prototype;

    Jx.augment(Mail.SearchHandler, Jx.Events);
    Debug.Events.define(MSHProto, "enterSearch");          // This event is fired when search is started
    Debug.Events.define(MSHProto, "executeSearch");        // This event is fired when search is executed
    Debug.Events.define(MSHProto, "exitSearch");           // This event is fired when search is exited
    Debug.Events.define(MSHProto, "localSearchComplete");  // This event is fired when localSearch is completed
    Debug.Events.define(MSHProto, "searchComplete"); // This event is fired when serverSearch is completed

    // Static members
    Mail.SearchHandler.enterSearch = function () {
        if (instance) {
            instance.startSearch();
        }
    };

    Mail.SearchHandler.dismissSearch = function () {
        if (instance) {
            instance.dismissSearch();
        }
    };

    Object.defineProperty(Mail.SearchHandler, "isSearching", { get: function () {
        return instance && instance.isSearching;
    }, enumerable : true });

    Object.defineProperty(Mail.SearchHandler, "isSearchingAllViews", { get: function () {
        return Mail.SearchHandler.isSearching && instance.scopeSwitcher.current.isSearchingAllViews;
    }, enumerable : true });

    Object.defineProperty(Mail.SearchHandler, "isSearchHeaderVisible", {
        get: function () {
            return instance && instance.isSearchHeaderVisible;
        },
        enumerable: true
    });

    Object.defineProperty(Mail.SearchHandler, "searchResultsEditable", { get: function () {
        return instance && instance.isSearching && instance.searchResultsEditable;
    }, enumerable : true });

    // Public members
    MSHProto.dispose = function () {
        // Unhook collection listeners
        this._clearPendingSearches();
        Jx.dispose(this._disposer);
        this._disposer = null;
        this._searchHeader = null;

        // Dispose the instance
        Debug.assert(instance === this);
        instance = null;
    };

    MSHProto._rescope = function () {
        Jx.EventManager.fireDirect(null, "isSearchingChanged");
        if (this._searchState === SearchState.executedSearch)  {
            this._executeSearch({
                queryText : this._searchTerm,
                language : this._language
            });
        }
    };

    MSHProto._executeSearch = function (event) {
        Debug.assert(Jx.isObject(event));

        this._searchTerm = event.queryText;
        this._language = event.language;
        this._clearPendingSearches();

        // Create and execute the search to the platform.  Although the collection is created by SearchHandler,
        // the ownership of the collection will be handed off to the TrailingItemCollection in the event args
        // of the localSearchComplete event
        var scope = this._searchHeader.scope;
        this._searchCollection = new Mail.SearchCollection(scope, this._selection.account, event.queryText, event.language);
        this._searchCollectionHooks = this._disposer.add(new Mail.Disposer(
            new Mail.EventHook(this._searchCollection, "localSearchComplete", this._localSearchComplete, this),
            new Mail.EventHook(this._searchCollection, "searchComplete", this._onSearchCompleted, this)
        ));
        this._searchCollection.execute();
        this._setSearchState(SearchState.executedSearch);
    };

    MSHProto.hideSearchHeader = function () {
        this._searchHeader.hide();
    };

    MSHProto.startSearch = function (evt) {
        this._setSearchState(SearchState.enteredSearch, evt);
    };

    MSHProto.dismissSearch = function (/*@optional*/ context) {
        /// <param name="context" type="Object" optional="true">
        /// The context is passed in by the caller during dismissSearch, which allows the caller to figure out
        /// whether the exitSearch event is caller initiated or user-initiated.
        /// </param>
        this._clearPendingSearches();
        this._setSearchState(SearchState.notSearching, context || { reason: "userInvoked" });
    };

    Object.defineProperty(MSHProto, "scopeSwitcher", { get: function () {
        return this._searchHeader.scopeSwitcher;
    }, enumerable: true });

    Object.defineProperty(MSHProto, "isSearching", { get: function () {
        return (this._searchState === SearchState.executedSearch);
    }, enumerable: true });

    Object.defineProperty(MSHProto, "isSearchHeaderVisible", { get: function () {
        return (this._searchState === SearchState.enteredSearch);
    }, enumerable: true });

    Object.defineProperty(MSHProto, "searchResultsEditable", { get: function () {
        return this._searchCollection && this._searchCollection.searchResultsEditable;
    }, enumerable: true });

    // Private members
    MSHProto._clearPendingSearches = function () {
        // Do not dispose the search collection, it is owned by the TrailingItemCollection
        this._disposer.disposeNow(this._searchCollectionHooks);
        this._searchCollectionHooks = null;
        this._searchCollection = null;
    };

    MSHProto._setSearchState = function (newState, context) {
        /// <param name="newState" type="Number"></param>
        /// <param name="context" type="Object" optional="true">
        /// The context is passed in by the caller during dismissSearch, which allows the caller to figure out
        /// whether the exitSearch event is caller initiated or user-initated.
        /// </param>
        Debug.assert(Jx.isValidNumber(newState));

        if (this._searchState === newState) {
            return;
        }

        var oldState = this._searchState,
            oldIsSearching = this.isSearching;

        this._searchState = newState;

        if (newState === SearchState.notSearching) {
            if (oldState === SearchState.executedSearch) {
                this.raiseEvent("exitSearch", context);
            } else {
                this.hideSearchHeader();
            }
        } else if (newState === SearchState.enteredSearch) {
            var animate = !context || context.invokeType !== "typeToSearch";
            this._searchHeader.show(animate);
            this.raiseEvent("enterSearch", context);
        } else {
            Debug.assert(newState === SearchState.executedSearch);
            this.raiseEvent("executeSearch", context);
        }

        Mail.writeProfilerMark("Mail.SearchHandler._setSearchState : " + this._searchState);

        if (this.isSearching !== oldIsSearching) {
            Jx.EventManager.fireDirect(null, "isSearchingChanged");
        }
    };

    MSHProto._localSearchComplete = function () {
        ///<summary>Callback when the platform has finished the initial query against the indexer and knows the number
        ///of results. The actual items still need to be fetched by the SearchCollection to populate the list.
        ///After this point, the TrailingItemCollection in the message list is going to take ownership of the lifetime
        ///of the search collection</summary>
        this.raiseEvent("localSearchComplete", this._searchCollection);
    };
});
