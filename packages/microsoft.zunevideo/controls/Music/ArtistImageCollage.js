/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ArtistImageCollage: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.MediaImageCollage", null, null, {
            allowLargeArt: true, _queryDelayPeriod: 3000, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.MediaImageCollage.prototype.initialize.apply(this, arguments);
                    this.timerTickInterval = 10000;
                    this.timerDelayPeriod = 10 + Math.floor(Math.random() * 30000);
                    this.cellAddPeriod = 0;
                    this.cellSwapPeriod = 10000;
                    this.artShowPeriod = 20000;
                    this.artSwapPeriod = 40000;
                    this.artVisiblePeriod = 20000;
                    this.largeArtDelay = 700;
                    this.colorChangePeriod = 0;
                    this.cellRepeatBuffer = 0;
                    this.backgroundColor = "#ffffff"
                }, _loadImages: function _loadImages() {
                    if (!this.media)
                        return;
                    var hydratePromise;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    var isArtist = this.media && this.media.mediaType === Microsoft.Entertainment.Queries.ObjectType.person;
                    this._clearCells();
                    this.largeArtUrls = null;
                    if (isMusicMarketplaceEnabled && isArtist && !this.media.hasCanonicalId && this.media.hasZuneId)
                        hydratePromise = this.media.hydrate();
                    else
                        hydratePromise = WinJS.Promise.wrap();
                    hydratePromise.then(function loadMediaImage() {
                        return MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this.media, this.size.width, this.size.height)
                    }.bind(this)).then(function addUrl(url) {
                        if (this.url && url !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album && this.allowLargeArt)
                            this._addLargeArtUrl(url);
                        else
                            this._queryDelayPeriod = 0;
                        return WinJS.Promise.timeout(this._queryDelayPeriod)
                    }.bind(this)).done(function getAlbums() {
                        if (isArtist && isMusicMarketplaceEnabled && this.media && this.media.hasCanonicalId) {
                            var marketplaceAlbumQuery = new MS.Entertainment.Data.Query.Music.ArtistTopAlbums;
                            marketplaceAlbumQuery.aggregateChunks = false;
                            marketplaceAlbumQuery.artistId = this.media.canonicalId;
                            this._queryPromise = marketplaceAlbumQuery.execute().then(function(query) {
                                this._queryPromise = null;
                                if (query.result && query.result.items)
                                    query.result.items.toArray(0, 8).then(function processResults(albums) {
                                        this._setAlbumCellsOrDefault(albums)
                                    }.bind(this));
                                else
                                    this._setAlbumCellsOrDefault(null)
                            }.bind(this))
                        }
                        else if (isArtist && this.media.libraryId >= 0) {
                            var localAlbumQuery = new MS.Entertainment.Data.Query.libraryAlbums;
                            localAlbumQuery.aggregateChunks = false;
                            localAlbumQuery.chunkSize = 8;
                            localAlbumQuery.artistId = this.media.libraryId;
                            this._queryPromise = localAlbumQuery.execute().then(function(query) {
                                this._queryPromise = null;
                                if (query.result && query.result.items)
                                    query.result.items.toArray(0, 8).then(function processResults(albums) {
                                        this._setAlbumCellsOrDefault(albums)
                                    }.bind(this));
                                else
                                    this._setAlbumCellsOrDefault(null)
                            }.bind(this))
                        }
                        else if (!this.largeArtUrls || this.largeArtUrls.length === 0)
                            this._addLargeArtUrl(MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album)
                    }.bind(this), function failedToLoadAlbums(){})
                }, _addLargeArtUrl: function _addLargeArtUrl(url) {
                    var artUrls = [];
                    artUrls.push(url);
                    this.largeArtUrls = artUrls
                }, _setAlbumCellsOrDefault: function _setAlbumCellsOrDefault(albums) {
                    if (albums && albums.length > 3) {
                        if (this._unloaded || !MS.Entertainment.Utilities.checkIfInDom(this.domElement))
                            return;
                        this._setCellDefinitions(albums.length);
                        this.cellIdList = albums
                    }
                    else if (!this.largeArtUrls || this.largeArtUrls.length === 0) {
                        var modifiedAlbums = [];
                        var albumsLength = albums ? albums.length : 0;
                        switch (albumsLength) {
                            case 1:
                                modifiedAlbums.push(albums[0]);
                                modifiedAlbums.push(MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album);
                                modifiedAlbums.push(albums[0]);
                                modifiedAlbums.push(MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.album);
                                break;
                            case 2:
                                modifiedAlbums.push(albums[0]);
                                modifiedAlbums.push(albums[0]);
                                modifiedAlbums.push(albums[1]);
                                modifiedAlbums.push(albums[1]);
                                break;
                            case 3:
                                modifiedAlbums.push(albums[0]);
                                modifiedAlbums.push(albums[1]);
                                modifiedAlbums.push(albums[2]);
                                modifiedAlbums.push(albums[0]);
                                break
                        }
                        this._setCellDefinitions(modifiedAlbums.length);
                        this.cellIdList = modifiedAlbums
                    }
                }
        }, {
            size: {
                width: 135, height: 135
            }, columns: 2, rows: 2, cellOffset: 0
        })})
})()
