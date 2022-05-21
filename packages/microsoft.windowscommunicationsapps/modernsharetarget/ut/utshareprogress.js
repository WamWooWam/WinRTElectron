
// Copyright (C) Microsoft. All rights reserved.

(function () {
    // Place to store global state that tests will change
    var _originalWinJS;

    // Div tests can add elements to that will be cleaned up for them
    var _testDiv;

    function setup (tc) {
        ///<summary>
        /// Per-test setup function
        ///</summary>

        // Save global state that will be changed by the tests
        _originalWinJS = window.WinJS;

        // Create namespaces if they do not already exist
        window.WinJS = window.WinJS || {};
        WinJS.UI = WinJS.UI || {};
        WinJS.UI.Animation = WinJS.UI.Animation || {};

        // Create div tests can use to add custom elements; will be removed in tearDown.
        _testDiv = document.createElement("div");
        document.body.appendChild(_testDiv);
    };

    function cleanup (tc) {
        ///<summary>
        /// Per-test tear-down function
        ///</summary>

        // Replace global state
        window.WinJS = _originalWinJS;

        // Remove test div
        _testDiv.parentElement.removeChild(_testDiv);
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "A test for the constructor.  ";
    Tx.test("ShareTarget.ShareProgress.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.Progress();

        // Verify the correct events were registered.  Events are only registered in debug.
        if (window.Debug && Debug.Events) {
            tc.isTrue(Debug.Events.isDefined(component, "cancel"), "Expected cancel event to be defined");
        }
    });

    opt.description = "Call activateUI multiple times and verify that addEventListener was called, and it was only called once.";
    Tx.test("ShareTarget.ShareProgress.testactivateUIMultiple", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.Progress();
        component._showHideButton = function () { };
        component._networkChange = function () { };
        var clickAttachEventCount = 0;

        var button = document.createElement("button");
        button.id = "shareCancel";
        _testDiv.appendChild(button);

        button.addEventListener = function (eventName) {
            if (eventName === "click") {
                clickAttachEventCount++;
            } else {
                tc.error("unexpected event attached: " + eventName);
            }
        };

        component.activateUI();
        component.activateUI();

        tc.areEqual(1, clickAttachEventCount, "addEventListener was not called the appropriate number of times for click");
    });

    opt.description = "Call deactivateUI multiple times and verify that removeEventListener was called, and it was only called once.";
    Tx.test("ShareTarget.ShareProgress.testDeactivateUIMultiple", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.Progress();
        component._showHideButton = function () { };
        component._networkChange = function () { };
        var clickRemoveEventCount = 0;

        var button = document.createElement("button");
        button.id = "shareCancel";
        _testDiv.appendChild(button);

        button.removeEventListener = function (eventName) {
            if (eventName === "click") {
                clickRemoveEventCount++;
            } else {
                tc.error("unexpected event detached: " + eventName);
            }
        };
        button.addEventListener = function () { };

        // Activate UI first to set up the remove funciton
        component.activateUI();

        tc.isTrue(component._uiInitialized, "Invalid test setup: uiInitialized should be true");
        tc.isNotNull(component._removeEvents, "Invalid test setup: expected _removeEvents to be present after activateUI");

        component.deactivateUI();
        component.deactivateUI();

        tc.areEqual(1, clickRemoveEventCount, "removeEventListener was not called the appropriate number of times for click");

        // Also verify DOM-related state was nulled out.
        tc.isNull(component._removeEvents, "Need to remove reference to _removeEvents when deactivating UI");
    });

    opt.description = "Verifies the button show scenario";
    Tx.test("ShareTarget.ShareProgress.testShowButton", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var buttonAnimated = false;

        var successFunction;

        var component = new Share.Progress();

        var button = document.createElement("button");
        button.id = "shareCancel";
        _testDiv.appendChild(button);

        WinJS.UI.Animation.fadeOut = function (element) {
            tc.areEqual(element, button, "Unexpected element passed to fadeOut");
            buttonAnimated = true;

            var fakePromise = {
                then: function (success) {
                    successFunction = success;
                }
            }; 

            return fakePromise;
        };

        component._showHideButton(true);

        tc.isTrue(buttonAnimated, "Did not get button animation as expected");

        // Try out the success function and make sure the button display is set properly
        tc.areEqual("", button.style.display, "Invalid test setup: expect display to be ''");
        successFunction();
        tc.areEqual("none", button.style.display, "Did not set button display correctly after animation completed");
    });

    opt.description = "Verifies the button hide scenario";
    Tx.test("ShareTarget.ShareProgress.testHideButton", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var buttonAnimated = false;

        var component = new Share.Progress();

        var button = document.createElement("button");
        button.id = "shareCancel";
        _testDiv.appendChild(button);

        WinJS.UI.Animation.fadeIn = function (element) {
            tc.areEqual(element, button, "Unexpected element passed to fadeOut");
            buttonAnimated = true;

            return { };
        };

        component._showHideButton(false);

        tc.isTrue(buttonAnimated, "Did not get button animation as expected");
    });
})();
