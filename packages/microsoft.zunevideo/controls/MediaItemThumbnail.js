/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MediaItemThumbnail: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ThumbnailButton", "/Controls/ThumbnailButton.html#thumbnailButtonTemplate", function mediaItemThumbnailConstructor() {
            this._findNotificationForDisplay = this._findNotificationForDisplay.bind(this);
            this._displayedNotificationUpdated = this._displayedNotificationUpdated.bind(this)
        }, {
            _uniqueListenerId: null, _imageUrlCallbackToken: null, showNotifications: true, initialize: function mediaItemThumbnail_initialize() {
                    MS.Entertainment.UI.Controls.ThumbnailButton.prototype.initialize.call(this);
                    this.bind("mediaItem", this._mediaItemChanged.bind(this))
                }, unload: function unload() {
                    this.unbind("mediaItem");
                    this._mediaItemChanged(null, this.mediaItem);
                    if (this._imageUrlCallbackToken)
                        MS.Entertainment.UI.Shell.ImageLoader.unregisterMediaItemImageUrlCallback(this._imageUrlCallbackToken);
                    MS.Entertainment.UI.Controls.ThumbnailButton.prototype.unload.call(this)
                }, _mediaItemChanged: function _mediaItemChanged(newValue, oldValue) {
                    var calculatedImageWidth,
                        calculatedImageHeight;
                    if (newValue) {
                        this.target = newValue;
                        this.filePath = newValue.filePath;
                        this.imageFallbackUrl = MS.Entertainment.UI.Shell.ImageLoader.getMediaItemDefaultImageUrl(newValue)
                    }
                    if (oldValue && this._imageUrlCallbackToken) {
                        MS.Entertainment.UI.Shell.ImageLoader.unregisterMediaItemImageUrlCallback(this._imageUrlCallbackToken);
                        this._imageUrlCallbackToken = null
                    }
                    if (newValue && newValue.mediaType !== Microsoft.Entertainment.Queries.ObjectType.playlist && newValue.mediaType !== Microsoft.Entertainment.Queries.ObjectType.person) {
                        if (this.imageWidth !== null && (typeof this.imageWidth) === "string") {
                            var index = this.imageWidth.indexOf("px");
                            if (index > 0)
                                calculatedImageWidth = this.imageWidth.substr(0, index)
                        }
                        if (this.imageHeight !== null && (typeof this.imageHeight) === "string") {
                            var index = this.imageHeight.indexOf("px");
                            if (index > 0)
                                calculatedImageHeight = this.imageHeight.substr(0, index)
                        }
                        if (this.templateName === "videoThumbnailButtonTemplate" && (calculatedImageHeight <= 135 && calculatedImageWidth <= 99)) {
                            calculatedImageHeight = 160;
                            calculatedImageWidth = 107
                        }
                        this._imageUrlCallbackToken = MS.Entertainment.UI.Shell.ImageLoader.registerMediaItemImageUrlCallback(newValue, function setImagePrimaryUrl(url) {
                            if (this.imagePrimaryUrl !== url)
                                this.imagePrimaryUrl = url
                        }.bind(this), calculatedImageWidth, calculatedImageHeight)
                    }
                    if (this.showNotifications) {
                        if (oldValue && oldValue.contentNotifications)
                            oldValue.contentNotifications.removeChangeListener(this._findNotificationForDisplay);
                        this.displayedNotification = null;
                        if (newValue && newValue.contentNotifications) {
                            newValue.contentNotifications.addChangeListener(this._findNotificationForDisplay);
                            this._findNotificationForDisplay()
                        }
                    }
                    else
                        this.displayedNotification = null
                }, _findNotificationForDisplay: function _findNotificationForDisplay() {
                    var i,
                        item;
                    var notifications = this.mediaItem.contentNotifications;
                    for (i = 0; i < notifications.length; i++) {
                        item = WinJS.Binding.unwrap(notifications).item(i);
                        if (item.shortText) {
                            if (item !== this._displayedNotification)
                                this.displayedNotification = item;
                            return
                        }
                    }
                    this.displayedNotification = null
                }, displayedNotification: {
                    get: function get_displayedNotification() {
                        return this._displayedNotification
                    }, set: function set_displayedNotification(value) {
                            if (this._displayedNotification)
                                this._displayedNotification.unbind("shortText", this._displayedNotificationUpdated);
                            this._displayedNotification = value;
                            if (this._displayedNotification)
                                this._displayedNotification.bind("shortText", this._displayedNotificationUpdated);
                            else
                                this.quaternaryText = ""
                        }, enumerable: false
                }, _displayedNotification: null, _displayedNotificationUpdated: function _displayedNotificationUpdated(newValue) {
                    if (newValue)
                        this.quaternaryText = newValue;
                    else
                        this._findNotificationForDisplay()
                }
        }, {mediaItem: null})})
})()
