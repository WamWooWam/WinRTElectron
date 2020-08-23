/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/serviceLocator.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Immersive: MS.Entertainment.UI.Framework.defineUserControl("/Components/Immersive/Immersive.html#immersiveTemplate", function immersiveConstructor(element, options) {
            this._navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
            this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            this._page = this._navigationService.currentPage;
            this.options = this._page.options || {};
            this.options.panelOptions = this.options.panelOptions || {};
            this.options.initialFrame = -1;
            this.options.completeCallback = this.options.completeCallback || null;
            var mediaItem = this.options.mediaItem;
            if (mediaItem) {
                if (mediaItem.serviceType === MS.Entertainment.Data.Augmenter.ServiceTypes.editorialItem)
                    mediaItem = MS.Entertainment.Utilities.convertEditorialItem(mediaItem);
                this.mediaItem = Array.isArray(mediaItem) ? mediaItem : MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem)
            }
            this._uiStateService.nowPlayingInset = !this.options.startFullScreen;
            this._uiStateService.nowPlayingVisible = this.options.startFullScreen || !!this.options.sessionId;
            if (MS.Entertainment.Utilities.isApp2) {
                this._previousVoicePhrase = String.load(String.id.IDS_PREVIOUS_PAGE_VUI_ALM);
                this._previousVoicePhoneticPhrase = String.load(String.id.IDS_PREVIOUS_PAGE_VUI_PRON);
                this._previousVoiceConfidence = String.load(String.id.IDS_PREVIOUS_PAGE_VUI_CONF);
                this._nextVoicePhrase = String.load(String.id.IDS_NEXT_PAGE_VUI_ALM);
                this._nextVoicePhoneticPhrase = String.load(String.id.IDS_NEXT_PAGE_VUI_PRON);
                this._nextVoiceConfidence = String.load(String.id.IDS_NEXT_PAGE_VUI_CONF)
            }
        }, {
            _initialized: false, _playbackSessionBindings: null, _bindings: null, _page: null, _playbackSession: null, _initialFocusSet: false, _navigationBindings: null, _selectionEventBindings: null, _galleryEventBindings: null, _selectionManager: null, _hideFirstPivot: false, _navigationService: null, _uiStateService: null, _restorePlaybackState: null, _previousVoiceConfidence: null, _previousVoicePhrase: null, _previousVoicePhoneticPhrase: null, _nextVoiceConfidence: null, _nextVoicePhrase: null, _nextVoicePhoneticPhrase: null, _maxVoiceScrollStyle: "maxScrolled", _scrollEventHandler: null, initialize: function initialize() {
                    var createPageTitle = this.mediaItem && (MS.Entertainment.Utilities.isVideoApp || MS.Entertainment.Utilities.isMusicApp2);
                    var createSecondaryTitle = this.mediaItem && MS.Entertainment.Utilities.isVideoApp;
                    if (createPageTitle)
                        this._createPageTitle();
                    if (createSecondaryTitle)
                        this._createSecondaryTitle();
                    if (MS.Entertainment.Utilities.isMusicApp1 && !this._selectionManager)
                        this._selectionManager = new MS.Entertainment.UI.Controls.AppBarSelectionManager(this.domElement);
                    var hubStripVisibleEvent = document.createEvent("Event");
                    hubStripVisibleEvent.initEvent("HubStripVisible", true, true);
                    if (this.domElement)
                        this.domElement.dispatchEvent(hubStripVisibleEvent);
                    if (this.mediaItem)
                        this._updateMetaData(this.mediaItem);
                    else if (!this._uiStateService.isSnapped)
                        MS.Entertainment.UI.Controls.assert(false, "Immersive details not supplied with a mediaItem.");
                    if (MS.Entertainment.Utilities.isMusicApp1)
                        this._scrollEventHandler = MS.Entertainment.UI.Framework.addEventHandlers(this._scroller, {scroll: function immersive_scroll() {
                                if (this._uiStateService.isSnapped)
                                    this._scroller.scrollLeft = 0
                            }.bind(this)});
                    this._bindings = WinJS.Binding.bind(this, {
                        _uiStateService: {
                            nowPlayingInset: function nowPlayingInsetChanged(newVal, oldVal) {
                                if (!this.frozen) {
                                    if (!newVal && oldVal !== undefined)
                                        this._bringFrameIntoView(0, true);
                                    else if (newVal && !oldVal && oldVal !== undefined && !this._uiStateService.nowPlayingVisible) {
                                        var frame = this.frameViewModel.frames.item(1);
                                        if (frame)
                                            this._focusFrame(frame)
                                    }
                                    if (newVal) {
                                        WinJS.Utilities.removeClass(this.immersiveControl.domElement, "immersiveDetailsHubStripNoScroll");
                                        WinJS.Utilities.removeClass(this.immersiveControl.domElement, "hideBackground")
                                    }
                                    else {
                                        WinJS.Utilities.addClass(this.immersiveControl.domElement, "immersiveDetailsHubStripNoScroll");
                                        WinJS.Utilities.addClass(this.immersiveControl.domElement, "hideBackground")
                                    }
                                }
                            }.bind(this), isSnapped: function isSnappedChanged(newVal, oldVal) {
                                    if (newVal) {
                                        this.immersiveControl.domElement.style.overflow = "hidden";
                                        this._scroller.style.overflow = "hidden";
                                        if (MS.Entertainment.Utilities.isMusicApp)
                                            this._bringFrameIntoView(0, true);
                                        this._clearItemControlSelection()
                                    }
                                    else if (oldVal !== undefined) {
                                        this.immersiveControl.domElement.style.overflow = String.empty;
                                        this._scroller.style.overflow = String.empty
                                    }
                                }.bind(this)
                        }, _page: {options: this._pageOptionsChanged.bind(this)}
                    });
                    if (MS.Entertainment.Utilities.isApp2)
                        this._attachApp2Handlers();
                    if (this.options.sessionId) {
                        this._playbackSession = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager).getSession(this.options.sessionId);
                        this._playbackSessionBindings = WinJS.Binding.bind(this, {_playbackSession: {currentMedia: function onCurrentMediaChanged(currentMedia, oldMedia) {
                                    if (currentMedia && oldMedia && !currentMedia.isEqual(oldMedia) && MS.Entertainment.Platform.PlaybackHelpers.isAnyMusic(currentMedia))
                                        this._updateMetaData(currentMedia)
                                }.bind(this)}})
                    }
                    this._initialized = true
                }, _clearItemControlSelection: function _clearItemControlSelection() {
                    if (this._selectionManager)
                        this._selectionManager.clearSelection()
                }, _detachBindings: function _detachBindings() {
                    this._detachPlaybackSessionBindings();
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                }, _detachPlaybackSessionBindings: function _detachPlaybackSessionBindings() {
                    if (this._playbackSessionBindings) {
                        this._playbackSessionBindings.cancel();
                        this._playbackSessionBindings = null
                    }
                }, unload: function unload() {
                    this._detachBindings();
                    if (this._scrollEventHandler) {
                        this._scrollEventHandler.cancel();
                        this._scrollEventHandler = null
                    }
                    if (this._pageScroller) {
                        this._pageScroller.dispose();
                        this._pageScroller = null
                    }
                    this._unshareMediaItem();
                    if (this.mediaItem) {
                        if (this.mediaItem.liveQuery && this.mediaItem.liveQuery.dispose)
                            this.mediaItem.liveQuery.dispose();
                        this.mediaItem.liveQuery = null
                    }
                    if (this.frameViewModel && this.frameViewModel.dispose)
                        this.frameViewModel.dispose();
                    if (this._selectionManager) {
                        this._selectionManager.dispose();
                        this._selectionManager = null
                    }
                    if (this._galleryEventBindings) {
                        this._galleryEventBindings.cancel();
                        this._galleryEventBindings = null
                    }
                    if (this._navigationBindings) {
                        this._navigationBindings.cancel();
                        this._navigationBindings = null
                    }
                    this._clearItemControlSelection();
                    if (this._restorePlaybackState)
                        this._restorePlaybackState.cancel();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function immersive_freeze() {
                    var appBar;
                    this.frozen = true;
                    if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isAppVisible)
                        if (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingVisible = false;
                            appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                            if (appBar && appBar.repossessNowPlaying)
                                appBar.repossessNowPlaying()
                        }
                    if (this.frameViewModel && this.frameViewModel.freeze)
                        this.frameViewModel.freeze();
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function immersive_thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this.frozen = false;
                    if (this.frameViewModel && this.frameViewModel.thaw)
                        this.frameViewModel.thaw()
                }, _createPageTitle: function _createPageTitle() {
                    var pageTitleContainer = document.createElement("div");
                    WinJS.Utilities.addClass(pageTitleContainer, "immersivePageTitle");
                    this._titleContainer.appendChild(pageTitleContainer);
                    var templateName = MS.Entertainment.Utilities.isVideoApp ? "/Components/Immersive/Immersive.html#immersivePageTitle" : "/Components/Immersive/Immersive.html#immersiveMediaPageTitle";
                    MS.Entertainment.UI.Framework.loadTemplate(templateName).then(function(template) {
                        return template.render(this, pageTitleContainer)
                    }.bind(this))
                }, _createSecondaryTitle: function _createSecondaryTitle() {
                    var secondaryTitleContainer = document.createElement("div");
                    WinJS.Utilities.addClass(secondaryTitleContainer, "immersivePageTitle");
                    this._scroller.appendChild(secondaryTitleContainer);
                    var templateName = "/Components/Immersive/Immersive.html#immersiveSecondaryPageTitle";
                    MS.Entertainment.UI.Framework.loadTemplate(templateName).then(function(template) {
                        return template.render(this, secondaryTitleContainer)
                    }.bind(this))
                }, _heroScreenRatio: 0.66, _backButtonSize: 60, _pivotOffset: 40, _attachApp2Handlers: function _attachApp2Handlers() {
                    WinJS.Utilities.removeClass(this.nextPageScroller, "removeFromDisplay");
                    WinJS.Utilities.removeClass(this.previousPageScroller, "removeFromDisplay");
                    if (this._scroller && this.immersiveControl && this.immersiveControl.domElement) {
                        this._pageScroller = new MS.Entertainment.UI.Controls.PageScroller(this._scroller, this.nextPageScroller, this.previousPageScroller, this.immersiveControl.domElement);
                        this._pageScroller.logicalContainerSelector = "[data-ent-type~='pageScrollerFrame']"
                    }
                }, _pageOptionsChanged: function _pageOptionsChanged(newVal, oldVal) {
                    if (oldVal && ((oldVal.mediaItem.isEqual && oldVal.mediaItem.isEqual(newVal.mediaItem)) || (newVal.mediaItem.isChildOf && newVal.mediaItem.isChildOf(oldVal.mediaItem)) || (Array.isArray(newVal.mediaItem) || newVal.mediaItem.execute)))
                        if (this.frameViewModel) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingInset = !newVal.startFullScreen;
                            this.frameViewModel.sessionId = newVal.sessionId;
                            WinJS.Promise.timeout(250).then(function _delayLoad() {
                                this._bringFrameIntoView(0, true)
                            }.bind(this))
                        }
                }, _updateMetaData: function _updateMetaData(mediaItem) {
                    var telemetryParameterArray = [{
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.UIPart, parameterValue: MS.Entertainment.Utilities.Telemetry.TelemetryParameterValues.Immersive
                            }, {
                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.UIPath, parameterValue: this._navigationService.getUserLocation()
                            }];
                    this.metadataMediaItem = mediaItem;
                    if (Array.isArray(mediaItem) || mediaItem.execute) {
                        if (Array.isArray(mediaItem) && mediaItem.length > 0)
                            this._updateMetaData(mediaItem[0]);
                        else if (mediaItem.execute) {
                            var queryComplete = function executeSuccess(q) {
                                    if (q.result.items)
                                        q.result.items.toArray().then(function(items) {
                                            this._updateMetaData(items)
                                        }.bind(this))
                                }.bind(this);
                            mediaItem.execute().then(queryComplete.bind(this), function queryFailed(error){})
                        }
                        return
                    }
                    var isNewViewModel = true;
                    switch (mediaItem.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            MS.Entertainment.UI.Controls.assert(false, "We don't support games anymore");
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.video:
                            if (MS.Entertainment.Platform.PlaybackHelpers.isTVEpisode(mediaItem))
                                this.frameViewModel = new MS.Entertainment.ViewModels.TvImmersiveViewModel;
                            else if (MS.Entertainment.Platform.PlaybackHelpers.isMusicVideo(mediaItem) && mediaItem.artist) {
                                this._convertToArtist(mediaItem);
                                return
                            }
                            else {
                                this.frameViewModel = new MS.Entertainment.ViewModels.MovieImmersiveViewModel;
                                this._hideFirstPivot = true;
                                if (mediaItem.hasZuneId)
                                    telemetryParameterArray.push({
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ZuneId, parameterValue: mediaItem.zuneId
                                    });
                                else if (mediaItem.hasCanonicalId)
                                    telemetryParameterArray.push({
                                        parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.CanonicalId, parameterValue: mediaItem.canonicalId
                                    })
                            }
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeries:
                        case Microsoft.Entertainment.Queries.ObjectType.tvSeason:
                            this.frameViewModel = new MS.Entertainment.ViewModels.TvImmersiveViewModel;
                            if (mediaItem.seriesId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.SeriesId, parameterValue: mediaItem.seriesId
                                });
                            else if (mediaItem.hasZuneId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ZuneId, parameterValue: mediaItem.zuneId
                                });
                            else if (mediaItem.hasCanonicalId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.CanonicalId, parameterValue: mediaItem.canonicalId
                                });
                            break;
                        case Microsoft.Entertainment.Queries.ObjectType.playlist:
                        case Microsoft.Entertainment.Queries.ObjectType.album:
                        case Microsoft.Entertainment.Queries.ObjectType.person:
                        case Microsoft.Entertainment.Queries.ObjectType.track:
                            if (mediaItem.artistServiceId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ArtistServiceId, parameterValue: mediaItem.artistServiceId
                                });
                            else if (mediaItem.hasZuneId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.ZuneId, parameterValue: mediaItem.zuneId
                                });
                            else if (mediaItem.hasCanonicalId)
                                telemetryParameterArray.push({
                                    parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.CanonicalId, parameterValue: mediaItem.canonicalId
                                });
                            if (!this.frameViewModel)
                                this.frameViewModel = new MS.Entertainment.ViewModels.ArtistImmersiveViewModel;
                            else
                                isNewViewModel = false;
                            break
                    }
                    MS.Entertainment.UI.Controls.assert(this.frameViewModel, "Immersive details didn't get a valid viewmodel.");
                    if (!this.frameViewModel || !this.frameViewModel.updateMetaData) {
                        this._navigationService.navigateToDefaultPage();
                        return
                    }
                    var hydratePromise = this.frameViewModel.updateMetaData(mediaItem, this.options.startFullScreen);
                    MS.Entertainment.UI.Controls.assert(this.frameViewModel.frames.length > 0, "Immersive details viewmodel didn't create any frames.");
                    if (!this.frameViewModel.frames.length) {
                        this._navigationService.navigateToDefaultPage();
                        return
                    }
                    if (this.frameViewModel.frames.item(0).isFullScreen === undefined)
                        this.frameViewModel.frames.item(0).addProperty("isFullScreen", this.options.startFullScreen);
                    hydratePromise.then(function mediaHydrated(mediaItem) {
                        if (mediaItem && !mediaItem.isFailed) {
                            if (this.frameViewModel.backgroundImageUri)
                                this._loadBackgroundImage(this.frameViewModel.backgroundImageUri);
                            WinJS.Promise.timeout().done(function shareMediaAfterTimeout() {
                                this._shareMediaItem(mediaItem)
                            }.bind(this));
                            this.mediaName = mediaItem.name;
                            if (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeries || mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason) {
                                var nameOverride = mediaItem.seriesTitle || mediaItem.primaryText || mediaItem.name;
                                if (nameOverride)
                                    this.mediaName = nameOverride
                            }
                        }
                        if (this.options)
                            this.options.mediaItem = mediaItem
                    }.bind(this));
                    this.frameViewModel.sessionId = this.options.sessionId;
                    if (isNewViewModel)
                        this.frameViewModel.frames.addChangeListener(this._handleFramesChanged.bind(this));
                    this._handleFramesChanged();
                    if (this.options.completeCallback)
                        if (this.frameViewModel.handleNavigationCompleteCallback)
                            this.frameViewModel.navigationCompleteCallback = this.options.completeCallback;
                        else
                            this.options.completeCallback(true);
                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.ImmersiveDetailsMetaDataUpdated, telemetryParameterArray)
                }, _handleFramesChanged: function _handleFramesChanged() {
                    WinJS.Promise.timeout().then(function() {
                        if (this.options.hub || this.options.initialFrame > 0) {
                            for (var i = 0; i < this.frameViewModel.frames.length; i++)
                                if (this.frameViewModel.frames.item(i).moniker === this.options.hub)
                                    this.options.initialFrame = i;
                            if (this.options.initialFrame > -1 && this.options.initialFrame < this.frameViewModel.frames.length)
                                this._bringFrameIntoView(this.options.initialFrame, true)
                        }
                        else if (!this._initialFocusSet && this.immersiveControl && this.immersiveControl.dataSource && this.frameViewModel.frames.length > 1 && this.frameViewModel.skipInitialFocus !== true)
                            if (this._focusFrame(this.frameViewModel.frames.item(0)))
                                this._initialFocusSet = true
                    }.bind(this))
                }, _focusFrame: function _focusFrame(frame, frameIndex) {
                    var element = this.immersiveControl.getElementForItem(frame);
                    if (element)
                        MS.Entertainment.UI.Framework.waitForControlToInitialize(element).then(function() {
                            return WinJS.Promise.timeout(700)
                        }).then(function() {
                            if (!this._scroller.isAnimatingScroll)
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(element);
                            if (frameIndex !== undefined && frameIndex === this.options.initialFrame && this.options.showInitialFrameViewMore && frame.showViewMore)
                                frame.showViewMore()
                        }.bind(this));
                    return element
                }, _bringFrameIntoView: function _bringFrameIntoView(frameIndex, focusAfterScrolling) {
                    if (this.immersiveControl && this.frameViewModel && this.frameViewModel.frames.length > 0)
                        this.immersiveControl.bringItemIntoView(this.frameViewModel.frames.item(frameIndex), {bringOnMinimally: true}).then(function() {
                            if (focusAfterScrolling)
                                this._focusFrame(this.frameViewModel.frames.item(frameIndex), frameIndex)
                        }.bind(this))
                }, _convertToArtist: function _convertToArtist(mediaItem) {
                    mediaItem = mediaItem.artist || {};
                    mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                    this._updateMetaData(mediaItem)
                }, _shareMediaItem: function _shareMediaItem(overrideMediaItem) {
                    var sender = MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.shareSender) && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                    if (sender) {
                        overrideMediaItem = overrideMediaItem || this.mediaItem;
                        if (!this.nowPlayingVisible && overrideMediaItem) {
                            this._unshareMediaItem();
                            this._shareOperation = sender.pendingShare(overrideMediaItem)
                        }
                    }
                }, _unshareMediaItem: function _unshareMediaItem() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                }, _loadBackgroundImage: function _loadBackgroundImage(backgroundImageUri) {
                    if (backgroundImageUri)
                        MS.Entertainment.UI.Shell.ImageLoader.cacheImage(backgroundImageUri, String.empty).done(function cacheImage(url) {
                            this.backgroundImageUri = url
                        }.bind(this))
                }
        }, {
            backgroundImageUri: String.empty, frameViewModel: null, options: null, mediaItem: null, metadataMediaItem: null, mediaName: String.empty, frozen: false
        }, {makeFrame: function makeFrame(heading, columnSpan, control, viewMoreContentUrl, moniker, disableHeaderButton) {
                if (!heading && MS.Entertainment.Utilities.isVideoApp2)
                    heading = String.load(String.id.IDS_HOME_PIVOT);
                return WinJS.Binding.as({
                        heading: heading, visible: false, viewMoreHeading: heading, disableHeaderButton: disableHeaderButton, viewMoreSubHeading: null, title: heading, columnSpan: columnSpan, getData: null, viewMoreInfo: {
                                icon: MS.Entertainment.UI.Icon.nowPlayingNext, title: String.load(String.id.IDS_DETAILS_VIEW_MORE)
                            }, hideViewMoreIfEnoughSpace: false, overviewConstructor: control, viewMoreTemplate: viewMoreContentUrl, moniker: moniker
                    })
            }})})
})()
