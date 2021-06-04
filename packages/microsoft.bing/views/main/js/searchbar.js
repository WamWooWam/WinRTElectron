/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../../shell/js/shell.js' />
/// <reference path='../../../shell/js/navigation.js' />
/// <reference path='../../../shell/js/servicelocator.js' />
/// <reference path='../../../shell/js/searchpane.js' />
/// <reference path='../../../shell/js/softkeyboard.js' />
/// <reference path='../../../shell/js/eventrelay.js' />
(function (navigationManager) {
    "use strict";
    
    var MESSAGE_CONTENTLOADED_SEARCHBAR = "searchBar:contentLoaded";
    var MESSAGE_NAVIGATE_TO_SEARCHBAR = "searchBar:navigateTo";
    var MESSAGE_NAVIGATE_BACK_SEARCHBAR = "searchBar:navigateBack";

    var MESSAGE_REFRESH_SEARCHBAR = "searchBar:refresh";
    var MESSAGE_RESIZE_SEARCHBAR = "searchBar:resize";
    var MESSAGE_TESTHOOK_SEARCHBAR = "searchBar:testhook";
    var MESSAGE_PERFTESTHOOK_SEARCHBAR = "searchBar:perfCompleted";

    var MESSAGE_NAVIGATECOMPLETED_SEARCHBAR = "searchBar:navigationCompleted";
    var MESSAGE_QUERYSUBMITTED_SEARCHBAR = "searchBar:querySubmitted";
    var MESSAGE_RESULTSUGGESTIONCHOSEN_SEARCHBAR = "searchBar:resultSuggestionChosen";
    var MESSAGE_SUGGESTIONSREQEUESTED_SEARCHBAR = "searchBar:suggestionsRequested";
    var MESSAGE_ERROR_RETRY = "error:retry";

    /// <summary>
    /// Id that is used to identify iframe hosting search results.
    /// </summary>
    var iframeRelayId = "BingSearchBar";

    function handleNavigateTo(args) {
        /// <summary>
        /// Handles navigation to message posted by content displayed inside iframe.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        BingApp.traceInfo("SearchBar.handleNavigateTo: received 'navigateTo' message which is relayed from search bar inside web compartment with Uri: {0}.", args.uri);

        navigationManager.navigateTo(args.uri);
    }

    function handleNavigateBack() {
        /// <summary>
        /// Handles navigate back message posted by content displayed inside iframe.
        /// </summary>
        BingApp.traceInfo("SearchBar.handleNavigateBack: received 'navigateBack' message which is relayed from search bar inside web compartment.");

        // IMPORTANT:   "useBrowserHistoryBack" option will enable navigation optimization that allows
        //              for using browser history when navigating inside search results.
        navigationManager.goBack({ useBrowserHistoryBack: true });
    }

    function handleTestHook(data) {
        ///<summary>
        /// Handle the testhook event of the SearchBar.
        /// It is used to mock events from the app.
        ///</summary>
        /// <param name="data" type="Object">
        /// The data for the event. The name field will be used for the eventname and data field will be used as data for the event.
        /// </param>
        BingApp.traceInfo("SearchBar.handleTestHook: received 'testHook' message which is relayed from search bar inside web compartment.");

        if (!data) {
            return;
        }

        if (data.data && data.data.perfTest) {
            data.data.perfTest.timeAtApp = (new Date()).valueOf();
        }

        BingApp.locator.eventRelay.fireEvent(data.name, data.data);
    }

    WinJS.Namespace.define("BingApp.Classes", {
        SearchBar: WinJS.Class.define(
            // constructor
            function (searchBarIFrame) {
                ///<summary>
                /// Constructs a new SearchBar Object
                ///</summary>
                /// <param name="searchBarIFrame" domElement=”true”>
                /// The iframe dom element for the SearchBar.
                /// </param>
                if (BingApp.Utilities.isNullOrUndefined(searchBarIFrame)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("searchBarIFrame");
                }

                this._searchBarIFrame = searchBarIFrame;
                    
                this._registerEvents();

                var navigationUri = this._getNavigationUrl();
                BingApp.traceInfo("SearchBar.initialize: navigating searchBarIFrame to Uri: {0}.", navigationUri);

                searchBarIFrame.src = navigationUri;
            },
            // instance members
            {
                refresh: function () {
                    ///<summary>
                    /// Handle refreshing the SearchBar.
                    ///</summary>
                    this._isLoaded = false;
                    // Hide frame in case the current load has error or invalid response.
                    BingApp.locator.eventRelay.fireEvent(MESSAGE_RESIZE_SEARCHBAR, { height: "hidden" });
                    this._searchBarIFrame.src = this._getNavigationUrl();
                },
                unregister: function () {
                    ///<summary>
                    /// Unregisters search bar.
                    ///</summary>
                    if (this._registered) {
                        var eventRelay = BingApp.locator.eventRelay;

                        // Note that this will unsubscribe all listeners for iframeRelayId
                        eventRelay.unregisterIframe(iframeRelayId);

                        eventRelay.removeEventListener(MESSAGE_REFRESH_SEARCHBAR, this._refreshListener);
                        eventRelay.removeEventListener(MESSAGE_ERROR_RETRY, this._refreshListener);
                        eventRelay.removeEventListener(MESSAGE_CONTENTLOADED_SEARCHBAR, this._contentLoadedListener);
                        eventRelay.removeEventListener(MESSAGE_TESTHOOK_SEARCHBAR, handleTestHook);
                        eventRelay.removeEventListener(MESSAGE_NAVIGATE_BACK_SEARCHBAR, handleNavigateBack);
                        eventRelay.removeEventListener(MESSAGE_NAVIGATE_TO_SEARCHBAR, handleNavigateTo);
                        eventRelay.removeEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._networkStatusChangedListener);

                        navigationManager.removeEventListener(BingApp.Classes.NavigationManager.events.navigationCompleted, this._navigationCompletedListener);

                        this._refreshListener = null;
                        this._contentLoadedListener = null;
                        this._networkStatusChangedListener = null;
                        this._navigationCompletedListener = null;

                        this._registered = false;
                    }
                },
                _registerEvents: function () {
                    ///<summary>
                    /// Registers events to eventrelay
                    ///</summary>
                    if (!this._registered) {
                        var that = this;
                        var eventRelay = BingApp.locator.eventRelay;

                        // Allow iframe to send/receive events via relay
                        eventRelay.registerIframe(iframeRelayId, this._searchBarIFrame);

                        // WhiteList all the events that might be handled by the SearchBar IFrame
                        eventRelay.addEventListener(MESSAGE_NAVIGATECOMPLETED_SEARCHBAR, iframeRelayId);
                        eventRelay.addEventListener(MESSAGE_PERFTESTHOOK_SEARCHBAR, iframeRelayId);
                        eventRelay.addEventListener(MESSAGE_QUERYSUBMITTED_SEARCHBAR, iframeRelayId);
                        eventRelay.addEventListener(MESSAGE_RESULTSUGGESTIONCHOSEN_SEARCHBAR, iframeRelayId);
                        eventRelay.addEventListener(MESSAGE_SUGGESTIONSREQEUESTED_SEARCHBAR, iframeRelayId);
                        eventRelay.addEventListener(BingApp.SearchPane.events.visibilityChanged, iframeRelayId);
                        eventRelay.addEventListener(BingApp.SoftKeyboard.events.visibilityChanged, iframeRelayId);
                        eventRelay.addEventListener(BingApp.Instrumentation.updateIG, iframeRelayId);

                        // Closures for member functions
                        this._refreshListener = {
                            callback: function () {
                                that.refresh();
                            }
                        };
                        this._contentLoadedListener = {
                            callback: function (args) {
                                that._handleContentLoaded(args)
                            }
                        };
                        this._networkStatusChangedListener = {
                            callback: function (args) {
                                that._handleNetworkStatusChanged(args)
                            }
                        };
                        this._navigationCompletedListener = {
                            callback: function (args) {
                                that._handleNavigationCompleted(args)
                            }
                        };

                        eventRelay.addEventListener(MESSAGE_REFRESH_SEARCHBAR, this._refreshListener);
                        eventRelay.addEventListener(MESSAGE_ERROR_RETRY, this._refreshListener);
                        eventRelay.addEventListener(MESSAGE_CONTENTLOADED_SEARCHBAR, this._contentLoadedListener);
                        eventRelay.addEventListener(MESSAGE_TESTHOOK_SEARCHBAR, handleTestHook);
                        eventRelay.addEventListener(MESSAGE_NAVIGATE_BACK_SEARCHBAR, handleNavigateBack);
                        // $TODO(230817:andreiz,dannyvv) Unify navigation handler from iframe. for now they are seperate between iframehost and searchbar.
                        eventRelay.addEventListener(MESSAGE_NAVIGATE_TO_SEARCHBAR, handleNavigateTo);
                        eventRelay.addEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._networkStatusChangedListener);

                        // Handle application events that has to be rebroadcast to iframe with different data.
                        navigationManager.addEventListener(BingApp.Classes.NavigationManager.events.navigationCompleted, this._navigationCompletedListener);

                        this._registered = true;
                    }
                },
                _getNavigationUrl: function () {
                    ///<summary>
                    /// Calculates Url for navigating to search bar content.
                    ///</summary>
                    var env = BingApp.locator.env;
                    return env.getHostUrl().trim() + env.configuration["searchBoxPage"] + env.getQueryStringWithIFrameParams(env.configuration["searchBoxPageParameters"], window);
                },

                _handleNetworkStatusChanged: function (eventArgs) {
                    if ((!this._isLoaded) && eventArgs.connectionState === BingApp.Classes.NetworkDetectionService.connectionStates.internetAccess) {
                        this.refresh();
                    }
                },

                _handleContentLoaded: function (args) {
                    BingApp.traceInfo("SearchBar.handleContentLoaded: received 'contentLoaded' message which is relayed from search bar inside web compartment.");

                    this._isLoaded = true;

                    // Update targetOrigin for iframe registration with event relay
                    BingApp.locator.eventRelay.registerIframe(iframeRelayId, this._searchBarIFrame, args.targetOrigin);

                    this._handleNavigationCompleted({ uri: navigationManager.getCurrentUri() });
                },

                _handleNavigationCompleted: function(data) {
                    ///<summary>
                    /// Translate data of the native navigateCompleted event to something that is marshelable.
                    ///</summary>
                    /// <param name="data" type="Object">
                    /// Uri object.
                    /// </param>
                    BingApp.traceInfo("SearchBar.handleNavigationCompleted: received 'navigationCompleted' message from navigation manager.");

                    //$REVIEW(andreiz,dannyvv) Check if we can update the raw navigate event to be able to be consumed in iframes.
                    BingApp.locator.eventRelay.fireEvent(
                        MESSAGE_NAVIGATECOMPLETED_SEARCHBAR,
                        {
                            canGoBack: navigationManager.canGoBack(),
                            searchPaneIsVisible: BingApp.SearchPane.isVisible(),
                            uri: 
                                {
                                    // can't use Windows.Foundation.Uri in iframe, so copying uri data.
                                    path: data.uri.path,
                                },
                            parsedParameters: BingApp.Utilities.QueryString.parse(data.uri.query, { decode: true }),
                        });
                },

                _isLoaded: false,
                _registered: false,
                _searchBarIFrame: null,

                // various event closures
                _refreshListener: null,
                _contentLoadedListener: null,
                _networkStatusChangedListener: null,
                _navigationCompletedListener: null,

}),
    });
})(BingApp.locator.navigationManager);

