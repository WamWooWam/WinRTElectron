
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,Mocks,Microsoft,People,window,document,Include*/

Include.initializeFileScope(function () {

    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;
    var A = People.Accounts;

    var divRoot = null;
    var settings = null;
    var settingsContainer = null;
    var priorWinJs = null;

    function setup () {
        if (!Jx.app) {
            Jx.app = new Jx.Application();
        }
        if (!settings) {
            settings = new M.Jx.AppData();
            settingsContainer = settings.localSettings().container("People");
        }
        settings.mock$reset();

        // Mock out the animations.
        priorWinJs = window.WinJS;
        var WinJS = window.WinJS = {};
        WinJS.UI = {};
        WinJS.UI.Animation = {};
        WinJS.UI.Animation.createAddToListAnimation = function () { return { execute: function () { } }; };
        WinJS.UI.Animation.createDeleteFromListAnimation = function () { return { execute: function () { } }; };
        WinJS.UI.Animation.createRepositionAnimation = function () { return { execute: function () { } }; };

        divRoot = document.createElement("div");
        divRoot.style.visibility = "hidden";
        document.body.appendChild(divRoot);
    }

    function cleanup () {
        if (divRoot !== null) {
            document.body.removeChild(divRoot);
            divRoot = null;
        }
        if (settings !== null) {
            settings.dispose();
            settings = null;
        }
        if (settingsContainer !== null) {
            settingsContainer.dispose();
            settingsContainer = null;
        }
        window.WinJS = priorWinJs;
    }

    function getDisplayUpsellCount() {
        return document.querySelectorAll("div.ali").length;
    }

    function getAvailableUpsellCount(upsellControl) {
        return upsellControl._upsell._accountList._collection._realCollection._collection.count;
    }

    var smallIcon = function (name) {
        return "http://secure.wlxrs.com/$live.controls.images/sn/PsaSmall/" + name + ".png";
    };

    var medIcon = function (name) {
        return "http://secure.wlxrs.com/$live.controls.images/sn/PsaMedium/" + name + ".png";
    };

    function createControl(options, host, noUpsells) {

        noUpsells = !!noUpsells;
        var platform = null;

        if (noUpsells) {
            platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
                "Account": {
                    "default": [{ objectId: "defaultAccount00", displayName: "My Hotmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "stevesi@live.com", canDelete: false}],
                    "connectable": []
                }
            }).getClient();
        } else {
            platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
                "Account": {
                    "default": [
                        { objectId: "defaultAccount00", displayName: "My Hotmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "stevesi@live.com", canDelete: false}],
                    "connectable_2": [
                        { objectId: "upsellTWTR", displayName: "Twitter", iconSmallUrl: smallIcon("TWITRActive"), iconMediumUrl: medIcon("TWITRActive"), mock$configureType: Plat.ConfigureType.editOnWeb, accountType: Plat.AccountType.withoutPlugins },
                        { objectId: "upsellMYSP", displayName: "MySpace", iconSmallUrl: smallIcon("MYSPActive"), iconMediumUrl: medIcon("MYSPActive"), mock$configureType: Plat.ConfigureType.editOnWeb, accountType: Plat.AccountType.withoutPlugins },
                        { objectId: "upsellFLKR", displayName: "Flickr", iconSmallUrl: smallIcon("FLKRActive"), iconMediumUrl: medIcon("FLKRActive"), mock$configureType: Plat.ConfigureType.editOnWeb, accountType: Plat.AccountType.withoutPlugins },
                        { objectId: "upsellSNWB", displayName: "Sina Weibo", iconSmallUrl: smallIcon("SINWEActive"), iconMediumUrl: medIcon("SINWEActive"), mock$configureType: Plat.ConfigureType.editOnWeb, accountType: Plat.AccountType.withoutPlugins },
                        { objectId: "upsellBLGR", displayName: "Blogger", iconSmallUrl: smallIcon("BLGRActive"), iconMediumUrl: medIcon("BLGRActive"), mock$configureType: Plat.ConfigureType.editOnWeb, accountType: Plat.AccountType.withoutPlugins }
                    ]
                }
            }).getClient();
        }

        var stringIds = { phase1InstructionsId: "/strings/upsellInstructions", phase1DismissId: "/strings/upsellClose", phase2InstructionsId: "/strings/upsellPhase2Instructions" };
        var upsellSettings = new A.UpsellSettings(settingsContainer);
        var upsell = new A.UpsellControl(platform,
                                         Plat.ApplicationScenario.people,
                                         upsellSettings,
                                         stringIds,
                                         options);

        if (host) {
            if (upsell.shouldShow()) {
                upsell.initUI(divRoot);
            }
        }

        return upsell;
    }

    Tx.test("upsellControlTests.testCount", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsell = createControl({}, true);

        var availableUpsells = getAvailableUpsellCount(upsell);

        // Verify the we don't create more than 4 upsells in the UI.
        var upsellUIItemCount = getDisplayUpsellCount();
        tc.areEqual(Math.min(availableUpsells, 4), upsellUIItemCount);
    });

    Tx.test("upsellControlTests.testUserInteraction", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsell = createControl({}, true);

        var calls = new M.CallVerifier(tc);
        var listener = calls.hookEvents(upsell._settings, ["phaseChange"]);

        calls.expectOnce(listener, "phaseChange");
        // Simulate a click of the close button.
        upsell._upsell._onAccountClick({});
        calls.verify();

        // Check to make sure the dimissal was recorded.
        tc.areEqual(2, upsell._settings._settingsContainer.get("phase"));
        tc.isTrue(upsell.shouldShow());
    });

    Tx.test("upsellControlTests.testUserDismissal", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsell = createControl({}, true);

        var calls = new M.CallVerifier(tc);
        var listener = calls.hookEvents(upsell, ["upsellDismissed"]);

        calls.expectOnce(listener, "upsellDismissed");
        // Simulate a click of the close button.
        upsell._upsell._onDismiss({});
        calls.verify();

        // Check to make sure the dimissal was recorded.
        tc.areEqual(3, upsell._settings._settingsContainer.get("phase"));
        tc.isFalse(upsell.shouldShow());
    });

    Tx.test("upsellControlTests.testShouldShow", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsellUnhosted = createControl({}, false);

        tc.isTrue(upsellUnhosted.shouldShow());

        upsellUnhosted._settings._phase = 3;
        tc.isFalse(upsellUnhosted.shouldShow());

        upsellUnhosted._settings._phase = 2;
        tc.isTrue(upsellUnhosted.shouldShow());

        upsellUnhosted._settings._phase = 1;
        tc.isTrue(upsellUnhosted.shouldShow());
    });

    Tx.test("upsellControlTests.testDeactivateReactivate", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsellctrl = createControl({}, true, false/*no upsells*/);

        upsellctrl.deactivateUI();
        upsellctrl.activateUI();
    });

    Tx.test("upsellControlTests.testShutdown", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var upsellctrl = createControl({}, true, false/*no upsells*/);

        upsellctrl.shutdownUI();
        upsellctrl.shutdownComponent();
    });
});