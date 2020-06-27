/*  © Microsoft. All rights reserved. */
(function () {
    "use strict";
    WinJS.Namespace.define("NewsJS.Tile", {
        newsSecondaryTile: WinJS.Class.define(function (tileId, tileShortName, tileDisplayName, tileLaunchTargetPage, tileLaunchArgument, tileLogo) {
            this._tileId = tileId;
            this._tileShortName = tileShortName;
            this._tileDisplayName = tileDisplayName;
            this._tileLaunchTargetPage = tileLaunchTargetPage;
            this._tileLaunchArgument = tileLaunchArgument;
            this._tileLogo = tileLogo
        }, {
            requestDeleteAsync: function requestDeleteAsync(xLoc, yLoc) {
                var that = this;
                return (new Windows.UI.StartScreen.SecondaryTile(that._tileId)).requestDeleteAsync({
                    x: xLoc, y: yLoc
                })
            }, requestCreateAsync: function requestCreateAsync(xLoc, yLoc, tilePinLogos, liveTileUrls, liveTileRecurrence) {
                var that = this;
                var shortName = that._tileShortName;
                var displayName = that._tileDisplayName;
                var json = JSON.stringify({
                    target: that._tileLaunchTargetPage, data: that._tileLaunchArgument, context: [{ activationContext: "pinnedTile" }]
                });
                var secondaryTile = new Windows.UI.StartScreen.SecondaryTile(that._tileId, shortName, json, new Windows.Foundation.Uri(that._tileLogo), Windows.UI.StartScreen.TileSize.default);
                secondaryTile.visualElements.square30x30Logo = new Windows.Foundation.Uri(that._tileLogo.replace("logo", "small"));
                secondaryTile.visualElements.square70x70Logo = new Windows.Foundation.Uri(that._tileLogo.replace("logo", "tiny"));
                secondaryTile.visualElements.showNameOnSquare150x150Logo = true;
                return new WinJS.Promise(function (complete) {
                    secondaryTile.requestCreateAsync({
                        x: xLoc, y: yLoc
                    }).then(function (isAdded) {
                        if (isAdded) {
                            that._getModifiedName(shortName).then(function (modifiedName) {
                                that._setTemplates(modifiedName, tilePinLogos, liveTileUrls, liveTileRecurrence)
                            }, function (error) {
                                that._setTemplates(shortName, tilePinLogos, liveTileUrls, liveTileRecurrence)
                            })
                        }
                        return complete(isAdded)
                    })
                })
            }, _setTemplates: function _setTemplates(text, tilePinLogos, liveTileUrls, liveTileRecurrence) {
                if (!text) {
                    return
                }
                var that = this;
                var tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForSecondaryTile(that._tileId);
                if (!liveTileUrls || !liveTileUrls.length) {
                    var squareTile = null,
                        tilePinLogoDpiSpecific = null,
                        logoUrl = null,
                        tileNotification;
                    tileUpdater.clear();
                    if (tilePinLogos) {
                        tilePinLogoDpiSpecific = tilePinLogos[Windows.Graphics.Display.DisplayProperties.resolutionScale]
                    }
                    if (tilePinLogoDpiSpecific) {
                        PlatformJS.Cache.CacheService.getInstance("CustomPanoPinningLogoCache").findEntry(tilePinLogoDpiSpecific, { fileNameOnly: true }).then(function logoCacheFetch_completion(response) {
                            var isCached;
                            if (response && !response.isStale() && response.dataValue) {
                                logoUrl = response.dataValue;
                                isCached = true
                            }
                            else {
                                logoUrl = tilePinLogoDpiSpecific;
                                isCached = false
                            }
                            squareTile = PlatformJS.Utilities.getSquarePeekImageAndText04(logoUrl, text);
                            tileNotification = new Windows.UI.Notifications.TileNotification(squareTile);
                            tileNotification.expirationTime = null;
                            tileUpdater.update(tileNotification);
                            if (!isCached && NewsJS.Utilities.CachedNetworkChecks.hasInternetConnection()) {
                                return PlatformJS.Utilities.fetchImage("CustomPanoPinningLogoCache", logoUrl, null)
                            }
                            else {
                                return WinJS.Promise.wrap(null)
                            }
                        }).done(function logoFetch_completion(finalResponse) { }, function logoFetch_error(err) { })
                    }
                    else {
                        squareTile = that._getTileSquareText04(text);
                        tileNotification = new Windows.UI.Notifications.TileNotification(squareTile);
                        tileNotification.expirationTime = null;
                        tileUpdater.update(tileNotification)
                    }
                }
                else {
                    var pollUrls = [];
                    for (var i = 0; i < liveTileUrls.length; i++) {
                        try {
                            var url = new Windows.Foundation.Uri(liveTileUrls[i]);
                            pollUrls.push(url)
                        }
                        catch (e) { }
                    }
                    if (pollUrls.length) {
                        tileUpdater.enableNotificationQueue(true);
                        tileUpdater.startPeriodicUpdateBatch(pollUrls, liveTileRecurrence)
                    }
                }
            }, _getTileSquareText04: function _getTileSquareText04(text) {
                var squareTileXml = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileSquareText04);
                var attributes = squareTileXml.getElementsByTagName("text");
                if (attributes.length > 0) {
                    attributes[0].appendChild(squareTileXml.createTextNode(text))
                }
                return squareTileXml
            }, _getModifiedName: function _getModifiedName(defaultName) {
                var that = this;
                var modifiedName = defaultName;
                return new WinJS.Promise(function (complete, error) {
                    Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
                        tiles.forEach(function (tile) {
                            if (that._tileId === tile.tileId && tile.shortName) {
                                modifiedName = tile.shortName
                            }
                        });
                        complete(modifiedName)
                    }, function (e) {
                        error(e)
                    })
                })
            }
        }, {
            cleanIdName: function cleanIdName(id) {
                id = NewsJS.Utilities.GetStringHashCode(id);
                return id
            }, updateAllSecondaryTiles: function updateAllSecondaryTiles() {
                Windows.UI.StartScreen.SecondaryTile.findAllAsync().then(function (tiles) {
                    if (tiles) {
                        tiles.forEach(function (tile) {
                            try {
                                var args = JSON.parse(tile.arguments);
                                var newsTile = new NewsJS.Tile.newsSecondaryTile(tile.tileId, tile.shortName, tile.displayName, args.target, args.data, tile.logo.rawUri);
                                var argsData = args && args.data;
                                var pinLogoUrls = argsData && argsData.pinLogoUrls;
                                var liveTileUrls = argsData && argsData.liveTileUrls;
                                var liveTileRecurrence = argsData && argsData.liveTileRecurrence;
                                newsTile._setTemplates(tile.displayName, pinLogoUrls, liveTileUrls, liveTileRecurrence)
                            }
                            catch (e) { }
                        })
                    }
                })
            }
        })
    })
})()