/* Copyright (C) Microsoft Corporation. All rights reserved. */
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {VideoSearchTemplateSelector: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Pages.SearchTemplateSelector", function videoSearchTemplateSelector(galleryView) {
            MS.Entertainment.Pages.SearchTemplateSelector.prototype.constructor.apply(this, arguments);
            if (MS.Entertainment.Utilities.isVideoApp1) {
                if (galleryView.headerType === MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace)
                    this.addTemplate("header", "/Components/Video/VideoSearchTemplates.html#searchGroupHeaderInPlace");
                else
                    this.addTemplate("header", "/Components/Video/VideoSearchTemplates.html#searchGroupHeader");
                this.addTemplate("marketplaceMovie", "/Components/Video/VideoSearchTemplates.html#movieTitleYearTemplate");
                this.addTemplate("marketplaceTVSeries", "/Components/Video/VideoSearchTemplates.html#tvSeriesSeasonTemplate");
                this.addTemplate("collectionMovie", "/Components/Video/VideoSearchTemplates.html#movieTitleYearTemplate");
                this.addTemplate("collectionTVSeries", "/Components/Video/VideoSearchTemplates.html#tvSeriesSeasonTemplate");
                this.addTemplate("otherVideo", "/Components/Video/VideoCollectionTemplates.html#videoTitleDurationTemplate");
                this.addTemplate("videoHCR", "/Components/Video/VideoSearchTemplates.html#videoSearchHCRViewTemplate")
            }
            else {
                if (galleryView.headerType === MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace)
                    this.addTemplate("header", "/Components/Video/VideoSearchTemplates2.html#searchGroupHeaderInPlace");
                else
                    this.addTemplate("header", "/Components/Video/VideoSearchTemplates2.html#searchGroupHeader");
                this.addTemplate("marketplaceMovie", "/Components/Video/VideoSearchTemplates2.html#cardMovieTitleYearTemplate");
                this.addTemplate("marketplaceTVSeries", "/Components/Video/VideoSearchTemplates2.html#cardTvSeriesSeasonTemplate");
                this.addTemplate("collectionMovie", "/Components/Video/VideoSearchTemplates2.html#cardMovieTitleYearTemplate");
                this.addTemplate("collectionTVSeries", "/Components/Video/VideoSearchTemplates2.html#cardTvSeriesSeasonTemplate");
                this.addTemplate("otherVideo", "/Components/Video/VideoSearchTemplates2.html#cardVideoTitleDurationTemplate");
                this.addTemplate("videoHCR", "/Components/Video/VideoSearchTemplates2.html#videoSearchHCRViewTemplate")
            }
        }, {ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
                return this.ensureTemplatesLoaded(["header", "marketplaceMovie", "marketplaceTVSeries", "collectionMovie", "collectionTVSeries", "otherVideo", "videoHCR"])
            }})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {VideoSearchTemplateSelectorAll: MS.Entertainment.UI.Framework.derive("MS.Entertainment.Pages.VideoSearchTemplateSelector", function videoSearchTemplateSelectorAll() {
            MS.Entertainment.Pages.VideoSearchTemplateSelector.prototype.constructor.apply(this, arguments)
        }, {getPanelTemplatePath: function getPanelTemplatePath(item) {
                return this._getPanelTemplatePath(item, MS.Entertainment.UI.NetworkStatusService.isOnline())
            }})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {NewVideoSearch: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Search", "/Components/Marketplace.html#marketplaceTemplate", function newVideoSearch() {
            this.templateSelectorConstructor = MS.Entertainment.Pages.VideoSearchTemplateSelectorAll
        }, {allowEmpty: false})});
    WinJS.Namespace.define("MS.Entertainment.Pages", {Video2Search: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.Search", "/Components/Video/VideoMarketplaceTemplates.html#searchGalleryTemplate", null, {}, {}, {
            tvSeriesSearchTemplateSize: 440, movieSearchTemplateSize: 324, computeSearchItemSize: function computeSearchItemSize(item) {
                    var itemType = WinJS.Utilities.getMember("actionType.mediaType", item) || item.mediaType;
                    switch (itemType) {
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Episode:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Season:
                        case MS.Entertainment.Data.Augmenter.Marketplace.EditorialType.Series:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            return MS.Entertainment.ViewModels.VideoMarketplace.tvSeriesLowDensityCardTemplateSize;
                        default:
                            return MS.Entertainment.ViewModels.VideoMarketplace.movieLowDensityCardTemplateSize
                    }
                }
        })})
})()
