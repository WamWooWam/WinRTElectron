/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/thumbnailbutton.js", "/Controls/mediaItemThumbnail.js", "/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieListItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.GalleryThumbnail", "/Components/Video/VideoMarketplaceTemplates.html#movieListItemButtonTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {CastAndCrewListItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.GalleryThumbnail", "/Components/Video/VideoMarketplaceTemplates.html#movieListItemButtonTemplate", function castAndCrewListItem(){}, {}, {showAnimation: null})});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MovieGridItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.GalleryThumbnail", "/Components/Video/VideoMarketplaceTemplates.html#movieGridItemButtonTemplate")});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {TvGridItem: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.GalleryThumbnail", "/Components/Video/VideoMarketplaceTemplates.html#tvGridItemButtonTemplate")})
})()
