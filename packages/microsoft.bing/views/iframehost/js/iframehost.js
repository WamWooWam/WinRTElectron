/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../../common/js/tracing.js' />
/// <reference path='../../../shell/js/shell.js' />
/// <reference path='../../../shell/js/env.js' />
/// <reference path='../../../shell/js/eventrelay.js' />
/// <reference path='../../../shell/js/navigation.js' />
/// <reference path='../../../shell/js/servicelocator.js' />
/// <reference path='../../../shell/js/viewcontroller.js' />
/// <reference path='../../../shell/js/softkeyboard.js' />
/// <reference path='../../../shell/js/viewstate.js' />
(function (navigationManager, env, eventRelay) {
    "use strict";

    /// <summary>
    /// Events handled by iframe host controller.
    /// </summary>
    var events = Object.freeze({
        contentReady: "contentReady",
        contentLoaded: "contentLoaded",
        navigateTo: "navigateTo",
        navigationStarted: "navigationStarted",
        navigationCompleted: "navigationCompleted",
        navigateOut: "navigateOut",
        browserHistoryGoBack: "browserHistoryGoBack",
        getImageData: "ImageShareSourceGetImageData",
    });

    /// <summary>
    /// Id that is used to identify iframe hosting search results.
    /// </summary>
    var iframeRelayId = "BingSearchResults";

    var containedViewHostSelector = "#containedviewhost";

    function getIframe() {
        /// <summary>
        /// Gets the iframe element that hosts view content.
        /// </summary>
        /// <returns>
        /// The iframe element.
        /// </returns>
        return document.getElementById("externalcontenthost");
    }

    function handleNavigateTo(args) {
        /// <summary>
        /// Handles "navigateTo" message posted by content displayed inside iframe.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        // Hide iframe and keep it hidden until "contentReady" event is handled
        var iframe = getIframe();
        if (!WinJS.Utilities.hasClass(iframe, "hidden")) {
            WinJS.Utilities.addClass(iframe, "hidden");
        }

        var navigationUri = IframeHostController.getNavigationUriFromEventArgs(args);
        var options = IframeHostController.getNavigationOptionsFromEventArgs(args);

        BingApp.traceInfo("IframeHostController.handleNavigateTo: received 'navigateTo' message which is relayed from web compartment with Uri: {0}.", navigationUri);

        // NavigateTo maybe posted with the Uri that is identical to the current navigation Uri.
        // This will be the case when the controller raises "navigateOut" event to give a chance
        // for iframe to animate out its content. Navigation manager has an optimization that 
        // bypasses navigation stack in case navigation is requested to the current location.
        // In order to ensure that content is loaded we have to use refresh() method.
        var currentNavigationUri = navigationManager.getCurrentUri();
        if (currentNavigationUri && BingApp.Utilities.areEqualIgnoreCase(navigationUri, currentNavigationUri.absoluteUri)) {
            navigationManager.refresh();
        } else {
            navigationManager.navigateTo(navigationUri, options);
        }
    }

    function handleNavigationStarted(args) {
        /// <summary>
        /// Handles "navigationStarted" message posted by content displayed inside iframe.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        var navigationUri = IframeHostController.getNavigationUriFromEventArgs(args);

        BingApp.traceInfo("IframeHostController.handleNavigationStarted: received 'navigationStarted' message which is relayed from web compartment with Uri: {0}.", navigationUri);

        var currentNavigationStatus = navigationManager.getCurrentNavigationStatus();
        var currentContentStatus = navigationManager.getCurrentContentStatus();
        var currentUri = navigationManager.getCurrentUri();
        if (currentNavigationStatus === BingApp.Classes.NavigationManager.navigationStatus.navigating) {
            // cancel current navigation if it is pending
            BingApp.traceWarning("IframeHostController.handleNavigationStarted: 'navigationStarted' message was received while in 'navigating' state. Will cancel current navigation to {0}.", currentUri.absoluteUri);
            navigationManager.cancelNavigation(false);
        } else if (currentContentStatus === BingApp.Classes.NavigationManager.contentStatus.loading) {
            // cancel current content loading if it is pending
            BingApp.traceWarning("IframeHostController.handleNavigationStarted: 'navigationStarted' message was received while in waiting for completion of content loading. Will cancel current loading of {0}.", currentUri.absoluteUri);
            navigationManager.cancelNavigation(false);
        }

        navigationManager.notifyNavigationStarted(navigationUri);
    }

    function handleNavigationCompleted(args) {
        /// <summary>
        /// Handles "navigationCompleted" message posted by content displayed inside iframe.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        var navigationUri = IframeHostController.getNavigationUriFromEventArgs(args);

        BingApp.traceInfo("IframeHostController.handleNavigationCompleted: received 'navigationCompleted' message which is relayed from web compartment with Uri: {0}.", navigationUri);

        var currentNavigationStatus = navigationManager.getCurrentNavigationStatus();
        var currentContentStatus = navigationManager.getCurrentContentStatus();
        var currentUri = navigationManager.getCurrentUri();
        if (currentNavigationStatus === BingApp.Classes.NavigationManager.navigationStatus.idle &&
            currentContentStatus === BingApp.Classes.NavigationManager.contentStatus.loading) { 
            if (BingApp.Utilities.areEqualIgnoreCase(navigationUri, currentUri.absoluteUri)) {
                BingApp.traceInfo("IframeHostController.handleNavigationCompleted: navigation was initiated and completed inside app compartment; ignoring 'navigationCompleted' generated in web compartment.");
            } else {
                BingApp.traceWarning("IframeHostController.handleNavigationCompleted: ignoring 'navigationCompleted' message that was received while waiting for completing content loading: {0}.", navigationUri);
            }
            return;
        }

        if (currentNavigationStatus === BingApp.Classes.NavigationManager.navigationStatus.idle) {
            BingApp.traceWarning("IframeHostController.handleNavigationCompleted: ignoring 'navigationCompleted' message that was received while in 'idle' state: {0}.", navigationUri);
            return;
        }

        navigationManager.notifyNavigationCompleted(navigationUri, args.error, args.canceled);
    }

    function handleContentLoaded(args) {
        /// <summary>
        /// Handles "contentLoaded" message posted by content displayed inside iframe to indicate 
        /// that the content loading is completed.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        var navigationUri = IframeHostController.getNavigationUriFromEventArgs(args);

        BingApp.traceInfo("IframeHostController.handleContentLoaded: received 'contentLoaded' message which is relayed from web compartment with Uri: {0}.", navigationUri);

        var currentContentStatus = navigationManager.getCurrentContentStatus();
        if (currentContentStatus !== BingApp.Classes.NavigationManager.contentStatus.loading) {
            BingApp.traceWarning("IframeHostController.handleContentLoaded: ignoring 'contentLoaded' message that was received while content is not in 'loading' state: {0}.", navigationUri);
            return;
        }

        navigationManager.notifyContentLoaded(args.error, args.canceled);
    }

    function handleContentReady(args) {
        /// <summary>
        /// Handles "contentReady" message posted by content displayed inside iframe to indicate 
        /// that there is some content is available to be displayed.
        /// </summary>
        /// <param name="args">
        /// Message-related data.
        /// </param>
        BingApp.traceInfo("IframeHostController.handleContentReady: received 'contentReady' message which is relayed from web compartment.");

        var currentContentStatus = navigationManager.getCurrentContentStatus();
        if (currentContentStatus !== BingApp.Classes.NavigationManager.contentStatus.loading) {
            BingApp.traceWarning("IframeHostController.handleContentReady: ignoring 'contentReady' message that was received while content is not in 'loading' state.");
            return;
        }

        if (args) {
            BingApp.Instrumentation.updatePageIG(args.IG);
        }

        // Make iframe visible so the content can start showing
        var iframe = getIframe();
        WinJS.Utilities.removeClass(iframe, "hidden");

        // Update targetOrigin for iframe registration with event relay
        if (args) {
            eventRelay.registerIframe(iframeRelayId, iframe, args.targetOrigin);
        }
    }

    /// <summary>
    /// Defines class for iframehostview controller.
    /// </summary>
    var IframeHostController = WinJS.Class.derive(
        BingApp.Classes.ViewController,
        function constructor() {
            /// <summary>
            /// Instantiates new IframeHostController which incorporates iframehost view logic.
            /// </summary>
            /// <returns type="BingApp.Classes.IframeHostController">
            /// The controller for iframehost view.
            /// </returns>
            BingApp.Classes.ViewController.call(this);
        },
        {
            notifyUnloading: function () {
                /// <summary>
                /// Cleanup when the controller is unloaded.
                /// </summary>
                this._unregisterHandlers();

                // IMPORTANT:   Make iframe invisible and reset source to ensure that any 
                //              script running inside iframe seizes.
                var iframe = getIframe();
                WinJS.Utilities.addClass(iframe, "hidden");
                iframe.src = "about:blank";

                BingApp.Classes.ViewController.prototype.notifyUnloading.call(this);
            },
            setNavigationUri: function (uri, options) {
                /// <summary>
                /// This method is used by View Manager to set navigation Uri for the view.
                /// </summary>
                /// <param name="uri" type="Windows.Foundation.Uri">
                /// Navigation Uri.
                /// </param>
                /// <param name="options" optional="true">
                /// Optional argument which contains navigation options passed with navigation operation.
                /// </param>

                // Lazy initialization of handlers, happens when navigation Uri is set for first time
                this._registerHandlers();

                BingApp.traceInfo("IframeHostController.setNavigationUri: updating UI to reflect new navigation Uri: {0}.", uri.absoluteUri);

                // TODO:    Disabling support for Back history navigation optimization until this experience 
                //          gets supported by Images vertical
                /*
                if (options && options.useBrowserHistoryBack) {
                    eventRelay.fireEvent(events.browserHistoryGoBack);
                } else */{
                    var iframe = getIframe();
                    var bingUri = IframeHostController.translateNavigationUriToBingUri(uri);
                    if (!WinJS.Utilities.hasClass(iframe, "hidden")) {
                        // Search was initiated from outside of SERP while SERP is displayed; instead of 
                        // directly navigating we will raise "navigateOut" event to give a chance to 
                        // animate out the existing content.
                        eventRelay.fireEvent(events.navigateOut, { navigationUri: bingUri });
                    } else {
                        if (bingUri) {
                            BingApp.traceInfo("IframeHostController.setNavigationUri: setting iframe.src to: {0}.", bingUri);
                            iframe.src = bingUri;
                        } else {
                            BingApp.traceError("IframeHostController.setNavigationUri: failed to convert navigation Uri '{0}' to Bing Uri.", uri.absoluteUri);
                        }
                    }
                }
            },
            _registerHandlers: function () {
                /// <summary>
                /// Registers event handlers within the scope of this controller.
                /// </summary>
                if (!this._handlersAreRegistered) {
                    var iframe = getIframe();

                    // Allow iframe to send/receive events via relay
                    eventRelay.registerIframe(iframeRelayId, iframe);

                    // Content loading errors will be handled by loading error page inside iframe
                    BingApp.WebErrors.register(iframe);

                    // Subscribe to global events to be handled by iframe
                    eventRelay.addEventListener(BingApp.SoftKeyboard.events.visibilityChanged, iframeRelayId);
                    eventRelay.addEventListener(BingApp.ViewState.events.resize, iframeRelayId);
                    eventRelay.addEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, iframeRelayId);
                    eventRelay.addEventListener(events.getImageData, iframeRelayId);

                    // Subscribe to iframehost events to be handled by iframe
                    eventRelay.addEventListener(events.browserHistoryGoBack, iframeRelayId);
                    eventRelay.addEventListener(events.navigateOut, iframeRelayId);

                    // Handle navigation messages raised by iframe content
                    eventRelay.addEventListener(events.navigationStarted, handleNavigationStarted);
                    eventRelay.addEventListener(events.navigationCompleted, handleNavigationCompleted);
                    eventRelay.addEventListener(events.contentLoaded, handleContentLoaded);
                    eventRelay.addEventListener(events.contentReady, handleContentReady);
                    eventRelay.addEventListener(events.navigateTo, handleNavigateTo);

                    this._handlersAreRegistered = true;
                }
            },
            _unregisterHandlers: function () {
                /// <summary>
                /// Unregisters event handlers within the scope of this controller.
                /// </summary>
                if (this._handlersAreRegistered) {
                    var iframe = getIframe();

                    // Note that this will unsubscribe all listeners for iframeRelayId
                    eventRelay.unregisterIframe(iframeRelayId);

                    BingApp.WebErrors.unregister(iframe);

                    eventRelay.removeEventListener(events.navigationStarted, handleNavigationStarted);
                    eventRelay.removeEventListener(events.navigationCompleted, handleNavigationCompleted);
                    eventRelay.removeEventListener(events.contentLoaded, handleContentLoaded);
                    eventRelay.removeEventListener(events.contentReady, handleContentReady);
                    eventRelay.removeEventListener(events.navigateTo, handleNavigateTo);

                    this._handlersAreRegistered = false;
                }
            },
            /// <summary>
            /// Internal flag indicating whether controller has registered event handlers.
            /// </summary>
            _handlersAreRegistered: false,
        },
        {
            translateNavigationUriToBingUri: function (uri) {
                /// <summary>
                /// Gets the Bing URI associated with the provided navigation URI.
                /// </summary>
                /// <param name="uri" type="Windows.Foundation.Uri">
                /// The navigation URI.
                /// </param>
                /// <returns type="String">
                /// The string representing absolute path for Bing URI which corresponds to the 
                /// provided navigation URI.
                /// </returns>
                var query = uri.query;
                var path = uri.path;
                var bingUrl = env.getHostUrl().trim();
                var bingPath;
                var bingQuery;
                var bingFragment = uri.fragment;

                switch (path) {
                    case "/search":
                        bingPath = "/search";
                        bingQuery = query;
                        break;
                    case "/images/grid":
                        bingPath = "/images/search";
                        bingQuery = query;
                        break;
                    case "/images/detail":
                        bingPath = "/images/search";
                        if (query) {
                            bingQuery = query + "&view=detail";
                        } else {
                            bingQuery = "?view=detail";
                        }
                        break;
                    default:
                        BingApp.traceError("IframeHostController.translateNavigationUriToBingUri: cannot translate '{0}' to Bing Uri; unknown Uri path '{1}'.", uri.absoluteUri, path);
                        throw new BingApp.Classes.ErrorArgument("uri", BingApp.Utilities.format(WinJS.Resources.getString("error_unhandled_navigation_uri").value, path));
                }

                bingQuery = env.getQueryStringWithIFrameParams(bingQuery, window);

                // Compose Bing Url from all parts
                bingUrl = bingUrl + bingPath + bingQuery;

                if (bingFragment) {
                    bingUrl = bingUrl + bingFragment;
                }

                return bingUrl;
            },
            translateBingUriToNavigationUri: function (uri) {
                /// <summary>
                /// Gets the navigation URI associated with the provided Bing URI.
                /// </summary>
                /// <param name="uri" type="Windows.Foundation.Uri">
                /// The Bing URI.
                /// </param>
                /// <returns type="String">
                /// The string representing absolute path of the navigation URI corresponding 
                /// to the provided Bing URI.
                /// </returns>

                // Ensure that Bing Uri comes from expected host
                var bingHost = env.getHostUrl().trim();
                var indexInsideUri = uri.absoluteUri.indexOf(bingHost);
                if (indexInsideUri !== 0) {
                    BingApp.traceError("IframeHostController.translateBingUriToNavigationUri: given Bing Url comes from unexpected host: {0}.", uri.absoluteUri);
                }

                var navigationProtocolAndHost = "bingsearch://app";
                var navigationPath;
                var navigationQuery;
                var navigationFragment = uri.fragment;
                var path = uri.path;
                var query = uri.query;
                switch (path) {
                    case "/search":
                        navigationPath = "/search";
                        navigationQuery = query;
                        break;
                    case "/images/search":
                        var indexOfDetail = query.indexOf("view=detail");
                        if (indexOfDetail > 0) {
                            navigationPath = "/images/detail";
                            // Remove view=detail from query
                            navigationQuery = BingApp.Utilities.QueryString.remove(query, "view");
                        }
                        else {
                            navigationPath = "/images/grid";
                            navigationQuery = query;
                        }
                        break;
                    default:
                        BingApp.traceError("IframeHostController.translateBingUriToNavigationUri: cannot translate '{0}' to navigation Uri; unknown Uri path '{1}'.", uri.absoluteUri, path);
                        throw new BingApp.Classes.ErrorArgument("uri", BingApp.Utilities.format(WinJS.Resources.getString("error_unhandled_bing_uri").value, path));
                }

                var navigationUri = navigationProtocolAndHost + navigationPath;

                navigationQuery = env.sanitizeQueryString(navigationQuery);
                if (navigationQuery && navigationQuery.length > 1) {
                    navigationUri = navigationUri + navigationQuery;
                }

                if (navigationFragment) {
                    navigationUri = navigationUri + navigationFragment;
                }

                return navigationUri;
            },
            getNavigationUriFromEventArgs: function (args) {
                /// <summary>
                /// Extracts the navigation URI from arguments passed with navigation-related messages.
                /// </summary>
                /// <param name="args">
                /// Message-related data.
                /// </param>
                /// <returns type="String">
                /// The navigation URI corresponding to the provided arguments.
                /// </returns>
                if (!args) {
                    throw new BingApp.Classes.ErrorArgumentNullOrUndefined("args");
                }

                if (!args.uri) {
                    // TODO:    Temporary workaround for the problem with "navigateTo" message sent as a 
                    //          result of "navigateOut" event.
                    //throw new BingApp.Classes.ErrorArgument("args", WinJS.Resources.getString("error_navigation_message_payload_must_contain_uri").value);
                    return navigationManager.getCurrentUri().absoluteUri;
                }

                var bingUri = args.uri;
                if (typeof bingUri === "string") {
                    bingUri = new Windows.Foundation.Uri(bingUri);
                }

                return IframeHostController.translateBingUriToNavigationUri(bingUri);
            },
            getNavigationOptionsFromEventArgs: function (args) {
                /// <summary>
                /// Extracts the navigation options from arguments passed with navigation-related messages.
                /// </summary>
                /// <param name="args">
                /// Message-related data.
                /// </param>
                /// <returns>
                /// The navigation options stored in the provided arguments.
                /// </returns>

                return args ? args.options : null;
            },
            events: events,
        });

    function getController() {
        /// <summary>
        /// Gets the controller object used by View Manager to communicate with this view. This
        /// getter method initializes the controller lazily.
        /// </summary>
        /// <returns>
        /// The view controller.
        /// </returns>
        if (!this._controller) {
            this._controller = new IframeHostController();
        }
        return this._controller;
    }

    function ready() {
        /// <summary>
        /// Initializes the iframehost page when it is loaded.
        /// </summary>

        var containedViewHost = document.querySelector(containedViewHostSelector);
        if (containedViewHost) {
            containedViewHost.style.height = "100%";
        }
    };

    // This will define the constructor for object representing this view
    WinJS.UI.Pages.define("/views/iframehost/html/iframehost.html", {
        ready: ready,
        getController: getController,
        _controller: null,
    });
})(BingApp.locator.navigationManager, BingApp.locator.env, BingApp.locator.eventRelay);
