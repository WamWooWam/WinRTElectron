/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
    WinJS.Namespace.define("MS.Entertainment.UI", {ProgressNotificationService: MS.Entertainment.UI.Framework.define(function ProgressNotificationServiceConstructor() {
            this._appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification)
        }, {
            _progressCount: 0, _appNotificationService: null, beginProgress: function beginProgress() {
                    if (this._progressCount === 0)
                        WinJS.Binding.unwrap(this)._sendNotification(true);
                    this._progressCount++
                }, completeProgress: function completeProgress() {
                    MS.Entertainment.UI.assert(this._progressCount > 0, "Progress has already completed");
                    if (this._progressCount <= 0)
                        return;
                    this._progressCount--;
                    if (this._progressCount === 0)
                        WinJS.Binding.unwrap(this)._sendNotification(false)
                }, _sendNotification: function _sendNotification(inProgress) {
                    if (inProgress)
                        this._appNotificationService.send(new MS.Entertainment.UI.Notification({
                            notificationType: MS.Entertainment.UI.Notification.Type.Informational, title: String.empty, subTitle: String.empty, moreDetails: null, icon: WinJS.UI.AppBarIcon.refresh, action: null, category: MS.Entertainment.UI.ProgressNotificationService.NotificationCategory, isPersistent: true, iconClassName: MS.Entertainment.UI.ProgressNotificationService.NotificationIconClass
                        }));
                    else
                        this._appNotificationService.removeNotificationByCategory(MS.Entertainment.UI.ProgressNotificationService.NotificationCategory)
                }
        }, {
            NotificationCategory: "progressNotification", NotificationIconClass: "rotate360Animation"
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.progressNotification, function ProgressNotificationServiceFactory() {
        return new MS.Entertainment.UI.ProgressNotificationService
    })
})()
