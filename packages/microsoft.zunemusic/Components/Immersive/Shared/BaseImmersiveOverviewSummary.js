/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js", "/Components/Immersive/Shared/BaseImmersiveSummary.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {BaseImmersiveOverviewSummary: MS.Entertainment.UI.Framework.deriveUserControl("MS.Entertainment.UI.Controls.BaseImmersiveSummary", null, function baseImmersiveOverviewSummary() {
            if (this.usesSmartBuyStateEngine)
                this.smartBuyStateEngine = this._createSmartBuyStateEngine()
        }, {
            controlName: "ImmersiveOverviewSummary", usesSmartBuyStateEngine: true, initialize: function initialize() {
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.initialize.apply(this, arguments);
                    if (MS.Entertainment.UI.Controls.UserFeedbackDialog)
                        MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = this.dataContext
                }, unload: function unload() {
                    if (this.smartBuyStateEngine) {
                        this.smartBuyStateEngine.unload();
                        this.smartBuyStateEngine = null
                    }
                    if (MS.Entertainment.UI.Controls.UserFeedbackDialog)
                        MS.Entertainment.UI.Controls.UserFeedbackDialog.inlineDetailsItem = null;
                    MS.Entertainment.UI.Controls.BaseImmersiveSummary.prototype.unload.call(this)
                }, _createSmartBuyStateEngine: function _createSmartBuyStateEngine() {
                    return new MS.Entertainment.ViewModels.SmartBuyStateEngine
                }
        }, {smartBuyStateEngine: null})})
})()
