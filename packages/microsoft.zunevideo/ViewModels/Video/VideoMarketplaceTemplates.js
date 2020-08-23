/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoGalleryColors: {backdropColor: "#222222"}});
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoMarketplaceTemplates: {
            movie: {
                templateUrl: "/Components/Video/VideoMarketplaceTemplates.html#moviePosterTileL2", actionTemplateUrl: "/Components/Video/VideoMarketplaceTemplates.html#horizontalActionTemplate", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, slotSize: {
                        width: 180, height: 245
                    }, itemSize: {
                        width: 180, height: 245
                    }, mediaType: "video", emptyGalleryTemplate: "/Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", allowEmpty: false, grouped: false, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor, panelTemplateTypeMappings: [{
                            key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeason, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                        }, {
                            key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeries, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                        }, {
                            key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.movie, panelTemplate: "MS.Entertainment.Pages.MovieInlineDetails"
                        }, {
                            key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.tvEpisode, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                        }, {
                            key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.other, panelTemplate: "MS.Entertainment.Pages.OtherVideoInlineDetails"
                        }]
            }, tvSeries: {
                    templateUrl: "/Components/Video/VideoMarketplaceTemplates.html#tvSeriesTileL2", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, slotSize: {
                            width: 245, height: 245
                        }, itemSize: {
                            width: 245, height: 245
                        }, mediaType: "video", emptyGalleryTemplate: "/Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", allowEmpty: false, grouped: false, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor, panelTemplateTypeMappings: [{
                                key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeason, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeries, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.movie, panelTemplate: "MS.Entertainment.Pages.MovieInlineDetails"
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.tvEpisode, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.other, panelTemplate: "MS.Entertainment.Pages.OtherVideoInlineDetails"
                            }]
                }, tvSeason: {
                    templateUrl: "/Components/Video/VideoMarketplaceTemplates.html#tvSeriesTileL2", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, slotSize: {
                            width: 245, height: 245
                        }, itemSize: {
                            width: 245, height: 245
                        }, mediaType: "video", emptyGalleryTemplate: "/Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", allowEmpty: false, grouped: false, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor, panelTemplateTypeMappings: [{
                                key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeason, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "mediaType", value: Microsoft.Entertainment.Queries.ObjectType.tvSeries, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.movie, panelTemplate: "MS.Entertainment.Pages.MovieInlineDetails"
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.tvEpisode, panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl()
                            }, {
                                key: "videoType", value: Microsoft.Entertainment.Queries.VideoType.other, panelTemplate: "MS.Entertainment.Pages.OtherVideoInlineDetails"
                            }]
                }, flexHub: {
                    panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, slotSize: {
                            width: 295, height: 165
                        }, itemSize: {
                            width: 295, height: 165
                        }, mediaType: "video", grouped: false, multiSize: true, itemMargin: {
                            top: 4, bottom: 4
                        }, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor, maxRows: MS.Entertainment.Utilities.getLegacyVideoRowCountForResolution()
                }
        }})
})()
