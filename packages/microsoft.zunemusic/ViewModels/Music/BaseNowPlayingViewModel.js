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
        var ViewModels;
        (function(ViewModels) {
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
            (function(NowPlayingMediaChangeDirection) {
                NowPlayingMediaChangeDirection[NowPlayingMediaChangeDirection["unknown"] = 0] = "unknown";
                NowPlayingMediaChangeDirection[NowPlayingMediaChangeDirection["forward"] = 1] = "forward";
                NowPlayingMediaChangeDirection[NowPlayingMediaChangeDirection["backward"] = 2] = "backward"
            })(ViewModels.NowPlayingMediaChangeDirection || (ViewModels.NowPlayingMediaChangeDirection = {}));
            var NowPlayingMediaChangeDirection = ViewModels.NowPlayingMediaChangeDirection;
            (function(NowPlayingVisualizationType) {
                NowPlayingVisualizationType[NowPlayingVisualizationType["images"] = 0] = "images";
                NowPlayingVisualizationType[NowPlayingVisualizationType["video"] = 1] = "video"
            })(ViewModels.NowPlayingVisualizationType || (ViewModels.NowPlayingVisualizationType = {}));
            var NowPlayingVisualizationType = ViewModels.NowPlayingVisualizationType;
            var BaseChildNowPlayingVisualizationViewModel = (function(_super) {
                    __extends(BaseChildNowPlayingVisualizationViewModel, _super);
                    function BaseChildNowPlayingVisualizationViewModel(mediaItem, ordinal) {
                        _super.call(this);
                        this.artSwapTimoutMS = 20000;
                        this.minArtistImageWidth = 500;
                        this._visualizationType = 0;
                        this._relatedMediaTitle = String.empty;
                        this._isCurrentMediaItem = false;
                        this._mediaItem = mediaItem;
                        this._ordinal = ordinal;
                        this._currentArtIndex = -1;
                        this._imageChangeCount = 0;
                        this._setFullScreenImage()
                    }
                    BaseChildNowPlayingVisualizationViewModel.prototype.dispose = function() {
                        this._disposed = true;
                        this._isCurrentMediaItem = false;
                        if (this._artLoadingPromise) {
                            this._artLoadingPromise.cancel();
                            this._artLoadingPromise = null
                        }
                        if (this._fullScreenImageUriPromise) {
                            this._fullScreenImageUriPromise.cancel();
                            this._fullScreenImageUriPromise = null
                        }
                        this._cancelPendingImageSwap()
                    };
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "imageSize", {
                        get: function() {
                            if (!this._imageSize) {
                                var windowSize = MS.Entertainment.Utilities.getLandscapeScreenSize();
                                this._imageSize = MS.Entertainment.UI.Shell.ImageLoader.calculateScaledSize(windowSize.width, windowSize.height)
                            }
                            return this._imageSize
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "fullScreenImageUri", {
                        get: function() {
                            return this._fullScreenImageUri
                        }, set: function(value) {
                                if (value !== this.fullScreenImageUri) {
                                    this._imageChangeCount++;
                                    this.updateAndNotify("fullScreenImageUri", value)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "mediaItem", {
                        get: function() {
                            return this._mediaItem
                        }, set: function(value) {
                                var oldMediaItem = this._mediaItem;
                                this.updateAndNotify("mediaItem", value);
                                if (oldMediaItem && !oldMediaItem.isEqual(value))
                                    this._randomizeArt()
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "ordinal", {
                        get: function() {
                            return this._ordinal
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "isCurrentMediaItem", {
                        get: function() {
                            return this._isCurrentMediaItem
                        }, set: function(value) {
                                if (value !== this.isCurrentMediaItem) {
                                    this.updateAndNotify("isCurrentMediaItem", value);
                                    this._queueRandomizeArt()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "isAudioAd", {
                        get: function() {
                            return this.mediaItem && this.mediaItem.isAudioAd
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "playbackPositionText", {
                        get: function() {
                            return this._playbackPositionText
                        }, set: function(value) {
                                this.updateAndNotify("playbackPositionText", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "visualizationType", {
                        get: function() {
                            return this._visualizationType
                        }, set: function(value) {
                                if (value !== this._visualizationType) {
                                    this.updateAndNotify("visualizationType", value);
                                    if (value === 1)
                                        this._cancelPendingImageSwap();
                                    else
                                        this._randomizeArt()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "relatedMediaItem", {
                        get: function() {
                            return this._relatedMediaItem
                        }, set: function(value) {
                                this.updateAndNotify("relatedMediaItem", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "relatedMediaTitle", {
                        get: function() {
                            return this._relatedMediaTitle
                        }, set: function(value) {
                                this.updateAndNotify("relatedMediaTitle", value)
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseChildNowPlayingVisualizationViewModel.prototype, "imageChangeCount", {
                        get: function() {
                            return this._imageChangeCount
                        }, enumerable: true, configurable: true
                    });
                    BaseChildNowPlayingVisualizationViewModel.prototype.onFreeze = function() {
                        if (!this._frozen) {
                            this._frozen = true;
                            this._cancelPendingImageSwap();
                            this.fullScreenImageUri = null
                        }
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype.onThaw = function() {
                        if (this._frozen) {
                            this._frozen = false;
                            this._randomizeArt()
                        }
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype.isEqual = function(value) {
                        var result = false;
                        if (value === this)
                            result = true;
                        else if (value && value.mediaItem && ("isEqual" in value.mediaItem)) {
                            var sameMediaItem = value.mediaItem === this.mediaItem || value.mediaItem.isEqual(this.mediaItem);
                            var sameOrdinal = value.ordinal === this.ordinal;
                            result = sameMediaItem && sameOrdinal
                        }
                        return result
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype.getFullScreenImageUriAsync = function() {
                        var signal = new MS.Entertainment.UI.Framework.Signal;
                        WinJS.Promise.as(this._fullScreenImageUriPromise).done(function(uri) {
                            signal.complete(uri)
                        }, function(error) {
                            signal.error(error)
                        });
                        return signal.promise
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._setFullScreenImage = function() {
                        var _this = this;
                        this._fullScreenImageUriPromise = this._loadImages().then(function() {
                            _this._randomizeArt();
                            return _this.fullScreenImageUri
                        }, function() {
                            _this.fullScreenImageUri = null;
                            return _this.fullScreenImageUri
                        })
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._loadImages = function() {
                        var _this = this;
                        var mediaItem = this.mediaItem;
                        if (mediaItem && mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !this._disposed && !this._artLoadingPromise) {
                            var trackMediaItem = mediaItem;
                            var trackHydrate = (!trackMediaItem.artist) ? mediaItem.hydrate() : WinJS.Promise.as(mediaItem);
                            this._artLoadingPromise = trackHydrate.then(function(track) {
                                var artistHydratePromise;
                                if (track.artist && !track.artist.hasCanonicalId)
                                    artistHydratePromise = track.artist.hydrate({forceUpdate: true}).then(function() {
                                        return track
                                    });
                                else
                                    artistHydratePromise = WinJS.Promise.as(track);
                                return artistHydratePromise
                            }).then(function(track) {
                                return _this._extractArtistArtUri(track)
                            }).then(null, function(error) {
                                return _this._getDefaultImageOrNull(trackMediaItem)
                            }).then(function(imageUris) {
                                _this._imageUris = imageUris
                            }, function(error) {
                                return _this._getDefaultImageOrNull(trackMediaItem)
                            })
                        }
                        return WinJS.Promise.as(this._artLoadingPromise)
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._getUrlListFromImageArray = function(images, track) {
                        var _this = this;
                        var artistArtUrls = [];
                        for (var i = 0; i < images.length; i++)
                            artistArtUrls.push(images[i].resizeUrl);
                        if (artistArtUrls.length === 0)
                            if (track.artist && track.artist.primaryLargeImage)
                                artistArtUrls.push(track.artist.primaryLargeImage.resizeUrl);
                            else if (track.images)
                                track.images.forEach(function(image) {
                                    if (image.width >= _this.minArtistImageWidth)
                                        artistArtUrls.push(image.resizeUrl)
                                });
                            else
                                artistArtUrls.push(track.imageResizeUri);
                        return artistArtUrls
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._extractArtistArtUri = function(track) {
                        var _this = this;
                        var result;
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.networkStatus) ? MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(0) : true;
                        var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace);
                        if (isMusicMarketplaceEnabled && track.artist && track.artist.hasCanonicalId)
                            if (track.artist.largeImages && track.artist.largeImages.length) {
                                var artistArtUrls = this._getUrlListFromImageArray(track.artist.largeImages, track);
                                return WinJS.Promise.as(artistArtUrls)
                            }
                            else {
                                var artistArtQuery = new MS.Entertainment.Data.Query.Music.ArtistImages;
                                artistArtQuery.id = track.artist.canonicalId;
                                artistArtQuery.idType = MS.Entertainment.Data.Query.edsIdType.canonical;
                                artistArtQuery.impressionGuid = track.artist.impressionGuid;
                                return artistArtQuery.execute().then(function(q) {
                                        var artistArtUrls;
                                        if (q.result.itemsArray && q.result.itemsArray.length) {
                                            artistArtUrls = _this._getUrlListFromImageArray(q.result.itemsArray, track);
                                            return WinJS.Promise.as(artistArtUrls)
                                        }
                                        else
                                            return _this._getDefaultImageOrNull(track)
                                    }, function(q) {
                                        return _this._getDefaultImageOrNull(track)
                                    })
                            }
                        else
                            return this._getDefaultImageOrNull(track)
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._getDefaultImageOrNull = function(track) {
                        if (track.artist && track.artist.primaryLargeImage)
                            return WinJS.Promise.as([track.artist.primaryLargeImage.resizeUrl]);
                        else if (track.imageResizeUri)
                            if (track.fromCollection)
                                return track.hydrate({forceUpdate: true}).then(function() {
                                        return [track.imageResizeUri]
                                    });
                            else
                                return WinJS.Promise.as([track.imageResizeUri]);
                        else
                            return null
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._randomizeArt = function() {
                        if (this.visualizationType !== 0 || !this._imageUris || this._imageUris.length === 0 || !this._imageUris[0]) {
                            this.fullScreenImageUri = null;
                            return String.empty
                        }
                        if (this._imageUris.length === 1 && this.fullScreenImageUri && this.fullScreenImageUri.lastIndexOf(this._imageUris[0], 0) === 0)
                            return String.empty;
                        if (this._currentArtIndex < 0)
                            this._currentArtIndex = Math.floor(Math.random() * this._imageUris.length);
                        else {
                            this._currentArtIndex++;
                            if (this._currentArtIndex >= this._imageUris.length)
                                this._currentArtIndex = 0
                        }
                        var uri = String.empty;
                        if (this._imageUris[this._currentArtIndex])
                            uri = MS.Entertainment.UI.Shell.ImageLoader.appendResizeParameters(this._imageUris[this._currentArtIndex], this.imageSize ? this.imageSize.x : 0, this.imageSize ? this.imageSize.y : 0, MS.Entertainment.ImageContentType.png);
                        this.fullScreenImageUri = uri;
                        this._queueRandomizeArt();
                        return this._imageUris[this._currentArtIndex]
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._queueRandomizeArt = function() {
                        var _this = this;
                        this._cancelPendingImageSwap();
                        if (this._visualizationType === 0 && this.isCurrentMediaItem && !this._frozen && !this._disposed)
                            this._artSwapTimerPromise = WinJS.Promise.timeout(this.artSwapTimoutMS).then(function() {
                                if (_this._artSwapTimerPromise) {
                                    _this._artSwapTimerPromise = null;
                                    _this._randomizeArt()
                                }
                            }, function() {
                                _this._artSwapTimerPromise = null
                            })
                    };
                    BaseChildNowPlayingVisualizationViewModel.prototype._cancelPendingImageSwap = function() {
                        if (this._artSwapTimerPromise) {
                            this._artSwapTimerPromise.cancel();
                            this._artSwapTimerPromise = null
                        }
                    };
                    return BaseChildNowPlayingVisualizationViewModel
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.BaseChildNowPlayingVisualizationViewModel = BaseChildNowPlayingVisualizationViewModel;
            var BaseNowPlayingVisualizationViewModel = (function(_super) {
                    __extends(BaseNowPlayingVisualizationViewModel, _super);
                    function BaseNowPlayingVisualizationViewModel() {
                        _super.call(this);
                        this._listNotificationHandlerHandlers = null;
                        this._shareOperation = null;
                        this.relatedMediaNextStringId = String.id.IDS_MUSIC_NOW_PLAYING_NEXT_SONG_DESC;
                        this.relatedMediaPreviousStringId = String.id.IDS_MUSIC_NOW_PLAYING_PREVIOUS_SONG_DESC;
                        this.showNextTrackThresholdMS = 30000;
                        this.showPreviousTrackThresholdMS = 30000;
                        this._lastDirection = 0
                    }
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "playbackSession", {
                        get: function() {
                            var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            return sessionMgr.primarySession
                        }, enumerable: true, configurable: true
                    });
                    BaseNowPlayingVisualizationViewModel.prototype.dispose = function() {
                        this._disposed = true;
                        this._releaseCurrentMediaItemHandlers();
                        if (this._uiStateEventHandlers) {
                            this._uiStateEventHandlers.cancel();
                            this._uiStateEventHandlers = null
                        }
                        if (this._sessionManagerEventHandlers) {
                            this._sessionManagerEventHandlers.cancel();
                            this._sessionManagerEventHandlers = null
                        }
                        if (this.currentChild)
                            this.currentChild.dispose();
                        if (this.nextChild)
                            this.nextChild.dispose();
                        if (this.previousChild)
                            this.previousChild.dispose();
                        if (this._listNotificationHandlerHandlers) {
                            this._listNotificationHandlerHandlers.cancel();
                            this._listNotificationHandlerHandlers = null
                        }
                        if (this._nowPlayingListBinding) {
                            this._nowPlayingListBinding.release();
                            this._nowPlayingListBinding = null
                        }
                        if (this._shareOperation) {
                            this._shareOperation.cancel();
                            this._shareOperation = null
                        }
                        this._cancelPlaybackSessionHandlers()
                    };
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "disposed", {
                        get: function() {
                            return this._disposed
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "frozen", {
                        get: function() {
                            return this._frozen
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "mediaItem", {
                        get: function() {
                            return this.currentChild && this.currentChild.mediaItem
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "ordinal", {
                        get: function() {
                            return this.currentChild && this.currentChild.ordinal
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "imageChangeCount", {
                        get: function() {
                            return this.currentChild && this.currentChild.imageChangeCount
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "isCurrentMediaItem", {
                        get: function() {
                            return this.currentChild && this.currentChild.isCurrentMediaItem
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "relatedMediaItem", {
                        get: function() {
                            return this.currentChild && this.currentChild.relatedMediaItem
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "relatedMediaTitle", {
                        get: function() {
                            return this.currentChild && this.currentChild.relatedMediaTitle
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "visualizationType", {
                        get: function() {
                            return this.currentChild && this.currentChild.visualizationType
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "isAudioAd", {
                        get: function() {
                            return this.currentChild && this.currentChild.isAudioAd
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "playbackPositionText", {
                        get: function() {
                            return this.currentChild && this.currentChild.playbackPositionText
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "fullScreenImageUri", {
                        get: function() {
                            return this.currentChild && this.currentChild.fullScreenImageUri
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "currentChild", {
                        get: function() {
                            return this._currentChild
                        }, set: function(value) {
                                if (!this.disposed && value !== this.currentChild) {
                                    var oldValue = this.currentChild;
                                    this.updateAndNotify("currentChild", value);
                                    this._freezeMediaItemsIfNeeded();
                                    this._onCurrentChildChanged(value, oldValue)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "nextChild", {
                        get: function() {
                            return this._nextChild
                        }, set: function(value) {
                                if (!this.disposed && value !== this.nextChild) {
                                    var oldValue = this.nextChild;
                                    this.updateAndNotify("nextChild", value);
                                    this._freezeMediaItemsIfNeeded();
                                    this._onNextChildChanged(value, oldValue)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "previousChild", {
                        get: function() {
                            return this._previousChild
                        }, set: function(value) {
                                if (!this.disposed && value !== this.previousChild) {
                                    this.updateAndNotify("previousChild", value);
                                    this._freezeMediaItemsIfNeeded()
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(BaseNowPlayingVisualizationViewModel.prototype, "lastDirection", {
                        get: function() {
                            return this._lastDirection
                        }, set: function(value) {
                                this.updateAndNotify("lastDirection", value)
                            }, enumerable: true, configurable: true
                    });
                    BaseNowPlayingVisualizationViewModel.prototype.delayInitialize = function(){};
                    BaseNowPlayingVisualizationViewModel.prototype.onFreeze = function() {
                        if (!this._frozen) {
                            this._frozen = true;
                            this._freezeMediaItemsIfNeeded();
                            this._cancelPlaybackSessionHandlers()
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._freezeMediaItemsIfNeeded = function() {
                        if (this._frozen) {
                            if (this.currentChild)
                                this.currentChild.onFreeze();
                            if (this.nextChild)
                                this.nextChild.onFreeze();
                            if (this.previousChild)
                                this.previousChild.onFreeze()
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype.onThaw = function() {
                        if (this._frozen) {
                            this._frozen = false;
                            this._thawMediaItemsIfNeeded();
                            this._applyBindings()
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._thawMediaItemsIfNeeded = function() {
                        if (!this._frozen) {
                            if (this.currentChild)
                                this.currentChild.onThaw();
                            if (this.nextChild)
                                this.nextChild.onThaw();
                            if (this.previousChild)
                                this.previousChild.onThaw()
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype.load = function() {
                        var _this = this;
                        var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        if (this._uiStateEventHandlers) {
                            this._uiStateEventHandlers.cancel();
                            this._uiStateEventHandlers = null
                        }
                        this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiState, {primarySessionIdChanged: this._onPrimarySessionIdChanged.bind(this)});
                        return this._onPrimarySessionIdChanged(null).then(function() {
                                return _this
                            }, function() {
                                return _this
                            })
                    };
                    BaseNowPlayingVisualizationViewModel.prototype.getFullScreenImageUriAsync = function() {
                        var result = null;
                        if (this.currentChild)
                            result = this.currentChild.getFullScreenImageUriAsync();
                        return result
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onPrimarySessionIdChanged = function(args) {
                        var _this = this;
                        var initialMedia = null;
                        var initialMediaCollection = null;
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (this._sessionManagerEventHandlers) {
                            this._sessionManagerEventHandlers.cancel();
                            this._sessionManagerEventHandlers = null
                        }
                        if (sessionManager.primarySession) {
                            this._sessionManagerEventHandlers = MS.Entertainment.Utilities.addEventHandlers(sessionManager.primarySession, {
                                mediaCollectionChanged: this._onMediaCollectionChanged.bind(this), currentMediaChanged: this._onCurrentMediaChanged.bind(this), itemsPlayabilityChanged: this._onCurrentMediaChanged.bind(this), shuffleChanged: this._onCurrentMediaChanged.bind(this)
                            });
                            initialMedia = sessionManager.primarySession.currentMedia;
                            initialMediaCollection = sessionManager.primarySession.mediaCollection
                        }
                        this._applyBindings();
                        return WinJS.Promise.join([this._onCurrentMediaChanged(), this._onMediaCollectionChanged(new MS.Entertainment.UI.Framework.PropertyChangedEventArgs(initialMediaCollection))]).then(function() {
                                return _this
                            })
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._cancelPlaybackSessionHandlers = function() {
                        if (this._playbackSessionHandlers) {
                            this._playbackSessionHandlers.cancel();
                            this._playbackSessionHandlers = null
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._applyBindings = function() {
                        var _this = this;
                        this._cancelPlaybackSessionHandlers();
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var primarySession = sessionMgr.primarySession;
                        MS.Entertainment.UI.Controls.assert(!!primarySession, "No playback session found on Now Playing Page");
                        if (primarySession) {
                            primarySession.enableTimeUpdate();
                            this._playbackSessionHandlers = WinJS.Binding.bind(primarySession, {currentPosition: function() {
                                    _this._updatePlaybackPositionText();
                                    _this._updateRelatedMedia()
                                }})
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._updatePlaybackPositionText = function() {
                        if (!this.currentChild || this.disposed)
                            return;
                        var sessionManager = null;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var primarySession = sessionManager && sessionManager.primarySession;
                        var duration = null;
                        var position = null;
                        if (primarySession) {
                            duration = Entertainment.Utilities.millisecondsToTimeCode(primarySession.duration || (this.mediaItem && this.mediaItem.durationMilliseconds) || null);
                            position = Entertainment.Utilities.millisecondsToTimeCode(primarySession.currentPosition)
                        }
                        if (duration)
                            this.currentChild.playbackPositionText = String.load(String.id.IDS_PLAYBACK_DURATION_PROGRESS).format(position, duration);
                        else
                            this.currentChild.playbackPositionText = String.empty
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._updateRelatedMedia = function(positionOverride) {
                        var sessionManager = null;
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var primarySession = sessionManager && sessionManager.primarySession;
                        if (this.disposed || !this.mediaItem || !this.currentChild || !primarySession)
                            return;
                        var duration = primarySession.duration || this.mediaItem.durationMilliseconds || 0;
                        var position = primarySession.currentPosition;
                        if (primarySession.duration < this.mediaItem.durationMilliseconds - 5000 || primarySession.duration > this.mediaItem.durationMilliseconds + 5000)
                            position = 0;
                        if (typeof positionOverride === "number" && !isNaN(positionOverride))
                            position = positionOverride;
                        if (position >= 0 && duration > this.showPreviousTrackThresholdMS && position <= this.showPreviousTrackThresholdMS && this.lastDirection === 1 && (!this.nextChild || this.relatedMediaItem !== this.nextChild.mediaItem));
                        else if (duration > 0 && duration - position <= this.showNextTrackThresholdMS) {
                            this.currentChild.relatedMediaTitle = this.relatedMediaNextStringId ? String.load(this.relatedMediaNextStringId) : String.empty;
                            this.currentChild.relatedMediaItem = this.nextChild && this.nextChild.mediaItem
                        }
                        else {
                            this.currentChild.relatedMediaTitle = String.empty;
                            this.currentChild.relatedMediaItem = null
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._mediaItemAt = function(ordinal) {
                        var _this = this;
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var result = null;
                        if (sessionManager.primarySession && sessionManager.primarySession.mediaCollection && ordinal >= 0)
                            result = sessionManager.primarySession.mediaCollection.itemFromIndex(ordinal).then(function(item) {
                                return _this.createChildNowPlayingingVisualizationViewModel(item && item.data, ordinal)
                            }, function(error) {
                                MS.Entertainment.ViewModels.fail("BaseNowPlayingVIewModel::_mediaItemAt(). Failed to load media item at ordinal: " + ordinal + " error: " + (error && error.message));
                                return null
                            });
                        return WinJS.Promise.as(result)
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._sanitizeNowPlayingOrdinals = function(ordinal) {
                        var result = ordinal;
                        if (typeof ordinal !== "number" || isNaN(ordinal))
                            result = -1;
                        return result
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onCurrentMediaChanged = function() {
                        var _this = this;
                        if (this.disposed)
                            return;
                        var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var currentViewModel = null;
                        var nextMediaPromise = null;
                        var previousMediaPromise = null;
                        var currentOrdinal = -1;
                        var directionChange = 0;
                        var playingMediaItem = null;
                        var isPlayingAudioAd = false;
                        if (sessionManager.primarySession) {
                            var sessionOrdinal = sessionManager.primarySession.currentOrdinal;
                            currentOrdinal = (sessionOrdinal === +sessionOrdinal) ? sessionOrdinal : sessionManager.primarySession.first;
                            playingMediaItem = sessionManager.primarySession.currentMedia;
                            isPlayingAudioAd = playingMediaItem && playingMediaItem.isAudioAd
                        }
                        var nextOrdinalPromise = WinJS.Promise.wrap(-1);
                        var previousOrdinalPromise = WinJS.Promise.wrap(-1);
                        if (currentOrdinal >= 0) {
                            nextOrdinalPromise = sessionManager.primarySession.nextPlayable(currentOrdinal);
                            previousOrdinalPromise = sessionManager.primarySession.previousPlayable(currentOrdinal)
                        }
                        return WinJS.Promise.join([previousOrdinalPromise, nextOrdinalPromise]).then(function(ordinals) {
                                var nextOrdinal = _this._sanitizeNowPlayingOrdinals(ordinals[1]);
                                var previousOrdinal = _this._sanitizeNowPlayingOrdinals(ordinals[0]);
                                var promises = [];
                                if (previousOrdinal >= 0 && previousOrdinal !== currentOrdinal) {
                                    if (_this.currentChild && !_this.currentChild.isAudioAd && _this.currentChild.ordinal === previousOrdinal)
                                        previousMediaPromise = WinJS.Promise.as(_this.currentChild);
                                    else
                                        previousMediaPromise = _this._mediaItemAt(previousOrdinal);
                                    promises.push(previousMediaPromise)
                                }
                                if (nextOrdinal >= 0 && nextOrdinal !== currentOrdinal) {
                                    if (_this.currentChild && !_this.currentChild.isAudioAd && _this.currentChild.ordinal === nextOrdinal)
                                        nextMediaPromise = WinJS.Promise.as(_this.currentChild);
                                    else
                                        nextMediaPromise = _this._mediaItemAt(nextOrdinal);
                                    promises.push(nextMediaPromise)
                                }
                                if (!isPlayingAudioAd && _this.nextChild && _this.nextChild.ordinal === currentOrdinal) {
                                    directionChange = 1;
                                    currentViewModel = _this.nextChild
                                }
                                else if (!isPlayingAudioAd && _this.previousChild && _this.previousChild.ordinal === currentOrdinal) {
                                    directionChange = 2;
                                    currentViewModel = _this.previousChild
                                }
                                else if (playingMediaItem)
                                    currentViewModel = _this.createChildNowPlayingingVisualizationViewModel(playingMediaItem, currentOrdinal);
                                else
                                    currentViewModel = null;
                                if (currentViewModel) {
                                    currentViewModel.isCurrentMediaItem = true;
                                    currentViewModel.mediaItem = sessionManager.primarySession.currentMedia;
                                    if (currentViewModel.mediaItem && currentViewModel.mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                                        currentViewModel.visualizationType = 1;
                                    else {
                                        currentViewModel.visualizationType = 0;
                                        promises.push(currentViewModel.getFullScreenImageUriAsync())
                                    }
                                }
                                _this.nextChild = null;
                                _this.previousChild = null;
                                if (!_this.currentChild || !_this.currentChild.isEqual(currentViewModel)) {
                                    _this.lastDirection = directionChange;
                                    _this.currentChild = currentViewModel
                                }
                                WinJS.Promise.as(nextMediaPromise).done(function(mediaItem) {
                                    if (mediaItem) {
                                        mediaItem.isCurrentMediaItem = false;
                                        _this.nextChild = mediaItem
                                    }
                                }, function(){});
                                WinJS.Promise.as(previousMediaPromise).done(function(mediaItem) {
                                    if (mediaItem) {
                                        mediaItem.isCurrentMediaItem = false;
                                        _this.previousChild = mediaItem
                                    }
                                }, function(){});
                                _this._updatePlaybackPositionText();
                                _this._updateRelatedMedia(0);
                                if (_this._shareOperation) {
                                    _this._shareOperation.cancel();
                                    _this._shareOperation = null
                                }
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(Entertainment.Services.shareSender) && playingMediaItem && !isPlayingAudioAd) {
                                    var sender = MS.Entertainment.ServiceLocator.getService(Entertainment.Services.shareSender);
                                    _this._shareOperation = sender.pendingShare(playingMediaItem)
                                }
                                return WinJS.Promise.join(promises).then(function() {
                                        return _this
                                    })
                            }, function() {
                                return _this
                            })
                    };
                    BaseNowPlayingVisualizationViewModel.prototype.createChildNowPlayingingVisualizationViewModel = function(mediaItem, ordinal) {
                        return new BaseChildNowPlayingVisualizationViewModel(mediaItem, ordinal)
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onMediaCollectionSizeChanges = function(args) {
                        var _this = this;
                        var initialization = !args || !args.detail || args.detail.oldValue === undefined;
                        var result = null;
                        if (!initialization)
                            result = MS.Entertainment.Utilities.schedulePromiseBelowNormal(null, "BaseNowPlayingVisualizationViewModel::_onMediaCollectionSizeChanges").then(function() {
                                _this._onCurrentMediaChanged()
                            });
                        return WinJS.Promise.as(result)
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onMediaCollectionChanged = function(args) {
                        var _this = this;
                        var currentMediaCollection = null;
                        var listNotificationHandler = null;
                        if (this._listNotificationHandlerHandlers) {
                            this._listNotificationHandlerHandlers.cancel();
                            this._listNotificationHandlerHandlers = null
                        }
                        if (this._nowPlayingListBinding) {
                            this._nowPlayingListBinding.release();
                            this._nowPlayingListBinding = null
                        }
                        if (args && args.detail && args.detail.newValue)
                            currentMediaCollection = args.detail.newValue;
                        if (currentMediaCollection) {
                            listNotificationHandler = new NowPlayingListNotificationHandler;
                            this._nowPlayingListBinding = currentMediaCollection.createListBinding(listNotificationHandler);
                            this._listNotificationHandlerHandlers = MS.Entertainment.Utilities.addEventHandlers(listNotificationHandler, {countChanged: this._onMediaCollectionSizeChanges.bind(this)})
                        }
                        return this._onMediaCollectionSizeChanges(null).then(function() {
                                return _this
                            })
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onCurrentChildChanged = function(newValue, oldValue) {
                        var _this = this;
                        this._releaseCurrentMediaItemHandlers();
                        var handlers = {};
                        var properties = ["mediaItem", "ordinal", "fullScreenImageUri", "relatedMediaItem", "relatedMediaTitle", "isAudioAd", "playbackPositionText", "visualizationType"];
                        properties.forEach(function(key) {
                            var oldKeyValue = oldValue && oldValue[key];
                            var newKeyValue = newValue && newValue[key];
                            if (oldKeyValue !== newKeyValue)
                                _this.dispatchChangeAndNotify(key, newKeyValue, oldKeyValue);
                            handlers[key + "Changed"] = function(args) {
                                _this.dispatchChangeAndNotify(key, WinJS.Utilities.getMember("detail.newValue", args), WinJS.Utilities.getMember("detail.oldValue", args))
                            }
                        });
                        if (newValue && !this._disposed)
                            this._currentMediaItemHandlers = MS.Entertainment.Utilities.addEventHandlers(newValue, handlers)
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._onNextChildChanged = function(newValue, oldValue) {
                        if (newValue && !this.disposed) {
                            newValue.relatedMediaTitle = this.relatedMediaPreviousStringId ? String.load(this.relatedMediaPreviousStringId) : String.empty;
                            newValue.relatedMediaItem = this.currentChild && this.currentChild.mediaItem;
                            newValue.playbackPositionText = String.load(String.id.IDS_PLAYBACK_DURATION_PROGRESS).format(Entertainment.Utilities.millisecondsToTimeCode(0), Entertainment.Utilities.millisecondsToTimeCode(newValue.mediaItem && newValue.mediaItem.durationMilliseconds));
                            this._updateRelatedMedia()
                        }
                    };
                    BaseNowPlayingVisualizationViewModel.prototype._releaseCurrentMediaItemHandlers = function() {
                        if (this._currentMediaItemHandlers) {
                            this._currentMediaItemHandlers.cancel();
                            this._currentMediaItemHandlers = null
                        }
                    };
                    return BaseNowPlayingVisualizationViewModel
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.BaseNowPlayingVisualizationViewModel = BaseNowPlayingVisualizationViewModel;
            var NowPlayingListNotificationHandler = (function(_super) {
                    __extends(NowPlayingListNotificationHandler, _super);
                    function NowPlayingListNotificationHandler() {
                        _super.apply(this, arguments);
                        this._changes = null
                    }
                    NowPlayingListNotificationHandler.prototype.beginNotifications = function() {
                        this._changes = []
                    };
                    NowPlayingListNotificationHandler.prototype.changed = function(newItem, oldItem){};
                    NowPlayingListNotificationHandler.prototype.countChanged = function(newCount, oldCount) {
                        this._pushChange("countChanged", {
                            newValue: newCount, oldValue: oldCount
                        })
                    };
                    NowPlayingListNotificationHandler.prototype.endNotifications = function() {
                        var _this = this;
                        if (this._changes)
                            this._changes.forEach(function(change) {
                                _this.dispatchEvent(change.change, change.detail)
                            })
                    };
                    NowPlayingListNotificationHandler.prototype.indexChanged = function(handle, newIndex, oldIndex){};
                    NowPlayingListNotificationHandler.prototype.inserted = function(itemPromise, previousHandle, nextHandle){};
                    NowPlayingListNotificationHandler.prototype.itemAvailable = function(item){};
                    NowPlayingListNotificationHandler.prototype.itemMoved = function(item, previousHandle, nextHandle){};
                    NowPlayingListNotificationHandler.prototype.removed = function(handle, mirage){};
                    NowPlayingListNotificationHandler.prototype._pushChange = function(change, detail) {
                        if (this._changes)
                            this._changes.push({
                                change: change, detail: detail
                            });
                        else
                            this.dispatchEvent(change, detail)
                    };
                    return NowPlayingListNotificationHandler
                })(MS.Entertainment.UI.Framework.ObservableBase);
            ViewModels.NowPlayingListNotificationHandler = NowPlayingListNotificationHandler
        })(ViewModels = Entertainment.ViewModels || (Entertainment.ViewModels = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
