/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Music.MusicDemo", {
        musicSpotlightClick: function musicSpotlightClick() {
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var popOverParameters = null;
            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay))
                popOverParameters = {itemConstructor: "MS.Entertainment.Pages.MusicInlineDetailsSpotlightDemo"};
            else
                popOverParameters = {itemConstructor: "MS.Entertainment.Pages.MusicInlineDetailsSpotlightNoStreamingDemo"};
            MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(popOverParameters)
        }, musicFeaturedClick: function musicFeaturedClick() {
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var popOverParameters = null;
                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay))
                    popOverParameters = {itemConstructor: "MS.Entertainment.Pages.MusicInlineDetailsMarketplaceDemo"};
                else
                    popOverParameters = {itemConstructor: "MS.Entertainment.Pages.MusicInlineDetailsMarketplaceNoStreamingDemo"};
                MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(popOverParameters)
            }
    })
})()
