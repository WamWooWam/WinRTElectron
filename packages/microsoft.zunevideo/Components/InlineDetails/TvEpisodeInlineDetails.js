/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.Pages", {TvEpisodeInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.Pages.BaseMediaInlineDetails", "/Components/InlineDetails/TvEpisodeInlineDetails.html#tvEpisodeInlineDetailsTemplate", function tvEpisodeInlineDetails(){}, {
            initialize: function initialize() {
                MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this.media).done(function libraryInfoHydrated() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this);
                    this._finalizeInitialize()
                }.bind(this), function libraryInfoHydrateFailed(error) {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this);
                    this._finalizeInitialize()
                }.bind(this))
            }, _finalizeInitialize: function _finalizeInitialize() {
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this._showPanel(true);
                    WinJS.Promise.timeout().then(function() {
                        if (!this.smartBuyStateEngine)
                            return;
                        var hydrateIfPossible = function hydrateIfPossible(hasServiceId) {
                                if (hasServiceId)
                                    this._hydrateMedia();
                                else
                                    this._showPanel()
                            };
                        var binding = WinJS.Binding.bind(this.media, {hasServiceId: hydrateIfPossible.bind(this)});
                        this.mediaBindings.push(binding);
                        if (this.smartBuyStateEngine)
                            this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getVideoDetailsButtons(this.media, MS.Entertainment.UI.Actions.ExecutionLocation.invokeInline), MS.Entertainment.ViewModels.VideoSmartBuyStateEngine.prototype.onVideoDetailsTwoButtonStateChanged)
                    }.bind(this))
                }
        })})
})()
