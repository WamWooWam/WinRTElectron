/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    function getArticleInfo(editorialArticle) {
        var articleInfo = null;
        var articleIdPath = NewsJS.Utilities.getEditorialArticleIdPath(editorialArticle);
        if (articleIdPath) {
            articleInfo = {
                articleId: articleIdPath, headline: editorialArticle.title, snippet: editorialArticle.snippet, abstract: editorialArticle.abstract, thumbnail: editorialArticle.thumbnailLowRes || editorialArticle.thumbnail
            }
        }
        return articleInfo
    }
    function getArticleReaderNavigationInfo(article, articleIdPath, marketString, articleInfos, themeOverride, indexBased, articleIndex, hasInternetConnection) {
        var navigation = {
            state: {}, pageInfo: {}
        };
        var providerType = "AppEx.Common.ArticleReader.BedrockArticleProvider";
        var providerConfiguration = PlatformJS.Collections.createStringDictionary();
        var queryServiceId = "";
        var fallbackQueryServiceId = "";
        if (PlatformJS.isDebug && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
            queryServiceId = "RenderProxy_MarketPreviewBedrockArticles";
            fallbackQueryServiceId = "MarketPreviewBedrockArticles"
        }
        else {
            queryServiceId = "RenderProxy_MarketBedrockArticles";
            fallbackQueryServiceId = "MarketBedrockArticles2"
        }
        providerConfiguration.insert("queryServiceId", queryServiceId);
        providerConfiguration.insert("fallbackQueryServiceId", fallbackQueryServiceId);
        providerConfiguration.insert("imageCacheId", "PlatformImageCache");
        providerConfiguration.insert("market", marketString);
        providerConfiguration.insert("cp-mode", NewsJS.Utilities.renderServiceDomain());
        if (articleInfos) {
            providerConfiguration.insert("articleInfos", articleInfos);
            if (indexBased) {
                providerConfiguration.insert("indexBased", true)
            }
        }
        var initialArticleId = indexBased ? (articleIndex + "") : articleIdPath;
        navigation.state = {
            providerType: providerType, providerConfiguration: providerConfiguration, initialArticleId: initialArticleId, enableSnap: true, enableSharing: true, snappedHeaderTitle: PlatformJS.Services.resourceLoader.getString("AppTitle"), snappedHeaderFontColor: "headerFontLight", theme: themeOverride || "BingDailyArticleReaderTheme", market: marketString, disablePaywall: article ? article.disablePaywall : true
        };
        setTelemetry(article, navigation.state);
        navigation.pageInfo.channelId = null;
        navigation.pageInfo.fragment = "/common/ArticleReader/html/ArticleReaderPage.html";
        navigation.pageInfo.page = "NewsJS.NewsArticleReaderPage";
        if (typeof (hasInternetConnection) === "undefined" || hasInternetConnection === null) {
            hasInternetConnection = NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()
        }
        if (!hasInternetConnection) {
            var queryService = new PlatformJS.DataService.QueryService(queryServiceId);
            var urlParams = PlatformJS.Collections.createStringDictionary();
            urlParams.insert("market", marketString);
            urlParams.insert("articleId", articleIdPath);
            urlParams.insert("cp-mode", NewsJS.Utilities.renderServiceDomain());
            var fallbackQueryService = new PlatformJS.DataService.QueryService(fallbackQueryServiceId);
            var fallbackUrlParams = PlatformJS.Collections.createStringDictionary();
            fallbackUrlParams.insert("market", marketString);
            fallbackUrlParams.insert("articleId", articleIdPath);
            fallbackUrlParams.insert("cp-mode", NewsJS.Utilities.renderServiceDomain());
            var promises = [];
            promises.push(queryService.hasEntryAsync(urlParams, null));
            promises.push(fallbackQueryService.hasEntryAsync(fallbackUrlParams, null));
            navigation.dataAvailable = new WinJS.Promise(function (complete) {
                WinJS.Promise.join(promises).then(function (results) {
                    if (results[0] || results[1]) {
                        complete(true)
                    }
                    else {
                        complete(false)
                    }
                }, function (err) {
                    complete(false)
                })
            })
        }
        else {
            navigation.dataAvailable = WinJS.Promise.wrap(true)
        }
        return navigation
    }
    function getEditorialArticleIdPath(article) {
        var articleIdPath = null;
        if (article.editorial) {
            articleIdPath = article.contentid ? article.articleid + "/" + article.contentid : article.articleid + ""
        }
        return articleIdPath
    }
    function launchArticle(article, listInfo, themeOverride) {
        var market = article.market || NewsJS.Globalization.getMarketStringForEditorial();
        if (article.editorial) {
            if (article.type === "slideshow") {
                if (!NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                    NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("ArticleUnavailableOffline") || PlatformJS.Services.resourceLoader.getString("/platform/ArticleUnavailableOffline"));
                    return
                }
                var sourceMarket = market.toLowerCase();
                if (article.contentid && sourceMarket) {
                    var targetState = {
                        slideshowId: article.contentid, market: sourceMarket
                    };
                    if (article.telemetry && (article.telemetry.entryPoint || article.telemetry.entryPoint === 0)) {
                        targetState.instrumentationEntryPoint = article.telemetry.entryPoint
                    }
                    WinJS.Navigation.navigate({
                        fragment: "/html/newsSlideshow.html", page: "NewsJS.SlideShowPage"
                    }, targetState)
                }
            }
            else if (article.type === "article") {
                var articleIdPath = getEditorialArticleIdPath(article);
                var articleInfos;
                var articleCategory = article.categoryKey && article.categoryKey.indexOf(".") !== -1 ? article.categoryKey.substring(0, article.categoryKey.lastIndexOf(".")) : article.categoryKey;
                var noAdLayout = article.market && article.market.toLowerCase() !== NewsJS.Globalization.getMarketStringForEditorial().toLowerCase() ? "noad" : null;
                NewsJS.Utilities.populateArticleInfoAds(articleCategory, null, article.clusterArticles, article.AdTags, NewsJS.Utilities.defaultProviderId(), noAdLayout);
                var indexBased = false;
                var articleIndex;
                if (article.clusterArticles) {
                    if (article.clusterArticles.indexBased) {
                        indexBased = true;
                        articleIndex = article.clusterArticles.articleIndex
                    }
                    articleInfos = JSON.stringify(article.clusterArticles);
                    article.clusterArticles = null
                }
                var navigation = getArticleReaderNavigationInfo(article, articleIdPath, market.toLowerCase(), articleInfos, themeOverride, indexBased, articleIndex);
                if (navigation && navigation.dataAvailable) {
                    navigation.dataAvailable.then(function (navigationOk) {
                        if (navigationOk) {
                            WinJS.Navigation.navigate({
                                fragment: navigation.pageInfo.fragment, page: navigation.pageInfo.page
                            }, navigation.state)
                        }
                        else {
                            NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("ArticleUnavailableOffline") || PlatformJS.Services.resourceLoader.getString("/platform/ArticleUnavailableOffline"))
                        }
                    })
                }
            }
        }
        else {
            if (!NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("ArticleUnavailableOffline") || PlatformJS.Services.resourceLoader.getString("/platform/ArticleUnavailableOffline"));
                return
            }
            var articleId = article.articleUrl;
            var providerType = "AppEx.Common.ArticleReader.WebpageProvider";
            var webpageArticleInfos;
            if (article.clusterArticles) {
                webpageArticleInfos = JSON.stringify(article.clusterArticles);
                article.clusterArticles = null
            }
            else {
                var webPageArticleInfoArray = [];
                webPageArticleInfoArray.push({ articleId: articleId });
                webpageArticleInfos = JSON.stringify({ articleInfos: webPageArticleInfoArray })
            }
            var providerConfiguration = PlatformJS.Collections.createStringDictionary();
            providerConfiguration.insert("articleInfos", webpageArticleInfos);
            var state = {
                assembler: null, providerType: providerType, providerConfiguration: providerConfiguration, initialArticleId: articleId, enableSharing: true, renderAll: true
            };
            setTelemetry(article, state);
            WinJS.Navigation.navigate({
                fragment: "/common/ArticleReader/html/ArticleReaderPage.html", page: "CommonJS.WebViewArticleReaderPage"
            }, state)
        }
    }
    function setTelemetry(article, state) {
        if (article && article.telemetry) {
            state.telemetry = article.telemetry;
            state.adPartnerName = article.telemetry.partnerCode;
            state.instrumentationId = article.telemetry.partnerCode;
            state.entryPoint = article.telemetry.entryPoint;
            if (typeof article.telemetry.source === "number") {
                state.source = article.telemetry.source
            }
            else {
                state.source = Platform.Instrumentation.InstrumentationEditorialSourceId.protocol
            }
        }
    }
    function populateArticleInfoAds(category, subCategory, articleInfos, adTags, providerId, noAdLayout) {
        if (articleInfos && articleInfos.articleInfos) {
            PlatformJS.Utilities.annotateArticleInfosWithAdInfo(category, subCategory, articleInfos.articleInfos, adTags, providerId, noAdLayout)
        }
    }
    function createConfig(url, panoId) {
        if (url && url.length > 0) {
            var providerConfiguration = PlatformJS.Collections.createStringDictionary();
            providerConfiguration.insert("url", url);
            var prefetchConfig = {
                articleIdPath: null, priority: Platform.DataServices.QueryServicePriority.medium, providerType: "EntityClusterImageProvider", providerConfiguration: providerConfiguration, token: panoId + ":" + AppEx.Common.ArticleReader.GuidProvider.getGuid()
            };
            return prefetchConfig
        }
    }
    function getClusterPrefetchConfigs(cluster, panoId) {
        var configs = [];
        if (cluster) {
            if (cluster.sourceImageUrl) {
                var imageConfig = createConfig(cluster.sourceImageUrl, panoId);
                if (imageConfig) {
                    configs.push(imageConfig)
                }
            }
            if (cluster.thumbnail) {
                var thumbnailConfig = createConfig(cluster.thumbnail.url, panoId);
                if (thumbnailConfig) {
                    configs.push(thumbnailConfig)
                }
            }
        }
        return configs
    }
    function getPrefetchConfig(article, priority, panoId, configMarket, hasInternetConnection) {
        var prefetchConfig = null;
        if (article) {
            var articleIdPath = getEditorialArticleIdPath(article);
            var marketString = configMarket || NewsJS.Globalization.getMarketStringForEditorial().toLowerCase();
            var nav = getArticleReaderNavigationInfo(article, articleIdPath, marketString, null, null, null, null, hasInternetConnection);
            var articleReaderState = nav.state;
            var providerConfiguration = PlatformJS.Collections.createStringDictionary();
            for (var key in articleReaderState.providerConfiguration) {
                providerConfiguration.insert(key, articleReaderState.providerConfiguration[key])
            }
            providerConfiguration.insert("prefetchImagesWithArticle", true);
            var providerType = articleReaderState.providerType;
            var token = articleIdPath;
            if (panoId) {
                token = panoId + ":" + articleIdPath + "_" + AppEx.Common.ArticleReader.GuidProvider.getGuid()
            }
            prefetchConfig = {
                articleIdPath: articleIdPath, priority: priority, providerType: providerType, providerConfiguration: providerConfiguration, token: token
            }
        }
        return prefetchConfig
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        _articleAdConfig: null, getArticleInfo: getArticleInfo, getArticleReaderNavigationInfo: getArticleReaderNavigationInfo, getEditorialArticleIdPath: getEditorialArticleIdPath, launchArticle: launchArticle, populateArticleInfoAds: populateArticleInfoAds, getPrefetchConfig: getPrefetchConfig, getClusterPrefetchConfigs: getClusterPrefetchConfigs, directionAttribute: WinJS.Binding.converter(function (text) {
            return PlatformJS.Utilities.getTextDirection(text)
        })
    })
})();
(function () {
    "use strict";
    function fixupBidiPunctuation(text) {
        var directionText = PlatformJS.Utilities.getTextDirection(text);
        var result = text + ((directionText === "ltr") ? "\u200E" : "\u200F");
        return result
    }
    function fixupBidiTextNodesWorker(node) {
        var that = this;
        var nodeText = "";
        if (node) {
            if (node.nodeType === 3) {
                node.data = fixupBidiPunctuation(node.data)
            }
            else if ((node.nodeType === 1 || node.nodeType === 9) && node.childNodes) {
                var nodeTagName = node.tagName.toUpperCase();
                if (!(nodeTagName === "SCRIPT") && !(nodeTagName === "STYLE")) {
                    for (var i = 0; i < node.childNodes.length; i++) {
                        fixupBidiTextNodesWorker(node.childNodes[i])
                    }
                }
            }
        }
    }
    function fixupBidiTextNodes(htmlText, parser) {
        var result = htmlText;
        if (parser) {
            var descDom = parser.parseFromString(htmlText, "text/html");
            if (descDom.body) {
                fixupBidiTextNodesWorker(descDom.body);
                result = descDom.body.innerHTML
            }
        }
        return result
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        fixupBidiPunctuation: fixupBidiPunctuation, fixupBidiTextNodes: fixupBidiTextNodes
    })
})();
(function () {
    "use strict";
    function setLastUpdatedTime(lastUpdatedArray, lastUpdatedString) {
        if (Array.isArray(lastUpdatedArray)) {
            if (!PlatformJS.mainProcessManager.retailModeEnabled) {
                var mostRecentDateTime = Math.max.apply(Math, lastUpdatedArray);
                if (mostRecentDateTime > 0) {
                    var dateTime = new Date(mostRecentDateTime);
                    var market = Platform.Utilities.Globalization.getCurrentMarket();
                    var dateFormatting = Windows.Globalization.DateTimeFormatting;
                    var now = new Date;
                    var anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    var dateTimeFormat;
                    if (anchor > dateTime) {
                        dateTimeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.none, dateFormatting.MonthFormat.abbreviated, dateFormatting.DayFormat.default, dateFormatting.DayOfWeekFormat.default, dateFormatting.HourFormat.none, dateFormatting.MinuteFormat.none, dateFormatting.SecondFormat.none, [market])
                    }
                    else {
                        dateTimeFormat = new dateFormatting.DateTimeFormatter(dateFormatting.YearFormat.none, dateFormatting.MonthFormat.none, dateFormatting.DayFormat.none, dateFormatting.DayOfWeekFormat.none, dateFormatting.HourFormat.default, dateFormatting.MinuteFormat.default, dateFormatting.SecondFormat.none, [market])
                    }
                    lastUpdatedString = lastUpdatedString || PlatformJS.Services.resourceLoader.getString("/platform/offline_lastUpdated");
                    var innerHTML = ["<div id=\"platformLastUpdatedTime\"><span class=\"platformLastUpdatedLabel\">", lastUpdatedString.format(dateTimeFormat.format(dateTime)), "</span></div>"].join("");
                    CommonJS.Watermark.setWatermarkHtml(innerHTML)
                }
                else {
                    CommonJS.Watermark.setWatermarkHtml()
                }
            }
        }
    }
    function removeLastUpdatedTime() {
        CommonJS.Watermark.setWatermarkHtml()
    }
    function nowUtc() {
        var now = new Date;
        return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        setLastUpdatedTime: setLastUpdatedTime, removeLastUpdatedTime: removeLastUpdatedTime, nowUTC: nowUtc
    })
})();
(function () {
    "use strict";
    function addAboutPageFragment() {
        var aboutElement = document.getElementById("AboutPageDiv");
        if (!aboutElement) {
            aboutElement = document.createElement("div");
            aboutElement.id = "AboutPageDiv";
            document.body.appendChild(aboutElement)
        }
        var promise = new WinJS.Promise(function (complete) {
            WinJS.UI.Fragments.renderCopy("/html/aboutSettings.html", aboutElement).then(function (doc) {
                var version = Windows.ApplicationModel.Package.current.id.version;
                var aboutLabelText = PlatformJS.Services.resourceLoader.getString("About");
                var appName = PlatformJS.Services.resourceLoader.getString("AppTitle");
                var publisherName = PlatformJS.Services.resourceLoader.getString("MicrosoftCorp");
                var buildVersion = version.major + "." + version.minor + "." + version.build + "." + version.revision;
                var optionsBackbuttonclick = WinJS.Utilities.markSupportedForProcessing(WinJS.UI.SettingsFlyout.show);
                var dataContext = {
                    versionText: PlatformJS.Services.resourceLoader.getString("/platform/appVersion").format(buildVersion), aboutLabelText: aboutLabelText, appName: appName, publisherName: publisherName, optionsBackbuttonclick: optionsBackbuttonclick, helpText: CommonJS.resourceLoader.getString("/platform/HelpLabel"), onHelpClick: WinJS.Utilities.markSupportedForProcessing(CommonJS.Settings.onHelpCmdFromSettingsCharm), creditsText: CommonJS.resourceLoader.getString("/platform/creditsLink"), onCreditsClick: WinJS.Utilities.markSupportedForProcessing(CommonJS.Settings.onCreditsLinkFromSettingsCharm)
                };
                WinJS.UI.processAll(aboutElement).then();
                WinJS.Binding.processAll(aboutElement, dataContext);
                complete(PlatformJS.Utilities.getControl("AboutPage"))
            }, function (error) {
                complete(null)
            })
        });
        return promise
    }
    function removeAboutPageFragment() {
        var aboutElement = document.getElementById("AboutPageDiv");
        if (aboutElement) {
            document.body.removeChild(aboutElement)
        }
    }
    function stripHTML(string) {
        if (string) {
            return string.replace(/<(?:.|\n)*?>/gm, "")
        }
        else {
            return null
        }
    }
    function removeSearchBox() {
        var todayPage = document.getElementById("todayPage");
        if (todayPage) {
            var searchBox = todayPage.getElementsByClassName("cux-searchtextbox");
            if (searchBox && searchBox.length > 0) {
                searchBox = searchBox[0];
                if (searchBox) {
                    if (searchBox.winControl) {
                        var searchBoxControl = searchBox.winControl;
                        if (searchBoxControl && searchBoxControl.dispose) {
                            searchBoxControl.dispose()
                        }
                    }
                    var searchBoxParent = searchBox.parentNode;
                    if (searchBoxParent) {
                        searchBoxParent.removeChild(searchBox)
                    }
                }
            }
        }
    }
    function loadStylesheets(cssUris) {
        var fragment = document.createDocumentFragment();
        for (var i = 0, len = cssUris.length; i < len; i++) {
            var cssUri = cssUris[i];
            var link = document.createElement("link");
            link.setAttribute("href", cssUri);
            link.setAttribute("rel", "stylesheet");
            fragment.appendChild(link)
        }
        var head = document.getElementsByTagName("HEAD")[0];
        head.appendChild(fragment)
    }
    function loadDeferredStylesheets() {
        if (!NewsJS.Utilities.hasLoadedDeferredStyleSheets) {
            loadStylesheets(["/common/css/common-deferred.css", "/css/default-deferred.css", "/css/today-deferred.css"]);
            NewsJS.Utilities.hasLoadedDeferredStyleSheets = true
        }
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        addAboutPageFragment: addAboutPageFragment, removeAboutPageFragment: removeAboutPageFragment, stripHTML: stripHTML, removeSearchBox: removeSearchBox, loadStylesheets: loadStylesheets, loadDeferredStylesheets: loadDeferredStylesheets, hasLoadedDeferredStyleSheets: false
    })
})();
(function () {
    "use strict";
    function isBadHttpStatusCode(error) {
        return PlatformJS.Utilities.getPlatformErrorCode(error) === 103
    }
    function cancelPromise(promise) {
        if (promise && promise.cancel && typeof promise.cancel === "function") {
            promise.cancel()
        }
    }
    function isFREOffline(error) {
        if (Array.isArray(error)) {
            for (var i = 0; i < error.length; i++) {
                if (isFREOffline(error[i])) {
                    return true
                }
            }
            return false
        }
        else {
            return (error && error.message.indexOf("FREOffline") === 0)
        }
    }
    function isDataMissing(error) {
        return (error && error.message.indexOf("DataError:ExpectedDataMissing") === 0)
    }
    function isCancellationError(error) {
        return (error && (error.name === "Error" || error.name === "Canceled") && error.message && error.message === "Canceled")
    }
    function isRetryableNetworkError(error) {
        var errorCode = PlatformJS.Utilities.getPlatformErrorCode(error);
        return errorCode === 101 || errorCode === 102
    }
    function isSyntaxError(error) {
        return (error && (error.name === "SyntaxError") && error.message && error.message === "SyntaxError")
    }
    function showErrorMessage(message, targetChannel) {
        var sNavButtonText = "";
        switch (targetChannel) {
            case "MySources":
                sNavButtonText = PlatformJS.Services.resourceLoader.getString("AllSources");
                break;
            case "MyTopics":
                sNavButtonText = "";
                break;
            default:
                sNavButtonText = PlatformJS.Services.resourceLoader.getString("Unfollow");
                break
        }
        var messageBar = new CommonJS.MessageBar(message);
        if (!sNavButtonText === "") {
            messageBar.addButton(sNavButtonText, function () {
                PlatformJS.Navigation.navigateToChannel(targetChannel, { showActionEdgy: true })
            })
        }
        messageBar.addButton(PlatformJS.Services.resourceLoader.getString("Dismiss"), function () {
            messageBar.hide()
        });
        messageBar.show()
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        isBadHttpStatusCode: isBadHttpStatusCode, cancelPromise: cancelPromise, isDataMissing: isDataMissing, isFREOffline: isFREOffline, isCancellationError: isCancellationError, isRetryableNetworkError: isRetryableNetworkError, isSyntaxError: isSyntaxError, showErrorMessage: showErrorMessage
    })
})();
(function () {
    "use strict";
    function getAnchorMapping(mappingText) {
        var fallBackAnchor = "anchorLeft";
        if (mappingText === "Top") {
            return "anchorTop"
        }
        else if (mappingText === "Left") {
            return "anchorLeft"
        }
        else if (mappingText === "Bottom") {
            return "anchorBottom"
        }
        else if (mappingText === "Right") {
            return "anchorRight"
        }
        else if (mappingText === "Middle") {
            return "anchorMiddle"
        }
        else {
            return fallBackAnchor
        }
    }
    function appServerDomain() {
        var domain = PlatformJS.Services.appConfig.getString("AppServerDomain");
        return domain || "appex.bing.com"
    }
    function defaultProviderId() {
        var defaultProviderId = PlatformJS.BootCache.instance.getEntry("DefaultProviderId", function () {
            return PlatformJS.Services.appConfig.getString("DefaultProviderId") || "AAPDEK"
        });
        return defaultProviderId
    }
    function renderServiceDomain() {
        var domain = PlatformJS.Services.appConfig.getString("RenderServiceDomain");
        return domain || "rendering.services.appex.bing.com"
    }
    function getRawArticleUrl(url, path, paramName) {
        var rawUrl = url;
        if (url && url.length > 0) {
            var uri = Windows.Foundation.Uri(url);
            if (uri.path && uri.path.toLowerCase() === path && paramName && paramName.length > 0) {
                var query = uri.query;
                if (query && query.length > 0 && query[0] === "?") {
                    var queryTextValue = query.substring(1);
                    var vars = queryTextValue.split("&");
                    for (var i = 0; i < vars.length; i++) {
                        var pair = vars[i].split("=");
                        if (pair && pair.length === 2 && pair[0].toLowerCase() === paramName) {
                            rawUrl = pair[1];
                            break
                        }
                    }
                }
            }
        }
        return decodeURIComponent(rawUrl)
    }
    function isPrefetchEnabled() {
        return NewsJS && NewsJS.PrefetchManager && NewsJS.PrefetchManager.isPrefetchEnabled
    }
    function _prefetchToggled(evt) {
        if (NewsJS && NewsJS.PrefetchManager) {
            NewsJS.PrefetchManager.prefetchToggled(evt)
        }
    }
    function appendList(list, listToAppend) {
        var index = 0;
        var length = listToAppend.length;
        for (index = 0; index < length; index++) {
            list.push(listToAppend[index])
        }
    }
    function clone(object) {
        if (object) {
            return JSON.parse(JSON.stringify(object))
        }
        return null
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        getAnchorMapping: getAnchorMapping, appServerDomain: appServerDomain, defaultProviderId: defaultProviderId, renderServiceDomain: renderServiceDomain, getRawArticleUrl: getRawArticleUrl, isPrefetchEnabled: isPrefetchEnabled, appendList: appendList, clone: clone, isPartnerApp: {
            get: function get() {
                var appConfig = PlatformJS.Services.configuration.getString("AppConfig");
                return appConfig && (appConfig === "NYT" || appConfig === "WSJ")
            }
        }, prefetchToggled: {
            get: function get() {
                _prefetchToggled.supportedForProcessing = true;
                return _prefetchToggled
            }
        }, prefetchLabelOff: {
            get: function get() {
                return PlatformJS.Services.resourceLoader.getString("PrefetchLabelOff")
            }
        }, prefetchLabelOn: {
            get: function get() {
                return PlatformJS.Services.resourceLoader.getString("PrefetchLabelOn")
            }
        }, isPrefetchUserEnabled: {
            get: function get() {
                return NewsJS && NewsJS.PrefetchManager && NewsJS.PrefetchManager.isPrefetchUserEnabled
            }
        }, isPrefetchCloudEnabled: {
            get: function get() {
                return PlatformJS.Services.manifest.prefetchingEnabled && NewsJS && NewsJS.PrefetchManager && NewsJS.PrefetchManager.isPrefetchCloudEnabled
            }
        }, offlineSyncConverter: WinJS.Binding.converter(function (val) {
            return val ? "block" : "none"
        })
    });
    function isNull(paramToCheck) {
        return (paramToCheck === undefined || paramToCheck === null)
    }
    function isEmpty(paramToCheck) {
        return (isNull(paramToCheck.length) || paramToCheck.length < 1)
    }
    function isNullOrEmpty(paramToCheck) {
        return (isNull(paramToCheck) || isEmpty(paramToCheck))
    }
    function throwIfNull(paramToCheck, message) {
        if (isNull(paramToCheck)) {
            throw new Error(message);
        }
    }
    function throwIfEmpty(paramToCheck, message) {
        if (isEmpty(paramToCheck)) {
            throw new Error(message);
        }
    }
    function throwIfNullOrEmpty(paramToCheck, message) {
        if (isNullOrEmpty(paramToCheck)) {
            throw new Error(message);
        }
    }
    function checkValueExists(value, source) {
        return !isNullOrEmpty(value) && !isNullOrEmpty(source) && source.indexOf(value) > -1
    }
    function areStringsEqual(value1, value2) {
        return _areStringsEqual(value1, value2, false)
    }
    function areStringsEqualCaseInsensitive(value1, value2) {
        return _areStringsEqual(value1, value2, true)
    }
    function _areStringsEqual(value1, value2, caseInsensitive) {
        var firstValNull = isNull(value1),
            secondValNull = isNull(value2);
        if (firstValNull && secondValNull) {
            return true
        }
        else if (firstValNull || secondValNull) {
            return false
        }
        if (caseInsensitive) {
            value1 = value1.toUpperCase();
            value2 = value2.toUpperCase()
        }
        return value1 === value2
    }
    WinJS.Namespace.defineWithParent(NewsJS.Utilities, "ParamChecks", {
        isNull: isNull, isEmpty: isEmpty, isNullOrEmpty: isNullOrEmpty, throwIfNull: throwIfNull, throwIfEmpty: throwIfEmpty, throwIfNullOrEmpty: throwIfNullOrEmpty, checkValueExists: checkValueExists, areStringsEqual: areStringsEqual, areStringsEqualCaseInsensitive: areStringsEqualCaseInsensitive
    });
    var _isOnline = null;
    function _connectionChange() {
        _isOnline = PlatformJS.Utilities.hasInternetConnection()
    }
    function _hasInternetConnection() {
        if (_isOnline === null) {
            if (PlatformJS.isPlatformInitialized) {
                Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", _connectionChange)
            }
            else {
                NewsApp.PageEvents.register("clrInitialized", function onClrInit() {
                    Platform.Networking.NetworkManager.addEventListener("networkstatuschanged", _connectionChange);
                    _connectionChange()
                })
            }
            _connectionChange()
        }
        return _isOnline
    }
    WinJS.Namespace.defineWithParent(NewsJS.Utilities, "CachedNetworkChecks", { hasInternetConnection: _hasInternetConnection })
})();
(function () {
    "use strict";
    function navigateToSource(source, updateStateFunction, entrypoint, market) {
        var navigation = navigationInfoForSource(source, entrypoint, market);
        if (navigation) {
            updateStateFunction(source);
            if (navigation.state && navigation.state.dynamicInfo) {
                navigation.state.dynamicInfo.entrypoint = entrypoint
            }
            WinJS.Navigation.navigate(navigation.pageInfo, navigation.state)
        }
    }
    function buildStateForPartnerSource(source) {
        var state = {
            dynamicInfo: {
                isFeaturedSource: true, dataProviderOptions: { useByline: true }
            }
        };
        state.dynamicInfo.channelID = source.id;
        state.dynamicInfo.adUnitId = source.adunitid;
        state.dynamicInfo.id = source.id;
        state.dynamicInfo.instrumentationId = source.instrumentationid;
        if (source.id && NewsJS.Utilities.ParamChecks.isNullOrEmpty(state.dynamicInfo.panoClass)) {
            state.dynamicInfo.panoClass = PlatformJS.Navigation.ChannelManager.getPanoClass(source.id)
        }
        if (source.displayname) {
            state.dynamicInfo.panoTitle = source.displayname
        }
        if (source.feedmarket) {
            state.dynamicInfo.feedMarket = source.feedmarket
        }
        if (source.featuredurl) {
            state.dynamicInfo.feedName = source.featuredurl
        }
        if (source.css) {
            state.dynamicInfo.css = source.css
        }
        if (source.backbuttontype) {
            state.dynamicInfo.backbuttontype = source.backbuttontype
        }
        if (source.themetype === 0) {
            state.dynamicInfo.theme = "dynamicPanoBoxedTheme"
        }
        if (source.headerlogo) {
            state.dynamicInfo.logoUrl = source.headerlogo
        }
        if (source.headerlogosnapped) {
            state.dynamicInfo.snapLogoUrl = source.headerlogosnapped
        }
        if (source.cluster) {
            state.dynamicInfo.clusterToRender = source.cluster;
            state.dynamicInfo.clusterID = source.cluster
        }
        if (source.providerId) {
            state.dynamicInfo.providerId = source.providerId
        }
        return state
    }
    function navigationInfoForPartnerSource(source, entrypoint, sourceMarket, clusterToRender) {
        if (source.channelid && !source.featuredurl) {
            return PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(source.channelid, "featured")
        }
        var state = buildStateForPartnerSource(source);
        state.dynamicInfo.entrypoint = entrypoint;
        state.dynamicInfo.market = sourceMarket;
        if (clusterToRender) {
            state.dynamicInfo.clusterToRender = clusterToRender;
            state.dynamicInfo.clusterID = clusterToRender
        }
        return {
            pageInfo: {
                channelId: state.dynamicInfo.id, fragment: "/dynamicPano/dynamicPano.html", page: "DynamicPano.DynamicPanoPage"
            }, state: state
        }
    }
    function navigationInfoForSource(source, entrypoint, market) {
        var isFeatured = false;
        var isRss = false;
        var navigation = null;
        var channelInfo = null;
        var state = null;
        if (source && source.featured) {
            isFeatured = true
        }
        else {
            if (source && source.rss_urls && !source.rss_names) {
                source.rss_names = source.displayname
            }
            if (source && source.rss_urls && source.rss_names) {
                var feedNamesArray = source.feedNamesArray ? source.feedNamesArray : source.rss_names.split(',');
                var feedUrlsArray = source.feedUrlsArray ? source.feedUrlsArray : source.rss_urls.split(',');
                if (feedNamesArray.length === feedUrlsArray.length || source.isCustomRSS) {
                    isRss = true
                }
                else {
                    source.rss_urls = source.rss_names = source.feedNamesArray = source.feedUrlsArray = null
                }
            }
        }
        if (isFeatured) {
            if (source.channel_id && source.channel_id !== "") {
                channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(source.channel_id, "featured");
                if (!channelInfo) {
                    channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(source.id, "featured")
                }
                if (!channelInfo) {
                    channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(source.channel_id)
                }
                if (channelInfo) {
                    navigation = channelInfo
                }
            }
            else if (source.displayname && source.featured_url) {
                var panoClass = PlatformJS.Navigation.ChannelManager.getPanoClass(source.id);
                var dynamicInfo = {
                    panoTitle: source.displayname, feedName: source.featured_url, dataProviderOptions: { useByline: true }, isFeaturedSource: true, id: source.id, panoClass: panoClass
                };
                if (source.feedmarket) {
                    dynamicInfo.feedMarket = source.feedmarket
                }
                if (entrypoint) {
                    dynamicInfo.entrypoint = entrypoint
                }
                if (source.partner_header_logo) {
                    dynamicInfo.logoUrl = source.partner_header_logo;
                    if (source.partner_header_logo_snap) {
                        dynamicInfo.snapLogoUrl = source.partner_header_logo_snap
                    }
                }
                if (source.theme) {
                    dynamicInfo.theme = source.theme
                }
                if (source.css) {
                    dynamicInfo.css = source.css
                }
                if (source.ad_unit_id) {
                    dynamicInfo.adUnitId = source.ad_unit_id
                }
                else {
                    dynamicInfo.adLayoutOverrideKey = "noad"
                }
                if (source.instrumentation_id) {
                    dynamicInfo.instrumentationId = source.instrumentation_id
                }
                if (source.backbuttontype) {
                    dynamicInfo.backbuttontype = source.backbuttontype
                }
                if (market) {
                    dynamicInfo.market = market
                }
                if (source.providerId) {
                    dynamicInfo.providerId = source.providerId
                }
                else {
                    var defaultProviderIdFromConfig = NewsJS.Utilities.defaultProviderId();
                    dynamicInfo.providerId = defaultProviderIdFromConfig
                }
                state = { dynamicInfo: dynamicInfo };
                if (source.messagedata) {
                    var srcData = source.messagedata;
                    dynamicInfo.messageData = {
                        title: srcData.title, message: srcData.message, okButtonLabel: srcData.okbuttonlabel, cancelButtonLabel: srcData.cancelbuttonlabel
                    }
                }
                navigation = {
                    pageInfo: {
                        channelId: dynamicInfo.id, fragment: "/dynamicPano/dynamicPano.html", page: "DynamicPano.DynamicPanoPage"
                    }, state: state
                }
            }
        }
        else if (isRss) {
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("RSSSourcePage");
            if (channelInfo) {
                state = {
                    entity: source, dynamicInfo: { adLayoutOverrideKey: "noad" }
                };
                if (market) {
                    state.market = market
                }
                navigation = {
                    pageInfo: channelInfo.pageInfo, state: state
                }
            }
        }
        else {
            if (source.ad_unit_id === "") {
                state = {
                    entity: source, dynamicInfo: { adLayoutOverrideKey: "noad" }
                }
            }
            else {
                state = { entity: source }
            }
            if (market) {
                state.market = market
            }
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SourceNavPage");
            if (channelInfo) {
                navigation = {
                    pageInfo: channelInfo.pageInfo, state: state
                }
            }
        }
        return navigation
    }
    function navigateToSearchPano(query, searchAll) {
        function getType(literal) {
            var node = window;
            var segments = literal.split(".");
            for (var i = 0, ilen = segments.length; i < ilen; i++) {
                node = node[segments[i]];
                if (!node) {
                    return null
                }
            }
            return node
        }
        var querySubmittedText = NewsJS.Utilities.trimString(query);
        if (querySubmittedText && querySubmittedText.length > 0) {
            var targetState = {
                queryText: querySubmittedText, searchOrigin: NewsJS.Telemetry.Search.Origin.inAppSearchQuery, searchAll: searchAll
            };
            var targetPageInfo = {
                fragment: "/html/search.html", page: "NewsJS.Search"
            };
            var navigate = true;
            var current = WinJS.Navigation.history.current;
            var loc = current.location;
            var currentState = current.state;
            if (loc && loc.fragment === targetPageInfo.fragment && loc.page === targetPageInfo.page) {
                var pageType = getType(targetPageInfo.page);
                if (pageType && pageType.areStateEqual) {
                    navigate = !pageType.areStateEqual(currentState, targetState)
                }
            }
            if (navigate) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.inAppSearchQuery);
                WinJS.Navigation.navigate(targetPageInfo, targetState)
            }
        }
    }
    function navigateToCategory(categoryName, categoryKey) {
        WinJS.Navigation.navigate({
            fragment: "/html/categoryPage.html", page: "NewsJS.CategoryPage"
        }, {
            categoryKey: categoryKey, title: categoryName, categoryName: PlatformJS.Services.resourceLoader.getString("EditorPickHeader")
        })
    }
    function navigateToInternationalEdition(market) {
        WinJS.Navigation.navigate({
            fragment: "/Customization/SelectionPage.html", page: "NewsJS.SelectionPage"
        }, { sourcesMarket: market })
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        buildStateForPartnerSource: buildStateForPartnerSource, navigateToSource: navigateToSource, navigationInfoForPartnerSource: navigationInfoForPartnerSource, navigationInfoForSource: navigationInfoForSource, navigateToSearchPano: navigateToSearchPano, navigateToCategory: navigateToCategory, navigateToInternationalEdition: navigateToInternationalEdition
    })
})();
(function () {
    "use strict";
    function syndicationFeedAsNewsSource(url, feed) {
        var feedUrlsArray = url ? url.split(",") : null;
        return {
            categoryKey: "sourcesContent", data: {
                ad_unit_id: "", alpha: feed && feed.title ? feed.title.text : "", channel_id: "", displayname: feed && feed.title ? feed.title.text : "", featured_category: "", featured_url: "", freq: null, id: url, feedUrlsArray: feedUrlsArray, instrumentation_id: "", newscategory: "RSS", partner_header_logo: "", partner_header_logo_snap: "", rss_names: feed && feed.title ? feed.title.text : "", rss_urls: url, sourcedescription: "", tileType: "Customize", title: feed && feed.title ? feed.title.text : "", win8_image: "/images/rss_icon_1.png"
            }, moduleInfo: { renderer: null }, template: "sourceItemTemplate"
        }
    }
    function uriAsSyndicationFeedAsync(uri) {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            var url = (uri) ? uri.absoluteUri : null;
            if (url) {
                var qs = new Platform.QueryService("RSSFeed");
                var options = new Platform.DataServices.QueryServiceOptions;
                options.useExtendedEncoding = true;
                var urlParams = PlatformJS.Collections.createStringDictionary();
                urlParams.insert("url", url);
                qs.downloadDataAsync(urlParams, null, null, options).then(function xhrComplete(result) {
                    var syndicationFeed = new Windows.Web.Syndication.SyndicationFeed;
                    try {
                        syndicationFeed.load(result.dataString)
                    }
                    catch (e) {
                        errorCallback(e.message)
                    }
                    completeCallback(syndicationFeed)
                }, function xhrError(error) {
                    errorCallback(error.message || error.statusText || "XHR ERROR")
                })
            }
            else {
                errorCallback("malformed uri")
            }
        })
    }
    function urlAsSyndicationFeedAsync(url) {
        return new WinJS.Promise(function (completeCallback, errorCallback) {
            var uri = NewsJS.Utilities.stringAsUri(url);
            if (uriLooksValid(uri)) {
                uriAsSyndicationFeedAsync(uri).done(function uriAsSyndicationFeedAsyncComplete(syndicationFeed) {
                    completeCallback(syndicationFeed)
                }, function uriAsSyndicationFeedAsyncError(error) {
                    errorCallback(error)
                })
            }
            else {
                errorCallback("Invalid URI")
            }
        })
    }
    function uriLooksValid(uri) {
        return (uri && uri.domain && uri.schemeName === "http" && !uri.suspicious) ? true : false
    }
    WinJS.Namespace.define("NewsJS.Utilities.RSS", {
        syndicationFeedAsNewsSource: syndicationFeedAsNewsSource, uriAsSyndicationFeedAsync: uriAsSyndicationFeedAsync, urlAsSyndicationFeedAsync: urlAsSyndicationFeedAsync, uriLooksValid: uriLooksValid
    })
})();
(function () {
    "use strict";
    function fetchFeaturedSourcesData(market, jsonfile) {
        jsonfile = jsonfile || "partner.js";
        if (NewsJS.Utilities.ParamChecks.isNullOrEmpty(market)) {
            return WinJS.Promise.wrap({})
        }
        if (NewsJS.Utilities.ParamChecks.isNull(PlatformJS) || NewsJS.Utilities.ParamChecks.isNull(PlatformJS.DataService) || NewsJS.Utilities.ParamChecks.isNull(PlatformJS.DataService.QueryService)) {
            return WinJS.Promise.wrap({})
        }
        var infoQueryService = new PlatformJS.DataService.QueryService("FeaturedSourcesDataSource");
        var infoParams = PlatformJS.Collections.createStringDictionary();
        infoParams.insert("jsonfile", jsonfile);
        infoParams.insert("market", market.toLowerCase());
        if (Platform.Configuration.ConfigurationManager.partnerDataFeedUrl.length) {
            infoQueryService = new PlatformJS.DataService.QueryService("FeaturesConfigurationFullUrlDataSource");
            infoParams.insert("url", Platform.Configuration.ConfigurationManager.partnerDataFeedUrl)
        }
        if (PlatformJS.isDebug && NewsJS.StateHandler && NewsJS.StateHandler.instance && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
            infoParams["previewparams"] = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
        }
        else {
            infoParams["previewparams"] = ""
        }
        var options = new Platform.DataServices.QueryServiceOptions;
        options.bypassCache = false;
        return infoQueryService.downloadDataAsync(infoParams, null, null, options).then(function convertFeaturedSourcesArrayToObject(data) {
            var response = data && data.dataString ? JSON.parse(data.dataString) : null;
            if (response && response.sources && Array.isArray(response.sources)) {
                var array = response.sources;
                var featuredSources = {};
                for (var idx = 0; idx < array.length; idx++) {
                    featuredSources[array[idx].id] = array[idx];
                    featuredSources[array[idx].id].market = array[idx].market || market.toLowerCase()
                }
                return featuredSources
            }
            else {
                return {}
            }
        }, function error(err) {
            return {}
        })
    }
    function readSources(market, force) {
        if (!NewsJS.StateHandler.instance.allSources || force) {
            return _readSources(market).then(function (allSources) {
                NewsJS.StateHandler.instance.allSources = allSources;
                return allSources
            })
        }
        else {
            return WinJS.Promise.wrap(NewsJS.StateHandler.instance.allSources)
        }
    }
    function _readSources(market) {
        var editorialMarketString = NewsJS.Globalization.getMarketStringForEditorial();
        var localMarket = { market: market || NewsJS.Globalization.getMarketStringForSources() };
        var isLocalMarketValid = localMarket.market && localMarket.market.length > 0;
        var worldWideMarketString = PlatformJS.BootCache.instance.getEntry("WorldWideMarket", function () {
            return PlatformJS.Services.appConfig.getString("WorldWideMarket")
        });
        var worldWideMarket = { market: worldWideMarketString };
        var useEditorialMarket = localMarket.market === NewsJS.Globalization.getMarketStringForSources();
        var sourcesProviders = [];
        var sourcesConfigworldWideMarketString = PlatformJS.BootCache.instance.getEntry("SourcesConfigworldWideMarketString", function () {
            return PlatformJS.Services.appConfig.getDictionary("SourcesConfig").getBool("MergeFeaturedSourcesDataSource")
        });
        var mergeFeaturedSources = isLocalMarketValid && (!useEditorialMarket || (localMarket.market.toLowerCase() === editorialMarketString.toLowerCase())) && sourcesConfigworldWideMarketString;
        var isRowTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROWTopEdgyFeatureEnabled", function () {
            return Platform.Utilities.Globalization.isFeatureEnabled("ROWTopEdgy")
        });
        var isRowEnwwTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROW_ENWW_TopEdgyFeatureEnabled", function () {
            return Platform.Utilities.Globalization.isFeatureEnabled("ROW_ENWW_TopEdgy")
        });
        if (!market && isRowTopEdgyEnabled) {
            if (isLocalMarketValid) {
                sourcesProviders.push(new NewsJS.SourcesGalleryProvider(localMarket))
            }
            sourcesProviders.push(new NewsJS.SourcesGalleryProvider(worldWideMarket))
        }
        else if (!market && isRowEnwwTopEdgyEnabled) {
            sourcesProviders.push(new NewsJS.SourcesGalleryProvider(worldWideMarket))
        }
        else {
            if (isLocalMarketValid) {
                sourcesProviders.push(new NewsJS.SourcesGalleryProvider(localMarket))
            }
        }
        var promises = [];
        if (mergeFeaturedSources) {
            promises.push(fetchFeaturedSourcesData(useEditorialMarket ? editorialMarketString : localMarket.market))
        }
        for (var sourceIdx = 0; sourceIdx < sourcesProviders.length; sourceIdx++) {
            promises.push(sourcesProviders[sourceIdx].fetchData())
        }
        var featuredSources = null;
        return WinJS.Promise.join(promises).then(function (e) {
            var allSources = [];
            var sourcesResultsIndex = 0;
            if (mergeFeaturedSources) {
                featuredSources = e[0];
                sourcesResultsIndex = 1
            }
            for (var i = sourcesResultsIndex; i < e.length; i++) {
                var sourceProvider = e[i];
                if (sourceProvider && sourceProvider.dataResponse && sourceProvider.dataResponse.Topics) {
                    for (var j = 0; j < sourceProvider.dataResponse.Topics.length; j++) {
                        allSources.push(NewsJS.Utilities.createSourceData(sourceProvider, sourceProvider.dataResponse.Topics[j], null, null, featuredSources))
                    }
                }
            }
            return allSources
        }, function (err) {
            return null
        })
    }
    function readUserSources(options) {
        return WinJS.Promise.wrap(NewsJS.StateHandler.instance.getSources())
    }
    function showFollowSourcesExceededError() {
        var message = PlatformJS.Services.resourceLoader.getString("SourcesExceeded");
        NewsJS.Utilities.showErrorMessage(message, "MySources")
    }
    function isSourceFollowed(source, options) {
        var index = -1;
        var followedSources = NewsJS.StateHandler.instance.getSources();
        for (var i = 0; i < followedSources.length; i++) {
            var followedSource = followedSources[i];
            if (NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(followedSource.id, source.id)) {
                index = i;
                break
            }
        }
        return index >= 0
    }
    function saveSourcesAsync(sources, options) {
        if (sources) {
            NewsJS.StateHandler.instance.updateSources(sources)
        }
        return true
    }
    function _addSource(source, index) {
        NewsJS.StateHandler.instance.addSource(index || -1, source);
        return true
    }
    function _removeSource(source, options) {
        var index = -1;
        var followedSources = NewsJS.StateHandler.instance.getSources();
        for (var i = 0; i < followedSources.length; i++) {
            var followedSource = followedSources[i];
            if (NewsJS.Utilities.ParamChecks.areStringsEqualCaseInsensitive(followedSource.id, source.id)) {
                index = i;
                break
            }
        }
        if (index >= 0) {
            NewsJS.StateHandler.instance.removeSource(index)
        }
        return WinJS.Promise.wrap(null)
    }
    function updateSources(addSources, removeSources, options, ignoreToast) {
        if (removeSources && removeSources.length > 0) {
            for (var removeSourcesIndex = 0; removeSourcesIndex < removeSources.length; removeSourcesIndex++) {
                var src = removeSources[removeSourcesIndex];
                _removeSource(src)
            }
        }
        if (addSources && addSources.length > 0) {
            for (var addSourcesIndex = 0; addSourcesIndex < addSources.length; addSourcesIndex++) {
                var src = addSources[addSourcesIndex];
                _addSource(src)
            }
        }
        return WinJS.Promise.wrap(null)
    }
    function followSources(sources, options, ignoreToast) {
        var success;
        var msg;
        if (sources && sources.length > 0) {
            var followedSources = NewsJS.StateHandler.instance.getSources();
            if (followedSources && followedSources.length + sources.length > PlatformJS.Services.appConfig.getDictionary("SourcesConfig").getInt32("maxFollows")) {
                msg = PlatformJS.Services.resourceLoader.getString("MaxSourcesReached").format(followedSources.length, PlatformJS.Services.appConfig.getDictionary("SourcesConfig").getInt32("maxFollows"));
                success = false;
                showFollowSourcesExceededError()
            }
            else {
                var numNewSources = sources.length;
                if (sources && sources.length > 0) {
                    NewsJS.StateHandler.instance.appendSources(sources)
                }
                success = true;
                if (numNewSources > 1) {
                    msg = PlatformJS.Services.resourceLoader.getString("NowFollowingSources").format(numNewSources)
                }
                else if (numNewSources === 1) {
                    msg = PlatformJS.Services.resourceLoader.getString("NowFollowingSource").format(sources[0].displayname)
                }
                else {
                    success = false
                }
                if (success) {
                    if (msg && !ignoreToast) {
                        NewsJS.Utilities.showToast(msg)
                    }
                }
            }
        }
        return success
    }
    function unfollowSources(sources, options, ignoreToast) {
        var success;
        var promises = [];
        if (sources && sources.length > 0) {
            for (var i = 0; i < sources.length; i++) {
                promises.push(_removeSource(sources[i], options))
            }
            var msg;
            if (sources.length > 1) {
                msg = PlatformJS.Services.resourceLoader.getString("NowUnfollowingSources").format(sources.length)
            }
            else {
                msg = PlatformJS.Services.resourceLoader.getString("NowUnfollowingSource").format(sources[0].displayname)
            }
            success = true;
            if (!ignoreToast) {
                NewsJS.Utilities.showToast(msg)
            }
        }
        return WinJS.Promise.join(promises)
    }
    function updateStateOnSourceVisited(sourceId, market) { }
    function readFeaturedSources(market) {
        return readSources(market, false).then(function (allSources) {
            var featuredSources = [];
            for (var sourceIndex in allSources) {
                var source = allSources[sourceIndex];
                if (source.featured && !source.is_not_featured) {
                    featuredSources.push(source)
                }
            }
            return featuredSources
        }, function (err) {
            return []
        })
    }
    function createSourceData(provider, entity, recentSources, createFeaturedSourcesCluster, featuredSources) {
        var fullImageUrl = "";
        var win8Image = entity[provider.columnMap["win8_image"]];
        if (provider && provider.dataResponse && provider.dataResponse.Image && provider.dataResponse.Image.Path && win8Image) {
            fullImageUrl = provider.dataResponse.Image.Path.replace("{0}", win8Image)
        }
        var result = {
            freq: recentSources ? recentSources[entity[provider.columnMap["rb_hash"]]] : null, alpha: entity[provider.columnMap["alphaorder"]], displayname: entity[provider.columnMap["displayname"]], win8_image: fullImageUrl, id: entity[provider.columnMap["rb_hash"]], title: entity[provider.columnMap["topicname"]], sourcedescription: entity[provider.columnMap["sourcedescription"]], rss_names: entity[provider.columnMap["rss_names"]], rss_urls: entity[provider.columnMap["rss_urls"]], newscategory: entity[provider.columnMap["newscategory"]], is_not_featured: entity[provider.columnMap["is_not_featured"]] === "yes" ? true : false
        };
        if (featuredSources && featuredSources[result.id]) {
            var featuredSource = featuredSources[result.id];
            result.featured_category = featuredSource.featuredcategory;
            result.featured_url = featuredSource.featuredurl;
            if (featuredSource.feedmarket) {
                result.feedmarket = featuredSource.feedmarket
            }
            result.providerId = featuredSource.providerid || NewsJS.Utilities.defaultProviderId();
            result.channel_id = featuredSource.featuredurl ? null : featuredSource.channelid;
            result.ad_unit_id = featuredSource.adunitid;
            result.instrumentation_id = featuredSource.instrumentationid;
            result.partner_header_logo = featuredSource.headerlogo;
            result.partner_header_logo_snap = featuredSource.headerlogosnapped;
            if (featuredSource.themetype === 0) {
                result.theme = "dynamicPanoBoxedTheme"
            }
            else {
                result.theme = "dynamicPanoUnboxedTheme"
            }
            result.backbuttontype = featuredSource.backbuttontype;
            result.css = featuredSource.css;
            result.market = featuredSource.market;
            result.messagedata = featuredSource.messagedata
        }
        else {
            result.featured_category = entity[provider.columnMap["featured_category"]];
            result.featured_url = entity[provider.columnMap["featured_url"]];
            result.channel_id = entity[provider.columnMap["channel_id"]];
            result.ad_unit_id = entity[provider.columnMap["ad_unit_id"]];
            result.instrumentation_id = entity[provider.columnMap["instrumentation_id"]];
            result.partner_header_logo = entity[provider.columnMap["partner_header_logo"]];
            result.partner_header_logo_snap = entity[provider.columnMap["partner_header_logo_snap"]];
            result.messagedata = entity[provider.columnMap["messagedata"]]
        }
        var featured = result.featured_url || result.channel_id;
        if (featured) {
            result.featured = true;
            if (!featuredSources) {
                result.theme = "dynamicPanoUnboxedTheme";
                if (provider && provider.dataResponse && provider.dataResponse.Image && provider.dataResponse.Image.Path && result.partner_header_logo) {
                    var fullImageHeaderUrl = provider.dataResponse.Image.Path.replace("{0}", result.partner_header_logo);
                    result.partner_header_logo = fullImageHeaderUrl;
                    if (result.partner_header_logo_snap) {
                        var fullImageSnapHeaderUrl = provider.dataResponse.Image.Path.replace("{0}", result.partner_header_logo_snap);
                        result.partner_header_logo_snap = fullImageSnapHeaderUrl
                    }
                }
            }
            if (createFeaturedSourcesCluster && result.newscategory !== null && !result.is_not_featured) {
                result.newscategory = result.newscategory + "," + PlatformJS.Services.resourceLoader.getString("Featured")
            }
            var categoryKeys = result.featured_category ? result.featured_category.split(",") : [];
            result.categoryKeys = {};
            if (categoryKeys) {
                categoryKeys.forEach(function (key) {
                    result.categoryKeys[key] = 1
                })
            }
        }
        return result
    }
    function _setAddSectionButtonState(followed, addSectionButton) {
        if (addSectionButton) {
            addSectionButton.extraClass = "appexSymbol";
            if (followed) {
                addSectionButton.label = PlatformJS.Services.resourceLoader.getString("RemoveSectionButton");
                addSectionButton.icon = "\uE018"
            }
            else {
                addSectionButton.label = PlatformJS.Services.resourceLoader.getString("AddSectionButton");
                addSectionButton.icon = "\uE017"
            }
            addSectionButton.tooltip = addSectionButton.label
        }
    }
    function _setupPinInternationBDButton(buttonElementId, telemetryId, para) {
        if (typeof (buttonElementId) === "undefined" || telemetryId === "" || para.title === "") {
            return
        }
        var pinButton = PlatformJS.Utilities.getControl(buttonElementId);
        if (pinButton) {
            WinJS.Utilities.removeClass(pinButton.element, "hiddenButton")
        }
        var title = para.title;
        return NewsJS.Utilities.Pinning._setupPinButton(buttonElementId, PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), PlatformJS.Services.resourceLoader.getString("NowPinningCategory"), PlatformJS.Services.resourceLoader.getString("NowUnpinningCategory"), "", "", title + "NewsJS.BingDaily" + "." + para.market.toUpperCase(), title, title, "NewsJS.BingDaily", {
            market: para.market, title: title
        }, null, "ms-appx:///images/logoCategory.png", null, null, null, null, telemetryId)
    }
    function _setupAddSectionButton(type, para) {
        var isRowTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROWTopEdgyFeatureEnabled", function () {
            return Platform.Utilities.Globalization.isFeatureEnabled("ROWTopEdgy")
        });
        var isRowEnwwTopEdgyEnabled = PlatformJS.BootCache.instance.getEntry("ROW_ENWW_TopEdgyFeatureEnabled", function () {
            return Platform.Utilities.Globalization.isFeatureEnabled("ROW_ENWW_TopEdgy")
        });
        if (isRowTopEdgyEnabled || isRowEnwwTopEdgyEnabled) {
            return
        }
        NewsApp.PersonalizationManager.getClusterDefinitions().then(function (userClusters) {
            var state = { clustersDefinition: userClusters };
            var addSectionButton = PlatformJS.Utilities.getControl("addSectionButton");
            if (addSectionButton) {
                WinJS.Utilities.removeClass(addSectionButton.element, "hiddenButton")
            }
            switch (type) {
                case NewsJS.Personalization.Utilities.sectionType.Category:
                    _setupCategoryAddSectionButton(para, state);
                    return;
                case NewsJS.Personalization.Utilities.sectionType.Topics:
                    _setupTopicAddSectionButton(para, state);
                    return;
                case NewsJS.Personalization.Utilities.sectionType.Sources:
                    _setupSourceAddSectionButton(para, state);
                    return;
                case NewsJS.Personalization.Utilities.sectionType.InternationalBingDaily:
                    _setupInternationalBDAddSectionButton(para, state);
                    return;
                default:
                    return
            }
        })
    }
    function _setupCategoryAddSectionButton(para, state) {
        var addSectionButton = PlatformJS.Utilities.getControl("addSectionButton");
        if (addSectionButton) {
            var clusterDefinition = para.clusterDefinition;
            if (clusterDefinition) {
                var market = (para.market || NewsJS.Globalization.getMarketString()).toUpperCase();
                var followed = NewsApp.PersonalizationManager.isCategoryFollowed(state, market, clusterDefinition.guid);
                _setAddSectionButtonState(followed, addSectionButton);
                addSectionButton.onclick = function (e) {
                    return _addSectionButtonOnClick(followed, market, clusterDefinition, NewsJS.Personalization.Utilities.sectionCategory.marketCluster)
                }
            }
        }
    }
    function _setupTopicAddSectionButton(para, state) {
        var addSectionButton = PlatformJS.Utilities.getControl("addSectionButton");
        if (addSectionButton) {
            var market = (para.market || NewsJS.Globalization.getMarketString()).toUpperCase();
            var followed = NewsApp.PersonalizationManager.isTopicFollowed(state, para.query, market);
            var clusterDefinition = NewsApp.PersonalizationManager.createTopicUserSection(para.title, para.query, market);
            if (clusterDefinition) {
                _setAddSectionButtonState(followed, addSectionButton);
                addSectionButton.onclick = function (e) {
                    return _addSectionButtonOnClick(followed, market, clusterDefinition, NewsJS.Personalization.Utilities.sectionCategory.Topic)
                }
            }
        }
    }
    function _setupSourceAddSectionButton(para, state) {
        var addSectionButton = PlatformJS.Utilities.getControl("addSectionButton");
        if (addSectionButton) {
            var market = (para.market || NewsJS.Globalization.getMarketString()).toUpperCase();
            var appMarket = (para.appMarket || NewsJS.Globalization.getMarketString()).toUpperCase();
            var followed = NewsApp.PersonalizationManager.isSourceFollowed(state, para.source.id, market, para.type);
            var clusterDefinition = NewsApp.PersonalizationManager.createSourceSection(para.type, market, para.source);
            if (clusterDefinition) {
                _setAddSectionButtonState(followed, addSectionButton);
                var category = para.source.isFeaturedSource ? NewsJS.Personalization.Utilities.sectionCategory.Featured : para.source.newscategory ? para.source.newscategory : NewsJS.Personalization.Utilities.sectionCategory.Source;
                addSectionButton.onclick = function (e) {
                    return _addSectionButtonOnClick(followed, appMarket, clusterDefinition, category)
                }
            }
        }
    }
    function _setupInternationalBDAddSectionButton(para, state) {
        var addSectionButton = PlatformJS.Utilities.getControl("addSectionButton");
        if (addSectionButton) {
            var market = (para.market || NewsJS.Globalization.getMarketString()).toUpperCase();
            var appMarket = (para.appMarket || NewsJS.Globalization.getMarketString()).toUpperCase();
            var followed = NewsApp.PersonalizationManager.isInternationalEditionFollowed(state, para.title, market);
            var clusterDefinition = NewsApp.PersonalizationManager.createInternationalEditionUserSection(para.title, market);
            if (clusterDefinition) {
                _setAddSectionButtonState(followed, addSectionButton);
                addSectionButton.onclick = function (e) {
                    return _addSectionButtonOnClick(followed, appMarket, clusterDefinition, NewsJS.Personalization.Utilities.sectionCategory.InternationalBingDaily)
                }
            }
        }
    }
    function _addSectionButtonOnClick(followed, market, clusterDefinition, category) {
        CommonJS.dismissAllEdgies();
        var displayName = clusterDefinition.title || "";
        var clustersToAddBack = followed ? [] : [clusterDefinition];
        var clustersToDelete = followed ? [clusterDefinition] : [];
        var msg;
        if (!followed) {
            msg = PlatformJS.Services.resourceLoader.getString("NowAddSection").format(displayName)
        }
        else {
            msg = PlatformJS.Services.resourceLoader.getString("NowRemoveSection").format(displayName)
        }
        NewsApp.PersonalizationManager.applyClusterAdditionsAndDeletions(market, clustersToDelete, clustersToAddBack).then(function () {
            NewsJS.Utilities.showToast(msg);
            var guid = clusterDefinition.guid;
            var telemetryId = followed ? "Remove as a section" : "Add as a section";
            NewsJS.Telemetry.Customization.recordAddRemoveAsASection(telemetryId, market, displayName, guid, category)
        })
    }
    function fetchSourcesInfo(market) {
        if (!market || !market.length || market.length < 1) {
            return WinJS.Promise.wrap(null)
        }
        return PlatformJS.platformInitializedPromise.then(function _fetchSourcesInfoWhenPlatformIsInitialized() {
            var infoQueryService = new PlatformJS.DataService.QueryService("MarketSourcesInfoCMS2");
            var infoParams = PlatformJS.Collections.createStringDictionary();
            infoParams.insert("market", market);
            var previewParams = "";
            if (PlatformJS.isDebug && NewsJS && NewsJS.StateHandler && NewsJS.StateHandler.instance && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
                previewParams = PlatformJS.Services.appConfig.getString("CMSPreviewParam") + "_"
            }
            infoParams.insert("previewparams", previewParams);
            var options = new Platform.DataServices.QueryServiceOptions;
            options.bypassCache = false;
            return infoQueryService.downloadDataAsync(infoParams, null, null, options)
        })
    }
    function fetchInternationalSources(market) {
        if (!market || !market.length || market.length < 1) {
            return WinJS.Promise.wrap(null)
        }
        var qs = new Platform.QueryService("MarketSourcesData");
        var urlParams = PlatformJS.Collections.createStringDictionary();
        urlParams.insert("market", market);
        var options = new Platform.DataServices.QueryServiceOptions;
        options.failWithException = false;
        return qs.downloadDataAsync(urlParams, null, null, options)
    }
    function getCategoryClusterDefinitions(market, force) {
        var clustersDefinition = NewsJS.StateHandler.instance.getClustersDefinition(market);
        if (!clustersDefinition || force) {
            return _getCategoryClusterDefinitions(market).then(function (categories) {
                NewsJS.StateHandler.instance.setClusterDefinitions(market, categories);
                return categories
            })
        }
        else {
            return WinJS.Promise.wrap(clustersDefinition)
        }
    }
    function _getCategoryClusterDefinitions(market) {
        var market = market || Platform.Globalization.Marketization.getCurrentMarket();
        return NewsApp.PersonalizationManager.getClusterDefinitionsState(market, false, true).then(function (state) {
            var allCategoryClusterDefinitions = [];
            for (var i = 0; i < state.clustersDefinition.length; i++) {
                var clusterDefinition = state.clustersDefinition[i];
                if (clusterDefinition.clusterType && clusterDefinition.clusterType === "NewsApp.Controls.CategoryControl") {
                    allCategoryClusterDefinitions.push(clusterDefinition)
                }
            }
            return WinJS.Promise.wrap(allCategoryClusterDefinitions)
        })
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        createSourceData: createSourceData, fetchFeaturedSourcesData: fetchFeaturedSourcesData, isSourceFollowed: isSourceFollowed, followSources: followSources, unfollowSources: unfollowSources, readSources: readSources, readUserSources: readUserSources, updateStateOnSourceVisited: updateStateOnSourceVisited, saveSourcesAsync: saveSourcesAsync, readFeaturedSources: readFeaturedSources, updateSources: updateSources, fetchSourcesInfo: fetchSourcesInfo, setupAddSectionButton: _setupAddSectionButton, setupPinInternationBDButton: _setupPinInternationBDButton, fetchInternationalSources: fetchInternationalSources, getCategoryClusterDefinitions: getCategoryClusterDefinitions
    })
})();
(function () {
    "use strict";
    function culturedStringCompare(str1, str2) {
        return str1.toLocaleLowerCase().localeCompare(str2.toLocaleLowerCase())
    }
    function culturedStringsEqual(str1, str2) {
        return culturedStringCompare(str1, str2) === 0
    }
    function GetStringHashCode(str) {
        return News.NewsUtil.instance.getStringHashCode(str)
    }
    function trimString(s) {
        if (!s) {
            return s
        }
        var re_ltrim = /^\s+/;
        var re_rtrim = /\s+$/;
        var re_mtrim = /\s+/;
        return ((s.replace(re_ltrim, "")).replace(re_rtrim, "")).replace(re_mtrim, " ")
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        culturedStringCompare: culturedStringCompare, culturedStringsEqual: culturedStringsEqual, GetStringHashCode: GetStringHashCode, trimString: trimString
    })
})();
(function () {
    "use strict";
    function disableTileNotifications() {
        var Notifications = Windows.UI.Notifications;
        var isDesign = Windows.ApplicationModel.DesignMode.designModeEnabled;
        if (Notifications && !isDesign) {
            var tileUpdater;
            try {
                tileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication()
            }
            catch (ex) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.clr, ex.message, ex.stack)
            }
            if (tileUpdater) {
                tileUpdater.enableNotificationQueue(false);
                return tileUpdater
            }
        }
        return null
    }
    function enableTileNotifications() {
        var Notifications = Windows.UI.Notifications;
        var isDesign = Windows.ApplicationModel.DesignMode.designModeEnabled;
        if (Notifications && !isDesign) {
            var tileUpdater;
            try {
                tileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication()
            }
            catch (ex) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.clr, ex.message, ex.stack)
            }
            if (tileUpdater && tileUpdater.setting === Notifications.NotificationSetting.enabled) {
                tileUpdater.enableNotificationQueue(true);
                return tileUpdater
            }
        }
        return null
    }
    function addItemToTileNotification(title) {
        var Notifications = Windows.UI.Notifications;
        if (Notifications) {
            var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideText03);
            var tileTextAttributes = tileXml.getElementsByTagName("text");
            tileTextAttributes[0].appendChild(tileXml.createTextNode(title));
            var binding = tileXml.getElementsByTagName("binding");
            binding[0].setAttribute("branding", "name");
            var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareText04);
            tileTextAttributes = squareTileXml.getElementsByTagName("text");
            tileTextAttributes[0].appendChild(squareTileXml.createTextNode(title));
            binding = squareTileXml.getElementsByTagName("binding");
            binding[0].setAttribute("branding", "name");
            var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
            tileXml.getElementsByTagName("visual").item(0).appendChild(node);
            var tileNotification = new Notifications.TileNotification(tileXml);
            var tileUpdater;
            try {
                tileUpdater = Notifications.TileUpdateManager.createTileUpdaterForApplication()
            }
            catch (ex) {
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.clr, ex.message, ex.stack)
            }
            if (tileUpdater) {
                tileUpdater.update(tileNotification)
            }
        }
    }
    function stopAndClearPreviousUpdates(tileUpdater) {
        if (tileUpdater) {
            try {
                tileUpdater.clear();
                tileUpdater.stopPeriodicUpdate()
            }
            catch (tileUpdateError) {
                console.warn("Unable to clear previous live tile updates: " + tileUpdateError);
                debugger
            }
        }
    }
    function registerLiveTileNotifications(forceClear) {
        var tileUpdater = null;
        var localSettings = Windows.Storage.ApplicationData.current.localSettings;
        var oobeLiveTileState = localSettings.values["OOBELiveTileState"];
        if (oobeLiveTileState !== "2") {
            if (oobeLiveTileState === "1") {
                tileUpdater = disableTileNotifications();
                stopAndClearPreviousUpdates(tileUpdater)
            }
            localSettings.values["OOBELiveTileState"] = "2"
        }
        var currLiveTileMarket = NewsJS.StateHandler.instance.liveTileMarket;
        var newLiveTileMarket = NewsJS.Globalization.getMarketStringForLiveTile();
        if (!newLiveTileMarket) {
            tileUpdater = disableTileNotifications();
            stopAndClearPreviousUpdates(tileUpdater)
        }
        else {
            tileUpdater = enableTileNotifications();
            if (tileUpdater) {
                if (currLiveTileMarket !== newLiveTileMarket || forceClear) {
                    stopAndClearPreviousUpdates(tileUpdater)
                }
                var urlList = PlatformJS.Services.appConfig.getList("MarketLiveTileURLs");
                if (urlList) {
                    var updateFrequency = PlatformJS.Services.appConfig.getInt32("LiveTileUpdateFrequency");
                    var urls = [];
                    for (var i = 0, l = urlList.size; i < l; i++) {
                        var url = urlList[i].value;
                        if (url) {
                            while (url.indexOf("{mkt}") >= 0) {
                                url = url.replace("{mkt}", newLiveTileMarket)
                            }
                            var uri = Windows.Foundation.Uri(url);
                            if (uri) {
                                urls.push(uri)
                            }
                        }
                    }
                    try {
                        tileUpdater.startPeriodicUpdateBatch(urls, updateFrequency)
                    }
                    catch (e) { }
                }
            }
        }
        if (NewsJS.StateHandler.instance.liveTileMarket !== newLiveTileMarket) {
            NewsJS.StateHandler.instance.liveTileMarket = newLiveTileMarket
        }
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        addItemToTileNotification: addItemToTileNotification, disableTileNotifications: disableTileNotifications, enableTileNotifications: enableTileNotifications, registerLiveTileNotifications: registerLiveTileNotifications
    })
})();
(function () {
    "use strict";
    function topicIndexOf(topicTitle) {
        if (!topicTitle) {
            return -1
        }
        var topics = NewsJS.StateHandler.instance.getTopics();
        var len = topics.length;
        for (var index = 0; index < len; index++) {
            if (topics[index] && topics[index].title && topicTitle.toLocaleLowerCase() === topics[index].title.toLocaleLowerCase()) {
                return index
            }
        }
        return -1
    }
    function followTopic(topic) {
        var success = addToFollowedSearchTopics(topic, true, true);
        if (success) {
            NewsJS.TopEdgy.instance.setupNewsMyTopics()
        }
        return success
    }
    function registerSearchTopic(topic, addIfNew) {
        return addToFollowedSearchTopics(topic, false, addIfNew)
    }
    function showFollowTopicsExceededError() {
        var message = PlatformJS.Services.resourceLoader.getString("TopicsExceeded");
        NewsJS.Utilities.showErrorMessage(message, "MyTopics")
    }
    function newTopic(topicTitle, isFavorite, wasDefault) {
        return {
            title: topicTitle, query: topicTitle, searchCount: 0, ageCount: 0, type: isFavorite ? "favorite" : (wasDefault ? "default" : "search")
        }
    }
    function addToFollowedSearchTopics(topicTitle, markAsFavorite, addIfNew) {
        if (!topicTitle) {
            return false
        }
        var maxDisplay = PlatformJS.Services.appConfig.getDictionary("TopicsConfig").getInt32("maxFollowsDisplay");
        var index = topicIndexOf(topicTitle);
        if (index >= 0) {
            var topic = NewsJS.StateHandler.instance.getTopics()[index];
            if (markAsFavorite) {
                topic.type = "favorite"
            }
            NewsJS.StateHandler.instance.addTopic(0, topic)
        }
        else {
            if (!addIfNew) {
                return true
            }
            if (NewsJS.StateHandler.instance.getTopics().length + 1 >= maxDisplay) {
                showFollowTopicsExceededError();
                return false
            }
            NewsJS.StateHandler.instance.addTopic(0, newTopic(topicTitle, markAsFavorite, false))
        }
        return true
    }
    function unfollowTopics(topicTitles) {
        if (!topicTitles) {
            return false
        }
        var somethingChanged = false;
        for (var idx = 0; idx < topicTitles.length; idx++) {
            var changed = unfollowTopic(topicTitles[idx], true);
            somethingChanged = somethingChanged || changed
        }
        if (somethingChanged === true) {
            NewsJS.TopEdgy.instance.setupNewsMyTopics()
        }
        return somethingChanged
    }
    function unfollowTopic(topicTitle, doNotRefreshTopEdgy) {
        if (!topicTitle) {
            return false
        }
        var somethingChanged = false;
        var index = topicIndexOf(topicTitle);
        if (index >= 0) {
            NewsJS.StateHandler.instance.removeTopic(index);
            somethingChanged = true
        }
        if (somethingChanged === true && !doNotRefreshTopEdgy) {
            NewsJS.TopEdgy.instance.setupNewsMyTopics()
        }
        return somethingChanged
    }
    var searchDialogVisible = false;
    function updateSuggestions(event, sources) {
        var that = this;
        var text = event.srcElement.value;
        var srcElement = document.getElementById(event.srcElement.id);
        var autoSuggest = PlatformJS.Utilities.getControl(srcElement);
        if (autoSuggest && searchDialogVisible) {
            getNewsSuggestions(text, sources).then(function (suggestionList) {
                if (searchDialogVisible) {
                    autoSuggest.itemDataSource = suggestionList
                }
                else {
                    console.log("Suggestion response received when autosuggest is inactive.")
                }
            })
        }
        else {
            console.log("Suggestion request received when autosuggest is inactive.")
        }
    }
    function getNewsSuggestions(query, sources) {
        return new WinJS.Promise(function (complete, error) {
            if (!sources) {
                var marketString = NewsJS.Globalization.getMarketStringForAutosuggest();
                var dataPromise = marketString.length > 0 ? NewsJS.Data.Bing.getQuerySuggestions(query, marketString) : WinJS.Promise.wrap({ dataObjectList: { size: 0 } });
                dataPromise.then(function (results) {
                    var resultsArray = [];
                    if (results && results.dataObjectList) {
                        for (var i = 0; i < results.dataObjectList.size; i++) {
                            var result = results.dataObjectList.getAt(i);
                            resultsArray.push({
                                Symbol: result, displayedText: result, value: result
                            })
                        }
                    }
                    complete(resultsArray)
                }, function (e) {
                    complete([])
                })
            }
            else {
                var convert = function (entity) {
                    return {
                        Symbol: entity.displayname, value: entity.id
                    }
                };
                var resultsArray2 = NewsJS.Autosuggest.findMatchingEntitiesUsingPartialMatch(sources, query, true, convert);
                complete(resultsArray2)
            }
        })
    }
    function hasInvalidCharacters(s) {
        var invalid = false;
        try {
            encodeURIComponent(s)
        }
        catch (err) {
            console.log("** Invalid characters encountered in input string: " + s + ". err=" + err);
            invalid = true
        }
        return invalid
    }
    function presentTopicModalPrompt(autoSuggestMode, sources, title) {
        var promise = new WinJS.Promise(function (complete) {
            CommonJS.dismissAllEdgies();
            var dialog = CommonJS.SearchDialog.show();
            searchDialogVisible = true;
            var dismissed = false;
            dialog.searchPlaceholderText = PlatformJS.Services.resourceLoader.getString("TopicFlyoutPlaceholderText");
            dialog.promptText = title ? title : PlatformJS.Services.resourceLoader.getString("AddTopic");
            var textEntered = function (value) {
                var topicText = NewsJS.Utilities.trimString(value.queryText);
                if (topicText.length > 0) {
                    if (hasInvalidCharacters(topicText)) {
                        dialog.searchBoxText = ""
                    }
                    else {
                        dismissed = true;
                        searchDialogVisible = false;
                        dialog.searchVisible = false;
                        return complete(topicText)
                    }
                }
            };
            var onKeyUp = function (event) {
                NewsJS.Utilities.updateSuggestions(event, sources)
            };
            dialog.autoSuggestOptions = {
                itemDataSource: [], onItemSelection: textEntered, keyup: onKeyUp, selectionMode: autoSuggestMode ? autoSuggestMode : CommonJS.AutoSuggest.freeForm
            };
            dialog.onHide = function () {
                if (!dismissed) {
                    return complete()
                }
            };
            dialog.onSearchTextEntered = textEntered;
            dialog.onCloseButtonClick = function () {
                dismissed = true;
                searchDialogVisible = false;
                dialog.searchVisible = false;
                return complete()
            }
        });
        return promise
    }
    function imageCardTopics(url) {
        return {
            url: url, cacheId: "TopicsData"
        }
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        followTopic: followTopic, topicIndexOf: topicIndexOf, unfollowTopic: unfollowTopic, unfollowTopics: unfollowTopics, registerSearchTopic: registerSearchTopic, getNewsSuggestions: getNewsSuggestions, updateSuggestions: updateSuggestions, presentTopicModalPrompt: presentTopicModalPrompt, imageCardTopics: WinJS.Binding.converter(imageCardTopics)
    })
})();
(function () {
    "use strict";
    function showToast(message) {
        var messageBar = new CommonJS.MessageBar(message, { autoHide: true });
        messageBar.addButton(PlatformJS.Services.resourceLoader.getString("Dismiss") || PlatformJS.Services.resourceLoader.getString("/partners/Dismiss"), function () {
            messageBar.hide()
        });
        messageBar.show()
    }
    function disableButton(buttonId, disabled) {
        var button = PlatformJS.Utilities.getControl(buttonId);
        if (button) {
            button.disabled = disabled
        }
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        disableButton: disableButton, showToast: showToast
    });
    WinJS.Namespace.define("NewsJS.Partners.Config", {
        processExtraSubChannels: function processExtraSubChannels(extraChannels) {
            var result = [];
            var preview = "";
            if (PlatformJS.isDebug && NewsJS.StateHandler && NewsJS.StateHandler.instance.isPreviewModeEnabled) {
                preview = "/" + PlatformJS.Services.appConfig.getString("CMSPreviewParam")
            }
            var market = Platform.Globalization.Marketization.getCurrentMarket();
            if (extraChannels && extraChannels.length) {
                for (var i = 0; i < extraChannels.length; i++) {
                    var extraChannel = extraChannels[i];
                    var subchannelId = extraChannel.getString("id");
                    var title = NewsJS.Partners.Config.tryGetResourceString(extraChannel.getString("title"));
                    var subchannel = {
                        subChannels: [], icon: extraChannel.getString("icon"), visible: extraChannel.hasKey("visible") ? extraChannel.getBool("visible") : true, isDisplayValue: extraChannel.hasKey("isDisplayValue") ? extraChannel.getBool("isDisplayValue") : true, title: title, id: subchannelId, menuIndex: extraChannel.getInt32("menuIndex", -1), pageInfo: NewsJS.Partners.Config.getDynamicPanoPageInfo(subchannelId), state: {
                            dynamicInfo: {
                                channelID: subchannelId, id: subchannelId, css: extraChannel.getString("CssUrlFormatString").format(market, preview), dataProviderOptions: { useByline: extraChannel.hasKey("useByline") ? extraChannel.getBool("useByline") : true }, feedName: extraChannel.getString("feedName"), instrumentationId: extraChannel.getString("instrumentationId"), logoUrl: extraChannel.getString("logoUrl"), panoClass: extraChannel.getString("panoClass"), panoTitle: NewsJS.Partners.Config.tryGetResourceString(extraChannel.getString("panoTitle")), snapLogoUrl: extraChannel.getString("snapLogoUrl"), isFeaturedSource: extraChannel.hasKey("isFeaturedSource") ? extraChannel.getBool("isFeaturedSource") : true, entrypoint: "navbar", adUnitId: extraChannel.getString("adUnitId"), clusterID: subchannelId, clusterTitle: title
                            }, theme: extraChannel.getString("theme"), feedType: "section", feedIdentifierValue: extraChannel.getString("section")
                        }
                    };
                    if (extraChannel.hasKey("channelId")) {
                        subchannel.pageInfo.channelId = extraChannel.getString("channelId")
                    }
                    if (extraChannel.hasKey("fragment")) {
                        subchannel.pageInfo.fragment = extraChannel.getString("fragment")
                    }
                    if (extraChannel.hasKey("page")) {
                        subchannel.pageInfo.page = extraChannel.getString("page")
                    }
                    result.push(subchannel)
                }
            }
            return result
        }, getDynamicPanoPageInfo: function getDynamicPanoPageInfo(channelId, isDeepLink, deepLink) {
            var fragment = "/dynamicPano/dynamicPano.html";
            var page = "DynamicPano.DynamicPanoPage";
            isDeepLink = isDeepLink || false;
            deepLink = deepLink || fragment;
            return {
                channelId: channelId, fragment: isDeepLink ? deepLink : fragment, page: isDeepLink ? null : page
            }
        }, getExtraChannelsFromConfig: function getExtraChannelsFromConfig(channelId) {
            var extraChannels = CommonJS.Partners.Config.getConfig(channelId, "ExtraSubChannels", []);
            return NewsJS.Partners.Config.processExtraSubChannels(extraChannels)
        }, tryGetResourceString: function tryGetResourceString(key) {
            if (!key) {
                return key
            }
            var value = PlatformJS.Services.resourceLoader.getString(key);
            return value || key
        }
    })
})();
(function () {
    "use strict";
    function getParnterJsonFileNames() {
        return Array.prototype.map.call(PlatformJS.Services.configuration.getList("PartnerJsonFileNames"), function (item) {
            return item.value
        })
    }
    function createPartnerPanoNavigationFactory() {
        var fileNames = getParnterJsonFileNames(),
            len = 0;
        if (!fileNames || !fileNames.length) {
            fileNames = ["partner.js"]
        }
        len = fileNames.length;
        return function createPartnerPanoNavigation(args, i) {
            var complete = args.complete,
                featuredSourceMarket = args.featuredSourceMarket,
                sourceId = args.sourceId,
                entryPoint = args.entryPoint,
                sourceMarket = args.sourceMarket,
                cluster = args.cluster;
            i = i || 0;
            if (i === len) {
                complete(null)
            }
            else {
                var filename = fileNames[i];
                NewsJS.Utilities.fetchFeaturedSourcesData(featuredSourceMarket, filename).then(function parseSource(partnerSources) {
                    var partnerSource = partnerSources[sourceId];
                    if (partnerSource) {
                        complete(NewsJS.Utilities.navigationInfoForPartnerSource(partnerSource, entryPoint, sourceMarket, cluster))
                    }
                    else {
                        createPartnerPanoNavigation(args, i + 1)
                    }
                }, function (error) {
                    if (entryPoint === "bingdailycluster" && !NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection() && !NewsJS.Utilities.isCancellationError(error)) {
                        NewsJS.Utilities.showToast(PlatformJS.Services.resourceLoader.getString("/platform/offline_noContent"));
                        complete(null)
                    }
                })
            }
        }
    }
    function addNewsEntityViews() {
        PlatformJS.Navigation.addEntityView("article", function newsNavigation_articleEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            var articleIdPath = urlParams["articleid"];
            contentId = urlParams["contentid"];
            pageId = urlParams["pageid"];
            sourceMarket = urlParams["market"];
            if (pageId) {
                articleIdPath = pageId;
                if (contentId) {
                    articleIdPath += "/" + contentId
                }
            }
            sourceMarket = sourceMarket || Platform.Globalization.Marketization.getCurrentMarket();
            if (articleIdPath && sourceMarket) {
                navigation = WinJS.Promise.wrap(NewsJS.Utilities.getArticleReaderNavigationInfo(null, articleIdPath, sourceMarket))
            }
            return navigation
        });
        PlatformJS.Navigation.addEntityView("slideshow", function newsNavigation_slideshowEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            sourceMarket = urlParams["market"];
            pageId = urlParams["pageid"];
            var image = urlParams["image"];
            if (pageId && sourceMarket) {
                targetState = {
                    slideshowId: pageId, market: sourceMarket
                };
                if (image) {
                    var imageValue = parseInt(image);
                    if (imageValue > 0) {
                        targetState.imageIndex = imageValue - 1
                    }
                }
                navigation = WinJS.Promise.wrap({
                    state: targetState, pageInfo: {
                        channelId: null, fragment: "/html/newsSlideshow.html", page: "NewsJS.SlideShowPage"
                    }
                })
            }
            return navigation
        });
        PlatformJS.Navigation.addEntityView("video", function newsNavigation_videoEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            contentId = urlParams["contentid"];
            if (contentId) {
                targetState = { videoContentId: contentId };
                channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("Home");
                navigation = WinJS.Promise.wrap({
                    state: targetState, pageInfo: channelInfo.pageInfo
                })
            }
            return navigation
        });
        PlatformJS.Navigation.addEntityView("allvideos", function newsNavigation_allVideosEntityView(args) {
            var navigation = null;
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("Video");
            targetState = channelInfo.state;
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("alltopics", function newsNavigation_allTopicsEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("MyTopics");
            targetState = channelInfo.state;
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("allsources", function newsNavigation_allSourcesEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            targetState = {
                mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL], isBrowse: true, title: PlatformJS.Services.resourceLoader.getString("BrowseSourceTile")
            };
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SelectionPage");
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("addsource", function newsNavigation_addSourceEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            targetState = {
                mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL], isBrowse: false, title: PlatformJS.Services.resourceLoader.getString("AddSourceTile")
            };
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SelectionPage");
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("addsection", function newsNavigation_addSectionEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            targetState = {
                mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_CLUSTER, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_CATEGORIES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_TOPICS], isBrowse: false, title: PlatformJS.Services.resourceLoader.getString("AddASection").toUpperCase()
            };
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SelectionPage");
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("browseinternational", function newsNavigation_browseInternationalEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            targetState = {
                mode: NewsJS.Personalization.Utilities.selectionPageFormat.FORMAT_SOURCE, features: [NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_SOURCES, NewsJS.Personalization.Utilities.selectionPageFeature.TYPE_INTERNATIONAL], isBrowse: true, title: PlatformJS.Services.resourceLoader.getString("BrowseSourceTile"), selectedCategory: "internationalBingDailyTab"
            };
            channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("SelectionPage");
            navigation = WinJS.Promise.wrap({
                state: targetState, pageInfo: channelInfo.pageInfo
            });
            return navigation
        });
        PlatformJS.Navigation.addEntityView("pano", function newsNavigation_panoEntityView(args) {
            var navigation = WinJS.Promise.wrap(null);
            var urlParams = args;
            var targetState;
            var channelInfo = null;
            var pageId,
                sourceMarket,
                entryPoint;
            var contentId = null;
            var panoId = urlParams["panoid"];
            var categoryId = urlParams["categoryid"];
            if (panoId) {
                if (panoId === "bingdaily" && categoryId) {
                    if (!Platform.Utilities.Globalization.isFeatureEnabled("ROWTopEdgy") && !Platform.Utilities.Globalization.isFeatureEnabled("ROW_ENWW_TopEdgy")) {
                        channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("CategoryPage", "standard");
                        if (channelInfo && channelInfo.pageInfo) {
                            targetState = { categoryKey: categoryId };
                            navigation = WinJS.Promise.wrap({
                                state: targetState, pageInfo: channelInfo.pageInfo
                            })
                        }
                    }
                }
                else if (!categoryId) {
                    entryPoint = urlParams["entrypoint"] || "deeplink";
                    if (entryPoint === "endofarticleblock") {
                        var method = CommonJS.ArticleReader.ArticleReaderUtils.impressionNavMethod.endOfArticleBlock;
                        Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(method);
                        NewsJS.Telemetry.ArticleReader.recordActionClick(panoId)
                    }
                    channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(panoId, "featured");
                    if (!channelInfo) {
                        channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel(panoId, "standard")
                    }
                    if (channelInfo && channelInfo.pageInfo) {
                        navigation = WinJS.Promise.wrap({
                            state: channelInfo.state, pageInfo: channelInfo.pageInfo
                        })
                    }
                }
            }
            return navigation
        });
        var createPartnerPanoNavigationFn = null;
        PlatformJS.Navigation.addEntityView("partnerPano", function newsNavigation_partnerPanoEntityView(args) {
            var navigation = WinJS.Promise.wrap(null),
                urlParams = args,
                sourceMarket,
                entryPoint,
                contentId = null,
                sourceId = urlParams["sourceid"];
            entryPoint = urlParams["entrypoint"] || "deeplink";
            sourceMarket = urlParams["market"];
            var featuredSourceMarket = sourceMarket || NewsJS.Globalization.getMarketStringForEditorial();
            if (sourceId) {
                createPartnerPanoNavigationFn = createPartnerPanoNavigationFn || createPartnerPanoNavigationFactory();
                navigation = new WinJS.Promise(function (complete) {
                    createPartnerPanoNavigationFn({
                        complete: complete, featuredSourceMarket: featuredSourceMarket, sourceId: sourceId, entryPoint: entryPoint, sourceMarket: sourceMarket, cluster: urlParams.cluster
                    }, 0)
                })
            }
            return navigation
        })
    }
    function stringAsUri(value) {
        try {
            return new Windows.Foundation.Uri(value)
        }
        catch (e) {
            return null
        }
    }
    function processProtocolLaunch(uriData) {
        var impressionMethod = Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.protocol;
        var navigationPromise = null;
        if (uriData) {
            var urlParams = uriData.params;
            var targetState;
            if (urlParams && uriData.path === "application/view") {
                var referrer = urlParams["referrer"];
                navigationPromise = PlatformJS.Navigation.createCommandFromUri(uriData.uri.rawUri);
                if (navigationPromise) {
                    navigationPromise = navigationPromise.then(function (navigation) {
                        if (referrer && referrer.length > 0) {
                            if (referrer === "toast") {
                                impressionMethod = Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.toast
                            }
                            else if (referrer === "share") {
                                impressionMethod = Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.share
                            }
                        }
                        return WinJS.Promise.wrap(navigation)
                    })
                }
            }
            else if (uriData.path === "search") {
                var q = urlParams["q"];
                impressionMethod = Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.searchCharm;
                if (q) {
                    targetState = {
                        queryText: q, searchOrigin: NewsJS.Telemetry.Search.Origin.externalSearchCharm
                    };
                    navigationPromise = WinJS.Promise.wrap({
                        state: targetState, pageInfo: {
                            channelId: null, fragment: "/html/search.html", page: "NewsJS.Search"
                        }
                    })
                }
            }
            else if (uriData.path === "application/default") {
                var channelInfo = PlatformJS.Navigation.mainNavigator.channelManager.resolveChannel("Home");
                if (channelInfo) {
                    navigationPromise = WinJS.Promise.wrap(channelInfo)
                }
            }
            if (navigationPromise) {
                navigationPromise = navigationPromise.then(function (navigation) {
                    if (navigation) {
                        Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethodWithoutOverride(impressionMethod);
                        if (!navigation.state) {
                            navigation.state = {}
                        }
                        navigation.state.entryPoint = impressionMethod;
                        navigation.state.source = impressionMethod
                    }
                    return navigation
                })
            }
        }
        return navigationPromise
    }
    WinJS.Namespace.define("NewsJS.Utilities", {
        getAppProtocol: CommonJS.Utils.getAppProtocol,
        parseCMSUriString: CommonJS.Utils.parseCMSUriString,
        parseUri: CommonJS.Utils.parseUri,
        parseUriString: CommonJS.Utils.parseUriString,
        stringAsUri: stringAsUri,
        addNewsEntityViews: addNewsEntityViews,
        processProtocolLaunch: processProtocolLaunch
    })
})()