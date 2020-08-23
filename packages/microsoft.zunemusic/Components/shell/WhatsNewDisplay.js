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
                    var WhatsNewDisplay = (function(_super) {
                            __extends(WhatsNewDisplay, _super);
                            function WhatsNewDisplay(element, options) {
                                _super.call(this, element, options);
                                this._actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions)
                            }
                            Object.defineProperty(WhatsNewDisplay.prototype, "templateStorage", {
                                get: function() {
                                    return "/Components/Shell/WhatsNewDisplay.html"
                                }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(WhatsNewDisplay.prototype, "templateName", {
                                get: function() {
                                    return "control-whatsNewDisplay"
                                }, enumerable: true, configurable: true
                            });
                            WhatsNewDisplay.prototype.initialize = function(){};
                            Object.defineProperty(WhatsNewDisplay.prototype, "titleText", {
                                get: function() {
                                    return this._titleText
                                }, set: function(val) {
                                        this.updateAndNotify("titleText", val)
                                    }, enumerable: true, configurable: true
                            });
                            Object.defineProperty(WhatsNewDisplay.prototype, "whatsNewStrings", {
                                get: function() {
                                    return this._whatsNewStrings
                                }, set: function(val) {
                                        this.updateAndNotify("whatsNewStrings", val)
                                    }, enumerable: true, configurable: true
                            });
                            WhatsNewDisplay.prototype.fullNotesClicked = function(e) {
                                if (e && e.keyCode && !(e.keyCode === WinJS.Utilities.Key.enter || e.keyCode === WinJS.Utilities.Key.space))
                                    return;
                                var webLink = "http://go.microsoft.com/fwlink/?LinkId=335815";
                                var externalNavigationAction = this._actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalNavigate);
                                externalNavigationAction.parameter = webLink;
                                externalNavigationAction.automationId = MS.Entertainment.UI.AutomationIds.whatsNewLink;
                                externalNavigationAction.execute();
                                MS.Entertainment.Utilities.Telemetry.logPageAction({domElement: this._fullReleaseNotesButton}, {
                                    uri: "whatsNewDisplay", pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.Dash
                                }, {
                                    uri: webLink, pageTypeId: MS.Entertainment.Utilities.Telemetry.PageTypeId.WebPage
                                });
                                var domEvent = document.createEvent("Event");
                                domEvent.initEvent("dismissoverlay", true, true);
                                this.domElement.dispatchEvent(domEvent)
                            };
                            return WhatsNewDisplay
                        })(MS.Entertainment.UI.Framework.UserControl);
                    WhatsNew.WhatsNewDisplay = WhatsNewDisplay
                })(WhatsNew = Shell.WhatsNew || (Shell.WhatsNew = {}))
            })(Shell = UI.Shell || (UI.Shell = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}))
