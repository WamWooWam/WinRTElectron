//!
//! Copyright (C) Microsoft Corporation.  All rights reserved.
//!
(function(Platform) {"use strict";
    var showMessage = function(title, content, showWarningIcon, onComplete) {
            var md = new AppMagic.Popups.MessageDialog(content, title, showWarningIcon);
            md.showAsync().then(onComplete)
        },
        showMessageWithHelpButton = function(title, content, helpUrl, showWarningIcon, onComplete) {
            var md = new AppMagic.Popups.MessageDialog(content, title, showWarningIcon);
            md.addButton(AppMagic.Strings.LearnMore, function() {
                AppMagic.AuthoringTool.Utility.openLinkInBrowser(helpUrl)
            });
            md.addButton(AppMagic.Strings.Close);
            md.showAsync().then(onComplete)
        },
        showNotification = function(title, content) {
            var notifications = Platform.UI.Notifications,
                notificationManager = notifications.ToastNotificationManager,
                template = notifications.ToastTemplateType.toastText02;
            var toastXml = notificationManager.getTemplateContent(template);
            var textNodes = toastXml.getElementsByTagName("text");
            textNodes[0].appendChild(toastXml.createTextNode(title));
            textNodes[1].appendChild(toastXml.createTextNode(content));
            var toast = new notifications.ToastNotification(toastXml);
            notificationManager.createToastNotifier().show(toast)
        };
    WinJS.Namespace.define("AppMagic.AuthoringTool.PlatformHelpers", {
        showMessage: showMessage, showMessageWithHelpButton: showMessageWithHelpButton, showNotification: showNotification
    })
})(Windows);