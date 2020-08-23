/* Copyright (C) Microsoft Corporation. All rights reserved. */
/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Framework", {
        TileManager: MS.Entertainment.UI.Framework.define(function tileManager() {
            if (MS.Entertainment.Utilities.isApp2)
                return;
            this._bindingsToDetach = [];
            this._recentItemUris = [];
            if (Windows.UI.Notifications.TileTemplateType.tileSquare310x310TextList01)
                this._xboxLogo = MS.Entertainment.Framework.TileManager.xboxLogo;
            else
                this._xboxLogo = MS.Entertainment.Framework.TileManager.xboxLogoClassic;
            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            WinJS.Promise.timeout(2500).then(function _deferredInit() {
                try {
                    this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication()
                }
                catch(err) {
                    MS.Entertainment.Framework.fail("Failure in calls to TileUpdateManager: " + err)
                }
                this.clearTile();
                this._initialize()
            }.bind(this))
        }, {
            EMPTY_GUID: "00000000-0000-0000-0000-000000000000", _playbackSession: null, _bindingsToDetach: null, _nowPlayingImageUri: String.empty, _nowPlayingTitle: String.empty, _nowPlayingSubTitle: String.empty, _nowPlayingTertiaryTitle: String.empty, _nowPlayingQuaternaryTitle: String.empty, _xboxLogo: null, _tileUpdateTimer: null, _tilesAvailable: false, _recentItemUris: null, _wideTemplate: null, _widePeekTemplate: null, _wideSquareTemplate: null, _widePosterTemplate: null, _wideNoImageTemplate: null, _squareTemplate: null, _largeSquareTemplate: null, _squarePeekTemplate: null, _uiStateService: null, _tileUpdater: null, _musicPausedExpiryTime: 3600, _musicPlayingExpiryTime: 12 * 60, _videoPausedExpiryTime: 3 * 3600, _videoPlayingExpiryTime: 5 * 3600, _clearTileByTagExpiryTime: 15, _companionConnectionDelay: 2500, _nowPlayingTileTag: "nowplaying", _applicationChannel: null, _defaultWideTemplate: null, _defaultSquareTemplate: null, _peekImageUri: null, _lastItemTitle: null, _lastSavedThumbnailImage: null, _lastSavedWidePeekImage: null, _lastSavedSquarePeekImage: null, _lastSaveLargeSquarePeekImage: null, _thumbnailImageFileName: "tileThumbnailImage.jpg", _peekWideImageFileName: "tileWidePeekImage.jpg", _peekSquareImageFileName: "tileSquarePeekImage.jpg", _peekLargeSquareImageFileName: "tileLargeSquareImage.jpg", _defaultWideTileWidth: 310, _defaultSquareTileWidth: 150, _defaultLargeSquareTileSize: 310, _defaultTileHeight: 150, _joinedImageUrlPromises: null, _shapeAssets: null, _lastMusicShape: null, _lastMusicColor: null, _lastMusicImage: null, _squareThumbnailDimension: 160, _posterThumbnailHeight: 258, _posterThumbnailWidth: 172, _initialize: function _initialize() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this._playbackSession = sessionMgr.primarySession;
                    this._initializeBinding(this._playbackSession, "currentMedia", this._mediaChanged.bind(this));
                    this._initializeBinding(this._playbackSession, "currentTransportState", this._transportStateChanged.bind(this));
                    var templateTypes = Windows.UI.Notifications.TileTemplateType.TileTemplateType;
                    this._wideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText04;
                    this._widePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileWidePeekImage02;
                    this._wideSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText02;
                    this._widePosterTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText05;
                    this._wideNoImageTemplate = Windows.UI.Notifications.TileTemplateType.tileWideText01;
                    this._squarePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileSquarePeekImageAndText03;
                    this._squareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareText03;
                    this._defaultWideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideImage;
                    this._defaultSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareImage;
                    this._largeSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquare310x310TextList01;
                    this._largeSquarePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileSquare310x310ImageAndTextOverlay03;
                    if (MS.Entertainment.Utilities.isMusicApp)
                        this._initializeShapes()
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, _initializeShapes: function _initializeShapes() {
                    this._shapeAssets = {};
                    if (!WinJS.Utilities.getMember("MS.Entertainment.UI.Controls.ShapeVisualization"))
                        return;
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Circle] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece01." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece02." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_circlepiece03." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_halfcirclerot01." + MS.Entertainment.Utilities.getPackageImageFileExtension()];
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Square] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_square01rot." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_square02rot." + MS.Entertainment.Utilities.getPackageImageFileExtension()];
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Triangle] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle01." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle02." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle03." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle04." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle05." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_triangle6rot." + MS.Entertainment.Utilities.getPackageImageFileExtension()];
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Trapezoid] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_trapezoid01." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_trapezoid02." + MS.Entertainment.Utilities.getPackageImageFileExtension()];
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Parallelogram] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram01." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram02." + MS.Entertainment.Utilities.getPackageImageFileExtension(), "ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_parallelogram03rot." + MS.Entertainment.Utilities.getPackageImageFileExtension()];
                    this._shapeAssets[MS.Entertainment.UI.Controls.ShapeVisualization.ShapeType.Diamond] = ["ms-appx:///images/tiles/MusicNowPlaying/Music_np_app_tile_02_diamond01." + MS.Entertainment.Utilities.getPackageImageFileExtension()]
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    })
                }, _mediaChanged: function _mediaChanged() {
                    this._updateMetadata()
                }, updateTile: function updateTile() {
                    if (MS.Entertainment.Utilities.isApp2)
                        return;
                    this._updateMetadata()
                }, clearTileByTag: function clearTileByTag(tag) {
                    if (!this._tilesAvailable)
                        return;
                    try {
                        var Notifications = Windows.UI.Notifications;
                        var wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._defaultWideTemplate);
                        var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._defaultSquareTemplate);
                        var wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                        var squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                        var genericWideImage = String.empty;
                        var genericSquareImage = String.empty;
                        if (MS.Entertainment.Utilities.isMusicApp) {
                            genericWideImage = "ms-appx:///images/tiles/XBL_MUSIC_310x150_C.png";
                            genericSquareImage = "ms-appx:///images/tiles/XBL_MUSIC_150x150_A.png"
                        }
                        else if (MS.Entertainment.Utilities.isVideoApp) {
                            genericWideImage = "ms-appx:///images/tiles/XBL_VIDEO_310x150_C.png";
                            genericSquareImage = "ms-appx:///images/tiles/XBL_VIDEO_150x150_A.png"
                        }
                        wideTileImageAttributes[0].setAttribute("src", genericWideImage);
                        squareTileImageAttributes[0].setAttribute("src", genericSquareImage);
                        wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                        squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                        var squareTileXmlNode = wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true);
                        wideTileXml.getElementsByTagName("visual")[0].appendChild(squareTileXmlNode);
                        var tileNotification = new Notifications.TileNotification(wideTileXml);
                        tileNotification.tag = tag;
                        var currentTime = new Date;
                        var expiryTime = new Date(currentTime.getTime() + this._clearTileByTagExpiryTime * 1000);
                        tileNotification.expirationTime = expiryTime;
                        if (!this._tileUpdater)
                            this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
                        this._tileUpdater.update(tileNotification)
                    }
                    catch(err) {
                        MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
                    }
                }, clearTile: function clearTile() {
                    this._tilesAvailable = true
                }, _transportStateChangedTimeout: null, _transportStateChanged: function _transportStateChanged() {
                    if (this._transportStateChangedTimeout) {
                        this._transportStateChangedTimeout.cancel();
                        this._transportStateChangedTimeout = null
                    }
                    this._transportStateChangedTimeout = WinJS.Promise.timeout(1000).then(function() {
                        if (this._playbackSession && this._playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                            this.clearTileByTag(this._nowPlayingTileTag);
                        else
                            this.updateTile()
                    }.bind(this), function(){})
                }, _startUpdateTimer: function _startUpdateTimer() {
                    if (this._tileUpdateTimer)
                        window.clearTimeout(this._tileUpdateTimer);
                    this._tileUpdateTimer = window.setTimeout(this._doUpdateTile.bind(this), 2000)
                }, _doUpdateTile: function _doUpdateTile() {
                    this._tileUpdateTimer = null;
                    this._setNowPlayingNotification()
                }, _setNowPlayingNotification: function _setNowPlayingNotification() {
                    if (!this._tilesAvailable)
                        return;
                    var serviceAvailable = true;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var wideTileXml;
                    var squareTileXml;
                    try {
                        if (this._playbackSession.currentMedia && this._playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.stopped) {
                            if (MS.Entertainment.Utilities.isVideoApp) {
                                if (!(featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)))
                                    serviceAvailable = false
                            }
                            else if (MS.Entertainment.Utilities.isMusicApp)
                                if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                    serviceAvailable = false;
                            this._joinedImageUrlPromises.done(function FinishTiles() {
                                if (this._peekImageUri && serviceAvailable)
                                    this._testImageExists(this._peekImageUri, function imageTestSuccess() {
                                        this._createComposedPeekImages(serviceAvailable)
                                    }.bind(this), function imageTestFailed() {
                                        this._loadNonPeekTiles(serviceAvailable)
                                    }.bind(this));
                                else
                                    this._loadNonPeekTiles(serviceAvailable)
                            }.bind(this))
                        }
                        else
                            this.clearTileByTag(this._nowPlayingTileTag)
                    }
                    catch(err) {
                        MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
                    }
                }, _createComposedPeekImages: function _createComposedPeekImages(serviceAvailable) {
                    var Notifications = Windows.UI.Notifications;
                    var wideTileXml;
                    var squareTileXml;
                    var largeSquareTileXml;
                    var promisesToJoin = [];
                    promisesToJoin.push(this._createComposedWidePeekImage());
                    promisesToJoin.push(this._createComposedSquarePeekImage());
                    promisesToJoin.push(this._createComposedLargeSquarePeekImage());
                    WinJS.Promise.join(promisesToJoin).then(function setupWideTiles() {
                        var squareTileImageAttributes;
                        var wideTileImageAttributes;
                        var largeSquareTileImageAttributes;
                        if (this._peekImageUri === this._lastSavedWidePeekImage) {
                            if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._widePeekTemplate);
                                this._nowPlayingTertiaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                            }
                            else {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._widePeekTemplate);
                                this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                            }
                            wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                            wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekWideImageFileName)
                        }
                        if (this._peekImageUri === this._lastSavedSquarePeekImage) {
                            squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squarePeekTemplate);
                            squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                            squareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekSquareImageFileName)
                        }
                        else
                            squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate);
                        if (this._largeSquareTemplate && this._largeSquarePeekTemplate)
                            if (this._peekImageUri === this._lastSaveLargeSquarePeekImage) {
                                largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquarePeekTemplate);
                                largeSquareTileImageAttributes = largeSquareTileXml.getElementsByTagName("image");
                                largeSquareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekLargeSquareImageFileName)
                            }
                            else
                                largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                        if (!wideTileXml)
                            this._setupWideTemplate(serviceAvailable).then(function finish(wideTileXml) {
                                this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml, largeSquareTileXml, serviceAvailable)
                            }.bind(this));
                        else
                            this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml, largeSquareTileXml, serviceAvailable)
                    }.bind(this))
                }, _createComposedWidePeekImage: function _createComposedWidePeekImage() {
                    var wideTileImageAttributes;
                    var displayFile;
                    var completion;
                    var returnPromise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    try {
                        if (this._peekImageUri !== this._lastSavedWidePeekImage) {
                            var canvas = document.createElement("canvas");
                            switch (MS.Entertainment.Utilities.getDisplayProperties().resolutionScale) {
                                case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                                    canvas.width = this._defaultWideTileWidth * 1.4;
                                    canvas.height = this._defaultTileHeight * 1.4;
                                    break;
                                case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                                    canvas.width = this._defaultWideTileWidth * 1.8;
                                    canvas.height = this._defaultTileHeight * 1.8;
                                    break;
                                default:
                                    canvas.width = this._defaultWideTileWidth * 1.0;
                                    canvas.height = this._defaultTileHeight * 1.0;
                                    break
                            }
                            var context = canvas.getContext("2d");
                            context.clearRect(0, 0, canvas.width, canvas.height);
                            context.fillStyle = "#000000";
                            context.fillRect(0, 0, canvas.width, canvas.height);
                            var peekImage = new Image;
                            peekImage.onload = function loadArt() {
                                try {
                                    var ratio = peekImage.naturalWidth / peekImage.naturalHeight;
                                    var peekImageHeight = canvas.height;
                                    var peekImageWidth = ratio * canvas.height;
                                    var peekImageX = canvas.width - peekImageWidth;
                                    context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                                    var gradient = new Image;
                                    var output = null;
                                    var input = null;
                                    var primaryStream = null;
                                    gradient.onload = function loadGradient() {
                                        try {
                                            context.drawImage(gradient, 0, 0, canvas.width, canvas.height);
                                            if (MS.Entertainment.Utilities.isMusicApp) {
                                                var signal = new MS.Entertainment.UI.Framework.Signal;
                                                if (WinJS.Utilities.getMember("MS.Entertainment.UI.Controls.MusicVisualization") && MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt) {
                                                    var shapeImage = new Image;
                                                    this._getShapeImage(canvas.width, canvas.height).then(function processShapeImage(url) {
                                                        shapeImage.onload = function createFinalImage() {
                                                            context.drawImage(shapeImage, 0, 0, canvas.width, canvas.height);
                                                            var blob = canvas.msToBlob();
                                                            signal.complete(blob)
                                                        };
                                                        shapeImage.src = url
                                                    }, function failureToDrawTile() {
                                                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images")
                                                    })
                                                }
                                                else
                                                    try {
                                                        signal.complete(canvas.msToBlob())
                                                    }
                                                    catch(exception) {
                                                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception.toString());
                                                        signal.complete()
                                                    }
                                                signal.promise.then(function(blob) {
                                                    this._createTileImageFile(this._peekWideImageFileName, blob, this._defaultWideTileWidth, this._defaultTileHeight).then(function completePromise(success) {
                                                        if (success)
                                                            this._lastSavedWidePeekImage = this._peekImageUri;
                                                        completion()
                                                    }.bind(this))
                                                }.bind(this))
                                            }
                                            else {
                                                var blob = canvas.msToBlob();
                                                this._createTileImageFile(this._peekWideImageFileName, blob, this._defaultWideTileWidth, this._defaultTileHeight).then(function completePromise(success) {
                                                    if (success)
                                                        this._lastSavedWidePeekImage = this._peekImageUri;
                                                    completion()
                                                }.bind(this))
                                            }
                                        }
                                        catch(e) {
                                            completion()
                                        }
                                    }.bind(this)
                                }
                                catch(e) {
                                    signal.complete()
                                }
                                gradient.src = "ms-appx:///images/tiles/NP_tile_gradient." + MS.Entertainment.Utilities.getPackageImageFileExtension()
                            }.bind(this);
                            peekImage.src = this._peekImageUri
                        }
                        else
                            completion()
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                        completion()
                    }
                    return returnPromise
                }, _getShapeImage: function _getShapeImage(width, height) {
                    var completion;
                    var returnPromise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    var canvas = document.createElement("canvas");
                    var context = canvas.getContext("2d");
                    try
                    {
                        context.clearRect(0, 0, width, height);
                        var shapeImage = new Image;
                        shapeImage.onload = function loadShapeImage() {
                            try
                            {
                                context.drawImage(shapeImage, 0, 0, canvas.width, canvas.height);
                                var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                                var data = imageData.data;
                                var currentColor = WinJS.Utilities.getMember("MS.Entertainment.UI.Controls.MusicVisualization.currentPrimaryColor");
                                if (currentColor)
                                    for (var i = 0, n = data.length; i < n; i += 4)
                                        if (data[i + 3] > 0 && data[i + 3] < 255) {
                                            data[i] = currentColor.r;
                                            data[i + 1] = currentColor.g;
                                            data[i + 2] = currentColor.b
                                        }
                                context.putImageData(imageData, 0, 0)
                            }
                            catch(e) {
                                completion(null)
                            }
                            completion(canvas.toDataURL())
                        }.bind(this)
                    }
                    catch(e) {
                        completion()
                    }
                    MS.Entertainment.Framework.assert(this._shapeAssets, "Shape assets were not defined");
                    MS.Entertainment.Framework.assert(this._shapeAssets[MS.Entertainment.UI.Controls.MusicVisualization.currentShape], "No assets defined for this shape: " + MS.Entertainment.UI.Controls.MusicVisualization.currentShape);
                    var shapeOptions = this._shapeAssets[MS.Entertainment.UI.Controls.MusicVisualization.currentShape];
                    MS.Entertainment.Framework.assert(shapeOptions && shapeOptions.length, "No assets defined for this shape: " + MS.Entertainment.UI.Controls.MusicVisualization.currentShape);
                    if (shapeOptions && shapeOptions.length) {
                        var index = Math.floor(Math.random() * shapeOptions.length);
                        shapeImage.src = shapeOptions[index]
                    }
                    return returnPromise
                }, _createComposedLargeSquarePeekImage: function _createComposedLargeSquarePeekImage() {
                    var signal = new MS.Entertainment.UI.Framework.Signal;
                    try {
                        if (this._peekImageUri !== this._lastSaveLargeSquarePeekImage) {
                            var largeCanvas = document.createElement("canvas");
                            var scaleFactor = 1.0;
                            var displayProperties = MS.Entertainment.Utilities.getDisplayProperties();
                            switch (displayProperties.resolutionScale) {
                                case Windows.Graphics.Display.ResolutionScale.scale100Percent:
                                    break;
                                case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                                    scaleFactor = 1.4;
                                    break;
                                case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                                    scaleFactor = 1.8;
                                    break;
                                default:
                                    MS.Entertainment.fail("Unknown scale factor in tile manager. Scale: " + displayProperties.resolutionScale);
                                    break
                            }
                            largeCanvas.width = largeCanvas.height = this._defaultLargeSquareTileSize * scaleFactor;
                            var context = largeCanvas.getContext("2d");
                            context.clearRect(0, 0, largeCanvas.width, largeCanvas.height);
                            context.fillStyle = "#000000";
                            context.fillRect(0, 0, largeCanvas.width, largeCanvas.height);
                            var peekImage = new Image;
                            peekImage.onload = function() {
                                var ratio = peekImage.naturalWidth / peekImage.naturalHeight;
                                var peekImageHeight = largeCanvas.height;
                                var peekImageWidth = ratio * largeCanvas.height;
                                var peekImageX = largeCanvas.width - peekImageWidth;
                                if (peekImage.naturalHeight > peekImage.naturalWidth) {
                                    peekImageX = 0;
                                    ratio = peekImage.naturalHeight / peekImage.naturalWidth;
                                    peekImageWidth = largeCanvas.width;
                                    peekImageHeight = largeCanvas.height * ratio
                                }
                                try {
                                    context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                                    this._createTileImageFile(this._peekLargeSquareImageFileName, largeCanvas.msToBlob(), this._defaultLargeSquareTileSize, this._defaultLargeSquareTileSize).done(function(success) {
                                        if (success)
                                            this._lastSaveLargeSquarePeekImage = this._peekImageUri;
                                        signal.complete()
                                    }.bind(this))
                                }
                                catch(exception) {
                                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                    signal.complete()
                                }
                            }.bind(this);
                            peekImage.src = this._peekImageUri
                        }
                        else
                            signal.complete()
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                        signal.complete()
                    }
                    return signal.promise
                }, _createComposedSquarePeekImage: function _createComposedSquarePeekImage() {
                    var displayFile;
                    var completion;
                    var returnPromise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    try {
                        if (this._peekImageUri !== this._lastSavedWidePeekImage) {
                            var smallCanvas = document.createElement("canvas");
                            switch (MS.Entertainment.Utilities.getDisplayProperties().resolutionScale) {
                                case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                                    smallCanvas.width = this._defaultSquareTileWidth * 1.4;
                                    smallCanvas.height = this._defaultTileHeight * 1.4;
                                    break;
                                case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                                    smallCanvas.width = this._defaultSquareTileWidth * 1.8;
                                    smallCanvas.height = this._defaultTileHeight * 1.8;
                                    break;
                                default:
                                    smallCanvas.width = this._defaultSquareTileWidth * 1.0;
                                    smallCanvas.height = this._defaultTileHeight * 1.0;
                                    break
                            }
                            var context = smallCanvas.getContext("2d");
                            context.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
                            context.fillStyle = "#000000";
                            context.fillRect(0, 0, smallCanvas.width, smallCanvas.height);
                            var peekImage = new Image;
                            peekImage.onload = function loadArt() {
                                var ratio = peekImage.naturalWidth / peekImage.naturalHeight;
                                var peekImageHeight = smallCanvas.height;
                                var peekImageWidth = ratio * smallCanvas.height;
                                var peekImageX = smallCanvas.width - peekImageWidth;
                                try {
                                    context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                                    var gradient = new Image;
                                    var output = null;
                                    var input = null;
                                    var primaryStream = null;
                                    gradient.onload = function loadGradient() {
                                        try {
                                            context.drawImage(gradient, 0, 0, smallCanvas.width, smallCanvas.height);
                                            var blob = smallCanvas.msToBlob();
                                            this._createTileImageFile(this._peekSquareImageFileName, blob, this._defaultSquareTileWidth, this._defaultTileHeight).then(function completePromise(success) {
                                                if (success)
                                                    this._lastSavedSquarePeekImage = this._peekImageUri;
                                                completion()
                                            }.bind(this))
                                        }
                                        catch(exception) {
                                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                            completion()
                                        }
                                    }.bind(this);
                                    gradient.src = "ms-appx:///images/tiles/NP_tile_gradient_1x1." + MS.Entertainment.Utilities.getPackageImageFileExtension()
                                }
                                catch(exception) {
                                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                    completion()
                                }
                            }.bind(this);
                            peekImage.src = this._peekImageUri
                        }
                        else
                            completion()
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                        completion()
                    }
                    return returnPromise
                }, _createNonPeekImage: function _createNonPeekImage() {
                    var wideTileImageAttributes;
                    var displayFile;
                    var widthToUse = 0;
                    var heightToUse = 0;
                    var completion;
                    var returnPromise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                        widthToUse = this._posterThumbnailWidth;
                        heightToUse = this._posterThumbnailHeight
                    }
                    else {
                        widthToUse = this._squareThumbnailDimension;
                        heightToUse = this._squareThumbnailDimension
                    }
                    try {
                        if (this._nowPlayingImageUri !== this._lastSavedThumbnailImage) {
                            var canvas = document.createElement("canvas");
                            var thumbnailImage = new Image;
                            thumbnailImage.addEventListener("load", function loadArt() {
                                try {
                                    canvas.width = widthToUse;
                                    canvas.height = heightToUse;
                                    var context = canvas.getContext("2d");
                                    context.clearRect(0, 0, widthToUse, heightToUse);
                                    context.drawImage(thumbnailImage, 0, 0, widthToUse, heightToUse);
                                    var output = null;
                                    var input = null;
                                    var primaryStream = null;
                                    var blob = canvas.msToBlob();
                                    this._createTileImageFile(this._thumbnailImageFileName, blob, widthToUse, heightToUse).then(function completePromise(success) {
                                        if (success)
                                            this._lastSavedThumbnailImage = this._nowPlayingImageUri;
                                        completion()
                                    }.bind(this))
                                }
                                catch(exception) {
                                    MS.Entertainment.Framework.fail("Failure in tilemanager while creating thumbnail images: " + exception);
                                    completion()
                                }
                            }.bind(this));
                            thumbnailImage.src = this._nowPlayingImageUri
                        }
                        else
                            completion()
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating thumbnail images: " + exception);
                        completion()
                    }
                    return returnPromise
                }, _createTileImageFile: function _createTileImageFile(filename, imageBlob, width, height) {
                    var fileName = filename;
                    var output = null;
                    var input = imageBlob.msDetachStream();
                    var pixels;
                    var pixelFormat;
                    var alphaMode;
                    var dpiX;
                    var dpiY;
                    var outputFilename;
                    var scaleFactor = 1.0;
                    var displayProperties = MS.Entertainment.Utilities.getDisplayProperties();
                    switch (displayProperties.resolutionScale) {
                        case Windows.Graphics.Display.ResolutionScale.scale100Percent:
                            break;
                        case Windows.Graphics.Display.ResolutionScale.scale140Percent:
                            scaleFactor = 1.4;
                            break;
                        case Windows.Graphics.Display.ResolutionScale.scale180Percent:
                            scaleFactor = 1.8;
                            break;
                        default:
                            MS.Entertainment.fail("Unknown scale factor in tile manager. Scale: " + displayProperties.resolutionScale);
                            break
                    }
                    return Windows.Graphics.Imaging.BitmapDecoder.createAsync(input).then(function convertBlob(decoder) {
                            var transform = new Windows.Graphics.Imaging.BitmapTransform;
                            transform.scaledHeight = decoder.orientedPixelHeight;
                            transform.scaledWidth = decoder.orientedPixelWidth;
                            transform.rotation = Windows.Graphics.Imaging.BitmapRotation.none;
                            pixelFormat = decoder.bitmapPixelFormat;
                            alphaMode = decoder.bitmapAlphaMode;
                            dpiX = decoder.dpiX;
                            dpiY = decoder.dpiY;
                            return decoder.getPixelDataAsync(pixelFormat, alphaMode, transform, Windows.Graphics.Imaging.ExifOrientationMode.respectExifOrientation, Windows.Graphics.Imaging.ColorManagementMode.colorManageToSRgb)
                        }.bind(this)).then(function pixelProviderFunction(pixelProvider) {
                            pixels = pixelProvider.detachPixelData();
                            return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
                        }.bind(this)).then(function getfileStream(file) {
                            return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
                        }.bind(this)).then(function writeFile(fileStream) {
                            output = fileStream;
                            return Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId, fileStream)
                        }.bind(this)).then(function encodeFunction(encoder) {
                            encoder.setPixelData(pixelFormat, alphaMode, width * scaleFactor, height * scaleFactor, dpiX, dpiY, pixels);
                            return encoder.flushAsync()
                        }.bind(this)).then(function closeStreams() {
                            input && input.close();
                            output && output.close();
                            return true
                        }.bind(this), function(error) {
                            this._canvasImageErrorHandler(error, input, output);
                            return false
                        }.bind(this))
                }, _canvasImageErrorHandler: function _canvasImageErrorHandler(error, input, output) {
                    if (input)
                        input.close();
                    if (output)
                        output.close();
                    MS.Entertainment.Framework.assert(false, "Failure while creating peek image file: " + error)
                }, _loadNonPeekTiles: function _loadNonPeekTiles(serviceAvailable) {
                    var Notifications = Windows.UI.Notifications;
                    try {
                        var squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate);
                        var largeSquareTileXml;
                        if (this._largeSquareTemplate)
                            largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                        this._setupWideTemplate(serviceAvailable).done(function finish(wideTileXml) {
                            this._setupTileTextAndCompleteNotification(wideTileXml, squareTileXml, largeSquareTileXml, serviceAvailable)
                        }.bind(this), function failureToSetupTile() {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating non peek images")
                        })
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating non peek images: " + exception)
                    }
                }, _setupWideTemplate: function _setupWideTemplate(serviceAvailable) {
                    var wideTileXml;
                    var wideTileImageAttributes;
                    var Notifications = Windows.UI.Notifications;
                    var completion;
                    var returnPromise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    if (this._nowPlayingImageUri !== String.empty && serviceAvailable)
                        this._testImageExists(this._nowPlayingImageUri, function imageTestSuccess() {
                            this._createNonPeekImage().then(function nonPeekImageCreated() {
                                if (this._nowPlayingImageUri === this._lastSavedThumbnailImage) {
                                    if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._widePosterTemplate);
                                        this._nowPlayingSubTitle = "\r\n" + String.load(String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo)
                                    }
                                    else {
                                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideSquareTemplate);
                                        this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_XBOX_MUSIC_XENON, String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo)
                                    }
                                    wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                                    wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._thumbnailImageFileName);
                                    completion(wideTileXml)
                                }
                                else {
                                    if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                        this._nowPlayingTertiaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                                    }
                                    else {
                                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                        this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                                    }
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                    completion(wideTileXml)
                                }
                            }.bind(this))
                        }.bind(this), function imageTestFailed() {
                            if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                this._nowPlayingTertiaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                            }
                            else {
                                wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO)
                            }
                            wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                            completion(wideTileXml)
                        }.bind(this));
                    else if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                        if (serviceAvailable)
                            this._nowPlayingTertiaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                        else {
                            this._nowPlayingTertiaryTitle = String.load(String.id.IDS_MOGO_RESUME);
                            this._nowPlayingQuaternaryTitle = String.empty
                        }
                        completion(wideTileXml)
                    }
                    else {
                        wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                        if (serviceAvailable)
                            this._nowPlayingQuaternaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING_XBOXMUSIC, String.id.IDS_MOGO_NOW_PLAYING_XBOXVIDEO);
                        else {
                            this._nowPlayingTertiaryTitle = this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING, String.id.IDS_MOGO_RESUME);
                            this._nowPlayingQuaternaryTitle = String.empty
                        }
                        completion(wideTileXml)
                    }
                    return returnPromise
                }, _loadTextOnAppMode: function _loadTextOnAppMode(musicString, videoString) {
                    if (MS.Entertainment.Utilities.isVideoApp)
                        return String.load(videoString);
                    else if (MS.Entertainment.Utilities.isMusicApp)
                        return String.load(musicString)
                }, _setupTileTextAndCompleteNotification: function _setupTileTextAndCompleteNotification(wideTileXml, squareTileXml, largeSquareTileXml, serviceAvailable) {
                    try {
                        if (!this._nowPlayingTitle) {
                            if (this._tileUpdater)
                                this._tileUpdater.clear();
                            return
                        }
                        if (!largeSquareTileXml)
                            largeSquareTileXml = squareTileXml;
                        var Notifications = Windows.UI.Notifications;
                        wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                        squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                        largeSquareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                        var wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                        var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                        var largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                        squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                        squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._loadTextOnAppMode(String.id.IDS_MOGO_NOW_PLAYING, String.id.IDS_MOGO_RESUME))));
                        if (largeSquareTileTextAttributes.length === 9) {
                            if (serviceAvailable)
                                largeSquareTileTextAttributes[0].appendChild(largeSquareTileXml.createTextNode(this._xboxLogo));
                            largeSquareTileTextAttributes[6].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._getLargeTileStaticText())));
                            largeSquareTileTextAttributes[7].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                            largeSquareTileTextAttributes[8].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingSubTitle)))
                        }
                        else if ((largeSquareTileTextAttributes.length === 4) && (largeSquareTileXml !== squareTileXml)) {
                            largeSquareTileTextAttributes[0].appendChild(largeSquareTileXml.createTextNode(this._xboxLogo));
                            largeSquareTileTextAttributes[1].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._getLargeTileStaticText())));
                            largeSquareTileTextAttributes[2].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                            largeSquareTileTextAttributes[3].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingSubTitle)))
                        }
                        wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTitle)));
                        wideTileTextAttributes[1].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingSubTitle)));
                        if (wideTileTextAttributes.length > 2) {
                            wideTileTextAttributes[2].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingTertiaryTitle)));
                            wideTileTextAttributes[3].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(this._nowPlayingQuaternaryTitle)))
                        }
                        var squareTileXmlNode = wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true);
                        if (largeSquareTileXml != squareTileXml) {
                            var largeSquareTileNode = wideTileXml.importNode(largeSquareTileXml.getElementsByTagName("binding")[0], true);
                            wideTileXml.getElementsByTagName("visual")[0].appendChild(largeSquareTileNode)
                        }
                        wideTileXml.getElementsByTagName("visual")[0].appendChild(squareTileXmlNode);
                        var tileNotification = new Notifications.TileNotification(wideTileXml);
                        tileNotification.tag = this._nowPlayingTileTag;
                        var tileExpiryTime = null;
                        if (MS.Entertainment.Utilities.isVideoApp)
                            tileExpiryTime = (this._playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing) ? this._videoPausedExpiryTime : this._videoPlayingExpiryTime;
                        else if (MS.Entertainment.Utilities.isMusicApp)
                            tileExpiryTime = (this._playbackSession.currentTransportState !== MS.Entertainment.Platform.Playback.TransportState.playing) ? this._musicPausedExpiryTime : this._musicPlayingExpiryTime;
                        if (tileExpiryTime) {
                            var currentTime = new Date;
                            var expiryTime = new Date(currentTime.getTime() + tileExpiryTime * 1000);
                            tileNotification.expirationTime = expiryTime
                        }
                        if (this._tileUpdater)
                            this._tileUpdater.update(tileNotification)
                    }
                    catch(exception) {
                        MS.Entertainment.Framework.fail("Failure in tilemanager while finishing notification: " + exception)
                    }
                }, _getLargeTileStaticText: function _getLargeTileStaticText() {
                    var stringId = String.id.IDS_MOGO_NOW_PLAYING;
                    if (MS.Entertainment.Utilities.isVideoApp)
                        stringId = String.id.IDS_MOGO_RESUME;
                    return String.load(stringId)
                }, _testImageExists: function _testImageExists(imageUri, success, failure) {
                    var imageLoader = new Image;
                    imageLoader.addEventListener("load", function imageLoaded(event) {
                        this._loaded = true;
                        success(imageUri)
                    }.bind(this), false);
                    imageLoader.addEventListener("error", function imageError(event) {
                        if (failure)
                            failure(imageUri)
                    }.bind(this), false);
                    imageLoader.setAttribute("src", imageUri)
                }, _updateMetadata: function _updateMetadata(forceUpdate) {
                    var promisesToJoin = [];
                    if (this._playbackSession && this._playbackSession.currentMedia) {
                        promisesToJoin.push(this._getBackgroundImage());
                        if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia)) {
                            if (this._playbackSession.currentMedia.serviceId && this._playbackSession.currentMedia.serviceId !== this.EMPTY_GUID && this._playbackSession.currentMedia.serviceId.indexOf && this._playbackSession.currentMedia.serviceId.indexOf("-") > -1) {
                                promisesToJoin.push(MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this._playbackSession.currentMedia, 172, 258, null, null, null, MS.Entertainment.ImageContentType.png).then(function loadImage(uri) {
                                    if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.movie && uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.artist)
                                        this._nowPlayingImageUri = uri;
                                    else
                                        this._nowPlayingImageUri = String.empty
                                }.bind(this)));
                                this._joinedImageUrlPromises = WinJS.Promise.join(promisesToJoin)
                            }
                        }
                        else if (MS.Entertainment.Utilities.isVideoApp && (!this._playbackSession.currentMedia.serviceId || this._playbackSession.currentMedia.serviceId === this.EMPTY_GUID)) {
                            this._nowPlayingImageUri = String.empty;
                            this._joinedImageUrlPromises = WinJS.Promise.join(WinJS.Promise.as())
                        }
                        else {
                            promisesToJoin.push(MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(this._playbackSession.currentMedia, 310, 310, null, null, null, MS.Entertainment.ImageContentType.png).then(function loadImage(uri) {
                                if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.movie && uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.artist)
                                    this._nowPlayingImageUri = uri;
                                else
                                    this._nowPlayingImageUri = String.empty
                            }.bind(this)));
                            this._joinedImageUrlPromises = WinJS.Promise.join(promisesToJoin)
                        }
                    }
                    else {
                        this._peekImageUri = null;
                        this._nowPlayingImageUri = String.empty;
                        this._joinedImageUrlPromises = WinJS.Promise.as()
                    }
                    if (forceUpdate || this._playbackSession && this._playbackSession.currentMedia && this._playbackSession.currentMedia.name != this._lastItemTitle) {
                        this._startUpdateTimer();
                        this._lastItemTitle = this._playbackSession.currentMedia.name
                    }
                    if (this._playbackSession && this._playbackSession.currentMedia)
                        this._setupStrings();
                    else
                        this._nowPlayingTitle = String.empty
                }, _getBackgroundImage: function _getBackgroundImage() {
                    var result = WinJS.Promise.as();
                    var convertedMediaItem = null;
                    this._peekImageUri = null;
                    switch (this._playbackSession.currentMedia.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.playlist:
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                            convertedMediaItem = MS.Entertainment.Data.augment({
                                id: this._playbackSession.currentMedia.artistServiceId, libraryId: this._playbackSession.currentMedia.artistId, name: this._playbackSession.currentMedia.artistName
                            }, MS.Entertainment.Data.Augmenter.Marketplace.Music.Artist);
                            if (WinJS.Utilities.getMember("MS.Entertainment.UI.Controls.MusicVisualization"))
                                this._peekImageUri = MS.Entertainment.UI.Controls.MusicVisualization.currentLargeArt;
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(this._playbackSession.currentMedia) && this._playbackSession.currentMedia.seriesId)
                                convertedMediaItem = MS.Entertainment.Data.augment({
                                    id: this._playbackSession.currentMedia.seriesId, libraryId: this._playbackSession.currentMedia.seriesLibraryId, title: {$value: this._playbackSession.currentMedia.seriesTitle}
                                }, MS.Entertainment.Data.Augmenter.Marketplace.TVSeries);
                            else
                                convertedMediaItem = this._playbackSession.currentMedia;
                            break;
                        default:
                            convertedMediaItem = this._playbackSession.currentMedia;
                            break
                    }
                    if (!this._peekImageUri) {
                        var backgroundUri = this._playbackSession.currentMedia.backgroundImageUri;
                        var currentArtist = WinJS.Utilities.getMember("_playbackSession.currentMedia.artist", this);
                        if (!backgroundUri && currentArtist)
                            result = currentArtist.hydrate().then(function hydrationPromise() {
                                backgroundUri = currentArtist.imageResizeUri;
                                var imageSize = {
                                        x: 310, y: 310
                                    };
                                if (backgroundUri) {
                                    var imageRequestSize = MS.Entertainment.UI.Shell.ImageLoader.getServiceImageRequestSize(imageSize);
                                    var imageUrl = MS.Entertainment.Utilities.UriFactory.appendQuery(backgroundUri, {
                                            format: MS.Entertainment.ImageFormat.png, width: imageRequestSize.x, height: imageRequestSize.y
                                        });
                                    return MS.Entertainment.UI.Shell.ImageLoader.cacheImage(imageUrl, String.empty).then(function cacheImage(url) {
                                            this._peekImageUri = url
                                        }.bind(this), function useDefaultImage(error) {
                                            MS.Entertainment.Framework.fail(error);
                                            this._peekImageUri = String.empty
                                        }.bind(this))
                                }
                            }.bind(this))
                    }
                    return result.then(function() {
                            return this._peekImageUri
                        }.bind(this))
                }, _setupStrings: function _setupStrings() {
                    this._nowPlayingTitle = String.empty;
                    this._nowPlayingSubTitle = String.empty;
                    this._nowPlayingTertiaryTitle = String.empty;
                    this._nowPlayingQuaternaryTitle = String.empty;
                    if (this._playbackSession.currentMedia.mediaType === Microsoft.Entertainment.Queries.ObjectType.video)
                        if (this._playbackSession.currentMedia.videoType === Microsoft.Entertainment.Queries.VideoType.tvEpisode) {
                            this._nowPlayingTitle = this._playbackSession.currentMedia.seriesTitle;
                            if (this._playbackSession.currentMedia.seasonNumber && this._playbackSession.currentMedia.episodeNumber) {
                                this._nowPlayingSubTitle = String.load(String.id.IDS_TV_NUMBERED_EPISODE_SEASON_NAME).format(this._playbackSession.currentMedia.seasonNumber, this._playbackSession.currentMedia.episodeNumber);
                                this._nowPlayingTertiaryTitle = "\r\n"
                            }
                            else
                                this._nowPlayingSubTitle = "\r\n"
                        }
                        else {
                            this._nowPlayingTitle = this._playbackSession.currentMedia.name;
                            this._nowPlayingSubTitle = "\r\n"
                        }
                    else if (this._playbackSession.currentMedia.artistName) {
                        this._nowPlayingTitle = this._playbackSession.currentMedia.artistName;
                        this._nowPlayingSubTitle = this._playbackSession.currentMedia.name;
                        this._nowPlayingTertiaryTitle = "\r\n";
                        MS.Entertainment.Platform.Playback.Etw.traceString("tileManager_setupStrings::Assigned trackname and artistname to tilemanager:" + this._playbackSession.currentMedia.name)
                    }
                }
        }, {
            xboxLogoClassic: "\u26dd\ud83c\udfae", xboxLogo: "\uD83D\uDD32\uD83C\uDFAE"
        }), initializeTileManager: function initializeTileManager() {
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.tileManager)
            }
    });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.tileManager, function TileManagerFactory() {
        return new MS.Entertainment.Framework.TileManager
    })
})()
