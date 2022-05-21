
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Microsoft,People*/
Jx.delayDefine(Mail, "Phase1Upsell", function () {
    "use strict";

    var A = People.Accounts;

    // The Mail Phase1Upsell overrides the default Phase1Upsell behavior and doesn't automatically update the phase.
    Mail.Phase1Upsell = function (platform) {
        A.Phase1Upsell.call(this,
            platform,
            Microsoft.WindowsLive.Platform.ApplicationScenario.mail,
            null /*no settings, no phases*/,
            { phase1InstructionsId: "mailPhase1UpsellInstructions" }
        );
    };
    Jx.inherit(Mail.Phase1Upsell, A.Phase1Upsell);
    var proto = Mail.Phase1Upsell.prototype;

    proto.getUI = function (ui) {
        A.Phase1Upsell.prototype.getUI.call(this, ui);
        ui.html = "<div class='phase1UpsellBackground'>" +
                      "<div class='phase1UpsellPositioner'>" +
                          "<div class='phase1UpsellAppTitle' role='heading'>" + Jx.escapeHtml(Jx.res.getString("mailAppTitle")) + "</div>" +
                          ui.html +
                      "</div>" +
                  "</div>";
    };
    proto._onAccountClick = function () {
        return true;
    };

    // Initialized in Phase1Upsell's constructor.
    proto._platform = null;
    proto._scenario = null;

    proto._onAddMoreAccounts = function () {
        A.showAccountSettingsPage(this._platform, this._scenario, A.AccountSettingsPage.upsells, { launchedFromApp: true });
    };

    proto._incrementPhase = function () {
        // The base upsell has given up.  There is no phase 2 in mail, so we should just render what we can.
        this.fire("upsellAvailable", null, null);
    };

});
