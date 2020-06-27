/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS", {
        SlideShowPage: WinJS.Class.derive(NewsJS.NewsBasePage, function (state) {
            NewsJS.NewsBasePage.call(this, state);
            this._useSnappedContainer = false;
            this.dontShowSlideTitle = false;
            if (state && state.slideshowId) {
                this.slideshowId = state.slideshowId;
                if (state.slideshowId.indexOf("Reuters_") >= 0) {
                    this.dontShowSlideTitle = true
                }
            }
            var slideShowControl = this._slideShowControl = PlatformJS.Utilities.getControl("ssView");
            if (state && state.extraOptions) {
                var options = state.extraOptions;
                if (options.dontShowSlideTitle) {
                    this.dontShowSlideTitle = options.dontShowSlideTitle
                }
                if (options.dynamicPanoPaywallMessageFunction && slideShowControl) {
                    slideShowControl.dynamicPanoPaywallMessageFunction = options.dynamicPanoPaywallMessageFunction
                }
            }
            if (state) {
                if (state.market) {
                    this.market = state.market
                }
                else if (NewsJS.Globalization) {
                    this.market = NewsJS.Globalization.getMarketStringForEditorial()
                }
            }
            if (state && state.imageIndex) {
                this.imageIndex = state.imageIndex
            }
            else {
                this.imageIndex = 0
            }
            if (state && (state.instrumentationEntryPoint || state.instrumentationEntryPoint === 0)) {
                this.instrumentationEntryPoint = state.instrumentationEntryPoint
            }
            if (!state) {
                state = {}
            }
            this._state = JSON.parse(JSON.stringify(state))
        }, {
            _state: null, slideshowId: null, market: null, image: null, isImmersive: true, _slideShowControl: null, dispose: function dispose() {
                if (this._slideShowControl && this._slideShowControl.dispose) {
                    this._slideShowControl.dispose()
                }
                NewsJS.NewsBasePage.prototype.dispose()
            }, getPageImpressionContext: function getPageImpressionContext() {
                var prefix = "";
                if (this.instrumentationEntryPoint === Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano) {
                    prefix = NewsJS.Telemetry.String.ImpressionContext.partnerPano
                }
                return prefix + NewsJS.Telemetry.String.ImpressionContext.slideShow
            }, getPageState: function getPageState() {
                var slideShowControl = this._slideShowControl;
                if (!slideShowControl) {
                    slideShowControl = this._slideShowControl = PlatformJS.Utilities.getControl("ssView")
                }
                if (slideShowControl) {
                    this._state.imageIndex = slideShowControl.currentPage
                }
                return this._state
            }, getPageData: function getPageData() {
                var that = this;
                var provider = null;
                if (this._state.providerType) {
                    provider = PlatformJS.Utilities.createObject(this._state.providerType, this._state.providerConfiguration)
                }
                else {
                    var options = {
                        slideshowId: that.slideshowId, market: that.market, queryServiceId: "MarketBedrockSlideshows"
                    };
                    provider = new CommonJS.Slideshow.SlideshowProvider(options)
                }
                var config = PlatformJS.Collections.createStringDictionary();
                var p = new WinJS.Promise(function (complete) {
                    var result = {
                        clickHandler: WinJS.Utilities.markSupportedForProcessing(function (value) {
                            that.articleLinkHandler(value)
                        }), dontShowSlideTitle: that.dontShowSlideTitle, startIndex: that.imageIndex, dataOptions: {
                            provider: provider, config: config
                        }, instrumentationEntryPoint: that.instrumentationEntryPoint
                    };
                    complete(result)
                });
                return p
            }, onBindingComplete: function onBindingComplete() { }, articleLinkHandler: function articleLinkHandler(value) {
                var that = this;
                var uriString = value;
                var result = NewsJS.Utilities.parseCMSUriString(uriString, that.market);
                if (result && result.entitytype === "article") {
                    var navigationPromise = PlatformJS.Navigation.createCommandFromUri(uriString.toLowerCase());
                    if (navigationPromise) {
                        navigationPromise.then(function (navigation) {
                            if (navigation && navigation.dataAvailable) {
                                navigation.dataAvailable.then(function (navigationOk) {
                                    if (navigationOk) {
                                        Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(NewsJS.Telemetry.String.ImpressionNavMethod.slideShow);
                                        NewsJS.Telemetry.SlideShow.recordSlideShowToArticle(that.slideshowId, that.market, result.pageId, result.contentId);
                                        navigation.state.instrumentation = that._state.instrumentation;
                                        WinJS.Navigation.navigate({
                                            fragment: navigation.pageInfo.fragment, page: navigation.pageInfo.page
                                        }, navigation.state)
                                    }
                                    else {
                                        NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("ArticleUnavailableOffline"))
                                    }
                                })
                            }
                        })
                    }
                }
            }, handleShareRequest: function handleShareRequest(request) {
                CommonJS.Sharing.Slideshow.share(request, this._state)
            }
        })
    })
})()