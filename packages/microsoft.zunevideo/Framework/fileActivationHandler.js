/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Activation", {
        showNowDefaultDelayMS: 10000, localImageFileNameforMTC: "localImageFileForMTC.png", fileActivationHandler: function fileActivationHandler(e, isAppRunning, suppressNavigateToImmersive) {
                MS.Entertainment.Platform.Playback.Etw.traceString("File Activation Handler: start");
                try {
                    if (MS.Entertainment.Utilities.isMusicApp && MS.Entertainment.Activation.isSingleSong(e)) {
                        var fileItem = e.files[0];
                        return MS.Entertainment.Activation.startTagPlaybackForSong(fileItem, isAppRunning).then(function onStartTagPlaybackForSong() {
                                return MS.Entertainment.Activation.handoffSongToPlaybackPlatform.bind(this, fileItem, suppressNavigateToImmersive, false)
                            }, function onStartTagPlaybackForSongError() {
                                return MS.Entertainment.Activation.handoffSongToPlaybackPlatform.bind(this, fileItem, suppressNavigateToImmersive, true)
                            }).done(null, function ignoreError(){})
                    }
                    else {
                        var fileItems = e.files;
                        if (fileItems.size === 1) {
                            var fileItem = fileItems[0];
                            var fileType = String.empty;
                            if (fileItem.fileType)
                                fileType = fileItem.fileType.toLowerCase();
                            if (MS.Entertainment.Utilities.isMusicApp && MS.Entertainment.Activation._isPlaylist(fileType))
                                return MS.Entertainment.Activation._processPlaylist(fileItem, suppressNavigateToImmersive);
                            else
                                return MS.Entertainment.Activation.retrievePropertiesAndPlay(fileItems, null, suppressNavigateToImmersive)
                        }
                        else if (fileItems.size > 1)
                            return MS.Entertainment.Activation.retrievePropertiesAndPlay(fileItems, e.acquisition, suppressNavigateToImmersive);
                        else
                            return WinJS.Promise.wrap()
                    }
                }
                catch(ex) {
                    MS.Entertainment.Platform.Playback.Etw.traceString("fileActivationHandler() exception thrown: " + ex.message);
                    var title = String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE);
                    return MS.Entertainment.UI.Shell.showError(title, MS.Entertainment.Platform.Playback.Error.NS_E_WMP_ACCESS_DENIED)
                }
            }, startTagPlaybackForSong: function startTagPlaybackForSong(fileItem, isAppRunning) {
                MS.Entertainment.Platform.Playback.Etw.traceString("File Activation Handler: playLocalSong, name=" + fileItem.name);
                if (isAppRunning) {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var playbackSession = sessionMgr.primarySession;
                    if (playbackSession && playbackSession.targetTransportState === MS.Entertainment.Platform.Playback.TransportState.playing)
                        playbackSession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                    sessionMgr.clearCachedPBMState()
                }
                else if (Windows && Windows.Media && Windows.Media.MediaControl) {
                    var mediaControls = Windows.Media.MediaControl;
                    try {
                        mediaControls.addEventListener("playpausetogglepressed", function audioControlPlayPause(){}, false);
                        mediaControls.addEventListener("playpressed", function audioControlPlay(){}, false);
                        mediaControls.addEventListener("stoppressed", function audioControlStop(){}, false);
                        mediaControls.addEventListener("pausepressed", function audioControlPause(){}, false);
                        mediaControls.addEventListener("soundlevelchanged", function audioSoundlevelchanged(){}, false)
                    }
                    catch(ex) {
                        MS.Entertainment.Platform.Playback.Etw.traceString("Non-fatal exception caught in mediaControls.addEventListener: " + JSON.stringify(ex))
                    }
                }
                var beforeReady = new Date;
                return WinJS.Utilities.ready().then(function doPlayLocalSong() {
                        var delayedBy = (new Date - beforeReady);
                        MS.Entertainment.Platform.Playback.Etw.traceString("File Activation Handler: waiting for document ready for " + delayedBy + "ms");
                        var audioTag;
                        try {
                            audioTag = document.createElement("audio");
                            audioTag.setAttribute("msAudioCategory", "backgroundCapableMedia");
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            var hasSubscription = configurationManager.service.lastSignedInUserSubscription;
                            if (hasSubscription) {
                                var mediaProtectionManager = new Windows.Media.Protection.MediaProtectionManager;
                                mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemId"] = "{F4637010-03C3-42CD-B932-B48ADF3A6A54}";
                                var copyProtectionSystems = new Windows.Foundation.Collections.PropertySet;
                                copyProtectionSystems["{F4637010-03C3-42CD-B932-B48ADF3A6A54}"] = "Microsoft.Media.PlayReadyClient.PlayReadyWinRTTrustedInput";
                                mediaProtectionManager.properties["Windows.Media.Protection.MediaProtectionSystemIdMapping"] = copyProtectionSystems;
                                audioTag.msSetMediaProtectionManager(mediaProtectionManager)
                            }
                        }
                        catch(exception) {
                            var description = "playLocalSong: audioTag creation failure: " + exception.description;
                            MS.Entertainment.UI.Controls.fail(description);
                            return WinJS.Promise.wrapError(description)
                        }
                        if (MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation) {
                            MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation.pause();
                            MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation.removeAttribute("src");
                            MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation = null
                        }
                        MS.Entertainment.Platform.Playback.XPlayer.audioTagForFileActivation = audioTag;
                        var onPlaying = function onPlaying() {
                                if (MS.Entertainment.Activation.navigateToDefaultPromise)
                                    MS.Entertainment.Activation.navigateToDefaultPromise.cancel();
                                MS.Entertainment.Activation.navigateToDefaultPromise = null;
                                if (fileItem.fileType && fileItem.fileType.toLowerCase() === ".wma")
                                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayProtectedContent();
                                else
                                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioAppLaunchPlayNonProtectedContent();
                                audioTag.removeEventListener("playing", onPlaying)
                            };
                        audioTag.addEventListener("playing", onPlaying);
                        audioTag.autoplay = true;
                        audioTag.src = URL.createObjectURL(fileItem, {oneTimeOnly: false});
                        var volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                        audioTag.volume = volumeControllerService.volume;
                        audioTag.muted = volumeControllerService.mute;
                        return WinJS.Promise.wrap(audioTag)
                    })
            }, handoffSongToPlaybackPlatform: function handoffSongToPlaybackPlatform(fileItem, suppressNavigateToImmersive, autoPlay) {
                var completion = null;
                var error = null;
                var promise = new WinJS.Promise(function(c, e, p) {
                        completion = c;
                        error = e
                    });
                var mediaItem;
                var queryPromise;
                if (fileItem.path)
                    queryPromise = WinJS.Promise.timeout(400).then(function queryForTrack() {
                        var trackQuery = new MS.Entertainment.Data.Query.libraryTracks;
                        trackQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.explorerFile, Microsoft.Entertainment.Platform.AcquisitionContextType.track);
                        trackQuery.chunkSize = 1;
                        trackQuery.aggregateChunks = false;
                        trackQuery.trackUrl = fileItem.path;
                        return trackQuery.getItemsArrayAndIgnoreErrors()
                    });
                else
                    queryPromise = WinJS.Promise.wrap();
                queryPromise = queryPromise.then(function getMediaItem(trackArray) {
                    if (trackArray && trackArray.length === 1)
                        mediaItem = trackArray[0];
                    else {
                        var dataToAugment = {
                                fileItem: fileItem, musicProps: {title: fileItem.displayName}
                            };
                        mediaItem = MS.Entertainment.Data.augment(dataToAugment, MS.Entertainment.Data.Augmenter.FileActivation.Track);
                        if (mediaItem)
                            mediaItem.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.explorerFile, Microsoft.Entertainment.Platform.AcquisitionContextType.track)
                    }
                    var retrievePropertiesPromise;
                    if (mediaItem && mediaItem.fileItem)
                        retrievePropertiesPromise = MS.Entertainment.Activation.retrieveProperties(mediaItem.fileItem, Microsoft.Entertainment.Platform.AcquisitionContextType.track).then(function onGetProperties(result) {
                            if (result && result.mediaItem && mediaItem.inCollection)
                                mediaItem.imageUri = result.mediaItem.imageUri;
                            else
                                mediaItem = result.mediaItem
                        });
                    return WinJS.Promise.as(retrievePropertiesPromise)
                });
                var waitPromise = WinJS.Promise.timeout(1200);
                WinJS.Promise.join([waitPromise, queryPromise]).done(function playTrack() {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.playbackErrorDisplayService)) {
                        var displayService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.playbackErrorDisplayService);
                        if (displayService)
                            displayService.showDialogForNonCriticalErrors = true
                    }
                    MS.Entertainment.Platform.PlaybackHelpers.playMedia2(mediaItem, {
                        sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: autoPlay, showImmersive: false, preventNavigateToDefault: true, showAppBar: false, immersiveOptions: {
                                sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true
                            }, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.fileActivation, saveNowPlaying: false, playContext: {activationFilePath: mediaItem && mediaItem.activationFilePath}
                    })
                }, function playTrack_error(e) {
                    MS.Entertainment.UI.Controls.fail("fileActivationHandler: Error in playTrack" + e)
                });
                if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    MS.Entertainment.Activation.navigateToDefaultPromise = WinJS.Promise.timeout(MS.Entertainment.Activation.showNowDefaultDelayMS).then(function() {
                        if (sessionMgr.primarySession.errorDescriptor) {
                            var traceMsg = "File Activation Handler: playback failed ";
                            traceMsg += "- Player State :" + sessionMgr.primarySession.playerState;
                            traceMsg += " : Current transport State :" + sessionMgr.primarySession.currentTransportState;
                            traceMsg += " : Error Code :" + MS.Entertainment.Platform.Playback.errorToString(sessionMgr.primarySession.errorDescriptor.msExtendedCode);
                            MS.Entertainment.Platform.Playback.Etw.traceString(traceMsg)
                        }
                        error("fileActivationHandler::navigateToDefaultPromise");
                        sessionMgr.primarySession.unbind("currentTransportState", onCurrentTransportStateChanged)
                    }, function onError(){});
                    var onCurrentTransportStateChanged = function onCurrentTransportStateChanged(newValue) {
                            if (newValue === MS.Entertainment.Platform.Playback.TransportState.playing) {
                                MS.Entertainment.Platform.Playback.Etw.traceString("File Activation Handler: playback playing");
                                sessionMgr.primarySession.unbind("currentTransportState", onCurrentTransportStateChanged);
                                if (MS.Entertainment.Activation.navigateToDefaultPromise)
                                    MS.Entertainment.Activation.navigateToDefaultPromise.cancel();
                                MS.Entertainment.Activation.navigateToDefaultPromise = null;
                                if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                                    navigationService.clearBackStackOnNextNavigate(true)
                                }
                                if (suppressNavigateToImmersive)
                                    completion();
                                else
                                    MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                        sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true, completeCallback: function completeLoad() {
                                                WinJS.Promise.timeout(100).then(function complete() {
                                                    completion()
                                                })
                                            }
                                    })
                            }
                        };
                    sessionMgr.primarySession.bind("currentTransportState", onCurrentTransportStateChanged)
                }
                else
                    completion();
                return promise
            }, retrieveProperties: function retrieveProperties(fileItem, acquisitionContextType, fileOptions) {
                var promise;
                var result = {
                        unsupportedType: true, mediaItem: null, error: null
                    };
                var fileIsAudio = false;
                var fileIsVideo = false;
                var contentType = String.empty;
                var fileType = String.empty;
                var fileOptions = fileOptions || {};
                contentType = MS.Entertainment.Utilities.getMediaFileContentType(fileItem);
                fileType = MS.Entertainment.Utilities.getMediaFileFileType(fileItem);
                if (MS.Entertainment.Activation._isPlaylist(fileType))
                    return MS.Entertainment.Activation._processPlaylist(fileItem);
                else if (contentType.indexOf("audio", 0) === 0)
                    fileIsAudio = true;
                else if (contentType.indexOf("video", 0) === 0 || fileType === ".ts" || fileType === ".divx" || fileType === ".xvid" || fileType === ".mkv")
                    fileIsVideo = true;
                result.unsupportedType = !(fileIsAudio || fileIsVideo);
                if (result.unsupportedType) {
                    MS.Entertainment.UI.Actions.assert(MS.Entertainment.Utilities.isAmsterdamApp, "We managed to open a file that is neither audio nor video, this should not happen");
                    fileIsVideo = MS.Entertainment.Utilities.isVideoApp || MS.Entertainment.Utilities.isAmsterdamApp;
                    fileIsAudio = MS.Entertainment.Utilities.isMusicApp
                }
                try {
                    if ((MS.Entertainment.Utilities.isMusicApp && (fileIsAudio || (fileType === ".mp4"))) || (MS.Entertainment.Utilities.isAmsterdamApp && fileIsAudio)) {
                        if (!MS.Entertainment.Utilities.isAmsterdamApp && fileItem.path)
                            promise = WinJS.Promise.timeout().then(function queryForTrack() {
                                var trackQuery = new MS.Entertainment.Data.Query.libraryTracks;
                                trackQuery.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.explorerFile, acquisitionContextType);
                                trackQuery.trackUrl = fileItem.path;
                                trackQuery.chunkSize = 1;
                                trackQuery.aggregateChunks = false;
                                return trackQuery.getItemsArrayAndIgnoreErrors()
                            });
                        else
                            promise = WinJS.Promise.wrap();
                        promise = promise.then(function getMediaItem(trackArray) {
                            if (trackArray && trackArray.length === 1) {
                                result.mediaItem = trackArray[0];
                                return result
                            }
                            var musicPropertiesRetrievalPromise;
                            try {
                                if (!MS.Entertainment.Utilities.isAmsterdamApp)
                                    musicPropertiesRetrievalPromise = fileItem.properties.getMusicPropertiesAsync();
                                else
                                    musicPropertiesRetrievalPromise = MS.Entertainment.Data.Factory.MediaBrowser.storageItemToAugmentedItem(fileItem).hydrate()
                            }
                            catch(ex) {
                                MS.Entertainment.UI.Controls.fail("fileActivationHandler: Error in getMusicPropertiesAsync: ", ex.message);
                                MS.Entertainment.Platform.Playback.Etw.traceString("fileActivationHandler: Error in  getMusicPropertiesAsync: " + ex.message);
                                result.error = ex;
                                return WinJS.Promise.wrapError(result)
                            }
                            return musicPropertiesRetrievalPromise.then(function onRetrievedMusicProps(musicProps) {
                                    var dataToAugment = {};
                                    dataToAugment.fileItem = fileItem;
                                    dataToAugment.musicProps = musicProps;
                                    var mediaItem = MS.Entertainment.Data.augment(dataToAugment, MS.Entertainment.Data.Augmenter.FileActivation.Track);
                                    if (!mediaItem.name)
                                        mediaItem.name = fileItem.name;
                                    if (fileOptions.trackIndex >= 0)
                                        musicProps.playlistIndex = fileOptions.trackIndex;
                                    mediaItem.acquisitionData = new MS.Entertainment.Utilities.AcquisitionData(Microsoft.Entertainment.Platform.AcquisitionContext.explorerFile, Microsoft.Entertainment.Platform.AcquisitionContextType.track);
                                    result.mediaItem = mediaItem;
                                    if (!MS.Entertainment.Utilities.isAmsterdamApp)
                                        return WinJS.Promise.timeout(2000)
                                }, function onRetrievedMusicPropsError(error) {
                                    result.error = error;
                                    return WinJS.Promise.wrapError(result)
                                }).then(function onPreGetThumbnailAsync() {
                                    if (MS.Entertainment.Utilities.isAmsterdamApp)
                                        return WinJS.Promise.as(null);
                                    else
                                        fileItem.getThumbnailAsync.bind(fileItem, Windows.Storage.FileProperties.ThumbnailMode.musicView, 100)
                                }).then(function onThumbnailRetrieved(thumbnail) {
                                    if (thumbnail && result.mediaItem) {
                                        result.mediaItem.imageUri = MS.Entertainment.Data.Factory.oneTimeUseBlob(thumbnail);
                                        if (thumbnail.type !== Windows.Storage.FileProperties.ThumbnailType.icon)
                                            MS.Entertainment.Platform.Playback.makeLocalImagePromise = MS.Entertainment.Platform.Playback.makeLocalImageFileFromThumbnailPromise(thumbnail);
                                        else
                                            result.mediaItem.imageUri = null;
                                        return WinJS.Promise.as(result)
                                    }
                                    else if (result.mediaItem)
                                        return WinJS.Promise.as(result)
                                }, function onThumbnailRetrieved_Error(error) {
                                    result.error = error;
                                    return WinJS.Promise.wrapError(result)
                                })
                        })
                    }
                    else if (fileIsVideo && (MS.Entertainment.Utilities.isVideoApp || MS.Entertainment.Utilities.isAmsterdamApp)) {
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                            var appView = Windows.UI.ViewManagement.ApplicationView;
                            if (appView)
                                appView.tryUnsnap()
                        }
                        var dataToAugment = {};
                        dataToAugment.fileItem = fileItem;
                        var mediaItem = MS.Entertainment.Data.augment(dataToAugment, MS.Entertainment.Data.Augmenter.FileActivation.Video);
                        if (!mediaItem.name)
                            mediaItem.name = fileItem.name;
                        result.mediaItem = mediaItem;
                        WinJS.Promise.timeout(2000).then(function getThumbnail() {
                            if (!MS.Entertainment.Utilities.isAmsterdamApp)
                                fileItem.getThumbnailAsync(Windows.Storage.FileProperties.ThumbnailMode.videosView, MS.Entertainment.UI.Shell.ImageLoader.DefaultThumbnailSizes.video).then(function onThumbnailRetrieved(thumbnail) {
                                    if (thumbnail && mediaItem)
                                        mediaItem.imageUri = MS.Entertainment.Data.Factory.oneTimeUseBlob(thumbnail);
                                    {}
                                }, function onThumbnailRetrievedError(error) {
                                    var description = "failed to retrieve thumbnail. error: " + error.message;
                                    MS.Entertainment.UI.Controls.fail(description)
                                })
                        });
                        promise = WinJS.Promise.as(result)
                    }
                    else {
                        result.error = new Error("Invalid type");
                        promise = WinJS.Promise.as(result)
                    }
                }
                catch(exception) {
                    MS.Entertainment.UI.Controls.assert(false, exception.description);
                    promise = WinJS.Promise.wrapError(exception.description)
                }
                return promise
            }, retrievePropertiesAndPlay: function retrievePropertiesAndPlay(fileItems, playlistAcquisition, suppressNavigateToImmersive, fileOptions) {
                var firstItem = null;
                var currentPromise;
                var promises = [];
                var i;
                var fileOptions = fileOptions || {};
                var videoPlayback = MS.Entertainment.Utilities.isVideoApp;
                function _onFirstResolvedProperties(result) {
                    var completion = null;
                    var error = null;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c;
                            error = e
                        });
                    if (firstItem) {
                        completion();
                        return promise
                    }
                    else if (!result || !result.mediaItem || result.error) {
                        error(result);
                        return promise
                    }
                    var hasCurrentPage = false;
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (videoPlayback)
                            navigationService.clearBackStackOnNextNavigate(true);
                        hasCurrentPage = !!navigationService.currentPage
                    }
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (videoPlayback || hasCurrentPage) {
                        var completePromise = function completePromise(newValue) {
                                if (newValue === MS.Entertainment.Platform.Playback.TransportState.playing || newValue === MS.Entertainment.Platform.Playback.PlayerState.error) {
                                    completion();
                                    sessionMgr.primarySession.unbind("currentTransportState", completePromise);
                                    sessionMgr.primarySession.unbind("playerState", completePromise)
                                }
                            };
                        sessionMgr.primarySession.bind("currentTransportState", completePromise);
                        sessionMgr.primarySession.bind("playerState", completePromise)
                    }
                    firstItem = result.mediaItem;
                    MS.Entertainment.Platform.PlaybackHelpers.playMedia2(firstItem, {
                        sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, autoPlay: true, showImmersive: videoPlayback, preventNavigateToDefault: !videoPlayback || suppressNavigateToImmersive, showAppBar: hasCurrentPage && !videoPlayback, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.fileActivation, immersiveOptions: {
                                sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true
                            }, playContext: {activationFilePath: firstItem.activationFilePath}, saveNowPlaying: false
                    });
                    if (!videoPlayback && !hasCurrentPage) {
                        var navigateToDefaultPromise = WinJS.Promise.timeout(MS.Entertainment.Activation.showNowDefaultDelayMS).then(function() {
                                error("fileActivationHandler::navigateToDefaultPromise");
                                sessionMgr.primarySession.unbind("currentTransportState", navigateToImmersive)
                            }, function onError(){});
                        var navigateToImmersive = function navigateToImmersive(newValue) {
                                if (newValue === MS.Entertainment.Platform.Playback.TransportState.playing) {
                                    navigateToDefaultPromise.cancel();
                                    navigateToDefaultPromise = null;
                                    if (navigationService)
                                        navigationService.clearBackStackOnNextNavigate(true);
                                    if (!suppressNavigateToImmersive && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation))
                                        MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                            sessionId: MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying, startFullScreen: true, completeCallback: function completeLoad() {
                                                    WinJS.Promise.timeout(100).then(function complete() {
                                                        completion()
                                                    })
                                                }
                                        });
                                    else
                                        completion();
                                    sessionMgr.primarySession.unbind("currentTransportState", navigateToImmersive)
                                }
                            };
                        sessionMgr.primarySession.bind("currentTransportState", navigateToImmersive)
                    }
                    return promise
                }
                {};
                function _onAllResolvedProperties(results) {
                    var j;
                    var unsupportedType;
                    var playingItems = !!firstItem;
                    if (!videoPlayback)
                        if (fileOptions.queueItems) {
                            var mediaItems = results.map(function extractMediaItems(result) {
                                    if (result && result.mediaItem)
                                        return result.mediaItem
                                });
                            MS.Entertainment.Platform.PlaybackHelpers.playMedia2(mediaItems, {
                                queueMedia: true, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.fileActivation, preventNavigateToDefault: suppressNavigateToImmersive
                            })
                        }
                        else
                            for (var i = 0; i < results.length; i++) {
                                var result = results[i];
                                if (result && result.mediaItem && firstItem !== result.mediaItem)
                                    if (!firstItem && !fileOptions.queueItems)
                                        return _onFirstResolvedProperties(result).then(function processRemainingResults() {
                                                return _onAllResolvedProperties(results)
                                            });
                                    else
                                        MS.Entertainment.Platform.PlaybackHelpers.playMedia2(result.mediaItem, {
                                            queueMedia: true, playbackSource: MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.fileActivation, preventNavigateToDefault: suppressNavigateToImmersive
                                        });
                                else if (result && result.unsupportedType)
                                    unsupportedType = true
                            }
                    if (!playingItems && unsupportedType)
                        this._showError(String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE), MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_SRC_NOT_SUPPORTED.code)
                }
                {};
                var firstPromise = null;
                for (i = 0; i < fileItems.length; i++) {
                    currentPromise = MS.Entertainment.Activation.retrieveProperties(fileItems[i], playlistAcquisition || Microsoft.Entertainment.Platform.AcquisitionContextType.track, {trackIndex: fileOptions.firstTrackIndex >= 0 ? fileOptions.firstTrackIndex + i : null});
                    if (i === 0 && !fileOptions.queueItems) {
                        firstPromise = currentPromise;
                        firstPromise.then(function onRetrieveProperties(result) {
                            return _onFirstResolvedProperties(result)
                        }).then(null, function onRetrievePropertiesError(result) {
                            if (videoPlayback && fileItems.length === 1) {
                                var title = String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE);
                                if (result && result.unsupportedType)
                                    this._showError(title, MS.Entertainment.Platform.Playback.Error.MF_E_UNSUPPORTED_BYTESTREAM.code);
                                else
                                    this._showError(title, MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_GENERIC.code)
                            }
                        }.bind(this))
                    }
                    else
                        promises.push(currentPromise)
                }
                var processRest = function processRest() {
                        return WinJS.Promise.join(promises).then(_onAllResolvedProperties.bind(this), function onJoinError(){})
                    };
                if (!fileOptions.queueItems) {
                    firstPromise.then(processRest, processRest);
                    return firstPromise
                }
                else
                    return processRest()
            }, isSingleSong: function isSingleSong(e) {
                var fileItems = e.files;
                var single = false;
                try {
                    if (fileItems.size === 1) {
                        var fileItem = fileItems[0];
                        var contentType = String.empty;
                        var fileIsAudio = false;
                        if (fileItem.contentType)
                            contentType = fileItem.contentType.toLowerCase();
                        if (contentType)
                            fileIsAudio = (contentType.indexOf("audio", 0) === 0);
                        if (fileItem.fileType)
                            fileIsAudio = fileIsAudio && !MS.Entertainment.Activation._isPlaylist(fileItem.fileType.toLowerCase());
                        if (fileIsAudio)
                            single = true
                    }
                }
                catch(ex) {
                    MS.Entertainment.Platform.Playback.Etw.traceString("isSingleSong() exception thrown: " + ex.message)
                }
                return single
            }, _isPlaylist: function _isPlaylist(fileType) {
                return (fileType === ".wpl" || fileType === ".zpl" || fileType === ".m3u")
            }, _processPlaylist: function _processPlaylist(fileItem, suppressNavigateToImmersive) {
                try {
                    return Windows.Media.Playlists.Playlist.loadAsync(fileItem).then(function processPlaylist(playlist) {
                            return MS.Entertainment.Activation.fileActivationHandler({
                                    files: playlist.files, acquisition: Microsoft.Entertainment.Platform.AcquisitionContextType.playlist
                                }, null, suppressNavigateToImmersive)
                        }, function onError(error) {
                            if (error.number)
                                if (error.number === -2147024809)
                                    this._showError(String.load(String.id.IDS_PLAYBACK_ERROR_PLAYLIST_FILE_CORRUPT_TITLE), MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_PLAYLIST_PATH_NOT_SUPPORTED.code);
                                else
                                    this._showError(String.load(String.id.IDS_PLAYBACK_ERROR_PLAYLIST_FILE_CORRUPT_TITLE), error.number);
                            return WinJS.Promise.wrapError()
                        }.bind(this))
                }
                catch(e) {
                    return WinJS.Promise.wrapError()
                }
            }, _showError: function _showError(title, errorCode) {
                MS.Entertainment.UI.Framework.loadTemplate("/Controls/MessageBox.html", "messageBoxTemplate", true).done(function onLoadCompleted() {
                    MS.Entertainment.UI.Shell.showError(title, errorCode)
                }, function onLoadError(error) {
                    MS.Entertainment.UI.Components.Shell.fail("failed to load MessageBox loadTemplate for file activation: " + error && error.message)
                })
            }
    })
})()
