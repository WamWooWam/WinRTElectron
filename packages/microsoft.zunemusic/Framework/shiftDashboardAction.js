/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator();
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ShiftDashboard: MS.Entertainment.deferredDerive("MS.Entertainment.UI.Actions.Action", function shiftDashboardConstructor() {
            this.base()
        }, {
            executed: function executed(param) {
                var dashboard = document.querySelector(".dashboard");
                if (dashboard)
                    dashboard.winControl.shift(param)
            }, canExecute: function canExecute() {
                    return !!document.querySelector(".dashboard")
                }
        }, {Direction: {
                left: "left", right: "right"
            }})});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.shiftDashboard, function() {
        return new MS.Entertainment.UI.Actions.ShiftDashboard
    })
})()
