/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.ViewModels.SmartAppbarActions", {
        defaultActions: {
            _defaultActions: null, get: function() {
                    if (!MS.Entertainment.ViewModels.SmartAppbarActions._defaultActions)
                        MS.Entertainment.ViewModels.SmartAppbarActions._defaultActions = [MS.Entertainment.UI.AppBarActions.openFile];
                    return MS.Entertainment.ViewModels.SmartAppbarActions._defaultActions
                }
        }, setDefaultGalleryEventHandlers: function setDefaultGalleryEventHandlers(clearSelectionCallback, removeCompleteCallback) {
                return {}
            }, _appBarActions: null, getAppbarActions: function getAppbarActions() {
                if (MS.Entertainment.ViewModels.SmartAppbarActions._appBarActions)
                    return MS.Entertainment.ViewModels.SmartAppbarActions._appBarActions;
                MS.Entertainment.ViewModels.SmartAppbarActions._appBarActions = [MS.Entertainment.UI.Components.Shell.OpenFileAction.getOpenFileAction(), ];
                return MS.Entertainment.ViewModels.SmartAppbarActions._appBarActions
            }
    })
})()
