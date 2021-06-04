/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='../../common/js/errors.js' />
/// <reference path='../../common/js/asyncoperations.js' />
/// <reference path='../../common/js/eventsource.js' />
/// <reference path='navigation.js' />
/// <reference path='servicelocator.js' />
/// <reference path='shell.js' />
(function () {
    "use strict";

    /// <summary>
    /// Defines class that implements asynchronous operation for loading view.
    /// </summary>
    var LoadViewOperation = WinJS.Class.derive(
        BingApp.Classes.AsyncOperation,
        function () {
            /// <summary>
            /// Creates a LoadViewOperation object that implements asynchronous operation for
            /// loading view based on its location.
            /// </summary>
            /// <returns>
            /// LoadViewOperation instance.
            /// </returns>
            BingApp.Classes.AsyncOperation.call(this, "LoadViewOperation");
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
                var location1 = this._getViewLocationFromOptions(options1);
                var location2 = this._getViewLocationFromOptions(options2);
                var host1 = this._getViewHostFromOptions(options1);
                var host2 = this._getViewHostFromOptions(options2);
                return location1 === location2 && host1 === host2;
            },
            handleStart: function (options) {
                /// <summary>
                /// This method is called before starting operation execution.
                /// </summary>
                /// <param name="options" optional="true">
                /// Optional options object that can have additional information required to
                /// execute operation.
                /// </param>
                var location = this._getViewLocationFromOptions(options);
                BingApp.tracePerf("LoadViewOperation.handleStart: started loading view from '{0}' location.", location);
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
                var location = this._getViewLocationFromOptions(options);
                var host = this._getViewHostFromOptions(options);

                return new WinJS.Promise(function init(complete, error) {
                    // Clean up existing host content
                    WinJS.Utilities.empty(host);

                    // Load view into host
                    WinJS.UI.Pages.render(location, host).done(complete, error);
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
                var location = this._getViewLocationFromOptions(options);
                if (error) {
                    BingApp.tracePerf("LoadViewOperation.handleComplete: failed to load view from '{0}' location; error - '{1}'.", location, error.message);
                } else if (canceled) {
                    BingApp.tracePerf("LoadViewOperation.handleComplete: cancelled loading of view from '{0}' location.", location);
                } else {
                    BingApp.tracePerf("LoadViewOperation.handleComplete: successfully loaded view from '{0}' location.", location);
                }
            },
            _getViewLocationFromOptions: function (options) {
                /// <summary>
                /// Extracts view location from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains view location string.
                /// </param>
                /// <returns type="String">
                /// View location stored in options object.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var location = options.location;
                if (BingApp.Utilities.isNullOrUndefined(location)) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return location;
            },
            _getViewHostFromOptions: function (options) {
                /// <summary>
                /// Extracts reference to view host element from given options object.
                /// </summary>
                /// <param name="options">
                /// Options object that contains reference to host element.
                /// </param>
                /// <returns>
                /// Element which will host loaded view.
                /// </returns>
                if (BingApp.Utilities.isNullOrUndefined(options)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("options");
                }

                var host = options.host;
                if (!host) {
                    throw new BingApp.Classes.ErrorArgument("options");
                }

                return host;
            }
        });

    /// <summary>
    /// Defines class that will handle view management inside the application.
    /// </summary>
    var ViewManager = WinJS.Class.derive(
        BingApp.Classes.EventSource,
        function (registrySourceLocation) {
            /// <summary>
            /// Initializes a new instance of BingApp.Classes.ViewManager class.
            /// </summary>
            /// <param name="registrySourceLocation" optional="true">
            /// Location of JSON file that contains registry information for all views.
            /// </param>
            /// <returns type="BingApp.Classes.ViewManager">
            /// ViewManager instance.
            /// </returns>
            if (!(this instanceof BingApp.Classes.ViewManager)) {
                BingApp.traceWarning("ViewManager.ctor: Attempted using ViewManager ctor as function; redirecting to use 'new ViewManager()'.");
                return new BingApp.Classes.ViewManager(registrySourceLocation);
            }

            BingApp.Classes.EventSource.call(this);

            // Private properties defined ob object level
            Object.defineProperties(this, {
                // This property contains array with objects describing the state of all views
                // that are either loaded or being loaded.
                viewState: { value: [], writable: false, enumerable: false, configurable: false },
                // This property references object responsible for loading specific view.
                loadViewOperation: { value: new LoadViewOperation(), writable: false, enumerable: false, configurable: false },
                // This property contains the layer slot index that was last filled by view manager
                currentLayerIndex: { value: -1, writable: true, enumerable: false, configurable: true },
                // This property references Promise object that completes when current view loading
                // operation is done.
                currentLoadingViewOperation: { writable: true, enumerable: false, configurable: true },
                // This property references object responsible for loading view registry from
                // external source.
                loadRegistryOperation: { value: new BingApp.Classes.LoadJsonOperation(), writable: false, enumerable: false, configurable: false },
                // This property stores array of view registration entries
                registry: { writable: true, enumerable: false, configurable: false }
            });

            if (registrySourceLocation) {
                this._loadRegistry(registrySourceLocation);
            }
        },
        {
            reset: function () {
                /// <summary>
                /// Resets the state of the view manager so it can start loading views 
                /// from the root container inside the application.
                /// </summary>
                BingApp.traceInfo("ViewManager.reset: setting up view manager to handle view loading for new navigation operation.");
                this._cancelLoading();
                this.currentLayerIndex = -1;
            },
            load: function (viewId) {
                /// <summary>
                /// Loads view with given id into application UI.
                /// </summary>
                /// <param name="viewId">
                /// Id of the view to load.
                /// </param>
                /// <returns type="WinJS.Promise">
                /// A Promise object that will complete once view with given id is fully loaded.
                /// </returns>

                if (BingApp.Utilities.isNullOrUndefined(viewId)) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("viewId");
                }

                var viewInfo;

                // Move on to next layer slot in the chain of views
                this.currentLayerIndex++;

                BingApp.traceInfo("ViewManager.load: started loading '{0}' into the layer slot with index {1}.", viewId, this.currentLayerIndex);

                // Check if we have information on the view that has been or being loaded 
                // in the same slot.
                if (this.viewState.length > this.currentLayerIndex) {
                    viewInfo = this.viewState[this.currentLayerIndex];

                    // Check if we are loading exactly the same view
                    if (viewInfo.viewId === viewId) {
                        // Check if we have view object (this indicates that view is loaded)
                        var view = viewInfo.view;
                        if (view) {
                            var navigationManager = BingApp.locator.navigationManager;
                            var navigationUri = navigationManager.getCurrentUri();
                            var navigationOptions = navigationManager.getCurrentOptions();

                            BingApp.traceInfo(
                                "ViewManager.load: '{0}' is already loaded. View controller will be notified to handle navigation Uri: {1}.",
                                viewId,
                                navigationUri.absoluteUri);

                            var controller = view.getController();
                            if (controller) {
                                controller.setNavigationUri(navigationUri, navigationOptions);
                            }

                            // There is nothing more to do; return empty promise to indicate that we are done
                            return WinJS.Promise.as(view);
                        } else {
                            // View is still being loaded; this is only allowed for the last view in the layer chain
                            if (this.currentLayerIndex !== this.viewState.length - 1) {
                                return WinJS.Promise.wrapError(new BingApp.Classes.ErrorInvalidOperation(
                                    "ViewManager.load",
                                    BingApp.Utilities.format(WinJS.Resources.getString("error_view_must_be_loaded").value, viewId)));
                            } 

                            BingApp.traceInfo("ViewManager.load: '{0}' is already being loaded. Returning reference to active loading operation.", viewId);

                            // There must be an ongoing loading operation
                            if (!this.loadViewOperation.isRunning() || !this.currentLoadingViewOperation) {
                                return WinJS.Promise.wrapError(new BingApp.Classes.ErrorInvalidOperation(
                                    "ViewManager.load",
                                    BingApp.Utilities.format(WinJS.Resources.getString("error_must_be_loading_view").value, viewId)));
                            }

                            return this.currentLoadingViewOperation;
                        }
                    } else {
                        // New view has to be loaded in place of existing view; existing view and 
                        // all views layered inside it have to be unloaded.
                        this._unloadRemainingViews();
                    }
                }

                // Record view information
                viewInfo = {
                    viewId: viewId
                };
                this.viewState[this.currentLayerIndex] = viewInfo;

                var that = this;
                this.currentLoadingViewOperation = new WinJS.Promise(
                    function init(complete, error) {
                        that._ready().done(function () {
                            // Determine element that will host view
                            var host;
                            if (that.currentLayerIndex === 0) {
                                BingApp.traceInfo("ViewManager.load: '{0}' view will be loaded inside Shell.", viewId);
                                var shell = BingApp.locator.shell;
                                if (shell) {
                                    host = shell.getHost();
                                }
                            } else {
                                var parentViewInfo = that.viewState[that.currentLayerIndex - 1];
                                BingApp.traceInfo("ViewManager.load: '{0}' view will be loaded inside '{1}' view.", viewId, parentViewInfo.viewId);
                                var parentController = parentViewInfo.view.getController();
                                if (parentController) {
                                    host = parentController.getHost();
                                }
                            }

                            if (!host) {
                                error(new BingApp.Classes.ErrorInvalidOperation(
                                    "ViewManager.load",
                                    BingApp.Utilities.format(WinJS.Resources.getString("error_view_must_have_host").value, viewId)));
                            }

                            // Determine view location
                            var entry = that._findRegistryEntry(viewId);
                            if (!entry || !entry.location) {
                                error(new BingApp.Classes.ErrorViewRegistration(viewId));
                            }

                            that.loadViewOperation.run({ location: entry.location, host: host }).done(
                                function onComplete(view) {
                                    // View must have controller associated with it
                                    if (!view || !(view.getController instanceof Function)) {
                                        error(new BingApp.Classes.ErrorViewLoadingFailure(viewId));
                                    }
                                    var controller = view.getController();
                                    if (!controller) {
                                        error(new BingApp.Classes.ErrorViewLoadingFailure(viewId));
                                    }

                                    // We must be completing loading of the last view in the layer chain
                                    if (that.currentLayerIndex !== that.viewState.length - 1) {
                                        error(new BingApp.Classes.ErrorInvalidOperation(
                                            "ViewManager.load",
                                            WinJS.Resources.getString("error_view_state_corrupted").value));
                                    }

                                    // Update view information
                                    var viewInfo = that.viewState[that.currentLayerIndex];
                                    if (!viewInfo || !BingApp.Utilities.isNullOrUndefined(viewInfo.view)) {
                                        error(new BingApp.Classes.ErrorInvalidOperation(
                                            "ViewManager.load", 
                                            WinJS.Resources.getString("error_view_state_corrupted").value));
                                    }

                                    // Store reference to view so view manager can communicate with it.
                                    viewInfo.view = view;

                                    var navigationManager = BingApp.locator.navigationManager;
                                    controller.setNavigationUri(navigationManager.getCurrentUri(), navigationManager.getCurrentOptions());

                                    complete(view);
                                },
                                error);
                        },
                        error);
                    },
                    function cancel() {
                        this._cancelLoading();
                    });

                this.currentLoadingViewOperation.done(
                    function () {},
                    function (err) {
                        // Remove view information for view which loading was aborted
                        that.viewState.pop();

                        // Make slot available for loading
                        that.currentLayerIndex--;
                    });

                return this.currentLoadingViewOperation;
            },
            setRegistry: function (registry) {
                /// <summary>
                /// Sets array of view registration used to determine how to load a view based on id.
                /// </summary>
                /// <param name="registry">
                /// Array of registration entries.
                /// </param>
                BingApp.traceInfo("ViewManager.setRegistry: view registry is set explicitly.");

                this.registry = registry;

                if (this.loadRegistryOperation.isRunning()) {
                    BingApp.traceWarning("ViewManager.setRegistry: called while app is in the middle of loading view registry from external source. This loading operation will be cancelled.");
                    this.loadRegistryOperation.cancel();
                }
            },
            getLoadedViews: function () {
                /// <summary>
                /// Returns array of the views that were loaded by this object.
                /// </summary>
                /// <returns type="Array">
                /// An array containing objects representing all loaded views.
                /// </returns>
                var loadedViews = [];
                var viewsCount = this.viewState.length;
                var index;
                if (viewsCount > 0) {
                    for (index = 0; index < viewsCount - 1; index++) {
                        loadedViews.push(this.viewState[index].view);
                    }

                    // Last view is the special case because it may not be loaded yet
                    var lastView = this.viewState[index].view;
                    if (!BingApp.Utilities.isNullOrUndefined(lastView)) {
                        loadedViews.push(lastView);
                    }
                }

                return loadedViews;
            },
            findLoadedView: function (viewId) {
                /// <summary>
                /// Finds view object for given ViewId
                /// </summary>
                /// <returns type="Object">
                /// returns thew View of the givenId. Will return null when the view was not in the registry or if the view was not loaded yet.
                /// </returns>

                var viewsCount = this.viewState.length;
                var index;
                for (index = 0; index < viewsCount; index++) {
                    var viewState = this.viewState[index];
                    if (viewState && 
                        BingApp.Utilities.areEqualIgnoreCase(viewId, viewState.viewId) &&
                        viewState.view)
                    {
                        return viewState.view;
                    }
                }

                return null;
            },
            _cancelLoading: function () {
                /// <summary>
                /// Cancels the currently running view loading operation.
                /// </summary>
                this.loadViewOperation.cancel();
            },
            _unloadRemainingViews: function () {
                /// <summary>
                /// Unloads all views starting from .currentLayerIndex.
                /// </summary>
                for (var indexView = this.viewState.length - 1; indexView >= this.currentLayerIndex; indexView--) {
                    var viewInfo = this.viewState[indexView];
                    var view = viewInfo.view;
                    if (view) {
                        var controller = view.getController();
                        if (controller) {
                            // Let controller know that its view is about to be unloaded
                            controller.notifyUnloading();
                        }
                    } else {
                        // This should be happening only for bottom-most view
                        if (indexView !== this.viewState.length - 1) {
                            throw new BingApp.Classes.ErrorInvalidOperation(
                                "ViewManager.load",
                                BingApp.Utilities.format(WinJS.Resources.getString("error_must_be_loading_view").value, viewInfo.viewId));
                        }

                        // View is being loaded - cancel corresponding loading operation
                        this._cancelLoading();
                    }
                }

                // Remove view information for unloaded views
                this.viewState.length = this.currentLayerIndex;
            },
            _findRegistryEntry: function (viewId) {
                /// <summary>
                /// Determines the view registry entry based on given id.
                /// </summary>
                /// <param name="viewId">
                /// Id of the view.
                /// </param>
                /// <returns>
                /// Object representing view registration.
                /// </returns>
                if (this.registry) {
                    // Ignore letter case when looking for view id match. This is general good practice:
                    // http://stackoverflow.com/questions/1806181/why-should-i-convert-a-string-to-upper-case-when-comparing.
                    var viewsCount = this.registry.length;
                    for (var indexRegistration = 0; indexRegistration < viewsCount; indexRegistration++) {
                        var entry = this.registry[indexRegistration];
                        // Note that we convert view id to upper case each time this
                        // method is called; this is not optimal but in this case acceptable
                        // because: a) registry entry might have this data as read-only
                        // (possible in "strict" mode); and b) view id can be used in
                        // traces and it is better to keep it in original format for readability
                        if (BingApp.Utilities.areEqualIgnoreCase(entry.viewId, viewId)) {
                            return entry;
                        }
                    }
                }

                return null;
            },
            _ready: function (callback, async) {
                /// <summary>
                /// Ensures that specified function executes only after view registry is loaded.
                /// </summary>
                /// <param name="callback" optional="true">
                /// A function that executes after view registry is loaded.
                /// </param>
                /// <param name="async" optional="true">
                /// If true, the callback should be executed asynchronously.
                /// </param>
                /// <returns>
                /// A promise that completes after view registry is loaded for this object.
                /// </returns>
                var that = this;
                return new WinJS.Promise(function init(complete, error) {
                    // This function will execute once view registry is loaded
                    function onRegistryLoaded() {
                        if (callback) {
                            try {
                                callback();
                            }
                            catch (err) {
                                error(err);
                                return;
                            }
                        }
                        complete();
                    };

                    function onLoadingError(loadingErr) {
                        // Special case when operation cancelled as a result of explicitly setting 
                        // view registry.
                        if (that.registry && BingApp.Utilities.isPromiseCancellationError(loadingErr)) {
                            onRegistryLoaded();
                        } else {
                            error(loadingErr);
                        }
                    };

                    if (that.loadRegistryOperation.isRunning()) {
                        // There is an active view registry loading operation - wait for it to finish
                        that.loadRegistryOperation.done(onRegistryLoaded, onLoadingError);
                    } else {
                        // View registry is already loaded
                        if (async) {
                            WinJS.Promise.timeout().done(onRegistryLoaded, onLoadingError);
                        } else {
                            onRegistryLoaded();
                        }
                    }
                });
            },
            _loadRegistry: function (fileLocation) {
                /// <summary>
                /// Loads the contents of the given JSON file and uses it as view registration
                /// information.
                /// </summary>
                /// <param name="fileLocation">
                /// Location of JSON file that contains registry information for all views.
                /// </param>
                /// <returns>
                /// Promise object that can be used to track the completion of asynchronous
                /// loading of view registry.
                /// </returns>
                var that = this;
                return this.loadRegistryOperation.run({ fileLocation: fileLocation }).then(function (result) {
                    // REVIEW:  We can optimize access to registry entries
                    //          by adding hash property based on viewId.
                    //          For now we have opted out of adding additional
                    //          code complexity because performance gain would
                    //          be negligible due to small number of entries in
                    //          view registry.
                    that.registry = result;
                });
            }
        });

    // Expose NavigationManager class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        ViewManager: ViewManager
    });
})();
