/// <reference path='//Microsoft.WinJS.1.0/js/base.js' />
/// <reference path='../../../shell/js/env.js' />
/// <reference path='../../../shell/js/navigation.js' />
/// <reference path='../../../shell/js/servicelocator.js' />
/// <reference path='../../../shell/js/shell.js' />
/// <reference path='../../../data/js/localstoragecacheprovider.js' />
/// <reference path='../../../data/js/listviewmodel.js' />
/// <reference path='../../../data/js/listviewmodelrefresher.js' />
(function () {
    "use strict";

    var containedviewhostHeight = "65px";
    var containedviewhostHeightNoDisplay = "0px";
    var maxDisplayedTrends = 4;
    var defaultRefreshInterval = 6 * 60 * 60;    // how often we refresh the trends data (6 hours in seconds)
    var refreshStorageKey = "HomeViewPopularNowLastRefresh";
    var cacheProviderIdentity = "bingsearch://cache/homepopularnow";
    // TODO:    Right now this is the only reason to load trendingController.js - to get the name for 
    //          identifier used to determine whether trends info is available. Maybe it makes sense to
    //          extract this information into separate .js file that can be shared across Home and 
    //          Trends views.
    var trendsDataProviderId = BingApp.Classes.TrendingController.trendIds.popularNowText;

    function hideTrendsControl() {
        /// <summary>
        /// Hides the trends control
        /// </summary>
        trendsTitle.style.display = "none";
        moreButton.style.display = "none";
        containedviewhost.style.height = containedviewhostHeightNoDisplay;
    }

    function showTrendsControl() {
        /// <summary>
        /// Shows the trends control
        /// </summary>
        trendsTitle.style.display = "";
        moreButton.style.display = "";
        containedviewhost.style.height = containedviewhostHeight;
    }

    function openStartView() {
        /// <summary>
        /// Opens the start view
        /// </summary>
        BingApp.locator.navigationManager.navigateTo(BingApp.Classes.Shell.uris.start);
    }

    function ondatarequested() {
        /// <summary>
        /// Handles the share charm event
        /// </summary>
        var defaultHost = BingApp.locator.env.getHostUrl();
        var collection = {};
        collection["cc"] = Windows.System.UserProfile.GlobalizationPreferences.homeGeographicRegion;
        collection["form"] = BingApp.Classes.Shell.formCodes.fromShareCharmStart;

        var uri = null;
        try {
            uri = new Windows.Foundation.Uri(defaultHost + BingApp.Utilities.QueryString.serialize(collection));
        }
        catch (e) {
            BingApp.traceError("HomeViewController.ondatarequested: invalid uri. Setting to null.");
        }

        BingApp.ShareSource.addShareSources(WinJS.Resources.getString("app_name").value, defaultHost, uri, null, null, null);
    }

    function populateTrendsContainer(container, trends) {
        /// <summary>
        /// Populate trends container with elements representing given trnd items
        /// </summary>
        /// <param name="container">
        /// Element containing visuals representing trend items.
        /// </param>
        /// <param name="trends">
        /// List of trend items to visualize.
        /// </param>
        WinJS.Utilities.empty(container);

        if (trends.length === 0) {
            hideTrendsControl();
            return;
        }

        var fragment = document.createDocumentFragment();

        // Tabindex for trendsArticle starts 12 due to 
        // trendsArticle is after the trendsTitle in tabOrder.
        var tabStartIndex = 12;
        trends.forEach(function (item, index) {
            var title = null;
            switch (item.type) {
                case "text":
                    title = item.title;
                    break;
                case "news":
                    title = item.Title;
                    break;
                case "image":
                    title = item.SearchTermDisplay;
                    break;
                default:
                    BingApp.traceError("HomeViewController.populateTrendsContainer: item.type in trends small container should only be text, news, or image. current item.type: {0}",item.type);
                    throw new BingApp.Classes.ErrorArgument("item", "item.type should only be text, news, or image");
            }

            var element = document.createElement("a");
            var elementId = "trendsArticle" + index;
            element.id = elementId;
            element.setAttribute("aria-label", elementId);
            element.tabIndex = tabStartIndex++;
            element.innerText = title;
            WinJS.Utilities.addClass(element, "trendsArticle");

            fragment.appendChild(element);

            element.onclick = function () {
                handleTrendsArticleClick(item, index);
            };

            element.onkeydown = function (evt) {
                if (BingApp.Utilities.isKeyDownAndSpaceOrEnterKey(evt)) {
                    handleTrendsArticleClick(item, index);
                }
            };

        });

        moreButtonArrow.tabIndex = tabStartIndex;
        if (fragment.childNodes.length > 0) {
            showTrendsControl();
        } else {
            hideTrendsControl();
        }

        container.appendChild(fragment);

        showHideTrendsArticles();
    }

    function showHideTrendsArticles() {
        /// <summary>
        /// Hides or shows trend articles individually based on whether they go past the more button or not
        /// </summary>

        var trendsArticleElements = document.querySelectorAll(".trendsArticle");
        for (var i = 1; i < trendsArticleElements.length; i++) {
            var articleElement = trendsArticleElements[i];
            if ((articleElement.offsetLeft + articleElement.offsetWidth) > moreButton.offsetLeft) {
                articleElement.style.display = "none";
            }
            else {
                articleElement.style.display = "";
            }
        }
    }

    function handleConfigChanged(refresher, oldConfig, newConfig) {
        /// <summary>
        /// This function is called when refresher encounters change to application configuration.
        /// </summary>
        /// <param name="refresher" type = "BingApp.Classes.ListViewModelRefresher">
        /// Refresher object that called this handler.
        /// </param>
        /// <param name="oldConfig">
        /// Old configuration object.
        /// </param>
        /// <param name="newConfig">
        /// New configuration object.
        /// </param>
        if (newConfig) {
            // Determine if refresh interval needs to be updated
            if (newConfig.trends.enabled) {
                var refreshInterval = newConfig.trends.popularNowText.ttl;
                if (refreshInterval !== refresher.interval) {
                    refresher.updateInterval(refreshInterval);
                }

                // TODO:    Need to implement logic that electively forces refresh upon changes to 
                //          configuration. The logic could be fairly complicated. For instance, 
                //          if configuration indicates that trends data is no longer enabled then 
                //          we need to hide the entire trend band. For now we do not account for that 
                //          and simply force immediate refresh.
                refresher.forceRefresh();
            } else {
                hideTrendsControl();
            }
        }
    }

    function handleTrendsArticleClick(item, index) {
        /// <summary>
        /// This function is called when the trendsarticle is clicked or on keydown event
        /// </summary>
        /// <param name="item">
        /// data for item that was clicked
        /// </param>
        /// <param name="index">
        /// index of the item that was clicked
        /// </param>

        // REVIEW:  Shall we have common code handling click on popular now trend that 
        //          can be used here and in trendingController?

        if (item.type === "text") {
            var instrumentionObj = { name: "PopularClick", TrendPos: index, TrendType: "Text" };
            BingApp.Instrumentation.logClick(instrumentionObj);
            BingApp.Classes.TrendingController.navigateToVertical(item.Url || item.link);
        }
        else if (item.type === "news") {
            try {
                var instrumentionObj = { name: "PopularClick", TrendPos: index, TrendType: "News" };
                BingApp.Instrumentation.logClick(instrumentionObj);

                if (item.Url) {
                    BingApp.Utilities.invokeURI(item.Url);
                } else {
                    BingApp.traceError("HomeViewController.handleTrendsArticleClick: failed to launch news because item data does not have news url.");
                }
            }
            catch (e) {
                BingApp.traceError("Launching Uri failed for uri {0}", item.url);
            }
        }
        else if (item.type === "image") {
            var instrumentionObj = { name: "PopularClick", TrendPos: index, TrendType: "Visual" };
            BingApp.Instrumentation.logClick(instrumentionObj);
            BingApp.Classes.TrendingController.navigateToVertical(item.Url);
        }
    }

    function handleKeyDownForTrendsAndMore(evt) {
        /// <summary>
        /// Opens the start view for enter/space keys
        /// </summary>
        if (BingApp.Utilities.isKeyDownAndSpaceOrEnterKey(evt)) {
            openStartView();
        }
    }

    /// <summary>
    /// Defines class for home view controller.
    /// </summary>
    var HomeViewController = WinJS.Class.derive(
        BingApp.Classes.ViewController,
        function () {
            /// <summary>
            /// Instantiates a new HomeViewController.
            /// </summary>
            BingApp.Classes.ViewController.call(this);
        },
        {
            notifyViewReady: function () {
                /// <summary>
                /// Notifies that the home view page is ready.
                /// </summary>
                WinJS.Resources.processAll();
                var providers = [];

                // do not fetch trend data for RTL markets
                var direction = document.defaultView.getComputedStyle(document.body, null).direction;
                if (direction === "ltr") {
                    var trendIds = BingApp.Classes.TrendingController.trendIds;

                    var textProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.popularNowText) ? new BingApp.Classes.PopTextDataProvider() : null;
                    if (textProvider) {
                        providers.push(textProvider);
                    }

                    var msnTextProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.msnTrends) ? new BingApp.Classes.MsnTrendingDataProvider() : null;
                    if (msnTextProvider) {
                        providers.push(msnTextProvider);
                    }

                    var imagesProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.popularNowVisual) ? new BingApp.Classes.PopVisualDataProvider() : null;
                    if (imagesProvider) {
                        providers.push(imagesProvider);
                    }

                    var newsProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.bingNews) ? new BingApp.Classes.BingNewsDataProvider() : null;
                    if (newsProvider) {
                        providers.push(newsProvider);
                    }
                }

                if (providers.length > 0) {
                    var trendsProvider = new BingApp.Classes.AggregateDataProvider("bingsearch://data/aggregateproviderforsmallhomeviewtrends", providers);

                    // Create list view model for trends and refresher object that will take care
                    // of updating trends at specific interval.
                    var listViewModel = new BingApp.Classes.ListViewModel(
                        trendsProvider,
                        new BingApp.Classes.LocalStorageCacheProvider(cacheProviderIdentity, "id"));

                    var refreshInterval = defaultRefreshInterval;
                    var configuration = BingApp.locator.appConfiguration.configuration;
                    if (configuration && configuration.trends && configuration.trends.popularNowText) {
                        refreshInterval = configuration.trends.popularNowText.ttl || refreshInterval;
                    }

                    this.refresher = new BingApp.Classes.ListViewModelRefresher(listViewModel, {
                        interval: refreshInterval,
                        lastRefreshDateStorageKey: refreshStorageKey,
                        refreshOptions: { count: maxDisplayedTrends },
                        onConfigChanged: handleConfigChanged,
                    });

                    // Setup listener for completion of list view model's refresh operation
                    // upon which new trends items will be displayed.
                    this._trendsRefreshListener = function () {
                        var list = listViewModel.getList();
                        populateTrendsContainer(trendsTitlesContainer, list);
                    };
                    listViewModel.addEventListener(BingApp.Classes.ListViewModel.events.refreshFinished, this._trendsRefreshListener);

                    // Make sure that trends elements are created upon loading of the page
                    this._trendsRefreshListener();
                    trendsTitle.addEventListener("click", openStartView);
                    moreButton.addEventListener("click", openStartView);
                    trendsTitle.addEventListener("keydown", handleKeyDownForTrendsAndMore);
                    moreButton.addEventListener("keydown", handleKeyDownForTrendsAndMore);
                    BingApp.ShareSource.ondatarequested = ondatarequested;

                    // register for the network change events
                    if (!this._onNetworkStatusChangeWrapper) {
                        var self = this;

                        this._onNetworkStatusChangeWrapper = function (eventArgs) {
                            if (eventArgs.connectionState === BingApp.Classes.NetworkDetectionService.connectionStates.internetAccess) {
                                // before showing the trending control, see if we have any prepopulated content
                                if (trendsTitlesContainer.childNodes.length > 0) {
                                    showTrendsControl();
                                } else {
                                    // we have network connection now, so force a refresh since we do not have any content
                                    // in the trending control
                                    self.refresher.forceRefresh();
                                }
                            } else {
                                hideTrendsControl();
                            }
                        }
                    }

                    BingApp.locator.eventRelay.addEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);

                    // check if we have internet connection since the event might have already fired
                    if (!BingApp.locator.networkDetectionService.isConnected()) {
                        hideTrendsControl();
                    }
                } else {
                    hideTrendsControl();
                }

                window.addEventListener("resize", showHideTrendsArticles, false);

                bgImagePanorama.focus();

                BingApp.locator.navigationManager.notifyContentLoaded();

                BingApp.Instrumentation.updatePageIG();
            },
            notifyUnloading: function () {
                /// <summary>
                /// Handles unloading of this view from Bing App.
                /// </summary>
                trendsTitle.removeEventListener("click", openStartView);
                moreButton.removeEventListener("click", openStartView);
                trendsTitle.removeEventListener("keydown", handleKeyDownForTrendsAndMore);
                moreButton.removeEventListener("keydown", handleKeyDownForTrendsAndMore);
                window.removeEventListener("resize", showHideTrendsArticles);

                BingApp.ShareSource.ondatarequested = null;

                if (this.refresher) {
                    this.refresher.listViewModel.removeEventListener(BingApp.Classes.ListViewModel.events.refreshFinished, this._trendsRefreshListener);
                    this._trendsRefreshListener = null;
                    this.refresher.dispose();
                    this.refresher = null;
                }

                if (this._onNetworkStatusChangeWrapper) {
                    BingApp.locator.eventRelay.removeEventListener(BingApp.Classes.NetworkDetectionService.networkStatusChangedEvent, this._onNetworkStatusChangeWrapper);
                    this._onNetworkStatusChangeWrapper = null;
                }

                BingApp.Classes.ViewController.prototype.notifyUnloading.call(this);
            },
            /// <summary>
            /// Reference to listener that is notified when trends data is refreshed.
            /// </summary>
            _trendsRefreshListener: null,
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
            this._controller = new HomeViewController();
        }
        return this._controller;
    };

    var ready = function () {
        /// <summary>
        /// Initializes the home view page when it is loaded.
        /// </summary>
        this.getController().notifyViewReady();
    };

    // This will define the constructor for object representing this view
    WinJS.UI.Pages.define("/views/home/html/homeview.html", {
        ready: ready,
        getController: getController,
        _controller: null
    });
})();