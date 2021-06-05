/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    var ResponseType = {
        state: "state", cache: "cache", live: "live"
    };
    function _() { }
    var events = {
        draw: "draw", execute: "execute", wait: "wait", complete: "complete", error: "error", finalize: "finalize"
    };
    var states = {
        waiting: "waiting", pending: "pending", drawing: "drawing", complete: "complete", error: "error", final: "final", allStates: "*"
    };
    var stateMachineConfig = [{
        name: events.draw, from: states.waiting, to: states.pending
    }, {
        name: events.draw, from: states.pending, to: states.pending
    }, {
        name: events.draw, from: states.drawing, to: states.drawing
    }, {
        name: events.execute, from: states.pending, to: states.drawing
    }, {
        name: events.wait, from: states.drawing, to: states.waiting
    }, {
        name: events.complete, from: states.drawing, to: states.complete
    }, {
        name: events.wait, from: states.complete, to: states.waiting
    }, {
        name: events.complete, from: states.error, to: states.complete
    }, {
        name: events.error, from: states.allStates, to: states.error
    }, {
        name: events.finalize, from: states.allStates, to: states.final
    }, {
        name: events.draw, from: states.final, to: states.final
    }, {
        name: events.complete, from: states.final, to: states.final
    },];
    var handlers = {
        onwaiting: function onwaiting(view) {
            if (this._cachedRender) {
                var data = this._cachedRender;
                this._cachedRender = null;
                view.draw(data.response, data.responseType)
            }
            ;
        }, onpending: function onpending(view, response, responseType) {
            this.handle = this.orchestrator.submit({
                identifier: "drawing (" + responseType + ")", execute: function execute() {
                    return view.execute(response, responseType)
                }, getPriority: function getPriority() {
                    return 0
                }
            })
        }, onexitpending: function onexitpending() {
            if (this.handle) {
                this.handle.cancel();
                this.handle = null
            }
        }, ondrawing: function ondrawing(view, response, responseType) {
            if (this.operation) {
                this._cachedRender = {
                    response: response, responseType: responseType
                };
                return
            }
            var strategy = this.strategy || "firstRenderingStrategy",
                operation = this.operation = this[strategy](view, response, responseType);
            if (operation && operation.then) {
                return operation.then(function () {
                    view.complete()
                })
            }
            else {
                view.complete();
                return null
            }
        }, oncomplete: function oncomplete(view) {
            if (this.operation && this.operation.cancel) {
                this.operation.cancel()
            }
            ;
            this.operation = null;
            PlatformJS.platformInitializedPromise.then(function _hideProgressIfHasInternetConnection() {
                if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                    CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
                }
            });
            this.complete();
            view.wait()
        }, onerror: function onerror(view, exception) {
            if (this.operation && this.operation.cancel) {
                this.operation.cancel()
            }
            ;
            this.operation = null;
            this._cachedRender = null;
            this.complete();
            this.onError(exception);
            view.complete()
        }, onfinal: function onfinal(view) {
            if (this.operation && this.operation.cancel) {
                this.operation.cancel()
            }
            ;
            this.operation = null;
            this._cachedRender = null;
            this.complete()
        }
    };
    WinJS.Namespace.define("NewsApp.Controls", {
        ControlBase: WinJS.Class.define(function (element, options, orchestrator) {
            this.element = element;
            WinJS.Utilities.addClass(this.element, CommonJS.RESPONSIVE_RESIZABLE_CLASS);
            this.options = options;
            this.orchestrator = orchestrator || NewsApp.Orchestration.getOrchestrator();
            this.view = new NewsApp.StateMachine(stateMachineConfig, handlers, states.waiting, this);
            NewsApp.PageEvents.register("resuming", this.onResuming.bind(this));
            NewsApp.PageEvents.register("resumed", this.onResumed.bind(this));
            NewsApp.PageEvents.register("connectionchanging", this.onConnectionChanging.bind(this));
            NewsApp.PageEvents.register("connectionchanged", this.onConnectionChanged.bind(this));
            NewsApp.PageEvents.register("refreshing", this.onRefreshing.bind(this));
            NewsApp.PageEvents.register("refreshed", this.onRefreshed.bind(this))
        }, {
            element: null, options: null, control: null, orchestrator: null, lastModified: 0, completion: null, onResuming: _, onResumed: _, onConnectionChanging: _, onConnectionChanged: _, onRefreshing: _, onRefreshed: _, onError: _, stitchArticles: function stitchArticles(item, newsItems, crossCluster, index) {
                if (item && newsItems) {
                    var articleInfos = [];
                    for (var j = 0, jlen = newsItems.length; j < jlen; j++) {
                        var newsItem = newsItems[j];
                        if (newsItem && newsItem.type === "article") {
                            var articleInfo = NewsJS.Utilities.getArticleInfo(newsItem);
                            if (articleInfo) {
                                articleInfos.push(articleInfo)
                            }
                        }
                    }
                    item.clusterArticles = { articleInfos: articleInfos };
                    if (crossCluster) {
                        item.clusterArticles.indexBased = true;
                        item.clusterArticles.articleIndex = index
                    }
                }
            }, isCacheValid: function isCacheValid(state) {
                return state && state.lastModified
            }, onWindowResize: function onWindowResize(event) {
                CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
                    if (this.control && this.control.onWindowResize) {
                        this.control.onWindowResize(event)
                    }
                })
            }, onDpiChange: function onDpiChange(event) {
                if (this.control && this.control.onDpiChange) {
                    this.control.onDpiChange(event)
                }
            }, dispose: function dispose() {
                if (this.control && this.control.dispose) {
                    this.control.dispose()
                }
                this.view.finalize()
            }, setCompletionHandler: function setCompletionHandler(delegate) {
                this.complete = function () {
                    delegate()
                }
            }, complete: function complete() {
                this.setCompletionHandler = function (delegate) {
                    debugger;
                    delegate()
                }
            }, render: function render(args) {
                PlatformJS.platformInitializedPromise.then(function _showProgressIfHasInternetConnection() {
                    if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                        CommonJS.Progress.showProgress(CommonJS.Progress.headerProgressType)
                    }
                });
                var that = this,
                    allowDeferral = false,
                    options = this.options,
                    provider = this.createProviderInstance(),
                    view = this.view;
                return new WinJS.Promise(function (c) {
                    that.setCompletionHandler(c);
                    if (options.goodState && that.isCacheValid(options.goodState)) {
                        that.lastModified = options.goodState.lastModified;
                        view.draw(options.goodState, ResponseType.state);
                        options.goodState = null;
                        allowDeferral = true
                    }
                    if (provider) {
                        provider.request(args, allowDeferral).then(function (response) {
                            if (that.isUpdated(response)) {
                                view.draw(response, ResponseType.live)
                            }
                        }, function (exception) {
                            view.error(exception)
                        }, function (cache) {
                            if (that.isUpdated(cache)) {
                                view.draw(cache, ResponseType.cache)
                            }
                        })
                    }
                    else {
                        var error = new Error("NoDataProvider");
                        error.messageResource = "MustUpgrade";
                        error.errorContainerClassName = "newsUnknownCluster";
                        view.error(error)
                    }
                })
            }, firstRenderingStrategy: function firstRenderingStrategy(view, response, responseType) {
                if (responseType === ResponseType.state) {
                    this.strategy = "nextRenderingStrategy";
                    return this.renderState(response)
                }
                else {
                    this.strategy = "nextRenderingStrategy";
                    return this.renderFirstTime(response)
                }
            }, nextRenderingStrategy: function nextRenderingStrategy(view, response) {
                return this.renderNextTime(response)
            }, isUpdated: function isUpdated(response) {
                if (response && (!this.lastModified || (response.lastModified && this.lastModified < response.lastModified))) {
                    this.lastModified = response.lastModified;
                    return true
                }
                PlatformJS.platformInitializedPromise.then(function _hideProgressIfHasInternetConnection() {
                    if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                        CommonJS.Progress.hideProgress(CommonJS.Progress.headerProgressType)
                    }
                });
                return false
            }
        })
    })
})();
(function () {
    "use strict";
    var MAX_COLUMN_COUNT = 3;
    function onItemClicked(evt) {
        var item = evt.item,
            source = null;
        if (item) {
            var telemetry = item.telemetry || {};
            telemetry.source = item.isHero ? Platform.Instrumentation.InstrumentationEditorialSourceId.heroImage : Platform.Instrumentation.InstrumentationEditorialSourceId.cluster;
            telemetry.entryPoint = Platform.Instrumentation.InstrumentationArticleEntryPoint.homePano;
            item.telemetry = telemetry;
            item.disablePaywall = true;
            NewsJS.Telemetry.Cluster.recordClusterItemPress(item.categoryKey, item);
            NewsJS.Utilities.launchArticle(item)
        }
    }
    function onVideoItemClicked(evt) {
        var item = evt.item;
        var uri = NewsJS.Utilities.parseCMSUriString(item.destination);
        if (!uri || !uri.contentId) {
            console.log("unable to extract contentID from video clip to launch: " + evt);
            return
        }
        NewsJS.Telemetry.Cluster.recordClusterItemPress(item.categoryKey, item);
        CommonJS.MediaApp.Controls.MediaPlayback.inlinePlayback(evt, uri.contentId)
    }
    WinJS.Namespace.define("NewsApp.Controls", {
        CategoryControl: WinJS.Class.derive(NewsApp.Controls.ControlBase, function (element, options, orchestrator) {
            NewsApp.Controls.ControlBase.call(this, element, options, orchestrator);
            this.supportsContentRefresh = true
        }, {
            createProviderInstance: function createProviderInstance() {
                var options = this.options,
                    config = options.providerConfiguration;
                return PlatformJS.Utilities.createObject(config.providerType, config, this.orchestrator)
            }, createControl: function createControl(options) {
                if (options === undefined) {
                    options = this.getControlOptions()
                }
                this.control = new CommonJS.News.EntityCluster(this.element, options);
                this.control.scheduler = this.scheduler;
                return this.control
            }, errorRetry: function errorRetry(evt) {
                this.render({
                    bypassCache: true, refresh: true
                })
            }, getControlOptions: function getControlOptions() {
                var that = this;
                var config = this.options.providerConfiguration;
                var clusterKey = (config && config.categoryKey) ? config.categoryKey : clusterName;
                var options = {
                    categoryKey: clusterKey, providerId: NewsJS.Utilities.defaultProviderId(), showInClusterAd: (this.options && this.options.showInClusterAd) || false, mode: CommonJS.News.ClusterMode.static, theme: config.theme || "newsAppTheme", maxColumnCount: MAX_COLUMN_COUNT, configKey: config.configKey || "EntityClusterDefaultNewsConfig", configObject: config.configObject || CommonJS.News.EntityClusterConfig.DefaultNews, forceShowSeeMore: true, retryHandler: function retryHandler(evt) {
                        that.errorRetry(evt)
                    }, onitemclick: function onitemclick(evt) {
                        PlatformJS.execDeferredNavigate(function fireOnItemClickHandler() {
                            var item = evt.item;
                            if (item) {
                                var telemetry = item.telemetry || {};
                                telemetry.clusterName = that.options.title;
                                item.telemetry = telemetry;
                                if (that.options) {
                                    var categoryAdKey = that.options.categoryAdKey || (that.options.providerConfiguration ? that.options.providerConfiguration.categoryAdKey : null);
                                    if (categoryAdKey) {
                                        var adTagKey = PlatformJS.Services.configuration.getDictionary("AdTags").getString("CategoryAdTagKey") || "BINGAPPS";
                                        item.AdTags = [{
                                            key: adTagKey, value: categoryAdKey
                                        }]
                                    }
                                }
                            }
                            that.itemClickHandler(evt)
                        })
                    }, telemetry: {
                        getCurrentImpression: function getCurrentImpression() {
                            return PlatformJS.Navigation.mainNavigator.getCurrentImpression()
                        }
                    }
                };
                if (that.options && that.options.title && that.options.onSeeMoreClick) {
                    var clusterName = that.options.title;
                    options.enableSeeMore = true;
                    options.categoryName = clusterName;
                    options.onseemoreclick = function () {
                        that.options.onSeeMoreClick(clusterKey)
                    }
                }
                return options
            }, getControlOptionsUsingResponse: function getControlOptionsUsingResponse(response) {
                var that = this;
                var options = this.getControlOptions();
                options.dataSet = response ? response : {};
                if (that && that.options && that.options.guid) {
                    var clusterGuid = that.options.guid.replace(".", "").replace(" ", "").replace("-", "").replace("_", "");
                    options.dataSet.imageTag = clusterGuid
                }
                return options
            }, isCacheValid: function isCacheValid(response) {
                var control = this.createControl();
                return control.isLastKnownGoodStateValid(response.controlState)
            }, clearControl: function clearControl() {
                if (this.control) {
                    if (this.control.dispose) {
                        this.control.dispose();
                        this.control = null
                    }
                    if (this.element) {
                        this.element.innerHTML = "";
                        this.element.onClick = null;
                        this.element.onKeyDown = null;
                        this.element.onMsPointerUp = null;
                        this.element.onMsPointerDown = null
                    }
                }
            }, onError: function onError(error) {
                this.lastModified = 0;
                return this.renderFirstTime({})
            }, renderState: function renderState(response) {
                var control = this.control;
                if (!control) {
                    control = this.createControl()
                }
                this.clusterArticles = response.clusterArticles;
                if (response.controlState && response.controlState.itemWrappers) {
                    for (var i = 0, ilen = response.controlState.itemWrappers.length; i < ilen; i++) {
                        NewsJS.Bindings.updateArticleTimes(response.controlState.itemWrappers[i].item)
                    }
                }
                return control.renderLastKnownGoodState(response.controlState)
            }, renderFirstTime: function renderFirstTime(response) {
                this.clearControl();
                if (response) {
                    this.clusterArticles = response.clusterArticles
                }
                var control = this.createControl(this.getControlOptionsUsingResponse(response));
                return control.render()
            }, renderNextTime: function renderNextTime(response) {
                var that = this;
                return this.renderFirstTime(response).then(function (param) {
                    that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, true);
                    return param
                })
            }, onConnectionChanged: function onConnectionChanged(evt) {
                if (evt.connection) {
                    this.render()
                }
            }, onResumed: function onResumed(evt) {
                this.render()
            }, onRefreshed: function onRefreshed(evt) {
                this.render({ bypassCache: true })
            }, itemClickHandler: function itemClickHandler(evt) {
                if (evt.item) {
                    var item = evt.item,
                        clusterArticles = this.clusterArticles || evt.clusterArticles;
                    if (clusterArticles) {
                        item.clusterArticles = JSON.parse(JSON.stringify(clusterArticles))
                    }
                    item.market = item.market || (this.options && this.options.providerConfiguration ? this.options.providerConfiguration.market : null);
                    item.categoryKey = item.categoryKey || (this.options && this.options.guid ? this.options.guid : null);
                    onItemClicked(evt)
                }
            }, getGoodState: function getGoodState() {
                if (this.control) {
                    var controlState = this.control.getLastKnownGoodState();
                    if (controlState) {
                        return {
                            lastModified: this.lastModified, controlState: controlState, clusterArticles: this.clusterArticles
                        }
                    }
                    else {
                        return null
                    }
                }
                else {
                    return null
                }
            }
        })
    });
    WinJS.Class.mix(NewsApp.Controls.CategoryControl, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin)
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls", {
        CustomPartnersControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {
            getNavigationState: function getNavigationState(item) {
                var state = {
                    providerConfiguration: {
                        feedType: item.feedType, feedIdentifierValue: item.feedIdentifierValue, articleList: JSON.stringify(item.articleList)
                    }, initialArticleId: item.articleId, enableSharing: true, enableSnap: true, snappedHeaderTitle: " ", snappedHeaderFontColor: "headerFontDark", originatingSection: item.originatingSection, originatingFeed: item.originatingFeed
                };
                return state
            }
        })
    })
})();
(function () {
    "use strict";
    function getValidActions() {
        var subscribeAction = {
            icon: {
                type: "image", url: "/nytshared/images/gray_sub.svg"
            }, text: CommonJS.Partners.Config.getConfig("NYT", "ArticleSubscriptionMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleSubscriptionMessage")), textSize: "small"
        };
        var downloadAction = {
            icon: {
                type: "image", url: "/nytshared/images/NYT_black_t-bg.svg"
            }, text: CommonJS.Partners.Config.getConfig("NYT", "ArticleDownloadMessage", PlatformJS.Services.resourceLoader.getString("/nyt/ArticleDownloadMessage")), textSize: "small"
        };
        return {
            subscribeAction: subscribeAction, downloadAction: downloadAction
        }
    }
    function onItemClicked(evt) {
        var item = evt.item;
        if (item) {
            var state = NewsApp.Controls.CustomPartnersControl.prototype.getNavigationState(item);
            state.providerType = "NYTJS.ArticleReader.Provider";
            state.theme = "NYT";
            state.validActions = getValidActions();
            state.actionKeys = ["subscribeAction", "downloadAction"];
            state.actionsHandlerType = "NYTJS.ArticleReader.NYTArticleActionsHandler";
            WinJS.Navigation.navigate({
                fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: "NYTJS.ArticleReader.Page"
            }, state)
        }
    }
    ;
    WinJS.Namespace.define("NewsApp.Controls", {
        NYTControl: WinJS.Class.derive(NewsApp.Controls.CustomPartnersControl, function (element, options) {
            NewsApp.Controls.CustomPartnersControl.call(this, element, options)
        }, {
            itemClickHandler: function itemClickHandler(evt) {
                onItemClicked(evt)
            }
        })
    })
})();
(function () {
    "use strict";
    function getValidActions() {
        var subscribeAction = {
            icon: {
                type: "image", url: "/wsjshared/images/gray_sub.svg"
            }, text: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleSubscriptionMessage"), textSize: "small"
        };
        var downloadAction = {
            icon: {
                type: "image", url: "/wsjshared/images/WSJLogoBlack.png"
            }, text: PlatformJS.Services.resourceLoader.getString("/wsj/ArticleDownloadMessage"), textSize: "small"
        };
        return {
            subscribeAction: subscribeAction, downloadAction: downloadAction
        }
    }
    function onItemClicked(evt) {
        var item = evt.item;
        if (item) {
            var state = NewsApp.Controls.CustomPartnersControl.prototype.getNavigationState(item);
            state.providerType = "WSJJS.ArticleReader.Provider";
            state.theme = "WSJ";
            state.validActions = getValidActions();
            state.actionKeys = ["subscribeAction", "downloadAction"];
            state.actionsHandlerType = "WSJJS.ArticleReader.WSJArticleActionsHandler";
            WinJS.Navigation.navigate({
                fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: "WSJJS.ArticleReader.Page"
            }, state)
        }
    }
    ;
    WinJS.Namespace.define("NewsApp.Controls", {
        WSJControl: WinJS.Class.derive(NewsApp.Controls.CustomPartnersControl, function (element, options) {
            NewsApp.Controls.CustomPartnersControl.call(this, element, options)
        }, {
            itemClickHandler: function itemClickHandler(evt) {
                onItemClicked(evt)
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls.UserSection", {
        InternationalEditionControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {})
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls.UserSection", {
        SourceControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {})
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls.UserSection", {
        TopicControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {})
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls", {
        HeroControl: WinJS.Class.derive(NewsApp.Controls.ControlBase, function (element, options, orchestrator) {
            NewsApp.Controls.ControlBase.call(this, element, options, orchestrator);
            this.supportsContentRefresh = true;
            element.winControl = this
        }, {
            element: null, options: null, disableAnimation: true, createProviderInstance: function createProviderInstance() {
                var options = this.options,
                    config = options.providerConfiguration;
                return new NewsApp.DataProviders.CMS.DataProvider(config, this.orchestrator)
            }, renderState: function renderState(response) {
                if (response.response) {
                    NewsJS.Bindings.updateArticleTimes(response.response)
                }
                return this.renderFirstTime(response)
            }, renderFirstTime: function renderFirstTime(response) {
                NewsJS.Utilities.ParamChecks.throwIfNull(response, "NewsApp.Controls.HeroControl.renderFirstTime:  param:response is null.");
                var that = this;
                var editorial = response.response,
                    element = this.element,
                    options = createHeroOptionsFromMetadata(editorial, response.clusterArticles);
                this.editorialArticles = editorial;
                this.clusterArticles = response.clusterArticles;
                options.onitemclick = function (evt) {
                    PlatformJS.execDeferredNavigate(function fireOnItemClickHandler() {
                        if (evt && evt.item && evt.item.article) {
                            that.itemClickHandler(evt)
                        }
                    })
                };
                this.lastGoodModel = response;
                NewsJS.Telemetry.BingDaily.recordHeroContentView(options);
                var control = this.control = new CommonJS.Immersive.PlatformHeroControl(element, options);
                return control.render()
            }, renderNextTime: function renderNextTime(response) {
                NewsJS.Utilities.ParamChecks.throwIfNull(response, "NewsApp.Controls.HeroControl.renderNextTime:  param:response is null.");
                var that = this;
                var editorial = response.response,
                    options = createHeroOptionsFromMetadata(editorial, response.clusterArticles);
                this.editorialArticles = editorial;
                this.clusterArticles = response.clusterArticles;
                NewsJS.Telemetry.BingDaily.recordHeroContentView(options);
                this.lastGoodModel = response;
                if (this.control && this.control.refresh) {
                    return this.control.refresh(options).then(function (param) {
                        that.dispatchEvent(CommonJS.Immersive.ClusterControlRefreshedEvent, true);
                        return param
                    })
                }
                else {
                    return WinJS.Promise.wrap(null)
                }
            }, customizationImageUrl: function customizationImageUrl() {
                if (this.lastGoodModel && this.lastGoodModel.response) {
                    var response = this.lastGoodModel.response;
                    if (response.thumbnailLowRes) {
                        return response.thumbnailLowRes.url
                    }
                    else if (response.thumbnail) {
                        return response.thumbnail.url
                    }
                }
                return null
            }, itemClickHandler: function itemClickHandler(e) {
                var that = this;
                var item = e.item.article;
                item.market = item.market || (this.options && this.options.providerConfiguration ? this.options.providerConfiguration.market : null);
                var clusterArticles = this.clusterArticles || e.clusterArticles;
                if (clusterArticles) {
                    item.clusterArticles = NewsJS.Utilities.clone(clusterArticles);
                    item.clusterArticles.indexBased = true;
                    this._reorderClusterArticlesBasedOnHeroContent(item);
                    this._setArticleReaderIndex(item)
                }
                onItemClicked(item)
            }, _reorderClusterArticlesBasedOnHeroContent: function _reorderClusterArticlesBasedOnHeroContent(item) {
                if (!NewsJS.Utilities.ParamChecks.isNull(this.editorialArticles) && !NewsJS.Utilities.ParamChecks.isNullOrEmpty(this.editorialArticles.heroItems) && !NewsJS.Utilities.ParamChecks.isNull(item) && !NewsJS.Utilities.ParamChecks.isNull(item.clusterArticles) && !NewsJS.Utilities.ParamChecks.isNullOrEmpty(item.clusterArticles.articleInfos)) {
                    if (this.editorialArticles.heroItems.length < item.clusterArticles.articleInfos.length) {
                        for (var indexOfHeroItem = 0; indexOfHeroItem < this.editorialArticles.heroItems.length; indexOfHeroItem++) {
                            var found = false;
                            var heroContentId = null;
                            if (this.editorialArticles.heroItems[indexOfHeroItem]) {
                                heroContentId = this.editorialArticles.heroItems[indexOfHeroItem].contentid
                            }
                            if (heroContentId) {
                                for (var indexOfArticleCluster = 0; indexOfArticleCluster < item.clusterArticles.articleInfos.length; indexOfArticleCluster++) {
                                    var articleInfosContentId = null;
                                    var tempArticle = item.clusterArticles.articleInfos[indexOfArticleCluster];
                                    var articleIdComponents = tempArticle.articleId.split('/');
                                    if (!NewsJS.Utilities.ParamChecks.isNull(tempArticle) && !NewsJS.Utilities.ParamChecks.isNull(tempArticle.articleId)) {
                                        NewsJS.Utilities.ParamChecks.throwIfNullOrEmpty(articleIdComponents, "NewsApp.Controls.HeroControl._reorderClusterArticlesBasedOnHeroContent:  articleIdComponents is null.");
                                        if (articleIdComponents.length === 2) {
                                            articleInfosContentId = articleIdComponents[1]
                                        }
                                        else {
                                            continue
                                        }
                                    }
                                    if (articleInfosContentId === heroContentId) {
                                        if (!found) {
                                            var temp = item.clusterArticles.articleInfos[indexOfHeroItem];
                                            item.clusterArticles.articleInfos[indexOfHeroItem] = item.clusterArticles.articleInfos[indexOfArticleCluster];
                                            item.clusterArticles.articleInfos[indexOfArticleCluster] = temp;
                                            found = true
                                        }
                                        else {
                                            item.clusterArticles.articleInfos.splice(indexOfArticleCluster, 1);
                                            if (indexOfArticleCluster - 1 > -1) {
                                                --indexOfArticleCluster
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }, _setArticleReaderIndex: function _setArticleReaderIndex(selectedItem) {
                if (selectedItem.clusterArticles.articleInfos) {
                    for (var i = 0; i < selectedItem.clusterArticles.articleInfos.length; i++) {
                        if (selectedItem.clusterArticles.articleInfos[i] && selectedItem.clusterArticles.articleInfos[i].articleId) {
                            var id = selectedItem.clusterArticles.articleInfos[i].articleId.split('/')[1];
                            if (id && selectedItem.contentid === id) {
                                selectedItem.clusterArticles.articleIndex = i;
                                break
                            }
                        }
                        else {
                            continue
                        }
                    }
                }
                if (selectedItem.clusterArticles.articleIndex === null || selectedItem.clusterArticles.articleIndex === undefined) {
                    selectedItem.clusterArticles.articleIndex = 0
                }
            }, onConnectionChanged: function onConnectionChanged(evt) {
                if (evt.connection) {
                    this.render()
                }
            }, onResumed: function onResumed(evt) {
                this.render()
            }, onRefreshed: function onRefreshed(evt) {
                this.render({ bypassCache: true })
            }, getGoodState: function getGoodState() {
                return this.lastGoodModel
            }
        })
    });
    function createItemMetadataSingleStory(item) {
        var heroTemplate = "panoHero";
        var addedClassName = "";
        var barText = PlatformJS.Services.resourceLoader.getString("breakingNews");
        if (!NewsJS.Utilities.ParamChecks.isNull(item.moduleInfo) && item.moduleInfo.template) {
            switch (item.moduleInfo.template) {
                case "hero_breaking_news":
                    heroTemplate = "panoHeroBreakingNews";
                    addedClassName = " breakingNewsHero";
                    break;
                case "hero_breaking_news_large_headline":
                    heroTemplate = "panoHeroBreakingNews";
                    addedClassName = " breakingNewsHeroLarge";
                    break;
                case "hero_developing_story":
                    heroTemplate = "panoHeroBreakingNews";
                    addedClassName = " developingStoryHero";
                    barText = PlatformJS.Services.resourceLoader.getString("developingStory");
                    break;
                default:
                    break
            }
        }
        item.moduleInfo = {
            isInteractive: false, fragmentPath: "/html/templates-launch.html", templateId: heroTemplate, className: "leadStoryLayoutImage" + addedClassName, tabIndex: -1
        };
        item.title = item.headline;
        item.favicon = item.sourceImageUrl;
        item.faviconErrorHandler = _getFavIconErrorHandler();
        item.article = JSON.parse(JSON.stringify(item));
        item.breakingNews = barText
    }
    function createItemMetaDataMultiStory(data, newsItems) {
        if (NewsJS.Utilities.ParamChecks.isNullOrEmpty(data)) {
            return
        }
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            var templateId;
            var className;
            if (item.entityType === "Hero") {
                item.sourceIcon = item.sourceImageUrl;
                templateId = "PrimaryHeroItemMultiStoryLayout";
                className = "primaryItemMultiStoryHero";
                var template = item.moduleInfo && item.moduleInfo.template ? item.moduleInfo.template : "";
                var barText = PlatformJS.Services.resourceLoader.getString("breakingNews");
                if (template === "hero_breaking_news" || template === "hero_breaking_news_large_headline") {
                    templateId = "PrimaryHeroItemMultiStoryLayout_BreakingNews";
                    className = "primaryItemMultiStoryHero herobreakingNews"
                }
                else if (template === "hero_developing_story") {
                    templateId = "PrimaryHeroItemMultiStoryLayout_BreakingNews";
                    className = "primaryItemMultiStoryHero developingStoryHero";
                    barText = PlatformJS.Services.resourceLoader.getString("developingStory")
                }
                item.breakingNews = barText;
                item.faviconErrorHandler = _getFavIconErrorHandler()
            }
            else {
                templateId = "SecondaryHeroItemMultiStoryLayout";
                className = "secondaryItemMultiStoryHero";
                item.thumbnailImage = item.imageData && item.imageData.backgroundImage ? item.imageData.backgroundImage : ""
            }
            item.moduleInfo = {
                fragmentPath: "/common/Hero/html/HeroLayouts.html", templateId: templateId, className: className
            };
            item.title = item.headline;
            item.article = JSON.parse(JSON.stringify(item))
        }
    }
    function createImageMetadata(data) {
        var backgroundImageData = {};
        if (data.thumbnail && data.thumbnail.url) {
            if (data.thumbnailLowRes && data.thumbnailLowRes.url) {
                backgroundImageData = {
                    lowResolutionUrl: data.thumbnailLowRes.url, highResolutionUrl: data.thumbnail.url
                }
            }
            else {
                backgroundImageData = data.thumbnail.url
            }
        }
        backgroundImageData.imageTag = "HeroImage";
        return backgroundImageData
    }
    function createHeroOptionsRetailMode() {
        var retailModeHeadline = PlatformJS.Services.resourceLoader.getString("RetailModeHeroHeadline");
        var retailModeAbstract = PlatformJS.Services.resourceLoader.getString("RetailModeHeroAbstract");
        var imageUrl = "ms-appdata:///Local/Cache/DemoModeCache/RetailModeHeroImage.png";
        var heroItemData = {
            headline: retailModeHeadline, abstract: retailModeAbstract, articleid: "0", contentid: "0", source: "", sourceImageUrl: "", publishTime: "", snippet: retailModeAbstract
        };
        createItemMetadataSingleStory(heroItemData);
        var heroOptions = {
            heroItems: [heroItemData], primaryHeroImageData: { backgroundImage: { url: imageUrl } }, layoutId: CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM, lastModified: null
        };
        return heroOptions
    }
    function createHeroOptionsFromMetadata(metadata, newsItems) {
        var k,
            options = null;
        if (PlatformJS.mainProcessManager.retailModeEnabled) {
            options = createHeroOptionsRetailMode();
            CommonJS.disableAllEdgies(true)
        }
        else if (metadata) {
            if (metadata.heroItems) {
                if (metadata.heroItems.length === 1) {
                    createItemMetadataSingleStory(metadata.heroItems[0]);
                    metadata.layoutId = CommonJS.Immersive.HERO_LAYOUT_ONE_ITEM
                }
                else {
                    createItemMetaDataMultiStory(metadata.heroItems, newsItems)
                }
            }
            options = metadata;
            if (options.primaryHeroImageData && options.primaryHeroImageData.backgroundImage) {
                options.primaryHeroImageData.backgroundImage.imageTag = "HeroImage"
            }
            options.onitemclick = function (evt) {
                if (evt && evt.item && evt.item.article) {
                    evt.item.article.telemetry = { k: k };
                    onItemClicked(evt.item.article)
                }
            }
        }
        k = NewsJS.Telemetry.BingDaily.recordHeroContent(options);
        return options
    }
    function onItemClicked(item) {
        var source = null;
        if (item) {
            NewsJS.Telemetry.BingDaily.recordHeroClick(item);
            var telemetry = item.telemetry || {};
            telemetry.entryPoint = Platform.Instrumentation.InstrumentationArticleEntryPoint.homePano;
            telemetry.source = Platform.Instrumentation.InstrumentationEditorialSourceId.heroImage;
            item.telemetry = telemetry;
            item.disablePaywall = true;
            NewsJS.Utilities.launchArticle(item)
        }
    }
    function _getFavIconErrorHandler() {
        return WinJS.Utilities.markSupportedForProcessing(function (img) {
            if (img && img.parentElement && img.parentElement.style) {
                img.parentElement.style.display = "none"
            }
        })
    }
    WinJS.Class.mix(NewsApp.Controls.HeroControl, WinJS.Utilities.createEventProperties(CommonJS.Immersive.ClusterControlRefreshedEvent), WinJS.UI.DOMEventMixin)
})();
(function () {
    "use strict";
    var MAX_COLUMN_COUNT = 3;
    function onItemClicked(evt) {
        var item = evt.item;
        if (item && item.destination) {
            var newsUri = NewsJS.Utilities.parseCMSUriString(item.destination);
            if (newsUri && newsUri.entitytype === "partnerPano" && newsUri.params && !newsUri.params["entrypoint"]) {
                newsUri = NewsJS.Utilities.parseCMSUriString(item.destination + "&entrypoint=" + Windows.Foundation.Uri.escapeComponent("bingdailycluster"))
            }
            if (newsUri && newsUri.uri) {
                Windows.System.Launcher.launchUriAsync(newsUri.uri)
            }
        }
    }
    WinJS.Namespace.define("NewsApp.Controls", {
        FeatureSourcesControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            options.clickHandler = this.itemClickHandler.bind(this);
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {
            itemClickHandler: function itemClickHandler(evt) {
                onItemClicked(evt)
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls", {
        TempClusterWrapper: WinJS.Class.derive(NewsApp.Controls.ControlBase, function (element, options, orchestrator) {
            NewsApp.Controls.ControlBase.call(this, element, options, orchestrator);
            CommonJS.TempCluster.setCompactPanorama();
            this.options = options
        }, {
            element: null, options: null, _removeTempCluster: WinJS.Utilities.markSupportedForProcessing(function () {
                if (this.options && this.options.panorama) {
                    this.options.panorama.remove(true)
                }
            }), createProviderInstance: function createProviderInstance() {
                var options = this.options,
                    config = options.providerConfiguration;
                return PlatformJS.Utilities.createObject(config.providerType, config, this.orchestrator)
            }, renderState: function renderState(response) {
                return this.renderFirstTime(response)
            }, renderFirstTime: function renderFirstTime(response) {
                var element = this.element;
                response.removeClusterHandler = this._removeTempCluster.bind(this);
                this.lastGoodModel = response;
                var control = this.control = new CommonJS.TempCluster(element, response);
                return control.render()
            }, renderNextTime: function renderNextTime(response) {
                return WinJS.Promise.wrap(null)
            }, onConnectionChanged: function onConnectionChanged(evt) {
                if (evt.connection) {
                    this.render()
                }
            }, onResumed: function onResumed(evt) {
                this.render()
            }, onRefreshed: function onRefreshed(evt) {
                this.render({ bypassCache: true })
            }, onError: function onError(error) {
                if (this.options.panorama) {
                    this.options.panorama.remove(false)
                }
            }, getGoodState: function getGoodState() {
                var goodState = this.lastGoodModel || this.options.goodState;
                if (goodState) {
                    return JSON.parse(JSON.stringify(goodState))
                }
                else {
                    return null
                }
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsApp.Controls", {
        UnknownControl: WinJS.Class.derive(NewsApp.Controls.CategoryControl, function (element, options) {
            NewsApp.Controls.CategoryControl.call(this, element, options)
        }, {
            onError: function onError(error) {
                NewsApp.Controls.CategoryControl.prototype.onError.call(this, error)
            }, errorRetry: function errorRetry(evt) {
                if (evt.detail) {
                    var uriString = PlatformJS.Services.appConfig.getDictionary("Release").getString("UpgradeUrl");
                    if (uriString && uriString.length > 0) {
                        var uri = new Windows.Foundation.Uri(uriString);
                        if (uri) {
                            NewsJS.Telemetry.BingDaily.recordUnknownClusterUpgradeButtonPress();
                            Windows.System.Launcher.launchUriAsync(uri)
                        }
                    }
                }
            }
        })
    })
})()