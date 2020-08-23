/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        for (var p in b)
            if (b.hasOwnProperty(p))
                d[p] = b[p];
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
                var BaseNowPlayingVisualization = (function(_super) {
                        __extends(BaseNowPlayingVisualization, _super);
                        function BaseNowPlayingVisualization(element, options) {
                            var _this = this;
                            this._frozen = false;
                            this._isInitialized = false;
                            this._lastImageIndex = -1;
                            this._lastAnimationOffset = -1;
                            this._relatedMediaTitle = String.empty;
                            this._relatedMediaItem = null;
                            this.classFirstImageLoad = "state-firstImageLoad";
                            _super.call(this, element, options);
                            if (!this.templateStorage)
                                MS.Entertainment.UI.Framework.processDeclarativeControlContainer(this).done(function() {
                                    _this._isInitialized = true;
                                    _this._intializeImageBindings()
                                })
                        }
                        BaseNowPlayingVisualization.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            if (this.templateStorage) {
                                this._isInitialized = true;
                                this._intializeImageBindings()
                            }
                            this._updateDataContextHandlers()
                        };
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this._setDataContext(value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "relatedMediaItem", {
                            get: function() {
                                return this._relatedMediaItem
                            }, set: function(value) {
                                    this.updateAndNotify("relatedMediaItem", value)
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "relatedMediaTitle", {
                            get: function() {
                                return this._relatedMediaTitle
                            }, set: function(value) {
                                    this.updateAndNotify("relatedMediaTitle", value || String.empty)
                                }, enumerable: true, configurable: true
                        });
                        BaseNowPlayingVisualization.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._dataContextEventHandlers) {
                                this._dataContextEventHandlers.cancel();
                                this._dataContextEventHandlers = null
                            }
                            if (this._image1LoadEventBinding) {
                                this._image1LoadEventBinding.cancel();
                                this._image1LoadEventBinding = null
                            }
                            if (this._image2LoadEventBinding) {
                                this._image2LoadEventBinding.cancel();
                                this._image2LoadEventBinding = null
                            }
                            this._releaseNowPlaying()
                        };
                        BaseNowPlayingVisualization.prototype.freeze = function() {
                            _super.prototype.freeze.call(this);
                            this._frozen = true;
                            this._freezeAnimations();
                            if (this._dataContext) {
                                this._clearImages();
                                this._hideVideo();
                                this._releaseNowPlaying();
                                WinJS.Promise.timeout().done(this._dataContext.onFreeze.bind(this._dataContext))
                            }
                        };
                        BaseNowPlayingVisualization.prototype.thaw = function() {
                            var _this = this;
                            _super.prototype.thaw.call(this);
                            if (!this._frozen)
                                return;
                            this._frozen = false;
                            this._thawAnimations();
                            if (this._dataContext)
                                WinJS.Promise.timeout().done(function() {
                                    _this._dataContext.onThaw.call(_this._dataContext);
                                    _this._onVisualizationTypeChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(null))
                                })
                        };
                        BaseNowPlayingVisualization.prototype._releaseNowPlaying = function() {
                            if (this._nowPlayingVideoHost && this._nowPlayingVideoHost.children.length) {
                                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                                var nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                                sessionMgr.relocateSession(nowPlayingControl, false)
                            }
                        };
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "_isAnimating", {
                            get: function() {
                                return this._currentImageControl && !!this.animationClass && this._currentImageSubContainer && WinJS.Utilities.hasClass(this._currentImageSubContainer, this.animationClass)
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "_currentImageControl", {
                            get: function() {
                                var imageControl = null;
                                if (this._lastImageIndex === 0)
                                    imageControl = this._nowPlayingImage1;
                                else
                                    imageControl = this._nowPlayingImage2;
                                return imageControl
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "_currentImageSubContainer", {
                            get: function() {
                                var result = null;
                                if (this._currentImageControl === this._nowPlayingImage1)
                                    result = this._nowPlayingImage1SubContainer;
                                else if (this._currentImageControl === this._nowPlayingImage2)
                                    result = this._nowPlayingImage2SubContainer;
                                return result
                            }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(BaseNowPlayingVisualization.prototype, "_canAnimate", {
                            get: function() {
                                return this._getCanAnimate()
                            }, enumerable: true, configurable: true
                        });
                        BaseNowPlayingVisualization.prototype._getCanAnimate = function() {
                            var imageControl = this._currentImageControl;
                            return MS.Entertainment.UI.Framework.animationsEnabled && !!(imageControl && imageControl.target && imageControl.target !== this.fallbackImage && !this._imageSwapAnimations && this.dataContext && this.dataContext.isCurrentMediaItem)
                        };
                        BaseNowPlayingVisualization.prototype._freezeAnimations = function() {
                            this._wasAnimating = this._isAnimating;
                            this._stopAnimations()
                        };
                        BaseNowPlayingVisualization.prototype._thawAnimations = function() {
                            if (this._wasAnimating)
                                this._beginAnimations()
                        };
                        BaseNowPlayingVisualization.prototype._showChildAnimation = function(element) {
                            return MS.Entertainment.Utilities.showElement(element)
                        };
                        BaseNowPlayingVisualization.prototype._hideChildAnimation = function(element) {
                            return MS.Entertainment.Utilities.hideElement(element)
                        };
                        BaseNowPlayingVisualization.prototype._showRelatedItemAnimation = function() {
                            return this._showChildAnimation(this._relatedMediaContainer)
                        };
                        BaseNowPlayingVisualization.prototype._clearDataContextHandlers = function() {
                            if (this._dataContextEventHandlers) {
                                this._dataContextEventHandlers.cancel();
                                this._dataContextEventHandlers = null
                            }
                        };
                        BaseNowPlayingVisualization.prototype._setDataContext = function(value) {
                            if (this._dataContext !== value) {
                                this._clearImages();
                                this.updateAndNotify("dataContext", value);
                                this._updateDataContextHandlers()
                            }
                        };
                        BaseNowPlayingVisualization.prototype._updateDataContextHandlers = function() {
                            var fullScreenImageUri = null;
                            var relatedMedia = null;
                            if (!this._isInitialized)
                                return;
                            this._clearDataContextHandlers();
                            if (!this._unloaded && this.dataContext) {
                                this._dataContextEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.dataContext, {
                                    fullScreenImageUriChanged: this._onImageUriChanged.bind(this), relatedMediaItemChanged: this._onRelatedMediaItemChanged.bind(this), visualizationTypeChanged: this._onVisualizationTypeChanged.bind(this)
                                });
                                fullScreenImageUri = this.dataContext.fullScreenImageUri;
                                relatedMedia = this.dataContext.relatedMediaItem
                            }
                            this._onImageUriChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(fullScreenImageUri));
                            this._onRelatedMediaItemChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(relatedMedia));
                            this._onVisualizationTypeChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(null))
                        };
                        BaseNowPlayingVisualization.prototype._clearImages = function() {
                            if (this._nowPlayingImage1) {
                                WinJS.Utilities.addClass(this._nowPlayingImage1.domElement, "state-emptyImage");
                                this._nowPlayingImage1.target = null
                            }
                            if (this._nowPlayingImage2) {
                                WinJS.Utilities.addClass(this._nowPlayingImage2.domElement, "state-emptyImage");
                                this._nowPlayingImage2.target = null
                            }
                        };
                        BaseNowPlayingVisualization.prototype._hideVideo = function() {
                            if (this._nowPlayingVideoHost)
                                MS.Entertainment.Utilities.hideElement(this._nowPlayingVideoSubContainer, 1000)
                        };
                        BaseNowPlayingVisualization.prototype._showVideo = function() {
                            if (!this._frozen && this._nowPlayingVideoSubContainer && this._nowPlayingVideoHost) {
                                var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                                sessionMgr.relocateSession(this._nowPlayingVideoHost);
                                MS.Entertainment.Utilities.showElement(this._nowPlayingVideoSubContainer)
                            }
                        };
                        BaseNowPlayingVisualization.prototype._onImageUriChanged = function(args) {
                            if (!this._unloaded && (!this.dataContext || this.dataContext.visualizationType === 0))
                                this._swapImages(args.detail && args.detail.newValue)
                        };
                        BaseNowPlayingVisualization.prototype._onRelatedMediaItemChanged = function(args) {
                            if (this._unloaded || !this._relatedMediaContainer)
                                return;
                            if (!args.detail || !args.detail.newValue || !this.dataContext)
                                this._hideChildAnimation(this._relatedMediaContainer);
                            else {
                                this.relatedMediaItem = this.dataContext.relatedMediaItem;
                                this.relatedMediaTitle = this.dataContext.relatedMediaTitle;
                                this._showRelatedItemAnimation()
                            }
                        };
                        BaseNowPlayingVisualization.prototype._onVisualizationTypeChanged = function(args) {
                            if (!this._unloaded && !this._frozen && this.dataContext) {
                                switch (this.dataContext.visualizationType) {
                                    case 1:
                                        this._clearImages();
                                        this._showVideo();
                                        break;
                                    case 0:
                                    default:
                                        this._hideVideo();
                                        break
                                }
                                if (UI.Framework.currentOverlayContainer)
                                    UI.Framework.focusFirstInSubTree(UI.Framework.currentOverlayContainer)
                            }
                        };
                        BaseNowPlayingVisualization.prototype._swapImages = function(imageUri) {
                            var imageControl = null;
                            if (!this._frozen) {
                                if (this.dataContext)
                                    if (this.dataContext.imageChangeCount >= 2) {
                                        Entertainment.Utilities.safeRemoveClass(this._nowPlayingImage1 && this._nowPlayingImage1.domElement, this.classFirstImageLoad);
                                        Entertainment.Utilities.safeRemoveClass(this._nowPlayingImage2 && this._nowPlayingImage2.domElement, this.classFirstImageLoad)
                                    }
                                    else {
                                        Entertainment.Utilities.safeAddClass(this._nowPlayingImage1 && this._nowPlayingImage1.domElement, this.classFirstImageLoad);
                                        Entertainment.Utilities.safeAddClass(this._nowPlayingImage2 && this._nowPlayingImage2.domElement, this.classFirstImageLoad)
                                    }
                                this._lastImageIndex = (this._lastImageIndex + 1) % 2;
                                if (this._lastImageIndex === 0)
                                    imageControl = this._nowPlayingImage1;
                                else
                                    imageControl = this._nowPlayingImage2;
                                if (imageUri) {
                                    imageControl.target = imageUri;
                                    WinJS.Utilities.removeClass(imageControl.domElement, "state-emptyImage")
                                }
                                else {
                                    imageControl.target = this.fallbackImage;
                                    WinJS.Utilities.addClass(imageControl.domElement, "state-emptyImage");
                                    if (!this.fallbackImage)
                                        this._animateImageSwap()
                                }
                            }
                        };
                        BaseNowPlayingVisualization.prototype._beginAnimations = function() {
                            if (!this._canAnimate || this._isAnimating)
                                return;
                            var origin = String.empty;
                            var length = this.animationOffsets ? this.animationOffsets.length : 0;
                            var index = length - 1;
                            if (length > 1)
                                do
                                    index = Math.floor(Math.random() * length);
                                while (index === this._lastAnimationOffset);
                            this._lastAnimationOffset = index;
                            if (index >= 0)
                                origin = this.animationOffsets[index];
                            this._stopAnimations();
                            if (this._currentImageSubContainer) {
                                this._currentImageSubContainer.style.transformOrigin = origin;
                                WinJS.Utilities.addClass(this._currentImageSubContainer, this.animationClass)
                            }
                        };
                        BaseNowPlayingVisualization.prototype._stopAnimations = function() {
                            if (this.animationClass) {
                                MS.Entertainment.Utilities.safeRemoveClass(this._nowPlayingImage1SubContainer, this.animationClass);
                                MS.Entertainment.Utilities.safeRemoveClass(this._nowPlayingImage2SubContainer, this.animationClass)
                            }
                            if (this._nowPlayingImage1SubContainer)
                                this._nowPlayingImage1SubContainer.style.transformOrigin = String.empty;
                            if (this._nowPlayingImage2SubContainer)
                                this._nowPlayingImage2SubContainer.style.transformOrigin = String.empty;
                            if (this._imageSwapAnimations)
                                this._imageSwapAnimations.cancel()
                        };
                        BaseNowPlayingVisualization.prototype._animateImageSwap = function() {
                            var _this = this;
                            var primaryImage = null;
                            var secondaryImage = null;
                            if (this._lastImageIndex === 0) {
                                primaryImage = this._nowPlayingImage1;
                                secondaryImage = this._nowPlayingImage2
                            }
                            else {
                                primaryImage = this._nowPlayingImage2;
                                secondaryImage = this._nowPlayingImage1
                            }
                            if (this._unloaded || this._currentImageControl !== primaryImage)
                                return;
                            WinJS.Promise.timeout(50).done(function() {
                                _this._imageSwapAnimations = WinJS.Promise.join([_this._hideChildAnimation(secondaryImage.domElement), _this._showChildAnimation(primaryImage.domElement)]);
                                _this._imageSwapAnimations.done(function() {
                                    if (_this._currentImageControl === primaryImage) {
                                        _this._imageSwapAnimations = null;
                                        secondaryImage.target = null;
                                        if (_this._canAnimate)
                                            _this._beginAnimations();
                                        else
                                            _this._stopAnimations()
                                    }
                                }, function() {
                                    if (_this._currentImageControl === primaryImage)
                                        _this._imageSwapAnimations = null
                                })
                            })
                        };
                        BaseNowPlayingVisualization.prototype._intializeImageBindings = function() {
                            this._image1LoadEventBinding = this._creatingImageBindings(this._nowPlayingImage1, this._nowPlayingImage2);
                            this._image2LoadEventBinding = this._creatingImageBindings(this._nowPlayingImage2, this._nowPlayingImage1)
                        };
                        BaseNowPlayingVisualization.prototype._creatingImageBindings = function(primaryImage, secondaryImage) {
                            if (!primaryImage || !primaryImage.domElement || !secondaryImage || !secondaryImage.domElement)
                                return null;
                            return MS.Entertainment.UI.Framework.addEventHandlers(primaryImage.domElement, {load: this._animateImageSwap.bind(this)})
                        };
                        BaseNowPlayingVisualization.isDeclarativeControlContainer = false;
                        return BaseNowPlayingVisualization
                    })(MS.Entertainment.UI.Framework.UserControl);
                Controls.BaseNowPlayingVisualization = BaseNowPlayingVisualization
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.BaseNowPlayingVisualization)
