
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,People,Mocks,Microsoft,document,Include,MockJobSet*/

/// Modify CTM for Chat: 2-line optional layout
/// Innsert CTM for Picker: disable user inputs
/// Move CTM in MoBody and Snap: clickable in MoBody but not in Snap

/// need animations stuff?

Include.initializeFileScope(function () {

    var M = Mocks;
    var Plat = Microsoft.WindowsLive.Platform;
    var A = People.Accounts;

    var divRoot = null;

    function setup () {
        if (!Jx.app) {
            Jx.app = new Jx.Application();
            Jx.res.getString = function () { return "null"; };
        }
        divRoot = document.createElement("div");
        divRoot.style.visibility = "hidden";
        document.body.appendChild(divRoot);
    }

    function cleanup () {
        if (divRoot !== null) {
            document.body.removeChild(divRoot);
            divRoot = null;
        }
    }

    function createControl(displayOnTwoLines, disabled) {
        var jobSet = new MockJobSet();
        Jx.appId = Jx.AppId.people;
        var connectedTo = new A.ConnectedAccounts(Plat.ApplicationScenario.people, jobSet, displayOnTwoLines, disabled);

        var platform = new Mocks.Microsoft.WindowsLive.Platform.Data.JsonProvider({
            "Account": {
                "connected": [
                    { displayName: "Facebook", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@facebook.com" },
                    { displayName: "Gmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@gmail.com" },
                    { displayName: "Hotmail", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@hotmail.com" },
                    { displayName: "LinkedIn", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "psa-test@linkedin.com" }
                ], "connectable": [
                    { displayName: "Twitter", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "MySpace", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "Flickr", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "Blogger", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" },
                    { displayName: "YouTube", iconMediumUrl: "http://i.microsoft.com/global/en-us/homepage/PublishingImages/thumbnails/Win7Logo_74x74.png", emailAddress: "" }
                ]
            }
        }).getClient();
        connectedTo.setPlatform(platform);
        connectedTo.initUI(divRoot);

        return connectedTo;
    }

    Tx.test("connectedToTests.testTwoLineLayout", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var connectedTo = createControl(true, false);

        // get the Connected to label and upsell icons divs
        var result = document.querySelectorAll(".connectedAccounts-label");
        tc.isTrue(result.length === 1);

        var divConnectedAccounts = result[0];

        // check if the displayOnTwoLines classname has been added to the div
        tc.isTrue(divConnectedAccounts.className.indexOf("displayOnTwoLines") !== -1);
    });

    Tx.test("connectedToTests.testDisabledUponConstruction", function (tc) {
        tc.cleanup = cleanup;
        setup();

        var connectedTo = createControl(false, true);

        var callVerifier = new M.CallVerifier(tc);
        callVerifier.initialize(connectedTo, ["onClick"]);

        // fire mouse click event through IE
        var ev = document.createEvent("MouseEvent");
        ev.initMouseEvent("click", true, true, null, 0, 0, 0, 0, 0, false, false, false, 0, 0, null);
        connectedTo._control.dispatchEvent(ev);

        // make sure no listener is attached. call times should be 0
        callVerifier.verify();
    });
});