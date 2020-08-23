/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/corefx.js", "/Framework/servicelocator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
        SnappedMode: MS.Entertainment.UI.Framework.defineUserControl("/Components/Shell/SnappedMode.html#snappedModeTemplate", function snappedModeConstructor(element, options){}, {}), initializeSnappedMode: function initializeSnappedMode() {
                var snappedElement = document.getElementById("htmlSnapped");
                var unsnappedElement = document.getElementById("htmlUnsnapped");
                var snappedUserControlElement = null;
                var didMoveNowPlaying = false;
                var transferredSnapToVideoNowPlaying = false;
                var unsnappedFocusRoot = null;
                var unsnappedContentContainer = null;
                var unsnappedActiveElement = null;
                var _uiStateEventHandler = null;
                var controlsFrozen = false;
                var _currentMediaPromise = null;
                var freezeControls = function freezeControls() {
                        var itemsToFreeze = [];
                        var currentPage = document.querySelector("#pageContainer .currentPage");
                        if (currentPage)
                            itemsToFreeze.push(currentPage);
                        var overlays = document.querySelectorAll(".overlayAnchor:not(.noFreeze)");
                        Array.prototype.forEach.call(overlays, function(overlay) {
                            itemsToFreeze.push(overlay)
                        });
                        itemsToFreeze.forEach(function(item) {
                            MS.Entertainment.Utilities.freezeControlsInSubtree(item)
                        });
                        controlsFrozen = true
                    };
                var thawControls = function thawControls() {
                        var itemsToThaw = [];
                        var currentPage = document.querySelector("#pageContainer .currentPage");
                        if (currentPage)
                            itemsToThaw.push(currentPage);
                        var overlays = document.querySelectorAll(".overlayAnchor:not(.noFreeze)");
                        Array.prototype.forEach.call(overlays, function(overlay) {
                            itemsToThaw.push(overlay)
                        });
                        itemsToThaw.forEach(function(item) {
                            MS.Entertainment.Utilities.thawControlsInSubtree(item)
                        });
                        controlsFrozen = false
                    };
                var captureFocusState = function captureFocusState(targetContainer) {
                        if (MS.Entertainment.UI.Framework.currentContentContainer === targetContainer)
                            return;
                        MS.Entertainment.UI.Framework.addOverlayContainer(targetContainer);
                        if (document.activeElement && (document.activeElement !== document.body))
                            unsnappedActiveElement = document.activeElement;
                        if (WinJS.UI.AutomaticFocus) {
                            unsnappedFocusRoot = WinJS.UI.AutomaticFocus.focusRoot;
                            MS.Entertainment.UI.Framework.setFocusRoot(targetContainer)
                        }
                    };
                var restoreFocusState = function restoreFocusState() {
                        MS.Entertainment.UI.Framework.removeOverlayContainer(snappedUserControlElement);
                        if (MS.Entertainment.Utilities.isApp2) {
                            if (!unsnappedFocusRoot)
                                unsnappedFocusRoot = document.querySelector("#pageContainer .currentPage");
                            if (unsnappedFocusRoot) {
                                MS.Entertainment.UI.Framework.setFocusRoot(unsnappedFocusRoot);
                                if (unsnappedActiveElement)
                                    MS.Entertainment.UI.Framework.focusElement(unsnappedActiveElement);
                                else
                                    MS.Entertainment.UI.Framework.focusFirstInSubTree(unsnappedFocusRoot);
                                unsnappedFocusRoot = null
                            }
                        }
                    };
                var navigateOnMedia = function navigateOnMedia(newValue, oldValue) {
                        if (oldValue === undefined)
                            return;
                        if (_currentMediaPromise) {
                            _currentMediaPromise.cancel();
                            _currentMediaPromise = null
                        }
                        if (newValue) {
                            if (!didMoveNowPlaying) {
                                if (snappedUserControlElement) {
                                    MS.Entertainment.Utilities.empty(snappedUserControlElement);
                                    MS.Entertainment.UI.Framework.removeOverlayContainer(snappedUserControlElement)
                                }
                                else {
                                    snappedUserControlElement = document.createElement("div");
                                    snappedElement.appendChild(snappedUserControlElement)
                                }
                                snappedUserControlElement.className = "musicSnappedNowPlaying snappedContainer win-ui-dark";
                                captureFocusState(snappedUserControlElement);
                                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingTileVisible = false;
                                var controlElement = document.createElement("div");
                                controlElement.setAttribute("class", "nowPlayingControl");
                                controlElement.setAttribute("data-win-control", "MS.Entertainment.UI.Controls.SnappedNowPlaying");
                                var nowPlayingControl = new MS.Entertainment.UI.Controls.SnappedNowPlaying(controlElement, {});
                                snappedUserControlElement.appendChild(nowPlayingControl.domElement);
                                didMoveNowPlaying = true
                            }
                        }
                        else
                            _currentMediaPromise = WinJS.Promise.timeout(1500).then(function createBrowseScreen() {
                                createSnapBrowseScreen()
                            })
                    };
                var createSnapBrowseScreen = function createSnapBrowseScreen() {
                        var snappedTemplate = MS.Entertainment.Utilities.isMusicApp2 ? "/Components/Music/MusicSharedTemplates.html#music2SnappedTemplate" : "/Components/Music/MusicSharedTemplates.html#musicSnappedTemplate";
                        WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                        MS.Entertainment.UI.Framework.loadTemplate(snappedTemplate).then(function renderControl(controlInstance) {
                            var dataContext = WinJS.Binding.as({unsnapAction: MS.Entertainment.UI.Components.Shell.getUnsnapAction()});
                            if (snappedUserControlElement) {
                                MS.Entertainment.Utilities.empty(snappedUserControlElement);
                                MS.Entertainment.UI.Framework.removeOverlayContainer(snappedUserControlElement)
                            }
                            else {
                                snappedUserControlElement = document.createElement("div");
                                snappedElement.appendChild(snappedUserControlElement)
                            }
                            didMoveNowPlaying = false;
                            return controlInstance.render(dataContext, snappedUserControlElement)
                        }.bind(this)).done(function templateLoadingShowContent() {
                            captureFocusState(snappedUserControlElement);
                            if (MS.Entertainment.Utilities.isApp2)
                                WinJS.Promise.timeout(500).done(function setFocus() {
                                    MS.Entertainment.UI.Framework.focusFirstInSubTree(snappedUserControlElement)
                                })
                        });
                        freezeControls()
                    };
                var snapMusic = function snapMusic() {
                        WinJS.Utilities.addClass(document.body, "snapped");
                        WinJS.Utilities.removeClass(snappedElement, "hideFromDisplay");
                        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState) || !MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            return;
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        uiStateService.isSnapped = true;
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (sessionMgr.primarySession && sessionMgr.primarySession.currentMedia) {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            if (MS.Entertainment.Utilities.isMusicApp2 || !uiStateService.nowPlayingVisible || !navigationService.currentPage || !navigationService.currentPage.iaNode || !(navigationService.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.immersiveDetails || navigationService.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying)) {
                                WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                                freezeControls();
                                navigateOnMedia(true, false)
                            }
                            else
                                WinJS.Utilities.addClass(snappedElement, "hideFromDisplay")
                        }
                        else
                            createSnapBrowseScreen();
                        sessionMgr.primarySession.bind("currentMedia", navigateOnMedia)
                    };
                var unSnapMusic = function unSnapMusic() {
                        if (_currentMediaPromise) {
                            _currentMediaPromise.cancel();
                            _currentMediaPromise = null
                        }
                        WinJS.Utilities.removeClass(document.body, "snapped");
                        WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState) || !MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            return;
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        restoreFocusState();
                        uiStateService.isSnapped = false;
                        if (didMoveNowPlaying) {
                            var nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                            sessionMgr.relocateSession(nowPlayingControl, false);
                            didMoveNowPlaying = false
                        }
                        sessionMgr.primarySession.unbind("currentMedia", navigateOnMedia);
                        if (controlsFrozen)
                            thawControls();
                        if (uiStateService.nowPlayingConstrainedMode && !uiStateService.isFullScreenMusic)
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                sessionId: sessionMgr.primarySession.sessionId, startFullScreen: false
                            });
                        snappedUserControlElement = null;
                        WinJS.Utilities.addClass(snappedElement, "hideFromDisplay");
                        MS.Entertainment.Utilities.empty(snappedElement);
                        if (appBar)
                            appBar.hide()
                    };
                var handleVideoErrorOnPlayback = function handleVideoErrorOnPlayback(currentPlayerState) {
                        if (currentPlayerState === MS.Entertainment.Platform.Playback.PlayerState.error && MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                            unSnapVideo();
                            WinJS.Promise.timeout(1).done(function delayReSnap() {
                                snapVideo(false)
                            })
                        }
                    };
                var snapVideo = function snapVideo(transferSnapToVideoNowPlaying) {
                        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState) || !MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            return;
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.primarySession;
                        var moniker = WinJS.Utilities.getMember("currentPage.iaNode.moniker", navigationService);
                        var inNowPlaying = moniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying;
                        if (MS.Entertainment.Utilities.isVideoApp2 && (inNowPlaying || transferSnapToVideoNowPlaying) && !transferredSnapToVideoNowPlaying) {
                            transferredSnapToVideoNowPlaying = true;
                            WinJS.Utilities.addClass(unsnappedElement, "app2NowPlayingSnappedMode");
                            WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                            WinJS.Utilities.addClass(snappedElement, "hideFromDisplay");
                            WinJS.Utilities.addClass(document.body, "snapped");
                            if (snappedUserControlElement)
                                cleanupDefaultVideoSnapControl();
                            var mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                            mainHeader.visibility = false;
                            WinJS.Promise.timeout(1000).then(function delayFocus() {
                                MS.Entertainment.UI.Framework.focusFirstInSubTree(MS.Entertainment.UI.Framework.currentFocusContainer, true, true)
                            })
                        }
                        else if (!transferSnapToVideoNowPlaying) {
                            if (transferredSnapToVideoNowPlaying) {
                                transferredSnapToVideoNowPlaying = false;
                                cleanupNowPlayingVideoSnapControl()
                            }
                            MS.Entertainment.UI.Components.Shell.assert(!snappedUserControlElement, "Did not clean up the previous snap controls.");
                            snappedUserControlElement = document.createElement("div");
                            snappedElement.appendChild(snappedUserControlElement);
                            new MS.Entertainment.UI.Components.Shell.SnappedMode(snappedUserControlElement, {});
                            captureFocusState(snappedUserControlElement);
                            WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                            freezeControls();
                            WinJS.Utilities.removeClass(snappedElement, "hideFromDisplay")
                        }
                        playbackSession.bind("playerState", handleVideoErrorOnPlayback)
                    };
                var unSnapVideo = function unSnapVideo() {
                        if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.uiState) || !MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager))
                            return;
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        var playbackSession = sessionMgr.primarySession;
                        playbackSession.unbind("playerState", handleVideoErrorOnPlayback);
                        if (transferredSnapToVideoNowPlaying) {
                            transferredSnapToVideoNowPlaying = false;
                            cleanupNowPlayingVideoSnapControl()
                        }
                        cleanupDefaultVideoSnapControl();
                        uiStateService.updateAndNotify("isSnapped", false).done(function _delay() {
                            var actualControl = snappedControlsToRemove.pop();
                            while (actualControl) {
                                snappedElement.removeChild(actualControl);
                                actualControl = snappedControlsToRemove.pop()
                            }
                        }, function error() {
                            MS.Entertainment.fail("Error setting uiStateService.isSnapped")
                        })
                    };
                var cleanupDefaultVideoSnapControl = function cleanupDefaultVideoSnapControl() {
                        thawControls();
                        WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                        WinJS.Utilities.addClass(snappedElement, "hideFromDisplay");
                        restoreFocusState();
                        snappedControlsToRemove.push(snappedUserControlElement);
                        snappedUserControlElement = null
                    };
                var cleanupNowPlayingVideoSnapControl = function cleanupNowPlayingVideoSnapControl() {
                        WinJS.Utilities.removeClass(unsnappedElement, "app2NowPlayingSnappedMode");
                        WinJS.Utilities.removeClass(document.body, "snapped");
                        var mainHeader = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.mainHeader);
                        mainHeader.visibility = true
                    };
                var matchSnappedWatcher = matchMedia("all and (min-width: 320px) and (max-width: 480px)");
                var onSnappedMode = function onSnappedMode(matchSnapped) {
                        if (matchSnapped.matches) {
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped = true;
                            if (MS.Entertainment.Utilities.isMusicApp)
                                snapMusic();
                            else {
                                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                var moviesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace);
                                var tvMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace);
                                var hasNoDashboard = !moviesMarketplaceEnabled && !tvMarketplaceEnabled && MS.Entertainment.Utilities.isVideoApp2;
                                if (uiStateService.stageThreeActivated || hasNoDashboard)
                                    snapVideo();
                                else if (!_uiStateEventHandler)
                                    _uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {stageThreeActivatedChanged: function stageThreeActivatedChanged(activateEvent) {
                                            var stageThreeActivated = activateEvent.detail.newValue;
                                            var isSnapped = matchSnapped.matches;
                                            if (stageThreeActivated && isSnapped) {
                                                snapVideo();
                                                _uiStateEventHandler.cancel();
                                                _uiStateEventHandler = null
                                            }
                                        }})
                            }
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).switchedToSnappedMode()
                        }
                    };
                if (MS.Entertainment.Utilities.isVideoApp2) {
                    document.addEventListener("SnappedMode_TransferSnapOwnershipToNowPlaying", function() {
                        snapVideo(true)
                    });
                    document.addEventListener("SnappedMode_TransferSnapOwnershipToDefault", function() {
                        snapVideo(false)
                    })
                }
                matchSnappedWatcher.addListener(onSnappedMode);
                if (matchSnappedWatcher.matches)
                    onSnappedMode(matchSnappedWatcher);
                var snappedControlsToRemove = [];
                var matchUnsnappedWatcher = matchMedia("all and (min-width: 481px)");
                var onUnsnappedMode = function onUnsnappedMode(matchUnsnapped) {
                        if (matchUnsnapped.matches) {
                            if (MS.Entertainment.Utilities.isMusicApp)
                                unSnapMusic();
                            else
                                unSnapVideo();
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).switchedToUnsnappedMode()
                        }
                    };
                matchUnsnappedWatcher.addListener(onUnsnappedMode);
                if (MS.Entertainment.Utilities.isApp2) {
                    var matchFilledWatcher = matchMedia("all and (min-width: 481px) and (max-width: 1919px)");
                    matchFilledWatcher.addListener(function onFilledMode(matchFilled) {
                        if (matchFilled.matches)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFilled = true
                    });
                    var matchNonfilledWatcher = matchMedia("all and (min-width: 1920px), all and (min-width: 320px) and (max-width: 480px)");
                    matchNonfilledWatcher.addListener(function onNonfilledMode(matchNonfilled) {
                        if (matchNonfilled.matches)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFilled = false
                    });
                    if (matchFilledWatcher.matches)
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isFilled = true
                }
            }, getUnsnapAction: function getUnsnapAction() {
                var UnsnapButtonAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function unsnapAction() {
                        this.base()
                    }, {
                        automationId: MS.Entertainment.UI.AutomationIds.unsnapButtonAction, executed: function executed(parameter) {
                                var appView = Windows.UI.ViewManagement.ApplicationView;
                                if (appView && Windows.Xbox)
                                    appView.tryUnsnapToFullscreen();
                                else if (appView)
                                    appView.tryUnsnap()
                            }, canExecute: function canExecute(parameter) {
                                return true
                            }
                    });
                var action = new UnsnapButtonAction;
                if (MS.Entertainment.Utilities.isApp2) {
                    action.title = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_GUI);
                    action.voicePhrase = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_ALM);
                    action.voicePhoneticPhrase = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_PRON);
                    action.voiceConfidence = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_CONF)
                }
                return action
            }
    })
})()
