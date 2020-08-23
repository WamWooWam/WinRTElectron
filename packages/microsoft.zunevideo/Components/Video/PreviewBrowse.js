/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/ViewModels/PurchaseFlow/VideoSmartBuyStateEngine.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Video");
    WinJS.Namespace.define("MS.Entertainment.Video", {PreviewBrowse: MS.Entertainment.UI.Framework.defineUserControl(null, function PreviewBrowse(element, options) {
            this.updateNavigationHandler();
            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                var volumeControllerService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                this._volumeStateBinds = WinJS.Binding.bind(volumeControllerService, {
                    volume: this._updateVolumeButtonState.bind(this), mute: this._updateVolumeButtonState.bind(this), isAudioEndpointAvailable: this._clearVolumeOverlayAndUpdateState.bind(this)
                })
            }
            if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState))
                this._networkStatusBinds = WinJS.Binding.bind(uiStateService, {networkStatus: this._onNetworkStatusChanged.bind(this)});
            this._uiStateHandlers = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {
                isSnappedChanged: this._clearVolumeOverlayAndUpdateState.bind(this), windowresize: this._clearVolumeOverlayAndUpdateState.bind(this)
            });
            this._appResumedBinding = MS.Entertainment.UI.Framework.addEventHandlers(Windows.UI.WebUI.WebUIApplication, {resuming: this._handleAppResume.bind(this)});
            this._mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader)
        }, {
            processChildren: true, deferInitialization: true, _flipView: null, _virtualizedDataSource: null, _flipViewEventHandlers: null, _lastFlipViewPage: 0, _isFrozen: false, _storedFlipViewCurrentPage: 0, _storedFlipViewPreviousPage: -1, _currentSrcElement: null, _currentMediaItem: null, _currentMediaItemHasTrailer: false, _currentFreeRight: null, _currentBuyOffer: null, _currentRentStreamOffer: null, _currentRentDownloadOffer: null, _dialogToHide: null, _inPurchaseFlow: false, _animateNextHandler: null, _animatePreviousHandler: null, _lastPlaybackContainer: null, _playbackElement: null, _playbackControl: null, _lastPlaybackState: null, _overridePlaybackStateOnThaw: null, _ignoreTransportStateOnFreeze: false, _getDetailsHidePromise: null, _fadeTimer: null, _fadeCenterTextTimer: null, _fadeTimeoutDuration: 3000, _fadeCenterTimeoutDuration: 3000, _autoAdvanceTimer: null, _autoAdvanceTimeoutDuration: 3000, _playPauseButton: null, _volumeStateBinds: null, _networkStatusBinds: null, _volumeOverlayBottomOffset: 17, _volumeOverlayLeftOffset: 33, _appbarService: null, _useAppBar: true, _bottomAppBar: null, _customAppBar: null, _customAppBarElement: null, _spinner: null, _uiStateHandlers: null, _appResumedBinding: null, _mainHeader: null, _voicePrevious: null, _voiceNext: null, _voiceDetails: null, initialize: function initialize() {
                    if (MS.Entertainment.Utilities.isVideoApp2) {
                        this._useAppBar = false;
                        var handlePointerMoveApp2 = this._onMouseMoveApp2.bind(this);
                        this._flipViewEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._flipView, {
                            pageselected: this.onChangePage.bind(this), pagecompleted: this.onPageComplete.bind(this), pagevisibilitychanged: this.onPageVisibilityChanged.bind(this), keydown: this._onKeyDownApp2.bind(this), click: this.onDetailsClick.bind(this), MSPointerHover: handlePointerMoveApp2, pointerhover: handlePointerMoveApp2
                        })
                    }
                    else {
                        this._appbarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                        this._appbarService.pushDefaultContext([]);
                        this._bottomAppBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        this._bottomAppBar.disabled = true;
                        var bottomAppBarElement = document.querySelector(".bottomAppBar");
                        bottomAppBarElement.disabled = true;
                        var barContainer = document.querySelector("[data-win-control='WinJS.UI.AppBar']");
                        this._customAppBar = barContainer.winControl;
                        this._customAppBarElement = barContainer;
                        WinJS.Binding.processAll(barContainer, this);
                        MS.Entertainment.UI.Framework.processDeclMembers(barContainer, this, false);
                        barContainer.parentNode.removeChild(barContainer);
                        bottomAppBarElement.parentNode.appendChild(barContainer);
                        var handlePointerMove = this._onMouseMove.bind(this);
                        this._flipViewEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._flipView, {
                            pageselected: this.onChangePage.bind(this), pagecompleted: this.onPageComplete.bind(this), pagevisibilitychanged: this.onPageVisibilityChanged.bind(this), keydown: this._onKeyDownApp1.bind(this), click: this._onClick.bind(this), MSPointerMove: handlePointerMove, pointermove: handlePointerMove
                        });
                        this._freeButton.onClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.onFree, this);
                        this._buyButton.onClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.onBuy, this);
                        this._rentButton.onClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.onRent, this);
                        this._playPauseButton.onClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.togglePlayPause, this);
                        this._volumeButton.onClick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.onVolumeClick, this);
                        this._getDetailsButton.domElement.onclick = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.onDetailsClick, this)
                    }
                    this._playbackElement = document.createElement("div");
                    this._playbackControl = new MS.Entertainment.Platform.Playback.PlaybackControl(this._playbackElement, {});
                    this._playbackControl.bind("controlInitialized", function playbackControlInitialized(isInitialized) {
                        if (isInitialized) {
                            var iPlayback = this._playbackControl.getPlaybackInterface();
                            iPlayback.bind("currentTransportState", this.handleTransportStateChanges.bind(this))
                        }
                    }.bind(this));
                    var currentLocation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).getUserLocation();
                    if (currentLocation === MS.Entertainment.UI.Monikers.movieTrailerBrowse) {
                        var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        if (currentPage.options && currentPage.options.getItems)
                            currentPage.options.getItems().then(function onGetItems(goodItems) {
                                this._virtualizedDataSource = new MS.Entertainment.Utilities.VirtualizedDataSource(goodItems);
                                this._flipView.itemDataSource = this._virtualizedDataSource;
                                this._virtualizedDataSource.getCount().then(function gotCount(count) {
                                    if (count > 0)
                                        this._virtualizedDataSource.itemFromIndex(0).then(function gotItem(item) {
                                            this.hydrateItem(item.data)
                                        }.bind(this))
                                }.bind(this))
                            }.bind(this))
                    }
                    this._animateNextHandler = this.animateNext.bind(this);
                    this._animatePreviousHandler = this.animatePrevious.bind(this);
                    var animations = {
                            next: this._animateNextHandler, previous: this._animatePreviousHandler
                        };
                    this._flipView.setCustomAnimations(animations);
                    this._updateVolumeButtonState()
                }, unload: function unload() {
                    if (MS.Entertainment.Utilities.isApp1)
                        this._mainHeader.visibility = true;
                    if (MS.Entertainment.Utilities.isApp2 && App2.PlatformLogo)
                        App2.PlatformLogo.visible = true;
                    if (this._customAppBarElement) {
                        this._bottomAppBar.disabled = false;
                        var buttonContainer = this._customAppBarElement.querySelector(".buttonContainer");
                        this._customAppBarElement.removeChild(buttonContainer);
                        this._customAppBarElement.parentNode.removeChild(this._customAppBarElement);
                        this._customAppBarElement = null;
                        this._customAppBar = null
                    }
                    if (this._playbackControl) {
                        var iPlayback = this._playbackControl.getPlaybackInterface();
                        iPlayback.unbind("currentTransportState");
                        iPlayback.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                        iPlayback.currentMedia = null;
                        this._playbackControl.unbind("controlInitialized");
                        this._playbackControl.release();
                        this._playbackControl = null
                    }
                    if (this._flipViewEventHandlers) {
                        this._flipViewEventHandlers.cancel();
                        this._flipViewEventHandlers = null
                    }
                    if (this._volumeStateBinds) {
                        this._volumeStateBinds.cancel();
                        this._volumeStateBinds = null
                    }
                    if (this._networkStatusBinds) {
                        this._networkStatusBinds.cancel();
                        this._networkStatusBinds = null
                    }
                    if (this._uiStateHandlers) {
                        this._uiStateHandlers.cancel();
                        this._uiStateHandlers = null
                    }
                    if (this._appResumedBinding) {
                        this._appResumedBinding.cancel();
                        this._appResumedBinding = null
                    }
                    this._virtualizedDataSource = null;
                    if (this._flipView && !this._flipView._unloaded) {
                        this._flipView.dispose();
                        this._flipView = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, freeze: function previewBrowse_freeze() {
                    this._isFrozen = true;
                    this.clearAutoAdvanceTimer();
                    this.clearFadeTimer();
                    this.clearCenterFadeTimer();
                    if (this._useAppBar) {
                        this._appbarService.pushDefaultContext();
                        this._bottomAppBar.disabled = false;
                        this._customAppBarElement.disabled = true
                    }
                    if (this._playbackControl) {
                        if (!this._ignoreTransportStateOnFreeze)
                            this._lastPlaybackState = this._playbackControl.getPlaybackInterface().currentTransportState;
                        this._playbackControl.getPlaybackInterface().targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused
                    }
                    this._lastFlipViewPage = this._flipView.currentPage;
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function previewBrowse_thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._flipView.currentPage = this._lastFlipViewPage;
                    WinJS.Promise.timeout().then(function deferLastPageRestore() {
                        if (this._flipView.currentPage !== this._lastFlipViewPage)
                            this._flipView.currentPage = this._lastFlipViewPage
                    }.bind(this));
                    if (this._useAppBar) {
                        this._appbarService.pushDefaultContext([]);
                        this._bottomAppBar.disabled = true;
                        this._customAppBarElement.disabled = false
                    }
                    this.startFadeCenterTimer();
                    this.startFadeAllTimer();
                    if (!this._currentMediaItemHasTrailer)
                        this.startAutoAdvanceTimer();
                    this.updateBuyRentButtons();
                    WinJS.Promise.timeout().then(function delaySetPlaybackStateOnThaw() {
                        if (!this._ignoreTransportStateOnFreeze) {
                            if (this._overridePlaybackStateOnThaw) {
                                this._lastPlaybackState = this._overridePlaybackStateOnThaw;
                                this._overridePlaybackStateOnThaw = null
                            }
                            this._restoreLastPlaybackState()
                        }
                        MS.Entertainment.UI.Framework.focusElement(this._flipView.element);
                        this._isFrozen = false
                    }.bind(this))
                }, _restoreLastPlaybackState: function _restoreLastPlaybackState() {
                    if (this._playbackControl) {
                        var iPlayback = this._playbackControl.getPlaybackInterface();
                        if (iPlayback)
                            if (this._lastPlaybackState === MS.Entertainment.Platform.Playback.TransportState.starting || this._lastPlaybackState === MS.Entertainment.Platform.Playback.TransportState.buffering)
                                iPlayback.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                            else
                                iPlayback.targetTransportState = this._lastPlaybackState || MS.Entertainment.Platform.Playback.TransportState.playing
                    }
                }, slideElement: function slideElement(element, destination) {
                    var completion;
                    var promise = new WinJS.Promise(function(c, e, p) {
                            completion = c
                        });
                    function animationEnd(event) {
                        if (event.srcElement === element) {
                            element.removeEventListener("transitionend", animationEnd, false);
                            element.animationEnd = null;
                            WinJS.Utilities.removeClass(element, "flipViewTransitionAnimation");
                            element.style.msTransform = "";
                            element.style.left = destination.left + "px";
                            element.style.top = destination.top + "px";
                            element.animating = false;
                            completion()
                        }
                    }
                    {};
                    if (!MS.Entertainment.ServiceLocator || MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).animationsEnabled) {
                        if (!element.animating) {
                            element.style.left = destination.oldLeft + "px";
                            element.style.top = destination.oldTop + "px";
                            element.animating = true
                        }
                        else {
                            element.removeEventListener("transitionend", element.animationEnd, false);
                            element.animationEnd = null
                        }
                        element.animationEnd = animationEnd;
                        element.addEventListener("transitionend", animationEnd, false);
                        requestAnimationFrame(function() {
                            WinJS.Utilities.addClass(element, "flipViewTransitionAnimation");
                            var translate = "";
                            if (destination.left !== destination.oldLeft)
                                translate += "translateX(" + (destination.left - destination.oldLeft) + "px) ";
                            if (destination.top !== destination.oldTop)
                                translate += "translateY(" + (destination.top - destination.oldTop) + "px)";
                            element.style.msTransform = translate
                        })
                    }
                    else {
                        element.style.left = destination.left + "px";
                        element.style.top = destination.top + "px";
                        completion()
                    }
                    return promise
                }, animateNext: function animateNext(outgoingPage, incomingPage) {
                    var outGoingDestination = {
                            left: -outgoingPage.scrollWidth, top: 0, oldLeft: 0, oldTop: 0
                        };
                    var slideOut = this.slideElement(outgoingPage, outGoingDestination);
                    var inComingDestination = {
                            left: 0, top: 0, oldLeft: outgoingPage.scrollWidth, oldTop: 0
                        };
                    var slideIn = this.slideElement(incomingPage, inComingDestination);
                    var promises = [];
                    promises.push(slideOut);
                    promises.push(slideIn);
                    return WinJS.Promise.join(promises)
                }, animatePrevious: function animatePrevious(outgoingPage, incomingPage) {
                    var outGoingDestination = {
                            left: outgoingPage.scrollWidth, top: 0, oldLeft: 0, oldTop: 0
                        };
                    var slideOut = this.slideElement(outgoingPage, outGoingDestination);
                    var inComingDestination = {
                            left: 0, top: 0, oldLeft: -outgoingPage.scrollWidth, oldTop: 0
                        };
                    var slideIn = this.slideElement(incomingPage, inComingDestination);
                    var promises = [];
                    promises.push(slideOut);
                    promises.push(slideIn);
                    return WinJS.Promise.join(promises)
                }, updateNavigationHandler: function updateNavigationHandler() {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var page = WinJS.Binding.unwrap(navigationService.currentPage);
                    var oldNavigateTo = page.onNavigateTo || function(){};
                    page.onNavigateTo = function() {
                        if (navigationService.navigationDirection === MS.Entertainment.Navigation.NavigationDirection.backward) {
                            var isNetworkConnected = MS.Entertainment.UI.NetworkStatusService.isOnline();
                            if (!isNetworkConnected)
                                WinJS.Promise.timeout().done(function delayNavigateBack() {
                                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                                })
                        }
                        oldNavigateTo();
                        return false
                    }.bind(this)
                }, hydrateItem: function hydrateItem(item) {
                    if (item.hydrate && !item.hydrated)
                        return item.hydrate().then(function populateSecondaryMetadataText(item) {
                                item.addProperty("previewBrowseSecondaryMetadata", this.formatMovieGenreRatingDuration(item))
                            }.bind(this));
                    return WinJS.Promise.wrap()
                }, onChangePage: function onChangePage(e) {
                    this._currentSrcElement = e.srcElement;
                    var flipViewCurrentPage = this._flipView.currentPage;
                    if (this._virtualizedDataSource)
                        this._virtualizedDataSource.getCount().then(function gotCount(count) {
                            for (var i = 0; i < 6 && flipViewCurrentPage + i < count; i++)
                                this._virtualizedDataSource.itemFromIndex(flipViewCurrentPage + i).then(function gotItem(item) {
                                    this.hydrateItem(item.data)
                                }.bind(this))
                        }.bind(this));
                    this.initializeCenterTextOverlays();
                    if (this._lastPlaybackContainer) {
                        this._lastPlaybackContainer.removeChild(this._playbackElement);
                        if (this._playbackControl) {
                            var iPlayback = this._playbackControl.getPlaybackInterface();
                            iPlayback.currentMedia = null
                        }
                        this._lastPlaybackContainer = null
                    }
                    this.clearAutoAdvanceTimer();
                    this.clearFadeTimer();
                    this.clearCenterFadeTimer()
                }, onPageComplete: function onPageComplete(e) {
                    this._storedFlipViewCurrentPage = this._flipView.currentPage;
                    this._virtualizedDataSource.itemFromIndex(this._storedFlipViewCurrentPage).then(function gotItem(item) {
                        if (!item || !item.data)
                            return;
                        this._currentMediaItem = item.data;
                        this._currentMediaItemHasTrailer = true;
                        this._currentFreeRight = null;
                        var currentMediaItem = this._currentMediaItem;
                        this.hydrateItem(this._currentMediaItem).done(function success() {
                            if (currentMediaItem !== this._currentMediaItem)
                                return;
                            var playbackContainerElement = this._currentSrcElement.querySelector(".playbackContainer");
                            if (playbackContainerElement && this._playbackControl) {
                                playbackContainerElement.appendChild(this._playbackElement);
                                var iPlayback = this._playbackControl.getPlaybackInterface();
                                this._currentMediaItem.playPreviewOnly = true;
                                var mediaInstance = new MS.Entertainment.Platform.Playback.MediaInstance({
                                        source: this._currentMediaItem ? this._currentMediaItem.videoPreviewUrl : null, protectionState: MS.Entertainment.Platform.Playback.ProtectionState.unprotected, mediaType: Microsoft.Entertainment.Queries.ObjectType.video, mediaItem: {data: this._currentMediaItem}
                                    });
                                iPlayback.autoPlay = true;
                                iPlayback.currentMedia = mediaInstance;
                                iPlayback.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                                this._lastPlaybackState = iPlayback.targetTransportState;
                                var itemHasTrailer = mediaInstance.source || false;
                                if (!itemHasTrailer) {
                                    this.startAutoAdvanceTimer();
                                    this._currentMediaItemHasTrailer = false
                                }
                                if (!this._getDetailsHidePromise)
                                    if (this._useAppBar) {
                                        this._getDetailsHidePromise = MS.Entertainment.Utilities.hideElement(this._getDetailsButton.domElement);
                                        this.updateBuyRentButtons(true)
                                    }
                                    else
                                        this._getDetailsHidePromise = WinJS.Promise.as();
                                this._getDetailsHidePromise.done(function updateBottomBar() {
                                    if (this._currentMediaItem && this._useAppBar) {
                                        this._boxArt.target = this._currentMediaItem;
                                        this._barTitle.textContent = this._currentMediaItem.name;
                                        this._barGenre.textContent = MS.Entertainment.Formatters.formatGenre(this._currentMediaItem);
                                        this._barSecondaryMetadata.textContent = this.formatMovieRatingDuration(this._currentMediaItem);
                                        this._barStarRatings.averageRating = this._currentMediaItem.averageRating;
                                        this._barStarRatings.userRating = this._currentMediaItem.userRating;
                                        this.updateBuyRentButtons();
                                        MS.Entertainment.Utilities.showElement(this._getDetailsButton.domElement)
                                    }
                                    this._getDetailsHidePromise = null
                                }.bind(this));
                                this._lastPlaybackContainer = playbackContainerElement
                            }
                        }.bind(this))
                    }.bind(this));
                    this.startFadeAllTimer();
                    this.startFadeCenterTimer();
                    if (!this._useAppBar || this._customAppBar.hidden)
                        MS.Entertainment.UI.Framework.focusElement(this._flipView.element);
                    this._storedFlipViewPreviousPage = this._storedFlipViewCurrentPage
                }, onPageVisibilityChanged: function onPageVisibilityChanged(e) {
                    this._storedFlipViewCurrentPage = this._flipView.currentPage;
                    if (this._storedFlipViewPreviousPage === this._storedFlipViewCurrentPage) {
                        var iPlayback = this._playbackControl.getPlaybackInterface();
                        WinJS.Promise.timeout(1).done(function delaySetTransportState() {
                            this._restoreLastPlaybackState();
                            this.startFadeAllTimer();
                            this.startFadeCenterTimer()
                        }.bind(this))
                    }
                    if (e.detail.visible && !this._isFrozen) {
                        this._currentMediaItem = null;
                        this._currentFreeRight = null;
                        this.clearAutoAdvanceTimer();
                        this.clearCenterFadeTimer();
                        this.clearFadeTimer();
                        if (!this._getDetailsHidePromise && this._useAppBar) {
                            this._getDetailsHidePromise = MS.Entertainment.Utilities.hideElement(this._getDetailsButton.domElement);
                            this.updateBuyRentButtons(true)
                        }
                    }
                    MS.Entertainment.Utilities.hideElement(this._spinner)
                }, onDetailsClick: function onDetailsClick() {
                    if (this._currentMediaItem) {
                        this.updateBarVisibility(true);
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: this._currentMediaItem}})
                    }
                }, onLeftArrow: function onLeftArrow() {
                    this._flipView.previous()
                }, onRightArrow: function onRightArrow() {
                    this._flipView.next()
                }, onVolumeClick: function onVolumeClick(e) {
                    this._customAppBar.sticky = true;
                    var position = WinJS.Utilities.getPosition(this._volumeButton.domElement);
                    var distanceFromBottom = MS.Entertainment.Utilities.getWindowHeight() - position.top + this._volumeOverlayBottomOffset;
                    var left = (position.left >= 0 && position.width >= 0) ? (position.left + Math.round((0.5 * position.width) - this._volumeOverlayLeftOffset)) + "px" : "auto";
                    var top = "auto";
                    var right = "auto";
                    var bottom = distanceFromBottom >= 0 ? distanceFromBottom + "px" : "auto";
                    var customStyle = "volumeContainer";
                    if (!this._volumeOverlay) {
                        this._volumeOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Controls.VolumeBar", {}, {
                            right: right, top: top, left: left, bottom: bottom
                        });
                        this._volumeOverlay.customStyle = customStyle;
                        this._volumeOverlay.enableKeyboardLightDismiss = true;
                        this._volumeOverlay.show().done(function overlayClosed() {
                            WinJS.Promise.timeout().then(function delaySetAppBarNonSticky() {
                                this._customAppBar.sticky = false
                            }.bind(this));
                            this._volumeOverlay = null
                        }.bind(this))
                    }
                }, _updateVolumeButtonState: function _updateVolumeButtonState() {
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.volumeService)) {
                        var volumeController = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.volumeService);
                        if (this._volumeButton && volumeController)
                            if (volumeController.isAudioEndpointAvailable) {
                                var formattedValue = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(Math.round(volumeController.volume * 100));
                                this._volumeButton.text = volumeController.mute ? String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_MUTE_BUTTON) : String.load(String.id.IDS_TRANSPORT_CONTROLS_VOLUME_BUTTON).format(formattedValue);
                                this._volumeButton.icon = volumeController.mute ? WinJS.UI.AppBarIcon.mute : WinJS.UI.AppBarIcon.volume;
                                this._volumeButton.isDisabled = false
                            }
                            else {
                                this._volumeButton.text = String.load(String.id.IDS_TRANSPORT_CONTROLS_DISABLED_VOLUME_BUTTON);
                                this._volumeButton.icon = MS.Entertainment.UI.Icon.volumeDisabled;
                                this._volumeButton.isDisabled = true
                            }
                    }
                }, _clearVolumeOverlayAndUpdateState: function _clearVolumeOverlayAndUpdateState() {
                    if (this._volumeOverlay)
                        this._volumeOverlay.hide();
                    this._updateVolumeButtonState()
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newState) {
                    var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                    var page = WinJS.Binding.unwrap(navigationService.currentPage);
                    if (page.iaNode.moniker === MS.Entertainment.UI.Monikers.movieTrailerBrowse)
                        switch (newState) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                                break
                        }
                }, _handleAppResume: function _handleAppResume() {
                    var currentPageElement = document.querySelector("#pageContainer .currentPage");
                    WinJS.Utilities.addClass(currentPageElement, "hideFromDisplay");
                    WinJS.Promise.timeout(1).done(function delayShow() {
                        WinJS.Utilities.removeClass(currentPageElement, "hideFromDisplay")
                    })
                }, togglePlayPause: function togglePlayPause(forcePause) {
                    if (this._playbackControl) {
                        var iPlayback = this._playbackControl.getPlaybackInterface();
                        if (iPlayback.currentTransportState === MS.Entertainment.Platform.Playback.TransportState.playing || forcePause)
                            iPlayback.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                        else
                            iPlayback.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.playing;
                        this._lastPlaybackState = iPlayback.targetTransportState
                    }
                }, onFree: function onFree() {
                    this.buyRentHelper(MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_BUY)
                }, onBuy: function onBuy() {
                    this.buyRentHelper(MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_BUY)
                }, onRent: function onRent() {
                    this.buyRentHelper(MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_RENT)
                }, buyRentHelper: function buyRentHelper(purchaseType) {
                    this.clearAutoAdvanceTimer();
                    this.clearFadeTimer();
                    this._ignoreTransportStateOnFreeze = true;
                    this._lastPlaybackState = this._playbackControl.getPlaybackInterface().currentTransportState;
                    this.togglePlayPause(true);
                    this._purchaseFlowEventProcessed = false;
                    this._mediaToNavigateTo = null;
                    if (this._currentMediaItem) {
                        var languages = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getLanguagesForRights(this._currentMediaItem, MS.Entertainment.Utilities.defaultClientTypeFromApp);
                        if (languages && languages.length > 1) {
                            this.onDetailsClick();
                            return
                        }
                        if (this._currentFreeRight) {
                            var offerId = this._currentFreeRight.offerId;
                            var currencyCode = this._currentFreeRight.priceCurrencyCode;
                            var purchaseType = MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_BUY;
                            if (this._currentFreeRight.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent || this._currentFreeRight.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream)
                                purchaseType = MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_RENT;
                            if (!this._inPurchaseFlow) {
                                this._inPurchaseFlow = true;
                                MS.Entertainment.Platform.PurchaseHelpers.freePurchaseFlow(this._currentMediaItem, offerId, currencyCode, purchaseType, true, this._currentFreeRight.signedOffer, this._currentFreeRight, MS.Entertainment.Platform.PlaybackHelpers.PlaybackSource.details).then(function outOfPurchaseFlow() {
                                    this._inPurchaseFlow = false
                                }.bind(this))
                            }
                        }
                        else {
                            var offerId;
                            var returnUri;
                            var gamerTag;
                            var signedOffer;
                            var getRentalOptionPromise = WinJS.Promise.wrap();
                            if (purchaseType === MS.Entertainment.Platform.PurchaseHelpers.PURCHASE_TYPE_BUY) {
                                offerId = this._currentBuyOffer.offerId;
                                signedOffer = this._currentBuyOffer.signedOffer
                            }
                            else if (this._currentRentStreamOffer && this._currentRentDownloadOffer) {
                                if (!MS.Entertainment.UI.NetworkStatusService.isOnline()) {
                                    var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                    MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_FAILED_PANEL_HEADER), errorCode);
                                    return
                                }
                                getRentalOptionPromise = MS.Entertainment.UI.Controls.RentalOptionsDialog.showRentalOptionsDialog(this._currentMediaItem, this._currentRentStreamOffer, this._currentRentDownloadOffer).then(function(rentalOptionsDialogResult) {
                                    signedOffer = rentalOptionsDialogResult.offer.signedOffer;
                                    offerId = rentalOptionsDialogResult.offer.offerId;
                                    this._dialogToHide = rentalOptionsDialogResult.dialog;
                                    if (this._dialogToHide && this._dialogToHide.buttons && this._dialogToHide.buttons[0])
                                        this._dialogToHide.buttons[0].isEnabled = false
                                }.bind(this), this.purchaseFlowCancelAndErrorEvent.bind(this))
                            }
                            else if (this._currentRentStreamOffer) {
                                offerId = this._currentRentStreamOffer.offerId;
                                signedOffer = this._currentRentStreamOffer.signedOffer
                            }
                            else if (this._currentRentDownloadOffer) {
                                offerId = this._currentRentDownloadOffer.offerId;
                                signedOffer = this._currentRentDownloadOffer.signedOffer
                            }
                            getRentalOptionPromise.done(function showPurchaseFlowDialog() {
                                if (offerId && signedOffer)
                                    MS.Entertainment.Platform.PurchaseHelpers.launchPurchaseFlow(this._currentMediaItem, null, purchaseType, {
                                        onFinishedEvent: function purchaseFlowOnFinishedEvent() {
                                            this._purchaseFlowEventProcessed = true;
                                            this._overridePlaybackStateOnThaw = this._lastPlaybackState;
                                            this._mediaToNavigateTo = this._currentMediaItem;
                                            this._ignoreTransportStateOnFreeze = false;
                                            this.hideDialogIfNeeded()
                                        }.bind(this), onMessageEvent: this.hideDialogIfNeeded.bind(this), onCancelEvent: this.purchaseFlowCancelAndErrorEvent.bind(this), onErrorEvent: this.purchaseFlowCancelAndErrorEvent.bind(this), onShowWebHostDialogComplete: this.purchaseFlowCancelAndErrorEvent.bind(this), onShowWebHostDialogError: this.purchaseFlowCancelAndErrorEvent.bind(this)
                                    }, offerId, returnUri, gamerTag, signedOffer)
                            }.bind(this))
                        }
                    }
                }, hideDialogIfNeeded: function hideDialogIfNeeded() {
                    if (this._dialogToHide) {
                        this._dialogToHide.hide();
                        this._dialogToHide = null
                    }
                }, purchaseFlowCancelAndErrorEvent: function purchaseFlowCancelAndErrorEvent() {
                    this.hideDialogIfNeeded();
                    if (!this._purchaseFlowEventProcessed) {
                        this.startFadeAllTimer();
                        if (!this._currentMediaItemHasTrailer)
                            this.startAutoAdvanceTimer();
                        this._restoreLastPlaybackState();
                        if (this._customAppBar.hidden)
                            MS.Entertainment.UI.Framework.focusElement(this._flipView.element);
                        this._purchaseFlowEventProcessed = true;
                        this._ignoreTransportStateOnFreeze = false
                    }
                    if (this._mediaToNavigateTo) {
                        var mediaToNavigateTo = this._mediaToNavigateTo;
                        WinJS.Promise.timeout().done(function navigateToItemDetails() {
                            MS.Entertainment.Platform.PlaybackHelpers.showItemDetails({dataContext: {data: mediaToNavigateTo}})
                        }.bind(this));
                        this._mediaToNavigateTo = null
                    }
                }, updateBuyRentButtons: function updateBuyRentButtons(forceHide) {
                    if (!this._useAppBar)
                        return;
                    if (forceHide) {
                        if (this._freeButton)
                            WinJS.Utilities.addClass(this._freeButton.domElement, "removeFromDisplay");
                        this._buySubtitle.textContent = String.empty;
                        if (this._buyButton)
                            WinJS.Utilities.addClass(this._buyButton.domElement, "removeFromDisplay");
                        this._rentSubtitle.textContent = String.empty;
                        if (this._rentButton)
                            WinJS.Utilities.addClass(this._rentButton.domElement, "removeFromDisplay")
                    }
                    else {
                        var bestFreeRight = null;
                        var canBuy = false;
                        var canRent = false;
                        if (this._currentMediaItem) {
                            bestFreeRight = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getBestFreeRight(this._currentMediaItem, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Purchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PurchaseStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream, ]);
                            var buyOffer = bestFreeRight ? null : MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultBuyOffer(this._currentMediaItem, false);
                            var rentStreamOffer = bestFreeRight ? null : MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultRentStreamOffer(this._currentMediaItem);
                            var rentDownloadOffer = (MS.Entertainment.Utilities.isVideoApp2 || bestFreeRight) ? null : MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getDefaultRentDownloadOffer(this._currentMediaItem);
                            MS.Entertainment.Platform.PurchaseHelpers.getItemPurchaseAndRentStateAsync(this._currentMediaItem, true).done(function onGetItemPurchaseAndRentState(state) {
                                if (!this._currentMediaItem)
                                    return;
                                var hasCurrentRight = (state.canPurchaseDownload || state.canPurchaseStream || state.canRentDownload || state.canRentStream);
                                if (bestFreeRight !== null && !hasCurrentRight) {
                                    this._currentFreeRight = bestFreeRight;
                                    if (this._freeButton)
                                        WinJS.Utilities.removeClass(this._freeButton.domElement, "removeFromDisplay")
                                }
                                else {
                                    this._currentFreeRight = null;
                                    if (this._freeButton)
                                        WinJS.Utilities.addClass(this._freeButton.domElement, "removeFromDisplay")
                                }
                                if (buyOffer && !hasCurrentRight) {
                                    this._currentBuyOffer = buyOffer;
                                    this._buySubtitle.textContent = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getPriceString(buyOffer);
                                    if (this._buyButton)
                                        WinJS.Utilities.removeClass(this._buyButton.domElement, "removeFromDisplay")
                                }
                                else {
                                    this._currentBuyOffer = null;
                                    this._buySubtitle.textContent = String.empty;
                                    if (this._buyButton)
                                        WinJS.Utilities.addClass(this._buyButton.domElement, "removeFromDisplay")
                                }
                                if ((rentStreamOffer || rentDownloadOffer) && !hasCurrentRight) {
                                    this._currentRentStreamOffer = rentStreamOffer;
                                    this._currentRentDownloadOffer = rentDownloadOffer;
                                    var offer = this._currentRentStreamOffer || this._currentRentDownloadOffer;
                                    if (offer) {
                                        this._rentSubtitle.textContent = MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.getPriceString(offer);
                                        if (this._rentButton)
                                            WinJS.Utilities.removeClass(this._rentButton.domElement, "removeFromDisplay")
                                    }
                                }
                                else {
                                    this._currentRentStreamOffer = null;
                                    this._currentRentDownloadOffer = null;
                                    this._rentSubtitle.textContent = String.empty;
                                    if (this._rentButton)
                                        WinJS.Utilities.addClass(this._rentButton.domElement, "removeFromDisplay")
                                }
                            }.bind(this))
                        }
                    }
                }, handleTransportStateChanges: function handleTransportStateChanges(newValue, oldValue) {
                    switch (this._playbackControl.getPlaybackInterface().currentTransportState) {
                        case MS.Entertainment.Platform.Playback.TransportState.playing:
                            if (this._useAppBar) {
                                this._playPauseButton.icon = MS.Entertainment.UI.Icon.pause;
                                this._playPauseButton.stringId = String.id.IDS_TRANSPORT_CONTROLS_PAUSE_BUTTON
                            }
                            break;
                        case MS.Entertainment.Platform.Playback.TransportState.paused:
                            if (this._useAppBar) {
                                this._playPauseButton.icon = MS.Entertainment.UI.Icon.play;
                                this._playPauseButton.stringId = String.id.IDS_TRANSPORT_CONTROLS_PLAY_BUTTON
                            }
                            break;
                        case MS.Entertainment.Platform.Playback.TransportState.stopped:
                            if (!this._autoAdvanceTimer)
                                if (oldValue === MS.Entertainment.Platform.Playback.TransportState.playing)
                                    this.autoAdvance();
                                else if (oldValue === MS.Entertainment.Platform.Playback.TransportState.starting)
                                    this.startAutoAdvanceTimer();
                            break;
                        default:
                            break
                    }
                }, startFadeAllTimer: function startFadeAllTimer() {
                    this.clearFadeTimer();
                    this._fadeTimer = WinJS.Promise.timeout(this._fadeTimeoutDuration).then(function fadeOut() {
                        if (this._autoAdvanceTimer === null)
                            if (MS.Entertainment.Utilities.isApp2 && this._currentSrcElement) {
                                var currentOverlay = this._currentSrcElement.querySelector(".previewBrowseItemDataContainer");
                                this.setOverlayVisibility(currentOverlay, false)
                            }
                            else
                                this.setOverlayVisibility(null, false)
                    }.bind(this))
                }, clearFadeTimer: function clearFadeTimer() {
                    if (this._fadeTimer) {
                        this._fadeTimer.cancel();
                        this._fadeTimer = null
                    }
                    if (MS.Entertainment.Utilities.isApp2 && this._currentSrcElement) {
                        var currentOverlay = this._currentSrcElement.querySelector(".previewBrowseItemDataContainer");
                        this.setOverlayVisibility(currentOverlay, true)
                    }
                    else
                        this.setOverlayVisibility(null, true)
                }, startFadeCenterTimer: function startFadeCenterTimer() {
                    this.clearCenterFadeTimer();
                    this._fadeCenterTextTimer = WinJS.Promise.timeout(this._fadeCenterTimeoutDuration).then(function fadeOut() {
                        if (this._autoAdvanceTimer === null)
                            this.fadeCenterTextOverlay()
                    }.bind(this))
                }, clearCenterFadeTimer: function clearCenterFadeTimer() {
                    if (this._fadeCenterTextTimer) {
                        this._fadeCenterTextTimer.cancel();
                        this._fadeCenterTextTimer = null
                    }
                }, startAutoAdvanceTimer: function startAutoAdvanceTimer() {
                    this.clearAutoAdvanceTimer();
                    this._autoAdvanceTimer = WinJS.Promise.timeout(this._autoAdvanceTimeoutDuration).then(function autoAdvance() {
                        this.autoAdvance()
                    }.bind(this))
                }, clearAutoAdvanceTimer: function clearAutoAdvanceTimer() {
                    if (this._autoAdvanceTimer) {
                        this._autoAdvanceTimer.cancel();
                        this._autoAdvanceTimer = null
                    }
                }, autoAdvance: function autoAdvance() {
                    var flipViewCurrentPage = this._flipView.currentPage;
                    this._flipView.count().done(function gotCount(count) {
                        var lastPage = count - 1;
                        if (flipViewCurrentPage === lastPage)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack();
                        else
                            this._flipView.next()
                    }.bind(this))
                }, initializeCenterTextOverlays: function initializeCenterTextOverlays() {
                    var allOverlays = document.querySelectorAll(".previewBrowseItemDataContainer");
                    var forEach = Array.prototype.forEach;
                    forEach.call(allOverlays, function ensureVisibleOverlays(overlay) {
                        this.setOverlayVisibility(overlay, true)
                    }.bind(this))
                }, fadeCenterTextOverlay: function fadeCenterTextOverlay() {
                    if (this._currentSrcElement) {
                        var currentOverlay = this._currentSrcElement.querySelector(".previewBrowseItemDataContainer");
                        MS.Entertainment.Utilities.hideElement(currentOverlay);
                        MS.Entertainment.Utilities.showElement(this._spinner)
                    }
                }, _setNavigationButtonVisibility: function _setNavigationVisibility(arrowButton, voiceButton, visible) {
                    if (visible) {
                        if (arrowButton)
                            MS.Entertainment.Utilities.showElement(arrowButton);
                        if (voiceButton) {
                            WinJS.Utilities.removeClass(voiceButton, MS.Entertainment.UI.App2.VoiceStatics.voiceDisabledCssStyle);
                            WinJS.Utilities.removeClass(voiceButton, "hideFromDisplay")
                        }
                    }
                    else {
                        if (arrowButton)
                            MS.Entertainment.Utilities.hideElement(arrowButton);
                        if (voiceButton) {
                            WinJS.Utilities.addClass(voiceButton, "hideFromDisplay");
                            WinJS.Utilities.addClass(voiceButton, MS.Entertainment.UI.App2.VoiceStatics.voiceDisabledCssStyle)
                        }
                    }
                    if (voiceButton)
                        App2.UI.Voice.refreshVoiceElements()
                }, setOverlayVisibility: function setOverlayVisibility(overlay, visible) {
                    if (visible) {
                        var flipViewCurrentPage = this._storedFlipViewCurrentPage;
                        if (overlay)
                            MS.Entertainment.Utilities.showElement(overlay);
                        if (flipViewCurrentPage !== 0)
                            this._setNavigationButtonVisibility(this._arrowLeft, this._previousTrailerVoice, true);
                        else
                            this._setNavigationButtonVisibility(this._arrowLeft, this._previousTrailerVoice, false);
                        this._flipView.count().done(function gotCount(count) {
                            var lastPage = count - 1;
                            if (flipViewCurrentPage === lastPage)
                                this._setNavigationButtonVisibility(this._arrowRight, this._nextTrailerVoice, false);
                            else
                                this._setNavigationButtonVisibility(this._arrowRight, this._nextTrailerVoice, true)
                        }.bind(this));
                        if (MS.Entertainment.Utilities.isApp1)
                            this._mainHeader.visibility = true;
                        if (MS.Entertainment.Utilities.isApp2 && App2.PlatformLogo)
                            App2.PlatformLogo.visible = true
                    }
                    else {
                        if (overlay)
                            MS.Entertainment.Utilities.hideElement(overlay);
                        if (this._arrowLeft)
                            MS.Entertainment.Utilities.hideElement(this._arrowLeft);
                        if (this._arrowRight)
                            MS.Entertainment.Utilities.hideElement(this._arrowRight);
                        if (MS.Entertainment.Utilities.isApp1)
                            this._mainHeader.visibility = false;
                        if (MS.Entertainment.Utilities.isApp2 && App2.PlatformLogo)
                            App2.PlatformLogo.visible = false
                    }
                    this.updateCursorVisibility(visible)
                }, updateBarVisibility: function updateBarVisibility(forceHide) {
                    if (this._customAppBar && this._useAppBar)
                        if (this._customAppBar.hidden && !forceHide)
                            this._customAppBar.show();
                        else
                            this._customAppBar.hide()
                }, updateCursorVisibility: function updateCursorVisibility(visibility) {
                    var cursorStyle = visibility ? "default" : "none";
                    if (this._flipView && this._flipView.element && this._flipView.element.style.cursor !== cursorStyle)
                        this._flipView.element.style.cursor = cursorStyle
                }, _onClick: function _onClick(e) {
                    this.updateBarVisibility();
                    this.startFadeAllTimer();
                    e.stopPropagation()
                }, _onMouseMove: function _onMouseMove(e) {
                    this.startFadeAllTimer();
                    e.stopPropagation()
                }, _onMouseMoveApp2: function _onMouseMove(e) {
                    this.startFadeAllTimer()
                }, _onKeyDownApp2: function _onKeyDownApp2(e) {
                    if (e.altKey)
                        return;
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.rightArrow:
                        case WinJS.Utilities.Key.rArrow:
                        case WinJS.Utilities.Key.rOtherArrow:
                            this._flipView.next();
                            break;
                        case WinJS.Utilities.Key.leftArrow:
                        case WinJS.Utilities.Key.lArrow:
                        case WinJS.Utilities.Key.lOtherArrow:
                            this._flipView.previous();
                            break;
                        case WinJS.Utilities.Key.upArrow:
                        case WinJS.Utilities.Key.uArrow:
                        case WinJS.Utilities.Key.uOtherArrow:
                        case WinJS.Utilities.Key.downArrow:
                        case WinJS.Utilities.Key.dArrow:
                        case WinJS.Utilities.Key.dOtherArrow:
                            this.setOverlayVisibility(null, true);
                            this.startFadeAllTimer();
                            break;
                        case WinJS.Utilities.Key.enter:
                            this.onDetailsClick();
                            break;
                        default:
                            return
                    }
                    e.stopPropagation()
                }, _onKeyDownApp1: function _onKeyDownApp1(e) {
                    switch (e.keyCode) {
                        case WinJS.Utilities.Key.upArrow:
                        case WinJS.Utilities.Key.downArrow:
                        case WinJS.Utilities.Key.tab:
                            this.setOverlayVisibility(null, true);
                            this.startFadeAllTimer();
                            break;
                        default:
                            return
                    }
                    e.stopPropagation()
                }, formatMovieRatingDuration: function formatMovieRatingDuration(sourceValue) {
                    var result = String.empty;
                    if (sourceValue) {
                        var parts = [];
                        if (sourceValue.localizedRatingStringLong)
                            parts.push(sourceValue.localizedRatingStringLong);
                        if (sourceValue.duration)
                            parts.push(MS.Entertainment.Formatters.formatDurationGreaterThanZeroFromDateNonConverter(sourceValue.duration));
                        result = parts.join(String.load(String.id.IDS_DETAILS_METADATA_SEPERATOR))
                    }
                    return result
                }, formatMovieGenreRatingDuration: function formatMovieGenreRatingDuration(sourceValue) {
                    var result = String.empty;
                    if (sourceValue) {
                        var parts = [];
                        if (sourceValue.genre)
                            parts.push(MS.Entertainment.Formatters.formatGenresListNonConverter(sourceValue.genre));
                        if (sourceValue.localizedRatingStringLong)
                            parts.push(sourceValue.localizedRatingStringLong);
                        if (sourceValue.duration)
                            parts.push(MS.Entertainment.Formatters.formatDurationGreaterThanZeroFromDateNonConverter(sourceValue.duration));
                        result = parts.join(String.load(String.id.IDS_DETAILS_METADATA_SEPERATOR))
                    }
                    return result
                }
        }, {showSpinner: true})})
})()
