
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Jm,Compose,Mail,Tx,WinJS*/

(function () {

    var _preserver,
        _compose,
        _originalGUIState;

    function setUp() {
        _originalGUIState = Mail.guiState;
        Mail.guiState = { isOnePane: false, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };
        _preserver = Jm.preserve(Compose.BodyComponent.prototype, "composeActivateUI");
        _preserver.preserve(Compose.BodyComponent.prototype, "composeUpdateUI");
        _preserver.preserve(Compose.BodyComponent.prototype, "updateCanvasStylesAsync");

        Compose.BodyComponent.prototype.composeActivateUI = function () { };
        Compose.BodyComponent.prototype.composeUpdateUI = function () { };
        Compose.BodyComponent.prototype.updateCanvasStylesAsync = function () { return WinJS.Promise.as(); };

        _preserver.preserve(Mail.Globals, "commandManager");
        Mail.Globals.commandManager = {
            addContext: function () { },
            addListener: function () { },
            removeListener: function () { }
        };

        var builder = Compose.ComposeBuilder.instance();
        builder.setRootElement(document.body);
        _compose = builder.build({
            components: [Compose.BodyComponent, Compose.Selection, Mail.ComposeSizeUpdater],
            validationViewController: {},
            mailMessageModel: {}
        });
        _compose.activateUI();
        _compose.getComponentCache().getComponent("Compose.BodyComponent");
    }

    function tearDown() {
        _compose = null;
        _preserver.restore();
        Mail.guiState = _originalGUIState;
    }

    Tx.test("ComposeComponents.test_Selection", { owner: "jamima", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp();

        var selection = _compose.getComponentCache().getComponent("Compose.Selection");
        var state = selection.getSelectionState();
        tc.isFalse(state.hasSelection, "hasSelection");
        tc.isFalse(state.hasNonEmptySelection, "hasNonEmptySelection");
        tc.isFalse(state.isLink, "isLink");
        tc.isFalse(selection.composeInFocus, "Compose is in focus");

        var canvas = selection._canvas;
        var calls = 0;
        canvas.addListener("command", function() { calls++; });
        selection.fireCommandEvent("testCommand", "testValue");
        tc.areEqual(1, calls, "Event didn't fire");
    });

    Tx.asyncTest("ComposeComponents.test_Selection_selectionChange", { owner: "jamima", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp();
        tc.stop();
        var selection = _compose.getComponentCache().getComponent("Compose.Selection");
        var calls = 0;
        selection.addListener("selectionchange", function () { calls++; });
        selection._selectionChange({});
        tc.areEqual(0, calls, "callback called too early");
        // second call shouldn't fire it either.
        selection._selectionChange({});
        tc.areEqual(0, calls, "callback called too early again");
        setTimeout(function () {
            Jx.scheduler.runSynchronous(Mail.Priority.composeSelection);
            tc.areEqual(1, calls, "callback not called");
            tc.start();
        }, 300);
    });

    Tx.test("ComposeComponents.test_toCcBccErrors", { owner: "mholden", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;
        setUp();

        // Create ToCcBcc control
        var toCcBcc = new Compose.ToCcBcc(),
            ui = { html: "" };
        toCcBcc.composeGetUI(ui);
        var el = document.createElement("div");
        el.innerHTML = ui.html;
        _compose.getComposeRootElement().appendChild(el);
        toCcBcc._element = _compose.getComposeRootElement();
        toCcBcc._componentBinder = { attach: function () { } };
        toCcBcc._mailMessageModel = { get: function () { return ""; } };
        toCcBcc._onMessageModelChange = function () { };
        toCcBcc._updateCcAndBccAriaFlow = Jx.fnEmpty;
        toCcBcc.getComponentCache = function () {
            // Mock out the HeaderController component that this component uses
            return {
                getComponent: function () {
                    return {
                        isActivated: function () {
                            return true;
                        },
                        changeState: Jx.fnEmpty
                    };
                }
            };
        };
        toCcBcc.composeActivateUI();

        // Ensure error text is empty at start
        tc.isTrue(toCcBcc._errorElement.innerText === "", "Error text should be empty");

        // Ensure error text appears as expected
        toCcBcc._getControlErrors = function () { return { to: "to error", cc: "cc error", bcc: "" }; };
        toCcBcc._displayValidState({ invalidControls: ["Compose.ToCcBcc"] });
        tc.isTrue(toCcBcc._errorElement.innerText === "to error", "Error text wrong");

        // Ensure error text clears on compse update
        toCcBcc.composeUpdateUI();
        tc.isTrue(toCcBcc._errorElement.innerText === "", "Error text should be empty");

        _compose.getComposeRootElement().removeChild(el);
    });

    Tx.test("ComposeComponents.test_backButton", { owner: "mholden", priority: 0 }, function (tc) {
        tc.cleanup = tearDown;

        // Create BackButton
        var backButton = new Compose.BackButton(),
            fullElement = document.createElement("div"),
            snapElement = document.createElement("div");
        fullElement.innerHTML = backButton.getFullHTML();
        snapElement.innerHTML = backButton.getSnapHTML();

        // Replace querySelector
        var originalQS = Compose.doc.querySelector;
        Compose.doc.querySelector = function (selector) {
            if (selector === backButton.getQuerySelector()) {
                return fullElement;
            } else if (selector === backButton.getSnapQuerySelector()) {
                return snapElement;
            }
        };

        // Verfiy button is visible in onePane view, hidden otherwise
        Mail.guiState = { isOnePane: false, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };
        backButton._updateVisibility();
        tc.isTrue(fullElement.classList.contains("hidden"));
        tc.isTrue(snapElement.classList.contains("hidden"));

        Mail.guiState = { isOnePane: true, addListener: Jx.fnEmpty, removeListener: Jx.fnEmpty };
        backButton._updateVisibility();
        tc.isFalse(fullElement.classList.contains("hidden"));
        tc.isFalse(snapElement.classList.contains("hidden"));

        // Restore querySelector
        Compose.doc.querySelector = originalQS;
    });

    Tx.test("ComposeComponents.test_newButton", { owner: "mholden", priority: 0 }, function (tc) {
        // Create NewButton, mocking necessary ui
        var newButton = new Compose.NewButton(),
            fullElement = document.createElement("div"),
            snapElement = document.createElement("div"),
            rootElement = document.createElement("div");
        fullElement.className = "cmdNew";
        rootElement.appendChild(fullElement);
        snapElement.className = "cmdNewSnap";
        rootElement.appendChild(snapElement);
        newButton.getComposeRootElement = function () { return rootElement; };
        newButton.composeActivateUI();

        // Mock ComposeHelper.onNewButton function
        var onNewButtonCalled = false;
        var originalOnNewButton = Mail.Utilities.ComposeHelper.onNewButton;
        Mail.Utilities.ComposeHelper.onNewButton = function () {
            onNewButtonCalled = true;
        };

        // Verify ComposeHelper.onNewButton is called on click
        fullElement.click();
        tc.isTrue(onNewButtonCalled, "ComposeHelper.onNewButton not called");
        onNewButtonCalled = false;
        snapElement.click();
        tc.isTrue(onNewButtonCalled, "ComposeHelper.onNewButton not called");

        // Verify keyboard shortcut works
        var originalGlomManager = Jx.glomManager;
        Jx.glomManager = {
            getIsParent: function () { return true; }
        };
        onNewButtonCalled = false;
        var handler = new Mail.KeyboardShortcutHandler();
        handler._onKeyDown({ ctrlKey: true, keyCode: 78 /* 'n' */, preventDefault: Jx.fnEmpty, stopPropagation: Jx.fnEmpty, stopImmediatePropagation: Jx.fnEmpty });
        tc.isTrue(onNewButtonCalled, "ComposeHelper.onNewButton not called");
        Jx.glomManager = originalGlomManager;

        // Deactivate and restore mock
        newButton.composeDeactivateUI();
        Mail.Utilities.ComposeHelper.onNewButton = originalOnNewButton;
    });

    Tx.test("ComposeComponents.test_messageModelSync", { owner: "mholden", priority: 0 }, function (tc) {
        var messageModel = Compose.MailMessageModel.instance({ initAction: Compose.ComposeAction.createNew });

        var platformMessage = { accountId: "test1" };
        messageModel.getPlatformMessage = function () { return platformMessage; };

        // Ensure platformMessage is updated on normal _sync call
        messageModel.set({ accountId: "test2" });
        messageModel._sync();
        tc.isTrue(platformMessage.accountId === "test2", "Expect platformMessage to be updated");

        // Ensure accountId property is skipped on _sync call when specified
        messageModel.set({ accountId: "test3" });
        messageModel._sync(["accountId"]);
        tc.isTrue(platformMessage.accountId === "test2", "accountId should not have been updated");
    });

    Tx.test("ComposeComponents.test_headerController", { owner: "nthorn", priority: 0 }, function (tc) {
        // Create the header controller
        var headerController = Compose.UnitTest.initializeComponent(tc, Compose.HeaderController),
            mockRoot = headerController.getComposeRootElement(),
            originalGetComposeWindow = Compose.ComposeImpl.getComposeWindow,
            mockToCcBcc = { hasError: function () { return false; } };
        Compose.ComposeImpl.getComposeWindow = function () { return mockRoot; };
        var saveCalled = false;
        Compose.ComposeImpl.quietSave = function () {
            saveCalled = true;
            return WinJS.Promise.as();
        };
        headerController._componentCache.getComponent = function (name) {
            tc.areEqual("Compose.ToCcBcc", name, "Invalid test setup: Expected Header Controller to only ask for the ToCcBcc component. Refactoring this test may be required.");
            return mockToCcBcc;
        };

        // Check that the state starts as null
        tc.isNull(headerController.getCurrentState(), "State should be null before updateUI is called");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that changeState changes the state
        headerController.changeState(Compose.HeaderController.State.editFull);
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.editFull, "changeState should change header state.");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isTrue(mockRoot.classList.contains("header-edit-full"), "Root should have full edit header class");

        // Check that the default state with an empty message is edit mode
        var message = { get: function () { return ""; } };
        headerController.getMailMessageModel = function () { return message; };
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.editCondensed, "State should default to condensed edit mode when message is empty.");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isTrue(mockRoot.classList.contains("header-edit-condensed"), "Root should have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that the default state when bcc has an error is full mode
        mockToCcBcc.hasError = function (type) { return type === "bcc"; };
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.editFull, "State should default to full edit mode when bcc has an error.");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isTrue(mockRoot.classList.contains("header-edit-full"), "Root should have full edit header class");

        // Check that the default state when cc has an error is edit mode
        mockToCcBcc.hasError = function (type) { return type === "cc"; };
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.editCondensed, "State should default to edit mode when cc has an error.");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isTrue(mockRoot.classList.contains("header-edit-condensed"), "Root should have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that the default state when to has an error is edit mode
        mockToCcBcc.hasError = function (type) { return type === "to"; };
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.editCondensed, "State should default to edit mode when to has an error.");
        tc.isFalse(mockRoot.classList.contains("header-readonly"), "Root should not have read only header class");
        tc.isTrue(mockRoot.classList.contains("header-edit-condensed"), "Root should have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that the default state when to is set is read only mode
        mockToCcBcc.hasError = function () { return false; };
        message.get = function (prop) { return prop === "to" ? "someone@example.com" : ""; };
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.isTrue(saveCalled, "Save should have been called when transitioning to readOnly");
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.readOnly, "State should default to read only mode when to is set on message.");
        tc.isTrue(mockRoot.classList.contains("header-readonly"), "Root should have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that the default state when cc is set is read only mode
        message.get = function (prop) { return prop === "cc" ? "someone@example.com" : ""; };
        saveCalled = false;
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.isTrue(saveCalled, "Save should have been called when transitioning to readOnly");
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.readOnly, "State should default to read only mode when cc is set on message.");
        tc.isTrue(mockRoot.classList.contains("header-readonly"), "Root should have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that the default state when bcc is set is read only mode
        message.get = function (prop) { return prop === "bcc" ? "someone@example.com" : ""; };
        saveCalled = false;
        headerController.changeState(null);
        headerController.setDefaultState();
        tc.isTrue(saveCalled, "Save should have been called when transitioning to readOnly");
        tc.areEqual(headerController.getCurrentState(), Compose.HeaderController.State.readOnly, "State should default to read only mode when bcc is set on message.");
        tc.isTrue(mockRoot.classList.contains("header-readonly"), "Root should have read only header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-condensed"), "Root should not have condensed edit header class");
        tc.isFalse(mockRoot.classList.contains("header-edit-full"), "Root should not have full edit header class");

        // Check that composeUpdateUI calls getDefaultState()
        var getDefaultStateCalled = false;
        headerController.getDefaultState = function () { getDefaultStateCalled = true; };
        headerController.composeUpdateUI();
        tc.isTrue(getDefaultStateCalled, "composeUpdateUI should call getDefaultState");

        // Clean up
        Compose.ComposeImpl.getComposeWindow = originalGetComposeWindow;
    });

})();
