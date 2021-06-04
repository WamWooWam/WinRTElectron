/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='//Microsoft.WinJS.1.0/js/ui.js' />
/// <reference path='../../common/js/tracing.js' />
/// <reference path='../../common/js/utilities.js' />
/// <reference path='env.js' />
/// <reference path='navigation.js' />
/// <reference path='servicelocator.js' />
/// <reference path='livetile.js' />
/// <reference path='settings.js' />
/// <reference path='navigationprogress.js' />
/// <reference path='searchpaneautosuggest.js' />
/// <reference path='appconfig.js' />
/// <reference path='searchpane.js' />
/// <reference path='softkeyboard.js' />
/// <reference path='viewstate.js' />
/// <reference path='nativeinstrumentation.js' />
(function () {
    "use strict";

    /// <summary>
    /// Constants for IE app switching. We will extend this to support other verticals later.
    /// </summary>
    var IE_ARGUMENT_PREFIX = "META:";
    var IESwitchPaths = Object.freeze({
        home: "/",
        search: "/search",
    });

    /// <summary>
    /// Static list of navigation Uris.
    /// </summary>
    var uris = Object.freeze({
        home: "bingsearch://app/home",
        start: "bingsearch://app/start",
        search: "bingsearch://app/search",
        imagesgrid: "bingsearch://app/images/grid",
        imagesdetail: "bingsearch://app/images/detail",
    });

    /// <summary>
    /// Static list of navigation paths to bing.com that the app supports.
    /// </summary>
    /// <note>
    /// All keys in shell.webPaths MUST exist in shell.uris. The matching is
    /// used to convert a web path to an app path.
    /// </note>
    var webPaths = Object.freeze({
        search: "/search",
        imagesgrid: "/images/search"
    });
    var webPathsMap = Object.keys(webPaths).reduce(function (memo, key) {
        memo[webPaths[key]] = key;
        return memo;
    }, {});

    /// <summary>
    /// Static list of form codes appended to navigation Uri.
    /// </summary>
    var formCodes = Object.freeze({
        fromLiveTile: "ENTLTL",
        fromIE: "ENIEW8",
        fromProtocol: "ENPCW8",
        fromBackButton: "ENBBW8",
        fromSearchCharmActivation: "QSBW8P",
        fromSearchCharmQuery: "QSBW8A",
        fromSearchCharmSuggestion: "ASAPIB",
        fromShareCharmDefault: "QRDSW8",
        fromShareCharmStart: "QRSTW8",
        fromShareCharmTrending: "QRTSW8",
        fromShareCharmRecent: "QRRSW8",
        fromShareCharmSerp: "QRSSW8",
        fromShareCharmImages: "QRISW8",
        fromShareCharmImagesSubviews: "QRIDW8",
        fromTrendingSearch: "W8SPTR",
        fromHomePopularNow: "QRPNW8",
        fromHotspot: "SPHOT",
    });

    /// <summary>
    /// Static list of activation kinds.
    /// </summary>
    var activationKind = Object.freeze({
        launch: "launch",
        ieLaunch: "ielaunch",
        search: "search",
        protocol: "protocol",
    });

    /// <summary>
    /// Static list of events handled by Shell.
    /// </summary>
    var events = Object.freeze({
        invokeApp: "invokeApp",
        unsnap: "viewUnsnap",
    });

    /// <summary>
    /// Static version number appended to navigation and autosuggest Uris.
    /// </summary>
    var version = Windows.ApplicationModel.Package.current.id.version;
    var fullVersion = [version.major, version.minor, version.build, version.revision].join(".");

    /// <summary>
    /// Object that is used to lookup supported Uris.
    /// </summary>
    var lookupSupportedUris = Object.keys(uris).reduce(function (memo, key) {
        memo[uris[key]] = key;
        return memo;
    }, {});

    /// <summary>
    /// Object that is used to lookup supported Uris.
    /// </summary>
    var lookupNeedSearchQueryUris = Object.keys(uris).reduce(function (memo, key) {
        var uri = uris[key];
        if (uri === uris.search || uri === uris.imagesgrid) {
            memo[uri] = key;
        }
        return memo;
    }, {});

    /// <summary>
    /// Defines class that is associated with the first UI component loaded in the application.
    /// </summary>
    var Shell = WinJS.Class.define(
        function constructor(app) {
            /// <summary>
            /// Initializes a new instance of BingApp.Classes.Shell class.
            /// </summary>
            /// <param name="app" optional="true">
            /// Object representing Windows application. If application is not specified
            /// then "run()" will not result in starting the application.
            /// </param>
            if (!(this instanceof BingApp.Classes.Shell)) {
                BingApp.traceWarning("Shell.ctor: attempted using Shell ctor as function; redirecting to use 'new Shell()'.");
                return new BingApp.Classes.Shell(app);
            }

            // Store app in read-only private property
            Object.defineProperty(this, "app", { value: app, writable: false, enumerable: false, configurable: false });

            if (app) {
                var that = this;

                // Add event handler for RESUME, note that this event is from WinRT, not WinJS
                Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", function _resumeHandler(eventObject) {
                    /// <summary>
                    /// Event handler for resuming the application. Note that this event comes from WinRT, not WinJS.
                    /// </summary>
                    /// <param name="eventObject">
                    /// Event related data.
                    /// </param>
                    BingApp.traceInfo("Shell._resumeHandler: Resuming the app.");

                    // It could have been a while for the app to be suspended so lets go ahead and check the configuration
                    BingApp.locator.appConfiguration.checkConfiguration();

                    // Potentially have to refresh instrumentation state data.
                    BingApp.Instrumentation.resumeLogging();
                }),

                app.onactivated = function onActivated (eventObject) {
                    // Store information about the most recent activation
                    that._lastActivationData = eventObject;

                    var coldStart = BingApp.Utilities.isColdStart(eventObject.detail.previousExecutionState);
                    // Preserving in case it provides useful info
                    if (coldStart) {
                        BingApp.traceInfo("Shell.onactivated: Bing App is activated via 'cold' start.");
                    } else {
                        BingApp.traceInfo("Shell.onactivated: Bing App is activated without 'cold' start.");
                    }

                    // Log the moment initial splash screen is dismissed 
                    var systemSplashScreen = eventObject.detail.splashScreen;
                    if (coldStart && systemSplashScreen) {
                        // Make the secondary splash screen image have the same position and
                        // dimensions as the system splash screen
                        that._updateSplashScreenDisplay = function () {
                            splashscreenimage.style.left = systemSplashScreen.imageLocation.x + "px";
                            splashscreenimage.style.top = systemSplashScreen.imageLocation.y + "px";
                            splashscreenimage.style.width = systemSplashScreen.imageLocation.width + "px";
                            splashscreenimage.style.height = systemSplashScreen.imageLocation.height + "px";
                        };
                        that._updateSplashScreenDisplay();
                        window.addEventListener("resize", that._updateSplashScreenDisplay, false);

                        var callbackSplashScreenDismissed = function onSystemSplashScreenDismissed() {
                            BingApp.traceInfo(
                                "Shell.onSystemSplashScreenDismissed: system splash screen has been dismissed; started showing {0} now.",
                                that.showingSecondarySplashScreen ? "secondary splash screen" : "content");
                            systemSplashScreen.removeEventListener("dismissed", callbackSplashScreenDismissed);
                        };
                        systemSplashScreen.addEventListener("dismissed", callbackSplashScreenDismissed, false);
                    }

                    // Defer completion of app activation until window content is fully loaded.
                    // This will take care of possible flicker.
                    var deferredActivation = eventObject.detail.activatedOperation.getDeferral();

                    // Store information about how application was activated on "cold" start
                    that._coldStartActivationData = eventObject;

                    // Initialize Shell UI only once upon "cold" start
                    // Previously, we used window.onload to determine when the application was ready for use. 
                    // Unfortunately, this caused tools like WACK to experience app startup timeouts 
                    // and users also saw similar timeouts under certain rare circumstances due to a 15 second
                    // timeout by PLM for startup not being respected.
                    // Window.onload included the load time for the entire initial trends experience.
                    // It's not strictly necessary for app startup to include Trends initialization,
                    // but we need to ensure that trends only becomes accessible once it is ready.
                    eventObject.setPromise(that._initShell().done(function onInitShellDone() {
                        if (deferredActivation) {
                            deferredActivation.complete();
                            deferredActivation = null;
                        }
                        BingApp.traceInfo("Shell.onactivated: deferred activation of Bing App has been completed.");
                    }));

                    that._readyForHandlingActivation().done(function () {
                        if (coldStart) {
                            that._initGlobalEventSources();
                        }

                        // Ask Shell to handle activation
                        that._handleActivation(that._lastActivationData);
                    });
                };
            }
        },
        {
            run: function () {
                /// <summary>
                /// Starts windows application.
                /// </summary>
                if (this.app) {
                    BingApp.traceInfo("Shell.run: starting Bing App.");
                    this.app.start();
                }
            },
            getHost: function () {
                /// <summary>
                /// Gets element that is used for hosting content.
                /// </summary>
                return this.host;
            },
            showProgressIndicator: function () {
                /// <summary>
                /// Shows the progress indicator.
                /// </summary>
                this.showingBlockingProgressIndicator = this.showingSecondarySplashScreen;
                var progressIndicator = this.showingBlockingProgressIndicator ? this.blockingProgressIndicator : this.nonblockingProgressIndicator;
                WinJS.Utilities.removeClass(progressIndicator, "hidden");
                WinJS.UI.Animation.fadeIn(progressIndicator);

                BingApp.traceInfo(
                    "Shell.showProgressIndicator: started showing {0} progress indicator.",
                    this.showingBlockingProgressIndicator ? "blocking" : "non-blocking");
            },
            hideProgressIndicator: function () {
                /// <summary>
                /// Hides the progress indicator.
                /// </summary>
                var progressIndicator = this.showingBlockingProgressIndicator ? this.blockingProgressIndicator : this.nonblockingProgressIndicator;
                var that = this;
                WinJS.UI.Animation.fadeOut(progressIndicator).done(function () {
                    WinJS.Utilities.addClass(progressIndicator, "hidden");

                    BingApp.traceInfo(
                        "Shell.hideProgressIndicator: stopped showing {0} progress indicator.",
                        that.showingBlockingProgressIndicator ? "blocking" : "non-blocking");

                    if (that.showingSecondarySplashScreen) {
                        that._hideSecondarySplashScreen();
                    }
                });
            },
            getLastActivationData: function () {
                /// <summary>
                /// Gets the activation data that was passed with the most recent activation event.
                /// </summary>
                /// <returns>
                /// The activation data.
                /// </returns>
                return this._lastActivationData;
            },
            getColdStartActivationData: function () {
                /// <summary>
                /// Gets the activation data that was passed during cold start of the application.
                /// </summary>
                /// <returns>
                /// The activation data.
                /// </returns>
                return this._coldStartActivationData;
            },
            isAppLaunchedFromLiveTile: function() {
                /// <summary>
                /// Checks if the application was launched from Live tile
                /// </summary>
                /// <returns>
                /// true if the app is launched from Live tile
                /// </returns>
                var activationData = this.getLastActivationData();
                if (activationData.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
                    var args = activationData.detail.arguments;
                    if (BingApp.Utilities.isNullOrUndefined(args) || (args.indexOf(IE_ARGUMENT_PREFIX) === -1)) {
                        return true;
                    }
                }

                return false;
            },
            _initShell: function() {
                /// <summary>
                /// Initializes Shell to host application UI. Called once during cold start.
                /// </summary>
                /// <remarks>
                /// _initShell will track if it has already been called, if so, it will simply return and do no work
                /// </remarks>
                if (this.initOperation) {
                    var operationName = "BingApp.Classes.Shell._initShell";
                    BingApp.traceWarning(operationName + " has already been called: this method should be called only once during cold start. Skipping Shell initialization.");
                }
                else {
                    BingApp.traceInfo("Shell._initShell: Started Shell initialization; must happen once during 'cold' start.");

                    var that = this;
                    var promise = WinJS.UI.processAll().then(function () {
                        return WinJS.Resources.processAll();
                    }).then(function () {
                        that._initElements();
                        that._initSettings();
                        that._initNavigationProgressTracking();
                        that._initSecondarySplashScreen();
                        that._initGlobalEventHandlers();

                        BingApp.traceInfo("Shell._initShell: Finished Shell initialization; now it is ready to host app UI content.");
                    });

                    Object.defineProperty(this, "initOperation", { value: promise, writable: false, enumerable: false, configurable: false });
                }

                return this.initOperation;
            },
            _readyForHandlingActivation: function () {
                /// <summary>
                /// Determines when Shell is fully initialized and ready for handling app activation.
                /// </summary>
                /// <returns>
                /// A promise which completes when D=Shell is in ready state to handle app activation.
                /// </returns>
                var that = this;
                return WinJS.Utilities.ready().then(function () {
                    return that.initOperation || WinJS.Promise.as();
                });
            },
            _handleActivation: function (activationData) {
                /// <summary>
                /// Handles application activated event.
                /// </summary>
                /// <param name="activationData">
                /// Event related data.
                /// </param>
                BingApp.Classes.Shell.lastActivationFormCode = null; // this will be populated by the launch FormCode.

                var coldStart = BingApp.Utilities.isColdStart(activationData.detail.previousExecutionState);
                if (coldStart) {
                    // Initialize handling of events originating from Search Charm
                    this._initSearchPaneHandler();
                }

                var navigationUri;
                if (activationData.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
                    // Check if the application was launched from IE.
                    // IE argument format: META:URL@arguments
                    // e.g: META:http://bing.com@/search?q=pizza&first=42
                    var args = activationData.detail.arguments;
                    if (args && args.indexOf(IE_ARGUMENT_PREFIX) === 0) {
                        var pathStart = args.indexOf("@");
                        if (pathStart !== -1) {
                            pathStart++;
                            var pathEnd = args.indexOf("?", pathStart);
                            if (pathEnd === -1) {
                                pathEnd = args.length;
                            }
                            var path = args.substring(pathStart, pathEnd);

                            // The query string starts with "?" if non-empty
                            var queryString = args.substring(pathEnd);
                            queryString = BingApp.locator.env.sanitizeQueryString(queryString);

                            // Remove all query parameters except for "q="
                            var collection = BingApp.Utilities.QueryString.parse(queryString, { decode: true });
                            Object.keys(collection).forEach(function (parameter) {
                                if (!BingApp.Utilities.areEqualIgnoreCase(parameter, "q")) {
                                    delete collection[parameter];
                                }
                            });

                            // Append form code to query
                            collection["form"] = formCodes.fromIE;

                            queryString = BingApp.Utilities.QueryString.serialize(collection);

                            if (path === IESwitchPaths.home) {
                                navigationUri = uris.home + queryString;
                            } else if (path === IESwitchPaths.search) {
                                navigationUri = uris.search + queryString;
                            }
                        }

                        if (!BingApp.Classes.Shell.isSupportedAppUri(navigationUri)) {
                            navigationUri = Shell.uris.home + "?form=" + formCodes.fromIE;
                        }
                    } else {
                        navigationUri = Shell.uris.home + "?form=" + formCodes.fromLiveTile;
                    }
                } else if (activationData.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.search) {
                    // Bing Win8 Query by search pane when app is not active and focused
                    var query = activationData.detail.queryText;
                    if (query && query.trim()) {
                        navigationUri = Shell.uris.search + "?q=" + encodeURIComponent(query) + "&form=" + formCodes.fromSearchCharmActivation;
                    } else {
                        navigationUri = Shell.uris.home + "?form=" + formCodes.fromSearchCharmActivation;
                    }
                } else if (activationData.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                    // Bing Win8 is navigated via protocol
                    var protocolUri = activationData.detail.uri;

                    navigationUri = protocolUri.absoluteUri;

                    // Ensure that passed query does not conflict with query parameters set by application
                    var protocolQuery = protocolUri.query;
                    if (protocolQuery) {
                        var sanitizedQuery = BingApp.locator.env.sanitizeQueryString(protocolQuery);

                        // Append form code to query
                        var collection = BingApp.Utilities.QueryString.parse(sanitizedQuery, { decode: true });
                        collection["form"] = formCodes.fromProtocol;
                        sanitizedQuery = BingApp.Utilities.QueryString.serialize(collection);

                        navigationUri = navigationUri.replace(protocolQuery, sanitizedQuery);
                    } else {
                        var protocolFragment = protocolUri.fragment;
                        if (protocolFragment) {
                            navigationUri = navigationUri.substring(0, navigationUri.length - protocolFragment.length) +
                                "?form=" + formCodes.fromProtocol + protocolFragment;
                        }
                        else {
                            // if there is no fragment simply append the formCode. e.g. bingsearch://app/home is missing was missing the form code.
                            navigationUri = navigationUri + "?form=" + formCodes.fromProtocol; 
                        }
                    }

                    if (!BingApp.Classes.Shell.isSupportedAppUri(navigationUri)) {
                        navigationUri = Shell.uris.home + "?form=" + formCodes.fromProtocol;
                    }
                }

                if (navigationUri) {
                    BingApp.traceInfo("Shell._handleActivation: translated <{0}> activation into navigation Uri: {1}.", activationData.detail.kind, navigationUri);
                    this._extractActivationFormCode(navigationUri);
              
                    var that = this;
                    BingApp.locator.navigationManager.navigateTo(navigationUri).done(function () {
                        // Check if the current version is supported anymore and request config
                        BingApp.locator.appConfiguration.checkConfiguration();

                        if (coldStart) {
                            // Initialize live tile once navigation is complete; do it only once 
                            // on "cold" start.
                            that._initLiveTile();

                            // Log how application got activated on "cold" start
                            that._logColdStartActivation();
                        }
                    });
                } else {
                    BingApp.traceError("Shell._handleActivation: unexpected activation kind <{0}>.", activationData.detail.kind);
                }
            },
            /// <summary>
            /// Updates the splash screen location and dimensions on window resize events.
            /// </summary>
            _updateSplashScreenDisplay: null,
            _hideSecondarySplashScreen: function () {
                /// <summary>
                /// Hides the secondary splash screen.
                /// </summary>
                var outgoing = this.secondarySplashScreen;
                var incoming = this.host;
                var that = this;

                window.removeEventListener("resize", this._updateSplashScreenDisplay);

                if (outgoing && incoming) {
                    WinJS.UI.Animation.crossFade(incoming, outgoing).done(function () {
                        that.showingSecondarySplashScreen = false;

                        // Remove splash screen element once it is hidden 
                        var splashScreenContainer = that.secondarySplashScreen.parentNode;
                        if (splashScreenContainer) {
                            splashScreenContainer.removeChild(that.secondarySplashScreen);
                        } else {
                            BingApp.traceError("Shell._hideSecondarySplashScreen: secondary splash screen is orphaned (does not have parent); no action to take but this is abnormal situation.");
                        }

                        BingApp.traceInfo("Shell._hideSecondarySplashScreen: secondary splash screen is hidden; application content must be shown now.");

                        // remove opacity from elements to reduce layering complexity in GPU
                        that.host.style.opacity = "";
                        WinJS.Utilities.removeClass(that.host, "translucent");
                    });
                }
            },
            _initGlobalEventSources: function () {
                /// <summary>
                /// Initialize objects responsible for raising app level events.
                /// </summary>
                BingApp.traceInfo("Shell._initGlobalEventSources: initializing sources for global events exposed by the app: must happen once during 'cold' start.");

                var relay = BingApp.locator.eventRelay;

                // soft keyboard visibility events 
                BingApp.SoftKeyboard.init(relay);

                // searchPane visibility events 
                BingApp.SearchPane.init(relay);

                // view modality change events 
                BingApp.ViewState.init(window, document, relay);
            },
            _initGlobalEventHandlers: function () {
                /// <summary>
                /// Initialize handlers responsible for handling app level events.
                /// </summary>
                BingApp.traceInfo("Shell._initGlobalEventHandlers: initializing handlers for global events supported by the app: must happen once during 'cold' start.");

                var relay = BingApp.locator.eventRelay;

                // handle app invocation
                relay.addEventListener(events.invokeApp, function (args) {
                    BingApp.Utilities.invokeURI(args);
                });

                // handle exiting snap mode
                relay.addEventListener(events.unsnap, function () {
                    Windows.UI.ViewManagement.ApplicationView.tryUnsnap();
                });
            },
            _initElements: function () {
                /// <summary>
                /// Initializes elements contained inside shell.
                /// </summary>
                BingApp.traceInfo("Shell._initElements: initializing Shell UI elements: must happen once during 'cold' start.");

                // Initialize reference to host element
                if (!this.host) {
                    // Store reference to element hosting Main View in read-only private property
                    var hostElement = document.getElementById("mainviewhost");
                    Object.defineProperty(this, "host", { value: hostElement, writable: false, enumerable: false, configurable: false });
                }

                // Initialize reference to blocking progress indicator element
                if (!this.blockingProgressIndicatorElement) {
                    // Store reference to element hosting blocking progress control in read-only 
                    // private property.
                    var blockingProgressIndicatorElement = document.getElementById("progressindicatorblocking");
                    Object.defineProperty(this, "blockingProgressIndicator", { value: blockingProgressIndicatorElement, writable: false, enumerable: false, configurable: false });
                }

                // Initialize reference to non-blocking progress indicator element
                if (!this.nonblockingProgressIndicatorElement) {
                    // Store reference to element hosting non-blocking progress control in 
                    // read-only private property.
                    var nonblockingProgressIndicatorElement = document.getElementById("progressindicatornonblocking");
                    Object.defineProperty(this, "nonblockingProgressIndicator", { value: nonblockingProgressIndicatorElement, writable: false, enumerable: false, configurable: false });
                }

                // Initialize reference to secondary splash screen element
                if (!this.secondarySplashScreen) {
                    // Store reference to element hosting splash screen image in read-only
                    // private property.
                    var secondarySplashScreenElement = document.getElementById("secondarysplashscreen");
                    Object.defineProperty(this, "secondarySplashScreen", { value: secondarySplashScreenElement, writable: false, enumerable: false, configurable: false });
                }
            },
            _initSearchPaneHandler: function () {
                /// <summary>
                /// Initializes handler for events originating from Search Charm.
                /// </summary>
                BingApp.traceInfo("Shell._initSearchPaneHandler: registering to handle Search Charm integration: must happen once during 'cold' start (must happen after user accepted terms).");

                BingApp.SearchPaneHandler.register(BingApp.locator.navigationManager);
            },
            _initLiveTile: function () {
                /// <summary>
                /// Initializes application's live tile.
                /// </summary>
                BingApp.traceInfo("Shell._initLiveTile: registering to poll for live tile update: must happen once during 'cold' start (must happen after initial navigation is completed).");

                if (!this.liveTile) {
                    var liveTile = new BingApp.Classes.LiveTile(BingApp.locator.env, Windows.UI.Notifications);
                    Object.defineProperty(this, "liveTile", { value: liveTile, writable: false, enumerable: false, configurable: false });
                }
                this.liveTile.registerPolling();
            },
            _initSettings: function () {
                /// <summary>
                /// Initializes settings flyout.
                /// </summary>
                BingApp.traceInfo("Shell._initSettings: initializing app settings: must happen once during 'cold' start.");

                BingApp.Settings.init(this.app, BingApp.locator.eventRelay);
            },
            _initNavigationProgressTracking: function () {
                /// <summary>
                /// Sets up navigation tracking to show/hide progress indicator assciated with loading 
                /// application content.
                /// </summary>
                BingApp.traceInfo("Shell._initNavigationProgressTracking: initializing service for navigation progress tracking: must happen once during 'cold' start.");

                var navigationManager = BingApp.locator.navigationManager;
                var progressIndicatorService = BingApp.locator.progressIndicatorService;
                BingApp.Classes.NavigationManager.initTracking(navigationManager, progressIndicatorService);
            },
            _initSecondarySplashScreen: function () {
                /// <summary>
                /// Sets up logic for when to hide secondary splash screen that is initially shown
                /// when Shell is loaded.
                /// </summary>
                BingApp.traceInfo("Shell._initSecondarySplashScreen: initializing secondary splash screen; must happen once during 'cold' start.");

                this.showingSecondarySplashScreen = true;
            },
            _logColdStartActivation: function () {
                /// <summary>
                /// Logs information about how application got activated upon "cold" start.
                /// </summary>
                var kind;
                var args;

                switch (this._coldStartActivationData.detail.kind) {
                    case Windows.ApplicationModel.Activation.ActivationKind.launch:
                        // IE argument format: META:URL@arguments
                        if (typeof args === "string" && args.indexOf(IE_ARGUMENT_PREFIX) === 0) {
                            kind = activationKind.ieLaunch;
                        } else {
                            kind = activationKind.launch;
                        }
                        args = this._coldStartActivationData.detail.arguments;
                        break;
                    case Windows.ApplicationModel.Activation.ActivationKind.search:
                        kind = activationKind.search;
                        args = this._coldStartActivationData.detail.queryText;
                        break;
                    case Windows.ApplicationModel.Activation.ActivationKind.protocol:
                        kind = activationKind.protocol;
                        args = this._coldStartActivationData.detail.uri.rawUri;
                        break;
                    default:
                        throw new BingApp.Classes.ErrorInvalidOperation(
                            "Shell._logColdStartActivation",
                            "Unexpected activation kind <" + this._coldStartActivationData.detail.kind + ">.");
                        break;
                }

                BingApp.Instrumentation.log(
                    {
                        name: "AppLaunch",
                        kind: kind,
                        args: args
                    },
                    BingApp.Instrumentation.activation);
            },
            _extractActivationFormCode: function (navigationUri) {
                /// <summary>
                /// Extracts the activation code from the Activation Navigation.
                /// </summary>
                /// <params name="navigationUri" type="string" >
                /// Uri to use when app is activated.
                /// </params>
                var match = /(\?|&)form=(\w+)/m.exec(navigationUri);
                if (match && match.length > 0) {
                    BingApp.Classes.Shell.lastActivationFormCode = match[2];
                }
            },
            /// <summary>
            /// Reference to activation data recorded when application received most recent activated event.
            /// </summary>
            _lastActivationData: null,
            /// <summary>
            /// Reference to activation data recorded when application was activated for the first time.
            /// </summary>
            _coldStartActivationData: null
        },
        {
            /// <summary>
            /// Gets object containing app navigation Uris.
            /// </summary>
            uris: uris,
            /// <summary>
            /// Gets object containing paths on bing.com supported within app.
            /// </summary>
            webPaths: webPaths,
            /// <summary>
            /// Gets object containing app form codes.
            /// </summary>
            formCodes: formCodes,
            /// <summary>
            /// Gets version number.
            /// </summary>
            fullVersion: fullVersion,
            /// <summary>
            /// Gets events supported by Shell. 
            /// </summary>
            events: events,
            /// <summary>
            /// Last Activation formCode, determined by activation 
            /// </summary>
            lastActivationFormCode: null,
            getAppPathFromWebPath: function (webUrl) {
                /// <summary>
                /// Converts a fully qualified web url to an equivalent app url, if possible.
                /// </summary>
                /// <param name="webUrl">
                /// The fully qualified url to convert.
                /// </param>
                /// <returns>
                /// The app uri if the conversion was possible, undefined otherwise.
                /// </returns>
                if (webUrl) {
                    try {
                        var uri = new Windows.Foundation.Uri(webUrl);
                    } catch (e) {
                        BingApp.traceError("BingApp.Classes.Shell.getAppPathFromWebPath: error creating uri from '{0}', {1}", webUrl, e.message);
                        return undefined;
                    }

                    var appPath = webPathsMap[uri.path];
                    if (appPath) {
                        return uris[appPath] + uri.query + uri.fragment;
                    }
                }
                return undefined;
            },
            isSupportedAppUri: function (uri) {
                /// <summary>
                /// Gets a value indicating whether given Uri is valid navigation uri supported by the app.
                /// </summary>
                /// <param name="uri" type="Windows.Foundation.Uri">
                /// Uri to test.
                /// </param>
                /// <returns type="Boolean">
                /// True to indicate that given Uri can be used for navigation; otherwise, false.
                /// </returns>
                if (typeof uri === "string") {
                    try {
                        uri = new Windows.Foundation.Uri(uri);
                    } catch (e) {
                        BingApp.traceError("BingApp.Classes.Shell.isSupportedAppUri: given Uri '{0}' is invalid; error message: '{1}'", uri, e.message);
                        return false;
                    }
                }

                if (!uri) {
                    return false;
                }

                var uriNoQueryNoFragment = uri.absoluteUri.substring(0, uri.absoluteUri.length - uri.query.length - uri.fragment.length);

                if (!(uriNoQueryNoFragment in lookupSupportedUris)) {
                    BingApp.traceInfo("BingApp.Classes.Shell.isSupportedAppUri: given Uri '{0}' is invalid because it does not map to any of the supported navigation uri.", uri);
                    return false;
                }

                // Search navigation uri must have non-empty "q" parameter
                if (uriNoQueryNoFragment in lookupNeedSearchQueryUris) {
                    var collection = BingApp.Utilities.QueryString.parse(uri.query);
                    var searchQuery = (collection["q"] || collection["Q"] || "").trim();
                    if (!searchQuery) {
                        BingApp.traceInfo("BingApp.Classes.Shell.isSupportedAppUri: given Uri '{0}' is invalid because it does not have non-empty search query.", uri);
                        return false;
                    }
                }

                return true;
            },
        });

    // Expose Shell class via application namespace
    WinJS.Namespace.define("BingApp.Classes", {
        Shell: Shell
    });
})();
