﻿/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../../shell/js/sharesource.js' />
/// <reference path='../../../shell/js/viewcontroller.js' />
(function () {
    "use strict";

    var allListViewSelector = "#startPanorama .win-listview",
        containedViewHostSelector = "#containedviewhost",
        listBindingInProgress = false,
        mainViewMessageShowContent = "mainView:showContent";

    /// <summary>
    /// Defines class for start view controller.
    /// </summary>
    var StartViewController = WinJS.Class.derive(
        BingApp.Classes.ViewController,
        function constructor(startViewPage) {
            /// <summary>
            /// Instantiates a new StartViewController.
            /// </summary>
            /// <param name="startViewPage">
            /// The start view page.
            /// </param>
            BingApp.Classes.ViewController.call(this);

            this._startViewPage = startViewPage;
        },
        {
            notifyViewReady: function () {
                /// <summary>
                /// Notifies that the start view page is ready.
                /// view page.
                /// </summary>

                BingApp.ShareSource.ondatarequested = ondatarequested;

                if (!this._onNetworkStatusChangeWrapper) {
                    var self = this;
                    this._onNetworkStatusChangeWrapper = function (eventArgs) {
                        self._startViewPage.onNetworkStatusChange(eventArgs);
                    };
                }

                if (!this._onShowContent) {
                    this._onShowContent = function (eventArgs) {
                        // ListViews need a nudge when they are shown again after hiding them: http://msdn.microsoft.com/en-us/library/windows/apps/Hh758352.aspx
                        trendsListView && trendsListView.winControl && trendsListView.winControl.forceLayout();
                    };
                }

                BingApp.locator.eventRelay.addEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);
                BingApp.locator.eventRelay.addEventListener(mainViewMessageShowContent, this._onShowContent);

                BingApp.locator.navigationManager.notifyContentLoaded();
            },

            notifyUnloading: function () {
                /// <summary>
                /// Cleanup when the controller is unloaded
                /// </summary>
                var eventRelay = BingApp.locator.eventRelay;

                if (this._onNetworkStatusChangeWrapper) {
                    eventRelay.removeEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);
                }

                if (this._onShowContent) {
                    eventRelay.removeEventListener(mainViewMessageShowContent, this._onShowContent);
                }

                if (BingApp.Classes.TrendingController.TrendingViewRefreshListener) {
                    eventRelay.removeEventListener(BingApp.Classes.AppConfiguration.events.configChanged, BingApp.Classes.TrendingController.TrendingViewRefreshListener);
                }

                this._onNetworkStatusChangeWrapper = null;
                BingApp.Classes.TrendingController.TrendingViewRefreshListener = null;

                BingApp.Classes.TrendingController.onUnload();

                BingApp.ShareSource.ondatarequested = null;
                listBindingInProgress = false;

                BingApp.Classes.ViewController.prototype.notifyUnloading.call(this);
            },
            _onNetworkStatusChangeWrapper: null
        }
    );

    var getController = function () {
        /// <summary>
        /// Gets the controller object used by View Manager to communicate with this view. This
        /// getter method initializes the controller lazily.
        /// </summary>
        /// <returns>
        /// The view controller.
        /// </returns>
        if (!this._controller) {
            this._controller = new StartViewController(this);
        }
        return this._controller;
    };

    var ready = function () {
        /// <summary>
        /// Initializes the start view page when it is loaded.
        /// </summary>

        var containedViewHost = document.querySelector(containedViewHostSelector);
        if (containedViewHost) {
            containedViewHost.style.height = "100%";
        }
                
        // check if we have internet connection since the event might have already fired before we registered
        if (!BingApp.locator.networkDetectionService.isConnected()) {
            onNetworkStatusChange({ connectionState: BingApp.Classes.NetworkDetectionService.connectionStates.none });
        } else {
            processTrends();
        }

        this.getController().notifyViewReady();
    };

    function onNetworkStatusChange(eventArg) {
        /// <summary>
        /// Handles the network change event. It shows the network indicator image if the connection is not available and hides the
        /// the image as soon as the internet connectivity is restored.
        /// </summary>
        /// <param name="eventArgs" type="Object">
        /// Event arguments
        /// </param>

        if (eventArg.connectionState === BingApp.Classes.NetworkDetectionService.connectionStates.internetAccess) {
            processTrends();
        } else {
            hideTrendsHub();
        }
    }
    
    function processTrends() {
        /// <summary>
        /// Shows/hides the trending hub depending on whether the feature is available for the market
        /// </summary>

        if (BingApp.Classes.TrendingController.trendsAvailableForCurrentMarket()) {

            trendsListViewContainer.style.display = "inline-block";

            if (!listBindingInProgress) {
                // we want to bind the list only once, thereafter we only show/hide the parent divs
                listBindingInProgress = true;
                BingApp.Classes.TrendingController.doBinding();
            }
            else {
                BingApp.Classes.TrendingController.onVisible();
            }
        } else {
            hideTrendsHub();
        }
    }

    function hideTrendsHub() {
        /// <summary>
        /// Hides the trending hub
        /// </summary>

        trendsListViewContainer.style.display = "none";
    }

    var ondatarequested = function () {
        /// <summary>
        /// Handles the share charm event
        /// </summary>

        var defaultHost = BingApp.locator.env.getHostUrl();
        var collection = {};
        collection["cc"] = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
        collection["form"] = BingApp.Classes.Shell.formCodes.fromShareCharmTrending;

        var uri = null;
        try {
            uri = new Windows.Foundation.Uri(defaultHost + BingApp.Utilities.QueryString.serialize(collection));
        }
        catch (e) {
            BingApp.traceError("startview.ondatarequested: invalid uri. Setting to null.");
        }

        BingApp.ShareSource.addShareSources(WinJS.Resources.getString("app_name").value, defaultHost, uri, null, null, null);
    }

    // This will define the constructor for object representing this view
    WinJS.UI.Pages.define("/views/start/html/startview.html", {
        ready: ready,
        getController: getController,
        onNetworkStatusChange: onNetworkStatusChange,
        _controller: null,
        _directionFactor: undefined
    });
})();