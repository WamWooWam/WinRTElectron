/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        VideoInlineDetailsSpotlightDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "/Components/InlineDetails/VideoInlineDetailsDemo.html#videoSpotlightInlineDetailsDemoTemplate", function VideoInlineDetailsSpotlightDemo(element, options){}, {
            initialize: function initialize() {
                MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }
        }), VideoInlineDetailsMarketplaceDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "/Components/InlineDetails/VideoInlineDetailsDemo.html#videoMarketplaceInlineDetailsDemoTemplate", function VideoInlineDetailsMarketplaceDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            }), VideoInlineDetailsMarketplaceNoTvDemo: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseInlineDetails", "/Components/InlineDetails/VideoInlineDetailsDemo.html#videoMarketplaceInlineDetailsNoTvDemoTemplate", function VideoInlineDetailsNoTvDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            })
    })
})()
