/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        CategoryPage: WinJS.Class.derive(NewsJS.SourcesContentBasePage, function (state) {
            NewsJS.SourcesContentBasePage.call(this, state);
            this._clusters = new WinJS.Binding.List;
            this._title = state && state.title ? state.title : PlatformJS.Services.resourceLoader.getString("BingDaily");
            var market;
            if (state) {
                this._panoramaState = state.panoramaState;
                market = this._market = state.market;
                this._isHomeMarket = this._market ? this._market === NewsJS.Globalization.getMarketStringForEditorial() : true
            }
            this._state = state;
            var root = document.getElementById("categoryPage");
            if (root && market) {
                root.lang = PlatformJS.Utilities.convertMarketToLanguageCode(market)
            }
            var that = this;
            this._categoryTitle = that._state.categoryName || NewsJS.CategoryPage.getCategoryTitle(that._state.categoryKey);
            this._categoryAdKey = that._state.categoryAdKey;
            if (!this._categoryTitle) {
                throw new Error("Unsupported category");
            }
            this.moreSources = [];
            var refreshButton = PlatformJS.Utilities.getControl("refreshButton");
            refreshButton.label = PlatformJS.Services.resourceLoader.getString("Refresh");
            refreshButton.onclick = function (e) {
                that._refreshPage();
                NewsJS.Telemetry.Category.recordRefreshButtonClick(e)
            };
            this._onEdgyBeforeShowHandler = this._onEdgyBeforeShow.bind(this);
            var edgy = PlatformJS.Utilities.getControl("actionEdgy");
            if (edgy) {
                edgy.addEventListener("beforeshow", this._onEdgyBeforeShowHandler)
            }
            this._maxCMSArticles = PlatformJS.Services.appConfig.getInt32("MaxCMSArticles");
            this._maxAlgoArticle = 0;
            this.cmsLayout = {};
            this.algoLayout = {};
            NewsJS.Utilities.loadDeferredStylesheets();
            that.loadPageData(false)
        }, {
            _state: null, _listView: null, _categoryTitle: null, _maxCMSArticles: 0, _categoryAdKey: null, getPageImpressionContext: function getPageImpressionContext() {
                if (this._state.telemetry && this._state.telemetry.contextString) {
                    return this._state.telemetry.contextString
                }
                else {
                    return NewsJS.Telemetry.String.ImpressionContext.category
                }
            }, loadPageData: function loadPageData(bypassCache) {
                var that = this;
                that.moreSources = [];
                this.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
                var localMarket = { market: that._market || NewsJS.Globalization.getMarketStringForEditorial() };
                var sourcesProvider = null;
                var mergeFeaturedSources = false;
                if (that._isHomeMarket && localMarket.market && localMarket.market.length > 0) {
                    sourcesProvider = new NewsJS.SourcesGalleryProvider(localMarket);
                    mergeFeaturedSources = PlatformJS.Services.appConfig.getDictionary("SourcesConfig").getBool("MergeFeaturedSourcesDataSource")
                }
                var domain = null;
                if (this._state && this._state.domain !== undefined) {
                    domain = this._state.domain
                }
                NewsJS.Utilities.disableButton("refreshButton", true);
                CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType);
                var sourcePromise = null;
                if (sourcesProvider) {
                    sourcePromise = sourcesProvider.fetchData().then(function (response) {
                        return WinJS.Promise.wrap(response)
                    }, function (error) {
                        if (NewsJS.Utilities.isCancellationError(error)) {
                            return WinJS.Promise.wrapError(error)
                        }
                        return WinJS.Promise.wrap(null)
                    })
                }
                var algoCategoryKey = that._state.algoCategoryKey ? that._state.algoCategoryKey : that._state.categoryKey;
                var promises = [this.fetch(that._state.categoryKey, algoCategoryKey, domain, bypassCache)];
                if (mergeFeaturedSources) {
                    promises.push(NewsJS.Utilities.fetchFeaturedSourcesData(localMarket.market).then(function (results) {
                        return WinJS.Promise.wrap(results)
                    }, function (error) {
                        if (NewsJS.Utilities.isCancellationError(error)) {
                            return WinJS.Promise.wrapError(error)
                        }
                        return WinJS.Promise.wrap({})
                    }))
                }
                if (sourcePromise) {
                    promises.push(sourcePromise)
                }
                if (!that._clusterDefinition) {
                    var clPromise = NewsApp.PersonalizationManager.getDefaultClusterDefinition(that._market || NewsJS.Globalization.getMarketString(), that._state.categoryKey).then(function (data) {
                        that._clusterDefinition = data
                    });
                    promises.push(clPromise)
                }
                that._pageDataPromise = WinJS.Promise.join(promises);
                that._pageDataPromise.then(function (joinedResults) {
                    that._pageDataPromise = null;
                    var articles = joinedResults[0];
                    var indexResults = 1;
                    if (mergeFeaturedSources) {
                        that.featuredSources = joinedResults[1];
                        indexResults = 2
                    }
                    that.moreSources = sourcePromise ? that.findMoreSources(joinedResults[indexResults]) : null;
                    that._state.articleResults = articles;
                    if (that._state.articleResults && that._state.articleResults.length > 0) {
                        that.setClusterDataSource();
                        that._pageLoadSucceeded();
                        NewsJS.Utilities.setLastUpdatedTime([that._cmsArticlesLastFetchedTime, that._algoArticlesLastFetchedTime])
                    }
                    else {
                        that._pageLoadFailed()
                    }
                }, function (error) {
                    that._pageDataPromise = null;
                    if (!NewsJS.Utilities.isCancellationError(error)) {
                        that._pageLoadFailed()
                    }
                })
            }, findMoreSources: function findMoreSources(sources) {
                var that = this;
                var results = [];
                if (sources && sources.dataResponse && sources.dataResponse.Topics && sources.columnMap && Array.isArray(sources.dataResponse.Topics)) {
                    var sourcesArray = sources.dataResponse.Topics;
                    for (var iSource = 0; iSource < sourcesArray.length; iSource++) {
                        var entity = sourcesArray[iSource];
                        if (!News.NewsUtil.instance.isDomainBlockListed(entity[sources.columnMap["topicname"]])) {
                            var source = NewsJS.Utilities.createSourceData(sources, entity, null, null, that.featuredSources);
                            var sourceResult = {
                                categoryKey: "sourcesContent", template: "sourceItemTemplate", data: source, moduleInfo: { renderer: this.sourcesItemRenderer }
                            };
                            if (source && source.featured && source.categoryKeys[that._state.categoryKey] && !source.is_not_featured) {
                                results.push(sourceResult)
                            }
                        }
                    }
                }
                if (results.length > 1) {
                    results.sort(function (a, b) {
                        var alphaA = a.data.alpha.toLocaleLowerCase();
                        var alphaB = b.data.alpha.toLocaleLowerCase();
                        if (alphaA < alphaB) {
                            return -1
                        }
                        else if (alphaA > alphaB) {
                            return 1
                        }
                        else {
                            return 0
                        }
                    })
                }
                return results
            }, setClusterDataSource: function setClusterDataSource() {
                var that = this;
                var editorialClusterVisible = false;
                var algoClusterVisible = false;
                var adUnitId = "";
                var defaultProviderIdFromConfig = NewsJS.Utilities.defaultProviderId();
                var adsConfig = PlatformJS.Ads.getAdsConfig(that._state.categoryKey, null, defaultProviderIdFromConfig);
                if (adsConfig) {
                    adUnitId = adsConfig.adUnitId
                }
                that._clusters.splice(0, that._clusters.length);
                if (that._state.articleResults && that._state.articleResults.length > 0) {
                    var mergeThreshold = PlatformJS.Services.appConfig.getInt32("ThresholdToMergeEditorialAndAlgo");
                    var mergeEditorialAndAlgo = this.cmsArticles && (this.cmsArticles.length < mergeThreshold) ? true : false;
                    var categoryArticleInfos = { articleInfos: [] };
                    if (this.cmsArticles) {
                        for (var i = 0; i < this.cmsArticles.length; i++) {
                            var editorialArticle = this.cmsArticles[i];
                            if (editorialArticle && editorialArticle.type === "article") {
                                var articleIdPath = NewsJS.Utilities.getEditorialArticleIdPath(editorialArticle);
                                if (articleIdPath) {
                                    var articleInfo = {
                                        articleId: articleIdPath, headline: editorialArticle.title, abstract: editorialArticle.abstract, thumbnail: editorialArticle.thumbnailLowRes || editorialArticle.thumbnail
                                    };
                                    categoryArticleInfos.articleInfos.push(articleInfo)
                                }
                            }
                        }
                    }
                    var clusterInfo;
                    if ((this.cmsArticles && this.cmsArticles.length > 0) || mergeEditorialAndAlgo) {
                        clusterInfo = {
                            title: that._categoryTitle, thumbnail: { url: "" }, moduleInfo: {
                                height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
                            }
                        };
                        if (this.cmsArticles && this.cmsArticles.length > 0 && this.cmsArticles[0].semanticZoomThumbnail && this.cmsArticles[0].semanticZoomThumbnail.url) {
                            clusterInfo.thumbnail.url = this.cmsArticles[0].semanticZoomThumbnail.url;
                            clusterInfo.moduleInfo.templateId = "homeSemanticTile"
                        }
                        var cmsDataResults = { newsItems: mergeEditorialAndAlgo ? that._state.articleResults : this.cmsArticles };
                        if (that.cmsLayout.layoutCacheInfo) {
                            cmsDataResults.clusterID = "category_" + that._state.categoryKey;
                            cmsDataResults.cacheID = that.cmsLayout.layoutCacheInfo.cacheID;
                            cmsDataResults.dataCacheID = that.cmsLayout.layoutCacheInfo.cacheKey;
                            cmsDataResults.uniqueResponseID = that.cmsLayout.layoutCacheInfo.uniqueResponseID
                        }
                        var contentOptions = {
                            mode: CommonJS.News.ClusterMode.static, onitemclick: function onitemclick(e) {
                                if (e.item && e.item.editorial && categoryArticleInfos && categoryArticleInfos.articleInfos && categoryArticleInfos.articleInfos.length > 0) {
                                    e.item.clusterArticles = categoryArticleInfos
                                }
                                e.item.market = that._market;
                                that.itemInvoked(e)
                            }, providerId: defaultProviderIdFromConfig, adLayoutOverrideKey: !this._isHomeMarket ? "noad" : null, dataSet: cmsDataResults, theme: "newsAppTheme", configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, telemetry: {
                                getCurrentImpression: function getCurrentImpression() {
                                    return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
                                }
                            }, categoryKey: that._state.categoryKey
                        };
                        that._clusters.push({
                            clusterEntity: clusterInfo, clusterKey: that._state.categoryKey, clusterTitle: PlatformJS.Services.resourceLoader.getString("EditorPickHeader"), clusterContent: {
                                contentControl: "CommonJS.News.EntityCluster", contentOptions: contentOptions
                            }
                        });
                        editorialClusterVisible = true
                    }
                    if (that.moreSources && that.moreSources.length > 0) {
                        clusterInfo = {
                            title: that.moreSources.length > 1 ? PlatformJS.Services.resourceLoader.getString("FeaturedSources") : PlatformJS.Services.resourceLoader.getString("FeaturedSource"), thumbnail: { url: "" }, moduleInfo: {
                                height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
                            }
                        };
                        that._clusters.push({
                            clusterEntity: clusterInfo, clusterKey: clusterInfo.title, clusterTitle: clusterInfo.title, clusterContent: {
                                contentControl: "CommonJS.Immersive.ItemsContainer", contentOptions: {
                                    onitemclick: function onitemclick(e) {
                                        that.sourcesItemInvoked(e)
                                    }, itemDataSource: new WinJS.Binding.List(that.moreSources).dataSource, className: "platformListLayout"
                                }
                            }
                        })
                    }
                    var algoArticleInfos = { articleInfos: [] };
                    if (this.algoArticles && this.algoArticles.length > 0 && !mergeEditorialAndAlgo) {
                        for (var k = 0; k < this.algoArticles.length; k++) {
                            var algoArticle = this.algoArticles[k];
                            var algoArticleIdPath = algoArticle.articleUrl;
                            if (algoArticleIdPath) {
                                var algoArticleInfo = {
                                    articleId: algoArticleIdPath, headline: algoArticle.title, abstract: algoArticle.abstract, thumbnail: algoArticle.thumbnailLowRes || algoArticle.thumbnail
                                };
                                algoArticleInfos.articleInfos.push(algoArticleInfo)
                            }
                        }
                        clusterInfo = {
                            title: PlatformJS.Services.resourceLoader.getString("MoreFromTheWeb"), thumbnail: { url: "" }, moduleInfo: {
                                height: "140px", width: "290px", fragmentPath: "/html/templates.html", templateId: "homeSemanticTileNoImage"
                            }
                        };
                        this._maxAlgoArticles = PlatformJS.Services.appConfig.getInt32("MaxCategoryPanoAlgoArticles");
                        var cappedAlgoArticles = this.algoArticles.slice(0, this._maxAlgoArticles);
                        var algoDataResults = { newsItems: cappedAlgoArticles };
                        if (that.algoLayout.layoutCacheInfo) {
                            algoDataResults.clusterID = "categoryAlgo_" + that._state.categoryKey;
                            algoDataResults.cacheID = that.algoLayout.layoutCacheInfo.cacheID;
                            algoDataResults.dataCacheID = that.algoLayout.layoutCacheInfo.cacheKey;
                            algoDataResults.uniqueResponseID = that.algoLayout.layoutCacheInfo.uniqueResponseID
                        }
                        var clusterKey = "algoKey";
                        that._clusters.push({
                            clusterEntity: clusterInfo, clusterKey: clusterKey, clusterTitle: PlatformJS.Services.resourceLoader.getString("MoreFromTheWeb"), clusterContent: {
                                contentControl: "CommonJS.News.EntityCluster", contentOptions: {
                                    categoryKey: clusterKey, adLayoutOverrideKey: "noad", mode: CommonJS.News.ClusterMode.static, onitemclick: function onitemclick(e) {
                                        if (e.item && algoArticleInfos && algoArticleInfos.articleInfos && algoArticleInfos.articleInfos.length > 0) {
                                            e.item.clusterArticles = algoArticleInfos
                                        }
                                        that.itemInvoked(e)
                                    }, noResultsMessage: "{0} {1}".format(PlatformJS.Services.resourceLoader.getString("NoResultsMessage"), PlatformJS.Services.resourceLoader.getString("NoResultsMessage2")), dataSet: algoDataResults, theme: "newsAppTheme", configKey: "EntityClusterDefaultNewsConfig", configObject: CommonJS.News.EntityClusterConfig.DefaultNews, adsConfig: { adClusterId: "" }
                                }
                            }
                        });
                        algoClusterVisible = true
                    }
                    if (!editorialClusterVisible || !algoClusterVisible) {
                        var panorama = PlatformJS.Utilities.getControl("news_Panorama");
                        panorama.zoomOptions = { locked: true }
                    }
                    var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                    if (panoControl) {
                        panoControl.clusterDataSource = this._clusters.dataSource
                    }
                }
            }, getCappedNewsItems: function getCappedNewsItems(newsItems) {
                var that = this;
                var result;
                if (newsItems && newsItems.length && that._maxCMSArticles && that._maxCMSArticles < newsItems.length) {
                    result = newsItems.slice(0, that._maxCMSArticles)
                }
                else {
                    result = newsItems
                }
                return result
            }, fetch: function fetch(category, algoCategoryKey, domain, bypassCache) {
                var that = this;
                var promises = [];
                this.cmsArticles = [];
                this.algoArticles = [];
                this._cmsArticlesLastFetchedTime = null;
                this._algoArticlesLastFetchedTime = null;
                var bdiRequestUrl = "";
                var bdiTransformer = null;
                if ((!this._isHomeMarket || NewsJS.Globalization.isEditorialEnabled()) && !this._state.disableCMS) {
                    if (!bypassCache && this._state && this._state.categoryData && this._state.categoryData.editorialArticles && this._state.categoryData.editorialArticles.length > 0 && this._state.categoryData.cmsLayout) {
                        this.cmsArticles = this._state.categoryData.editorialArticles;
                        this.cmsLayout = this._state.categoryData.cmsLayout;
                        this._cmsArticlesLastFetchedTime = this._state.cmsArticlesLastFetchedTime
                    }
                    else {
                        promises.push(that.fetchCMS(bypassCache).then(function (cmsData) {
                            that.cmsArticles = that.getCappedNewsItems(cmsData.newsItems);
                            that._cmsArticlesLastFetchedTime = cmsData.lastFetchedTime
                        }, function () {
                            return WinJS.Promise.wrap()
                        }))
                    }
                }
                if (NewsJS.Globalization.isAlgoBrowseEnabled() && this._isHomeMarket) {
                    if (!bypassCache && this._state && this._state.categoryData && this._state.categoryData.algoArticles && this._state.categoryData.algoArticles.length > 0 && this._state.categoryData.algoLayout) {
                        this.algoArticles = this._state.categoryData.algoArticles;
                        this.algoLayout = this._state.categoryData.algoLayout;
                        this._algoArticlesLastFetchedTime = this._state.algoArticlesLastFetchedTime
                    }
                    else {
                        promises.push(that.fetchAlgo(algoCategoryKey, domain, bypassCache).then(function (algoData) {
                            if (algoData) {
                                that.algoArticles = algoData.newsResults;
                                that._algoArticlesLastFetchedTime = algoData.lastFetchedTime;
                                if (that._bdiReporter) {
                                    bdiRequestUrl = algoData.bdiRequestUrl;
                                    bdiTransformer = algoData.transformer
                                }
                            }
                        }, function () {
                            return WinJS.Promise.wrap()
                        }))
                    }
                }
                return new WinJS.Promise.join(promises).then(function (data) {
                    var finalList = [];
                    if (that.cmsArticles) {
                        for (var i = 0; i < that.cmsArticles.length; i++) {
                            finalList.push(that.cmsArticles[i])
                        }
                    }
                    if (that.algoArticles) {
                        for (var j = 0; j < that.algoArticles.length; j++) {
                            var algoArticle = that.algoArticles[j];
                            algoArticle.bdiRequestUrl = bdiRequestUrl;
                            algoArticle.transformer = bdiTransformer;
                            if (algoArticle.deepLink) {
                                algoArticle.destination = algoArticle.deepLink;
                                NewsJS.Bindings.resolveDestination(algoArticle);
                                if (algoArticle.type) {
                                    algoArticle.editorial = true
                                }
                            }
                            finalList.push(that.algoArticles[j])
                        }
                    }
                    return finalList
                })
            }, fetchCMS: function fetchCMS(bypassCache) {
                var that = this;
                return new WinJS.Promise(function (complete) {
                    NewsJS.Data.Bing.getCMSTodayFeed(bypassCache, that._market, that.cmsLayout).then(function (data) {
                        var newsItems = [];
                        if (data && data.data && data.data.categories) {
                            var cmsCategoryData = data.data.categories[that._state.categoryKey];
                            if (cmsCategoryData && cmsCategoryData.entities) {
                                for (var i = cmsCategoryData.entities.length - 1; i >= 0; i--) {
                                    var leadStory = cmsCategoryData.entities[i];
                                    var heroResult = NewsJS.Bindings.convertCMSArticle(leadStory);
                                    if (heroResult) {
                                        if (i === 0) {
                                            heroResult.isLead = true
                                        }
                                        newsItems.unshift(heroResult)
                                    }
                                }
                            }
                        }
                        complete({
                            newsItems: newsItems, lastFetchedTime: data && data.data && data.data.lastFetchedTime ? data.data.lastFetchedTime : null
                        })
                    }, function (error) {
                        complete(null)
                    })
                })
            }, fetchAlgo: function fetchAlgo(category, domain, bypassCache) {
                var that = this;
                return new WinJS.Promise(function (complete) {
                    if (category === "topStories") {
                        NewsJS.Data.Bing.getNewsBrowse(20, domain, bypassCache, that.algoLayout, NewsJS.Telemetry.Search.FormCode.category).then(function (e) {
                            var topStories = null;
                            var lastFetchedTime = null;
                            if (e && e.data) {
                                var data = e.data.dataObject;
                                if (data && data.topStories) {
                                    topStories = PlatformJS.Utilities.convertManageToJSON(data.topStories);
                                    if (topStories) {
                                        var query;
                                        if (typeof domain === "string") {
                                            query = "site:" + domain
                                        }
                                        else {
                                            query = "NewsFromTheWeb:topStories"
                                        }
                                        NewsJS.Telemetry.Search.recordSearch(query, topStories.length, NewsJS.Telemetry.Search.Origin.newsFromTheWeb, e.data.isCachedResponse)
                                    }
                                }
                                lastFetchedTime = e.data.lastUpdateTime ? e.data.lastUpdateTime.getTime() : null
                            }
                            complete({
                                newsResults: topStories, bdiRequestUrl: e ? e.url : null, transformer: e ? e.transformer : null, lastFetchedTime: lastFetchedTime
                            })
                        }, function (error) {
                            complete(null)
                        })
                    }
                    else {
                        return NewsJS.Data.Bing.getNewsBrowseForCategory(category, 0, 20, domain, false, bypassCache, null, that.algoLayout, NewsJS.Telemetry.Search.FormCode.category).then(function (e) {
                            var newsResults = null;
                            var lastFetchedTime = null;
                            if (e && e.data) {
                                var data = PlatformJS.Utilities.convertManageToJSON(e.data.dataObject);
                                if (data && data.newsResults) {
                                    newsResults = data.newsResults;
                                    var query;
                                    if (typeof domain === "string") {
                                        query = "site:" + domain
                                    }
                                    else {
                                        query = "NewsFromTheWeb:" + category
                                    }
                                    NewsJS.Telemetry.Search.recordSearch(query, newsResults.length, NewsJS.Telemetry.Search.Origin.newsFromTheWeb, e.data.isCachedResponse)
                                }
                                lastFetchedTime = e.data.lastUpdateTime ? e.data.lastUpdateTime.getTime() : null
                            }
                            complete({
                                newsResults: newsResults, bdiRequestUrl: e ? e.url : null, transformer: e ? e.transformer : null, lastFetchedTime: lastFetchedTime
                            })
                        }, function (error) {
                            complete(null)
                        })
                    }
                })
            }, getPageState: function getPageState() {
                var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                if (panoControl) {
                    this._state.panoramaState = panoControl.getPanoramaState()
                }
                return this._state
            }, getPageData: function getPageData() {
                var that = this;
                return WinJS.Promise.wrap({
                    title: that._title, panoramaState: that._panoramaState, semanticZoomRenderer: that.newsDailySemanticZoomRenderer
                })
            }, getSearchBoxData: function getSearchBoxData() {
                return new WinJS.Promise.wrap({
                    options: {
                        placeholderText: PlatformJS.Services.resourceLoader.getString("AppSearchHint"), autoSuggestionDataProvider: NewsJS.Autosuggest.getSearchSuggestionDataProvider(), searchHandler: NewsJS.Autosuggest.searchHandler, suggestionChosenHandler: NewsJS.Autosuggest.suggestionHandler, focusOnKeyboardInput: true, chooseSuggestionOnEnter: false
                    }
                })
            }, _clusters: null, sourcesItemInvoked: function sourcesItemInvoked(e) {
                var item = e.item;
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.featuredSourcesCluster);
                this.sourceNavigate(item.data, "featuredsourcescluster")
            }, itemInvoked: function itemInvoked(e) {
                var item = e.item;
                if (item) {
                    if (!item.editorial && this.checkOffline()) {
                        return
                    }
                    var telemetry = item.telemetry || this._state.telemetry || {};
                    telemetry.entryPoint = NewsJS.Telemetry.ArticleReader.EntryPoint.categoryPage;
                    telemetry.source = Platform.Instrumentation.InstrumentationEditorialSourceId.cluster;
                    telemetry.clusterName = telemetry.clusterName || this._state.categoryName;
                    telemetry.guid = telemetry.guid || this._state.categoryKey;
                    item.telemetry = telemetry;
                    item.disablePaywall = true;
                    var adTagKey = PlatformJS.Services.configuration.getDictionary("AdTags").getString("CategoryAdTagKey") || "BINGAPPS";
                    item.AdTags = [{
                        key: adTagKey, value: this._categoryAdKey
                    }];
                    var categoryKey = this._state && this._state.categoryKey;
                    if (!categoryKey) {
                        categoryKey = (this._clusterDefinition && this._clusterDefinition.providerConfiguration && this._clusterDefinition.providerConfiguration.categoryKey) || categoryKey
                    }
                    item.categoryKey = categoryKey;
                    NewsJS.Telemetry.Cluster.recordClusterItemPress(categoryKey, item);
                    NewsJS.Utilities.launchArticle(item)
                }
            }, dispose: function dispose() {
                var edgy = PlatformJS.Utilities.getControl("actionEdgy");
                if (edgy) {
                    edgy.removeEventListener("beforeshow", this._onEdgyBeforeShowHandler);
                    this._onEdgyBeforeShowHandler = null
                }
                NewsJS.SourcesContentBasePage.prototype.dispose.call(this)
            }, _onEdgyBeforeShow: function _onEdgyBeforeShow() {
                NewsJS.Utilities.Pinning.setupPinCategoryButton("pinCategory", "Pin Category Button", this._state, this._categoryTitle);
                if (this._isHomeMarket) {
                    NewsJS.Utilities.setupAddSectionButton(NewsJS.Personalization.Utilities.sectionType.Category, {
                        market: this._market || NewsJS.Globalization.getMarketString(), appMarket: NewsJS.Globalization.getMarketString(), categoryKey: this._state.categoryKey, clusterDefinition: this._clusterDefinition
                    })
                }
            }
        }, {
            getCategoryTitle: function getCategoryTitle(categoryKey) {
                var configCategories = PlatformJS.Services.appConfig.getList("CategoriesForMarket");
                if (configCategories && configCategories.size > 0) {
                    for (var z = 0; z < configCategories.length; z++) {
                        var categoryInfo = configCategories[z];
                        if (categoryKey === categoryInfo["CategoryKey"].value) {
                            return categoryInfo["Category"].value
                        }
                    }
                }
                return ""
            }
        })
    })
})()