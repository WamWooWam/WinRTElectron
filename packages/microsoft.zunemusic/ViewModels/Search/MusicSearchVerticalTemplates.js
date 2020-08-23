/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {MusicSearchTemplates: {
            all: {
                tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.single, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, selectionStyleFilled: true, forceInteractive: true, grouped: true, grouperType: MS.Entertainment.UI.Controls.SearchResultsGrouper, grouperField: "mediaType", hideShadow: true, headerType: MS.Entertainment.UI.Controls.GalleryControl && MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace, backdropColor: "rgba(0, 0, 0, 0.12)", strings: {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL}
            }, primary: {
                    tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.list, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, selectionMode: MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.single, swipeBehavior: MS.Entertainment.UI.Controls.GalleryControl.swipeBehavior.select, selectionStyleFilled: true, forceInteractive: true, grouped: false, hideShadow: true, backdropColor: "rgba(0, 0, 0, 0.12)", strings: {countFormatStringId: String.id.IDS_MUSIC_TYPE_TRACK_PLURAL}
                }
        }})
})()
