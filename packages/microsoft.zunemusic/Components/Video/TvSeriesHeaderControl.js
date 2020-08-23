/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {TvSeriesHeaderControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Video/TvSeriesHeaderControl.html#tvSeriesHeaderControlTemplate", function episodeControlConstructor(element, options) {
            this.series = {}
        }, {
            initialize: function initialize() {
                var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                var seriesMediaItem = new MS.Entertainment.Data.Augmenter.Library.TVSeries;
                setProperty(seriesMediaItem, "id", this.series.seriesId);
                setProperty(seriesMediaItem, "serviceId", this.series.seriesId);
                setProperty(seriesMediaItem, "serviceIdType", MS.Entertainment.Data.Query.edsIdType.canonical);
                setProperty(seriesMediaItem, "libraryId", this.series.seriesLibraryId);
                setProperty(seriesMediaItem, "imageUri", this.series.seriesImageUri);
                setProperty(seriesMediaItem, "title", this.series.seriesTitle);
                setProperty(seriesMediaItem, "name", this.series.seriesTitle);
                this.seriesMediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(seriesMediaItem)
            }, onClick: function onClick() {
                    if (this.seriesMediaItem.hydrate) {
                        var hydrateOptions = {listenForDBUpdates: true};
                        this.seriesMediaItem.hydrate(hydrateOptions).then(function showDetailsSuccess() {
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.seriesMediaItem)
                        }.bind(this), function showDetailsError() {
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(this.seriesMediaItem)
                        }.bind(this))
                    }
                }, onKeyDown: function onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space) {
                        this.onClick();
                        event.stopPropagation()
                    }
                }
        }, {
            seriesMediaItem: null, stringId: String.id.IDS_DETAILS_VIEW_FULL_SERIES, text: null, series: null
        })})
})()
