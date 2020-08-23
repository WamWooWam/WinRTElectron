/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/Controls/FeaturedContent.js");
(function(undefined) {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {MusicFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.FeaturedContent", null, null, {
            _signedInUserBindings: null, _onScreen: true, viewModel: null, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.assert(this.templates.length % 2 === 0, "Supplied template array has an odd number of templates.");
                    var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                    this._signedInUserBindings = WinJS.Binding.bind(signedInUser, {isSubscription: this._refreshView.bind(this)});
                    this.onOffScreen = this.onOffScreen.bind(this);
                    this.onOnScreen = this.onOnScreen.bind(this);
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.initialize.call(this)
                }, onOffScreen: function onOffScreen() {
                    if (this._onScreen) {
                        if (this.viewModel && this.viewModel.onOnScreen)
                            this.viewModel.onOffScreen();
                        MS.Entertainment.Utilities.freezeControlsInSubtree(this.domElement)
                    }
                    this._onScreen = false
                }, onOnScreen: function onOnScreen() {
                    if (!this._onScreen) {
                        if (this.viewModel && this.viewModel.onOffScreen)
                            this.viewModel.onOnScreen();
                        MS.Entertainment.Utilities.thawControlsInSubtree(this.domElement)
                    }
                    this._onScreen = true
                }, unload: function unload() {
                    MS.Entertainment.UI.Controls.FeaturedContent.prototype.unload.call(this);
                    if (this._signedInUserBindings) {
                        this._signedInUserBindings.cancel();
                        this._signedInUserBindings = null
                    }
                    if (this.viewModel) {
                        this.viewModel.dispose();
                        this.viewModel = null
                    }
                }, _getView: function _getView() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var view = MS.Entertainment.UI.Controls.FeaturedContent.prototype._getView.call(this);
                    if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicFreePlay) || configurationManager.service.lastSignedInUserSubscription)
                        view += this.templates.length / 2;
                    return view
                }
        })})
})()
