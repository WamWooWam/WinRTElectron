/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.ArticleReader", {
        recordActionClick: function recordActionClick(partnerChannelId) {
            if (partnerChannelId) {
                if (partnerChannelId === "NYT") {
                    NYTJS.Instrumentation.instance.instrumentBingDailyToPanorama()
                }
                var event = { PartnerChannelID: partnerChannelId };
                NewsJS.Telemetry.Utilities.logUserAction("Block 1", NewsJS.Telemetry.String.ActionContext.endOfArticleBlock, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }
    });
    WinJS.Namespace.define("NewsJS.Telemetry.ArticleReader.EntryPoint", { categoryPage: Platform.Instrumentation.InstrumentationArticleEntryPoint.platformReserved + 1 })
})();
(function () {
    "use strict";
    var ClusterType = {
        hero: "NewsApp.Controls.HeroControl", temp: "NewsApp.Controls.TempClusterWrapper", international: "NewsApp.Controls.UserSection.InternationalEditionControl", source: "NewsApp.Controls.UserSection.SourceControl", topic: "NewsApp.Controls.UserSection.TopicControl", category: "NewsApp.Controls.CategoryControl"
    };
    WinJS.Namespace.define("NewsJS.Telemetry.BingDaily", {
        PrefetchState: {
            partial: "Partial", completed: "Completed", completedWithError: "Completed with error"
        }, recordHeroContent: function recordHeroContent(content) {
            var k;
            if (content && content.itemDataSource) {
                var impression = PlatformJS.Navigation.mainNavigator.getCurrentImpression();
                if (impression) {
                    content.itemDataSource.itemFromIndex(0).then(function (item) {
                        if (item && item.data && item.data.article && !item.data.article.isFREOffline) {
                            var article = item.data.article,
                                date = NewsJS.Telemetry.Utilities.convertUtcTime(article.published ? article.published.utctime : 0);
                            k = impression.addContent(article.source, null, article.destination, PlatformJS.Telemetry.contentType.article, date, null, NewsJS.Utilities.stripHTML(article.title), true, PlatformJS.Telemetry.contentWorth.free, false, null);
                            impression.logContent(PlatformJS.Telemetry.logLevel.normal);
                            if (article.telemetry) {
                                article.telemetry.k = k
                            }
                            else {
                                article.telemetry = { k: k }
                            }
                        }
                    })
                }
            }
            return k
        }, recordHeroContentView: function recordHeroContentView(content) {
            if (content && content.itemDataSource) {
                var impression = PlatformJS.Navigation.mainNavigator.getCurrentImpression();
                if (impression) {
                    content.itemDataSource.itemFromIndex(0).then(function (item) {
                        if (item && item.data && item.data.article && !item.data.article.isFREOffline) {
                            var article = item.data.article;
                            if (article && article.telemetry && article.telemetry.k > 0) {
                                impression.logContentView(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, article.telemetry.k, Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.unknown, true, null)
                            }
                        }
                    })
                }
            }
        }, recordUnknownClusterUpgradeButtonPress: function recordUnknownClusterUpgradeButtonPress() {
            NewsJS.Telemetry.Utilities.logUserAction("Unknown Cluster Upgrade Button", NewsJS.Telemetry.String.ActionContext.clusterUnknown, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, null)
        }, recordHeroClick: function recordHeroClick(item) {
            if (item) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.hero);
                NewsJS.Telemetry.Utilities.logUserAction("Hero Title", NewsJS.Telemetry.String.ActionContext.hero, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, item.telemetry ? item.telemetry.k : 0, null)
            }
        }, recordClusterLayout: function recordClusterLayout(clustersDefinition, intlEdition) {
            if (clustersDefinition && clustersDefinition.length > 0) {
                var clustersPreferences = {};
                var processTitle = function (title) {
                    var result = title,
                        len = title.length;
                    if (title.indexOf("_") === 0 && title.lastIndexOf("_") === len - 1) {
                        result = PlatformJS.Services.resourceLoader.getString(title.substring(1, len - 1))
                    }
                    return result
                };
                var getClusterType = function (clusterDef) {
                    var fullType = clusterDef.clusterType;
                    var type = null;
                    if (fullType) {
                        switch (fullType) {
                            case ClusterType.hero:
                            case ClusterType.temp:
                                type = NewsJS.Telemetry.BingDaily.clusterType.Default;
                                break;
                            case ClusterType.international:
                                type = NewsJS.Telemetry.BingDaily.clusterType.International;
                                break;
                            case ClusterType.source:
                                type = NewsJS.Telemetry.BingDaily.clusterType.Source;
                                break;
                            case ClusterType.topic:
                                type = NewsJS.Telemetry.BingDaily.clusterType.Topic;
                                break;
                            case ClusterType.category:
                                type = NewsJS.Telemetry.BingDaily.clusterType.Category;
                                break;
                            default:
                                break
                        }
                    }
                    return type
                };
                var getSourceType = function (providerConfig) {
                    var type = null;
                    if (providerConfig.providerType) {
                        switch (providerConfig.providerType) {
                            case NewsJS.Telemetry.BingDaily.providerType.AlgoSourceDataProvider:
                                type = NewsJS.Telemetry.BingDaily.sourceType.Algo;
                                break;
                            case NewsJS.Telemetry.BingDaily.providerType.PartnerProvider:
                                type = NewsJS.Telemetry.BingDaily.sourceType.Featured;
                                break;
                            case NewsJS.Telemetry.BingDaily.providerType.CustomRSSSourceDataProvider:
                                type = NewsJS.Telemetry.BingDaily.sourceType.CustomRSS;
                                break;
                            default:
                                break
                        }
                    }
                    return type
                };
                for (var i = 1; i <= clustersDefinition.length; i++) {
                    var clusterDefinition = clustersDefinition[i - 1];
                    var providerConfiguration = clusterDefinition.providerConfiguration;
                    var clusterId;
                    var sourceMarket = null;
                    if (providerConfiguration) {
                        if (providerConfiguration.providerType === NewsJS.Telemetry.BingDaily.providerType.TempClusterProvider) {
                            if (intlEdition) {
                                continue
                            }
                            clusterId = providerConfiguration.strategy
                        }
                        else {
                            clusterId = providerConfiguration.categoryKey
                        }
                        if (clusterDefinition.clusterType === "NewsApp.Controls.UserSection.SourceControl" && providerConfiguration.market) {
                            sourceMarket = providerConfiguration.market
                        }
                    }
                    var sourceType = getSourceType(providerConfiguration);
                    var clusterType = getClusterType(clusterDefinition);
                    var clusterPreference = { ClusterGUID: clusterDefinition.guid };
                    if (clusterType) {
                        clusterPreference.ClusterType = clusterType
                    }
                    if (sourceType) {
                        clusterPreference.SourceType = sourceType
                    }
                    ;
                    if (clusterId) {
                        clusterPreference.ClusterID = clusterId
                    }
                    if (clusterDefinition.title) {
                        clusterPreference.ClusterTitle = processTitle(clusterDefinition.title)
                    }
                    if (sourceMarket) {
                        clusterPreference.SourceMarket = sourceMarket
                    }
                    if (providerConfiguration.instrumentationId) {
                        clusterPreference.PartnerCode = providerConfiguration.instrumentation_id
                    }
                    if (providerConfiguration.feed) {
                        clusterPreference.RSS_URL = providerConfiguration.feed
                    }
                    var index = i < 10 ? "0" + i : i;
                    clustersPreferences["BingDaily/Cluster" + index] = JSON.stringify(clusterPreference)
                }
                var jsonString = JSON.stringify(clustersPreferences);
                PlatformJS.Telemetry.flightRecorder.logPreferencesAsJson(PlatformJS.Telemetry.logLevel.normal, jsonString)
            }
        }, recordClusterHeaderPress: function recordClusterHeaderPress(categoryKey, categoryTitle, position) {
            NewsJS.Telemetry.Cluster.recordClusterHeaderPress(categoryKey, categoryTitle, position)
        }, recordRefreshButtonClick: function recordRefreshButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Refresh Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e);
            NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.refresh)
        }, recordEditButtonClick: function recordEditButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Edit Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordSeeMorePress: function recordSeeMorePress(clusterKey, clusterName) {
            NewsJS.Telemetry.Cluster.recordSeeMorePress(clusterKey, clusterName)
        }, recordPopularNowPress: function recordPopularNowPress(item) {
            if (item) {
                var event = {
                    Title: item.title, TileSize: item.tileSize
                };
                NewsJS.Telemetry.Utilities.logUserAction("Popular Now Tile", NewsJS.Telemetry.String.ActionContext.clusterPopularNow, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordSourcesItemPress: function recordSourcesItemPress(item) {
            if (item && item.data && item.data.data) {
                var event = {
                    Index: item.index, TileType: item.data.tileType, DisplayName: item.data.data.displayname, SourceID: item.data.data.id, PartnerCode: item.data.data.instrumentation_id, NewsCategory: item.data.data.newscategory
                };
                NewsJS.Telemetry.Utilities.logUserAction("Source Tile", NewsJS.Telemetry.String.ActionContext.clusterSources, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordSourcesAddSourcePress: function recordSourcesAddSourcePress() {
            NewsJS.Telemetry.Utilities.logUserAction("Add Source", NewsJS.Telemetry.String.ActionContext.clusterSources, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, null)
        }, recordPrefetchState: function recordPrefetchState(prefetchState) {
            if (prefetchState) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logAppAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, NewsJS.Telemetry.String.ActionContext.prefetch, null, prefetchState, 0)
            }
        }, providerType: {
            AlgoSourceDataProvider: "NewsApp.DataProviders.Generic.AlgoSourceDataProvider", PartnerProvider: "NewsApp.DataProviders.CMS.PartnerProvider", CustomRSSSourceDataProvider: "NewsApp.DataProviders.Generic.CustomRSSSourceDataProvider", TempClusterProvider: "NewsApp.DataProviders.TempClusterProvider"
        }, sourceType: {
            Algo: "Algo", Featured: "Featured", CustomRSS: "CustomRSS"
        }, clusterType: {
            Default: "Default", International: "International", Source: "Source", Topic: "Topic", Category: "Category"
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Category", {
        recordRefreshButtonClick: function recordRefreshButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Refresh Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e);
            NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.refresh)
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Cluster", {
        recordClusterItemPress: function recordClusterItemPress(clusterKey, clusterItem) {
            if (!clusterItem || !clusterItem.isHero) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.cluster)
            }
            else {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.hero)
            }
            if (clusterItem) {
                var clusterId = NewsJS.Telemetry.Utilities.convertClusterGuidToClusterId(clusterKey);
                var event = {
                    Editorial: clusterItem.editorial ? clusterItem.editorial : false, ItemType: clusterItem.type, TemplateClass: clusterItem.templateClass, ClusterID: clusterId, ClusterName: clusterItem.telemetry ? clusterItem.telemetry.clusterName : null
                };
                NewsJS.Telemetry.Utilities.logUserAction("Entity Tile", NewsJS.Telemetry.String.ActionContext.cluster, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clusterItem.telemetry ? clusterItem.telemetry.k : 0, event)
            }
        }, recordClusterHeaderPress: function recordClusterHeaderPress(clusterKey, clusterTitle, clusterPosition) {
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.cluster);
            var clusterId = NewsJS.Telemetry.Utilities.convertClusterGuidToClusterId(clusterKey);
            var event = {
                ClusterPosition: clusterPosition, ClusterID: clusterId, ClusterName: clusterTitle
            };
            NewsJS.Telemetry.Utilities.logUserAction("Entity Cluster Header", NewsJS.Telemetry.String.ActionContext.clusterHeader, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordSeeMorePress: function recordSeeMorePress(clusterKey, clusterTitle) {
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.cluster);
            var clusterId = NewsJS.Telemetry.Utilities.convertClusterGuidToClusterId(clusterKey);
            var event = {
                ClusterID: clusterId, ClusterName: clusterTitle
            };
            NewsJS.Telemetry.Utilities.logUserAction("Entity Cluster See More", NewsJS.Telemetry.String.ActionContext.cluster, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Customization", {
        recordCustomFeedAdded: function recordCustomFeedAdded(title, url) {
            if (title && url) {
                var event = {
                    Title: title, URL: url
                };
                NewsJS.Telemetry.Utilities.logUserAction("Add Feed", NewsJS.Telemetry.String.ActionContext.sourceManagement, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordAddRemove: function recordAddRemove(market, item, type, category) {
            if (item) {
                var event = {
                    SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market), SourceName: item.displayname, SourceID: item.id, Category: category
                };
                var prefix = item.selected ? "Add" : "Remove";
                var action = prefix + " " + type;
                var context = type === "Source" ? NewsJS.Telemetry.String.ActionContext.sourceManagement : NewsJS.Telemetry.String.ActionContext.categoryManagement;
                NewsJS.Telemetry.Utilities.logUserAction(action, context, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordAddRemoveAsASection: function recordAddRemoveAsASection(action, market, displayName, id, category) {
            var event = {
                SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market), SourceName: displayName, SourceID: id, Category: category
            };
            var context = Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar;
            NewsJS.Telemetry.Utilities.logUserAction(action, context, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordCodeError: function recordCodeError(url, message, src) {
            if (message) {
                var attributes = {
                    URL: url, Location: src
                };
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeErrorWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, message, null, JSON.stringify(attributes))
            }
        }, recordSourceSearch: function recordSourceSearch(query, market, resultCount, experience) {
            if (query) {
                var details = {
                    SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market), Experience: experience
                };
                var jsonString = JSON.stringify(details);
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, query, "Sources", Microsoft.Bing.AppEx.Telemetry.SearchMethod.form, true, resultCount, true, false, false, null, jsonString)
            }
        }, recordMarketSelection: function recordMarketSelection(market, context) {
            var event = { SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market) };
            NewsJS.Telemetry.Utilities.logUserAction("Market Selection Menu", context, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordCategorySelection: function recordCategorySelection(market, category, context) {
            var event = {
                SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market), Category: category || "None"
            };
            NewsJS.Telemetry.Utilities.logUserAction("Category Selection List", context, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordSourceClick: function recordSourceClick(sourceMarket, item) {
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.browseSources);
            if (item) {
                var sourceType = NewsJS.Telemetry.Customization.getSourceType(item);
                var event = {
                    PartnerCode: item.instrumentation_id || "None", SourceName: item.displayname, SourceID: item.id || "None", SourceType: sourceType, SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(sourceMarket)
                };
                NewsJS.Telemetry.Utilities.logUserAction("Browse Source", NewsJS.Telemetry.String.ActionContext.browseSources, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, sourcesReported: false, recordSources: function recordSources(sources, keyMap) {
            if (sources && sources.length > 0) {
                var sourcesPreferences = {};
                for (var i = 1; i <= sources.length; i++) {
                    var source = sources[i - 1].data;
                    var sourceType = NewsJS.Telemetry.Customization.getSourceType(source);
                    var sourcePreference = {
                        PartnerCode: source.instrumentation_id || "None", SourceName: source.displayname, SourceID: source.id || "None", SourceType: sourceType, SourceMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(source.market)
                    };
                    var index = i < 10 ? "0" + i : i;
                    sourcesPreferences["Sources/Source" + index] = JSON.stringify(sourcePreference)
                }
                var jsonString = JSON.stringify(sourcesPreferences);
                PlatformJS.Telemetry.flightRecorder.logPreferencesAsJson(PlatformJS.Telemetry.logLevel.normal, jsonString)
            }
        }, getActionContext: function getActionContext(state) {
            var context = NewsJS.Telemetry.String.ActionContext.selectionPage;
            if (state && state.mode) {
                switch (state.mode) {
                    case "Source":
                        if (state.isBrowse) {
                            context = NewsJS.Telemetry.String.ActionContext.browseSources
                        }
                        else {
                            context = NewsJS.Telemetry.String.ActionContext.sourceManagement
                        }
                        break;
                    case "Cluster":
                        context = NewsJS.Telemetry.String.ActionContext.categoryManagement;
                        break
                }
            }
            return context
        }, getSourceType: function getSourceType(source) {
            var type;
            if (source.featured) {
                type = "Featured"
            }
            else if (source.type === "InternationalBingDaily") {
                type = "International"
            }
            else if (source.isCustomRSS) {
                type = "Custom RSS"
            }
            else {
                type = "RSS"
            }
            return type
        }
    })
})();
(function () {
    "use strict";
    var LOCAL_SOURCES_CHANGE_LOCATION = "Change Location Button";
    var SUCCESS_GET_LOCATION = "Got Geolocation";
    var ERROR_GET_LOCATION = "Error Getting Geolocation";
    var ERROR_USER_BLOCKED_USE_OF_LOCATION = "User Blocked Use of Geolocation";
    var ERROR_LOCATION_SERVICE_UNAVAILABLE = "Geolocation Service Unavailable";
    var SUCCESS_GET_LOCAL_NEWS_SOURCES_LIST = "Got Local Sources List";
    var EMPTY_GET_LOCAL_NEWS_SOURCES_LIST = "No Valid Local Sources Found";
    var ERROR_GET_LOCAL_NEWS_SOURCES_LIST = "Error Getting Local Sources List";
    var SUCCESS_MAP_GEOLOCATION_TO_LOCAL_SOURCES = "Mapped Geolocation To Local Sources Location";
    var ERROR_MAP_GEOLOCATION_TO_LOCAL_SOURCES = "Could Not Map Location To Local Sources";
    var LocalNews = WinJS.Class.define(null, null, {
        recordChangeLocationButtonClick: function recordChangeLocationButtonClick() {
            var event = {};
            NewsJS.Telemetry.Utilities.logUserAction(LOCAL_SOURCES_CHANGE_LOCATION, NewsJS.Telemetry.String.ActionContext.localNewsSources, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordGetUserGeolocationSuccess: function recordGetUserGeolocationSuccess() {
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, SUCCESS_GET_LOCATION)
        }, recordGetUserLocationError: function recordGetUserLocationError(locationStatus) {
            var event = { locationStatus: locationStatus };
            switch (locationStatus) {
                case Windows.Devices.Geolocation.PositionStatus.disabled:
                    NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, ERROR_USER_BLOCKED_USE_OF_LOCATION, event);
                    break;
                case Windows.Devices.Geolocation.PositionStatus.noData:
                    NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, ERROR_USER_BLOCKED_USE_OF_LOCATION, event);
                    break;
                default:
                    NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, ERROR_GET_LOCATION, event);
                    break
            }
        }, recordMapGeolocationToLocalSourceLocationSuccess: function recordMapGeolocationToLocalSourceLocationSuccess() {
            var event = {};
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, SUCCESS_MAP_GEOLOCATION_TO_LOCAL_SOURCES, event)
        }, recordMapGeolocationToLocalSourceLocationError: function recordMapGeolocationToLocalSourceLocationError() {
            var event = {};
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, ERROR_MAP_GEOLOCATION_TO_LOCAL_SOURCES, event)
        }, recordMapGeolocationToLocalSourceLocationResult: function recordMapGeolocationToLocalSourceLocationResult(currentLocalSourceLocation) {
            if (currentLocalSourceLocation) {
                this.recordMapGeolocationToLocalSourceLocationSuccess()
            }
            else {
                this.recordMapGeolocationToLocalSourceLocationError()
            }
        }, recordGetLocalSourceLocationsListSuccess: function recordGetLocalSourceLocationsListSuccess() {
            var event = {};
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, SUCCESS_GET_LOCAL_NEWS_SOURCES_LIST, event)
        }, recordGetLocalSourceLocationsListEmpty: function recordGetLocalSourceLocationsListEmpty() {
            var event = {};
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, EMPTY_GET_LOCAL_NEWS_SOURCES_LIST, event)
        }, recordGetLocalSourceLocationsListError: function recordGetLocalSourceLocationsListError() {
            var event = {};
            NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, ERROR_GET_LOCAL_NEWS_SOURCES_LIST, event)
        }, recordGetLocalSourceLocationsListResult: function recordGetLocalSourceLocationsListResult(localSourcesList) {
            if (localSourcesList && localSourcesList.length && localSourcesList.length > 0) {
                this.recordGetLocalSourceLocationsListSuccess()
            }
            else {
                this.recordGetLocalSourceLocationsListEmpty()
            }
        }
    });
    WinJS.Namespace.define("NewsJS.Telemetry", { LocalNews: LocalNews })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.RSSSourcePage", {
        recordRSSSourceItemPress: function recordRSSSourceItemPress(item) {
            if (item) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.rssSource);
                NewsJS.Telemetry.Utilities.logUserAction("RSS Source Tile", NewsJS.Telemetry.String.ActionContext.clusterRSSSource, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, item.telemetry ? item.telemetry.k : 0, null)
            }
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Search", {
        recordSearchResultPress: function recordSearchResultPress(result, context) {
            if (result) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.searchResult);
                NewsJS.Telemetry.Utilities.logUserAction("Result", context || NewsJS.Telemetry.String.ActionContext.results, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, result.telemetry ? result.telemetry.k : 0, null)
            }
        }, recordAutosuggestPress: function recordAutosuggestPress(result, context) {
            if (result && context) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.inAppSearchSuggestion);
                NewsJS.Telemetry.Utilities.logUserAction("Autosuggest", context, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, { result: result })
            }
        }, recordAddSectionButtonClick: function recordAddSectionButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Add Section Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordRefreshButtonClick: function recordRefreshButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Refresh Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e);
            NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.refresh)
        }, recordSearch: function recordSearch(query, resultCount, searchOrigin, fromCache) {
            if (query) {
                var searchClassification = NewsJS.Telemetry.Search.getSearchClassification(searchOrigin);
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logSearch(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, query, "Bing", searchClassification.method, true, resultCount, fromCache ? false : searchClassification.isExplicit, fromCache ? false : searchClassification.isCOMSCORE, false, searchClassification.formCode, null)
            }
        }, getSearchClassification: function getSearchClassification(searchOrigin) {
            var formCode;
            var method;
            var isExplicit;
            var isCOMSCORE;
            switch (searchOrigin) {
                case NewsJS.Telemetry.Search.Origin.pin:
                    formCode = NewsJS.Telemetry.Search.FormCode.pin;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = true;
                    break;
                case NewsJS.Telemetry.Search.Origin.inAppSearchQuery:
                    formCode = NewsJS.Telemetry.Search.FormCode.form;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.form;
                    isExplicit = true;
                    isCOMSCORE = true;
                    break;
                case NewsJS.Telemetry.Search.Origin.popularNow:
                    formCode = NewsJS.Telemetry.Search.FormCode.popularNow;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = true;
                    break;
                case NewsJS.Telemetry.Search.Origin.topics:
                    formCode = NewsJS.Telemetry.Search.FormCode.topics;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = false;
                    break;
                case NewsJS.Telemetry.Search.Origin.topicHeader:
                    formCode = NewsJS.Telemetry.Search.FormCode.topics;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = true;
                    break;
                case NewsJS.Telemetry.Search.Origin.navBar:
                    formCode = NewsJS.Telemetry.Search.FormCode.topics;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = true;
                    break;
                case NewsJS.Telemetry.Search.Origin.newsFromTheWeb:
                    formCode = NewsJS.Telemetry.Search.FormCode.category;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = false;
                    break;
                case NewsJS.Telemetry.Search.Origin.topicCluster:
                    formCode = NewsJS.Telemetry.Search.FormCode.topicCluster;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = false;
                    break;
                case NewsJS.Telemetry.Search.Origin.externalSearchCharm:
                    formCode = NewsJS.Telemetry.Search.FormCode.externalSearchCharm;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.view;
                    isExplicit = false;
                    isCOMSCORE = false;
                    break;
                default:
                    formCode = NewsJS.Telemetry.Search.FormCode.unknown;
                    method = Microsoft.Bing.AppEx.Telemetry.SearchMethod.unknown;
                    isExplicit = false;
                    isCOMSCORE = false;
                    break
            }
            return {
                formCode: formCode, method: method, isExplicit: isExplicit, isCOMSCORE: isCOMSCORE
            }
        }
    });
    WinJS.Namespace.define("NewsJS.Telemetry.Search.Origin", {
        inAppSearchQuery: "In-app search query", popularNow: "Popular Now", pin: "Pin", topics: "Topics", topicHeader: "Topic Header", navBar: "Nav Bar", newsFromTheWeb: "News from the Web", topicCluster: "Topic Cluster", externalSearchCharm: "External Search Charm"
    });
    WinJS.Namespace.define("NewsJS.Telemetry.Search.FormCode", {
        form: "APXN01", pin: "APXN02", topics: "APXN03", popularNow: "APXN04", category: "APXN05", topicCluster: "APXN06", externalSearchCharm: "APXN07", unknown: "APXN99"
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.SlideShow", {
        recordSlideShowToArticle: function recordSlideShowToArticle(slideShowId, market, pageId, contentId) {
            if (slideShowId && pageId && contentId) {
                var event = {
                    SlideshowID: slideShowId, ContentMarket: NewsJS.Telemetry.Utilities.normalizeMarketString(market), PageID: pageId, ContentID: contentId
                };
                NewsJS.Telemetry.Utilities.logUserAction("Article", NewsJS.Telemetry.String.ActionContext.slideShow, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.SourcePage", {
        recordSourceItemPress: function recordSourceItemPress(item) {
            if (item) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.sourceTile);
                NewsJS.Telemetry.Utilities.logUserAction("Source Tile", NewsJS.Telemetry.String.ActionContext.clusterSource, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, item.telemetry ? item.telemetry.k : 0, null)
            }
        }, recordRefreshButtonClick: function recordRefreshButtonClick(item) {
            if (item) {
                var event = {
                    SourceID: item.id, SourceName: item.displayname, Category: item.newscategory
                };
                NewsJS.Telemetry.Utilities.logUserAction("Refresh Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event);
                NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.refresh)
            }
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.String.ImpressionContext", {
        bingDaily: "/Bing Daily", category: "/Category", source: "/Source", rssSource: "/RSS Source", topics: "/Topics", search: "/Search Results", slideShow: "/Slideshow", iframeArticle: "/IFrame Article", selectionPage: "/Selection Page", browseSources: "/Browse Sources", addSource: "/Add Source", addCategory: "/Add Category", partnerPano: "/Partner Pano", subPartnerPano: "/Partner Pano/Sub Pano", emptyPage: "/Empty Page"
    });
    WinJS.Namespace.define("NewsJS.Telemetry.String.ImpressionNavMethod", {
        iframeArticle: "IFrame Article", customizationPage: "Customization Page", browseSources: "Browse Sources", topic: "Topic", topicHeader: "Topic Header", slideShow: "Slideshow", pinnedTile: "Pinned Tile", mySources: "My Sources", popularNow: "Popular Now", rssSource: "RSS Source", searchResult: "Search Result", sourceTile: "Source Tile"
    });
    WinJS.Namespace.define("NewsJS.Telemetry.String.ActionContext", {
        endOfArticleBlock: "End of Article Block", hero: "Hero", cluster: "Cluster", clusterHeader: "Cluster Header", clusterPopularNow: "Cluster: Popular Now", clusterSources: "Cluster: Sources", clusterRSSSource: "Cluster: RSS Source", clusterSource: "Cluster: Source", clusterUnknown: "Cluster: Unknown", results: "Results", prefetch: "Prefetch", browseSources: "Browse Sources", sourceManagement: "Source Management", categoryManagement: "Category Management", selectionPage: "Selection Page", topics: "Topics", slideShow: "Slideshow", sources: "Sources", categories: "Categories", internationalEditions: "International Editions"
    });
    WinJS.Namespace.define("NewsJS.Telemetry.String.ErrorContext", {
        topics: "Topics", source: "Source", prefetch: "Prefetch", utilities: "Utilities", pano: "Pano", builtInPartnerPano: "Built In Partner Pano"
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Utilities", {
        logCustom: function logCustom(logLevel, eventType, jsonObject) {
            if (eventType && eventType.indexOf("App") === 0 && jsonObject) {
                var jsonText = JSON.stringify(jsonObject);
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCustom(logLevel, eventType, jsonText)
            }
        }, logUserAction: function logUserAction(element, context, operation, k, jsonObject) {
            if (element && operation) {
                if (jsonObject) {
                    var jsonText = JSON.stringify(jsonObject);
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, element, operation, PlatformJS.Utilities.getLastClickUserActionMethod(), k, jsonText)
                }
                else {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, element, operation, PlatformJS.Utilities.getLastClickUserActionMethod(), k)
                }
            }
        }, recordButtonClick: function recordButtonClick(element, context, event) {
            if (element) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, context, element, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, PlatformJS.Utilities.getLastClickUserActionMethod(), 0)
            }
        }, closePartnerSession: function closePartnerSession() { }, recordPinnedTileLaunch: function recordPinnedTileLaunch(tileType) {
            if (tileType) {
                var event = { TileType: tileType };
                NewsJS.Telemetry.Utilities.logCustom(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "AppPinnedTileLaunch", event)
            }
        }, recordPinnedTileAdded: function recordPinnedTileAdded(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument) {
            if (tileShortName && tileDisplayName && tileLaunchTargetPage && tileLaunchArgument) {
                var event = NewsJS.Telemetry.Utilities.createPinnedTileEvent(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument);
                NewsJS.Telemetry.Utilities.logUserAction("Pinned Tile Added", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordPinnedTileRemoved: function recordPinnedTileRemoved(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument) {
            if (tileShortName && tileDisplayName && tileLaunchTargetPage && tileLaunchArgument) {
                var event = NewsJS.Telemetry.Utilities.createPinnedTileEvent(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument);
                NewsJS.Telemetry.Utilities.logUserAction("Pinned Tile Removed", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, createPinnedTileEvent: function createPinnedTileEvent(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument) {
            var event;
            if (tileLaunchTargetPage === "NewsJS.CategoryPage") {
                event = {
                    ShortName: tileShortName, DisplayName: tileDisplayName, LaunchTargetPage: "Category Page", CategoryName: tileLaunchArgument.categoryName, CategoryKey: tileLaunchArgument.categoryKey, Market: NewsJS.Telemetry.Utilities.normalizeMarketString(tileLaunchArgument.market)
                }
            }
            else if (tileLaunchTargetPage === "NewsJS.Search") {
                event = {
                    ShortName: tileShortName, DisplayName: tileDisplayName, LaunchTargetPage: "Search Results Page", QueryText: tileLaunchArgument.queryText, SearchOrigin: tileLaunchArgument.searchOrigin
                }
            }
            else if (tileLaunchTargetPage === "NewsJS.RSSSourcePage") {
                event = {
                    ShortName: tileShortName, DisplayName: tileDisplayName, LaunchTargetPage: "RSS Source Page", URL: tileLaunchArgument.id
                }
            }
            else {
                event = {
                    ShortName: tileShortName, DisplayName: tileDisplayName, LaunchTargetPage: tileLaunchTargetPage
                }
            }
            return event
        }, recordAutoRefresh: function recordAutoRefresh() {
            NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.autoRefresh)
        }, recordRefresh: function recordRefresh(contentClearKind) {
            var impression = PlatformJS.Navigation.mainNavigator.getCurrentImpression();
            if (impression) {
                impression.logContentClear(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, contentClearKind)
            }
        }, recordToastActivation: function recordToastActivation(uri) {
            var event = { Uri: uri };
            NewsJS.Telemetry.Utilities.logUserAction("Toast Notification Click", Microsoft.Bing.AppEx.Telemetry.ActionContext.toast, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
        }, recordShare: function recordShare(uri, k, shareSource) {
            if (uri) {
                var impression = PlatformJS.Navigation.mainNavigator.getCurrentImpression();
                if (impression) {
                    var event = { ShareSource: shareSource };
                    var jsonText = JSON.stringify(event);
                    impression.logContentShareWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, null, uri, k ? k : 0, jsonText)
                }
            }
        }, recordPrefetchPreferences: function recordPrefetchPreferences() {
            var prefetchPreferences = {};
            prefetchPreferences["Prefetch/IsEnabled"] = NewsJS.PrefetchManager.isPrefetchEnabled;
            var jsonString = JSON.stringify(prefetchPreferences);
            PlatformJS.Telemetry.flightRecorder.logPreferencesAsJson(PlatformJS.Telemetry.logLevel.normal, jsonString)
        }, convertUtcTime: function convertUtcTime(utctime, epoch) {
            var dateValue = 0;
            if (typeof (utctime) === "number") {
                epoch = epoch || Date.UTC(1601, 0, 1, 0, 0, 0);
                dateValue = utctime / 10000 + epoch
            }
            return new Date(dateValue)
        }, convertClusterGuidToClusterId: function convertClusterGuidToClusterId(clusterGuid) {
            var clusterId = clusterGuid;
            if (clusterGuid) {
                var index = clusterGuid.lastIndexOf(".");
                if (index !== -1) {
                    clusterId = clusterGuid.substring(0, index)
                }
            }
            return clusterId
        }, normalizeMarketString: function normalizeMarketString(market) {
            return market ? market.toLowerCase() : "None"
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Telemetry.Topics", {
        recordPreferences: function recordPreferences() {
            var preferences = {};
            var followedSearchTopics = NewsJS.StateHandler.instance.getTopics;
            if (followedSearchTopics) {
                for (var i = 1; i <= followedSearchTopics.length; i++) {
                    var index = i < 10 ? "0" + i : i;
                    preferences["Topics/Topic" + index] = followedSearchTopics[i - 1].query
                }
            }
            var jsonString = JSON.stringify(preferences);
            Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logPreferencesAsJson(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, jsonString)
        }, recordSectionHeaderPress: function recordSectionHeaderPress(sectionName, sectionIndex) {
            if (sectionName) {
                NewsJS.Telemetry.Cluster.recordClusterHeaderPress("topicCluster" + sectionIndex, sectionName, sectionIndex)
            }
        }, recordTopicItemPress: function recordTopicItemPress(item) {
            if (item) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.topic);
                var event = { CategoryKey: item.categoryKey };
                NewsJS.Telemetry.Utilities.logUserAction("Article", NewsJS.Telemetry.String.ActionContext.topics, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, item.telemetry ? item.telemetry.k : 0, event)
            }
        }, recordAddTopic: function recordAddTopic(section) {
            if (section) {
                var event = { Topic: section };
                NewsJS.Telemetry.Utilities.logUserAction("Add Topic", NewsJS.Telemetry.String.ActionContext.topics, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, event)
            }
        }, recordAddButtonClick: function recordAddButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Add Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordRemoveButtonClick: function recordRemoveButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Remove Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordPromoteButtonClick: function recordPromoteButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Promote Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordClearButtonClick: function recordClearButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Clear Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordEditButtonClick: function recordEditButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Edit Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
        }, recordRefreshButtonClick: function recordRefreshButtonClick(e) {
            NewsJS.Telemetry.Utilities.recordButtonClick("Refresh Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e);
            NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.refresh)
        }, recordSeeMorePress: function recordSeeMorePress(sectionName) {
            NewsJS.Telemetry.Cluster.recordSeeMorePress("topicCluster", sectionName)
        }, recordAddTopicTilePress: function recordAddTopicTilePress() {
            NewsJS.Telemetry.Utilities.logUserAction("Add Topic Tile", NewsJS.Telemetry.String.ActionContext.topics, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, 0, null)
        }
    })
})()