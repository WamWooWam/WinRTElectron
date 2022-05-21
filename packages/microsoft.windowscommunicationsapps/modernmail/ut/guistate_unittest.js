
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Tx*/

(function () {

    var guiState = null,
        glomShowingHandler = null,
        currentViewState = null,
        currentWidth = null,
        currentVisibility = true,
        JAS = Jx.ApplicationView.State;

    function makeGUIState(tc, selectedMessage) {
        var controlIds = ["mailFrame", "appBody"],
            originalApplicationView = Jx.ApplicationView,
            originalGetWidth = Mail.GUIState.prototype._getWidth,
            originalGetVisibility = Mail.GUIState.prototype._getVisibility,
            originalGlomManager = Jx.glomManager;

        tc.cleanup = function() {
            guiState.dispose();
            guiState = null;
            Mail.UnitTest.removeElements(controlIds);
            Mail.UnitTest.disposeGlobals();
            Jx.ApplicationView = originalApplicationView;
            Mail.GUIState.prototype._getWidth = originalGetWidth;
            Mail.GUIState.prototype._getVisibility = originalGetVisibility;
            Jx.glomManager = originalGlomManager;
            Mail.UnitTest.restoreJx();
            glomShowingHandler = null;
        };

        Mail.UnitTest.setupStubs();
        Mail.AppState.prototype._initialActivation = Jx.fnEmpty;
        Jx.ApplicationView.getState = function mockGetApplicationViewState() {
            return currentViewState;
        };
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.initGlobals(tc);

        Mail.GUIState.prototype._getWidth = function mockGetWidth() {
            return currentWidth;
        };
        Mail.GUIState.prototype._getVisibility = function mockGetVisibility() {
            return currentVisibility;
        };
        Mail.UnitTest.addElements(tc, controlIds);

        Jx.glomManager = {
            addEventListener: function (event, handler) {
                if (event === Jx.GlomManager.Events.glomShowing) {
                    glomShowingHandler = handler;
                }
            },
            removeEventListener: Jx.fnEmpty
        };

        return new Mail.GUIState({ message: (selectedMessage === undefined) ? { } : selectedMessage });
    }

    function updateViewState(tc, newViewState, widthOption) {
        currentViewState = newViewState;

        var lowerBound = null,
            upperBound = null;
        switch (newViewState) {
            case JAS.snap:     lowerBound = 320;  upperBound = 320; break;
            case JAS.minimum:  lowerBound = 321;  upperBound = 501; break;
            case JAS.less:     lowerBound = 502;  upperBound = 671; break;
            case JAS.split:    lowerBound = 672;  upperBound = 767; break;
            case JAS.portrait: lowerBound = 768;  upperBound = 843; break;
            case JAS.more:     lowerBound = 844;  upperBound = 1024; break;
            case JAS.large:    lowerBound = 1025; upperBound = 1365; break;
            case JAS.full:     lowerBound = 1366; upperBound = 99999; break;
            default:           tc.isTrue(false);  break;
        }

        var event = document.createEvent("UIEvents");

        currentWidth = Math.round((lowerBound + upperBound) / 2);
        if (widthOption === "lower") {
            currentWidth = lowerBound;
        } else if (widthOption === "upper") {
            currentWidth = upperBound;
        }

        event.initUIEvent("resize", true, false, window, 0);
        window.dispatchEvent(event);
    }

    Tx.test("GUIState_UnitTest.test_ChildGUIState_APISync", function (tc) {
        function propertiesInYFoundInX( Y, X ) {
            var propertyCount = 0;
            for (var propt in X) {
                if ((propt[0] === "_") || !X.hasOwnProperty(propt)) {
                    // Don't compare private properties
                    // Don't compare inheritied properties
                } else if (!Y.hasOwnProperty(propt)) {
                    tc.isTrue(false, "GuiState API mismatch on property " + propt);
                } else {
                    var Xdescriptor = Object.getOwnPropertyDescriptor(X, propt);
                    if (Xdescriptor && (Xdescriptor.get || Xdescriptor.set)) {
                        var Ydescriptor = Object.getOwnPropertyDescriptor(Y, propt);
                        tc.isTrue(Boolean(Ydescriptor && (Ydescriptor.get || Ydescriptor.set)), "GuiState API mismatch on property " + propt);
                    } else {
                        tc.isTrue(Jx.isFunction(X[propt]) === Jx.isFunction(X[propt]));
                    }
                }
                propertyCount++;
            }
            tc.log("Compared " + propertyCount + " properties");
        }

        propertiesInYFoundInX(Mail.ParentGUIState.prototype, Mail.ChildGUIState.prototype);
        propertiesInYFoundInX(Mail.ChildGUIState.prototype, Mail.ParentGUIState.prototype);
        // The above code will trigger ChildGUIState to load.  Need to recover back to ParentGUISTate
        Mail.GUIState = Mail.ParentGUIState;

    });

    Tx.test("GUIState_UnitTest.test_SizeProperties", function (tc) {
        // Verify the size properties under different view states
        guiState = makeGUIState(tc);
        var expected = {
            snap:     [ true,  true,  false, false ],
            minimum:  [ false, true,  false, false ],
            less:     [ false, true,  false, true ],
            split:    [ false, true,  false, true ],
            portrait: [ false, true,  false, true] ,
            more:     [ false, false, true,  false ],
            large:    [ false, false, true,  true ],
            full:     [ false, false, true,  true ]
        };

        updateViewState(tc, JAS.full);

        function validate(viewState) {
            tc.areEqual(guiState.isSnapped, expected[viewState][0]);
            tc.areEqual(guiState.isOnePane, expected[viewState][1]);
            tc.areEqual(guiState.isThreePane, expected[viewState][2]);
            tc.areEqual(guiState.isNavPaneWide, expected[viewState][3]);
        }

        for (var viewState in expected) {
            updateViewState(tc, JAS[viewState]);
            validate(viewState);

            updateViewState(tc, JAS[viewState], "lower");
            validate(viewState);

            updateViewState(tc, JAS[viewState], "upper");
            validate(viewState);
        }

    });


    Tx.test("GUIState_UnitTest.test_LayoutProperties", function (tc) {
        // Verify the layout properties under different view states
        guiState = makeGUIState(tc);
        var expected = {
            full:     [ false, false, false ],
            large:    [ false, false, false ],
            more:     [ false, false, false ],
            portrait: [ false, false, true ],
            split:    [ false, false, true ],
            less:     [ false, false, true ],
            minimum:  [ false, false, true ],
            snap:     [ false, false, true ]
        };

        updateViewState(tc, JAS.full);

        for (var viewState in expected) {
            updateViewState(tc, JAS[viewState]);
            tc.areEqual(guiState.isNavPaneActive, expected[viewState][0]);
            tc.areEqual(guiState.isMessageListActive, expected[viewState][1]);
            tc.areEqual(guiState.isReadingPaneActive, expected[viewState][2]);
        }
    });

    Tx.test("GUIState_UnitTest.test_Events", function (tc) {
        // Transition the view state and check that the events fire / do not fire as expected
        guiState = makeGUIState(tc);
        var transitions = [
            ["snap",     true,  true ],
            ["minimum",  false, true ],
            ["less",     false, true ],
            ["split",    false, true ],
            ["portrait", false, true ] ,
            ["more",     true,  true ],
            ["large",    false, true ],
            ["full",     false, true ],
            ["less",     true,  true ],
            ["minimum",  false, true ],
            ["large",    true,  true ],
            ["large",    false, false ]
        ];

        updateViewState(tc, JAS.full);

        transitions.forEach(function (transition) {
            var layoutChanged = false, onLayoutChanged = function () { layoutChanged = true ; },
                viewStateChanged = false, onViewStateChanged= function () { viewStateChanged = true ; };

            guiState.addListener("layoutChanged", onLayoutChanged);
            guiState.addListener("viewStateChanged", onViewStateChanged);

            updateViewState(tc, JAS[transition[0]]);
            tc.areEqual(layoutChanged, transition[1]);
            tc.areEqual(viewStateChanged, transition[2]);

            guiState.removeListener("layoutChanged", onLayoutChanged);
            guiState.removeListener("viewStateChanged", onViewStateChanged);
        });
    });

    function validateDOM (tc, guiState) {
        var domReadingPaneActive = document.getElementById("mailFrame").classList.contains("readingPaneActive"),
            domNavMessageActive = document.getElementById("appBody").classList.contains("navMessageListActive"),
            ifAThenB = function (A, B) { tc.isTrue((A && B) || !A); };

        ifAThenB(guiState.isThreePane, !domReadingPaneActive);
        ifAThenB(guiState.isThreePane, !domNavMessageActive);

        ifAThenB(guiState.isNavPaneActive, !domReadingPaneActive);
        ifAThenB(guiState.isNavPaneActive, domNavMessageActive);

        ifAThenB(guiState.isMessageListActive, !domReadingPaneActive);
        ifAThenB(guiState.isMessageListActive, domNavMessageActive);

        ifAThenB(guiState.isReadingPaneActive, domReadingPaneActive);
        ifAThenB(guiState.isReadingPaneActive, !domNavMessageActive);
    }

    Tx.test("GUIState_UnitTest.test_SizeUpAndDown", function (tc) {
        // Size up and down - verify events and layouts
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.large);

        var layoutChanged = false, onLayoutChanged = function () { layoutChanged = true ; };
        guiState.addListener("layoutChanged", onLayoutChanged);

        // Manual size down
        updateViewState(tc, JAS.snap);
        tc.isTrue(layoutChanged);
        tc.isFalse(guiState.isNavPaneActive);
        tc.isFalse(guiState.isMessageListActive);
        tc.isTrue(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        // Manual size up to Three Pane
        layoutChanged = false;
        updateViewState(tc, JAS.full);
        tc.isTrue(layoutChanged);
        tc.isTrue(guiState.isThreePane);
        tc.isFalse(guiState.isOnePane);
        validateDOM(tc, guiState);

        // Size down because of child window launch
        layoutChanged = false;
        tc.isTrue(Jx.isFunction(glomShowingHandler));
        glomShowingHandler.call(guiState, { glom: { getStartingContext: function () { return { }; } } });

        updateViewState(tc, JAS.minimum);
        tc.isTrue(layoutChanged);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        // Child window is done launching. Size up to Three Pane again.
        layoutChanged = false;
        guiState.handleGlomVisible();
        updateViewState(tc, JAS.large);
        tc.isTrue(layoutChanged);
        tc.isTrue(guiState.isThreePane);
        tc.isFalse(guiState.isOnePane);
        validateDOM(tc, guiState);

        // Manual size down again
        layoutChanged = false;
        updateViewState(tc, JAS.less);
        tc.isTrue(layoutChanged);
        tc.isFalse(guiState.isNavPaneActive);
        tc.isFalse(guiState.isMessageListActive);
        tc.isTrue(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        guiState.removeListener("layoutChanged", onLayoutChanged);
    });

    Tx.test("GUIState_UnitTest.test_OpenEmlWindow", function (tc) {
        // Size down due to opening an EML message
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.large);

        var layoutChanged = false, onLayoutChanged = function () { layoutChanged = true ; };
        guiState.addListener("layoutChanged", onLayoutChanged);

        tc.isTrue(Jx.isFunction(glomShowingHandler));
        glomShowingHandler.call(guiState, { glom: {
            getStartingContext: function () {
                return { isEmlMessage: true };
            }
        }});

        updateViewState(tc, JAS.snap);
        tc.isTrue(layoutChanged);
        tc.isFalse(guiState.isNavPaneActive);
        tc.isFalse(guiState.isMessageListActive);
        tc.isTrue(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);
    });

    Tx.test("GUIState_UnitTest.test_Navigation_ThreePane", function (tc) {
        // Verify that layout event never fires in Three Pane if anyone tries to navigate the app
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.large);

        var onLayoutChanged = function () { tc.isTrue(false); };
        guiState.addListener("layoutChanged", onLayoutChanged);

        guiState.navigateForward();
        validateDOM(tc, guiState);
        guiState.navigateBackward();
        validateDOM(tc, guiState);
        guiState.ensureNavMessageList();
        validateDOM(tc, guiState);

        guiState.removeListener("layoutChanged", onLayoutChanged);
    });

    Tx.test("GUIState_UnitTest.test_Navigation_OnePane", function (tc) {
        // Verify that layout event fires / does not fire, and that layout properties behave correctly
        // in One Pane upon navigation
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.minimum);

        var layoutChanged = false, onLayoutChanged = function () { layoutChanged = true ; };
        guiState.addListener("layoutChanged", onLayoutChanged);

        // Initial state
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);

        var navigations = [
            [ "navigateForward",      true,  false, false, true ],  // Forward
            [ "navigateForward",      false, false, false, true ],  // Forward again - nothing should have changed
            [ "navigateBackward",     true,  true,  true,  false ], // Back
            [ "navigateBackward",     false, true,  true,  false ], // Back again - nothing should have changed
            [ "navigateForward",      true,  false, false, true ],  // Forward again
            [ "ensureNavMessageList", true,  true,  true,  false ], // Back again (via Child Window)
        ];

        navigations.forEach(function (navigation) {
            layoutChanged = false;
            guiState[navigation[0]].call(guiState);
            tc.areEqual(layoutChanged, navigation[1]);
            tc.areEqual(guiState.isNavPaneActive, navigation[2]);
            tc.areEqual(guiState.isMessageListActive, navigation[3]);
            tc.areEqual(guiState.isReadingPaneActive, navigation[4]);
            validateDOM(tc, guiState);
        });

        guiState.removeListener("layoutChanged", onLayoutChanged);
    });

    Tx.test("GUIState_UnitTest.test_EmptyReadingPane", function (tc) {
        // Verify that GUIState doesn't use the ReadingPane layout if there are no message displayed in the ReadingPane
        guiState = makeGUIState(tc, null);
        updateViewState(tc, JAS.full);

        // Initial state
        tc.isTrue(guiState.isThreePane);
        validateDOM(tc, guiState);

        updateViewState(tc, JAS.less);

        tc.isTrue(guiState.isOnePane);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);
    });

    Tx.test("GUIState_UnitTest.test_ShownByChildWindow", function (tc) {
        // Verify that the we behave correct after being brought from the back stack by a child window

        // Initial state - in the foreground, snapped
        currentVisibility = true;
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.snap);
        validateDOM(tc, guiState);

        // Before IE puts the app to the background, it resizes it to full-screen first
        updateViewState(tc, JAS.full);
        currentVisibility = false;
        var event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        guiState.ensureNavMessageList(); // Received postMessaged() - child window is bringing back the main window

        currentVisibility = true; // IE makes us visible at the point, but doesn't fire the visibility event yet

        // IE then tells us to resize. We should be viewing NavPane+MessageList
        updateViewState(tc, JAS.minimum);
        tc.isTrue(guiState.isOnePane);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        // The visibility event comes last - we should not be affected
        event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        tc.isTrue(guiState.isOnePane);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);
    });

    Tx.test("GUIState_UnitTest.test_ShownBySwipeIn_ViewingReadingPane", function (tc) {
        // Initial state - in the foreground, snapped, viewing the ReadingPane
        currentVisibility = true;
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.snap);
        guiState.navigateForward();
        validateDOM(tc, guiState);

        // Before IE puts the app to the background, it resizes it to full-screen first
        updateViewState(tc, JAS.full);
        currentVisibility = false;
        var event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        currentVisibility = true; // IE makes us visible at the point, but doesn't fire the visibility event yet

        // IE then tells us to resize. We should be viewing the ReadingPane
        updateViewState(tc, JAS.minimum);
        tc.isTrue(guiState.isOnePane);
        tc.isFalse(guiState.isNavPaneActive);
        tc.isFalse(guiState.isMessageListActive);
        tc.isTrue(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        // The visibility event comes last - we should not be affected
        event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        tc.isTrue(guiState.isOnePane);
        tc.isFalse(guiState.isNavPaneActive);
        tc.isFalse(guiState.isMessageListActive);
        tc.isTrue(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);
    });

    Tx.test("GUIState_UnitTest.test_ShownBySwipeIn_ViewingNavMessage", function (tc) {
        // Initial state - in the foreground, snapped, viewing Nav+Message
        currentVisibility = true;
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.snap);
        validateDOM(tc, guiState);

        // Before IE puts the app to the background, it resizes it to full-screen first
        updateViewState(tc, JAS.full);
        currentVisibility = false;
        var event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        currentVisibility = true; // IE makes us visible at the point, but doesn't fire the visibility event yet

        // IE then tells us to resize. We should be viewing Nav+Message
        updateViewState(tc, JAS.minimum);
        tc.isTrue(guiState.isOnePane);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);

        // The visibility event comes last - we should not be affected
        event = document.createEvent("UIEvents");
        event.initUIEvent("msvisibilitychange", true, false, window, 0);
        document.dispatchEvent(event);

        tc.isTrue(guiState.isOnePane);
        tc.isTrue(guiState.isNavPaneActive);
        tc.isTrue(guiState.isMessageListActive);
        tc.isFalse(guiState.isReadingPaneActive);
        validateDOM(tc, guiState);
    });

    Tx.test("GUIState_UnitTest.test_VisibleProperties", function (tc) {
        guiState = makeGUIState(tc);
        updateViewState(tc, JAS.full);
        validateDOM(tc, guiState);

        tc.isFalse(guiState.isOnePane);
        tc.isTrue(guiState.isThreePane);
        tc.isTrue(guiState.isNavPaneVisible);
        tc.isTrue(guiState.isMessageListVisible);
        tc.isTrue(guiState.isReadingPaneVisible);

        updateViewState(tc, JAS.snap);
        validateDOM(tc, guiState);

        tc.isTrue(guiState.isOnePane);
        tc.isFalse(guiState.isThreePane);
        tc.isFalse(guiState.isNavPaneVisible);
        tc.isFalse(guiState.isMessageListVisible);
        tc.isTrue(guiState.isReadingPaneVisible);

        guiState.navigateBackward();

        tc.isTrue(guiState.isOnePane);
        tc.isFalse(guiState.isThreePane);
        tc.isTrue(guiState.isNavPaneVisible);
        tc.isTrue(guiState.isMessageListVisible);
        tc.isFalse(guiState.isReadingPaneVisible);
    });

})();
