/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {ThumbnailButton: MS.Entertainment.UI.Framework.defineUserControl("/Controls/thumbnailButton.html#thumbnailButtonTemplate", function(element, options) {
            this.imageLoader = new MS.Entertainment.UI.Shell.ImageLoader(this.thumbnailLoadCallback.bind(this));
            this.finalImageTag = this.imageLoader.imgContainer
        }, {
            containerHeight: "auto", containerWidth: null, shouldSetContainer: true, shouldSetChildren: true, mediaId: 0, mediaType: null, isMarketplace: false, actionParam: null, finalImageTag: null, showStatusIcon: false, showAlways: false, primaryTextLineCount: 3, secondaryTextLineCount: 2, secondaryTextAdjustedLineCount: 1, tertiaryTextLineCount: 2, quaternaryTextLineCount: 2, imageLoader: null, itemTemplate: null, itemTemplateProvider: null, _showAnimationCompleted: false, _imageLoaded: false, thumbnailDomElement: {get: function get_thumbnailDomElement() {
                        return this.thumbnailButton.domElement || this.thumbnailButton
                    }}, initialize: function initialize() {
                    if (this.action && this.actionParam)
                        this.action.parameter = this.actionParam;
                    if (this.action && this.actionAutomationId)
                        this.action.automationId = this.actionAutomationId;
                    if (this.shouldSetContainer)
                        this.containerWidth = this.containerWidth || this.imageWidth;
                    this.thumbnailDomElement.style.height = this.containerHeight;
                    this.thumbnailDomElement.style.width = this.containerWidth;
                    if (this.shouldSetChildren)
                        for (var i = 0; i < this.thumbnailDomElement.children.length; i++)
                            this.thumbnailDomElement.children[i].style.width = this.containerWidth;
                    if (this.imageHolder) {
                        if (this.imageHolderWidth)
                            this.imageHolder.style.width = this.imageHolderWidth;
                        else
                            this.imageHolder.style.width = this.imageWidth;
                        if (this.imageHolderHeight)
                            this.imageHolder.style.height = this.imageHolderHeight;
                        else
                            this.imageHolder.style.height = this.imageHeight
                    }
                    if (this.contentWidth) {
                        this.content.style.width = this.contentWidth;
                        this.textContainer.style.width = this.contentWidth
                    }
                    this.bind("action", this._setButtonRole.bind(this));
                    this.bind("doclick", this._setButtonRole.bind(this));
                    if (this.imageContainer)
                        this.imageContainer.setAttribute("aria-hidden", "true");
                    this.bind("imageHeight", this._updateImageHeight.bind(this));
                    this.bind("imageWidth", this._updateImageWidth.bind(this));
                    this._setTextProperties();
                    this.bind("imagePrimaryUrl", this._loadImage.bind(this))
                }, _setButtonRole: function _setButtonRole() {
                    if (this.thumbnailDomElement)
                        if (this.action || this.doclick) {
                            this.thumbnailDomElement.setAttribute("role", "button");
                            this.thumbnailDomElement.setAttribute("aria-atomic", "true");
                            WinJS.Utilities.addClass(this.thumbnailDomElement, "win-focusable")
                        }
                        else
                            WinJS.Utilities.removeClass(this.thumbnailDomElement, "win-focusable")
                }, unload: function unload() {
                    MS.Entertainment.UI.Controls.ThumbnailButton.unregisterWithInteractionTimer(this);
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, playShowTextContainerAnimation: function playShowTextContainerAnimation() {
                    if (this.content && this._textHidden) {
                        this._textHidden = false;
                        MS.Entertainment.Animations.Gallery.fadeInTextContainer(this.content)
                    }
                }, playHideTextContainerAnimation: function playHideTextContainerAnimation() {
                    if (this.content && !this._textHidden) {
                        this._textHidden = true;
                        MS.Entertainment.Animations.Gallery.fadeOutTextContainer(this.content)
                    }
                }, _showOrHideTextContainer: function _showOrHideTextContainer() {
                    if (this.primaryText || this.secondaryText || this.tertiaryText || this.quaternaryText) {
                        WinJS.Utilities.removeClass(this.content, "hidden");
                        WinJS.Utilities.addClass(this.content, "thumbnailButtonTextContainerPadding");
                        this._showThumbnail()
                    }
                    else
                        WinJS.Utilities.addClass(this.content, "hidden")
                }, _setTextProperties: function _setTextProperties() {
                    if (this.content) {
                        if (this.primaryText || this.secondaryText || this.tertiaryText || this.quaternaryText)
                            this._showThumbnail();
                        this.bind("primaryText", this._showOrHideTextContainer.bind(this));
                        this.bind("secondaryText", this._showOrHideTextContainer.bind(this));
                        this.bind("tertiaryText", this._showOrHideTextContainer.bind(this));
                        this.bind("quaternaryText", this._showOrHideTextContainer.bind(this))
                    }
                    if (this.primaryTextLabel)
                        this.primaryTextLabel.numberOfLines = this.primaryTextLineCount;
                    if (this.secondaryTextLabel)
                        this.secondaryTextLabel.numberOfLines = this.secondaryTextLineCount;
                    if (this.tertiaryTextLabel)
                        this.tertiaryTextLabel.numberOfLines = this.tertiaryTextLineCount;
                    if (this.quaternaryText)
                        this.quaternaryTextLabel.numberOfLines = this.quaternaryTextLineCount
                }, clicked: function clicked(e) {
                    var handled = false;
                    if (this.doclick) {
                        handled = true;
                        this.doclick(this)
                    }
                    if (this.action) {
                        this.action.requeryCanExecute();
                        if (this.action.isEnabled) {
                            handled = true;
                            this.action.execute()
                        }
                    }
                    if (handled)
                        e.stopPropagation()
                }, onKeyDown: function onKeyDown(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this.clicked(event)
                }, _updateImageHeight: function _updateImageHeight() {
                    if (this.imageContainer)
                        if (this.imageContainerHeight)
                            this.imageContainer.style.height = this.imageContainerHeight;
                        else
                            this.imageContainer.style.height = this.imageHeight;
                    if (this.finalImageTag)
                        this.finalImageTag.style.height = this.imageHeight
                }, _updateImageWidth: function _updateImageWidth() {
                    if (this.imageContainer)
                        if (this.imageContainerWidth)
                            this.imageContainer.style.width = this.imageContainerWidth;
                        else
                            this.imageContainer.style.width = this.imageWidth;
                    if (this.finalImageTag)
                        this.finalImageTag.style.width = this.imageWidth
                }, _loadImage: function _loadImage(url) {
                    if (url) {
                        if (!this.isInPackage)
                            this.imageLoader.loadImage(url, this.imageFallbackUrl);
                        else {
                            this.imageLoader.state = this.imageLoader.states.loaded;
                            this.imageLoader.imgUrl = this.imagePrimaryUrl
                        }
                        this._showThumbnail()
                    }
                }, _showThumbnail: function _showThumbnail() {
                    var that = this;
                    if (this.showAnimation && !this._showAnimationCompleted)
                        this.showAnimation(this.thumbnailDomElement).then(function _loadImageAnimation() {
                            that._showAnimationCompleted = true;
                            if (that._imageLoaded && that.finalImageTag && that.imageHolder && that.imageContainer)
                                that.imageLoadAnimation(that.finalImageTag, that.imageHolder, that.imageContainer)
                        });
                    else
                        that.imageContainer.style.opacity = 1.0
                }, thumbnailLoadCallback: function thumbnailLoadCallback(finalUrl) {
                    if (this.imageLoader.state < this.imageLoader.states.loaded)
                        return;
                    if (this.imageLoadCallback)
                        this.imageLoadCallback(this);
                    if (this.imageLoader.state > this.imageLoader.states.loaded && this.imageHolder) {
                        this.imageHolder.style.backgroundImage = "url(" + this.imageFallbackUrl + ")";
                        WinJS.Utilities.addClass(this.finalImageTag, "hidden")
                    }
                    else
                        WinJS.Utilities.removeClass(this.finalImageTag, "hidden");
                    if (this.imageHolder)
                        MS.Entertainment.Utilities.empty(this.imageHolder);
                    if (this.imageLoadAnimation)
                        if (this._showAnimationCompleted && this.finalImageTag && this.imageHolder && this.imageContainer)
                            this.imageLoadAnimation(this.finalImageTag, this.imageHolder, this.imageContainer);
                        else
                            this._imageLoaded = true;
                    else if (this.imageHolder)
                        this.imageHolder.appendChild(this.finalImageTag);
                    if (this.imageLoader.state === this.imageLoader.states.loaded)
                        MS.Entertainment.UI.Controls.ThumbnailButton.registerWithInteractionTimer(this)
                }
        }, {
            target: "", primaryText: "", secondaryText: "", tertiaryText: "", quaternaryText: "", doclick: null, imagePrimaryUrl: null, imageFallbackUrl: null, isInPackage: false, imageLoadCallback: null, imageLoadAnimation: null, useTextFadeOutAnimation: false, _textHidden: false, showAnimation: WinJS.UI.Animation.fadeIn, showStatusIcon: false, statusIconClass: null, imageContainerWidth: null, imageContainerHeight: null, imageHolderWidth: null, imageHolderHeight: null, imageWidth: "auto", imageHeight: "auto", contentWidth: null
        }, {
            textFadeOutDelay: 30000, _thumbnails: [], _registeredWithInteractionNotifier: false, _timeoutHandle: null, _textHidden: false, registerWithInteractionTimer: function registerWithInteractionTimer(thumbnail) {
                    if (thumbnail.content && thumbnail.useTextFadeOutAnimation) {
                        MS.Entertainment.Animations.Gallery.enableTextContainerFade(thumbnail.content);
                        MS.Entertainment.UI.Controls.ThumbnailButton._registerThumbnailToHide(thumbnail)
                    }
                }, unregisterWithInteractionTimer: function unregisterWithInteractionTimer(thumbnail) {
                    if (thumbnail.content && thumbnail.useTextFadeOutAnimation) {
                        MS.Entertainment.Animations.Gallery.enableTextContainerFade(thumbnail.content);
                        MS.Entertainment.UI.Controls.ThumbnailButton._unregisterThumbnailToHide(thumbnail)
                    }
                }, _registerThumbnailToHide: function _registerThumbnailToHide(thumbnail) {
                    MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails.push(thumbnail);
                    if (!MS.Entertainment.UI.Controls.ThumbnailButton._registeredWithInteractionNotifier) {
                        var interactionNotifier = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.interactionNotifier);
                        interactionNotifier.addInteractionListener(MS.Entertainment.UI.Controls.ThumbnailButton._showThumbnailTextOnInteraction);
                        MS.Entertainment.UI.Controls.ThumbnailButton._registeredWithInteractionNotifier = true;
                        MS.Entertainment.UI.Controls.ThumbnailButton._timeoutHandle = window.setTimeout(MS.Entertainment.UI.Controls.ThumbnailButton._hideThumbnailTextOnTimeout, MS.Entertainment.UI.Controls.ThumbnailButton.textFadeOutDelay)
                    }
                    if (MS.Entertainment.UI.Controls.ThumbnailButton._textHidden)
                        thumbnail.playHideTextContainerAnimation()
                }, _unregisterThumbnailToHide: function _unregisterThumbnailToHide(thumbnail) {
                    var index = MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails.indexOf(thumbnail);
                    if (index > -1)
                        MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails.splice(index, 1);
                    if (!MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails.length) {
                        var interactionNotifier = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.interactionNotifier);
                        interactionNotifier.removeInteractionListener(MS.Entertainment.UI.Controls.ThumbnailButton._showThumbnailTextOnInteraction);
                        window.clearTimeout(MS.Entertainment.UI.Controls.ThumbnailButton._timeoutHandle);
                        MS.Entertainment.UI.Controls.ThumbnailButton._registeredWithInteractionNotifier = false
                    }
                }, _showThumbnailTextOnInteraction: function _showThumbnailTextOnInteraction() {
                    MS.Entertainment.UI.Controls.ThumbnailButton._textHidden = false;
                    var thumbnails = MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails;
                    for (var i = 0; i < thumbnails.length; i++)
                        thumbnails[i].playShowTextContainerAnimation();
                    window.clearTimeout(MS.Entertainment.UI.Controls.ThumbnailButton._timeoutHandle);
                    MS.Entertainment.UI.Controls.ThumbnailButton._timeoutHandle = window.setTimeout(MS.Entertainment.UI.Controls.ThumbnailButton._hideThumbnailTextOnTimeout, MS.Entertainment.UI.Controls.ThumbnailButton.textFadeOutDelay)
                }, _hideThumbnailTextOnTimeout: function _hideThumbnailTextOnTimeout() {
                    MS.Entertainment.UI.Controls.ThumbnailButton._textHidden = true;
                    var thumbnails = MS.Entertainment.UI.Controls.ThumbnailButton._thumbnails;
                    for (var i = 0; i < thumbnails.length; i++)
                        thumbnails[i].playHideTextContainerAnimation()
                }
        })})
})()
