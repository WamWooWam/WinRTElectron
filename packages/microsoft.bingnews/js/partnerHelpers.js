/*  © Microsoft. All rights reserved. */
(function () {
    "use strict"
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners", {
        BaseAuth: WinJS.Class.derive(CommonJS.Partners.Auth.BaseAuth, function newsjs_baseauthctrl_ctor(options) {
            CommonJS.Partners.Auth.BaseAuth.call(this, options)
        }, {
            getRefreshInterval: function getRefreshInterval() {
                return CommonJS.Partners.Config.getConfig(this._partner, "EntitlementsRefreshInterval", 6 * 60 * 60) * 1000
            }
        }), BaseNativeAuthControl: WinJS.Class.derive(CommonJS.Partners.Auth.BaseNativeAuthControl, function newsjs_basenativeauthctrol_ctor(options) {
            this._partnerStringPrefix = "/" + this._partner.toLowerCase() + "/";
            CommonJS.Partners.Auth.BaseNativeAuthControl.call(this, options)
        }, {
            getString: function getString(stringId) {
                var string = PlatformJS.Services.resourceLoader.getString(this._partnerStringPrefix + stringId);
                if (!string) {
                    string = CommonJS.Partners.Auth.BaseNativeAuthControl.prototype.getString.call(this, stringId)
                }
                return string
            }
        }), BaseWebAuthControl: WinJS.Class.derive(CommonJS.Partners.Auth.BaseWebAuthControl, function newsjs_basewebauthctrl_ctor(options) {
            CommonJS.Partners.Auth.BaseWebAuthControl.call(this, options)
        }, {})
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners", {
        BaseProcessListener: WinJS.Class.define(function Partner_BaseProcessListener_ctor() {
            this._pageMapping = {};
            this._nextShareIsAppShare = false;
            this._postActivated = false;
            this._delayTopEdgy = PlatformJS.BootCache.instance.getEntry("ConfigDelayTopEdgyPopulation", function () {
                return PlatformJS.Services.configuration.getBool("DelayTopEdgyPopulation", true)
            })
        }, {
            _partner: null, _nextShareIsAppShare: false, _pageMapping: {}, _postActivated: false, populateEdgy: function populateEdgy() { }, startPostActivateWork: function startPostActivateWork() {
                if (!this._postActivated) {
                    this._postActivated = true;
                    if (NewsJS.Partners.Config.isPartnerApp) {
                        this._setupLiveTile()
                    }
                    if (NewsJS.Partners.Config.isPartnerApp || Platform.Utilities.Globalization.isFeatureEnabled("featuredChannel" + this._partner)) {
                        if (NewsJS.Partners.Config.isPartnerApp && this._delayTopEdgy) {
                            this.populateEdgy()
                        }
                    }
                }
            }, onSuspending: function onSuspending(event) {
                if (this._articleManager && this._articleManager.serializeAsync) {
                    this._articleManager.serializeAsync()
                }
            }, onResuming: function onResuming(event) { }, onCheckpoint: function onCheckpoint(event) {
                if (this._articleManager && this._articleManager.serializeAsync) {
                    this._articleManager.serializeAsync()
                }
            }, onActivated: function onActivated(event, isRecoveryMode) {
                var promise = WinJS.Promise.wrap(),
                    that = this;
                if (isRecoveryMode && this._articleManager && this._articleManager.resetAsync) {
                    promise = this._articleManager.resetAsync()
                }
                if (NewsJS.Partners.Config.isPartnerApp) {
                    return promise.then(function () {
                        return that._onActivatedStandalone(event, isRecoveryMode)
                    })
                }
                else {
                    return null
                }
            }, onWindowResize: function onWindowResize(event) { }, onShareRequest: function onShareRequest() { }, _setupLiveTile: function _setupLiveTile() {
                var urls = [];
                var market = Platform.Globalization.Marketization.getCurrentMarket();
                for (var i = 0; i < 5; i++) {
                    var polledUrl = CommonJS.Partners.Config.getConfig(this._partner, "liveTileUrls" + i, "");
                    polledUrl = polledUrl.replace("{market}", market);
                    if (polledUrl) {
                        try {
                            var url = new Windows.Foundation.Uri(polledUrl);
                            urls.push(url)
                        }
                        catch (e) { }
                    }
                }
                if (urls.length > 0) {
                    var notifications = Windows.UI.Notifications;
                    var periodicRecurrence = notifications.PeriodicUpdateRecurrence;
                    var recurrence = parseInt(CommonJS.Partners.Config.getConfig(this._partner, "LiveTileUpdateFrequency", notifications.PeriodicUpdateRecurrence.hour));
                    if (recurrence === periodicRecurrence.daily || recurrence === periodicRecurrence.halfHour || recurrence === periodicRecurrence.hour || recurrence === periodicRecurrence.sixHours || recurrence === periodicRecurrence.twelveHours) {
                        var updater = notifications.TileUpdateManager.createTileUpdaterForApplication();
                        updater.enableNotificationQueue(true);
                        updater.startPeriodicUpdateBatch(urls, recurrence)
                    }
                }
            }, _addSettingsPageFragment: function _addSettingsPageFragment(divId, fragment, dataContext) {
                var that = this;
                var aboutElement = document.getElementById(divId);
                if (!aboutElement) {
                    aboutElement = document.createElement("div");
                    aboutElement.id = divId;
                    document.body.appendChild(aboutElement)
                }
                return WinJS.UI.Fragments.renderCopy(fragment, aboutElement).then(function (doc) {
                    return WinJS.UI.processAll(aboutElement)
                }).then(function () {
                    return WinJS.Binding.processAll(aboutElement, dataContext)
                }).done(function () {
                    that._onSettingsPageCreate(PlatformJS.Utilities.getControl(divId + "Ctrl"), divId)
                })
            }, _onSettingsPageCreate: function _onSettingsPageCreate(flyout, flyoutId) {
                var that = this;
                if (flyout) {
                    flyout.onafterhide = function () {
                        that._removeSettingsPage(flyoutId);
                        flyout.onafterhide = null
                    };
                    flyout.show()
                }
            }, _removeSettingsPage: function _removeSettingsPage(pageId) {
                var page = document.getElementById(pageId);
                if (page) {
                    document.body.removeChild(page)
                }
            }, _shareApp: function _shareApp(request) {
                var appName = PlatformJS.Services.resourceLoader.getString("appName");
                var publisherName = PlatformJS.Services.resourceLoader.getString("publisherName");
                request.data.setText(appName);
                var storeUrl = "ms-windows-store:PDP?PFN=" + Windows.ApplicationModel.Package.current.id.familyName;
                var url = CommonJS.Partners.Config.getConfig(this._partner, "StoreURL", storeUrl);
                var desc = PlatformJS.Services.resourceLoader.getString("/partners/ShareppAppDesc").format(appName, publisherName);
                var htmlText = "<a href='{0}'>{1}</a>".format(url, PlatformJS.Services.resourceLoader.getString("/partners/DownloadApp")) + " " + desc;
                var uri = new Windows.Foundation.Uri(url);
                request.data.setHtmlFormat(Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlText));
                request.data.setUri(uri);
                request.data.properties.title = appName;
                request.data.properties.description = desc;
                this.onShareRequest()
            }, _setupEventHandling: function _setupEventHandling() {
                var that = this;
                var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
                try {
                    dataTransferManager.addEventListener("datarequested", function (e) {
                        var request = e.request;
                        var page = WinJS.Navigation.history.current.location.page;
                        var currentIPage = PlatformJS.Navigation.currentIPage;
                        var errorStringResourceId = "/partners/ShareInstr";
                        if (that._nextShareIsAppShare) {
                            that._shareApp(request);
                            that._nextShareIsAppShare = false
                        }
                        else if (currentIPage && currentIPage.handleShareRequest) {
                            if (!currentIPage.canShareRequest || currentIPage.canShareRequest()) {
                                currentIPage.handleShareRequest(request)
                            }
                        }
                        else {
                            that._shareApp(request)
                        }
                    })
                }
                catch (e) { }
                var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
                settingsPane.oncommandsrequested = function (e) {
                    var appSettings = Windows.UI.ApplicationSettings;
                    var vector = e.request.applicationCommands;
                    var onAboutCmd = function (ev) {
                        that._addSettingsPageFragment("AboutPageDiv", "/html/aboutSettings.html", that.getAboutPageData())
                    };
                    var onSettingsCmd = function () {
                        that._addSettingsPageFragment("SettingsPageDiv", "/html/settingSettings.html", that.getSettingsPageData())
                    };
                    var onFeedbackCmd = function () {
                        that._addSettingsPageFragment("FeedbackPageDiv", "/html/feedbackSettings.html", that.getFeedbackPageData())
                    };
                    if (PlatformJS.Services.configuration.getBool("OptionsEnabled", true)) {
                        var settingsCmd = new appSettings.SettingsCommand("SettingsPage", CommonJS.resourceLoader.getString("/platform/optionsTitle"), onSettingsCmd);
                        vector.append(settingsCmd)
                    }
                    var aboutCmd = new appSettings.SettingsCommand("AboutPage", PlatformJS.Services.resourceLoader.getString("/platform/aboutLabel"), onAboutCmd);
                    vector.append(aboutCmd);
                    var feedbackCmd = new appSettings.SettingsCommand("FeedbackPage", CommonJS.resourceLoader.getString("/partners/Support"), onFeedbackCmd);
                    vector.append(feedbackCmd);
                    var touCmd = new appSettings.SettingsCommand("touPage", CommonJS.resourceLoader.getString("/platform/lca_serviceAgreement"), CommonJS.Settings.onTOUCmd);
                    vector.append(touCmd);
                    var privacyCmd = new appSettings.SettingsCommand("privacyPage", CommonJS.resourceLoader.getString("/platform/lca_privacy"), CommonJS.Settings.onPrivacyCmd);
                    vector.append(privacyCmd);
                    var shareCmd = new appSettings.SettingsCommand("shareApp", PlatformJS.Services.resourceLoader.getString("/partners/shareApp").format(PlatformJS.Services.resourceLoader.getString("appName")), function () {
                        that._nextShareIsAppShare = true;
                        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
                    });
                    vector.append(shareCmd);
                    if (PlatformJS.isDebug) {
                        var debugCmd = new appSettings.SettingsCommand("debugPage", "Debug", function () {
                            that._addSettingsPageFragment("DebugPageDiv", "/html/debugSettings.html", { output: CommonJS.Partners.Debug.instance.output })
                        });
                        vector.append(debugCmd)
                    }
                }
            }, _onActivatedStandalone: function _onActivatedStandalone(event, isRecoveryMode) {
                var that = this;
                var edgyPromise = null;
                if (!this._delayTopEdgy) {
                    edgyPromise = this.populateEdgy()
                }
                var navigation = null;
                if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
                    try {
                        if (event && event.detail && event.detail.arguments) {
                            var tileData = JSON.parse(event.detail.arguments);
                            navigation = this.getPinTileMapping(tileData)
                        }
                    }
                    catch (exception) { }
                }
                else if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                    navigation = this.handleProtocolLaunch(event)
                }
                if (!that._hasInitialized) {
                    this._setupEventHandling();
                    that._hasInitialized = true
                }
                if (navigation) {
                    return navigation
                }
                else if (edgyPromise) {
                    return edgyPromise.then(function () {
                        return null
                    }, function () {
                        return null
                    })
                }
                else {
                    return null
                }
            }, handleProtocolLaunch: function handleProtocolLaunch(event) {
                return null
            }, getPinTileMapping: function getPinTileMapping(tileData) {
                var navigation = null;
                if (typeof (tileData) !== "undefined" && typeof (tileData.target) !== "undefined" && typeof (tileData.data) !== "undefined") {
                    var fragment = this._pageMapping[tileData.target];
                    if (fragment) {
                        navigation = WinJS.Promise.wrap({
                            pageInfo: {
                                fragment: fragment, page: tileData.target, channelId: tileData.data.channelID
                            }, state: tileData.data
                        })
                    }
                }
                return navigation
            }, getAboutPageData: function getAboutPageData() {
                var version = Windows.ApplicationModel.Package.current.id.version;
                var aboutLabelText = PlatformJS.Services.resourceLoader.getString("/platform/aboutLabel");
                var appName = PlatformJS.Services.resourceLoader.getString("appName");
                var publisherName = PlatformJS.Services.resourceLoader.getString("publisherName");
                var buildVersion = version.major + "." + version.minor + "." + version.build + "." + version.revision;
                var optionsBackbuttonclick = WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show);
                var dataContext = {
                    versionText: PlatformJS.Services.resourceLoader.getString("/platform/appVersion").format(buildVersion), aboutLabelText: aboutLabelText, appName: appName, publisherName: publisherName, optionsBackbuttonclick: optionsBackbuttonclick
                };
                return dataContext
            }, getFeedbackPageData: function getFeedbackPageData() {
                var emailLabel = PlatformJS.Services.resourceLoader.getString("/partners/emailLabel"),
                    phoneLabel = PlatformJS.Services.resourceLoader.getString("/partners/phoneLabel"),
                    email = CommonJS.Partners.Config.getConfig(this._partner, "Email"),
                    phone = CommonJS.Partners.Config.getConfig(this._partner, "Phone"),
                    feedbackLabelText = PlatformJS.Services.resourceLoader.getString("/partners/Support"),
                    dataContext = {
                        feedbackLabelText: feedbackLabelText, emailLabel: emailLabel, mailToLink: "mailto:" + email, email: email, phoneLabel: phoneLabel, phone: phone
                    };
                return dataContext
            }
        }, {
            saveChannelData: function saveChannelData() {
                PlatformJS.Navigation.mainNavigator.channelManager.setChannelConfigData()
            }, getChannelConfigData: function getChannelConfigData(channelID) {
                var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                var channelConfigData = null,
                    j = 0;
                var channelSet = NewsJS.Partners.Config.isPartnerApp ? channelManager.standardChannels : channelManager.featuredChannels;
                for (j = 0; j < channelSet.length; j++) {
                    if (channelSet[j].id === channelID) {
                        channelConfigData = channelSet[j];
                        break
                    }
                }
                return channelConfigData
            }, getChannelArray: function getChannelArray(partner) {
                var channelManager = PlatformJS.Navigation.mainNavigator.channelManager;
                var channelArray = null,
                    j = 0;
                if (NewsJS.Partners.Config.isPartnerApp) {
                    channelArray = channelManager.standardChannels
                }
                else {
                    var allFeaturedChannels = channelManager.featuredChannels;
                    for (j = 0; j < allFeaturedChannels.length; j++) {
                        if (allFeaturedChannels[j].id === partner) {
                            channelArray = allFeaturedChannels[j].subChannels;
                            break
                        }
                    }
                }
                return channelArray
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners.Config", {
        _availableMarkets: null, isInAvailableMarket: {
            get: function get() {
                if (NewsJS.Partners.Config._availableMarkets === null) {
                    NewsJS.Partners.Config._availableMarkets = PlatformJS.Services.configuration.getString("AvailableMarkets").toLowerCase()
                }
                var market = Platform.Utilities.Globalization.getMarketString().toLowerCase();
                return NewsJS.Partners.Config._availableMarkets === "all" || NewsJS.Partners.Config._availableMarkets.indexOf(market) >= 0
            }
        }, _isPartnerApp: null, isPartnerApp: {
            get: function get() {
                if (NewsJS.Partners.Config._isPartnerApp === null) {
                    var packageName = Windows.ApplicationModel.Package.current.id.name;
                    NewsJS.Partners.Config._isPartnerApp = packageName.indexOf("Microsoft.") === -1
                }
                return NewsJS.Partners.Config._isPartnerApp
            }
        }, isPartnerPage: function isPartnerPage(partner) {
            return NewsJS.Partners.Theme.currentPartner === partner
        }, _sectionImages: {}, getSectionImage: function getSectionImage(partner, sectionName) {
            var defaultLookUp = "default";
            var lookUpValue = sectionName ? sectionName.toLowerCase() : defaultLookUp;
            var dictionary = this._sectionImages[partner];
            if (!dictionary) {
                this._sectionImages[partner] = dictionary = CommonJS.Partners.Config.getConfig(partner, "SectionImages", {})
            }
            var image = dictionary.getString(lookUpValue);
            if (!image) {
                image = dictionary.getString(defaultLookUp)
            }
            return image
        }, _sectionNameMapping: {}, getSectionName: function getSectionName(partner, categoryKey) {
            var dictionary = this._sectionNameMapping[partner];
            if (!dictionary) {
                this._sectionNameMapping[partner] = dictionary = CommonJS.Partners.Config.getConfig(partner, "CategoryToSectionMapping", {})
            }
            var sectionName = dictionary.getString(categoryKey);
            return sectionName || categoryKey
        }
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners", {
        NewsClusterProvider: WinJS.Class.define(function (categoryInfo, title, maxArticles, onsuccess, onerror, bypassCache) {
            this.categoryInfo = categoryInfo;
            this.sectionName = this.categoryInfo.sectionName;
            this.articles = null;
            this.maxArticles = maxArticles;
            this.title = title;
            this.onsuccess = onsuccess;
            this.onerror = onerror;
            this.bypassCache = bypassCache;
            this._innerPromise = null
        }, {
            _articleManager: null, categoryInfo: null, bypassCache: null, articles: null, maxArticles: null, title: null, dispose: function dispose() {
                this.categoryInfo = null;
                this.articles = null;
                this.onsuccess = null;
                this.onerror = null;
                if (this._innerPromise) {
                    this._innerPromise.cancel();
                    this._innerPromise = null
                }
            }, initializeAsync: function initializeAsync() {
                return WinJS.Promise.wrap({})
            }, selectTemplateClass: function selectTemplateClass(index, item) {
                return item.newsClusterItem
            }, getFeedIdentifierValue: function getFeedIdentifierValue() {
                return this.categoryInfo[this.categoryInfo.feedType + "Name"]
            }, _innerPromise: null, processFeed: function processFeed(feed) {
                var that = this;
                if (that.onsuccess) {
                    that.onsuccess()
                }
                that.articles = [];
                that.categoryInfo = feed.categoryInfo;
                var fullfeed = feed.fullfeed;
                var max = that.maxArticles !== undefined && that.maxArticles !== null ? Math.min(that.maxArticles, fullfeed.length) : fullfeed.length;
                for (var i = 0; i < max; i++) {
                    that.articles.push(that.selectTemplateClass(i, fullfeed[i]))
                }
                var dataResults = {
                    native: true, newsItems: that.articles, isCachedResponse: feed.isCachedResponse
                };
                if (that.layoutCacheInfo) {
                    dataResults.clusterID = that.title + "_" + that.isPrimaryCluster;
                    dataResults.dataCacheID = that.layoutCacheInfo.cacheKey;
                    dataResults.cacheID = that.layoutCacheInfo.cacheID;
                    dataResults.uniqueResponseID = that.layoutCacheInfo.uniqueResponseID
                }
                return dataResults
            }, handleProgress: function handleProgress(feed) {
                if (this.progressHandler) {
                    this.progressHandler(this.processFeed(feed))
                }
            }, queryAsync: function queryAsync() {
                if (!this.categoryInfo) {
                    return WinJS.Promise.wrapError("NotFound")
                }
                var that = this;
                return new WinJS.Promise(function (completeHandler, errorHandler, progressHandler) {
                    that.progressHandler = progressHandler;
                    that._innerPromise = that._articleManager.getFullFeedAsync(that.categoryInfo.feedType, that.getFeedIdentifierValue(), that._categoryInfo, that.bypassCache, that).then(function (feed) {
                        return WinJS.Promise.wrap(that.processFeed(feed))
                    }, function (error) {
                        if (that.onerror) {
                            that.onerror()
                        }
                        return WinJS.Promise.wrapError(error)
                    });
                    that._innerPromise.then(function (completeData) {
                        completeHandler(completeData)
                    }, function (errorData) {
                        errorHandler(errorData)
                    })
                }, function () {
                    that._innerPromise.cancel();
                    that._innerPromise = null
                })
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners", {
        SlideShowPage: WinJS.Class.derive(NewsJS.SlideShowPage, function partner_slideshowpage_ctor(state) {
            NewsJS.SlideShowPage.call(this, state);
            this.access = state.access;
            var that = this;
            this._dataChangeHandler = function (event) {
                that.checkPermissionForCurrentArticle()
            };
            this.authManager = CommonJS.Partners.Auth.BaseAuth.authenticators[this.partner];
            Windows.Storage.ApplicationData.current.addEventListener("datachanged", this._dataChangeHandler)
        }, {
            dispose: function dispose() {
                NewsJS.SlideShowPage.prototype.dispose.call(this);
                Windows.Storage.ApplicationData.current.removeEventListener("datachanged", this._dataChangeHandler)
            }, goBack: function goBack() {
                if (WinJS.Navigation.canGoBack) {
                    WinJS.Navigation.back()
                }
                else {
                    PlatformJS.Navigation.mainNavigator.resetApp(new Error("SlideShowPage cant go back"))
                }
            }, checkPermissionForCurrentArticle: function checkPermissionForCurrentArticle() {
                var that = this;
                if (this.access === "subscribed") {
                    this.authManager.getEntitlementsAsync(true, false, true).then(function (isEntitled) {
                        if (!isEntitled) {
                            that.goBack()
                        }
                    }, function () {
                        that.goBack()
                    })
                }
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners.Theme", {
        onNavigated: function onNavigated(state) {
            if (NewsJS.Partners.Config.isPartnerApp && !NewsJS.Partners.Theme.navigated && !(state && state.dynamicInfo)) {
                if (PlatformJS.Services.configuration.getBool("PopulateL1EdgyOnFirstNavigate", false)) {
                    NewsJS.Partners.WhiteLabelProcessListener.populateL1Edgy()
                }
            }
            NewsJS.Partners.Theme.navigated = true;
            var theme = state && state.theme ? state.theme : NewsJS.Partners.Theme.defaultTheme;
            CommonJS.setTheme(theme);
            if (theme) {
                NewsJS.Partners.Theme.currentPartner = theme.split(" ")[0]
            }
            NewsJS.Telemetry.Utilities.closePartnerSession()
        }, onNavigateAway: function onNavigateAway() {
            CommonJS.setTheme(NewsJS.Partners.Theme.defaultTheme);
            NewsJS.Partners.Theme.currentPartner = null;
            NewsJS.Utilities.cancelPromise(NewsJS.Partners.Theme.edgyL1Promise)
        }, navigated: false, currentPartner: null, defaultTheme: "bing", edgyL1Promise: null
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Partners", {
        WhiteLabelProcessListener: WinJS.Class.derive(NewsJS.Partners.BaseProcessListener, function () {
            this._partner = "WhiteLabel";
            NewsJS.Partners.BaseProcessListener.call(this)
        }, {
            populateEdgy: function populateEdgy() {
                if (!NewsJS.Partners.WhiteLabelProcessListener.edgyPopulated) {
                    NewsJS.Partners.WhiteLabelProcessListener.enableTopEdgy(true);
                    return NewsJS.Partners.WhiteLabelProcessListener.populateEdgy()
                }
                else {
                    return WinJS.Promise.wrap()
                }
            }, getPinTileMapping: function getPinTileMapping(tileData) {
                switch (tileData.target) {
                    case "DynamicPano.DynamicCategoryPano":
                    case "DynamicPano.DynamicPanoPage":
                        NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("Partner Panorama");
                        var dynamicInfo = tileData.data;
                        dynamicInfo.entrypoint = "secondarytile";
                        return WinJS.Promise.wrap({
                            state: { dynamicInfo: dynamicInfo }, pageInfo: {
                                channelId: dynamicInfo.id, fragment: "/dynamicPano/dynamicPano.html", page: tileData.target
                            }
                        });
                    default:
                        return null
                }
            }, handleProtocolLaunch: function handleProtocolLaunch(event) {
                var arg = event.detail.uri;
                var result = NewsJS.Utilities.parseUri(arg);
                if (result) {
                    var urlParams = result.params;
                    if (urlParams && result.path === "application/view") {
                        return PlatformJS.Navigation.createCommandFromUri(result.uri.rawUri)
                    }
                }
                return null
            }
        }, {
            populateEdgyPromise: null, state: null, populateEdgy: function populateEdgy() {
                var market = NewsJS.Globalization.getMarketStringForEditorial();
                if (!market || !NewsJS.Partners.Config.isInAvailableMarket) {
                    NewsJS.Partners.WhiteLabelProcessListener.populateEdgyPromise = WinJS.Promise.wrapError("InvalidMarket")
                }
                else {
                    NewsJS.Partners.WhiteLabelProcessListener.populateEdgyPromise = NewsJS.Utilities.fetchFeaturedSourcesData(market).then(function (sources) {
                        var appSourceId = PlatformJS.Services.appConfig.getDictionary("PartnerAppInfo").getString("PartnerSourceId");
                        var source = sources[appSourceId];
                        if (source) {
                            var state = NewsJS.Partners.WhiteLabelProcessListener.state = NewsJS.Utilities.buildStateForPartnerSource(source);
                            state.dynamicInfo.isPartnerApp = true;
                            var home = NewsJS.Partners.WhiteLabelProcessListener._createHomeChannel(state);
                            state.dynamicInfo.clusterTitle = home.title;
                            var channelArray = NewsJS.Partners.BaseProcessListener.getChannelArray();
                            channelArray.splice(0, channelArray.length);
                            channelArray.push(home);
                            NewsJS.Partners.BaseProcessListener.saveChannelData();
                            return WinJS.Promise.wrap(home.state)
                        }
                        else {
                            return WinJS.Promise.wrapError("FeatureSourcesDataFailure")
                        }
                    })
                }
                return NewsJS.Partners.WhiteLabelProcessListener.populateEdgyPromise
            }, populateL1Edgy: function populateL1Edgy() {
                var promise = NewsJS.Partners.WhiteLabelProcessListener.populateEdgyPromise;
                if (promise) {
                    promise.then(function () {
                        var partnerState = NewsJS.Partners.WhiteLabelProcessListener.state;
                        if (partnerState && partnerState.dynamicInfo) {
                            var options = {
                                dataSourceName: partnerState.dynamicInfo.dataSourceName, feedName: partnerState.dynamicInfo.feedName, dataProviderOptions: partnerState.dynamicInfo.dataProviderOptions, cssFeedUrl: partnerState.dynamicInfo.css, channelId: partnerState.channelId
                            };
                            var dataProvider = new DynamicPanoJS.DynamicPanoProvider(options);
                            NewsJS.Partners.Theme.edgyL1Promise = dataProvider.fetchCacheData().then(function (complete) {
                                NewsJS.Partners.Theme.edgyL1Promise = null;
                                if (complete && complete.cmsData) {
                                    var categoryOrder = complete.cmsData.categoryOrder;
                                    var categoryList = [];
                                    var changed = false;
                                    if (categoryOrder && categoryOrder.length > 1) {
                                        var channelArray = NewsJS.Partners.BaseProcessListener.getChannelArray();
                                        if (channelArray) {
                                            if (channelArray.length > 1) {
                                                channelArray.splice(1, channelArray.length - 1)
                                            }
                                            var channelConfigData = NewsJS.Partners.BaseProcessListener.getChannelConfigData("Home");
                                            if (channelConfigData) {
                                                changed = true;
                                                for (var idx = 0; idx < categoryOrder.length; idx++) {
                                                    var item = {
                                                        clusterKey: categoryOrder[idx], clusterTitle: complete.cmsData.categories[categoryOrder[idx]].categoryName
                                                    };
                                                    if (item && item.clusterTitle && item.clusterKey) {
                                                        var title = item.clusterTitle;
                                                        var key = item.clusterKey;
                                                        var id = channelConfigData.id + "_" + title;
                                                        var state = JSON.parse(JSON.stringify(channelConfigData.state));
                                                        state.dynamicInfo.clusterID = key;
                                                        state.dynamicInfo.clusterToRender = key;
                                                        var newChannel = {
                                                            id: id, title: title, icon: "", subChannels: [], pageInfo: {
                                                                fragment: channelConfigData.pageInfo.fragment, page: channelConfigData.pageInfo.page, channelId: id
                                                            }, state: state, isDisplayValue: true
                                                        };
                                                        channelArray.push(newChannel)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (changed) {
                                        NewsJS.Partners.WhiteLabelProcessListener.edgyPopulated = true;
                                        NewsJS.Partners.BaseProcessListener.saveChannelData();
                                        NewsJS.Partners.WhiteLabelProcessListener.enableTopEdgy(false)
                                    }
                                }
                            }, function (error) {
                                NewsJS.Partners.Theme.edgyL1Promise = null
                            })
                        }
                    }, function () { })
                }
            }, edgyPopulated: false, enableTopEdgy: function enableTopEdgy(value) {
                var platformNavigationBar = PlatformJS.Utilities.getControl("platformNavigationBar");
                if (platformNavigationBar) {
                    platformNavigationBar.disabled = value
                }
            }, _createHomeChannel: function _createHomeChannel(state) {
                NewsJS.Partners.WhiteLabelProcessListener.defaultAppState = state;
                return {
                    icon: "", id: "Home", pageInfo: {
                        channelId: "Home", fragment: "/dynamicPano/dynamicPano.html", page: "DynamicPano.DynamicPanoPage"
                    }, state: state, subChannels: [], title: PlatformJS.Services.resourceLoader.getString("/partners/Home"), visible: true, isDisplayValue: true
                }
            }
        })
    })
})()