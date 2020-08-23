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
                var NowPlayingGallery = (function(_super) {
                        __extends(NowPlayingGallery, _super);
                        function NowPlayingGallery() {
                            _super.apply(this, arguments)
                        }
                        Object.defineProperty(NowPlayingGallery.prototype, "snappedItemTemplate", {
                            get: function() {
                                return this.templateSelector.getTemplate(MS.Entertainment.UI.Controls.TemplateType.snappedItem)
                            }, set: function(value) {
                                    this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateType.snappedItem, value);
                                    this._updateItemTemplate()
                                }, enumerable: true, configurable: true
                        });
                        Object.defineProperty(NowPlayingGallery.prototype, "unsnappedItemTemplate", {
                            get: function() {
                                return this.templateSelector.getTemplate(MS.Entertainment.UI.Controls.TemplateType.unsnappedItem)
                            }, set: function(value) {
                                    this.templateSelector.addTemplate(MS.Entertainment.UI.Controls.TemplateType.unsnappedItem, value);
                                    this._updateItemTemplate()
                                }, enumerable: true, configurable: true
                        });
                        NowPlayingGallery.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {isSnappedChanged: this._updateItemTemplate.bind(this)});
                            this._updateItemTemplate()
                        };
                        NowPlayingGallery.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            if (this._uiStateEventHandlers) {
                                this._uiStateEventHandlers.cancel();
                                this._uiStateEventHandlers = null
                            }
                        };
                        NowPlayingGallery.prototype._updateItemTemplate = function() {
                            if (this._unloaded)
                                return;
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            var itemTemplate = null;
                            if (!uiStateService.isSnapped)
                                itemTemplate = this.unsnappedItemTemplate;
                            else
                                itemTemplate = this.snappedItemTemplate;
                            if (itemTemplate !== this.itemTemplate) {
                                this.itemTemplate = itemTemplate;
                                if (this.domElement && this.domElement.firstElementChild)
                                    this._updateLayoutAsync()
                            }
                        };
                        return NowPlayingGallery
                    })(MS.Entertainment.UI.Controls.ListViewModelGalleryControl);
                Controls.NowPlayingGallery = NowPlayingGallery;
                var ActionableNowPlayingVisualization = (function(_super) {
                        __extends(ActionableNowPlayingVisualization, _super);
                        function ActionableNowPlayingVisualization() {
                            _super.apply(this, arguments)
                        }
                        ActionableNowPlayingVisualization.prototype.initialize = function() {
                            _super.prototype.initialize.call(this);
                            this.animationOffsets = ["10% 10%", "50% 10%", "90% 10%", "10% 90%", "50% 90%", "90% 90%"];
                            this.animationClass = "anim-nowPlaying-panning";
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {isSnappedChanged: this._updateTabIndex.bind(this)})
                        };
                        Object.defineProperty(ActionableNowPlayingVisualization.prototype, "dataContext", {
                            get: function() {
                                return this._dataContext
                            }, set: function(value) {
                                    this._setDataContext(value)
                                }, enumerable: true, configurable: true
                        });
                        ActionableNowPlayingVisualization.prototype.unload = function() {
                            _super.prototype.unload.call(this);
                            this._releaseFullScreenOverlay();
                            if (this._uiStateEventHandlers) {
                                this._uiStateEventHandlers.cancel();
                                this._uiStateEventHandlers = null
                            }
                        };
                        ActionableNowPlayingVisualization.prototype._releaseFullScreenOverlay = function() {
                            this._fullScreenOverlay = null;
                            if (this._fullScreenOverlayHandlers) {
                                this._fullScreenOverlayHandlers.cancel();
                                this._fullScreenOverlayHandlers = null
                            }
                        };
                        ActionableNowPlayingVisualization.prototype._getCanAnimate = function() {
                            var canAnimate = _super.prototype._getCanAnimate.call(this);
                            return canAnimate && !this._fullScreenOverlay
                        };
                        ActionableNowPlayingVisualization.prototype._clickSaveNowPlaying = function(event) {
                            if (this.dataContext)
                                this.dataContext.savePlaylist(event)
                        };
                        ActionableNowPlayingVisualization.prototype._clickEnterFullScreen = function() {
                            var _this = this;
                            if (this.dataContext && !this._fullScreenOverlay) {
                                this._fullScreenOverlay = this.dataContext.showFullScreenNowPlaying();
                                if (this._fullScreenOverlay)
                                    this._fullScreenOverlayHandlers = MS.Entertainment.Utilities.addEventHandlers(this._fullScreenOverlay, {
                                        overlayVisible: function() {
                                            _this._freezeAnimations()
                                        }, close: function() {
                                                _this._releaseFullScreenOverlay();
                                                _this._thawAnimations()
                                            }
                                    })
                            }
                        };
                        ActionableNowPlayingVisualization.prototype._metadataKeyDown = function(event) {
                            switch (event.keyCode) {
                                case WinJS.Utilities.Key.enter:
                                case WinJS.Utilities.Key.space:
                                    this._metadataClick();
                                    break;
                                default:
                                    break
                            }
                        };
                        ActionableNowPlayingVisualization.prototype._metadataClick = function() {
                            if (this.dataContext) {
                                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                if (!uiStateService.isSnapped)
                                    this.dataContext.navigateToArtist()
                            }
                        };
                        ActionableNowPlayingVisualization.prototype._updateTabIndex = function() {
                            if (this._unloaded || !this._artistMetadata)
                                return;
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            if (!uiStateService.isSnapped)
                                this._artistMetadata.setAttribute("tabindex", "0");
                            else
                                this._artistMetadata.setAttribute("tabindex", "-1")
                        };
                        ActionableNowPlayingVisualization.isDeclarativeControlContainer = true;
                        return ActionableNowPlayingVisualization
                    })(Controls.BaseNowPlayingVisualization);
                Controls.ActionableNowPlayingVisualization = ActionableNowPlayingVisualization
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Utilities.markSupportedForProcessing(MS.Entertainment.UI.Controls.ActionableNowPlayingVisualization)
