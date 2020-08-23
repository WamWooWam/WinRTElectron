/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/corefx.js", "/Framework/utilities.js", "/Framework/servicelocator.js");
    var UnsnapButtonAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function unsnapAction() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.AutomationIds.unsnapButtonAction, executed: function executed(parameter) {
                    parameter.appIconClick()
                }, canExecute: function canExecute(parameter) {
                    return true
                }
        });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {SnappedNowPlaying: MS.Entertainment.UI.Framework.defineUserControl("/Controls/NowPlaying/SnappedNowPlaying.html#template", function snappedNowPlayingConstructor(element, options) {
            this._bindingsToDetach = [];
            this._unsnapAction = new UnsnapButtonAction;
            this._unsnapAction.parameter = this
        }, {
            _initialized: false, _bindingsToDetach: null, _unsnapAction: null, _deferredUpdateTimer: null, _uiStateEventHandler: null, _ratingImageVisible: false, _ratingImageVisiblePromise: null, _ratingImageUrl: String.empty, initialize: function initialize() {
                    this.delayInitialize()
                }, _delayInitialized: function _delayInitialized() {
                    if (this._uiStateEventHandler) {
                        this._uiStateEventHandler.cancel();
                        this._uiStateEventHandler = null
                    }
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.sessionManager)) {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this.bind("playbackSession", this._playbackSessionChanged.bind(this));
                        this.options = {};
                        this._loadAppIcon();
                        this.appTitleLabel.displayText = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).applicationTitle;
                        var displayText = String.empty;
                        if (MS.Entertainment.Utilities.isVideoApp2) {
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            var hasMarketplace = (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace));
                            displayText = hasMarketplace ? String.load(String.id.IDS_VIDEO2_SNAPPED_UNSNAP_LONG_TEXT) : String.load(String.id.IDS_VIDEO2_WELCOME_DIALOG_TITLE_NO_MARKETPLACE)
                        }
                        this.appSnappedSecondaryText.displayText = displayText;
                        this.secondaryTextVisible = MS.Entertainment.Utilities.isVideoApp2;
                        this._setUnsnapButtonText();
                        this._snappedDetails.bind("detailsReady", function metadataImageChanged() {
                            WinJS.Promise.timeout().then(function _delay() {
                                this.visible = !MS.Entertainment.Utilities.isVideoApp2;
                                if (this.appIconVisible) {
                                    MS.Entertainment.UI.Framework.focusFirstInSubTree(this.unsnapButton.domElement, true);
                                    var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                                    if (appBar && appBar.hide)
                                        appBar.hide()
                                }
                                else {
                                    var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                                    if (appBar && appBar.show)
                                        appBar.show()
                                }
                            }.bind(this));
                            this._updateStates()
                        }.bind(this));
                        this.playbackSession = sessionMgr.primarySession;
                        this._nowPlayingMetadata.bind("nowPlayingImageUri", function metadataImageChanged() {
                            this.nowPlayingImageUri = this._nowPlayingMetadata.nowPlayingImageUri
                        }.bind(this));
                        this._nowPlayingMetadata.bind("backgroundImageUri", function metadataBackgroundChanged() {
                            this.backgroundImageUri = this._nowPlayingMetadata.backgroundImageUri
                        }.bind(this));
                        this.repossessNowPlaying();
                        if (this.ratingImage && MS.Entertainment.Platform.PlaybackHelpers.shouldDisplayRatingImage() && this._ratingImageUrl !== String.empty)
                            this.ratingImageVisible = true;
                        this._initialized = true
                    }
                    else
                        this._uiStateEventHandler = MS.Entertainment.Utilities.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {stageThreeActivatedChanged: function stageThreeActivatedChanged(e) {
                                if (e.detail.newValue)
                                    this._delayInitialized()
                            }.bind(this)})
                }, _setUnsnapButtonText: function _setUnsnapButtonText() {
                    if (MS.Entertainment.Utilities.isMusicApp)
                        this.unsnapButton.text = String.load(String.id.IDS_SNAPPED_MUSIC_UNSNAP_TEXT);
                    else if (MS.Entertainment.Utilities.isVideoApp1)
                        this.unsnapButton.text = String.load(String.id.IDS_SNAPPED_VIDEO_UNSNAP_TEXT);
                    else if (MS.Entertainment.Utilities.isVideoApp2) {
                        this.unsnapButton.text = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_GUI);
                        this.unsnapVoicePhrase = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_ALM);
                        this.unsnapVoicePhoneticPhrase = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_PRON);
                        this.unsnapVoiceConfidence = String.load(String.id.IDS_GO_FULL_SCREEN_VUI_CONF)
                    }
                    else
                        MS.Entertainment.fail("Unable to find text for unsnap button.")
                }, _loadAppIcon: function _loadAppIcon() {
                    if (MS.Entertainment.Utilities.isMusicApp)
                        this.currentAppIconClass = "snappedAppIcon snappedMusicAppIcon";
                    else if (MS.Entertainment.Utilities.isVideoApp)
                        this.currentAppIconClass = "snappedAppIcon snappedVideoAppIcon";
                    else
                        this.currentAppIconClass = "snappedAppIcon snappedGenericAppIcon"
                }, _detachBindings: function _detachBindings() {
                    this._bindingsToDetach.forEach(function(e) {
                        e.source.unbind(e.name, e.action)
                    });
                    this._bindingsToDetach = []
                }, _initializeBinding: function _initializeBinding(source, name, action) {
                    source.bind(name, action);
                    this._bindingsToDetach.push({
                        source: source, name: name, action: action
                    })
                }, unload: function unload() {
                    if (this._deferredUpdateTimer) {
                        this._deferredUpdateTimer.cancel();
                        this._deferredUpdateTimer = null
                    }
                    this._detachBindings();
                    var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                    if (appBar && appBar.hide)
                        appBar.hide();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _playbackSessionChanged: function _playbackSessionChanged() {
                    this._detachBindings();
                    this._snappedDetails.playbackSession = this.playbackSession;
                    if (this.playbackSession) {
                        var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._initializeBinding(uiStateService, "isSnapped", function isSnappedChanged() {
                            if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped) {
                                this.visible = false;
                                if (this._nowPlayingThumbnail.children.length > 0) {
                                    var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                                    if (appBar && appBar.repossessNowPlaying)
                                        appBar.repossessNowPlaying()
                                }
                            }
                        }.bind(this));
                        this._initializeBinding(this.playbackSession, "currentMedia", this._mediaChanged.bind(this));
                        this._initializeBinding(this.playbackSession, "currentTransportState", this._mediaStateChanged.bind(this))
                    }
                }, repossessNowPlaying: function repossessNowPlaying() {
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    sessionMgr.relocateSession(this._nowPlayingThumbnail, false)
                }, _mediaChanged: function _mediaChanged() {
                    this._snappedDetails.updateModelItem(this.playbackSession.currentMedia);
                    this._nowPlayingMetadata.modelItem = this.playbackSession.currentMedia;
                    if (this.playbackSession.currentMedia) {
                        this.appIconVisible = false;
                        this.videoMiniSnappedViewVisible = false;
                        var appBar = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appBar && appBar.show)
                            appBar.show();
                        this.repossessNowPlaying();
                        MS.Entertainment.Platform.PlaybackHelpers.getVideoRatingImageAsync().done(function getRatingImageComplete(ratingImage) {
                            if (ratingImage === String.empty) {
                                this.ratingImage = String.empty;
                                this.ratingImageVisible = false
                            }
                            else {
                                this.ratingImage = ratingImage;
                                this.ratingImageVisible = true
                            }
                        }.bind(this), function getRatingImageError() {
                            this.ratingImage = String.empty
                        }.bind(this))
                    }
                    else if (Windows.UI.ViewManagement.ViewSizePreference && MS.Entertainment.Utilities.isVideoApp1) {
                        this.appIconVisible = false;
                        this.videoMiniSnappedViewVisible = true
                    }
                    else {
                        this.appIconVisible = true;
                        this.unsnapButtonVisible = true
                    }
                }, _mediaStateChanged: function _mediaStateChanged() {
                    this._updateStates()
                }, _updateStates: function _updateStates() {
                    if (this._deferredUpdateTimer)
                        return;
                    this._deferredUpdateTimer = WinJS.Promise.timeout(MS.Entertainment.Platform.PlaybackHelpers.deferredUpdateTimeout).then(this._updateStatesDeferred.bind(this))
                }, _updateStatesDeferred: function _updateStatesDeferred() {
                    this._deferredUpdateTimer = null;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    this.enabled = this.playbackSession && this.playbackSession.currentMedia;
                    this.videoVisible = false;
                    this.artVisible = false;
                    this.toggleButtonVisible = true;
                    if (this.playbackSession && this.playbackSession.currentMedia)
                        switch (this.playbackSession.currentMedia.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                this.artVisible = true;
                                this.videoVisible = false;
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.video:
                                this.videoHeight = (this.playbackSession.videoHeight * (320 / this.playbackSession.videoWidth)) + "px";
                                this.videoVisible = true;
                                this.artVisible = false;
                                break;
                            case Microsoft.Entertainment.Queries.ObjectType.game:
                                if (this.playbackSession.canControlMedia) {
                                    this.videoHeight = (this.playbackSession.videoHeight * (320 / this.playbackSession.videoWidth)) + "px";
                                    this.videoVisible = true;
                                    this.artVisible = false
                                }
                                break;
                            default:
                                break
                        }
                }, ratingImageVisible: {
                    get: function() {
                        return this._ratingImageVisible
                    }, set: function(value) {
                            if (this._ratingImageVisible !== value) {
                                this._ratingImageVisible = value;
                                if (this._ratingImageVisiblePromise) {
                                    this._ratingImageVisiblePromise.cancel();
                                    this._ratingImageVisiblePromise = null
                                }
                                this._ratingImageVisiblePromise = MS.Entertainment.Utilities.toggleDisplayCollapseElement(this._ratingImageContainer, value).then(function clearPromise() {
                                    this._ratingImageVisiblePromise = null
                                }.bind(this), function ignoreError(){})
                            }
                        }
                }, ratingImage: {
                    get: function() {
                        return this._ratingImage
                    }, set: function(value) {
                            this._ratingImageUrl = value;
                            this.updateAndNotify("videoRatingImage", value)
                        }
                }
        }, {
            visible: false, enabled: false, playbackSession: null, options: null, appIconVisible: true, videoMiniSnappedViewVisible: false, unsnapButtonVisible: MS.Entertainment.Utilities.isVideoApp2, toggleButtonVisible: false, detailsVisible: !MS.Entertainment.Utilities.isVideoApp2, artVisible: false, videoVisible: false, videoHeight: "240px", backgroundVisible: false, nowPlayingImageUri: String.empty, backgroundImageUri: String.empty, currentAppIconClass: String.empty, secondaryTextVisible: false, unsnapVoicePhrase: String.empty, unsnapVoicePhoneticPhrase: String.empty, unsnapVoiceConfidence: String.empty, appIconClick: function appIconClick() {
                    var appView = Windows.UI.ViewManagement.ApplicationView;
                    if (appView)
                        if (Windows.Xbox)
                            appView.tryUnsnapToFullscreen();
                        else
                            appView.tryUnsnap()
                }
        })})
})()
