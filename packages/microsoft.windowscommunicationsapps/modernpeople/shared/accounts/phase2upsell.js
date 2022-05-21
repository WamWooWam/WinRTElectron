
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People.Accounts, "Phase2Upsell", function () {
    
    var P = window.People,
        A = P.Accounts;

    var Phase2Upsell = A.Phase2Upsell = function (upsellSettings, stringIds, platform, scenario) {
        Debug.assert(platform, "Must provide a platform!");
        this._platform = platform;
        this._scenario = scenario;
        this._upsellSettings = upsellSettings;
        this._descriptionId = stringIds.phase2InstructionsId || "";
        this.initComponent();
    };
    Jx.inherit(Phase2Upsell, Jx.Component);
    var proto = Phase2Upsell.prototype;

    proto.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        var instructionsText = Jx.res.getString(this._descriptionId);

        ui.html = "<div id='" + this._id + "' class='phase2Upsell'>" +
                      "<div class='upsell-instructions' title='" + Jx.escapeHtml(instructionsText) + "'>" + instructionsText + "</div>" +
                      "<div role='button' class='upsell-dismiss typeSizeNormal' tabIndex='0' >" + Jx.res.getString("/accountsStrings/upsellOK") + "</div>" +
                   "</div>";
    };

    proto.activateUI = function () {
        var container = this._containerElement = document.getElementById(this._id);
        var dismissText = container.querySelector(".upsell-dismiss");
        dismissText.addEventListener("click", this._onDismiss = this._onDismiss.bind(this), false);
        dismissText.addEventListener("keypress", this._onKeyPress = this._onKeyPress.bind(this), false);
    };

    proto._onDismiss = function (ev) {
        this._upsellSettings.markDismissed();
        A.showAccountSettingsPage(this._platform, this._scenario, A.AccountSettingsPage.upsells, { launchedFromApp: true });
    };

    proto._onKeyPress = function (ev) {
        if (["Spacebar", "Enter"].indexOf(ev.key) >= 0) {
            this._upsellSettings.markDismissed();
            A.showAccountSettingsPage(this._platform, this._scenario, A.AccountSettingsPage.upsells, { launchedFromApp: true });
            ev.preventDefault();
        }
    };

    proto.shouldShow = function () {
        // The Phase 2 upsell doesn't rely on any data from platform to display its UI like the Phase1 Upsell.
        return true; 
    };

    proto.render = Jx.fnEmpty;

});
