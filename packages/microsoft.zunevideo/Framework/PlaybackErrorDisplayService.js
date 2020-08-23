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
    (function(Entertainment) {
        (function(UI) {
            var BasePlaybackErrorDisplayServiceImpl = (function() {
                    function BasePlaybackErrorDisplayServiceImpl(){}
                    BasePlaybackErrorDisplayServiceImpl.prototype.postErrorNavigationHandler = function(errorCode, isCritical){};
                    return BasePlaybackErrorDisplayServiceImpl
                })();
            UI.BasePlaybackErrorDisplayServiceImpl = BasePlaybackErrorDisplayServiceImpl;
            var VideoPlaybackErrorDisplayServiceImpl = (function(_super) {
                    __extends(VideoPlaybackErrorDisplayServiceImpl, _super);
                    function VideoPlaybackErrorDisplayServiceImpl() {
                        _super.apply(this, arguments)
                    }
                    VideoPlaybackErrorDisplayServiceImpl.prototype.postErrorNavigationHandler = function(errorCode, isCritical) {
                        try {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            if (navigationService && navigationService.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.fullScreenNowPlaying)
                                navigationService.navigateBack();
                            else if (navigationService && navigationService.currentPage.iaNode.moniker === MS.Entertainment.UI.Monikers.homeHub) {
                                var appContainer = document.querySelector(".control-app");
                                MS.Entertainment.Utilities.toggleDisplayCollapseElement(appContainer, true)
                            }
                        }
                        catch(exception) {}
                    };
                    return VideoPlaybackErrorDisplayServiceImpl
                })(BasePlaybackErrorDisplayServiceImpl);
            UI.VideoPlaybackErrorDisplayServiceImpl = VideoPlaybackErrorDisplayServiceImpl;
            function createPlaybackErrorDisplayServiceImpl() {
                if (MS.Entertainment.Utilities.isVideoApp)
                    return new VideoPlaybackErrorDisplayServiceImpl;
                return new BasePlaybackErrorDisplayServiceImpl
            }
            var PlaybackErrorDisplayService = (function() {
                    function PlaybackErrorDisplayService() {
                        this._playbackSession = null;
                        this._sessionMgr = null;
                        this._sessionEventHandlers = null;
                        this._uiStateService = null;
                        this._primarySessionIdBinding = null;
                        this._initialized = false;
                        this.suppressNextPlaybackErrorDialog = false;
                        this.showDialogForNonCriticalErrors = false;
                        this._impl = createPlaybackErrorDisplayServiceImpl()
                    }
                    PlaybackErrorDisplayService.prototype.initialize = function() {
                        var _this = this;
                        if (this._initialized)
                            return;
                        this._uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                        this._sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        this._primarySessionIdBinding = WinJS.Binding.bind(this._uiStateService, {primarySessionId: function() {
                                _this.playbackSession = _this._sessionMgr.primarySession
                            }});
                        if (this.playbackSession.error)
                            this._handlePlaybackError(this.playbackSession.error);
                        this._initialized = true
                    };
                    PlaybackErrorDisplayService.prototype.dispose = function() {
                        this._detachBindings();
                        if (this._primarySessionIdBinding) {
                            this._primarySessionIdBinding.cancel();
                            this._primarySessionIdBinding = null
                        }
                    };
                    Object.defineProperty(PlaybackErrorDisplayService.prototype, "playbackSession", {
                        get: function() {
                            return this._playbackSession
                        }, set: function(newValue) {
                                this._playbackSession = newValue;
                                this._detachBindings();
                                this._sessionEventHandlers = MS.Entertainment.Utilities.addEvents(this.playbackSession, {errorChanged: this._errorStateChanged.bind(this)})
                            }, enumerable: true, configurable: true
                    });
                    PlaybackErrorDisplayService.prototype._errorStateChanged = function(e) {
                        var newVal = e.detail.newValue;
                        if (newVal)
                            this._handlePlaybackError(newVal)
                    };
                    PlaybackErrorDisplayService.prototype._detachBindings = function() {
                        if (this._sessionEventHandlers) {
                            this._sessionEventHandlers.cancel();
                            this._sessionEventHandlers = null
                        }
                    };
                    PlaybackErrorDisplayService.prototype._handlePlaybackError = function(errorDescriptor) {
                        if (this.playbackSession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying) {
                            var error = errorDescriptor;
                            var errorCode = MS.Entertainment.Platform.Playback._mapMediaElementErrorCodes(error.code, error.msExtendedCode);
                            var isCritical = errorDescriptor.isCritical;
                            var postpendedText = errorDescriptor.postPendedText;
                            var additionalButton = this._createAdditionalButtonForError(error.msExtendedCode);
                            this._displayError(errorCode, isCritical, postpendedText, additionalButton)
                        }
                    };
                    PlaybackErrorDisplayService.prototype._displayError = function(errorCode, isCritical, postpendedText, additionalButton) {
                        if (!this.suppressNextPlaybackErrorDialog && !this._shouldIgnoreThisError(errorCode)) {
                            var title = this._getErrorDialogTitle(errorCode);
                            MS.Entertainment.UI.Shell.showError(title, errorCode, null, postpendedText, additionalButton).done(this._impl.postErrorNavigationHandler.bind(this._impl, errorCode, isCritical))
                        }
                        this.suppressNextPlaybackErrorDialog = false
                    };
                    PlaybackErrorDisplayService.prototype._getErrorDialogTitle = function(errorCode) {
                        var title;
                        if (MS.Entertainment.Utilities.isVideoApp)
                            switch (errorCode) {
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_E_UNEXPECTED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREACHABLE_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_DEVICES_REACHED.code:
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_ADDED_PER_MONTH_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_DEVICELIMIT_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_PCS_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_DEVICELIMIT_MAXPC_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_PHONES_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_DEVICELIMIT_MAXPHONE_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_TABLETS_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_DEVICELIMIT_MAXTABLET_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_CONSOLES_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_DEVICELIMIT_MAXCONSOLES_ERROR_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.DEVICEGROUP_MAX_REMOVED_PER_MONTH_REACHED.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_UNREGISTERDEVICE_TIMELIMIT_ERROR_NOTIME_HEADER);
                                    break;
                                case MS.Entertainment.Platform.Playback.DeviceGroupError.MARKETPLACE_LICENSING_DEVICE_NOT_IN_DEVICEGROUP.code:
                                    title = String.load(String.id.IDS_VIDEO_TH_DEVICEDOMAIN_OFFLINE_ERROR_HEADER);
                                    break;
                                default:
                                    title = String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE);
                                    break
                            }
                        else
                            title = String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE);
                        return title
                    };
                    PlaybackErrorDisplayService.prototype._shouldIgnoreThisError = function(errorCode) {
                        var shouldIgnoreThisError = false;
                        if (MS.Entertainment.Utilities.isVideoApp2) {
                            if (errorCode === MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_HDMI_OUTPUT_LOST.code)
                                shouldIgnoreThisError = true
                        }
                        else if (MS.Entertainment.Utilities.isAmsterdamApp)
                            if (this._uiStateService.isSnapped)
                                shouldIgnoreThisError = true;
                        return shouldIgnoreThisError
                    };
                    PlaybackErrorDisplayService.prototype._createAdditionalButtonForError = function(errorCode) {
                        if (errorCode)
                            switch (errorCode) {
                                case MS.Entertainment.Platform.Playback.Error.ZEST_E_UNAUTHENTICATED.code:
                                    if (MS.Entertainment.Utilities.isApp2) {
                                        var appSignIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                        return {
                                                title: String.load(String.id.IDS_APP2_GLOBAL_COMMAND_SIGN_IN_VUI_GUI), execute: MS.Entertainment.UI.Shell.AccountPicker.showAccountPickerAsync
                                            }
                                    }
                                    break
                            }
                        return null
                    };
                    return PlaybackErrorDisplayService
                })();
            UI.PlaybackErrorDisplayService = PlaybackErrorDisplayService;
            var CriticalOnlyPlaybackErrorDisplayService = (function(_super) {
                    __extends(CriticalOnlyPlaybackErrorDisplayService, _super);
                    function CriticalOnlyPlaybackErrorDisplayService() {
                        _super.call(this);
                        this._errorPromise = null
                    }
                    CriticalOnlyPlaybackErrorDisplayService.prototype._displayError = function(errorCode, isCritical, postpendedText) {
                        if (this.playbackSession.sessionId === MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying) {
                            if (isCritical || this.showDialogForNonCriticalErrors) {
                                if (this._errorPromise) {
                                    this._errorPromise.cancel();
                                    this._errorPromise = null
                                }
                                this._errorPromise = WinJS.Promise.timeout(30).then(function showError() {
                                    MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_PLAYBACK_ERROR_MESSAGE_TITLE), errorCode, null, postpendedText)
                                })
                            }
                            this.showDialogForNonCriticalErrors = false
                        }
                    };
                    return CriticalOnlyPlaybackErrorDisplayService
                })(PlaybackErrorDisplayService);
            UI.CriticalOnlyPlaybackErrorDisplayService = CriticalOnlyPlaybackErrorDisplayService;
            MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.playbackErrorDisplayService, function createPlaybackErrorDisplayService() {
                if (MS.Entertainment.Utilities.isMusicApp)
                    return new MS.Entertainment.UI.CriticalOnlyPlaybackErrorDisplayService;
                else
                    return new MS.Entertainment.UI.PlaybackErrorDisplayService
            })
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}))
