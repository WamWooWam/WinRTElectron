/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(Framework) {
            var VideoTileManager = (function() {
                    function VideoTileManager() {
                        var _this = this;
                        this._xboxLogo = "\u26dd\ud83c\udfae";
                        this._tileCleared = null;
                        this._peekLargeImageFileName = "tileLargeSquareImage.jpeg";
                        this._tileWideImageFileName = "tileWideImage.jpeg";
                        this._nowPlayingTileTag = "nowplaying";
                        this._clearTileByTagExpiryTime = 15;
                        this.EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
                        this._expiryTime = 30 * 60;
                        this._defaultLargeSquareTileSize = 310;
                        if (Windows.UI.Notifications.TileTemplateType.tileSquare310x310TextList01)
                            this._xboxLogo = "\uD83D\uDD32\uD83C\uDFAE";
                        this.tvGradient = "ms-appx:///images/tiles/Video_Tv_Resume_2x2." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                        this.movieGradient = "ms-appx:///images/tiles/Video_Movie_Resume_2x2." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                        this.noMetadataGradient = "ms-appx:///images/tiles/Video_Tv_Resume_2x2." + MS.Entertainment.Utilities.getPackageImageFileExtension();
                        this._wideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText04;
                        this._wideSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText02;
                        this._widePosterTemplate = Windows.UI.Notifications.TileTemplateType.tileWideSmallImageAndText05;
                        this._wideNoImageTemplate = Windows.UI.Notifications.TileTemplateType.tileWideText01;
                        this._squareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareText03;
                        this._defaultWideTemplate = Windows.UI.Notifications.TileTemplateType.tileWideImage;
                        this._defaultSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquareImage;
                        this._largeSquareTemplate = Windows.UI.Notifications.TileTemplateType.tileSquare310x310TextList01;
                        this._largeSquarePeekTemplate = Windows.UI.Notifications.TileTemplateType.tileSquare310x310ImageAndTextOverlay03;
                        this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        WinJS.Promise.timeout(2500).done(function() {
                            try {
                                _this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
                                _this._tileUpdater.enableNotificationQueue(true);
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.videoLiveTile)) {
                                    var serviceConfig = (new Microsoft.Entertainment.Configuration.ConfigurationManager).service;
                                    var uri = MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_LiveTile, serviceConfig.videoAppLiveTileSuffix);
                                    _this._tileUpdater.startPeriodicUpdate(new Windows.Foundation.Uri(uri), Windows.UI.Notifications.PeriodicUpdateRecurrence.daily)
                                }
                                else
                                    _this._tileUpdater.stopPeriodicUpdate()
                            }
                            catch(err) {
                                MS.Entertainment.Framework.fail("Failure in calls to TileUpdateManager: " + err)
                            }
                            _this.initialize()
                        })
                    }
                    VideoTileManager.prototype.initialize = function() {
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                            var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                            this._playbackSession = sessionMgr.primarySession;
                            if (!this._playbackSessionBindings)
                                this._playbackSessionBindings = WinJS.Binding.bind(this._playbackSession, {
                                    currentMedia: this.updateMetadata.bind(this), currentTransportState: this.transportStateChanged.bind(this)
                                })
                        }
                    };
                    VideoTileManager.prototype.clearTile = function() {
                        try {
                            if (!this._tileUpdater)
                                this._tileUpdater = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
                            this._lastItemTitle = null;
                            if (this._tileCleared !== true) {
                                this._tileUpdater.clear();
                                try {
                                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                    if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)) {
                                        this.resetTileToDefaultNotifications();
                                        this._tileCleared = true
                                    }
                                }
                                catch(err) {
                                    try {
                                        MS.Entertainment.Framework.assert(false, "Failure in clearTile call to resetTileToDefaultNotifications: " + err);
                                        this._tileUpdater.clear()
                                    }
                                    catch(ignoreErr) {}
                                }
                            }
                        }
                        catch(err) {
                            this._lastItemTitle = null;
                            MS.Entertainment.Framework.assert(false, "Failure in calls to TileUpdateManager: " + err)
                        }
                    };
                    VideoTileManager.prototype.resetTileToDefaultNotifications = function() {
                        var Notifications = Windows.UI.Notifications;
                        var tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideText09);
                        var tileVisualElements = tileXml.getElementsByTagName("visual");
                        tileVisualElements[0].setAttribute("branding", "name");
                        var tileTextAttributes = tileXml.getElementsByTagName("text");
                        tileTextAttributes[0].appendChild(tileXml.createTextNode(this._xboxLogo));
                        tileTextAttributes[1].appendChild(tileXml.createTextNode(String.load(String.id.IDS_VIDEO_TILE_NEW_MOVIES_AMP_TV)));
                        var squareTileXml = null;
                        try {
                            squareTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareText02)
                        }
                        catch(ignoreErr) {}
                        if (!squareTileXml)
                            return;
                        var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                        squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(this._xboxLogo));
                        squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(String.load(String.id.IDS_VIDEO_TILE_NEW_MOVIES_AMP_TV)));
                        var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
                        tileXml.getElementsByTagName("visual").item(0).appendChild(node);
                        if (Notifications.TileTemplateType.tileSquare310x310TextList03) {
                            var largeTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquare310x310TextList03);
                            var largeTileTextAttributes = largeTileXml.getElementsByTagName("text");
                            largeTileTextAttributes[0].appendChild(largeTileXml.createTextNode(this._xboxLogo));
                            largeTileTextAttributes[5].appendChild(largeTileXml.createTextNode(String.load(String.id.IDS_VIDEO_TILE_NEW_MOVIES_AMP_TV)));
                            node = tileXml.importNode(largeTileXml.getElementsByTagName("binding").item(0), true);
                            tileXml.getElementsByTagName("visual").item(0).appendChild(node)
                        }
                        var tileNotification = new Notifications.TileNotification(tileXml);
                        tileNotification.tag = "info";
                        this._tileUpdater.update(tileNotification);
                        tileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileWideImage);
                        tileVisualElements = tileXml.getElementsByTagName("visual");
                        tileVisualElements[0].setAttribute("branding", "name");
                        var tileImageAttributes = tileXml.getElementsByTagName("image");
                        tileImageAttributes[0].setAttribute("src", "ms-appx:///images/tiles/XBL_VIDEO_310x150_C.png");
                        tileImageAttributes[0].setAttribute("alt", String.load(String.id.IDS_VIDEO_TILE_XBOX_VIDEO_TC));
                        squareTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquareImage);
                        var squareTileImageAttributes = squareTileXml.getElementsByTagName("image");
                        squareTileImageAttributes[0].setAttribute("src", "ms-appx:///images/tiles/XBL_VIDEO_150x150_A.png");
                        squareTileImageAttributes[0].setAttribute("alt", String.load(String.id.IDS_VIDEO_TILE_XBOX_VIDEO_TC));
                        node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
                        tileXml.getElementsByTagName("visual").item(0).appendChild(node);
                        if (Notifications.TileTemplateType.tileSquare310x310Image) {
                            var largeTileXml = Notifications.TileUpdateManager.getTemplateContent(Notifications.TileTemplateType.tileSquare310x310Image);
                            var largeTileImageAttributes = largeTileXml.getElementsByTagName("image");
                            largeTileImageAttributes[0].setAttribute("src", "ms-appx:///images/tiles/XBL_VIDEO_310x310_A.png");
                            largeTileImageAttributes[0].setAttribute("alt", String.load(String.id.IDS_VIDEO_TILE_XBOX_VIDEO_TC));
                            node = tileXml.importNode(largeTileXml.getElementsByTagName("binding").item(0), true);
                            tileXml.getElementsByTagName("visual").item(0).appendChild(node)
                        }
                        tileNotification = new Notifications.TileNotification(tileXml);
                        tileNotification.tag = "default";
                        this._tileUpdater.update(tileNotification)
                    };
                    VideoTileManager.prototype.updateTile = function() {
                        this.updateMetadata()
                    };
                    VideoTileManager.prototype.updateMetadata = function() {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        var serviceAvailable = true;
                        if (!(featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)))
                            serviceAvailable = false;
                        if (this._playbackSession && this._playbackSession.currentMedia) {
                            if (this._playbackSession.currentMedia.name !== this._lastItemTitle) {
                                if (!serviceAvailable || (!this._playbackSession.currentMedia.serviceId || this._playbackSession.currentMedia.serviceId === this.EMPTY_GUID))
                                    this.displayNoMetadataTile(this._playbackSession.currentMedia);
                                else if (MS.Entertainment.Platform.PlaybackHelpers.isMovie(this._playbackSession.currentMedia))
                                    this.displayMovieTile(this._playbackSession.currentMedia);
                                else
                                    this.displayTvTile(this._playbackSession.currentMedia);
                                this._lastItemTitle = this._playbackSession.currentMedia.name;
                                this._tileCleared = false
                            }
                        }
                        else
                            this.clearTile()
                    };
                    VideoTileManager.prototype.displayTvTile = function(currentMediaItem) {
                        MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(currentMediaItem, 310, 310, null, null, null, MS.Entertainment.ImageContentType.png).done(function loadImage(uri) {
                            if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.tvEpisode)
                                this.completeTvTile(currentMediaItem, uri);
                            else
                                this.completeTvTile(currentMediaItem)
                        }.bind(this))
                    };
                    VideoTileManager.prototype.completeTvTile = function(currentMediaItem, imageUri) {
                        var Notifications = Windows.UI.Notifications;
                        try {
                            var bigImagePromise = WinJS.Promise.as();
                            if (imageUri)
                                bigImagePromise = this.createComposedLargePeekImage(imageUri, this.tvGradient);
                            bigImagePromise.done(function finishTvtile() {
                                var currentMediaName = currentMediaItem.seriesTitle;
                                var resumeString = String.load(String.id.IDS_MOGO_RESUME);
                                var seasonEpisodeInfoString = String.empty;
                                if (this._playbackSession && this._playbackSession.currentMedia && this._playbackSession.currentMedia.seasonNumber && this._playbackSession.currentMedia.episodeNumber)
                                    seasonEpisodeInfoString = String.load(String.id.IDS_TV_NUMBERED_EPISODE_SEASON_NAME).format(this._playbackSession.currentMedia.seasonNumber, this._playbackSession.currentMedia.episodeNumber);
                                var squareTileXml = null;
                                try {
                                    squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate)
                                }
                                catch(ignoreErr) {}
                                if (!squareTileXml)
                                    return;
                                squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                                if (squareTileTextAttributes.length < 2)
                                    return;
                                squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaName)));
                                var wideTileXml = null;
                                if (imageUri) {
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideSquareTemplate);
                                    var wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                                    wideTileImageAttributes[0].setAttribute("src", imageUri)
                                }
                                else
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                var wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                                wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaName)));
                                if (seasonEpisodeInfoString)
                                    wideTileTextAttributes[1].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(seasonEpisodeInfoString)));
                                wideTileTextAttributes[3].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(String.load(String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo))));
                                wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true));
                                var largeSquareTileXml;
                                var largeSquareTileTextAttributes;
                                if (this._largeSquareTemplate) {
                                    if (this._lastSavedLargePeekImage) {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquarePeekTemplate);
                                        var largeSquareTileImageAttributes = largeSquareTileXml.getElementsByTagName("image");
                                        largeSquareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekLargeImageFileName);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[0].appendChild(largeSquareTileXml.createTextNode(this._xboxLogo));
                                        largeSquareTileTextAttributes[1].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[2].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaName)));
                                        if (seasonEpisodeInfoString)
                                            largeSquareTileTextAttributes[3].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(seasonEpisodeInfoString)))
                                    }
                                    else {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[6].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[7].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaName)));
                                        if (seasonEpisodeInfoString)
                                            largeSquareTileTextAttributes[8].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(seasonEpisodeInfoString)))
                                    }
                                    largeSquareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                    wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(largeSquareTileXml.getElementsByTagName("binding")[0], true))
                                }
                                var tileNotification = new Notifications.TileNotification(wideTileXml);
                                tileNotification.tag = this._nowPlayingTileTag;
                                var currentTime = new Date;
                                var expiryTime = new Date(currentTime.getTime() + this._expiryTime * 1000);
                                tileNotification.expirationTime = expiryTime;
                                if (this._tileUpdater)
                                    try {
                                        this._tileUpdater.clear();
                                        this._tileUpdater.update(tileNotification)
                                    }
                                    catch(ignoreErr) {}
                            }.bind(this))
                        }
                        catch(exception) {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating tv tile: " + exception)
                        }
                    };
                    VideoTileManager.prototype.createComposedLargePeekImage = function(imageUri, gradientFile) {
                        var signal = new MS.Entertainment.UI.Framework.Signal;
                        try {
                            if (imageUri !== this._lastSavedLargePeekImage) {
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
                                    try {
                                        context.drawImage(peekImage, peekImageX, 0, peekImageWidth, peekImageHeight);
                                        var gradient = new Image;
                                        gradient.onload = function loadGradient() {
                                            try {
                                                context.drawImage(gradient, 0, 0, largeCanvas.width, largeCanvas.height);
                                                this.createTileImageFile(this._peekLargeImageFileName, largeCanvas.msToBlob(), scaleFactor).done(function(success) {
                                                    if (success)
                                                        this._lastSavedLargePeekImage = imageUri;
                                                    signal.complete()
                                                }.bind(this))
                                            }
                                            catch(exception) {
                                                MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                                this._lastSavedLargePeekImage = null;
                                                signal.complete()
                                            }
                                        }.bind(this);
                                        gradient.src = gradientFile
                                    }
                                    catch(exception) {
                                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                        this._lastSavedLargePeekImage = null;
                                        signal.complete()
                                    }
                                }.bind(this);
                                peekImage.src = imageUri
                            }
                            else
                                signal.complete()
                        }
                        catch(exception) {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                            this._lastSavedLargePeekImage = null;
                            signal.complete()
                        }
                        return signal.promise
                    };
                    VideoTileManager.prototype.createWideTileImage = function(imageUri) {
                        var signal = new MS.Entertainment.UI.Framework.Signal;
                        try {
                            if (imageUri !== this._lastSavedWideTileImage) {
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
                                    var peekImageHeight = largeCanvas.height;
                                    var peekImageWidth = largeCanvas.width;
                                    try {
                                        context.drawImage(peekImage, 0, 0, peekImageWidth, peekImageHeight);
                                        this.createTileImageFile(this._tileWideImageFileName, largeCanvas.msToBlob(), scaleFactor).done(function(success) {
                                            if (success)
                                                this._lastSavedWideTileImage = imageUri;
                                            signal.complete()
                                        }.bind(this))
                                    }
                                    catch(exception) {
                                        MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                                        this._lastSavedWideTileImage = null;
                                        signal.complete()
                                    }
                                }.bind(this);
                                peekImage.src = imageUri
                            }
                            else
                                signal.complete()
                        }
                        catch(exception) {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating peek images: " + exception);
                            this._lastSavedWideTileImage = null;
                            signal.complete()
                        }
                        return signal.promise
                    };
                    VideoTileManager.prototype.displayMovieTile = function(currentMediaItem) {
                        MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(currentMediaItem, 234, 320, null, null, null, MS.Entertainment.ImageContentType.png).done(function loadImage(uri) {
                            if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.movie)
                                this.completeMovieTile(currentMediaItem, uri);
                            else
                                this.completeMovieTile(currentMediaItem)
                        }.bind(this))
                    };
                    VideoTileManager.prototype.completeMovieTile = function(currentMediaItem, imageUri) {
                        var Notifications = Windows.UI.Notifications;
                        try {
                            var bigImagePromise = WinJS.Promise.as();
                            if (imageUri)
                                bigImagePromise = this.createComposedLargePeekImage(imageUri, this.movieGradient);
                            bigImagePromise.done(function finishMovieTile() {
                                var resumeString = String.load(String.id.IDS_MOGO_RESUME);
                                var squareTileXml = null;
                                try {
                                    squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate)
                                }
                                catch(ignoreErr) {}
                                if (!squareTileXml)
                                    return;
                                squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                                if (squareTileTextAttributes.length < 2)
                                    return;
                                squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)));
                                var wideTileXml = null;
                                var wideTileTextAttributes = null;
                                if (imageUri) {
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._widePosterTemplate);
                                    var wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                                    wideTileImageAttributes[0].setAttribute("src", imageUri);
                                    wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                                    wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)));
                                    wideTileTextAttributes[1].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML("\r\n" + String.load(String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo))))
                                }
                                else {
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                    wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                                    wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)));
                                    wideTileTextAttributes[2].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(String.load(String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo))))
                                }
                                wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true));
                                var largeSquareTileXml;
                                if (this._largeSquareTemplate) {
                                    largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                                    var largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                    if (this._lastSavedLargePeekImage) {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquarePeekTemplate);
                                        var largeSquareTileImageAttributes = largeSquareTileXml.getElementsByTagName("image");
                                        largeSquareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekLargeImageFileName);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[0].appendChild(largeSquareTileXml.createTextNode(this._xboxLogo));
                                        largeSquareTileTextAttributes[1].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[2].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)))
                                    }
                                    else {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[6].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[7].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)))
                                    }
                                    largeSquareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                    wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(largeSquareTileXml.getElementsByTagName("binding")[0], true))
                                }
                                var tileNotification = new Notifications.TileNotification(wideTileXml);
                                tileNotification.tag = this._nowPlayingTileTag;
                                var currentTime = new Date;
                                var expiryTime = new Date(currentTime.getTime() + this._expiryTime * 1000);
                                tileNotification.expirationTime = expiryTime;
                                if (this._tileUpdater)
                                    try {
                                        this._tileUpdater.clear();
                                        this._tileUpdater.update(tileNotification)
                                    }
                                    catch(ignoreErr) {}
                            }.bind(this))
                        }
                        catch(exception) {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating movie tile: " + exception)
                        }
                    };
                    VideoTileManager.prototype.displayNoMetadataTile = function(currentMediaItem) {
                        MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl(currentMediaItem, 310, 310, null, null, null, MS.Entertainment.ImageContentType.png).done(function loadImage(uri) {
                            if (uri !== MS.Entertainment.UI.Shell.ImageLoader.MediaDefaultUrls.otherVideo)
                                this.completeNoMetadataTile(currentMediaItem, uri);
                            else
                                this.completeNoMetadataTile(currentMediaItem)
                        }.bind(this))
                    };
                    VideoTileManager.prototype.completeNoMetadataTile = function(currentMediaItem, imageUri) {
                        var Notifications = Windows.UI.Notifications;
                        try {
                            var bigImagePromise = WinJS.Promise.as();
                            var wideImagePromise = WinJS.Promise.as();
                            if (imageUri) {
                                bigImagePromise = this.createComposedLargePeekImage(imageUri, this.noMetadataGradient);
                                wideImagePromise = this.createWideTileImage(imageUri)
                            }
                            var imagePromises = [bigImagePromise, wideImagePromise];
                            WinJS.Promise.join(imagePromises).done(function finishNoMetadataTile() {
                                var resumeString = String.load(String.id.IDS_MOGO_RESUME);
                                var squareTileXml = null;
                                try {
                                    squareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._squareTemplate)
                                }
                                catch(ignoreErr) {
                                    return
                                }
                                if (!squareTileXml)
                                    return;
                                try {
                                    squareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                    var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
                                    if (squareTileTextAttributes.length < 2)
                                        return;
                                    squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                    squareTileTextAttributes[1].appendChild(squareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)))
                                }
                                catch(ignoreErr) {
                                    return
                                }
                                var wideTileXml = null;
                                if (imageUri) {
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideSquareTemplate);
                                    var wideTileImageAttributes = wideTileXml.getElementsByTagName("image");
                                    wideTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._tileWideImageFileName)
                                }
                                else
                                    wideTileXml = Notifications.TileUpdateManager.getTemplateContent(this._wideNoImageTemplate);
                                wideTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                var wideTileTextAttributes = wideTileXml.getElementsByTagName("text");
                                wideTileTextAttributes[0].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                wideTileTextAttributes[1].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)));
                                wideTileTextAttributes[3].appendChild(wideTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(String.load(String.id.IDS_MOGO_XBOX_VIDEO_XENON).format(this._xboxLogo))));
                                wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(squareTileXml.getElementsByTagName("binding")[0], true));
                                var largeSquareTileXml;
                                var largeSquareTileTextAttributes;
                                if (this._largeSquareTemplate) {
                                    if (this._lastSavedLargePeekImage) {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquarePeekTemplate);
                                        var largeSquareTileImageAttributes = largeSquareTileXml.getElementsByTagName("image");
                                        largeSquareTileImageAttributes[0].setAttribute("src", "ms-appdata:///local/" + this._peekLargeImageFileName);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[0].appendChild(largeSquareTileXml.createTextNode(this._xboxLogo));
                                        largeSquareTileTextAttributes[1].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[2].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)))
                                    }
                                    else {
                                        largeSquareTileXml = Notifications.TileUpdateManager.getTemplateContent(this._largeSquareTemplate);
                                        largeSquareTileTextAttributes = largeSquareTileXml.getElementsByTagName("text");
                                        largeSquareTileTextAttributes[6].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(resumeString)));
                                        largeSquareTileTextAttributes[7].appendChild(largeSquareTileXml.createTextNode(MS.Entertainment.Utilities.simpleEscapeHTML(currentMediaItem.name)))
                                    }
                                    largeSquareTileXml.getElementsByTagName("binding")[0].setAttribute("branding", "name");
                                    wideTileXml.getElementsByTagName("visual")[0].appendChild(wideTileXml.importNode(largeSquareTileXml.getElementsByTagName("binding")[0], true))
                                }
                                var tileNotification = new Notifications.TileNotification(wideTileXml);
                                tileNotification.tag = this._nowPlayingTileTag;
                                var currentTime = new Date;
                                var expiryTime = new Date(currentTime.getTime() + this._expiryTime * 1000);
                                tileNotification.expirationTime = expiryTime;
                                if (this._tileUpdater)
                                    try {
                                        this._tileUpdater.clear();
                                        this._tileUpdater.update(tileNotification)
                                    }
                                    catch(ignoreErr) {}
                            }.bind(this))
                        }
                        catch(exception) {
                            MS.Entertainment.Framework.fail("Failure in tilemanager while creating non peek images: " + exception)
                        }
                    };
                    VideoTileManager.prototype.createTileImageFile = function(filename, imageBlob, scaleFactor) {
                        var fileName = filename;
                        var output = null;
                        var input = imageBlob.msDetachStream();
                        var pixels;
                        var pixelFormat;
                        var alphaMode;
                        var dpiX;
                        var dpiY;
                        var outputFilename;
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
                            }.bind(this)).then(function(pixelProvider) {
                                pixels = pixelProvider.detachPixelData();
                                return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting)
                            }.bind(this)).then(function getfileStream(file) {
                                return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
                            }.bind(this)).then(function writeFile(fileStream) {
                                output = fileStream;
                                return Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId, fileStream)
                            }.bind(this)).then(function(encoder) {
                                encoder.setPixelData(pixelFormat, alphaMode, this._defaultLargeSquareTileSize * scaleFactor, this._defaultLargeSquareTileSize * scaleFactor, dpiX, dpiY, pixels);
                                return encoder.flushAsync()
                            }.bind(this)).then(function() {
                                input && input.close();
                                output && output.close();
                                return true
                            }.bind(this), function(error) {
                                this.canvasImageErrorHandler(error, input, output);
                                return false
                            }.bind(this))
                    };
                    VideoTileManager.prototype.canvasImageErrorHandler = function(error, input, output) {
                        if (input)
                            input.close();
                        if (output)
                            output.close();
                        MS.Entertainment.Framework.assert(false, "Failure while creating peek image file: " + error)
                    };
                    VideoTileManager.prototype.transportStateChanged = function() {
                        if (this._playbackSession && this._playbackSession.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                            this.clearTile();
                        else
                            this.updateMetadata()
                    };
                    return VideoTileManager
                })();
            Framework.VideoTileManager = VideoTileManager
        })(Entertainment.Framework || (Entertainment.Framework = {}));
        var Framework = Entertainment.Framework
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.tileManager, function TileManagerFactory() {
    return new MS.Entertainment.Framework.VideoTileManager
})
