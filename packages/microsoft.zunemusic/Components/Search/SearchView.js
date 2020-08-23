/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {SearchTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.UI.Controls.GalleryTemplateSelector", function galleryTemplateSelector(galleryView) {
            MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
            this._galleryView = galleryView
        }, {
            _galleryView: null, ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
                    MS.Entertainment.Pages.assert(false, "SearchTemplateSelector.ensureItemTemplatesLoaded is abstract - should never be called")
                }, onSelectTemplate: function onSelectTemplate(item) {
                    var template = null;
                    if (item.isHeader)
                        template = "header";
                    else if (item.data && item.data.isAction)
                        template = "modifierAction";
                    else {
                        var data = (item && item.data) ? item.data : {};
                        switch (data.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                                template = data.inCollection ? "collectionArtist" : "marketplaceArtist";
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                template = data.inCollection ? "collectionAlbum" : "marketplaceAlbum";
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                template = data.inCollection ? "collectionSong" : "marketplaceSong";
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.playlist:
                                template = "collectionPlaylist";
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                                if (data.isHCR)
                                    template = "videoHCR";
                                else
                                    template = data.inCollection ? "collectionTVSeries" : "marketplaceTVSeries";
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.video:
                                if (data.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                                    if (data.isHCR)
                                        template = "videoHCR";
                                    else
                                        template = data.inCollection ? "collectionMovie" : "marketplaceMovie";
                                else if (data.videoType === Microsoft.Entertainment.Queries.VideoType.other)
                                    template = "otherVideo";
                                else if (data.videoType === Microsoft.Entertainment.Queries.VideoType.musicVideo)
                                    template = "marketplaceMusicVideo";
                                else
                                    MS.Entertainment.Pages.assert(false, "Unknown video type in search results");
                                break;
                            default:
                                MS.Entertainment.Pages.assert(false, "no template defined");
                                break
                        }
                    }
                    this.ensureTemplatesLoaded([template]);
                    return this.getTemplateProvider(template)
                }, getPanelTemplatePath: function getPanelTemplatePath(item) {
                    return this._getPanelTemplatePath(item, false)
                }, _getPanelTemplatePath: function getPanelTemplatePath(item, forceMarketplace) {
                    var data = (item && item.data) ? item.data : {};
                    this._galleryView.panelOptions = (data && data.inCollection && (!forceMarketplace || !data.hasCanonicalId)) ? {location: MS.Entertainment.Data.ItemLocation.collection} : {location: MS.Entertainment.Data.ItemLocation.marketplace};
                    switch (data.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            return MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl();
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (data.videoType === Microsoft.Entertainment.Queries.VideoType.movie)
                                return "MS.Entertainment.Pages.MovieInlineDetails";
                            MS.Entertainment.Pages.assert(data.videoType === Microsoft.Entertainment.Queries.VideoType.other, "unknown video type");
                            return "";
                        default:
                            MS.Entertainment.Pages.assert(false, "no template defined");
                            return null
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Search: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.MarketplaceBase", "/Components/Marketplace.html#marketplaceTemplate", function search(){}, {
            allowEmpty: true, templateSelectorConstructor: null, _searchResultsCounts: null, _uiStateService: null, initializeWithEmptyItems: false, initialize: function initialize() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype.initialize.call(this);
                    this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRender() {
                        MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioSearchGalleryRequestToLoad()
                    })
                }, unload: function unload() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype.unload.call(this)
                }, _setGalleryItems: function _setGalleryItems() {
                    if (this._unloaded)
                        return;
                    if (this._galleryView)
                        this._galleryView.templateSelectorConstructor = this.templateSelectorConstructor;
                    if (this.initializeWithEmptyItems) {
                        this._galleryView.dataSource = null;
                        this.initializeWithEmptyItems = false
                    }
                    MS.Entertainment.Pages.MarketplaceBase.prototype._setGalleryItems.call(this)
                }, freeze: function freeze() {
                    var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                    this._searchResultsCounts = searchResultCounts.backup();
                    MS.Entertainment.Pages.MarketplaceBase.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.Pages.MarketplaceBase.prototype.thaw.call(this);
                    if (this._searchResultsCounts) {
                        var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                        searchResultCounts.restore(this._searchResultsCounts)
                    }
                }
        }, null, {hcrZestTypes: {
                tvSeries: "Series", movie: "Movie", album: "Album", artist: "Artist", track: "Track"
            }})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {SearchResultsGroupHeader: MS.Entertainment.UI.Framework.defineUserControl(null, function searchResultsGroupHeaderConstructor(element){}, {
            controlName: "SearchResultsGroupHeader", _groupTypeBinding: null, _resultCountBinding: null, _labelWithCount: null, initialize: function initialize() {
                    this._groupTypeBinding = WinJS.Binding.bind(this, {groupType: this._onGroupTypeChange.bind(this)})
                }, unload: function unload() {
                    if (this._groupTypeBinding) {
                        this._groupTypeBinding.cancel();
                        this._groupTypeBinding = null
                    }
                    if (this._resultCountBinding) {
                        this._resultCountBinding.cancel();
                        this._resultCountBinding = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _onGroupTypeChange: function _onGroupTypeChange(groupType) {
                    if (!this._unloaded && groupType) {
                        var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                        this.domElement.parentElement.setAttribute("data-win-automationid", groupType);
                        MS.Entertainment.Framework.assert(!this._resultCountBinding, "Result count binding already exists");
                        switch (groupType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person + String.empty:
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_ARTISTS_GROUP_HEADER_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {artistsCount: this._handleCountChange.bind(this)});
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.album + String.empty:
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_ALBUMS_GROUP_HEADER_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {albumsCount: this._handleCountChange.bind(this)});
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.track + String.empty:
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_SONGS_GROUP_HEADER_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {songsCount: this._handleCountChange.bind(this)});
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.playlist + String.empty:
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_PLAYLISTS_GROUP_HEADER_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {playlistsCount: this._handleCountChange.bind(this)});
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.video + String.empty:
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {playlistsCount: this._handleCountChange.bind(this)});
                                break;
                            case"collectionMovie":
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_MOVIELOCAL_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {movieLocalCount: this._handleCountChange.bind(this)});
                                break;
                            case"marketplaceMovie":
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_MOVIEMARKETPLACE_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {movieMPCount: this._handleCountChange.bind(this)});
                                break;
                            case"collectionTVSeries":
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_TVSERIESLOCAL_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {tvSeriesLocalCount: this._handleCountChange.bind(this)});
                                break;
                            case"marketplaceTVSeries":
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_TVSERIESMARKETPLACE_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {tvSeriesMPCount: this._handleCountChange.bind(this)});
                                break;
                            case"otherVideo":
                                this._labelWithCount = String.load(String.id.IDS_SEARCH_OTHERVIDEOSLOCAL_LABEL);
                                this._resultCountBinding = WinJS.Binding.bind(searchResultCounts, {otherVideoLocalResultCount: this._handleCountChange.bind(this)});
                                break;
                            case"-1":
                                this.domElement.textContent = String.load(String.id.IDS_MUSIC_SEARCH_TOP_RESULT);
                                break;
                            case"all":
                                this.domElement.textContent = String.load(String.id.IDS_SEARCH_MODIFIER_PIVOT_LABEL);
                                break;
                            default:
                                MS.Entertainment.Pages.assert(false, "unexpected group type");
                                break
                        }
                    }
                }, _handleCountChange: function _handleCountChange(count) {
                    if (!this._unloaded && count >= 0) {
                        var formattedCount = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(count);
                        this.domElement.textContent = this._labelWithCount.format(formattedCount)
                    }
                }
        }, {groupType: null})})
})()
