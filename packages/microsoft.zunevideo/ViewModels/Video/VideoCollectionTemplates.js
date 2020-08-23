/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoCollectionTemplates: {
            movies: {
                dateAdded: {
                    template: "/Components/Video/VideoMarketplaceTemplates.html#moviePosterTileL2", panelTemplate: "MS.Entertainment.Pages.MovieInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                            width: 180, height: 245
                        }, itemSize: {
                            width: 180, height: 245
                        }, grouped: false
                }, title: {
                        template: "/Components/Video/VideoMarketplaceTemplates.html#moviePosterTileL2", panelTemplate: "MS.Entertainment.Pages.MovieInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                                width: 180, height: 245
                            }, itemSize: {
                                width: 180, height: 245
                            }, grouped: false
                    }
            }, tv: {
                    dateAdded: {
                        template: "/Components/Video/VideoMarketplaceTemplates.html#tvSeriesTileL2", panelTemplate: "MS.Entertainment.Pages.TvEpisodeInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                                width: 245, height: 245
                            }, itemSize: {
                                width: 245, height: 245
                            }, grouped: false
                    }, series: {
                            template: "/Components/Video/VideoMarketplaceTemplates.html#tvSeriesTileL2", galleryClass: "collectionTVSeasonSeriesPage", panelTemplate: MS.Entertainment.Utilities.getTvInlineDetailsPopoverControl(), panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                                    width: 245, height: 245
                                }, itemSize: {
                                    width: 245, height: 245
                                }, grouperKeyAsData: false, grouped: false, groupHeaderPosition: MS.Entertainment.UI.Controls.GalleryControl.HeaderPosition.left, grouperType: MS.Entertainment.UI.Controls.GalleryAlphaWordGrouper, grouperField: "name"
                        }
                }, other: {
                    title: {
                        template: "/Components/Video/VideoStartupTemplates.html#personalFileTile", panelTemplate: "MS.Entertainment.Pages.OtherVideoInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                                width: 245, height: 245
                            }, itemSize: {
                                width: 245, height: 245
                            }, grouped: false
                    }, dateAdded: {
                            template: "/Components/Video/VideoStartupTemplates.html#personalFileTile", panelTemplate: "MS.Entertainment.Pages.OtherVideoInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection}, slotSize: {
                                    width: 245, height: 245
                                }, itemSize: {
                                    width: 245, height: 245
                                }, grouped: false
                        }
                }
        }})
})()
