/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Music;
        (function(Music) {
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Music");
            var MultiArtistTopSongsQuery = (function(_super) {
                    __extends(MultiArtistTopSongsQuery, _super);
                    function MultiArtistTopSongsQuery() {
                        _super.apply(this, arguments)
                    }
                    MultiArtistTopSongsQuery.prototype.createAsyncModel = function(startIndex, count) {
                        var _this = this;
                        if (!this.artists || !Entertainment.Data.List.isList(this.artists))
                            return WinJS.Promise.wrapError(new Error("Expected an artist list structure for multi-artist query."));
                        if (!this.count || this.count < 0)
                            return WinJS.Promise.wrapError(new Error("Expected a positive song count for multi-artist query."));
                        var artistCount = this.artists.count;
                        var artistTopSongs = new Array(artistCount);
                        var artistTopSongsQueries = [];
                        var numSongsPerArtist = Math.ceil(this.count / artistCount);
                        var executeTopSongsQueriesPromise = this.artists.forEachAll(function(args) {
                                var artistIndex = args.item.itemIndex;
                                var query = null;
                                var artistId = args.item.data.canonicalId;
                                if (!artistId)
                                    return;
                                var numSongsToRequest = Math.ceil(numSongsPerArtist * MultiArtistTopSongsQuery.SONG_REQUEST_BUFFER_FACTOR);
                                query = new Entertainment.Data.Query.Music.ArtistTopSongs;
                                query.id = artistId;
                                query.aggregateChunks = false;
                                if (query.chunkSize > numSongsToRequest)
                                    query.chunkSize = numSongsToRequest;
                                var queryPromise = query.execute().then(function(queryResult) {
                                        if (queryResult.result.items) {
                                            var itemsArray = [];
                                            return queryResult.result.items.forEachAll(function(iterationArgs) {
                                                    return MultiArtistTopSongsQuery.userCanPlayTrack(iterationArgs.item.data).then(function(canPlayTrack) {
                                                            if (canPlayTrack)
                                                                itemsArray.push(iterationArgs.item.data);
                                                            iterationArgs.stop = itemsArray.length >= numSongsPerArtist
                                                        })
                                                }).then(function() {
                                                    return itemsArray
                                                })
                                        }
                                        return null
                                    }).then(function(items) {
                                        artistTopSongs[artistIndex] = items
                                    }, function(error){}).then(function() {
                                        query.dispose()
                                    });
                                artistTopSongsQueries.push(queryPromise)
                            }, 0, this.count);
                        return executeTopSongsQueriesPromise.then(function() {
                                return WinJS.Promise.join(artistTopSongsQueries)
                            }).then(function() {
                                return MultiArtistTopSongsQuery._generateSongListFromArtistTopSongTable(artistTopSongs, _this.count)
                            })
                    };
                    MultiArtistTopSongsQuery.userCanPlayTrack = function(media) {
                        return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(media).then(function() {
                                return media.inCollection
                            }, function(error) {
                                MS.Entertainment.Music.fail("Hydration of library info failed: " + error && error.message);
                                return false
                            }).then(function(isMediaInCollection) {
                                if (isMediaInCollection)
                                    return true;
                                if (media.isParentallyBlocked)
                                    return false;
                                var subscriptionDownloadRight = MS.Entertainment.ViewModels.SmartBuyStateHandlers.mediaHasAnyRight(media, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Subscription]);
                                var subscriptionStreamRight = MS.Entertainment.ViewModels.SmartBuyStateHandlers.mediaHasAnyRight(media, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Stream]);
                                var freeStreamRight = MS.Entertainment.ViewModels.SmartBuyStateHandlers.mediaHasAnyRight(media, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.FreeStream]);
                                var musicSubscriptionEnabled = false;
                                var signedInUserHasSubscription = false;
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var allowFreeStreamActions = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay);
                                var allowSubscriptionActions = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription) && MS.Entertainment.Utilities.currentOrLastUserSubscriptionEnabled();
                                var hasSubscriptionDownloadRights = allowSubscriptionActions && subscriptionDownloadRight;
                                var hasSubscriptionStreamingRights = allowSubscriptionActions && subscriptionStreamRight;
                                var hasFreeStreamingRights = allowFreeStreamActions && freeStreamRight;
                                return hasSubscriptionStreamingRights || hasFreeStreamingRights || hasSubscriptionDownloadRights
                            })
                    };
                    MultiArtistTopSongsQuery._generateSongListFromArtistTopSongTable = function(artistTopSongs, maxSongCount) {
                        if (!artistTopSongs || artistTopSongs.length === 0)
                            return WinJS.Promise.wrapError(new Error("Failed to find any top songs for the given artist seeds."));
                        var finalSongList = [];
                        var addedSongs;
                        do {
                            addedSongs = false;
                            artistTopSongs.some(function(topSongList) {
                                if (finalSongList.length >= maxSongCount)
                                    return true;
                                if (topSongList && topSongList.length > 0) {
                                    finalSongList.push(topSongList.shift());
                                    addedSongs = true
                                }
                                return false
                            })
                        } while (addedSongs);
                        return {
                                items: new Entertainment.Data.VirtualList(null, finalSongList), itemsArray: finalSongList
                            }
                    };
                    MultiArtistTopSongsQuery.SONG_REQUEST_BUFFER_FACTOR = 1.5;
                    return MultiArtistTopSongsQuery
                })(MS.Entertainment.Data.ModelQuery);
            Music.MultiArtistTopSongsQuery = MultiArtistTopSongsQuery
        })(Music = Entertainment.Music || (Entertainment.Music = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
