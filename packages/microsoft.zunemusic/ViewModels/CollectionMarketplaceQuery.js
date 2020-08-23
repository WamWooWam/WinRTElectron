/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Data/query.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {CollectionMarketplaceListQuery: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Data.AggregateQuery", function collectionMarketplaceQuery() {
            MS.Entertainment.Data.AggregateQuery.prototype.constructor.apply(this, arguments);
            this.resultAugmentationFactory = {create: this._createResultAugmentation.bind(this)};
            this._serviceIdMappings = {};
            this.queries.length = 2
        }, {
            _serviceIdMappings: null, marketplaceQueryIndex: 0, collectionQueryIndex: 1, baseResultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.Music.MergedCollectionMarketplaceResult, itemAugmentation: null, collectionQuery: {
                    get: function() {
                        return this.queries[this.collectionQueryIndex]
                    }, set: function(value) {
                            if (this.collectionQuery !== value) {
                                var oldValue = this.collectionQuery;
                                this.queries[this.collectionQueryIndex] = value;
                                this.notify("collectionQuery", value, oldValue)
                            }
                        }
                }, marketplaceQuery: {
                    get: function() {
                        return this.queries[this.marketplaceQueryIndex]
                    }, set: function(value) {
                            if (this.marketplaceQuery !== value) {
                                var oldValue = this.marketplaceQuery;
                                this.queries[this.marketplaceQueryIndex] = value;
                                this.notify("marketplaceQuery", value, oldValue)
                            }
                        }
                }, _createResultAugmentation: function _createResultAugmentation() {
                    var augment = MS.Entertainment.Data.Property.augment;
                    var unionNoDeflate = MS.Entertainment.Data.Property.unionNoDeflate;
                    return MS.Entertainment.Data.derive(this.baseResultAugmentation, null, {items: unionNoDeflate("marketplaceItems", "collectionItems", this._comparer.bind(this), this._merger.bind(this), this.itemAugmentation)})
                }, _preInnerExecute: function _preInnerExecute() {
                    if (this.isLoadingFromStart)
                        this._serviceIdMappings = {}
                }, _comparer: function _comparer(marketplaceItem, collectionItem) {
                    return (marketplaceItem) ? -1 : (collectionItem) ? 1 : NaN
                }, _merger: function _merger(marketplaceItem, collectionItem) {
                    var zuneId;
                    var mergedItem;
                    if (collectionItem) {
                        zuneId = collectionItem.zuneId;
                        mergedItem = this._serviceIdMappings[zuneId]
                    }
                    if (mergedItem) {
                        mergedItem.source[this.collectionQueryIndex] = collectionItem;
                        return
                    }
                    if (marketplaceItem) {
                        zuneId = marketplaceItem.zuneId;
                        mergedItem = this._serviceIdMappings[zuneId]
                    }
                    if (mergedItem) {
                        mergedItem.source[this.marketplaceQueryIndex] = marketplaceItem;
                        return
                    }
                    if (zuneId) {
                        mergedItem = new MS.Entertainment.Data.Property.MergedItem(MS.Entertainment.Data.deflate(marketplaceItem), MS.Entertainment.Data.deflate(collectionItem));
                        this._serviceIdMappings[zuneId] = mergedItem
                    }
                    if (!marketplaceItem)
                        mergedItem = null;
                    return mergedItem
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {CollectionMarketplaceAlbumListQuery: MS.Entertainment.UI.Framework.derive("MS.Entertainment.ViewModels.CollectionMarketplaceListQuery", function collectionMarketplaceAlbumListQuery() {
            MS.Entertainment.ViewModels.CollectionMarketplaceListQuery.prototype.constructor.apply(this, arguments);
            this.collectionQuery = new MS.Entertainment.Data.Query.libraryAlbums;
            this.marketplaceQuery = new MS.Entertainment.Data.Query.Music.ArtistAlbums;
            this.itemAugmentation = MS.Entertainment.Data.Augmenter.Marketplace.Music.MergedAlbum;
            this.collectionQuery.chunked = false
        }, {
            aggregateChunks: true, artist: null, orderBy: MS.Entertainment.Data.Query.convertToLegacySortIfNeeded(MS.Entertainment.Data.Query.edsSortOrder.mostPopular), _preInnerExecute: function _preInnerExecute() {
                    MS.Entertainment.ViewModels.CollectionMarketplaceListQuery.prototype._preInnerExecute.call(this);
                    var promise;
                    var mediaStore;
                    if (this.isLoadingFromStart && this.artist)
                        promise = MS.Entertainment.ViewModels.MediaItemModel.getLibraryIdAsync(this.artist).then(function _startBaseInnerExecute(libraryId) {
                            this.collectionQuery.artistId = libraryId;
                            this.marketplaceQuery.artistId = this.artist.canonicalId;
                            this.marketplaceQuery.orderBy = this.orderBy
                        }.bind(this));
                    return WinJS.Promise.as(promise)
                }
        })})
})()
