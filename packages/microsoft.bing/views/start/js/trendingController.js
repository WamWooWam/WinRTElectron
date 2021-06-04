/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
/// <reference path='../../../common/js/tracing.js' />
/// <reference path='../../../common/js/utilities.js' />
/// <reference path="../../../common/js/querystringcollection.js" />
/// <reference path="../../../shell/js/env.js" />
(function () {
    "use strict";

    var localSettings = Windows.Storage.ApplicationData.current.localSettings;

    // private static members
    var cellWidth = 260;
    var cellHeight = 125;
    var minRows = 4;
    var rowSpacing = 10;
    var newsItemRows = 4;
    var heroItemRows = 3;
    var imageItemRows = 2;
    var textItemRows = 1;
    var newsRandomWeight = 2;       // higher number means News will appear more frequently at beginning of listview for random algorithm
    var lastUpdateThreshold = 8;    // number of hours before we display "Last Updated" string
    var imageAttribution = "";
    var searchBarUri = BingApp.Classes.Shell.uris.search + "?form=" + BingApp.Classes.Shell.formCodes.fromTrendingSearch + "&q=";
    var imagesUri = BingApp.Classes.Shell.uris.imagesgrid + "?form=" + BingApp.Classes.Shell.formCodes.fromTrendingSearch + "&q=";
    var storageKey = "BingApp.Classes.Trending";
    var viewStateKey = "BingApp.Classes.Trending.ViewData";
    var loadEvent = "Cl.TrendLoad";
    var lastUpdatedText = "";
    var refreshInterval = 21600;    // how often we refresh the data from the data providers (in seconds)
    var textListShiftLength = 2;    // we are shifting textlist by 2 so we need to make sure we have 2 items in the list to shift 
    var trendsMetrics = null;
    var supportedNumberOfRows = [4, 6];
    var maxColumns = 8;
    var maxNewsItems = 2;
    var numDisplayedNews = 0;
    var trendingViewModel = null;
    var ellipses = "...";           // TODO: It's possible this could be localized. Add to loc files
    var eventsBound = false;
    var showCopyright = false;

    // TODO: The following is based off of font size and typeface used in en-us. We may need to calculate this value
    // if different markets use different sizes and typefaces.
    var newsTitleMaxHeight = 105;   // 3 lines of text styled for news item title
    var textItemMaxHeight = 137;    // 3 lines of text style for text caption


    /// <summary>
    /// Internal object representing the ids of different trend configuration objects.
    /// </summary>
    var trendIds = Object.freeze({
        msnTrends: "msnTrends",
        bingNews: "bingNews",
        popularNowText: "popularNowText",
        popularNowVisual: "popularNowVisual",
    });

    var TrendingViewRefreshListener = WinJS.Class.define(
       function (trendingViewModel) {
           /// <summary>
           /// Creates an TrendingViewRefreshListener object can listen to events and referesh Trends
           /// </summary>
           /// <param name="trendingViewModel" type="BingApp.Classes.ListViewModel">
           /// The view model that gets refreshed.
           /// </param>
           /// <returns type="BingApp.Classes.TrendingViewRefreshListener">
           /// TrendingViewRefreshListener instance.
           /// </returns>
           if (!(this instanceof BingApp.Classes.TrendingViewRefreshListener)) {
               BingApp.traceWarning("TrendingViewRefreshListener.ctor: Attempted using TrendingViewRefreshListener ctor as function; redirecting to use 'new TrendingViewRefreshListener()'.");
               return new BingApp.Classes.TrendingViewRefreshListener(trendingViewModel);
           }

           if (!trendingViewModel) {
               throw new BingApp.Classes.ErrorArgumentNullOrUndefined("trendingViewModel");
           }

           if (!(trendingViewModel instanceof BingApp.Classes.ListViewModel)) {
               throw new BingApp.Classes.ErrorArgument("trendingViewModel","trendingViewModel is not an instance of BingApp.Classes.ListViewModel");
           }

           if (!trendingViewModel.refresh || typeof (trendingViewModel.refresh) !== "function") {
               throw new BingApp.Classes.ErrorArgument("trendingViewModel","trendingViewModel does not have a refresh function");
           }

           this.trendingViewModel = trendingViewModel;
           this._refreshInProgress = null;

       }, {
           refresh: function () {
               var that = this;
               function refreshOperation() {
                   that._refreshInProgress = new WinJS.Promise(
                   function init(complete, error) {
                       BingApp.traceInfo("Trends View refresh start");
                       that.trendingViewModel.refresh().done(function () {
                           BingApp.traceInfo("Trends View refresh completed");
                           if (trendsListView) {
                               calcTrendsViewMetrics();

                               lastUpdatedText = "";
                               WinJS.Application.sessionState[viewStateKey] = null;
                               bindTrendingListView(that.trendingViewModel);
                               localSettings.values[storageKey] = JSON.stringify({
                                   lastRefresh: new Date()
                               });
                           }
                           complete();
                       }, error);
                   });
               };

               if (this._refreshInProgress) {
                   this._refreshInProgress.done(refreshOperation, function (err) {
                       BingApp.traceError("TrendingViewRefreshListener.refresh: failed to referesh trending  UI. Exact error message is {0}", err.message);
                   });
               } else {
                   refreshOperation();
               }
           },
           callback: function () {
               this.refresh();
           }
       });

    WinJS.Namespace.define("BingApp.Classes", {
        TrendingViewRefreshListener: TrendingViewRefreshListener
    });

    function doBinding(recalcLayout) {
        /// <summary>
        /// Binds trending data to the trending ListView
        /// </summary>
        /// <param name="recalcLayout" type="bool" optional="true">
        /// True to ensure the metrics are recalculated. False otherwise. Default is true
        /// </param>

        var recalc = (BingApp.Utilities.isNotNullOrUndefined(recalcLayout)) ? recalcLayout : true;
        if (recalc) {
            calcTrendsViewMetrics();
        }

        if (BingApp.locator.appConfiguration.configuration) {
            var trendsNode = BingApp.locator.appConfiguration.configuration.trends;
            maxColumns = trendsNode.maxColumns;
            maxNewsItems = trendsNode.bingNews.maxItems;
        }

        initListeners();

        if (!trendingViewModel) {
            trendingViewModel = createTrendingViewModel();
        }

        // check if refresh has happened in the last 6 hours and if so, use cached data
        var doRefresh = false;

        var refreshData = localSettings.values[storageKey];
        if (refreshData) {
            try {
                var lastRefresh = new Date(JSON.parse(refreshData).lastRefresh);
            }
            catch (e) {
                doRefresh = true;
            }

            if (!doRefresh) {
                var curTime = new Date();

                // determine how stale the cached data is in hours
                var cacheHours = (curTime - lastRefresh) / 3600000;
                if (cacheHours > lastUpdateThreshold) {
                    // update last updated string
                    if (cacheHours > 24) {
                        if (cacheHours >= 48) {
                            var formatString = WinJS.Resources.getString("trending_lastupdated_days_ago").value;
                            lastUpdatedText = BingApp.Utilities.format(formatString, Math.floor(cacheHours / 24));
                        }
                        else {
                            lastUpdatedText = WinJS.Resources.getString("trending_lastupdated_day_ago").value;
                        }
                    }
                    else {
                        var formatString = WinJS.Resources.getString("trending_lastupdated_hours_ago").value;
                        lastUpdatedText = BingApp.Utilities.format(formatString, Math.floor(cacheHours));
                    }
                }

                if (BingApp.locator.appConfiguration.configuration) {
                    refreshInterval = BingApp.locator.appConfiguration.configuration.trends.bingNews.ttl;
                }

                // move last refresh up by refreshInterval to determine if we need to refresh cache
                lastRefresh.setHours(lastRefresh.getHours() + (refreshInterval / 3600));
                if (lastRefresh <= curTime) {
                    doRefresh = true;
                }
            }

            bindTrendingListView(trendingViewModel);
        }
        else {
            doRefresh = true;
        }

        if (!BingApp.Classes.TrendingController.TrendingViewRefreshListener) {
            BingApp.Classes.TrendingController.TrendingViewRefreshListener = new BingApp.Classes.TrendingViewRefreshListener(trendingViewModel);
        } else {
            BingApp.Classes.TrendingController.TrendingViewRefreshListener.trendingViewModel = trendingViewModel;
        }

        if (doRefresh) {
            BingApp.Classes.TrendingController.TrendingViewRefreshListener.refresh();
        }

        // Listening to config file changed event to refresh the view
        if (!BingApp.locator.eventRelay.isRegisteredEventListener(BingApp.Classes.AppConfiguration.events.configChanged, BingApp.Classes.TrendingController.TrendingViewRefreshListener)) {
            BingApp.locator.eventRelay.addEventListener(BingApp.Classes.AppConfiguration.events.configChanged, BingApp.Classes.TrendingController.TrendingViewRefreshListener);
        }
    }

    function navigateToVertical(url) {
        /// <summary>
        /// Detects vertical by parsing the search url and if the 
        /// vertical is search navigates to search within app and
        /// if vertical is images opens link in IE
        /// </summary>
        if (!url) {
            BingApp.traceError("TrendingController.navigateToVertical: failed to launch search because item data does not have url.");
            return;
        }

        // Convert to navigation uri if possible
        url = BingApp.Classes.Shell.getAppPathFromWebPath(url) || url;
        var navigationUri = new Windows.Foundation.Uri(url);

        var originalQuery = navigationUri.query;
        var queryStringCollection = BingApp.Utilities.QueryString.parse(originalQuery, { decode: true });

        // Remove all query parameters except for "q="
        Object.keys(queryStringCollection).forEach(function (parameter) {
            if (!BingApp.Utilities.areEqualIgnoreCase(parameter, "q")) {
                delete queryStringCollection[parameter];
            }
        });

        // Append form code to query
        queryStringCollection["form"] = BingApp.Classes.Shell.formCodes.fromTrendingSearch;

        // Generate query that will be passed instead of original one
        var updatedQuery = BingApp.Utilities.QueryString.serialize(queryStringCollection);
        updatedQuery = BingApp.locator.env.sanitizeQueryString(updatedQuery);

        url = url.replace(originalQuery, updatedQuery);

        if (BingApp.Classes.Shell.isSupportedAppUri(url)) {
            BingApp.locator.navigationManager.navigateTo(url);
        }
        else {
            BingApp.Utilities.invokeURI(url);
        }
    }

    function initListeners() {
        /// <summary>
        /// Sets up event listeners for the trends view control
        /// </summary>

        if (!eventsBound) {
            window.addEventListener("resize", onWindowResize, false);
            trendsListView.addEventListener("iteminvoked", onItemInvoked, false);

            // setup copyright link text and event handler
            copyrightLink.innerText = WinJS.Resources.getString("trending_copyright_symbol").value;
            copyrightLink.addEventListener("click", onCopyrightClicked, false);
            copyrightLink.addEventListener("keydown", handleKeyDownForCopyright, false);
            eventsBound = true;
        }
    }

    function onWindowResize() {
        /// <summary>
        /// Called when the window resizes in order to relayout the trends list view
        /// </summary>

        calcTrendsViewMetrics();
        if (WinJS.Application.sessionState[viewStateKey]) {
            bindTrendingListView(trendingViewModel);
        }
        else {
            // size has changed so that number of rows are different (e.g. from 4 rows to 6)
            // remove event listeners and rebind to data to rebuild view for new row size
            doBinding(false);
        }
    }

    function onItemInvoked(eventObject) {
        /// <summary>
        /// Called when the user clicks on a list view item
        /// </summary>
        /// <param name="eventObject" type="Object">
        /// Object containing an itemPromise used to retrieve the clicked on list view item
        /// </param>

        eventObject.detail.itemPromise.done(function (invokedItem) {
            var itemData = invokedItem.data;

            if (itemData.type === "text") {
                var instrumentionObj = { name: "TrendClick", TrendPos: invokedItem.index, TrendType: "Text" };
                BingApp.Instrumentation.logClick(instrumentionObj);
                navigateToVertical(itemData.Url || itemData.link);
            }
            else if (itemData.type === "news") {
                try {
                    var instrumentionObj = { name: "TrendClick", TrendPos: invokedItem.index, TrendType: "News" };
                    BingApp.Instrumentation.logClick(instrumentionObj);

                    if (itemData.Url) {
                        BingApp.Utilities.invokeURI(itemData.Url);
                    } else {
                        BingApp.traceError("TrendingController.onItemInvoked: failed to launch news because item data does not have news url.");
                    }
                }
                catch (e) {
                    BingApp.traceError("Launching Uri failed for uri {0}", itemData.url);
                }
            }
            else if (itemData.type === "image" || itemData.type === "hero") {
                var instrumentionObj = { name: "TrendClick", TrendPos: invokedItem.index, TrendType: "Visual" };
                BingApp.Instrumentation.logClick(instrumentionObj);
                navigateToVertical(itemData.Url);
            }
        });
    }

    function onCopyrightClicked(eventObject) {
        /// <summary>
        /// Called when the copyright symbol is clicked for image attribution
        /// </summary>
        /// <param name="eventObject" type="Object">
        /// Event object for the click event
        /// </param>

        var instrumentionObj = { name: "Attribution" };
        BingApp.Instrumentation.logClick(instrumentionObj);

        var msg = new Windows.UI.Popups.MessageDialog(imageAttribution);
        msg.commands.append(new Windows.UI.Popups.UICommand(WinJS.Resources.getString("trending_close").value));

        // Set the command to be invoked when a user presses 'ESC' 
        // Magic value of -1 provided by Windows that is not documented on MSDN yet
        // This will make it so the dialog closes on charm invocations
        msg.cancelCommandIndex = -1;
        msg.showAsync();
    }

    function handleKeyDownForCopyright(eventObject) {
        /// <summary>
        /// Called when the copyright symbol gets a key down event
        /// </summary>
        /// <param name="eventObject" type="Object">
        /// Event object for the key down event
        /// </param>
        if (BingApp.Utilities.isKeyDownAndSpaceOrEnterKey(eventObject)) {
            onCopyrightClicked(eventObject);
        }
    }

    function onVisible() {
        /// <summary>
        /// Called by startview when trends control goes from hidden to visible state
        /// </summary>
        calcTrendsViewMetrics();
        if (!WinJS.Application.sessionState[viewStateKey]) {
            doBinding();
        }
    }

    function onUnload() {
        /// <summary>
        /// Called when our view unloads in order to remove event listeners
        /// </summary>

        if (eventsBound) {
            window.removeEventListener("resize", onWindowResize, false);
            trendsListView.removeEventListener("iteminvoked", onItemInvoked, false);
            copyrightLink.removeEventListener("click", onCopyrightClicked, false);
            copyrightLink.removeEventListener("keydown", handleKeyDownForCopyright, false);
            trendsListView.winControl.removeEventListener("loadingstatechanged", onListViewLoadingStateChanged, false);
            eventsBound = false;
        }
    }

    function createTrendingViewModel() {
        /// <summary>
        /// Creates the ViewModel for the trending ListView (currently using mock data)
        /// </summary>
        /// <returns>
        /// A new BingApp.Classes.ListViewModel associated with an aggregate data provider and local storage cache provider
        /// </returns>

        var providers = [];
        var trendIds = BingApp.Classes.TrendingController.trendIds;

        var newsProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.bingNews) ? new BingApp.Classes.BingNewsDataProvider() : null;
        if (newsProvider) {
            providers.push(newsProvider);
        }

        // this is a critical data provider that we have already checked for earlier
        var imagesProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.popularNowVisual) ? new BingApp.Classes.PopVisualDataProvider() : null;
        if (imagesProvider) {
            providers.push(imagesProvider);
        }

        var textProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.popularNowText) ? new BingApp.Classes.PopTextDataProvider() : null;
        if (textProvider) {
            providers.push(textProvider);
        }

        var msnTextProvider = BingApp.locator.env.hasDataProviderUrl(trendIds.msnTrends) ? new BingApp.Classes.MsnTrendingDataProvider() : null;
        if (msnTextProvider) {
            providers.push(msnTextProvider);
        }

        var trendsProvider = null;
        if (imagesProvider) {
            trendsProvider = new BingApp.Classes.PriorityAggregateDataProvider("bingsearch://data/trends", providers, [imagesProvider]);
        } else {
            trendsProvider = new BingApp.Classes.AggregateDataProvider("bingsearch://data/trends", providers);
        }

        var cacheProvider = new BingApp.Classes.LocalStorageCacheProvider("bingsearch://cache/trends", "id");

        return new BingApp.Classes.ListViewModel(trendsProvider, cacheProvider);
    }

    function bindTrendingListView(viewModel) {
        /// <summary>
        /// Binds trending data to the trending ListView using the ViewModel by ordering items as they
        /// should appear in the ListView using a random packing algorithm.
        /// </summary>
        /// <param name="viewModel" type="BingApp.Classes.ListViewModel">
        /// The ViewModel to use for the binding and caching
        /// </param>

        var trendsBindingList = null;
        var newsList = [];
        var imageList = [];
        var textList = [];
        var initialImageListLength = 0;
        var initialTextListLength = 0;
        var initialNewsListLength = 0;
        var foundImage = false;
        imageAttribution = "";
        numDisplayedNews = 0;

        showCopyright = false;

        if (WinJS.Application.sessionState[viewStateKey]) {
            try {
                trendsBindingList = new WinJS.Binding.List(WinJS.Application.sessionState[viewStateKey].listData);
            }
            catch (e) {
                BingApp.traceError("Possible corrupt data when reading trends list data from session state. Error: ", e.message);
                trendsBindingList = new WinJS.Binding.List();
            }
        }
        else {
            trendsBindingList = new WinJS.Binding.List();
        }

        if (trendsBindingList.length === 0) {
            var dataSourceList = viewModel.getList();
            for (var i = 0; i < dataSourceList.length; i++) {
                var item = dataSourceList.getItem(i);
                if (item.data.type === "news") {
                    newsList.push(item.data);
                }
                else if (item.data.type === "image") {
                    addImageAttribution(item.data.SearchTermDisplay, item.data.ImageCredit.substr(1));
                    imageList.push(item.data);
                }
                else if (item.data.type === "text") {
                    textList.push(item.data);
                }
            }
    
            initialImageListLength = imageList.length;
            initialTextListLength = textList.length;
            initialNewsListLength = newsList.length;
            var numColumns = 0;
    
            while ((imageList.length > 0 || textList.length >= textListShiftLength || newsList.length > 0) && (++numColumns <= maxColumns)) {
                addTrendingColumn(trendsBindingList, newsList, imageList, textList, trendsMetrics.numRows);
            }
    
            for (var i = 0; i < trendsBindingList.length; i++) {
                trendsBindingList.getAt(i).id = "trendsItem" + i;
            }
                
            // Save view state to session state in case we need to rebuild view (e.g. user clicks on trends tile then back to Trends)
            // We want to keep the same order we had before we went to a different view
            var trendsViewState = {
                rows: trendsMetrics.numRows,
                listData: []
            };

            trendsBindingList.forEach(function (item) {
                ellipsifyItem(item);
                trendsViewState.listData.push(item);
            });

            WinJS.Application.sessionState[viewStateKey] = trendsViewState;
        }
        else {
            trendsBindingList.forEach(function (item) {
                if (item.type === "image" || item.type === "hero") {
                    initialImageListLength++;
                    addImageAttribution(item.SearchTermDisplay, item.ImageCredit.substr(1));
                    showCopyright = true;
                }
            });
        }

        var trendsTitle = WinJS.Resources.getString("trending_trendingTitle").value;

        var groupedList = trendsBindingList.createGrouped(
            function groupKey(item) {
                return trendsTitle;
            },
            function groupData(item) {
                return {
                    title: trendsTitle,
                    lastUpdated: lastUpdatedText
                };
            });

        trendsListView.winControl.itemTemplate = trendsViewItemTemplate;
        trendsListView.winControl.groupDataSource = groupedList.groups.dataSource;
        trendsListView.winControl.itemDataSource = groupedList.dataSource;
        trendsListView.winControl.addEventListener("loadingstatechanged", onListViewLoadingStateChanged, false);

        var instrumentionObj = {
            name: "TrendPageLoad",
            VTrend: initialImageListLength - imageList.length,
            TTrend: initialTextListLength - textList.length,
            NTrend: initialNewsListLength - newsList.length
        };

        BingApp.Instrumentation.log(instrumentionObj, loadEvent);
    }

    function onListViewLoadingStateChanged(eventObject) {
        var listView = eventObject.target;
        var listViewControl = listView.winControl;

        // Return if the listview loading state is not 'complete'
        if (listViewControl && listViewControl._loadingState !== "complete")
            return;

        var groupHeader = trendsListView.querySelector(".win-groupheader");
        if (groupHeader) {
            groupHeader.id = "trendGroupHeader";
        }

        if (showCopyright === true) {
            copyrightLink.style.display = "block";
        }
        else {
            copyrightLink.style.display = "none";
        }
    }

    function addImageAttribution(title, source) {
        /// <summary>
        /// Adds an image attribution string for an image
        /// </summary>
        /// <param name="title" type="String">
        /// Title of the image as it appears on the tile
        /// </param>
        /// <param name="source" type="String">
        /// Attributed source of the image
        /// </param>

        if (imageAttribution.length > 0) {
            imageAttribution += ", "
        }

        imageAttribution += "\"" + title + "\" " + source;
    }

    function calcTrendsViewMetrics() {
        /// <summary>
        /// Determines the maximum number of rows and total ListView height for Trends
        //  The ListView supports rows of 4 and 6
        /// </summary>
        
        // reset trends view height before calculation
        trendsListView.style.height = "";

        var searchBarIFrameHeight = document.querySelector("#searchbariframe").clientHeight;
        var viewHeight = trendsListView.clientHeight - searchBarIFrameHeight;

        if (viewHeight <= 0) {
            trendsMetrics = null;
            return;
        }

        // enumerate through all the supported number of rows (e.g. [4,6]) and calculate the height that the list view would have
        // with that number of rows. If the height is less than our viewHeight, then the listView will fit properly so we return
        // the number of rows to support as well as the resulting list view height
        for (var rowIndex = supportedNumberOfRows.length - 1; rowIndex >= 0; rowIndex--) {
            var listViewHeight = (supportedNumberOfRows[rowIndex] * cellHeight) + ((supportedNumberOfRows[rowIndex] - 1) * rowSpacing);
            if (listViewHeight < viewHeight || rowIndex === 0) {
                trendsMetrics = new Object({
                    numRows: supportedNumberOfRows[rowIndex],
                    listViewHeight: listViewHeight
                });
                break;
            }
        }
        
        if (WinJS.Application.sessionState[viewStateKey] && WinJS.Application.sessionState[viewStateKey].rows != trendsMetrics.numRows) {
            WinJS.Application.sessionState[viewStateKey] = null;
        }

        // center trends view vertically
        var clientHeight = trendsListView.clientHeight;
        var newTopMargin = ((clientHeight - trendsMetrics.listViewHeight) / 2);
        trendsListView.style.marginTop = newTopMargin + "px";
        trendsListView.style.height = clientHeight - newTopMargin + "px";
        copyrightLink.style.marginTop = -(clientHeight - searchBarIFrameHeight - newTopMargin);

        WinJS.UI.setOptions(trendsListView.winControl, {
            layout: new WinJS.UI.GridLayout({
                maxRows: trendsMetrics.numRows,
                groupInfo: function () {
                    return {
                        enableCellSpanning: true,
                        cellWidth: cellWidth,
                        cellHeight: cellHeight
                    }
                }
            })
        });
    }

    function ellipsifyItem(item) {
        /// <summary>
        /// Determines if certain elements of a certain item type need to be ellipsified and does so
        /// </summary>
        /// <param name="item" type="Object">
        /// Item containing data to ellipsify
        /// </param>
        if (item.type === "news") {
            var newsRuler = document.querySelector("#newsRuler");
            var title = newsRuler.querySelector(".title");
            var description = newsRuler.querySelector(".description")
            var source = newsRuler.querySelector(".source");
            
            title.innerText = item.Title;
            description.innerText = item.Snippet;
            source.innerText = item.Source;

            //ellipsify title element
            BingApp.Utilities.ellipsify(title, newsTitleMaxHeight, item.Title, ellipses);

            // determine how much space we have left for description and ellipsify it
            var maxDescriptionHeight = (newsRuler.clientHeight - source.clientHeight) - (title.offsetTop + title.clientHeight) - (parseInt(source.currentStyle.marginTop) * 2);
            BingApp.Utilities.ellipsify(description, maxDescriptionHeight, item.Snippet, ellipses);

            // change data so that it uses ellipsified text
            item.Title = title.innerText;
            item.Snippet = description.innerText;
        }
        else if (item.type === "text") {
            var textRuler = document.querySelector("#textRuler");
            var caption = textRuler.querySelector(".caption");
            caption.innerText = item.title;
            BingApp.Utilities.ellipsify(caption, textItemMaxHeight, caption.innerText, ellipses);
            item.title = caption.innerText;
        }
    }

    function buildHeroColumn(bindingList, newsList, imageList, textList, numRows) {
        /// <summary>
        /// Builds the first column of the trending ListView by adding a hero image followed by
        /// a number of text items to fill out the 2 columns
        /// </summary>
        /// <param name="bindingList" type="WinJS.Binding.List">
        /// List used to bind to the ListView. Images and text are added to this list
        /// </param>
        /// <param name="imageList" type="Array">
        /// Array containing image items from data source
        /// </param>
        /// <param name="textList" type="Array">
        /// Array containing text items from data source
        /// </param>
        /// <param name="numRows" type="Array">
        /// Number of rows in the ListView
        /// </param>

        var curRows = 0;

        if (imageList.length > 0) {
            var heroItem = getRandomListItem(imageList);
            heroItem.type = "hero";
            bindingList.push(heroItem);
            curRows = heroItemRows;
        }
        else if (newsList.length > 0) {
            var newsItem = getRandomListItem(newsList);
            bindingList.push(newsItem);
            curRows = newsItemRows;
        }

        for (var curRow = curRows; curRow < numRows && textList.length >= textListShiftLength; curRow++) {
            bindingList.push(getRandomListItem(textList));
            bindingList.push(getRandomListItem(textList));
        }
    }

    function addTrendingColumn(trendsBindingList, newsList, imageList, textList, numRows) {
        /// <summary>
        /// Builds a column of the trending ListView by performing a random placement of news, image and/or text items
        /// </summary>
        /// <param name="trendsBindingList" type="WinJS.Binding.List">
        /// List used to bind to the ListView. News, images and text are added to this list
        /// </param>
        /// <param name="newsList" type="Array">
        /// Array containing news items from data source
        /// </param>
        /// <param name="imageList" type="Array">
        /// Array containing image items from data source
        /// </param>
        /// <param name="textList" type="Array">
        /// Array containing text items from data source
        /// </param>
        /// <param name="numRows" type="Array">
        /// Number of rows in the ListView
        /// </param>

        var rowCount = 0;

        // determine if we show news item (always starts in row 0)
        if (newsList.length > 0 && numDisplayedNews < maxNewsItems && Math.floor(Math.random() * newsRandomWeight) >= 1) {
            numDisplayedNews++;
            trendsBindingList.push(getRandomListItem(newsList));
            rowCount += newsItemRows;
        }

        // fill with image and text
        while (rowCount < numRows && (imageList.length > 0 || textList.length >= textListShiftLength)) {
            if ((textList.length < textListShiftLength) || (imageList.length > 0 && Math.floor(Math.random() * 2) === 1)) {
                trendsBindingList.push(getRandomListItem(imageList));
                showCopyright = true;
                rowCount += imageItemRows;
            }
            else if (textList.length >= textListShiftLength) {
                trendsBindingList.push(getRandomListItem(textList));
                trendsBindingList.push(getRandomListItem(textList));
                rowCount += 2 * textItemRows;
            }
        }
    }

    function getRandomListItem(list) {
        /// <summary>
        /// Returns a random item from a list and removes that item from the list as well.
        /// </summary>
        /// <param name="list" type="WinJS.Binding.List">
        /// List of items
        /// </param>
        /// <returns>
        /// A random item from the list
        /// </returns>

        var randomIndex = Math.floor((Math.random() * list.length));
        return list.splice(randomIndex, 1)[0];
    }

    function trendsViewItemTemplate(itemPromise) {
        /// <summary>
        /// Template binding function used by the ListView in order to determine which item template to use for a specific item
        /// </summary>
        /// <param name="itemPromise" type="WinJS.Promise">
        /// Promise that returns an individual item in the datasource
        /// </param>

        return itemPromise.then(function (item) {
            var renderedItem;
            // IMPORTANT:   It is possible that itemPromise completes after trends view was unloaded 
            //              from DOM. If this was the case then template will not be found. We have
            //              to account for this case and then fail gracefully.
            var templateElement = document.querySelector("#" + item.data.type + "Template");
            if (templateElement) {
                var template = templateElement.winControl;
                renderedItem = template.render(item.data);

                renderedItem.then(function (itemHtmlFragment) {
                    itemHtmlFragment.id = item.data.id;
                    var imageElement = itemHtmlFragment.querySelector("img");
                    if (imageElement) {
                        // register onerror handler for 404s
                        imageElement.onerror = function () {
                            // render a placeholder image
                            this.src = "/views/start/images/trendsimageplaceholder.png";
                        }
                    }
                });
            } else {
                BingApp.traceVerbose("TrendingController.trendsViewItemTemplate: itemPromise completed after view has been unloaded from DOM; ignoring item generation request.");

                // IMPORTANT:   We have to return valid HTML element; otherwise, WinJS will throw error 
                renderedItem = document.createElement("div");
            }

            return renderedItem;
        });
    };

    function trendsAvailableForCurrentMarket() {
        /// <summary>
        /// Checks if the trends feature is available for the current market
        /// </summary>
        /// <returns>
        /// true if trends feature is enabled for the market
        /// </returns>

        // first check if the critical data provider is available
        var trendIdList = [this.trendIds.msnTrends, this.trendIds.bingNews, this.trendIds.popularNowText, this.trendIds.popularNowVisual];

        for (var index = 0; index < trendIdList.length; index++) {
            if (BingApp.locator.env.hasDataProviderUrl(trendIdList[index])) {
                return true;
            }
        }

        return false;
    }


    WinJS.Namespace.define("BingApp.Classes.TrendingController", {
        doBinding: doBinding,
        onUnload: onUnload,
        onVisible: onVisible,
        trendsAvailableForCurrentMarket: trendsAvailableForCurrentMarket,
        trendIds: trendIds,
        TrendingViewRefreshListener: null,
        navigateToVertical: navigateToVertical
    });
})();