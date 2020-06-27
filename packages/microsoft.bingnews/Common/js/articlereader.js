/*  © Microsoft. All rights reserved. */
WinJS.Namespace.define('CommonJS', { Version: 'latest' });
(function appexPlatformArticleReaderUtilitiesInit() {
    "use strict";
    WinJS.Namespace.define("PlatformJS.Utilities", {
        _addAdToArticleInfo: function _addAdToArticleInfo(articleInfo, adObj) {
            if (articleInfo && articleInfo.adGroups) {
                articleInfo.adGroups.push(adObj)
            }
            else {
                if (articleInfo) {
                    console.log("_addTileAdToArticleInfo: undefined ad groups for article:" + articleInfo.articleId)
                }
                else {
                    console.log("_addTileAdToArticleInfo: undefined articleInfo")
                }
            }
        }, _addCollapseAdToArticleInfo: function _addCollapseAdToArticleInfo(articleInfo, applicationId, adUnitId, adTags) {
            var adObj = {
                type: "noad", adMetadatas: [JSON.stringify({
                    controlType: "PlatformJS.Ads.AdsWrapperControl", controlOptions: {
                        adUnitId: adUnitId, otherAdOptions: {
                            applicationId: applicationId, adUnitId: adUnitId, keywords: "", adTags: adTags
                        }, className: "adTypeCollapse"
                    }, height: 1, width: 1
                })]
            };
            this._addAdToArticleInfo(articleInfo, adObj)
        }, _addTileAdToArticleInfo: function _addTileAdToArticleInfo(articleInfo, applicationId, adUnitId, adTags) {
            var adObj = {
                type: "inline", adMetadatas: [JSON.stringify({
                    controlType: "PlatformJS.Ads.AdsWrapperControl", controlOptions: {
                        adUnitId: adUnitId, otherAdOptions: {
                            applicationId: applicationId, adUnitId: adUnitId, keywords: "", adTags: adTags
                        }, className: "adTypeTile"
                    }, height: (PlatformJS.Ads && PlatformJS.Ads.AdSettingsManager.tileAdHeight) || 250, width: (PlatformJS.Ads && PlatformJS.Ads.AdSettingsManager.tileAdWidth) || 300
                })]
            };
            this._addAdToArticleInfo(articleInfo, adObj)
        }, _addThinAdToArticleInfo: function _addThinAdToArticleInfo(articleInfo, applicationId, adUnitId, adTags) {
            var adObj = {
                type: "end", adMetadatas: [JSON.stringify({
                    controlType: "PlatformJS.Ads.AdsWrapperControl", controlOptions: {
                        adUnitId: adUnitId, otherAdOptions: {
                            applicationId: applicationId, adUnitId: adUnitId, keywords: "", adTags: adTags
                        }, className: "adTypeThin"
                    }, height: (PlatformJS.Ads && PlatformJS.Ads.AdSettingsManager.thinAdHeight) || 600, width: (PlatformJS.Ads && PlatformJS.Ads.AdSettingsManager.thinAdWidth) || 300
                })]
            };
            this._addAdToArticleInfo(articleInfo, adObj)
        }, _addFullPageAdToArticleInfo: function _addFullPageAdToArticleInfo(articleInfo, applicationId, adUnitId, adTags) {
            var adObj = {
                type: "interstitial", adMetadatas: [JSON.stringify({
                    controlType: "PlatformJS.Ads.RotatingAdsWrapperControl", controlOptions: {
                        adOptions: {
                            landscapeOptions: {
                                adUnitId: adUnitId, otherAdOptions: {
                                    applicationId: applicationId, adUnitId: adUnitId, keywords: "", adTags: adTags
                                }, className: "adTypeFullPageLandscape"
                            }, portraitOptions: {
                                adUnitId: adUnitId, otherAdOptions: {
                                    applicationId: applicationId, adUnitId: adUnitId, keywords: "", adTags: adTags
                                }, className: "adTypeFullPagePortrait"
                            }
                        }
                    }
                })]
            };
            this._addAdToArticleInfo(articleInfo, adObj)
        }, annotateArticleInfosWithAdInfo: function annotateArticleInfosWithAdInfo(category, subcategory, articleInfos, adTags, providerId, overrideKey) {
            if (category && typeof category !== "string") {
                debugger;
                articleInfos = category;
                category = "";
                subcategory = ""
            }
            if (!PlatformJS.Ads) {
                return
            }
            var ADSNS = PlatformJS.Ads;
            if (!articleInfos || !articleInfos.length || !ADSNS.Config.adVisible()) {
                return
            }
            var applicationId = ADSNS.Config.instance.applicationId;
            var articleReaderAdConfig = ADSNS.getArticleReaderAdConfig(category, subcategory, providerId, overrideKey);
            if (articleReaderAdConfig) {
                var nextTileAdUnitId = "";
                var adConfig = null;
                var aRConfigLength = articleReaderAdConfig.length;
                if (aRConfigLength) {
                    for (var iAdConfig = 0; iAdConfig < aRConfigLength; iAdConfig++) {
                        adConfig = articleReaderAdConfig[iAdConfig];
                        if (adConfig) {
                            if (adConfig.type === "tile") {
                                nextTileAdUnitId = adConfig.adUnitId;
                                break
                            }
                        }
                    }
                    for (var iArticlePage = 0, iAdPage = 0; iArticlePage < articleInfos.length; iArticlePage++, iAdPage++) {
                        var articleInfo = articleInfos[iArticlePage];
                        articleInfo.adGroups = [];
                        if (iAdPage >= aRConfigLength) {
                            iAdPage = 0
                        }
                        adConfig = articleReaderAdConfig[iAdPage];
                        adTags = ADSNS.mergeAdTags(adTags, adConfig.adTags);
                        if (adConfig) {
                            switch (adConfig.type) {
                                case "tile":
                                    this._addTileAdToArticleInfo(articleInfo, applicationId, adConfig.adUnitId, adTags);
                                    nextTileAdUnitId = adConfig.adUnitId;
                                    break;
                                case "thin":
                                    if (nextTileAdUnitId) {
                                        this._addTileAdToArticleInfo(articleInfo, applicationId, nextTileAdUnitId, adTags)
                                    }
                                    this._addThinAdToArticleInfo(articleInfo, applicationId, adConfig.adUnitId, adTags);
                                    break;
                                case "fullpage":
                                    this._addFullPageAdToArticleInfo(articleInfo, applicationId, adConfig.adUnitId, adTags);
                                    break;
                                case "noad":
                                    this._addCollapseAdToArticleInfo(articleInfo, applicationId, adConfig.adUnitId, adTags);
                                    break;
                                default:
                                    break
                            }
                        }
                    }
                }
            }
        }
    })
})();
(function appexPrivateArticleReaderUtilitiesInit() {
    "use strict";
    var _rightSizeArticleReaderImages = null;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleReaderUtils: {
            inlineAdBlockType: "InlineAd", titleTextBlockType: "Text", titleRectBlockType: "Rect", titleImageBlockType: "Image", imageContainerClassName: {
                title: "titleImage", logo: "sourceLogo"
            }, impressionNavMethod: {
                endOfArticleBlock: "End of Article Block", articleReader: "Article Reader"
            }, actionContext: {
                appBar: "App-Bar", body: "Article Reader"
            }, getRightSizeArticleReaderImages: function getRightSizeArticleReaderImages() {
                if (_rightSizeArticleReaderImages === null) {
                    _rightSizeArticleReaderImages = !Platform.Configuration.ConfigurationManager.custom.getBool("disableRightgetSizeArticleReaderImages")
                }
                return _rightSizeArticleReaderImages
            }, setRightSizeArticleReaderImages: function setRightSizeArticleReaderImages(value) {
                _rightSizeArticleReaderImages = value
            }, convertColumnIndexToGridColumn: function convertColumnIndexToGridColumn(columnIndex, columnCount) {
                return (((columnCount * 2) + 1) * (Math.floor(columnIndex / columnCount)) + ((columnIndex % columnCount) * 2 + 2))
            }, convertColumnCountToWidth: function convertColumnCountToWidth(count, gridOptions) {
                var columnMargin = gridOptions.columnMargin;
                var columnWidth = gridOptions.columnWidth;
                return (count * (columnMargin + columnWidth)) - columnMargin
            }, createSlideshowImageDefinition: function createSlideshowImageDefinition(blockImage, title) {
                var resource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(blockImage, "original");
                var caption = blockImage.caption;
                var attribution = blockImage.attribution;
                var image = {
                    url: resource.url, width: resource.width, height: resource.height
                };
                var thumbnail = {
                    url: resource.url, width: resource.width, height: resource.height
                };
                var slide = {
                    image: image, thumbnail: thumbnail, title: title, desc: caption, attribution: attribution
                };
                return slide
            }, launchSlideshow: function launchSlideshow(slideshowData, startIndex, cacheId, instrumentationId) {
                var location = {
                    fragment: "/common/Slideshow/html/GenericSlideshowPage.html", page: "CommonJS.Slideshow.GenericSlideshowPage"
                };
                var state = {
                    data: slideshowData, startIndex: startIndex, instrumentationEntryPoint: "", instrumentationId: instrumentationId, cacheId: cacheId, impressionContext: "/Article Reader/Slideshow"
                };
                this.logUserAction(this.actionContext.body, "Image");
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(this.impressionNavMethod.articleReader);
                WinJS.Navigation.navigate(location, state)
            }, getImageResource: function getImageResource(image, imageName) {
                var imageResource = null;
                var imageResources = image.images;
                imageName = imageName || "original";
                for (var i = 0, len = imageResources.length; i < len; i++) {
                    var current = imageResources[i];
                    if (current.name === imageName) {
                        imageResource = current;
                        break
                    }
                }
                return imageResource
            }, getImageCardSource: function getImageCardSource(image, cacheId) {
                var original = this.getImageResource(image, "original");
                var lowRes = this.getImageResource(image, "lowRes");
                return this.getImageCardSourceFromUrl(lowRes && lowRes.url, original.url, cacheId)
            }, getImageCardSourceFromUrl: function getImageCardSourceFromUrl(lowResUrl, highResUrl, cacheId) {
                if (lowResUrl) {
                    return {
                        highResolutionUrl: highResUrl, lowResolutionUrl: lowResUrl, cacheId: cacheId
                    }
                }
                else {
                    return {
                        url: highResUrl, cacheId: cacheId
                    }
                }
            }, getBestExclusion: function getBestExclusion(startColumn, gridOptions, exclusions, maxWidth, maxHeight, minWidth) {
                var columnCount = gridOptions.columnCount;
                var aspectRatio = maxWidth / maxHeight;
                var realStartColumn = Math.floor(startColumn);
                var initialRowAlign = (realStartColumn === startColumn ? "start" : "end");
                var endColumn = ((Math.floor(realStartColumn / columnCount) + 1) * columnCount) - 1;
                var columnHeight = gridOptions.columnHeight;
                var columnWidth = gridOptions.columnWidth;
                var columnMargin = gridOptions.columnMargin;
                var maxColumns = Math.floor((maxWidth + columnMargin) / (columnWidth + columnMargin)) + 1;
                do {
                    maxColumns--;
                    var heightForMaxColumns = ((maxColumns * (columnWidth + columnMargin)) - columnMargin) / aspectRatio
                } while (heightForMaxColumns > columnHeight);
                var minColumns = Math.ceil((minWidth + columnMargin) / (columnWidth + columnMargin));
                maxColumns = Math.max(maxColumns, minColumns);
                var done = false;
                var exclusion;
                var currentStartColumn = realStartColumn;
                while (!done) {
                    var columns = maxColumns + 1;
                    while (!exclusion) {
                        columns--;
                        columns = Math.min(columns, endColumn - currentStartColumn + 1);
                        if (columns < minColumns) {
                            break
                        }
                        var heightForColumns = ((columns * (columnWidth + columnMargin)) - columnMargin) / aspectRatio;
                        exclusion = this._getExclusion(currentStartColumn, columns, heightForColumns, initialRowAlign, exclusions, gridOptions)
                    }
                    if (exclusion) {
                        done = true
                    }
                    else {
                        if (initialRowAlign === "start") {
                            initialRowAlign = "end"
                        }
                        else if (initialRowAlign === "end") {
                            currentStartColumn++;
                            initialRowAlign = "start";
                            if (endColumn - currentStartColumn < maxColumns - 1) {
                                done = true
                            }
                        }
                    }
                }
                return exclusion
            }, isContentElementEmpty: function isContentElementEmpty(contentElement) {
                var ranges = contentElement.msGetRegionContent();
                var isEmpty = !(ranges && ranges.length && ranges[0].toString()) && (contentElement.msRegionOverflow === "empty" || contentElement.msRegionOverflow === "undefined");
                return isEmpty
            }, isContentElementOverflowing: function isContentElementOverflowing(contentElement) {
                var isOverflowing = (contentElement.msRegionOverflow === "overflow");
                return isOverflowing
            }, isExclusionOnColumn: function isExclusionOnColumn(exclusion, columnIndex) {
                var column = exclusion.column;
                var columnSpan = exclusion.columnSpan;
                var is = this._isColumnInRange(column, columnSpan, columnIndex);
                return is
            }, isElementOnColumn: function isElementOnColumn(element, columnIndex, columnCount) {
                var style = getComputedStyle(element);
                var gridColumn = parseInt(style.msGridColumn);
                var gridColumnSpan = parseInt(style.msGridColumnSpan);
                var column = this.convertGridColumnToColumnIndex(gridColumn, columnCount);
                var columnSpan = (gridColumnSpan + 1) / 2;
                var is = this._isColumnInRange(column, columnSpan, columnIndex);
                return is
            }, getAllExclusions: function getAllExclusions(context) {
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                var exclusions1 = this.getAllExclusionsFromRenderableBlocks(renderableBlocks);
                var exclusions2 = this.getAllExclusionsFromRenderableBlocks(endRenderableBlocks);
                var exclusions = [].concat(exclusions1, exclusions2);
                return exclusions
            }, getAllNonTitleExclusions: function getAllNonTitleExclusions(context) {
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                var exclusions1 = this.getAllExclusionsFromRenderableBlocks(renderableBlocks, true);
                var exclusions2 = this.getAllExclusionsFromRenderableBlocks(endRenderableBlocks, true);
                var exclusions = [].concat(exclusions1, exclusions2);
                return exclusions
            }, getAllExclusionsFromRenderableBlocks: function getAllExclusionsFromRenderableBlocks(renderableBlocks, excludeTitle) {
                var exclusions = [];
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var element = renderableBlock.element;
                    if (element) {
                        var visibility = element.getAttribute("data-block-visibility");
                        var isHidden = (visibility === "hidden");
                        if (!isHidden) {
                            var exclusion = renderableBlock.exclusion;
                            if (exclusion) {
                                if (!excludeTitle || (excludeTitle && renderableBlock.position !== -1)) {
                                    exclusions.push(exclusion)
                                }
                            }
                        }
                    }
                }
                return exclusions
            }, setFixedElementHeight: function setFixedElementHeight(elt) {
                var offsetHeight = 0;
                if (elt) {
                    var hasHeight = elt.getAttribute("data-block-hasheight") === "true";
                    if (!hasHeight) {
                        elt.style.height = ""
                    }
                    offsetHeight = elt.offsetHeight;
                    elt.style.height = offsetHeight + "px"
                }
                return offsetHeight
            }, createContentElement: function createContentElement(flowId) {
                var element = document.createElement("div");
                WinJS.Utilities.addClass(element, "contentBlock");
                element.style.msFlowFrom = flowId;
                return element
            }, showModalProgress: function showModalProgress() {
                msWriteProfilerMark("CommonControls:ArticleReader:BlockingForRendering:s");
                var loadingScreen = document.getElementById("articleLoadingScreen");
                if (loadingScreen) {
                    WinJS.Utilities.removeClass(loadingScreen, "platformHide")
                }
                CommonJS.Progress.showProgress(CommonJS.Progress.centerProgressType)
            }, hideModalProgress: function hideModalProgress() {
                var loadingScreen = document.getElementById("articleLoadingScreen");
                if (loadingScreen) {
                    WinJS.Utilities.addClass(loadingScreen, "platformHide")
                }
                CommonJS.Progress.hideProgress(CommonJS.Progress.centerProgressType);
                msWriteProfilerMark("CommonControls:ArticleReader:BlockingForRendering:e")
            }, hasSourceLogo: function hasSourceLogo(titleBlock) {
                return titleBlock && titleBlock.publisher && titleBlock.publisher.favicon
            }, combineCaptionAndAttribution: function combineCaptionAndAttribution(caption, attribution) {
                var result = caption ? (attribution ? (caption + " " + attribution) : caption) : (attribution ? attribution : "");
                return result
            }, instantiateChildAds: function instantiateChildAds(element) {
                var adContainerElts = element.querySelectorAll(".adContainer");
                for (var i = 0, len = adContainerElts.length; i < len; i++) {
                    var adContainerElt = adContainerElts[i];
                    var adContainer = adContainerElt.winControl;
                    if (adContainer) {
                        adContainer.instantiateAd()
                    }
                }
            }, adTypeMatchesClass: function adTypeMatchesClass(theType, theClass) {
                if (theClass === "adTypeThin" && theType === "thin") {
                    return true
                }
                else if (theClass === "adTypeTile" && theType === "tile") {
                    return true
                }
                else if (theClass === "adTypeFullPageLandscape" && theType === "fullPage") {
                    return true
                }
                else if (theClass === "adTypeFullPagePortrait" && theType === "fullPage") {
                    return true
                }
                else {
                    return (theClass && theType && theClass === theType)
                }
            }, isNumber: function isNumber(n) {
                return !isNaN(parseFloat(n)) && isFinite(n)
            }, convertPageIndexToPageNumber: function convertPageIndexToPageNumber(pageIndex) {
                return (pageIndex === -1 ? "" : (pageIndex + 1) + "")
            }, convertPageNumberDataToString: function convertPageNumberDataToString(pageIndex, pageCount) {
                return PlatformJS.Services.resourceLoader.getString("/Platform/PageOf").format(pageIndex + 1, pageCount)
            }, generateInlineAdLayout: function generateInlineAdLayout(layout, column, columnCount, columnWidth, top, hide) {
                layout = layout || {
                    row: 2, rowSpan: 2, columnSpan: 1, columnAlign: "start", height: 280, width: columnWidth, zIndex: 2, top: 0, bottom: 0, visibility: "shown"
                };
                layout.rowAlign = top ? "start" : "end";
                layout.column = this.convertColumnIndexToGridColumn(column, columnCount);
                if (hide) {
                    layout.height = 0;
                    layout.visibility = "hidden"
                }
                return layout
            }, updateLayout: function updateLayout(renderableBlock, context) {
                var element = renderableBlock.element;
                if (element) {
                    var style = getComputedStyle(element);
                    var layout = {
                        row: parseInt(style.msGridRow), rowSpan: parseInt(style.msGridRowSpan), rowAlign: style.msGridRowAlign, column: parseInt(style.msGridColumn), columnSpan: parseInt(style.msGridColumnSpan), columnAlign: style.msGridColumnAlign, height: parseInt(style.height), width: parseInt(style.width), zIndex: parseInt(style.zIndex), top: parseInt(style.marginTop) || 0, bottom: parseInt(style.marginBottom) || 0, left: parseInt(style.marginLeft) || 0, right: parseInt(style.marginRight) || 0, visibility: element.getAttribute("data-block-visibility") || "shown"
                    };
                    renderableBlock.layout = layout;
                    this._convertLayoutToExclusion(renderableBlock, context)
                }
            }, assignLayout: function assignLayout(renderableBlock, context) {
                var element = renderableBlock.element;
                var layout = renderableBlock.layout;
                if (element && layout) {
                    var style = element.style;
                    style.msGridRow = layout.row;
                    style.msGridRowSpan = layout.rowSpan;
                    this.setRowAlign(element, layout.rowAlign);
                    style.msGridColumn = layout.column;
                    style.msGridColumnSpan = layout.columnSpan;
                    style.msGridColumnAlign = layout.columnAlign;
                    style.height = layout.height + "px";
                    style.width = layout.width + "px";
                    style.zIndex = layout.zIndex;
                    style.marginTop = layout.top + "px";
                    style.marginBottom = layout.bottom + "px";
                    style.marginLeft = layout.left + "px";
                    style.marginRight = layout.right + "px";
                    element.setAttribute("data-block-visibility", layout.visibility);
                    this._convertLayoutToExclusion(renderableBlock, context)
                }
            }, compressHints: function compressHints(hints) {
                var blockLayouts = hints.blockLayouts;
                var compressedLayouts = [];
                for (var i = 0, len = blockLayouts.length; i < len; i++) {
                    var layout = blockLayouts[i];
                    var compressedLayout = [layout.row, layout.rowSpan, this._convertGridAlignToInt(layout.rowAlign), layout.column, layout.columnSpan, this._convertGridAlignToInt(layout.columnAlign), layout.height, layout.width, layout.zIndex, layout.top, layout.bottom, layout.left, layout.right, this._convertVisibilityToInt(layout.visibility),];
                    compressedLayouts.push(compressedLayout)
                }
                var compressedHints = [hints.pageCount, compressedLayouts,];
                return compressedHints
            }, expandHints: function expandHints(compressedHints) {
                var pageCount = compressedHints[0];
                var compressedLayouts = compressedHints[1];
                var blockLayouts = [];
                for (var i = 0, len = compressedLayouts.length; i < len; i++) {
                    var compressedLayout = compressedLayouts[i];
                    var layout = {
                        row: compressedLayout[0], rowSpan: compressedLayout[1], rowAlign: this._convertIntToGridAlign(compressedLayout[2]), column: compressedLayout[3], columnSpan: compressedLayout[4], columnAlign: this._convertIntToGridAlign(compressedLayout[5]), height: compressedLayout[6], width: compressedLayout[7], zIndex: compressedLayout[8], top: compressedLayout[9], bottom: compressedLayout[10], left: compressedLayout[11], right: compressedLayout[12], visibility: this._convertIntToVisibility(compressedLayout[13])
                    };
                    blockLayouts.push(layout)
                }
                var hints = {
                    pageCount: pageCount, blockLayouts: blockLayouts
                };
                return hints
            }, assignExclusion: function assignExclusion(renderableBlock, context) {
                var element = renderableBlock.element;
                var exclusion = renderableBlock.exclusion;
                if (element && exclusion) {
                    var gridOptions = context.gridOptions;
                    var columnCount = gridOptions.columnCount;
                    var columnWidth = gridOptions.columnWidth;
                    var columnSpan = exclusion.columnSpan;
                    var gridRowAlign = exclusion.rowAlign;
                    var gridColumn = CommonJS.ArticleReader.ArticleReaderUtils.convertColumnIndexToGridColumn(exclusion.column, columnCount);
                    var gridColumnSpan = columnSpan * 2 - 1;
                    var style = element.style;
                    style.msGridRow = 2;
                    style.msGridRowSpan = 2;
                    this.setRowAlign(element, gridRowAlign);
                    style.msGridColumn = gridColumn;
                    style.msGridColumnSpan = gridColumnSpan;
                    style.marginTop = "";
                    style.marginBottom = "";
                    style.height = "";
                    style.width = ""
                }
            }, resetLayout: function resetLayout(renderableBlock, context) {
                renderableBlock.layout = null;
                renderableBlock.exclusion = null;
                var element = renderableBlock.element;
                element.style.width = "";
                element.style.height = ""
            }, setStyles: function setStyles(elt, styles) {
                var style = elt.style;
                for (var k in styles) {
                    style[k] = styles[k]
                }
            }, stack: function stack(elements, column, columnSpan, context, isUsingEntireColumn, isUsingGridColumns, marginTop) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var row = isUsingEntireColumn ? 1 : 2;
                var rowSpan = isUsingEntireColumn ? 4 : 2;
                var gridColumnSpan = isUsingGridColumns ? columnSpan : this.convertColumnSpanToGridColumnSpan(columnSpan);
                var gridColumn = isUsingGridColumns ? column : this.convertColumnIndexToGridColumn(column, columnCount);
                var top = marginTop;
                for (var i = 0, len = elements.length; i < len; i++) {
                    var element = elements[i];
                    var style = element.style;
                    style.msGridRow = row;
                    style.msGridRowSpan = rowSpan;
                    this.setRowAlign(element, "start");
                    style.msGridColumn = gridColumn;
                    style.msGridColumnSpan = gridColumnSpan;
                    style.zIndex = 2;
                    style.marginTop = top + "px";
                    element.setAttribute("data-block-visibility", "shown");
                    CommonJS.ArticleReader.ArticleReaderUtils.setFixedElementHeight(element);
                    top = top + element.offsetHeight
                }
                return top
            }, place: function place(element, column, columnSpan, rowAlign, context, top) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var gridColumnSpan = this.convertColumnSpanToGridColumnSpan(columnSpan);
                var gridColumn = this.convertColumnIndexToGridColumn(column, columnCount);
                this.placeInGrid(element, gridColumn, gridColumnSpan, "", 2, 2, rowAlign, null, top)
            }, placeInGrid: function placeInGrid(element, gridColumn, gridColumnSpan, gridColumnAlign, gridRow, gridRowSpan, gridRowAlign, zIndex, top) {
                var style = element.style;
                style.msGridRow = gridRow;
                style.msGridRowSpan = gridRowSpan;
                this.setRowAlign(element, gridRowAlign);
                style.msGridColumn = gridColumn;
                style.msGridColumnSpan = gridColumnSpan;
                style.msGridColumnAlign = gridColumnAlign;
                style.zIndex = zIndex || 2;
                if (typeof top === "number") {
                    style.marginTop = top + "px"
                }
                element.setAttribute("data-block-visibility", "shown");
                if (gridRowAlign === "end") {
                    CommonJS.ArticleReader.ArticleReaderUtils.setFixedElementHeight(element)
                }
            }, setRowAlign: function setRowAlign(element, rowAlign) {
                element.style.msGridRowAlign = rowAlign;
                element.setAttribute("data-location", rowAlign)
            }, convertColumnSpanToGridColumnSpan: function convertColumnSpanToGridColumnSpan(columnSpan) {
                return columnSpan * 2 - 1
            }, isTitleBlock: function isTitleBlock(renderableBlock) {
                return renderableBlock.position === -1
            }, checkHeadlineForOverflow: function checkHeadlineForOverflow(element, context, textContainerClassName) {
                if (element && textContainerClassName === "headlineText2") {
                    var divHeight = element.offsetHeight;
                    if (divHeight) {
                        var gridOptions = context.gridOptions;
                        var columnHeight = gridOptions.columnHeight;
                        var marginTop = element.currentStyle.marginTop;
                        if (marginTop) {
                            var top = parseFloat(marginTop);
                            if (top && top < columnHeight) {
                                divHeight = Math.min(divHeight, (columnHeight - top))
                            }
                        }
                        var textDiv = element.querySelector("." + textContainerClassName);
                        if (textDiv) {
                            var textHeight = textDiv.offsetHeight;
                            if (textHeight && textHeight > divHeight) {
                                var currentStyle = textDiv.currentStyle;
                                var fontSize = currentStyle.fontSize;
                                var lineHeight = currentStyle.lineHeight;
                                if (fontSize && lineHeight) {
                                    var ratio = divHeight / textHeight;
                                    var size = parseFloat(fontSize);
                                    var lHeight = parseFloat(lineHeight);
                                    var sizeSuffix = fontSize.replace(size, "");
                                    var lineHeightSuffix = lineHeight.replace(lHeight, "");
                                    size = (size * ratio).toFixed(1);
                                    lHeight = (lHeight * ratio).toFixed(1);
                                    textDiv.style.fontSize = size + sizeSuffix;
                                    textDiv.style.lineHeight = lHeight + lineHeightSuffix
                                }
                                element.style.height = divHeight + "px"
                            }
                        }
                    }
                }
            }, createLayoutProperties: function createLayoutProperties(width, height, textAttributes, inlineAdCount) {
                var resolutionKey = width + "_" + height;
                var textAttributesKey = textAttributes ? this._createTextAttributesKey(textAttributes) : null;
                var layoutProperties = {};
                if (resolutionKey) {
                    layoutProperties.r = resolutionKey
                }
                if (textAttributesKey) {
                    layoutProperties.t = textAttributesKey
                }
                if (typeof inlineAdCount === "number") {
                    layoutProperties.i = inlineAdCount + ""
                }
                return layoutProperties
            }, getItemIndexByLayoutProperties: function getItemIndexByLayoutProperties(listOfItems, layoutProperties) {
                function contains(p1, p2) {
                    var contains = false;
                    if (p1 && p2) {
                        contains = true;
                        for (var k in p2) {
                            if (p1[k] !== p2[k]) {
                                contains = false;
                                break
                            }
                        }
                    }
                    else if (!p2) {
                        contains = true
                    }
                    return contains
                }
                ;
                if (listOfItems && listOfItems.length) {
                    for (var i = 0, len = listOfItems.length; i < len; i++) {
                        if (contains(listOfItems[i].properties, layoutProperties)) {
                            return i
                        }
                    }
                }
                return -1
            }, doTextAttributesMatch: function doTextAttributesMatch(layoutProperties, textAttributes) {
                var key = this._createTextAttributesKey(textAttributes);
                var match = (layoutProperties.t === key);
                return match
            }, doExclusionsOverlap: function doExclusionsOverlap(ex1, ex2, gridOptions) {
                var columnHeight = gridOptions.columnHeight;
                var overlap = (ex1.height && ex2.height && (ex1.rowAlign === ex2.rowAlign) && (ex1.column < ex2.column + ex2.columnSpan) && (ex2.column < ex1.column + ex1.columnSpan)) || (ex1.height && ex2.height && (ex1.rowAlign !== ex2.rowAlign) && (ex1.column < ex2.column + ex2.columnSpan) && (ex2.column < ex1.column + ex1.columnSpan) && (ex1.height + ex2.height > columnHeight));
                return overlap
            }, convertDateToString: function convertDateToString(date) {
                var str = "";
                if (date) {
                    if (typeof (date) === "string") {
                        str = date
                    }
                    else if (date.utctime) {
                        str = AppEx.Common.ArticleReader.DateFormatter.formatDate(date.utctime)
                    }
                }
                return str
            }, getEffectiveDate: function getEffectiveDate(title) {
                var date = title.date;
                var lastUpdatedDate = title.lastUpdatedDate;
                var effectiveDate = lastUpdatedDate || date || null;
                return effectiveDate
            }, getActionElement: function getActionElement(viewMechanism, toNextArticle) {
                switch (viewMechanism) {
                    case this.viewMechanism.nextTouch:
                        return toNextArticle ? this.actionElement.nextArticleTouch : this.actionElement.nextPageTouch;
                    case this.viewMechanism.nextClickKeyboard:
                        return toNextArticle ? this.actionElement.nextArticleClickKeyboard : this.actionElement.nextPageClickKeyboard;
                    case this.viewMechanism.previousTouch:
                        return toNextArticle ? this.actionElement.prevArticleTouch : this.actionElement.prevPageTouch;
                    case this.viewMechanism.previousClickKeyboard:
                        return toNextArticle ? this.actionElement.prevArticleClickKeyboard : this.actionElement.prevPageClickKeyboard;
                    case this.viewMechanism.touchSwipe:
                        return toNextArticle ? this.actionElement.touchSwipeArticle : this.actionElement.touchSwipePage;
                    case this.viewMechanism.mouseScroll:
                        return toNextArticle ? this.actionElement.mouseScrollArticle : this.actionElement.mouseScrollPage;
                    case this.viewMechanism.eoabNext:
                        return this.actionElement.eoabNext;
                    case this.viewMechanism.eoabShare:
                        return this.actionElement.eoabShare;
                    case this.viewMechanism.eoabSubscribe:
                        return this.actionElement.eoabSubscribe;
                    case this.viewMechanism.eoabMoreFrom:
                        return this.actionElement.eoabMoreFrom;
                    case this.viewMechanism.eoabOther:
                        return this.actionElement.eoabOther
                }
                return ""
            }, logUserAction: function logUserAction(actionContext, element, navMethod, attributes) {
                navMethod = navMethod || PlatformJS.Utilities.getLastClickUserActionMethod();
                PlatformJS.deferredTelemetry(function _logUserAction() {
                    if (attributes) {
                        Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, actionContext, element, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, navMethod, 0, JSON.stringify(attributes))
                    }
                    else {
                        Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserAction(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, actionContext, element, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, navMethod, 0)
                    }
                })
            }, actionElement: {
                nextPageTouch: "Next Flipper Page - Touch", nextPageClickKeyboard: "Next Flipper Page - Click /Keyboard", nextArticleTouch: "Next Flipper Article - Touch", nextArticleClickKeyboard: "Next Flipper Article - Click/Keyboard", prevPageTouch: "Previous Flipper Page - Touch", prevPageClickKeyboard: "Previous Flipper Page - Click /Keyboard", prevArticleTouch: "Previous Flipper Article - Touch", prevArticleClickKeyboard: "Previous Flipper Article - Click/Keyboard", eoabNext: "EOAB - Next", eoabShare: "EOAB - Share", eoabSubscribe: "EOAB - Subscribe", eoabMoreFrom: "EOAB - More From", eoabOther: "EOAB - Other", touchSwipePage: "Swipe - Page", touchSwipeArticle: "Swipe - Article", mouseScrollPage: "Scroll - Page", mouseScrollArticle: "Scroll - Article"
            }, viewMechanism: {
                unkown: "unknown", nextTouch: "nextTouch", nextClickKeyboard: "nextClickKeyboard", previousTouch: "previousTouch", previousClickKeyboard: "previousClickKeyboard", eoabNext: "eoabNext", eoabprevious: "eoabPrevious", eoabShare: "eoabShare", eoabSubscribe: "eoabSubscribe", eoabMoreFrom: "eoabMoreFrom", eoabOther: "eoabOther", touchSwipe: "touchSwipe", mouseScroll: "mouseScroll"
            }, sortRenderableBlocks: function sortRenderableBlocks(renderableBlocks) {
                renderableBlocks.sort(function _ArticleReaderUtils_1373(a, b) {
                    return a.position - b.position
                })
            }, getColumnLimits: function getColumnLimits(context, index, excludedRenderableBlocks) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var top = 0;
                var bottom = 0;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var blockElement = renderableBlock.element;
                    if (!blockElement) {
                        continue
                    }
                    var isHidden = (blockElement.getAttribute("data-block-visibility") === "hidden");
                    var isExcluded = (excludedRenderableBlocks.indexOf(renderableBlock) > -1);
                    var isOnColumn = CommonJS.ArticleReader.ArticleReaderUtils.isElementOnColumn(blockElement, index, columnCount);
                    if (!isExcluded && !isHidden && isOnColumn) {
                        var blockHeight = WinJS.Utilities.getTotalHeight(blockElement);
                        var blockAlign = blockElement.currentStyle.msGridRowAlign;
                        if (blockAlign === "start") {
                            top = Math.max(top, blockHeight)
                        }
                        else if (blockAlign === "end") {
                            bottom = Math.max(bottom, blockHeight)
                        }
                    }
                }
                var limits = {
                    top: top, bottom: bottom
                };
                return limits
            }, convertEntryPointEnum: function convertEntryPointEnum(code) {
                var entryPoint;
                switch (code) {
                    case 0:
                        entryPoint = "Today Pano";
                        break;
                    case 1:
                        entryPoint = "Partner Pano";
                        break;
                    case 2:
                        entryPoint = "Category";
                        break;
                    case undefined:
                    case null:
                        entryPoint = "Unspecified";
                        break;
                    default:
                        entryPoint = code;
                        break
                }
                return entryPoint
            }, convertSourceEnum: function convertSourceEnum(code) {
                var source;
                switch (code) {
                    case 0:
                        source = "Hero";
                        break;
                    case 1:
                        source = "Cluster";
                        break;
                    case 2:
                        source = "Protocol";
                        break;
                    case 3:
                        source = "Scroll-Swipe-Keyboard";
                        break;
                    case 4:
                        source = "Previous-Next";
                        break;
                    case 5:
                        source = "Next Flipper - Touch";
                        break;
                    case 6:
                        source = "Next Flipper – Click/Keyboard";
                        break;
                    case 7:
                        source = "Previous Flipper - Touch";
                        break;
                    case 8:
                        source = "Previous Flipper – Click/Keyboard";
                        break;
                    case 9:
                        source = "EOAB - Next";
                        break;
                    case 10:
                        source = "EOAB - Other";
                        break;
                    case 11:
                        source = "Swipe";
                        break;
                    case 12:
                        source = "Scroll";
                        break;
                    case 13:
                        source = "EOAB - Share";
                        break;
                    case 14:
                        source = "EOAB - Subscribe";
                        break;
                    case 15:
                        source = "EOAB - More From";
                        break;
                    case undefined:
                    case null:
                        source = "Unspecified";
                        break;
                    default:
                        source = code;
                        break
                }
                return source
            }, _convertVisibilityToInt: function _convertVisibilityToInt(visibility) {
                var int = -1;
                switch (visibility) {
                    case "hidden":
                        int = 0;
                        break;
                    case "shown":
                        int = 1;
                        break
                }
                return int
            }, _convertIntToVisibility: function _convertIntToVisibility(int) {
                var visibility = "";
                switch (int) {
                    case 0:
                        visibility = "hidden";
                        break;
                    case 1:
                        visibility = "shown";
                        break
                }
                return visibility
            }, _convertGridAlignToInt: function _convertGridAlignToInt(gridAlign) {
                var int = -1;
                switch (gridAlign) {
                    case "start":
                        int = 0;
                        break;
                    case "end":
                        int = 1;
                        break;
                    case "center":
                        int = 2;
                        break;
                    case "stretch":
                        int = 3;
                        break
                }
                return int
            }, _convertIntToGridAlign: function _convertIntToGridAlign(int) {
                var gridAlign = "";
                switch (int) {
                    case 0:
                        gridAlign = "start";
                        break;
                    case 1:
                        gridAlign = "end";
                        break;
                    case 2:
                        gridAlign = "center";
                        break;
                    case 3:
                        gridAlign = "stretch";
                        break
                }
                return gridAlign
            }, _getExclusion: function _getExclusion(startColumn, columns, heightForColumns, rowAlign, exclusions, gridOptions) {
                var exclusion = {
                    column: startColumn, columnSpan: columns, rowAlign: rowAlign, height: heightForColumns
                };
                var overlap = false;
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var testExclusion = exclusions[i];
                    overlap = overlap || this.doExclusionsOverlap(testExclusion, exclusion, gridOptions);
                    if (overlap) {
                        break
                    }
                }
                return overlap ? null : exclusion
            }, _createTextAttributesKey: function _createTextAttributesKey(textAttributes) {
                var key = textAttributes.style + "_" + textAttributes.size;
                return key
            }, convertGridColumnToColumnIndex: function convertGridColumnToColumnIndex(gridColumn, columnCount) {
                return Math.max(0, (gridColumn - 2 - (Math.floor(gridColumn / (columnCount * 2 + 1)))) / 2)
            }, _isColumnInRange: function _isColumnInRange(rangeStart, rangeSpan, columnIndex) {
                return (columnIndex >= rangeStart && columnIndex < rangeStart + rangeSpan)
            }, convertGridColumnSpanToColumnSpan: function convertGridColumnSpanToColumnSpan(gridColumnSpan) {
                var columnSpan = Math.floor((gridColumnSpan + 1) / 2);
                return columnSpan
            }, _convertLayoutToExclusion: function _convertLayoutToExclusion(renderableBlock, context) {
                var exclusion = this._getExclusionFromLayout(renderableBlock.layout, context.gridOptions);
                renderableBlock.exclusion = exclusion
            }, _getExclusionFromLayout: function _getExclusionFromLayout(layout, gridOptions) {
                var exclusion = null;
                if (layout) {
                    var columnCount = gridOptions.columnCount;
                    var exclusionColumn = this.convertGridColumnToColumnIndex(parseInt(layout.column) || 1, columnCount);
                    var exclusionColumnSpan = this.convertGridColumnSpanToColumnSpan(parseInt(layout.columnSpan) || 1);
                    exclusion = {
                        column: exclusionColumn, columnSpan: exclusionColumnSpan, rowAlign: layout.rowAlign, height: layout.height + layout.top + layout.bottom
                    }
                }
                return exclusion
            }, getKickerText: function getKickerText(renderableTitle, context) {
                var kicker = renderableTitle && renderableTitle.kicker;
                if (!kicker) {
                    if (context && context.data && context.data.title) {
                        kicker = context.data.title.deckhead || context.data.title.kicker
                    }
                }
                return kicker || ""
            }
        }
    })
})();
(function _TitleBlocks_7() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    var CommonUtils = CommonJS.Utils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TextRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var text = attributes.text;
                var textClassName = attributes.textClassName;
                var textStyles = attributes.textStyles;
                var textBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(textBlockElt, "textBlock titleBlock exclusion");
                var textElt = document.createElement("div");
                WinJS.Utilities.addClass(textElt, "text");
                textBlockElt.appendChild(textElt);
                textElt.innerText = text;
                if (textClassName) {
                    WinJS.Utilities.addClass(textElt, textClassName)
                }
                ARUtils.setStyles(textElt, textStyles);
                return textBlockElt
            }
        }, GrowlRenderer: {
            render: function render(renderableBlock, context) {
                var growlMessage = renderableBlock.block.attributes.growlMessage;
                var growlMessageContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(growlMessageContainerElt, "growlMessageBlock exclusion");
                var growlMessageElt = document.createElement("div");
                WinJS.Utilities.addClass(growlMessageElt, "growlMessage");
                growlMessageElt.innerText = growlMessage;
                growlMessageContainerElt.appendChild(growlMessageElt);
                return growlMessageContainerElt
            }
        }, NullRenderer: {
            render: function render(renderableBlock, context) {
                var elt = document.createElement("div");
                elt.style.display = "none";
                return elt
            }
        }, RectRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var blockClassName = attributes.blockClassName;
                var rectClassName = attributes.rectClassName;
                var rectStyles = attributes.rectStyles;
                var rectBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(rectBlockElt, "rectBlock exclusion");
                rectBlockElt.setAttribute("data-block-hasheight", "true");
                var rectElt = document.createElement("div");
                WinJS.Utilities.addClass(rectElt, "rect");
                rectBlockElt.appendChild(rectElt);
                if (blockClassName) {
                    WinJS.Utilities.addClass(rectBlockElt, blockClassName)
                }
                if (rectClassName) {
                    WinJS.Utilities.addClass(rectElt, rectClassName)
                }
                ARUtils.setStyles(rectElt, rectStyles);
                return rectBlockElt
            }
        }, ImageRenderer: {
            render: function render(renderableBlock, context) {
                var auxiliaryData = context.auxiliaryData;
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var altText = attributes.altText;
                var attribution = attributes.attribution;
                var isSlideshowTarget = attributes.isSlideshowTarget;
                var cacheId = attributes.cacheId;
                var placeholder = attributes.placeholder;
                var highResUrl = attributes.highResUrl;
                var lowResUrl = attributes.lowResUrl;
                var imageContainerClassName = attributes.imageContainerClassName;
                var imageStyles = attributes.imageStyles;
                var imageBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(imageBlockElt, "imageBlock exclusion");
                imageBlockElt.setAttribute("data-block-hasheight", "true");
                var imageContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(imageContainerElt, "imageContainer");
                if (imageContainerClassName) {
                    WinJS.Utilities.addClass(imageContainerElt, imageContainerClassName)
                }
                imageBlockElt.appendChild(imageContainerElt);
                var imageElt = document.createElement("div");
                WinJS.Utilities.addClass(imageElt, "image");
                var imageSource = new WinJS.Promise(function titleBlocks_imageSourceDelayLoader(complete) {
                    renderableBlock.imageDimensionReady = function titleBlock_imageDimensionReady(width, height) {
                        if (imageContainerClassName === ARUtils.imageContainerClassName.title && highResUrl && ARUtils.getRightSizeArticleReaderImages()) {
                            highResUrl = CommonUtils.getResizedImageUrlWithMode(CommonUtils.removeImageUrlResizeTags(highResUrl), width, height, 6)
                        }
                        complete(ARUtils.getImageCardSourceFromUrl(lowResUrl, highResUrl, cacheId))
                    }
                });
                var options = {
                    alternateText: altText, imageSource: imageSource, classification: placeholder
                };
                var imageCard = new CommonJS.ImageCard(imageElt, options);
                ARUtils.setStyles(imageElt, imageStyles);
                if (attribution) {
                    var attributionElt = document.createElement("div");
                    WinJS.Utilities.addClass(attributionElt, "attribution");
                    imageContainerElt.appendChild(attributionElt);
                    new CommonJS.ImageAttribution(attributionElt, {
                        flyout: {
                            label: attribution, placement: "top", alignment: (window.getComputedStyle(document.body).direction === "rtl") ? "left" : "right"
                        }
                    });
                    attributionElt.addEventListener("click", function _TitleBlocks_183(event) {
                        event.stopPropagation()
                    })
                }
                if (isSlideshowTarget) {
                    var slideshowData = auxiliaryData.slideshowData;
                    var instrumentationId = auxiliaryData.articleMetadata && auxiliaryData.articleMetadata.instrumentationId;
                    var anchorElt = document.createElement("a");
                    WinJS.Utilities.addClass(anchorElt, "anchor");
                    var target = ARUtils.launchSlideshow.bind(ARUtils, slideshowData, 0, cacheId, instrumentationId);
                    anchorElt.onclick = target;
                    anchorElt.href = "#";
                    imageContainerElt.appendChild(anchorElt);
                    anchorElt.appendChild(imageElt)
                }
                else {
                    imageContainerElt.appendChild(imageElt)
                }
                return imageBlockElt
            }
        }
    })
})();
(function _TitleStyle1Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle1Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var kickerBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: ARUtils.getKickerText(renderableTitle, context), textClassName: "kickerText kicker"
                    }
                };
                var headlineBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.headline, textClassName: "headlineText headline"
                    }
                };
                var anchorBarBlock = {
                    type: ARUtils.titleRectBlockType, attributes: {
                        rectClassName: "anchorBar", blockClassName: "anchorBarBlock"
                    }
                };
                var columnBlockerBlock = {
                    type: ARUtils.titleRectBlockType, attributes: { rectClassName: "columnBlockerBlock" }
                };
                var sourceLogoBlock = null;
                var hasSourceLogo = CommonJS.ArticleReader.ArticleReaderUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var publisher = renderableTitle.publisher;
                    var name = publisher.name;
                    var favicon = publisher.favicon;
                    var url = favicon.url;
                    sourceLogoBlock = {
                        type: "Image", attributes: {
                            altText: name, placeholder: "hidden", cacheId: cacheId, highResUrl: url, lowResUrl: null, imageContainerClassName: ARUtils.imageContainerClassName.logo
                        }
                    }
                }
                var blocks = {};
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["kicker"] = kickerBlock;
                blocks["headline"] = headlineBlock;
                blocks["anchorBar"] = anchorBarBlock;
                if (sourceLogoBlock) {
                    blocks["sourceLogo"] = sourceLogoBlock
                }
                blocks["columnBlocker"] = columnBlockerBlock;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var columnWidth = gridOptions.columnWidth;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var column = 0;
                var columnSpan = Math.min(2, columnCount);
                var elements = [author, date, kicker, headline];
                var top = ARUtils.stack(elements, column, columnSpan, context, false, false, 0);
                var growlBlock = titleRenderableBlocks.growl;
                if (growlBlock) {
                    ARUtils.place(growlBlock.element, column, 1, "start", context, top)
                }
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var gridColumnSpan = ARUtils.convertColumnSpanToGridColumnSpan(columnSpan);
                ARUtils.placeInGrid(anchorBar, 2, gridColumnSpan, "", 1, 1, "start");
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    columnBlocker.setAttribute("data-block-visibility", "shown");
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    CommonJS.ArticleReader.ArticleReaderUtils.place(columnBlocker, 0, 1, "end", context)
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }
        }
    })
})();
(function _TitleStyle2Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    var headlineTextClassName = "headlineText2";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle2Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var kickerBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: ARUtils.getKickerText(renderableTitle, context), textClassName: "kickerText kicker"
                    }
                };
                var headlineBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.headline, textClassName: headlineTextClassName + " headline"
                    }
                };
                var anchorBarBlock = {
                    type: ARUtils.titleRectBlockType, attributes: {
                        rectClassName: "anchorBar", blockClassName: "anchorBarBlock"
                    }
                };
                var columnBlockerBlock = {
                    type: ARUtils.titleRectBlockType, attributes: { rectClassName: "columnBlockerBlock" }
                };
                var sourceLogoBlock = null;
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var publisher = renderableTitle.publisher;
                    var name = publisher.name;
                    var favicon = publisher.favicon;
                    var url = favicon.url;
                    sourceLogoBlock = {
                        type: "Image", attributes: {
                            altText: name, placeholder: "hidden", cacheId: cacheId, highResUrl: url, lowResUrl: null, imageContainerClassName: ARUtils.imageContainerClassName.logo
                        }
                    }
                }
                var image = renderableTitle.titleImage.image;
                var slideshowData = auxiliaryData.slideshowData;
                var isSlideshowTarget = true;
                if (auxiliaryData.noSlideshow) {
                    isSlideshowTarget = false
                }
                var attribution = image.attribution || "";
                var caption = image.caption || "";
                var altText = image.altText || "";
                var captionAndAttribution = ARUtils.combineCaptionAndAttribution(caption, attribution);
                var originalImage = ARUtils.getImageResource(image);
                var lowResImage = ARUtils.getImageResource(image, "lowRes");
                var titleImageBlock = {
                    type: "Image", attributes: {
                        altText: altText, placeholder: "hidden", cacheId: cacheId, highResUrl: originalImage ? originalImage.url : null, lowResUrl: lowResImage ? lowResImage.url : null, imageContainerClassName: ARUtils.imageContainerClassName.title, attribution: captionAndAttribution, isSlideshowTarget: isSlideshowTarget
                    }
                };
                var blocks = {};
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["kicker"] = kickerBlock;
                blocks["headline"] = headlineBlock;
                blocks["anchorBar"] = anchorBarBlock;
                if (sourceLogoBlock) {
                    blocks["sourceLogo"] = sourceLogoBlock
                }
                blocks["titleImage"] = titleImageBlock;
                blocks["columnBlocker"] = columnBlockerBlock;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                if (this._isPortraitLayout(gridOptions)) {
                    this._calculateLayoutPortrait(titleRenderableBlocks, context)
                }
                else if (this._isBigLandscapeLayout(gridOptions)) {
                    this._calculateLayoutBigLandscape(titleRenderableBlocks, context)
                }
                else {
                    this._calculateLayoutLandscape(titleRenderableBlocks, context)
                }
            }, _calculateLayoutLandscape: function _calculateLayoutLandscape(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var renderableTitle = context.renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var imageWidth = columnMargin + (2 * columnWidth);
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth);
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                headline.style.width = (columnMargin + (columnWidth * 1.66)) + "px";
                var column = 0;
                var columnSpan = Math.min(2, columnCount);
                ARUtils.stack([titleImage, kicker, headline], column, columnSpan, context, true, false, 0);
                ARUtils.checkHeadlineForOverflow(headline, context, headlineTextClassName);
                kicker.style.zIndex = 4;
                headline.style.zIndex = 3;
                titleImage.style.zIndex = 3;
                ARUtils.placeInGrid(anchorBar, 2, 3, "start", 4, 1, "end");
                anchorBar.style.width = (columnMargin + (columnWidth * 1.5)) + "px";
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px"
                }
                var top = ARUtils.stack([author, date], 2, 1, context, false, false, 0);
                if (growlBlock) {
                    ARUtils.place(growlBlock.element, 2, 1, "start", context, top)
                }
                var columnBlockerStyle = columnBlocker.style;
                columnBlockerStyle.height = columnHeight + "px";
                columnBlocker.setAttribute("data-block-visibility", "shown");
                ARUtils.place(columnBlocker, 0, 2, "start", context);
                columnBlockerStyle.zIndex = 1
            }, _calculateLayoutBigLandscape: function _calculateLayoutBigLandscape(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var renderableTitle = context.renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var imageWidth = columnMargin + (2 * columnWidth);
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth);
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                var column = 0;
                var columnSpan = Math.min(2, columnCount);
                var top = ARUtils.stack([titleImage, kicker, headline], column, columnSpan, context, true, false, 0);
                ARUtils.checkHeadlineForOverflow(headline, context, headlineTextClassName);
                top = ARUtils.stack([author, date], column, 1, context, true, false, top);
                if (growlBlock) {
                    var columnInGrid = ARUtils.convertColumnIndexToGridColumn(column, columnCount);
                    ARUtils.placeInGrid(growlBlock.element, columnInGrid, 1, "start", 1, 1, "start", null, top)
                }
                headline.style.zIndex = 3;
                titleImage.style.zIndex = 3;
                ARUtils.placeInGrid(anchorBar, 2, 3, "start", 4, 1, "end");
                anchorBar.style.width = (columnMargin + (columnWidth * 1.5)) + "px";
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    columnBlocker.setAttribute("data-block-visibility", "shown");
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    ARUtils.place(columnBlocker, 0, 1, "end", context)
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }, _calculateLayoutPortrait: function _calculateLayoutPortrait(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var rightMargin = gridOptions.rightMargin;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var imageWidth = leftMargin + (columnCount * columnWidth) + ((columnCount - 1) * columnMargin) + rightMargin;
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth);
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                var column = 0;
                var columnSpan = Math.min(columnCount * 2 + 1, columnCount);
                var elements = [titleImage, kicker, headline, author, date];
                var top = ARUtils.stack(elements, column, columnSpan, context, true, false, 0);
                titleImage.style.msGridColumn = 1;
                titleImage.style.msGridColumnSpan = columnCount * 2 + 1;
                if (growlBlock) {
                    var columnInGrid = ARUtils.convertColumnIndexToGridColumn(column, columnCount);
                    ARUtils.placeInGrid(growlBlock.element, columnInGrid, 1, "start", 1, 1, "start", null, top)
                }
                headline.style.zIndex = 3;
                titleImage.style.zIndex = 3;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                ARUtils.placeInGrid(anchorBar, 2, 1, "start", 4, 1, "end");
                anchorBar.style.width = (columnMargin + columnWidth) + "px";
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    columnBlocker.setAttribute("data-block-visibility", "shown");
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    ARUtils.place(columnBlocker, 0, 1, "end", context)
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }, _isPortraitLayout: function _isPortraitLayout(gridOptions) {
                var isPortraitLayout = gridOptions.pageWidth < gridOptions.pageHeight;
                return isPortraitLayout
            }, _isBigLandscapeLayout: function _isBigLandscapeLayout(gridOptions) {
                var isBigLandscapeLayout = !this._isPortraitLayout(gridOptions) && gridOptions.pageHeight >= 900;
                return isBigLandscapeLayout
            }, _getImageHeightAndFit: function _getImageHeightAndFit(context, imageWidth) {
                var renderData = context.renderData;
                var titleBlock = renderData.renderableTitle;
                var image = titleBlock.titleImage.image;
                var imageResource = ARUtils.getImageResource(image);
                var originalWidth = parseInt(imageResource.width);
                var originalHeight = parseInt(imageResource.height);
                var imageHeight = imageWidth * originalHeight / originalWidth;
                var aspectRatio = imageWidth / imageHeight;
                var imageFit = "both";
                if (aspectRatio < 1.62) {
                    imageFit = "width";
                    imageHeight = imageWidth / 1.62
                }
                else if (aspectRatio > 1.62) {
                    imageFit = "height";
                    imageHeight = imageWidth / 1.62
                }
                return {
                    height: imageHeight, fit: imageFit
                }
            }
        }
    })
})();
(function _TitleStyle200Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    var headlineTextClassName = "headlineText2";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle200Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: "Text", attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: "Text", attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var kickerBlock = {
                    type: "Text", attributes: {
                        text: ARUtils.getKickerText(renderableTitle, context), textClassName: "kickerText"
                    }
                };
                var columnBlockerBlock = {
                    type: "Rect", attributes: { rectClassName: "columnBlockerBlock" }
                };
                var blocks = {};
                var headlineBlock;
                if (renderableTitle.titleImage) {
                    var image = renderableTitle.titleImage.image;
                    var slideshowData = auxiliaryData.slideshowData;
                    var isSlideshowTarget = true;
                    if (auxiliaryData.noSlideshow) {
                        isSlideshowTarget = false
                    }
                    var attribution = image.attribution || "";
                    var caption = image.caption || "";
                    var altText = image.altText || "";
                    var captionAndAttribution = ARUtils.combineCaptionAndAttribution(caption, attribution);
                    var originalImage = ARUtils.getImageResource(image);
                    var lowResImage = ARUtils.getImageResource(image, "lowRes");
                    var titleImageBlock = {
                        type: "Image", attributes: {
                            altText: altText, placeholder: "hidden", cacheId: cacheId, highResUrl: originalImage ? originalImage.url : null, lowResUrl: lowResImage ? lowResImage.url : null, imageContainerClassName: ARUtils.imageContainerClassName.title, attribution: captionAndAttribution, isSlideshowTarget: isSlideshowTarget
                        }
                    };
                    headlineTextClassName = "headlineText2";
                    headlineBlock = {
                        type: "Text", attributes: {
                            text: renderableTitle.headline, textClassName: headlineTextClassName
                        }
                    };
                    blocks["titleImage"] = titleImageBlock
                }
                else {
                    headlineTextClassName = "headlineText";
                    headlineBlock = {
                        type: "Text", attributes: {
                            text: renderableTitle.headline, textClassName: headlineTextClassName
                        }
                    }
                }
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["kicker"] = kickerBlock;
                blocks["headline"] = headlineBlock;
                blocks["columnBlocker"] = columnBlockerBlock;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                if (this._isPortraitLayout(gridOptions)) {
                    this._calculateLayoutPortrait(titleRenderableBlocks, context)
                }
                else {
                    this._calculateLayoutLandscape(titleRenderableBlocks, context)
                }
            }, _calculateLayoutLandscape: function _calculateLayoutLandscape(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var pageHeight = gridOptions.pageHeight;
                var topMargin = gridOptions.topMargin;
                var renderableTitle = context.renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var hasTitleImage = titleRenderableBlocks["titleImage"] ? true : false;
                var top = topMargin;
                if (hasTitleImage) {
                    var titleImage = titleRenderableBlocks["titleImage"].element;
                    var imageWidth = leftMargin + columnMargin + (2 * columnWidth);
                    var imageHeight = this._getImageHeight(context, imageWidth, pageHeight);
                    var titleImageStyle = titleImage.style;
                    titleImageStyle.width = imageWidth + "px";
                    titleImageStyle.height = imageHeight + "px";
                    var column = 1;
                    var columnSpan = Math.min(4, columnCount);
                    top = ARUtils.stack([titleImage, kicker], column, columnSpan, context, true, true, 0);
                    titleImage.style.zIndex = 3
                }
                var column = 0;
                var columnSpan = Math.min(2, columnCount);
                var headlineStyle = headline.style;
                if (hasTitleImage) {
                    headlineStyle.marginRight = 1.5 * columnMargin + "px"
                }
                ARUtils.stack([headline], column, columnSpan, context, true, false, top);
                if (hasTitleImage) {
                    columnBlocker.style.height = columnHeight + topMargin - top + "px";
                    top = ARUtils.stack([columnBlocker], column, columnSpan, context, true, false, top);
                    columnBlocker.style.zIndex = 1
                }
                var authorDateBlockHeight = 80;
                var offset = columnHeight - authorDateBlockHeight;
                ARUtils.stack([author, date], column, 1, context, false, false, offset);
                headline.style.zIndex = 3
            }, _calculateLayoutPortrait: function _calculateLayoutPortrait(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var rightMargin = gridOptions.rightMargin;
                var pageHeight = gridOptions.pageHeight;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var hasTitleImage = titleRenderableBlocks["titleImage"] ? true : false;
                if (hasTitleImage) {
                    var titleImage = titleRenderableBlocks["titleImage"].element;
                    var imageWidth = leftMargin + (columnCount * columnWidth) + ((columnCount - 1) * columnMargin) + rightMargin;
                    var imageHeight = this._getImageHeight(context, imageWidth, pageHeight);
                    var titleImageStyle = titleImage.style;
                    titleImageStyle.width = imageWidth + "px";
                    titleImageStyle.height = imageHeight + "px"
                }
                var column = 0;
                var columnSpan = Math.min(columnCount * 2 + 1, columnCount);
                if (hasTitleImage) {
                    var elements = [titleImage, kicker, headline];
                    ARUtils.stack(elements, column, columnSpan, context, true, false, 0);
                    titleImage.style.msGridColumn = 1;
                    titleImage.style.msGridColumnSpan = columnCount * 2 + 1;
                    titleImage.style.zIndex = 3
                }
                else {
                    var elements = [headline];
                    ARUtils.stack(elements, column, columnSpan, context, false, false, 0)
                }
                headline.style.zIndex = 3;
                var authorDateBlockHeight = 80;
                var offset = columnHeight - authorDateBlockHeight;
                ARUtils.stack([author, date], column, 1, context, false, false, offset)
            }, _isPortraitLayout: function _isPortraitLayout(gridOptions) {
                return (gridOptions.pageWidth < gridOptions.pageHeight)
            }, _getImageHeight: function _getImageHeight(context, imageWidth, pageHeight) {
                var renderData = context.renderData;
                var titleBlock = renderData.renderableTitle;
                var image = titleBlock.titleImage.image;
                var imageResource = ARUtils.getImageResource(image);
                var originalWidth = parseInt(imageResource.width);
                var originalHeight = parseInt(imageResource.height);
                var imageHeight = imageWidth * originalHeight / originalWidth;
                if (imageHeight > (pageHeight * 0.6)) {
                    imageHeight = pageHeight * 0.6
                }
                return imageHeight
            }
        }
    })
})();
(function _TitleStyle9Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle9Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var kickerBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: ARUtils.getKickerText(renderableTitle, context), textClassName: "kickerText kicker"
                    }
                };
                var headlineBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.headline, textClassName: "headlineText headline"
                    }
                };
                var anchorBarBlock = {
                    type: ARUtils.titleRectBlockType, attributes: {
                        rectClassName: "anchorBar", blockClassName: "anchorBarBlock"
                    }
                };
                var columnBlockerBlock = {
                    type: ARUtils.titleRectBlockType, attributes: { rectClassName: "columnBlockerBlock" }
                };
                var columnBlockerBlock2 = {
                    type: ARUtils.titleRectBlockType, attributes: { rectClassName: "columnBlockerBlock" }
                };
                var sourceLogoBlock = null;
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var publisher = renderableTitle.publisher;
                    var name = publisher.name;
                    var favicon = publisher.favicon;
                    var url = favicon.url;
                    sourceLogoBlock = {
                        type: "Image", attributes: {
                            altText: name, placeholder: "hidden", cacheId: cacheId, highResUrl: url, lowResUrl: null, imageContainerClassName: ARUtils.imageContainerClassName.logo
                        }
                    }
                }
                var image = renderableTitle.titleImage.image;
                var isSlideshowTarget = true;
                var slideshowData = auxiliaryData.slideshowData;
                if (auxiliaryData.noSlideshow) {
                    isSlideshowTarget = false
                }
                var attribution = image.attribution || "";
                var caption = image.caption || "";
                var altText = image.altText || "";
                var captionAndAttribution = ARUtils.combineCaptionAndAttribution(caption, attribution);
                var originalImage = ARUtils.getImageResource(image);
                var lowResImage = ARUtils.getImageResource(image, "lowRes");
                var titleImageBlock = {
                    type: "Image", attributes: {
                        altText: altText, placeholder: "hidden", cacheId: cacheId, highResUrl: originalImage ? originalImage.url : null, lowResUrl: lowResImage ? lowResImage.url : null, imageContainerClassName: ARUtils.imageContainerClassName.title, attribution: captionAndAttribution, isSlideshowTarget: isSlideshowTarget
                    }
                };
                var blocks = {};
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["kicker"] = kickerBlock;
                blocks["headline"] = headlineBlock;
                blocks["anchorBar"] = anchorBarBlock;
                if (sourceLogoBlock) {
                    blocks["sourceLogo"] = sourceLogoBlock
                }
                blocks["titleImage"] = titleImageBlock;
                blocks["columnBlocker"] = columnBlockerBlock;
                blocks["columnBlocker2"] = columnBlockerBlock2;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                if (this._isPortraitLayout(gridOptions)) {
                    this._calculateLayoutPortrait(titleRenderableBlocks, context)
                }
                else {
                    this._calculateLayoutLandscape(titleRenderableBlocks, context)
                }
            }, _isPortraitLayout: function _isPortraitLayout(gridOptions) {
                var isPortraitLayout = (gridOptions.pageWidth < gridOptions.pageHeight) && (gridOptions.pageHeight > 1300);
                return isPortraitLayout
            }, _calculateLayoutPortrait: function _calculateLayoutPortrait(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var topMargin = gridOptions.topMargin;
                var bottomMargin = gridOptions.bottomMargin;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var columnBlocker2 = titleRenderableBlocks["columnBlocker2"].element;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var column = 0;
                var columnSpan = Math.min(3, columnCount);
                var elements = [author, date, kicker, headline];
                var top = ARUtils.stack(elements, column, columnSpan, context, false, false, 0);
                if (growlBlock) {
                    var growl = growlBlock.element;
                    ARUtils.place(growl, column, 1, "start", context, top);
                    top += growl.offsetHeight
                }
                ARUtils.placeInGrid(anchorBar, 2, columnSpan * 2 - 1, "", 1, 1, "start");
                var imageWidth = leftMargin + (columnWidth < 550 ? columnWidth : columnWidth * 0.5);
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth, (2 / 3));
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                var imageTopMargin = top;
                columnBlocker2.style.height = imageTopMargin + "px";
                columnBlocker2.setAttribute("data-block-visibility", "shown");
                ARUtils.stack([columnBlocker2, titleImage], 1, 2, context, false, true, 0);
                columnBlocker2.style.zIndex = 1;
                columnBlocker2.style.height = imageTopMargin + titleImage.offsetHeight + 20 + "px";
                columnBlocker2.style.width = titleImage.offsetWidth + 20 + "px";
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    ARUtils.place(columnBlocker, 0, 1, "end", context);
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    columnBlocker.setAttribute("data-block-visibility", "shown")
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }, _calculateLayoutLandscape: function _calculateLayoutLandscape(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var topMargin = gridOptions.topMargin;
                var bottomMargin = gridOptions.bottomMargin;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var columnBlocker2 = titleRenderableBlocks["columnBlocker2"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var imageWidth = leftMargin + columnWidth;
                var targetAspectRatio = Math.max((2 / 3) / 1.1, (imageWidth / (columnHeight + topMargin + bottomMargin)));
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth, targetAspectRatio);
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                titleImageStyle.marginTop = "";
                columnBlocker2.style.height = columnHeight + "px";
                columnBlocker2.setAttribute("data-block-visibility", "shown");
                ARUtils.stack([titleImage, columnBlocker2], 1, 2, context, true, true, 0);
                var column = 1;
                var columnSpan = Math.min(3, columnCount - 1);
                var elements = [anchorBar, author, date, kicker, headline];
                var top = ARUtils.stack(elements, column, columnSpan, context, true, false, 0);
                if (growlBlock) {
                    var columnInGrid = ARUtils.convertColumnIndexToGridColumn(column, columnCount);
                    ARUtils.placeInGrid(growlBlock.element, columnInGrid, 1, "start", 1, 1, "start", null, top)
                }
                headline.style.zIndex = 3;
                titleImage.style.zIndex = 3;
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    ARUtils.place(sourceLogo, 1, 1, "end", context);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    ARUtils.place(columnBlocker, 1, 1, "end", context);
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    columnBlocker.setAttribute("data-block-visibility", "shown")
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }, _getImageHeightAndFit: function _getImageHeightAndFit(context, imageWidth, targetAspectRatio) {
                var renderData = context.renderData;
                var titleBlock = renderData.renderableTitle;
                var image = titleBlock.titleImage.image;
                var imageResource = ARUtils.getImageResource(image);
                var originalWidth = parseInt(imageResource.width);
                var originalHeight = parseInt(imageResource.height);
                var imageHeight = imageWidth * originalHeight / originalWidth;
                var aspectRatio = imageWidth / imageHeight;
                var imageFit = "both";
                if (aspectRatio < targetAspectRatio) {
                    imageFit = "width";
                    imageHeight = imageWidth / targetAspectRatio
                }
                else if (aspectRatio > targetAspectRatio) {
                    imageFit = "height";
                    imageHeight = imageWidth / targetAspectRatio
                }
                return {
                    height: imageHeight, fit: imageFit
                }
            }
        }
    })
})();
(function _TitleStyle900Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle900Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: "Text", attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: "Text", attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var headlineBlock = {
                    type: "Text", attributes: {
                        text: renderableTitle.headline, textClassName: "headlineText"
                    }
                };
                var columnBlockerBlock = {
                    type: "Rect", attributes: { rectClassName: "columnBlockerBlock" }
                };
                var columnBlockerBlock2 = {
                    type: "Rect", attributes: { rectClassName: "columnBlockerBlock" }
                };
                var image = renderableTitle.titleImage.image;
                var isSlideshowTarget = true;
                var slideshowData = auxiliaryData.slideshowData;
                if (auxiliaryData.noSlideshow) {
                    isSlideshowTarget = false
                }
                var attribution = image.attribution || "";
                var caption = image.caption || "";
                var altText = image.altText || "";
                var captionAndAttribution = CommonJS.ArticleReader.ArticleReaderUtils.combineCaptionAndAttribution(caption, attribution);
                var originalImage = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image);
                var lowResImage = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image, "lowRes");
                var titleImageBlock = {
                    type: "Image", attributes: {
                        altText: altText, placeholder: "hidden", cacheId: cacheId, highResUrl: originalImage ? originalImage.url : null, lowResUrl: lowResImage ? lowResImage.url : null, imageContainerClassName: ARUtils.imageContainerClassName.title, attribution: captionAndAttribution, isSlideshowTarget: isSlideshowTarget
                    }
                };
                var blocks = {};
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["headline"] = headlineBlock;
                blocks["titleImage"] = titleImageBlock;
                blocks["columnBlocker"] = columnBlockerBlock;
                blocks["columnBlocker2"] = columnBlockerBlock2;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                if (this._isPortraitLayout(gridOptions)) {
                    this._calculateLayoutPortrait(titleRenderableBlocks, context)
                }
                else {
                    this._calculateLayoutLandscape(titleRenderableBlocks, context)
                }
            }, _isPortraitLayout: function _isPortraitLayout(gridOptions) {
                var isPortraitLayout = gridOptions.pageWidth < gridOptions.pageHeight;
                return isPortraitLayout
            }, _calculateLayoutPortrait: function _calculateLayoutPortrait(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var topMargin = gridOptions.topMargin;
                var bottomMargin = gridOptions.bottomMargin;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var columnBlocker2 = titleRenderableBlocks["columnBlocker2"].element;
                var column = 0;
                var columnSpan = Math.min(3, columnCount);
                var elements = [headline];
                CommonJS.ArticleReader.ArticleReaderUtils.stack(elements, column, columnSpan, context, false, false, 0);
                var imageWidth = leftMargin + (columnWidth < 550 ? columnWidth : columnWidth * 0.5);
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth, (2 / 3));
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                var imageTopMargin = headline.offsetHeight;
                columnBlocker2.style.height = imageTopMargin + "px";
                columnBlocker2.setAttribute("data-block-visibility", "shown");
                CommonJS.ArticleReader.ArticleReaderUtils.stack([columnBlocker2, titleImage], 1, 2, context, false, true, 0);
                columnBlocker2.style.zIndex = 1;
                columnBlocker2.style.height = imageTopMargin + titleImage.offsetHeight + 20 + "px";
                columnBlocker2.style.width = titleImage.offsetWidth + 20 + "px";
                var authorDateBlockHeight = 80;
                var offset = columnHeight - authorDateBlockHeight;
                CommonJS.ArticleReader.ArticleReaderUtils.stack([author, date], column, 1, context, false, false, offset)
            }, _calculateLayoutLandscape: function _calculateLayoutLandscape(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnMargin = gridOptions.columnMargin;
                var columnCount = gridOptions.columnCount;
                var leftMargin = gridOptions.leftMargin;
                var topMargin = gridOptions.topMargin;
                var bottomMargin = gridOptions.bottomMargin;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var titleImage = titleRenderableBlocks["titleImage"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var columnBlocker2 = titleRenderableBlocks["columnBlocker2"].element;
                var imageWidth = leftMargin + columnWidth;
                var targetAspectRatio = Math.max((2 / 3) / 1.1, (imageWidth / (columnHeight + topMargin + bottomMargin)));
                var imageHeightAndFit = this._getImageHeightAndFit(context, imageWidth, targetAspectRatio);
                var imageHeight = imageHeightAndFit.height;
                var titleImageStyle = titleImage.style;
                titleImageStyle.width = imageWidth + "px";
                titleImageStyle.height = imageHeight + "px";
                titleImageStyle.marginTop = "";
                columnBlocker2.style.height = columnHeight + "px";
                columnBlocker2.setAttribute("data-block-visibility", "shown");
                CommonJS.ArticleReader.ArticleReaderUtils.stack([titleImage, columnBlocker2], 1, 2, context, true, true, 0);
                var column = 1;
                var columnSpan = Math.min(3, columnCount - 1);
                var elements = [headline];
                CommonJS.ArticleReader.ArticleReaderUtils.stack(elements, column, columnSpan, context, true, false, topMargin);
                headline.style.zIndex = 3;
                titleImage.style.zIndex = 3;
                var authorDateBlockHeight = 80;
                var offset = columnHeight - authorDateBlockHeight;
                CommonJS.ArticleReader.ArticleReaderUtils.stack([author, date], column, 1, context, false, false, offset)
            }, _getImageHeightAndFit: function _getImageHeightAndFit(context, imageWidth, targetAspectRatio) {
                var renderData = context.renderData;
                var titleBlock = renderData.renderableTitle;
                var image = titleBlock.titleImage.image;
                var imageResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image);
                var originalWidth = parseInt(imageResource.width);
                var originalHeight = parseInt(imageResource.height);
                var imageHeight = imageWidth * originalHeight / originalWidth;
                var aspectRatio = imageWidth / imageHeight;
                var imageFit = "both";
                if (aspectRatio < targetAspectRatio) {
                    imageFit = "width";
                    imageHeight = imageWidth / targetAspectRatio
                }
                else if (aspectRatio > targetAspectRatio) {
                    imageFit = "height";
                    imageHeight = imageWidth / targetAspectRatio
                }
                return {
                    height: imageHeight, fit: imageFit
                }
            }
        }
    })
})();
(function _TitleStyle10Renderer_6() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle10Renderer: {
            render: function render(renderableTitle, context) {
                return null
            }, layout: function layout(titleRenderableBlocks, context) { }
        }
    })
})();
(function _TitleStyle100Renderer_6() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleStyle100Renderer: {
            render: function render(renderableTitle, context) {
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var authorBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.author, textClassName: "authorText"
                    }
                };
                var dateBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.date, textClassName: "dateText"
                    }
                };
                var kickerBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: ARUtils.getKickerText(renderableTitle, context), textClassName: "kickerText kicker"
                    }
                };
                var headlineBlock = {
                    type: ARUtils.titleTextBlockType, attributes: {
                        text: renderableTitle.headline, textClassName: "headlineText headline"
                    }
                };
                var anchorBarBlock = {
                    type: ARUtils.titleRectBlockType, attributes: {
                        rectClassName: "anchorBar", blockClassName: "anchorBarBlock"
                    }
                };
                var columnBlockerBlock = {
                    type: ARUtils.titleRectBlockType, attributes: { rectClassName: "columnBlockerBlock" }
                };
                var sourceLogoBlock = null;
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var publisher = renderableTitle.publisher;
                    var name = publisher.name;
                    var favicon = publisher.favicon;
                    var url = favicon.url;
                    sourceLogoBlock = {
                        type: "Image", attributes: {
                            altText: name, placeholder: "hidden", cacheId: cacheId, highResUrl: url, lowResUrl: null, imageContainerClassName: ARUtils.imageContainerClassName.logo
                        }
                    }
                }
                var blocks = {};
                blocks["author"] = authorBlock;
                blocks["date"] = dateBlock;
                blocks["kicker"] = kickerBlock;
                blocks["headline"] = headlineBlock;
                blocks["anchorBar"] = anchorBarBlock;
                if (sourceLogoBlock) {
                    blocks["sourceLogo"] = sourceLogoBlock
                }
                blocks["columnBlocker"] = columnBlockerBlock;
                return blocks
            }, layout: function layout(titleRenderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var columnWidth = gridOptions.columnWidth;
                var author = titleRenderableBlocks["author"].element;
                var date = titleRenderableBlocks["date"].element;
                var kicker = titleRenderableBlocks["kicker"].element;
                var headline = titleRenderableBlocks["headline"].element;
                var anchorBar = titleRenderableBlocks["anchorBar"].element;
                var columnBlocker = titleRenderableBlocks["columnBlocker"].element;
                var growlBlock = titleRenderableBlocks.growl;
                var column = 0;
                var columnSpan = Math.min(2, columnCount);
                var elements = [kicker, headline, author, date];
                var top = ARUtils.stack(elements, column, columnSpan, context, false, false, 0);
                if (growlBlock) {
                    ARUtils.place(growlBlock.element, column, 1, "start", context, top)
                }
                var gridColumnSpan = ARUtils.convertColumnSpanToGridColumnSpan(columnSpan);
                ARUtils.placeInGrid(anchorBar, 2, gridColumnSpan, "", 1, 1, "start");
                var hasSourceLogo = ARUtils.hasSourceLogo(renderableTitle);
                if (hasSourceLogo) {
                    var sourceLogo = titleRenderableBlocks["sourceLogo"].element;
                    var publisher = renderableTitle.publisher;
                    var favicon = publisher.favicon;
                    var width = favicon.width;
                    var height = favicon.height;
                    var effectiveHeight = Math.min(height, 30);
                    var effectiveWidth = Math.min(effectiveHeight * width / height, columnWidth);
                    ARUtils.place(sourceLogo, 0, 1, "end", context);
                    sourceLogo.style.height = effectiveHeight + "px";
                    sourceLogo.style.width = effectiveWidth + "px";
                    columnBlocker.setAttribute("data-block-visibility", "shown");
                    columnBlocker.style.height = effectiveHeight + 20 + "px";
                    ARUtils.place(columnBlocker, 0, 1, "end", context)
                }
                else {
                    columnBlocker.setAttribute("data-block-visibility", "hidden")
                }
            }
        }
    })
})();
(function _InlineRendererHelper_7() {
    "use strict";
    var maxCaptionFraction = 0.33;
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    var CommonUtils = CommonJS.Utils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InlineRendererHelper: {
            render: function render(renderableBlock, imageAttributes, context, icon, target) {
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId || "";
                var attribution = imageAttributes.attribution || "";
                var caption = imageAttributes.caption || "";
                var altText = imageAttributes.altText || "";
                var imageBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(imageBlockElt, "inlineImageBlock exclusion");
                var inlineContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(inlineContainerElt, "inlineContainer");
                imageBlockElt.appendChild(inlineContainerElt);
                var imageContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(imageContainerElt, "imageContainer");
                if (target) {
                    var anchorElt = document.createElement("a");
                    WinJS.Utilities.addClass(anchorElt, "anchor");
                    if (typeof target === "string") {
                        anchorElt.href = target
                    }
                    else if (typeof target === "function") {
                        anchorElt.onclick = target;
                        anchorElt.href = "#"
                    }
                    anchorElt.appendChild(imageContainerElt);
                    inlineContainerElt.appendChild(anchorElt)
                }
                else {
                    inlineContainerElt.appendChild(imageContainerElt)
                }
                var imageElt = document.createElement("div");
                WinJS.Utilities.addClass(imageElt, "image fitHeight anchorMiddle");
                imageContainerElt.appendChild(imageElt);
                if (icon) {
                    var iconElt = document.createElement("div");
                    iconElt.className = "icon win-command";
                    WinJS.Utilities.addClass(iconElt, icon);
                    var iconRing = document.createElement("div");
                    iconRing.className = "iconRing win-commandring win-commandicon";
                    var iconImage = document.createElement("div");
                    iconImage.className = "iconImage win-commandimage";
                    iconRing.appendChild(iconImage);
                    iconElt.appendChild(iconRing);
                    imageContainerElt.appendChild(iconElt)
                }
                var descriptionElt = document.createElement("div");
                WinJS.Utilities.addClass(descriptionElt, "description");
                inlineContainerElt.appendChild(descriptionElt);
                if (attribution) {
                    var attributionElt = document.createElement("span");
                    WinJS.Utilities.addClass(attributionElt, "attribution");
                    attributionElt.innerText = attribution;
                    descriptionElt.appendChild(attributionElt)
                }
                if (caption) {
                    var captionElt = document.createElement("span");
                    WinJS.Utilities.addClass(captionElt, "caption");
                    captionElt.innerText = caption;
                    descriptionElt.appendChild(captionElt)
                }
                var originalImageSource = ARUtils.getImageCardSource(imageAttributes, cacheId);
                var imageSource = new WinJS.Promise(function titleBlocks_imageSourceDelayLoader(complete) {
                    renderableBlock.imageDimensionReady = function titleBlock_imageDimensionReady(width, height) {
                        var highResUrl = originalImageSource.highResolutionUrl || originalImageSource.url;
                        if (highResUrl && ARUtils.getRightSizeArticleReaderImages()) {
                            highResUrl = CommonUtils.getResizedImageUrlWithMode(CommonUtils.removeImageUrlResizeTags(highResUrl), width, height, 6)
                        }
                        complete(ARUtils.getImageCardSourceFromUrl(originalImageSource.lowResolutionUrl, highResUrl, cacheId))
                    }
                });
                var imageCard = new CommonJS.ImageCard(imageElt, {
                    alternateText: " ", classification: "medium", imageSource: imageSource
                });
                return imageBlockElt
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var imageAttributes = attributes.image;
                var columnHeight = gridOptions.columnHeight;
                var imageResource = ARUtils.getImageResource(imageAttributes);
                var resourceWidth = parseInt(imageResource.width);
                var resourceHeight = parseInt(imageResource.height);
                var maxHeight = Math.min((1 - maxCaptionFraction) * columnHeight, resourceHeight);
                var maxWidth = maxHeight * resourceWidth / resourceHeight;
                var minWidth = 1;
                var estimatedMaxHeight = maxHeight + (maxCaptionFraction * columnHeight) + 20;
                var exclusion = ARUtils.getBestExclusion(startColumn, gridOptions, exclusions, maxWidth, estimatedMaxHeight, minWidth);
                return exclusion
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                var gridOptions = context.gridOptions;
                var exclusion = renderableBlock.exclusion;
                if (exclusion) {
                    var useHalfColumn = !aggregation;
                    var element = renderableBlock.element;
                    var style = element.style;
                    var block = renderableBlock.block;
                    var attributes = block.attributes;
                    var imageAttributes = attributes.image;
                    var columnHeight = gridOptions.columnHeight;
                    var columnWidth = gridOptions.columnWidth;
                    var columnSpan = exclusion.columnSpan;
                    var column = exclusion.column;
                    var imageResource = ARUtils.getImageResource(imageAttributes);
                    var resourceWidth = parseInt(imageResource.width);
                    var resourceHeight = parseInt(imageResource.height);
                    var columnLimits = ARUtils.getColumnLimits(context, column, [renderableBlock]);
                    var availableColumnHeight = Math.max(0, columnHeight - columnLimits.top - columnLimits.bottom);
                    var maxHeight = Math.min((1 - maxCaptionFraction) * availableColumnHeight, resourceHeight);
                    var maxWidth = maxHeight * resourceWidth / resourceHeight;
                    var containerWidth = ARUtils.convertColumnCountToWidth(columnSpan, gridOptions);
                    if (columnSpan === 1 && columnWidth > 550 && useHalfColumn) {
                        containerWidth = columnWidth * 0.50;
                        style.msGridColumnAlign = "start"
                    }
                    else {
                        style.msGridColumnAlign = ""
                    }
                    var imageWidth = Math.min(containerWidth, maxWidth);
                    var imageHeight = imageWidth * maxHeight / maxWidth;
                    var imageContainerElt = element.querySelector(".imageContainer");
                    var imageContainerStyle = imageContainerElt.style;
                    var imageDimensionReadyFunction = renderableBlock.imageDimensionReady;
                    if (typeof imageDimensionReadyFunction === "function") {
                        imageDimensionReadyFunction(imageWidth, imageHeight);
                        renderableBlock.imageDimensionReady = null
                    }
                    imageContainerStyle.width = imageWidth + "px";
                    imageContainerStyle.height = imageHeight + "px";
                    var imageElt = element.querySelector(".image");
                    var imageStyle = imageElt.style;
                    imageStyle.width = imageWidth + "px";
                    imageStyle.height = imageHeight + "px";
                    var inlineContainerElt = element.querySelector(".inlineContainer");
                    inlineContainerElt.style.width = containerWidth + "px";
                    var descriptionElt = element.querySelector(".description");
                    descriptionElt.style.maxHeight = (maxCaptionFraction * availableColumnHeight) + "px"
                }
            }
        }
    })
})();
(function _InlineImageRenderer_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InlineImageRenderer: {
            render: function render(renderableBlock, context) {
                var imageIndex = renderableBlock.imageIndex;
                var imageAttributes = renderableBlock.block.attributes.image;
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId;
                var target = null;
                if (!auxiliaryData.noSlideshow) {
                    var slideshowData = auxiliaryData.slideshowData;
                    var instrumentationId = auxiliaryData.articleMetadata && auxiliaryData.articleMetadata.instrumentationId;
                    target = CommonJS.ArticleReader.ArticleReaderUtils.launchSlideshow.bind(CommonJS.ArticleReader.ArticleReaderUtils, slideshowData, imageIndex, cacheId, instrumentationId)
                }
                return CommonJS.ArticleReader.InlineRendererHelper.render(renderableBlock, imageAttributes, context, null, target)
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                return CommonJS.ArticleReader.InlineRendererHelper.calculateLayout(renderableBlock, startColumn, gridOptions, exclusions)
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                CommonJS.ArticleReader.InlineRendererHelper.applyLayout(renderableBlock, aggregation, context)
            }
        }
    })
})();
(function _InlineSlideshowRenderer_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InlineSlideshowRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var imageAttributes = attributes.image;
                var icon = "slideshow";
                var target = function (event) {
                    U.logUserAction(U.actionContext.body, "Slideshow");
                    var options = new Windows.System.LauncherOptions;
                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(attributes.uri), options)
                };
                var element = CommonJS.ArticleReader.InlineRendererHelper.render(renderableBlock, imageAttributes, context, icon, target);
                return element
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                return CommonJS.ArticleReader.InlineRendererHelper.calculateLayout(renderableBlock, startColumn, gridOptions, exclusions, this)
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                CommonJS.ArticleReader.InlineRendererHelper.applyLayout(renderableBlock, aggregation, context)
            }
        }
    })
})();
(function _InlineVideoRenderer_7() {
    "use strict";
    var escapedSingleQuote = /\\'/gm;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InlineVideoRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var gridOptions = context.gridOptions;
                var video = attributes.video;
                var attribution = video.attribution.replace(escapedSingleQuote, '\'');
                var videoSource = video.videoSource;
                var externalVideoUrl = video.externalVideoSource;
                var videoBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(videoBlockElt, "inlineVideoBlock exclusion");
                var videoContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(videoContainerElt, "mediaPlaybackContainer");
                videoBlockElt.appendChild(videoContainerElt);
                var videoElt = document.createElement("div");
                WinJS.Utilities.addClass(videoElt, "video");
                videoContainerElt.appendChild(videoElt);
                var imageCardDiv = document.createElement("div");
                WinJS.Utilities.addClass(imageCardDiv, "rrMediaPlaybackImageCard");
                if (video.posterUrl) {
                    var imageElt = document.createElement("div");
                    var imageSource = {
                        url: video.posterUrl, cacheId: "PlatformImageCache"
                    };
                    WinJS.Utilities.addClass(imageElt, "image fitHeight anchorMiddle");
                    imageCardDiv.appendChild(imageElt);
                    var imageCard = new CommonJS.ImageCard(imageElt, {
                        alternateText: " ", classification: "medium", imageSource: imageSource
                    })
                }
                var playIcon = document.createElement("div");
                WinJS.Utilities.addClass(playIcon, "win-commandicon win-commandring mediaPlaybackPlayIcon");
                imageCardDiv.appendChild(playIcon);
                var adUnitId = null;
                var wrapper = new CommonJS.VideoWrapper(videoElt, {
                    subElement: imageCardDiv, videoOptions: {
                        title: attribution, videoSource: videoSource, fullscreen: "true", adUnitId: adUnitId, externalVideoUrl: externalVideoUrl
                    }, instrumentation: { actionContext: CommonJS.ArticleReader.ArticleReaderUtils.actionContext.body }
                });
                var attributionElt = document.createElement("div");
                WinJS.Utilities.addClass(attributionElt, "rrMediaPlaybackAttribution");
                attributionElt.innerText = attribution;
                videoContainerElt.appendChild(attributionElt);
                var auxiliaryData = context.auxiliaryData;
                var disposalManager = auxiliaryData.disposalManager;
                disposalManager.addDisposedDelegate(function _InlineVideoRenderer_91() { });
                disposalManager.addArticleFocusLostDelegate(function _InlineVideoRenderer_94() { });
                return videoBlockElt
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                var that = this;
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var video = attributes.video;
                var maxWidth = parseInt(video.width);
                var maxHeight = parseInt(video.height);
                var minWidth = 1;
                var estimatedMaxHeight = maxHeight + 250;
                var exclusion = CommonJS.ArticleReader.ArticleReaderUtils.getBestExclusion(startColumn, gridOptions, exclusions, maxWidth, estimatedMaxHeight, minWidth);
                return exclusion
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                var gridOptions = context.gridOptions;
                var exclusion = renderableBlock.exclusion;
                if (exclusion) {
                    var element = renderableBlock.element;
                    var block = renderableBlock.block;
                    var attributes = block.attributes;
                    var video = attributes.video;
                    var maxWidth = parseInt(video.width);
                    var maxHeight = parseInt(video.height);
                    var columnSpan = exclusion.columnSpan;
                    var videoWidth = Math.min(CommonJS.ArticleReader.ArticleReaderUtils.convertColumnCountToWidth(columnSpan, gridOptions), maxWidth);
                    var videoHeight = videoWidth * maxHeight / maxWidth;
                    var videoElt = element.querySelector(".video");
                    var videoStyle = videoElt.style;
                    videoStyle.width = videoWidth + "px";
                    videoStyle.height = videoHeight + "px"
                }
            }
        }
    })
})();
(function _ReferralRenderer_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ReferralRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var gridOptions = context.gridOptions;
                var columnMargin = gridOptions.columnMargin;
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId || "";
                var referral = attributes.referral;
                var url = referral.url;
                var url2 = referral.url2;
                var title = referral.title;
                var description = referral.description;
                var thumbnail = referral.thumbnail;
                var logo = referral.logo;
                var urlAction = referral.urlAction;
                var urlAction2 = referral.urlAction2;
                var referralBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(referralBlockElt, "referralBlock");
                var referralContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(referralContainerElt, "referralContainer");
                referralContainerElt.style.paddingLeft = columnMargin + "px";
                referralContainerElt.style.paddingRight = columnMargin + "px";
                referralBlockElt.appendChild(referralContainerElt);
                var image = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(thumbnail);
                var imageHeight = image.height;
                var imageElt = document.createElement("div");
                var imageSource = CommonJS.ArticleReader.ArticleReaderUtils.getImageCardSource(thumbnail, cacheId);
                WinJS.Utilities.addClass(imageElt, "referralImage fitHeight anchorMiddle");
                imageElt.style.height = imageHeight + "px";
                var imageCard = new CommonJS.ImageCard(imageElt, { imageSource: imageSource });
                referralContainerElt.appendChild(imageElt);
                var titleElt = document.createElement("div");
                WinJS.Utilities.addClass(titleElt, "referralTitle");
                titleElt.innerText = title;
                referralContainerElt.appendChild(titleElt);
                var descriptionElt = document.createElement("div");
                WinJS.Utilities.addClass(descriptionElt, "referralDescription");
                if (description) {
                    description = toStaticHTML(description)
                }
                descriptionElt.innerHTML = description;
                referralContainerElt.appendChild(descriptionElt);
                var visitElt = document.createElement("button");
                WinJS.Utilities.addClass(visitElt, "referralButton");
                visitElt.innerText = urlAction;
                (function createUriClickHandler(theReferral) {
                    visitElt.addEventListener("click", function _ReferralRenderer_71(event) {
                        var uri = new Windows.Foundation.Uri(theReferral.url);
                        Windows.System.Launcher.launchUriAsync(uri)
                    })
                })(referral);
                referralContainerElt.appendChild(visitElt);
                if (url2 && urlAction2) {
                    var visitElt2 = document.createElement("button");
                    WinJS.Utilities.addClass(visitElt2, "referralButton2");
                    visitElt2.innerText = urlAction2;
                    (function createUriClickHandler(theReferral) {
                        visitElt2.addEventListener("click", function _ReferralRenderer_86(event) {
                            var uri = new Windows.Foundation.Uri(theReferral.url2);
                            Windows.System.Launcher.launchUriAsync(uri)
                        })
                    })(referral);
                    referralContainerElt.appendChild(visitElt2)
                }
                var imageLogo = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(logo);
                var logoElt = document.createElement("div");
                WinJS.Utilities.addClass(logoElt, "referralLogo");
                var captionLogoElt = document.createElement("div");
                WinJS.Utilities.addClass(captionLogoElt, "referralLogoCaption");
                captionLogoElt.innerText = referral.logo.caption;
                logoElt.appendChild(captionLogoElt);
                var imageLogoElt = document.createElement("div");
                imageLogoElt.style.height = imageLogo.height + "px";
                imageLogoElt.style.width = imageLogo.width + "px";
                var imageLogoSource = CommonJS.ArticleReader.ArticleReaderUtils.getImageCardSource(logo, cacheId);
                var imageLogoCard = new CommonJS.ImageCard(imageLogoElt, { imageSource: imageLogoSource });
                logoElt.appendChild(imageLogoElt);
                referralContainerElt.appendChild(logoElt);
                return referralBlockElt
            }, layout: function layout(renderableBlock, surfaceManager, context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var element = renderableBlock.element;
                var page = surfaceManager.getLastPageWithEmptyLastColumn(context, true);
                var pageIndex = page.pageIndex;
                var column = (pageIndex + 1) * columnCount - 1;
                var style = element.style;
                style.msGridRow = 1;
                style.msGridRowSpan = 4;
                style.msGridColumn = CommonJS.ArticleReader.ArticleReaderUtils.convertColumnIndexToGridColumn(column, columnCount);
                style.msGridColumnSpan = 2;
                return true
            }
        }
    })
})();
(function _ExternalRenderer_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ExternalRenderer: {
            render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId || "";
                var renderOptions = { cacheId: cacheId };
                var controlType = attributes.controlType;
                var controlOptionsSerialized = attributes.controlOptionsSerialized;
                var controlOptions = JSON.parse(controlOptionsSerialized);
                var options = {
                    controlOptions: controlOptions, renderOptions: renderOptions
                };
                var control = PlatformJS.Utilities.createObject(controlType, null, options);
                var blockElt = document.createElement("div");
                WinJS.Utilities.addClass(blockElt, "externalBlock exclusion");
                var containerElt = document.createElement("div");
                WinJS.Utilities.addClass(containerElt, "externalContainer");
                blockElt.appendChild(containerElt);
                if (control) {
                    var controlElt = control.element;
                    containerElt.appendChild(controlElt)
                }
                return blockElt
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                var that = this;
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var maxWidth = attributes.maxWidth;
                var maxHeight = attributes.maxHeight;
                var minWidth = attributes.minWidth || 1;
                var placement = attributes.placement;
                var estimatedMaxHeight = maxHeight * 1.2;
                var exclusion = CommonJS.ArticleReader.ArticleReaderUtils.getBestExclusion(startColumn, gridOptions, exclusions, maxWidth, estimatedMaxHeight, minWidth);
                return exclusion
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                var gridOptions = context.gridOptions;
                var exclusion = renderableBlock.exclusion;
                if (exclusion) {
                    var element = renderableBlock.element;
                    var block = renderableBlock.block;
                    var attributes = block.attributes;
                    var maxWidth = attributes.maxWidth;
                    var maxHeight = attributes.maxHeight;
                    var containerElt = element.querySelector(".sized") || element.querySelector(".externalContainer");
                    var columnSpan = exclusion.columnSpan;
                    var blockWidth = Math.min(CommonJS.ArticleReader.ArticleReaderUtils.convertColumnCountToWidth(columnSpan, gridOptions), maxWidth);
                    var blockHeight = blockWidth * maxHeight / maxWidth;
                    containerElt.style.width = blockWidth + "px";
                    containerElt.style.height = blockHeight + "px"
                }
            }
        }
    })
})();
(function _ActionsRenderer_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ActionsRenderer: {
            _paywallProviderPromise: null, _instrumentationId: null, render: function render(renderableBlock, context) {
                var block = renderableBlock.block;
                var attributes = block.attributes;
                var articleActions = attributes.articleActions || {};
                var groupedArticleActions = attributes.groupedArticleActions || [];
                var actionsHandlerType = attributes.actionsHandlerType;
                var actionsHandler = PlatformJS.Utilities.createObject(actionsHandlerType);
                var auxiliaryData = context.auxiliaryData;
                var cacheId = auxiliaryData.cacheId || "";
                var articleMetadata = auxiliaryData.articleMetadata;
                var articleHeader = auxiliaryData.articleHeader;
                var gotoArticleDelegate = auxiliaryData.gotoArticleDelegate;
                var getPaywallProviderPromise = auxiliaryData.getPaywallProviderPromise;
                var instrumentationId = this._instrumentationId = (context.data && context.data.metadata && context.data.metadata.instrumentationId) || "";
                var partnerName = context.data && context.data.title && context.data.title.publisher && context.data.title.publisher.name;
                var eventListenerManager = new CommonJS.Utils.EventListenerManager("EOAB eventListenerManager");
                var actionsBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(actionsBlockElt, "actionsBlock exclusion");
                var actionsContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(actionsContainerElt, "actionsContainer");
                var customActionsElt = document.createElement("ol");
                WinJS.Utilities.addClass(customActionsElt, "actions");
                var generalActionsElt = document.createElement("ol");
                WinJS.Utilities.addClass(generalActionsElt, "actions");
                var headerTopBorderElt = document.createElement("div");
                WinJS.Utilities.addClass(headerTopBorderElt, "headerBorder");
                var parentHeaderBorderElt = document.createElement("li");
                parentHeaderBorderElt.appendChild(headerTopBorderElt);
                var buttonTopBorderElt = document.createElement("div");
                WinJS.Utilities.addClass(buttonTopBorderElt, "buttonBorder");
                var parentButtonTopBorderElt = document.createElement("li");
                parentButtonTopBorderElt.appendChild(buttonTopBorderElt);
                var nextElement = null;
                var previousElement = null;
                var multiElements = [];
                var singleElements = [];
                for (var actionKey in articleActions) {
                    var articleAction = articleActions[actionKey];
                    var type = articleAction.actionOptions.actionType;
                    switch (type) {
                        case "LaunchUri":
                            singleElements.push(this._renderSingleLinkAction(actionKey, articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, partnerName, eventListenerManager));
                            break;
                        case "Next":
                            nextElement = this._renderNextAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, true, eventListenerManager);
                            break;
                        case "Previous":
                            previousElement = this._renderPreviousAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, true, eventListenerManager);
                            break;
                        default:
                            break
                    }
                }
                for (var k = 0, lenk = groupedArticleActions.length; k < lenk; k++) {
                    multiElements.push(this._renderMultiLinkAction(groupedArticleActions[k], actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, eventListenerManager))
                }
                customActionsElt.appendChild(parentHeaderBorderElt);
                this._renderShareAction(customActionsElt, instrumentationId, eventListenerManager);
                var paywallProviderPromise = this._paywallProviderPromise = getPaywallProviderPromise ? getPaywallProviderPromise() : null;
                if (paywallProviderPromise) {
                    paywallProviderPromise.then(this._renderSubscribeAction.bind(this, customActionsElt, instrumentationId, eventListenerManager))
                }
                for (var j = 0, lenj = singleElements.length; j < lenj; j++) {
                    customActionsElt.appendChild(parentButtonTopBorderElt.cloneNode(true));
                    customActionsElt.appendChild(singleElements[j])
                }
                generalActionsElt.appendChild(parentHeaderBorderElt.cloneNode(true));
                if (nextElement) {
                    generalActionsElt.appendChild(nextElement);
                    if (multiElements.length > 0) {
                        generalActionsElt.appendChild(parentButtonTopBorderElt.cloneNode(true))
                    }
                }
                if (previousElement) {
                    generalActionsElt.appendChild(previousElement);
                    if (multiElements.length > 0) {
                        generalActionsElt.appendChild(parentButtonTopBorderElt.cloneNode(true))
                    }
                }
                for (var i = 0, leni = multiElements.length; i < leni; i++) {
                    generalActionsElt.appendChild(multiElements[i]);
                    if (i < leni - 1) {
                        generalActionsElt.appendChild(parentButtonTopBorderElt.cloneNode(true))
                    }
                }
                actionsContainerElt.appendChild(customActionsElt);
                actionsContainerElt.appendChild(generalActionsElt);
                actionsBlockElt.appendChild(actionsContainerElt);
                WinJS.Utilities.markDisposable(actionsBlockElt, function dispose() {
                    eventListenerManager.dispose();
                    eventListenerManager = null
                });
                return actionsBlockElt
            }, layout: function layout(renderableBlock, surfaceManager, context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var element = renderableBlock.element;
                var style = element.style;
                var firstEmptyColumn = Math.max(surfaceManager.getFirstEmptyColumn(context, true), columnCount - 1);
                var gridColumnSpan = 2;
                var gridColumn = U.convertColumnIndexToGridColumn(firstEmptyColumn, columnCount);
                U.placeInGrid(element, gridColumn, gridColumnSpan, "", 1, 4, "", 4);
                return true
            }, _renderMultiLinkAction: function _renderMultiLinkAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, eventListenerManager) {
                var text = "";
                if (articleAction.labelString) {
                    text = articleAction.labelString
                }
                else if (articleAction.labelId) {
                    var key = this._mapLabelIdKeyToResourceKey(articleAction.labelId);
                    text = PlatformJS.Services.resourceLoader.getString(key)
                }
                var actionOptions = articleAction.actionOptions;
                var actionAttributes = actionOptions.actionAttributes;
                var actions = actionAttributes.actions;
                var actionElt = document.createElement("li");
                WinJS.Utilities.addClass(actionElt, "multiAction");
                var headerElt = document.createElement("div");
                headerElt.innerText = text;
                WinJS.Utilities.addClass(headerElt, "header");
                actionElt.appendChild(headerElt);
                var listElt = document.createElement("ol");
                WinJS.Utilities.addClass(listElt, "list");
                actionElt.appendChild(listElt);
                for (var i = 0, leni = actions.length; i < leni; i++) {
                    var action = actions[i];
                    var type = action.actionOptions.actionType;
                    switch (type) {
                        case "LaunchUri":
                            listElt.appendChild(this._renderSingleLinkAction("", action, actionsHandler, cacheId, articleMetadata, articleHeader, null, eventListenerManager));
                            break;
                        case "Next":
                            listElt.appendChild(this._renderNextAction(action, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, false, eventListenerManager));
                            break;
                        default:
                            break
                    }
                }
                return actionElt
            }, _renderNextAction: function _renderNextAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, goingToNextArticle, eventListenerManager) {
                var instrumentationViewMechanism = goingToNextArticle ? U.viewMechanism.eoabNext : U.viewMechanism.eoabOther;
                var actionElt = this._renderAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, instrumentationViewMechanism, eventListenerManager);
                return actionElt
            }, _renderPreviousAction: function _renderPreviousAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, goingToPreviousArticle, eventListenerManager) {
                var instrumentationViewMechanism = goingToPreviousArticle ? U.viewMechanism.eoabprevious : U.viewMechanism.eoabOther;
                var actionElt = this._renderAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, instrumentationViewMechanism, eventListenerManager);
                return actionElt
            }, _renderAction: function _renderAction(articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, gotoArticleDelegate, instrumentationViewMechanism, eventListenerManager) {
                var snippet = articleAction.snippet;
                var header = articleAction.text;
                var textSize = articleAction.textSize;
                var actionOptions = articleAction.actionOptions;
                var actionAttributes = actionOptions.actionAttributes;
                var nextArticleId = actionAttributes.articleId;
                var actionElt = document.createElement("li");
                WinJS.Utilities.addClass(actionElt, "nextAction");
                var buttonElt = document.createElement("button");
                WinJS.Utilities.addClass(buttonElt, "button");
                actionElt.appendChild(buttonElt);
                PlatformJS.Utilities.enablePointerUpDownAnimations(buttonElt);
                if (nextArticleId) {
                    eventListenerManager.add(buttonElt, "click", function _ActionsRenderer_237(event) {
                        gotoArticleDelegate(nextArticleId, null, instrumentationViewMechanism, true)
                    })
                }
                if (header) {
                    var headerElt = document.createElement("div");
                    headerElt.innerText = header;
                    WinJS.Utilities.addClass(headerElt, "header");
                    buttonElt.appendChild(headerElt)
                }
                var textElt = document.createElement("div");
                textElt.innerHTML = toStaticHTML(snippet) || "";
                WinJS.Utilities.addClass(textElt, "text");
                buttonElt.appendChild(textElt);
                return actionElt
            }, _renderSingleLinkAction: function _renderSingleLinkAction(actionKey, articleAction, actionsHandler, cacheId, articleMetadata, articleHeader, partnerName, eventListenerManager) {
                var template = this._sanitizeTemplate(articleAction.template);
                var textSize = articleAction.textSize;
                var icon = articleAction.icon;
                var actionOptions = articleAction.actionOptions;
                var text = articleAction.text || partnerName || articleAction.text || "",
                    textHeader = articleAction.snippet || PlatformJS.Services.resourceLoader.getString("/platform/MoreFrom");
                var actionElt = document.createElement("li");
                WinJS.Utilities.addClass(actionElt, "singleAction " + template);
                var buttonElt = document.createElement("button");
                WinJS.Utilities.addClass(buttonElt, "button");
                actionElt.appendChild(buttonElt);
                PlatformJS.Utilities.enablePointerUpDownAnimations(buttonElt);
                var getInstrumentationDataPromise = this._getTelemetryData.bind(this);
                if (actionsHandler) {
                    (function _ActionsRenderer_285(actionKey, actionOptions) {
                        eventListenerManager.add(buttonElt, "click", function _ActionsRenderer_286(event) {
                            getInstrumentationDataPromise().then(function _ActionsRenderer_287(attributes) {
                                U.logUserAction(U.actionContext.body, U.actionElement.eoabMoreFrom, null, attributes)
                            });
                            var newEvent = {
                                originalEvent: event, data: {
                                    actionKey: actionKey, actionOptions: actionOptions, articleMetadata: articleMetadata, articleHeader: articleHeader, impressionNavMethod: Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod.eoabMoreFrom
                                }
                            };
                            actionsHandler.onActionInvoked(newEvent)
                        })
                    })(actionKey, actionOptions)
                }
                if (icon) {
                    var iconContainerElt = document.createElement("div");
                    WinJS.Utilities.addClass(iconContainerElt, "iconContainer");
                    buttonElt.appendChild(iconContainerElt);
                    var iconElt = document.createElement("div");
                    WinJS.Utilities.addClass(iconElt, "icon");
                    iconContainerElt.appendChild(iconElt);
                    var iconType = icon.type;
                    switch (iconType) {
                        case "glyph":
                            var className = icon.className;
                            WinJS.Utilities.addClass(iconContainerElt, "glyph");
                            WinJS.Utilities.addClass(iconElt, className);
                            break;
                        case "image":
                            var url = icon.url;
                            WinJS.Utilities.addClass(iconContainerElt, "image fitBoth");
                            var imageCard = new CommonJS.ImageCard(iconElt, {
                                imageSource: {
                                    url: url, cacheId: cacheId
                                }
                            });
                            break
                    }
                }
                var textHeaderElt = document.createElement("div");
                textHeaderElt.innerText = textHeader || "";
                WinJS.Utilities.addClass(textHeaderElt, "header");
                buttonElt.appendChild(textHeaderElt);
                var textElt = document.createElement("div");
                textElt.innerText = text || "";
                WinJS.Utilities.addClass(textElt, "text");
                buttonElt.appendChild(textElt);
                return actionElt
            }, _renderSubscribeAction: function _renderSubscribeAction(parent, instrumentationId, eventListenerManager, paywallProvider) {
                if (!parent || !paywallProvider || paywallProvider.currentLoginStatus.userType === Platform.Paywall.UserType.subscriber) {
                    return
                }
                var template = this._sanitizeTemplate(null);
                var textHeader = PlatformJS.Services.resourceLoader.getString("/platform/ArticleHeaderSubscriptionMessage");
                var text = PlatformJS.Services.resourceLoader.getString("/platform/ArticleSubscriptionMessage");
                var actionElt = document.createElement("li");
                WinJS.Utilities.addClass(actionElt, "singleAction " + template);
                WinJS.Utilities.addClass(actionElt, "EOABSubscribeAction");
                var buttonElt = document.createElement("button");
                WinJS.Utilities.addClass(buttonElt, "button");
                actionElt.appendChild(buttonElt);
                PlatformJS.Utilities.enablePointerUpDownAnimations(buttonElt);
                var getInstrumentationDataPromise = this._getTelemetryData.bind(this);
                if (eventListenerManager) {
                    eventListenerManager.add(buttonElt, "click", function eoabSubscribe(event) {
                        getInstrumentationDataPromise().then(function _ActionsRenderer_379(attributes) {
                            U.logUserAction(U.actionContext.body, U.actionElement.eoabSubscribe, null, attributes)
                        });
                        var paywallControl = CommonJS.Partners.Auth.PaywallControlFactory.createPaywallControl(paywallProvider, instrumentationId);
                        paywallControl.subscribeAsync().then(function _ActionsRenderer_384(response) {
                            if (response.success) {
                                var subscribeActions = document.querySelectorAll(".EOABSubscribeAction");
                                for (var i = 0; i < subscribeActions.length; i++) {
                                    var elem = subscribeActions[i];
                                    if (elem && elem.parentElement) {
                                        elem.parentElement.removeChild(elem)
                                    }
                                }
                            }
                        }, function paywallError(e) {
                            console.log("Paywall subscribe cancelled.")
                        })
                    })
                }
                var iconContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(iconContainerElt, "iconContainer");
                buttonElt.appendChild(iconContainerElt);
                var iconElt = document.createElement("div");
                WinJS.Utilities.addClass(iconElt, "icon");
                iconContainerElt.appendChild(iconElt);
                WinJS.Utilities.addClass(iconContainerElt, "glyph");
                WinJS.Utilities.addClass(iconElt, "subscribe");
                var textHeaderElt = document.createElement("div");
                textHeaderElt.innerText = textHeader || "";
                WinJS.Utilities.addClass(textHeaderElt, "header");
                buttonElt.appendChild(textHeaderElt);
                var textElt = document.createElement("div");
                textElt.innerText = text || "";
                WinJS.Utilities.addClass(textElt, "text");
                buttonElt.appendChild(textElt);
                parent.appendChild(actionElt)
            }, _renderShareAction: function _renderShareAction(parent, instrumentationId, eventListenerManager, paywallProvider) {
                if (!parent || paywallProvider) {
                    return
                }
                var template = this._sanitizeTemplate(null);
                var textHeader = PlatformJS.Services.resourceLoader.getString("/platform/ShareArticleHeader");
                var text = PlatformJS.Services.resourceLoader.getString("/platform/ShareArticleText");
                var actionElt = document.createElement("li");
                WinJS.Utilities.addClass(actionElt, "singleAction " + template);
                var buttonElt = document.createElement("button");
                WinJS.Utilities.addClass(buttonElt, "button");
                actionElt.appendChild(buttonElt);
                PlatformJS.Utilities.enablePointerUpDownAnimations(buttonElt);
                eventListenerManager.add(buttonElt, "click", function _ActionsRenderer_444(event) {
                    U.logUserAction(U.actionContext.body, U.actionElement.eoabShare);
                    Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI()
                });
                var iconContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(iconContainerElt, "iconContainer");
                buttonElt.appendChild(iconContainerElt);
                var iconElt = document.createElement("div");
                WinJS.Utilities.addClass(iconElt, "icon");
                iconContainerElt.appendChild(iconElt);
                WinJS.Utilities.addClass(iconContainerElt, "glyph");
                WinJS.Utilities.addClass(iconContainerElt, "shareIcon");
                WinJS.Utilities.addClass(iconElt, "share");
                var textHeaderElt = document.createElement("div");
                textHeaderElt.innerText = textHeader || "";
                WinJS.Utilities.addClass(textHeaderElt, "header");
                buttonElt.appendChild(textHeaderElt);
                var textElt = document.createElement("div");
                textElt.innerText = text || "";
                WinJS.Utilities.addClass(textElt, "text");
                buttonElt.appendChild(textElt);
                parent.appendChild(actionElt)
            }, _sanitizeTemplate: function _sanitizeTemplate(key) {
                var template = "A";
                switch (key) {
                    case "B":
                        template = "B";
                        break
                }
                return template
            }, _mapLabelIdKeyToResourceKey: function _mapLabelIdKeyToResourceKey(key) {
                var resource = "";
                switch (key) {
                    case "related":
                        resource = "/Platform/RelatedArticles";
                        break
                }
                return resource
            }, _getTelemetryData: function _getTelemetryData() {
                if (this._paywallProviderPromise) {
                    var that = this;
                    return this._paywallProviderPromise.then(function actionRenderer_getPartnerInstrumentationData(paywallProvider) {
                        return DynamicPanoJS.DynamicPano.getPaywallInstrumentationFromPaywallProvider(paywallProvider, that._instrumentationId, true)
                    })
                }
                else {
                    return WinJS.Promise.wrap(null)
                }
            }
        }
    })
})();
(function _EndAdRenderer_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        EndAdRenderer: {
            render: function render(renderableBlock, context) {
                var attributes = renderableBlock.block.attributes;
                var endAdBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(endAdBlockElt, "endAdBlock");
                var adContainer = new CommonJS.ArticleReader.AdContainer(null, {
                    controlOptions: attributes.controlOptions, controlType: attributes.controlType
                });
                endAdBlockElt.appendChild(adContainer.element);
                context.auxiliaryData.disposalManager.addDisposedDelegate(adContainer.dispose.bind(adContainer));
                return endAdBlockElt
            }, layout: function layout(renderableBlock, surfaceManager, context) {
                var element = renderableBlock.element;
                var firstEmptyColumn = surfaceManager.getFirstEmptyColumn(context, true);
                var gridColumn = U.convertColumnIndexToGridColumn(firstEmptyColumn, context.gridOptions.columnCount);
                U.placeInGrid(element, gridColumn, 2, "", 2, 3, "");
                CommonJS.ArticleReader.ArticleReaderUtils.instantiateChildAds(element);
                return true
            }
        }, CollapsedAdRenderer: {
            render: function render(renderableBlock, context) {
                var attributes = renderableBlock.block.attributes;
                var endAdBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(endAdBlockElt, "collapsedAdBlock");
                var adContainer = new CommonJS.ArticleReader.AdContainer(null, {
                    controlOptions: attributes.controlOptions, controlType: attributes.controlType
                });
                endAdBlockElt.appendChild(adContainer.element);
                context.auxiliaryData.disposalManager.addDisposedDelegate(adContainer.dispose.bind(adContainer));
                return endAdBlockElt
            }, layout: function layout(renderableBlock, surfaceManager, context) {
                var element = renderableBlock.element;
                var firstEmptyColumn = surfaceManager.getFirstEmptyColumn(context, true);
                var gridColumn = U.convertColumnIndexToGridColumn(firstEmptyColumn - 1, context.gridOptions.columnCount);
                U.placeInGrid(element, gridColumn, 1, "", 4, 1, "");
                CommonJS.ArticleReader.ArticleReaderUtils.instantiateChildAds(element);
                return true
            }
        }
    })
})();
(function _InlineAdRenderer_7() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InlineAdRenderer: {
            render: function render(renderableBlock, context) {
                var attributes = renderableBlock.block.attributes;
                var controlOptions = attributes.controlOptions;
                var controlType = attributes.controlType;
                var inlineAdBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(inlineAdBlockElt, "inlineAdBlock exclusion");
                var adContainer = new CommonJS.ArticleReader.AdContainer(null, {
                    controlOptions: controlOptions, controlType: controlType
                });
                var adContainerElt = adContainer.element;
                inlineAdBlockElt.appendChild(adContainerElt);
                var auxiliaryData = context.auxiliaryData;
                var disposalManager = auxiliaryData.disposalManager;
                disposalManager.addDisposedDelegate(function _InlineAdRenderer_33() {
                    adContainer.dispose()
                });
                return inlineAdBlockElt
            }, calculateLayout: function calculateLayout(renderableBlock, startColumn, gridOptions, exclusions) {
                var attributes = renderableBlock.block.attributes;
                var adWidth = attributes.width;
                var adHeight = attributes.height;
                var exclusion = ARUtils.getBestExclusion(startColumn, gridOptions, exclusions, adWidth, adHeight, adWidth);
                return exclusion
            }, applyLayout: function applyLayout(renderableBlock, aggregation, context) {
                var gridOptions = context.gridOptions;
                var exclusion = renderableBlock.exclusion;
                var layout = renderableBlock.layout;
                if (layout && layout.height === 0) {
                    return
                }
                if (exclusion && exclusion.height) {
                    var useHalfColumn = !aggregation;
                    var element = renderableBlock.element;
                    var style = element.style;
                    var block = renderableBlock.block;
                    var attributes = block.attributes;
                    var adWidth = attributes.width;
                    var adHeight = attributes.height;
                    var columnCount = gridOptions.columnCount;
                    var columnWidth = gridOptions.columnWidth;
                    var columnSpan = exclusion.columnSpan;
                    var adContainer = element.querySelector(".adContainer");
                    if (columnSpan === 1 && columnWidth > 550 && adWidth <= 300 && useHalfColumn) {
                        adContainer.style.width = adWidth + "px";
                        style.msGridColumnAlign = "start"
                    }
                    else {
                        adContainer.style.width = "";
                        style.msGridColumnAlign = ""
                    }
                    ARUtils.instantiateChildAds(element);
                    var adElt = element.querySelector(".ad");
                    if (adElt) {
                        var adStyle = adElt.style;
                        adStyle.width = adWidth + "px";
                        adStyle.height = adHeight + "px"
                    }
                }
            }
        }
    })
})();
(function _ArticleReader_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    var _totalRelaxLevels = 2;
    var _layoutPropertiesRelaxLevel = Object.freeze({
        totalLevels: 2, noRelax: 0, level1: 1, level2: 2
    });
    var _maxInlineAdRepeats = 3;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TitleRenderableBlocksEnum: {
            anchorBar: "anchorBar", author: "author", columnBlocker: "columnBlocker", date: "date", growl: "growl", headline: "headline", kicker: "kicker", sourceLogo: "sourceLogo"
        }, ArticleReader: WinJS.Class.mix(WinJS.Class.define(function _ArticleReader_23(elt, options) {
            elt = this._elt = elt || document.createElement("div");
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            WinJS.Utilities.addClass(elt, "reader");
            var surface = this._surface = document.createElement("div");
            WinJS.Utilities.addClass(surface, "surface");
            elt.appendChild(surface);
            var contentFrame = document.createElement("iframe");
            WinJS.Utilities.addClass(contentFrame, "contentFrame");
            if (!options.tocArticle) {
                contentFrame.tabIndex = -1
            }
            elt.appendChild(contentFrame);
            var surfaceManager = this._surfaceManager = new CommonJS.ArticleReader.SurfaceManager({ surface: surface });
            var contentFrameManager = this._contentFrameManager = new CommonJS.ArticleReader.ContentFrameManager({
                contentFrame: contentFrame, market: options.market
            });
            var disposalManager = this._disposalManager = new CommonJS.ArticleReader.DisposalManager;
            this._header = null;
            this._context = null;
            this._isRendered = false;
            this._width = -1;
            this._categoryName = options.categoryName;
            var customOptions = this._customOptions = options.customOptions;
            this._defaultStyle = (customOptions && customOptions.defaultTitleStyleTemplate) ? customOptions.defaultTitleStyleTemplate : 1;
            this._landscapeStyle = (customOptions && customOptions.landscapeTitleStyleTemplate) ? customOptions.landscapeTitleStyleTemplate : 2;
            this._portraitStyle = (customOptions && customOptions.portraitTitleStyleTemplate) ? customOptions.portraitTitleStyleTemplate : 9;
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleinteractive"))
        }, {
            _elt: null, _surfaceManager: null, _contentFrameManager: null, _disposalManager: null, _header: null, _footer: null, _instrumentationData: null, _context: null, _surface: null, _isRendered: null, _width: null, _defaultStyle: null, _landscapeStyle: null, _portraitStyle: null, _categoryName: null, _customOptions: null, _paywallCard: null, _isShowingPaywallCard: false, element: {
                get: function get() {
                    return this._elt
                }
            }, isRendered: {
                get: function get() {
                    return this._isRendered
                }
            }, articleType: {
                get: function get() {
                    return "article"
                }
            }, paywallCard: {
                get: function get() {
                    return this._paywallCard
                }, set: function set(paywallCardTemplate) {
                    this._paywallCard = paywallCardTemplate.cloneNode(true)
                }
            }, dispose: function dispose() {
                var surfaceManager = this._surfaceManager;
                if (this._paywallCard) {
                    WinJS.Utilities.disposeSubTree(this._paywallCard);
                    this._paywallCard = null
                }
                if (surfaceManager) {
                    var context = this._context;
                    if (context) {
                        var data = context.data;
                        if (data) {
                            this._clearRenderDataBlocks(data.renderData)
                        }
                    }
                    surfaceManager.dispose()
                }
                document.body.offsetHeight;
                var contentFrameManager = this._contentFrameManager;
                if (contentFrameManager) {
                    contentFrameManager.dispose()
                }
                var disposalManager = this._disposalManager;
                if (disposalManager) {
                    disposalManager.runAllDisposedDelegates();
                    disposalManager.dispose()
                }
                var elt = this._elt;
                elt.innerHTML = "";
                elt.winControl = null;
                this._header = null;
                this._footer = null;
                this._instrumentationData = null;
                this._surface = null;
                this._elt = null;
                this._context = null
            }, getHeader: function getHeader() {
                return this._header
            }, getTitleRenderableBlockElement: function getTitleRenderableBlockElement(blockName) {
                var context = this._context;
                if (context && context.renderData) {
                    var titleRenderableBlocks = context.renderData.titleRenderableBlocks;
                    if (titleRenderableBlocks && titleRenderableBlocks[blockName]) {
                        return titleRenderableBlocks[blockName].element
                    }
                }
                return null
            }, updateGrowlText: function updateGrowlText() {
                var that = this,
                    context = this._context;
                if (context && context.auxiliaryData && context.auxiliaryData.paywallGrowlMessageFunction) {
                    context.auxiliaryData.paywallGrowlMessageFunction(false, that.getHeader()).then(function articleReader_updateGrowlText(message) {
                        var growlElem = that.getTitleRenderableBlockElement(CommonJS.ArticleReader.TitleRenderableBlocksEnum.growl);
                        if (growlElem) {
                            var growlMessageElt = WinJS.Utilities.query(".growlMessage", growlElem);
                            if (growlMessageElt.length > 0) {
                                growlMessageElt[0].innerText = message
                            }
                        }
                    })
                }
            }, getInstrumentationData: function getInstrumentationData() {
                return this._instrumentationData
            }, getElementsForPagination: function getElementsForPagination() {
                var contentFrameManager = this._contentFrameManager;
                var list = [];
                var contentDocument = contentFrameManager.getContentDocument();
                if (contentDocument) {
                    list.push(contentDocument)
                }
                return list
            }, render: function render(data, renderOptions) {
                var that = this;
                this._width = -1;
                var articleMetadata = data.metadata;
                var articleTitle = data.title;
                var gridOptions = renderOptions.gridOptions;
                var adPartnerName = renderOptions.adPartnerName;
                var actionsHandlerType = renderOptions.actionsHandlerType;
                var contentCssPaths = (articleMetadata ? this._maybeConvertToJsonArray(articleMetadata.contentCssPaths) : null) || renderOptions.contentCssPaths || [];
                var renderAll = articleMetadata ? (typeof (articleMetadata.renderAll) === "boolean" ? articleMetadata.renderAll : (renderOptions.renderAll || false)) : (renderOptions.renderAll || false);
                var adGroups = (articleTitle.ads === null || articleTitle.ads > 0) ? ((articleMetadata ? this._maybeConvertToJsonArray(articleMetadata.adGroups) : null) || renderOptions.adGroups || []) : [];
                this._overrideAndDuplicateInlineAds(articleMetadata, adGroups);
                var inlineAdRepeat = 3;
                adGroups = this._fixAdGroups(adGroups, gridOptions);
                var hideInlineAds = renderOptions.hideInlineAds || this._hideInlineAds(adGroups);
                var disableTextSelection = renderOptions.disableTextSelection;
                var updatePaywallCardFunction = renderOptions.updatePaywallCardFunction;
                if (disableTextSelection) {
                    WinJS.Utilities.addClass(this._elt, "noSelection")
                }
                var header = this._header = {
                    enabled: false, snippet: null, headline: null, publisherName: null, author: null, date: null, sharingUrl: null, style: null, categoryName: null, logoURL: null, isPaid: false, webUrl: null
                };
                var footer = this._footer = { enabled: false };
                var instrumentationData = this._instrumentationData = {
                    content: {
                        sourceName: null, author: null, partnerCode: null, contentId: null, type: null, date: null, uri: null, slug: null, isSummary: null, worth: null, isAd: null, adCampaign: null, partnerUri: null
                    }, trailingMediaBlockCount: null, renderType: null
                };
                var context = this._context = {
                    data: data, gridOptions: gridOptions, renderData: {
                        content: null, renderableTitle: null, renderableBlocks: null, titleRenderableBlocks: null, endRenderableBlocks: null
                    }, layoutData: { pageCount: null }, calibrationData: {
                        contentDensity: null, contentColumnCount: null
                    }, auxiliaryData: {
                        articleHeader: header, articleFooter: footer, instrumentationData: instrumentationData, renderAll: renderAll, cacheId: renderOptions.cacheId, textAttributes: renderOptions.initialTextAttributes, articleMetadata: articleMetadata, flowId: null, contentCssPaths: contentCssPaths, disposalManager: this._disposalManager, slideshowData: {}, adGroups: adGroups, noSlideshow: renderOptions.noSlideshow, hideInlineAds: hideInlineAds, articleActions: null, actionsHandlerType: actionsHandlerType, hidePageNumbers: !!renderOptions.hidePageNumbers, allowLoneEndAd: !!renderOptions.allowLoneEndAd, gotoArticleDelegate: renderOptions.gotoArticleDelegate, isPaginated: !!renderOptions.isPaginated, disableTextSelection: disableTextSelection, renderEOAB: !!renderOptions.renderEOAB, paywallGrowlMessageFunction: renderOptions.paywallGrowlMessageFunction, getPaywallProviderPromise: renderOptions.getPaywallProviderPromise, isPaywallCardEnabled: renderOptions.isPaywallCardEnabled, showGrowlTextWithoutPaywallCard: renderOptions.showGrowlTextWithoutPaywallCard
                    }
                };
                var layout = this._updateRenderData(data, context);
                this._preprocessRenderData(context);
                this._processActions(data, context);
                this._createEndBlocks(context);
                this._populateContent(context);
                var getPaywallProviderPromise = renderOptions.getPaywallProviderPromise;
                this._isShowingPaywallCard = renderOptions.isPaywallCardEnabled;
                var promise;
                if (getPaywallProviderPromise && this._isShowingPaywallCard) {
                    var paywallProviderPromise = getPaywallProviderPromise();
                    if (paywallProviderPromise) {
                        promise = paywallProviderPromise.then(function getArticleAccessibility(provider) {
                            var accessibility = provider.checkArticleAccessibility(data.serverArticleId, !data.title || data.title.free === false);
                            that._isShowingPaywallCard = accessibility !== Platform.Paywall.ArticleAccessibility.accessAllowedPreviouslyReadArticle && accessibility !== Platform.Paywall.ArticleAccessibility.accessAllowedUserAuthenticated;
                            return provider
                        })
                    }
                }
                promise = promise || WinJS.Promise.wrap({});
                promise = promise.then(function articlereader_renderArticle() {
                    that._surfaceManager.initializeSurface(context, that._isShowingPaywallCard);
                    if (that._isShowingPaywallCard) {
                        if (that._paywallCard) {
                            that._surfaceManager.appendElement(that._paywallCard);
                            if (updatePaywallCardFunction) {
                                updatePaywallCardFunction(articleMetadata.articleId, that._paywallCard, header)
                            }
                            that._showPaywallCard(gridOptions)
                        }
                        return WinJS.Promise.wrap({})
                    }
                    else {
                        if (that._paywallCard) {
                            that._paywallCard.style.display = "none"
                        }
                    }
                    var resultPromise = null;
                    if (layout && !renderOptions.isPaywallCardEnabled) {
                        resultPromise = that._renderImplFromLayout(layout, context)
                    }
                    else {
                        resultPromise = that._renderImpl(context).then(that.dispatchEvent.bind(that, "articleinteractive", {}))
                    }
                    return resultPromise.then(that._updateInstrumentationData.bind(that, true, layout, data.renderData))
                });
                return promise
            }, relayout: function relayout(gridOptions) {
                var promise = WinJS.Promise.wrap(null);
                var context = this._context;
                if (context) {
                    context.gridOptions = gridOptions;
                    this._width = -1;
                    var data = context.data;
                    this._clearRenderDataBlocks(context.renderData);
                    var layout = this._updateRenderData(data, context);
                    this._createEndBlocks(context);
                    this._surfaceManager.initializeSurface(context, this._isShowingPaywallCard);
                    if (this._isShowingPaywallCard) {
                        if (this._paywallCard) {
                            this._showPaywallCard(gridOptions)
                        }
                        return WinJS.Promise.wrap({})
                    }
                    else {
                        if (this._paywallCard) {
                            this._paywallCard.style.display = "none"
                        }
                    }
                    if (layout && !context.auxiliaryData.isPaywallCardEnabled) {
                        promise = this._relayoutImplFromLayout(layout, context)
                    }
                    else {
                        layout = null;
                        promise = this._renderImpl(context)
                    }
                    promise = promise.then(this._updateInstrumentationData.bind(this, false, layout, data.renderData))
                }
                return promise
            }, getRenderData: function getRenderData() {
                var outputRenderData = null;
                var currentContext = this._context;
                if (currentContext) {
                    var renderData = currentContext.renderData;
                    var renderableBlocks = renderData.renderableBlocks;
                    var endRenderableBlocks = renderData.endRenderableBlocks;
                    var hideInlineAds = currentContext.auxiliaryData && currentContext.auxiliaryData.hideInlineAds;
                    var outputRenderableBlocks = [];
                    for (var i = 0, leni = renderableBlocks.length; i < leni; i++) {
                        var renderableBlock = renderableBlocks[i];
                        var block = renderableBlock.block;
                        if (block && block.type === U.inlineAdBlockType && hideInlineAds) {
                            continue
                        }
                        var outputRenderableBlock = {
                            block: block, position: renderableBlock.position
                        };
                        outputRenderableBlocks.push(outputRenderableBlock)
                    }
                    var outputEndRenderableBlocks = [];
                    for (var j = 0, lenj = endRenderableBlocks.length; j < lenj; j++) {
                        var endRenderableBlock = endRenderableBlocks[j];
                        var outputEndRenderableBlock = {
                            block: endRenderableBlock.block, position: endRenderableBlock.position
                        };
                        outputEndRenderableBlocks.push(outputEndRenderableBlock)
                    }
                    outputRenderData = {
                        renderableBlocks: outputRenderableBlocks, endRenderableBlocks: outputEndRenderableBlocks, renderableTitle: renderData.renderableTitle, content: renderData.content
                    }
                }
                return outputRenderData
            }, getLayout: function getLayout() {
                var layout = null;
                if (this._context.auxiliaryData.isPaywallCardEnabled) {
                    return layout
                }
                var layoutProperties = this._getLayoutProperties();
                var layoutHints = this._getLayoutHints();
                if (layoutHints) {
                    layout = {
                        properties: layoutProperties, hints: layoutHints
                    }
                }
                return layout
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                var currentContext = this._context;
                var promise = this._setTextAttributes(textAttributes);
                promise = promise.then(this._adjustSurface.bind(this, currentContext, false));
                return promise
            }, getWidth: function getWidth() {
                return this._width
            }, getPageCount: function getPageCount() {
                var surfaceManager = this._surfaceManager;
                var pageCount = surfaceManager.getPageCount();
                return pageCount
            }, articleFocusLost: function articleFocusLost() {
                var disposalManager = this._disposalManager;
                if (disposalManager) {
                    disposalManager.runAllArticleFocusLostDelegates()
                }
            }, updatePartialPageColumnsStyle: function updatePartialPageColumnsStyle(transitionRatio, immediate) {
                this._surfaceManager.updatePartialPageColumnsStyle(transitionRatio, immediate)
            }, hidePaywallCard: function hidePaywallCard() {
                if (this._isShowingPaywallCard) {
                    this._isShowingPaywallCard = false;
                    if (this._paywallCard) {
                        this._paywallCard.style.display = "none"
                    }
                }
            }, isShowingPaywallCard: {
                get: function get() {
                    return this._isShowingPaywallCard
                }
            }, _showPaywallCard: function _showPaywallCard(gridOptions) {
                var columnCount = gridOptions.columnCount;
                var pageWidth = gridOptions.pageWidth;
                var pageHeight = gridOptions.pageHeight;
                var gridColumnSpan = columnCount * 2 + 1;
                CommonJS.ArticleReader.ArticleReaderUtils.placeInGrid(this._paywallCard, 1, gridColumnSpan, "start", 1, 4, "start");
                var style = this._paywallCard.style;
                style.height = pageHeight + "px";
                style.width = pageWidth + "px";
                style.display = "block"
            }, _getLayoutHints: function _getLayoutHints() {
                var currentContext = this._context;
                var hints = null;
                if (currentContext) {
                    var renderData = currentContext.renderData;
                    var layoutData = currentContext.layoutData;
                    var hideInlineAds = currentContext.auxiliaryData && currentContext.auxiliaryData.hideInlineAds;
                    var pageCount = layoutData.pageCount;
                    var blockLayouts = [];
                    var renderableBlocks = renderData.renderableBlocks;
                    var valid = true;
                    for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                        var renderableBlock = renderableBlocks[i];
                        if (renderableBlock.block && renderableBlock.block.type === U.inlineAdBlockType && hideInlineAds) {
                            continue
                        }
                        var layout = renderableBlock.layout;
                        if (layout) {
                            blockLayouts.push(layout)
                        }
                        else {
                            valid = false;
                            break
                        }
                    }
                    if (valid) {
                        hints = {
                            pageCount: pageCount, blockLayouts: blockLayouts
                        }
                    }
                }
                var compressedHints = null;
                if (hints) {
                    compressedHints = CommonJS.ArticleReader.ArticleReaderUtils.compressHints(hints)
                }
                return compressedHints
            }, _getLayoutProperties: function _getLayoutProperties() {
                var layoutProperties = null;
                var currentContext = this._context;
                if (currentContext) {
                    layoutProperties = this._createLayoutProperties(currentContext, _layoutPropertiesRelaxLevel.noRelax)
                }
                return layoutProperties
            }, _overrideAd: function _overrideAd(adMetadata, providerId) {
                var adMetadataObj = null;
                if (adMetadata) {
                    try {
                        adMetadataObj = JSON.parse(adMetadata)
                    }
                    catch (ex) { }
                }
                var adControlOptions = adMetadataObj && adMetadataObj.controlOptions;
                if (adControlOptions) {
                    var adManager = null;
                    if (PlatformJS.Ads) {
                        adManager = PlatformJS.Ads.Config.instance.adManager
                    }
                    var adOverrideConfigs = adManager && adManager.getProviderAdConfigs(adMetadataObj.width, adMetadataObj.height, providerId);
                    if (Array.isArray(adOverrideConfigs) && adOverrideConfigs.length > 0) {
                        var adOverrideConfig = adOverrideConfigs[0];
                        if (adControlOptions.otherAdOptions) {
                            adControlOptions.otherAdOptions.adUnitId = adOverrideConfig.adUnitId
                        }
                        adControlOptions.adUnitId = adOverrideConfig.adUnitId;
                        adMetadata = JSON.stringify(adMetadataObj)
                    }
                }
                return adMetadata
            }, _overrideAndDuplicateInlineAds: function _overrideAndDuplicateInlineAds(articleMetadata, adGroups) {
                var providerId = articleMetadata && articleMetadata.providerId;
                var inlineAdRepeat = _maxInlineAdRepeats;
                for (var i = 0; i < adGroups.length; i++) {
                    var adGroup = adGroups[i];
                    var isInlineAd = adGroup.type === "inline";
                    var adMetadatas = adGroup.adMetadatas;
                    for (var j = 0, adMetadatasLength = adMetadatas.length; j < adMetadatasLength; j++) {
                        if (isInlineAd) {
                            inlineAdRepeat--
                        }
                        adMetadatas[j] = this._overrideAd(adMetadatas[j], providerId);
                        if (!adMetadatas[j]) {
                            adGroups[i] = {}
                        }
                    }
                    if (isInlineAd) {
                        for (var k = 0; inlineAdRepeat > 0; k++, inlineAdRepeat--) {
                            adMetadatas.push(adMetadatas[k])
                        }
                    }
                }
                return adGroups
            }, _getInlineAdCount: function _getInlineAdCount(context) {
                var auxiliaryData = context.auxiliaryData;
                var adGroups = auxiliaryData.adGroups;
                var hideInlineAds = auxiliaryData.hideInlineAds;
                var count = 0;
                if (adGroups && !hideInlineAds) {
                    for (var i = 0, len = adGroups.length; i < len; i++) {
                        var adGroup = adGroups[i];
                        var type = adGroup.type;
                        if (type === "inline") {
                            var adMetadatas = adGroup.adMetadatas;
                            if (adMetadatas) {
                                count += adMetadatas.length
                            }
                        }
                    }
                }
                return count
            }, _updateRenderData: function _updateRenderData(data, context) {
                var layout = context.auxiliaryData.isPaywallCardEnabled || context.auxiliaryData.showGrowlTextWithoutPaywallCard ? null : this._getApplicableLayoutAndRenderData(data, context);
                var renderData = data.renderData;
                if (renderData) {
                    this._populateRenderDataFromRenderData(renderData, context);
                    if (!layout) {
                        this._resetTitle(context, false);
                        if (context.auxiliaryData.hideInlineAds) {
                            this._removeInlineAdsBlock(context.renderData.renderableBlocks)
                        }
                    }
                    this._resetInlineAds(context, !layout)
                }
                else {
                    this._populateRenderData(data, context)
                }
                return layout
            }, _getApplicableLayoutAndRenderData: function _getApplicableLayoutAndRenderData(data, context) {
                var layout = null;
                var renderData = null;
                var layouts = data.layouts;
                var renderDataList = data.customRenderData;
                if (layouts && layouts.length) {
                    var index = -1;
                    var layoutProperties = null;
                    for (var i = 0; i <= _totalRelaxLevels && index === -1; i++) {
                        layoutProperties = this._createLayoutProperties(context, i);
                        index = U.getItemIndexByLayoutProperties(layouts, layoutProperties)
                    }
                    if (index >= 0) {
                        layout = layouts[index];
                        renderData = renderDataList && renderDataList[index]
                    }
                    if (renderData) {
                        data.renderData = renderData
                    }
                }
                if (layout) {
                    var compressedHints = layout.hints;
                    layout = (compressedHints && compressedHints.length > 1 && Array.isArray(compressedHints[1])) ? layout : null
                }
                return layout
            }, _createLayoutProperties: function _createLayoutProperties(context, relaxLevel) {
                var auxiliaryData = context.auxiliaryData;
                var gridOptions = context.gridOptions;
                var pageWidth = gridOptions.pageWidth;
                var pageHeight = gridOptions.pageHeight;
                var textAttributes = relaxLevel >= _layoutPropertiesRelaxLevel.level2 ? null : auxiliaryData.textAttributes;
                var inlineAdCount = relaxLevel >= _layoutPropertiesRelaxLevel.level1 ? null : this._getInlineAdCount(context);
                var layoutProperties = U.createLayoutProperties(pageWidth, pageHeight, textAttributes, inlineAdCount);
                return layoutProperties
            }, _populateRenderData: function _populateRenderData(data, context) {
                var gridOptions = context.gridOptions;
                var renderableBlocks;
                var endRenderableBlocks;
                var renderableTitle;
                var content;
                var blocks = data.blocks;
                var contentArray = [];
                var contentLength = 0;
                renderableBlocks = [];
                endRenderableBlocks = [];
                function isSupported(identifier) {
                    var SurfaceManager = CommonJS.ArticleReader.SurfaceManager;
                    return SurfaceManager.blockRenderers[identifier] || SurfaceManager.endUiRenderers[identifier]
                }
                for (var i = 0, len = blocks.length; i < len; i++) {
                    var block = blocks[i];
                    var type = block.type;
                    if (type === "SectionBreak") {
                        var sectionName = block.attributes.name;
                        var html = this._getSectionHeaderHtml(sectionName);
                        contentArray.push(html);
                        contentLength += html.length
                    }
                    else if (type === "Content") {
                        var c = block.attributes.content;
                        contentArray.push(c);
                        contentLength += c.length
                    }
                    else if (type === "Referral") {
                        var endRenderableBlock = this._createRenderableBlock(block, -20);
                        endRenderableBlocks.push(endRenderableBlock)
                    }
                    else if (isSupported(type)) {
                        var renderableBlock = this._createRenderableBlock(block, contentLength);
                        renderableBlocks.push(renderableBlock)
                    }
                    else { }
                }
                content = contentArray.join("");
                var title = data.title;
                renderableTitle = this._getRenderableTitle(title, renderableBlocks, context);
                var titleRenderableBlocks = this._processTitle(renderableTitle, renderableBlocks, context);
                var additionalInlineAdBlocks = this._processInlineAds(renderableBlocks, contentLength, context);
                U.sortRenderableBlocks(renderableBlocks);
                var renderData = context.renderData;
                renderData.renderableBlocks = renderableBlocks;
                renderData.endRenderableBlocks = endRenderableBlocks;
                renderData.renderableTitle = renderableTitle;
                renderData.titleRenderableBlocks = titleRenderableBlocks;
                renderData.content = content;
                renderData.additionalInlineAdBlocks = additionalInlineAdBlocks
            }, _populateRenderDataFromRenderData: function _populateRenderDataFromRenderData(dataRenderData, context) {
                var renderData = context.renderData;
                var renderableBlocks = PlatformJS.Utilities.deepCopy(dataRenderData.renderableBlocks, null, 1);
                var endRenderableBlocks = PlatformJS.Utilities.deepCopy(dataRenderData.endRenderableBlocks, null, 1);
                renderData.renderableBlocks = renderableBlocks;
                renderData.endRenderableBlocks = endRenderableBlocks;
                renderData.renderableTitle = dataRenderData.renderableTitle;
                renderData.content = dataRenderData.content
            }, _resetTitle: function _resetTitle(context, createElements) {
                var gridOptions = context.gridOptions;
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var renderableTitle = renderData.renderableTitle;
                this._removeTitleBlocks(renderableBlocks);
                var style = renderableTitle.style;
                var renderer = CommonJS.ArticleReader.SurfaceManager.titleRenderers[style];
                var isTemplateDefaultable = this._isTemplateDefaultable(gridOptions, style);
                if (!renderer || isTemplateDefaultable) {
                    this._demoteTitleImageToInlineImage(renderableTitle.titleImage, renderableBlocks, context);
                    renderableTitle.titleImage = null;
                    renderableTitle.style = 1
                }
                var titleRenderableBlocks = this._processTitle(renderableTitle, renderableBlocks, context);
                U.sortRenderableBlocks(renderableBlocks);
                renderData.titleRenderableBlocks = titleRenderableBlocks;
                if (createElements) {
                    var surfaceManager = this._surfaceManager;
                    surfaceManager.createTitleElements(context)
                }
            }, _removeTitleBlocks: function _removeTitleBlocks(renderableBlocks) {
                var surfaceManager = this._surfaceManager;
                for (var i = renderableBlocks.length - 1; i >= 0; i--) {
                    var renderableBlock = renderableBlocks[i];
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (isTitle) {
                        surfaceManager.removeBlock(renderableBlock);
                        renderableBlocks.splice(i, 1)
                    }
                }
            }, _getSnippet: function _getSnippet(content) {
                var maxSnippetLength = CommonJS.ArticleReader.ArticleReader._maxSnippetLength;
                var div = document.createElement("div");
                WinJS.Utilities.setInnerHTML(div, toStaticHTML(content));
                var text = div.innerText.trim();
                var snippet = text.substr(0, maxSnippetLength) + "...";
                return snippet
            }, _preprocessRenderData: function _preprocessRenderData(context) {
                var auxiliaryData = context.auxiliaryData;
                var renderData = context.renderData;
                var content = renderData.content;
                var renderableTitle = renderData.renderableTitle;
                var data = context.data;
                var metadata = data.metadata;
                var title = data.title;
                var articleHeader = auxiliaryData.articleHeader;
                var snippet = this._getSnippet(content);
                articleHeader.enabled = (this._customOptions && (typeof this._customOptions.enableHeader !== "undefined")) ? this._customOptions.enableHeader : false;
                articleHeader.snippet = snippet;
                articleHeader.sharingUrl = metadata.sharingUrl;
                articleHeader.headline = renderableTitle.headline || "";
                articleHeader.publisherName = renderableTitle.publisher ? renderableTitle.publisher.name : "";
                articleHeader.author = renderableTitle.author || "";
                articleHeader.date = renderableTitle.date || "";
                articleHeader.style = (this._customOptions && (typeof this._customOptions.headerStyle !== "undefined")) ? this._customOptions.headerStyle : CommonJS.ArticleReader.ArticleReader._defaultHeaderStyle;
                articleHeader.categoryName = this._categoryName;
                articleHeader.logoURL = this._customOptions ? this._customOptions.logoURL : null;
                articleHeader.isPaid = title ? !title.free : false;
                articleHeader.webUrl = metadata.webUrl;
                if (title) {
                    articleHeader.kicker = title.deckhead || title.kicker
                }
                if (!articleHeader.kicker) {
                    articleHeader.kicker = renderableTitle.kicker
                }
                articleHeader.abstract = metadata.abstract || title.abstract || renderableTitle.abstract;
                auxiliaryData.articleFooter.enabled = (this._customOptions && (typeof this._customOptions.enableFooter !== "undefined")) ? this._customOptions.enableFooter : true;
                var flowId = "content" + AppEx.Common.ArticleReader.GuidProvider.getGuid();
                auxiliaryData.flowId = flowId;
                var slideshowData = auxiliaryData.slideshowData;
                this._populateSlideshowData(renderData, slideshowData);
                if (slideshowData.slides) {
                    slideshowData.slides.instrumentationId = metadata.instrumentationId || ""
                }
                var instrumentationData = auxiliaryData.instrumentationData;
                var contentData = instrumentationData.content;
                contentData.sourceName = renderableTitle.publisher ? renderableTitle.publisher.name : "";
                contentData.author = renderableTitle.author || "";
                contentData.partnerCode = metadata.instrumentationId || "";
                contentData.type = Microsoft.Bing.AppEx.Telemetry.ContentType.article;
                contentData.date = this._getDateForInstrumentation(title);
                contentData.uri = metadata.sharingUrl || "";
                contentData.slug = renderableTitle.headline || "";
                contentData.isSummary = false;
                contentData.worth = (title.free === false) ? Microsoft.Bing.AppEx.Telemetry.ContentWorth.subscription : Microsoft.Bing.AppEx.Telemetry.ContentWorth.free;
                contentData.isAd = false;
                contentData.adCampaign = null;
                contentData.partnerUri = metadata.webUrl || "";
                contentData.customId = title.customId;
                contentData.customType = title.customType;
                this._recalculateDate(context)
            }, _recalculateDate: function _recalculateDate(context) {
                var data = context.data;
                var title = data.title;
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var date = this._getDateString(title);
                renderableTitle.date = date;
                var renderableBlocks = renderData.renderableBlocks;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (isTitle) {
                        var block = renderableBlock.block;
                        if (block.type === U.titleTextBlockType) {
                            var attributes = block.attributes;
                            var textClassName = attributes.textClassName;
                            if (textClassName && textClassName.indexOf("dateText") > -1) {
                                attributes.text = date
                            }
                        }
                    }
                }
            }, _populateSlideshowData: function _populateSlideshowData(renderData, slideshowData) {
                var slides = [];
                var imageIndex = -1;
                var renderableTitle = renderData.renderableTitle;
                var headline = renderableTitle.headline;
                var titleImage = renderableTitle.titleImage;
                if (titleImage) {
                    var image = titleImage.image;
                    var slide = CommonJS.ArticleReader.ArticleReaderUtils.createSlideshowImageDefinition(image, headline);
                    slides.push(slide);
                    imageIndex++
                }
                var renderableBlocks = renderData.renderableBlocks;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var block = renderableBlock.block;
                    var type = block.type;
                    if (type === "InlineImage" || type === "FocusImage") {
                        var attributes = block.attributes;
                        var blockImage = attributes.image;
                        var blockSlide = CommonJS.ArticleReader.ArticleReaderUtils.createSlideshowImageDefinition(blockImage, headline);
                        slides.push(blockSlide);
                        imageIndex++;
                        renderableBlock.imageIndex = imageIndex
                    }
                    else {
                        continue
                    }
                }
                slideshowData.slides = slides
            }, _resetInlineAds: function _resetInlineAds(context, sortRenderableBlocks) {
                var renderData = context.renderData;
                var content = renderData.content;
                var contentLength = content.length;
                var renderableBlocks = renderData.renderableBlocks;
                renderData.additionalInlineAdBlocks = this._processInlineAds(renderableBlocks, contentLength, context);
                if (sortRenderableBlocks) {
                    U.sortRenderableBlocks(renderableBlocks)
                }
            }, _removeInlineAdsBlock: function _removeInlineAdsBlock(renderableBlocks) {
                var index = 0;
                var len = renderableBlocks.length;
                for (; index < len; index++) {
                    var renderableBlock = renderableBlocks[index];
                    if (renderableBlock) {
                        var block = renderableBlock.block;
                        if (block && block.type === U.inlineAdBlockType) {
                            renderableBlocks.splice(index, 1);
                            break
                        }
                    }
                }
            }, _processInlineAds: function _processInlineAds(renderableBlocks, contentLength, context) {
                var auxiliaryData = context.auxiliaryData;
                var adGroups = auxiliaryData.adGroups;
                var additionalInlineAdBlocks = 0;
                var inlineAdMetadatas = [];
                if (adGroups) {
                    for (var i = 0, leni = adGroups.length; i < leni; i++) {
                        var adGroup = adGroups[i];
                        var type = adGroup.type;
                        if (type === "inline") {
                            var adMetadatas = adGroup.adMetadatas;
                            for (var j = 0, lenj = adMetadatas.length; j < lenj; j++) {
                                var adMetadata = adMetadatas[j];
                                inlineAdMetadatas.push(adMetadata)
                            }
                        }
                    }
                    var b = 0;
                    for (var k = 0, lenk = inlineAdMetadatas.length; k < lenk; k++) {
                        var inlineAdMetadata = inlineAdMetadatas[k];
                        var parsedInlineAdMetadata = JSON.parse(inlineAdMetadata);
                        var inlineAdControlType = parsedInlineAdMetadata.controlType;
                        var inlineAdControlOptions = parsedInlineAdMetadata.controlOptions;
                        this._addURLAdTag(inlineAdControlOptions, context);
                        var width = parseInt(parsedInlineAdMetadata.width);
                        var height = parseInt(parsedInlineAdMetadata.height);
                        var attributes = {
                            controlOptions: inlineAdControlOptions, controlType: inlineAdControlType, width: width, height: height
                        };
                        var found = false;
                        while (b < renderableBlocks.length) {
                            var testRenderableBlock = renderableBlocks[b];
                            b++;
                            if (testRenderableBlock) {
                                var testBlock = testRenderableBlock.block;
                                if (testBlock.type === U.inlineAdBlockType) {
                                    testBlock.attributes = attributes;
                                    found = true;
                                    break
                                }
                            }
                        }
                        if (!found) {
                            var position = Math.floor(contentLength * (k + 1) / (lenk + 1));
                            var inlineAdBlock = {
                                type: U.inlineAdBlockType, attributes: attributes
                            };
                            var renderableBlock = this._createRenderableBlock(inlineAdBlock, position);
                            renderableBlocks.push(renderableBlock);
                            b++;
                            additionalInlineAdBlocks++
                        }
                    }
                }
                return additionalInlineAdBlocks
            }, _addURLAdTag: function _addURLAdTag(adControlOptions, context) {
                if (!(adControlOptions && context && context.data)) {
                    return
                }
                var data = context.data;
                var url = null;
                var metadata = data.metadata || {};
                if (metadata.sharingUrl) {
                    url = encodeURIComponent(data.metadata.sharingUrl)
                }
                if (!url && data.serverArticleId) {
                    url = data.serverArticleId
                }
                var adTags = [];
                if (url) {
                    adTags.push({
                        key: "url", value: url
                    })
                }
                var providerId = metadata.providerId;
                if (providerId) {
                    adTags.push({
                        key: "PROVIDERID", value: providerId
                    })
                }
                if (!adControlOptions.otherAdOptions) {
                    adControlOptions.otherAdOptions = {}
                }
                var otherAdOptions = adControlOptions.otherAdOptions;
                if (!otherAdOptions.adTags) {
                    otherAdOptions.adTags = adTags
                }
                else {
                    if (Array.isArray(otherAdOptions.adTags)) {
                        Array.prototype.push.apply(otherAdOptions.adTags, adTags)
                    }
                    else {
                        otherAdOptions.adTags = adTags
                    }
                }
            }, _processActions: function _processActions(data, context) {
                var auxiliaryData = context.auxiliaryData;
                this._processActionsFromData(data, context);
                this._processNextAndMoreAction(data, context);
                if (this._customOptions && this._customOptions.prevArticleAction) {
                    this._processPreviousAction(data, context)
                }
            }, _processPreviousAction: function _processPreviousAction(data, context) {
                var previousArticle = data.previousArticle;
                if (previousArticle) {
                    var auxiliaryData = context.auxiliaryData;
                    var articleActions = auxiliaryData.articleActions || {};
                    var previousArticleAction = {
                        snippet: previousArticle.headline, abstract: previousArticle.abstract, thumbnail: previousArticle.thumbnail, text: PlatformJS.Services.resourceLoader.getString("/Platform/PreviousArticle"), actionOptions: {
                            actionType: "Previous", actionAttributes: { articleId: previousArticle.articleId }
                        }
                    };
                    articleActions["previous"] = previousArticleAction;
                    auxiliaryData.articleActions = articleActions
                }
            }, _processNextAndMoreAction: function _processNextAndMoreAction(data, context) {
                var auxiliaryData = context.auxiliaryData;
                var metadata = data.metadata;
                var groupedArticleActions = auxiliaryData.groupedArticleActions || [];
                var articleActions = auxiliaryData.articleActions || {};
                var seeMoreActions = [];
                var groupedActions = metadata ? metadata.groupedActions : [];
                var moreArticles = data.moreArticles;
                if (moreArticles && moreArticles.length > 0) {
                    for (var i = 0, leni = moreArticles.length; i < leni; i++) {
                        var nextArticle = moreArticles[i];
                        if (i === 0) {
                            var nextArticleAction = {
                                snippet: nextArticle.headline, abstract: nextArticle.abstract, thumbnail: nextArticle.thumbnail, text: PlatformJS.Services.resourceLoader.getString("/Platform/NextArticle"), actionOptions: {
                                    actionType: "Next", actionAttributes: { articleId: nextArticle.articleId }
                                }
                            };
                            articleActions["next"] = nextArticleAction
                        }
                        else if (!(groupedActions && groupedActions.length > 0)) {
                            var moreSingleAction = {
                                snippet: nextArticle.headline, abstract: nextArticle.abstract, thumbnail: nextArticle.thumbnail, text: "", actionOptions: {
                                    actionType: "Next", actionAttributes: { articleId: nextArticle.articleId }
                                }
                            };
                            seeMoreActions.push(moreSingleAction)
                        }
                    }
                }
                if (seeMoreActions.length > 0) {
                    var seeMoreAction = {
                        labelString: PlatformJS.Services.resourceLoader.getString("/Platform/MoreArticles"), labelId: "", actionOptions: {
                            actionType: "Multi", actionAttributes: { actions: seeMoreActions }
                        }
                    };
                    groupedArticleActions.push(seeMoreAction)
                }
                auxiliaryData.articleActions = articleActions;
                auxiliaryData.groupedArticleActions = groupedArticleActions
            }, _createArticleActions: function _createArticleActions(actions) {
                var actionList = [];
                for (var i = 0, len = actions.length; i < len; i++) {
                    var action = actions[i],
                        text,
                        uri,
                        snippet,
                        attributes = action.attributes,
                        extraLinks = attributes && attributes.extraLinks,
                        key = PlatformJS.Services.appConfig.getString("ExtraLinksKey"),
                        extraLink = extraLinks && extraLinks[key];
                    if (extraLink) {
                        text = extraLink.label;
                        uri = extraLink.appLink || extraLink.externalLink;
                        snippet = extraLink.description
                    }
                    text = text || attributes.label;
                    uri = uri || attributes.uri;
                    snippet = snippet || attributes.description;
                    if (action.type === "LaunchUri" && !uri) {
                        continue
                    }
                    var articleAction = {
                        snippet: snippet, template: action.template, text: text, actionOptions: {
                            actionType: action.type, actionAttributes: action.attributes
                        }
                    };
                    var icon = action.icon;
                    if (icon) {
                        articleAction.icon = {
                            type: "image", url: icon.url
                        }
                    }
                    actionList.push(articleAction)
                }
                return actionList
            }, _createGroupedArticleActions: function _createGroupedArticleActions(groupedActions) {
                var groupedList = [];
                for (var i = 0, leni = groupedActions.length; i < leni; i++) {
                    var groupedAction = groupedActions[i];
                    var actions = this._createArticleActions(groupedAction.actions);
                    var groupedArticleAction = {
                        labelString: groupedAction.labelString, labelId: groupedAction.labelId, actionOptions: {
                            actionType: "Multi", actionAttributes: { actions: actions }
                        }
                    };
                    groupedList.push(groupedArticleAction)
                }
                return groupedList
            }, _processActionsFromData: function _processActionsFromData(data, context) {
                var articleActions = {};
                var groupedArticleActions = [];
                var metadata = data.metadata;
                var groupedActions = metadata ? metadata.groupedActions : [];
                var actions = metadata ? metadata.actions : [];
                var auxiliaryData = context.auxiliaryData;
                if (actions && actions.length > 0) {
                    var singleActions = this._createArticleActions(actions);
                    for (var i = 0, leni = singleActions.length; i < leni; i++) {
                        var action = singleActions[i];
                        var actionKey = "action_" + i;
                        articleActions[actionKey] = action
                    }
                }
                if (groupedActions && groupedActions.length > 0) {
                    var processedGroupedArticleActions = this._createGroupedArticleActions(groupedActions);
                    for (var j = 0, lenj = processedGroupedArticleActions.length; j < lenj; j++) {
                        var groupedAction = processedGroupedArticleActions[j];
                        groupedArticleActions.push(groupedAction)
                    }
                }
                auxiliaryData.groupedArticleActions = groupedArticleActions;
                auxiliaryData.articleActions = articleActions;
                if (!auxiliaryData.actionsHandlerType) {
                    auxiliaryData.actionsHandlerType = "CommonJS.ArticleReader.ActionsHandler"
                }
            }, _populateContent: function _populateContent(context) {
                var contentFrameManager = this._contentFrameManager;
                var auxiliaryData = context.auxiliaryData;
                var flowId = auxiliaryData.flowId;
                var renderData = context.renderData;
                var content = renderData.content;
                var initialTextAttributes = auxiliaryData.textAttributes;
                var contentCssPaths = auxiliaryData.contentCssPaths;
                var articleHeader = auxiliaryData.articleHeader;
                var articleMetadata = auxiliaryData.articleMetadata;
                var actionsHandlerType = auxiliaryData.actionsHandlerType;
                var disableTextSelection = auxiliaryData.disableTextSelection;
                contentFrameManager.setup(initialTextAttributes, flowId, contentCssPaths, actionsHandlerType, articleHeader, articleMetadata, disableTextSelection);
                contentFrameManager.addContent(content)
            }, _calibrateLayout: function _calibrateLayout(context) {
                var surfaceManager = this._surfaceManager;
                var contentDensity = surfaceManager.getContentDensity(context);
                var renderData = context.renderData;
                var content = renderData.content;
                var contentLength = content.length;
                var gridOptions = context.gridOptions;
                var columnWidth = gridOptions.columnWidth;
                var columnHeight = gridOptions.columnHeight;
                var columnCount = gridOptions.columnCount;
                var contentColumnCount = contentDensity === 0 ? 0 : Math.ceil((contentLength / contentDensity) / (columnWidth * columnHeight));
                var calibrationData = context.calibrationData;
                calibrationData.contentDensity = contentDensity;
                calibrationData.contentColumnCount = contentColumnCount
            }, _adjustSurface: function _adjustSurface(context, useLayoutHints) {
                if (!context) {
                    debugger;
                    return WinJS.Promise.wrap(null)
                }
                this._width = -1;
                var surfaceManager = this._surfaceManager;
                var promise = surfaceManager.adjust(context, useLayoutHints);
                return promise
            }, _getSectionHeaderHtml: function _getSectionHeaderHtml(sectionName) {
                var elt = document.createElement("h2");
                elt.innerText = sectionName;
                var html = elt.outerHTML;
                return html
            }, _getRenderableTitle: function _getRenderableTitle(title, renderableBlocks, context) {
                var authorOrByline = title.author || title.byline;
                var publisherName = this._getPublisherName(title);
                var renderableTitle = {
                    headline: title.headline || "", style: null, author: authorOrByline !== publisherName ? authorOrByline : "", date: this._getDateString(title), titleImage: null, publisher: title.publisher || null, kicker: title.kicker || "", customId: title.customId || null, customType: title.customType || null
                };
                this._determineTitleStyle(title, renderableTitle, renderableBlocks, context);
                return renderableTitle
            }, _getDateString: function _getDateString(title) {
                var publisherName = this._getPublisherName(title);
                var effectiveDate = U.getEffectiveDate(title);
                var dateString;
                var dateFormatter = CommonJS.Utils.DateTimeFormatting.getDateTimeFormatter(publisherName);
                if (dateFormatter) {
                    dateString = dateFormatter(effectiveDate, CommonJS.Utils.DateTimeFormatting.dateTimeFormat.article)
                }
                if (!dateFormatter || !dateString) {
                    dateString = U.convertDateToString(effectiveDate);
                    var separator = (publisherName.length > 0 && dateString.length > 0) ? " - " : "";
                    dateString = (publisherName + separator + dateString) || ""
                }
                return dateString
            }, _getPublisherName: function _getPublisherName(title) {
                var publisherName = "";
                if (title.publisher && title.publisher.name) {
                    publisherName = title.publisher.name
                }
                return publisherName
            }, _getDateForInstrumentation: function _getDateForInstrumentation(title) {
                var date = null;
                var effectiveDate = U.getEffectiveDate(title);
                if (!effectiveDate || typeof (effectiveDate) === "string") {
                    date = new Date(0)
                }
                else {
                    date = new Date(effectiveDate.utctime / 10000 + Date.UTC(1601, 0, 1, 0, 0, 0))
                }
                return date
            }, _isTemplateDefaultable: function _isTemplateDefaultable(gridOptions, titleStyle) {
                var pageWidth = gridOptions.pageWidth;
                var pageHeight = gridOptions.pageHeight;
                var isTemplateDefaultable = ((pageWidth < 768) || (pageHeight < 1366 && pageWidth < 1000)) && titleStyle !== 10;
                return isTemplateDefaultable
            }, _determineTitleStyle: function _determineTitleStyle(title, renderableTitle, renderableBlocks, context) {
                var gridOptions = context.gridOptions;
                var titleStyle = title.style;
                var titleImage = title.titleImage;
                var titleRenderers = CommonJS.ArticleReader.SurfaceManager.titleRenderers;
                var defaultStyle = this._defaultStyle;
                var landscapeImageStyle = this._landscapeStyle;
                var portraitImageStyle = this._portraitStyle;
                var isServerPaddedImage = this._fixServerPaddedImage(titleImage, renderableBlocks, renderableTitle);
                if (isServerPaddedImage) {
                    return
                }
                var renderableStyle,
                    renderableTitleImage;
                var isTemplateDefaultable = this._isTemplateDefaultable(gridOptions, titleStyle);
                if (isTemplateDefaultable) {
                    renderableStyle = defaultStyle;
                    this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context)
                }
                else if (titleStyle) {
                    renderableStyle = titleStyle;
                    switch (renderableStyle) {
                        case 1:
                            renderableStyle = defaultStyle;
                            break;
                        case 2:
                            renderableStyle = landscapeImageStyle;
                            break;
                        case 3:
                            renderableStyle = landscapeImageStyle;
                            break;
                        case 4:
                            renderableStyle = defaultStyle;
                            break;
                        case 9:
                            renderableStyle = portraitImageStyle;
                            break
                    }
                    var titleRenderer = titleRenderers[renderableStyle];
                    if (titleRenderer) {
                        switch (renderableStyle) {
                            case 1:
                                this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context);
                                break;
                            case 2:
                            case 200:
                                var validateResult2 = this._validateTitleImage(titleImage, renderableBlocks, 1.3, 1.89, 950, renderableStyle, renderableTitleImage, context);
                                renderableStyle = validateResult2.renderableStyle;
                                renderableTitleImage = validateResult2.renderableTitleImage;
                                break;
                            case 9:
                            case 900:
                                var validateResult9 = this._validateTitleImage(titleImage, renderableBlocks, 0.5, 0.89, 580, renderableStyle, renderableTitleImage, context);
                                renderableStyle = validateResult9.renderableStyle;
                                renderableTitleImage = validateResult9.renderableTitleImage;
                                break;
                            case 100:
                                this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context);
                                break
                        }
                    }
                    else {
                        renderableStyle = defaultStyle;
                        this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context)
                    }
                }
                else {
                    renderableStyle = defaultStyle;
                    this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context)
                }
                renderableTitle.style = renderableStyle;
                renderableTitle.titleImage = renderableTitleImage
            }, _fixServerPaddedImage: function _fixServerPaddedImage(titleImage, renderableBlocks, renderableTitle) {
                var isServerPaddedImage = false;
                if (titleImage) {
                    var image = titleImage.image;
                    if (image) {
                        var inlineResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image, "inline");
                        if (inlineResource) {
                            var minPosition = Number.MAX_VALUE;
                            for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                                var renderableBlock = renderableBlocks[i];
                                var position = renderableBlock.position;
                                minPosition = Math.min(minPosition, position)
                            }
                            var inlinePosition = (minPosition === Number.MAX_VALUE) ? 0 : Math.max(0, minPosition / 2);
                            var originalResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image, "original");
                            var lowResResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image, "lowRes");
                            var inlineLowResResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(image, "inlineLowRes");
                            var images = [];
                            if (inlineLowResResource) {
                                images.push({
                                    name: "lowRes", url: inlineLowResResource.url, width: inlineLowResResource.width, height: inlineLowResResource.height
                                })
                            }
                            images.push({
                                name: "original", url: inlineResource.url, width: inlineResource.width, height: inlineResource.height
                            });
                            var block = {
                                type: "InlineImage", attributes: {
                                    image: {
                                        attribution: image.attribution, caption: image.caption, altText: image.altText, images: images
                                    }
                                }
                            };
                            var inlineRenderableBlock = this._createRenderableBlock(block, inlinePosition);
                            renderableBlocks.push(inlineRenderableBlock);
                            isServerPaddedImage = true;
                            renderableTitle.style = 1;
                            renderableTitle.titleImage = null
                        }
                    }
                }
                return isServerPaddedImage
            }, _validateTitleImage: function _validateTitleImage(titleImage, renderableBlocks, minAspectRatio, maxAspectRatio, minWidth, renderableStyle, renderableTitleImage, context) {
                if (titleImage) {
                    var imageResource = CommonJS.ArticleReader.ArticleReaderUtils.getImageResource(titleImage.image);
                    var width = imageResource.width;
                    var height = imageResource.height;
                    var aspectRatio = width / height;
                    if (aspectRatio < minAspectRatio || aspectRatio > maxAspectRatio || width < minWidth) {
                        this._demoteTitleImageToInlineImage(titleImage, renderableBlocks, context);
                        renderableStyle = this._defaultStyle
                    }
                    else {
                        renderableTitleImage = titleImage
                    }
                }
                else {
                    renderableStyle = this._defaultStyle
                }
                return {
                    renderableStyle: renderableStyle, renderableTitleImage: renderableTitleImage
                }
            }, _demoteTitleImageToInlineImage: function _demoteTitleImageToInlineImage(titleImage, renderableBlocks, context) {
                if (titleImage) {
                    var renderData = context.renderData;
                    var block = {
                        type: "InlineImage", attributes: titleImage
                    };
                    var renderableBlock = this._createRenderableBlock(block, 0);
                    renderableBlocks.push(renderableBlock)
                }
            }, _maybeConvertToJsonArray: function _maybeConvertToJsonArray(array) {
                var jsonArray;
                if (array && array.length) {
                    jsonArray = [];
                    for (var i = 0, len = array.length; i < len; i++) {
                        var item = array[i];
                        jsonArray.push(item)
                    }
                }
                return jsonArray || null
            }, _processTitle: function _processTitle(renderableTitle, renderableBlocks, context) {
                var surfaceManager = this._surfaceManager;
                var style = renderableTitle.style;
                var titleRenderer = CommonJS.ArticleReader.SurfaceManager.titleRenderers[style];
                var titleBlocks = titleRenderer.render(renderableTitle, context);
                var titleRenderableBlocks = {};
                for (var k in titleBlocks) {
                    var titleBlock = titleBlocks[k];
                    var renderableBlock = this._createRenderableBlock(titleBlock, -1);
                    renderableBlocks.push(renderableBlock);
                    titleRenderableBlocks[k] = renderableBlock
                }
                return titleRenderableBlocks
            }, _createRenderableBlock: function _createRenderableBlock(block, position) {
                var renderableBlock = {
                    block: block, position: position, layout: null, element: null, exclusion: null
                };
                return renderableBlock
            }, _renderImpl: function _renderImpl(context) {
                var that = this;
                return WinJS.Promise.wrap(null).then(function articlereader_getGrowlMessage() {
                    var messageFunction = context.auxiliaryData.paywallGrowlMessageFunction;
                    if (messageFunction) {
                        return messageFunction(false, that.getHeader()).then(function articlereader_setGrowlMessage(message) {
                            context.auxiliaryData.paywallGrowlMessage = message
                        }, function articlereader_getgrowlmessage_errror() {
                            debugger
                        })
                    }
                }).then(function _ArticleReader_1927() {
                    return that._calibrateLayout(context)
                }).then(function _ArticleReader_1931() {
                    return that._surfaceManager.createElements(context)
                }).then(function _ArticleReader_1935() {
                    return that._surfaceManager.calculateLayout(context)
                }).then(function _ArticleReader_1940() {
                    return that._surfaceManager.associateLayoutWithElements(context)
                }).then(function _ArticleReader_1945() {
                    return that._adjustSurface(context, false)
                }).then(function _ArticleReader_1949() {
                    that._isRendered = true;
                    that._updateWidth()
                })
            }, _renderImplFromLayout: function _renderImplFromLayout(layout, context) {
                var that = this;
                var surfaceManager = this._surfaceManager;
                return WinJS.Promise.wrap(null).then(function _ArticleReader_1960() {
                    that._setLayout(layout, context);
                    if (context.renderData.additionalInlineAdBlocks) {
                        that._redistributeInlineAds(context)
                    }
                    return surfaceManager.renderFirstPageWithHints(context)
                }).then(function _ArticleReader_1971(result) {
                    that.dispatchEvent("articleinteractive", {});
                    return WinJS.Promise.timeout(0)
                }).then(function _ArticleReader_1975() {
                    return surfaceManager.renderSubsequentPagesWithHints(context)
                }).then(function _ArticleReader_1979() {
                    return WinJS.Promise.timeout(0)
                }).then(function _ArticleReader_1982() {
                    return that._maybeAdjustTextAttributes(layout, context, true)
                }).then(function _ArticleReader_1986() {
                    that._isRendered = true;
                    that._updateWidth()
                })
            }, _relayoutImplFromLayout: function _relayoutImplFromLayout(layout, context) {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                var surfaceManager = this._surfaceManager;
                promise = promise.then(function _ArticleReader_1998() {
                    that._setLayout(layout, context);
                    if (context.renderData.additionalInlineAdBlocks) {
                        that._redistributeInlineAds(context)
                    }
                    return surfaceManager.renderFirstPageWithHints(context)
                }).then(function _ArticleReader_2009() {
                    that.dispatchEvent("articleinteractive", {});
                    return WinJS.Promise.timeout(0)
                }).then(function _ArticleReader_2013() {
                    return surfaceManager.renderSubsequentPagesWithHints(context)
                }).then(function _ArticleReader_2017() {
                    return that._maybeAdjustTextAttributes(layout, context, false)
                }).then(function _ArticleReader_2021() {
                    return that._adjustSurface(context, true)
                }).then(this._updateWidth.bind(this));
                return promise
            }, _maybeAdjustTextAttributes: function _maybeAdjustTextAttributes(layout, context, adjustSurface) {
                var that = this;
                var auxiliaryData = context.auxiliaryData;
                var textAttributes = auxiliaryData.textAttributes;
                var layoutProperties = layout.properties;
                var isMatch = U.doTextAttributesMatch(layoutProperties, textAttributes);
                var promise = WinJS.Promise.wrap(null);
                if (!isMatch) {
                    promise = promise.then(function _ArticleReader_2041() {
                        return that._setTextAttributes(textAttributes)
                    });
                    if (adjustSurface) {
                        promise = promise.then(this._adjustSurface.bind(this, context, true))
                    }
                }
                return promise
            }, _setTextAttributes: function _setTextAttributes(textAttributes) {
                var contentFrameManager = this._contentFrameManager;
                contentFrameManager.setTextAttributes(textAttributes);
                var currentContext = this._context;
                if (currentContext) {
                    var auxiliaryData = currentContext.auxiliaryData;
                    auxiliaryData.textAttributes = textAttributes
                }
                var promise = WinJS.Promise.wrap(null);
                return promise
            }, _setLayout: function _setLayout(layout, context) {
                var renderData = context.renderData;
                var layoutData = context.layoutData;
                var renderableBlocks = renderData.renderableBlocks;
                var additionalInlineAdBlocks = renderData.additionalInlineAdBlocks;
                var compressedHints = layout.hints;
                var hints = CommonJS.ArticleReader.ArticleReaderUtils.expandHints(compressedHints);
                var blockLayouts = hints.blockLayouts;
                var pageCount = hints.pageCount;
                if (blockLayouts.length + additionalInlineAdBlocks !== renderableBlocks.length) {
                    debugger;
                    throw "layout is not valid";
                }
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var blockLayout = blockLayouts[i];
                    renderableBlock.layout = blockLayout;
                    renderableBlock.exclusion = null
                }
                layoutData.pageCount = pageCount
            }, _createEndBlocks: function _createEndBlocks(context) {
                var renderData = context.renderData;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                if (!this._containsBlockOfType(endRenderableBlocks, "EndAd")) {
                    this._createEndAd(context)
                }
                if (!this._containsBlockOfType(endRenderableBlocks, "CollapsedAd")) {
                    this._createCollapsedAd(context)
                }
                if (!this._containsBlockOfType(endRenderableBlocks, "Actions")) {
                    this._createActions(context)
                }
                U.sortRenderableBlocks(endRenderableBlocks)
            }, _containsBlockOfType: function _containsBlockOfType(renderableBlocks, type) {
                var contains = false;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var block = renderableBlock.block;
                    if (block.type === type) {
                        contains = true;
                        break
                    }
                }
                return contains
            }, _createEndAd: function _createEndAd(context) {
                this._createEndOfArticleAd(context, "end", "EndAd")
            }, _createCollapsedAd: function _createCollapsedAd(context) {
                this._createEndOfArticleAd(context, "noad", "CollapsedAd")
            }, _createEndOfArticleAd: function _createEndOfArticleAd(context, adtype, blockType) {
                var renderData = context.renderData;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                var auxiliaryData = context.auxiliaryData;
                var adGroups = auxiliaryData.adGroups;
                var endAdMetadata = null;
                for (var i = 0, len = adGroups.length; i < len; i++) {
                    var adGroup = adGroups[i];
                    var type = adGroup.type;
                    if (type === adtype) {
                        var adMetadatas = adGroup.adMetadatas;
                        if (adMetadatas && adMetadatas.length) {
                            endAdMetadata = adMetadatas[0];
                            break
                        }
                    }
                }
                if (endAdMetadata) {
                    var parsedEndAdMetadata = JSON.parse(endAdMetadata);
                    var endAdControlType = parsedEndAdMetadata.controlType;
                    var endAdControlOptions = parsedEndAdMetadata.controlOptions;
                    this._addURLAdTag(endAdControlOptions, context);
                    var endAdBlock = {
                        type: blockType, attributes: {
                            controlOptions: endAdControlOptions, controlType: endAdControlType
                        }
                    };
                    var renderableBlock = this._createRenderableBlock(endAdBlock, -30);
                    endRenderableBlocks.push(renderableBlock)
                }
            }, _createActions: function _createActions(context) {
                var endRenderableBlocks = context.renderData.endRenderableBlocks;
                var auxiliaryData = context.auxiliaryData;
                if (auxiliaryData.renderEOAB) {
                    var actionsBlock = {
                        type: "Actions", attributes: {
                            groupedArticleActions: auxiliaryData.groupedArticleActions, articleActions: auxiliaryData.articleActions, actionsHandlerType: auxiliaryData.actionsHandlerType
                        }
                    };
                    var renderableBlock = this._createRenderableBlock(actionsBlock, -10);
                    endRenderableBlocks.push(renderableBlock)
                }
            }, _updateWidth: function _updateWidth() {
                var surfaceManager = this._surfaceManager;
                var width = this._width;
                if (width === -1) {
                    var currentContext = this._context;
                    if (currentContext) {
                        this._width = width = surfaceManager.getWidth(currentContext)
                    }
                    if (width <= 0) {
                        this._width = width = -1
                    }
                }
            }, _updateInstrumentationData: function _updateInstrumentationData(isRender, layout, renderData) {
                var renderInfo = this._getRenderInfo(isRender, layout, renderData);
                var instrumentationData = this._instrumentationData;
                if (instrumentationData) {
                    instrumentationData.renderType = renderInfo;
                    instrumentationData.pageCount = this.getPageCount()
                }
                if (PlatformJS.isDebug) {
                    var context = this._context;
                    if (context) {
                        var gridOptions = context.gridOptions;
                        var pageWidth = gridOptions.pageWidth;
                        var pageHeight = gridOptions.pageHeight;
                        renderInfo = renderInfo + " " + pageWidth + "x" + pageHeight
                    }
                    CommonJS.ArticleReaderPage.updateDebugIndicator(renderInfo, null)
                }
            }, _getRenderInfo: function _getRenderInfo(isRender, layout, renderData) {
                var renderInfo = isRender ? "Layout" : "Relayout";
                if (layout) {
                    renderInfo += "-Hints";
                    renderInfo += layout.isClientGenerated ? "-Client" : "-Server"
                }
                else {
                    if (renderData) {
                        renderInfo += "-UnusableHints";
                        renderInfo += renderData.isClientGenerated ? "-Client" : "-Server"
                    }
                    else {
                        renderInfo += "-NoHints"
                    }
                }
                return renderInfo
            }, _fixAdGroups: function _fixAdGroups(adGroups, gridOptions) {
                var inlineAds = [];
                var endAds = [];
                var otherAds = [];
                var columnCount = gridOptions.columnCount;
                for (var i = 0, leni = adGroups.length; i < leni; i++) {
                    var adGroup = adGroups[i];
                    var type = adGroup.type;
                    if (type === "inline") {
                        inlineAds.push(adGroup)
                    }
                    else if (type === "end" || type === "noad") {
                        endAds.push(adGroup)
                    }
                    else {
                        otherAds.push(adGroup)
                    }
                }
                if (inlineAds.length > 0 && endAds.length > 0) {
                    if (columnCount === 1) {
                        adGroups = inlineAds.concat(otherAds)
                    }
                    else {
                        adGroups = endAds.concat(otherAds)
                    }
                }
                return adGroups
            }, _hideInlineAds: function _hideInlineAds(adGroups) {
                if (adGroups) {
                    for (var i = 0, leni = adGroups.length; i < leni; i++) {
                        if (adGroups[i].type === "inline") {
                            return false
                        }
                    }
                }
                return true
            }, _clearRenderDataBlocks: function _clearRenderDataBlocks(renderData) {
                var surfaceManager = this._surfaceManager;
                if (renderData) {
                    surfaceManager.removeBlocks(renderData.renderableBlocks);
                    surfaceManager.removeBlocks(renderData.endRenderableBlocks);
                    surfaceManager.removeBlocks(renderData.titleRenderableBlocks)
                }
            }, _redistributeInlineAds: function _redistributeInlineAds(context) {
                var renderData = context.renderData;
                var additionalInlineAdBlocks = context.renderData.additionalInlineAdBlocks;
                if (additionalInlineAdBlocks > 0) {
                    var pageCount = context.layoutData.pageCount;
                    var renderableBlocks = renderData.renderableBlocks;
                    var gridOptions = context.gridOptions;
                    var columnCount = gridOptions.columnCount;
                    var inlineAdBlocks = [];
                    var totalColumns = pageCount * columnCount;
                    var occupiedColumns = [];
                    for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                        var renderableBlock = renderableBlocks[i];
                        var blockType = renderableBlock.block.type;
                        switch (blockType) {
                            case U.inlineAdBlockType:
                                inlineAdBlocks.push(renderableBlock);
                                renderableBlocks.splice(i, 1);
                                len--;
                                i--;
                                break;
                            case U.titleRectBlockType:
                            case U.titleTextBlockType:
                                break;
                            default:
                                var layout = renderableBlock.layout;
                                var column = U.convertGridColumnToColumnIndex(layout.column, columnCount);
                                var columnSpan = U.convertGridColumnSpanToColumnSpan(layout.columnSpan);
                                for (var c = 0; c < columnSpan; c++) {
                                    occupiedColumns[column + c] = true
                                }
                                break
                        }
                    }
                    var columnWidth = gridOptions.columnWidth;
                    var totalAds = inlineAdBlocks.length;
                    var iAd = 0;
                    var adFrequency = totalAds > pageCount ? columnCount : totalColumns / totalAds;
                    for (var c = 0; iAd < totalAds && c < totalColumns; c++) {
                        if (!occupiedColumns[c]) {
                            var block = inlineAdBlocks[iAd];
                            var layout = block.layout;
                            block.layout = U.generateInlineAdLayout(layout, c, columnCount, columnWidth, iAd % 2, false);
                            c = Math.ceil(c + adFrequency - 1);
                            iAd++
                        }
                    }
                    for (; iAd < totalAds; iAd++) {
                        var block = inlineAdBlocks[iAd];
                        var layout = block.layout;
                        block.layout = U.generateInlineAdLayout(layout, c, columnCount, columnWidth, iAd % 2, true)
                    }
                    var lastBlockPosition = 0;
                    for (i = 0, iAd = 0, len = renderableBlocks.length; i < len && iAd < totalAds; i++) {
                        var adBlock = inlineAdBlocks[iAd];
                        var block = renderableBlocks[i];
                        var blockPosition = block.position;
                        if (blockPosition >= 0) {
                            if (adBlock.layout.column < block.layout.column) {
                                adBlock.position = ++lastBlockPosition;
                                renderableBlocks.splice(i, 0, adBlock);
                                iAd++;
                                len++
                            }
                            else {
                                lastBlockPosition = blockPosition
                            }
                        }
                    }
                    for (; iAd < totalAds; iAd++) {
                        var adBlock = inlineAdBlocks[iAd];
                        adBlock.position = ++lastBlockPosition;
                        renderableBlocks.push(adBlock)
                    }
                }
            }
        }, {
            _maxSnippetLength: 100, _defaultHeaderStyle: 1
        }), WinJS.Utilities.eventMixin)
    })
})();
(function _ArticleReaderOrchestrator_7() {
    "use strict";
    var landscapeGridConstants = {
        leftMargin: 120, columnMargin: 30, defaultRightMargin: 50, topMargin: 30, bottomMargin: 50, minColumnWidth: 300, maxColumnWidth: 450
    };
    var portraitGridConstants = {
        leftMargin: 100, columnMargin: 30, defaultRightMargin: 100, topMargin: 30, bottomMargin: 80, minColumnWidth: 375, maxColumnWidth: 770
    };
    var smallPortraitGridConstants = {
        leftMargin: 100, columnMargin: 30, defaultRightMargin: 50, topMargin: 30, bottomMargin: 80, minColumnWidth: 300, maxColumnWidth: 770
    };
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleReaderOrchestrator: WinJS.Class.mix(WinJS.Class.define(function _ArticleReaderOrchestrator_45(elt, options) {
            var viewport = this._viewport = elt || document.createElement("div");
            WinJS.Utilities.addClass(viewport, "orchestrator");
            if (options.categoryKey) {
                WinJS.Utilities.addClass(viewport, options.categoryKey)
            }
            var panel = this._panel = document.createElement("div");
            WinJS.Utilities.addClass(panel, "panel viewport");
            viewport.appendChild(panel);
            var scrollListener = this._scrollListener = this._onScroll.bind(this);
            viewport.addEventListener("scroll", scrollListener);
            var flipperConfig = CommonJS.Configuration.ConfigurationManager.custom.getDictionary('flipper');
            var paginatedViewManager = this._paginatedViewManager = new CommonJS.ArticleReader.ArticleReaderPaginatedViewManager({
                orchestrator: this, flippersAlwaysVisible: flipperConfig.getBool('isPermanent', false), touchToShowFlippers: flipperConfig.getBool('isTouchToShowEnabled', true)
            });
            paginatedViewManager.attachEventListeners(elt);
            this._articles = {};
            this._currentArticleId = null;
            this._pageWidth = null;
            this._pageHeight = null;
            this._scrollTimer = null;
            this._monitorScroll = true;
            this._market = options.market;
            this._categoryName = options.categoryName;
            this._customOptions = options.customOptions;
            this._gridOptions = null;
            this._displayData = PlatformJS.Utilities.getDisplayData();
            this._renderPromise = WinJS.Promise.wrap({});
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("swipetounrealizedarticle"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("nearunrealizedarticle"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("scrolltoarticle"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("nextarticlevisible"))
        }, {
            _viewport: null, _panel: null, _articles: null, _currentArticleId: null, _pageWidth: null, _pageHeight: null, _scrollListener: null, _scrollTimer: null, _monitorScroll: null, _paginatedViewManager: null, _staticPositionTimer: null, _scrollAnimationTimeout: null, _market: null, _customOptions: null, _gridOptions: null, _displayData: null, currentScrollSwipeMethod: U.viewMechanism.unknown, _isErrorVisible: null, _categoryName: null, _renderPromise: null, paywallCardTemplatePromise: null, updatePaywallCardFunction: null, viewport: {
                get: function get() {
                    return this._viewport
                }
            }, currentArticleId: {
                get: function get() {
                    return this._currentArticleId
                }
            }, nextArticleId: {
                get: function get() {
                    var nextArticleId = null;
                    var articles = this._articles;
                    var currentArticleId = this._currentArticleId;
                    var currentArticle = articles[currentArticleId];
                    if (currentArticle) {
                        var nextArticle = currentArticle.next;
                        if (nextArticle) {
                            nextArticleId = nextArticle.articleId
                        }
                    }
                    return nextArticleId
                }
            }, previousArticleId: {
                get: function get() {
                    var previousArticleId = null;
                    var articles = this._articles;
                    var currentArticleId = this._currentArticleId;
                    var currentArticle = articles[currentArticleId];
                    if (currentArticle) {
                        var previousArticle = currentArticle.previous;
                        if (previousArticle) {
                            previousArticleId = previousArticle.articleId
                        }
                    }
                    return previousArticleId
                }
            }, currentPageIndex: {
                get: function get() {
                    return this._getCurrentPageIndex(this.currentArticleId)
                }
            }, focusViewport: function focusViewport() {
                this._viewport.focus()
            }, isErrorVisible: {
                get: function get() {
                    return this._isErrorVisible
                }
            }, dispose: function dispose() {
                var panel = this._panel;
                var viewport = this._viewport;
                var scrollListener = this._scrollListener;
                viewport.removeEventListener("scroll", scrollListener);
                var paginatedViewManager = this._paginatedViewManager;
                paginatedViewManager.dispose();
                var articles = this._articles;
                for (var articleId in articles) {
                    var article = articles[articleId];
                    if (!article) {
                        continue
                    }
                    var articleReader = article.articleReader;
                    var placeholder = article.placeholder;
                    if (articleReader) {
                        articleReader.dispose();
                        var interactiveListener = article.interactiveListener;
                        articleReader.removeEventListener("articleinteractive", interactiveListener)
                    }
                    article.interactiveListener = null;
                    if (placeholder) {
                        placeholder.dispose()
                    }
                }
                var scrollTimer = this._scrollTimer;
                clearTimeout(scrollTimer)
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                var promise = WinJS.Promise.wrap(null);
                var currentArticleId = this._currentArticleId;
                var articles = this._articles;
                var article = articles[currentArticleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        promise = articleReader.setTextAttributes(textAttributes)
                    }
                }
                return promise
            }, setTextAttributesAndRelayout: function setTextAttributesAndRelayout(textAttributes) {
                var that = this;
                var promise = this.setTextAttributes(textAttributes);
                promise = promise.then(function _ArticleReaderOrchestrator_251() {
                    return that._relayoutImpl({})
                });
                return promise
            }, getHeader: function getHeader(articleId) {
                articleId = articleId === null || typeof articleId === "undefined" ? this._currentArticleId : articleId;
                var articles = this._articles;
                var header;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        header = articleReader.getHeader()
                    }
                }
                return header
            }, getPageWidth: function getPageWidth() {
                var pageWidth = this._pageWidth;
                if (!pageWidth) {
                    this._pageWidth = this._measurePageWidth()
                }
                return this._pageWidth
            }, getPageHeight: function getPageHeight() {
                var pageHeight = this._pageHeight;
                if (!pageHeight) {
                    this._pageHeight = this._measurePageHeight()
                }
                return this._pageHeight
            }, setSnapPoint: function setSnapPoint(lastScroll) {
                var scrollLeft = this._viewport.scrollLeft;
                var pageWidth = this.getPageWidth();
                if (scrollLeft % pageWidth !== 0) {
                    var func = (lastScroll - scrollLeft > 0 ? Math.floor : Math.ceil);
                    this._viewport.scrollLeft = func(scrollLeft / pageWidth) * pageWidth
                }
            }, isPageBoundary: function isPageBoundary(scrollLeft) {
                var pageWidth = this.getPageWidth();
                return (scrollLeft % pageWidth === 0)
            }, isDifferentArticle: function isDifferentArticle(oldScrollLeft, newScrollLeft) {
                var oldArticleId = this._getArticleIdFromScroll(oldScrollLeft);
                var newArticleId = this._getArticleIdFromScroll(newScrollLeft);
                return oldArticleId !== newArticleId
            }, render: function render(articleId, data, renderOptions, navigateOptions, preRender) {
                this._renderPromise = this._renderImpl(articleId, data, renderOptions, navigateOptions, preRender);
                return this._renderPromise
            }, relayout: function relayout() {
                this._renderPromise = this._relayoutImpl();
                return this._renderPromise
            }, scrollToArticle: function scrollToArticle(articleId) {
                var exists = !!this._articles[articleId];
                if (exists) {
                    this._currentArticleId = articleId;
                    this._adjustWindow()
                }
            }, showArticleError: function showArticleError(articleId, errorCode, errorCallback) {
                var articles = this._articles;
                var article = articles[articleId];
                this._monitorScroll = true;
                this._isErrorVisible = true;
                if (article) {
                    CommonJS.Error.showError(errorCode, errorCallback, null, null, article.placeholder.element)
                }
                else {
                    CommonJS.Error.showError(errorCode, errorCallback, null, null, null)
                }
            }, removeArticleError: function removeArticleError() {
                CommonJS.Error.removeError();
                this._isErrorVisible = false
            }, progress: function progress(articleId, preRender, state) {
                switch (state) {
                    case "start":
                        if (!preRender) {
                            U.showModalProgress()
                        }
                        break;
                    case "datacomplete":
                        break;
                    case "rendercomplete":
                    case "error":
                        U.hideModalProgress();
                        break
                }
            }, articleFocusLost: function articleFocusLost(oldArticleId) {
                var articles = this._articles;
                var oldArticle = articles[oldArticleId];
                if (oldArticle) {
                    var oldArticleReader = oldArticle.articleReader;
                    if (oldArticleReader) {
                        oldArticleReader.articleFocusLost()
                    }
                }
            }, hasNextPage: function hasNextPage() {
                var articleId = this._currentArticleId;
                var articles = this._articles;
                var article = articles[articleId];
                var pageWidth = this.getPageWidth();
                if (!article) {
                    return false
                }
                if (article.articleReader && article.articleReader.articleType === "webpage" && !article.articleReader.isRendered) {
                    return false
                }
                var hasNext = false;
                var next = article.next;
                if (next) {
                    hasNext = true
                }
                else {
                    var pageCount = this._getArticlePageCount(article);
                    var pageIndex = this._getCurrentPageIndex(articleId);
                    hasNext = (pageIndex < pageCount - 1)
                }
                return hasNext
            }, hasPreviousPage: function hasPreviousPage() {
                var articleId = this._currentArticleId;
                var articles = this._articles;
                var article = articles[articleId];
                if (!article) {
                    return false
                }
                if (article.articleReader && article.articleReader.articleType === "webpage" && !article.articleReader.isRendered) {
                    return false
                }
                var hasPrevious = false;
                var previous = article.previous;
                if (previous) {
                    hasPrevious = true
                }
                else {
                    var pageIndex = this._getCurrentPageIndex(articleId);
                    hasPrevious = (pageIndex > 0)
                }
                return hasPrevious
            }, scrollOneUnit: function scrollOneUnit(direction) {
                return this.scrollOnePage(direction)
            }, scrollOnePage: function scrollOnePage(direction) {
                var viewport = this._viewport;
                var scrollLeft = viewport.scrollLeft;
                var target = scrollLeft;
                if ((direction === 1 && this.hasNextPage()) || (direction === 2 && this.hasPreviousPage())) {
                    var panel = this._panel;
                    target = this._getScrollTarget(scrollLeft, direction);
                    this._animateScroll(viewport, panel, target)
                }
                return target
            }, scrollToStartOfCurrentArticle: function scrollToStartOfCurrentArticle() {
                var articleId = this._currentArticleId;
                this._scrollToPageIndex(articleId, 0)
            }, scrollToEndOfCurrentArticle: function scrollToEndOfCurrentArticle() {
                var articleId = this._currentArticleId;
                this._scrollToPageIndex(articleId, Number.MAX_VALUE)
            }, getInstrumentationData: function getInstrumentationData(articleId) {
                var instrumentationData = null;
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        instrumentationData = articleReader.getInstrumentationData()
                    }
                }
                return instrumentationData
            }, getLayout: function getLayout(articleId) {
                var layout = null;
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        layout = articleReader.getLayout()
                    }
                }
                return layout
            }, getRenderData: function getRenderData(articleId) {
                var renderData = null;
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        renderData = articleReader.getRenderData()
                    }
                }
                return renderData
            }, isPaginated: function isPaginated() {
                return true
            }, hasBottomEdgyNavigation: function hasBottomEdgyNavigation() {
                return true
            }, hasPageNumbers: function hasPageNumbers() {
                return true
            }, isArticleRendered: function isArticleRendered(articleId) {
                var isRendered = false;
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    isRendered = articleReader ? true : false
                }
                return isRendered
            }, removeAllArticles: function removeAllArticles() {
                this._removeAll()
            }, hidePaywallCard: function hidePaywallCard() {
                var article = this._articles[this._currentArticleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        articleReader.hidePaywallCard()
                    }
                }
            }, isCurrentArticleShowingPaywallCard: {
                get: function get() {
                    var article = this._articles[this._currentArticleId];
                    return article && article.articleReader && article.articleReader.isShowingPaywallCard
                }
            }, getArticlePaywallCard: function getArticlePaywallCard(articleId) {
                var articles = this._articles;
                var currentArticle = articles[articleId];
                if (currentArticle && currentArticle.articleReader) {
                    return currentArticle.articleReader.paywallCard
                }
                return null
            }, _renderImpl: function _renderImpl(articleId, data, renderOptions, navigateOptions, preRender) {
                var that = this;
                var articles = this._articles;
                var promise = WinJS.Promise.wrap(null);
                var gridOptions = this._gridOptions = this._getGridOptions();
                renderOptions.gridOptions = gridOptions;
                var panel = this._panel;
                var articleReader;
                var renderPromise;
                var renderResult;
                var containerElement;
                var interactiveListener;
                var article = articles[articleId];
                if (article) {
                    articleReader = article.articleReader;
                    if (!articleReader) {
                        containerElement = article.containerElement;
                        renderResult = this._renderArticleContent(articleId, data, renderOptions, preRender, containerElement);
                        if (renderResult) {
                            var direction = 1;
                            if (article.next !== null && article.previous === null) {
                                direction = 2
                            }
                            this._createNextAndPrevious(data, article);
                            renderResult.renderPromise = renderPromise = renderResult.renderPromise.then(function _ArticleReaderOrchestrator_623() {
                                that._removePlaceholder(article);
                                article.pendingLoad = false
                            }, function error(err) {
                                if (that && that._isAdPage(data)) {
                                    that._removeArticleFromView(article, direction)
                                }
                                article.pendingLoad = false
                            }).then(function _ArticleReaderOrchestrator_638() {
                                var adjustScrollPosition = article.width;
                                article.width = null;
                                article.containerElement.style.width = "";
                                return (navigateOptions === -1) ? 0 : adjustScrollPosition
                            });
                            articleReader = renderResult.articleReader;
                            article.articleReader = articleReader;
                            if (!article.interactiveListener) {
                                interactiveListener = article.interactiveListener = that._articleInteractive.bind(that, articleId);
                                articleReader.addEventListener("articleinteractive", interactiveListener)
                            }
                            promise = renderPromise
                        }
                    }
                }
                else {
                    this._removeAll();
                    containerElement = this._createContainerElement();
                    panel.appendChild(containerElement);
                    renderResult = this._renderArticleContent(articleId, data, renderOptions, preRender, containerElement);
                    if (renderResult) {
                        renderPromise = renderResult.renderPromise;
                        articleReader = renderResult.articleReader;
                        interactiveListener = that._articleInteractive.bind(that, articleId);
                        articleReader.addEventListener("articleinteractive", interactiveListener);
                        promise = renderPromise;
                        var placeholder = this._createPlaceholder();
                        var newArticle = {
                            articleId: articleId, articleReader: articleReader, placeholder: placeholder, containerElement: containerElement, next: null, previous: null, order: 0, interactiveListener: interactiveListener, width: null
                        };
                        articles[articleId] = newArticle;
                        this._createNextAndPrevious(data, newArticle)
                    }
                }
                if (!preRender) {
                    var oldArticleId = this._currentArticleId;
                    this.articleFocusLost(oldArticleId);
                    this._currentArticleId = articleId;
                    this._monitorScroll = false
                }
                promise = promise.then(function _ArticleReaderOrchestrator_705(adjustScrollPosition) {
                    var adjustWindow = !(preRender || adjustScrollPosition);
                    that._adjustViewport(adjustWindow);
                    that._monitorScroll = true;
                    that._adjustArticleContainer(articleId, true);
                    that._attachPagination(articleId);
                    if (!preRender) {
                        that._processNavigateOptions(articleId, navigateOptions);
                        that._maybeDispatchNear()
                    }
                    that._paginatedViewManager.showButtons()
                });
                return promise
            }, _relayoutImpl: function _relayoutImpl() {
                var that = this;
                var currentArticleId = this._currentArticleId;
                var articles = this._articles;
                var promise = WinJS.Promise.wrap(null);
                var pageIndex = Math.max(this._getCurrentPageIndex(currentArticleId), 0);
                var oldPageWidth = this.getPageWidth();
                this._pageWidth = this._measurePageWidth();
                this._pageHeight = this._measurePageHeight();
                var pageWidth = this.getPageWidth();
                var gridOptions = this._gridOptions = this._getGridOptions();
                var currentArticle = articles[currentArticleId];
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        promise = WinJS.Promise.timeout(0).then(function _ArticleReaderOrchestrator_742() {
                            U.showModalProgress();
                            return articleReader.relayout(gridOptions)
                        })
                    }
                    promise = promise.then(function _ArticleReaderOrchestrator_748() {
                        that._removeAllButCurrent();
                        that._adjustViewport(false);
                        that._scrollToPageIndex(currentArticleId, pageIndex, pageWidth);
                        that._maybeDispatchNear();
                        U.hideModalProgress()
                    }, function _ArticleReaderOrchestrator_754(e) {
                        U.hideModalProgress()
                    })
                }
                return promise
            }, _scrollToPageIndex: function _scrollToPageIndex(articleId, pageIndex, pageWidth) {
                var scrollLeft = this._getScrollForPageIndex(articleId, pageIndex, pageWidth);
                if (scrollLeft !== -1) {
                    var viewport = this._viewport;
                    viewport.scrollLeft = scrollLeft
                }
            }, _getScrollForPageIndex: function _getScrollForPageIndex(articleId, pageIndex, pageWidth) {
                var scrollLeft = -1;
                pageWidth = pageWidth || this.getPageWidth();
                var currentArticleId = this._currentArticleId;
                if (currentArticleId === articleId) {
                    var articles = this._articles;
                    var article = articles[articleId];
                    scrollLeft = 0;
                    if (article) {
                        var articleReader = article.articleReader;
                        if (articleReader) {
                            var width = this._getArticleWidth(article);
                            scrollLeft = pageIndex * pageWidth;
                            scrollLeft = Math.min(width - pageWidth, scrollLeft)
                        }
                    }
                    var previousWidth = this._getPreviousWidth(article);
                    scrollLeft = previousWidth + scrollLeft;
                    scrollLeft = Math.min(Math.max(previousWidth, scrollLeft), previousWidth + width - pageWidth)
                }
                return scrollLeft
            }, _getCurrentPageIndex: function _getCurrentPageIndex(articleId, pageWidth) {
                pageWidth = pageWidth || this.getPageWidth();
                var viewport = this._viewport;
                var currentArticleId = this._currentArticleId;
                var pageIndex = -1;
                if (currentArticleId === articleId) {
                    var articles = this._articles;
                    var article = articles[articleId];
                    var previousWidth = this._getPreviousWidth(article);
                    pageIndex = Math.ceil((viewport.scrollLeft - previousWidth) / pageWidth)
                }
                return pageIndex
            }, _processNavigateOptions: function _processNavigateOptions(articleId, navigateOptions) {
                if (navigateOptions) {
                    var startPage = navigateOptions.startPage;
                    var isStartPageValid = U.isNumber(startPage);
                    if (isStartPageValid) {
                        this._scrollToPageIndex(articleId, startPage)
                    }
                }
            }, _removePlaceholder: function _removePlaceholder(article) {
                var placeholder = article.placeholder;
                var containerElement = article.containerElement;
                if (containerElement && placeholder && placeholder.element && placeholder.element.parentNode === containerElement) {
                    containerElement.removeChild(placeholder.element)
                }
                else {
                    debugger
                }
            }, _removeAll: function _removeAll() {
                var articles = this._articles;
                for (var articleId in articles) {
                    var article = articles[articleId];
                    this._removeArticle(article)
                }
            }, _removeArticle: function _removeArticle(article) {
                if (!article) {
                    return
                }
                var panel = this._panel;
                var articleReader = article.articleReader;
                var placeholder = article.placeholder;
                if (articleReader) {
                    articleReader.dispose();
                    var interactiveListener = article.interactiveListener;
                    articleReader.removeEventListener("articleinteractive", interactiveListener);
                    article.interactiveListener = null
                }
                if (placeholder) {
                    placeholder.dispose()
                }
                var containerElement = article.containerElement;
                if (containerElement && containerElement.parentElement === panel) {
                    panel.removeChild(containerElement)
                }
                var articles = this._articles;
                delete articles[article.articleId]
            }, _removeAllButCurrent: function _removeAllButCurrent() {
                var articles = this._articles;
                var currentArticleId = this._currentArticleId;
                var panel = this._panel;
                var currentArticle = articles[currentArticleId];
                if (currentArticle) {
                    var next = currentArticle.next;
                    var previous = currentArticle.previous;
                    for (var articleId in articles) {
                        var article = articles[articleId];
                        if (next && article === next) {
                            next.next = null;
                            var nextContainerElement = next.containerElement;
                            var nextPlaceholder = next.placeholder;
                            nextContainerElement.appendChild(nextPlaceholder.element);
                            var nextArticleReader = next.articleReader;
                            if (nextArticleReader) {
                                nextContainerElement.removeChild(nextArticleReader.element);
                                nextArticleReader.dispose();
                                next.articleReader = null
                            }
                            next.width = null;
                            nextContainerElement.style.width = "";
                            this._adjustArticleContainer(articleId, false)
                        }
                        else if (previous && article === previous) {
                            previous.previous = null;
                            var previousContainerElement = previous.containerElement;
                            var previousPlaceholder = previous.placeholder;
                            previousContainerElement.appendChild(previousPlaceholder.element);
                            var previousArticleReader = previous.articleReader;
                            if (previousArticleReader) {
                                previousContainerElement.removeChild(previousArticleReader.element);
                                previousArticleReader.dispose();
                                previous.articleReader = null
                            }
                            previous.width = null;
                            previousContainerElement.style.width = "";
                            this._adjustArticleContainer(articleId, false)
                        }
                        else if (article !== currentArticle) {
                            this._removeArticle(article)
                        }
                    }
                }
            }, _cleanupPreviousArticles: function _cleanupPreviousArticles(scrollPosition) {
                var that = this;
                function introducePlaceholder(article) {
                    var containerElement = article.containerElement,
                        placeholder = article.placeholder,
                        articleReader = article.articleReader,
                        articleId = article.articleId;
                    if (articleReader) {
                        var width = article.width = that._getArticleWidth(article);
                        containerElement.style.width = width + "px";
                        containerElement.removeChild(article.articleReader.element);
                        containerElement.appendChild(placeholder.element);
                        article.articleReader.dispose();
                        article.articleReader = null;
                        this._adjustArticleContainer(articleId, false)
                    }
                }
                var currentArticleId = this._currentArticleId,
                    articles = this._articles,
                    instance = articles[currentArticleId];
                if (!instance || !instance.previous) {
                    return
                }
                instance = instance.previous;
                if (!instance.previous) {
                    return
                }
                instance = instance.previous;
                while (instance) {
                    if (instance.articleReader) {
                        introducePlaceholder.apply(this, [instance])
                    }
                    instance = instance.previous
                }
            }, _adjustViewport: function _adjustViewport(adjustWindow) {
                this._adjustArticlesInGrid();
                if (adjustWindow) {
                    this._adjustWindow()
                }
            }, _adjustArticleContainer: function _adjustArticleContainer(articleId, hasContent) {
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var containerElement = article.containerElement;
                    if (hasContent) {
                        WinJS.Utilities.addClass(containerElement, "hasContent");
                        WinJS.Utilities.removeClass(containerElement, "noContent")
                    }
                    else {
                        WinJS.Utilities.addClass(containerElement, "noContent");
                        WinJS.Utilities.removeClass(containerElement, "hasContent")
                    }
                }
            }, _adjustArticlesInGrid: function _adjustArticlesInGrid() {
                var articles = this._articles;
                var minOrder = this._getMinOrder(articles);
                for (var key in articles) {
                    var article = articles[key];
                    var order = article.order;
                    var gridColumn = (order - minOrder + 1).toString();
                    var containerElement = article.containerElement;
                    if (!article.errorSkip) {
                        this._maybeSetStyle(containerElement, "msGridColumn", gridColumn)
                    }
                }
            }, _attachPagination: function _attachPagination(articleId) {
                var articles = this._articles;
                var article = articles[articleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        var paginatedViewManager = this._paginatedViewManager;
                        var elts = articleReader.getElementsForPagination();
                        for (var i = 0, len = elts.length; i < len; i++) {
                            var elt = elts[i];
                            paginatedViewManager.attachEventListeners(elt)
                        }
                    }
                }
            }, _maybeSetStyle: function _maybeSetStyle(element, name, value) {
                if (!element.currentStyle || element.currentStyle[name] !== value) {
                    element.style[name] = value
                }
            }, _adjustWindow: function _adjustWindow() {
                var currentArticleId = this._currentArticleId;
                var viewport = this._viewport;
                var pageWidth = this.getPageWidth();
                var bounds = this._getArticleBounds(currentArticleId);
                var start = bounds.start;
                viewport.scrollLeft = start
            }, _getMinOrder: function _getMinOrder(articles) {
                var minOrder = Number.MAX_VALUE;
                for (var key in articles) {
                    var article = articles[key];
                    var order = article.order;
                    minOrder = Math.min(minOrder, order)
                }
                return minOrder
            }, _createNextAndPrevious: function _createNextAndPrevious(data, article) {
                var articles = this._articles;
                var nextArticle = article.next || data.nextArticle;
                var previousArticle = article.previous || data.previousArticle;
                var order = article.order;
                var panel = this._panel;
                if (nextArticle) {
                    var nextArticleId = nextArticle.articleId;
                    if (!articles[nextArticleId]) {
                        var nextOrder = order + 1;
                        var nextPlaceholder = this._createPlaceholder();
                        var nextContainerElement = this._createContainerElement();
                        nextContainerElement.appendChild(nextPlaceholder.element);
                        panel.appendChild(nextContainerElement);
                        var next = {
                            articleId: nextArticleId, articleReader: null, placeholder: nextPlaceholder, containerElement: nextContainerElement, next: null, previous: article, order: nextOrder
                        };
                        articles[nextArticleId] = next;
                        article.next = next
                    }
                }
                if (previousArticle) {
                    var previousArticleId = previousArticle.articleId;
                    if (!articles[previousArticleId]) {
                        var previousOrder = order - 1;
                        var previousPlaceholder = this._createPlaceholder();
                        var previousContainerElement = this._createContainerElement();
                        previousContainerElement.appendChild(previousPlaceholder.element);
                        panel.appendChild(previousContainerElement);
                        var previous = {
                            articleId: previousArticleId, articleReader: null, placeholder: previousPlaceholder, containerElement: previousContainerElement, next: article, previous: null, order: previousOrder
                        };
                        articles[previousArticleId] = previous;
                        article.previous = previous
                    }
                }
            }, _removeArticleFromView: function _removeArticleFromView(article, direction) {
                var panel = this._panel;
                if (!article || !panel) {
                    return
                }
                var articleId = article.articleId;
                if (!articleId) {
                    return
                }
                if (!article.next && !article.previous) {
                    return
                }
                var currentArticleId = this._currentArticleId;
                var scrollToArticleId = null;
                if (currentArticleId === articleId) {
                    var nextArticle = article.next;
                    var prevArticle = article.previous;
                    if (direction === 2) {
                        scrollToArticleId = prevArticle.articleId;
                        if (!scrollToArticleId) {
                            scrollToArticleId = nextArticle.articleId
                        }
                    }
                    else {
                        scrollToArticleId = nextArticle.articleId;
                        if (!scrollToArticleId) {
                            scrollToArticleId = prevArticle.articleId
                        }
                    }
                }
                if (article.previous && article.previous.next) {
                    article.previous.next = article.next
                }
                if (article.next && article.next.previous) {
                    article.next.previous = article.previous
                }
                article.previous = null;
                article.next = null;
                article.errorSkip = true;
                this._adjustArticlesInGrid();
                var articleReader = article.articleReader;
                var placeholder = article.placeholder;
                if (articleReader) {
                    articleReader.dispose();
                    article.articleReader = null
                }
                if (placeholder) {
                    placeholder.dispose()
                }
                var containerElement = article.containerElement;
                if (containerElement) {
                    panel.removeChild(containerElement)
                }
                if (scrollToArticleId !== null) {
                    var oldArticleId = currentArticleId;
                    currentArticleId = this._currentArticleId = scrollToArticleId;
                    this._scrolled(currentArticleId, oldArticleId)
                }
                this._maybeDispatchNear()
            }, _renderArticleContent: function _renderArticleContent(articleId, data, renderOptions, preRender, containerElement) {
                if (!data || !data.metadata) {
                    return
                }
                var result;
                var adMetadata = data.metadata ? data.metadata.adMetadata : null;
                var type = data.metadata.articleType || (adMetadata ? "interstitialAd" : "article");
                this._paginatedViewManager.setArticleType(type);
                if (type === "article") {
                    result = this._renderArticle(articleId, data, renderOptions, containerElement)
                }
                else if (type === "interstitialAd") {
                    result = this._renderInterstitialAd(articleId, data, renderOptions, containerElement);
                    if (preRender) {
                        var articles = this._articles;
                        if (articles) {
                            var article = articles[articleId];
                            if (article) {
                                article.pendingLoad = true
                            }
                        }
                    }
                }
                else if (type === "webpage" && !preRender) {
                    result = this._renderWebpage(articleId, renderOptions, containerElement)
                }
                return result
            }, _renderWebpage: function _renderWebpage(articleId, renderOptions, containerElement) {
                var options = { modalElementId: "articleLoadingScreen" };
                var webpage = new CommonJS.ArticleReader.ArticleReaderWebView(null, options);
                var element = webpage.element;
                containerElement.appendChild(element);
                var renderPromise = webpage.render(articleId, renderOptions);
                var result = {
                    articleReader: webpage, renderPromise: renderPromise
                };
                return result
            }, _renderInterstitialAd: function _renderInterstitialAd(articleId, data, renderOptions, containerElement) {
                var interstitialAd = new CommonJS.ArticleReader.InterstitialAd;
                var element = interstitialAd.element;
                containerElement.appendChild(element);
                renderOptions.paginatedViewManager = this._paginatedViewManager;
                var renderPromise = interstitialAd.render(data, renderOptions);
                var result = {
                    articleReader: interstitialAd, renderPromise: renderPromise
                };
                return result
            }, _renderArticle: function _renderArticle(articleId, data, renderOptions, containerElement) {
                var that = this;
                var articleReader = new CommonJS.ArticleReader.ArticleReader(null, {
                    market: this._market, categoryName: this._categoryName, customOptions: this._customOptions
                });
                var element = articleReader.element;
                containerElement.appendChild(element);
                var renderPromise = WinJS.Promise.wrap({});
                if (this.paywallCardTemplatePromise) {
                    renderPromise = this.paywallCardTemplatePromise.then(function articlereaderorchestrator_paywallcardtemplatereader(contentHost) {
                        var paywallCardTemplate = contentHost.querySelector(".paywallCard");
                        if (paywallCardTemplate && renderOptions.isPaywallCardEnabled) {
                            articleReader.paywallCard = paywallCardTemplate;
                            renderOptions.updatePaywallCardFunction = that.updatePaywallCardFunction
                        }
                    })
                }
                renderOptions.renderEOAB = true;
                renderPromise = renderPromise.then(articleReader.render.bind(articleReader, data, renderOptions));
                var result = {
                    articleReader: articleReader, renderPromise: renderPromise
                };
                return result
            }, _articleInteractive: function _articleInteractive(articleId, event) {
                if (articleId === this._currentArticleId) {
                    U.hideModalProgress()
                }
            }, _createPlaceholder: function _createPlaceholder() {
                var placeholder = new CommonJS.ArticleReader.ArticlePlaceholder;
                return placeholder
            }, _createContainerElement: function _createContainerElement() {
                var containerElt = document.createElement("div");
                WinJS.Utilities.addClass(containerElt, "articleContainer noContent");
                return containerElt
            }, _getArticleBounds: function _getArticleBounds(articleId) {
                var articles = this._articles;
                var article = articles[articleId];
                var width = 0;
                if (article) {
                    var articleReader = article.articleReader;
                    width = this._getArticleWidth(article)
                }
                var previousWidth = this._getPreviousWidth(article);
                var start = previousWidth;
                var end = previousWidth + width;
                var bounds = {
                    start: start, end: end
                };
                return bounds
            }, _getPreviousWidth: function _getPreviousWidth(article) {
                var previousWidth = 0;
                if (article) {
                    var previous = article.previous;
                    while (previous) {
                        previousWidth += this._getArticleWidth(previous);
                        previous = previous.previous
                    }
                }
                return previousWidth
            }, _getCurrentArticleIdFromViewport: function _getCurrentArticleIdFromViewport() {
                var viewport = this._viewport;
                var scrollLeft = viewport.scrollLeft;
                var articleId = this._getArticleIdFromScroll(scrollLeft);
                return articleId
            }, _getArticleIdFromScroll: function _getArticleIdFromScroll(scrollLeft) {
                var currentArticleId = this._currentArticleId;
                var articles = this._articles;
                var currentArticle = articles[currentArticleId];
                var pageWidth = this.getPageWidth();
                var articleId;
                var article = currentArticle;
                if (article) {
                    while (article.previous) {
                        article = article.previous
                    }
                    var start = 0;
                    while (article) {
                        var articleReader = article.articleReader;
                        var width = this._getArticleWidth(article);
                        var end = start + width;
                        if (start <= scrollLeft && scrollLeft < end) {
                            articleId = article.articleId;
                            break
                        }
                        start = end;
                        article = article.next
                    }
                }
                return articleId
            }, _getCurrentArticle: function _getCurrentArticle() {
                var currentArticleId = this._currentArticleId;
                var articles = this._articles;
                var currentArticle = articles[currentArticleId];
                return currentArticle
            }, getCurrentArticleReader: function getCurrentArticleReader() {
                var currentArticle = this._getCurrentArticle();
                if (currentArticle) {
                    return currentArticle.articleReader
                }
                return null
            }, _isAdPage: function _isAdPage(data) {
                var isAd = (data && data.metadata && data.metadata.adMetadata);
                return isAd
            }, _maybeDispatchNear: function _maybeDispatchNear() {
                var that = this;
                var articles = this._articles;
                var currentArticleId = this._currentArticleId;
                var currentArticle = articles[currentArticleId];
                if (currentArticle) {
                    var next = currentArticle.next;
                    if (next && !next.articleReader) {
                        var nextArticleId = next.articleId;
                        msSetImmediate(function _ArticleReaderOrchestrator_1433() {
                            that.dispatchEvent("nearunrealizedarticle", nextArticleId)
                        })
                    }
                }
            }, _maybeDispatchScrollEvents: function _maybeDispatchScrollEvents() {
                var that = this;
                var articles = this._articles;
                var currentArticleId = this._currentArticleId;
                var article = articles[currentArticleId];
                if (article) {
                    var articleReader = article.articleReader;
                    if (!articleReader) {
                        that.dispatchEvent("swipetounrealizedarticle", currentArticleId)
                    }
                    else {
                        that.dispatchEvent("scrolltoarticle", currentArticleId);
                        if (article.pendingLoad) {
                            U.showModalProgress();
                            this._monitorScroll = false
                        }
                    }
                }
            }, _dispatchVisibilityEvent: function _dispatchVisibilityEvent() {
                var that = this;
                var nextVisibleArticle = this._getNextVisibleArticle();
                if (nextVisibleArticle) {
                    msSetImmediate(function _ArticleReaderOrchestrator_1467() {
                        that.dispatchEvent("nextarticlevisible", nextVisibleArticle.articleId)
                    })
                }
            }, _onScroll: function _onScroll(event) {
                var article = this._articles[this._currentArticleId];
                if (article && article.articleReader && article.articleReader.articleType === "webpage" && !article.articleReader.isRendered) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return
                }
                var scrollTimer = this._scrollTimer;
                var viewport = this._viewport;
                var scrollLeft = viewport.scrollLeft;
                if (scrollTimer) {
                    clearTimeout(scrollTimer)
                }
                this._scrollTimer = setTimeout(this._scrollTimerExpired.bind(this), 25, scrollLeft)
            }, _scrollTimerExpired: function _scrollTimerExpired(oldScrollLeft) {
                var that = this;
                var monitorScroll = this._monitorScroll;
                if (monitorScroll) {
                    var viewport = this._viewport;
                    var newScrollLeft = viewport.scrollLeft;
                    this._scrollTimer = null;
                    if (oldScrollLeft === newScrollLeft) {
                        this._renderPromise.then(function _ArticleReaderOrchestrator_1502() {
                            var currentArticleId = that._getCurrentArticleIdFromViewport();
                            if (currentArticleId !== undefined) {
                                var oldArticleId = that._currentArticleId;
                                that._currentArticleId = currentArticleId;
                                var actionElement = "";
                                if (oldArticleId !== currentArticleId) {
                                    that._scrolled(currentArticleId, oldArticleId);
                                    that._maybeDispatchNear()
                                }
                                else if (that._isNextArticleVisible()) {
                                    that._dispatchVisibilityEvent()
                                }
                            }
                            clearTimeout(that._staticPositionTimer);
                            that._staticPositionTimer = setTimeout(staticPositionTimerExpired.bind(that), 100, newScrollLeft)
                        })
                    }
                }
            }, _getNextVisibleArticle: function _getNextVisibleArticle() {
                var scrollLeft = this._viewport.scrollLeft;
                var scrollRight = scrollLeft + this._pageWidth - 100;
                var nextArticleId = this._getArticleIdFromScroll(scrollRight);
                var article = this._articles[nextArticleId];
                return article
            }, _isNextArticleVisible: function _isNextArticleVisible() {
                var scrollLeft = this._viewport.scrollLeft;
                var scrollRight = scrollLeft + this._pageWidth - 100;
                var previousArticleId = this._getArticleIdFromScroll(scrollLeft);
                var nextArticleId = this._getArticleIdFromScroll(scrollRight);
                return previousArticleId !== nextArticleId
            }, _scrolled: function _scrolled(currentArticleId, oldArticleId) {
                this._maybeDispatchScrollEvents();
                this.articleFocusLost(oldArticleId)
            }, _measurePageWidth: function _measurePageWidth() {
                var pageWidth = this._displayData.offsetWidth;
                var viewport = this._viewport;
                viewport.style.width = pageWidth + "px";
                return pageWidth
            }, _measurePageHeight: function _measurePageHeight() {
                var pageHeight = this._displayData.offsetHeight;
                var viewport = this._viewport;
                viewport.style.height = pageHeight + "px";
                return pageHeight
            }, _getGridOptions: function _getGridOptions() {
                var width = this.getPageWidth();
                var height = this.getPageHeight();
                var constants = (width >= height ? landscapeGridConstants : (width < 768 ? smallPortraitGridConstants : portraitGridConstants));
                this._adjustHeader(constants);
                var gridOptions = CommonJS.ArticleReader.GridCalculator.calculateGridOptions(constants, width, height);
                return gridOptions
            }, _getArticleWidth: function _getArticleWidth(article) {
                var width = -1;
                if (article) {
                    if (article.articleReader) {
                        width = article.articleReader.getWidth()
                    }
                    if (width <= 0) {
                        if (article.width) {
                            width = article.width
                        }
                    }
                }
                var pageWidth = this.getPageWidth();
                if (width <= pageWidth) {
                    width = pageWidth
                }
                return width
            }, _getArticlePageCount: function _getArticlePageCount(article) {
                var pageCount = 1;
                if (article) {
                    var width = this._getArticleWidth(article);
                    var pageWidth = this.getPageWidth();
                    pageCount = Math.ceil(width / pageWidth)
                }
                return pageCount
            }, _animateScroll: function _animateScroll(viewport, element, target) {
                var marketDirection = window.getComputedStyle(viewport).direction;
                var marketModifier = (marketDirection === "ltr" ? 1 : -1);
                var scrollLeft = viewport.scrollLeft;
                var offset = marketModifier * (scrollLeft - target);
                var style = element.style;
                style.msTransitionProperty = "transform";
                style.msTransitionDuration = "0.25s";
                style.msTransform = "translate(" + offset + "px, 0px)";
                clearTimeout(this._scrollAnimationTimeout);
                this._scrollAnimationTimeout = setTimeout(this._finishScrollAnimation.bind(this, style, target), 260)
            }, _finishScrollAnimation: function _finishScrollAnimation(style, target) {
                style.msTransitionProperty = "";
                style.msTransitionDuration = "";
                style.msTransform = "";
                this._viewport.scrollLeft = target
            }, _getArticleCount: function _getArticleCount() {
                var articles = this._articles;
                var count = 0;
                for (var articleId in articles) {
                    count++
                }
                return count
            }, _getScrollTarget: function _getScrollTarget(scrollLeft, direction) {
                var articles = this._articles;
                var pageWidth = this.getPageWidth();
                var articleId = this._getArticleIdFromScroll(scrollLeft);
                var article = articles[articleId];
                var pageCount = this._getArticlePageCount(article);
                var pageIndex = this._getCurrentPageIndex(articleId, pageWidth);
                var modifier = (direction === 1 ? 1 : (direction === 2 ? -1 : 0));
                var newPageIndex = pageIndex + modifier;
                var target = scrollLeft;
                if (newPageIndex < 0 && direction === 2) {
                    target = scrollLeft - pageWidth
                }
                else if (newPageIndex > pageCount - 1 && direction === 1) {
                    target = scrollLeft + pageWidth
                }
                else {
                    target = this._getScrollForPageIndex(articleId, newPageIndex, pageWidth)
                }
                return target
            }, _adjustHeader: function _adjustHeader(constants) {
                if (this._customOptions && this._customOptions.enableHeader) {
                    var headerStyle = this._customOptions.headerStyle;
                    if (headerStyle) {
                        var headerRenderer = CommonJS.ArticleReader.HeaderFactory.getRenderer(headerStyle);
                        if (headerRenderer) {
                            constants.topMargin = headerRenderer.height
                        }
                    }
                }
            }
        }), WinJS.Utilities.eventMixin)
    });
    function staticPositionTimerExpired(scrollPosition) {
        var monitorScroll = this._monitorScroll;
        if (monitorScroll) {
            var viewport = this._viewport;
            var newScrollLeft = viewport.scrollLeft;
            if (scrollPosition === newScrollLeft) {
                this._cleanupPreviousArticles(scrollPosition)
            }
        }
    }
})();
(function _TocArticleOrchestrator_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TocArticleOrchestrator: WinJS.Class.mix(WinJS.Class.define(function _TocArticleOrchestrator_12(elt, options) {
            this._pageWidth = null;
            this._pageHeight = null;
            this._gridOptions = null;
            this._promise = WinJS.Promise.wrap(null);
            var articles = this._articles = [];
            this._scrollTimer = null;
            this._currentArticleId = null;
            this._market = options.market;
            var assemblerOptions = options.assemblerOptions;
            this._articlePreRenderCount = assemblerOptions.articlePreRenderCount || 5;
            var articleInfos = assemblerOptions.articleInfos;
            var count = articleInfos.length;
            elt = this._elt = elt || document.createElement("div");
            WinJS.Utilities.addClass(elt, "tocOrchestrator");
            var tocContainerElt = document.createElement("div");
            tocContainerElt.id = "tocContainer";
            elt.appendChild(tocContainerElt);
            var tocElt = document.createElement("div");
            tocContainerElt.appendChild(tocElt);
            var tocAnchorContainerElt = document.createElement("div");
            tocAnchorContainerElt.id = "tocAnchorContainer";
            elt.appendChild(tocAnchorContainerElt);
            var tocFlyoutElt = document.createElement("div");
            elt.appendChild(tocFlyoutElt);
            var articleViewport = this._articleViewport = document.createElement("div");
            articleViewport.id = "articleViewport";
            elt.appendChild(articleViewport);
            var scrollListener = this._scrollListener = this._onViewportScroll.bind(this);
            articleViewport.addEventListener("scroll", scrollListener);
            var panelElt = document.createElement("div");
            panelElt.id = "articlePanel";
            articleViewport.appendChild(panelElt);
            var rightSpacer = this._rightSpacer = document.createElement("div");
            rightSpacer.style.msGridColumn = count + 1;
            panelElt.appendChild(rightSpacer);
            var tocOptions = {
                articleInfos: assemblerOptions.articleInfos, pageTitle: assemblerOptions.pageTitle, publisher: assemblerOptions.publisher, flyoutElt: tocFlyoutElt, orchestrator: this
            };
            var toc = this._toc = new CommonJS.ArticleReader.Toc(tocElt, tocOptions);
            var tocAnchor = this._tocAnchor = new CommonJS.ArticleReader.TocAnchor(tocAnchorContainerElt, tocOptions);
            var articleClickListener = this._articleClickListener = this._articleClick.bind(this);
            toc.addEventListener("articleclick", articleClickListener);
            this._setupView();
            for (var i = 0; i < count; i++) {
                var articleInfo = articleInfos[i];
                var articleId = articleInfo.articleId;
                var container = document.createElement("div");
                WinJS.Utilities.addClass(container, "container");
                container.style.msGridColumn = i + 1;
                panelElt.appendChild(container);
                var infoContainer = document.createElement("div");
                WinJS.Utilities.addClass(infoContainer, "infoContainer");
                infoContainer.style.display = "none";
                var infoBlock = document.createElement("div");
                WinJS.Utilities.addClass(infoBlock, "infoBlock");
                var progress = document.createElement("progress");
                WinJS.Utilities.addClass(progress, "win-large win-ring progress");
                progress.style.display = "";
                infoBlock.appendChild(progress);
                var error = document.createElement("div");
                WinJS.Utilities.addClass(error, "error");
                error.innerText = PlatformJS.Services.resourceLoader.getString("/Platform/offline_problem");
                error.style.display = "none";
                infoBlock.appendChild(error);
                infoContainer.appendChild(infoBlock);
                container.appendChild(infoContainer);
                var article = {
                    articleId: articleId, articleReader: null, container: container, infoContainer: infoContainer, progress: progress, error: error, index: i, width: 0
                };
                articles.push(article);
                this._updateArticleWidth(article)
            }
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("swipetounrealizedarticle"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("nearunrealizedarticle"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("scrolltoarticle"))
        }, {
            _market: null, _elt: null, _toc: null, _tocAnchor: null, _articleClickListener: null, _pageWidth: null, _pageHeight: null, _gridOptions: null, _promise: null, _articles: null, _articleViewport: null, _scrollListener: null, _scrollTimer: null, _currentArticleId: null, _rightSpacer: null, _articlePreRenderCount: null, currentArticleId: {
                get: function get() {
                    return this._getCurrentArticleId()
                }
            }, currentPageIndex: {
                get: function get() {
                    return 0
                }
            }, dispose: function dispose() {
                var toc = this._toc;
                if (toc) {
                    toc.removeEventListener("articleclick", this._articleClickListener);
                    toc.dispose()
                }
                var anchorToc = this._tocAnchor;
                if (anchorToc) {
                    anchorToc.dispose()
                }
                var articleViewport = this._articleViewport;
                if (articleViewport) {
                    articleViewport.removeEventListener("scroll", this._scrollListener)
                }
                var articles = this._articles;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    if (article) {
                        var articleReader = article.articleReader;
                        var container = article.container;
                        if (articleReader) {
                            var element = articleReader.element;
                            container.removeChild(element);
                            articleReader.dispose()
                        }
                    }
                }
            }, progress: function progress(articleId, preRender, state) {
                switch (state) {
                    case "start":
                        this._showLoadingStatus(articleId);
                        break;
                    case "datacomplete":
                        break;
                    case "rendercomplete":
                        this._hideStatus(articleId);
                        break;
                    case "error":
                        this._showErrorStatus(articleId);
                        break
                }
            }, focusViewport: function focusViewport() {
                var articleViewport = this._articleViewport;
                articleViewport.focus()
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                return this.setTextAttributesAndRelayout(textAttributes)
            }, setTextAttributesAndRelayout: function setTextAttributesAndRelayout(textAttributes) {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                var currentArticleId = this._getCurrentArticleId();
                var currentArticle = this._getArticleById(currentArticleId);
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        promise = articleReader.setTextAttributes(textAttributes).then(function _TocArticleOrchestrator_283() {
                            that._removeAllBut(currentArticleId);
                            that._updateArticleWidth(currentArticle);
                            that._scrollToArticle(currentArticleId);
                            that._maybeDispatchNear()
                        })
                    }
                }
                return promise
            }, getHeader: function getHeader() {
                var header = null;
                var currentArticle = this._getCurrentArticle();
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        header = articleReader.getHeader()
                    }
                }
                return header
            }, render: function render(articleId, data, renderOptions, navigateOptions, preRender) {
                return this._renderImpl(articleId, data, renderOptions, navigateOptions, preRender)
            }, relayout: function relayout() {
                return this._relayoutImpl()
            }, scrollToArticle: function scrollToArticle(articleId) {
                this._scrollToArticle(articleId)
            }, showArticleError: function showArticleError(articleId, errorCode, errorCallback) {
                this._showErrorStatus(articleId)
            }, articleFocusLost: function articleFocusLost(oldArticleId) {
                if (oldArticleId) {
                    var article = this._getArticleById(oldArticleId);
                    if (article) {
                        var articleReader = article.articleReader;
                        if (articleReader) {
                            articleReader.articleFocusLost()
                        }
                    }
                }
            }, getInstrumentationData: function getInstrumentationData(articleId) {
                var instrumentationData = null;
                var article = this._getArticleById(articleId);
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        instrumentationData = articleReader.getInstrumentationData()
                    }
                }
                return instrumentationData
            }, getLayout: function getLayout(articleId) {
                var layout = null;
                var article = this._getArticleById(articleId);
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        layout = articleReader.getLayout()
                    }
                }
                return layout
            }, getRenderData: function getRenderData(articleId) {
                var article = this._getArticleById(articleId);
                var renderData = null;
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        renderData = articleReader.getRenderData()
                    }
                }
                return renderData
            }, isPaginated: function isPaginated() {
                return true
            }, hasBottomEdgyNavigation: function hasBottomEdgyNavigation() {
                return false
            }, hasPageNumbers: function hasPageNumbers() {
                return false
            }, isArticleRendered: function isArticleRendered(articleId) {
                var isRendered = false;
                var articles = this._articles;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    if (article.articleId === articleId) {
                        var articleReader = article.articleReader;
                        isRendered = articleReader ? true : false;
                        break
                    }
                }
                return isRendered
            }, removeAllArticles: function removeAllArticles() { }, setSnapPoint: function setSnapPoint(lastScroll) {
                var scrollLeft = this._viewport.scrollLeft;
                var pageWidth = this.getPageWidth();
                if (scrollLeft % pageWidth !== 0) {
                    var func = (lastScroll - scrollLeft > 0 ? Math.floor : Math.ceil);
                    this._viewport.scrollLeft = func(scrollLeft / pageWidth) * pageWidth
                }
            }, _showLoadingStatus: function _showLoadingStatus(articleId) {
                var article = this._getArticleById(articleId);
                if (article) {
                    article.infoContainer.style.display = "";
                    article.progress.style.display = "";
                    article.error.style.display = "none"
                }
            }, _showErrorStatus: function _showErrorStatus(articleId) {
                var article = this._getArticleById(articleId);
                if (article) {
                    article.infoContainer.style.display = "";
                    article.progress.style.display = "none";
                    article.error.style.display = ""
                }
            }, _hideStatus: function _hideStatus(articleId) {
                var article = this._getArticleById(articleId);
                if (article) {
                    article.infoContainer.style.display = "none";
                    article.progress.style.display = "none";
                    article.error.style.display = "none"
                }
            }, _renderImpl: function _renderImpl(articleId, data, renderOptions, navigateOptions, preRender) {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                var article = this._getArticleById(articleId);
                if (article) {
                    var articleReader = article.articleReader;
                    if (!articleReader) {
                        articleReader = new CommonJS.ArticleReader.ArticleReader(null, {
                            market: this._market, tocArticle: true
                        });
                        var element = articleReader.element;
                        var container = article.container;
                        container.appendChild(element);
                        article.articleReader = articleReader;
                        renderOptions.gridOptions = this._gridOptions;
                        promise = articleReader.render(data, renderOptions)
                    }
                }
                promise = promise.then(function _TocArticleOrchestrator_527() {
                    that._updateArticleWidth(article);
                    if (!preRender) {
                        that._currentArticleId = articleId;
                        that._scrollToArticle(articleId);
                        that._maybeDispatchNear()
                    }
                });
                return promise
            }, _relayoutImpl: function _relayoutImpl() {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                this._pageWidth = null;
                this._pageHeight = null;
                this._setupView();
                var currentArticleId = this._getCurrentArticleId();
                var currentArticle = this._getArticleById(currentArticleId);
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        promise = articleReader.relayout(this._gridOptions);
                        promise = promise.then(function _TocArticleOrchestrator_561() {
                            that._removeAllBut(currentArticleId);
                            that._updateArticleWidth(currentArticle);
                            that._scrollToArticle(currentArticleId);
                            that._maybeDispatchNear()
                        })
                    }
                }
                return promise
            }, _articleClick: function _articleClick(event) {
                var detail = event.detail;
                var articleId = detail.articleId;
                this._scrollToArticle(articleId)
            }, _scrollToArticle: function _scrollToArticle(articleId) {
                var articles = this._articles;
                var offset = 0;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    if (article.articleId === articleId) {
                        break
                    }
                    var width = article.width;
                    offset += width
                }
                var articleViewport = this._articleViewport;
                articleViewport.scrollLeft = offset;
                var toc = this._toc;
                if (toc) {
                    toc.select(articleId, true)
                }
            }, _onViewportScroll: function _onViewportScroll(event) {
                var scrollTimer = this._scrollTimer;
                if (scrollTimer) {
                    clearTimeout(scrollTimer)
                }
                var articleViewport = this._articleViewport;
                var scrollLeft = articleViewport.scrollLeft;
                this._scrollTimer = setTimeout(this._scrollTimerExpired.bind(this), 25, scrollLeft)
            }, _scrollTimerExpired: function _scrollTimerExpired(oldScrollLeft) {
                var articleViewport = this._articleViewport;
                var newScrollLeft = articleViewport.scrollLeft;
                var toc = this._toc;
                this._scrollTimer = null;
                if (oldScrollLeft === newScrollLeft) {
                    var oldArticleId = this._currentArticleId;
                    var currentArticleId = this._currentArticleId = this._getCurrentArticleId();
                    if (oldArticleId !== currentArticleId) {
                        this._maybeDispatchScrollEvents();
                        this.articleFocusLost(oldArticleId)
                    }
                    this._maybeDispatchNear();
                    if (toc) {
                        toc.select(currentArticleId, false)
                    }
                }
            }, _maybeDispatchNear: function _maybeDispatchNear() {
                var articles = this._articles;
                var currentArticleId = this._getCurrentArticleId();
                var numPreRender = this._articlePreRenderCount;
                var left = 0;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    var articleId = article.articleId;
                    if (articleId === currentArticleId) {
                        left = numPreRender;
                        continue
                    }
                    if (left > 0) {
                        left--;
                        this.dispatchEvent("nearunrealizedarticle", articleId)
                    }
                }
            }, _maybeDispatchScrollEvents: function _maybeDispatchScrollEvents() {
                var currentArticleId = this._getCurrentArticleId();
                var currentArticle = this._getArticleById(currentArticleId);
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        this.dispatchEvent("scrolltoarticle", currentArticleId)
                    }
                    else {
                        this.dispatchEvent("swipetounrealizedarticle", currentArticleId)
                    }
                }
            }, _getCurrentArticleId: function _getCurrentArticleId() {
                var articles = this._articles;
                var articleViewport = this._articleViewport;
                var scrollLeft = articleViewport.scrollLeft;
                var currentId = null;
                var previousWidth = 0;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    var width = article.width;
                    if (scrollLeft >= previousWidth && scrollLeft < previousWidth + width) {
                        currentId = article.articleId;
                        break
                    }
                    previousWidth += width
                }
                return currentId
            }, _getArticleById: function _getArticleById(articleId) {
                var articles = this._articles;
                var result = null;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    if (article.articleId === articleId) {
                        result = article;
                        break
                    }
                }
                if (PlatformJS.isDebug && !result) {
                    throw "something's wrong - article with id " + articleId + " does not exist in the article reader";
                }
                return result
            }, _getCurrentArticle: function _getCurrentArticle() {
                var articleId = this._getCurrentArticleId();
                var article = this._getArticleById(articleId);
                return article
            }, _removeAllBut: function _removeAllBut(articleId) {
                var articles = this._articles;
                for (var i = 0, len = articles.length; i < len; i++) {
                    var article = articles[i];
                    if (article.articleId === articleId) {
                        continue
                    }
                    var articleReader = article.articleReader;
                    var container = article.container;
                    if (articleReader) {
                        container.removeChild(articleReader.element);
                        articleReader.dispose()
                    }
                    article.articleReader = null;
                    this._updateArticleWidth(article)
                }
            }, _getWidthForPageCount: function _getWidthForPageCount(count) {
                var gridOptions = this._gridOptions;
                var width = count * (gridOptions.columnWidth + gridOptions.leftMargin);
                return width
            }, _updateArticleWidth: function _updateArticleWidth(article) {
                var pageCount = 1;
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        pageCount = articleReader.getPageCount()
                    }
                }
                var width = this._getWidthForPageCount(pageCount);
                setWidth(article, width)
            }, _setupView: function _setupView() {
                var tocContainerWidth = 0;
                var leftMarginInAnchorMode = 0;
                var gridConstants = null;
                var pageWidth = this._getPageWidth();
                var pageHeight = this._getPageHeight();
                if (pageWidth >= pageHeight) {
                    tocContainerWidth = 400;
                    leftMarginInAnchorMode = 120;
                    gridConstants = {
                        leftMargin: 0, columnMargin: 30, defaultRightMargin: 30, topMargin: 30, bottomMargin: 50, minColumnWidth: 300, maxColumnWidth: 460
                    }
                }
                else if (pageWidth < 768) {
                    tocContainerWidth = 300;
                    leftMarginInAnchorMode = 100;
                    gridConstants = {
                        leftMargin: 0, columnMargin: 30, defaultRightMargin: 30, topMargin: 30, bottomMargin: 80, minColumnWidth: 300, maxColumnWidth: 770
                    }
                }
                else {
                    tocContainerWidth = 300;
                    leftMarginInAnchorMode = 100;
                    gridConstants = {
                        leftMargin: 0, columnMargin: 30, defaultRightMargin: 30, topMargin: 30, bottomMargin: 80, minColumnWidth: 375, maxColumnWidth: 770
                    }
                }
                var articleViewportWidth = pageWidth - tocContainerWidth;
                var gridOptions = CommonJS.ArticleReader.GridCalculator.calculateGridOptions(gridConstants, articleViewportWidth - 30, pageHeight);
                var columnCount = gridOptions.columnCount;
                var columnWidth = gridOptions.columnWidth;
                var margin;
                var isFlyoutToc = this._chooseTocType(columnCount);
                var marginTotal = (articleViewportWidth - (columnWidth * columnCount));
                margin = Math.floor(marginTotal / (columnCount + 1));
                if (isFlyoutToc) {
                    articleViewportWidth = pageWidth;
                    gridOptions = CommonJS.ArticleReader.GridCalculator.calculateGridOptions(gridConstants, articleViewportWidth - 30 - leftMarginInAnchorMode, pageHeight);
                    columnCount = gridOptions.columnCount;
                    columnWidth = gridOptions.columnWidth;
                    marginTotal = (articleViewportWidth - (columnWidth * columnCount));
                    margin = Math.floor(marginTotal / (columnCount + 1));
                    if (margin < leftMarginInAnchorMode) {
                        margin = leftMarginInAnchorMode;
                        marginTotal = margin * (columnCount + 1);
                        gridOptions.columnWidth = (articleViewportWidth - marginTotal) / columnCount
                    }
                }
                gridOptions.leftMargin = margin;
                gridOptions.rightMargin = 0;
                gridOptions.columnCount = 1;
                gridOptions.pageWidth = margin + gridOptions.columnWidth;
                this._gridOptions = gridOptions;
                tocContainerWidth = isFlyoutToc ? 0 : pageWidth - (columnCount * (columnWidth + margin) + margin);
                articleViewportWidth = pageWidth - tocContainerWidth;
                var elt = this._elt;
                var columnsStyle = [tocContainerWidth, "px ", articleViewportWidth, "px"].join("");
                elt.style.msGridColumns = columnsStyle;
                var rightSpacer = this._rightSpacer;
                var rightSpacerWidth = this._getRightSpacerWidth(columnCount, columnWidth, margin);
                rightSpacer.style.width = rightSpacerWidth + "px"
            }, _getRightSpacerWidth: function _getRightSpacerWidth(columnCount, columnWidth, margin) {
                var width = (columnCount - 1) * (columnWidth + margin) + margin;
                return width
            }, _getPageWidth: function _getPageWidth() {
                var pageWidth = this._pageWidth;
                if (!pageWidth) {
                    pageWidth = this._pageWidth = PlatformJS.Utilities.getDisplayData().offsetWidth
                }
                return pageWidth
            }, _getPageHeight: function _getPageHeight() {
                var pageHeight = this._pageHeight;
                if (!pageHeight) {
                    pageHeight = this._pageHeight = PlatformJS.Utilities.getDisplayData().offsetHeight
                }
                return pageHeight
            }, _chooseTocType: function _chooseTocType(columnCount) {
                var elt = this._elt;
                if (elt) {
                    if (columnCount && columnCount === 1) {
                        WinJS.Utilities.addClass(elt, "singleColumn");
                        WinJS.Utilities.removeClass(elt, "multiColumn");
                        return true
                    }
                    else {
                        WinJS.Utilities.removeClass(elt, "singleColumn");
                        WinJS.Utilities.addClass(elt, "multiColumn");
                        return false
                    }
                }
            }
        }), WinJS.Utilities.eventMixin)
    });
    function setWidth(article, width) {
        var container = article.container;
        var infoContainer = article.infoContainer;
        var widthStyle = width + "px";
        container.style.width = widthStyle;
        infoContainer.style.width = widthStyle;
        article.width = width
    }
})();
(function _TocAnchor_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        TocAnchor: WinJS.Class.mix(WinJS.Class.define(function _TocAnchor_13(elt, options) {
            var that = this;
            this.elt = elt;
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            this.orchestrator = options.orchestrator;
            var flyoutElt = options.flyoutElt;
            var buttonElt = this._buttonElt = document.createElement("button");
            buttonElt.className = "tocAnchorButton";
            elt.appendChild(buttonElt);
            var glyphElt = document.createElement("div");
            glyphElt.setAttribute("aria-hidden", true);
            glyphElt.className = "glyph";
            buttonElt.appendChild(glyphElt);
            var textElt = document.createElement("div");
            textElt.setAttribute("aria-hidden", true);
            textElt.className = "text";
            textElt.innerText = options.pageTitle;
            buttonElt.appendChild(textElt);
            var publisher = this._publisher = options.publisher;
            if (publisher) {
                var favicon = publisher.anchorFavicon;
                if (favicon) {
                    var logoElt = document.createElement("div");
                    WinJS.Utilities.addClass(logoElt, "tocAnchorLogo");
                    var logoUrl = favicon.url;
                    if (logoUrl) {
                        var logoImage = new CommonJS.ImageCard(logoElt, {
                            alternateText: publisher.name || "", imageSource: {
                                url: logoUrl, cacheId: options.publisher.imageCacheId
                            }
                        });
                        elt.appendChild(logoElt)
                    }
                }
            }
            flyoutElt.className = "tocAnchorFlyout";
            var alignment = window.getComputedStyle(document.getElementById("articleReaderPage")).direction === "rtl" ? "right" : "left";
            var flyout = this._flyout = new WinJS.UI.Flyout(flyoutElt, {
                placement: "top", alignment: alignment
            });
            buttonElt.addEventListener("click", function _TocAnchor_78(event) {
                if (!that._flyoutShown && that._flyout.hidden) {
                    that._flyoutShown = true;
                    that._flyout.show(this)
                }
            });
            this._flyout.addEventListener("afterhide", function _TocAnchor_85(event) {
                that._flyoutShown = false
            });
            var tocElt = document.createElement("div");
            var toc = this._toc = new CommonJS.ArticleReader.Toc(tocElt, options);
            flyoutElt.appendChild(tocElt);
            var articleClickListener = this._articleClickListener = this._articleClick.bind(this);
            toc.addEventListener("articleclick", articleClickListener)
        }, {
            elt: null, orchestrator: null, _buttonElt: null, _flyout: null, _toc: null, _articleClickListener: null, _flyoutShown: null, _articleClick: function _articleClick(event) {
                var detail = event.detail;
                var articleId = detail.articleId;
                this.orchestrator._scrollToArticle(articleId);
                if (this._flyout) {
                    this._flyout.hide()
                }
            }, dispose: function dispose() {
                var toc = this._toc;
                if (toc) {
                    toc.removeEventListener("articleclick", this._articleClickListener);
                    toc.dispose()
                }
            }
        }), WinJS.Utilities.eventMixin)
    })
})();
(function _SmoothScrollOrchestrator_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        SmoothScrollOrchestrator: WinJS.Class.derive(CommonJS.ArticleReader.ArticleReaderOrchestrator, function _SmoothScrollOrchestrator_13(elt, options) {
            CommonJS.ArticleReader.ArticleReaderOrchestrator.call(this, elt, options);
            var viewport = this._viewport;
            WinJS.Utilities.addClass(viewport, "smooth")
        }, {
            isPaginated: function isPaginated() {
                return false
            }, hasPageNumbers: function hasPageNumbers() {
                return false
            }, hasNextPage: function hasNextPage() {
                return false
            }, hasPreviousPage: function hasPreviousPage() {
                return false
            }, scrollOnePage: function scrollOnePage(direction) {
                var gridOptions = this._gridOptions;
                var columnCount = gridOptions.columnCount;
                this._scrollArticle(columnCount, direction)
            }, scrollOneUnit: function scrollOneUnit(direction) {
                this._scrollArticle(1, direction)
            }, scrollToStartOfCurrentArticle: function scrollToStartOfCurrentArticle() {
                this._scrollToArticleEdge(true)
            }, scrollToEndOfCurrentArticle: function scrollToEndOfCurrentArticle() {
                this._scrollToArticleEdge(false)
            }, _scrollMainViewport: function _scrollMainViewport(direction) {
                var viewport = this._viewport;
                var panel = this._panel;
                var scrollLeft = viewport.scrollLeft;
                var target = this._getScrollTarget(scrollLeft, direction);
                var articleCount = this._getArticleCount();
                var pageWidth = this.getPageWidth();
                var maxScroll = (articleCount - 1) * pageWidth;
                if (target >= 0 && target <= maxScroll) {
                    this._animateScroll(viewport, panel, target)
                }
            }, _scrollArticle: function _scrollArticle(columns, direction) {
                var currentArticle = this._getCurrentArticle();
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        var element = articleReader.element;
                        var width = articleReader.getWidth();
                        var pageWidth = this.getPageWidth();
                        var containerElement = currentArticle.containerElement;
                        var scrollLeft = containerElement.scrollLeft;
                        var maxScroll = width - pageWidth;
                        if ((scrollLeft === 0 && direction === 2) || (scrollLeft === maxScroll && direction === 1)) {
                            this._scrollMainViewport(direction)
                        }
                        else {
                            var gridOptions = this._gridOptions;
                            var columnWidth = gridOptions.columnWidth;
                            var columnMargin = gridOptions.columnMargin;
                            var columnUnit = columnWidth + columnMargin;
                            var modifier = direction === 1 ? 1 : -1;
                            var func = direction === 1 ? Math.floor : Math.ceil;
                            var roundedScrollLeft = func(scrollLeft / columnUnit) * columnUnit;
                            var target = roundedScrollLeft + (modifier * columnUnit * columns);
                            target = Math.min(Math.max(target, 0), maxScroll);
                            if (maxScroll - target < columnMargin) {
                                target = (direction === 1 ? maxScroll : target - columnUnit)
                            }
                            this._animateScroll(containerElement, element, target)
                        }
                    }
                }
            }, _scrollToArticleEdge: function _scrollToArticleEdge(beginning) {
                var currentArticle = this._getCurrentArticle();
                if (currentArticle) {
                    var articleReader = currentArticle.articleReader;
                    if (articleReader) {
                        var element = articleReader.element;
                        var containerElement = currentArticle.containerElement;
                        if (beginning) {
                            this._animateScroll(containerElement, element, 0)
                        }
                        else {
                            var width = articleReader.getWidth();
                            var pageWidth = this.getPageWidth();
                            var target = width - pageWidth;
                            this._animateScroll(containerElement, element, target)
                        }
                    }
                }
            }, _getPageCount: function _getPageCount(article) {
                return 1
            }
        })
    })
})();
(function _PartialPageSpacerRenderer_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        PartialPageSpacerRenderer: {
            rendererType: "PartialPageSpacer", render: function render(renderableBlock, context) {
                var element = document.createElement("div");
                WinJS.Utilities.addClass(element, "partialPageSpacer");
                return element
            }, layout: function layout(renderableBlock, surfaceManager, context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var element = renderableBlock.element;
                var firstEmptyColumn = surfaceManager.getFirstEmptyColumn(context, true);
                var gridColumnSpan = 2;
                var gridColumn = U.convertColumnIndexToGridColumn(firstEmptyColumn, columnCount);
                U.placeInGrid(element, gridColumn, gridColumnSpan, "", 1, 4, "");
                return true
            }
        }
    })
})();
(function _PartialPageOrchestrator_7() {
    "use strict";
    var BaseOrchestrator = CommonJS.ArticleReader.ArticleReaderOrchestrator;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        PartialPageOrchestrator: WinJS.Class.derive(BaseOrchestrator, function partialpageorchestrator_ctor(elt, options) {
            BaseOrchestrator.call(this, elt, options);
            var viewport = this._viewport;
            WinJS.Utilities.addClass(viewport, "partial")
        }, {
            _snapList: null, _renderPromise: WinJS.Promise.as({}), _renderCompleted: false, _fixingSnapPromise: WinJS.Promise.as({}), _transitionInProgress: false, _suspendScrollHandler: false, _lastScrollLeft: -1, dispose: function dispose() {
                BaseOrchestrator.prototype.dispose.call(this);
                this._snapList = null;
                if (this._renderPromise) {
                    this._renderPromise.cancel()
                }
                this._renderPromise = null;
                if (this._fixingSnapPromise) {
                    this._fixingSnapPromise.cancel()
                }
                this._fixingSnapPromise = null
            }, render: function render(articleId, data, renderOptions, navigateOptions, preRender) {
                this._renderCompleted = false;
                var promise = BaseOrchestrator.prototype.render.call(this, articleId, data, renderOptions, navigateOptions, preRender);
                this._updateSnapPointsAfterPromise(promise);
                return this._renderPromise
            }, relayout: function relayout() {
                this._renderCompleted = false;
                var promise = BaseOrchestrator.prototype.relayout.call(this);
                this._updateSnapPointsAfterPromise(promise);
                return promise
            }, setTextAttributesAndRelayout: function setTextAttributesAndRelayout(textAttributes) {
                this._renderCompleted = false;
                this._suspendScrollHandler = true;
                var promise = BaseOrchestrator.prototype.setTextAttributesAndRelayout.call(this, textAttributes);
                this._updateSnapPointsAfterPromise(promise);
                return promise
            }, updateColumnsStyle: function updateColumnsStyle(scrollLeft, immediate) {
                if (!this._suspendScrollHandler) {
                    this._updateTransitionColumnsStyle(scrollLeft, immediate)
                }
            }, setSnapPoint: function setSnapPoint(lastScroll) {
                if (this._transitionInProgress) {
                    return
                }
                if (this._renderCompleted) {
                    this._setSnapPoint(lastScroll)
                }
                else {
                    if (this._renderPromise) {
                        this._fixingSnapPromise = WinJS.Promise.join([this._fixingSnapPromise, this._renderPromise.then(this._setSnapPoint.bind(this, lastScroll))])
                    }
                }
            }, isPageBoundary: function isPageBoundary(scrollLeft) {
                var snapList = this._snapList;
                if (!snapList) {
                    return false
                }
                return snapList.indexOf(scrollLeft) >= 0
            }, _setSnapPoint: function _setSnapPoint(lastScroll) {
                var scrollLeft = this._viewport.scrollLeft;
                if (scrollLeft === lastScroll || !this._snapList) {
                    return
                }
                var index = this._snapList.indexOf(scrollLeft);
                if (index > -1) {
                    return
                }
                index = this._snapList.indexOf(lastScroll);
                if (lastScroll > scrollLeft) {
                    if (index > 0) {
                        index = this._getPrevSnapPoint(index - 1, scrollLeft)
                    }
                }
                else {
                    if (index < (this._snapList.length - 1)) {
                        index = this._getNextSnapPoint(index + 1, scrollLeft)
                    }
                }
                if (index > -1) {
                    var scrollFix = this._snapList[index];
                    if (scrollFix !== scrollLeft) {
                        this._viewport.scrollLeft = scrollFix;
                        this._updateTransitionColumnsStyle(scrollFix, true)
                    }
                }
            }, _getPrevSnapPoint: function _getPrevSnapPoint(index, scrollPosition) {
                while (index >= 0) {
                    if (this._snapList[index] < scrollPosition) {
                        return index
                    }
                    index--
                }
                return 0
            }, _getNextSnapPoint: function _getNextSnapPoint(index, scrollPosition) {
                var length = this._snapList.length;
                while (index < length) {
                    if (this._snapList[index] > scrollPosition) {
                        return index
                    }
                    index++
                }
                return length - 1
            }, _updateSnapPointsAfterPromise: function _updateSnapPointsAfterPromise(promise) {
                var that = this;
                this._renderPromise = WinJS.Promise.join([this._renderPromise, promise.then(this._updateSnapPoints.bind(this))]);
                this._renderPromise.done(function _PartialPageOrchestrator_155() {
                    that._renderCompleted = true;
                    that._renderPromise = WinJS.Promise.as({});
                    that._suspendScrollHandler = false
                })
            }, _updateSnapPoints: function _updateSnapPoints() {
                var articles = this._articles;
                this._snapList = [];
                var pageWidth = this.getPageWidth();
                var randomArticleId = null;
                for (var key in articles) {
                    randomArticleId = key;
                    break
                }
                if (randomArticleId !== null) {
                    var article = articles[randomArticleId];
                    while (article.previous) {
                        article = article.previous
                    }
                    var x = 0;
                    do {
                        var articleReader = article.articleReader;
                        var width = this._getArticleWidth(article);
                        if (width < pageWidth) {
                            debugger;
                            width = pageWidth
                        }
                        var articleX = 0;
                        var lastPageBoundary = width - pageWidth;
                        for (; articleX < lastPageBoundary; articleX += pageWidth) {
                            this._snapList.push(x + articleX)
                        }
                        this._snapList.push(x + lastPageBoundary);
                        article.lastFullPageLeft = x + articleX - pageWidth;
                        article.partialPageLeft = x + lastPageBoundary;
                        x += width;
                        article = article.next
                    } while (article)
                }
                var viewport = this._viewport;
                var style = this._getSnapListStyle(this._snapList);
                viewport.style.msScrollSnapPointsX = style
            }, _getSnapListStyle: function _getSnapListStyle(snapList) {
                var strings = ["snapList("];
                for (var i = 0, len = snapList.length; i < len; i++) {
                    var snap = snapList[i];
                    strings.push(snap);
                    strings.push("px");
                    strings.push(",")
                }
                if (len) {
                    strings.pop()
                }
                strings.push(")");
                var style = strings.join("");
                return style
            }, _animateScroll: function _animateScroll(viewport, element, target) {
                if (target >= 0 && this._transitionInProgress === false) {
                    var scrollLeft = viewport.scrollLeft;
                    var offset = target - scrollLeft;
                    var distance = Math.abs(offset);
                    var pageWidth = this.getPageWidth();
                    var transitionTimeInMills = 250 * (distance / pageWidth);
                    var scrollLeft = this._viewport.scrollLeft;
                    if (scrollLeft >= 0) {
                        this._transitionInProgress = true;
                        requestAnimationFrame(this._transitionColumnsStyle.bind(this, scrollLeft, offset, transitionTimeInMills, new Date))
                    }
                }
            }, _onScroll: function _onScroll(event) {
                if (!this._suspendScrollHandler) {
                    BaseOrchestrator.prototype._onScroll.call(this, event)
                }
            }, _maybeDispatchNear: function _maybeDispatchNear() {
                var that = this;
                var currentArticle = this._articles[this._currentArticleId];
                if (!currentArticle || !currentArticle.next) {
                    return
                }
                var next = currentArticle.next;
                if (!next.articleReader) {
                    msSetImmediate(function _PartialPageOrchestrator_261() {
                        that.dispatchEvent("nearunrealizedarticle", next.articleId)
                    })
                }
                else {
                    this._updateArticleColumnsStyle(next.articleId)
                }
            }, _adjustArticlesInGrid: function _adjustArticlesInGrid() {
                BaseOrchestrator.prototype._adjustArticlesInGrid.call(this);
                this._updateArticleColumnsStyle(this._currentArticleId)
            }, _updateArticleColumnsStyle: function _updateArticleColumnsStyle(articleId, pageIndexModifier) {
                var articles = this._articles;
                var article = articles[articleId];
                var pageCount = this._getArticlePageCount(article);
                var pageIndex = this._getCurrentPageIndex(articleId);
                if (pageIndexModifier) {
                    pageIndex = pageIndex + pageIndexModifier
                }
                if (pageIndex === -1) {
                    var viewport = this._viewport;
                    var pageWidth = this.getPageWidth();
                    var previousWidth = this._getPreviousWidth(article);
                    pageIndex = Math.ceil((viewport.scrollLeft - previousWidth) / pageWidth)
                }
                if (article) {
                    var articleReader = article.articleReader;
                    if (articleReader) {
                        articleReader.updatePartialPageColumnsStyle(pageIndex === (pageCount - 1) ? 1 : 0)
                    }
                }
            }, _transitionColumnsStyle: function _transitionColumnsStyle(scrollLeft, totalDistance, totalTime, startTime) {
                var currentTime = new Date;
                var timeElapsed = Math.min(currentTime - startTime, totalTime);
                var distance = totalDistance * (timeElapsed / totalTime);
                var newScrollLeft = scrollLeft + distance;
                if (newScrollLeft < 0) {
                    newScrollLeft = 0
                }
                this.updateColumnsStyle(newScrollLeft, false);
                this._viewport.scrollLeft = newScrollLeft;
                if (timeElapsed === totalTime) {
                    this._transitionInProgress = false
                }
                else {
                    requestAnimationFrame(this._transitionColumnsStyle.bind(this, scrollLeft, totalDistance, totalTime, startTime))
                }
            }, _updateTransitionColumnsStyle: function _updateTransitionColumnsStyle(scrollLeft, immediate) {
                if (this._lastScrollLeft === scrollLeft) {
                    return
                }
                var article = this._articles[this._currentArticleId];
                if (article) {
                    var partialPageLeft = article.partialPageLeft;
                    var lastFullPageLeft = article.lastFullPageLeft;
                    if (!isNaN(lastFullPageLeft) && !isNaN(partialPageLeft)) {
                        if (scrollLeft >= 0) {
                            this._lastScrollLeft = scrollLeft
                        }
                        var articleReader = article.articleReader;
                        if (articleReader) {
                            if (scrollLeft < 0 && immediate === true) {
                                articleReader.updatePartialPageColumnsStyle(-1, immediate)
                            }
                            else if (scrollLeft >= partialPageLeft) {
                                articleReader.updatePartialPageColumnsStyle(1, immediate)
                            }
                            else if (scrollLeft <= lastFullPageLeft) {
                                articleReader.updatePartialPageColumnsStyle(0, immediate)
                            }
                            else {
                                articleReader.updatePartialPageColumnsStyle((scrollLeft - lastFullPageLeft) / (partialPageLeft - lastFullPageLeft), immediate)
                            }
                        }
                    }
                }
            }
        })
    })
})();
(function _Toc_7() {
    "use strict";
    var buttonIdFormat = "button{0}";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        Toc: WinJS.Class.mix(WinJS.Class.define(function _Toc_15(elt, options) {
            var that = this;
            elt = this.elt = elt ? elt : document.createElement("div");
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            WinJS.Utilities.addClass(elt, "toc");
            var headElt = document.createElement("div");
            WinJS.Utilities.addClass(headElt, "head");
            elt.appendChild(headElt);
            var headerContainerElt = document.createElement("div");
            WinJS.Utilities.addClass(headerContainerElt, "headerContainer");
            headElt.appendChild(headerContainerElt);
            var publisher = this._publisher = options.publisher;
            if (publisher) {
                var favicon = publisher.favicon;
                if (favicon) {
                    var logoElt = document.createElement("div");
                    WinJS.Utilities.addClass(logoElt, "logo");
                    var logoUrl = favicon.url;
                    if (logoUrl) {
                        var logoImage = new CommonJS.ImageCard(logoElt, {
                            alternateText: publisher.name || "", imageSource: {
                                url: logoUrl, cacheId: options.publisher.imageCacheId
                            }
                        });
                        headerContainerElt.appendChild(logoElt)
                    }
                }
            }
            var pageTitle = options.pageTitle;
            if (pageTitle && pageTitle.length) {
                var titleElt = document.createElement("h1");
                WinJS.Utilities.addClass(titleElt, "title");
                titleElt.innerText = options.pageTitle;
                headerContainerElt.appendChild(titleElt)
            }
            var bodyElt = this._bodyElt = document.createElement("div");
            WinJS.Utilities.addClass(bodyElt, "body");
            var bodyClickedListener = this._bodyClickedListener = this._bodyClicked.bind(this);
            bodyElt.addEventListener("click", bodyClickedListener);
            var bodyOnKeyPressListener = this._bodyOnKeyPressListener = this._bodyOnKeyPress.bind(this);
            bodyElt.addEventListener("keydown", bodyOnKeyPressListener);
            elt.appendChild(bodyElt);
            var listElt = document.createElement("ol");
            WinJS.Utilities.addClass(listElt, "list");
            bodyElt.appendChild(listElt);
            var articleInfos = this._articleInfos = options.articleInfos;
            for (var i = 0, len = articleInfos.length; i < len; i++) {
                var articleInfo = articleInfos[i];
                var articleId = articleInfo.articleId;
                var headline = articleInfo.headline;
                var bookmarkElt = document.createElement("li");
                WinJS.Utilities.addClass(bookmarkElt, "bookmark");
                bookmarkElt.setAttribute("data-article-id", articleId);
                listElt.appendChild(bookmarkElt);
                var buttonElt = document.createElement("button");
                WinJS.Utilities.addClass(buttonElt, "button");
                buttonElt.id = buttonIdFormat.format(articleId);
                buttonElt.setAttribute("data-article-id", articleId);
                buttonElt.setAttribute("data-headline", headline);
                bookmarkElt.appendChild(buttonElt);
                var containerElt = document.createElement("div");
                WinJS.Utilities.addClass(containerElt, "container");
                buttonElt.appendChild(containerElt);
                var nameElt = document.createElement("div");
                WinJS.Utilities.addClass(nameElt, "name");
                nameElt.innerText = headline;
                containerElt.appendChild(nameElt)
            }
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleclick"))
        }, {
            _publisher: null, _bodyClickedListener: null, _bodyOnKeyPressListener: null, _bodyElt: null, _articleInfos: null, select: function select(articleId, focus) {
                WinJS.Utilities.query(".button").removeClass("selected");
                var id = buttonIdFormat.format(articleId);
                var button = document.getElementById(id);
                if (button) {
                    WinJS.Utilities.addClass(button, "selected");
                    if (focus) {
                        button.focus()
                    }
                }
            }, focus: function focus(articleId) {
                var id = buttonIdFormat.format(articleId);
                var button = document.getElementById(id);
                if (button) {
                    button.focus()
                }
            }, dispose: function dispose() {
                var bodyElt = this._bodyElt;
                if (bodyElt) {
                    bodyElt.removeEventListener("click", this._bodyClickedListener);
                    bodyElt.removeEventListener("keydown", this._bodyOnKeyPressListener)
                }
            }, _getParentArticleItem: function _getParentArticleItem(elt) {
                var articleItem = null;
                var articleId = null;
                var headline = null;
                do {
                    if (elt) {
                        articleId = elt.getAttribute("data-article-id");
                        headline = elt.getAttribute("data-headline")
                    }
                    elt = elt.parentElement
                } while (elt && !articleId);
                if (articleId) {
                    articleItem = {
                        element: elt, articleId: articleId, headline: headline
                    }
                }
                return articleItem
            }, _bodyClicked: function _bodyClicked(event) {
                var elt = event.srcElement;
                var articleItem = this._getParentArticleItem(elt);
                if (articleItem) {
                    var articleId = articleItem.articleId;
                    var headline = articleItem.headline;
                    this.select(articleId, true);
                    this.dispatchEvent("articleclick", {
                        originalEvent: event, articleId: articleId
                    });
                    var customAttributes = {
                        Id: articleId, Title: headline, Provider: this._publisher.name
                    };
                    var clickUserActionMethod = PlatformJS.Utilities.getClickUserActionMethod(event);
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logUserActionWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, "Table of Contents – Article", elt, Microsoft.Bing.AppEx.Telemetry.UserActionOperation.click, clickUserActionMethod, 0, JSON.stringify(customAttributes))
                }
            }, _bodyOnKeyPress: function _bodyOnKeyPress(event) {
                var elt = event.srcElement;
                var articleItem = this._getParentArticleItem(elt);
                if (articleItem) {
                    var keyCode = event.keyCode;
                    if (keyCode) {
                        if (keyCode === WinJS.Utilities.Key.upArrow || keyCode === WinJS.Utilities.Key.downArrow) {
                            var articleElt = articleItem.element;
                            var nextItem = keyCode === WinJS.Utilities.Key.downArrow ? articleElt.nextSibling : articleElt.previousSibling;
                            if (nextItem) {
                                var nextArticleId = nextItem.getAttribute("data-article-id");
                                if (nextArticleId) {
                                    this.focus(nextArticleId);
                                    event.preventDefault()
                                }
                            }
                        }
                    }
                }
            }
        }), WinJS.Utilities.eventMixin)
    })
})();
(function _ArticleReaderPaginatedViewManager_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleReaderPaginatedViewManager: WinJS.Class.derive(CommonJS.PaginatedViewManager, function _ArticleReaderPaginatedViewManager_16(options) {
            this._orchestrator = options.orchestrator;
            CommonJS.PaginatedViewManager.call(this, options);
            this._attach(this._orchestrator, "scrolltoarticle", this._onScroll);
            this._attach(this._elt, "scroll", this._onScroll)
        }, {
            _orchestrator: null, _isFlippingPage: false, _registeredKeyDownListener: false, _articleType: null, _flippingPageTarget: 0, _lastAnimatedLeft: 0, _lastPageUpdateScrollLeft: 0, _userActionMethod: Microsoft.Bing.AppEx.Telemetry.UserActionMethod.unknown, attachEventListeners: function attachEventListeners(elt) {
                this._attach(elt, "wheel", this._wheelListener);
                if (!this._registeredKeyDownListener && document) {
                    this._keyDownListener = this._keyDownListener.bind(this);
                    document.addEventListener("keydown", this._keyDownListener);
                    this._registeredKeyDownListener = true
                }
                CommonJS.PaginatedViewManager.prototype.attachEventListeners.call(this, elt)
            }, setArticleType: function setArticleType(articleType) {
                this._articleType = articleType
            }, dispose: function dispose() {
                if (document && this._registeredKeyDownListener) {
                    document.removeEventListener("keydown", this._keyDownListener);
                    this._registeredKeyDownListener = false
                }
                this._keyDownListener = null;
                CommonJS.PaginatedViewManager.prototype.dispose.call(this)
            }, _getContainerElement: function _getContainerElement() {
                return this._orchestrator.viewport
            }, _hasNext: function _hasNext() {
                return this._orchestrator.hasNextPage()
            }, _hasPrevious: function _hasPrevious() {
                return this._orchestrator.hasPreviousPage()
            }, _onNextPageClick: function _onNextPageClick(event) {
                var isTouch = this._touch = event.pointerType === "touch";
                if (this._isClickAllowed(isTouch)) {
                    this._isFlippingPage = true;
                    var orchestrator = this._orchestrator;
                    if (isTouch) {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.nextTouch;
                        this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.touch
                    }
                    else {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.nextClickKeyboard;
                        this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.mouse
                    }
                    this._flippingPageTarget = orchestrator.scrollOnePage(1)
                }
            }, _onPreviousPageClick: function _onPreviousPageClick(event) {
                var isTouch = this._touch = event.pointerType === "touch";
                if (this._isClickAllowed(isTouch)) {
                    this._isFlippingPage = true;
                    var orchestrator = this._orchestrator;
                    if (isTouch) {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.nextClickMouse;
                        this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.touch
                    }
                    else {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.previousClickKeyboard;
                        this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.mouse
                    }
                    this._flippingPageTarget = orchestrator.scrollOnePage(2)
                }
            }, _isClickAllowed: function _isClickAllowed(isTouch) {
                return !isTouch || this._flippersAlwaysVisible || this._touchToShowFlippers || this._buttonsVisible
            }, _wheelListener: function _wheelListener(event) {
                if (this._articleType !== "webpage") {
                    this._touch = false;
                    var deltaY = event.deltaY;
                    if (deltaY !== 0) {
                        this._orchestrator.currentScrollSwipeMethod = U.viewMechanism.mouseScroll;
                        this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.mouse
                    }
                    if (deltaY > 0) {
                        this._orchestrator.scrollOneUnit(1)
                    }
                    else if (deltaY < 0) {
                        this._orchestrator.scrollOneUnit(2)
                    }
                }
                event.preventDefault()
            }, _manipulationListener: function _manipulationListener(event) {
                CommonJS.PaginatedViewManager.prototype._manipulationListener.call(this, event);
                var orchestrator = this._orchestrator;
                var scrollLeft = orchestrator.viewport.scrollLeft;
                if (this._isDragging) {
                    orchestrator.currentScrollSwipeMethod = U.viewMechanism.touchSwipe;
                    this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.touch
                }
            }, _keyDownListener: function _keyDownListener(event) {
                if (this._articleType === "webpage") {
                    event.preventDefault();
                    return
                }
                if (event.target.className === "platformMarketSelect") {
                    return
                }
                var orchestrator = this._orchestrator;
                var viewport = orchestrator.viewport;
                var marketDirection = window.getComputedStyle(viewport).direction;
                var keyCode = event.keyCode;
                var direction = null;
                this._touch = false;
                this._isFlippingPage = false;
                switch (keyCode) {
                    case WinJS.Utilities.Key.pageUp:
                        this._isFlippingPage = true;
                        direction = 2;
                        this._flippingPageTarget = orchestrator.scrollOnePage(2);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.leftArrow:
                        this._isFlippingPage = true;
                        direction = marketDirection === "ltr" ? 2 : 1;
                        this._flippingPageTarget = orchestrator.scrollOneUnit(direction);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.pageDown:
                        this._isFlippingPage = true;
                        direction = 1;
                        this._flippingPageTarget = orchestrator.scrollOnePage(1);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.rightArrow:
                        this._isFlippingPage = true;
                        direction = marketDirection === "ltr" ? 1 : 2;
                        this._flippingPageTarget = orchestrator.scrollOneUnit(direction);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.upArrow:
                        this._isFlippingPage = true;
                        direction = 2;
                        this._flippingPageTarget = orchestrator.scrollOneUnit(2);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.downArrow:
                        this._isFlippingPage = true;
                        direction = 1;
                        this._flippingPageTarget = orchestrator.scrollOneUnit(1);
                        event.preventDefault();
                        event.stopImmediatePropagation();
                        break;
                    case WinJS.Utilities.Key.home:
                        orchestrator.scrollToStartOfCurrentArticle();
                        event.preventDefault();
                        break;
                    case WinJS.Utilities.Key.end:
                        orchestrator.scrollToEndOfCurrentArticle();
                        event.preventDefault();
                        break
                }
                if (this._isFlippingPage) {
                    if (direction === 1) {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.nextClickKeyboard
                    }
                    else if (direction === 2) {
                        orchestrator.currentScrollSwipeMethod = U.viewMechanism.previousClickKeyboard
                    }
                    this._userActionMethod = Microsoft.Bing.AppEx.Telemetry.UserActionMethod.keyboard
                }
            }, _onScroll: function _onScroll(event) {
                if (this._articleType === "webpage") {
                    event.preventDefault();
                    return
                }
                var orchestrator = this._orchestrator;
                var viewport = orchestrator.viewport;
                var scrollLeft = viewport.scrollLeft;
                if (this._lastScroll === scrollLeft) {
                    return
                }
                var isTouch = this._touch;
                if (!isTouch) {
                    this._fixScroll();
                    this._maybeUpdateButtons()
                }
                else if (!this._isFlippingPage) {
                    this._maybeUpdateButtons();
                    this._fadeOutButtons(true)
                }
                else {
                    this._maybeUpdateButtons()
                }
                if (this._isFlippingPage && scrollLeft === this._flippingPageTarget) {
                    this._isFlippingPage = false
                }
                if (this._isDragging === false) {
                    orchestrator.updateColumnsStyle(scrollLeft, true)
                }
                else {
                    orchestrator.updateColumnsStyle(-1, true)
                }
                msSetImmediate(this._recordUserAction.bind(this, orchestrator.currentScrollSwipeMethod, scrollLeft, this._userActionMethod));
                this._lastScroll = scrollLeft
            }, _fixScroll: function _fixScroll() {
                var lastScroll = this._lastScroll || 0;
                this._orchestrator.setSnapPoint(lastScroll)
            }, _recordUserAction: function _recordUserAction(viewMechanism, newScrollLeft, userActionMethod) {
                var oldScrollLeft = this._lastPageUpdateScrollLeft;
                if (oldScrollLeft !== newScrollLeft) {
                    if (this._orchestrator.isPageBoundary(newScrollLeft)) {
                        var actionElement = null;
                        if (this._orchestrator.isDifferentArticle(oldScrollLeft, newScrollLeft)) {
                            actionElement = U.getActionElement(viewMechanism, true)
                        }
                        else {
                            actionElement = U.getActionElement(viewMechanism, false)
                        }
                        if (actionElement) {
                            U.logUserAction(U.actionContext.body, actionElement, userActionMethod)
                        }
                        this._lastPageUpdateScrollLeft = newScrollLeft
                    }
                }
            }
        })
    })
})();
(function _ArticlePlaceholder_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticlePlaceholder: WinJS.Class.define(function _ArticlePlaceholder_13(elt, options) {
            elt = this._elt = elt || document.createElement("div");
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            WinJS.Utilities.addClass(elt, "placeholder")
        }, {
            _elt: null, element: {
                get: function get() {
                    return this._elt
                }
            }, dispose: function dispose() { }
        }, {})
    })
})();
(function _ArticleReaderPage_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    var defaultImpressionContext = "/Article Reader";
    var partnerPanoImpressionContext = "/Partner Pano/Article Reader";
    var webViewImpressionContext = "/WebView";
    var eventNS = CommonJS.WindowEventManager;
    WinJS.Namespace.define("CommonJS", {
        ArticleReaderPage: WinJS.Class.define(function articleReaderPage_ctor(state) {
            this._state = state;
            this._isFirstView = true;
            this._hasToc = false;
            var root = document.getElementById("articleReaderPage");
            var market = state.market;
            if (root && market) {
                root.lang = PlatformJS.Utilities.convertMarketToLanguageCode(market)
            }
            var styleSheets = document.styleSheets;
            var themeColor = "win-ui-light";
            for (var i = 0, l = styleSheets.length; i < l; i++) {
                var styleSheet = styleSheets[i];
                if (styleSheet && styleSheet.href && styleSheet.href.match("ui-dark.css") && !styleSheet.disabled) {
                    themeColor = "win-ui-dark";
                    break
                }
            }
            WinJS.Utilities.addClass(root, themeColor);
            this._textStyleEnabled = PlatformJS.Services.configuration.getDictionary("ArticleReaderConfig").getBool("TextStyleButtonEnabled", true);
            this._readSettings();
            var providerConfiguration = this._providerConfiguration = PlatformJS.Collections.createStringDictionary();
            if (state.providerConfiguration.isNYT) {
                providerConfiguration = this._providerConfiguration = [];
                for (var key in state.providerConfiguration) {
                    providerConfiguration[key] = state.providerConfiguration[key]
                }
            }
            else {
                for (var key in state.providerConfiguration) {
                    providerConfiguration.insert(key, state.providerConfiguration[key])
                }
            }
            var providerType = state.providerType;
            var provider = this._provider = PlatformJS.Utilities.createObject(providerType);
            this._setupTextAttributes();
            var actionsHandlerType = state.actionsHandlerType;
            var orchestrator = null;
            var orchestratorElt = document.getElementById("articleOrchestrator");
            var assembler = state.assembler;
            if (assembler) {
                var type = assembler.type;
                if (type === "toc") {
                    orchestrator = new CommonJS.ArticleReader.TocArticleOrchestrator(orchestratorElt, {
                        market: state.market, assemblerOptions: assembler.options
                    })
                }
            }
            if (!orchestrator) {
                orchestrator = new CommonJS.ArticleReader.PartialPageOrchestrator(orchestratorElt, {
                    market: state.market, categoryName: state.categoryName, categoryKey: state.categoryKey, customOptions: state.customOptions
                })
            }
            this._orchestrator = orchestrator;
            this._setupBottomEdgy();
            var contentCssPaths = state.contentCssPaths;
            var renderAll = state.renderAll;
            var adGroups = state.adGroups;
            var initialTextAttributes = this._getCurrentTextAttributes().effective;
            var isPaginated = orchestrator.isPaginated();
            var disableTextSelection = state.disableTextSelection;
            var hasPageNumbers = orchestrator.hasPageNumbers();
            var hidePageNumbers = !hasPageNumbers;
            var articleManager = this._articleManager = new CommonJS.ArticleReader.ArticleManager({
                provider: provider, bottomEdgy: this._bottomEdgy, renderOptionsSeed: {
                    contentCssPaths: contentCssPaths, renderAll: renderAll, adGroups: adGroups, adPartnerName: state.adPartnerName, hidePageNumbers: hidePageNumbers, allowLoneEndAd: true, noSlideshow: state.noSlideshow, isPaginated: isPaginated, disableTextSelection: disableTextSelection, isPaywallCardEnabled: state.isPaywallCardEnabled, extraPaywallConfiguration: state.extraPaywallConfiguration, paywallGrowlMessageFunction: state.paywallGrowlMessageFunction, showGrowlTextWithoutPaywallCard: state.showGrowlTextWithoutPaywallCard
                }, initialTextAttributes: initialTextAttributes, actionsHandlerType: actionsHandlerType, orchestrator: orchestrator, getPaywallProviderPromise: state.getPaywallProviderPromise
            });
            var defaultArticleChangedListener = this._defaultArticleChangedListener = this._defaultArticleChanged.bind(this);
            articleManager.addEventListener("articlechanged", defaultArticleChangedListener);
            var defaultArticleErrorListener = this._defaultArticleErrorListener = this._defaultArticleError.bind(this);
            articleManager.addEventListener("articleerror", defaultArticleErrorListener);
            this._needRedraw = !this._changeView();
            this._promise = null;
            var theme = state.theme || "defaultArticleReaderTheme";
            this._applyTheme(theme);
            this._eventManager = eventNS.getInstance();
            this._adEngageChangedBinding = this._adEngageChanged.bind(this);
            this._eventManager.addEventListener(eventNS.Events.AD_ENGAGE, this._adEngageChangedBinding);
            this._isDisposed = false
        }, {
            _providerConfiguration: null, _provider: null, _state: null, _promise: null, _articleManager: null, _bottomEdgy: null, _textSizeOptions: null, _textSizeFlyout: null, _textStyleOptions: null, _textStyleButton: null, _settings: null, _defaultArticleChangedListener: null, _defaultArticleErrorListener: null, _textStyleEnabled: null, _isFirstView: null, _orchestrator: null, _nextButton: null, _previousButton: null, _helpButton: null, _textSizeButton: null, _nextButtonClickListener: null, _previousButtonClickListener: null, _helpButtonClickListener: null, _textSizeButtonClickListener: null, _textStyleButtonSelectionChangedListener: null, _isDisposed: null, _viewMechanismToSourceIdMapping: null, _viewMechanismToNavMethodMapping: null, _viewMechanismTelemetryMapping: null, _adEngageChangedBinding: null, _eventManager: null, _isAdEngaged: false, _needRedraw: false, onNavigateAway: function onNavigateAway() { }, onSuspending: function onSuspending(event) { }, dispose: function dispose() {
                var isDisposed = this._isDisposed;
                if (!isDisposed) {
                    this._isDisposed = true;
                    var promise = this._promise;
                    if (promise) {
                        promise.cancel();
                        this._promise = null
                    }
                    var articleManager = this._articleManager;
                    if (articleManager) {
                        articleManager.removeEventListener("articlechanged", this._defaultArticleChangedListener);
                        articleManager.removeEventListener("articleerror", this._defaultArticleErrorListener);
                        articleManager.dispose();
                        this._defaultArticleChangedListener = null;
                        this._defaultArticleErrorListener = null;
                        this._articleManager = null
                    }
                    var textSizeFlyout = this._textSizeFlyout;
                    if (textSizeFlyout) {
                        textSizeFlyout.dispose();
                        this._textSizeFlyout = null
                    }
                    var textStyleButton = this._textStyleButton;
                    if (textStyleButton) {
                        textStyleButton.removeEventListener("selectionchanged", this._textStyleButtonSelectionChangedListener);
                        textStyleButton.dispose();
                        this._textStyleButton = null
                    }
                    var nextButton = this._nextButton;
                    if (nextButton) {
                        nextButton.removeEventListener("click", this._nextButtonClickListener);
                        this._nextButton = null
                    }
                    var previousButton = this._previousButton;
                    if (previousButton) {
                        previousButton.removeEventListener("click", this._previousButtonClickListener);
                        this._previousButton = null
                    }
                    var helpButton = this._helpButton;
                    if (helpButton) {
                        helpButton.removeEventListener("click", this._helpButtonClickListener);
                        this._helpButton = null
                    }
                    var textSizeButton = this._textSizeButton;
                    if (textSizeButton) {
                        textSizeButton.removeEventListener("click", this._textSizeButtonClickListener);
                        this._textSizeButton = null
                    }
                    var root = document.getElementById("articleReaderPage");
                    if (root) {
                        WinJS.Utilities.disposeSubTree(root)
                    }
                    this._provider = null;
                    this._viewMechanismToSourceIdMapping = null;
                    this._viewMechanismToNavMethodMapping = null;
                    this._viewMechanismTelemetryMapping = null;
                    this._eventManager.removeEventListener(eventNS.Events.AD_ENGAGE, this._adEngageChangedBinding);
                    this._adEngageChangedBinding = null;
                    this._eventManager = null;
                    this._isAdEngaged = false;
                    this._needRedraw = false;
                    this._orchestrator = null;
                    this._bottomEdgy = null
                }
            }, getPageImpressionContext: function getPageImpressionContext() {
                if (this._state.entryPoint === Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano) {
                    return partnerPanoImpressionContext
                }
                else if (this._state.providerType === "AppEx.Common.ArticleReader.WebpageProvider") {
                    return webViewImpressionContext
                }
                else {
                    return defaultImpressionContext
                }
            }, getPageImpressionPartnerCodeAndAttributes: function getPageImpressionPartnerCodeAndAttributes() {
                var state = this._state;
                var results = {};
                if (state && state.entryPoint === Platform.Instrumentation.InstrumentationArticleEntryPoint.partnerPano) {
                    results.partnerCode = state.instrumentationId
                }
                if (state && state.pageId) {
                    var attributes = {};
                    attributes.pageId = state.pageId;
                    if (state.clusterId) {
                        attributes.clusterId = state.clusterId
                    }
                    if (state.pageType) {
                        attributes.pageType = state.pageType
                    }
                    results.attributes = attributes
                }
                return results
            }, _defaultArticleChanged: function _defaultArticleChanged(event) {
                var state = this._state;
                var clientArticleId = event.detail.clientArticleId;
                state.initialArticleId = clientArticleId;
                var instrumentationData = event.detail.instrumentationData;
                if (instrumentationData) {
                    this._recordArticleView(instrumentationData)
                }
            }, _defaultArticleError: function _defaultArticleError(event) {
                var error = event.detail;
                var message = error ? error.message : "";
                if (!message && error.webErrorStatus) {
                    message = "webErrorStatus = " + error.webErrorStatus;
                    if (error.uri) {
                        message += (" when visiting " + error.uri)
                    }
                }
                var stack = error ? error.stack : "";
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logCodeError(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, Microsoft.Bing.AppEx.Telemetry.RuntimeEnvironment.javascript, message, stack)
            }, _getSettingsContainer: function _getSettingsContainer() {
                var localSettings = Windows.Storage.ApplicationData.current.localSettings;
                var container = localSettings.createContainer("articleReaderSettings", Windows.Storage.ApplicationDataCreateDisposition.always);
                return container
            }, _writeSettings: function _writeSettings() {
                var container = this._getSettingsContainer();
                var settings = this._settings;
                container.values["textSize"] = settings.textSize;
                container.values["textStyle"] = settings.textStyle
            }, _readSettings: function _readSettings() {
                var container = this._getSettingsContainer();
                var config = PlatformJS.Services.configuration.getDictionary("ArticleReaderConfig");
                var xlargeEnabled = config.getBool("XLargeTextSizeEnabled");
                var sizeDefaultConfig = config.getString("DefaultTextSize").toLowerCase();
                var sizeDefault = (sizeDefaultConfig === "small" || sizeDefaultConfig === "medium" || sizeDefaultConfig === "large" || (xlargeEnabled && sizeDefaultConfig === "xlarge")) ? sizeDefaultConfig : "medium";
                var styleDefaultConfig = config.getString("DefaultTextStyle").toLowerCase();
                var styleDefault = (styleDefaultConfig === "primary" || styleDefaultConfig === "secondary") ? styleDefaultConfig : "primary";
                var containerTextSize = container.values["textSize"];
                if (!xlargeEnabled && containerTextSize === "xlarge") {
                    containerTextSize = null
                }
                var containerTextStyle = container.values["textStyle"];
                var optimalTextSize = null;
                if (!containerTextSize) {
                    optimalTextSize = container.values["optimalTextSize"];
                    if (optimalTextSize) {
                        var hash = this._getOptimalTextHash();
                        var optimalTextHash = container.values["optimalTextHash"];
                        if (!optimalTextHash || optimalTextHash !== hash) {
                            optimalTextSize = null
                        }
                    }
                    if (!optimalTextSize) {
                        optimalTextSize = CommonJS.ArticleReader.FontCalculator.calculateOptimalFontSize(sizeDefault, styleDefault, xlargeEnabled);
                        if (optimalTextSize) {
                            container.values["optimalTextSize"] = optimalTextSize;
                            var hash = this._getOptimalTextHash();
                            container.values["optimalTextHash"] = hash
                        }
                    }
                }
                if (PlatformJS.isDebug) {
                    if (PlatformJS.Configuration.ConfigurationManager.optimalTextSizeEnabled) {
                        CommonJS.ArticleReaderPage.updateDebugIndicator(null, "Optimal: " + optimalTextSize + ", Default: " + sizeDefault, null)
                    }
                    else {
                        optimalTextSize = null;
                        CommonJS.ArticleReaderPage.updateDebugIndicator(null, "Optimal: Turned off, Default: " + sizeDefault, "-")
                    }
                }
                var settings = {
                    textSize: containerTextSize || optimalTextSize || sizeDefault, textStyle: containerTextStyle || styleDefault
                };
                this._settings = settings
            }, _updateDefaultTextSize: function _updateDefaultTextSize(relayout) {
                var container = this._getSettingsContainer();
                var containerTextSize = container.values["textSize"];
                if (!containerTextSize) {
                    var hash = this._getOptimalTextHash();
                    var optimalTextHash = container.values["optimalTextHash"];
                    if (!optimalTextHash || optimalTextHash !== hash) {
                        this._readSettings();
                        var settings = this._settings;
                        var textSize = settings.textSize;
                        var textStyle = settings.textStyle;
                        var textSizeOptions = this._textSizeOptions;
                        for (var i = 0, leni = textSizeOptions.length; i < leni; i++) {
                            var textSizeOption = textSizeOptions[i];
                            textSizeOption.selected = textSizeOption.value === textSize
                        }
                        var textSizeFlyout = this._textSizeFlyout;
                        textSizeFlyout.setItems(textSizeOptions);
                        var textStyleEnabled = this._textStyleEnabled;
                        var effective = {
                            size: textSize, style: textStyleEnabled ? textStyle : "primary"
                        };
                        var articleManager = this._articleManager;
                        articleManager.setTextAttributes(effective, relayout)
                    }
                }
            }, _getOptimalTextHash: function _getOptimalTextHash() {
                return screen && (screen.deviceYDPI + screen.height + screen.width)
            }, _applyTheme: function _applyTheme(theme) {
                var root = document.querySelector(".articleReaderPage");
                if (root && theme) {
                    WinJS.Utilities.addClass(root, theme)
                }
            }, _getActiveArticleReader: function _getActiveArticleReader() {
                return this._articleReader
            }, _initialize: function _initialize() {
                var that = this;
                var state = this._state;
                var provider = this._provider;
                var initialArticleId = state.initialArticleId;
                var startPage = state.startPage;
                var articleManager = this._articleManager;
                if (provider) {
                    if (state && state.adPartnerName) {
                        var noInterstitialAdPartnerNames = PlatformJS.Services.configuration.getDictionary("NoInterstitialAdPartnerNames");
                        if (noInterstitialAdPartnerNames && noInterstitialAdPartnerNames.hasKey && noInterstitialAdPartnerNames.hasKey(state.adPartnerName)) {
                            this._providerConfiguration.suppressInterstitial = true
                        }
                    }
                    this._promise = provider.initializeAsync(this._providerConfiguration).then(function _ArticleReaderPage_528() {
                        var cacheId = provider.getCacheId();
                        articleManager.cacheId = cacheId;
                        var navigateOptions = { startPage: startPage };
                        return articleManager.gotoArticle(initialArticleId, navigateOptions, null, false)
                    }).then(function _ArticleReaderPage_536() {
                        if (!that._disposed) {
                            PlatformJS.Navigation.mainNavigator.notifyPageLoadComplete()
                        }
                        if (PlatformJS.mainProcessManager.afterFirstView) {
                            PlatformJS.mainProcessManager.afterFirstView()
                        }
                    }, function _ArticleReaderPage_545(err) {
                        that.dispose()
                    })
                }
                else {
                    PlatformJS.Navigation.mainNavigator.returnHomeAndClearHistoryIfNecessary()
                }
            }, _setupTextAttributes: function _setupTextAttributes() {
                var textSizeOptions = this._textSizeOptions = [{
                    label: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextSizeSmall"), selected: false, value: "small"
                }, {
                    label: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextSizeMedium"), selected: false, value: "medium"
                }, {
                    label: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextSizeLarge"), selected: false, value: "large"
                },];
                var xlargeEnabled = PlatformJS.Services.configuration.getDictionary("ArticleReaderConfig").getBool("XLargeTextSizeEnabled");
                if (xlargeEnabled) {
                    textSizeOptions.push({
                        label: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextSizeXLarge"), selected: false, value: "xlarge"
                    })
                }
                var textStyleOptions = this._textStyleOptions = [{
                    label: PlatformJS.Services.resourceLoader.getString("/Platform/TextStylePrimary"), icon: "\uE239", selected: false, value: "primary"
                }, {
                    label: PlatformJS.Services.resourceLoader.getString("/Platform/TextStyleSecondary"), icon: "\uE221", selected: false, value: "secondary"
                },];
                var settings = this._settings;
                var textSize = settings.textSize;
                var textStyle = settings.textStyle;
                var selectedTextSize = 0;
                for (var i = 0, leni = textSizeOptions.length; i < leni; i++) {
                    var textSizeOption = textSizeOptions[i];
                    if (textSizeOption.value === textSize) {
                        selectedTextSize = i;
                        break
                    }
                }
                var selectedTextStyle = 0;
                for (var j = 0, lenj = textStyleOptions.length; j < lenj; j++) {
                    var textStyleOption = textStyleOptions[j];
                    if (textStyleOption.value === textStyle) {
                        selectedTextStyle = j;
                        break
                    }
                }
                textSizeOptions[selectedTextSize].selected = true;
                textStyleOptions[selectedTextStyle].selected = true
            }, _setupBottomEdgyNavigationButtons: function _setupBottomEdgyNavigationButtons(commands) {
                if (this._isDisposed) {
                    return
                }
                var orchestrator = this._orchestrator;
                var hasBottomEdgyNavigation = orchestrator.hasBottomEdgyNavigation();
                if (hasBottomEdgyNavigation) {
                    var nextElt = document.createElement("button");
                    this._nextButton = new WinJS.UI.AppBarCommand(nextElt, {
                        icon: "\u007D", extraClass: "appexSymbol", label: PlatformJS.Services.resourceLoader.getString("/Platform/NextArticle"), id: "nextArticle"
                    });
                    var nextButtonClickListener = this._nextButtonClickListener = this._onNextButtonClick.bind(this);
                    this._nextButton.addEventListener("click", nextButtonClickListener);
                    var previousElt = document.createElement("button");
                    this._previousButton = new WinJS.UI.AppBarCommand(previousElt, {
                        icon: "\u007B", extraClass: "appexSymbol", label: PlatformJS.Services.resourceLoader.getString("/Platform/PreviousArticle"), id: "previousArticle"
                    });
                    var previousButtonClickListener = this._previousButtonClickListener = this._onPreviousButtonClick.bind(this);
                    this._previousButton.addEventListener("click", previousButtonClickListener);
                    commands.push(this._previousButton);
                    commands.push(this._nextButton)
                }
            }, _setupBottomEdgyTextButtons: function _setupBottomEdgyTextButtons(commands) {
                var that = this;
                var textSizeOptions = this._textSizeOptions;
                var textSizeFlyoutOptions = {
                    buttonText: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextSizeMenuLabel"), icon: "\uE219", extraClass: "appexSymbol", selectionChanged: function selectionChanged(item) {
                        that._updateTextSize(item.index)
                    }, id: "textSize"
                };
                var textSizeFlyout = this._textSizeFlyout = new CommonJS.SortFlyout(null, textSizeFlyoutOptions);
                var textSizeButton = this._textSizeButton = textSizeFlyout.appbarbtn;
                var textSizeButtonClickListener = this._textSizeButtonClickListener = this._onTextSizeButtonClick.bind(this);
                textSizeButton.addEventListener("click", textSizeButtonClickListener);
                textSizeFlyout.setItems(textSizeOptions);
                var textStyleOptions = this._textStyleOptions;
                var textStyleEnabled = this._textStyleEnabled;
                var extraClass = textStyleEnabled ? "appexSymbol" : "appexSymbol platformHide";
                var textStyleButtonOptions = {
                    extraClass: extraClass, label: PlatformJS.Services.resourceLoader.getString("/Platform/ArticleTextStyleMenuLabel"), items: textStyleOptions, id: "textStyle"
                };
                var textStyleButton = this._textStyleButton = new CommonJS.SelectorButton(null, textStyleButtonOptions);
                var textStyleButtonSelectionChangedListener = this._textStyleButtonSelectionChangedListener = this._onTextStyleButtonSelectionChanged.bind(this);
                textStyleButton.addEventListener("selectionchanged", textStyleButtonSelectionChangedListener);
                commands.push(textStyleButton);
                commands.push(textSizeButton)
            }, _setupBottomEdgyHelpButton: function _setupBottomEdgyHelpButton(commands) {
                var helpUrl = PlatformJS.Services.appConfig.getString("HelpURL");
                if (helpUrl) {
                    var helpButton = this._helpButton = CommonJS.Settings.getHelpButton().winControl;
                    commands.push(helpButton);
                    var helpButtonClickListener = this._helpButtonClickListener = this._onHelpButtonClick.bind(this);
                    helpButton.addEventListener("click", helpButtonClickListener)
                }
            }, _setupAppBar: function _setupAppBar(commands) {
                var elt = document.getElementById("bottomEdgy");
                var appBar = new WinJS.UI.AppBar(elt, {
                    placement: "bottom", commands: commands
                });
                this._bottomEdgy = {
                    appBar: appBar, nextButton: this._nextButton || {}, previousButton: this._previousButton || {}
                }
            }, _setupBottomEdgy: function _setupBottomEdgy() {
                var commands = [];
                this._setupBottomEdgyTextButtons(commands);
                this._setupBottomEdgyNavigationButtons(commands);
                this._setupBottomEdgyHelpButton(commands);
                this._setupAppBar(commands)
            }, _onNextButtonClick: function _onNextButtonClick(event) {
                var that = this;
                this._logBottomEdgyAction("Next Button");
                this._dismissTopEdgy();
                this._articleManager.nextArticle().then(function _ArticleReaderPage_740() { }, function _ArticleReaderPage_742(err) {
                    that.dispose()
                })
            }, _onPreviousButtonClick: function _onPreviousButtonClick(event) {
                var that = this;
                this._logBottomEdgyAction("Previous Button");
                this._dismissTopEdgy();
                this._articleManager.previousArticle().then(function _ArticleReaderPage_753() { }, function _ArticleReaderPage_755(err) {
                    that.dispose()
                })
            }, _onHelpButtonClick: function _onHelpButtonClick(event) {
                this._logBottomEdgyAction("Help Button")
            }, _onTextSizeButtonClick: function _onTextSizeButtonClick(event) {
                this._logBottomEdgyAction("Text Size Button")
            }, _onTextStyleButtonSelectionChanged: function _onTextStyleButtonSelectionChanged(event) {
                this._logBottomEdgyAction("Text Style Button");
                this._dismissTopEdgy();
                var index = event.detail;
                this._updateTextStyle(index)
            }, _toggleBottomEdgy: function _toggleBottomEdgy(enabled) {
                var bottomEdgy = this._bottomEdgy;
                if (bottomEdgy) {
                    var appBar = bottomEdgy.appBar;
                    appBar.disabled = !enabled
                }
            }, _updateTextSize: function _updateTextSize(index) {
                var textSizeOptions = this._textSizeOptions;
                var textSizeFlyout = this._textSizeFlyout;
                for (var i = 0, len = textSizeOptions.length; i < len; i++) {
                    var textSizeOption = textSizeOptions[i];
                    textSizeOption.selected = (i === index)
                }
                textSizeFlyout.setItems(textSizeOptions);
                this._updateTextAttributes()
            }, _updateTextStyle: function _updateTextStyle(index) {
                var textStyleOptions = this._textStyleOptions;
                var textStyleButton = this._textStyleButton;
                for (var i = 0, len = textStyleOptions.length; i < len; i++) {
                    var textStyleOption = textStyleOptions[i];
                    textStyleOption.selected = (i === index)
                }
                this._updateTextAttributes()
            }, _updateTextAttributes: function _updateTextAttributes() {
                var textAttributes = this._getCurrentTextAttributes();
                var effectiveTextAttributes = textAttributes.effective;
                var storedTextAttributes = textAttributes.stored;
                var articleManager = this._articleManager;
                articleManager.setTextAttributes(effectiveTextAttributes, true);
                var settings = this._settings;
                settings.textSize = storedTextAttributes.size;
                settings.textStyle = storedTextAttributes.style;
                this._writeSettings();
                this._recordPreferences()
            }, _getCurrentTextAttributes: function _getCurrentTextAttributes() {
                var textSizeOptions = this._textSizeOptions;
                var textSize,
                    selected;
                for (var i = 0, len = textSizeOptions.length; i < len; i++) {
                    var textSizeOption = textSizeOptions[i];
                    selected = textSizeOption.selected;
                    if (selected) {
                        textSize = textSizeOption.value;
                        break
                    }
                }
                var textStyleOptions = this._textStyleOptions;
                var textStyle;
                for (var j = 0, lenj = textStyleOptions.length; j < lenj; j++) {
                    var textStyleOption = textStyleOptions[j];
                    selected = textStyleOption.selected;
                    if (selected) {
                        textStyle = textStyleOption.value;
                        break
                    }
                }
                var stored = {
                    size: textSize, style: textStyle
                };
                var textStyleEnabled = this._textStyleEnabled;
                var effective = {
                    size: textSize, style: textStyleEnabled ? textStyle : "primary"
                };
                var textAttributes = {
                    effective: effective, stored: stored
                };
                return textAttributes
            }, _logBottomEdgyAction: function _logBottomEdgyAction(element) {
                U.logUserAction(U.actionContext.appBar, element)
            }, _recordPreferences: function _recordPreferences() {
                var settings = this._settings;
                var preferences = {};
                preferences["ArticleReader/TextSize"] = settings.textSize;
                preferences["ArticleReader/TextStyle"] = settings.textStyle;
                var jsonString = JSON.stringify(preferences);
                Microsoft.Bing.AppEx.Telemetry.FlightRecorder.logPreferencesAsJson(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, jsonString)
            }, _getSourceID: function _getSourceID(viewMechanism) {
                var mapping = this._viewMechanismToSourceIdMapping;
                if (!mapping) {
                    var sourceIds = Platform.Instrumentation.InstrumentationEditorialSourceId;
                    var viewMech = U.viewMechanism;
                    var platformViewMech = Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism;
                    mapping = {};
                    mapping[platformViewMech.scroll] = sourceIds.scrollSwipe;
                    mapping[platformViewMech.link] = sourceIds.nextPrev;
                    mapping[viewMech.unknown] = -1;
                    mapping[viewMech.nextTouch] = sourceIds.nextTouch;
                    mapping[viewMech.nextClickKeyboard] = sourceIds.nextClickKeyboard;
                    mapping[viewMech.previousTouch] = sourceIds.previousTouch;
                    mapping[viewMech.previousClickKeyboard] = sourceIds.previousClickKeyboard;
                    mapping[viewMech.touchSwipe] = sourceIds.touchSwipe;
                    mapping[viewMech.mouseScroll] = sourceIds.mouseScroll;
                    mapping[viewMech.eoabNext] = sourceIds.eoabnext;
                    mapping[viewMech.eoabShare] = sourceIds.eoabshare;
                    mapping[viewMech.eoabSubscribe] = sourceIds.eoabsubscribe;
                    mapping[viewMech.eoabMoreFrom] = sourceIds.eoabmoreFrom;
                    mapping[viewMech.eoabOther] = sourceIds.eoabother;
                    this._viewMechanismToSourceIdMapping = mapping
                }
                return mapping[viewMechanism]
            }, _getNavMethod: function _getNavMethod(viewMechanism) {
                var mapping = this._viewMechanismToNavMethodMapping;
                if (!mapping) {
                    var navMethods = Microsoft.Bing.AppEx.Telemetry.ImpressionNavMethod;
                    var viewMech = U.viewMechanism;
                    var platformViewMech = Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism;
                    mapping = {};
                    mapping[platformViewMech.scroll] = navMethods.scrollSwipe;
                    mapping[platformViewMech.link] = navMethods.nextPrev;
                    mapping[viewMech.unknown] = "";
                    mapping[viewMech.nextTouch] = navMethods.nextTouch;
                    mapping[viewMech.nextClickKeyboard] = navMethods.nextClickKeyboard;
                    mapping[viewMech.previousTouch] = navMethods.previousTouch;
                    mapping[viewMech.previousClickKeyboard] = navMethods.previousClickKeyboard;
                    mapping[viewMech.touchSwipe] = navMethods.touchSwipe;
                    mapping[viewMech.mouseScroll] = navMethods.mouseScroll;
                    mapping[viewMech.eoabNext] = navMethods.eoabnext;
                    mapping[viewMech.eoabShare] = navMethods.eoabshare;
                    mapping[viewMech.eoabSubscribe] = navMethods.eoabsubscribe;
                    mapping[viewMech.eoabMoreFrom] = navMethods.eoabmoreFrom;
                    mapping[viewMech.eoabOther] = navMethods.eoabother;
                    mapping = mapping
                }
                return mapping[viewMechanism]
            }, _getTelemetryViewMechanism: function _getTelemetryViewMechanism(viewMechanism) {
                var mapping = this._viewMechanismTelemetryMapping;
                if (!mapping) {
                    var viewMech = U.viewMechanism;
                    var platformViewMech = Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism;
                    mapping = {};
                    mapping[platformViewMech.scroll] = platformViewMech.scroll;
                    mapping[platformViewMech.link] = platformViewMech.link;
                    mapping[viewMech.unknown] = platformViewMech.unknown;
                    mapping[viewMech.nextTouch] = platformViewMech.nextTouch;
                    mapping[viewMech.nextClickKeyboard] = platformViewMech.nextClickKeyboard;
                    mapping[viewMech.previousTouch] = platformViewMech.previousTouch;
                    mapping[viewMech.previousClickKeyboard] = platformViewMech.previousClickKeyboard;
                    mapping[viewMech.touchSwipe] = platformViewMech.touchSwipe;
                    mapping[viewMech.mouseScroll] = platformViewMech.mouseScroll;
                    mapping[viewMech.eoabNext] = platformViewMech.eoabnext;
                    mapping[viewMech.eoabShare] = platformViewMech.eoabshare;
                    mapping[viewMech.eoabSubscribe] = platformViewMech.eoabsubscribe;
                    mapping[viewMech.eoabMoreFrom] = platformViewMech.eoabmoreFrom;
                    mapping[viewMech.eoabOther] = platformViewMech.eoabother;
                    mapping = mapping
                }
                return mapping[viewMechanism]
            }, _updateStateForInstrumentation: function _updateStateForInstrumentation(viewMechanism) {
                var sourceId = this._getSourceID(viewMechanism);
                var navMethod = this._getNavMethod(viewMechanism);
                if (sourceId && navMethod) {
                    this._state.source = sourceId;
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(navMethod)
                }
            }, _updateContentforInstrumentation: function _updateContentforInstrumentation(content) {
                return WinJS.Promise.wrap(content)
            }, _getArticleViewAttributes: function _getArticleViewAttributes(impression, instrumentationData, content) {
                var state = this._state;
                var textAttributes = this._getCurrentTextAttributes();
                return WinJS.Promise.wrap({
                    TrailingMediaBlockCount: instrumentationData.trailingMediaBlockCount, Market: state.market, Source: U.convertSourceEnum(state.source), Page: state.page, EntryPoint: U.convertEntryPointEnum(state.entryPoint), TextSize: textAttributes.effective.size, TextStyle: textAttributes.effective.style, RenderType: instrumentationData.renderType, LoadTime: instrumentationData.loadTime, Author: content.author
                })
            }, _recordArticleView: function _recordArticleView(instrumentationData) {
                var navigator = PlatformJS.Navigation.mainNavigator;
                var isFirstView = this._isFirstView;
                var viewMechanism = instrumentationData.viewMechanism;
                this._updateStateForInstrumentation(viewMechanism);
                var impression = isFirstView ? navigator.getCurrentImpression() : navigator.replaceCurrentImpression(this.getPageImpressionContext());
                this._isFirstView = false;
                if (!impression) {
                    return WinJS.Promise.wrap(null)
                }
                else {
                    var that = this;
                    return this._updateContentforInstrumentation(instrumentationData.content).then(function _ArticleReaderPage_1029(content) {
                        var k = impression.addContent(content.sourceName, content.partnerCode, content.contentId, content.type, content.date, content.uri, content.slug, content.isSummary, content.worth, content.isAd, content.adCampaign);
                        impression.logContent(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal);
                        var state = that._state;
                        if (state.telemetry) {
                            state.telemetry.k = k
                        }
                        else {
                            state.telemetry = { k: k }
                        }
                        return content
                    }, function getContentErrorHandler(error) {
                        console.log(error)
                    }).then(this._getArticleViewAttributes.bind(this, impression, instrumentationData)).then(function articlereaderpage_updateviewattributes(viewAttributes) {
                        var viewJsonString = JSON.stringify(viewAttributes);
                        var progress = new Microsoft.Bing.AppEx.Telemetry.ContentViewProgress;
                        progress.pageCount = instrumentationData.pageCount;
                        impression.logContentViewWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, that._state.telemetry.k, that._getTelemetryViewMechanism(viewMechanism), true, progress, viewJsonString)
                    })
                }
            }, _getTelemetryAttributes: function _getTelemetryAttributes(attributes) {
                attributes = attributes || {};
                return WinJS.Promise.wrap(attributes)
            }, _dismissTopEdgy: function _dismissTopEdgy() {
                var elts = WinJS.Utilities.query("#platformNavigationBar");
                if (elts && elts.length === 1) {
                    var elt = elts[0];
                    if (elt) {
                        var topEdgy = elt.winControl;
                        if (topEdgy && topEdgy.hide) {
                            topEdgy.hide()
                        }
                    }
                }
            }, getPageState: function getPageState() {
                var state = this._state;
                var articleManager = this._articleManager;
                if (articleManager) {
                    var currentPageIndex = articleManager.currentPageIndex;
                    state.startPage = currentPageIndex
                }
                return state
            }, getPageData: function getPageData() {
                return WinJS.Promise.wrap({})
            }, getCurrentArticleMetadata: function getCurrentArticleMetadata() {
                if (this._articleManager) {
                    var metadata = this._articleManager.getCurrentArticleMetadata();
                    return metadata
                }
            }, onBindingComplete: function onBindingComplete() {
                this._initialize()
            }, isImmersive: true, _adEngageChanged: function _adEngageChanged(event) {
                this._isAdEngaged = event.detail;
                if (!this._isAdEngaged && this._needRedraw) {
                    this._needRedraw = !this._changeView()
                }
            }, _changeView: function _changeView() {
                var articleManager = this._articleManager;
                if (articleManager) {
                    this._updateDefaultTextSize(false);
                    articleManager.redraw();
                    return true
                }
                return false
            }, onWindowResize: function onWindowResize(event) {
                var detail = event.detail;
                if (detail && detail.hasOuterHeightChanged === false && detail.hasOuterWidthChanged === false && detail.hasOffsetWidthChanged === false && detail.hasOffsetHeightChanged === false) {
                    return
                }
                CommonJS.WindowEventManager.HandleWindowResizeEvent.call(this, event, function HandleWindowResize() {
                    if (!this._isAdEngaged) {
                        this._needRedraw = !this._changeView()
                    }
                    else {
                        this._needRedraw = true
                    }
                })
            }, handleShareRequest: function handleShareRequest(request) {
                var articleMetadata = this._articleManager.getCurrentArticleMetadata();
                this._handleArticleShareRequest(request, {
                    articleMetadata: articleMetadata, preferWebUrl: false
                })
            }, _handleArticleShareRequest: function _handleArticleShareRequest(request, options) {
                var pageState = this.getPageState();
                if (pageState.authProvider && pageState.authProvider.authInfo && typeof pageState.authProvider.authInfo.share === "string" && pageState.authProvider.authInfo.share.toLowerCase() === "disabled") {
                    return
                }
                if (pageState.enableSharing) {
                    var articleHeader = this._articleManager.getHeader();
                    if (articleHeader) {
                        var shareData = {
                            pageState: pageState, articleHeader: articleHeader, articleId: options.articleMetadata.articleId, articleType: options.articleMetadata.articleType, articleImageThumbnail: options.articleMetadata.thumbnailImageUrl, preferWebUrl: options.preferWebUrl
                        };
                        this._handleShareRequestImpl(request, shareData)
                    }
                }
            }, _handleShareRequestImpl: function _handleShareRequestImpl(request, shareData) {
                if (shareData && shareData.pageState && shareData.pageState.initialArticleId !== null && typeof shareData.pageState.initialArticleId !== "undefined") {
                    var sharingLink = this._formatShareWebLink(shareData);
                    var deepLink = this._formatDeepLink(shareData);
                    var uriText = sharingLink || deepLink;
                    if (uriText) {
                        var description = this._formatShareDescription(shareData);
                        request.data.properties.description = description;
                        request.data.properties.title = this._formatShareTitle(shareData);
                        if (sharingLink) {
                            request.data.setWebLink(new Windows.Foundation.Uri(sharingLink))
                        }
                        if (deepLink) {
                            request.data.setApplicationLink(new Windows.Foundation.Uri(deepLink))
                        }
                        var linkInMessage = sharingLink ? null : deepLink;
                        var shareText = this._formatShareText(shareData, description, linkInMessage);
                        if (shareText) {
                            request.data.setText(shareText)
                        }
                        var htmlText = this._formatShareHTML(shareData, linkInMessage);
                        var htmlFormat = Windows.ApplicationModel.DataTransfer.HtmlFormatHelper.createHtmlFormat(htmlText);
                        request.data.setHtmlFormat(htmlFormat);
                        this._telemetryRecordShare(uriText, shareData.pageState.telemetry ? shareData.pageState.telemetry.k : 0, "Article Reader")
                    }
                }
            }, _formatShareHTML: function _formatShareHTML(shareData, deepLink) {
                var message = this._getSharingLinkMessage(deepLink);
                var image = shareData.articleImageThumbnail ? shareData.articleImageThumbnail : null;
                var html = "<h2><b>" + shareData.articleHeader.headline + "</b></h2>" + (image ? "<img src='" + image + "'/>" : "") + "<p>" + shareData.articleHeader.author + "</p>" + "<p>" + shareData.articleHeader.publisherName + " - " + shareData.articleHeader.date + "</p>" + "<blockquote style=\"background-color:#f2efed\">" + shareData.articleHeader.snippet + "</blockquote>" + (message ? "<p>" + message + "</p>" : "");
                return html
            }, _getSharingLinkMessage: function _getSharingLinkMessage(appUri) {
                var message = null;
                if (appUri) {
                    var win8ShareText = PlatformJS.Services.resourceLoader.getString("/platform/win8Share");
                    var win8ShareLinkText = PlatformJS.Services.resourceLoader.getString("/platform/win8ShareLink");
                    var link = "<a href=\"" + appUri + "\">" + win8ShareLinkText.format(CommonJS.getAppName()) + "</a>";
                    message = win8ShareText.format(PlatformJS.Services.resourceLoader.getString("/platform/win8Brand"), PlatformJS.Services.resourceLoader.getString("/platform/winPhone8Brand"), link)
                }
                return message
            }, _formatShareDescription: function _formatShareDescription(shareData) {
                var publisherName = shareData.articleHeader.publisherName || "";
                var result = shareData.articleHeader.author ? (shareData.articleHeader.author + " | ") : "";
                if (publisherName && publisherName.length > 0) {
                    result += publisherName + " | "
                }
                result += shareData.articleHeader.date;
                return result
            }, _formatShareText: function _formatShareText(shareData, description, uri) {
                if (shareData && shareData.articleHeader && shareData.articleHeader.headline && shareData.articleHeader.snippet && description && uri) {
                    var result = shareData.articleHeader.headline + "\n" + description + "\n" + shareData.articleHeader.snippet;
                    if (uri) {
                        result += "\n" + uri
                    }
                    return result
                }
                return null
            }, _formatShareTitle: function _formatShareTitle(shareData) {
                try {
                    var bingAppName = this._formatBingAppName() || "";
                    var result = shareData.articleHeader.headline || "";
                    if (result.length === 0) {
                        result = bingAppName
                    }
                    else if (bingAppName.length > 0) {
                        result += " - " + bingAppName
                    }
                    return result
                }
                catch (err) { }
                return ""
            }, _formatBingAppName: function _formatBingAppName() {
                return PlatformJS.Services.resourceLoader.getString("/platform/brand") + " " + CommonJS.getAppName()
            }, _formatDeepLink: function _formatDeepLink(shareData) {
                if (shareData.articleId && shareData.pageState) {
                    try {
                        var uriBuilder = new Platform.Utilities.AppExUriBuilder;
                        uriBuilder.controllerId = "application";
                        uriBuilder.commandId = "view";
                        uriBuilder.queryParameters.insert("entitytype", "article");
                        var urlParts = shareData.articleId.split("/");
                        uriBuilder.queryParameters.insert("pageid", urlParts[0]);
                        if (urlParts.length === 2) {
                            uriBuilder.queryParameters.insert("contentid", urlParts[1])
                        }
                        else {
                            uriBuilder.queryParameters.insert("contentid", "")
                        }
                        if (shareData.pageState.market) {
                            uriBuilder.queryParameters.insert("market", shareData.pageState.market)
                        }
                        uriBuilder.queryParameters.insert("referrer", "share");
                        return uriBuilder.toString()
                    }
                    catch (err) { }
                }
                return null
            }, _formatShareWebLink: function _formatShareWebLink(shareData) {
                var sharingUrl = shareData.articleHeader && shareData.articleHeader.sharingUrl,
                    webUrl = shareData.articleHeader && shareData.articleHeader.webUrl,
                    sharingUrlExists = sharingUrl && typeof sharingUrl === "string",
                    webUrlExists = webUrl && typeof webUrl === "string";
                if ((shareData.preferWebUrl || !sharingUrlExists) && webUrlExists) {
                    return webUrl
                }
                if (!sharingUrlExists) {
                    return null
                }
                if (CommonJS.Utils.isUriUnderDomains(sharingUrl, CommonJS.ArticleReaderPage.microsoftDomains)) {
                    var params = {
                        a: {
                            value: this._getSharingAppParam(), overrideIfExists: true
                        }, m: {
                            value: encodeURIComponent((shareData.pageState && shareData.pageState.market) || ""), overrideIfExists: true
                        }
                    };
                    sharingUrl = CommonJS.Utils.appendUriParams(sharingUrl, params)
                }
                return sharingUrl
            }, _getSharingAppParam: function _getSharingAppParam() {
                return null
            }, _telemetryRecordShare: function _telemetryRecordShare(uri, k, shareSource) {
                if (uri) {
                    var impression = PlatformJS.Navigation.mainNavigator.getCurrentImpression();
                    this._getTelemetryAttributes().then(function articleReaderPage_logSharingActionTelemetry(attributes) {
                        if (impression) {
                            attributes.shareSource = shareSource;
                            attributes = JSON.stringify(attributes);
                            impression.logContentShareWithJsonAttributes(Microsoft.Bing.AppEx.Telemetry.LogLevel.normal, null, uri, k ? k : 0, attributes)
                        }
                    })
                }
            }
        }, {
            microsoftDomains: ["microsoft.com", "bing.com", "msn.com"], updateDebugIndicator: function updateDebugIndicator(textColumn1, textColumn2, textColumn3) {
                if (document) {
                    var indicator = document.querySelector(".debugIndicator");
                    if (!indicator) {
                        indicator = document.createElement("div");
                        indicator.className = "debugIndicator";
                        indicator.setAttribute("style", "height:20px;width:100%;z-index:100;font-weight:bold;font-family:segoe ui;top:0px;left:0px;position:absolute;pointer-events:none;float:right;");
                        indicator.style.color = "white";
                        indicator.style.backgroundColor = "rgba(255, 0, 0, 0.5)";
                        var spanTextColumn1 = document.createElement("span");
                        spanTextColumn1.className = "spanTextColumn1";
                        var spanTextColumn2 = document.createElement("span");
                        spanTextColumn2.className = "spanTextColumn2";
                        var spanTextColumn3 = document.createElement("span");
                        spanTextColumn3.className = "spanTextColumn3";
                        indicator.appendChild(spanTextColumn1);
                        indicator.appendChild(spanTextColumn2);
                        indicator.appendChild(spanTextColumn3);
                        var articleReaderPage = document.querySelector(".articleReaderPage");
                        if (articleReaderPage) {
                            articleReaderPage.appendChild(indicator)
                        }
                    }
                    var spanTextColumn1 = document.querySelector(".spanTextColumn1");
                    if (spanTextColumn1 && textColumn1) {
                        spanTextColumn1.innerText = textColumn1
                    }
                    var spanTextColumn2 = document.querySelector(".spanTextColumn2");
                    if (spanTextColumn2 && textColumn2) {
                        spanTextColumn2.innerText = " | " + textColumn2
                    }
                    var spanTextColumn3 = document.querySelector(".spanTextColumn3");
                    if (spanTextColumn3 && textColumn3) {
                        spanTextColumn3.innerText = " | " + textColumn3
                    }
                }
            }
        })
    })
})();
(function _WebViewArticleReaderPage_1() {
    "use strict";
    WinJS.Namespace.define("CommonJS", {
        WebViewArticleReaderPage: WinJS.Class.derive(CommonJS.ArticleReaderPage, function _WebViewArticleReaderPage_6(state) {
            state.providerConfiguration.clear();
            var oneWebPage = { articleInfos: [{ articleId: state.initialArticleId }] };
            state.providerConfiguration.insert("articleInfos", JSON.stringify(oneWebPage));
            CommonJS.ArticleReaderPage.call(this, state);
            this._startingLocationFragment = WinJS.Navigation.history.current.location.fragment
        }, {
            _openInBrowserButton: null, _openInBrowserButtonClickListener: null, dispose: function dispose() {
                var openInBrowserButton = this._openInBrowserButton,
                    openInBrowserButtonClickListener = this._openInBrowserButtonClickListener;
                if (openInBrowserButton && openInBrowserButtonClickListener) {
                    openInBrowserButton.removeEventListener("click", openInBrowserButtonClickListener);
                    this._openInBrowserButton = null;
                    this._openInBrowserButtonClickListener = null
                }
                CommonJS.ArticleReaderPage.prototype.dispose.call(this)
            }, goBack: function goBack() {
                if (WinJS.Navigation.history.current.location.fragment === this._startingLocationFragment) {
                    if (WinJS.Navigation.canGoBack) {
                        WinJS.Navigation.back()
                    }
                    else {
                        PlatformJS.Navigation.mainNavigator.resetApp(new Error("WebViewArticleReaderPage cant go back"))
                    }
                }
            }, _setupBottomEdgyOpenInBrowserButton: function _setupBottomEdgyOpenInBrowserButton(commands) {
                var openInBrowserElt = this._openInBrowserButton = document.createElement("button");
                var openInBrowserButton = new WinJS.UI.AppBarCommand(openInBrowserElt, {
                    icon: "\uE181", extraClass: "appexSymbol", label: PlatformJS.Services.resourceLoader.getString("/Platform/OpenInBrowser"), id: "openInBrowser"
                });
                var openInBrowserButtonClickListener = this._openInBrowserButtonClickListener = this._openInBrowser.bind(this);
                openInBrowserButton.addEventListener("click", openInBrowserButtonClickListener);
                commands.push(openInBrowserButton)
            }, _setupBottomEdgy: function _setupBottomEdgy() {
                var commands = [];
                this._setupBottomEdgyOpenInBrowserButton(commands);
                this._setupBottomEdgyHelpButton(commands);
                this._setupAppBar(commands)
            }, _handleShareRequestImpl: function _handleShareRequestImpl(request, shareData) {
                if (shareData && shareData.articleHeader) {
                    var webUriText = this._formatShareWebLink(shareData);
                    if (webUriText) {
                        request.data.setWebLink(new Windows.Foundation.Uri(webUriText));
                        request.data.properties.title = this._formatShareTitle(shareData);
                        request.data.properties.description = webUriText;
                        this._telemetryRecordShare(webUriText, shareData.pageState.telemetry ? shareData.pageState.telemetry.k : 0, "WebView Article")
                    }
                }
            }, _formatShareApplicationLink: function _formatShareApplicationLink(shareData) {
                return null
            }, _formatShareWebLink: function _formatShareWebLink(shareData) {
                if (shareData && shareData.articleHeader) {
                    return shareData.articleHeader.sharingUrl
                }
                return null
            }, _openInBrowser: function _openInBrowser() {
                var articleManager = this._articleManager;
                if (articleManager) {
                    var articleMetadata = articleManager.getCurrentArticleMetadata();
                    if (articleMetadata) {
                        var articleUrl = articleMetadata.articleId;
                        if (articleUrl) {
                            var uri = new Windows.Foundation.Uri(articleUrl);
                            Windows.System.Launcher.launchUriAsync(uri)
                        }
                    }
                }
            }
        })
    })
})();
(function _ArticleStore_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleStore: WinJS.Class.define(function _ArticleStore_12() {
            this._dataMap = {}
        }, {
            _dataMap: null, setData: function setData(articleId, data) {
                var dataMap = this._dataMap;
                var renderData = data.renderData || null;
                if (typeof renderData === "string") {
                    renderData = JSON.parse(renderData)
                }
                var newData = {
                    title: data.title, blocks: data.blocks, metadata: data.metadata, nextArticle: data.nextArticle, previousArticle: data.previousArticle, moreArticles: data.moreArticles, renderData: renderData, customRenderData: data.customRenderData, layouts: null
                };
                dataMap[articleId] = newData;
                var layouts = data.layouts || null;
                if (layouts) {
                    this._setLayouts(articleId, layouts, renderData.isClientGenerated ? null : renderData)
                }
            }, getData: function getData(articleId) {
                var dataMap = this._dataMap;
                var data = dataMap[articleId];
                return data
            }, addLayout: function addLayout(articleId, newLayout, renderData) {
                var dataMap = this._dataMap;
                var data = dataMap[articleId];
                var layouts = data.layouts;
                if (!layouts) {
                    layouts = [];
                    data.layouts = layouts
                }
                var newProperties = newLayout.properties;
                var index = this._getIndexByExactProperties(layouts, newProperties);
                if (index === -1) {
                    index = layouts.length;
                    layouts.push(newLayout)
                }
                else {
                    layouts[index] = newLayout
                }
                if (renderData) {
                    this._setRenderData(data, renderData, index)
                }
            }, _setLayouts: function _setLayouts(articleId, layouts, renderData) {
                if (typeof layouts === "string") {
                    layouts = JSON.parse(layouts)
                }
                for (var i = 0, len = layouts.length; i < len; i++) {
                    var layout = layouts[i];
                    this.addLayout(articleId, layout, renderData)
                }
            }, _setRenderData: function _setRenderData(data, renderData, index) {
                var customRenderData = data.customRenderData;
                if (!customRenderData) {
                    customRenderData = [];
                    data.customRenderData = customRenderData
                }
                if (index === -1) {
                    data.customRenderData.push(renderData)
                }
                else {
                    data.customRenderData[index] = renderData
                }
                data.renderData = renderData;
                data.blocks = null
            }, _getIndexByExactProperties: function _getIndexByExactProperties(list, properties) {
                for (var i = 0, len = list.length; i < len; i++) {
                    if (this._arePropertiesEqual(list[i].properties, properties)) {
                        return i
                    }
                }
                return -1
            }, _arePropertiesEqual: function _arePropertiesEqual(p1, p2) {
                var equal = false;
                if (p1 && p2) {
                    equal = true;
                    for (var k1 in p1) {
                        if (p1[k1] !== p2[k1]) {
                            equal = false;
                            break
                        }
                    }
                    for (var k2 in p2) {
                        if (p2[k2] !== p1[k2]) {
                            equal = false;
                            break
                        }
                    }
                }
                else if (!p1 && !p2) {
                    equal = true
                }
                else {
                    equal = false
                }
                return equal
            }
        })
    })
})();
(function _ArticleManager_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleManager: WinJS.Class.mix(WinJS.Class.define(function _ArticleManager_14(options) {
            this._provider = options.provider;
            this._bottomEdgy = options.bottomEdgy;
            this._articleStore = new CommonJS.ArticleReader.ArticleStore;
            this._disposed = false;
            this._dataReady = false;
            this._layoutPromise = WinJS.Promise.wrap(null);
            this._relayoutPromise = WinJS.Promise.wrap(null);
            this._cacheId = null;
            this._renderOptionsSeed = options.renderOptionsSeed;
            this._initialTextAttributes = options.initialTextAttributes;
            this._actionsHandlerType = options.actionsHandlerType;
            this._getPaywallProviderPromise = options.getPaywallProviderPromise;
            this._oldArticleId = null;
            this._lastArticleViewedEventTimerId = null;
            this._loadTimes = {};
            this._perfTrack = new PlatformJS.ModernPerfTrack;
            var orchestrator = this._articleOrchestrator = options.orchestrator;
            var swipeToUnrealizedArticleListener = this._swipeToUnrealizedArticleListener = this._swipeToUnrealizedArticle.bind(this);
            orchestrator.addEventListener("swipetounrealizedarticle", swipeToUnrealizedArticleListener);
            var nearUnrealizedArticleListener = this._nearUnrealizedArticleListener = this._nearUnrealizedArticle.bind(this);
            orchestrator.addEventListener("nearunrealizedarticle", nearUnrealizedArticleListener);
            var scrollToArticleListener = this._scrollToArticleListener = this._scrollToArticle.bind(this);
            orchestrator.addEventListener("scrolltoarticle", scrollToArticleListener);
            var nextArticleVisibilityListener = this._nextArticleVisibilityListener = this._nextArticleVisible.bind(this);
            orchestrator.addEventListener("nextarticlevisible", nextArticleVisibilityListener);
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articlechanged"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("nextarticlevisible"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleviewed"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleerror"))
        }, {
            _provider: null, _articleStore: null, _bottomEdgy: null, _disposed: null, _dataReady: null, _layoutPromise: null, _relayoutPromise: null, _setTextAttributesPromise: null, _cacheId: null, _articleOrchestrator: null, _renderOptionsSeed: null, _initialTextAttributes: null, _actionsHandlerType: null, _swipeToUnrealizedArticleListener: null, _nearUnrealizedArticleListener: null, _scrollToArticleListener: null, _nextArticleVisibilityListener: null, _oldArticleId: null, _lastArticleViewedEventTimerId: null, _loadTimes: null, _perfTrack: null, _setFocusOnArticle: function _setFocusOnArticle(articleId) {
                if (!articleId) {
                    return
                }
                var article = this._articleOrchestrator._articles[articleId];
                var containerElement = article && article.containerElement;
                if (containerElement) {
                    containerElement.focus()
                }
            }, cacheId: {
                set: function set(value) {
                    this._cacheId = value
                }
            }, currentArticleId: {
                get: function get() {
                    var currentClientArticleId = this.getCurrentClientArticleId();
                    var serverArticleId = this._getServerArticleId(currentClientArticleId);
                    return serverArticleId
                }
            }, previousArticleId: {
                get: function get() {
                    var previousClientArticleId = this._getPreviousArticleId();
                    var serverArticleId = this._getServerArticleId(previousClientArticleId);
                    return serverArticleId
                }
            }, currentPageIndex: {
                get: function get() {
                    var pageIndex = 0;
                    var orchestrator = this._articleOrchestrator;
                    if (orchestrator) {
                        pageIndex = orchestrator.currentPageIndex
                    }
                    return pageIndex
                }
            }, getCurrentArticleMetadata: function getCurrentArticleMetadata() {
                var articleId = this.getCurrentClientArticleId();
                return this.getArticleMetadata(articleId)
            }, getArticleMetadata: function getArticleMetadata(articleId) {
                var articleStore = this._articleStore;
                var currentArticleData = articleStore.getData(articleId);
                var result = null;
                var serverArticleId;
                var free;
                var instrumentationId;
                var isAd = false;
                var articleType;
                var webUrl;
                var thumbnailImageUrl = null;
                if (currentArticleData) {
                    serverArticleId = this._getServerArticleId(articleId);
                    var title = currentArticleData.title;
                    if (title) {
                        free = title.free;
                        if (free === null || free === undefined) {
                            free = true
                        }
                        if (title.titleImage && title.titleImage.image) {
                            var images = title.titleImage.image.images;
                            if (images) {
                                for (var i = 1; i < images.length; i++) {
                                    var image = images[i];
                                    if (image.width <= 200 && image.height <= 200) {
                                        thumbnailImageUrl = image.url;
                                        break
                                    }
                                }
                            }
                        }
                    }
                    var metadata = currentArticleData.metadata;
                    if (metadata) {
                        instrumentationId = metadata.instrumentationId;
                        isAd = !!currentArticleData.metadata.adMetadata;
                        articleType = metadata.articleType;
                        webUrl = metadata.webUrl
                    }
                }
                result = {
                    articleId: serverArticleId, free: free, instrumentationId: instrumentationId, isAd: isAd, articleType: articleType, webUrl: webUrl, thumbnailImageUrl: thumbnailImageUrl
                };
                return result
            }, getCurrentClientArticleId: function getCurrentClientArticleId() {
                var articleId;
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    articleId = orchestrator.currentArticleId
                }
                return articleId
            }, gotoArticle: function gotoArticle(articleId, navigateOptions, viewMechanism, removeAllArticlesOnError) {
                var that = this;
                this._articleOrchestrator.currentScrollSwipeMethod = viewMechanism;
                var promise = this._fetchAndRender(articleId, navigateOptions, 0, false, this.gotoArticle.bind(this, articleId, navigateOptions, viewMechanism, removeAllArticlesOnError), removeAllArticlesOnError);
                promise.then(function _ArticleManager_254() {
                    that._updateArticlePointers(viewMechanism);
                    if (that._getPreviousArticleId()) {
                        that._setFocusOnArticle(articleId)
                    }
                });
                return promise
            }, nextArticle: function nextArticle() {
                var that = this;
                var promise = this._nextArticle(1, this._currentArticle.bind(this));
                promise.then(function _ArticleManager_276() {
                    that._updateArticlePointers(Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.link);
                    that._setFocusOnArticle(that.getCurrentClientArticleId())
                });
                return promise
            }, previousArticle: function previousArticle() {
                var that = this;
                var promise = this._nextArticle(2, this._currentArticle.bind(this));
                promise.then(function _ArticleManager_295() {
                    that._updateArticlePointers(Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.link);
                    if (that._getPreviousArticleId()) {
                        that._setFocusOnArticle(that.getCurrentClientArticleId())
                    }
                });
                return promise
            }, dispose: function dispose() {
                if (this._lastArticleViewedEventTimerId) {
                    clearTimeout(this._lastArticleViewedEventTimerId)
                }
                if (this._setTextAttributesPromise) {
                    this._setTextAttributesPromise.cancel();
                    this._setTextAttributesPromise = null
                }
                if (this._layoutPromise) {
                    this._layoutPromise.cancel();
                    this._layoutPromise = null;
                    this._relayoutPromise = null
                }
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    orchestrator.removeEventListener("swipetounrealizedarticle", this._swipeToUnrealizedArticleListener);
                    orchestrator.removeEventListener("nearunrealizedarticle", this._nearUnrealizedArticleListener);
                    orchestrator.removeEventListener("scrolltoarticle", this._scrollToArticleListener);
                    orchestrator.removeEventListener("nextarticlevisible", this._nextArticleVisibilityListener);
                    orchestrator.dispose();
                    this._articleOrchestrator = null
                }
                this._provider = null;
                this._disposed = true
            }, redraw: function redraw() {
                if (this._dataReady) {
                    msWriteProfilerMark("CommonControls:ArticleReader:Redraw:s");
                    var relayoutPromise = this._relayoutPromise;
                    if (relayoutPromise) {
                        relayoutPromise.cancel()
                    }
                    var layoutPromise = this._layoutPromise;
                    this._layoutPromise = this._relayoutPromise = layoutPromise.then(this._relayout.bind(this), function _ArticleManager_359(err) {
                        console.error(err.message)
                    }).then(function _ArticleManager_362() {
                        msWriteProfilerMark("CommonControls:ArticleReader:Redraw:e")
                    }, function _ArticleManager_364(err) {
                        console.error(err.message)
                    })
                }
            }, getHeader: function getHeader(articleId) {
                var header;
                var orchestrator = this._articleOrchestrator;
                if (orchestrator && !orchestrator.isErrorVisible) {
                    header = orchestrator.getHeader(articleId)
                }
                return header
            }, setTextAttributes: function setTextAttributes(textAttributes, relayout) {
                if (this._setTextAttributesPromise) {
                    this._setTextAttributesPromise.cancel();
                    this._setTextAttributesPromise = null
                }
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    var promise;
                    if (relayout) {
                        promise = orchestrator.setTextAttributesAndRelayout(textAttributes)
                    }
                    else {
                        promise = orchestrator.setTextAttributes(textAttributes)
                    }
                    this._setTextAttributesPromise = promise.then(this._addAdditionalData.bind(this))
                }
                this._initialTextAttributes = textAttributes
            }, _getServerArticleId: function _getServerArticleId(articleId) {
                var serverArticleId = articleId;
                var provider = this._provider;
                if (articleId !== null && articleId !== undefined && !isNaN(articleId) && provider && provider.getServerArticleId) {
                    try {
                        serverArticleId = provider.getServerArticleId(articleId)
                    }
                    catch (ex) {
                        if (PlatformJS.isDebug) {
                            debugger;
                            throw ex;
                        }
                    }
                }
                return serverArticleId
            }, _relayout: function _relayout() {
                return this._articleOrchestrator.relayout().then(this._addAdditionalData.bind(this))
            }, _isRenderable: function _isRenderable(data) {
                return !!data.renderData
            }, _renderData: function _renderData(articleId, data, navigateOptions, preRender) {
                if (this._disposed) {
                    return WinJS.Promise.wrap(null)
                }
                ;
                if (this._disposed) {
                    return
                }
                var cacheId = this._cacheId;
                var initialTextAttributes = this._initialTextAttributes;
                var actionsHandlerType = this._actionsHandlerType;
                var renderPromise;
                var renderOptions;
                var renderOptionsSeed = this._renderOptionsSeed;
                var orchestrator = this._articleOrchestrator;
                var articleStore = this._articleStore;
                renderOptions = {
                    cacheId: cacheId, initialTextAttributes: initialTextAttributes, actionsHandlerType: actionsHandlerType, contentCssPaths: renderOptionsSeed.contentCssPaths, getPaywallProviderPromise: this._getPaywallProviderPromise, renderAll: renderOptionsSeed.renderAll, adGroups: renderOptionsSeed.adGroups, noSlideshow: renderOptionsSeed.noSlideshow, adPartnerName: renderOptionsSeed.adPartnerName, hidePageNumbers: renderOptionsSeed.hidePageNumbers, allowLoneEndAd: renderOptionsSeed.allowLoneEndAd, isPaginated: renderOptionsSeed.isPaginated, disableTextSelection: renderOptionsSeed.disableTextSelection, hideInlineAds: false, gotoArticleDelegate: this.gotoArticle.bind(this), isPaywallCardEnabled: renderOptionsSeed.isPaywallCardEnabled, showGrowlTextWithoutPaywallCard: renderOptionsSeed.showGrowlTextWithoutPaywallCard, extraPaywallConfiguration: renderOptionsSeed.extraPaywallConfiguration, paywallGrowlMessageFunction: renderOptionsSeed.paywallGrowlMessageFunction
                };
                if (data) {
                    var serverArticleId = this._getServerArticleId(articleId);
                    if (serverArticleId) {
                        data.serverArticleId = serverArticleId
                    }
                }
                renderPromise = orchestrator.render(articleId, data, renderOptions, navigateOptions, preRender).then(this._addAdditionalData.bind(this, articleId));
                return renderPromise || WinJS.Promise.wrap(null)
            }, _fetchAndRender: function _fetchAndRender(articleId, navigateOptions, direction, preRender, errorCallback, removeAllArticlesOnError) {
                var that = this;
                if (CommonJS.Error.errorExists() && !preRender) {
                    this._removeError()
                }
                if (this._disposed) {
                    return WinJS.Promise.wrap(null)
                }
                var provider = this._provider;
                var orchestrator = this._articleOrchestrator;
                orchestrator.progress(articleId, preRender, "start");
                var isRendered = orchestrator.isArticleRendered(articleId);
                var articleStore = this._articleStore;
                this._dataReady = false;
                var renderedCacheData = false;
                if (!isRendered) {
                    this._perfMarker("start", articleId, preRender);
                    this._perfMarker("start-network", articleId, preRender)
                }
                var dataPromise;
                if (PlatformJS.isDebug && CommonJS.ArticleReader.ArticleManager.debugArticleData) {
                    dataPromise = WinJS.Promise.wrap(CommonJS.ArticleReader.ArticleManager.debugArticleData);
                    this._dataReady = true
                }
                else {
                    var data = articleStore.getData(articleId);
                    if (data) {
                        this._dataReady = true;
                        dataPromise = WinJS.Promise.wrap(data)
                    }
                    else {
                        dataPromise = provider.getArticleAsync(articleId)
                    }
                }
                return dataPromise.then(function _fetchAndRender_dataPromiseSucceeded(articleData) {
                    if (that._disposed) {
                        return WinJS.Promise.wrap(null)
                    }
                    orchestrator.progress(articleId, preRender, "datacomplete");
                    that._dataReady = true;
                    if (!renderedCacheData) {
                        articleStore.setData(articleId, articleData);
                        articleData = articleStore.getData(articleId);
                        if (!isRendered) {
                            that._perfMarker("end-network", articleId, preRender);
                            that._perfMarker("start-render", articleId, preRender)
                        }
                        that._layoutPromise = that._layoutPromise.then(that._renderData.bind(that, articleId, articleData, navigateOptions, preRender))
                    }
                    return that._layoutPromise
                }, null, function _fetchAndRender_dataPromiseProgress(cachedData) {
                    if (that._disposed) {
                        return
                    }
                    that._dataReady = true;
                    articleStore.setData(articleId, cachedData);
                    cachedData = articleStore.getData(articleId);
                    renderedCacheData = true;
                    if (!isRendered) {
                        that._perfMarker("end-network", articleId, preRender);
                        that._perfMarker("start-render", articleId, preRender)
                    }
                    that._layoutPromise = that._layoutPromise.then(that._renderData.bind(that, articleId, cachedData, navigateOptions, preRender))
                }).then(function _fetchAndRender_dataPromiseComplete() {
                    if (that._disposed) {
                        return
                    }
                    orchestrator.progress(articleId, preRender, "rendercomplete");
                    if (!isRendered) {
                        that._perfMarker("end-render", articleId, preRender);
                        that._perfMarker("end", articleId, preRender)
                    }
                }, function _fetchAndRender_dataPromiseError(err) {
                    if (!isRendered) {
                        that._perfMarker("end-network", articleId, preRender);
                        that._perfMarker("end-render", articleId, preRender);
                        that._perfMarker("error", articleId, preRender)
                    }
                    var bottomEdgy = that._bottomEdgy;
                    if (!that._disposed) {
                        orchestrator.progress(articleId, preRender, "error");
                        if (!preRender) {
                            if (direction === 1) {
                                bottomEdgy.nextButton.disabled = true;
                                bottomEdgy.previousButton.disabled = false
                            }
                            else if (direction === 2) {
                                bottomEdgy.nextButton.disabled = false;
                                bottomEdgy.previousButton.disabled = true
                            }
                            if (removeAllArticlesOnError) {
                                that._articleOrchestrator.removeAllArticles()
                            }
                            that._handleError(articleId, err, errorCallback)
                        }
                    }
                })
            }, _perfMarker: function _perfMarker(state, articleId, preRender) {
                var loadTimes = this._loadTimes;
                var now = performance.now();
                var perfTrack = this._perfTrack;
                var scenarioId = PlatformJS.perfTrackScenario_PageLoaded;
                var scenarioName = "Page Load";
                var matchKey = preRender ? "ArticleRenderOffScreen" : "ArticleRenderOnScreen";
                switch (state) {
                    case "start":
                        perfTrack.writeStartEvent(scenarioId, scenarioName, matchKey);
                        loadTimes[articleId] = {
                            start: now, duration: -1
                        };
                        break;
                    case "end":
                    case "error":
                        perfTrack.writeStopEventWithMetadata(scenarioId, scenarioName, matchKey, true);
                        var loadTime = loadTimes[articleId];
                        if (loadTime) {
                            var start = loadTime.start;
                            loadTime.duration = now - start
                        }
                        break;
                    case "start-network":
                        msWriteProfilerMark("CommonControls:ArticleReader:network:s");
                        break;
                    case "end-network":
                        msWriteProfilerMark("CommonControls:ArticleReader:network:e");
                        break;
                    case "start-render":
                        msWriteProfilerMark("CommonControls:ArticleReader:render:s");
                        break;
                    case "end-render":
                        msWriteProfilerMark("CommonControls:ArticleReader:render:e");
                        break
                }
            }, _currentArticle: function _currentArticle() {
                var that = this;
                var promise = this._nextArticle(0, this._currentArticle.bind(this));
                promise.then(function _ArticleManager_672() {
                    that._updateArticlePointers()
                });
                return promise
            }, _nextArticle: function _nextArticle(direction, errorCallback) {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                var nextArticleId = this._getNextArticleId();
                var previousArticleId = this._getPreviousArticleId();
                var currentArticleId = this.getCurrentClientArticleId();
                if (direction === 1 && nextArticleId) {
                    promise = that._fetchAndRender(nextArticleId, -1, direction, false, errorCallback)
                }
                else if (direction === 2 && (previousArticleId !== null || previousArticleId !== undefined)) {
                    promise = that._fetchAndRender(previousArticleId, -1, direction, false, errorCallback)
                }
                else if (direction === 0 && currentArticleId) {
                    promise = that._fetchAndRender(currentArticleId, -1, direction, false, errorCallback)
                }
                return promise
            }, _updateArticlePointers: function _updateArticlePointers(viewMechanism) {
                var currentArticleId = this.getCurrentClientArticleId();
                var articleStore = this._articleStore;
                var data = articleStore.getData(currentArticleId);
                if (data) {
                    var next = this._getNextArticleId();
                    var previous = this._getPreviousArticleId();
                    var bottomEdgy = this._bottomEdgy;
                    var nextDisabled = !next;
                    var previousDisabled = (previous === null || previous === undefined);
                    bottomEdgy.nextButton.disabled = nextDisabled;
                    bottomEdgy.previousButton.disabled = previousDisabled;
                    if (!next && previousDisabled && bottomEdgy.appBar.hidden) {
                        bottomEdgy.previousButton.hidden = true;
                        bottomEdgy.nextButton.hidden = true
                    }
                }
                if (this._oldArticleId !== currentArticleId) {
                    this._oldArticleId = currentArticleId;
                    var detail = this._getEventDetail(currentArticleId, viewMechanism);
                    this.dispatchEvent("articlechanged", detail);
                    this._articleBecameViewable(currentArticleId, viewMechanism)
                }
            }, _swipeToUnrealizedArticle: function _swipeToUnrealizedArticle(event) {
                var articleId = event.detail;
                var viewMechanism = this._articleOrchestrator.currentScrollSwipeMethod;
                var unknownViewMechanism = CommonJS.ArticleReader.ArticleReaderUtils.viewMechanism.unknown;
                this.gotoArticle(articleId, null, (viewMechanism && viewMechanism !== unknownViewMechanism) ? viewMechanism : Microsoft.Bing.AppEx.Telemetry.ContentViewMechanism.scroll, false)
            }, _nearUnrealizedArticle: function _nearUnrealizedArticle(event) {
                var that = this;
                var articleId = event.detail;
                return this._fetchAndRender(articleId, null, 0, true, that.gotoArticle.bind(that, articleId, null)).then(function _ArticleManager_749() { }, function _ArticleManager_751(err) { })
            }, _scrollToArticle: function _scrollToArticle(event) {
                this._updateArticlePointers(this._articleOrchestrator.currentScrollSwipeMethod)
            }, _nextArticleVisible: function _nextArticleVisible(event) {
                this.dispatchEvent("nextarticlevisible", event)
            }, _articleBecameViewable: function _articleBecameViewable(articleId, viewMechanism) {
                var currentArticleId = this.getCurrentClientArticleId();
                var that = this;
                if (currentArticleId === articleId) {
                    var detail = this._getEventDetail(articleId, viewMechanism);
                    this.dispatchEvent("articleviewed", detail)
                }
            }, _getEventDetail: function _getEventDetail(articleId, viewMechanism) {
                var orchestrator = this._articleOrchestrator;
                var instrumentationData = orchestrator.getInstrumentationData(articleId);
                var serverArticleId = this._getServerArticleId(articleId) || "undefined";
                var loadTimes = this._loadTimes;
                var loadTime = loadTimes[articleId];
                if (instrumentationData) {
                    instrumentationData.content.contentId = serverArticleId;
                    instrumentationData.viewMechanism = viewMechanism;
                    instrumentationData.loadTime = loadTime ? loadTime.duration : -1
                }
                var detail = {
                    articleId: serverArticleId, clientArticleId: articleId, instrumentationData: instrumentationData
                };
                return detail
            }, _removeError: function _removeError() {
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    orchestrator.removeArticleError()
                }
            }, _showError: function _showError(articleId, errorCode, errorCallback) {
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    orchestrator.showArticleError(articleId, errorCode, errorCallback)
                }
            }, _getNextArticleId: function _getNextArticleId() {
                var articleId = null;
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    articleId = orchestrator.nextArticleId
                }
                return articleId
            }, _getPreviousArticleId: function _getPreviousArticleId() {
                var articleId = null;
                var orchestrator = this._articleOrchestrator;
                if (orchestrator) {
                    articleId = orchestrator.previousArticleId
                }
                return articleId
            }, _addAdditionalData: function _addAdditionalData(articleId) {
                if (this._disposed) {
                    return
                }
                var orchestrator = this._articleOrchestrator;
                articleId = articleId || this.getCurrentClientArticleId();
                var articleStore = this._articleStore;
                var renderData = orchestrator.getRenderData(articleId);
                if (renderData) {
                    renderData.isClientGenerated = true
                }
                var layout = orchestrator.getLayout(articleId);
                if (layout) {
                    layout.isClientGenerated = true
                }
                if (renderData && layout) {
                    articleStore.addLayout(articleId, layout, renderData)
                }
            }, _handleError: function _handleError(articleId, error, errorCallback) {
                if (!PlatformJS.Utilities.isPromiseCanceled(error)) {
                    var code = PlatformJS.Utilities.getPlatformErrorCode(error);
                    var errorCode = PlatformJS.Utilities.checkOfflineErrorCode(code);
                    this.dispatchEvent("articleerror", error);
                    this._showError(articleId, errorCode, errorCallback);
                    this._articleOrchestrator.scrollToArticle(articleId)
                }
            }
        }), WinJS.Utilities.eventMixin)
    })
})();
(function _ContentFrameManager_7() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    var EventNS = CommonJS.WindowEventManager;
    var convertToStaticHTML = CommonJS.Utils.toStaticHTMLWithSelfClosingTags;
    var _specialCharacterReplacePrefix = "<span class='hiddenContentSpan'></span>";
    var _specialCharacters = [{
        regex: /[\u3000]/g, replace: _specialCharacterReplacePrefix + String.fromCharCode(12288)
    }, {
        regex: /[\u2028]/g, replace: _specialCharacterReplacePrefix + String.fromCharCode(8232)
    }];
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ContentFrameManager: WinJS.Class.define(function _ContentFrameManager_29(options) {
            this._contentFrame = options.contentFrame;
            this._clickListener = null;
            this._pointerUpListener = null;
            this._actionsHandlerType = null;
            this._articleMetadata = null;
            this._articleHeader = null;
            this._market = options.market;
            this._eventManager = EventNS.getInstance()
        }, {
            _contentFrame: null, _clickListener: null, _pointerUpListener: null, _keydownListener: null, _actionsHandlerType: null, _articleMetadata: null, _articleHeader: null, _market: null, _eventManager: null, _contentDocument: null, dispose: function dispose() {
                var contentDocument = this._contentDocument;
                if (contentDocument) {
                    if (this._clickListener) {
                        contentDocument.removeEventListener("click", this._clickListener);
                        this._clickListener = null
                    }
                    if (this._pointerUpListener) {
                        contentDocument.removeEventListener("MSPointerUp", this._pointerUpListener, false);
                        this._pointerUpListener = null
                    }
                    if (this._keydownListener) {
                        contentDocument.removeEventListener("keydown", this._keydownListener);
                        this._keydownListener = null
                    }
                    this._contentDocument = null
                }
                if (this._eventManager) {
                    this._eventManager = null
                }
                this._articleMetadata = null;
                this._articleHeader = null;
                this._contentFrame = null
            }, setup: function setup(initialTextAttributes, flowId, contentCssPaths, actionsHandlerType, articleHeader, articleMetadata, disableTextSelection) {
                var contentDocument = this._contentDocument = this.getContentDocument();
                if (contentDocument) {
                    var contentFrame = this._contentFrame;
                    contentFrame.style.msFlowInto = flowId;
                    contentDocument.open();
                    contentDocument.close();
                    var defaultCssPath = CommonJS.ArticleReader.ContentFrameManager.defaultCssPath;
                    var cssFiles = [].concat([defaultCssPath], contentCssPaths);
                    this._addCssFilesToDocument(contentDocument, cssFiles);
                    var market = this._market;
                    if (!market) {
                        market = document.getElementsByTagName("HTML")[0].lang
                    }
                    if (market) {
                        contentDocument.getElementsByTagName("HTML")[0].lang = PlatformJS.Utilities.convertMarketToLanguageCode(market)
                    }
                    var clickListener = this._clickListener = this._onContentClick.bind(this);
                    contentDocument.addEventListener("click", clickListener);
                    var pointerUpListener = this._pointerUpListener = this._onContentMSPointerUp.bind(this);
                    contentDocument.addEventListener("MSPointerUp", pointerUpListener, false);
                    var keydownListener = this._keydownListener = this._onKeydown.bind(this);
                    contentDocument.addEventListener("keydown", keydownListener);
                    this.setTextAttributes(initialTextAttributes);
                    var body = contentDocument.getElementsByTagName("BODY")[0];
                    if (body && disableTextSelection) {
                        WinJS.Utilities.addClass(body, "noSelection")
                    }
                    this._actionsHandlerType = actionsHandlerType;
                    this._articleHeader = articleHeader;
                    this._articleMetadata = articleMetadata
                }
            }, addContent: function addContent(content) {
                var contentDocument = this._contentDocument || this.getContentDocument();
                if (contentDocument) {
                    var contentFrame = this._contentFrame;
                    var root = contentDocument.body;
                    if (content && root) {
                        if (!root.childNodes.length) {
                            var fixedContent = content;
                            for (var i = 0, iLen = _specialCharacters.length; i < iLen; i++) {
                                var replacement = _specialCharacters[i];
                                fixedContent = fixedContent.replace(replacement.regex, replacement.replace)
                            }
                            WinJS.Utilities.setInnerHTML(root, convertToStaticHTML(fixedContent))
                        }
                        else {
                            var temp = document.createElement("div");
                            WinJS.Utilities.setInnerHTML(temp, convertToStaticHTML(content));
                            var frag = contentDocument.createDocumentFragment();
                            var nodes = temp.childNodes;
                            while (nodes && nodes.length) {
                                frag.appendChild(nodes[0])
                            }
                            root.appendChild(frag)
                        }
                    }
                }
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                var contentDocument = this._contentDocument || this.getContentDocument();
                if (contentDocument) {
                    var root = contentDocument.body;
                    if (root) {
                        var size = textAttributes.size;
                        var style = textAttributes.style;
                        root.setAttribute("data-text-size", size);
                        root.setAttribute("data-text-style", style)
                    }
                }
            }, getContentDocument: function getContentDocument() {
                var contentDocument = null;
                var contentFrame = this._contentFrame;
                try {
                    if (contentFrame && contentFrame.contentWindow) {
                        contentDocument = contentFrame.contentWindow.document
                    }
                }
                catch (ex) { }
                return contentDocument
            }, _addCssFilesToDocument: function _addCssFilesToDocument(doc, cssFiles) {
                for (var i = 0, len = cssFiles.length; i < len; i++) {
                    var link = doc.createElement("link");
                    link.setAttribute("href", cssFiles[i]);
                    link.setAttribute("rel", "stylesheet");
                    doc.getElementsByTagName("HEAD")[0].appendChild(link)
                }
            }, _onContentClick: function _onContentClick(evt) {
                var elt = evt.srcElement;
                while (elt) {
                    if (elt.tagName === "A" || elt.tagName === "BUTTON") {
                        var actionKey = elt.getAttribute("data-action-key");
                        if (actionKey) {
                            var actionsHandlerType = this._actionsHandlerType;
                            if (actionsHandlerType) {
                                var actionsHandler = PlatformJS.Utilities.createObject(actionsHandlerType);
                                if (actionsHandler && actionsHandler.onActionInvoked) {
                                    var actionOptions = elt.getAttribute("data-action-options");
                                    var newEvent = {
                                        originalEvent: evt, data: {
                                            actionKey: actionKey, actionOptions: actionOptions, articleMetadata: this._articleMetadata, articleHeader: this._articleHeader
                                        }
                                    };
                                    actionsHandler.onActionInvoked(newEvent)
                                }
                            }
                            evt.preventDefault();
                            evt.stopPropagation()
                        }
                        else if (elt.tagName === "A") {
                            ARUtils.logUserAction(ARUtils.actionContext.body, "Link", null, { URL: elt.href });
                            elt.setAttribute("target", "_blank")
                        }
                        break
                    }
                    elt = elt.parentElement
                }
            }, _onContentMSPointerUp: function _onContentMSPointerUp(event) {
                switch (event.button) {
                    case 3:
                        if (WinJS.Navigation.canGoBack) {
                            WinJS.Navigation.back()
                        }
                        break;
                    case 4:
                        if (WinJS.Navigation.canGoForward) {
                            WinJS.Navigation.forward()
                        }
                        break
                }
            }, _onKeydown: function _onKeydown(event) {
                if (event.keyCode === WinJS.Utilities.Key.backspace && this._eventManager) {
                    this._eventManager.dispatchEvent(EventNS.Events.KEY_DOWN, event)
                }
            }
        }, { defaultCssPath: "/common/ArticleReader/css/Content.css" })
    })
})();
(function _Footer_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        Footer: WinJS.Class.define(function _Footer_13(elt, options) {
            elt = this.elt = elt ? elt : document.createElement("div");
            elt.winControl = this;
            WinJS.Utilities.addClass(elt, "footer");
            var hidePageNumbers = options.hidePageNumbers;
            if (!hidePageNumbers) {
                var pageNumberContainerElt = this._pageNumberContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(pageNumberContainerElt, "pageNumberContainer");
                elt.appendChild(pageNumberContainerElt);
                var pageNumberString = options.pageNumberString;
                var pageNumberElt = document.createElement("div");
                var pageNumber = this._pageNumber = new CommonJS.ArticleReader.PageNumber(pageNumberElt, { pageNumberString: pageNumberString });
                pageNumberContainerElt.appendChild(pageNumberElt)
            }
        }, {
            _pageNumber: null, _pageNumberContainerElt: null, pageNumberString: {
                set: function set(value) {
                    var pageNumber = this._pageNumber;
                    if (pageNumber) {
                        pageNumber.pageNumberString = value
                    }
                }
            }, pageNumberVisible: {
                set: function set(value) {
                    if (this._pageNumberContainerElt) {
                        this._pageNumberContainerElt.style.visibility = (value ? "visible" : "hidden")
                    }
                }
            }
        })
    })
})();
(function _HeaderStyle1Renderer_1() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        HeaderStyle1Renderer: {
            render: function render(context) {
                var renderableTitle = context.renderData.renderableTitle;
                var headerBlock = document.createElement("div");
                WinJS.Utilities.addClass(headerBlock, "ARHeaderBlock");
                var titleContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(titleContainerElt, "headerTitleContainer");
                headerBlock.appendChild(titleContainerElt);
                var titleElt = document.createElement("div");
                WinJS.Utilities.addClass(titleElt, "headerTitle");
                titleElt.innerText = renderableTitle.headline;
                titleContainerElt.appendChild(titleElt);
                return headerBlock
            }, height: 80, minWidth: 400
        }
    })
})();
(function _HeaderStyle2Renderer_1() {
    "use strict";
    var ARUtils = CommonJS.ArticleReader.ArticleReaderUtils;
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        HeaderStyle2Renderer: {
            render: function render(context, options) {
                var articleHeader = context.auxiliaryData.articleHeader;
                var categoryName = articleHeader.categoryName;
                var logoURL = articleHeader.logoURL;
                var headerBlock = document.createElement("div");
                WinJS.Utilities.addClass(headerBlock, "ARHeaderBlock");
                var logoBlockElt = document.createElement("div");
                WinJS.Utilities.addClass(logoBlockElt, "imageBlock");
                var logoElement = document.createElement("img");
                logoElement.src = logoURL;
                logoBlockElt.appendChild(logoElement);
                headerBlock.appendChild(logoBlockElt);
                var titleContainerElt = document.createElement("div");
                WinJS.Utilities.addClass(titleContainerElt, "headerTitleContainer");
                headerBlock.appendChild(titleContainerElt);
                var titleElt = document.createElement("div");
                WinJS.Utilities.addClass(titleElt, "headerTitle");
                titleElt.innerText = categoryName.toUpperCase();
                titleContainerElt.appendChild(titleElt);
                headerBlock.appendChild(options.pageNumberElt);
                var borderBlock = document.createElement("div");
                WinJS.Utilities.addClass(borderBlock, "TitleBorderContainer");
                headerBlock.appendChild(borderBlock);
                return headerBlock
            }, height: 120, minWidth: 550
        }
    })
})();
(function _Header_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        Header: WinJS.Class.define(function _Header_12(elt, options) {
            elt = this.elt = elt ? elt : document.createElement("div");
            elt.winControl = this;
            elt.innerHTML = "";
            this._context = options.context;
            var auxiliaryData = this._context.auxiliaryData;
            var style = auxiliaryData.articleHeader.style;
            var headerRenderer = this._renderer = CommonJS.ArticleReader.HeaderFactory.getRenderer(style);
            var pageNumberContainerElt = document.createElement("div");
            WinJS.Utilities.addClass(pageNumberContainerElt, "pageNumberContainer");
            var pageNumberString = "";
            var pageNumberElt = document.createElement("div");
            this._pageNumber = new CommonJS.ArticleReader.PageNumber(pageNumberElt, { pageNumberString: pageNumberString });
            pageNumberContainerElt.appendChild(pageNumberElt);
            if (headerRenderer) {
                var headerBlock = headerRenderer.render(this._context, { pageNumberElt: pageNumberContainerElt });
                elt.appendChild(headerBlock)
            }
        }, {
            _context: null, _pageNumber: null, _renderer: null, pageNumberString: {
                set: function set(value) {
                    var pageNumber = this._pageNumber;
                    if (pageNumber) {
                        pageNumber.pageNumberString = value
                    }
                }
            }, setColumnSpan: function setColumnSpan(columnSpan, context) {
                var renderer = this._renderer;
                var minWidth = renderer ? renderer.minWidth : 0;
                var gridOptions = context.gridOptions;
                var width = columnSpan > 0 ? CommonJS.ArticleReader.ArticleReaderUtils.convertColumnCountToWidth((columnSpan - 1) / 2, gridOptions) : 0;
                if (width >= minWidth) {
                    this.elt.style.msGridColumnSpan = columnSpan
                }
                else {
                    this.elt.setAttribute("data-block-visibility", "hidden")
                }
            }
        }, {})
    })
})();
(function _HeaderFactory_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        HeaderFactory: WinJS.Class.define(function _HeaderFactory_12() { }, {}, {
            getRenderer: function getRenderer(style) {
                var headerRenderer;
                switch (style) {
                    case 1:
                        headerRenderer = CommonJS.ArticleReader.HeaderStyle1Renderer;
                        break;
                    case 2:
                        headerRenderer = CommonJS.ArticleReader.HeaderStyle2Renderer;
                        break
                }
                return headerRenderer
            }
        })
    })
})();
(function _GridCalculator_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        GridCalculator: WinJS.Class.define(function _GridCalculator_13() { }, {}, {
            calculateGridOptions: function calculateGridOptions(gridConstants, pageWidth, pageHeight) {
                var columnCount = 3;
                var columnWidth;
                var done = false;
                var defaultRightMargin = gridConstants.defaultRightMargin;
                var maxColumnWidth = gridConstants.maxColumnWidth;
                var minColumnWidth = gridConstants.minColumnWidth;
                while (!done && columnCount >= 2) {
                    var currentColumnWidth = CommonJS.ArticleReader.GridCalculator._getColumnWidth(pageWidth, defaultRightMargin, columnCount, gridConstants);
                    var oneMoreColumnWidth = CommonJS.ArticleReader.GridCalculator._getColumnWidth(pageWidth, defaultRightMargin, columnCount + 1, gridConstants);
                    var oneLessColumnWidth = CommonJS.ArticleReader.GridCalculator._getColumnWidth(pageWidth, defaultRightMargin, columnCount - 1, gridConstants);
                    if (currentColumnWidth > maxColumnWidth) {
                        if (oneMoreColumnWidth < minColumnWidth) {
                            columnWidth = maxColumnWidth;
                            done = true
                        }
                        else if (oneMoreColumnWidth > maxColumnWidth) {
                            columnCount++
                        }
                        else {
                            columnCount++;
                            columnWidth = oneMoreColumnWidth;
                            done = true
                        }
                    }
                    else if (currentColumnWidth < minColumnWidth) {
                        if (oneLessColumnWidth > maxColumnWidth) {
                            columnCount--;
                            columnWidth = maxColumnWidth;
                            done = true
                        }
                        else if (oneLessColumnWidth < minColumnWidth) {
                            columnCount--
                        }
                        else {
                            columnCount--;
                            columnWidth = oneLessColumnWidth;
                            done = true
                        }
                    }
                    else {
                        columnWidth = currentColumnWidth;
                        done = true
                    }
                }
                var rightMargin = CommonJS.ArticleReader.GridCalculator._getRightMargin(pageWidth, columnWidth, columnCount, gridConstants);
                var columnHeight = pageHeight - gridConstants.topMargin - gridConstants.bottomMargin;
                return {
                    pageWidth: pageWidth, pageHeight: pageHeight, columnCount: columnCount, columnWidth: columnWidth, columnHeight: columnHeight, rightMargin: rightMargin, leftMargin: gridConstants.leftMargin, columnMargin: gridConstants.columnMargin, topMargin: gridConstants.topMargin, bottomMargin: gridConstants.bottomMargin
                }
            }, _getColumnWidth: function _getColumnWidth(pageWidth, rightMargin, columnCount, gridConstants) {
                return Math.floor((pageWidth - gridConstants.leftMargin - rightMargin - (columnCount - 1) * gridConstants.columnMargin) / columnCount)
            }, _getRightMargin: function _getRightMargin(pageWidth, columnWidth, columnCount, gridConstants) {
                return pageWidth - gridConstants.leftMargin - columnCount * (columnWidth + gridConstants.columnMargin) + gridConstants.columnMargin
            }
        })
    })
})();
(function _FontCalculator_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        FontCalculator: WinJS.Class.define(function _FontCalculator_13() { }, {}, {
            _contentFrame: null, calculateOptimalFontSize: function calculateOptimalFontSize(sizeDefault, styleDefault, xlargeEnabled) {
                var result = null;
                var fontCalculator = CommonJS.ArticleReader.FontCalculator;
                try {
                    var cssRules = fontCalculator._getCssRules();
                    if (cssRules) {
                        var fontNamesText = fontCalculator._getFontNameByCssSelector(cssRules, sizeDefault, styleDefault);
                        var fontNames = fontNamesText && fontNamesText.split(",");
                        if (fontNames && fontNames.length > 0 && fontNames[0]) {
                            var fontName = fontNames[0].toLowerCase();
                            fontName = fontName.replace(/\"/g, "");
                            if (fontName) {
                                var optimalFontSize = fontCalculator._getOptimalSize(fontName);
                                result = fontCalculator._findTextSize(cssRules, optimalFontSize, sizeDefault, styleDefault, xlargeEnabled)
                            }
                        }
                    }
                }
                finally {
                    fontCalculator._releaseCssRules()
                }
                return result
            }, _getCssRules: function _getCssRules() {
                var fontCalculator = CommonJS.ArticleReader.FontCalculator;
                fontCalculator._contentFrame = document.createElement("iframe");
                document.body.appendChild(fontCalculator._contentFrame);
                var contentDocument = fontCalculator._contentFrame.contentWindow.document;
                var defaultCssPath = CommonJS.ArticleReader.ContentFrameManager.defaultCssPath;
                CommonJS.ArticleReader.FontCalculator._addCssFilesToDocument(contentDocument, [defaultCssPath]);
                var market = document.getElementsByTagName("HTML")[0].lang;
                if (market) {
                    contentDocument.getElementsByTagName("HTML")[0].lang = PlatformJS.Utilities.convertMarketToLanguageCode(market)
                }
                var styleSheets = contentDocument.styleSheets;
                if (!styleSheets || styleSheets.length <= 0) {
                    return null
                }
                return styleSheets[0].cssRules
            }, _releaseCssRules: function _releaseCssRules() {
                var fontCalculator = CommonJS.ArticleReader.FontCalculator;
                var frameElem = fontCalculator._contentFrame;
                if (frameElem) {
                    frameElem.parentElement.removeChild(frameElem);
                    fontCalculator._contentFrame = null
                }
            }, _addCssFilesToDocument: function _addCssFilesToDocument(doc, cssFiles) {
                for (var i = 0, len = cssFiles.length; i < len; i++) {
                    var link = doc.createElement("link");
                    link.setAttribute("href", cssFiles[i]);
                    link.setAttribute("rel", "stylesheet");
                    doc.getElementsByTagName("HEAD")[0].appendChild(link)
                }
            }, _getOptimalSize: function _getOptimalSize(fontName) {
                var visualAngleStr = PlatformJS.Services.configuration.getString("VisualAngle");
                var visualAngle = (visualAngleStr && parseFloat(visualAngleStr)) || 0.190;
                var visAngle = visualAngle * Math.PI / 180;
                var displayInformation = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
                var physDpi = screen.deviceYDPI || 96;
                var rawY = displayInformation.rawDpiY;
                if (rawY) {
                    physDpi = rawY
                }
                var resolutionScale = Windows.Graphics.Display.DisplayProperties.resolutionScale || 100;
                var xHeight = 1024,
                    emSquare = 2048;
                var fontMetrics = PlatformJS.Services.configuration.getDictionary("FontMetrics");
                if (fontMetrics) {
                    var fontMetric = fontMetrics.getDictionary(fontName);
                    if (fontMetric) {
                        xHeight = fontMetric.getInt32("xHeight") || xHeight;
                        emSquare = fontMetric.getInt32("emSquare") || emSquare
                    }
                }
                var viewDistance;
                var size = Math.sqrt(Math.pow(screen.height, 2) + Math.pow(screen.width, 2)) / physDpi;
                if (size < 9) {
                    viewDistance = 16.3
                }
                else if (size < 13) {
                    viewDistance = 20
                }
                else if (size < 18) {
                    viewDistance = 24.5
                }
                else {
                    viewDistance = 28
                }
                var physXHeight = 2 * viewDistance * Math.tan(visAngle / 2) * 72;
                var physHeight = physXHeight * emSquare / xHeight;
                var optimalFontSizeInPt = physHeight * physDpi / (96 * (resolutionScale / 100));
                return optimalFontSizeInPt * (96 * (resolutionScale / 100)) / 72
            }, _findTextSize: function _findTextSize(cssRules, optimalFontSize, sizeDefault, styleDefault, xlargeEnabled) {
                var fontCalculator = CommonJS.ArticleReader.FontCalculator;
                var textSizeOptions = ["small", "medium", "large"];
                if (xlargeEnabled) {
                    textSizeOptions.push("xlarge")
                }
                var textIndex = textSizeOptions.indexOf(sizeDefault);
                var cssFontSize = fontCalculator._getFontSizeByCssSelector(cssRules, sizeDefault, styleDefault);
                var initialCssFontSize = cssFontSize;
                if (cssFontSize && cssFontSize + 2 < optimalFontSize) {
                    while (cssFontSize && cssFontSize + 2 < optimalFontSize && textIndex + 1 < textSizeOptions.length) {
                        textIndex++;
                        cssFontSize = fontCalculator._getFontSizeByCssSelector(cssRules, textSizeOptions[textIndex], styleDefault)
                    }
                }
                else if (cssFontSize && cssFontSize - 2 > optimalFontSize) {
                    while (cssFontSize && cssFontSize - 2 > optimalFontSize && textIndex > 0) {
                        textIndex--;
                        cssFontSize = fontCalculator._getFontSizeByCssSelector(cssRules, textSizeOptions[textIndex], styleDefault)
                    }
                }
                if (PlatformJS.isDebug) {
                    var displayInformation = Windows.Graphics.Display.DisplayInformation.getForCurrentView();
                    CommonJS.ArticleReaderPage.updateDebugIndicator(null, null, "Font size: current - " + cssFontSize.toFixed(2) + "px, optimal - " + optimalFontSize.toFixed(2) + "px, default css - " + initialCssFontSize.toFixed(2) + "px, RAW DPI: " + (displayInformation.rawDpiY.toFixed(2)))
                }
                if (!cssFontSize) {
                    return null
                }
                return textSizeOptions[textIndex]
            }, _getFontSizeByCssSelector: function _getFontSizeByCssSelector(cssRules, textSize, textStyle) {
                textSize = "=" + textSize;
                for (var i = 0, len = cssRules.length; i < len; i++) {
                    var cssRule = cssRules[i];
                    if (cssRule && cssRule.selectorText && cssRule.selectorText.match(textSize) && cssRule.selectorText.match(textStyle)) {
                        return parseFloat(cssRule.style.fontSize)
                    }
                }
                return null
            }, _getFontNameByCssSelector: function _getFontNameByCssSelector(cssRules, textSize, textStyle) {
                textSize = "=" + textSize;
                for (var i = 0, len = cssRules.length; i < len; i++) {
                    var cssRule = cssRules[i];
                    if (cssRule && cssRule.selectorText && cssRule.selectorText.match(textSize) && cssRule.selectorText.match(textStyle)) {
                        return cssRule.style.fontFamily
                    }
                }
                return null
            }
        })
    })
})();
(function _PageManager_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        PageManager: WinJS.Class.define(function _PageManager_13(options) {
            this._surfaceManager = options.surfaceManager;
            this._contentElements = options.contentElements;
            this._headerBlockElements = options.headerBlockElements;
            this._footerBlockElements = options.footerBlockElements;
            this._pageIndex = options.pageIndex;
            this._header = null;
            this._footer = null
        }, {
            _surfaceManager: null, _contentElements: null, _headerElements: null, _footerElements: null, _pageIndex: null, _header: null, _footer: null, pageIndex: {
                get: function get() {
                    return this._pageIndex
                }
            }, pageNumberVisible: {
                set: function set(value) {
                    if (this._footer) {
                        this._footer.pageNumberVisible = value
                    }
                }
            }, pageNumberString: {
                set: function set(value) {
                    var footer = this._footer;
                    if (footer) {
                        footer.pageNumberString = value
                    }
                    var header = this._header;
                    if (header) {
                        header.pageNumberString = value
                    }
                }
            }, isEmpty: function isEmpty(context) {
                var gridOptions = context.gridOptions;
                var isBlockEmpty = true;
                var isContentEmpty = true;
                var exclusions = CommonJS.ArticleReader.ArticleReaderUtils.getAllExclusions(context);
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var exclusion = exclusions[i];
                    if (exclusion) {
                        var isExclusionOnPage = this._isExclusionOnPage(exclusion, gridOptions);
                        if (isExclusionOnPage) {
                            isBlockEmpty = false;
                            break
                        }
                    }
                }
                if (isBlockEmpty) {
                    var startIndex = this._getStartIndex(gridOptions);
                    var firstContentElement = this._getContentElement(startIndex, context);
                    isContentEmpty = CommonJS.ArticleReader.ArticleReaderUtils.isContentElementEmpty(firstContentElement)
                }
                return isBlockEmpty && isContentEmpty
            }, isOverflowing: function isOverflowing(context) {
                var gridOptions = context.gridOptions;
                var isBlockOverflowing = false;
                var isContentOverflowing = false;
                var exclusions = CommonJS.ArticleReader.ArticleReaderUtils.getAllExclusions(context);
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var exclusion = exclusions[i];
                    var isExclusionOnHigherPage = this._isExclusionOnHigherPage(exclusion, gridOptions);
                    if (isExclusionOnHigherPage) {
                        isBlockOverflowing = true;
                        break
                    }
                }
                if (!isBlockOverflowing) {
                    var endIndex = this._getEndIndex(gridOptions);
                    var lastContentElement = this._getContentElement(endIndex, context);
                    var ranges = lastContentElement.msGetRegionContent();
                    isContentOverflowing = CommonJS.ArticleReader.ArticleReaderUtils.isContentElementOverflowing(lastContentElement)
                }
                return isBlockOverflowing || isContentOverflowing
            }, isLastColumnEmpty: function isLastColumnEmpty(context) {
                var gridOptions = context.gridOptions;
                var endIndex = this._getEndIndex(gridOptions);
                return this._isColumnEmpty(endIndex, context)
            }, getColumnCount: function getColumnCount(context) {
                var gridOptions = context.gridOptions;
                var startIndex = this._getStartIndex(gridOptions);
                var endIndex = this._getEndIndex(gridOptions);
                var count = 0;
                for (var i = startIndex; i <= endIndex; i++) {
                    var isEmpty = this._isColumnEmpty(i, context);
                    if (!isEmpty) {
                        count++
                    }
                }
                return count
            }, createElements: function createElements(context) {
                var contentElements = this._contentElements;
                var gridOptions = context.gridOptions;
                var endIndex = this._getEndIndex(gridOptions);
                while (endIndex > contentElements.length - 1) {
                    this._getContentElement(contentElements.length, context)
                }
                this._getFooterBlockElement(context)
            }, adjustLastPageHeader: function adjustLastPageHeader(context) {
                var headerBlockElements = this._headerBlockElements;
                var pageIndex = this.pageIndex;
                var headerBlockElt = headerBlockElements[pageIndex];
                if (headerBlockElt) {
                    var gridOptions = context.gridOptions;
                    var columnCount = gridOptions.columnCount;
                    var headerColumnSpan;
                    var headerStyle = headerBlockElt.style;
                    var columnSpan = columnCount * 2 + 1;
                    if (pageIndex === headerBlockElements.length - 1) {
                        if (columnCount === 1) {
                            headerBlockElt.setAttribute("data-block-visibility", "hidden")
                        }
                        else {
                            headerColumnSpan = headerStyle.msGridColumnSpan;
                            headerColumnSpan = Math.max(headerColumnSpan - 2, columnSpan - 2)
                        }
                    }
                    else {
                        headerBlockElt.setAttribute("data-block-visibility", "shown");
                        headerColumnSpan = columnSpan
                    }
                    if (this._header) {
                        this._header.setColumnSpan(headerColumnSpan, context)
                    }
                }
            }, associateLayoutWithElements: function associateLayoutWithElements(context) {
                var contentElements = this._contentElements;
                var gridOptions = context.gridOptions;
                var auxiliaryData = context.auxiliaryData;
                var startIndex = this._getStartIndex(gridOptions);
                var endIndex = this._getEndIndex(gridOptions);
                var pageIndex = this.pageIndex;
                var columnCount = gridOptions.columnCount;
                var totalPages = this._surfaceManager.pageManagers.length;
                if (auxiliaryData.articleHeader.enabled && pageIndex > 0 && pageIndex <= totalPages - 1) {
                    var headerBlockElement = this._getHeaderBlockElement(context);
                    var headerStyle = headerBlockElement.style;
                    var headerColumn = (((columnCount * 2) + 1) * pageIndex) + 1;
                    var headerColumnSpan = columnCount * 2 + 1;
                    headerStyle.msGridRow = 1;
                    headerStyle.msGridColumn = headerColumn;
                    headerStyle.msGridRowSpan = 1;
                    headerBlockElement.setAttribute("data-block-visibility", "shown");
                    this._header.setColumnSpan(headerColumnSpan, context)
                }
                for (var i = startIndex; i <= endIndex; i++) {
                    var contentElement = this._getContentElement(i, context);
                    var contentStyle = contentElement.style;
                    var contentColumn = CommonJS.ArticleReader.ArticleReaderUtils.convertColumnIndexToGridColumn(i, columnCount);
                    contentStyle.msGridRow = 2;
                    contentStyle.msGridColumn = contentColumn;
                    contentStyle.msGridRowSpan = 2;
                    contentStyle.msGridColumnSpan = 1;
                    contentElement.setAttribute("data-block-visibility", "shown")
                }
                if (auxiliaryData.articleFooter.enabled) {
                    var footerBlockElement = this._getFooterBlockElement(context);
                    var footerStyle = footerBlockElement.style;
                    var footerColumn = (((columnCount * 2) + 1) * pageIndex) + 2;
                    var footerColumnSpan = columnCount * 2 - 1;
                    footerStyle.msGridRow = 4;
                    footerStyle.msGridColumn = footerColumn;
                    footerStyle.msGridRowSpan = 1;
                    footerStyle.msGridColumnSpan = footerColumnSpan;
                    footerBlockElement.setAttribute("data-block-visibility", "shown")
                }
            }, destroy: function destroy(context) {
                var contentElements = this._contentElements;
                var gridOptions = context.gridOptions;
                var startIndex = this._getStartIndex(gridOptions);
                var endIndex = this._getEndIndex(gridOptions);
                var pageIndex = this.pageIndex;
                var headerBlockElt = this._headerBlockElements[pageIndex];
                if (headerBlockElt) {
                    headerBlockElt.innerHTML = "";
                    this._headerBlockElements.splice(pageIndex, 1)
                }
                this._header = null;
                for (var i = startIndex; i <= endIndex; i++) {
                    var contentElement = this._getContentElement(i, context);
                    contentElement.setAttribute("data-block-visibility", "hidden")
                }
                var footerBlockElement = this._getFooterBlockElement(context);
                if (footerBlockElement) {
                    footerBlockElement.innerHTML = "";
                    this._footerBlockElements.splice(pageIndex, 1)
                }
                this._footer = null
            }, getFirstEmptyColumn: function getFirstEmptyColumn(context) {
                var gridOptions = context.gridOptions;
                var startIndex = this._getStartIndex(gridOptions);
                var endIndex = this._getEndIndex(gridOptions);
                var emptyColumn = -1;
                for (var i = startIndex; i <= endIndex; i++) {
                    var isColumnEmpty = this._isColumnEmpty(i, context, false);
                    if (isColumnEmpty) {
                        emptyColumn = i;
                        break
                    }
                }
                return emptyColumn
            }, _getStartIndex: function _getStartIndex(gridOptions) {
                var columnCount = gridOptions.columnCount;
                var pageIndex = this.pageIndex;
                var startIndex = pageIndex * columnCount;
                return startIndex
            }, _getEndIndex: function _getEndIndex(gridOptions) {
                var columnCount = gridOptions.columnCount;
                var pageIndex = this.pageIndex;
                var endIndex = (pageIndex + 1) * columnCount - 1;
                return endIndex
            }, _isExclusionOnPage: function _isExclusionOnPage(exclusion, gridOptions) {
                var columnCount = gridOptions.columnCount;
                var column = exclusion.column;
                var pageIndex = this.pageIndex;
                var pageIndexForColumn = Math.floor(column / columnCount);
                var isExclusionOnPage = (pageIndexForColumn === pageIndex);
                return isExclusionOnPage
            }, _isExclusionOnHigherPage: function _isExclusionOnHigherPage(exclusion, gridOptions) {
                var columnCount = gridOptions.columnCount;
                var column = exclusion.column;
                var pageIndex = this.pageIndex;
                var pageIndexForColumn = Math.floor(column / columnCount);
                var isExclusionOnHigherPage = (pageIndexForColumn > pageIndex);
                return isExclusionOnHigherPage
            }, _getContentElement: function _getContentElement(index, context) {
                var contentElements = this._contentElements;
                var surfaceManager = this._surfaceManager;
                var auxiliaryData = context.auxiliaryData;
                var flowId = auxiliaryData.flowId;
                while (index > contentElements.length - 1) {
                    var element = CommonJS.ArticleReader.ArticleReaderUtils.createContentElement(flowId);
                    surfaceManager.appendElement(element);
                    contentElements.push(element)
                }
                var contentElement = contentElements[index];
                return contentElement
            }, _getHeaderBlockElement: function _getHeaderBlockElement(context) {
                var headerBlockElements = this._headerBlockElements;
                var pageIndex = this.pageIndex;
                var surfaceManager = this._surfaceManager;
                while (pageIndex > headerBlockElements.length - 1) {
                    var element = document.createElement("div");
                    WinJS.Utilities.addClass(element, "headerBlock");
                    surfaceManager.appendElement(element);
                    headerBlockElements.push(element)
                }
                var headerBlockElt = headerBlockElements[pageIndex];
                this._header = new CommonJS.ArticleReader.Header(headerBlockElt, { context: context });
                return headerBlockElt
            }, _getFooterBlockElement: function _getFooterBlockElement(context) {
                var auxiliaryData = context.auxiliaryData;
                var hidePageNumbers = auxiliaryData.hidePageNumbers;
                var footerBlockElements = this._footerBlockElements;
                var pageIndex = this.pageIndex;
                var surfaceManager = this._surfaceManager;
                var gridOptions = context.gridOptions;
                while (pageIndex > footerBlockElements.length - 1) {
                    var element = document.createElement("div");
                    WinJS.Utilities.addClass(element, "footerBlock");
                    surfaceManager.appendElement(element);
                    footerBlockElements.push(element)
                }
                var footerBlockElt = footerBlockElements[pageIndex];
                footerBlockElt.innerHTML = "";
                var footer = this._footer = new CommonJS.ArticleReader.Footer(null, {
                    gridOptions: gridOptions, pageNumberString: "", hidePageNumbers: hidePageNumbers
                });
                var footerElt = footer.elt;
                footerBlockElt.appendChild(footerElt);
                return footerBlockElt
            }, _isColumnEmpty: function _isColumnEmpty(index, context, excludeTitle) {
                var isBlockEmpty = true;
                var isContentEmpty = true;
                var exclusions = excludeTitle ? CommonJS.ArticleReader.ArticleReaderUtils.getAllNonTitleExclusions(context) : CommonJS.ArticleReader.ArticleReaderUtils.getAllExclusions(context);
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var exclusion = exclusions[i];
                    var isExclusionOnColumn = CommonJS.ArticleReader.ArticleReaderUtils.isExclusionOnColumn(exclusion, index);
                    if (isExclusionOnColumn) {
                        isBlockEmpty = false;
                        break
                    }
                }
                if (isBlockEmpty) {
                    var column = this._getContentElement(index, context);
                    isContentEmpty = CommonJS.ArticleReader.ArticleReaderUtils.isContentElementEmpty(column)
                }
                var isColumnEmpty = isContentEmpty && isBlockEmpty;
                return isColumnEmpty
            }
        }, {})
    })
})();
(function _PageNumber_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        PageNumber: WinJS.Class.define(function _PageNumber_13(elt, options) {
            elt = this._elt = elt ? elt : document.createElement("div");
            elt.winControl = this;
            elt.setAttribute("aria-hidden", true);
            WinJS.Utilities.addClass(elt, "pageNumber");
            this.pageNumberString = options.pageNumberString
        }, {
            _elt: null, pageNumberString: {
                set: function set(value) {
                    var elt = this._elt;
                    elt.innerText = value
                }
            }
        }, {})
    })
})();
(function _SurfaceManager_7() {
    "use strict";
    var U = CommonJS.ArticleReader.ArticleReaderUtils;
    var spacerType = CommonJS.ArticleReader.PartialPageSpacerRenderer.rendererType;
    var partialPageTransitionSteps = CommonJS.ArticleReader.PartialPageOrchestrator.PARTIAL_PAGE_TRANSITION_STEPS;
    function updateImageUrl(renderableBlock) {
        var imageDimensionReadyFunction = renderableBlock.imageDimensionReady;
        var layout = renderableBlock.layout;
        if (typeof imageDimensionReadyFunction === "function" && layout) {
            imageDimensionReadyFunction(layout.width, layout.height);
            renderableBlock.imageDimensionReady = null
        }
    }
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        SurfaceManager: WinJS.Class.define(function surfacemanager_ctor(options) {
            this._surface = options.surface;
            this._contentElements = [];
            this._pageManagers = [];
            this._headerBlockElements = [];
            this._footerBlockElements = []
        }, {
            _surface: null, _contentElements: null, _pageManagers: null, _headerBlockElements: null, _footerBlockElements: null, _partialPageTitle: null, _lastFullPageTitle: null, _partialPageOverlay: null, _partialPageAd: null, _partialPageVideo: null, _partialPageLeftGridIndex: -1, _partialPageRightGridIndex: -1, _partialPageStyleUpdateHandle: 0, _hasPartialPage: false, _originalColumnsStyle: null, _columnsPerPage: 0, dispose: function dispose() {
                msClearImmediate(this._partialPageStyleUpdateHandle);
                if (this._surface) {
                    WinJS.Utilities.disposeSubTree(this._surface);
                    if (this._partialPageOverlay) {
                        WinJS.Utilities.disposeSubTree(this._partialPageOverlay);
                        this._surface.removeChild(this._partialPageOverlay)
                    }
                    this._partialPageOverlay = null
                }
                this._partialPageAd = null;
                this._partialPageVideo = null
            }, pageManagers: {
                get: function get() {
                    return this._pageManagers
                }
            }, initializeSurface: function initializeSurface(context, showPaywallCard) {
                var surface = this._surface;
                var gridOptions = context.gridOptions;
                var columnMargin = gridOptions.columnMargin;
                var columnWidth = gridOptions.columnWidth;
                var leftMargin = gridOptions.leftMargin;
                var rightMargin = gridOptions.rightMargin;
                var columnCount = gridOptions.columnCount;
                var columnHeight = gridOptions.columnHeight;
                var topMargin = gridOptions.topMargin;
                var bottomMargin = gridOptions.bottomMargin;
                var pageWidth = gridOptions.pageWidth;
                var rowHeight = columnHeight / 2;
                var rowsStyle = [];
                rowsStyle.push(topMargin + "px");
                rowsStyle.push(rowHeight + "px");
                rowsStyle.push(rowHeight + "px");
                rowsStyle.push(bottomMargin + "px");
                surface.style.msGridRows = rowsStyle.join(" ");
                var auxiliaryData = context.auxiliaryData;
                var isPaginated = auxiliaryData.isPaginated;
                var columnsStyleString = "";
                if (isPaginated) {
                    var columnsStyle = [];
                    columnsStyle.push(leftMargin + "px");
                    for (var j = 0, jlen = columnCount; j < jlen; j++) {
                        columnsStyle.push(columnWidth + "px");
                        columnsStyle.push(columnMargin + "px")
                    }
                    columnsStyle.pop();
                    columnsStyle.push(rightMargin + "px");
                    columnsStyleString = ["(", columnsStyle.join(" "), ")[1000]"].join(" ");
                    this._columnsPerPage = columnsStyle.length
                }
                else {
                    var firstPageStyle = [];
                    firstPageStyle.push(leftMargin + "px");
                    for (var i = 0, ilen = columnCount; i < ilen; i++) {
                        firstPageStyle.push(columnWidth + "px");
                        firstPageStyle.push(columnMargin + "px")
                    }
                    firstPageStyle.pop();
                    firstPageStyle.push(columnMargin + "px");
                    var repeatStyle = [];
                    repeatStyle.push("0px");
                    for (var k = 0, klen = columnCount; k < klen; k++) {
                        repeatStyle.push(columnWidth + "px");
                        repeatStyle.push(columnMargin + "px")
                    }
                    repeatStyle.pop();
                    repeatStyle.push(columnMargin + "px");
                    columnsStyleString = [firstPageStyle.join(" "), "(", repeatStyle.join(" "), ")[999]"].join(" ")
                }
                surface.style.msGridColumns = columnsStyleString;
                this._originalColumnsStyle = columnsStyleString;
                if (showPaywallCard) {
                    surface.style.width = pageWidth + "px"
                }
                else {
                    surface.style.width = ""
                }
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var titleStyle = renderableTitle.style;
                surface.setAttribute("data-title-style", titleStyle);
                var headerStyle = auxiliaryData.articleHeader.style;
                surface.setAttribute("data-header-style", headerStyle)
            }, getContentDensity: function getContentDensity(context) {
                var contentDensity;
                var calibrationData = context.calibrationData;
                if (calibrationData) {
                    var existingDensity = calibrationData.contentDensity;
                    if (existingDensity || existingDensity === 0) {
                        contentDensity = existingDensity
                    }
                    else {
                        contentDensity = this._determineContentDensity(context)
                    }
                }
                else {
                    contentDensity = this._determineContentDensity(context)
                }
                contentDensity = Math.max(0.001, contentDensity);
                return contentDensity
            }, calculateLayout: function calculateLayout(context) {
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var columnWidth = gridOptions.columnWidth;
                var columnCount = gridOptions.columnCount;
                var calibrationData = context.calibrationData;
                var contentColumnCount = calibrationData.contentColumnCount;
                var contentDensity = calibrationData.contentDensity;
                var renderData = context.renderData;
                var layoutData = context.layoutData;
                var auxiliaryData = context.auxiliaryData;
                var hideInlineAds = auxiliaryData.hideInlineAds;
                var adGroups = auxiliaryData.adGroups;
                this._resetLayout(context);
                this._layoutTitle(context);
                var hasInlineAdGroup = false;
                for (var j = 0, lenj = adGroups.length; j < lenj; j++) {
                    var adGroup = adGroups[j];
                    if (adGroup.type === "inline") {
                        hasInlineAdGroup = true;
                        break
                    }
                }
                var renderableBlocks = renderData.renderableBlocks;
                var exclusions = U.getAllExclusionsFromRenderableBlocks(renderableBlocks);
                var maxBlockColumn = 0;
                var lastInlineAdColumn = -1;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (!isTitle) {
                        var renderer = this._getRenderer(renderableBlock);
                        if (renderer) {
                            var position = renderableBlock.position;
                            var tries = 5;
                            var currentExclusionColumnCount = this._getExclusionsColumnCount(exclusions, columnHeight);
                            var startColumn = contentDensity === 0 ? 0 : Math.floor((currentExclusionColumnCount + (position / (contentDensity * columnWidth * columnHeight))) * 2) / 2;
                            var exclusion = null;
                            while (!exclusion && tries) {
                                tries--;
                                exclusion = renderer.calculateLayout(renderableBlock, startColumn, gridOptions, exclusions);
                                if (!exclusion) {
                                    startColumn = Math.floor(startColumn) + columnCount - (Math.floor(startColumn) % columnCount)
                                }
                            }
                            if (exclusion) {
                                var isInlineAd = this._getType(renderableBlock) === U.inlineAdBlockType;
                                if ((!hasInlineAdGroup || hideInlineAds) && isInlineAd) {
                                    exclusion.height = 0
                                }
                                if (isInlineAd) {
                                    if (lastInlineAdColumn === -1 || lastInlineAdColumn + columnCount <= exclusion.column) {
                                        lastInlineAdColumn = exclusion.column
                                    }
                                    else {
                                        exclusion.height = 0
                                    }
                                }
                                renderableBlock.exclusion = exclusion;
                                exclusions.push(exclusion);
                                maxBlockColumn = Math.max(maxBlockColumn, exclusion.column + exclusion.columnSpan - 1)
                            }
                        }
                    }
                }
                var exclusionColumnCount = this._getExclusionsColumnCount(exclusions, columnHeight);
                var totalColumnCount = contentColumnCount + exclusionColumnCount;
                var pageCount = Math.ceil(Math.max(totalColumnCount, maxBlockColumn + 1) / columnCount);
                layoutData.pageCount = pageCount;
                return WinJS.Promise.wrap(null)
            }, createElements: function createElements(context) {
                var promise = WinJS.Promise.wrap(null);
                this.createTitleElements(context);
                this._createBlockElements(context);
                return promise
            }, renderFirstPageWithHints: function renderFirstPageWithHints(context) {
                var that = this;
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var auxiliaryData = context.auxiliaryData;
                var hideInlineAds = auxiliaryData.hideInlineAds;
                this._createPages(context);
                this._hideAllHeaderBlocks();
                var pageManagers = this._pageManagers;
                for (var i = 0, leni = pageManagers.length; i < leni; i++) {
                    var pageManager = pageManagers[i];
                    pageManager.associateLayoutWithElements(context)
                }
                var promise = WinJS.Promise.wrap(null);
                promise = promise.then(function _SurfaceManager_329() {
                    for (var k = 0, lenk = renderableBlocks.length; k < lenk; k++) {
                        var renderableBlock = renderableBlocks[k];
                        var layout = renderableBlock.layout;
                        var columnIndex = U.convertGridColumnToColumnIndex(layout.column, columnCount);
                        if (columnIndex < columnCount) {
                            that._positionAndRenderBlock(renderableBlock, context, hideInlineAds)
                        }
                    }
                    that._updatePageNumberData(context)
                });
                return promise
            }, renderSubsequentPagesWithHints: function renderSubsequentPagesWithHints(context) {
                var that = this;
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var auxiliaryData = context.auxiliaryData;
                var hideInlineAds = auxiliaryData.hideInlineAds;
                var promise = WinJS.Promise.wrap(null);
                promise = promise.then(function _SurfaceManager_366() {
                    that._adjustPages(context);
                    var lastContentColumn = that.getLastColumnWithContent(context);
                    lastContentColumn = Math.max(columnCount - 1, lastContentColumn);
                    var lastColumnStatus = {
                        lastContentColumn: lastContentColumn, lastAggregatedColumn: -1, lastAggregatedColumnHeight: 0
                    };
                    for (var l = 0, lenl = renderableBlocks.length; l < lenl; l++) {
                        var renderableBlock = renderableBlocks[l];
                        var layout = renderableBlock.layout;
                        var columnIndex = U.convertGridColumnToColumnIndex(layout.column, columnCount);
                        if (columnIndex >= columnCount) {
                            that._positionAndRenderBlock(renderableBlock, context, hideInlineAds, columnCount, lastColumnStatus)
                        }
                    }
                    return WinJS.Promise.timeout(0)
                }).then(function _SurfaceManager_388() {
                    that._hideEndRenderableBlocks(context);
                    that._adjustPages(context);
                    return that._renderAndLayoutEndUi(context)
                }).then(function _SurfaceManager_398() {
                    return that._updateSurfaceSize(context, false)
                });
                return promise
            }, associateLayoutWithElements: function associateLayoutWithElements(context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                this._createPages(context);
                this._hideAllPageElements();
                this._hideAllBlocks(context);
                var pageManagers = this._pageManagers;
                for (var i = 0, leni = pageManagers.length; i < leni; i++) {
                    var pageManager = pageManagers[i];
                    pageManager.associateLayoutWithElements(context)
                }
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var hideInlineAds = context.auxiliaryData && context.auxiliaryData.hideInlineAds;
                var lastColumnStatus = {
                    lastContentColumn: this.getLastColumnWithContent(context), lastAggregatedColumn: -1, lastAggregatedColumnHeight: 0, lastInlineAdColumn: -1
                };
                for (var j = 0, lenj = renderableBlocks.length; j < lenj; j++) {
                    var renderableBlock = renderableBlocks[j];
                    if (renderableBlock.block && renderableBlock.block.type === U.inlineAdBlockType && hideInlineAds) {
                        continue
                    }
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (!isTitle) {
                        var isAggregated = this._isAggregated(renderableBlock);
                        var element = renderableBlock.element;
                        var isExclusionBlock = false;
                        if (!isTitle) {
                            isExclusionBlock = this._updateBlockExclusion(context, renderableBlock, isAggregated, columnCount, lastColumnStatus)
                        }
                        var exclusion = renderableBlock.exclusion;
                        if (exclusion) {
                            U.assignExclusion(renderableBlock, context)
                        }
                        if (!isTitle) {
                            this._getRenderer(renderableBlock).applyLayout(renderableBlock, isAggregated, context)
                        }
                        exclusion = renderableBlock.exclusion;
                        if (exclusion && exclusion.height > 0) {
                            element.setAttribute("data-block-visibility", "shown");
                            element.setAttribute("data-location", exclusion.rowAlign)
                        }
                        else {
                            element.setAttribute("data-block-visibility", "hidden")
                        }
                        U.setFixedElementHeight(element);
                        U.updateLayout(renderableBlock, context);
                        if (isExclusionBlock) {
                            this._adjustPages(context);
                            lastColumnStatus.lastContentColumn = this.getLastColumnWithContent(context)
                        }
                    }
                }
                return WinJS.Promise.wrap(null)
            }, adjust: function adjust(context, useLayoutHints) {
                var that = this;
                var promise = WinJS.Promise.wrap(null);
                promise = promise.then(function _SurfaceManager_498() {
                    if (!useLayoutHints) {
                        that._aggregateOrphans(context)
                    }
                    that._hideEndRenderableBlocks(context);
                    that._updateSurfaceSize(context, true);
                    that._adjustPages(context);
                    return WinJS.Promise.timeout()
                }).then(function _SurfaceManager_515() {
                    that._renderAndLayoutEndUi(context);
                    that._adjustPages(context);
                    return WinJS.Promise.timeout()
                }).then(function _SurfaceManager_524() {
                    that._updateSurfaceSize(context, false);
                    that._updatePageNumberData(context);
                    that._updateLayoutHints(context);
                    return WinJS.Promise.wrap(null)
                });
                return promise
            }, appendElement: function appendElement(element) {
                var surface = this._surface;
                if (element) {
                    surface.appendChild(element)
                }
            }, appendBlock: function appendBlock(renderableBlock, element) {
                var surface = this._surface;
                var oldElement = renderableBlock.oldElement;
                if (oldElement) {
                    WinJS.Utilities.disposeSubTree(oldElement);
                    surface.removeChild(oldElement)
                }
                if (element) {
                    surface.appendChild(element)
                }
                renderableBlock.element = element
            }, removeBlock: function removeBlock(renderableBlock) {
                var surface = this._surface;
                var element = renderableBlock.element;
                if (element) {
                    if (surface) {
                        WinJS.Utilities.disposeSubTree(element);
                        surface.removeChild(element)
                    }
                    else {
                        debugger
                    }
                }
                renderableBlock.element = null
            }, removeBlocks: function removeBlocks(renderableBlocks) {
                var surface = this._surface;
                if (renderableBlocks) {
                    for (var k in renderableBlocks) {
                        var renderableBlock = renderableBlocks[k];
                        this.removeBlock(renderableBlock)
                    }
                }
            }, getLastPageWithEmptyLastColumn: function getLastPageWithEmptyLastColumn(context, createNewPage) {
                var pageManagers = this._pageManagers;
                var page = null;
                var lastPage = pageManagers[pageManagers.length - 1];
                if (lastPage) {
                    var isLastColumnEmpty = lastPage.isLastColumnEmpty(context);
                    if (isLastColumnEmpty) {
                        page = lastPage
                    }
                    else if (createNewPage) {
                        page = this._addPage(context);
                        page.associateLayoutWithElements(context)
                    }
                }
                else {
                    page = this._addPage(context);
                    page.associateLayoutWithElements(context)
                }
                return page
            }, getLastColumnWithContent: function getLastColumnWithContent(context) {
                var contentElements = this._contentElements;
                var index = 0;
                for (var i = contentElements.length - 1; i >= 0; i--) {
                    var contentElement = contentElements[i];
                    if (!U.isContentElementEmpty(contentElement)) {
                        index = i;
                        break
                    }
                }
                return index
            }, isColumnOverflowing: function isColumnOverflowing(columnIndex, context) {
                var contentElements = this._contentElements;
                var contentElement = contentElements[columnIndex];
                var isOverflowing = false;
                if (contentElement) {
                    isOverflowing = U.isContentElementOverflowing(contentElement)
                }
                return isOverflowing
            }, getNextColumnIndexAndMaybeCreatePage: function getNextColumnIndexAndMaybeCreatePage(columnIndex, context) {
                var pageManagers = this._pageManagers;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var nextColumnIndex = columnIndex + 1;
                while (pageManagers.length * columnCount <= nextColumnIndex) {
                    var page = this._addPage(context);
                    page.associateLayoutWithElements(context)
                }
                return nextColumnIndex
            }, getPageCount: function getPageCount() {
                var pageManagers = this._pageManagers;
                var pageCount = pageManagers.length;
                return pageCount
            }, getFirstEmptyColumn: function getFirstEmptyColumn(context, createPage) {
                var pageManagers = this._pageManagers;
                var lastPage = pageManagers[pageManagers.length - 1];
                var emptyColumn = lastPage ? lastPage.getFirstEmptyColumn(context) : -1;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                if (emptyColumn === -1) {
                    if (createPage || !lastPage) {
                        var page = lastPage = this._addPage(context);
                        page.associateLayoutWithElements(context);
                        if (pageManagers.length > 2) {
                            pageManagers[pageManagers.length - 2].associateLayoutWithElements(context)
                        }
                    }
                    emptyColumn = (lastPage.pageIndex) * columnCount
                }
                return emptyColumn
            }, createTitleElements: function createTitleElements(context) {
                var renderData = context.renderData;
                var titleRenderableBlocks = renderData.titleRenderableBlocks;
                var growlMessage = context.auxiliaryData.paywallGrowlMessage;
                if (growlMessage) {
                    titleRenderableBlocks.growl = {
                        block: {
                            attributes: { growlMessage: growlMessage }, type: "Growl"
                        }, position: -1
                    }
                }
                else {
                    if (titleRenderableBlocks.growl) {
                        titleRenderableBlocks.growl = null
                    }
                }
                for (var k in titleRenderableBlocks) {
                    var titleRenderableBlock = titleRenderableBlocks[k];
                    var renderer = this._getRenderer(titleRenderableBlock);
                    if (renderer) {
                        var element = renderer.render(titleRenderableBlock, context);
                        this.appendBlock(titleRenderableBlock, element)
                    }
                }
            }, getWidth: function getWidth(context) {
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var columnWidth = gridOptions.columnWidth;
                var columnMargin = gridOptions.columnMargin;
                var pageWidth = gridOptions.pageWidth;
                var leftMargin = gridOptions.leftMargin;
                var rightMargin = gridOptions.rightMargin;
                var pageManagers = this._pageManagers;
                var pageCount = pageManagers.length;
                var lastPage;
                var lastColumnCount;
                var auxiliaryData = context.auxiliaryData;
                var isPaginated = auxiliaryData.isPaginated;
                var width = 0;
                if (isPaginated) {
                    if (this._hasPartialPage && pageCount > 1) {
                        lastPage = pageManagers[pageCount - 1];
                        var lastPageWidth = 0;
                        if (lastPage) {
                            lastColumnCount = lastPage.getColumnCount(context);
                            lastPageWidth = (lastColumnCount === columnCount) ? pageWidth : (columnWidth + columnMargin) * lastColumnCount
                        }
                        width = (pageCount - 1) * pageWidth + lastPageWidth
                    }
                    else {
                        width = pageWidth * pageCount
                    }
                }
                else {
                    if (pageCount === 1) {
                        width = pageWidth
                    }
                    else {
                        lastPage = pageManagers[pageCount - 1];
                        if (lastPage) {
                            lastColumnCount = lastPage.getColumnCount(context);
                            var totalColumnCount = (pageCount - 1) * columnCount + lastColumnCount;
                            width = totalColumnCount * (columnWidth + columnMargin) + leftMargin
                        }
                    }
                }
                return width
            }, updatePartialPageColumnsStyle: function updatePartialPageColumnsStyle(transitionRatio, immediate) {
                var that = this;
                var setupStyles = function () {
                    var pageManagers = that._pageManagers;
                    var pageCount = pageManagers.length;
                    var displayingPartialPage = transitionRatio > 0.4;
                    if (pageCount > 1) {
                        var pageManager = pageManagers[pageCount - 2];
                        if (pageManager) {
                            pageManager.pageNumberVisible = !displayingPartialPage
                        }
                    }
                    if (displayingPartialPage) {
                        if (that._partialPageAd) {
                            that._partialPageAd.style.visibility = "hidden"
                        }
                        if (that._partialPageVideo) {
                            that._partialPageVideo.style.visibility = "hidden"
                        }
                        if (that._partialPageOverlay) {
                            that._partialPageOverlay.style.msGridRowSpan = 4;
                            that._partialPageOverlay.style.opacity = 1
                        }
                        if (that._partialPageTitle) {
                            that._partialPageTitle.style.visibility = "visible";
                            if (that._lastFullPageTitle) {
                                that._lastFullPageTitle.style.visibility = "hidden"
                            }
                        }
                    }
                    else {
                        if (that._partialPageAd) {
                            that._partialPageAd.style.visibility = "visible"
                        }
                        if (that._partialPageVideo) {
                            that._partialPageVideo.style.visibility = "visible"
                        }
                        if (that._partialPageOverlay) {
                            that._partialPageOverlay.style.opacity = 0;
                            that._partialPageOverlay.style.msGridRowSpan = 1
                        }
                        if (that._partialPageTitle) {
                            that._partialPageTitle.style.visibility = "hidden";
                            if (that._lastFullPageTitle) {
                                that._lastFullPageTitle.style.visibility = "visible"
                            }
                        }
                    }
                };
                msClearImmediate(this._partialPageStyleUpdateHandle);
                if (this._hasPartialPage) {
                    if (immediate === true) {
                        setupStyles()
                    }
                    else {
                        this._partialPageStyleUpdateHandle = msSetImmediate(setupStyles)
                    }
                }
            }, _positionAndRenderBlock: function _positionAndRenderBlock(renderableBlock, context, hideInlineAds, columnCount, lastColumnStatus) {
                var block = renderableBlock.block;
                if (block.type === U.inlineAdBlockType && hideInlineAds) {
                    return
                }
                var renderer = this._getRenderer(renderableBlock);
                if (renderer) {
                    var attributes = block.attributes;
                    var element = renderer.render(renderableBlock, context);
                    var isAggregated = this._isAggregated(renderableBlock);
                    renderableBlock.element = element;
                    var isExclusionBlock = this._updateBlockExclusion(context, renderableBlock, isAggregated, columnCount, lastColumnStatus);
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (isTitle) {
                        updateImageUrl(renderableBlock)
                    }
                    U.assignLayout(renderableBlock, context);
                    if (!isTitle) {
                        renderer.applyLayout(renderableBlock, isAggregated, context)
                    }
                    this.appendElement(element);
                    if (isExclusionBlock) {
                        this._adjustPages(context);
                        lastColumnStatus.lastContentColumn = this.getLastColumnWithContent(context)
                    }
                    if (isTitle && block.type === U.titleTextBlockType) {
                        U.checkHeadlineForOverflow(element, context, attributes.textClassName)
                    }
                }
            }, _isAggregated: function _isAggregated(renderableBlock) {
                var isAggregated = false;
                var layout = renderableBlock.layout;
                if (layout) {
                    var zIndex = layout.zIndex;
                    isAggregated = (zIndex === 3)
                }
                return isAggregated
            }, _updateLastContentColumn: function _updateLastContentColumn(lastContentColumn) {
                var contentElements = this._contentElements;
                while (lastContentColumn < contentElements.length) {
                    var contentElement = contentElements[lastContentColumn + 1];
                    if (contentElement && !U.isContentElementEmpty(contentElement)) {
                        lastContentColumn = lastContentColumn + 1
                    }
                    else {
                        break
                    }
                }
                return lastContentColumn
            }, _updateBlockExclusion: function _updateBlockExclusion(context, renderableBlock, isAggregated, columnCount, lastColumnStatus) {
                if (!lastColumnStatus) {
                    return
                }
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var element = renderableBlock.element;
                var layout = renderableBlock.layout;
                var exclusion = renderableBlock.exclusion;
                var isInlineAd = renderableBlock.block.type === U.inlineAdBlockType;
                var column = 0;
                var newColumn = false;
                var height = 0;
                var totalHeight = 0;
                if (layout) {
                    column = U.convertGridColumnToColumnIndex(layout.column, columnCount);
                    height = layout.height
                }
                else if (exclusion) {
                    column = exclusion.column;
                    height = exclusion.height
                }
                lastColumnStatus.lastContentColumn = this._updateLastContentColumn(lastColumnStatus.lastContentColumn);
                if (isAggregated || column >= lastColumnStatus.lastContentColumn) {
                    WinJS.Utilities.removeClass(element, "exclusion");
                    var hideInlineAd = isInlineAd && lastColumnStatus.lastInlineAdColumn >= 0 && (height === 0 || (lastColumnStatus.lastInlineAdColumn + columnCount > lastColumnStatus.lastAggregatedColumn));
                    if (hideInlineAd) {
                        height = 0
                    }
                    else {
                        if (lastColumnStatus.lastAggregatedColumn === -1) {
                            lastColumnStatus.lastAggregatedColumn = lastColumnStatus.lastContentColumn + 1;
                            newColumn = true
                        }
                    }
                    totalHeight = lastColumnStatus.lastAggregatedColumnHeight + height;
                    if (totalHeight > columnHeight) {
                        lastColumnStatus.lastAggregatedColumnHeight = 0;
                        totalHeight = height;
                        lastColumnStatus.lastAggregatedColumn++;
                        newColumn = true
                    }
                    var newLayoutGridColumn = U.convertColumnIndexToGridColumn(lastColumnStatus.lastAggregatedColumn, columnCount);
                    if (layout) {
                        layout.column = newLayoutGridColumn;
                        layout.zIndex = 3;
                        layout.top = lastColumnStatus.lastAggregatedColumnHeight;
                        layout.rowAlign = "start";
                        var oldSpan = layout.columnSpan;
                        layout.columnSpan = 1;
                        layout.height = layout.height / oldSpan;
                        layout.width = layout.width / oldSpan;
                        if (hideInlineAd) {
                            layout.height = 0
                        }
                    }
                    if (exclusion) {
                        exclusion.column = lastColumnStatus.lastAggregatedColumn;
                        exclusion.columnSpan = 1;
                        exclusion.zIndex = 3;
                        exclusion.rowAlign = "start";
                        if (hideInlineAd) {
                            exclusion.height = 0
                        }
                    }
                    if (isInlineAd && !hideInlineAd) {
                        lastColumnStatus.lastInlineAdColumn = lastColumnStatus.lastAggregatedColumn
                    }
                    lastColumnStatus.lastAggregatedColumnHeight = totalHeight;
                    return false
                }
                else {
                    WinJS.Utilities.addClass(element, "exclusion");
                    if (layout) {
                        layout.zIndex = 2
                    }
                    if (exclusion) {
                        exclusion.zIndex = 2
                    }
                    return true
                }
            }, _renderAndLayoutEndUi: function _renderAndLayoutEndUi(context) {
                var renderData = context.renderData;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                var renderers = CommonJS.ArticleReader.SurfaceManager.endUiRenderers;
                this._cleanupSpacers(endRenderableBlocks);
                this._insertSpacers(context, this._numberOfEndRenderableBlocks(endRenderableBlocks));
                for (var i = 0, len = endRenderableBlocks.length; i < len; i++) {
                    var endRenderableBlock = endRenderableBlocks[i];
                    var block = endRenderableBlock.block;
                    var type = block.type;
                    var renderer = renderers[type];
                    if (renderer) {
                        var element = endRenderableBlock.element;
                        if (!element) {
                            element = renderer.render(endRenderableBlock, context);
                            this.appendBlock(endRenderableBlock, element)
                        }
                        element.setAttribute("data-block-visibility", "hidden");
                        var isVisible = renderer.layout(endRenderableBlock, this, context);
                        element.setAttribute("data-block-visibility", isVisible ? "shown" : "hidden");
                        U.updateLayout(endRenderableBlock, context)
                    }
                }
                this._computeEndPageStyles(context);
                var promise = WinJS.Promise.wrap(null);
                return promise
            }, _numberOfEndRenderableBlocks: function _numberOfEndRenderableBlocks(endRenderableBlocks) {
                var total = 0;
                for (var i = 0, len = endRenderableBlocks.length; i < len; i++) {
                    var renderableBlock = endRenderableBlocks[i];
                    if (renderableBlock) {
                        var block = renderableBlock.block;
                        if (block && block.type !== "CollapsedAd") {
                            total++
                        }
                    }
                }
                return total
            }, _cleanupSpacers: function _cleanupSpacers(endRenderableBlocks) {
                for (var i = 0, iLen = endRenderableBlocks.length; i < iLen; i++) {
                    var block = endRenderableBlocks[i];
                    if (block.block.type === spacerType) {
                        endRenderableBlocks.splice(i, 1);
                        iLen = iLen - 1;
                        i = i - 1
                    }
                }
            }, _insertSpacers: function _insertSpacers(context, extraColumns) {
                var auxiliaryData = context.auxiliaryData;
                var isPaginated = auxiliaryData.isPaginated;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                if (columnCount === 1) {
                    return
                }
                if (isPaginated) {
                    var pageManagers = this._pageManagers;
                    var lastPage = pageManagers[pageManagers.length - 1];
                    var emptyColumn = lastPage ? lastPage.getFirstEmptyColumn(context) : -1;
                    var totalPages = pageManagers.length;
                    var totalColumns = totalPages * columnCount;
                    if (emptyColumn === -1) {
                        emptyColumn = totalColumns
                    }
                    var actualColumns = emptyColumn + extraColumns;
                    if (actualColumns > totalColumns) {
                        totalColumns += columnCount;
                        totalPages = totalPages + 1
                    }
                    if (actualColumns !== totalColumns) {
                        var partialPageBoundary = actualColumns - columnCount;
                        var renderData = context.renderData;
                        var endRenderableBlocks = renderData.endRenderableBlocks;
                        if (!endRenderableBlocks) {
                            endRenderableBlocks = [];
                            renderdata.endRenderableBlocks = endRenderableBlocks
                        }
                        var spacers = 0;
                        var addedSpacer = false;
                        var renderableBlocks = renderData.renderableBlocks;
                        do {
                            addedSpacer = false;
                            for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                                var renderableBlock = renderableBlocks[i];
                                var columnIndex = -1;
                                var columnSpan = 1;
                                if (renderableBlock.exclusion) {
                                    columnIndex = renderableBlock.exclusion.column;
                                    columnSpan = renderableBlock.exclusion.columnSpan
                                }
                                else if (renderableBlock.layout) {
                                    columnIndex = U.convertGridColumnToColumnIndex(renderableBlock.layout.column, columnCount);
                                    columnSpan = U.convertGridColumnSpanToColumnSpan(renderableBlock.layout.columnSpan)
                                }
                                if (columnSpan > 1) {
                                    var spanEndColumn = columnIndex + (columnSpan - 1);
                                    if (columnIndex < partialPageBoundary && spanEndColumn >= partialPageBoundary) {
                                        spacers = spacers + 1;
                                        addedSpacer = true;
                                        partialPageBoundary = partialPageBoundary + 1;
                                        endRenderableBlocks.unshift(this._createSpacer());
                                        break
                                    }
                                }
                            }
                        } while (addedSpacer && (spacers + actualColumns) !== totalColumns);
                        if (spacers > 0) {
                            U.sortRenderableBlocks(endRenderableBlocks)
                        }
                    }
                }
            }, _createSpacer: function _createSpacer() {
                return {
                    block: { type: spacerType }, position: -15, layout: null, element: null, exclusion: null
                }
            }, _computeEndPageStyles: function _computeEndPageStyles(context) {
                var pageManagers = this._pageManagers;
                var lastPage = pageManagers[pageManagers.length - 1];
                var auxiliaryData = context.auxiliaryData;
                var isPaginated = auxiliaryData.isPaginated;
                var gridOptions = context.gridOptions;
                var columnCount = gridOptions.columnCount;
                var emptyColumn = lastPage ? lastPage.getFirstEmptyColumn(context) : -1;
                var totalPages = pageManagers.length;
                var lastColumn = (totalPages * columnCount) - 1;
                this._hasPartialPage = false;
                var totalColumns = 0;
                if (emptyColumn !== -1) {
                    var endColumn = emptyColumn - 1;
                    if (endColumn !== lastColumn && isPaginated && totalPages > 1) {
                        this._hasPartialPage = true;
                        var style = "";
                        if (totalPages > 2) {
                            style = this._originalColumnsStyle.replace("[1000]", "[" + (totalPages - 2) + "]") + " ";
                            totalColumns = this._columnsPerPage * (totalPages - 2)
                        }
                        this._surface.style.msGridColumns = style + this._computePartialLastPageColumnStyles(context, totalColumns, columnCount * 2 - (lastColumn - endColumn));
                        this._partialPageLeftGridIndex = U.convertColumnIndexToGridColumn(endColumn - columnCount, columnCount);
                        if (auxiliaryData.articleHeader.enabled) {
                            while (this._headerBlockElements.length >= totalPages) {
                                var headerElt = this._headerBlockElements.pop();
                                headerElt.setAttribute("data-block-visibility", "hidden");
                                headerElt.removeNode(true)
                            }
                            if (totalPages > 2) {
                                this._lastFullPageTitle = this._headerBlockElements[totalPages - 2]
                            }
                            var gridColumnStart = this._partialPageLeftGridIndex + 2;
                            var gridColumnEnd = U.convertColumnIndexToGridColumn(endColumn, columnCount);
                            var columnSpan = gridColumnEnd - gridColumnStart - 1;
                            this._partialPageTitle = this._insertDynamicHeaderTitle(gridColumnStart, columnSpan, context)
                        }
                        this._partialPageOverlay = this._insertDynamicColumnMarginElement(this._partialPageLeftGridIndex);
                        this._partialPageOverlay.style.opacity = 0;
                        this._partialPageOverlay.style.msTransformProperty = "opacity";
                        this._partialPageOverlay.style.msTransitionDuration = "0.1s";
                        this._partialPageAd = null;
                        var i,
                            iLen;
                        var ads = this._surface.querySelectorAll(".inlineAdBlock");
                        for (i = 0, iLen = ads.length; i < iLen; i++) {
                            var ad = ads[i];
                            if (ad.style.msGridColumn === this._partialPageLeftGridIndex.toString()) {
                                var adHolder = ad.querySelector(".platformAdWrapper");
                                if (adHolder) {
                                    this._partialPageAd = adHolder
                                }
                                break
                            }
                        }
                        this._partialPageVideo = null;
                        var videos = this._surface.querySelectorAll(".inlineVideoBlock");
                        for (i = 0, iLen = videos.length; i < iLen; i++) {
                            var video = videos[i];
                            if (video.style.msGridColumn === this._partialPageLeftGridIndex.toString()) {
                                this._partialPageVideo = video;
                                break
                            }
                        }
                    }
                }
                else {
                    this._surface.style.msGridColumns = this._originalColumnsStyle;
                    if (this._partialPageOverlay) {
                        this._partialPageOverlay.style.opacity = 0;
                        this._partialPageOverlay.style.msGridRowSpan = 1
                    }
                    if (this._partialPageAd) {
                        this._partialPageAd.style.visibility = "visible"
                    }
                    if (this._partialPageVideo) {
                        this._partialPageVideo.style.visibility = "visible"
                    }
                    if (auxiliaryData.articleHeader.enabled) {
                        lastPage.adjustLastPageHeader(context)
                    }
                }
            }, _computePartialLastPageColumnStyles: function _computePartialLastPageColumnStyles(context, totalColumns, columns) {
                var gridOptions = context.gridOptions;
                var columnMargin = gridOptions.columnMargin;
                var columnWidth = gridOptions.columnWidth;
                var leftMargin = gridOptions.leftMargin;
                var rightMargin = gridOptions.rightMargin;
                var columnCount = gridOptions.columnCount;
                var columnStyles = [];
                columnStyles.push(leftMargin + "px");
                for (var i = 0; i < columns; i++) {
                    if (i === columnCount) {
                        columnStyles.push("0px")
                    }
                    columnStyles.push(columnWidth + "px");
                    columnStyles.push(columnMargin + "px")
                }
                columnStyles.pop();
                columnStyles.push(rightMargin + "px");
                return columnStyles.join(" ")
            }, _insertDynamicHeaderTitle: function _insertDynamicHeaderTitle(gridColumnIndex, columnSpan, context) {
                var element = this._surface.querySelector(".partialPageHeaderTitle");
                if (!element) {
                    element = document.createElement("div");
                    WinJS.Utilities.addClass(element, "partialPageHeaderTitle");
                    this._surface.appendChild(element)
                }
                var header = new CommonJS.ArticleReader.Header(element, { context: context });
                U.placeInGrid(element, gridColumnIndex, columnSpan, "", 1, 1, "");
                element.style.visibility = "hidden";
                header.setColumnSpan(columnSpan, context);
                var totalPages = this._pageManagers.length;
                header.pageNumberString = U.convertPageNumberDataToString(totalPages - 1, totalPages);
                return element
            }, _insertDynamicColumnMarginElement: function _insertDynamicColumnMarginElement(gridColumnIndex) {
                var element = this._surface.querySelector(".partialPageColumnOverlay");
                if (!element) {
                    element = document.createElement("div");
                    WinJS.Utilities.addClass(element, "partialPageColumnOverlay");
                    this._surface.appendChild(element)
                }
                element.setAttribute("data-block-visibility", "hidden");
                U.placeInGrid(element, gridColumnIndex, 2, "", 1, 4, "");
                element.setAttribute("data-block-visibility", "shown");
                element.style.zIndex = 10;
                return element
            }, _determineContentDensity: function _determineContentDensity(context) {
                var surface = this._surface;
                var contentElements = this._contentElements;
                var auxiliaryData = context.auxiliaryData;
                var flowId = auxiliaryData.flowId;
                var contentElement = U.createContentElement(flowId);
                contentElements.push(contentElement);
                surface.appendChild(contentElement);
                var style = contentElement.style;
                style.msGridRow = 2;
                style.msGridColumn = 2;
                style.msGridRowSpan = 2;
                style.msGridColumnSpan = 1;
                var charCount = 0;
                var ranges = contentElement.msGetRegionContent();
                if (ranges) {
                    for (var i = 0, len = ranges.length; i < len; i++) {
                        var range = ranges[i];
                        charCount = charCount + range.toString().length
                    }
                }
                var charactersPerColumn = charCount;
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var columnWidth = gridOptions.columnWidth;
                var density = charactersPerColumn / (columnHeight * columnWidth);
                return density
            }, _getExclusionsColumnCount: function _getExclusionsColumnCount(exclusions, columnHeight) {
                var startMap = {};
                var endMap = {};
                var maxColumn = -1;
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var exclusion = exclusions[i];
                    var rowAlign = exclusion.rowAlign;
                    var column = exclusion.column;
                    var columnSpan = exclusion.columnSpan;
                    var height = exclusion.height;
                    maxColumn = Math.max(maxColumn, column + columnSpan - 1);
                    var map = (rowAlign === "end" ? endMap : startMap);
                    for (var j = column; j < column + columnSpan; j++) {
                        var currentColumn = j;
                        var currentHeight = map[currentColumn] || 0;
                        map[currentColumn] = Math.max(currentHeight, height)
                    }
                }
                var columns = 0;
                for (var k = 0; k <= maxColumn; k++) {
                    var startHeight = startMap[k] || 0;
                    var endHeight = endMap[k] || 0;
                    var sumHeight = Math.min(startHeight + endHeight, columnHeight);
                    columns += sumHeight / columnHeight
                }
                return columns
            }, _adjustPages: function _adjustPages(context) {
                var pageManagers = this._pageManagers;
                var lastPage;
                while (true) {
                    lastPage = pageManagers[pageManagers.length - 1];
                    var isEmpty = lastPage && lastPage.isEmpty(context);
                    if (isEmpty) {
                        this._removeLastPage(context)
                    }
                    else {
                        break
                    }
                }
                while (true) {
                    lastPage = pageManagers[pageManagers.length - 1];
                    var isOverflowing = lastPage && lastPage.isOverflowing(context);
                    if (isOverflowing) {
                        var pageManager = this._addPage(context);
                        pageManager.associateLayoutWithElements(context);
                        lastPage.adjustLastPageHeader(context)
                    }
                    else {
                        break
                    }
                }
            }, _updatePageNumberData: function _updatePageNumberData(context) {
                var pageManagers = this._pageManagers;
                var pageCount = pageManagers.length;
                for (var i = 0; i < pageCount; i++) {
                    var pageManager = pageManagers[i];
                    pageManager.pageNumberString = U.convertPageNumberDataToString(i, pageCount)
                }
            }, _addPage: function _addPage(context) {
                var contentElements = this._contentElements;
                var headerBlockElements = this._headerBlockElements;
                var footerBlockElements = this._footerBlockElements;
                var gridOptions = context.gridOptions;
                var surface = this._surface;
                var pageManagers = this._pageManagers;
                var auxiliaryData = context.auxiliaryData;
                var pageIndex = pageManagers.length;
                var pageManager = new CommonJS.ArticleReader.PageManager({
                    pageIndex: pageIndex, pageNumberString: "", contentElements: contentElements, headerBlockElements: headerBlockElements, footerBlockElements: footerBlockElements, gridOptions: gridOptions, surfaceManager: this
                });
                pageManagers.push(pageManager);
                return pageManager
            }, _removeLastPage: function _removeLastPage(context) {
                var pageManagers = this._pageManagers;
                var pageManager = pageManagers.pop();
                pageManager.destroy(context);
                var lastPageManager = pageManagers[pageManagers.length - 1];
                lastPageManager.adjustLastPageHeader(context)
            }, _updateSurfaceSize: function _updateSurfaceSize(context, auto) {
                var surface = this._surface;
                if (auto) {
                    surface.style.width = ""
                }
                else {
                    var width = this.getWidth(context);
                    surface.style.width = width + "px"
                }
            }, _createBlockElements: function _createBlockElements(context) {
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var surface = this._surface;
                var gridOptions = context.gridOptions;
                for (var i = 0, ilen = renderableBlocks.length; i < ilen; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var element = renderableBlock.element;
                    if (!element) {
                        element = this._createBlockElement(renderableBlock, context);
                        this.appendBlock(renderableBlock, element)
                    }
                }
            }, _createBlockElement: function _createBlockElement(renderableBlock, context) {
                var renderer = this._getRenderer(renderableBlock);
                return renderer && renderer.render(renderableBlock, context)
            }, _hideAllPageElements: function _hideAllPageElements() {
                this._hideAllHeaderBlocks();
                var contentElements = this._contentElements;
                for (var i = 0, leni = contentElements.length; i < leni; i++) {
                    var contentElement = contentElements[i];
                    contentElement.setAttribute("data-block-visibility", "hidden")
                }
                var footerBlockElements = this._footerBlockElements;
                for (var j = 0, lenj = footerBlockElements.length; j < lenj; j++) {
                    var footerBlockElement = footerBlockElements[j];
                    footerBlockElement.setAttribute("data-block-visibility", "hidden")
                }
            }, _hideAllHeaderBlocks: function _hideAllHeaderBlocks() {
                var headerBlockElements = this._headerBlockElements;
                while (headerBlockElements.length > 0) {
                    var headerElt = headerBlockElements.pop();
                    headerElt.setAttribute("data-block-visibility", "hidden");
                    headerElt.removeNode(true)
                }
                var partialPageHeader = this._partialPageTitle;
                if (partialPageHeader) {
                    partialPageHeader.setAttribute("data-block-visibility", "hidden");
                    partialPageHeader.removeNode(true)
                }
                this._partialPageTitle = null
            }, _hideAllBlocks: function _hideAllBlocks(context) {
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                this._hideRenderableBlocks(renderableBlocks);
                this._hideRenderableBlocks(endRenderableBlocks)
            }, _hideRenderableBlocks: function _hideRenderableBlocks(renderableBlocks) {
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var isTitle = U.isTitleBlock(renderableBlock);
                    if (!isTitle) {
                        var element = renderableBlock.element;
                        if (element) {
                            element.setAttribute("data-block-visibility", "hidden")
                        }
                    }
                }
            }, _hideEndRenderableBlocks: function _hideEndRenderableBlocks(context) {
                var renderData = context.renderData;
                var endRenderableBlocks = renderData.endRenderableBlocks;
                this._hideRenderableBlocks(endRenderableBlocks)
            }, _aggregateOrphans: function _aggregateOrphans(context) {
                var surface = this._surface;
                var contentElements = this._contentElements;
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var columnCount = gridOptions.columnCount;
                this._adjustPages(context);
                var lastColumnWithContent = -1;
                var newLastColumnWithContent = this.getLastColumnWithContent(context);
                var orphansData = this._getOrphansData(context, lastColumnWithContent);
                var orphanRenderableBlocks = orphansData.orphanRenderableBlocks;
                do {
                    for (var i = 0, len = orphanRenderableBlocks.length; i < len; i++) {
                        var orphanRenderableBlock = orphanRenderableBlocks[i];
                        var element = orphanRenderableBlock.element;
                        var shouldHandleOrphan = this._shouldHandleOrphan(orphanRenderableBlock, newLastColumnWithContent);
                        if (!shouldHandleOrphan) {
                            if (element) {
                                WinJS.Utilities.addClass(element, "exclusion")
                            }
                        }
                    }
                    lastColumnWithContent = newLastColumnWithContent;
                    orphansData = this._getOrphansData(context, lastColumnWithContent);
                    orphanRenderableBlocks = orphansData.orphanRenderableBlocks;
                    this._adjustPages(context);
                    newLastColumnWithContent = this.getLastColumnWithContent(context)
                } while (newLastColumnWithContent !== lastColumnWithContent);
                context.auxiliaryData.instrumentationData.trailingMediaBlockCount = orphansData.trailingMediaBlockCount;
                var aggregationColumn = lastColumnWithContent;
                var lastColumnWithExclusion = this._getLastColumnWithExclusion(context);
                var emptyColumn = Math.max(lastColumnWithContent, lastColumnWithExclusion) + 1;
                var limits = U.getColumnLimits(context, aggregationColumn, orphanRenderableBlocks);
                var marginTop = limits.top;
                var marginBottom = limits.bottom;
                var first = true;
                this._hideRenderableBlocks(orphanRenderableBlocks);
                for (var i = 0, len = orphanRenderableBlocks.length; i < len; i++) {
                    var orphanRenderableBlock = orphanRenderableBlocks[i];
                    if (orphanRenderableBlock.exclusion.height === 0) {
                        continue
                    }
                    var element = orphanRenderableBlock.element;
                    element.setAttribute("data-block-visibility", "shown");
                    this._applyAggregation(orphanRenderableBlock, true);
                    var height = this._prepareForAggregation(orphanRenderableBlock, columnHeight, emptyColumn, context);
                    if (first) {
                        first = false;
                        height = this._aggregate(orphanRenderableBlock, aggregationColumn, marginBottom, context, "end");
                        WinJS.Utilities.addClass(element, "exclusion");
                        var isOverflowing = this.isColumnOverflowing(aggregationColumn, context);
                        if (isOverflowing) {
                            aggregationColumn++;
                            limits = U.getColumnLimits(context, aggregationColumn, orphanRenderableBlocks);
                            marginTop = limits.top;
                            height = this._aggregate(orphanRenderableBlock, aggregationColumn, marginTop, context, "start");
                            WinJS.Utilities.removeClass(element, "exclusion");
                            marginTop += height
                        }
                        else {
                            aggregationColumn++;
                            limits = U.getColumnLimits(context, aggregationColumn, orphanRenderableBlocks);
                            marginTop = limits.top
                        }
                        U.updateLayout(orphanRenderableBlock, context);
                        continue
                    }
                    if (marginTop + height > columnHeight - limits.bottom) {
                        aggregationColumn++;
                        limits = U.getColumnLimits(context, aggregationColumn, orphanRenderableBlocks);
                        marginTop = limits.top
                    }
                    height = this._aggregate(orphanRenderableBlock, aggregationColumn, marginTop, context, "start");
                    U.updateLayout(orphanRenderableBlock, context);
                    marginTop += height
                }
            }, _getOrphansData: function _getOrphansData(context, lastColumnWithContent) {
                var orphanRenderableBlocks = [];
                var actions;
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                var trailingMediaBlockCount = 0;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var element = renderableBlock.element;
                    var isTitle = U.isTitleBlock(renderableBlock);
                    var shouldHandleOrphan = !isTitle && this._shouldHandleOrphan(renderableBlock, lastColumnWithContent);
                    if (shouldHandleOrphan) {
                        if (element) {
                            WinJS.Utilities.removeClass(element, "exclusion")
                        }
                        orphanRenderableBlocks.push(renderableBlock);
                        trailingMediaBlockCount++
                    }
                }
                var orphansData = {
                    orphanRenderableBlocks: orphanRenderableBlocks, trailingMediaBlockCount: trailingMediaBlockCount
                };
                return orphansData
            }, _aggregate: function _aggregate(renderableBlock, column, margin, context, rowAlign) {
                var exclusion = renderableBlock.exclusion;
                var element = renderableBlock.element;
                var gridOptions = context.gridOptions;
                var columnHeight = gridOptions.columnHeight;
                var columnCount = gridOptions.columnCount;
                var columnSpan = 1;
                exclusion.column = column;
                exclusion.columnSpan = columnSpan;
                exclusion.rowAlign = rowAlign;
                exclusion.height = exclusion.height === 0 ? 0 : columnHeight;
                var gridColumn = U.convertColumnIndexToGridColumn(column, columnCount);
                var gridColumnSpan = columnSpan * 2 - 1;
                var style = element.style;
                style.msGridColumn = gridColumn;
                style.msGridColumnSpan = gridColumnSpan;
                U.setRowAlign(element, rowAlign);
                this._applyAggregation(renderableBlock, false, margin, rowAlign);
                var renderer = this._getRenderer(renderableBlock);
                renderer.applyLayout(renderableBlock, true, context);
                var height = U.setFixedElementHeight(element);
                return height
            }, _prepareForAggregation: function _prepareForAggregation(renderableBlock, columnHeight, emptyColumn, context) {
                var gridOptions = context.gridOptions;
                var newExclusion = {
                    column: emptyColumn, columnSpan: 1, rowAlign: "start", height: renderableBlock.exclusion.height === 0 ? 0 : columnHeight
                };
                renderableBlock.exclusion = newExclusion;
                U.assignExclusion(renderableBlock, context);
                var renderer = this._getRenderer(renderableBlock);
                renderer.applyLayout(renderableBlock, true, context);
                var height = U.setFixedElementHeight(renderableBlock.element);
                return height
            }, _applyAggregation: function _applyAggregation(renderableBlock, reset, margin, rowAlign) {
                var element = renderableBlock.element;
                var style = element.style;
                style.marginTop = "";
                style.marginBottom = "";
                if (reset) {
                    style.zIndex = 2;
                    style.height = "";
                    style.width = ""
                }
                else {
                    style.zIndex = 3;
                    var isMarginBottom = rowAlign === "end" ? true : false;
                    if (isMarginBottom) {
                        style.marginBottom = margin + "px"
                    }
                    else {
                        style.marginTop = margin + "px"
                    }
                }
            }, _shouldHandleOrphan: function _shouldHandleOrphan(renderableBlock, lastColumnWithContent) {
                var shouldHandleOrphan = false;
                var contentElements = this._contentElements;
                var isAggregatable = this._isAggregatable(renderableBlock);
                if (isAggregatable) {
                    var exclusion = renderableBlock.exclusion;
                    if (exclusion) {
                        var column = exclusion.column;
                        var columnSpan = exclusion.columnSpan;
                        for (var j = column, jlen = column + columnSpan; j < jlen; j++) {
                            var contentElement = contentElements[j];
                            if (!contentElement) {
                                shouldHandleOrphan = true;
                                break
                            }
                            else {
                                var onLastColumn = (j === lastColumnWithContent && exclusion.rowAlign === "end" && columnSpan === 1);
                                var beyondLastColumn = (j > lastColumnWithContent);
                                var visibility = contentElement.getAttribute("data-block-visibility");
                                var shown = (visibility === "shown");
                                if (shown && (onLastColumn || beyondLastColumn)) {
                                    shouldHandleOrphan = true;
                                    break
                                }
                            }
                        }
                    }
                }
                return shouldHandleOrphan
            }, _getLastColumnWithExclusion: function _getLastColumnWithExclusion(context) {
                var exclusions = U.getAllExclusions(context);
                var index = 0;
                for (var i = 0, len = exclusions.length; i < len; i++) {
                    var exclusion = exclusions[i];
                    index = Math.max(index, exclusion.column + exclusion.columnSpan - 1)
                }
                return index
            }, _isAggregatable: function _isAggregatable(renderableBlock) {
                var block = renderableBlock.block;
                var type = block.type;
                var isTitle = U.isTitleBlock(renderableBlock);
                var isAggregatable = !isTitle && (CommonJS.ArticleReader.SurfaceManager.aggregatableTypes.indexOf(type) > -1);
                return isAggregatable
            }, _layoutTitle: function _layoutTitle(context) {
                var renderData = context.renderData;
                var renderableTitle = renderData.renderableTitle;
                var titleRenderableBlocks = renderData.titleRenderableBlocks;
                var style = renderableTitle.style;
                var titleRenderer = CommonJS.ArticleReader.SurfaceManager.titleRenderers[style];
                titleRenderer.layout(titleRenderableBlocks, context);
                for (var k in titleRenderableBlocks) {
                    var titleRenderableBlock = titleRenderableBlocks[k];
                    U.updateLayout(titleRenderableBlock, context);
                    updateImageUrl(titleRenderableBlock)
                }
            }, _updateLayoutHints: function _updateLayoutHints(context) {
                var layoutData = context.layoutData;
                var pageManagers = this._pageManagers;
                var pageCount = pageManagers.length;
                layoutData.pageCount = pageCount
            }, _createPages: function _createPages(context) {
                var layoutData = context.layoutData;
                var pageCount = layoutData.pageCount;
                var pageManagers = this._pageManagers;
                while (pageManagers.length < pageCount) {
                    this._addPage(context)
                }
                while (pageManagers.length > pageCount) {
                    this._removeLastPage(context)
                }
            }, _getRenderer: function _getRenderer(renderableBlock) {
                var block = renderableBlock.block;
                var type = block.type;
                var renderers = CommonJS.ArticleReader.SurfaceManager.blockRenderers;
                var renderer = renderers[type] || renderers["Null"];
                return renderer
            }, _getType: function _getType(renderableBlock) {
                var block = renderableBlock.block;
                var type = block.type;
                return type
            }, _resetLayout: function _resetLayout(context) {
                var renderData = context.renderData;
                var renderableBlocks = renderData.renderableBlocks;
                for (var i = 0, len = renderableBlocks.length; i < len; i++) {
                    var renderableBlock = renderableBlocks[i];
                    var element = renderableBlock.element;
                    if (!element) {
                        element = this._createBlockElement(renderableBlock, context);
                        this.appendBlock(renderableBlock, element)
                    }
                    U.resetLayout(renderableBlock, context);
                    element.setAttribute("data-block-visibility", "hidden")
                }
            }
        }, {
            blockRenderers: {
                InlineImage: CommonJS.ArticleReader.InlineImageRenderer, InlineSlideshow: CommonJS.ArticleReader.InlineSlideshowRenderer, FocusImage: CommonJS.ArticleReader.InlineImageRenderer, InlineVideo: CommonJS.ArticleReader.InlineVideoRenderer, External: CommonJS.ArticleReader.ExternalRenderer, InlineAd: CommonJS.ArticleReader.InlineAdRenderer, Text: CommonJS.ArticleReader.TextRenderer, Image: CommonJS.ArticleReader.ImageRenderer, Rect: CommonJS.ArticleReader.RectRenderer, Growl: CommonJS.ArticleReader.GrowlRenderer, Null: CommonJS.ArticleReader.NullRenderer
            }, endUiRenderers: {
                EndAd: CommonJS.ArticleReader.EndAdRenderer, CollapsedAd: CommonJS.ArticleReader.CollapsedAdRenderer, Actions: CommonJS.ArticleReader.ActionsRenderer, Referral: CommonJS.ArticleReader.ReferralRenderer, PartialPageSpacer: CommonJS.ArticleReader.PartialPageSpacerRenderer
            }, titleRenderers: {
                1: CommonJS.ArticleReader.TitleStyle1Renderer, 2: CommonJS.ArticleReader.TitleStyle2Renderer, 9: CommonJS.ArticleReader.TitleStyle9Renderer, 10: CommonJS.ArticleReader.TitleStyle10Renderer, 100: CommonJS.ArticleReader.TitleStyle100Renderer, 200: CommonJS.ArticleReader.TitleStyle200Renderer, 900: CommonJS.ArticleReader.TitleStyle900Renderer
            }, aggregatableTypes: ["InlineImage", "InlineSlideshow", "FocusImage", "InlineVideo", "External", U.inlineAdBlockType,]
        })
    })
})();
(function _AdContainer_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        AdContainer: WinJS.Class.define(function _AdContainer_13(elt, options) {
            elt = this._elt = elt ? elt : document.createElement("div");
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            WinJS.Utilities.addClass(elt, "adContainer");
            var controlOptions = this._controlOptions = options.controlOptions;
            var controlType = this._controlType = options.controlType;
            this._isAdInstantiated = false
        }, {
            _elt: null, _adControl: null, _controlOptions: null, _controlType: null, _isAdInstantiated: null, element: {
                get: function get() {
                    return this._elt
                }
            }, instantiateAd: function instantiateAd() {
                var isAdInstantiated = this._isAdInstantiated;
                if (!isAdInstantiated) {
                    this._isAdInstantiated = true;
                    var elt = this._elt;
                    var controlOptions = this._controlOptions;
                    var controlType = this._controlType;
                    var adElt = document.createElement("div");
                    WinJS.Utilities.addClass(adElt, "ad");
                    elt.appendChild(adElt);
                    var adControlElt = document.createElement("div");
                    var adControl = this._adControl = PlatformJS.Utilities.createObject(controlType, adControlElt, controlOptions);
                    if (adControl) {
                        adElt.appendChild(adControlElt)
                    }
                }
                else {
                    this._refreshAd()
                }
            }, dispose: function dispose() {
                var adControl = this._adControl;
                if (adControl && adControl.dispose) {
                    adControl.dispose()
                }
            }, relayout: function relayout() {
                var adControl = this._adControl;
                if (adControl && adControl.relayout) {
                    adControl.relayout()
                }
            }, _refreshAd: function _refreshAd() {
                var adControl = this._adControl;
                if (adControl) {
                    adControl.refresh()
                }
            }
        })
    })
})();
(function _InterstitialAd_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        InterstitialAd: WinJS.Class.mix(WinJS.Class.define(function _InterstitialAd_14(elt, options) {
            elt = this._elt = elt || document.createElement("div");
            elt.winControl = this;
            CommonJS.Utils.markDisposable(elt);
            WinJS.Utilities.addClass(elt, "interstitialAd");
            this._adContainer = null;
            this._isRendered = false;
            this._gridOptions = null;
            this._instrumentationData = {
                content: {
                    sourceName: null, partnerCode: null, contentId: null, type: Microsoft.Bing.AppEx.Telemetry.ContentType.article, date: new Date(0), uri: null, slug: null, isSummary: false, worth: null, isAd: true, adCampaign: null, partnerUri: null
                }
            };
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleinteractive"))
        }, {
            _elt: null, _adContainer: null, _isRendered: null, _instrumentationData: null, _gridOptions: null, element: {
                get: function get() {
                    return this._elt
                }
            }, isRendered: {
                get: function get() {
                    return this._isRendered
                }
            }, articleType: {
                get: function get() {
                    return "interstitialAd"
                }
            }, dispose: function dispose() {
                var adContainer = this._adContainer;
                if (adContainer) {
                    adContainer.dispose()
                }
            }, getHeader: function getHeader() {
                return null
            }, getInstrumentationData: function getInstrumentationData() {
                return this._instrumentationData
            }, getElementsForPagination: function getElementsForPagination() {
                return []
            }, getRenderData: function getRenderData() {
                return {}
            }, getLayout: function getLayout() {
                return {}
            }, getWidth: function getWidth() {
                var gridOptions = this._gridOptions;
                var width = gridOptions.pageWidth;
                return width
            }, render: function render(data, renderOptions) {
                var elt = this._elt;
                var metadata = data.metadata;
                var adMetadata = metadata.adMetadata;
                var parsedAdMetadata = JSON.parse(adMetadata);
                var controlType = parsedAdMetadata.controlType;
                var controlOptions = parsedAdMetadata.controlOptions;
                this._gridOptions = renderOptions.gridOptions;
                var that = this;
                var renderPromise = new WinJS.Promise(function _InterstitialAd_171(complete, error) {
                    if (controlOptions.adOptions) {
                        var adOptions = controlOptions.adOptions;
                        if (adOptions.landscapeOptions) {
                            adOptions.landscapeOptions.completionHandler = complete;
                            adOptions.landscapeOptions.errorHandler = error
                        }
                        if (adOptions.portraitOptions) {
                            adOptions.portraitOptions.completionHandler = complete;
                            adOptions.portraitOptions.errorHandler = error
                        }
                    }
                    var adContainer = that._adContainer = new CommonJS.ArticleReader.AdContainer(null, {
                        controlOptions: controlOptions, controlType: controlType
                    });
                    var adContainerElt = adContainer.element;
                    elt.appendChild(adContainerElt);
                    adContainer.instantiateAd()
                }).then(function _InterstitialAd_198() {
                    that._isRendered = true
                });
                renderPromise = renderPromise.then(function _InterstitialAd_203() {
                    that.dispatchEvent("articleinteractive", {})
                });
                return renderPromise
            }, relayout: function relayout(gridOptions) {
                var adContainer = this._adContainer;
                if (adContainer) {
                    adContainer.relayout(gridOptions)
                }
                return WinJS.Promise.wrap(null)
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                return WinJS.Promise.wrap()
            }, getPageCount: function getPageCount() {
                return 1
            }, articleFocusLost: function articleFocusLost() { }, updatePartialPageColumnsStyle: function updatePartialPageColumnsStyle(showing, transitionStep) { }
        }, {}), WinJS.Utilities.eventMixin)
    })
})();
(function appexCommonControlsArticleReaderWebViewInit() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ArticleReaderWebView: WinJS.Class.derive(CommonJS.UI.WebView, function articleReaderWebViewCtor(elt, options) {
            CommonJS.UI.WebView.call(this, elt, options);
            this._instrumentationData = {
                content: {
                    sourceName: null, partnerCode: null, contentId: null, type: Microsoft.Bing.AppEx.Telemetry.ContentType.article, date: new Date(0), uri: null, slug: null, isSummary: false, worth: Microsoft.Bing.AppEx.Telemetry.ContentWorth.free, isAd: false, adCampaign: null, partnerUri: null
                }, isWebView: true
            };
            this._header = null;
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articleinteractive"))
        }, {
            _instrumentationData: null, _header: null, isRendered: {
                get: function get() {
                    return this._isRendered
                }
            }, articleType: {
                get: function get() {
                    return "webpage"
                }
            }, getHeader: function getHeader() {
                return this._header
            }, getInstrumentationData: function getInstrumentationData() {
                return this._instrumentationData
            }, getElementsForPagination: function getElementsForPagination() {
                return []
            }, getRenderData: function getRenderData() {
                return {}
            }, getLayout: function getLayout() {
                return {}
            }, getWidth: function getWidth() {
                var clientWidth = this._webView && this._webView.clientWidth;
                if (clientWidth) {
                    return clientWidth
                }
                return 0
            }, relayout: function relayout(gridOptions) {
                var that = this;
                return new WinJS.Promise(function _WebView_251(complete) {
                    that._setLayout(gridOptions);
                    complete()
                })
            }, setTextAttributes: function setTextAttributes(textAttributes) {
                return WinJS.Promise.wrap()
            }, getPageCount: function getPageCount() {
                return 1
            }, articleFocusLost: function articleFocusLost() { }, updatePartialPageColumnsStyle: function updatePartialPageColumnsStyle(showing, transitionStep) { }, render: function render(articleId, renderOptions) {
                this._header = {
                    snippet: null, headline: null, publisherName: null, author: null, date: null, sharingUrl: articleId
                };
                this._instrumentationData.content.uri = articleId;
                return CommonJS.UI.WebView.prototype.render.call(this, articleId, renderOptions)
            }, _preprocessRenderData: function _preprocessRenderData() {
                this._header.headline = this._webView.documentTitle
            }
        }, {})
    })
})();
(function _DisposalManager_7() {
    "use strict";
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        DisposalManager: WinJS.Class.mix(WinJS.Class.define(function _DisposalManager_13(options) {
            this._disposedDelegates = [];
            this._articleFocusLostDelegates = [];
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("disposed"));
            Object.defineProperties(this, WinJS.Utilities.createEventProperties("articlefocuslost"))
        }, {
            _disposedDelegates: null, _articleFocusLostDelegates: null, dispose: function dispose() {
                var disposedDelegates = this._disposedDelegates;
                for (var i = 0, leni = disposedDelegates.length; i < leni; i++) {
                    var disposedDelegate = disposedDelegates[i];
                    this.removeEventListener("disposed", disposedDelegate)
                }
                var articleFocusLostDelegates = this._articleFocusLostDelegates;
                for (var j = 0, lenj = articleFocusLostDelegates.length; j < lenj; j++) {
                    var articleFocusLostDelegate = articleFocusLostDelegates[j];
                    this.removeEventListener("articlefocuslost", articleFocusLostDelegate)
                }
            }, addDisposedDelegate: function addDisposedDelegate(delegate) {
                var disposedDelegates = this._disposedDelegates;
                disposedDelegates.push(delegate);
                this.addEventListener("disposed", delegate)
            }, addArticleFocusLostDelegate: function addArticleFocusLostDelegate(delegate) {
                var articleFocusLostDelegates = this._articleFocusLostDelegates;
                articleFocusLostDelegates.push(delegate);
                this.addEventListener("articlefocuslost", delegate)
            }, runAllDisposedDelegates: function runAllDisposedDelegates() {
                this.dispatchEvent("disposed")
            }, runAllArticleFocusLostDelegates: function runAllArticleFocusLostDelegates() {
                this.dispatchEvent("articlefocuslost")
            }
        }, {}), WinJS.Utilities.eventMixin)
    })
})();
(function DebugUtils_init() {
    "use strict";
    if (!PlatformJS.isDebug) {
        return
    }
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        DebugUtils: WinJS.Class.define(function DebugUtils_ctor() { }, {}, {
            loadArticle: function loadArticle(button) {
                if (CommonJS.ArticleReader.ArticleManager.debugArticleData) {
                    CommonJS.ArticleReader.ArticleManager.debugArticleData = null;
                    try {
                        new CommonJS.UI.MessageDialog({
                            title: "Article Reset", message: "Articles will load as usual", styleClass: "fre"
                        }).showAsync().then(function buttonLoadArticle_onClick_articleReset() {
                            button.label = "Load Article"
                        })
                    }
                    catch (e) { }
                }
                else {
                    var undoData = CommonJS.ArticleReader.ArticleManager.debugArticleData;
                    var picker = new Windows.Storage.Pickers.FileOpenPicker;
                    picker.fileTypeFilter.append(".json");
                    picker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.computerFolder;
                    picker.pickSingleFileAsync().then(function articleFilePicked(file) {
                        Windows.Storage.FileIO.readTextAsync(file).then(function articleFileRead(json) {
                            try {
                                var data = AppEx.Common.ArticleReader.ArticleTransformer.instance.transformData(json);
                                var title = data.dataObject.title.headline;
                                CommonJS.ArticleReader.ArticleManager.debugArticleData = data.dataObject;
                                try {
                                    new CommonJS.UI.MessageDialog({
                                        title: "Article Loaded", message: "All articles will now refer to the loaded article:\r\r\"" + title + "\"", styleClass: "fre"
                                    }).showAsync().then(function buttonLoadArticle_onClick_articleReset() {
                                        button.label = "Reset Articles"
                                    })
                                }
                                catch (e) { }
                                ;
                            }
                            catch (e) {
                                CommonJS.ArticleReader.ArticleManager.debugArticleData = undoData;
                                new CommonJS.UI.MessageDialog({
                                    title: "Error", message: "Error trying to load the article from:\r" + file.path, styleClass: "fre"
                                }).showAsync()
                            }
                        })
                    })
                }
            }, dumpArticles: function dumpArticles() {
                var articleDump = new AppEx.Common.ArticleReader.ArticleDump;
                var promise = null;
                var page = PlatformJS.Navigation.currentIPage;
                if (page && page.getCurrentArticleMetadata) {
                    var metadata = page.getCurrentArticleMetadata();
                    if (metadata) {
                        var articleId = metadata.articleId;
                        if (articleId) {
                            promise = articleDump.dumpArticle(articleId)
                        }
                    }
                }
                if (!promise) {
                    promise = articleDump.dump()
                }
                var task = promise.then(function articleDumped(result) {
                    var title = result.count === 0 ? "No Articles Saved" : result.count === 1 ? "Article Saved" : result.count + " Articles Saved";
                    var messageData = {
                        title: title, message: result.path, defaultFocusButtonIndex: 0, defaultCancelButtonIndex: 1, styleClass: "fre", buttons: [{
                            label: "OK", clickHandler: function articleDumpMessage_OK(event) { }
                        }, {
                            label: "Copy Path", clickHandler: function articleDumpMessage_Copy(event) {
                                clipboardData.setData("text", result.path)
                            }
                        }]
                    };
                    var messageDialog = new CommonJS.UI.MessageDialog(messageData);
                    try {
                        messageDialog.showAsync()
                    }
                    catch (e) { }
                })
            }
        })
    })
})();
(function _ActionsHandler_7() {
    "use strict";
    function launchUriAction(actionOptions, impressionNavMethod, useExternalLink) {
        if (actionOptions.actionType === "LaunchUri") {
            var extraUriKey = PlatformJS.Services.appConfig.getString("ExtraLinksKey"),
                actionAttributes = actionOptions.actionAttributes,
                uri,
                extraLinks = actionAttributes && actionAttributes.extraLinks,
                extraLink = extraLinks && extraLinks[extraUriKey];
            if (extraLink) {
                uri = extraLink.appLink || extraLink.externalLink;
                if (useExternalLink) {
                    uri = extraLink.externalLink || uri
                }
            }
            uri = uri || actionAttributes.uri;
            if (uri) {
                try {
                    Microsoft.Bing.AppEx.Telemetry.FlightRecorder.setImpressionNavMethod(impressionNavMethod);
                    var options = new Windows.System.LauncherOptions;
                    Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri(uri), options)
                }
                catch (ex) { }
            }
        }
    }
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ActionsHandler: WinJS.Class.define(function _ActionsHandler_13() { }, {
            onActionInvoked: function onActionInvoked(event) {
                var data = event.data;
                launchUriAction(data.actionOptions, data.impressionNavMethod, false)
            }
        })
    });
    WinJS.Namespace.define("CommonJS.ArticleReader", {
        ExternalActionsHandler: WinJS.Class.define(function ActionsHandlerCtor() { }, {
            onActionInvoked: function onActionInvoked(event) {
                var data = event.data;
                launchUriAction(data.actionOptions, data.impressionNavMethod, true)
            }
        })
    })
})()