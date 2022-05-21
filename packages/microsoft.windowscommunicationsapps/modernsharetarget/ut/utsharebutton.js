
// Copyright (C) Microsoft. All rights reserved.

(function () {
    // Place to store original global state that is changed by the tests
    var _originalJxRes;
    var _originalWinJS;

    // Div tests can add elements to that will be cleaned up for them
    var _testDiv;

    function setup (tc) {
        ///<summary>
        /// Save global state that will be changed by the tests
        ///</summary>

        _originalJxRes = Jx.res;
        _originalWinJS = window.WinJS;

        Jx.res = {
            getString: function (stringId) { return stringId; },
            processAll: function () { }
        }

        // Create div tests can use to add custom elements; will be removed in tearDown.
        _testDiv = document.createElement("div");
        document.body.appendChild(_testDiv);

        // Create namespaces if they do not already exist
        window.WinJS = window.WinJS || {};
        WinJS.UI = WinJS.UI || {};
        WinJS.UI.Animation = WinJS.UI.Animation || {};
    };

    function cleanup (tc) {
        ///<summary>
        /// Replace global state
        ///</summary>

        Jx.res = _originalJxRes;
        window.WinJS = _originalWinJS;

        // Remove test div
        _testDiv.parentElement.removeChild(_testDiv);
    };
    
    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "TODO";
    Tx.test("ShareTarget.ShareButton.testConstructorWithoutNewError", opt, function (tc) {
        ///<summary>
        /// A test where the constructor is not called via new.
        /// Verifies that an appropriate helpful message is returned to the caller.
        ///</summary>
        tc.cleanup = cleanup;
        setup(tc);

        tc.expectException(function () {
            var buttonComponent = Share.ShareButton();
        }, "Share.ShareButton is a constructor; it must be called using new.");
    });

    opt.description = "A test for the constructor.  ";
    Tx.test("ShareTarget.ShareButton.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var buttonComponent = new Share.ShareButton();

        // Verify the correct events were registered.  Events are only registered in debug.
        if (window.Debug && Debug.Events) {
            tc.isTrue(Debug.Events.isDefined(buttonComponent, "share"), "Expected share event to be defined");
        }
    });

    opt.description = "Verify getUI returns the appropriate content as well as modifying the param";
    Tx.test("ShareTarget.ShareButton.testGetUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var buttonComponent = new Share.ShareButton();

        var ui = {};

        buttonComponent.getUI(ui);

        tc.isTrue(Boolean(ui.html), "HTML content is expected to be in ui.html property"); // Verify some content is in the html property
    });

    opt.description = "Call activateUI multiple times and verify that addEventListener was called, and it was only called once.";
    Tx.test("ShareTarget.ShareButton.testactivateUIMultiple", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.ShareButton();
        var clickAttachEventCount = 0;
        var msPointerDownAttachEventCount = 0;

        var button = document.createElement("button");
        button.id = "shareButton";
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

        tc.areEqual(button, component._elButton, "Button should have been assigned");
        tc.areEqual(1, clickAttachEventCount, "addEventListener was not called the appropriate number of times for click");
    });

    opt.description = "Call deactivateUI multiple times and verify that removeEventListener was called, and it was only called once.";
    Tx.test("ShareTarget.ShareButton.testDeactivateUIMultiple", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.ShareButton();
        var clickRemoveEventCount = 0;
        var msPointerDownRemoveEventCount = 0;

        var button = document.createElement("button");
        button.id = "shareButton";
        _testDiv.appendChild(button);
        component._elButton = button;

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

    opt.description = "Verifies that shutdown doesn't throw";
    Tx.test("ShareTarget.ShareButton.testShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.ShareButton();

        component.shutdownComponent();
    });

    opt.description = "Verifies the correct event is fired when the button is clicked";
    Tx.test("ShareTarget.ShareButton.testShareClick", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var component = new Share.ShareButton();
        var shareFired = false;

        component.addListener("share",
            function shareHandler() {
                shareFired = true;
            });

        component._share();

        tc.isTrue(shareFired, "Expected the click function to fire the share event, but the event handler was not called.");
    });
})();
