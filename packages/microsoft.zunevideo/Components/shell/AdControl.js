/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
(function() {
    "use strict";
    var uacConsoleErrorMap = {
            ClientConfiguration: "clientConfiguration", ServerSideError: "serverSideError", InvalidServerResponse: "invalidServerResponse", NoAdAvailable: "noAdAvailable", NetworkConnectionFailure: "networkConnectionFailure", RefreshNotAllowed: "refreshNotAllowed", Other: "other", Unknown: "unknown"
        };
    WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
        AdControl: MS.Entertainment.UI.Framework.defineUserControl(null, function adControlConstructor() {
            this._eventProvider = new Diagnostics.Tracing.Microsoft.Entertainment.Instrumentation.Providers.Shell
        }, {
            ad: null, applicationId: null, adUnitId: null, countryOrRegion: null, isAutoRefreshEnabled: true, hideAdLabel: false, passThroughClickEvents: false, template: "/Components/Shell/AdControl.html#adControlTemplate", _errorValues: null, _eventProvider: null, _frozen: false, _errorOccurred: false, _uiStateServiceBinding: null, _resizeEventHandler: null, _clickEventHandler: null, initialize: function initialize() {
                    WinJS.Promise.timeout(MS.Entertainment.UI.Components.Shell.AdControl._createAdControlDelay).done(function timeoutComplete() {
                        if (this._unloaded || !this.domElement)
                            return;
                        if (MS.Entertainment.Utilities.isMusicApp1) {
                            var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateServiceBinding = WinJS.Binding.bind(uiState, {shouldShowAdsForFreePlay: this._showAdsForFreePlayChanged.bind(this)})
                        }
                        else
                            this._loadAdControl()
                    }.bind(this))
                }, _showAdsForFreePlayChanged: function() {
                    var uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (!uiState.shouldShowAdsForFreePlay || !this.domElement || this._unloaded)
                        return;
                    if (this._isVisible)
                        this._loadAdControl();
                    else if (!this._resizeEventHandler)
                        this._resizeEventHandler = MS.Entertainment.Utilities.attachResizeEvent(this.domElement, function onResize() {
                            if (this._isVisible && uiState.shouldShowAdsForFreePlay) {
                                this._clearResizeEventHandler();
                                this._loadAdControl()
                            }
                        }.bind(this))
                }, _isVisible: {get: function() {
                        return (!this._unloaded && this.domElement && this.domElement.clientWidth > 0 && this.domElement.clientHeight > 0)
                    }}, _loadAdControl: function _loadAdControl() {
                    if (this._unloaded || !this.domElement)
                        return;
                    var regionCode;
                    var languageCode;
                    var globalizationManager = new Microsoft.Entertainment.Util.GlobalizationManager;
                    regionCode = globalizationManager.getRegion();
                    var resourceLanguage = MS.Entertainment.Utilities.getResourceLanguage();
                    languageCode = MS.Entertainment.Utilities.getLanguageCodeFromLocale(resourceLanguage);
                    this.countryOrRegion = regionCode;
                    this.applicationId = MS.Entertainment.UI.Components.Shell.AdControl._getAdApplicationId();
                    this.adUnitId = MS.Entertainment.UI.Components.Shell.AdControl._getAdUnitId(this.ad, regionCode, languageCode);
                    var loadTemplatePromise;
                    if (this.adUnitId && this.applicationId)
                        loadTemplatePromise = MS.Entertainment.UI.Framework.loadTemplate(this.template);
                    else
                        loadTemplatePromise = WinJS.Promise.wrap();
                    loadTemplatePromise.then(function loadTemplateComplete(templateInstance) {
                        if (!this._unloaded && templateInstance)
                            return templateInstance.render(this, this.domElement);
                        else
                            return WinJS.Promise.wrap()
                    }.bind(this)).then(function templateRenderComplete() {
                        if (!this._unloaded) {
                            MS.Entertainment.UI.Framework.processDeclMembers(this.domElement, this);
                            if (this.adControl) {
                                if (this._frozen)
                                    this._disableAdControl();
                                if (this.adControl.addAdTag) {
                                    this.adControl.addAdTag("tts", "false");
                                    if (this.hideAdLabel)
                                        this.adControl.addAdTag("adLabel", "false")
                                }
                                this.adControl.onEngagedChanged = function onEngagedChanged() {
                                    if (this.adControl.isEngaged) {
                                        this._pausePlayback();
                                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.typeToSearch))
                                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).disableTypeToSearch()
                                    }
                                    else if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.typeToSearch))
                                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.typeToSearch).enableTypeToSearch()
                                }.bind(this);
                                this._createErrorEnumMap();
                                this.adControl.onErrorOccurred = function onErrorOccurred(ad, error) {
                                    var errorCode = error.errorCode;
                                    if (this._errorValues)
                                        switch (errorCode) {
                                            case this._errorValues.ClientConfiguration:
                                            case this._errorValues.ServerSideError:
                                            case this._errorValues.InvalidServerResponse:
                                                MS.Entertainment.UI.Components.Shell.fail("Ad load failure was encountered.\n\tError: {0}\n\tMessage: {1}".format(error.errorCode, error.errorMessage), null, MS.Entertainment.UI.Debug.errorLevel.low);
                                            case this._errorValues.NoAdAvailable:
                                            case this._errorValues.NetworkConnectionFailure:
                                                this.adLoadFailed = true;
                                                this._hideAdControl();
                                                return;
                                            case this._errorValues.RefreshNotAllowed:
                                                return;
                                            case this._errorValues.Other:
                                            case this._errorValues.Unknown:
                                            default:
                                                break
                                        }
                                    this._errorOccurred = true;
                                    WinJS.Promise.timeout(1000).done(function _setAdFailureState() {
                                        if (this._errorOccurred) {
                                            this.adLoadFailed = true;
                                            this.adLoaded = false;
                                            this._hideAdControl()
                                        }
                                    }.bind(this))
                                }.bind(this);
                                this.adControl.onAdRefreshed = function onAdRefreshed() {
                                    this._errorOccurred = false;
                                    this.adLoadFailed = false;
                                    this.adLoaded = true;
                                    this._showAdControl();
                                    this._clearFocusAttributeOnAdContainer();
                                    this._eventProvider.traceAdControl_Refreshed(this.applicationId, this.adUnitId)
                                }.bind(this);
                                this._clearFocusAttributeOnAdContainer();
                                if (this.passThroughClickEvents)
                                    this._clickEventHandler = MS.Entertainment.Utilities.addEventHandlers(this.domElement, {click: this._handleClick.bind(this)}, true)
                            }
                        }
                    }.bind(this))
                }, unload: function unload() {
                    if (this.adControl) {
                        this.adControl.dispose();
                        this.adControl = null
                    }
                    if (this._uiStateServiceBinding) {
                        this._uiStateServiceBinding.cancel();
                        this._uiStateServiceBinding = null
                    }
                    if (this._clickEventHandler) {
                        this._clickEventHandler.cancel();
                        this._clickEventHandler = null
                    }
                    this._clearResizeEventHandler();
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _clearResizeEventHandler: function _clearResizeEventHandler() {
                    if (this._resizeEventHandler) {
                        this._resizeEventHandler.cancel();
                        this._resizeEventHandler = null
                    }
                }, _pausePlayback: function _pausePlayback() {
                    var sessionManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (sessionManager && sessionManager.primarySession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying)
                        switch (sessionManager.primarySession.currentTransportState) {
                            case MS.Entertainment.Platform.Playback.TransportState.playing:
                            case MS.Entertainment.Platform.Playback.TransportState.starting:
                            case MS.Entertainment.Platform.Playback.TransportState.buffering:
                                sessionManager.primarySession.targetTransportState = MS.Entertainment.Platform.Playback.TransportState.paused;
                                break
                        }
                }, _hideAdControl: function _hideAdControl() {
                    if (this._unloaded || !MS.Entertainment.Utilities.isApp2)
                        return;
                    WinJS.Utilities.removeClass(this.domElement, "win-focusable");
                    MS.Entertainment.UI.Framework.beginHideAnimations(this.adControlWrapper)
                }, _showAdControl: function _showAdControl() {
                    if (this._unloaded || !MS.Entertainment.Utilities.isApp2)
                        return;
                    WinJS.Utilities.addClass(this.domElement, "win-focusable");
                    MS.Entertainment.UI.Framework.beginShowAnimations(this.adControlWrapper)
                }, _disableAdControl: function _disableAdControl() {
                    if (this.adControl) {
                        if (this.adControl._stopViewableChangeMonitoring)
                            this.adControl._stopViewableChangeMonitoring();
                        if (this.adControl.suspend) {
                            this.adControl.isAutoRefreshEnabled = false;
                            this.adControl.suspend()
                        }
                        if (this.adControl._domElement)
                            WinJS.Utilities.addClass(this.adControl._domElement, "disabledAdControl")
                    }
                    if (this.domElement)
                        this.domElement.disabled = true
                }, _enableAdControl: function _enableAdControl() {
                    if (this.domElement)
                        this.domElement.disabled = false;
                    if (this.adControl) {
                        if (this.adControl._domElement)
                            WinJS.Utilities.removeClass(this.adControl._domElement, "disabledAdControl");
                        if (this.adControl.resume) {
                            this.adControl.resume();
                            this.adControl.isAutoRefreshEnabled = true
                        }
                        if (this.adControl._startViewableChangeMonitoring)
                            this.adControl._startViewableChangeMonitoring()
                    }
                }, _handleClick: function _handleClick() {
                    if (!this._unloaded && this.adControl && this.adControl._click)
                        this.adControl._click()
                }, _clearFocusAttributeOnAdContainer: function _clearFocusAttributeOnAdContainer() {
                    if (this.passThroughClickEvents) {
                        var focusableElement = this.domElement.querySelector("iframe");
                        if (focusableElement)
                            WinJS.Utilities.removeClass(focusableElement, "win-focusable")
                    }
                }, _createErrorEnumMap: function _createErrorEnumMap() {
                    this._errorValues = MS.Entertainment.Utilities.isApp2 ? uacConsoleErrorMap : this.adControl._ERROR_ENUM
                }, freeze: function freeze() {
                    this._frozen = true;
                    WinJS.Promise.timeout(1).done(function() {
                        if (this._frozen)
                            this._disableAdControl()
                    }.bind(this));
                    MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
                }, thaw: function thaw() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                    this._frozen = false;
                    this._enableAdControl()
                }
        }, {
            adLoaded: false, adLoadFailed: false
        }, {
            _createAdControlDelay: 2000, _getAdApplicationId: function _getAdApplicationId() {
                    var adApplicationId;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (MS.Entertainment.Utilities.isVideoApp1)
                        adApplicationId = configurationManager.ads.videoAdApplicationId;
                    else if (MS.Entertainment.Utilities.isVideoApp2)
                        adApplicationId = configurationManager.ads.video2AdApplicationId;
                    else if (MS.Entertainment.Utilities.isMusicApp)
                        adApplicationId = configurationManager.ads.musicAdApplicationId;
                    MS.Entertainment.UI.Components.Shell.assert(adApplicationId, "Ad configuration application id not found.");
                    return adApplicationId
                }, _getAdUnitId: function _getAdUnitId(ad, regionCode, languageCode) {
                    var adUnitId;
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var adIds = configurationManager.ads[ad];
                    MS.Entertainment.UI.Components.Shell.assert(adIds, "Ad configuration unit ids not found: configuration.ads." + ad);
                    if (adIds) {
                        adUnitId = MS.Entertainment.Utilities.getValueFromCsvList(adIds, languageCode + "-" + regionCode);
                        if (!adUnitId)
                            adUnitId = MS.Entertainment.Utilities.getValueFromCsvList(adIds, regionCode)
                    }
                    return adUnitId
                }, AdIds: {
                    musicDashboard: "musicDashboardAdUnitIds", musicPopularSidebar: "musicPopularSidebarAdUnitIds", musicSpotlightSidebar: "musicSpotlightSidebarAdUnitIds", video2DashboardMovie: "video2MovieAdUnitIds", video2DashboardTv: "video2TvAdUnitIds", videoDashboardMovie: "videoMovieAdUnitIds", videoDashboardTv: "videoTvAdUnitIds"
                }
        }), SidebarAdControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/Shell/AdControl.html#sidebarAdControl", null, {
                _signInBindings: null, _signedInUserBindings: null, initialize: function initialize() {
                        this._adControl.ad = this.ad;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._signInBindings = WinJS.Binding.bind(signIn, {isSignedIn: this._updateSubscriptionLinkVisibility.bind(this)});
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this._signedInUserBindings = WinJS.Binding.bind(signedInUser, {isSubscription: this._updateSubscriptionLinkVisibility.bind(this)});
                        if (this._subscriptionLink && this._subscriptionLink.action)
                            this._subscriptionLink.action.parameter = MS.Entertainment.Music.Freeplay.Events.musicPassUpsellMarketplaceLinkInvoked
                    }, unload: function unload() {
                        if (this._signInBindings) {
                            this._signInBindings.cancel();
                            this._signInBindings = null
                        }
                        if (this._signedInUserBindings) {
                            this._signedInUserBindings.cancel();
                            this._signedInUserBindings = null
                        }
                        MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                    }, _updateSubscriptionLinkVisibility: function _updateSubscriptionLinkVisibility() {
                        if (this._subscriptionLink && this._subscriptionLink.action)
                            this.showSignupLink = this._subscriptionLink.action.canExecute();
                        else
                            this.showSignupLink = false
                    }
            }, {showSignupLink: false})
    })
})()
