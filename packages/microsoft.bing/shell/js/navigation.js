/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='../../common/js/asyncoperations.js' />
/// <reference path='../../common/js/eventsource.js' />
/// <reference path='servicelocator.js' />
/// <reference path='viewmanagement.js' />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements asynchronous operation for loading object from JSON file.
    /// </summary>
    var NavigationOperation = WinJS.Class.derive(
        BingApp.Classes.AsyncOperation,
        function constructor() {
            /// <summary>
            /// Creates a NavigationOperation object that implements asynchronous operation for
            /// navigating to specific uri.
            /// </summary>
            /// <returns>
            /// NavigationOperation instance.
            /// </returns>
            BingApp.Classes.AsyncOperation.call(this, "NavigationOperation");
        },
        {
            matchOptions: function (options1, options2) {
                /// <summary>
                /// This method is called to compare two options objects.
                /// </summary>
                /// <param name="options1">
                /// First option object.
                /// </param>
                /// <param name="options2">
                /// Second option object to compare to.
                /// </param>
                /// <returns type="Boolean">
                /// True to indicate that passed options objects match; otherwise, false.
                /// </returns>
                var uri1 = this._getUriFromOptions(options1);
                var uri2 = this._getUriFromOptions(options2);
                return uri1.equals(uri2);
            },
            handleStart: function (options) {
                /// <summary>
                /// This method is called before starting operation execution.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                var uri = this._getUriFromOptions(options);
                BingApp.traceInfo("NavigationOperation.handleStart: started navigation to {0}.", uri.absoluteUri);
            },
            handleExecute: function (options) {
                /// <summary>
                /// This method is called to execute operation.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A Promise that will complete when operation is executed.
                /// </returns>
                var uri = this._getUriFromOptions(options);
                var navigationManager = this._getNavigationManagerFromOptions(options);
                var viewManager = this._getViewManagerFromOptions(options);
                var that = this;

                // Return promise that chains loading of all views into app UI
                return new WinJS.Promise(
                    function init(complete, error) {
                        // Indicate that we will start loading views from the root
                        viewManager.reset();

                        // Combine host and path and extract individual elements separated by slash;
                        // then iterate over elements starting from first and try to find matches
                        // inside mappings array; if match is found then ask view manager to load
                        // corresponding view; continue with iteration and load any layered views.
                        var promise;
                        var fullPath = (uri.host ? uri.host : "") + (uri.path ? uri.path : "");
                        var elements = fullPath.split("/");
                        var elementsCount = elements.length;
                        var analyzedPath;

                        BingApp.traceInfo("NavigationOperation.handleExecute: analyzing combined path '{0}' (broken down in {1} elements).", fullPath, elements.length);

                        for (var indexElement = 0; indexElement < elementsCount; indexElement++) {
                            var element = elements[indexElement];
                            analyzedPath = analyzedPath ? analyzedPath + "/" + element : element;
                            var mapping = navigationManager.findMapping(analyzedPath);
                            if (mapping) {
                                var viewId = mapping.viewId;
                                BingApp.traceInfo("NavigationOperation.handleExecute: found match for '{0}' subpath. '{1}' view will be loaded.", analyzedPath, viewId);

                                // Ensure that loading of layered view does not start until parent view is loaded.
                                // IMPORTANT:   Chained promises will execute asynchronously so we have to take 
                                ///             extra care to ensure that passed variable identifying viewId is 
                                ///             enclosed in its own scope; otherwise, we will run into a problem
                                ///             due to the fact that viewId value is being changed in loop.
                                promise = promise ?
                                    promise.then((function () {
                                        var viewIdInClosure = viewId;
                                        return function () {
                                            return viewManager.load(viewIdInClosure);
                                        };
                                    })(), error) :
                                    viewManager.load(viewId);
                            } else {
                                BingApp.traceInfo("NavigationOperation.handleExecute: no match for '{0}' subpath.", analyzedPath);
                            }
                        }

                        // Wait until the chained promise is completed and then return
                        if (promise) {
                            promise.done(complete, error);
                        } else {
                            BingApp.traceError("NavigationOperation.handleExecute: failed to find view match for '{0}'.", fullPath);
                            error(new BingApp.Classes.ErrorNavigationPath(fullPath));
                        }
                    });
            },
            handleComplete: function (options, result, canceled, error) {
                /// <summary>
                /// This method is called right after operation execution is completed.
                /// </summary>
                /// <param name="options">
                /// Options object that can have additional information required to execute operation.
                /// </param>
                /// <param name="result">
                /// Result of operation. It will be undefined if operation was cancelled or completed
                /// with error.
                /// </param>
                /// <param name="canceled">
                /// Indicates whether the operation was cancelled.
                /// </param>
                /// <param name="error">
                /// Error object if operation was completed with error. It will be undefined if operation
                /// completed successfully.
                /// </param>
                var uri = this._getUriFromOptions(options);
                if (error) {
                    BingApp.traceInfo("NavigationOperation.handleComplete: navigation to {0} failed with error '{1}'.", uri.absoluteUri, error.message);
                } else if (canceled) {
                    BingApp.traceInfo("NavigationOperation.handleComplete: navigation to {0} was cancelled.", uri.absoluteUri);
                } else {
                    BingApp.traceInfo("NavigationOperation.handleComplete: navigation to {0} completed successfully.", uri.absoluteUri);
                }
            },
            _getUriFromOptions: function (options) {
                /// <summary>
                /// Extracts navigation Uri from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains navigation uri information.
                /// </param>
                /// <returns>
                /// Navigation Uri stored in options object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var uri = options.uri;
                if (BingApp.Utilities.isNullOrUndefined(uri)) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return uri;
            },
            _getNavigationManagerFromOptions: function (options) {
                /// <summary>
                /// Extracts reference to navigation manager from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains reference to navigation manager.
                /// </param>
                /// <returns type="BingApp.Classes.NavigationManager">
                /// Navigation manager reference stored in options object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var manager = options.navigationManager;
                if (!manager) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return manager;
            },
            _getViewManagerFromOptions: function (options) {
                /// <summary>
                /// Extracts reference to view manager from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains reference to view manager.
                /// </param>
                /// <returns type="BingApp.Classes.ViewManager">
                /// View manager reference stored in options object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var manager = options.viewManager;
                if (!manager) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return manager;
            }
        });

    /// <summary>
    /// All possible states for navigation.
    /// </summary>
    var navigationStatus = Object.freeze({
        idle: 0, // identifies normal state when navigation is either completed with fully loaded content or did not start yet
        navigating: 1, // identifies navigation state, it happens in between of navigationStarted and navigationCompleted events
    });

    /// <summary>
    /// All possible states for content.
    /// </summary>
    var contentStatus = Object.freeze({
        empty: 0, // indicates that content has not been loaded yet
        loading: 1, // indicates that content is in the process of being loaded
        loaded: 2, // indicates that content was successfully loaded
        failed: 3, // indicates that content failed to load due to error
        canceled: 4, // indicates that content failed to load due to cancellation
    });

    /// <summary>
    /// Events raised by navigation manager.
    /// </summary>
    var events = Object.freeze({
        navigationStarted: "navigation:started",
        navigationCompleted: "navigation:completed",
        contentLoaded: "navigation:contentLoaded",
    });

    /// <summary>
    /// Global value indicating the maximum number of entries stored in navigation history.
    /// </summary>
    /// <remarks>
    /// REVIEW: shall we make it configurable via env.configuration.json?
    /// </remarks>
    var maxHistoryLength = 50;

    /// <summary>
    /// Defines class that will handle navigation inside the application.
    /// </summary>
    var NavigationManager = WinJS.Class.derive(
        BingApp.Classes.EventSource,
        function constructor(mappingsSourceLocation) {
            /// <summary>
            /// Initializes a new instance of BingApp.Classes.NavigationManager class.
            /// </summary>
            /// <param name="mappingsSourceLocation" optional="true">
            /// Location of JSON file that contains navigation mappings. If this parameter is not
            /// specified then mappings have to be assigned explicitly using setMappings() method.
            /// </param>
            /// <returns type="BingApp.Classes.NavigationManager">
            /// NavigationManager instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.NavigationManager)) {
                BingApp.traceWarning("NavigationManager.ctor: Attempted using NavigationManager ctor as function; redirecting to use 'new NavigationManager()'.");
                return new BingApp.Classes.NavigationManager(mappingsSourceLocation);
            }

            BingApp.Classes.EventSource.call(this);

            // Private properties defined on object level
            Object.defineProperties(this, {
                // This property contains array of Uris representing navigation history
                // journaled by navigation manager.
                navigationHistory: { value: [], writable: false, enumerable: false, configurable: false },
                // This property references object responsible for navigating to specific
                // navigation Uri.
                navigationOperation: { value: new NavigationOperation(), writable: false, enumerable: false, configurable: false },
                // This property will store navigation uri that is subject of most recent
                // navigation operation.
                currentUri: { writable: true, enumerable: false, configurable: true },
                // This property references Promise object that completes when current 
                // navigation operation is done.
                currentNavigation: { writable: true, enumerable: false, configurable: true },
                // This property will store options specified for current navigation operation
                currentOptions: { writable: true, enumerable: false, configurable: true },
                // This property will store the current state of navigation.
                currentNavigationStatus: { value: navigationStatus.idle, writable: true, enumerable: false, configurable: false },
                // This property will store the current state of content.
                currentContentStatus: { value: contentStatus.empty, writable: true, enumerable: false, configurable: false },
                // This property indicates whether navigation cancellation is executed in "quick" 
                // mode which will skip restoring UI state of the application to the last journaled
                // navigation Uri.
                rollbackToLastLoadedNavigationUriOnCancel: { value: true, writable: true, enumerable: false, configurable: false },
                // This property references object responsible for loading mappings from 
                // external source.
                loadMappingsOperation: { value: new BingApp.Classes.LoadJsonOperation(), writable: false, enumerable: false, configurable: false },
                // This property stores array of navigation mappings entries
                mappings: { writable: true, enumerable: false, configurable: false },
            });

            if (mappingsSourceLocation) {
                this._loadMappings(mappingsSourceLocation);
            }
        },
        {
            navigateTo: function (uri, options) {
                /// <summary>
                /// Resolves given navigation uri and loads application UI into the
                /// corresponding state.
                /// </summary>
                /// <param name="uri">
                /// Uri representing application UI state.
                /// </param>
                /// <param name="options" optional="true">
                /// Object which contains options passed with navigation operation. This is 
                /// optional argument and if provided it will be passed to view controller's
                /// setNavigationUri() method.
                /// </param>
                /// <returns>
                /// A promise object that can be used to track the completion of asynchronous
                /// navigation operation.
                /// </returns>
                if (typeof uri === "string") {
                    uri = new Windows.Foundation.Uri(uri);
                }

                if (!uri) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("uri");
                }

                // Check current state: new navigation operation will commence if:
                // 1) given Uri is different from the current one;
                // 2) given options are different from the current ones;
                // 3) content failed to load
                if (!this.currentUri || !this.currentUri.equals(uri) ||
                    !this._areSameOptions(this.currentOptions, options) ||
                    this.currentContentStatus === contentStatus.failed || this.currentContentStatus === contentStatus.canceled) {
                    // This method is called before embarking on handling another navigation request.
                    // Specify flag indicating that we want speedy cancellation which will skip
                    // attempt at restoring UI state of the application to the Uri corresponding to 
                    // the last completed navigation operation.
                    this.cancelNavigation(false);

                    // Mark given uri as current 
                    this.currentUri = uri;
                    this.currentOptions = options;

                    var that = this;
                    this.currentNavigation = new WinJS.Promise(
                        function init(complete, error) {
                            that._ready().done(function () {
                                that.notifyNavigationStarted(uri);
                                that.navigationOperation.run({ uri: uri, navigationManager: that, viewManager: BingApp.locator.viewManager }).done(
                                    function onComplete() {
                                        that.notifyNavigationCompleted(uri, null, false);
                                        complete();
                                    },
                                    function onError(err) {
                                        if (BingApp.Utilities.isPromiseCancellationError(err)) {
                                            that.notifyNavigationCompleted(uri, null, true);
                                        } else {
                                            that.notifyNavigationCompleted(uri, err, false);
                                        }
                                        error(err);
                                    });
                            },
                            error);
                        },
                        function cancel() {
                            that.navigationOperation.cancel();
                        });

                    return this.currentNavigation;
                } else {
                    // Check if navigation is still in progress
                    if (this.navigationOperation.isRunning()) {
                        BingApp.traceInfo(
                            "NavigationManager.navigateTo: app is already in the process of navigating to {0}. Returning reference to active navigation operation.",
                            uri.absoluteUri);
                        return this.currentNavigation;
                    } else {
                        BingApp.traceInfo("NavigationManager.navigateTo: app is already in the UI state corresponding to {0}.", uri.absoluteUri);
                        // Return Promise that will complete immediately
                        return WinJS.Promise.as();
                    }
                }
            },
            cancelNavigation: function (rollback) {
                /// <summary>
                /// Cancels the currently running navigation operation.
                /// </summary>
                /// <param name="rollback" optional="true" type="Boolean">
                /// A flag indicating whether navigation manager should attempt navigating to the 
                /// Uri that corresponds to the last completed navigation as a result of cancellation.
                /// </param>
                this.rollbackToLastLoadedNavigationUriOnCancel = rollback;

                if (this.currentNavigationStatus === navigationStatus.navigating) {
                    if (this.navigationOperation.isRunning()) {
                        this.navigationOperation.cancel();
                    } else {
                        // Navigation has been initiated and being handled internally; generate 
                        // notification indicating involuntary cancellation of navigation.
                        this.notifyNavigationCompleted(this.currentUri, null, true);
                    }
                } else if (this.currentContentStatus === contentStatus.loading) {
                    // Navigation has been completed but content is still being loaded; 
                    // generate notification indicating involuntary cancellation of 
                    // content loading.
                    this.notifyContentLoaded(null, true);
                }

                this.rollbackToLastLoadedNavigationUriOnCancel = true;
            },
            goBack: function (options) {
                /// <summary>
                /// Navigates to previous location in navigation history.
                /// </summary>
                /// <param name="options" optional="true">
                /// Object which contains options passed with navigation operation. This is 
                /// optional argument and if provided it will be passed to view controller's
                /// setNavigationUri() method.
                /// </param>
                /// <returns>
                /// Promise object that can be used to track the completion of asynchronous
                /// navigation operation.
                /// </returns>

                // BUGBUG:  Note that the current implementation does not keep "forward" history.
                //          I.e. when goBack is called we remove the history for current navigation
                //          location. That has an unfortunate consequence: if .cancel() is called on
                //          Promise returned by goBack method then it will not restore history to
                //          its previous state and will not navigate to Uri that was current when
                //          goBack was called.
                //          Currently we do not have any scenarios for supporting "forward" history,
                //          however it might make sense to implement it to ensure integrity and
                //          predictability of NavigationManager api.
                if (this.navigationHistory.length > 1) {
                    // Determine navigation Uri to navigate to and update navigation history
                    var uri = this.navigationHistory.splice(this.navigationHistory.length - 2, 2)[0];

                    BingApp.traceInfo("NavigationManager.goBack: will navigate to {0}.", uri.absoluteUri);

                    return this.navigateTo(uri, options);
                } else {
                    BingApp.traceError(
                        "NavigationManager.goBack: cannot proceed because navigation history {0}.",
                        this.navigationHistory.length === 0 ? "has no entries" : "has only one entry");
                    return WinJS.Promise.as();
                }
            },
            canGoBack: function () {
                /// <summary>
                /// Determines whether there is navigation history that can be navigated back.
                /// </summary>
                /// <returns>
                /// <b>true</b> to indicate that goBack() can be executed; otherwise, <b>false</b>.
                /// </returns>
                return this.navigationHistory.length > 1;
            },
            getMaxHistoryLength: function () {
                /// <summary>
                /// Gets the maximum number of entries that can be stored in navigation history.
                /// </summary>
                /// <returns type="Number">
                /// Maximum number of entries that can be stored in navigation history.
                /// </returns>
                return maxHistoryLength;
            },
            refresh: function () {
                /// <summary>
                /// Refreshes the application UI.
                /// </summary>
                /// <returns>
                /// Promise object that completes when refresh operation is over.
                /// </returns>
                if (this.navigationOperation.isRunning()) {
                    return this.currentNavigation;
                } else {
                    var uri = this.currentUri;
                    var options = this.currentOptions;
                    if (uri) {
                        this.currentUri = null;
                        this.currentOptions = null;
                        return this.navigateTo(uri, options);
                    } else {
                        return WinJS.Promise.as();
                    }
                }
            },
            notifyNavigationStarted: function (uri) {
                /// <summary>
                /// This method should be called to indicate that application started navigating 
                /// to given uri.
                /// </summary>
                /// <param name="uri">
                /// New navigation Uri.
                /// </param>
                if (typeof uri === "string") {
                    uri = new Windows.Foundation.Uri(uri);
                }

                if (!uri) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("uri");
                }

                if (this.currentNavigationStatus !== navigationStatus.idle || this.currentContentStatus === contentStatus.loading) {
                    throw new BingApp.Classes.ErrorInvalidOperation(
                        "notifyNavigationStarted", 
                        WinJS.Resources.getString("error_navigation_started_called_from_invalid_state").value);
                }

                this.currentUri = uri;
                this.currentNavigationStatus = navigationStatus.navigating;
                this.currentContentStatus = contentStatus.loading;

                BingApp.tracePerf("Framework:Navigation:Start");

                BingApp.traceInfo("NavigationManager.notifyNavigationStarted: setting navigation manager into 'navigating' state and raising '{0}' event.", events.navigationStarted);

                this.fireEvent(events.navigationStarted, { uri: uri });
            },
            notifyNavigationCompleted: function (uri, error, canceled) {
                /// <summary>
                /// This method should be called to indicate the result of completing current 
                /// navigation operation.
                /// </summary>
                /// <param name="uri">
                /// Navigation Uri. Note that this could be different from the Uri that was specified 
                /// when navigationStarted was called.
                /// </param>
                /// <param name="error" optional="true" type="Error">
                /// Error object if navigation was completed with error. It will be null or undefined 
                /// if operation completed successfully.
                /// </param>
                /// <param name="canceled" optional="true" type="Boolean">
                /// Indicates whether the navigation was cancelled.
                /// </param>
                if (this.currentNavigationStatus !== navigationStatus.navigating) {
                    throw new BingApp.Classes.ErrorInvalidOperation(
                        "notifyNavigationCompleted",
                        WinJS.Resources.getString("error_navigation_completed_called_before_started").value);
                }

                if (typeof uri === "string") {
                    uri = new Windows.Foundation.Uri(uri);
                }

                if (!uri) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("uri");
                }

                this.currentNavigationStatus = navigationStatus.idle;

                if (!error && !canceled) {
                    BingApp.tracePerf("Framework:Navigation:End:Succeeded");

                    // Store the Uri passed as argument. Note that it could be different from the 
                    // Uri specified in notifyNavigationStarted method. This will be the case if 
                    // view displaying content did internal redirection.
                    this.currentUri = uri;

                    // Store navigation Uri in history upon successful completion of
                    // navigation operation.
                    // IMPORTANT:   It is possible that currentUri matches the last uri stored in
                    //              navigation history. That would be the case if app was in process
                    //              of navigating to some Uri and it was not complete at the time
                    //              current navigation request was received. We need to check the
                    //              last entry in navigation history and add currentUri entry only
                    //              if it is different.
                    if (!BingApp.Utilities.isNullOrUndefined(this.currentUri)) {
                        var historyLength = this.navigationHistory.length;
                        var lastUri = historyLength > 0 ? this.navigationHistory[historyLength - 1] : null;
                        if (lastUri === null || !this.currentUri.equals(lastUri)) {
                            BingApp.traceInfo("NavigationManager.notifyNavigationCompleted: storing {0} in navigation history.", this.currentUri.absoluteUri);
                            // Check if maximum number of entries in history has been reached; 
                            // if so then remove the first entry.
                            if (historyLength === this.getMaxHistoryLength()) {
                                var removedEntry = this.navigationHistory.shift();
                                BingApp.traceInfo(
                                    "NavigationManager.notifyNavigationCompleted: maximum number of '{0}' entries in navigation history has been reached. Removing entry '{1}'.",
                                    historyLength,
                                    removedEntry.absoluteUri);
                            }
                            this.navigationHistory.push(this.currentUri);
                        }
                    }
                } else {
                    // Reset .currentUri to null; if appropriate it will be set to previous navigated uri
                    this.currentUri = null;
                    this.currentOptions = null;

                    this.currentContentStatus = contentStatus.empty;

                    if (canceled) {
                        BingApp.tracePerf("Framework:Navigation:End:Cancelled");

                        // Navigation cancellation can be handled in "quick" and "full recovery" modes.
                        // In "quick" mode we will not attempt rolling back the UI to the last known
                        // good state which corresponds to the last stored entry in navigation history.
                        // This mode makes sense when another navigation request is about to be processed
                        // immediately after cancellation.
                        if (!this.rollbackToLastLoadedNavigationUriOnCancel) {
                            BingApp.traceInfo("NavigationManager.notifyNavigationCompleted: operation cancelled as a result of new navigation request. Using 'quick' cancellation mode.");
                        } else if (this.navigationHistory.length > 0) {
                            var previousUri = this.navigationHistory.pop();
                            BingApp.traceInfo(
                                "NavigationManager.notifyNavigationCompleted: operation cancelled. Application will rollback to last known navigation Uri: {0}.",
                                previousUri.absoluteUri);
                            this.navigateTo(previousUri);
                        } else {
                            BingApp.traceInfo("NavigationManager.notifyNavigationCompleted: operation cancelled.");
                        }
                    } else {
                        BingApp.tracePerf("Framework:Navigation:End:Failed");
                    }
                }

                BingApp.traceInfo("NavigationManager.notifyNavigationCompleted: setting navigation manager into 'idle' state and raising '{0}' event.", events.navigationCompleted);

                this.fireEvent(events.navigationCompleted, { uri: uri, error: error, canceled: canceled });
            },
            notifyContentLoaded: function (error, canceled) {
                /// <summary>
                /// This method should be called to indicate that UI endpoint that was most recently
                /// navigated to is loaded and ready for user interaction.
                /// </summary>
                /// <param name="error" optional="true" type="Error">
                /// Error object if content loading was completed with error. It will be null or undefined if
                /// content loading completed successfully.
                /// </param>
                /// <param name="canceled" optional="true" type="Boolean">
                /// Indicates whether the content loading was aborted.
                /// </param>
                if (this.currentContentStatus !== contentStatus.loading) {
                    throw new BingApp.Classes.ErrorInvalidOperation(
                        "notifyContentLoaded",
                        WinJS.Resources.getString("error_content_loaded_called_from_invalid_state").value);
                }

                if (error) {
                    BingApp.traceError("NavigationManager.notifyContentLoaded: content loading completed with error: '{0}'", error.message);
                    this.currentContentStatus = contentStatus.failed;
                } else if (canceled) {
                    BingApp.traceInfo("NavigationManager.notifyContentLoaded: content loading completed with cancellation.");
                    this.currentContentStatus = contentStatus.canceled;
                } else {
                    BingApp.traceInfo("NavigationManager.notifyContentLoaded: content loading completed successfully.");
                    this.currentContentStatus = contentStatus.loaded;
                }

                BingApp.traceInfo("NavigationManager.notifyContentLoaded: setting navigation manager into 'idle' state and raising '{0}' event.", events.contentLoaded);

                this.fireEvent(events.contentLoaded, { error: error, canceled: canceled });
            },
            getCurrentUri: function () {
                /// <summary>
                /// Gets navigation Uri that was most recently navigated to.
                /// </summary>
                /// <returns>
                /// Uri that was given to the most recent call to navigateTo method.
                /// </returns>
                return this.currentUri;
            },
            getCurrentOptions: function () {
                /// <summary>
                /// Gets navigation options specified for the most recentl navigation operation.
                /// </summary>
                /// <returns>
                /// Options object that was given to the most recent call to navigateTo method.
                /// </returns>
                return this.currentOptions;
            },
            getCurrentNavigationStatus: function () {
                /// <summary>
                /// Gets the current state of navigation manager.
                /// </summary>
                /// <returns>
                /// Number which corresponds to one of the states exposed via 
                /// BingApp.Classes.NavigationManager.states member.
                /// </returns>
                return this.currentNavigationStatus;
            },
            getCurrentContentStatus: function () {
                /// <summary>
                /// Gets the current status for loaded content.
                /// </summary>
                /// <returns>
                /// Number which corresponds to one of the states exposed via 
                /// BingApp.Classes.NavigationManager.contentStatus member.
                /// </returns>
                return this.currentContentStatus;
            },
            setMappings: function (mappings) {
                /// <summary>
                /// Sets array of navigation mappings used in resolving navigation Uri.
                /// </summary>
                /// <param name="mappings">
                /// Array of navigation mappings.
                /// </param>
                BingApp.traceInfo("NavigationManager.setMappings: navigation mappings are set explicitly.");

                this.mappings = mappings;

                if (this.loadMappingsOperation.isRunning()) {
                    BingApp.traceWarning("NavigationManager.setMappings: called while app is in the middle of loading navigation mappings from external source. This loading operation will be cancelled.");
                    this.loadMappingsOperation.cancel();
                }
            },
            findMapping: function (path) {
                /// <summary>
                /// Searches array of mappings for entry that corresponds to given path string.
                /// </summary>
                /// <param name="path" type="String">
                /// Path string.
                /// </param>
                /// <returns>
                /// Mappings entry for given path.
                /// </returns>

                if (BingApp.Utilities.isNullOrUndefined(path)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("path");
                }

                if (this.mappings) {
                    // Ignore letter case when looking for path match. This is general good practice:
                    // http://stackoverflow.com/questions/1806181/why-should-i-convert-a-string-to-upper-case-when-comparing.
                    var mappingsCount = this.mappings.length;
                    for (var indexMapping = 0; indexMapping < mappingsCount; indexMapping++) {
                        var mapping = this.mappings[indexMapping];
                        // Note that we convert mappings path to upper case each time this
                        // method is called; this is not optimal but in this case acceptable
                        // because: a) mapping object might have this data as read-only
                        // (possible in "strict" mode); and b) mapping.path can be used in
                        // traces and it is better to keep it in original format for readability.
                        if (BingApp.Utilities.areEqualIgnoreCase(mapping.path, path)) {
                            return mapping;
                        }
                    }
                }

                return null;
            },
            _ready: function (callback, async) {
                /// <summary>
                /// Ensures that specified function executes only after mappings are loaded.
                /// </summary>
                /// <param name="callback" optional="true">
                /// A function that executes after mappings are loaded.
                /// </param>
                /// <param name="async" optional="true">
                /// If true, the callback should be executed asynchronously.
                /// </param>
                /// <returns>
                /// A promise that completes after mappings are loaded for this object.
                /// </returns>
                var that = this;
                return new WinJS.Promise(function init(complete, error) {
                    // This function will execute once mappings are loaded
                    function onMappingsLoaded() {
                        if (callback) {
                            try {
                                callback();
                            } catch (err) {
                                error(err);
                                return;
                            }
                        }
                        complete();
                    };

                    function onLoadingError(loadingErr) {
                        // Special case when operation cancelled as a result of explicitly setting mappings
                        if (that.mappings && BingApp.Utilities.isPromiseCancellationError(loadingErr)) {
                            onMappingsLoaded();
                        } else {
                            error(loadingErr);
                        }
                    };

                    if (that.loadMappingsOperation.isRunning()) {
                        // There is an active mappings loading operation - wait for it to finish
                        that.loadMappingsOperation.done(onMappingsLoaded, onLoadingError);
                    } else {
                        // Mappings are already loaded 
                        if (async) {
                            WinJS.Promise.timeout().done(onMappingsLoaded, onLoadingError);
                        } else {
                            onMappingsLoaded();
                        }
                    }
                });
            },
            _loadMappings: function (fileLocation) {
                /// <summary>
                /// Asyncronously loads the contents of JSON file at given location and store them
                /// as navigation mappings.
                /// </summary>
                /// <param name="fileLocation">
                /// Location of JSON file that contains navigation mappings.
                /// </param>
                /// <returns>
                /// A promise which completes when mappings are loaded from file at given location.
                /// </returns>
                var that = this;
                return this.loadMappingsOperation.run({ fileLocation: fileLocation }).then(function (result) {
                    // REVIEW:  We can optimize access to mappings by adding hash
                    //          property based on path. For now we have opted out
                    //          of adding additional code complexity because
                    //          performance gain would be negligible due to small
                    //          number of navigation mappings.
                    that.mappings = result;
                });
            },
            _areSameOptions: function (options1, options2) {
                /// <summary>
                /// Gets a value indicating whether given navigation options objects contain the same 
                /// properties with same values.
                /// </summary>
                /// <param name="options1">
                /// First navigation options object.
                /// </param>
                /// <param name="options2">
                /// Second navigation options object.
                /// </param>
                /// <returns>
                /// True if two options contain the same data; otherwise, false.
                /// </returns>
                if (options1 === options2) {
                    return true;
                }

                if (!options1) {
                    return !options2;
                } else if (!options2) {
                    return false;
                }

                var optionsAsString1;
                var optionsAsString2;
                try {
                    optionsAsString1 = JSON.stringify(options1);
                    optionsAsString2 = JSON.stringify(options2);
                } catch (e) {
                    BingApp.traceError("NavigationManager._areSameOptions: failed to compare options because of JSON.stringify failure: '{0}'. Assuming that options are different.", e.message);
                    return false;
                }

                return optionsAsString1 === optionsAsString2;
            },
        },
        {
            navigationStatus: navigationStatus,
            contentStatus: contentStatus,
            events: events,
        });

    // Expose NavigationManager class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        NavigationManager: NavigationManager
    });
})();
