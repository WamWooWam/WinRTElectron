
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="Windows.UI.ApplicationSettings.js" />
/// <reference path="../Shared/Accounts/FlowLauncher.js" />
/// <reference path="../Shared/Accounts/ConnectedAccounts.js" />
/// <reference path="../Shared/AppTile/AppTile.js" />
/// <reference path="../Shared/Navigation/UriGenerator.js"/>
/// <reference path="../Shared/JsUtil/include.js" />
/// <reference path="../Shared/JsUtil/namespace.js" />
/// <reference path="../Shared/Platform/PlatformCache.js" />
/// <reference path="../Shared/Stubs/ApplicationSettingsStubs.js" />
/// <reference path="AppBar.js" />
/// <reference path="AppCommand.js" />
/// <reference path="AppFrame.ref.js" />
/// <reference path="AppLayout.js" />
/// <reference path="AppNav.js" />
/// <reference path="Content.js" />
/// <reference path="Header.js" />
/// <reference path="MessageBar.ref.js" />
/// <reference path="Nav.ref.js" />
/// <reference path="NavBar.js" />
/// <reference path="AnimationData.ref.js"/>
/// <reference path="Settings.js" />

Jx.delayDefine(People, "CpMain", function () {

    function _markStart(s) { Jx.mark("People.CpMain." + s + ",StartTA,People,AppFrame"); }
    function _markStop(s) { Jx.mark("People.CpMain." + s + ",StopTA,People,AppFrame"); }
    function _markInfo(s) { Jx.mark("People.CpMain." + s + ",Info,People,AppFrame"); }

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        N = P.Nav,
        Plat = Microsoft.WindowsLive.Platform,
        ApplicationScenario = Plat.ApplicationScenario;
        InstruID = Microsoft.WindowsLive.Instrumentation.Ids;

    var SearchState = {
            inactive: "inactive",
            active: "active"
        };

    // There are two screen dimensions that map to @media queries in the CSS.    
    // _partialMaxScreenWindowSize is the screen width before we consider the app full screen
    // _partialMinScreenWindowSize is the screen width which maps directly to Windows 8 Snapped 320-500
    var _partialMaxScreenWindowSize = 955;
    var _partialMinScreenWindowSize = 501;

    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.CpMain = /* @constructor*/function (platform, scheduler, uri) {
        /// <summary>Constructor</summary>
        /// <param name="platform" type="Plat.Client" />
        /// <param name="scheduler" type="P.Scheduler" />
        /// <param name="uri" type="String">The URI for initial navigation</param>
        Jx.log.info("People.CpMain");
        this._name = "People.CpMain";
        this.initComponent();

        this._scheduler = scheduler;
        var jobSet = this._jobSet = scheduler.getJobSet().createChild();
        this._platformCache = new P.PlatformCache(platform, this._jobSet);
        this._searchPane = null;

        this._activationUri = uri;
        // Create the components.
        this._header = new P.CpHeader(jobSet);
        this._content = new P.CpContent(jobSet);
        this._connectedTo = new P.Accounts.ConnectedAccounts(ApplicationScenario.people, jobSet);
        this._connectedTo.setPlatform(platform);
        this._appbar = new P.CpAppBar(jobSet, this);
        this._navbar = new P.CpNavBar(jobSet, this);
        this._settings = /*@static_cast(P.Settings)*/null;
        this._currentSearchState = SearchState.inactive;

        // Build the component tree.
        this.append(this._header, this._content, this._connectedTo, this._navbar, this._appbar);

        // Hook up navigation events.
        this._nav = new P.AppNav(this.homeLocation, this.onBeforeNavigate, this.onNavigate, this);

        Debug.Events.define(this, this.navigationCompleted);
    };

    Jx.augment(P.CpMain, Jx.Component);

    P.CpMain.prototype.navigationCompleted = "navigationCompleted";
    P.CpMain.prototype.homepage = N.Pages.viewab.id;
    P.CpMain.prototype.homeLocation = /*@static_cast(NavLocation)*/{ page: N.Pages.viewab.id };
    P.CpMain.prototype._hydraDataVersion = "1.0";
    P.CpMain.prototype._connectedTo = /*@static_cast(P.Accounts.ConnectedAccounts)*/null;
    P.CpMain.prototype._initialLoad = true;
    P.CpMain.prototype._platformCache = /* @static_cast(P.PlatformCache)*/null;
    P.CpMain.prototype._jobSet = /* @static_cast(P.JobSet)*/null;
    P.CpMain.prototype._currentPage = "";
    P.CpMain.prototype._layout = /* @static_cast(P.Layout)*/null;
    P.CpMain.prototype._meId = "";
    P.CpMain.prototype._resumedLocation = /*@static_cast(NavLocation)*/null;
    P.CpMain.prototype._resumedLocState = /*@static_cast(Object)*/null;
    P.CpMain.prototype._resumedPageData = null;
    P.CpMain.prototype._activationUri = "";
    P.CpMain.prototype._rootElem = /*@static_cast(HTMLElement)*/null;
    P.CpMain.prototype._binder = /*@static_cast(P.PlatformObjectBinder)*/null;
    P.CpMain.prototype._messageBar = /*@static_cast(Chat.MessageBar)*/null;
    P.CpMain.prototype._accountMessageBarPresenter = /*@static_cast(Chat.AccountMessageBarPresenter)*/null;
    P.CpMain.prototype._authMessageBarPresenter = /*@static_cast(Chat.AuthMessageBarPresenter)*/null;
    P.CpMain.prototype._easMessageBarPresenter = /*@static_cast(Chat.EasMessageBarPresenter)*/null;
    P.CpMain.prototype._proxyAuthenticator = null;
    P.CpMain.prototype._syncMessageBarPresenter = /*@static_cast(Chat.SyncMessageBarPresenter)*/null;
    P.CpMain.prototype._docEventListener = null;
    P.CpMain.prototype._curVisibilityState = "";
    P.CpMain.prototype._navigating = false;
    P.CpMain.prototype._disableReload = false;
    P.CpMain.prototype._reloadTimeStamp = new Date();
    P.CpMain.prototype._currentQuery = "";
    P.CpMain.prototype._currentQueryLanguage = "";
    P.CpMain.prototype._saveSearchQueryOnNav = false;

    
    P.CpMain._timeStampOverride = "";
    P.CpMain._reloadTimeStampOverride = null;
    

    
    P.CpMain.prototype.useMockPages = function () {
        /// <summary>Test hook for automation</summary>
        this._content.useMockPages();
    };
    

    P.CpMain.prototype.getHydraDataVersion = function () {
        return this._hydraDataVersion;
    };

    P.CpMain.prototype.getPlatform = function () {
        /// <summary>Gets the platform.</summary>
        /// <returns type="Microsoft.WindowsLive.Platform.Client"/>
        Debug.assert(this._platformCache !== null);
        return this._platformCache.getPlatform();
    };

    P.CpMain.prototype.getPlatformCache = function () {
        /// <summary>Gets the platform cache.</summary>
        /// <returns type="P.PlatformCache"/>
        Debug.assert(this._platformCache !== null);
        return this._platformCache;
    };

    P.CpMain.prototype.trackStartup = function () {
        /// <summary>Records (or prepares to record) perf-track events for startup</summary>
        this._content.trackStartup();
    };

    P.CpMain.prototype.getJobSet = function () {
        /// <summary>Gets the scheduler's jobset.</summary>
        /// <returns type="P.JobSet"/>
        return this._jobSet;
    };

    var events = ["keypress", "MSPointerUp", "keyup", "visibilitychange"];
    P.CpMain.prototype._onDocumentEvent = function (evt) {
        /// <summary>Document event handler</summary>
        /// <param name="evt" type="Event"/>
        switch (evt.type) {
            case "keypress": this._onKeyPress(evt); break;
            case "pointerup":
            case "MSPointerUp":
                this._onMsPointerUp(evt);
                break;
            case "keyup": this._onKeyUp(evt); break;
            case "visibilitychange": this._onVisibilityChanged(); break;
            default: Debug.assert(false); break;
        };
    };

    P.CpMain.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.log.info("People.CpMain.deactivateUI");

        this._stopWatchingForDelete();

        // Save session data. Call this before the content is deactivated since it needs to read data from content.
        this._onSuspend();
        var app = /*@static_cast(P.App)*/Jx.app;
        app.removeListener("suspending", this._onSuspend, this);

        var eventListerner = this._docEventListener;
        events.forEach(function (evt) {
            document.removeEventListener(evt, eventListerner, false);
        });
        this._docEventListener = null;

        this.getLayout().removeLayoutChangedEventListener(this._onLayoutChanged, this);

        // Pass true to deactivate to let the control know that it's being forced to close.
        this._content.deactivate(true);

        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpMain.prototype.shutdownComponent = function () {
        /// <summary>Shut down the Component object.</summary>

        // Unhook navigation events.
        this._nav.dispose();

        Jx.dispose(this._platformCache);
        this._platformCache = null;

        this._jobSet.dispose();
        this._jobSet = null;

        var accountMessageBarPresenter = this._accountMessageBarPresenter;
        if (accountMessageBarPresenter) {
            accountMessageBarPresenter.shutdown();
        }
        this._accountMessageBarPresenter = null;

        var proxyAuthenticator = this._proxyAuthenticator;
        if (proxyAuthenticator) {
            proxyAuthenticator.shutdown();
        }
        this._proxyAuthenticator = null;

        var authMessageBarPresenter = this._authMessageBarPresenter;
        if (authMessageBarPresenter) {
            authMessageBarPresenter.shutdown();
        }
        this._authMessageBarPresenter = null;

        var syncErrorMessageBarPresenter = this._syncMessageBarPresenter;
        if (syncErrorMessageBarPresenter) {
            syncErrorMessageBarPresenter.shutdown();
        }
        this._syncMessageBarPresenter = null;

        this._header = /* @static_cast(P.CpHeader)*/null;
        this._content = /* @static_cast(P.CpContent)*/null;
        this._connectedTo = null;
        this._appbar = /* @static_cast(P.CpAppBar)*/null;
        this._navbar = /* @static_cast(P.CpNavBar)*/null;
        this._messageBar = /* @static_cast(Chat.MessageBar)*/null;

        Jx.Component.prototype.shutdownComponent.call(this);
    };

    P.CpMain.prototype.clearBackStack = function () {
        /// <summary>Test hook to clear navigation history</summary>
        this._nav.clearBackStack();
        this._header.updateBackBtn();
    };

    P.CpMain.prototype.setBackStateOfTopItem = function (state) {
        /// <summary>Sets the state of the top item.</summary>
        /// <param name="uri" type="String" />
        this._nav.setBackStateOfTopItem(state);
    };

    P.CpMain._setSessionData = function (sessionData) {
        /// <summary>Save the session data to setting.</summary>
        /// <param name="sessionData" type="AppSessionData"/>
        Debug.assert(Jx.appData);
        // Use setObjectInSegments to avoid individual property value exceed the size limit.
        // There's no size limit for the overall settings but there is size limit of 8k on the individual setting.
        return (Jx.appData.localSettings().setObjectInSegments("LastSession", sessionData));
    };

    P.CpMain._clearSessionData = function () {
        /// <summary>Delete the session data from setting.</summary>
        /// <param name="sessionData" type="AppSessionData"/>
        Debug.assert(Jx.appData);
        return (Jx.appData.localSettings().setObjectInSegments("LastSession", {}));
    };

    P.CpMain._getSessionData = function () {
        /// <summary>Get the session data from setting.</summary>
        Debug.assert(Jx.appData);
        return (Jx.appData.localSettings().getObjectInSegments("LastSession"));
    };

    P.CpMain.prototype._onSuspend = function () {
        /// <summary>Prepare for going to suspension. Save the suspension data to setting.</summary>

        Jx.log.info("People.CpMain._onSuspend");

        // This should only be called after UI is initalized.
        Debug.assert(this._hasUI);

        Debug.assert(this._nav);
        Debug.assert(this._content);

        var /*@type(AppSessionData)*/sessionData = {
            version: this.getHydraDataVersion(),
            location: this._nav.getLocation(),
            locState: this._content.getCurrentLocationState(),
            pageData: this._content.prepareSuspension(),
            backStack: this._nav.convertBackStackToObject()
        };
        Debug.assert(sessionData.backStack);
        if (P.CpMain._setSessionData(sessionData)) {
            Jx.log.pii("People.CpMain._onSuspend: saved session data: " + JSON.stringify(sessionData));
        } else {
            Jx.log.error("People.CpMain._onSuspend: save session data failed: " + JSON.stringify(sessionData));
        }

        this._platformCache.suspend();

        this._recordTimeStamp();
    };

    P.CpMain.prototype._onResume = function () {
        /// <summary>Resume to the state when the app was suspended.
        /// Load the suspension data from setting and navigate to
        /// the location before app was suspended.</summary>

        Jx.log.info("People.CpMain._onResume");
        Debug.assert(!this._resumedLocation);
        Debug.assert(!this._resumedLocState);
        Debug.assert(!this._resumedPageData);

        var /*@type(AppSessionData)*/lastSessionData = P.CpMain._getSessionData();

        if (lastSessionData) {
            if (this.getHydraDataVersion() === lastSessionData.version && !this._isExpired()) {
                this._resumedLocation = lastSessionData.location;
                this._resumedLocState = lastSessionData.locState;
                this._resumedPageData = lastSessionData.pageData;

                // Resume back stack.
                if (lastSessionData.backStack) {
                    this._nav.rebuildBackStackFromObject(lastSessionData.backStack);
                }
            }

            Jx.log.pii("People.CpMain._onResume: lastSessionData: " + JSON.stringify(lastSessionData));
        }

        // Do initial page navigation
        this._initialNavigate();
    };

    P.CpMain.prototype._ensureSettings = function () {
        Debug.assert(this._settings === null);
        this._settings = new P.Settings(this.getPlatform(), this._jobSet);
        this.append(this._settings);
        this._settings.activateUI();
    };

    P.CpMain.prototype._recordTimeStamp = function () {
        var now = new Date().toString();
        
        now = Jx.isNonEmptyString(P.CpMain._timeStampOverride) ? P.CpMain._timeStampOverride : now;
        

        Debug.assert(Jx.appData);
        Jx.appData.localSettings().set("PeopleExpiration", now);
    };

    P.CpMain.prototype._isExpired = function () {
        /// <summary>
        /// Returns whether or not the app has been visible in the last 24 hours
        /// </summary>
        /// <returns type="Boolean" />

        var isExpired = false;
        var timestamp = null;
        Debug.assert(Jx.appData);
        timestamp = Jx.appData.localSettings().get("PeopleExpiration");

        if (!Jx.isNullOrUndefined(timestamp)) {
            // Session should expire one day after last session time stamp
            var expiryDate = new Date(timestamp);
            expiryDate.setDate(expiryDate.getDate() + 1);
            var now = new Date();
            if (now > expiryDate) {
                isExpired = true;
            }
        }

        return isExpired;
    };

    P.CpMain.prototype._needReload = function () {
        /// <summary> Checks if the app needs to be reloaded. It is used to mitigate long-running memory leaks.</summary>
        
        Debug.assert(Jx.appData);
        if (Jx.appData.localSettings().get("disableReload")) {
            return false;
        }

        if (P.CpMain._reloadTimeStampOverride) {
            this._reloadTimeStamp = P.CpMain._reloadTimeStampOverride;
        }
        

        var needReload = false;
        var lastReloadTimeStamp = this._reloadTimeStamp;
        if (!Jx.isNullOrUndefined(lastReloadTimeStamp)) {
            // Page should reload three days after app launched to reset memory footprint.
            var reloadDate = lastReloadTimeStamp;
            reloadDate.setDate(lastReloadTimeStamp.getDate() + 3);
            var now = new Date();
            if (now > reloadDate) {
                needReload = true;
            }
        }
        return needReload;
    };

    
    P.CpMain.setReloadTimeStamp = function (date) {
        /// <summary>Test hook to manually set timestamp of the last reload, Set the date to now minus three days
        /// triggers the app to reload on visibilty change.</summary>
        /// <param name="date" type="Date" />
        P.CpMain._reloadTimeStampOverride = date;
    };

    P.CpMain.setTimeStamp = function (date) {
        /// <summary>Test hook to manually set timestamp of the last session</summary>
        /// <param name="date" type="Date" />
        P.CpMain._timeStampOverride = date.toString();
    };
    

    P.CpMain.prototype._getResumedPageData = function (page) {
        /// <summary>Get the data saved from last suspension.</summary>
        /// <param name="page" type="String">Page name for the current location.</param>
        /// <returns type="ResumedPageData">Returns the data object to be used for resuming.</returns>

        Jx.log.info("People.CpMain._getResumedPageData");
        var data = null;
        var locationState = null;
        // Only  get the suspension data if the same page is being loaded from previous session.
        if (Jx.isObject(this._resumedLocation) && page === this._resumedLocation.page) {
            data = this._resumedPageData;
            if (this._nav.isSameAsCurrentLocation(this._resumedLocation)) {
                locationState = this._resumedLocState;
            }
        }

        this._clearResumedData();

        Jx.log.pii("People.CpMain._getResumedPageData: { data: " + JSON.stringify(data) + ", locationState: " + JSON.stringify(locationState) + "}");
        return { data: data, locationState: locationState };
    };

    P.CpMain.prototype._clearResumedData = function () {
        /// <summary>Clear the data saved from last suspension.</summary>
        Jx.log.info("People.CpMain._clearResumedData");
        this._resumedPageData = null;
        this._resumedLocState = null;
        this._resumedLocation = null;
    };

    P.CpMain.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        ui.html = '<div class="app-frame-header" id="idPeopleAppHeader">' + Jx.getUI(this._header).html + '</div>' +
                  '<div class="app-frame-body" id="idPeopleAppContent">' + Jx.getUI(this._content).html + '</div>' +
                  '<div class="app-frame-connectedTo" id="idPeopleAppConnectedTo">' +
                        '<div class="connectedTo-container" id="connectedTo_container">' + Jx.getUI(this._connectedTo).html + '</div>' +
                  '</div>';
    };

    function getSearchControl() {
        return document.getElementById("searchControlId").winControl;
    }

    function getSearchInputBox() {
        return document.getElementById("searchControlId").querySelector(".win-searchbox-input");
    }

    P.CpMain.prototype.clearSearchBox = function () {
        var searchControl = /* @static_cast(WinJs.UI.SearchBox)*/getSearchControl();

        if (this._saveSearchQueryOnNav && (this._nav.getLocation().page === N.Pages.allcontacts.id)) {
            // If the 'Show All Contacts' link was chosen from the drop down then the search control's
            // query text will have been updated to that entry's string. Ideally we always want the
            // query text to match the search term for the search results page we're navigating to
            // so we reset the queryText here to match the _currentQuery.
            searchControl.queryText = this._currentQuery;
        } else {
            searchControl.queryText = "";
            this._currentSearchState = SearchState.inactive;
            this._searchLostFocus();
        }
        this._saveSearchQueryOnNav = false;
    }

    P.CpMain.prototype._searchHasFocus = function (eventInfo) {
        var searchControl = document.getElementById("searchControlId");
        var backButtonControl = document.getElementById("idPeopleBack");
        WinJS.Utilities.addClass(searchControl, "dynamic-win-searchbox");
        if (backButtonControl && (document.documentElement.offsetWidth <= _partialMinScreenWindowSize) && (backButtonControl.getAttribute("aria-hidden") === "false")) {
            // we only want to add these for the smallest screen width. but only if we have a back button
            WinJS.Utilities.addClass(searchControl, "dynamic-win-searchbox-with-back-button");
            WinJS.Utilities.addClass(searchControl.querySelector(".win-searchbox-flyout"), "dynamic-win-searchbox-flyout-with-back-button");
        }
        WinJS.Utilities.addClass(searchControl.querySelector(".win-searchbox-input"), "dynamic-win-searchbox-input");
        if (document.documentElement.offsetWidth >= _partialMaxScreenWindowSize) {
            WinJS.Utilities.addClass(searchControl.querySelector(".win-searchbox-button"), "dynamic-win-searchbox-button");
        }
        searchControl.setAttribute("aria-expanded", "true");
    }

    P.CpMain.prototype._searchLostFocus = function (eventInfo) {
        if (this._currentSearchState === SearchState.inactive) {
            var searchControl = document.getElementById("searchControlId");
            WinJS.Utilities.removeClass(searchControl, "dynamic-win-searchbox");
            WinJS.Utilities.removeClass(searchControl, "dynamic-win-searchbox-with-back-button");                
            WinJS.Utilities.removeClass(searchControl.querySelector(".win-searchbox-flyout"), "dynamic-win-searchbox-flyout-with-back-button");
            WinJS.Utilities.removeClass(searchControl.querySelector(".win-searchbox-input"), "dynamic-win-searchbox-input");
            if (document.documentElement.offsetWidth >= _partialMaxScreenWindowSize) {
                WinJS.Utilities.removeClass(searchControl.querySelector(".win-searchbox-button"), "dynamic-win-searchbox-button");
            }
            searchControl.setAttribute("aria-expanded", "false");
        }
    }

    P.CpMain.prototype.performQuery = function (queryText, language) {
        ///// <summary>Performs a query using the provided queryText and queryLanguage</summary>
        var curloc = this._nav.getLocation();

        if (!Jx.isNonEmptyString(language)) {
            language = Windows.Globalization.Language.currentInputMethodLanguageTag;
        }

        // If the current location is the all contacts  page then perform the query otherwise
        // navigate to the all contacts page with the query
        if (curloc.page === P.Nav.Pages.allcontacts.id) {
            var control = this._content.getControl();
            this._jobSet.addUIJob(control, control._updateQuery, [queryText, language], P.Priority.appbar);
        } else if (Jx.isNonEmptyString(queryText)) {
            this._saveSearchQueryOnNav = true;
            var uri = People.Nav.getAllContactsSearchUri(queryText, language);
            People.Nav.navigate(uri);
        }
    }

    P.CpMain.prototype.reloadAllContactsPage = function () {
        var control = this._content.getControl();
        if (control) {
            this._jobSet.addUIJob(control, control._reload, null, P.Priority.appbar);
        }
    }

    P.CpMain.prototype.searchBoxQuerySubmittedHandler = function (eventinfo) {
        /// <summary>handles the winjs.ui.searchbox control's querysubmitted event</summary>
        var curloc = this._nav.getLocation();

        // If the current location is the all contacts  page then we should no-op a query submit
        // since the page is live filtering.
        if (curloc.page != P.Nav.Pages.allcontacts.id) {
            this.performQuery(eventinfo.detail.queryText, eventinfo.detail.language);
        }
    }

    P.CpMain.prototype.searchBoxResultSuggestionChosenHandler = function (eventInfo) {
        if (eventInfo.detail.tag == "allResultsTag") {
            this.performQuery(this._currentQuery, this._currentQueryLanguage);
        } else {
            // tag should be a URI either for a Person object or a GAL search so navigate directly to the Uri.
            P.Nav.navigate(eventInfo.detail.tag);
        }
    }

    P.CpMain.prototype.searchBoxSuggestionsRequestedHandler = function (eventInfo) {
        /// <summary>Populates the WinJS.UI.SearchBox control's searchSuggestionCollection</summary>
        /// <param name="eventInfo" type="suggestionsrequested">Contains suggestion requested event args.</param>

        // We do live filtering on the all contacts page so we will not provide drop down results there.
        if (this._currentPage != N.Pages.allcontacts.id) {
            // Only process the request if the query text isn't empty
            if (Jx.isNonEmptyString(eventInfo.detail.queryText)) {
                var that = this;
                // Need to make an asynchronous call to get our search results so setup a promise
                // so the searchSuggestionCollection can be populated at a later time
                eventInfo.detail.setPromise(new WinJS.Promise(function (complete, error, progress) {
                    // Create an indexed search collection using the provided queryText and language
                    if (!Jx.isNonEmptyString(eventInfo.detail.language)) {
                        eventInfo.detail.language = Windows.Globalization.Language.currentInputMethodLanguageTag;
                    }

                    var results = new P.IndexedSearchCollection(that.getPlatform().peopleManager, eventInfo.detail.queryText, eventInfo.detail.language);

                    // Create a listener to respond asynchronously to when the search completes
                    results.addListener("load", function (eventInfo2) {
                        // Create a default image source to use for any entries we fail to retrieve the user tile data for
                        var defaultImagePath = Include.replacePaths("ms-appx://$(imageResources)/ic-default-40.png");
                        var defaultImageUri = new Windows.Foundation.Uri(defaultImagePath);
                        var defaultImageSource = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(defaultImageUri);

                        // Get all GAL accounts
                        var accounts = this.getPlatform().accountManager.getConnectedAccountsByScenario(Plat.ApplicationScenario.peopleSearch,
                                                                                                    Plat.ConnectedFilter.normal,
                                                                                                    Plat.AccountSort.name);

                        // The search drop down allows for a maximum of 25 entries in it, and there are four types of
                        // entries we use to populate the drop down:
                        // 1 - Person: A link to a single person object from the indexed search collection 
                        // 2 - All Results: Generic link to all the results for the indexed search collection
                        // 3 - GAL: A link to the results for a GAL search collection based on the current query
                        // 4 - Search Separator: A UI element which divides search sections (purely visual - but takes up an available slot)

                        // By default all slots are originally reserved for use by person entries. So we start by setting personSlots = 25 (search drop down's maximum).
                        // From there we will transfer slots from person objects to the other three object types as appropriate.
                        var personSlots = 25;

                        // Boolean values to track whether we have entries for each specific type
                        var allResultsEntry = false;
                        var searchSeparatorEntry = false;
                        var galEntries = accounts.count > 0;
                        var personEntries = eventInfo2.length > 0;

                        // The total number of person objects in the indexed search collection
                        var personEntryCount = eventInfo2.length;

                        // First check to see if we need to reserve any slots for GAL entries
                        if (galEntries) {
                            // If there are GAL entries we need to save a spot for each of them.
                            // Note: personSlots may be reduced below 0 by this (indicating we have more than
                            // 25 GAL accounts) - this is an expected condition. We will attempt to add each
                            // GAL account later but the search drop down will only show the first 25 entries.
                            personSlots -= accounts.count;
                        }

                        // Next check to see if we need to reserve a slot for an 'All results' entry
                        // We do this when we have more person objects in the indexed search collection
                        // (as represented by personEntryCount) than we have slots to show them. If we
                        // know we have galEntries then we need to account for the search separator
                        // which we eventually save a spot for below.
                        if (personEntryCount > (galEntries ? personSlots - 1 : personSlots)) {
                            // There are more person entries than there are person slots, so we need
                            // to save a spot for the generic 'All results' entry
                            personSlots -= 1;
                            allResultsEntry = true;
                        }

                        if (galEntries || allResultsEntry) {
                            // Need to save a slot for the search separator (even though it may not be shown
                            // if there are no index entries)
                            personSlots -= 1;
                            if (personSlots > 0 && personEntries) {
                                // If we have room for at least 1 person entry and
                                // we have gal or all result entries then we need
                                // to show the search separator (we already saved
                                // a slot for it above)
                                searchSeparatorEntry = true;
                            }
                        }

                        // For each person entry object (up to the available number of free person slots)
                        // in the indexed collection add a result suggestion to the drop down
                        var personObjectsToAdd = Math.min(eventInfo2.length, personSlots);
                        Jx.log.info("New Search Suggestions added for query " + eventInfo.detail.queryText)
                        for (var i = 0; i < personObjectsToAdd; i++) {
                            // Get the person object at the current index
                            person = eventInfo2.target.getItem(i);
                            var imageSource;
                            // Get the user tile for the person and verify if it as an appdataURI
                            var userTile = person.data.getUserTile(Microsoft.WindowsLive.Platform.UserTileSize.extraSmall, false);
                            if (!Jx.isNullOrUndefined(userTile) && Jx.isNonEmptyString(userTile.appdataURI)) {
                                userTileUri = new Windows.Foundation.Uri(userTile.appdataURI);
                                Jx.log.info("Search Suggestion URI: " + userTile.appdataURI + " used for user " + person.data.calculatedUIName);
                                // use the appdataURI as the image source
                                imageSource = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(userTileUri);
                            } else {
                                // failed to get the tile's image, fallback to using a default image source
                                Jx.log.info("Search Suggestion weeble used for user " + person.data.calculatedUIName);
                                imageSource = defaultImageSource;
                            }
                            // Get a uri to use as the object tag
                            var uri = P.Nav.getViewPersonUri(person.data.objectId);

                            // Add the suggestion to the collection
                            eventInfo.detail.searchSuggestionCollection.appendResultSuggestion(person.data.calculatedUIName, "", uri, imageSource, person.data.calculatedUIName);
                        }

                        if (searchSeparatorEntry) {
                            eventInfo.detail.searchSuggestionCollection.appendSearchSeparator("");
                        }

                        if (allResultsEntry) {
                            var allResultsImagePath = Include.replacePaths("ms-appx://$(imageResources)/searchviewall.png");
                            var allResultsImageUri = new Windows.Foundation.Uri(allResultsImagePath);
                            var allResultsImageSource = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(allResultsImageUri);

                            // Create localized version of our all entries string using the SearchBoxALlEntriesPrefix and Suffix and a localized version of the
                            // collection's count
                            var formatter = new Windows.Globalization.NumberFormatting.DecimalFormatter();
                            formatter.fractionDigits = 0;
                            var count = formatter.formatInt(eventInfo2.totalCount);
                            var allEntriesString = Jx.res.loadCompoundString("/strings/SearchBoxAllEntries", count);
                            eventInfo.detail.searchSuggestionCollection.appendResultSuggestion(allEntriesString, "", "allResultsTag", allResultsImageSource, "");
                        }

                        if (galEntries) {
                            var galImagePath = Include.replacePaths("ms-appx://$(imageResources)/searchgal.png");
                            var galImageUri = new Windows.Foundation.Uri(galImagePath);
                            var galImageSource = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(galImageUri);

                            for (var i = 0; i < accounts.count; i++) {
                                var galEntryString = Jx.res.loadCompoundString('/strings/galSearchButtonText', accounts.item(i).displayName);
                                var uri = People.Nav.getGALSearchUri(eventInfo.detail.queryText, accounts.item(i).emailAddress);

                                eventInfo.detail.searchSuggestionCollection.appendResultSuggestion(galEntryString, "", uri, galImageSource, "");
                            }
                        }

                        // Notify the promise that it is copmlete so it can release its deferral
                        complete();
                    }, that);

                    // Start the search
                    results.load(that._jobSet);
                }));
            }
        }
    }

    var c_searchQueryTimeout = 200;
    var timer = null;

    P.CpMain.prototype.searchTimeoutHandler = function () {
        this.performQuery(this._currentQuery, this._currentQueryLanguage);
    }

    P.CpMain.prototype.searchBoxQueryChangedHandler = function (eventInfo) {
        this._currentQuery = eventInfo.detail.queryText;

        if (!Jx.isNonEmptyString(eventInfo.detail.language)) {
            eventInfo.detail.language = Windows.Globalization.Language.currentInputMethodLanguageTag;
        }

        this._currentQueryLanguage = eventInfo.detail.language;
        this._currentSearchState = Jx.isNonEmptyString(this._currentQuery) ? SearchState.active : SearchState.inactive;

        // Perform live filtering when on the allcontacts page
        if (this._currentPage == N.Pages.allcontacts.id) {
            if (timer) {
                clearTimeout(timer);
            }
            timeoutHandler = this.searchTimeoutHandler.bind(this);
            timer = setTimeout(timeoutHandler, c_searchQueryTimeout);
        }
    }

    P.CpMain.prototype.receivingFocusOnKeyboardInputHandler = function (eventInfo) {
        if (this._currentSearchState === SearchState.inactive) {
            this._searchHasFocus();
        }
    }

    P.CpMain.prototype.initUI = function (/*@type(HTMLElement)*/container) {
        this._rootElem = container;
        Jx.addClass(container, "app-frame-grid");
        Jx.Component.prototype.initUI.apply(this, arguments);
        WinJS.UI.processAll();

        var searchControl = getSearchControl();
        searchControl.addEventListener("focusout", this._searchLostFocus.bind(this), false);
        searchControl.addEventListener("focusin", this._searchHasFocus.bind(this), false);
        searchControl.addEventListener("querysubmitted", this.searchBoxQuerySubmittedHandler.bind(this), false);
        searchControl.addEventListener("suggestionsrequested", this.searchBoxSuggestionsRequestedHandler.bind(this), false);
        searchControl.addEventListener("resultsuggestionchosen", this.searchBoxResultSuggestionChosenHandler.bind(this), false);
        searchControl.addEventListener("querychanged", this.searchBoxQueryChangedHandler.bind(this), this);
        searchControl.addEventListener("receivingfocusonkeyboardinput", this.receivingFocusOnKeyboardInputHandler.bind(this), false);

        getSearchInputBox().maxLength = 500;

        window.addEventListener("focusin", this._focusChanged.bind(this), false);
    };

    P.CpMain.prototype._focusChanged = function (/*@dynamic*/ev) {
        ///<summary>Handles enabling and disabling of the WinJS Search Control's Type-to-Search behavior</summary>
        getSearchControl().focusOnKeyboardInput = this._isTypeToSearchEnabled(ev.target);
    };

    isElementOrDescendant = function (element, ancestor) {
        ///<summary>Determines if element is a descendant of ancestor by
        ///walking up element's parent tree</summary>
        Debug.assert(Jx.isHTMLElement(element));
        Debug.assert(Jx.isHTMLElement(ancestor));

        while (element && element !== ancestor) {
            element = element.parentElement;
        }
        return element === ancestor;
    };

    P.CpMain.prototype._isTypeToSearchEnabled = function (target) {
        ///<summary>Determines if Type-to-Search should be enabled given that focus is being given to the 'target' element</summary>

        // If there is no target then disable TTS if the root is disabled, otherwise allow TTS to be enabled
        if (!target) {
            return !this._rootElem.disabled;
        }

        // It is better to be cautious about enabling TTS, so if a target has any basic edit type then we will disable TTS
        if ((target.tagName === "INPUT" && ["button", "checkbox", "radio"].indexOf(target.type.toLowerCase()) === -1) ||
            (target.tagName === "TEXTAREA") ||
            target.isContentEditable) {
            return false;
        }

        // Checking isTargetEditable is not enough in some scenarios because editable elements can be hosted in an iframe which belongs to the web context.
        // In those cases, tagName would be IFRAME but we don't have the permission to inspect the activeElement of the contentDocument of that iframe.
        // In order to work around this we'll actively check for these scenarios - in the People app today all of them happen to be Share Canvases
        // so what we do is just disable Type-to-search for all descendants of a share canvas.
        var shareCanvases = document.getElementsByClassName("ra-shareCanvas");
        for (var i = 0; i < shareCanvases.length; i++) {
            if (isElementOrDescendant(target, shareCanvases.item(i))) {
                return false;
            }
        }

        if (!this._rootElem.disabled && (target === document.body || target === document.documentElement)) {
            return true;
        }

        if (isElementOrDescendant(target, this._rootElem)) {
            return true;
        }

        return false;
    };

    P.CpMain.prototype.getRootElem = function () {
        return this._rootElem;
    };

    P.CpMain.prototype._isEditPage = function () {
        var loc = this._nav.getLocation();
        return Jx.isObject(loc) && Jx.isNonEmptyString(loc.page) && N.Pages[loc.page].isEdit;
    };

    P.CpMain.prototype._navBack = function () {
        if (this.canGoBack()) {
            this.back();
        }
    };

    P.CpMain.prototype._onKeyPress = function (evt) {
        /// <summary>keypress event handler.</summary>
        /// <param name="evt" type="Event"/>
        // Hook up key event handler to process Esc and Backspace
        if (evt.key === "Esc" || evt.key === "Backspace") {
            // Do not process Backspace if the key event is from an input control
            if (evt.key === "Backspace") {
                var tagName = evt.srcElement ? evt.srcElement.tagName : null;
                if (tagName === "INPUT" || tagName === "TEXTAREA") {
                    return;
                }
            }

            var isEdit = this._isEditPage();
            if ((evt.key === "Esc" && isEdit) || (evt.key === "Backspace" && !isEdit)) {
                this._navBack();
            }
        }
    };

    P.CpMain.prototype._onMsPointerUp = function (evt) {
        /// <summary>msPointerUp event handler.</summary>
        /// <param name="evt" type="Event"/>
        // WinLive 560635 will implement the back mouse button and browser back key event handler in Jx. The code here can be simplified once that's in.
        // Hook up mouse back button event
        if (evt.button === 3 /*back button*/) {
            if (!this._isEditPage()) {
                this._navBack();
            }
        }
    };

    P.CpMain.prototype._onKeyUp = function (evt) {
        /// <summary>keyup event handler.</summary>
        /// <param name="evt" type="Event"/>
        // Hook up Alt+Arrow key event and BrowerBack key event
        var isRtl = Jx.isRtl();
        if ((evt.altKey && ((!isRtl && evt.key === "Left") || (isRtl && evt.key === "Right"))) ||
            (evt.key === "BrowserBack")) {
            if (!this._isEditPage()) {
                this._navBack();
            }
        }
    };

    P.CpMain.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.log.info("People.CpMain.activateUI");

        Jx.Component.prototype.activateUI.call(this);

        // Hook up suspend event after UI is initialized.
        var app = /*@static_cast(P.App)*/Jx.app;
        app.addListener("suspending", this._onSuspend, this);

        this._curVisibilityState = document.msVisibilityState;

        // Hook up document events
        var eventListener = this._docEventListener = this._onDocumentEvent.bind(this);
        events.forEach(function (evt) {
            document.addEventListener(evt, eventListener, false);
        });

        // Hook up layout change event handler
        this.getLayout().addLayoutChangedEventListener(this._onLayoutChanged, this);

        this._header.setParentContainer(document.getElementById("idPeopleAppHeader"));
        this._onResume();

        this._jobSet.addUIJob(this._navbar, this._navbar.initialize, null, P.Priority.appbar);

        this._jobSet.addUIJob(this, this._ensureMessageBar, null, P.Priority.messageBar);
        this._jobSet.addUIJob(this, this._ensureSettings, null, P.Priority.settingsPane);
        this._jobSet.addUIJob(this, /*@bind(P.CpMain)*/function () {
            P.AppTile.subscribeNotifications(this.getPlatform());
            P.Social.unreadNotifications.initialize(this.getPlatform());
        }, null, P.Priority.notifications);

        this._jobSet.addUIJob(this, /*@bind(P.CpMain)*/function () { P.startBackgroundLoading(this._jobSet); }, null, P.Priority.backgroundLoad);

        // Listen to the dialog-closed event so that we can restore focus on the main app. Note: we don't reference P.DialogEvents.closed in non-debug
        // to prevent loading Dialog.js at startup.
        var closedEvent = "People.DialogEvents.closed";
        Debug.assert(closedEvent === P.DialogEvents.closed);
        Jx.EventManager.addListener(this, closedEvent, /*@bind(P.CpMain)*/function () {
            if (this._content) {
                this._content.setDefaultFocus();
            }
        }, this);
    };

    P.CpMain.prototype._onLayoutChanged = function () {
        this._connectedTo.disabled = this.getLayoutState() === "snapped";
    };

    P.CpMain.prototype._onVisibilityChanged = function () {
        /// <summary>Invoked in response to the msvisibilitychange event</summary>
        if (this._curVisibilityState !== document.msVisibilityState) {
            this._curVisibilityState = document.msVisibilityState;
            if (!Jx.isNonEmptyString(this._activationUri)) {
                if (document.msVisibilityState === "visible") {
                    Jx.log.info("People.CpMain._onVisibilityChanged: changed to visible");
                    if (this._isExpired()) {
                        this.goHome();
                        // Clear the back stack async so that we complete the navigate first
                        window.msSetImmediate(/*@bind(P.CpMain)*/function () {
                            this.clearBackStack();
                        } .bind(this));
                    }
                    // Clear session data when app goes from visible to invisible. This is to make sure to launch fresh after user closes the app explictly.
                    // Here's what will happen if we don't do this. If the app was suspeneded (so the session data was saved) and later user started interacting with the app,
                    // after which user closed the app explicitly using close guesture, the next time the app lauches and if the start fresh bit isn't set in activation event, it will
                    // try to resume state using the saved the session data, which would be some random state when the app previously got susupened.
                    P.CpMain._clearSessionData();

                    if (this._needReload()) {
                        window.location.reload();
                    }
                } else {
                    this._recordTimeStamp();
                }
            }
        }
    };

    P.CpMain.prototype.go = function (loc) {
        /// <summary>Asynchronously navigate to the specified location.</summary>
        /// <param name="loc" type="NavLocation">Destination location of the navigation</param>
        Debug.assert(Jx.isObject(loc));
        Debug.assert(this._nav);

        if (!this._navigating) {
            var nav = this._nav;
            var currentLoc = nav.getLocation();
            var that = this;
            msSetImmediate(function () {
                // Only navigate if the location hasn't already changed
                if (Jx.isNullOrUndefined(currentLoc) ||
                    nav.isSameAsCurrentLocation(currentLoc)) {
                    nav.go(loc);

                    // update the search box for navigation
                    that.clearSearchBox();
                }
            });
        }
    };

    P.CpMain.prototype.back = function (uri) {
        /// <summary>Navigate back to previous location.</summary>
        /// <param name="uri" type="String" optional="true">An optional destination, for pages like Add Contact that want to navigate in-place to another page (ensuring they are not on the back stack).</param>
        Debug.assert(Jx.isString(uri) || Jx.isNullOrUndefined(uri), "Invalid parameter: uri");
        if (Jx.isNonEmptyString(uri)) {
            this._nav.pushUriToBackStack(uri);
        }
        this._nav.back();
        this.clearSearchBox();
    };

    P.CpMain.prototype.canGoBack = function () {
        /// <summary>Can navigate back?</summary>
        return this._nav.canGoBack();
    };

    P.CpMain.prototype.isSameAsCurrentLocation = function (loc) {
        /// <summary>Is the location same as the current location?</summary>
        /// <param name="loc" type="NavLocation"/>
        /// <returns type="Boolean"/>
        return this._nav.isSameAsCurrentLocation(loc);
    };

    P.CpMain.prototype.getLocation = function () {
        /// <summary>Returns the current location</summary>
        /// <returns type="NavLocation"/>
        return this._nav.getLocation();
    };

    P.CpMain.prototype.getLayout = function () {
        /// <summary>Gets the layout manager.</summary>
        /// <returns type="P.Layout">The People layout object</returns>
        Jx.log.info("People.CpMain.getLayout");
        if (!this._layout) {
            this._layout = new P.Layout();
        }
        return this._layout;
    };

    P.CpMain.prototype.getLayoutState = function () {
        /// <summary>Gets the cached layout state. Calling this function also makes the app hook up with the layout change event.</summary>
        /// <returns type="String">The cached layout state: "snapped" for snap state, "mobody" otherwise</returns>
        Jx.log.info("People.CpMain.getLayoutState");
        return this.getLayout().getLayoutState();
    };

    P.CpMain.prototype._initialNavigate = function () {
        /// <summary>First navigate after activating the UI</summary>
        Jx.log.info("People.CpMain._initialNavigate");
        var loc = this._resumedLocation;
        // If there's an activation URI, push the resumed location onto back stack
        // and navigate to the activation URI. Otherwise navigate to the resumed location.
        if (Jx.isNonEmptyString(this._activationUri)) {
            this._navigate(this._activationUri);
        } else {
            this._nav.go(loc ? loc : this.homeLocation);
        }
    };

    P.CpMain.prototype.navToActivatedUri = function (uri) {
        /// <summary>Navigate to the activated uri</summary>
        ///<param name="uri" type="String">The uri for navigation</param>
        this._activationUri = uri;
        this._navigate(uri);
    };

    // Support protocol activation that does not necessarily entail a page navigation
    var nonNavigationActions = {
        connectaccount: /*@bind(P.CpMain)*/function (/*@dynamic*/query) {
            Debug.assert(Jx.isNonEmptyString(query.accountObjectId));
            if (Jx.isNonEmptyString(query.accountObjectId)) {
                var reconnect = Jx.isNonEmptyString(query.reconnect) ? (query.reconnect.toLowerCase() === "true") : false;
                var flowLauncher = new P.Accounts.FlowLauncher(this.getPlatform(), Plat.ApplicationScenario.people, "share", this._jobSet);
                flowLauncher.launchManageFlowByObjectId(query.accountObjectId, reconnect);
            }
        }
    };

    P.CpMain.prototype._getNonNavigationAction = function (uri) {
        /// <summary>Parses the uri wlpeople:action,params</summary>
        /// <param name="uri" type="String" />
        /// <returns type="Function"/>
        var match = /*@static_cast(Array)*//([^,]*),(.*)/g.exec(uri);
        var tokens = match ? match.slice(1) : [];
        var /*@type(String)*/actionName = tokens[0] && tokens[0].toLowerCase();
        var /*@type(Function)*/action = nonNavigationActions.hasOwnProperty(actionName) && nonNavigationActions[actionName];
        return action && action.bind(this, Jx.parseHash(tokens[1]));
    };

    P.CpMain.prototype._navigate = function (uri) {
        /// <summary>Navigates to the given URI, special cases navigation within People app.</summary>
        /// <param name="uri" type="String">The uri (either hash or protocol uri) of the destination page.</param>
        Jx.log.info("People.CpMain._navToActivationUri");
        Debug.assert(Jx.isNonEmptyString(uri));
        Jx.log.pii("activation uri = " + uri);

        Debug.assert(Jx.isNonEmptyString(uri));
        var nonNavAction = this._getNonNavigationAction(uri);
        var hash;
        if (Jx.isFunction(nonNavAction)) {
            // If we were launched w/ a non-navigation action, don't use the URI, but an empty hash instead.
            hash = "#";
            nonNavAction();
        } else {
            // When activated using search activation, uri is already in hash format.
            // P.CpMain.convertProtocolPathToHash returns null in that case.
            hash = P.CpMain.convertProtocolPathToHash(uri) || uri;
        }
        N.navigate(hash);
    };

    P.CpMain.prototype._logEtwActivationEnd = function () {
        NoShip.People.etw("peopleAppActivation_end");
        Jx.mark("People:AppActivation,StopTA,People");
        this._logEtwActivationEnd = Jx.fnEmpty;
    };

    P.CpMain.prototype._getMeId = function () {
        /// <summary>Get the object id for ME object</summary>
        if (!this._meId) {
            try {
                var me = this._platformCache.getDefaultMeContact();
                this._meId = me.objectId;
            } catch (err) {
                Jx.log.exception("People.CpMain._getMeId: failed to get ME contact.", err);
            }
        }
        return this._meId;
    };

    P.CpMain.prototype._fixHashValues = function (values) {
        /// <summary>Validate the hash keys and fix the value for the invalid keys.</summary>
        /// <param name="values" type="NavLocation">Data object that has the hash key properties.</param>
        Jx.log.info("People.CpMain._fixHashValues begin: page=" + values.page + ",id=" + values.id);
        Jx.log.pii("People.CpMain._fixHashValues begin(cont):query=" + values.query);

        /// <disable>JS2076.IdentifierIsMiscased</disable>
        var Pages = N.Pages;
        /// <enable>JS2076.IdentifierIsMiscased</enable>

        if (!(values.page in Pages)) {
            // Fall back to default page for invalid page value.
            values.page = this.homepage;
        }
        if (values.page === Pages.allcontacts.id && values.query === undefined) {
            values.query = null;
        }

        if (values.page === N.Pages.viewperson.id && values.verb && values.verb === "Windows.ContactsProvider.AddContact") {
            Pages.viewperson.isEdit = true;
        }
        // If it's "go home" but triggered by back, remove the home position in the loc object.
        if (values.page === this.homepage && values.trigger === "back" && values.data) {
            var data = this._parseJSONData(values.data);
            if (data["pos"] === "home") {
                data["pos"] = null;
                values.data = escape(JSON.stringify(data));
            }
        }

        // Map the Me pages refered by the general URI to the specific Me URIs.
        if (N.Pages[values.page].requirePerson && !N.Pages[values.page].requireMe && values.page !== Pages.viewraitem.id && values.id === this._getMeId()) {
            values.id = null;
            switch (values.page) {
                case Pages.viewperson.id: values.page = Pages.viewme.id; break;
                case Pages.viewprofile.id: values.page = Pages.viewmeprofile.id; break;
                case Pages.viewphoto.id: values.page = Pages.viewmephoto.id; break;
                case Pages.viewra.id: values.page = Pages.viewmera.id; break;
                case Pages.editprofile.id: Jx.log.error("Edit Me profile is not supported!"); values.page = this.homepage; break;
                case Pages.linkperson.id: Jx.log.error("Link Me is not supported!"); values.page = this.homepage; break;
                default: Debug.assert(false, "Me Id was passed in for page " + values.page + ", but it shouldn't be there."); break;
            }
        }

        // Mark the uri as deep linking activated
        if (Jx.isNonEmptyString(this._activationUri)) {
            P.AppNav.markLocationAsDeepLinking(values);
            this._activationUri = "";
        }

        Jx.log.info("People.CpMain._fixHashValues end: page=" + values.page + ",id=" + values.id);
        Jx.log.pii("People.CpMain._fixHashValues end(cont): query=" + values.query);
    };

    P.CpMain.prototype.onBeforeNavigate = function (/*@dynamic*/ev) {
        /// <summary>beforeNavigate event handler. This is called on navigate trigger but before any navigation work is done.</summary>
        /// <param name="ev">Before navigation event. It is used to update the location or cancel the navigation if needed.</param>
        Jx.log.info("People.CpMain.onBeforeNavigate");
        Debug.assert(Jx.isObject(ev.location));
        Debug.assert(ev.hasOwnProperty("cancel"));
        // Cancel this navigation if we are already navigating,
        // or if the current control cannot be deactivated.
        if (this._navigating || !this._content.deactivate()) {
            ev.cancel = true;
        } else {
            this._fixHashValues(ev.location);
            // It's not allowed to navigate to the same location as the current one.
            if (this._nav.isSameAsCurrentLocation(ev.location)) {
                ev.cancel = true;
                // If the navigation is triggered by back button, we'll back one step further.
                if (ev.location.trigger === "back") {
                    this._nav.removeLastLocation();
                    Debug.assert(this.canGoBack());
                    N.backAsync();
                }
            } else {
                var loc = /*@static_cast(NavLocation)*/ev.location;
                var layout = this.getLayout();
                // If the page doesn't support snap, we'll unsnap from snap view before navigation.
                if (N.Pages[loc.page].blockSnap && layout.getLayoutState() === P.Layout.layoutState.snapped && loc.trigger !== "back") {
                    ev.cancel = true;
                    if (layout.unsnap()) {
                        // If unsnap succeeds, make the async navigation call.
                        this.go(loc);
                    }
                } else {
                   // Now we are ready to proceed with navigation.
                   this._navigating = true;

                    var that = this;
                    window.msSetImmediate(function () {
                        if (P.AppNav.isLocationDeepLinking(loc) && that._nav.isLastLocationDeepLinking()) {
                            // Do not allow multiple consecutive deep linking pages on backstack.
                            that._nav.removeLastLocation();
                            that._header.updateBackBtn(loc.page);
                        }
                    });
                }
            }
        }
        Debug.assert(ev.cancel || this._navigating);
    };

    P.CpMain.prototype._addBiciOnNavigate = function (loc) {
        /// <summary>Add BICI points for page visited.</summary>
        /// <param name="loc" type="NavLocation">Destination location of the navigation</param>
        var biciId = -1;
        switch (loc.page) {
            case N.Pages.createcontact.id: biciId = P.Bici.createContact; break;
            case N.Pages.editmepicture.id: biciId = P.Bici.editMePicture; break;
            case N.Pages.linkperson.id: biciId = P.Bici.linkPerson; break;
            case N.Pages.viewmeprofile.id: biciId = P.Bici.viewMeProfile; break;
            case N.Pages.editprofile.id: biciId = P.Bici.editProfile; break;
            case N.Pages.viewme.id: biciId = P.Bici.mePage; break;
            case N.Pages.viewperson.id: biciId = P.Bici.landingPage; break;
            case N.Pages.viewab.id: biciId = P.Bici.allPage; break;
            case N.Pages.galsearchresults.id: biciId = P.Bici.galsearchresults; break;
        }
        if (biciId !== -1) {
            Jx.bici.addToStream(InstruID.People.socialPageViewed, "", biciId);
        }
    };

    P.CpMain.prototype.isNavigating = function () {
        /// <summary>Returns if it's in the process of navigating.</summary>
        /// <returns type="Boolean"/>
        return this._navigating;
    };

    P.CpMain.prototype._setNavigationCompleted = function () {
        /// <summary>Reset navigation flag and fire navigation completed event</summary>
        this._navigating = false;
        Jx.raiseEvent(this, this.navigationCompleted);
    };

    P.CpMain.prototype.onNavigate = function (/*@dynamic*/ev) {
        /// <summary>navigate event handler.</summary>
        /// <param name="ev">navigate event.</param>
        Jx.log.info("People.CpMain.onNavigate");
        var loc = /*@static_cast(NavLocation)*/ev.location;
        Debug.assert(Jx.isObject(loc));
        // Do not allow navigation from address book page to address book page. This can happen in BVT.
        // When we launch, hash value was "", then it's set to "page=viewab" by setting the window.location.
        if (!(loc.page === this.homepage && this._currentPage === this.homepage)) {

            this._jobSet.addUIJob(this, this._addBiciOnNavigate, [loc], P.Priority.bici);
            this._onNavigate(loc);
        }
    };

    P.CpMain.prototype._getPersonById = function (id) {
        /// <summary>Gets a person by id. If the person's objectType is "MeObject", then returns me contact; else returns person
        /// <param name="id" type="String">Id of the person being looked up</param>
        var person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/this.getPlatform().peopleManager.tryLoadPerson(id);
        if (Jx.isObject(person) && person.objectType === "MeContact") {
            person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/this._platformCache.getDefaultMeContact()
        }
        return person;
    }

    P.CpMain.prototype._onNavigate = function (loc) {
        /// <summary>Navigation handler</summary>
        /// <param name="loc" type="NavLocation">Destination location of the navigation</param>
        var page = this._currentPage = loc.page;
        var rawData = loc.data;
        var /*@dynamic*/parsedData = this._parseJSONData(rawData);
        var pageKeyObject = null;
        var redirectNav = false;

        try {
            // If we're in fullscreen mode, we need to exit that before navigating to the new page
            // to make sure that the document's body is in the correct state to load the contents 
            // of the new page
            if (document.msFullscreenElement) {
                document.msExitFullscreen();
            }

            this._content.trackNavStart(page);

            this._stopWatchingForDelete();

            this.getCommandBar().reset();

            this.getFrameCommands().reset();

            this._navbar.updateShowHide();

            if (page === N.Pages.allcontacts.id || page === N.Pages.galsearchresults.id) {
                // Special case for the all contacts and gal search results pages.
                // Get the query for search, if present. This is the pageKeyObject.
                if (loc.query) {
                    var rawQuery = loc.query;
                    // We're navigating to a search page so we want to make sure the search box is populated
                    // with the query for this page. To do this we'll set _saveSearchQueryOnNav and _currentQuery.
                    // When _clearSearchBox is called for the navigation it will do the work to properly update the
                    // search box's current query.
                    this._saveSearchQueryOnNav = true;
                    this._currentQuery = unescape(loc.query); 
                    Jx.log.info("People.CpMain._onNavigate: page=" + page);
                    Jx.log.pii("People.CpMain._onNavigate(cont): query=" + rawQuery + ", data=" + rawData);
                }

                pageKeyObject = rawQuery ? unescape(rawQuery) : null;
            } else if (N.Pages[page].requirePerson) {
                // Load the person if the control requires a person object.
                var rawId = loc.id;
                Jx.log.info("People.CpMain._onNavigate: page=" + page + ", id=" + rawId);
                Jx.log.pii("People.CpMain._onNavigate(cont): data=" + rawData);

                // The raw id was escaped by Uri generator
                var id = rawId ? unescape(rawId) : undefined;
                var /*@type(Microsoft.WindowsLive.Platform.Person)*/person = null;

                // If the control expects me, or if the id matches Me's object id, then get Me.
                if (N.Pages[page].requireMe || id === this._getMeId()) {
                    try {
                        person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/this._platformCache.getDefaultMeContact();
                    } catch (err) {
                        Jx.log.exception("People.CpMain._onNavigate: failed to get ME contact.", err);
                    }
                } else if (id && parsedData && parsedData.extendedData) {
                    try {
                        // If we have extended data along with the id, this means we have been launched through the ShowContact
                        // system Action. We'll try to load the person from the id that's passed to us, and if that fails, we'll
                        // use the extended data as a "backup" and switch over to the AddContact system Action code path.
                        person = this._getPersonById(id);
                        if (!Jx.isObject(person)) {
                            // Contact not found, load person from the data that's passed to us
                            person = this._loadPersonFromParsedData(parsedData);
                        }
                    } catch (err) {
                        Jx.log.exception("People.CpMain._onNavigate: failed to load person with id " + id, err);
                    }
                } else if (id) {
                    try {
                        person = this._getPersonById(id);
                        if (!Jx.isObject(person)) {
                            Jx.log.error("People.CpMain._onNavigate: failed to load person with id " + id);
                        }
                    } catch (err) {
                        Jx.log.exception("People.CpMain._onNavigate: failed to load person with id " + id, err);
                    }
                } else if (parsedData && (parsedData.name || parsedData.email || parsedData.extendedData)) {
                    person = this._loadPersonFromParsedData(parsedData);
                }

                // When the person is just deleted, the person object is still valid but its linked contacts count is zero.
                if (!Jx.isObject(person) || person.linkedContacts.count === 0) {
                    // If we fail to load the person, fall back to the address book page.
                    // There're several cases for this condition:
                    // 1. The provided person id is invalid.
                    // 2. When activated from protocol handler, this gets called before the activation handler is called.
                    //    Thus it's possible that we don't get an "id" (thus person is null) at this point. In this case, we
                    //    will eventually be navigated to the correct page.
                    person = null;
                    redirectNav = true;
                }

                if (person) {
                    this._startWatchingForDelete(person);
                }
            } else {
                Jx.log.info("People.CpMain._onNavigate: page=" + page);
                Jx.log.pii("People.CpMain._onNavigate(cont): data=" + rawData);
            }

            if ([N.Pages.notification.id, N.Pages.viewme.id].indexOf(page) >= 0) {
                // Clear the app tile when navigating to the me page.
                P.AppTile.pushTiles(this.getPlatform());
            }

            if (!redirectNav) {
                this._logEtwActivationEnd();
                _markStart("ControlLoad");
                this._loadControl(page, pageKeyObject, person, parsedData, loc);
                _markStop("ControlLoad");
            } else {
                this._fallbackOnFail(loc);
            }
        } finally {
            this._content.trackNavEnd(page);
        }
    };

    P.CpMain.prototype._loadPersonFromParsedData = function (parsedData) {
        var account = null;
        var id = "";
        var accountManager = this.getPlatform().accountManager;
        try {
            if (parsedData.extendedData && parsedData.extendedData.accountId) {
                id = parsedData.extendedData.accountId;
                if (Jx.isNonEmptyString(id)) {
                    account = accountManager.loadAccount(id);
                }
            } else {
                id = parsedData.objectSourceId;
                if (Jx.isNonEmptyString(id)) {
                    account = accountManager.getAccountBySourceId(id, "");
                }
            }
        } catch (ex) {
            Jx.log.exception("People.CpMain._onNavigate: failed to load account " + id, ex);
        }

        var person = /*@static_cast(Microsoft.WindowsLive.Platform.Person)*/this.getPlatform().peopleManager.createTemporaryPerson(
            account, {
                firstName: parsedData.name || "",
                yomiFirstName: parsedData.yomiName || "",
                emailAddress: parsedData.email || "",
                thirdPartyObjectId: parsedData.objectId || "",
                userTileUri: parsedData.largeUserTile || parsedData.userTile || ""
            }
        );
        if (parsedData.extendedData) {
            // If the parsedData has extendedData, it means we've been launched through the ShowPerson or AddPerson Action.
            // So, we want to populate all the information that was passed in the launch args on this person. Since the
            // createTemporaryPerson function does not allow us to create a person with all this data, we'll just load
            // it into the temporary person's first linked contact ourselves.
            var contact = person.linkedContacts.item(0);
            contact.firstName = parsedData.extendedData.firstName || "";
            contact.lastName = parsedData.extendedData.lastName || "";
            contact.middleName = parsedData.extendedData.middleName || "";
            contact.title = parsedData.extendedData.title || "";
            contact.suffix = parsedData.extendedData.suffix || "";
            contact.yomiFirstName = parsedData.extendedData.yomiFirstName || "";
            contact.yomiLastName = parsedData.extendedData.yomiLastName || "";
            contact.notes = parsedData.extendedData.notes || "";
            contact.webSite = parsedData.extendedData.webSite || "";
            contact.significantOther = parsedData.extendedData.significantOther || "";
            contact.homePhoneNumber = parsedData.extendedData.homePhoneNumber || "";
            contact.home2PhoneNumber = parsedData.extendedData.home2PhoneNumber || "";
            contact.mobilePhoneNumber = parsedData.extendedData.mobilePhoneNumber || "";
            contact.mobile2PhoneNumber = parsedData.extendedData.mobile2PhoneNumber || "";
            contact.businessPhoneNumber = parsedData.extendedData.businessPhoneNumber || "";
            contact.business2PhoneNumber = parsedData.extendedData.business2PhoneNumber || "";
            contact.personalEmailAddress = parsedData.extendedData.personalEmailAddress || "";
            contact.businessEmailAddress = parsedData.extendedData.businessEmailAddress || "";
            contact.otherEmailAddress = parsedData.extendedData.otherEmailAddress || "";
            contact.companyName = parsedData.extendedData.companyName || "";
            contact.yomiCompanyName = parsedData.extendedData.yomiCompanyName || "";
            contact.officeLocation = parsedData.extendedData.officeLocation || "";
            contact.jobTitle = parsedData.extendedData.jobTitle || "";

            if (parsedData.extendedData.homeLocation) {
                contact.homeLocation = parsedData.extendedData.homeLocation;
            }

            if (parsedData.extendedData.businessLocation) {
                contact.businessLocation = parsedData.extendedData.businessLocation;
            }

            if (parsedData.extendedData.otherLocation) {
                contact.otherLocation = parsedData.extendedData.otherLocation;
            }
        }
        return person;
    }

    P.CpMain.prototype._fallbackOnFail = function (loc) {
        /// <summary>Navigation failure fallback</summary>
        /// <param name="loc" type="NavLocation">Destination location of the failed navigation</param>
        this._setNavigationCompleted();
        this._nav.fallbackOnFail(loc);
    };

    P.CpMain.prototype._loadControl = function (page, pageKeyObject, person, fields, loc) {
        /// <summary>Loads the control</summary>
        /// <param name="page" type="String">Identifier for the page</param>
        /// <param name="pageKeyObject" type="String">The query for allcontacts search.</param>
        /// <param name="person" type="Microsoft.WindowsLive.Platform.Person">Person to be loaded</param>
        /// <param name="fields" type="Object">The customized fields</param>
        /// <param name="loc" type="NavLocation">Location to be navigated to</param>

        // Setup content update before title update. This is needed to prevent contents shifting up/down during
        // navigation due to header size change.
        this._content.setupUpdate(page);
        this._header.setupUpdate(page);

        // Update content data before header so that frame commands are updated before rendered.
        var suspensionData = null;
        var suspensionState = null;
        if (this._initialLoad) {
            var resumedData = this._getResumedPageData(page);
            suspensionData = resumedData.data;
            suspensionState = resumedData.locationState;
        }

        var data = /*@static_cast(Object)*/pageKeyObject || /*@static_cast(Object)*/person;
        var contentUpdatePromise = this._content.update(page, data, fields, suspensionData, loc.state || suspensionState, loc.trigger);

        // Update header data
        var headerData = /*@static_cast(AnimationData)*/this._header.update(page, person, this._content.getControl(), fields);

        var connectedToData = this._getConnectedToAnimationData(page);

        this._setMessageBarVisibility(page);
        this.getCommandBar().load(N.Pages[this._currentPage].stickyAppbar ? true : false);
        this._scheduler.runVisibleJobsUntil(P.Priority.perfLowFidelity);
        var that = this;
        contentUpdatePromise.done(function (/*@type(AnimationData)*/contentData) {
            if (that._initialLoad) {
                that._initialLoad = false;
                that._execEnterPageAnimation(headerData, connectedToData, contentData, 0);
            } else {
                that._execExitEnterPageAnimation(headerData, connectedToData, contentData);
            }
        }, function (/*@dynamic*/err) {
            Debug.assert(!err.description || err.description !== "Cancelled",
                         "We don't expect to get cancelled and only expect legitimate errors");
            Jx.log.exception("CpContent loading", err);
            that._fallbackOnFail(loc);
        });

        // Don't waste time with background work until we have all the UI in place for the new page
        this._scheduler.setVisibleOnly(P.Priority.perfHighFidelity);
    };

    P.CpMain.prototype._getConnectedToAnimationData = function (page) {
        /// <summary>Returns animation data for the connected to component</summary>
        /// <param name="page" type="String" />
        /// <returns type="AnimationData"/>
        // update connectedTo display style
        var connectedToIsPopulated = this._connectedTo.isPopulated();
        var connectedToContainer = document.getElementById("idPeopleAppConnectedTo");
        var connectedToWasShowing = connectedToIsPopulated && !Jx.hasClass(connectedToContainer, "hidden");
        var connectedToIsShowing = connectedToIsPopulated && N.Pages[page].showConnectedTo;
        Jx.setClass(connectedToContainer, "hidden", !N.Pages[page].showConnectedTo);
        return {
            entering: (!connectedToWasShowing && connectedToIsShowing) ? [connectedToContainer] : [],
            exiting: (connectedToWasShowing && !connectedToIsShowing) ? [connectedToContainer] : []
        };
    };

    function invokeOn(action, /*@type(Array)*/animDatas) {
        animDatas.forEach(function (/*type(AnimationData)*/animData) {
            if (animData[action]) {
                Debug.assert(Jx.isFunction(animData[action]));
                animData[action]();
            }
        });
    }

    P.CpMain.prototype._execExitEnterPageAnimation = function (headerData, connectedToData, contentData) {
        /// <summary> Run exit page animation</summary>
        /// <param name="headerData" type="AnimationData" />
        /// <param name="connectedToData" type="AnimationData" />
        /// <param name="contentData" type="AnimationData" />
        _markStart("_execExitEnterPageAnimation:appFrameAnimation_exitPage");
        var that = this;
        var onExit = function (result) {
            return function () {
                _markStop("_execExitEnterPageAnimation:appFrameAnimation_exitPage");
                _markInfo("_execExitEnterPageAnimation_" + result);
                that._setNavigationCompleted();
                invokeOn("onExitComplete", [headerData, connectedToData, contentData]);
            };
        };
        var animElements = headerData.exiting.concat(connectedToData.exiting, contentData.exiting);
        ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
        P.Animation.exitPage(animElements).done(onExit("completed"), onExit("error"));
        this._execEnterPageAnimation(headerData, connectedToData, contentData, 80);
    };

    P.CpMain.prototype._execEnterPageAnimation = function (headerData, connectedToData, contentData, initialDelay) {
        /// <summary>Execute the enterPage animation</summary>
        /// <param name="headerData" type="AnimationData" />
        /// <param name="connectedToData" type="AnimationData" />
        /// <param name="contentData" type="AnimationData" />
        /// <param name="initialDelay" type="Number" />
        Jx.log.info("execEnterPageAnimation");
        _markStart("_execEnterPageAnimation:appFrameAnimation_enterPage");
        var that = this;
        var onEnterComplete = function (result) {
            return function () {
                that._setNavigationCompleted();
                invokeOn("onEnterComplete", [headerData, connectedToData, contentData]);
                _markStop("_execEnterPageAnimation:appFrameAnimation_enterPage");
                _markInfo("_execEnterPageAnimation_" + result);
            };
        };
        var animElements = headerData.entering.concat(connectedToData.entering, contentData.entering);

        ///<disable>JS3092.DeclarePropertiesBeforeUse</disable>
        P.Animation.enterPage(animElements, null, initialDelay).done(onEnterComplete("completed"), onEnterComplete("error"));
    };

    P.CpMain.prototype._parseJSONData = function (rawData) {
        /// <summary>JSON parse the data. The rawData has been JSON parsed and unescaped.</summary>
        /// <param name="rawData" type="String">A string that represents an object which is JSON parsed and unescaped.</param>
        /// <returns type="Object"/>
        var data = null;
        if (rawData) {
            try {
                data = JSON.parse(unescape(rawData));
            } catch (err) {
                Jx.log.exception("People.CpMain._parseJSONdata: failed parse '" + rawData + "'.", err);
            }
        }
        return data;
    };

    P.CpMain.prototype.getHeader = function () {
        /// <summary>Returns the header object.</summary>
        /// <returns type="P.CpHeader"/>
        return this._header;
    };

    P.CpMain.prototype.getNavBar = function () {
        /// <summary>Returns the navigation bar</summary>
        /// <returns type="P.CpNavBar"/>
        Debug.assert(Jx.isObject(this._navbar));
        return this._navbar;
    };

    P.CpMain.prototype.getCommandBar = function () {
        /// <summary>Returns the app bar.</summary>
        /// <returns type="P.CpAppBar">The app bar.</returns>
        Debug.assert(Jx.isObject(this._appbar));
        return this._appbar;
    };

    P.CpMain.prototype.getFrameCommands = function () {
        /// <summary>Returns the frame commands.</summary>
        /// <returns type="P.FrameCommands">The frame commands.</returns>
        return this.getHeader().getFrameCommands();
    };

    P.CpMain.prototype.getMessageBar = function () {
        /// <summary>Returns the global messagebar object.</summary>
        /// <returns type="Chat.MessageBar">The global messagebar object.</returns>
        this._ensureMessageBar(false);
        return this._messageBar;
    };

    P.CpMain.prototype._ensureMessageBar = function (ensureVisibility) {
        /// <summary>Creates the message bar if it doesn't exist</summary>
        /// <param name="ensureVisibility" type="Boolean" />
        if (!this._messageBar) {
            // If we don't have a message bar, create it
            $include("$(messageBarResources)/css/messagebar.css");
            var messageBar = this._messageBar = new Chat.MessageBar(10);

            var isLiveDemo = Jx.appData.localSettings().get("LiveDemoMode") || false;
            if (!isLiveDemo) {
                // And initialize the presenters
                var platform = this.getPlatform();
                Debug.assert(Jx.isObject(platform));

                var accountMessageBarPresenter = this._accountMessageBarPresenter = new Chat.AccountMessageBarPresenter();
                accountMessageBarPresenter.init(messageBar, platform, ApplicationScenario.people, "ab-messageBar");

                var authMessageBarPresenter = this._authMessageBarPresenter = new Chat.AuthMessageBarPresenter();
                authMessageBarPresenter.init(messageBar, platform, "ab-messageBar");

                var syncErrorMessageBarPresenter = this._syncMessageBarPresenter = new Chat.SyncMessageBarPresenter();
                syncErrorMessageBarPresenter.init(messageBar, platform, ApplicationScenario.people, "ab-messageBar");

               var proxyAuthenticator = this._proxyAuthenticator = new Chat.ProxyAuthenticator();
               proxyAuthenticator.init(platform, ApplicationScenario.mail);
            }

            // Assuming we have already navigated to a page, show or hide the bar appropriately
            var page = this._currentPage;
            if (ensureVisibility && Jx.isNonEmptyString(page)) {
                this._setMessageBarVisibility(page);
            }
        }
    };

    P.CpMain.prototype.hideMessageBar = function () {
        var messageBar = this._messageBar;
        if (messageBar) {
            messageBar.hide();
        }
    };

    P.CpMain.prototype.unhideMessageBar = function () {
        /// <summary> Only unhides the message bar if the page should show it.</summary>
        this._setMessageBarVisibility(this._currentPage);
    };

    P.CpMain.prototype._setMessageBarVisibility = function (page) {
        /// <summary>Some pages hide the message bar and some show it.  This function handles doing that</summary>
        /// <param name="page" type="String">The current page (or the page being navigated to)</param>
        Debug.assert(Jx.isNonEmptyString(page));

        var messageBar = this._messageBar;
        if (messageBar) {
            if (N.Pages[page].showMessageBar) {
                messageBar.unhide();
            } else {
                messageBar.hide();
            }
        }
    };

    P.CpMain.prototype.hasNavbar = function () {
        var ret = false;
        // This can be called before the navigation happens in protocol or share activation.
        if (this._currentPage) {
            ret = (N.Pages[this._currentPage].blockNavbar) ? false : true;
        }
        return ret;
    };

    P.CpMain.prototype.hideAppBar = function () {
        this._appbar.hideAppBar();
    };

    P.CpMain.prototype.hideNavBar = function () {
        this._navbar.hideNavBar();
    };

    P.CpMain.prototype.canGoHome = function () {
        return (N.Pages[this._currentPage].stickyAppbar) ? false : true;
    };

    P.CpMain.prototype.goHome = function () {
        /// <summary>Go to the home position(beginning) of address book page.</summary>
        var loc = this._nav.getLocation();
        Debug.assert(Jx.isObject(loc));
        if (loc.page === this.homepage) {
            // If called from within address book page, let address book handle it.
            var addressbook = this._content.getAddressBookControl();
            Debug.assert(Jx.isObject(addressbook) && Jx.isFunction(addressbook.goHome));
            addressbook.goHome();

            // Set focus again to avoid focus sticking on the element that previously had it.
            this._content.setDefaultFocus();
        } else {
            // Otherwise, navigate to the address book page passing the 'pos' param.
            N.navigate(N.getViewAddressBookUri({ pos: "home" }));
        }
    };

    P.CpMain.prototype.navToPageOrScroll = function (page) {
        /// <summary>Navigate to the page if not already on it. Otherwise scroll to the beginning of the current page.</summary>
        /// <param name="page" type="String">Name of the page</param>
        var loc = this._nav.getLocation();
        Debug.assert(Jx.isObject(loc));
        if (loc.page === page) {
            this._content.scrollToBeginning();
            this._content.setDefaultFocus();
        } else {
            N.navigate(N.getUri(page, "", null));
        }
    };

    P.CpMain.convertProtocolPathToHash = function (path) {
        /// <summary>Get the page navigation Uri from the given path.</summary>
        /// <param name="path" type="String">The path specified in the protocol URI.</param>
        /// <returns type="String">The URI to navigate to in hash value.</returns>

        Jx.log.pii("People.CpMain.convertProtocolPathToHash: protocol path=" + path);
        var uri = null;

        if (Jx.debug) {
            // Test hook to reset the nav location and backstack so we start clean. "wlpeople:reset".
            var tokens = path.split(",", 1);
            var pageName = unescape(tokens[0]).toLowerCase();
            if (pageName === "reset") {
                P.CpMain.reset();
                uri = N.getViewAddressBookUri(null);
            }
        }

        if (!uri) {
            uri = N.convertProtocolPathToHash(path);
        }

        Jx.log.pii("People.CpMain.convertProtocolPathToHash: uri hash=" + uri);
        return uri;
    };

    P.CpMain.reset = function () {
        /// <summary>reset the nav location and backstack so we start clean</summary>
        Jx.log.info("People.CpMain.reset");
        Debug.assert(Jx.appData);
        P.CpMain._clearSessionData();
        P.CpContent.clearControlState();
    };

    P.CpMain.prototype._startWatchingForDelete = function (platformPerson) {
        /// <summary>Watches the provided person object for deletion, and navigates back if it happens</summary>
        /// <param name="platformPerson" type="Microsoft.WindowsLive.Platform.Person"/>
        Debug.assert(Jx.isObject(platformPerson));

        var binder = this._binder = new P.PlatformObjectBinder(platformPerson);
        var person = this._person = /*@static_cast(People.PersonAccessor)*/binder.createAccessor(this._personUpdated.bind(this));
        if (isDeleted(person)) {
            this._stopWatchingForDelete();
        }
    };

    P.CpMain.prototype._personUpdated = function () {
        /// <summary>Called when anything accessed by isDelete changes</summary>
        if (isDeleted(this._person)) {
            this._stopWatchingForDelete();
            if (this._nav.canGoBack()) {
                this._nav.back();
            } else {
                this._nav.go();
            }
        }
    };

    P.CpMain.prototype._stopWatchingForDelete = function () {
        /// <summary>Stops watching the person object for deletion</summary>
        Jx.dispose(this._binder);
        this._binder = null;
        this._person = null;
    };

    P.CpMain.prototype.zoomChanged = function (isZoomedOut) {
        Jx.setClass(this.getRootElem(), "inZoomedOutView", isZoomedOut);
        if (isZoomedOut) {
            this.hideMessageBar();
        } else {
            this.unhideMessageBar();
        }
    };

    function isDeleted(person) {
        /// <param name="person" type="P.PersonAccessor"/>
        /// <returns type="Boolean">true if the person has been deleted</returns>
        Debug.assert(Jx.isObject(person));

        return person.linkedContacts.length === 0;
    }

});
