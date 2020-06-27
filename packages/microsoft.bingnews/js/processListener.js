/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    var onSettingsCmd = function () {
        var onOptionsBeforeShow = function (eventInfo) {
            CommonJS.processListener.disableSearchOnType()
        };
        var onOptionsAfterHide = function (eventInfo) {
            CommonJS.processListener.enableSearchOnType()
        };
        var page = PlatformJS.Utilities.getControl("settingsPage");
        if (page) {
            page.show()
        }
        else {
            var container = null;
            WinJS.UI.Fragments.renderCopy("/html/settingSettings.html", document.body).then(function (doc) {
                container = document.getElementById("settingsPage");
                var title = PlatformJS.Services.resourceLoader.getString("/platform/optionsTitle");
                var offlineSync = PlatformJS.Services.resourceLoader.getString("OfflineSync");
                var offlineSyncCloudEnable = NewsJS.Utilities.isPrefetchCloudEnabled;
                var optionsBackbuttonclick = WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show);
                var dataContext = {
                    pageTitle: title, offlineSync: offlineSync, offlineSyncCloudEnable: offlineSyncCloudEnable, optionsBackbuttonclick: optionsBackbuttonclick
                };
                return WinJS.Binding.processAll(container, dataContext)
            }).then(function () {
                return WinJS.UI.processAll(container)
            }).done(function () {
                page = container.winControl;
                page.addEventListener("beforeshow", onOptionsBeforeShow);
                page.addEventListener("afterhide", onOptionsAfterHide);
                page.show()
            })
        }
    };
    WinJS.Namespace.define("NewsJS", {
        ProcessListener: WinJS.Class.define(function () {
            var searchController = {
                default: function (args) {
                    var q = args["q"];
                    if (q) {
                        q = decodeURIComponent(q.replace(/\+/g, "%20"));
                        var targetState = {
                            queryText: q, searchOrigin: NewsJS.Telemetry.Search.Origin.externalSearchCharm
                        };
                        return WinJS.Promise.wrap({
                            state: targetState, pageInfo: {
                                channelId: null, fragment: "/html/search.html", page: "NewsJS.Search"
                            }
                        })
                    }
                }
            };
            PlatformJS.Utilities.addAppexUriScheme("bingnews");
            PlatformJS.Navigation.addDefaultController();
            PlatformJS.Navigation.addController("search", searchController);
            PlatformJS.Navigation.addCommonEntityViews();
            NewsJS.Utilities.addNewsEntityViews();
            WinJS.Navigation.addEventListener("navigated", function () {
                if (NewsJS.StateHandler && NewsJS.StateHandler.instance) {
                    NewsJS.StateHandler.instance.allSources = null
                }
            })
        }, {
            _hasInitialized: false, _searchPaneVisible: false, onSuspending: function onSuspending(event) {
                if (NewsJS.BingDaily && NewsJS.BingDaily._useOldPrefetchManager) {
                    if (NewsJS && NewsJS.PrefetchManager) {
                        NewsJS.PrefetchManager.onAppSuspending()
                    }
                }
                if (event && event.suspendingOperation && event.suspendingOperation.getDeferral) {
                    var suspendingDeferral = event.suspendingOperation.getDeferral();
                    if (suspendingDeferral && suspendingDeferral.complete) {
                        var completeDeferral = function deferralHelper() {
                            suspendingDeferral.complete()
                        };
                        NewsJS.StateHandler.instance.save().then(completeDeferral, completeDeferral)
                    }
                }
            }, onUpdatedConfig: function onUpdatedConfig(event) {
                NewsJS.Globalization.reload();
                NewsJS.Data.Bing.reload();
                NewsJS.TopEdgy.instance.reload();
                return true
            }, onResuming: function onResuming(event) {
                if (PlatformJS.isPlatformInitialized) {
                    NewsJS.StateHandler.instance.syncWithPdp()
                }
                if (NewsJS.BingDaily._useOldPrefetchManager) {
                    if (NewsJS && NewsJS.PrefetchManager) {
                        NewsJS.PrefetchManager.onPanoResuming()
                    }
                }
            }, onActivated: function onActivated(event, isRecoveryMode) {
                msWriteProfilerMark("NewsApp:onActivated:s");
                var that = this;
                var promise = null;
                if (isRecoveryMode) {
                    promise = that.handleRecoveryMode()
                }
                else {
                    promise = WinJS.Promise.wrap(null)
                }
                return promise.then(function PostStateLoad() {
                    var navigation = null;
                    if (PlatformJS.Services.appConfig && PlatformJS.Services.appConfig.getDictionary("FRECustomization").getBool("FRECustomizeHomeEnabled")) {
                        if (NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection() && !NewsJS.StateHandler.instance.isUserAlreadyWentThroughFRE) {
                            var state = {};
                            state.currentmarket = Platform.Globalization.Marketization.getCurrentMarket();
                            state.firstLoad = true;
                            navigation = WinJS.Promise.wrap({
                                state: state, pageInfo: {
                                    channelId: "FRECustomizeHome", fragment: "/pages/FRECustomizeHome/FRECustomizeHome.html", page: "NewsJS.FRECustomizeHome"
                                }
                            })
                        }
                    }
                    if (navigation === null) {
                        if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
                            if (PlatformJS.mainProcessManager.searchTileArguments) {
                                navigation = PlatformJS.Navigation.createCommandFromSearchTile(PlatformJS.mainProcessManager.searchTileArguments);
                                if (navigation) {
                                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.searchCharm)
                                }
                            }
                            else if (event && event.detail && event.detail.arguments) {
                                var tileData;
                                try {
                                    tileData = JSON.parse(event.detail.arguments)
                                }
                                catch (exception) {
                                    var potentialUri = event.detail.arguments;
                                    if (potentialUri && potentialUri.indexOf("://") > 0) {
                                        var uri = NewsJS.Utilities.parseUriString(potentialUri);
                                        navigation = NewsJS.Utilities.processProtocolLaunch(uri)
                                    }
                                }
                                if (typeof (tileData) !== "undefined" && typeof (tileData.target) !== "undefined" && typeof (tileData.data) !== "undefined") {
                                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.pinnedTile);
                                    switch (tileData.target) {
                                        case "NewsJS.SourcePage":
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("Source");
                                            navigation = WinJS.Promise.wrap({
                                                state: { entity: tileData.data }, pageInfo: {
                                                    channelId: "SourcePage", fragment: "/pages/SourcesPage/SourcesPage.html", page: tileData.target
                                                }
                                            });
                                            break;
                                        case "NewsJS.RSSSourcePage":
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("RSS Source");
                                            navigation = WinJS.Promise.wrap({
                                                state: { entity: tileData.data }, pageInfo: {
                                                    channelId: "RSSSourcePage", fragment: "/html/rssSourcePage.html", page: tileData.target
                                                }
                                            });
                                            break;
                                        case "NewsJS.Search":
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("Search Result");
                                            tileData.data.searchOrigin = NewsJS.Telemetry.Search.Origin.pin;
                                            navigation = WinJS.Promise.wrap({
                                                state: tileData.data, pageInfo: {
                                                    channelId: tileData.data.channelId, fragment: "/html/search.html", page: tileData.target
                                                }
                                            });
                                            break;
                                        case "NewsJS.CategoryPage":
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("Category");
                                            navigation = WinJS.Promise.wrap({
                                                state: {
                                                    category: tileData.data.category, categoryKey: tileData.data.categoryKey, categoryName: tileData.data.categoryName, market: tileData.data.market
                                                }, pageInfo: {
                                                    channelId: tileData.data.channelId, fragment: "/html/categoryPage.html", page: tileData.target
                                                }
                                            });
                                            break;
                                        case "NewsJS.BingDaily":
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("BingDaily");
                                            navigation = WinJS.Promise.wrap({
                                                state: {
                                                    title: tileData.data.title, market: tileData.data.market
                                                }, pageInfo: {
                                                    channelId: "HomePage", fragment: "/bingDaily/BingDaily.html", page: "NewsJS.BingDaily"
                                                }
                                            });
                                            break;
                                        case "NYTJS.CategoryPano":
                                        case "WSJJS.CategoryPano":
                                            var source;
                                            if (tileData.target === "NYTJS.CategoryPano") {
                                                source = "newssource_more_nytimes_com"
                                            }
                                            else if (tileData.target === "WSJJS.CategoryPano") {
                                                source = "newssource_more_online_wsj_com"
                                            }
                                            var uri = NewsJS.Utilities.parseUriString("//application/view?entitytype=partnerPano&sourceid=" + source, "bingnews", Platform.Globalization.Marketization.getCurrentMarket());
                                            navigation = NewsJS.Utilities.processProtocolLaunch(uri);
                                            break;
                                        case "DynamicPano.DynamicCategoryPano":
                                            CommonJS.Partners.Config.registerPostReadingConfig("ExtraSubChannels", NewsJS.Partners.Config.processExtraSubChannels);
                                            CommonJS.Utils.DateTimeFormatting.registerDateTimeFormatter("The New York Times", NYTJS.Formatter.instance.formatDateTime);
                                            NewsJS.Telemetry.Utilities.recordPinnedTileLaunch("Partner Panorama");
                                            var dynamicInfo = tileData.data;
                                            dynamicInfo.entrypoint = "secondarytile";
                                            navigation = WinJS.Promise.wrap({
                                                state: { dynamicInfo: dynamicInfo }, pageInfo: {
                                                    channelId: dynamicInfo.id, fragment: "/dynamicPano/dynamicPano.html", page: "DynamicPano.DynamicPanoPage"
                                                }
                                            });
                                            break;
                                        default:
                                            for (var i = 1; i < PlatformJS.mainProcessManager._processListeners.length; i++) {
                                                var otherProcessListener = PlatformJS.mainProcessManager._processListeners[i];
                                                if (otherProcessListener.getPinTileMapping) {
                                                    navigation = otherProcessListener.getPinTileMapping(tileData);
                                                    if (navigation) {
                                                        break
                                                    }
                                                }
                                            }
                                            break
                                    }
                                }
                            }
                        }
                        else if (event.detail.kind === Windows.ApplicationModel.Activation.ActivationKind.protocol) {
                            var arg = event.detail.uri;
                            var result = NewsJS.Utilities.parseUri(arg);
                            CommonJS.Partners.Config.registerPostReadingConfig("ExtraSubChannels", NewsJS.Partners.Config.processExtraSubChannels);
                            CommonJS.Utils.DateTimeFormatting.registerDateTimeFormatter("The New York Times", NYTJS.Formatter.instance.formatDateTime);
                            if (result && result.params && result.params["disablegettingstarted"] === "true") {
                                NewsApp.PersonalizationManager.removeClusterDefinition("TempCluster")
                            }
                            navigation = NewsJS.Utilities.processProtocolLaunch(result)
                        }
                    }
                    var isRowTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROWTopEdgyFeatureEnabled", function () {
                        return Platform.Utilities.Globalization.isFeatureEnabled("ROWTopEdgy")
                    });
                    var isRowEnwwTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROW_ENWW_TopEdgyFeatureEnabled", function () {
                        return Platform.Utilities.Globalization.isFeatureEnabled("ROW_ENWW_TopEdgy")
                    });
                    var waitPromise = WinJS.Promise.wrap(null);
                    if (isRowTopEdgyEnabled || isRowEnwwTopEdgyEnabled) {
                        PlatformJS.startPlatformInitialization();
                        waitPromise = PlatformJS.platformInitializedPromise;
                        PlatformJS.platformInitializedPromise.then(function () {
                            NewsJS.Globalization.countryCheck()
                        })
                    }
                    return waitPromise.then(function () {
                        msWriteProfilerMark("NewsApp:onActivated:e");
                        return navigation
                    })
                })
            }, onPlatformInitialized: function onPlatformInitialized(event) {
                NewsApp.PageEvents.dispatch("clrInitialized");
                try {
                    var transformer = new News.NewsTransformerWrapper(PlatformJS.Services.appConfig.getDictionary("BDIConfig").getString("CurrentVersion"), false);
                    transformer.primeParser()
                }
                catch (err) { }
            }, showSettings: function showSettings() {
                onSettingsCmd()
            }, _readSources: function _readSources() {
                NewsJS.Utilities.readSources()
            }, afterFirstView: function afterFirstView() {
                NewsJS.StateHandler.instance.Init();
                var setupEventHandling = function () {
                    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
                    dataTransferManager.addEventListener("datarequested", function (e) {
                        var request = e.request;
                        var page = WinJS.Navigation.history.current.location.page;
                        var currentIPage = PlatformJS.Navigation.currentIPage;
                        var errorStringResourceId = page === "NewsJS.NewsArticleReaderPage" ? "CantShare" : "ShareInstr";
                        var videoPlayer = CommonJS.MediaApp.Controls.MediaPlayback.instance;
                        if (videoPlayer && videoPlayer.isPlaying && videoPlayer.handleShareRequest) {
                            videoPlayer.handleShareRequest(request)
                        }
                        else if (currentIPage && currentIPage.handleShareRequest) {
                            if (!currentIPage.canShareRequest || currentIPage.canShareRequest()) {
                                currentIPage.handleShareRequest(request)
                            }
                        }
                        else {
                            request.failWithDisplayText(PlatformJS.Services.resourceLoader.getString(errorStringResourceId))
                        }
                    });
                    var settingsPane = Windows.UI.ApplicationSettings.SettingsPane.getForCurrentView();
                    settingsPane.oncommandsrequested = function (e) {
                        var appSettings = Windows.UI.ApplicationSettings;
                        var vector = e.request.applicationCommands;
                        console.log("onCommandsRequested");
                        var onAboutCmd = function (ev) {
                            console.log("onAboutCmd");
                            NewsJS.Utilities.addAboutPageFragment().then(function (aboutFlyout) {
                                if (aboutFlyout) {
                                    aboutFlyout.addEventListener("afterhide", function () {
                                        NewsJS.Utilities.removeAboutPageFragment()
                                    });
                                    aboutFlyout.show()
                                }
                            })
                        };
                        var settingsCmd = new appSettings.SettingsCommand("SettingsPage", CommonJS.resourceLoader.getString("/platform/optionsTitle"), onSettingsCmd);
                        vector.append(settingsCmd);
                        var aboutCmd = new appSettings.SettingsCommand("AboutPage", PlatformJS.Services.resourceLoader.getString("About"), onAboutCmd);
                        vector.append(aboutCmd);
                        CommonJS.Settings.addCommonButtons(vector)
                    }
                };
                NewsJS.TopEdgy.instance.initializeNews();
                NewsJS.Utilities.registerLiveTileNotifications();
                NewsJS.Tile.newsSecondaryTile.updateAllSecondaryTiles();
                CommonJS.Partners.Config.registerPostReadingConfig("ExtraSubChannels", NewsJS.Partners.Config.processExtraSubChannels);
                CommonJS.Utils.DateTimeFormatting.registerDateTimeFormatter("The New York Times", NYTJS.Formatter.instance.formatDateTime);
                if (!this._hasInitialized) {
                    setupEventHandling();
                    this._hasInitialized = true
                }
            }, handleRecoveryMode: function handleRecoveryMode() {
                return new WinJS.Promise(function (complete) {
                    WinJS.Application.local.folder.getFolderAsync(NewsJS.Constants.appCacheDirectory).then(function (folder) {
                        folder.deleteAsync().then(function () {
                            complete()
                        }, function () {
                            complete()
                        })
                    }, function () {
                        complete()
                    })
                })
            }
        })
    })
})()