/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var Framework;
        (function(Framework) {
            MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
            var UpgradeToBlueNotification = (function() {
                    function UpgradeToBlueNotification(){}
                    Object.defineProperty(UpgradeToBlueNotification, "_isFeatureEnabled", {
                        get: function() {
                            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            return !!(configurationManager.generalSettings.upgradeToBlueUri && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.upgradeToBlue))
                        }, enumerable: true, configurable: true
                    });
                    UpgradeToBlueNotification._launchStoreUpdatePage = function() {
                        var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                        var upgradeToBlueUri = new Windows.Foundation.Uri(configurationManager.generalSettings.upgradeToBlueUri);
                        Windows.System.Launcher.launchUriAsync(upgradeToBlueUri).done(null, function launchUriAsync_error(e) {
                            var message = "Failed to launch the Windows Store to update from 8 to 8.1.";
                            if (e)
                                message += " Error: \"" + e + "\"";
                            MS.Entertainment.Framework.assert(false, message)
                        })
                    };
                    UpgradeToBlueNotification.showNotification = function() {
                        if (MS.Entertainment.Framework.UpgradeToBlueNotification._isFeatureEnabled) {
                            var notification = new MS.Entertainment.UI.Notification({
                                    notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.load(String.id.IDS_UPGRADE_WINDOWS_8_1_NOTIFICATION), subTitle: String.empty, moreDetails: null, icon: WinJS.UI.AppBarIcon.settings, category: this._notificationCategory, isPersistent: true, action: WinJS.Utilities.markSupportedForProcessing(this._launchStoreUpdatePage.bind(this))
                                });
                            var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                            appNotificationService.send(notification)
                        }
                    };
                    UpgradeToBlueNotification._notificationCategory = "UpgradeToBlueNotification";
                    return UpgradeToBlueNotification
                })();
            Framework.UpgradeToBlueNotification = UpgradeToBlueNotification
        })(Framework = Entertainment.Framework || (Entertainment.Framework = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
