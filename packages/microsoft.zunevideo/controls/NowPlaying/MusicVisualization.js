/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MusicVisualization: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.ImageCollage", "Controls/NowPlaying/MusicVisualization.html", function(element, options) {
            this._colorPalettes = MS.Entertainment.Utilities.isMusicApp1 ? MS.Entertainment.UI.Controls.MusicVisualization.colorPalettes1 : MS.Entertainment.UI.Controls.MusicVisualization.colorPalettes2;
            this.timerTickInterval = 1000;
            this.timerDelayPeriod = 3000;
            this.artShowPeriod = 20000;
            this.artSwapPeriod = 20000;
            this.artVisiblePeriod = 40000;
            this.artVisible = true;
            this.colorChangePeriod = 0;
            this.largeArtFilter = "url(\#ColorFilter)";
            this.largeArtDelay = 2000;
            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            this._mediaItem = {isEmpty: true};
            var hideAppbar = function hideAppbar() {
                    var appbar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                    if (appbar)
                        appbar.hide()
                };
            this._appbarOpportunityEventHandlers = {};
            this._appbarOpportunityEventHandlers[MS.Entertainment.UI.AppBarActions.addToMyMusic] = hideAppbar;
            this._appbarOpportunityEventHandlers[MS.Entertainment.UI.AppBarActions.addToPlaylist] = hideAppbar;
            this._appbarOpportunityEventHandlers[MS.Entertainment.UI.AppBarActions.addToActivePlaylist] = hideAppbar;
            this._appbarOpportunityEventHandlers[MS.Entertainment.UI.AppBarActions.playOnXbox360] = hideAppbar;
            if (MS.Entertainment.Utilities.isMusicApp2)
                this.backdropColor = "rgba(34,34,34,1)"
        }, {
            _mediaItem: null, _playbackSession: null, _sessionMgr: null, _sessionBindings: null, _eventHandlers: null, _appbarOpportunityEventHandlers: null, _artistQueryPromise: null, _disableShapesAndColors: false, _lastArtistId: -1, _lastAlbumId: -1, _lastColorIndex: -1, _isMarketplaceEnabled: false, _shapeVisualizationEngine: null, _pendingColorChange: false, _uiStateService: null, _smartBuyStateEngine: null, _mediaContext: null, _opportunities: null, _currentOpportunityAction: null, _lastOpportunity: null, _lastOpportunityIndex: -1, _lastOpportunityShow: 0, _lastOpportunitySwap: 0, _lastMediaItem: null, _opportunityUpdatePromise: null, _firstColor: true, _transitionTimeoutMS: 2200, _transitionPromise: null, _transitionTimeoutPromise: null, _defaultOpportunityOffset: 20000, _defaultOpportunitySwapPeriod: 40000, _defaultOpportunityShowPeriod: 20000, _defaultOpportunityClickReset: 5000, _pickNewOpportunityAttempts: 10, _bindings: null, opportunityOffset: 20000, opportunityShowPeriod: 20000, opportunitySwapPeriod: 40000, opportunityClickReset: 5000, engageOpportunityOffset: 0, engageOpportunityShowPeriod: 5000, engageOpportunitySwapPeriod: 6000, engageOpportunityClickReset: 0, minArtistImageWidth: 500, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.initialize.apply(this, arguments);
                    this._initialized = true;
                    if (MS.Entertainment.Utilities.isMusicApp2) {
                        this._disableShapesAndColors = true;
                        this.backgroundColor = null;
                        this.engageOpportunitySwapPeriod = -1
                    }
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    this._isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    this._bindings = WinJS.Binding.bind(this, {_uiStateService: {
                            nowPlayingTileVisible: this._updateOpportunities.bind(this), engageVisible: this._updateEngageOpportunities.bind(this), primarySessionId: this._playbackSessionChanged.bind(this)
                        }});
                    MS.Entertainment.UI.Controls.MusicVisualization.instance = this;
                    if (this.mediaItem)
                        this._mediaChanged(this.mediaItem)
                }, mediaItem: {
                    get: function() {
                        return this._mediaItem
                    }, set: function(value) {
                            if (value !== this._mediaItem) {
                                var oldValue = this._mediaItem;
                                this._mediaItem = value;
                                this.notify("mediaItem", value, oldValue);
                                this._mediaChanged(value, oldValue)
                            }
                        }
                }, unload: function unload() {
                    if (this._artistQueryPromise) {
                        this._artistQueryPromise.cancel();
                        this._artistQueryPromise = null
                    }
                    this._releaseSmartBuyEngine();
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    if (this._sessionBindings) {
                        this._sessionBindings.cancel();
                        this._sessionBindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.unload.call(this)
                }, thaw: function thaw() {
                    if (!this._frozen) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                        return
                    }
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.thaw.call(this);
                    if (!this.mediaItem)
                        this.mediaItem = this._playbackSession.currentMedia;
                    else {
                        this._mediaChanged(this.mediaItem);
                        this._updateOpportunities()
                    }
                    if (!this._uiStateService.nowPlayingTileVisible && !this._mediaContext && this._smartBuyStateEngine) {
                        var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                        this._mediaContext = appBarService.pushMediaContext(this.mediaItem, this._appbarOpportunityEventHandlers, this._smartBuyStateEngine.currentAppbarActions, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.opportunity})
                    }
                }, freeze: function freeze() {
                    if (this._frozen) {
                        MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this);
                        return
                    }
                    if (this._artistQueryPromise) {
                        this._artistQueryPromise.cancel();
                        this._artistQueryPromise = null
                    }
                    if (this._mediaContext) {
                        this._mediaContext.clearContext();
                        this._mediaContext = null
                    }
                    this._artIndex = -1;
                    MS.Entertainment.UI.Controls.ImageCollage.prototype.freeze.call(this)
                }, nowPlayingMouseDown: function nowPlayingMouseDown(event) {
                    if (!this._uiStateService.nowPlayingTileVisible)
                        this._reShowOpportunity()
                }, nowPlayingMouseMove: function nowPlayingMouseMove(event) {
                    if (!this._uiStateService.nowPlayingTileVisible)
                        this._reShowOpportunity()
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    if (this._sessionBindings) {
                        this._sessionBindings.cancel();
                        this._sessionBindings = null
                    }
                    if (this._eventHandlers) {
                        this._eventHandlers.cancel();
                        this._eventHandlers = null
                    }
                    if (!this._sessionMgr)
                        this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._playbackSession = this._sessionMgr.primarySession;
                    if (this._playbackSession) {
                        this._eventHandlers = MS.Entertainment.Utilities.addEvents(this._playbackSession, {currentMediaChanged: function updateMediaItem(e) {
                                this.mediaItem = this._playbackSession.currentMedia
                            }.bind(this)});
                        this.mediaItem = this._playbackSession.currentMedia
                    }
                }, _reShowOpportunity: function _reShowOpportunity() {
                    if (this._lastOpportunity) {
                        if (this._opportunityUpdatePromise) {
                            this._opportunityUpdatePromise.cancel();
                            this._opportunityUpdatePromise = null
                        }
                        this.currentOpportunity = this._lastOpportunity;
                        this._lastOpportunity = null;
                        this._lastOpportunityShow = this.opportunityShowPeriod - this.opportunityClickReset;
                        this._lastOpportunitySwap = this._lastOpportunityShow
                    }
                }, _mediaChanged: function _mediaChanged(newValue, oldValue) {
                    if (!this._initialized || this._unloaded)
                        return;
                    if (!this._uiStateService.isAppVisible || this._frozen) {
                        this._clearCurrentLargeArt();
                        this._mediaItem = null;
                        return
                    }
                    if (this._opportunityUpdatePromise) {
                        this._opportunityUpdatePromise.cancel();
                        this._opportunityUpdatePromise = null
                    }
                    this._opportunities = null;
                    this._lastOpportunity = null;
                    this.currentOpportunity = null;
                    if (!this._shapeVisualizationEngine)
                        this._createVisualizationEngine();
                    this._lastMediaItem = this.mediaItem;
                    this._pendingColorChange = true;
                    if (!this.mediaItem) {
                        if (this._largeArt)
                            this._largeArt.clearArt();
                        this.largeArtUrls = null;
                        if (!this._timerEnabled) {
                            this._timerEnabled = true;
                            this._startRenderLoop()
                        }
                        this.transitionOverlay.style.opacity = 0
                    }
                    else {
                        this._hideShapeLayer();
                        if (this._largeArt)
                            this._largeArt.clearArt();
                        this._transitionVisualization(function _delay() {
                            this._notifyMediaChanged(this.mediaItem, oldValue);
                            if (!this._updateMediaItemArt()) {
                                var artChanged = this._randomizeArt();
                                this._randomizeLayerColors(artChanged)
                            }
                            else
                                this._notifyColorChanged(MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette);
                            this._lastArtSwap = 0;
                            this._showShapeLayer()
                        }.bind(this))
                    }
                    this._updateOpportunities()
                }, _hideShapeLayer: function _hideShapeLayer() {
                    if (this._initialized && !this._frozen && this._shapeVisualizationEngine && this.shapeVisualizationContainer) {
                        var completePromise = MS.Entertainment.Utilities.waitForStartedTransitionsToComplete(this.shapeVisualizationContainer, true);
                        this.shapeVisualizationContainer.style.opacity = 0;
                        return completePromise
                    }
                }, _showShapeLayer: function _showShapeLayer() {
                    if (this._initialized && !this._frozen && this._shapeVisualizationEngine && this.shapeVisualizationContainer && !MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine)
                        this.shapeVisualizationContainer.style.opacity = 1
                }, _notifyMediaChanged: function _notifyMediaChanged(newValue, oldValue) {
                    if (this._shapeVisualizationEngine && !MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine)
                        this._shapeVisualizationEngine.notifyMediaChanged(newValue, oldValue)
                }, _notifyColorChanged: function _notifyColorChanged(newValue) {
                    if (this._shapeVisualizationEngine)
                        this._shapeVisualizationEngine.notifyColorChanged(newValue)
                }, _transitionVisualization: function _transitionVisualization(callback) {
                    if (this._disableShapesAndColors) {
                        if (callback)
                            callback();
                        return
                    }
                    if (this._transitionTimeoutPromise) {
                        this._transitionTimeoutPromise.cancel();
                        this._transitionTimeoutPromise = null
                    }
                    if (this._transitionPromise) {
                        this._transitionPromise.cancel();
                        this._transitionPromise = null
                    }
                    var completeCallback = function completeTransition() {
                            if (this._transitionPromise) {
                                this._transitionPromise.cancel();
                                this._transitionPromise = null
                            }
                            if (this._transitionTimeoutPromise) {
                                this._transitionTimeoutPromise.cancel();
                                this._transitionTimeoutPromise = null
                            }
                            if (callback)
                                callback();
                            WinJS.Promise.timeout(this.largeArtDelay).done(function transitionBack() {
                                if (this.transitionOverlay)
                                    this.transitionOverlay.style.opacity = 0;
                                if (this.backdrop)
                                    this.backdrop.style.opacity = 1
                            }.bind(this))
                        }.bind(this);
                    if (MS.Entertainment.Utilities.isMusicApp2)
                        completeCallback();
                    else {
                        this._transitionTimeoutPromise = WinJS.Promise.timeout(this._transitionTimeoutMS).then(completeCallback);
                        this._transitionPromise = MS.Entertainment.Utilities.waitForStartedTransitionsToComplete(this.transitionOverlay, true).then(completeCallback);
                        this.transitionOverlay.style.opacity = 1;
                        this.backdrop.style.opacity = 0
                    }
                }, _clearCurrentLargeArt: function _clearMediaItemArt() {
                    if (!this.mediaItem || this._lastArtistId === this.mediaItem.artistServiceId && this._lastAlbumId === this.mediaItem.albumServiceId)
                        return;
                    MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt = null
                }, _updateMediaItemArt: function _updateMediaItemArt() {
                    if (this._frozen || !this.mediaItem)
                        return false;
                    if (this.largeArtUrls && this._lastArtistId && this._lastArtistId === this.mediaItem.artistServiceId && this._lastAlbumId === this.mediaItem.albumServiceId)
                        return false;
                    this._lastArtistId = null;
                    this._lastAlbumId = null;
                    MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt = null;
                    this.largeArtUrls = null;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                    if (isMusicMarketplaceEnabled && this.mediaItem.artist && this.mediaItem.artist.hasServiceId) {
                        var artistArtQuery = new MS.Entertainment.Data.Query.Music.ArtistImages;
                        artistArtQuery.id = this.mediaItem.artist.serviceId;
                        artistArtQuery.idType = this.mediaItem.artist.serviceIdType;
                        artistArtQuery.impressionGuid = this.mediaItem.artist.impressionGuid;
                        artistArtQuery.minWidth = this.minArtistImageWidth;
                        this._artistQueryPromise = artistArtQuery.execute().then(function success(q) {
                            if (this._frozen) {
                                this.largeArtUrls = null;
                                return
                            }
                            var artistArtUrls = [];
                            if (q.result.items) {
                                for (var i = 0; i < q.result.items.length; i++)
                                    if (q.result.items[i].width >= this.minArtistImageWidth && q.result.items[i].width >= q.result.items[i].height)
                                        artistArtUrls.push({uri: MS.Entertainment.Utilities.UriFactory.appendQuery(q.result.items[i].url, {format: MS.Entertainment.ImageFormat.png})});
                                if (artistArtUrls.length < 3)
                                    if (this.mediaItem.images)
                                        this.mediaItem.images.forEach(function addLargeImages(image) {
                                            if (image.width >= this.minArtistImageWidth)
                                                artistArtUrls.push({uri: image.url})
                                        }.bind(this));
                                    else
                                        artistArtUrls.push({uri: this.mediaItem.imageUri});
                                this._setLargeArtUrls(artistArtUrls);
                                this._lastArtistId = this.mediaItem ? this.mediaItem.artistServiceId : null;
                                this._lastAlbumId = this.mediaItem ? this.mediaItem.albumServiceId : null
                            }
                            else
                                this._setLargeArtUrls([{uri: this.mediaItem.imageUri}])
                        }.bind(this), function failed(q) {
                            this._setLargeArtUrls([{uri: this.mediaItem.imageUri}])
                        }.bind(this))
                    }
                    else
                        this._setLargeArtUrls([{uri: this.mediaItem.imageUri}]);
                    return true
                }, _createVisualizationEngine: function _createVisualizationEngine() {
                    if (!this._initialized || this._disableShapesAndColors)
                        return;
                    if (MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine)
                        return;
                    var controlElement = document.createElement("div");
                    controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.ShapeVisualizationEngine");
                    WinJS.Utilities.addClass(controlElement, "shapeVisualizationEngine");
                    this.shapeVisualizationContainer.appendChild(controlElement);
                    if (!MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette)
                        this._randomizeLayerColors();
                    this._shapeVisualizationEngine = new MS.Entertainment.UI.Controls.ShapeVisualizationEngine(controlElement, {currentColorPalette: MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette})
                }, _randomizeLayerColors: function _randomizeLayerColors(forceTransition) {
                    if (this._disableShapesAndColors) {
                        MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette = this._colorPalettes[0];
                        return
                    }
                    var index = Math.floor(Math.random() * this._colorPalettes.length);
                    while (index === this._lastColorIndex)
                        index = Math.floor(Math.random() * this._colorPalettes.length);
                    this._lastColorIndex = index;
                    var colorPalette = this._colorPalettes[index];
                    var primaryColor = colorPalette[2];
                    this._setColor(primaryColor, forceTransition);
                    this._notifyColorChanged(colorPalette);
                    MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette = colorPalette
                }, _setColor: function _setColor(color, forceTransition) {
                    var hexColor = this._hexColorToRgb(color);
                    MS.Entertainment.UI.Controls.MusicVisualization.currentPrimaryColor = hexColor;
                    if (this._disableShapesAndColors)
                        this.backdropColor = "rgba(0, 0, 0, 1)";
                    else
                        this.backdropColor = "rgba(" + hexColor.r + "," + hexColor.g + "," + hexColor.b + ", .3)";
                    var colorAlpha = MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt === String.empty ? 1.0 : MS.Entertainment.UI.Controls.MusicVisualization.defaultColorWashOpacity;
                    if (this._largeArt) {
                        this._largeArt.setOverlay(color, colorAlpha, forceTransition);
                        this._firstColor = false
                    }
                }, _hexColorToRgb: function _hexColorToRgb(hexColor) {
                    var hexString = hexColor.charAt(0) === "#" ? hexColor.substring(1, 7) : hexColor;
                    return {
                            r: parseInt(hexString.substring(0, 2), 16), g: parseInt(hexString.substring(2, 4), 16), b: parseInt(hexString.substring(4, 6), 16), a: 1
                        }
                }, _timerTick: function _timerTick() {
                    var artChanged;
                    if (!MS.Entertainment.Utilities.checkIfInDom(this.domElement))
                        this._unloaded = true;
                    if (this._timerEnabled && !this._unloaded)
                        if (this._uiStateService.isAppVisible && !this._frozen) {
                            if (this._lastArtSwap >= this.artSwapPeriod) {
                                this._lastArtSwap = 0;
                                if (this.largeArtUrls && this.largeArtUrls.length > 1) {
                                    if (this._largeArt)
                                        this._largeArt.clearArt();
                                    this._transitionVisualization(function updateArtAndColor() {
                                        artChanged = this._randomizeArt();
                                        this._randomizeLayerColors(!artChanged)
                                    }.bind(this))
                                }
                                else
                                    this._randomizeLayerColors(!artChanged)
                            }
                            if (this._opportunities && this._lastOpportunitySwap >= this.opportunitySwapPeriod)
                                this._randomizeOpportunity();
                            if (this.currentOpportunity && this._lastOpportunityShow >= this.opportunityShowPeriod && this.opportunityShowPeriod !== -1)
                                this._hideOpportunity()
                        }
                }, _updateTimerValues: function _updateTimerValues() {
                    MS.Entertainment.UI.Controls.ImageCollage.prototype._updateTimerValues.call(this);
                    if (this._opportunities) {
                        this._lastOpportunityShow += this.timerTickInterval;
                        this._lastOpportunitySwap += this.timerTickInterval
                    }
                }, _setLargeArtUrls: function _setLargeArtUrls(urls) {
                    this._setArtVisible(true);
                    this.largeArtUrls = urls
                }, _setLargeArt: function _setLargeArt(art) {
                    if (art !== null && art !== undefined)
                        if (art.cachedImage) {
                            if (this._largeArt)
                                this._largeArt.setArt(art.cachedImage);
                            MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt = art.cachedImage;
                            if (this._pendingColorChange && MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette) {
                                this._pendingColorChange = false;
                                this._setColor(MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette[2])
                            }
                        }
                        else
                            this._cacheImage(art).done(function setUrl(url) {
                                if (this._largeArt)
                                    this._largeArt.setArt(url);
                                MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt = url;
                                if (this._pendingColorChange && MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette) {
                                    this._pendingColorChange = false;
                                    this._setColor(MS.Entertainment.UI.Controls.MusicVisualization.currentColorPalette[2])
                                }
                            }.bind(this));
                    if (!this._timerEnabled) {
                        this._timerEnabled = true;
                        this._startRenderLoop()
                    }
                    this._lastArtSwap = 0
                }, _cacheImage: function _cacheImage(art) {
                    if (art.uri)
                        return MS.Entertainment.UI.Shell.ImageLoader.cacheImage(art.uri, String.empty).then(function cacheImage(url) {
                                art.cachedImage = url;
                                return WinJS.Promise.wrap(url)
                            }, function useDefaultImage(url) {
                                art.cachedImage = String.empty;
                                return WinJS.Promise.wrap(String.empty)
                            });
                    else
                        return WinJS.Promise.wrap(art)
                }, _randomizeOpportunity: function _randomizeOpportunity() {
                    if (!this._opportunities === null || !this._opportunities.length)
                        return;
                    this._hideOpportunity();
                    if (this.currentOpportunity)
                        this._lastOpportunity = this.currentOpportunity;
                    var index = Math.floor(Math.random() * this._opportunities.length);
                    var attemptNumber = 1;
                    while (this._opportunities.length > 1 && (index === this._lastOpportunityIndex || !this._opportunities[index] || !this._opportunities[index].isEnabled) && attemptNumber < this._pickNewOpportunityAttempts) {
                        var index = Math.floor(Math.random() * this._opportunities.length);
                        attemptNumber++
                    }
                    var previousIconClassName = String.empty;
                    if (this._opportunities[this._lastOpportunityIndex] && this._opportunities[this._lastOpportunityIndex].iconInfo.className)
                        previousIconClassName = this._opportunities[this._lastOpportunityIndex].iconInfo.className;
                    this._lastOpportunityIndex = index;
                    if (this._opportunities[index] && this._opportunities[index].isEnabled) {
                        this._currentOpportunityAction = this._opportunities[index];
                        this.currentOpportunity = {
                            title: this._currentOpportunityAction ? this._currentOpportunityAction.title : String.empty, subTitle: (this._currentOpportunityAction && this._currentOpportunityAction.parameter && this._currentOpportunityAction.parameter.subTitle) ? this._currentOpportunityAction.parameter.subTitle : (this._currentOpportunityAction && this.mediaItem) ? this.mediaItem.name : String.empty, icon: this._currentOpportunityAction ? this._currentOpportunityAction.iconInfo.icon : String.empty, iconPressed: this._currentOpportunityAction ? this._currentOpportunityAction.iconInfo.iconPressed : String.empty, iconClassName: this._currentOpportunityAction ? this._currentOpportunityAction.iconInfo.className : String.empty, previousIconClassName: previousIconClassName, hideDefaultRing: this._currentOpportunityAction ? this._currentOpportunityAction.iconInfo.hideDefaultRing : false, action: this._currentOpportunityAction || {}
                        }
                    }
                    this._lastOpportunitySwap = 0;
                    this._lastOpportunityShow = 0
                }, _hideOpportunity: function _hideOpportunity() {
                    if (!this.currentOpportunity)
                        return;
                    this._lastOpportunity = this.currentOpportunity;
                    this.currentOpportunity = null;
                    this._opportunityUpdatePromise = WinJS.Promise.timeout(this.opportunityClickReset).then(function clearLastOpportunity() {
                        this._lastOpportunity = null;
                        this._opportunityUpdatePromise = null
                    }.bind(this))
                }, _updateEngageOpportunities: function _updateEngageOpportunities(newVal, oldVal) {
                    if (newVal)
                        this._mediaChanged()
                }, _releaseSmartBuyEngine: function _releaseSmartBuyEngine() {
                    if (this._smartBuyStateEngineBindings) {
                        this._smartBuyStateEngineBindings.cancel();
                        this._smartBuyStateEngineBindings = null
                    }
                    if (this._smartBuyStateEngine) {
                        this._smartBuyStateEngine.unload();
                        this._smartBuyStateEngine = null
                    }
                }, _updateOpportunities: function _updateOpportunities() {
                    if (this._frozen || (!this.mediaItem && (!this._uiStateService.engageVisible && !MS.Entertainment.Utilities.isMusicApp2)))
                        return;
                    this._hideOpportunity();
                    this._lastOpportunitySwap = this.opportunitySwapPeriod / 2;
                    this._lastOpportunityShow = 0;
                    this._lastOpportunityIndex = 0;
                    if (!MS.Entertainment.Utilities.isMusicApp)
                        return;
                    this._hideOpportunity();
                    this._opportunities = null;
                    this._currentOpportunityAction = null;
                    this.currentOpportunity = null;
                    this._lastOpportunity = null;
                    if (this._opportunityUpdatePromise) {
                        this._opportunityUpdatePromise.cancel();
                        this._opportunityUpdatePromise = null
                    }
                    this._releaseSmartBuyEngine();
                    if (!this._uiStateService.nowPlayingTileVisible || !this.mediaItem || this.mediaItem.isEmpty) {
                        this._smartBuyStateEngine = new MS.Entertainment.ViewModels.SmartBuyStateEngine;
                        this._smartBuyStateEngine.initialize(this.mediaItem || {}, MS.Entertainment.ViewModels.SmartBuyButtons.getTrackOpportunityButtons(this.mediaItem, MS.Entertainment.UI.Actions.ExecutionLocation.opportunity), MS.Entertainment.ViewModels.MusicStateHandlers.onMusicOpportunitiesChanged, {
                            updateOnAppSnappedModeChange: true, executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.opportunity
                        });
                        if (this.mediaItem)
                            if (!this._mediaContext) {
                                var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                                this._mediaContext = appBarService.pushMediaContext(this.mediaItem, this._appbarOpportunityEventHandlers, null, {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.opportunity})
                            }
                            else
                                this._mediaContext.updateMediaItem(this.mediaItem);
                        this._smartBuyStateEngineBindings = WinJS.Binding.bind(this._smartBuyStateEngine, {
                            currentButtons: this._opportunitiesChanged.bind(this), currentAppbarActions: this._appBarOpportunitiesChanged.bind(this)
                        })
                    }
                    if (this._uiStateService.nowPlayingTileVisible && !this.mediaItem) {
                        this.opportunityOffset = this.engageOpportunityOffset;
                        this.opportunitySwapPeriod = this.engageOpportunitySwapPeriod;
                        this.opportunityShowPeriod = this.engageOpportunityShowPeriod;
                        this.opportunityClickReset = this.engageOpportunityClickReset
                    }
                    else {
                        this.opportunityOffset = this._defaultOpportunityOffset;
                        this.opportunitySwapPeriod = this._defaultOpportunitySwapPeriod;
                        this.opportunityShowPeriod = this._defaultOpportunityShowPeriod;
                        this.opportunityClickReset = this._defaultOpportunityClickReset
                    }
                }, _opportunitiesChanged: function _opportunitiesChanged(newValue, oldValue) {
                    this.currentOpportunity = null;
                    this._lastOpportunity = null;
                    this._opportunities = newValue
                }, _appBarOpportunitiesChanged: function _appBarOpportunitiesChanged(newValue, oldValue) {
                    if (this._mediaContext)
                        this._mediaContext.setToolbarActions(newValue)
                }
        }, {
            opportunityVisible: false, currentOpportunity: null
        }, {
            colorPalettes1: [["#CFB9FA", "#7777D9", "#CFB9FA"], ["#B9CFFA", "#77B8D9", "#B9CFFA"], ["#B9FAFA", "#77D9B8", "#B9FAFA"], ["#B9FACF", "#77D977", "#B9FACF"], ["#CFFAB9", "#B8D977", "#CFFAB9"], ["#C7A35C", "#D9B877", "#C7A35C"], ["#FACFB9", "#D97777", "#FACFB9"], ["#FAB9CF", "#D977B8", "#FAB9CF"], ["#FAB9FA", "#B877D9", "#FAB9FA"]], colorPalettes2: [["#FFFFFF", "#FFFFFF", "6230fc"], ["#FFFFFF", "#FFFFFF", "1981ea"], ["#FFFFFF", "#FFFFFF", "14e2c0"], ["#FFFFFF", "#FFFFFF", "07ef5a"], ["#90ea28", "#90ea28", "90ea28"], ["#f4cb1c", "#f4cb1c", "f4cb1c"], ["#FFFFFF", "#FFFFFF", "ed411e"], ["#FFFFFF", "#FFFFFF", "e82788"], ["#FFFFFF", "#FFFFFF", "b220cf"]], defaultColorWashOpacity: .3, currentColorPalette: null, currentPrimaryColor: null, currentLargeArt: String.empty, currentShape: null, instance: null, disableShapeEngine: false, musicVisualizationsEnabled: true, freezeOnVisualizationsEnabled: false, freezeShapes: function freezeShapes() {
                    if (!MS.Entertainment.UI.Controls.MusicVisualization.musicVisualizationsEnabled) {
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeOnVisualizationsEnabled = true;
                        return
                    }
                    MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine = true;
                    if (!MS.Entertainment.UI.Controls.MusicVisualization.instance)
                        return;
                    var freezeShapes = function disableShapeEngine() {
                            if (!MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine)
                                return;
                            if (MS.Entertainment.UI.Controls.MusicVisualization.instance && MS.Entertainment.UI.Controls.MusicVisualization.instance._shapeVisualizationEngine)
                                MS.Entertainment.UI.Controls.MusicVisualization.instance._shapeVisualizationEngine.freeze()
                        };
                    if (MS.Entertainment.UI.Controls.MusicVisualization.instance)
                        WinJS.Promise.timeout(2000, MS.Entertainment.UI.Controls.MusicVisualization.instance._hideShapeLayer()).done(freezeShapes, freezeShapes)
                }, thawShapes: function thawShapes() {
                    if (!MS.Entertainment.UI.Controls.MusicVisualization.musicVisualizationsEnabled) {
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeOnVisualizationsEnabled = false;
                        return
                    }
                    MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine = false;
                    if (MS.Entertainment.UI.Controls.MusicVisualization.instance) {
                        MS.Entertainment.UI.Controls.MusicVisualization.instance._showShapeLayer();
                        if (MS.Entertainment.UI.Controls.MusicVisualization.instance && MS.Entertainment.UI.Controls.MusicVisualization.instance._shapeVisualizationEngine)
                            MS.Entertainment.UI.Controls.MusicVisualization.instance._shapeVisualizationEngine.thaw()
                    }
                }, disableMusicVisualizations: function disableMusicVisualizations() {
                    if (MS.Entertainment.UI.Controls.MusicVisualization.disableShapeEngine)
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeOnVisualizationsEnabled = true;
                    else
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeShapes();
                    MS.Entertainment.UI.Controls.MusicVisualization.musicVisualizationsEnabled = false
                }, enableMusicVisualizations: function enableMusicVisualizations() {
                    MS.Entertainment.UI.Controls.MusicVisualization.musicVisualizationsEnabled = true;
                    if (!MS.Entertainment.UI.Controls.MusicVisualization.freezeOnVisualizationsEnabled)
                        MS.Entertainment.UI.Controls.MusicVisualization.thawShapes();
                    else
                        MS.Entertainment.UI.Controls.MusicVisualization.freezeOnVisualizationsEnabled = false
                }, disableLargeArtScaling: function disableLargeArtScaling() {
                    if (MS.Entertainment.UI.Controls.MusicVisualization.instance && MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt) {
                        MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt.disableScaling = true;
                        WinJS.Utilities.removeClass(MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt.domElement, "imageCollageLargeArt")
                    }
                }, enableLargeArtScaling: function enableLargeArtScaling() {
                    if (MS.Entertainment.UI.Controls.MusicVisualization.instance && MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt) {
                        MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt.disableScaling = false;
                        WinJS.Utilities.addClass(MS.Entertainment.UI.Controls.MusicVisualization.instance._largeArt.domElement, "imageCollageLargeArt")
                    }
                }
        })})
})()
