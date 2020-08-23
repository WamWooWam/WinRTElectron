/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Components) {
            (function(Video) {
                var UrlLookupItem = (function() {
                        function UrlLookupItem(mediaId, deepLinkUrl) {
                            this.mediaId = mediaId;
                            this.deepLinkUrl = deepLinkUrl
                        }
                        return UrlLookupItem
                    })();
                Video.UrlLookupItem = UrlLookupItem;
                var InteractiveAppHelper = (function() {
                        function InteractiveAppHelper(){}
                        InteractiveAppHelper.addConfigValuesToTable = function(mediaIdString, deepLinkUrlString) {
                            var mediaIds = mediaIdString.split(",");
                            var deepLinkUrls = deepLinkUrlString.split(",");
                            if (mediaIds && deepLinkUrls && mediaIds.length > 0 && mediaIds.length === deepLinkUrls.length)
                                for (var i = 0; i < mediaIds.length; i++)
                                    MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable.push(new UrlLookupItem(mediaIds[i], deepLinkUrls[i]))
                        };
                        InteractiveAppHelper.loadUrlLookupFromConfig = function() {
                            if (!MS.Entertainment.Components.Video.InteractiveAppHelper._loadedLookupFromConfig) {
                                MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable = [];
                                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                                InteractiveAppHelper.addConfigValuesToTable(configurationManager.video.interactiveTVMediaIDs, configurationManager.video.interactiveTVDeepLinkUrls);
                                InteractiveAppHelper.addConfigValuesToTable(configurationManager.video.interactiveMovieMediaIDs, configurationManager.video.interactiveMovieDeepLinkUrls);
                                MS.Entertainment.Components.Video.InteractiveAppHelper._loadedLookupFromConfig = true
                            }
                        };
                        InteractiveAppHelper.getRootUrlFromMedia = function(media) {
                            var rootUrl = String.empty;
                            MS.Entertainment.Components.Video.InteractiveAppHelper.loadUrlLookupFromConfig();
                            for (var i = 0; i < MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable.length; i++)
                                if ((MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable[i].mediaId === media.canonicalId && media.hasCanonicalId) || (MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable[i].mediaId === media.zuneId && media.hasZuneId) || (MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable[i].mediaId === media.serviceId && media.hasServiceId)) {
                                    rootUrl = MS.Entertainment.Components.Video.InteractiveAppHelper._urlLookupTable[i].deepLinkUrl;
                                    break
                                }
                            return rootUrl
                        };
                        InteractiveAppHelper.hasInteractiveUrlFromMedia = function(media) {
                            return !!MS.Entertainment.Components.Video.InteractiveAppHelper.getRootUrlFromMedia(media)
                        };
                        InteractiveAppHelper.appendBookmarksForAllEpisodesInSeason = function(media, deepLinkUrl) {
                            var deepLinkPromise = WinJS.Promise.wrap(deepLinkUrl);
                            var season = MS.Entertainment.Utilities.convertMediaItemToTvSeason(media);
                            if (season && season.refresh) {
                                var hydrateSeason = season.refresh();
                                deepLinkPromise = hydrateSeason.then(function(hydratedSeason) {
                                    return hydratedSeason.episodes.toArrayAll()
                                }, function(hydratedSeason) {
                                    return WinJS.Promise.wrap(null)
                                }).then(function(marketplaceEpisodes) {
                                    if (marketplaceEpisodes) {
                                        var ms = new Microsoft.Entertainment.Platform.MediaStore;
                                        var bookmarkPromises = [];
                                        for (var i = 0; i < marketplaceEpisodes.length; i++) {
                                            if (marketplaceEpisodes[i].episodeNumber < 1 || marketplaceEpisodes[i].episodeNumber > 99)
                                                continue;
                                            var promise = WinJS.Promise.wrap({value: 0});
                                            if (marketplaceEpisodes[i].libraryId > -1)
                                                promise = ms.videoProvider.getBookmarkAsync(marketplaceEpisodes[i].libraryId);
                                            bookmarkPromises.push(promise)
                                        }
                                        return WinJS.Promise.join(bookmarkPromises)
                                    }
                                    return WinJS.Promise.wrap(null)
                                }, function(episodes) {
                                    return WinJS.Promise.wrap(null)
                                }).then(function(bookmarks) {
                                    if (bookmarks) {
                                        var episodeBookmarkList = String.empty;
                                        for (var i = 0; i < bookmarks.length; i++) {
                                            episodeBookmarkList = episodeBookmarkList + bookmarks[i].value;
                                            if (i !== bookmarks.length - 1)
                                                episodeBookmarkList = episodeBookmarkList + ","
                                        }
                                        deepLinkUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(deepLinkUrl, {bookmarksInMSec: episodeBookmarkList})
                                    }
                                    return deepLinkUrl
                                }, function(error) {
                                    return deepLinkUrl
                                })
                            }
                            return deepLinkPromise
                        };
                        InteractiveAppHelper.getInteractiveUrlFromMedia = function(media) {
                            var deepLinkUrl = MS.Entertainment.Components.Video.InteractiveAppHelper.getRootUrlFromMedia(media);
                            if (deepLinkUrl && MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(media) || MS.Entertainment.Platform.PlaybackHelpers.isMovie(media)) {
                                var ms = new Microsoft.Entertainment.Platform.MediaStore;
                                var isTVEpisode = MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(media);
                                var pendingBookmarkWriteOperations;
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.bookmarkOperationsWatcher)) {
                                    var bookmarkWatcher = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.bookmarkOperationsWatcher);
                                    pendingBookmarkWriteOperations = bookmarkWatcher.waitForPendingOperations()
                                }
                                return WinJS.Promise.as(pendingBookmarkWriteOperations).then(function() {
                                        var promise = WinJS.Promise.wrap({value: 0});
                                        if (media.libraryId > -1)
                                            promise = ms.videoProvider.getBookmarkAsync(media.libraryId);
                                        return promise
                                    }).then(function(bookmark) {
                                        deepLinkUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(deepLinkUrl, {
                                            xbvmediaId: media.hasZuneId ? media.zuneId : media.canonicalId, videoStartTimeWithAdsInMSec: bookmark.value
                                        });
                                        var bookmarksPromise = WinJS.Promise.as(deepLinkUrl);
                                        if (isTVEpisode)
                                            bookmarksPromise = MS.Entertainment.Components.Video.InteractiveAppHelper.appendBookmarksForAllEpisodesInSeason(media, deepLinkUrl);
                                        return bookmarksPromise
                                    }, function(error) {
                                        return WinJS.Promise.wrap(deepLinkUrl)
                                    })
                            }
                            else if (deepLinkUrl) {
                                deepLinkUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(deepLinkUrl, {xbvmediaId: media.hasZuneId ? media.zuneId : media.canonicalId});
                                return MS.Entertainment.Components.Video.InteractiveAppHelper.appendBookmarksForAllEpisodesInSeason(media, deepLinkUrl)
                            }
                            return WinJS.Promise.wrap(deepLinkUrl)
                        };
                        InteractiveAppHelper._urlLookupTable = [];
                        InteractiveAppHelper._loadedLookupFromConfig = false;
                        return InteractiveAppHelper
                    })();
                Video.InteractiveAppHelper = InteractiveAppHelper
            })(Components.Video || (Components.Video = {}));
            var Video = Components.Video
        })(Entertainment.Components || (Entertainment.Components = {}));
        var Components = Entertainment.Components
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
