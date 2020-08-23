/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment", {FeatureEnablement: {
            _featureEnablement: null, _featuresChangedCallback: null, initialize: function initialize() {
                    if (!MS.Entertainment.FeatureEnablement._featureEnablement) {
                        MS.Entertainment.FeatureEnablement._featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        MS.Entertainment.FeatureEnablement._featureEnablement.addEventListener("featureschangedevent", MS.Entertainment.FeatureEnablement.featuresChangedHandler, false)
                    }
                }, featuresChangedHandler: function featuresChangedHandler(eventArgs) {
                    var oldFeatures = eventArgs.oldFeatures;
                    var newFeatures = eventArgs.newFeatures;
                    var featuresChanged = false;
                    var featuresDisabled = false;
                    var features = MS.Entertainment.Features.appFeatures || [];
                    for (var i = 0; i < features.length; i++) {
                        var feature = features[i];
                        if (oldFeatures && newFeatures && oldFeatures[feature] !== newFeatures[feature]) {
                            featuresChanged = true;
                            if (oldFeatures[feature] && !newFeatures[feature])
                                featuresDisabled = true
                        }
                    }
                    if (featuresChanged) {
                        if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.appNotification)) {
                            var notification;
                            var notificationType = MS.Entertainment.UI.Notification.Type.Informational;
                            var title = String.load(String.id.IDS_FEATURE_ENABLEMENT_NOTIFICATION_HEADER);
                            var subTitle = featuresDisabled ? String.load(String.id.IDS_FEATURE_ENABLEMENT_NOTIFICATION_MESSAGE_DISABLED) : String.load(String.id.IDS_FEATURE_ENABLEMENT_NOTIFICATION_MESSAGE_ENABLED);
                            var icon = WinJS.UI.AppBarIcon.settings;
                            var category = MS.Entertainment.FeatureEnablement.featureNotificationCategory;
                            var isPersistent = false;
                            notification = new MS.Entertainment.UI.Notification({
                                notificationType: notificationType, title: title, subTitle: subTitle, icon: icon, category: category, isPersistent: isPersistent
                            });
                            var appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                            appNotificationService.send(notification)
                        }
                        if (MS.Entertainment.Features.refreshApp)
                            MS.Entertainment.Features.refreshApp()
                    }
                    if (MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.upgradeReminderDisplayer))
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.upgradeReminderDisplayer).checkAndRunUpgradeReminder(true);
                    if (MS.Entertainment.FeatureEnablement._featuresChangedCallback)
                        MS.Entertainment.FeatureEnablement._featuresChangedCallback()
                }, setFeaturesChangedCallback: function setFeaturesChangedCallback(callback) {
                    MS.Entertainment.FeatureEnablement._featuresChangedCallback = callback
                }, featureNotificationCategory: "FeaturesChangedNotification"
        }})
})()
