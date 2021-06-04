/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='navigation.js' />
/// <reference path='servicelocator.js' />
/// <reference path='env.js' />
(function () {
    "use strict";

    var market = new Windows.ApplicationModel.Resources.ResourceLoader("market");

    var querySubmitted = "querysubmitted";
    var suggestionsRequested = "suggestionsrequested";
    var resultSuggestionChosen = "resultsuggestionchosen";

    var searchBarSuggestionsResponded = "searchBar:suggestionsResponded";
    var searchBarQuerySubmitted = "searchBar:querySubmitted";
    var searchBarResultSuggestionChosen = "searchBar:resultSuggestionChosen";
    var searchBarSuggestionsRequested = "searchBar:suggestionsRequested";
    var searchBarUpdatedQuery = "searchbar:updatedQuery";

    var localSettings = new Windows.ApplicationModel.Search.LocalContentSuggestionSettings();
    localSettings.enabled = false;

    var navigationManager,
        searchPane = Windows.ApplicationModel.Search.SearchPane.getForCurrentView(),
        registered = false,
        onSuggestionsRequested,
        onResultSuggestionChosen,
        onQuerySubmitted,
        callbackCount = 0,
        callbackData = [];

    // Disable local content suggestions
    searchPane.setLocalContentSuggestionSettings(localSettings);
    // Temporarily enable Windows' suggestion history, we'll revisit in RTM with Bing's search history
    searchPane.searchHistoryEnabled = true;

    function register(navManager) {
        /// <summary>
        /// Registers to handle events originating from the Search Charm.
        /// </summary>
        /// <param name="navManager" type="BingApp.Classes.NavigationManager">
        /// The navigation manager.
        /// </param>
        navigationManager = navManager || BingApp.locator.navigationManager;

        if (!registered) {
            // Create instance handlers, need closures for callback states
            onSuggestionsRequested = createSuggestionsRequested();
            onResultSuggestionChosen = createOnResultSuggestionChosen();
            onQuerySubmitted = createOnQuerySubmitted();

            searchPane.addEventListener(querySubmitted, onQuerySubmitted, false);
            searchPane.addEventListener(suggestionsRequested, onSuggestionsRequested, false);
            searchPane.addEventListener(resultSuggestionChosen, onResultSuggestionChosen, false); // When handling suggestions, we need to also handle selection of suggestions

            BingApp.locator.eventRelay.addEventListener(
                searchBarSuggestionsResponded,
                {
                    callback: searchBarSuggestionRespondedHandler
                });

            if (searchPane.trySetQueryText) {
                // Not all builds of Win8 have this API.
                BingApp.locator.eventRelay.addEventListener(searchBarUpdatedQuery, searchBarUpdatedQueryHandler);
            }

            registered = true;
        }
    }

    function unregister() {
        /// <summary>
        /// Unregisters from handling events originating from the Search Charm.
        /// </summary>
        if (registered) {
            searchPane.removeEventListener(querySubmitted, onQuerySubmitted);
            searchPane.removeEventListener(suggestionsRequested, onSuggestionsRequested, false);
            searchPane.removeEventListener(resultSuggestionChosen, onResultSuggestionChosen, false);

            BingApp.locator.eventRelay.removeEventListener(
                searchBarSuggestionsResponded,
                {
                    callback: searchBarSuggestionRespondedHandler
                });

            BingApp.locator.eventRelay.removeEventListener(
                searchBarUpdatedQuery,
                {
                    callback: searchBarUpdatedQueryHandler
                });

            registered = false;
        }
    }

    function createOnQuerySubmitted() {
        /// <summary>
        /// Creates the OnQuerySubmitted handler
        /// </summary>
        return function onQuerySubmitted(e) {
            var query = e.queryText.trim();
            BingApp.traceInfo("BingApp.SearchPaneHandler.onQuerySubmitted: handled querysubmitted '{0}'.", query);
            BingApp.locator.eventRelay.fireEvent(
                searchBarQuerySubmitted,
                {
                    query: query,
                });
        }
    };

    function createOnResultSuggestionChosen() {
        /// <summary>
        /// Creates the OnResultSuggestionChosen handler
        /// </summary>
        return function onResultSuggestionChosen(e) {
            if (BingApp.locator.appConfiguration.isAutosuggestEnabled()) {
                BingApp.traceInfo("BingApp.SearchPaneHandler.onResultSuggestionChosen: handled resultsuggestionchosen. Tag: '{0}'.", e.tag);
                var tagData;
                try
                {
                    tagData = e.tag ? JSON.parse(e.tag) : null;
                }
                catch (err) {
                    BingApp.traceError("BingApp.SearchPaneHandler.onResultSuggestionChosen: error parsing Tag Data Tag: '{0}' Error: '{1}'.", e.tag, err.toString());
                    tagData = null;
                }

                BingApp.locator.eventRelay.fireEvent(
                   searchBarResultSuggestionChosen,
                   {
                       tagData: tagData,
                   });
            }
        }
    };
    
    function searchBarSuggestionRespondedHandler(payload) {
        /// <summary>
        /// EventHandler for SuggestionResponsed event.
        /// Has to be member to support add/remove of event.
        /// </summary>
        /// <param name="payload" type="Object">
        /// wrapper with information for continuation.
        /// </param>
        if (!payload || !payload.callbackId) {
            BingApp.traceError("BingApp.SearchPaneHandler.searchBarSuggestionsResponded: bad arguments.");
            return;
        }
        var callbackData = BingApp.SearchPaneHandler.callbackData;

        while (callbackData.length > 0)
        {
            var item = callbackData.shift();

            if (!item || !item.id || !item.cb)
            {
                // Queue ended up with invalid item. Recovering by recreating callbackData with empty array. Worst that will happen is 
                // that some suggestsions won't show. It is best to just recover and continue instead of crashing / potentially show invalid data.
                // Once we have shipAsserts we should put one here.
                BingApp.traceError("BingApp.SearchPaneHandler.searchBarSuggestionsResponded: queue ended up with invalid item. Query: '{0}'. id: '{1}'.", payload.query, payload.callbackId);
                BingApp.SearchPaneHandler.callbackData = [];
                return;
            }

            if (item.id > payload.callbackId)
            {
                // This is a response of a call that is old, we have handled a request that is processed later.
                // Put this item back in place and do nothing.
                callbackData.unshift(item);
                return;
            }

            if (item.id === payload.callbackId)
            {
                // We have the right matching id, process the callback and return.
                item.cb(payload);
                return;
            }
            // We have already popped the item from the queue. Loop to pull the next one.
        }
    };

    function searchBarUpdatedQueryHandler(payload) {
        /// <summary>
        /// EventHandler for UpdatedQuery event.
        /// The documentation of trySetQueryText mentions it is not guaranteed, just a best effort.
        /// </summary>
        /// <param name="payload" type="Object">
        /// wrapper with information for continuation.
        /// </param>
        if (payload) {
            BingApp.traceInfo("SearchPaneHandler.searchBarUpdatedQueryHandler: received 'searchBarUpdatedQuery' message with query '{0}' which is relayed from web compartment. 'Trying' to set the QueryText for searchPane.", payload.queryText);
            searchPane.trySetQueryText(payload.queryText);
        }
    }
    
    function fireAndHandleEvents(e) {
        /// <summary>
        /// Helper that wraps a 'call into' and 'response from' the searchbar iframe over the global eventRelay into a WinJS Promise.
        /// </summary>
        callbackCount++;
        var promise = new WinJS.Promise(
            function(complete, error, progress)
            {
                var deferral = e.request.getDeferral();
                BingApp.locator.eventRelay.fireEvent(
                    searchBarSuggestionsRequested,
                    {
                        query: e.queryText,
                        callbackId: callbackCount,
                    });
                
                // invariant: callbackData is a queue, but id's increase.
                BingApp.SearchPaneHandler.callbackData.push({
                    id: callbackCount,
                    cb: function (data) {
                        complete({ suggestions: data.suggestions, searchSuggestionCollection: e.request.searchSuggestionCollection });
                        deferral.complete();
                    }
                });
            });
        ;
        return promise;
    }

    function createSuggestionsRequested() {
        /// <summary>
        /// Creates a handler for search pane suggestions for this instance
        /// </summary>
        return function onSuggestionsRequested(e)   {
            if (BingApp.locator.appConfiguration.isAutosuggestEnabled()) {
                BingApp.traceInfo("BingApp.SearchPaneHandler.onSuggestionsRequested for query: '{0}'.", e.queryText);

                fireAndHandleEvents(e).then(function fulfilled(data) {
                    for (var i in data.suggestions) {
                        var suggestion = data.suggestions[i];

                        if (suggestion.type === "query") {
                            if (suggestion.query) {
                                data.searchSuggestionCollection.appendQuerySuggestion(suggestion.query);
                            }
                        }
                        else if (suggestion.type === "result") {
                            if (suggestion.text && suggestion.detailText && suggestion.imageUri && suggestion.tagData) {
                                data.searchSuggestionCollection.appendResultSuggestion(
                                    suggestion.text,
                                    suggestion.detailText,
                                    JSON.stringify(suggestion.tagData),
                                    Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(new Windows.Foundation.Uri(suggestion.imageUri)),
                                    suggestion.imageAlternateText);
                            }
                        }
                        else if (suggestion.type === "line") {
                            if (suggestion.label) {
                                data.appendSearchSeparator(suggestion.label);
                            }
                        }
                    }
                });
            }
        }
    };

    // Expose search pane handler functionality as members of BingApp.SearchPaneHandler namespace
    WinJS.Namespace.define("BingApp.SearchPaneHandler", {
        register: register,
        unregister: unregister,
        callbackData: callbackData,
        isRegistered: function () {
            /// <summary>
            /// Returns a value indicating whether search pane handler has been initialized 
            /// for this application.
            /// </summary>
            /// <returns type="Boolean">
            /// True to indicate that search pane handler is already initialized; otherwise, false.
            /// </returns>
            return registered;
        }
    });
})();
