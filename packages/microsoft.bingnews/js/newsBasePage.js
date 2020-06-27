/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    function createWrapperFunction(object) {
        return function () {
            return object
        }
    }
    WinJS.Namespace.define("NewsJS", {
        NewsBasePage: WinJS.Class.define(function (state) {
            var that = this;
            NewsJS.Partners.Theme.onNavigated(state);
            this._bdiReporter = (Platform.Utilities.BdiResultReport);
            this._clusterClickHandlers = [];
            this._lastRenderTime = null;
            this.semanticZoomRenderer = function renderSemanticZoom(itemPromise) {
                return {
                    element: itemPromise.then(function (group) {
                        var div = document.createElement("div");
                        WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
                        var binding = NewsJS.Bindings.semanticZoomTile(that._clusterTitle(group.data));
                        if (binding) {
                            CommonJS.setModuleSizeAndClass(binding.moduleInfo, div);
                            CommonJS.loadModule(binding.moduleInfo, binding, div).then()
                        }
                        return div
                    })
                }
            };
            this.newsDailySemanticZoomRenderer = function renderNewsDailySemanticZoom(itemPromise) {
                return {
                    element: itemPromise.then(function (group) {
                        var div = document.createElement("div");
                        if (group.data.clusterEntity) {
                            WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
                            var binding = group.data.clusterEntity;
                            if (binding) {
                                CommonJS.setModuleSizeAndClass(binding.moduleInfo, div);
                                CommonJS.loadModule(binding.moduleInfo, binding, div).then()
                            }
                        }
                        return div
                    })
                }
            };
            WinJS.Utilities.markSupportedForProcessing(this.newsDailySemanticZoomRenderer);
            WinJS.Utilities.markSupportedForProcessing(this.semanticZoomRenderer);
            this.commonHeaderOptions = {};
            this.progressType = CommonJS.Progress.headerProgressType;
            if (this._bdiReporter) {
                var reportButtonControl = PlatformJS.Utilities.getControl("reportBadResults");
                if (reportButtonControl) {
                    var reportButtonElem = document.getElementById("reportBadResults");
                    if (reportButtonElem) {
                        WinJS.Utilities.removeClass(reportButtonElem, "hiddenButton")
                    }
                    reportButtonControl.label = "Report BDI Result";
                    reportButtonControl.icon = "\u2639";
                    reportButtonControl.onclick = function (e) {
                        that.reportButtonClicked()
                    }
                }
            }
            if (state && state.videoContentId) {
                var videoOptions = { videoSource: state.videoContentId };
                CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(videoOptions.videoSource, that.videoOptions);
                state.videoContentId = null
            }
            this.connectivityChange = function hasConnectivityChanged() {
                var hasConnection = PlatformJS.Utilities.hasInternetConnection();
                if (that.isOnline !== hasConnection) {
                    if (hasConnection && that.appWentOnline) {
                        that.appWentOnline()
                    }
                    else if (!hasConnection && that.appWentOffline) {
                        that.appWentOffline()
                    }
                    that.isOnline = hasConnection
                }
            };
            if (PlatformJS.isPlatformInitialized) {
                Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", this.connectivityChange);
                that.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()
            }
            else {
                NewsApp.PageEvents.register("clrInitialized", function newsPanoBasePageClrInitialized() {
                    Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", that.connectivityChange);
                    that.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()
                })
            }
            var panoRefreshThreshold = PlatformJS.BootCache.instance.getEntry("AppConfigPanoRefreshThreshold", function getPanoRefreshThresholdFromConfig() {
                return PlatformJS.Services.appConfig.getInt32("PanoRefreshThreshold")
            });
            if (panoRefreshThreshold) {
                this._refreshThreshold = panoRefreshThreshold
            }
            var helpButton = this._helpButton = PlatformJS.Utilities.getControl("helpButton");
            if (helpButton) {
                helpButton.label = CommonJS.resourceLoader.getString("/platform/HelpLabel");
                var helpButtonClickListener = this._helpButtonClickListener = function onHelpButtonClicked(e) {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.appBar);
                    CommonJS.Settings.onHelpCmd(e);
                    NewsJS.Telemetry.Utilities.recordButtonClick("Help Button", Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e)
                };
                helpButton.addEventListener("click", helpButtonClickListener)
            }
        }, {
            _offlineData: null, _pageDataPromise: null, _semanticZoomForceLayout: false, _refreshThreshold: null, _helpButton: null, _helpButtonClickListener: null, getPanoramaControl: function getPanoramaControl() {
                return (this.getPanoramaControl = createWrapperFunction(PlatformJS.Utilities.getControl("news_Panorama")))()
            }, dispose: function dispose() {
                Platform.Networking.NetworkManager.removeEventListener("networkstatuschanged", this.connectivityChange);
                this.connectivityChange = null;
                var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                if (panoControl) {
                    this.getPanoramaControl = null;
                    panoControl.dispose()
                }
                var helpButton = this._helpButton;
                if (helpButton) {
                    helpButton.removeEventListener("click", this._helpButtonClickListener)
                }
                NewsJS.Partners.Theme.onNavigateAway()
            }, onResuming: function onResuming(event) { }, onVisibilityChange: function onVisibilityChange(event) { }, toggleReportButtonText: function toggleReportButtonText(enableReporting) {
                var reportButtonControl = PlatformJS.Utilities.getControl("reportBadResults");
                if (reportButtonControl) {
                    if (enableReporting) {
                        reportButtonControl.label = "Cancel BDI Report"
                    }
                    else {
                        reportButtonControl.label = "Report BDI Result"
                    }
                }
            }, reportItemAndRestoreClickHandlers: function reportItemAndRestoreClickHandlers(e) {
                var that = this;
                var item = e.item;
                if (that._bdiReporter && item && item.transformer && item.bdiRequestUrl) {
                    var imageUrl = item.thumbnail ? item.thumbnail.url : null;
                    var rawResponse = item.transformer ? item.transformer.getRawResponse() : null;
                    CommonJS.Feedback.showBdiReportForm({
                        bdiRequestUrl: item.bdiRequestUrl, rawResponse: rawResponse, articleHeadline: item.title, articleSnippet: item.snippet, articleUrl: item.articleUrl, imageUrl: imageUrl
                    })
                }
                else {
                    NewsJS.Utilities.showToast("Only BDI results may be reported")
                }
                that.switchClickHandlersForReporting(false)
            }, switchClickHandlersForReporting: function switchClickHandlersForReporting(enableReporting) {
                var panorama = PlatformJS.Utilities.getControl("news_Panorama");
                var clusters = this._clusters ? this._clusters : this._visibleClusters;
                if (panorama && clusters && this._bdiReporter) {
                    var that = this;
                    var currentCluster = null;
                    var currentClusterInstance = null;
                    if (enableReporting) {
                        if (that._clusterClickHandlers.length === 0) {
                            var clustersLength = clusters.length;
                            for (var i = 0; i < clustersLength; i++) {
                                currentCluster = clusters.getAt(i);
                                currentClusterInstance = panorama.getClusterContentControl(currentCluster.clusterKey);
                                if (currentClusterInstance) {
                                    that._clusterClickHandlers.push(currentCluster.clusterContent.contentOptions.onitemclick);
                                    currentClusterInstance.removeEventListener("itemclick", currentCluster.clusterContent.contentOptions.onitemclick);
                                    currentClusterInstance.onitemclick = function (e) {
                                        that.reportItemAndRestoreClickHandlers(e)
                                    }
                                }
                            }
                        }
                    }
                    else {
                        var clickHandlersLength = that._clusterClickHandlers.length;
                        if (clickHandlersLength > 0) {
                            for (var j = clickHandlersLength - 1; j >= 0; j--) {
                                currentCluster = clusters.getAt(j);
                                currentClusterInstance = panorama.getClusterContentControl(currentCluster.clusterKey);
                                if (currentClusterInstance) {
                                    var currentClickHandler = that._clusterClickHandlers.pop();
                                    currentClusterInstance.removeEventListener("itemclick", currentClusterInstance.onitemclick);
                                    currentClusterInstance.onitemclick = currentClickHandler
                                }
                            }
                        }
                    }
                    that.toggleReportButtonText(enableReporting)
                }
            }, reportButtonClicked: function reportButtonClicked() {
                var that = this;
                if (that._clusterClickHandlers.length === 0) {
                    that.switchClickHandlersForReporting(true)
                }
                else {
                    that.switchClickHandlersForReporting(false)
                }
                CommonJS.dismissAllEdgies()
            }, onNavigateAway: function onNavigateAway() {
                if (!NewsJS.Utilities.isPartnerApp) {
                    NewsJS.StateHandler.instance.syncWithPdp()
                }
                NewsJS.Utilities.cancelPromise(this._pageDataPromise)
            }, onBindingComplete: function onBindingComplete() { }, appWentOffline: function appWentOffline() { }, appWentOnline: function appWentOnline() { }, _hideSnap: function _hideSnap() { }, _hideFREBackground: function _hideFREBackground() {
                if (this.FREVisible) {
                    CommonJS.disableAllEdgies(false);
                    this.FREVisible = false;
                    var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                    if (panoControl) {
                        panoControl.zoomOptions = { locked: false }
                    }
                    var offlineEl = document.getElementById("offlineMessageContainer");
                    if (offlineEl) {
                        WinJS.Utilities.addClass(offlineEl, "hidden")
                    }
                    this._hideSnap();
                    this._semanticZoomForceLayout = true
                }
            }, _showFREBackground: function _showFREBackground() {
                if (!this.FREVisible) {
                    CommonJS.disableAllEdgies(true);
                    this.FREVisible = true
                }
            }, FREVisible: null, FREShown: {
                get: function get() {
                    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                    return localSettings.values["FREShown"]
                }, set: function set(shown) {
                    var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                    localSettings.values["FREShown"] = shown
                }
            }, showFRE: function showFRE(title, subtitle) {
                var that = this;
                var moduleInfo = {
                    fragmentPath: "/html/templates.html", templateId: "offlineMessage"
                };
                var data = {
                    title: title, snippet: subtitle
                };
                this._showFREBackground();
                var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                if (panoControl) {
                    panoControl.zoomOptions = { locked: true }
                }
                var headerControl = PlatformJS.Utilities.getControl("news_Panorama_header");
                if (headerControl) {
                    headerControl.fontColor = "headerFontLight"
                }
                var offlineContainerContentElement = document.getElementById("offlineContainerContent");
                offlineContainerContentElement.innerHTML = "";
                CommonJS.loadModule(moduleInfo, data, offlineContainerContentElement);
                var offlineEl = document.getElementById("offlineMessageContainer");
                if (offlineEl) {
                    WinJS.Utilities.removeClass(offlineEl, "hidden")
                }
            }, hideFRE: function hideFRE() {
                this._hideFREBackground()
            }, showCannedFRE: function showCannedFRE() {
                var title = PlatformJS.Services.resourceLoader.getString("WelcomeToBingNews");
                var subtitle = PlatformJS.Services.resourceLoader.getString("SettingUp");
                this.showFRE(title, subtitle);
                this.progressType = CommonJS.Progress.headerProgressType;
                CommonJS.Progress.showProgress(this.progressType)
            }, showOfflineFRE: function showOfflineFRE() {
                var that = this;
                if (this._offlineData && this._offlineData.OfflineTitle && this._offlineData.OfflineConnect) {
                    var title = PlatformJS.Services.resourceLoader.getString(this._offlineData.OfflineTitle);
                    var subtitle = PlatformJS.Services.resourceLoader.getString(this._offlineData.OfflineConnect);
                    that.showFRE(title, subtitle)
                }
            }, onDpiChange: function onDpiChange(e) {
                var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                if (panoControl && panoControl.onDpiChange) {
                    panoControl.onDpiChange(e)
                }
            }, onWindowResize: function onWindowResize(e) { }, onSuspending: function onSuspending(e) { }, applicationViewState: {
                fullScreenLandScape: 0, filled: 1, snapped: 2, fullScreenPortrait: 3
            }, isOnline: true, semanticZoomRenderer: null, commonHeaderOptions: null, addRemovePanoramaFlush: function addRemovePanoramaFlush(shouldAdd) {
                var panoEl = document.getElementById("news_Panorama");
                if (panoEl) {
                    if (shouldAdd) {
                        WinJS.Utilities.addClass(panoEl, "platformPanoramaFlushLeft")
                    }
                    else {
                        WinJS.Utilities.removeClass(panoEl, "platformPanoramaFlushLeft")
                    }
                }
            }, checkOffline: function checkOffline(dontShowToast) {
                this.isOnline = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection();
                if (this.isOnline) {
                    this.toggleOfflineArticles(true);
                    return false
                }
                else {
                    if (!dontShowToast) {
                        var msg = PlatformJS.Services.resourceLoader.getString("ArticleUnavailableOffline");
                        NewsJS.Utilities.showToast(msg)
                    }
                    return true
                }
            }, toggleOfflineArticles: function toggleOfflineArticles(enabled) { }, raiseEdgyTemporarily: function raiseEdgyTemporarily() {
                var that = this;
                var edgy = document.getElementById("actionEdgy");
                if (edgy) {
                    edgy.addEventListener("afterhide", function (event) {
                        that.cancelEdgyHide()
                    });
                    edgy.addEventListener("MSPointerDown", function (event) {
                        that.cancelEdgyHide()
                    })
                }
                var actionEdgyCtl = PlatformJS.Utilities.getControl("actionEdgy");
                if (actionEdgyCtl) {
                    actionEdgyCtl.show()
                }
                that._hideTimeout = setTimeout(function () {
                    that.hideEdgy()
                }, 5000)
            }, cancelEdgyHide: function cancelEdgyHide() {
                var that = this;
                if (that._hideTimeout) {
                    console.log("Cancelling hide of app bar edgy");
                    clearTimeout(that._hideTimeout);
                    that._hideTimeout = null
                }
            }, hideEdgy: function hideEdgy() {
                var edgy = document.getElementById("actionEdgy");
                if (edgy) {
                    if (edgy.style.visibility !== "hidden") {
                        WinJS.UI.Animation.fadeOut(edgy).then(function () {
                            edgy.style.visibility = "hidden"
                        })
                    }
                }
                this._hideTimeout = null
            }, onRoamingStateChanged: function onRoamingStateChanged() { }, onPreviewToggle: function onPreviewToggle() {
                var that = this;
                that._refreshPage()
            }, _shouldRefreshedRenderedContent: function _shouldRefreshedRenderedContent() {
                var shouldRefresh = false;
                if (this._lastRenderTime && this._refreshThreshold) {
                    var currentTime = Date.now();
                    var elapsedSecondsSinceLastRender = (currentTime - this._lastRenderTime);
                    if (elapsedSecondsSinceLastRender > this._refreshThreshold) {
                        shouldRefresh = true;
                        this._lastRenderTime = Date.now()
                    }
                }
                return shouldRefresh
            }, _pageLoadSucceeded: function _pageLoadSucceeded() {
                CommonJS.Error.removeError();
                NewsJS.Utilities.disableButton("refreshButton", false);
                CommonJS.Progress.hideProgress(this.progressType);
                var platformPage = document.querySelector(".pageLoading");
                if (platformPage) {
                    WinJS.Utilities.removeClass(platformPage, "pageLoading")
                }
            }, _pageLoadFailed: function _pageLoadFailed(refreshFunction) {
                var that = this;
                CommonJS.Error.showError(NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection() ? CommonJS.Error.STANDARD_ERROR : CommonJS.Error.NO_INTERNET, refreshFunction ? refreshFunction : function () {
                    if (that && that.loadPageData) {
                        that.loadPageData(false)
                    }
                });
                NewsJS.Utilities.disableButton("refreshButton", false);
                CommonJS.Progress.hideProgress(this.progressType)
            }, _resetForSnap: function _resetForSnap() { }, _refreshPage: function _refreshPage(showToast) {
                NewsJS.StateHandler.instance.syncWithPdp(true, true);
                if (!this.checkOffline(!showToast)) {
                    this._offlineData = null;
                    var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                    if (panoControl) {
                        panoControl.panoramaState = null
                    }
                    this.loadPageData(true);
                    this._resetForSnap()
                }
                CommonJS.dismissAllEdgies()
            }, _clusterTitle: function _clusterTitle(groupData) {
                return groupData.clusterTitle
            }
        })
    })
})();
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        BasePartnerPano: WinJS.Class.derive(NewsJS.NewsBasePage, function BasePartnerPano_ctor(state) {
            NewsJS.NewsBasePage.call(this, state);
            var that = this;
            this._clusters = [];
            if (!state) {
                state = {}
            }
            else {
                this._panoramaState = state.panoramaState
            }
            this._state = state;
            this._providers = [];
            this.addRemovePanoramaFlush(false);
            this._timestamp = null;
            this._autoRefresh = null;
            this._panoControl = PlatformJS.Utilities.getControl("news_Panorama");
            var refreshButton = PlatformJS.Utilities.getControl("refreshButton");
            refreshButton.label = PlatformJS.Services.resourceLoader.getString("/partners/Refresh");
            refreshButton.onclick = function () {
                that._refreshPage();
                that.onManualRefreshButtonClick()
            };
            WinJS.Utilities.removeClass(refreshButton.element, "hidden");
            if (this._setupSectionPin) {
                this._handleSectionPin = function () {
                    that._setupSectionPin(state)
                };
                var edgy = PlatformJS.Utilities.getControl("actionEdgy");
                edgy.addEventListener("beforeshow", this._handleSectionPin)
            }
            this._autoRefreshInterval = CommonJS.Partners.Config.getConfig(that._partner, "AutoRefreshInterval", 15 * 60, true);
            this._dataChangeHandler = function (event) {
                var newRefreshValue = CommonJS.Partners.Config.getConfig(that._partner, "AutoRefreshInterval", 15 * 60, true);
                if (that._autoRefreshInterval !== newRefreshValue) {
                    if (that._autoRefresh || that._autoRefreshInterval === 0) {
                        that._autoRefreshInterval = newRefreshValue;
                        that._createTimer()
                    }
                }
            };
            Windows.Storage.ApplicationData.current.addEventListener("datachanged", this._dataChangeHandler);
            this._isActivePage = true;
            this._panoBounded = false;
            this.semanticZoomRenderer = function (itemPromise) {
                return {
                    element: itemPromise.then(function (group) {
                        var div = document.createElement("div"),
                            semanticZoomTileContainer = document.createElement("div"),
                            semanticZoomTextContainer = document.createElement("div"),
                            semanticZoomText = document.createElement("div"),
                            semanticZoomIcon = document.createElement("div");
                        WinJS.Utilities.addClass(div, "platformSemanticZoomItem");
                        WinJS.Utilities.addClass(semanticZoomTileContainer, "semanticZoomTileContainer");
                        WinJS.Utilities.addClass(semanticZoomTextContainer, "semanticZoomTextContainer");
                        WinJS.Utilities.addClass(semanticZoomText, "semanticZoomText");
                        WinJS.Utilities.addClass(semanticZoomIcon, "semanticZoomIcon");
                        semanticZoomText.textContent = that._clusterTitle(group.data);
                        var sectionName = (group.data.clusterEntity && group.data.clusterEntity.sectionName) ? group.data.clusterEntity.sectionName : null;
                        WinJS.Utilities.addClass(semanticZoomIcon, NewsJS.Partners.Config.getSectionImage(that._partner, sectionName));
                        semanticZoomTextContainer.appendChild(semanticZoomText);
                        semanticZoomTextContainer.appendChild(semanticZoomIcon);
                        semanticZoomTileContainer.appendChild(semanticZoomTextContainer);
                        div.appendChild(semanticZoomTileContainer);
                        return div
                    })
                }
            };
            WinJS.Utilities.markSupportedForProcessing(this.semanticZoomRenderer);
            NewsJS.Utilities.loadDeferredStylesheets()
        }, {
            _panoControl: null, _timestamp: null, _partner: null, _autoRefresh: null, _dataChangeHandler: null, _autoRefreshInterval: null, countWeight: 2, _isActivePage: false, _setupSectionPin: function _setupSectionPin(state, pinSection, unpinSection) {
                var that = this;
                var pin = document.getElementById("pinSection");
                if (!pin) {
                    return
                }
                if (!NewsJS.Partners.Config.isPartnerApp) {
                    var newsActionEdgyRight = document.querySelector(".newsActionEdgyRight");
                    if (newsActionEdgyRight) {
                        if (newsActionEdgyRight.firstChild) {
                            newsActionEdgyRight.insertBefore(pin, newsActionEdgyRight.firstChild)
                        }
                        else {
                            newsActionEdgyRight.appendChild(pin)
                        }
                    }
                }
                WinJS.Utilities.addClass(pin, "platformHide");
                return this._articleManager.getFeedInfoAsync(state.feedType, state.feedIdentifierValue, false).then(function (feedInfo) {
                    WinJS.Utilities.removeClass(pin, "platformHide");
                    var feedInfoTitle = feedInfo.pinTitle ? feedInfo.pinTitle : feedInfo.title;
                    var title = !NewsJS.Partners.Config.isPartnerApp ? that._title + " - " + feedInfoTitle : feedInfoTitle;
                    var logo = PlatformJS.Services.appConfig.getString("PinLogo");
                    if (!logo) {
                        logo = NewsJS.Partners.Config.isPartnerApp ? "images/pinlogo.png" : "images/logo.png"
                    }
                    return NewsJS.Utilities.Pinning._setupPinButton("pinSection", PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), "", "", "", "", state.feedType + "-" + state.feedIdentifierValue.replace(" ", "_"), title, title, that._categoryPano.page, {
                        feedType: feedInfo.feedType, feedIdentifierValue: state.feedIdentifierValue, theme: that._partner, pinLogoUrls: state.pinLogoUrls, channelID: WinJS.Navigation.location.channelId
                    }, null, "ms-appx:///" + logo, NewsJS.Partners.Config.isPartnerApp ? null : state.pinLogoUrls, NewsJS.Partners.Config.isPartnerApp && feedInfo.sectionInfo ? feedInfo.sectionInfo.liveTileUrls : null, CommonJS.Partners.Config.getConfig(that._partner, "LiveTileUpdateFrequency", Windows.UI.Notifications.PeriodicUpdateRecurrence.hour), that.onPinSection.bind(that))
                }, function () {
                    WinJS.Utilities.addClass(pin, "platformHide")
                })
            }, onPinSection: function onPinSection() { }, onManualRefreshButtonClick: function onManualRefreshButtonClick() { }, onBindingComplete: function onBindingComplete() {
                NewsJS.NewsBasePage.prototype.onBindingComplete.call(this);
                this.loadPageData(false)
            }, dispose: function dispose() {
                NewsJS.NewsBasePage.prototype.dispose.call(this);
                for (var i = 0; i < this._providers.length; i++) {
                    if (this._providers[i].dispose) {
                        this._providers[i].dispose()
                    }
                }
                this._providers = [];
                this._resetTimer();
                Windows.Storage.ApplicationData.current.removeEventListener("datachanged", this._dataChangeHandler);
                this._dataChangeHandler = null;
                this._isActivePage = false;
                if (this._subscribeButton) {
                    this._subscribeButton.onclick = null;
                    this._subscribeButton = null
                }
                if (this._handleSectionPin) {
                    var edgy = PlatformJS.Utilities.getControl("actionEdgy");
                    if (edgy) {
                        edgy.removeEventListener("beforeshow", this._handleSectionPin)
                    }
                    this._handleSectionPin = null
                }
                WinJS.Utilities.removeClass(document.body, "inErrorMode");
                NewsJS.BasePartnerPano.disposeLoginButton()
            }, getPageState: function getPageState() {
                var panoControl = PlatformJS.Utilities.getControl("news_Panorama");
                if (panoControl) {
                    this._state.panoramaState = panoControl.getPanoramaState()
                }
                return this._state
            }, getPageData: function getPageData() {
                var that = this;
                return WinJS.Promise.wrap({
                    semanticZoomRenderer: that.semanticZoomRenderer, headerOptions: that.commonHeaderOptions, panoramaState: that._panoramaState
                })
            }, loadPageData: function loadPageData(bypassCache) {
                this.progressType = !bypassCache ? CommonJS.Progress.centerProgressType : CommonJS.Progress.headerProgressType;
                NewsJS.Utilities.disableButton("refreshButton", true);
                CommonJS.Progress.showProgress(this.progressType)
            }, _resetTimer: function _resetTimer() {
                if (this._autoRefresh) {
                    clearTimeout(this._autoRefresh);
                    this._autoRefresh = null
                }
            }, _createTimer: function _createTimer() {
                var that = this;
                this._resetTimer();
                var refreshInterval = this._autoRefreshInterval;
                if (refreshInterval !== 0) {
                    this._autoRefresh = setTimeout(function () {
                        that.loadPageData(true);
                        NewsJS.Telemetry.Utilities.recordRefresh(Microsoft.Bing.AppEx.Telemetry.ContentClear.autoRefresh)
                    }, refreshInterval * 1000)
                }
            }, _pageLoadSucceeded: function _pageLoadSucceeded() {
                if (this._isActivePage) {
                    NewsJS.NewsBasePage.prototype._pageLoadSucceeded.call(this);
                    WinJS.Utilities.removeClass(document.body, "inErrorMode")
                }
            }, _pageLoadFailed: function _pageLoadFailed() {
                if (this._isActivePage) {
                    var that = this;
                    NewsJS.NewsBasePage.prototype._pageLoadFailed.call(this, function () {
                        that.loadPageData(true)
                    });
                    WinJS.Utilities.addClass(document.body, "inErrorMode")
                }
                this._resetTimer()
            }, _panoBounded: false, _populatePano: function _populatePano() {
                var that = this;
                that._panoBounded = true;
                that._panoControl.clusterDataSource = new WinJS.Binding.List(that._clusters).dataSource;
                return WinJS.Promise.wrap()
            }, itemInvoked: function itemInvoked(item, event) {
                var that = this,
                    promise = null;
                if (!item.access || item.access === "anonymous") {
                    promise = WinJS.Promise.wrap(true)
                }
                else {
                    promise = this._authManager.getEntitlementsAsync(true, false, false, true)
                }
                promise.then(function (isEntitled) {
                    if (!isEntitled) {
                        return
                    }
                    that._itemInvoked(item, event)
                }, function (error) {
                    if (error !== CommonJS.Partners.Auth.BaseAuth.notLoggedInError) {
                        NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/partners/unableToVerifyEntitlements"))
                    }
                })
            }, _itemInvoked: function _itemInvoked(item, event) {
                var that = this;
                if (item.type === "pano") {
                    item.state.theme = this._partner;
                    WinJS.Navigation.navigate(this._categoryPano, item.state)
                }
                else if (item.type === "article" || (item.type === "blog" && !this._openBlogInFrame)) {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.cluster);
                    WinJS.Navigation.navigate({
                        fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: this._articleReaderPage
                    }, {
                        providerType: this._articleReaderProvider, providerConfiguration: {
                            feedType: item.feedType, feedIdentifierValue: item.feedIdentifierValue, articleList: JSON.stringify(item.articleList)
                        }, initialArticleId: item.articleId, enableSharing: true, enableSnap: true, snappedHeaderTitle: " ", snappedHeaderFontColor: "headerFontDark", theme: this._partner, validActions: this.getValidActions ? this.getValidActions() : null, actionsHandlerType: this.getActionsHandlerType ? this.getActionsHandlerType() : null, actionKeys: this.getActionKeys ? this.getActionKeys() : null, originatingSection: that._state.feedIdentifierValue, originatingFeed: item.feedIdentifierValue, entryPoint: item.instrumentationEntryPoint, instrumentationId: item.instrumentationPartnerCode
                    })
                }
                else if (item.type === "blog" && this._openBlogInFrame) {
                    var articleId = item.articleUrl;
                    var providerType = "AppEx.Common.ArticleReader.WebpageProvider";
                    var webArticleInfos = [];
                    webArticleInfos.push({
                        articleId: articleId, articleType: "webpage"
                    });
                    var providerConfiguration = PlatformJS.Collections.createStringDictionary();
                    providerConfiguration.insert("articleInfos", JSON.stringify({ articleInfos: webArticleInfos }));
                    WinJS.Navigation.navigate({
                        fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: "CommonJS.WebViewArticleReaderPage"
                    }, {
                        providerType: providerType, providerConfiguration: providerConfiguration, initialArticleId: articleId, enableSharing: true, renderAll: true, entryPoint: item.instrumentationEntryPoint
                    })
                }
                else if (item.type === "slideshow" && this._slideShowPage) {
                    WinJS.Navigation.navigate({
                        fragment: "/html/newsSlideshow.html", page: this._slideShowPage
                    }, {
                        providerType: this._slideshowProvider, providerConfiguration: {
                            articleId: item.slideshowId ? item.slideshowId : item.articleId, feedType: item.feedType, feedIdentifierValue: item.feedIdentifierValue, articleGuid: item.articleGuid
                        }, theme: this._partner, access: item.access
                    })
                }
                else if (item.type === "video") {
                    CommonJS.MediaApp.Controls.MediaPlayback.fullscreenPlayback(item.video.url, that.createVideoOptions(item), that.createVideoList(item));
                    that.onPlayVideo(item.articleURL, item.feedIdentifierValue, item.feedType)
                }
            }, createVideoOptions: function createVideoOptions(item) {
                return {
                    title: item.title ? NewsJS.Utilities.stripHTML(item.title) : item.snippet, thumbnail: (item.thumbnail && item.thumbnail.url) || item.thumbnailUrl, source: PlatformJS.Services.resourceLoader.getString("/" + this._partner.toLowerCase() + "/the" + this._partner.toLowerCase()), index: item.articleIndex - 1, instrumentationEntryPoint: item.instrumentationEntryPoint
                }
            }, createVideoList: function createVideoList(item) {
                var videoList = [];
                var videos = item.videoList;
                if (videos) {
                    for (var k = 0; k < videos.length; k++) {
                        var video = this.createVideoOptions(videos[k]);
                        video.videoSource = videos[k].url;
                        videoList.push(video)
                    }
                }
                return videoList
            }, onPlayVideo: function onPlayVideo(articleURL, feedIdentifierValue, feedType) { }, createNewsCluster: function createNewsCluster(section, provider, title, onheaderselection, maxColumnCount, isPrimaryCluster, configKey, configObject, adInfo, instrumentationEntryPoint, instrumentationPartnerCode) {
                var that = this;
                var clusterKey = section.sectionName || section.blogName || title || section.title;
                return {
                    clusterEntity: section, clusterKey: clusterKey, clusterTitle: title || section.title, onHeaderSelection: onheaderselection ? function (clusterEntity, index, pano) {
                        that._onHeaderSelection(clusterEntity, index, pano, null)
                    } : null, clusterContent: {
                        contentControl: "CommonJS.News.EntityCluster", contentOptions: {
                            categoryKey: clusterKey, mode: CommonJS.News.ClusterMode.dynamic, onitemclick: function onitemclick(e) {
                                if (instrumentationEntryPoint) {
                                    e.detail.item.instrumentationEntryPoint = instrumentationEntryPoint
                                }
                                if (instrumentationPartnerCode) {
                                    e.detail.item.instrumentationPartnerCode = instrumentationPartnerCode.partnerCode
                                }
                                that.itemInvoked(e.detail.item, e)
                            }, configKey: configKey ? configKey : "EntityClusterDefaultNewsConfig", configObject: configObject ? configObject : CommonJS.News.EntityClusterConfig.DefaultNews, provider: provider, alignBottom: true, maxColumnCount: maxColumnCount, theme: "newsAppTheme" + (isPrimaryCluster ? " primaryCluster" : ""), adUnitId: adInfo ? adInfo.adUnitId : null, adsList: adInfo ? adInfo.adsList : null, heightOffset: 158, showHeadlineList: false
                        }
                    }
                }
            }, _onHeaderSelection: function _onHeaderSelection(clusterKey, index, pano, event) {
                var pageInfo = {
                    fragment: this._categoryPano.fragment, page: this._categoryPano.page, channelId: this._partner + "_" + clusterKey
                };
                WinJS.Navigation.navigate(pageInfo, {
                    feedType: "section", feedIdentifierValue: clusterKey, theme: this._partner
                })
            }
        }, {
            disposeLoginButton: function disposeLoginButton() {
                var loginCmd = PlatformJS.Utilities.getControl("signInButton");
                if (loginCmd) {
                    loginCmd.onclick = null
                }
                var logoutCmd = PlatformJS.Utilities.getControl("logoutButton");
                if (logoutCmd) {
                    logoutCmd.onclick = null
                }
            }, launchPartnerApp: function launchPartnerApp(partner) {
                var protocol = CommonJS.Partners.Config.getConfig(partner, "Protocol");
                var options = new Windows.System.LauncherOptions;
                options.displayApplicationPicker = false;
                options.preferredApplicationDisplayName = CommonJS.Partners.Config.getConfig(partner, "PackageName");
                options.preferredApplicationPackageFamilyName = CommonJS.Partners.Config.getConfig(partner, "PackageFamilyName");
                var url = protocol + "://home/referrer=" + Windows.ApplicationModel.Package.current.id.name;
                Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(url), options)
            }
        })
    })
})()