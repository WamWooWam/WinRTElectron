/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicHCRResult: MS.Entertainment.defineObservable(function MusicHCRResultConstructor() {
            this.hcrResult = {}
        }, {
            hcrResult: null, searchCompleted: null, startSearch: function startSearch(keyword, edsAuthHeader) {
                    this.hcrResult = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    if (!isMusicMarketplaceEnabled || !keyword) {
                        this._searchCompleted();
                        return
                    }
                    var prefixQuery = new MS.Entertainment.Data.Query.Music.CrossMusicSearch;
                    prefixQuery.keyword = keyword;
                    prefixQuery.execute().done(function hcrQueryCallback(q) {
                        if (q.result.items !== null && q.result.items.count > 0)
                            q.result.items.itemsFromIndex(0, 0, 0).then(function populateData(args) {
                                this.hcrResult = args.items[0].data;
                                if (this.hcrResult.hydrate && !this.hcrResult.hydrated)
                                    this.hcrResult.hydrate().done(function hydrated() {
                                        this._searchCompleted()
                                    }.bind(this), function hydrationFailed() {
                                        this._searchCompleted()
                                    }.bind(this));
                                else
                                    this._searchCompleted()
                            }.bind(this));
                        else
                            this._searchCompleted()
                    }.bind(this), function hcrQueryError() {
                        this._searchCompleted()
                    }.bind(this))
                }, _searchCompleted: function _searchCompleted() {
                    if (this.searchCompleted)
                        this.searchCompleted()
                }
        })})
})()
