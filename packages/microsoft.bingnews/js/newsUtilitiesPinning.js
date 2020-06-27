/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    function setupPinCategoryButton(buttonElementId, telemetryId, category, categoryName) {
        if (typeof (buttonElementId) === "undefined" || typeof (category) === "undefined" || typeof (categoryName) === "undefined") {
            return
        }
        if (typeof (category.categoryKey) === "undefined") {
            category.categoryKey = ""
        }
        return NewsJS.Utilities.Pinning._setupPinButton(buttonElementId, PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), PlatformJS.Services.resourceLoader.getString("NowPinningCategory"), PlatformJS.Services.resourceLoader.getString("NowUnpinningCategory"), "", "", categoryName + "NewsJS.CategoryPage", categoryName, categoryName, "NewsJS.CategoryPage", {
            category: categoryName, categoryKey: category.categoryKey, categoryName: category.categoryName, market: category.market, channelId: WinJS.Navigation.location.channelId
        }, null, "ms-appx:///images/logoCategory.png", null, null, null, null, telemetryId)
    }
    function setupPinTopicButton(buttonElementId, telemetryId, topic) {
        if (typeof (buttonElementId) === "undefined" || typeof (topic) === "undefined" || typeof (topic.queryText) === "undefined" || !topic.queryText) {
            return
        }
        topic.channelId = WinJS.Navigation.location.channelId;
        return NewsJS.Utilities.Pinning._setupPinButton(buttonElementId, PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), PlatformJS.Services.resourceLoader.getString("NowPinningTopic"), PlatformJS.Services.resourceLoader.getString("NowUnpinningTopic"), "", "", topic.queryText + "NewsJS.Search", topic.queryText, topic.queryText, "NewsJS.Search", topic, null, "ms-appx:///images/logoTopic.png", null, null, null, null, telemetryId)
    }
    function setupPinSourceButton(buttonElementId, telemetryId, sourceEntity, target) {
        if (typeof (buttonElementId) === "undefined" || typeof (sourceEntity) === "undefined" || typeof (sourceEntity.id) === "undefined" || typeof (sourceEntity.displayname) === "undefined") {
            return
        }
        return NewsJS.Utilities.Pinning._setupPinButton(buttonElementId, PlatformJS.Services.resourceLoader.getString("/platform/pinToStart"), PlatformJS.Services.resourceLoader.getString("/platform/unpinFromStart"), PlatformJS.Services.resourceLoader.getString("NowPinningSource"), PlatformJS.Services.resourceLoader.getString("NowUnpinningSource"), "", "", sourceEntity.id + (target ? target : "NewsJS.SourcePage"), sourceEntity.displayname, sourceEntity.displayname, target ? target : "NewsJS.SourcePage", sourceEntity, null, "ms-appx:///images/logoSource.png", null, null, null, null, telemetryId)
    }
    function _setupPinButton(buttonElementId, buttonTextForAddTile, buttonTextForRemoveTile, tileAddSuccessToastMessage, tileRemoveSuccessToastMessage, tileNotAddedToastMessage, tileNotRemovedToastMessage, tileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, existingArticles, tileLogo, tilePinLogos, liveTileUrls, liveTileRecurrence, onPinSection, telemetryId) {
        var pinIcon = "\uE015";
        var unpinIcon = "\uE016";
        var pinElement = document.getElementById(buttonElementId);
        var pinButton = pinElement.winControl;
        var tileExceedsMaxMessage = PlatformJS.Services.resourceLoader.getString("PinExceeded");
        var config = PlatformJS.Services.appConfig.getDictionary("Pinning");
        var maxSecondaryTileCount = config ? config.getInt32("maxSecondaryTileCount") : 100;
        var cleanedTileId = NewsJS.Tile.newsSecondaryTile.cleanIdName(tileId);
        if (pinButton && pinButton.element) {
            pinButton.extraClass = "appexSymbol";
            NewsJS.Utilities.Pinning.findSecondaryTilesAsync(cleanedTileId).then(function (setupResult) {
                if (setupResult.found) {
                    pinButton.label = buttonTextForRemoveTile;
                    pinButton.icon = unpinIcon
                }
                else {
                    pinButton.label = buttonTextForAddTile;
                    pinButton.icon = pinIcon
                }
                pinButton.tooltip = pinButton.label;
                pinButton.onclick = function (e) {
                    stickEdgy(true);
                    NewsJS.Telemetry.Utilities.recordButtonClick(telemetryId, Microsoft.Bing.AppEx.Telemetry.ActionContext.appBar, e);
                    var boundingClientRect = pinElement.getBoundingClientRect();
                    var tile = new NewsJS.Tile.newsSecondaryTile(cleanedTileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, tileLogo);
                    NewsJS.Utilities.Pinning.findSecondaryTilesAsync(cleanedTileId).then(function (result) {
                        if (!result.found && result.totalTileCount >= maxSecondaryTileCount) {
                            if (tileExceedsMaxMessage) {
                                NewsJS.Utilities.showToast(tileExceedsMaxMessage)
                            }
                            stickEdgy(false)
                        }
                        else {
                            if (result.found) {
                                tile.requestDeleteAsync(boundingClientRect.left, boundingClientRect.top + NewsJS.Utilities.Pinning.yAxisSpacer).then(function (isDeleted) {
                                    if (isDeleted) {
                                        NewsJS.Telemetry.Utilities.recordPinnedTileRemoved(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument);
                                        pinButton.label = buttonTextForAddTile;
                                        pinButton.tooltip = pinButton.label;
                                        pinButton.icon = pinIcon;
                                        if (tileRemoveSuccessToastMessage) {
                                            NewsJS.Utilities.showToast(tileRemoveSuccessToastMessage)
                                        }
                                    }
                                    else {
                                        if (tileNotRemovedToastMessage) {
                                            NewsJS.Utilities.showToast(tileNotRemovedToastMessage)
                                        }
                                    }
                                    stickEdgy(false)
                                }, function (error) {
                                    stickEdgy(false)
                                })
                            }
                            else {
                                tile.requestCreateAsync(boundingClientRect.left, boundingClientRect.top + NewsJS.Utilities.Pinning.yAxisSpacer, tilePinLogos, liveTileUrls, liveTileRecurrence).then(function (isAdded) {
                                    if (isAdded) {
                                        NewsJS.Telemetry.Utilities.recordPinnedTileAdded(tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument);
                                        pinButton.label = buttonTextForRemoveTile;
                                        pinButton.tooltip = pinButton.label;
                                        pinButton.icon = unpinIcon;
                                        if (tileAddSuccessToastMessage) {
                                            NewsJS.Utilities.showToast(tileAddSuccessToastMessage)
                                        }
                                        if (onPinSection) {
                                            onPinSection()
                                        }
                                    }
                                    else {
                                        if (tileNotAddedToastMessage) {
                                            NewsJS.Utilities.showToast(tileNotAddedToastMessage)
                                        }
                                    }
                                    stickEdgy(false)
                                }, function (error) {
                                    stickEdgy(false)
                                })
                            }
                        }
                    }, function (error) {
                        stickEdgy(false)
                    })
                }
            }, function (error) { })
        }
    }
    function stickEdgy(sticky) {
        var actionEdgyCtl = PlatformJS.Utilities.getControl("actionEdgy");
        if (actionEdgyCtl) {
            actionEdgyCtl.sticky = sticky;
            if (!sticky) {
                actionEdgyCtl.hide()
            }
        }
    }
    function findSecondaryTilesAsync(myTileId) {
        return new WinJS.Promise(function (complete, error, progress) {
            Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
                var found = false;
                tiles.forEach(function (tile) {
                    if (myTileId === tile.tileId) {
                        found = true
                    }
                });
                complete({
                    found: found, totalTileCount: tiles.length
                })
            }, function (e) {
                error(e)
            })
        })
    }
    WinJS.Namespace.define("NewsJS.Utilities.Pinning", {
        setupPinCategoryButton: setupPinCategoryButton, setupPinTopicButton: setupPinTopicButton, setupPinSourceButton: setupPinSourceButton, _setupPinButton: _setupPinButton, findSecondaryTilesAsync: findSecondaryTilesAsync, yAxisSpacer: -5
    })
})()