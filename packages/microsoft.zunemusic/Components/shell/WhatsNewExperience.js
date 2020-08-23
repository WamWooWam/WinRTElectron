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
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Shell;
            (function(Shell) {
                var WhatsNew;
                (function(WhatsNew) {
                    var WHATSNEW_NOTIFICATION_CATEGORY = "WhatsNewNotificationCategory";
                    var WHATS_NEW_TOP_POSITION = 80;
                    (function(DisplayType) {
                        DisplayType[DisplayType["none"] = 0] = "none";
                        DisplayType[DisplayType["notification"] = 1] = "notification";
                        DisplayType[DisplayType["dialog"] = 2] = "dialog"
                    })(WhatsNew.DisplayType || (WhatsNew.DisplayType = {}));
                    var DisplayType = WhatsNew.DisplayType;
                    var WhatsNewExperience = (function(_super) {
                            __extends(WhatsNewExperience, _super);
                            function WhatsNewExperience() {
                                _super.call(this);
                                this._incrementedLaunchCount = false;
                                this._config = new Microsoft.Entertainment.Configuration.ConfigurationManager
                            }
                            WhatsNewExperience.prototype.getWhatsNewDisplayType = function() {
                                if (this._config.fue.showLXFUE) {
                                    this.markAsShown();
                                    return 0
                                }
                                if (this._config.shell.suppressWhatsNewShownForRelease)
                                    return 0;
                                var currentWhatsNewRelease = this._config.shell.whatsNewReleaseName;
                                var whatsNewShownForRelease = this._config.shell.whatsNewShownForRelease;
                                if (currentWhatsNewRelease === whatsNewShownForRelease)
                                    return 0;
                                var uiState;
                                uiState = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                                if (!this.getWhatsNewStrings().length)
                                    return 0;
                                if (uiState.activationKind === Windows.ApplicationModel.Activation.ActivationKind.launch)
                                    return 1 | 2;
                                MS.Entertainment.UI.assert(uiState.activationKind !== Windows.ApplicationModel.Activation.ActivationKind.launch, "Launch activation kind should be handled before getting here. After assumes non-launch activation");
                                if (this._getWhatsNewNonLaunchCount() >= 3) {
                                    this.markAsShown();
                                    return 0
                                }
                                this._updateWhatsNewNonLaunchCount();
                                return 1
                            };
                            WhatsNewExperience.prototype.resetState = function(releaseName) {
                                this._config.shell.whatsNewNonLaunchCountData = String.empty;
                                this._config.shell.whatsNewReleaseName = releaseName;
                                this._config.shell.suppressWhatsNewShownForRelease = false;
                                this._config.shell.whatsNewShownForRelease = String.empty
                            };
                            WhatsNewExperience.prototype.markAsShown = function() {
                                this._config.shell.whatsNewShownForRelease = this._config.shell.whatsNewReleaseName;
                                this._config.shell.whatsNewNonLaunchCountData = String.empty
                            };
                            WhatsNewExperience.prototype._getWhatsNewNonLaunchCount = function() {
                                var countForRelease = this._deserializeWhatsNewNonLaunchCount();
                                return countForRelease.count
                            };
                            WhatsNewExperience.prototype._deserializeWhatsNewNonLaunchCount = function() {
                                var currentCountRawValue = this._config.shell.whatsNewNonLaunchCountData;
                                var countForRelease;
                                if (currentCountRawValue)
                                    try {
                                        countForRelease = JSON.parse(currentCountRawValue)
                                    }
                                    catch(e) {}
                                if (!countForRelease)
                                    countForRelease = {
                                        release: this._config.shell.whatsNewReleaseName, count: 0
                                    };
                                if (countForRelease.release !== this._config.shell.whatsNewReleaseName) {
                                    countForRelease.release = this._config.shell.whatsNewReleaseName;
                                    countForRelease.count = 0
                                }
                                return countForRelease
                            };
                            WhatsNewExperience.prototype._updateWhatsNewNonLaunchCount = function() {
                                if (this._incrementedLaunchCount)
                                    return;
                                var countForRelease = this._deserializeWhatsNewNonLaunchCount();
                                countForRelease.count++;
                                this._incrementedLaunchCount = true;
                                this._config.shell.whatsNewNonLaunchCountData = JSON.stringify(countForRelease)
                            };
                            WhatsNewExperience.prototype.getWhatsNewStrings = function() {
                                var whatsNewStringsForMusic = this._config.shell.whatsNewStringIdsForMusic;
                                var featureStringMap;
                                if (whatsNewStringsForMusic)
                                    try {
                                        featureStringMap = JSON.parse(whatsNewStringsForMusic)
                                    }
                                    catch(e) {}
                                featureStringMap = featureStringMap || {};
                                var stringIds = [];
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                Object.keys(featureStringMap).forEach(function(key) {
                                    if (key === "all") {
                                        stringIds = stringIds.concat(featureStringMap[key]);
                                        return
                                    }
                                    var feature = Microsoft.Entertainment.FeatureEnablement.FeatureItem[key];
                                    if (!feature) {
                                        MS.Entertainment.UI.fail("Unexpected / unknown feature (" + key + ") while getting whats new strings");
                                        return
                                    }
                                    if (!featureEnablement.isEnabled(feature))
                                        return;
                                    stringIds = stringIds.concat(featureStringMap[key])
                                });
                                return stringIds
                            };
                            WhatsNewExperience.prototype._showWhatsNewFlyout = function() {
                                var _this = this;
                                var whatsNewStrings = this.getWhatsNewStrings();
                                var whatsNewTitle;
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                    whatsNewTitle = String.load(String.id.IDS_WHATSNEW_XBOX_MUSIC_POPUP_TITLE);
                                else
                                    whatsNewTitle = String.load(String.id.IDS_WHATSNEW_MUSIC_POPUP_TITLE);
                                var currentVersion = Windows.ApplicationModel.Package.current.id.version;
                                if (currentVersion)
                                    whatsNewTitle = whatsNewTitle.format(currentVersion.major, currentVersion.minor, currentVersion.build);
                                else
                                    whatsNewTitle = String.empty;
                                var whatsNewMessages = [];
                                whatsNewStrings.forEach(function(stringId) {
                                    whatsNewMessages.push({message: String.load(stringId)})
                                });
                                var dialogPlacement = null;
                                var gutter = "30px";
                                if (MS.Entertainment.Utilities.getTextDirection() === MS.Entertainment.Utilities.TextDirections.RightToLeft)
                                    dialogPlacement = {
                                        left: gutter, top: WHATS_NEW_TOP_POSITION + "px", right: String.empty, bottom: String.empty
                                    };
                                else
                                    dialogPlacement = {
                                        right: gutter, top: WHATS_NEW_TOP_POSITION + "px", left: String.empty, bottom: String.empty
                                    };
                                var whatsNewDisplayStart = Date.now();
                                var whatsNewOverlay = MS.Entertainment.UI.Shell.createOverlay("MS.Entertainment.UI.Shell.WhatsNew.WhatsNewDisplay", {
                                        titleText: whatsNewTitle, whatsNewStrings: whatsNewMessages
                                    }, dialogPlacement);
                                whatsNewOverlay.show().done(function() {
                                    var duration = Date.now() - whatsNewDisplayStart;
                                    var telemetryParameterArray = [{
                                                parameterName: MS.Entertainment.Utilities.Telemetry.TelemetryParameterNames.WhatsNewShownDuration, parameterValue: duration
                                            }];
                                    MS.Entertainment.Utilities.Telemetry.logTelemetryEventWithParameterArray(MS.Entertainment.Utilities.Telemetry.TelemetryEvents.WhatsNewDismissed, telemetryParameterArray);
                                    var appNotification;
                                    appNotification = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                                    appNotification.removeNotificationByCategory(WHATSNEW_NOTIFICATION_CATEGORY);
                                    _this.markAsShown()
                                })
                            };
                            WhatsNewExperience.prototype._showWhatsNewNotification = function(showCallToAction) {
                                var _this = this;
                                if (!MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appNotification))
                                    return;
                                var title;
                                var subTitle = String.load(String.id.IDS_WHATSNEW_NOTIFICATION_SUBTITLE);
                                var appNotification;
                                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace))
                                    title = String.load(String.id.IDS_WHATSNEW_XBOX_MUSIC_NOTIFICATION_TITLE);
                                else
                                    title = String.load(String.id.IDS_WHATSNEW_MUSIC_NOTIFICATION_TITLE);
                                appNotification = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                                var notification = new MS.Entertainment.UI.Notification({
                                        title: title, subTitle: (showCallToAction ? subTitle : String.empty), isPersistent: true, category: WHATSNEW_NOTIFICATION_CATEGORY, notificationType: MS.Entertainment.UI.Notification.Type.Informational, action: WinJS.Utilities.markSupportedForProcessing(function() {
                                                _this._showWhatsNewFlyout()
                                            })
                                    });
                                appNotification.send(notification)
                            };
                            WhatsNewExperience.showWhatsNewIfNeeded = function() {
                                var whatsNew = new WhatsNewExperience;
                                var displayTypes = whatsNew.getWhatsNewDisplayType();
                                if (displayTypes === 0)
                                    return;
                                var showDialog = displayTypes & 2;
                                if (displayTypes & 1)
                                    whatsNew._showWhatsNewNotification(!showDialog);
                                if (showDialog)
                                    whatsNew._showWhatsNewFlyout()
                            };
                            return WhatsNewExperience
                        })(MS.Entertainment.UI.Framework.ObservableBase);
                    WhatsNew.WhatsNewExperience = WhatsNewExperience
                })(WhatsNew = Shell.WhatsNew || (Shell.WhatsNew = {}))
            })(Shell = UI.Shell || (UI.Shell = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
