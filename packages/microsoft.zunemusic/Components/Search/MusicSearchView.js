/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicSearchTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Pages.SearchTemplateSelector", function musicSearchTemplateSelector(galleryView) {
            MS.Entertainment.Pages.SearchTemplateSelector.prototype.constructor.apply(this, arguments);
            if (MS.Entertainment.Utilities.isMusicApp1) {
                this.addTemplate("header", "Components/Music/MusicSharedTemplates.html#searchResultsHeaderTemplate");
                this.addTemplate("collectionArtist", "Components/Music/MusicSharedTemplates.html#searchResultsArtistCollectionTemplate");
                this.addTemplate("collectionAlbum", "Components/Music/MusicSharedTemplates.html#searchResultsAlbumCollectionTemplate");
                this.addTemplate("collectionSong", "Components/Music/MusicSharedTemplates.html#searchResultsSongCollectionTemplate");
                this.addTemplate("collectionPlaylist", "Components/Music/MusicSharedTemplates.html#searchResultsPlaylistCollectionTemplate");
                this.addTemplate("marketplaceArtist", "Components/Music/MusicSharedTemplates.html#searchResultsArtistMarketplaceTemplate");
                this.addTemplate("marketplaceAlbum", "Components/Music/MusicSharedTemplates.html#searchResultsAlbumMarketplaceTemplate");
                this.addTemplate("marketplaceSong", "Components/Music/MusicSharedTemplates.html#searchResultsSongMarketplaceTemplate");
                this.addTemplate("emptyGallery", "Controls/GalleryControl.html#listViewEmptyGalleryTemplate");
                this.addTemplate("modifierAction", "Components/Music/MusicSharedTemplates.html#horizontalActionTemplate")
            }
            else {
                this.addTemplate("header", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsHeaderTemplate");
                this.addTemplate("collectionArtist", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsArtistCollectionTemplate");
                this.addTemplate("collectionAlbum", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsAlbumCollectionTemplate");
                this.addTemplate("collectionSong", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsSongCollectionTemplate");
                this.addTemplate("collectionPlaylist", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsPlaylistCollectionTemplate");
                this.addTemplate("marketplaceArtist", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsArtistMarketplaceTemplate");
                this.addTemplate("marketplaceAlbum", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsAlbumMarketplaceTemplate");
                this.addTemplate("marketplaceSong", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsSongMarketplaceTemplate");
                this.addTemplate("marketplaceMusicVideo", "Components/Music/MusicSharedTemplates.html#horizontalSearchResultsMusicVideoMarketplaceTemplate");
                this.addTemplate("emptyGallery", "Controls/GalleryControl.html#listViewEmptyGalleryTemplate");
                this.addTemplate("modifierAction", "Components/Music/MusicSharedTemplates.html#horizontalActionTemplate")
            }
        }, {ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
                if (MS.Entertainment.Utilities.isMusicApp1)
                    return this.ensureTemplatesLoaded(["header", "collectionArtist", "collectionAlbum", "collectionSong", "collectionPlaylist", "marketplaceArtist", "marketplaceAlbum", "marketplaceSong", "emptyGallery", "modifierAction", ]);
                else
                    return this.ensureTemplatesLoaded(["header", "collectionArtist", "collectionAlbum", "collectionSong", "collectionPlaylist", "marketplaceArtist", "marketplaceAlbum", "marketplaceSong", "marketplaceMusicVideo", "emptyGallery", "modifierAction", ])
            }})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicSearchTemplateSelectorAll: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Pages.MusicSearchTemplateSelector", function musicSearchTemplateSelectorAll() {
            MS.Entertainment.Pages.MusicSearchTemplateSelector.prototype.constructor.apply(this, arguments);
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            this._marketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace)
        }, {
            _marketplaceEnabled: true, getPanelTemplatePath: function getPanelTemplatePath(item) {
                    return this._getPanelTemplatePath(item, this._marketplaceEnabled)
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {MusicSearch: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Search", "Components/Marketplace.html#marketplaceTemplate", function musicSearch() {
            this.templateSelectorConstructor = MS.Entertainment.Pages.MusicSearchTemplateSelectorAll
        }, {
            initialize: function initialize() {
                MS.Entertainment.Pages.Search.prototype.initialize.call(this)
            }, unload: function unload() {
                    if (this._viewModel)
                        this._viewModel.searchCompleted = null;
                    MS.Entertainment.Pages.Search.prototype.unload.call(this)
                }, _setGalleryItems: function _setGalleryItems() {
                    if (this._viewModel.modifierSelectionManager.selectedIndex === MS.Entertainment.ViewModels.SearchFilter.all)
                        this.templateSelectorConstructor = MS.Entertainment.Pages.MusicSearchTemplateSelectorAll;
                    else
                        this.templateSelectorConstructor = MS.Entertainment.Pages.MusicSearchTemplateSelector;
                    if (!this._viewModel.searchCompleted)
                        this._viewModel.searchCompleted = function _searchViewModelCallback(resultsCount) {
                            if (resultsCount === 0 && this._galleryView && this._galleryView.emptyGalleryModel)
                                this._galleryView.emptyGalleryModel.isVisible = true
                        }.bind(this);
                    MS.Entertainment.Pages.Search.prototype._setGalleryItems.call(this);
                    this._setEmptyGalleryModel()
                }, _setEmptyGalleryModel: function _setEmptyGalleryModel() {
                    if (!this._galleryView)
                        return;
                    if (this._viewModel.isCollectionView) {
                        this._galleryView.emptyGalleryModel = MS.Entertainment.Utilities.isMusicApp2 ? new MS.Entertainment.UI.Controls.Music2SearchCollectionEmptyPanelModel : new MS.Entertainment.UI.Controls.SearchCollectionEmptyPanelModel;
                        if (this._viewModel.isAllMusicSearchEnabled)
                            this._galleryView.emptyGalleryModel.details = [{
                                    stringId: String.id.IDS_MUSIC_SEARCH_MY_EMPTY_DESC, linkStringId: String.id.IDS_MUSIC_SEARCH_MY_EMPTY_LINK, linkIcon: MS.Entertainment.UI.Icon.search, linkHideDefaultRing: false
                                }];
                        var resetSearchFilterAct = new MS.Entertainment.UI.Actions.ResetSearchFilterAction;
                        resetSearchFilterAct.parameter = {viewModel: this._viewModel};
                        this._galleryView.emptyGalleryModel.action = resetSearchFilterAct
                    }
                    else {
                        this._galleryView.emptyGalleryModel = MS.Entertainment.Utilities.isMusicApp2 ? new MS.Entertainment.UI.Controls.Music2SearchAllEmptyPanelModel : new MS.Entertainment.UI.Controls.SearchAllEmptyPanelModel;
                        if (this._viewModel.canSwitchToAllMusicView) {
                            this._galleryView.emptyGalleryModel.details = [{
                                    stringId: String.id.IDS_MUSIC_SEARCH_MY_EMPTY_DESC, linkStringId: String.id.IDS_MUSIC_SEARCH_ALL_EMPTY_LINK, linkIcon: MS.Entertainment.UI.Icon.search, linkHideDefaultRing: false
                                }];
                            var resetSearchFilterAct = new MS.Entertainment.UI.Actions.ResetSearchHubAction;
                            resetSearchFilterAct.parameter = {viewModel: this._viewModel};
                            this._galleryView.emptyGalleryModel.action = resetSearchFilterAct
                        }
                    }
                    this._galleryView.emptyGalleryTemplate = "Controls/GalleryControl.html#listViewEmptyGalleryTemplate";
                    if (this._viewModel.hasSearchedAtLeastOnce() && !this._galleryView.emptyGalleryModel.isVisible)
                        this._galleryView.emptyGalleryModel.isVisible = true
                }
        })})
})()
