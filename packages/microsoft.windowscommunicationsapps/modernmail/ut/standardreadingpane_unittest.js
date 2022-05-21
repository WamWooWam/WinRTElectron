
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true */
/*global Mail,Jx,Tx,Debug*/

(function () {

    var _originals,
        _onNewMessageCalled,
        _readingPaneShown,
        _readyEventFireCount,
        elements = ["idCompCompose"],
        selection;

    function setUp(tc) {
        _onNewMessageCalled = false;
        _readingPaneShown = false;
        _readyEventFireCount = 0;
        _originals = {};

        var incrementReadyEventFireCount = function () { _readyEventFireCount++; };
        Jx.EventManager.addListener(null, "readingPaneHeaderLoaded", incrementReadyEventFireCount);
        Jx.EventManager.addListener(null, "readingPaneBodyLoaded",incrementReadyEventFireCount);

        _originals.ReadingPane = Mail.CompReadingPane;
        Mail.CompReadingPane = function () { };
        Mail.CompReadingPane.Events = { onNewSelectedMessage: "" };
        Mail.CompReadingPane.prototype = {
            getUI: function (ui) { ui.html = "gotUI"; },
            onNewSelectedMessageSynchronous: function () { _onNewMessageCalled = true; },
            showPane: function (show) { _readingPaneShown = show; }
        };

        _originals.append = Mail.StandardReadingPane.prototype.append;
        Mail.StandardReadingPane.prototype.append = function () { };

        _originals.composeHelper = Mail.Utilities.ComposeHelper;
        Mail.Utilities.ComposeHelper = {
            onEdit: function () { },
            isComposeShowing: false
        };

        _originals.instanceOf = Jx.isInstanceOf;
        Jx.isInstanceOf = function () { return true; };

        _originals.appState = Mail.Globals.appState;
        var appState = Mail.Globals.appState = {};
        Jx.mix(appState, Jx.Events);
        Debug.Events.define(appState, "emlMessageChanged");

        _originals.JxglomManager = Jx.glomManager;
        Jx.glomManager = {};
        Jx.glomManager.getIsParent = function () { return false; };
        Jx.glomManager.isGlomOpen = function () { return false; };

        selection = {};

        selection.mock$updateNav = function (accountChanged, viewChanged) {
            this.raiseEvent("navChanged", { accountChanged: accountChanged, viewChanged: viewChanged });
        };

        selection.mock$updateMessage = function (message, isKeyboard) {
            var isSame = message === this.message;
            this.message = message;
            this.raiseEvent("messagesChanged", { messageChanged: !isSame, keyboard: Boolean(isKeyboard) });
        };

        Jx.mix(selection, Jx.Events);
        Debug.Events.define(selection, "navChanged", "messagesChanged");

        Mail.UnitTest.addElements(tc, elements, document.body);

        tc.addCleanup(function () {
            Mail.UnitTest.removeElements(elements);
            Jx.EventManager.removeListener(null, "readingPaneHeaderLoaded", incrementReadyEventFireCount);
            Jx.EventManager.removeListener(null, "readingPaneBodyLoaded",incrementReadyEventFireCount);
            Mail.CompReadingPane = _originals.ReadingPane;
            Mail.StandardReadingPane.append = _originals.append;
            Mail.Utilities.ComposeHelper = _originals.composeHelper;
            Jx.isInstanceOf = _originals.instanceOf;
            Mail.Globals.appState = _originals.appState;
            Jx.glomManager = _originals.JxglomManager;
        });
    }

    Tx.test("StandardReadingPane.test_Component", { owner: "mholden", priority: 0 }, function (tc) {
        // Test basic component creation and activation
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection),
            ui = { html: "", css: "" };
        standardRP.getUI(ui);
        tc.isTrue(ui.html === "gotUI", "Didn't get ReadingPane's ui");
        standardRP.activateUI();
        tc.isTrue(_onNewMessageCalled, "onNewSelectedMessageSynchronous was not called on ReadingPane");

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_ReadOrCompose", { owner: "mholden", priority: 0 }, function (tc) {
        // Test that ReadingPane or compose is opened when appropriate
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // Verify ReadingPane is hidden for drafts
        _readingPaneShown = true;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ isDraft: true, isInInbox: false }]);
        tc.isFalse(_readingPaneShown, "ReadingPane should be hidden for drafts");

        // Verify ReadingPane is not hidden for non drafts
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ isDraft: false, isInInbox: true }]);
        tc.isTrue(_readingPaneShown, "ReadingPane should be visible for non drafts");
        tc.isTrue(_onNewMessageCalled, "onNewSelectedMessageSynchronous was not called on ReadingPane");

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_KeyboardNav", { owner: "mholden", priority: 0 }, function (tc) {
        // Test the logic that delays message switching when navigating via keyboard
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // Verify ReadingPane is updated immediately when the scheduler is flushed for non-keyboard selection change
        _readingPaneShown = _onNewMessageCalled = false;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ objectId: "foo" }]);
        tc.isTrue(_readingPaneShown, "ReadingPane should be visible for non drafts");
        tc.isTrue(_onNewMessageCalled, "onNewSelectedMessageSynchronous was not called on ReadingPane");

        // Verify ReadingPane is not updated immediately when the scheduler is flushed when change comes via keyboard
        _readingPaneShown = _onNewMessageCalled = false;
        selection.mock$updateMessage({ objectId: "bar" }, true);
        Jx.scheduler.testFlush();
        tc.isFalse(_readingPaneShown, "ReadingPane visibility should be updated after timer job");
        tc.isFalse(_onNewMessageCalled, "onNewSelectedMessageSynchronous should be called after timer job");

        // Force the timer job to run now and verify that ReadingPane is updated
        standardRP._onNewSelectedMessageAsyncJob.run();
        tc.isTrue(_readingPaneShown, "ReadingPane should be visible now");
        tc.isTrue(_onNewMessageCalled, "onNewSelectedMessageSynchronous should have been called now");

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_ScreenCapture", { owner: "mholden", priority: 0 }, function (tc) {
        // Test that ReadingPane or compose is opened when appropriate
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // Verify screen capture is disabled
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ irmCanExtractContent: false }]);
        tc.isFalse(standardRP._applicationView.isScreenCaptureEnabled, "Screen capture should be disabled");

        // Verify screen capture is enabled
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ irmCanExtractContent: true }]);
        tc.isTrue(standardRP._applicationView.isScreenCaptureEnabled, "Screen capture should be enabled");

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_MessageSwitch", { owner: "tonypan", priority: 0 }, function (tc) {
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // Selecting a new message
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ objectId: "messageObjectId" }]);
        tc.isTrue(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        // Selecting the same message
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [ selection.message ]);
        tc.isFalse(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        // Selecting null message
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [ null ]);
        tc.isTrue(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_ViewSwitch", { owner: "tonypan", priority: 0 }, function (tc) {
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // View switch resulting in a different displayed message
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        selection.mock$updateNav(false, true);
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ objectId: "foo" }]);
        tc.isTrue(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        // Selected message changed (view stays same)
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ objectId: "bar" }]);
        tc.isTrue(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        // View switch resulting in the same displayed message
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        selection.mock$updateNav(false, true);
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [ selection.message ]);
        tc.isFalse(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 2); // Fix for WinBlue:258020 should have kicked in

        // Same message reselected (view stays same)
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [ selection.message ]);
        tc.isFalse(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        standardRP.deactivateUI();
    });

    Tx.test("StandardReadingPane.test_AccountSwitch", { owner: "tonypan", priority: 0 }, function (tc) {
        setUp(tc);

        var standardRP = new Mail.StandardReadingPane("rootId", selection);
        standardRP.activateUI();

        // Account switch resulting in view and message change
        _onNewMessageCalled = false;
        _readyEventFireCount = 0;
        selection.mock$updateNav(true, true);
        Mail.UnitTest.ensureSynchronous(selection.mock$updateMessage, selection, [{ objectId: "foo" }]);
        tc.isTrue(_onNewMessageCalled);
        tc.areEqual(_readyEventFireCount, 0);

        standardRP.deactivateUI();
    });

})();
