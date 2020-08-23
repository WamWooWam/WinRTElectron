/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/debug.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {
        _convertError: function _convertError(errorCode) {
            switch (errorCode) {
                case MS.Entertainment.Platform.Playback.Error.MF_E_UNSUPPORTED_CONTENT_PROTECTION_SYSTEM.code:
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    errorCode = signIn.isSignedIn ? errorCode : MS.Entertainment.Platform.Playback.Error.NS_E_WMP_DRM_LICENSE_NOTACQUIRED.code;
                    return errorCode;
                default:
                    return errorCode
            }
            {}
        }, oldShowError: MS.Entertainment.UI.Shell.showError, showError: function showError(caption, error, subTitle, postpendedText) {
                var errorPromise;
                var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                var displayError = !uiStateService.isSnapped;
                if (uiStateService.isSnapped && error === MS.Entertainment.Platform.Playback.Error.E_MDS_UNAUTHENTICATED_TRACK_LIMIT.code) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlayAnonAds))
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits)) {
                            var appView = Windows.UI.ViewManagement.ApplicationView;
                            appView.tryUnsnap();
                            displayError = true
                        }
                }
                if (displayError) {
                    error = MS.Entertainment.UI.Shell._convertError(error);
                    errorPromise = MS.Entertainment.UI.Shell._handleSpecificError(error);
                    if (!errorPromise)
                        errorPromise = MS.Entertainment.UI.Shell.oldShowError(caption, error, subTitle, postpendedText)
                }
                return WinJS.Promise.as(errorPromise)
            }, _handleSpecificError: function _handleSpecificError(errorCode) {
                var showDialogPromise;
                switch (errorCode) {
                    case MS.Entertainment.Platform.Playback.Error.E_MDS_AUTHENTICATED_TRACK_LIMIT.code:
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits)) {
                            var freePlayLimits = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits);
                            showDialogPromise = freePlayLimits.showMonthlyFreeLimitExceededDialog()
                        }
                        break;
                    case MS.Entertainment.Platform.Playback.Error.E_MDS_UNAUTHENTICATED_TRACK_LIMIT.code:
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits)) {
                            var freePlayLimits = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits);
                            showDialogPromise = freePlayLimits.showUnauthenticatedFreeLimitExceededDialog()
                        }
                        break;
                    case MS.Entertainment.Platform.Playback.Error.E_MDS_INDIVIDUAL_TRACK_LIMIT.code:
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits)) {
                            var freePlayLimits = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits);
                            showDialogPromise = freePlayLimits.showFreeTrackLimitExceededDialog()
                        }
                        break;
                    case MS.Entertainment.Platform.Playback.Error.E_MDS_ROAMING_LIMIT.code:
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.freePlayLimits)) {
                            var freePlayLimits = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.freePlayLimits);
                            showDialogPromise = freePlayLimits.showTravelLimitExceededDialog()
                        }
                        break;
                    case MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code:
                        showDialogPromise = MS.Entertainment.Music.MusicBrandDialog.showOfflineDialog();
                        break;
                    case MS.Entertainment.Platform.Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL.code:
                        showDialogPromise = WinJS.Promise.wrap();
                        break;
                    default:
                        break
                }
                return showDialogPromise
            }, smartDjDashboardItemSize: {get: function() {
                    if (MS.Entertainment.Utilities.isMusicApp2)
                        return {
                                width: 316, height: 316
                            };
                    else
                        return {
                                width: 135, height: 135
                            }
                }}
    })
})()
