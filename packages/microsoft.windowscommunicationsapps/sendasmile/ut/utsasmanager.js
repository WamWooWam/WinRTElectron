
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

(function () {
    // Temporary variables that will be changed by the test
    var _originalGetElementById;
    var _originalAppData;
    
    setup = function () {
        /// <summary>
        /// Saves variables that will be changed by the tests
        /// </summary>
        _originalGetElementById = document.getElementById;
        
        _originalAppData = Jx.appData;
        
        Jx.appData = {
            localSettings: function () {
                var settings = {
                    get: function () { }
                };
                return settings;
            }
        };
    };

    cleanup = function () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        document.getElementById = _originalGetElementById;
        Jx.appData = _originalAppData;
    };

    Tx.test("SasManagerUnitTests.testInit", function (tc) {
        /// <summary>
        /// Tests SasManager.init()
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var feedbackCmd = {};
        document.getElementById = function (elementId) {
            if (elementId === "feedbackBtn") {
                return { parentNode: { winControl: { getCommandById: function () { return feedbackCmd; }, hidden: true }} };
            } else {
                tc.fail("Test did not expect getElementById for id: " + elementId);
            }
        };

        var platform = { accountManager: { defaultAccount: { userDisplayName: "testUser"}} };
        SasManager._config = true;

        SasManager.init("localizedAppName", "feedbackBtn", platform);

        tc.areEqual(feedbackCmd.icon, "\uE19D", "Icon is incorrect");
        tc.areEqual(feedbackCmd.onclick, SasManager.handleFeedbackClick, "OnClick method for button is incorrect");
        tc.areEqual(feedbackCmd.type, "button", "Type of AppBar button is incorrect");
        tc.isNotNull(feedbackCmd.label, "Label of button is null");
        tc.isNotNull(feedbackCmd.tooltip, "Tooltip of button is null");
        tc.areEqual(feedbackCmd.section, "global", "Section should be global");
        tc.isTrue(feedbackCmd.hidden, "AppBar button should be hidden by default");

    });
    
    Tx.test("SasManagerUnitTests.testConfigMethods", function (tc) {
        /// <summary>
        /// Tests that the various methods that pull in settings from the dynamic configuration (e.g showInAppBar) have the right logic
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        SasManager.getMarket = function(){return "en-us";};
        SasManager._config = { enableFeedback: true,
            application: { lookup: function (app) {
                return { addSettingsLink: true,
                    enableLogCollection: true,
                    addAppBarButton: true,
                    surveyId: 2000
                };
            }
            },
            supportedMarkets: {market: {"en-us": true}}
        };

        tc.isTrue(SasManager.showInAppBar(), "AppBar button should be shown");
        tc.isTrue(SasManager.addSettingsEntry(), "Link should be added to settings");
        tc.isTrue(SasManager.enableIssueReporting(), "Issue reporting should be enabled");

        SasManager._config = { enableFeedback: true,
            application: { lookup: function (app) {
                return { addSettingsLink: true,
                    enableLogCollection: false,
                    addAppBarButton: true,
                    surveyId: 2000
                };
            }
            },
            supportedMarkets: {market: {"ja-jp": true}}
        };
        SasManager.isMarketSupported = function() {return false;};
        tc.isTrue(SasManager.showInAppBar(), "AppBar button should be shown");
        tc.isFalse(SasManager.addSettingsEntry(), "Link should not be added to settings if wrong market");
        tc.isFalse(SasManager.enableIssueReporting(), "Issue reporting should not be enabled");

        SasManager._config = { enableFeedback: false,
            application: { lookup: function (app) {
                return { addSettingsLink: true,
                    enableLogCollection: false,
                    addAppBarButton: true,
                    surveyId: 2000
                };
            }
            },
            supportedMarkets: {market: {"en-us": true}}
        };

        tc.isFalse(SasManager.showInAppBar(), "AppBar button should not be shown when global disable is set");
        tc.isFalse(SasManager.addSettingsEntry(), "Link should not be added to settings when global disable is set");
        tc.isFalse(SasManager.enableIssueReporting(), "Issue reporting should not be enabled when global disable is set");

    });
    
    Tx.test("SasManagerUnitTests.testHandleClick", function (tc) {
        /// <summary>
        /// Tests SasManager handles button/link clicks correctly
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var hasUICalled = false, initUICalled = false, showCalled = false;
        SasManager.sasControl = { hasUI: function () { hasUICalled = true; return false; },
            initUI: function () { initUICalled = true; },
            show: function () { showCalled = true; }
        };

        SasManager.handleFeedbackClick();

        tc.isTrue(hasUICalled, "HasUI should have been called");
        tc.isTrue(initUICalled, "InitUI should have been called");
        tc.isTrue(showCalled, "Show should have been called");

        hasUICalled = false; initUICalled = false; showCalled = false;
        SasManager.sasControl = { hasUI: function () { hasUICalled = true; return true; },
            initUI: function () { initUICalled = true; },
            show: function () { showCalled = true; }
        };

        SasManager.handleFeedbackClick();

        tc.isTrue(hasUICalled, "HasUI should have been called");
        tc.isFalse(initUICalled, "InitUI should not have been called");
        tc.isTrue(showCalled, "Show should have been called");
    });
    
    Tx.test("SasManagerUnitTests.testGetUserId", function (tc) {
        /// <summary>
        /// Tests SasManager._getUserId()
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var platform = { accountManager: { defaultAccount: { userDisplayName: "testUser"}} };
        SasManager._config = true;

        SasManager.init("localizedAppName", "feedbackBtn", platform);

        tc.areEqual(SasManager._getUserId(), "testUser", "UserId is not being fetched from the platform");
    });


})();
