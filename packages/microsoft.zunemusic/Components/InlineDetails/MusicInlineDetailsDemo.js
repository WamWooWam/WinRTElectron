/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        MusicInlineDetailsSpotlightDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "Components/InlineDetails/MusicInlineDetailsDemo.html#musicSpotlightInlineDetailsDemoTemplate", function MusicInlineDetailsDemo(element, options){}, {
            initialize: function initialize() {
                MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }
        }), MusicInlineDetailsSpotlightNoStreamingDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "Components/InlineDetails/MusicInlineDetailsDemo.html#musicSpotlightInlineDetailsNoStreamingDemoTemplate", function MusicInlineDetailsNoStreamingDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            }), MusicInlineDetailsMarketplaceDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "Components/InlineDetails/MusicInlineDetailsDemo.html#musicMarketplaceInlineDetailsDemoTemplate", function MusicInlineDetailsMarketplaceDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            }), MusicInlineDetailsMarketplaceNoStreamingDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "Components/InlineDetails/MusicInlineDetailsDemo.html#musicMarketplaceInlineDetailsNoStreamingDemoTemplate", function MusicInlineDetailsNoStreamingDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            })
    })
})()
