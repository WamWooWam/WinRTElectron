/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    WinJS.Namespace.define("MS.Entertainment.UI.Shell", {createShellKeyboardShortcuts: function createShellKeyboardShortcuts() {
            var openFileAction;
            var navigateBackAction;
            var shortcutManager = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shortcutManager);
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            var monikers = MS.Entertainment.UI.Monikers;
            if (actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate) && MS.Entertainment.ServiceLocator.isServiceRegistered(MS.Entertainment.Services.navigation)) {
                navigateBackAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                navigateBackAction.automationId = "keyboardNavigateBack";
                navigateBackAction.parameter = MS.Entertainment.UI.Actions.navigate.NavigateLocation.back
            }
            if (MS.Entertainment.Utilities.isApp2) {
                if (actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.invokeGlobalCommand)) {
                    var invokeGlobalCommandAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.invokeGlobalCommand);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.invokeGlobalCommand, allowInEditControls: false
                    }, invokeGlobalCommandAction);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        alt: true, key: WinJS.Utilities.Key.enter, allowInEditControls: false
                    }, invokeGlobalCommandAction)
                }
                if (actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.search)) {
                    var startSearch = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search);
                    startSearch.startWithExistingQuery = true;
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.searchButton, allowInEditControls: false
                    }, startSearch);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        alt: true, key: WinJS.Utilities.Key.y, allowInEditControls: false
                    }, startSearch)
                }
                if (navigateBackAction)
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.dismissButton, allowInEditControls: false
                    }, navigateBackAction);
                if (MS.Entertainment.Utilities.isMusicApp2) {
                    var skipBackwardAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.skipBackward);
                    var skipForwardAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.skipForward);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.ltButton, allowInEditControls: false
                    }, skipBackwardAction);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.pageUp, allowInEditControls: false
                    }, skipBackwardAction);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.rtButton, allowInEditControls: false
                    }, skipForwardAction);
                    shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                        key: WinJS.Utilities.Key.pageDown, allowInEditControls: false
                    }, skipForwardAction)
                }
            }
            else if (MS.Entertainment.Utilities.isVideoApp) {
                openFileAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.openFile);
                shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                    ctrl: true, key: WinJS.Utilities.Key.o, allowInEditControls: false
                }, openFileAction)
            }
            if (navigateBackAction && !window.onNewVideoPage) {
                shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                    ctrl: true, key: WinJS.Utilities.Key.b, allowInEditControls: false
                }, navigateBackAction);
                shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                    key: WinJS.Utilities.Key.backspace, allowInEditControls: false
                }, navigateBackAction);
                shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                    alt: true, key: WinJS.Utilities.Key.leftArrow, allowInEditControls: false
                }, navigateBackAction);
                shortcutManager.registerShortcut(MS.Entertainment.Framework.ShortcutCategory.keyboardShortcut, {
                    key: WinJS.Utilities.Key.browserBack, allowInEditControls: false
                }, navigateBackAction)
            }
        }})
})()
