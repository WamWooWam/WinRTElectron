/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        SearchFilter: {
            all: 0, localCollection: 1
        }, SearchViewModel: MS.Entertainment.defineObservable(function searchViewModelConstructor(options) {
                this.options = options;
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                this._useFileTransferService = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.fileTransfer);
                this._videoQueryList = [];
                if (options && options.showCollection)
                    if (options.showMovies && !options.showTVSeries)
                        this._videoQueryList.push("libraryVideoMovies");
                    else if (!options.showMovies && options.showTVSeries)
                        this._videoQueryList.push("libraryTVSeries");
                    else if (options.showMovies || options.showTVSeries)
                        this._videoQueryList.push("libraryMovieTVSeries");
                if (MS.Entertainment.UI.NetworkStatusService.isOnline() && (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) && options && (options.showMovies || options.showTVSeries))
                    this._videoQueryList.push("searchMovies");
                this._noMarketplaceModeVideo = (MS.Entertainment.Utilities.isVideoApp && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) && !featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace));
                if (this._noMarketplaceModeVideo)
                    this._videoQueryList = [];
                this._videoQueryList.push("libraryVideoOther");
                if (options && options.showCast)
                    this._videoQueryList.push("graceNoteCast");
                this._musicQueryList = ["libraryArtists", "libraryAlbums", "libraryTracks"];
                if (MS.Entertainment.Utilities.isMusicApp)
                    this._musicQueryList.push("libraryPlaylists");
                if (isMusicMarketplaceEnabled) {
                    this._musicQueryList.push("searchArtists");
                    this._musicQueryList.push("searchAlbums");
                    this._musicQueryList.push("searchTracks")
                }
                this.graceNoteCastResult = [];
                this.videoOfflineResult = [];
                this.videoOnlineResult = [];
                this.otherVideoLocalResult = [];
                this.artistLocalResult = [];
                this.artistMPResult = [];
                this.albumLocalResult = [];
                this.albumMPResult = [];
                this.songLocalResult = [];
                this.songMPResult = [];
                this.playlistLocalResult = [];
                this.playlistMPResult = [];
                this.musicVideoLocalResult = [];
                this.musicVideoMPResult = [];
                if (options && options.linguisticAlternatives)
                    this._linguisticAlternatives = options.linguisticAlternatives;
                this.createMovieQueryLocal = function() {
                    if (options && options.showMovies && !options.showTVSeries)
                        return new MS.Entertainment.Data.Query.libraryVideoMovies;
                    else if (options && !options.showMovies && options.showTVSeries)
                        return new MS.Entertainment.Data.Query.libraryTVSeries;
                    else if (options && options.showMovies && options.showTVSeries)
                        return new MS.Entertainment.Data.Query.libraryMovieTVSeries;
                    else
                        return null
                }.bind(this);
                this.createMovieQueryMP = function(keyword) {
                    if (options && (options.showMovies || options.showTVSeries)) {
                        var videoMPQuery = MS.Entertainment.ViewModels.SearchViewModel.preloadedVideoMarketplaceQuery;
                        if (!videoMPQuery || videoMPQuery.search !== keyword) {
                            videoMPQuery = MS.Entertainment.ViewModels.SearchViewModel.createMovieQueryMP(this._edsAuthHeaderKey, this._edsAuthHeaderValue, this.options);
                            videoMPQuery.search = keyword;
                            videoMPQuery.chunkSize = this._maxResultCount
                        }
                        return videoMPQuery
                    }
                    else
                        return null
                }.bind(this);
                this.createGraceNoteCastQuery = function(keyword) {
                    if (options && options.showCast && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.graceNoteService)) {
                        var videoServices = MS.Entertainment.Components.Video.Services;
                        var graceNoteService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.graceNoteService);
                        return graceNoteService.contributorSearch(keyword, videoServices.GraceNoteImageSize.medium, videoServices.GraceNoteSearchMode.multipleMatch)
                    }
                    else
                        return null
                }.bind(this);
                this.createOtherVideoQueryLocal = function createOtherVideoQueryLocal() {
                    return new MS.Entertainment.Data.Query.libraryVideoOther
                };
                this.createArtistQueryLocal = function createArtistQueryLocal() {
                    var query = new MS.Entertainment.Data.Query.libraryAlbumArtists;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.artist);
                    return query
                };
                this.createArtistQueryMP = function createArtistQueryMP() {
                    var query = new MS.Entertainment.Data.Query.Music.ArtistSearch;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.artist);
                    return query
                };
                this.createAlbumQueryLocal = function createAlbumQueryLocal() {
                    var query = new MS.Entertainment.Data.Query.libraryAlbums;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.album);
                    return query
                };
                this.createAlbumQueryMP = function createAlbumQueryMP() {
                    var query = new MS.Entertainment.Data.Query.Music.AlbumSearch;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.album);
                    return query
                };
                this.createSongQueryLocal = function createSongQueryLocal() {
                    var query = new MS.Entertainment.Data.Query.libraryTracks;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.track);
                    return query
                };
                this.createSongQueryMP = function createSongQueryMP() {
                    var query = new MS.Entertainment.Data.Query.Music.SongSearch;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.track);
                    return query
                };
                this.createPlaylistQueryLocal = function createPlaylistQueryLocal() {
                    var query = new MS.Entertainment.Data.Query.libraryPlaylists;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.collection, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist);
                    return query
                };
                this.createPlaylistQueryMP = function createPlaylistQueryMP() {
                    var query = new MS.Entertainment.Data.Query.searchPlaylists;
                    query.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.store, Microsoft.Entertainment.Platform.AcquisitionContextType.playlist);
                    return query
                };
                this.createMusicVideoQueryLocal = function createMusicVideoQueryLocal() {
                    return new MS.Entertainment.Data.Query.libraryVideos
                };
                this.createMusicVideoQueryMP = function createMusicVideoQueryMP() {
                    return new MS.Entertainment.Data.Query.searchMusicVideos
                };
                this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("searchViewModel")
            }, {
                _noMarketplaceModeVideo: false, _edsAuthHeaderKey: null, _edsAuthHeaderValue: null, _videoQueryList: null, _musicQueryList: null, graceNoteCastResult: null, videoOfflineResult: null, videoOnlineResult: null, otherVideoLocalResult: null, artistLocalResult: null, artistMPResult: null, albumLocalResult: null, albumMPResult: null, songLocalResult: null, songMPResult: null, playlistLocalResult: null, playlistMPResult: null, musicVideoLocalResult: null, musicVideoMPResult: null, _maxResultCount: 40, _maxResultCountNoVideoMarketplace: 100, searchCompleted: null, searchResultCount: 0, totalQueryCount: 0, completedQueryCount: 0, createMovieQueryLocal: null, createMovieQueryMP: null, createGraceNoteCastQuery: null, createOtherVideoQueryLocal: null, createArtistQueryLocal: null, createArtistQueryMP: null, createAlbumQueryLocal: null, createAlbumQueryMP: null, createSongQueryLocal: null, createSongQueryMP: null, createPlaylistQueryLocal: null, createPlaylistQueryMP: null, createMusicVideoQueryLocal: null, createMusicVideoQueryMP: null, _queryWatcher: null, _linguisticAlternatives: null, _useFileTransferService: false, startSearch: function startSearch(keyword, edsAuthHeader) {
                        if (edsAuthHeader) {
                            this._edsAuthHeaderKey = edsAuthHeader.key;
                            this._edsAuthHeaderValue = edsAuthHeader.value
                        }
                        else {
                            this._edsAuthHeaderKey = String.empty;
                            this._edsAuthHeaderValue = String.empty
                        }
                        this.completedQueryCount = 0;
                        this.searchResultCount = 0;
                        this.videoOfflineResult = [];
                        this.videoOnlineResult = [];
                        this.otherVideoLocalResult = [];
                        this.artistLocalResult = [];
                        this.artistMPResult = [];
                        this.albumLocalResult = [];
                        this.albumMPResult = [];
                        this.songLocalResult = [];
                        this.songMPResult = [];
                        this.playlistLocalResult = [];
                        this.playlistMPResult = [];
                        this.musicVideoLocalResult = [];
                        this.musicVideoMPResult = [];
                        if (!keyword || keyword.trim().length < 1) {
                            if (this.searchCompleted)
                                this.searchCompleted();
                            return
                        }
                        this.unregisterServices();
                        if (MS.Entertainment.Utilities.isVideoApp) {
                            this.totalQueryCount = this._videoQueryList.length;
                            if (this.totalQueryCount > 0)
                                if (this._noMarketplaceModeVideo)
                                    this.searchOtherVideos(keyword);
                                else
                                    this.searchVideos(keyword);
                            else if (this.searchCompleted)
                                this.searchCompleted()
                        }
                        else if (MS.Entertainment.Utilities.isMusicApp) {
                            this.totalQueryCount = this._musicQueryList.length;
                            if (this.totalQueryCount > 0)
                                this.searchMusic(keyword);
                            else if (this.searchCompleted)
                                this.searchCompleted()
                        }
                        else {
                            this.totalQueryCount = this._videoQueryList.length + this._musicQueryList.length;
                            if (this.totalQueryCount > 0) {
                                this.searchVideos(keyword);
                                this.searchMusic(keyword)
                            }
                            else if (this.searchCompleted)
                                this.searchCompleted()
                        }
                    }, searchVideos: function searchVideos(keyword) {
                        this.searchOtherVideos(keyword);
                        this.searchMovieTVCast(keyword)
                    }, searchMusic: function searchMusic(keyword) {
                        this.searchArtists(keyword);
                        this.searchAlbums(keyword);
                        this.searchSongs(keyword);
                        if (MS.Entertainment.Utilities.isMusicApp)
                            this.searchPlaylists(keyword)
                    }, searchMovieTVCast: function searchMovieTVCast(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise,
                            castPromise;
                        var notificationsCollection;
                        var senderCollection;
                        var senderMarketplace;
                        var filteredCastResultArray = [];
                        var videoLocalQuery = this.createMovieQueryLocal();
                        if (videoLocalQuery) {
                            if (this._useFileTransferService) {
                                notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                                senderCollection = notificationsCollection.createSender();
                                notificationsCollection.modifyQuery(videoLocalQuery)
                            }
                            videoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                            videoLocalQuery.chunkSize = this._maxResultCount;
                            videoLocalQuery.aggregateChunks = false;
                            this._queryWatcher.registerQuery(videoLocalQuery);
                            localPromise = videoLocalQuery.execute().then(function localQuerySuccess(q) {
                                if (senderCollection) {
                                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                    fileTransferService.registerListener("searchCollectionVideo", MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                                }
                                if (q.result.items)
                                    that.videoOfflineResult = q.result.items;
                                else
                                    that.videoOfflineResult = [];
                                that.completedQueryCount++;
                                that.addResultCount(q.result.items);
                                that.checkSearchCompleted()
                            }, function localQueryError(q) {
                                return WinJS.Promise.wrapError(q)
                            })
                        }
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace))
                            return;
                        if (!MS.Entertainment.UI.NetworkStatusService.isOnline())
                            return;
                        var videoMPQuery = this.createMovieQueryMP(keyword);
                        if (videoMPQuery) {
                            this._queryWatcher.registerQuery(videoMPQuery);
                            var marketplacePromise = MS.Entertainment.ViewModels.SearchViewModel.preloadedVideoMarketplaceQueryPromise;
                            if (!marketplacePromise)
                                marketplacePromise = videoMPQuery.execute();
                            MS.Entertainment.ViewModels.SearchViewModel.preloadedVideoMarketplaceQuery = null;
                            MS.Entertainment.ViewModels.SearchViewModel.preloadedVideoMarketplaceQueryPromise = null;
                            marketplacePromise.then(function MPQuerySuccess(q) {
                                if (senderMarketplace) {
                                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                    fileTransferService.registerListener("searchMarketplaceVideo", MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                                }
                            }, function MPQueryError(q) {
                                return WinJS.Promise.wrapError(q)
                            })
                        }
                        var castQuery = this.createGraceNoteCastQuery(keyword);
                        if (castQuery)
                            castPromise = castQuery.then(function castPromiseSuccess(result) {
                                filteredCastResultArray = MS.Entertainment.ViewModels.SearchViewModel.filterCastResults(result.items);
                                return MS.Entertainment.Data.VirtualList.wrapArray(filteredCastResultArray).then(function wrappedItems(list) {
                                        that.graceNoteCastResult = list;
                                        that.completedQueryCount++;
                                        that.checkSearchCompleted()
                                    })
                            }, function castPromiseError(q) {
                                that.completedQueryCount++;
                                that.checkSearchCompleted();
                                return WinJS.Promise.wrapError(q)
                            });
                        WinJS.Promise.join({
                            local: localPromise, marketplace: marketplacePromise, cast: castPromise
                        }).then(function allQueriesSuccess() {
                            if (videoLocalQuery && videoMPQuery)
                                return MS.Entertainment.ViewModels.SearchViewModel.mergeResults(videoLocalQuery.result.items, videoMPQuery.result.items);
                            else if (videoMPQuery && videoMPQuery.result && videoMPQuery.result.items)
                                return videoMPQuery.result.items;
                            else
                                return []
                        }, function someQueryError() {
                            return videoMPQuery.result ? videoMPQuery.result.items : []
                        }).then(function spliceInActorsList(mergedList) {
                            if (that.graceNoteCastResult && that.graceNoteCastResult.count && mergedList && mergedList.count)
                                return MS.Entertainment.ViewModels.SearchViewModel.mergeCastResults(filteredCastResultArray, mergedList, keyword);
                            else if (that.graceNoteCastResult && that.graceNoteCastResult.count)
                                return that.graceNoteCastResult;
                            else
                                return mergedList
                        }).then(function marketplaceProcessingDone(mergedList) {
                            if (mergedList && mergedList.count > 0) {
                                that.videoOnlineResult = mergedList;
                                that.videoOfflineResult = []
                            }
                            else
                                that.videoOnlineResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(mergedList);
                            that.checkSearchCompleted()
                        })
                    }, searchOtherVideos: function searchOtherVideos(keyword) {
                        var that = this;
                        var localPromise;
                        var otherVideoLocalQuery = this.createOtherVideoQueryLocal();
                        otherVideoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        otherVideoLocalQuery.chunkSize = (this._noMarketplaceModeVideo ? this._maxResultCountNoVideoMarketplace : this._maxResultCount);
                        otherVideoLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(otherVideoLocalQuery);
                        localPromise = otherVideoLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (q.result.items)
                                that.otherVideoLocalResult = q.result.items;
                            else
                                that.otherVideoLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            that.otherVideoLocalResult = [];
                            that.completedQueryCount++;
                            that.checkSearchCompleted()
                        })
                    }, checkSearchCompleted: function checkSearchCompleted() {
                        if (this.totalQueryCount === this.completedQueryCount)
                            if (this.searchCompleted)
                                this.searchCompleted()
                    }, addResultCount: function addResultCount(list) {
                        if (list && list.count !== undefined)
                            this.searchResultCount += list.count
                    }, searchArtists: function searchArtists(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise;
                        var artistLocalQuery = this.createArtistQueryLocal();
                        var notificationsCollection;
                        var senderCollection;
                        if (this._useFileTransferService) {
                            notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                            senderCollection = notificationsCollection.createSender();
                            notificationsCollection.modifyQuery(artistLocalQuery)
                        }
                        artistLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        artistLocalQuery.chunkSize = this._maxResultCount;
                        artistLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(artistLocalQuery);
                        localPromise = artistLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (senderCollection) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchCollectionMusicArtist", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumArtistLibraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                            }
                            if (q.result.items)
                                that.artistLocalResult = q.result.items;
                            else
                                that.artistLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                        var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        if (!isMusicMarketplaceEnabled)
                            return;
                        var artistMPQuery = this.createArtistQueryMP();
                        var notificationsMarketplace;
                        var senderMarketplace;
                        if (this._useFileTransferService) {
                            notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                            senderMarketplace = notificationsMarketplace.createSender();
                            notificationsMarketplace.modifyQuery(artistMPQuery)
                        }
                        artistMPQuery.search = keyword;
                        this._queryWatcher.registerQuery(artistMPQuery);
                        marketplacePromise = artistMPQuery.execute().then(function MPQuerySuccess(q) {
                            if (senderMarketplace) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchMarketplaceMusicArtist", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                            }
                        }, function MPQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        WinJS.Promise.join({
                            local: localPromise, marketplace: marketplacePromise
                        }).then(function allQueriesSuccess() {
                            return MS.Entertainment.ViewModels.SearchViewModel.deDup(artistLocalQuery.result && artistLocalQuery.result.items, artistMPQuery.result && artistMPQuery.result.items)
                        }, function someQueryError() {
                            return artistMPQuery.result ? artistMPQuery.result.items : []
                        }).then(function marketplaceProcessingDone(marketplaceList) {
                            if (marketplaceList)
                                that.artistMPResult = marketplaceList;
                            else
                                that.artistMPResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(marketplaceList);
                            that.checkSearchCompleted()
                        })
                    }, searchAlbums: function searchAlbums(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise;
                        var albumLocalQuery = this.createAlbumQueryLocal();
                        var notificationsCollection;
                        var senderCollection;
                        if (this._useFileTransferService) {
                            notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                            senderCollection = notificationsCollection.createSender();
                            notificationsCollection.modifyQuery(albumLocalQuery)
                        }
                        albumLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        albumLocalQuery.chunkSize = this._maxResultCount;
                        albumLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(albumLocalQuery);
                        localPromise = albumLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (senderCollection) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchCollectionMusicAlbum", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumLibraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                            }
                            if (q.result.items)
                                that.albumLocalResult = q.result.items;
                            else
                                that.albumLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                        var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        if (!isMusicMarketplaceEnabled)
                            return;
                        var albumMPQuery = this.createAlbumQueryMP();
                        var notificationsMarketplace;
                        var senderMarketplace;
                        if (this._useFileTransferService) {
                            notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                            senderMarketplace = notificationsMarketplace.createSender();
                            notificationsMarketplace.modifyQuery(albumMPQuery)
                        }
                        albumMPQuery.search = keyword;
                        this._queryWatcher.registerQuery(albumMPQuery);
                        marketplacePromise = albumMPQuery.execute().then(function MPQuerySuccess(q) {
                            if (senderMarketplace) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchMarketplaceMusicAlbum", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                            }
                        }, function MPQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        WinJS.Promise.join({
                            local: localPromise, marketplace: marketplacePromise
                        }).then(function allQueriesSuccess() {
                            return MS.Entertainment.ViewModels.SearchViewModel.deDup(albumLocalQuery.result.items, albumMPQuery.result.items)
                        }, function someQueryError() {
                            return albumMPQuery.result ? albumMPQuery.result.items : []
                        }).then(function marketplaceProcessingDone(marketplaceList) {
                            if (marketplaceList)
                                that.albumMPResult = marketplaceList;
                            else
                                that.albumMPResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(marketplaceList);
                            that.checkSearchCompleted()
                        })
                    }, searchSongs: function searchSongs(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise;
                        var songLocalQuery = this.createSongQueryLocal();
                        var notificationsCollection;
                        var senderCollection;
                        if (this._useFileTransferService) {
                            notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                            senderCollection = notificationsCollection.createSender();
                            notificationsCollection.modifyQuery(songLocalQuery)
                        }
                        songLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        songLocalQuery.chunkSize = this._maxResultCount;
                        songLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(songLocalQuery);
                        localPromise = songLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (senderCollection) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchCollectionTrack", MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                            }
                            if (q.result.items)
                                that.songLocalResult = q.result.items;
                            else
                                that.songLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                        var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        if (!isMusicMarketplaceEnabled)
                            return;
                        var notificationsMarketplace;
                        var senderMarketplace = null;
                        var songMPQuery = this.createSongQueryMP();
                        if (this._useFileTransferService) {
                            notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                            senderMarketplace = notificationsMarketplace.createSender();
                            notificationsMarketplace.modifyQuery(songMPQuery)
                        }
                        songMPQuery.search = keyword;
                        this._queryWatcher.registerQuery(songMPQuery);
                        marketplacePromise = songMPQuery.execute().then(function MPQuerySuccess(q) {
                            if (senderMarketplace) {
                                var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                                fileTransferService.registerListener("searchMarketplaceTrack", MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                            }
                        }, function MPQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        WinJS.Promise.join({
                            local: localPromise, marketplace: marketplacePromise
                        }).then(function allQueriesSuccess() {
                            return MS.Entertainment.ViewModels.SearchViewModel.deDup(songLocalQuery.result.items, songMPQuery.result.items)
                        }, function someQueryError() {
                            return songMPQuery.result ? songMPQuery.result.items : []
                        }).then(function marketplaceProcessingDone(marketplaceList) {
                            if (marketplaceList)
                                that.songMPResult = marketplaceList;
                            else
                                that.songMPResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(marketplaceList);
                            that.checkSearchCompleted()
                        })
                    }, searchPlaylists: function searchPlaylists(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise;
                        var playlistLocalQuery = this.createPlaylistQueryLocal();
                        playlistLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        playlistLocalQuery.chunkSize = this._maxResultCount;
                        playlistLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(playlistLocalQuery);
                        localPromise = playlistLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (q.result.items)
                                that.playlistLocalResult = q.result.items;
                            else
                                that.playlistLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        })
                    }, searchMusicVideos: function searchMusicVideos(keyword) {
                        var that = this;
                        var localPromise,
                            marketplacePromise;
                        var musicVideoLocalQuery = this.createMusicVideoQueryLocal();
                        musicVideoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                        musicVideoLocalQuery.chunkSize = this._maxResultCount;
                        musicVideoLocalQuery.aggregateChunks = false;
                        this._queryWatcher.registerQuery(musicVideoLocalQuery);
                        localPromise = musicVideoLocalQuery.execute().then(function localQuerySuccess(q) {
                            if (q.result.items)
                                that.musicVideoLocalResult = q.result.items;
                            else
                                that.musicVideoLocalResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(q.result.items);
                            that.checkSearchCompleted()
                        }, function localQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        var musicVideoMPQuery = this.createMusicVideoQueryMP();
                        musicVideoMPQuery.search = keyword;
                        musicVideoMPQuery.chunkSize = this._maxResultCount;
                        this._queryWatcher.registerQuery(musicVideoMPQuery);
                        marketplacePromise = musicVideoMPQuery.execute().then(function MPQuerySuccess(q){}, function MPQueryError(q) {
                            return WinJS.Promise.wrapError(q)
                        });
                        WinJS.Promise.join({
                            local: localPromise, marketplace: marketplacePromise
                        }).then(function allQueriesSuccess() {
                            return MS.Entertainment.ViewModels.SearchViewModel.deDup(musicVideoLocalQuery.result.items, musicVideoMPQuery.result.items)
                        }, function someQueryError() {
                            return musicVideoMPQuery.result ? musicVideoMPQuery.result.items : []
                        }).then(function marketplaceProcessingDone(marketplaceList) {
                            if (marketplaceList)
                                that.musicVideoMPResult = marketplaceList;
                            else
                                that.musicVideoMPResult = [];
                            that.completedQueryCount++;
                            that.addResultCount(marketplaceList);
                            that.checkSearchCompleted()
                        })
                    }, unregisterServices: function unregisterServices() {
                        if (!this._useFileTransferService)
                            return;
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.unregisterListener("searchCollectionTrack");
                        fileTransferService.unregisterListener("searchMarketplaceTrack");
                        fileTransferService.unregisterListener("searchCollectionMusicAlbum");
                        fileTransferService.unregisterListener("searchMarketplaceMusicAlbum");
                        fileTransferService.unregisterListener("searchCollectionMusicArtist");
                        fileTransferService.unregisterListener("searchMarketplaceMusicArtist");
                        fileTransferService.unregisterListener("searchCollectionVideo");
                        fileTransferService.unregisterListener("searchMarketplaceVideo")
                    }
            }, {
                preloadedVideoMarketplaceQuery: null, preloadedVideoMarketplaceQueryPromise: null, createMovieQueryMP: function staticCreateMovieQueryMP(edsAuthHeaderKey, edsAuthHeaderValue, searchOptions) {
                        var searchModifier = MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.allVideo;
                        searchOptions = searchOptions || MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.allVideo;
                        if (typeof(searchOptions) === "number")
                            searchModifier = searchOptions;
                        else if (typeof(searchOptions) === "object") {
                            if (searchOptions.showMovies && !searchOptions.showTVSeries)
                                searchModifier = MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.movies;
                            if (!searchOptions.showMovies && searchOptions.showTVSeries)
                                searchModifier = MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.tvShows
                        }
                        var query;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) && searchModifier === MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.allVideo)
                            query = new MS.Entertainment.Data.Query.Video.EdsCrossVideoSearch;
                        else if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) && (searchModifier === MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.allVideo || searchModifier === MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.movies))
                            query = new MS.Entertainment.Data.Query.Video.EdsSearchMovies;
                        else if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace) && (searchModifier === MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.allVideo || searchModifier === MS.Entertainment.ViewModels.VideoSearchViewModel.ViewIndex.tvShows))
                            query = new MS.Entertainment.Data.Query.Video.EdsSearchTVSeries;
                        if (query && edsAuthHeaderKey)
                            query.addHeader(edsAuthHeaderKey, edsAuthHeaderValue);
                        return query
                    }, mergeResults: function videoMerge(localList, mpList) {
                        if (!localList || localList.count === 0)
                            return WinJS.Promise.wrap(mpList);
                        else if (!mpList || mpList.count === 0)
                            return WinJS.Promise.wrap(localList);
                        var localItems = {};
                        var mergedList = [];
                        var hcrItem = null;
                        return mpList.itemsFromIndex(0, 0, 0).then(function hcrLookup(args) {
                                hcrItem = args.items[0].data
                            }).then(function() {
                                return localList.forEach(function localListForEach(localArgs) {
                                        if (localArgs.item && localArgs.item.data && localArgs.item.data.serviceId) {
                                            localItems[localArgs.item.data.serviceId] = localArgs.item.data;
                                            if (localArgs.item.data.serviceId !== hcrItem.serviceId) {
                                                if (!MS.Entertainment.Utilities.isVideoApp2)
                                                    mergedList.push(localArgs.item.data)
                                            }
                                            else {
                                                hcrItem.libraryId = localArgs.item.data.libraryId;
                                                hcrItem.hasPurchased = localArgs.item.data.hasPurchased
                                            }
                                        }
                                    })
                            }).then(function() {
                                return mpList.forEach(function mpListForEach(mpArgs) {
                                        if (mpArgs.item && mpArgs.item.data && mpArgs.item.data.serviceId)
                                            if (hcrItem && hcrItem.serviceId && hcrItem.serviceId === mpArgs.item.data.serviceId)
                                                mergedList.unshift(hcrItem);
                                            else {
                                                var localItem = localItems[mpArgs.item.data.serviceId];
                                                if (!localItem)
                                                    mergedList.push(mpArgs.item.data);
                                                else if (mpArgs.item.data.zuneId === localItem.zuneId || mpArgs.item.data.canonicalId === localItem.canonicalId) {
                                                    localItem.impressionGuid = mpArgs.item.data.impressionGuid;
                                                    localItem.relevancyTrackingContent = mpArgs.item.data.relevancyTrackingContent;
                                                    if (MS.Entertainment.Utilities.isVideoApp2) {
                                                        mpArgs.item.data.libraryId = localItem.libraryId;
                                                        mpArgs.item.data.hasPurchased = localItem.hasPurchased;
                                                        mergedList.push(mpArgs.item.data)
                                                    }
                                                }
                                                else
                                                    mergedList.push(mpArgs.item.data)
                                            }
                                    })
                            }).then(function mergeCompleted() {
                                return MS.Entertainment.Data.VirtualList.wrapArray(mergedList)
                            })
                    }, filterCastResults: function(castArray) {
                        if (!castArray)
                            return;
                        var graceNoteEnabled = false;
                        var languageString = String.empty;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.graceNoteService)) {
                            var resourceLanguage = MS.Entertainment.Utilities.getResourceLanguage();
                            var languageCode = MS.Entertainment.Utilities.getLanguageCodeFromLocale(resourceLanguage);
                            languageString = MS.Entertainment.Components.Video.Services.GraceNoteService.getIsoLanguageStringFromBcpString(languageCode);
                            graceNoteEnabled = true
                        }
                        return castArray.filter(function filterItem(item) {
                                return graceNoteEnabled && item && item.biography && item.biographyLanguage && item.biographyLanguage.toLocaleLowerCase() === languageString.toLocaleLowerCase() && item.image && item.image !== MS.Entertainment.UI.ImagePaths.genericVideoActorPlaceholder
                            })
                    }, mergeCastResults: function(castList, mergedList, keyword) {
                        if (!castList || !Array.isArray(castList) || !mergedList || !keyword)
                            return;
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var targetSlots = [{
                                    index: 0, targetEditDistance: configurationManager.video.actorSearchSlot0EditValue
                                }, {
                                    index: 2, targetEditDistance: configurationManager.video.actorSearchSlot2EditValue
                                }, {
                                    index: 5, targetEditDistance: configurationManager.video.actorSearchSlot5EditValue
                                }, {
                                    index: 8, targetEditDistance: configurationManager.video.actorSearchSlot8EditValue
                                }, {
                                    index: 11, targetEditDistance: configurationManager.video.actorSearchSlot11EditValue
                                }, {
                                    index: 14, targetEditDistance: configurationManager.video.actorSearchSlot14EditValue
                                }, {
                                    index: 17, targetEditDistance: configurationManager.video.actorSearchSlot17EditValue
                                }, ];
                        var castIndex = 0;
                        for (var i = 0; i < targetSlots.length; i++) {
                            var closestMatch = castList[castIndex];
                            if (closestMatch) {
                                var castEditDistance = closestMatch.name.toLocaleLowerCase().editDistanceFrom(keyword.toLocaleLowerCase());
                                if (castEditDistance <= targetSlots[i].targetEditDistance || targetSlots[i].index >= mergedList.count) {
                                    var targetIndex = targetSlots[i].index <= mergedList.count ? targetSlots[i].index : mergedList.count;
                                    mergedList.insertAt(targetIndex, closestMatch);
                                    castIndex++
                                }
                            }
                        }
                        return mergedList
                    }, deDup: function deDup(localList, mpList) {
                        if (!localList || localList.count === 0 || !mpList || mpList.count === 0)
                            return WinJS.Promise.wrap(mpList);
                        var that = this;
                        var deDupedList = [];
                        return mpList.forEach(function mpListForEach(mpArgs) {
                                var found = false;
                                return localList.forEach(function localListForEach(localArgs) {
                                        if (localArgs.item && localArgs.item.data && localArgs.item.data.serviceId && mpArgs.item && mpArgs.item.data && mpArgs.item.data.serviceId)
                                            if (localArgs.item.data.serviceId === mpArgs.item.data.serviceId || localArgs.item.data.zuneId === mpArgs.item.data.zuneId || localArgs.item.data.canonicalId === mpArgs.item.data.canonicalId) {
                                                found = true;
                                                localArgs.item.data.impressionGuid = mpArgs.item.data.impressionGuid;
                                                localArgs.item.data.relevancyTrackingContent = mpArgs.item.data.relevancyTrackingContent;
                                                localArgs.item.data.fromCollection = mpArgs.item.data.fromCollection;
                                                localArgs.stop = true
                                            }
                                    }).then(function() {
                                        if (!found)
                                            deDupedList.push(mpArgs.item.data)
                                    })
                            }).then(function forEachCompleted() {
                                return MS.Entertainment.Data.VirtualList.wrapArray(deDupedList)
                            })
                    }
            })
    })
})()
