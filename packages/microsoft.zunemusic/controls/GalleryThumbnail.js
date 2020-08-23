/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GalleryThumbnail: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.MediaItemThumbnail", "/Controls/ThumbnailButton.html#thumbnailButtonTemplate", null, {initialize: function galleryThumbnail_initialize() {
                MS.Entertainment.UI.Controls.MediaItemThumbnail.prototype.initialize.apply(this, arguments);
                this.imageLoadAnimation = MS.Entertainment.Animations.Gallery.loadImage
            }})})
})()
