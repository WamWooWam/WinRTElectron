/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/ViewModels/Video/VideoMarketplaceTemplates.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {VideoSearchTemplates: {
            all: {
                tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.grid, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, emptyGalleryTemplate: "/Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", allowEmpty: false, forceInteractive: true, grouped: false, headerType: MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace, horizontal: true, groupHeaderPosition: "inline", hideShadow: true, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor, multiSize: true, startNewColumnOnHeaders: false, slotSize: {
                        width: 295, height: 165
                    }, itemSize: {
                        width: 295, height: 165
                    }, itemMargin: {
                        top: 4, bottom: 4
                    }, maxRows: MS.Entertainment.Utilities.getLegacyVideoRowCountForResolution()
            }, noMarketplace: {
                    tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.grid, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, emptyGalleryTemplate: "/Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", allowEmpty: false, forceInteractive: true, grouped: false, horizontal: true, hideShadow: true, backdropColor: MS.Entertainment.ViewModels.VideoGalleryColors.backdropColor
                }
        }})
})()
