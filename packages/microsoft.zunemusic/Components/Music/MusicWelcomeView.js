/* Copyright (C) Microsoft Corporation. All rights reserved. */
this.scriptValidator();
var MS;
(function(MS) {
    var Entertainment;
    (function(Entertainment) {
        var UI;
        (function(UI) {
            var Controls;
            (function(Controls) {
                var MusicWelcomeView = (function() {
                        function MusicWelcomeView(){}
                        MusicWelcomeView.initialize = function() {
                            this.viewModel = this.dataContext;
                            this.closeButton.textContent = MS.Entertainment.UI.Icon.close;
                            this.closeButton.setAttribute("aria-label", String.load(String.id.IDS_CLOSE_BUTTON));
                            var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                            this._uiStateEventHandlers = MS.Entertainment.Utilities.addEventHandlers(uiStateService, {servicesEnabledChanged: this.onServiceEnabledChange.bind(this)});
                            this.viewModel.onActionButtonChange = function(newActionText) {
                                this.welcomePanelButton.textContent = newActionText
                            }
                        };
                        MusicWelcomeView.unload = function() {
                            if (this._uiStateEventHandlers) {
                                this._uiStateEventHandlers.cancel();
                                this._uiStateEventHandlers = null
                            }
                            MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                        };
                        MusicWelcomeView.closeButtonClicked = function() {
                            MS.Entertainment.UI.Framework.assert(this.viewModel, "Cannot close the welcome panel without a view model.");
                            this.viewModel.acknowledgeDismissal();
                            var rootElement = MS.Entertainment.Utilities.findParentElementByClassName(this.domElement, "welcomePanel");
                            if (rootElement && rootElement.parentElement)
                                WinJS.UI.Animation.fadeOut(rootElement).done(function removeElementFromParent() {
                                    if (rootElement && rootElement.parentElement)
                                        rootElement.parentElement.removeChild(rootElement)
                                })
                        };
                        MusicWelcomeView.welcomePanelButtonClicked = function() {
                            MS.Entertainment.UI.Framework.assert(this.viewModel, "Cannot act on the welcome panel without a view model.");
                            this.viewModel.signOrDiveIn()
                        };
                        MusicWelcomeView.onServiceEnabledChange = function(args) {
                            if (args.detail && !args.detail.newValue)
                                this.closeButtonClicked()
                        };
                        return MusicWelcomeView
                    })();
                Controls.MusicWelcomeView = MusicWelcomeView
            })(Controls = UI.Controls || (UI.Controls = {}))
        })(UI = Entertainment.UI || (Entertainment.UI = {}))
    })(Entertainment = MS.Entertainment || (MS.Entertainment = {}))
})(MS || (MS = {}));
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MusicWelcomeView: MS.Entertainment.UI.Framework.defineUserControl("/Components/Music/MusicWelcomeView.html#welcomePanelTwoColumnTemplate", null, MS.Entertainment.UI.Controls.MusicWelcomeView)})
