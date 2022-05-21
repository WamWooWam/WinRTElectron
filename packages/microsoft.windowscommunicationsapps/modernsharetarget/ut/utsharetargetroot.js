
// Copyright (C) Microsoft. All rights reserved.

/*global Share, WinJS, Jx, Debug, Microsoft, Tx, ShareUnitTestHelpers, ModernCanvas, AddressWell, FromControl, MockCanvas, MailBody, MockMailMessage, MockGetMailBody, MockShareOperation, MockPlatform, Windows, MockCreateFromStream*/
/*jshint browser:true*/

(function () {
    // Place to store global state that tests will change
    var originalShareButton;
    var originalCanvas;
    var originalGetElementById;
    var originalAddEventListener;
    var originalRemoveEventListener;
    var originalShareService;
    var originalShareMailData;
    var originalShareProgress;
    var originalAddressWellController;
    var originalAttachmentWrapper;
    var originalWindows;
    var originalJxAppData;
    var originalJxBici;
    var originalJxEventManager;
    var originalJxFault;
    var originalJxGetUI;
    var originalJxHasClass;
    var originalJxLog;
    var originalJxRes;
    var originalIsWwa;
    var originalFromControl;
    var originalWinJS;
    var originalAddressWellGetTileStream;
    var originalSetTimeout;
    var originalAttachmentWell;

    var unitTestElement;

    function setup () {
        ///<summary>
        /// Store global state that will be modified by tests
        ///</summary>

        // Define namespaces if they are not already defined
        window.AddressWell = window.AddressWell || {};
        window.AttachmentWell = window.AttachmentWell || {};
        window.ModernCanvas = window.ModernCanvas || {};
        ModernCanvas.Plugins = ModernCanvas.Plugins || {};
        ModernCanvas.ContentFormat = ModernCanvas.ContentFormat || {};
        ModernCanvas.ContentLocation = ModernCanvas.ContentLocation || {};
        ModernCanvas.Mail = ModernCanvas.Mail || {};
        window.FromControl = window.FromControl || {};
        Share.MailHelper = Share.MailHelper || {};
        window.WinJS = window.WinJS || {};
        WinJS.Promise = WinJS.Promise || {};
        WinJS.UI = WinJS.UI || {};
        WinJS.UI.Animation = WinJS.UI.Animation || {};

        originalGetElementById = document.getElementById;
        originalAddEventListener = document.addEventListener;
        originalRemoveEventListener = document.removeEventListener;
        originalAddressWellController = window.AddressWell.Controller;
        originalAddressWellGetTileStream = AddressWell.getUserTileStream;
        originalAttachmentWrapper = Share.AttachmentWrapper;
        originalAttachmentWell = window.AttachmentWell;
        originalCanvas = ModernCanvas.ModernCanvas;
        originalShareMailData = Share.MailData;
        originalShareProgress = Share.Progress;
        originalShareButton = Share.ShareButton;
        originalShareService = Share.ShareService;
        originalShareProgress = Share.Progress;
        originalWindows = window.Windows;
        originalJxAppData = Jx.appData;
        originalJxBici = Jx.bici;
        originalJxEventManager = Jx.EventManager;
        originalJxFault = Jx.fault;
        originalJxGetUI = Jx.getUI;
        originalJxHasClass = Jx.hasClass;
        originalIsWwa = Jx.isWWA;
        originalJxLog = Jx.log;
        originalJxRes = Jx.res;

        originalFromControl = FromControl;
        originalWinJS = window.WinJS;
        originalSetTimeout = window.setTimeout;

        Debug.enableAssertDialog = false;

        // Overriding this because it asserts when it doesn't get a real element and we mock elements out in the unit tests.
        Jx.hasClass = function (el, cls) {
            return Boolean(el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')));
        };
        Jx.isWWA = false;
        Jx.res = {
            getString: function (stringId) { return stringId; },
            loadCompoundString: function () { },
            processAll: function () { }
        };
        Jx.bici = {
            addToStream: function () { }
        };
        Jx.log = {
            info: function () {},
            error: function () {},
            exception: function () {},
            verbose: function () {}
        };
        Jx.fault = function () { };
        Jx.appData = {
            localSettings: function () {
                var settings = {
                    get: function () { },
                    set: function () { }
                };
                return settings;
            }
        };

        // Commonly needed empty methods

        Share.AttachmentWrapper = function () {
            this.deactivateUI = function () { };
            this.shutdownComponent = function () { };
            this.getParent = function () { return null; };
            this._setParent = function () { };
        };

        Share.MailData = function () { };

        Share.Progress = function () {
            this.activateUI = function () { };
            this.deactivateUI = function () { };
            this.addListener = function () { };
            this.getParent = function () { return null; };
            this._setParent = function () { };
        };

        Share.QuickLinkData = function () {
            this.associateFromAccount = function () { };
        };

        window.MockCanvas = function () {
            this.getContent = function () { };
            this.setCueText = function () { };
            this.getCharacterCount = function () { };
            this.isContentReady = function () { return true; };
            this.callWhenContentReady = function (func) { func(); };
        };

        window.MailBody = function () {
            this.type = "";
            this.body = "";
        };

        window.MockMailMessage = function () {
            this.to = ["abc", "123", "xyz"];
            this.subject = "";
            this.from = "";
            this.createBody = function () { return new MailBody(); };
            this.getBody = function () { return new MailBody(); };
            this.commit = function () { this.committed = true; };
            this.photoMailAlbumName = "";
            this.photoMailFlags = 0;
            this.committed = false;
        };

        window.MockGetMailBody = function () {
            return "testMail";
        };

        window.MockShareOperation = function () {
            this.SomeProperty = "This is a unit test";
            this.reportStarted = function () { return true; };
            this.dismissUI = Jx.fnEmpty;
            this.data = {
                properties: {
                    applicationListingUri: "This is a fake uri"
                }
            };
        };

        window.MockPlatform = function () {
            return {
                accountManager: {
                    defaultAccount: {
                        id: "This is the default account mock object",
                        mailScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.connected
                    },
                    getConnectedAccountsByScenario: function () {
                        var mockAccountCollection = {
                            count: 2,
                            dispose: function () { }
                        };
                        return mockAccountCollection;
                    }
                },
                mailManager: {
                    id: "This is the mail manager mock object",
                    createMessage: function mockCreateMessage() {
                        return new MockMailMessage();
                    }
                }
            };
        };

        Share.ShareButton = function () {
            this.deactivateUI = function () { };
            this.shutdownComponent = function () { };
            this.addListener = function () { };
            this.removeListener = function () { };
            this.switchToProgress = function () { };
        };

        AddressWell.Controller = function () {
            this.getRecipients = function () { return ["recipinet1"]; };
            this.getRecipientsStringInNameEmailPairs = function () { return []; };
            this.deactivateUI = function () { };
            this.shutdownComponent = function () { };
            this.getError = function () { return null; };
            this.focusInput = function () { };
        };

        var account = {
            objectId: 1
        };

        FromControl.FromControl = function () {
            this.multipleAccounts = function () { return true; };
            this.selectedAccount = account;
            this.select = function () { };
        };
        FromControl.buildFromString = function () {
            return "test@example.com";
        };

        // Set up HTML element to be used by unit tests
        unitTestElement = document.createElement("div");
        document.body.appendChild(unitTestElement);

        // Set up Attachment Well
        window.AttachmentWell = {
            Compose: { }
        };
    }

    function cleanup() {
        ///<summary>
        /// Restore original state
        ///</summary>

        document.getElementById = originalGetElementById;
        document.addEventListener = originalAddEventListener;
        document.removeEventListener = originalRemoveEventListener;

        ModernCanvas.ModernCanvas = originalCanvas;
        window.FromControl = originalFromControl;

        Share.MailData = originalShareMailData;
        Share.ShareButton = originalShareButton;
        Share.ShareService = originalShareService;
        AddressWell.Controller = originalAddressWellController;
        window.Windows = originalWindows;
        Jx.appData = originalJxAppData;
        Jx.bici = originalJxBici;
        Jx.EventManager = originalJxEventManager;
        Jx.fault = originalJxFault;
        Jx.getUI = originalJxGetUI;
        Jx.hasClass = originalJxHasClass;
        Jx.isWWA = originalIsWwa;
        Jx.log = originalJxLog;
        Jx.res = originalJxRes;


        Debug.enableAssertDialog = true;

        AddressWell.Controller = originalAddressWellController;
        AddressWell.getUserTileStream = originalAddressWellGetTileStream;
        window.WinJS = originalWinJS;
        window.setTimeout = originalSetTimeout;

        document.body.removeChild(unitTestElement);
    }

    function createShareTargetRoot() {
        ///<summary>
        /// Calls ShareTargetRoot constructor while overriding appropriate functions so that there aren't errors.
        /// No components will be added.
        ///</summary>
        ///<returns type="Share.TargetRoot">Created target root</returns>


        var shareTargetRoot;

        var mockShareOperation = {
            data: {},
            loadDataAsync: Jx.fnEmpty
        };

        shareTargetRoot = new Share.TargetRoot(mockShareOperation);
        shareTargetRoot._dataLoadPromise = null; // Unit tests can set this to whatever they'd like.

        return shareTargetRoot;
    }

    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    opt.description = "A test where the constructor is not called via new. Verifies that an appropriate helpful message is returned to the caller.";
    Tx.test("ShareTarget.testConstructorWithoutNewError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        tc.expectException(function() { Share.TargetRoot(); }, "Share.TargetRoot is a constructor; it must be called using new");
    });

    opt.description = "Verifies that the constructor functions properly and starts the correct operations";
    Tx.test("ShareTarget.testConstructor", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockOperation = {
            id: "this is the mock operation",
            data: {}
        };

        var shareTargetRoot = new Share.TargetRoot(mockOperation);

        tc.isNotNull(shareTargetRoot._data, "Expected to see data object");
    });

    opt.description = "Verifies that setPlatform functions properly and starts the correct operations";
    Tx.test("ShareTarget.testSetPlatform", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var beginLoadDataCalled = false;
        var createComponentsCalled = false;
        var mockBeginLoadData = function () {
            beginLoadDataCalled = true;
            // fake _beginLoadAsync sets fake promise
            this._dataLoadPromise = { then: function () { } };
        };
        var mockPlatform = new MockPlatform();

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginLoadData = mockBeginLoadData;
        shareTargetRoot._createChildren = function () {
            createComponentsCalled = true;
        };
        shareTargetRoot._checkStartupState = function () { };

        shareTargetRoot.setPlatform(mockPlatform);

        tc.areEqual(shareTargetRoot._platform, mockPlatform, "Expected setPlatform to save platform locally");
        tc.isTrue(beginLoadDataCalled, "Didn't call into _beginLoadData to start async tasks");
        tc.isTrue(createComponentsCalled, "Didn't call into _createChildren to create components");
    });

    opt.description = "Verifies that we don't start async tasks and create children when there is an error instantiating the platform";
    Tx.test("ShareTarget.testSetPlatformError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();

        shareTargetRoot._startAsync = function () { tc.error("Unexpected call to startAsync"); };
        shareTargetRoot._createChildren = function () { tc.error("Unexpected call to createChildren"); };
        shareTargetRoot._checkStartupState = function () { this._startupError = Share.MailConstants.StartupError.userNotSignedIn;};

        shareTargetRoot.setPlatform({});

        tc.areEqual(Share.MailConstants.StartupError.userNotSignedIn, shareTargetRoot._startupError, "Invalid test setup: no startup error");
        tc.isTrue(shareTargetRoot._dataReady, "Should signal that data loading is complete in error case");
    });

    opt.description = "A test for activateUI in the case that there is a startup error";
    Tx.test("ShareTarget.testActivateUIError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._startupError = Share.MailConstants.StartupError.userNotSignedIn;

        shareTargetRoot._address = {
            setLabelledBy: function () { }
        };
        shareTargetRoot._attachDocumentListeners = function () {
            tc.error("Should not attach document listeners in error case");
        };

        // Set up enterContent to return fake promise
        WinJS.UI.Animation.enterContent = function () {
            return {
                done: function () { }
            };
        };

        shareTargetRoot.activateUI();

        // Real test is that it doesn't throw or hit the Assert.fail cases above
        tc.isTrue(shareTargetRoot._uiInitialized, "Invalid test setup: did not execute activateUI");
    });

    opt.description = "A test which calls activateUI twice and verifies it doesn't animate twice, etc";
    Tx.test("ShareTarget.testActivateUITwice", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var processAllCount = 0;
        var shareTargetRoot = createShareTargetRoot();

        Jx.res.processAll = function () {
            processAllCount++;
        };
        shareTargetRoot._address = { setLabelledBy: function () { }, setAriaFlow: function () { } };

        shareTargetRoot.activateUI();
        shareTargetRoot.activateUI();

        tc.areEqual(1, processAllCount, "Expected processAll to happen exactly once");
    });

    opt.description = "A test for _renderDataArea when the component has been shut down";
    Tx.test("ShareTarget.testRenderDataAreaShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var assertFail = function () { tc.error("Unexpected function call; function should immediately terminate when shut down."); };

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot.isShutdown = function () { return true; };
        shareTargetRoot._startRenderData = assertFail;
        WinJS.UI.Animation.fadeIn = assertFail;
        window.setTimeout = assertFail;

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;

        // Test is that this does not hit the assertions above.
        shareTargetRoot._renderDataArea();
    });

    opt.description = "A test for _renderDataArea in the case where the data is ready immediately";
    Tx.test("ShareTarget.testRenderDataAreaDataReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var assertFail = function () { tc.error("Unexpected function call; should not have rendered the not-ready case."); };
        var renderDataCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._startRenderData = function () {
            renderDataCalled = true;
        };
        shareTargetRoot._address = new AddressWell.Controller();
        shareTargetRoot._prefillRecipientFromQuicklink = function () { };
        // For this test, the data is ready when afterAnimationFunction is called
        shareTargetRoot._dataReady = true;

        // Mocking this out also prevents function calls outside of unit test context
        WinJS.UI.Animation.fadeIn = assertFail;
        window.setTimeout = assertFail;

        shareTargetRoot._renderDataArea();

        tc.isTrue(renderDataCalled, "Expected call to _startRenderData if data is ready after initial animation");
    });

    opt.description = "A test for _renderDataArea in the case that there is a startup error";
    Tx.test("ShareTarget.testRenderDataAreaError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var assertFail = function () { tc.error("Unexpected function call; should not have rendered the not-ready case."); };

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._startRenderData = function () {
            tc.error("Unexpected call to _startRenderData");
        };
        shareTargetRoot._prefillRecipientFromQuicklink = function () {
            tc.error("Unexpected call to _prefillRecipientFromQuicklink");
        };
        shareTargetRoot._address = new AddressWell.Controller();
        shareTargetRoot._startupError = Share.MailConstants.StartupError.userNotSignedIn;

        // Mocking this out also prevents function calls outside of unit test context
        WinJS.UI.Animation.fadeIn = assertFail;
        window.setTimeout = assertFail;

        shareTargetRoot._renderDataArea();

        // Test is that this doesn't throw or hit any of the Assert.fail cases above
    });

    opt.description = "A test for _renderDataArea in the case where the data is not ready immediately";
    Tx.test("ShareTarget.testRenderDataAreaDataNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var fadeInCalled = false;
        var timeoutCalled = false;

        unitTestElement.innerHTML = '<div id="shareContentArea"></div>';

        var mockPromise = {
            then: function () {}
        };

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._startRenderData = function () {
            tc.error("Unexpected call to _startRenderData");
        };
        shareTargetRoot._prefillRecipientFromQuicklink = function () {
        };

        WinJS.UI.Animation.fadeIn = function () {
            fadeInCalled = true;
            return mockPromise;
        };
        shareTargetRoot._address = new AddressWell.Controller();
        // Mock out setTimeout to prevent function calls outside of unit test context
        window.setTimeout = function () { timeoutCalled = true; };

        // For this test, the data is not ready when _renderDataArea is called
        shareTargetRoot._renderDataArea();

        tc.isTrue(fadeInCalled, "Expected call to fadeIn animation");
        tc.isTrue(timeoutCalled, "Expected call to timeout for loading");
    });

    function prepareMinTimeCallback(shareTargetRoot, tc) {
        /// <summary>
        /// Helper function that sets up a shareTargetRoot to retrieve the min-time-callback from renderDataArea.
        /// </summary>
        /// <param name="shareTargetRoot" type="Share.TargetRoot">TargetRoot to use for this test.  Will be modified by this method.</param>
        /// <returns type="Function">Min time callback</returns>

        var afterTimeoutFunction = null;

        unitTestElement.innerHTML = '<div id="shareContentArea"></div>';

        var mockPromise = {
            then: function () { }
        };
        shareTargetRoot._startRenderData = function () {
            tc.error("Invalid test setup: unexpected call to _startRenderData");
        };
        shareTargetRoot._prefillRecipientFromQuicklink = function () { };
        WinJS.UI.Animation.fadeIn = function () {
            return mockPromise;
        };
        // Capture the timeout callback
        window.setTimeout = function (timeoutCallback) {
            afterTimeoutFunction = timeoutCallback;
        };

        // For this test, the data is not ready when _renderDataArea is called
        shareTargetRoot._renderDataArea();

        tc.isNotNull(afterTimeoutFunction, "Unable to find after-timeout method");

        return afterTimeoutFunction;
    }

    opt.description = "A test for _renderDataArea in the case where the component is shut down for the min time callback";
    Tx.test("ShareTarget.testRenderDataAreaMinTimeCallbackShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = new AddressWell.Controller();

        var afterTimeoutFunction = prepareMinTimeCallback(shareTargetRoot, tc);

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;
        
        // For this test, the component is shutdown when the after-timeout function is called
        shareTargetRoot.isShutdown = function () { return true; };
        shareTargetRoot._dataRenderReady = function () { tc.error("Unexpected function call"); };
        
        // Test is that it doesn't hit the above assertion
        afterTimeoutFunction();
    });

    opt.description = "A test for _renderDataArea in the case where the data is ready immediately after the loading min time has expired";
    Tx.test("ShareTarget.testRenderDataAreaMinTimeDataReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var renderDataCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = new AddressWell.Controller();
        
        var afterTimeoutFunction = prepareMinTimeCallback(shareTargetRoot, tc);

        // For this test, the data is ready when afterTimeoutFunction is called
        shareTargetRoot._dataReady = true;
        shareTargetRoot._startRenderData = function () {
            renderDataCalled = true;
        };
        afterTimeoutFunction();

        tc.isTrue(renderDataCalled, "Expected call to _startRenderData");
    });

    opt.description = "A test for _renderDataArea in the case where the data is not ready immediately after the loading min time has expired";
    Tx.test("ShareTarget.testRenderDataAreaMinTimeDataNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = new AddressWell.Controller();
        
        var afterTimeoutFunction = prepareMinTimeCallback(shareTargetRoot, tc);

        shareTargetRoot._startRenderData = function () {
            tc.error("Unexpected call to _startRenderData");
        };

        // For this test, the data is not ready when afterTimeoutFunction is called
        afterTimeoutFunction();

        // Test is also that it doesn't call _startRenderData (Assert.fail, above)
        tc.isTrue(shareTargetRoot._initialUIReady, "Expected loading timer to set initialUIReady state");
    });


    opt.description = "A test for getUI";
    Tx.test("ShareTarget.testGetUI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var usedFromUI = false;
        var usedAddressUI = false;
        var usedButtonUI = false;

        var root = createShareTargetRoot();
        root._platform = new MockPlatform();
        var mockUI = {
            html: "MockHtml"
        };

        // set up some components
        root._fromCtrl = {
            getUI: function () { usedFromUI = true; return mockUI; }
        };
        root._address = {
            getUI: function () { usedAddressUI = true; return mockUI; },
            getInputElementId: function () { return "id"; }
        };
        root._shareButton = {
            getUI: function () { usedButtonUI = true; return mockUI; }
        };

        var ui = Jx.getUI(root);

        tc.areEqual(Share.MailConstants.StartupError.none, root._startupError, "Invalid test setup: should not be in error case");
        tc.isTrue(Jx.isNonEmptyString(ui.html), "Could not find html value on ui object");
        tc.isTrue(usedFromUI, "Expected getUI to consume From control's UI");
        tc.isTrue(usedAddressUI, "Expected getUI to consume AddressWell control's UI");
        tc.isTrue(usedButtonUI, "Expected getUI to consume Button control's UI");
    });

    opt.description = "A test for getUI";
    Tx.test("ShareTarget.testGetUIError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();
        root._startupError = Share.MailConstants.StartupError.mailNotSetup;

        // set up some components
        root._fromCtrl = {
            getUI: function () { tc.error("Unexpected request for from html"); }
        };
        root._address = {
            getUI: function () { tc.error("Unexpected request for Address html"); },
            getInputElementId: function () { return "id"; }
        };
        root._shareButton = {
            getUI: function () { tc.error("Unexpected request for Button html"); }
        };

        var ui = Jx.getUI(root);

        tc.isTrue(Jx.isNonEmptyString(ui.html), "Could not find html value on ui object");
    });

    opt.description = "A test to verify that getUI validates the platform before rendering";
    Tx.test("ShareTarget.testGetUINoPlatform", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();

        // It is a valid case that getUI is called before the platform is set (if the platform is unavailable), verify that here.

        var ui = Jx.getUI(root);

        tc.isTrue(ui.html.indexOf("share-error") >= 0, "Error UI did not contain expected string");
    });

    opt.description = "A test to verify that getUI calls into the network error UI based on the startupError property";
    Tx.test("ShareTarget.testGetUINetworkError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();
        root._checkStartupState = function () { this._startupError = Share.MailConstants.StartupError.needsInternet; };

        var ui = Jx.getUI(root);

        tc.isTrue(ui.html.indexOf("networkErrorText") >= 0, "Error UI did not contain expected string");
    });

    opt.description = "Verifies _checkStartupState where everything is good";
    Tx.test("ShareTarget.testCheckStartupStateGood", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var accountsDisposed = false;

        var root = createShareTargetRoot();
        root._platform = {
            accountManager: {
                defaultAccount: {
                    mailScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.connected
                },
                getConnectedAccountsByScenario: function () {
                    // returns fake account collection
                    var fakeAccounts = {
                        count: 1,
                        dispose: function () { accountsDisposed = true; }
                    };
                    return fakeAccounts;
                }
            }
        };

        root._checkStartupState();

        tc.areEqual(Share.MailConstants.StartupError.none, root._startupError, "Expected no error case");
        tc.isTrue(accountsDisposed, "Expected accounts collection to be disposed");
    });

    opt.description = "Verifies _checkStartupState where there has already been an error";
    Tx.test("ShareTarget.testCheckStartupStateExistingError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var originalError = 45; // mock error

        var root = createShareTargetRoot();
        root._startupError = originalError;

        // Note there is no platform, which should cause the startupError to be changed if that code runs.

        root._checkStartupState();

        tc.areEqual(originalError, root._startupError, "checkStartupState should not change error if it has already been set");
    });

    opt.description = "Verifies _checkStartupState where there is no platform";
    Tx.test("ShareTarget.testCheckStartupStateNoPlatform", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();

        root._checkStartupState();

        tc.areEqual(Share.MailConstants.StartupError.genericError, root._startupError, "Unexpected startup error when there is no platform");
    });

    opt.description = "Verifies _checkStartupState for the EASI account case: defaultAccount will not be connected, but there will be a returned value from the platform query.";
    Tx.test("ShareTarget.testCheckStartupStateEASI", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();
        root._platform = {
            accountManager: {
                defaultAccount: {
                    mailScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.none
                },
                getConnectedAccountsByScenario: function () {
                    // returns fake account collection
                    var fakeAccounts = {
                        count: 5,
                        dispose: function () { }
                    };
                    return fakeAccounts;
                }
            }
        };

        root._checkStartupState();

        tc.areEqual(Share.MailConstants.StartupError.none, root._startupError, "Expected no error case");
    });

    opt.description = "Verifies that things work correctly when there is an error getting the accounts (verifies finally clause doesn't throw)";
    Tx.test("ShareTarget.testCheckStartupStateErrorGettingAccounts", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();
        root._platform = {
            accountManager: {
                defaultAccount: {
                    mailScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.none
                },
                getConnectedAccountsByScenario: function () {
                    throw new Error("This is a test error");
                }
            }
        };

        root._checkStartupState();

        tc.areEqual(Share.MailConstants.StartupError.genericError, root._startupError, "Expected error case");
    });

    opt.description = "Verifies dataLoadComplete in the typical case: there is no data load promise, and no startup error.";
    Tx.test("ShareTarget.testDataLoadCompleteTypical", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var deactivatedTimeout = false;
        var createdChildren = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._deactivateTimeout = function () { deactivatedTimeout = true; };
        shareTargetRoot._createDependentChildren = function () { createdChildren = true; };
        shareTargetRoot._dataLoadPromise = null;

        shareTargetRoot._dataLoadComplete();

        tc.isTrue(shareTargetRoot._dataReady, "dataLoadComplete should set dataReady to true");
        tc.isTrue(deactivatedTimeout, "dataLoadComplete should deactivate any data load timeout");
        tc.isTrue(createdChildren, "dataLoadComplete should create dependent children");
    });

    opt.description = "Verifies that dataLoadComplete cancels the data promise if it exists.";
    Tx.test("ShareTarget.testDataLoadCompleteCancelsDataPromise", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var canceledDataLoad = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._deactivateTimeout = function () { };
        shareTargetRoot._createDependentChildren = function () { };
        // Fake promise
        shareTargetRoot._dataLoadPromise = {
            cancel: function () { canceledDataLoad = true; }
        };

        shareTargetRoot._dataLoadComplete();

        tc.isTrue(canceledDataLoad, "dataLoadComplete should cancel any ongoing data load");
    });

    opt.description = "Verifies that dataLoadComplete does not create dependent children if there is a startup error.";
    Tx.test("ShareTarget.testDataLoadCompleteWithStartupError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var createdChildren = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._deactivateTimeout = function () { };
        shareTargetRoot._createDependentChildren = function () { createdChildren = true; };
        shareTargetRoot._dataLoadPromise = null;
        shareTargetRoot._startupError = Share.MailConstants.StartupError.needsInternet;

        shareTargetRoot._dataLoadComplete();

        tc.isFalse(createdChildren, "Should not create children if there is a startup error");
    });

    opt.description = "Verifies that addRecipientByString is not called if there's no quick link";
    Tx.test("ShareTarget.testPrefillRecipientFromQuicklinkNoQuicklink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._data = {
            shareOperation: {
                quickLinkId: null
            }
        };
        var recipientAdded = false;
        shareTargetRoot._address = {
            addRecipientsByString: function () {
                recipientAdded = true;
                tc.error("Unexpected call to addRecipientsByString");
            }
        };

        shareTargetRoot._prefillRecipientFromQuicklink();

        // Real test is that this does not throw or hit the Assert.fail
        tc.isFalse(recipientAdded, "Recipient should not have been added");
    });

    opt.description = "Verifies that addRecipientByString is called if there's a quick link";
    Tx.test("ShareTarget.testPrefillRecipientFromQuicklink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var recipientAdded = false,
            autoSuggestTurnedOff = false;

        var quicklinkString = "ThisIsMyQuicklink";

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._data = {
            shareOperation: {
                quickLinkId: quicklinkString
            }
        };
        shareTargetRoot._address = {
            addRecipientsByString: function (recipientString) {
                tc.areEqual(quicklinkString, recipientString, "Unexpected value passed to address well");
                recipientAdded = true;
            },
            setAutoSuggestOnFocus: function (autoSuggest) {
                autoSuggestTurnedOff = autoSuggest === false;
            }
        };

        shareTargetRoot._prefillRecipientFromQuicklink();

        tc.isTrue(recipientAdded, "Quicklink was not used to populate AddressWell");
        tc.isTrue(autoSuggestTurnedOff, "AutoSuggest should be turned off when a Quicklink is used");
    });

    opt.description = "Verifies that createChildren initializes children appropriately";
    Tx.test("ShareTarget.testCreateChildren", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockPlatform = {
            accountManager: {
                loadAccount: function () {
                    var mockAccount = {
                        preferredSendAsAddress: "mock-account@live.com"
                    };
                    return mockAccount;
                }
            }
        };

        // Set up mocks
        var buttonObject = {
            id: "This is a Share.ShareButton mock object",
            addListener: function () { }
        };

        Share.ShareButton = function () {
            return buttonObject;
        };

        var addressWellObject = {
            address: "This is an AddressWell.Controller mock object",
            setContextualAccount: function (addr) { this.address = addr; },
            setScrollsIntoView: Jx.fnEmpty
        };

        AddressWell.Controller = function (arg1, arg2, arg3, arg4) {
            tc.isTrue(arg4, "showSuggestions should be true");
            return addressWellObject;
        };

        var mockFromAccountId = "MockAccount";
        Jx.appData = {
            localSettings: function () {
                return {
                    get: function (valueName) {
                        if (valueName === "ShareToMailAccount") { return mockFromAccountId; }
                    }
                };
            }
        };

        var selectedFromAccountId = "";
        var fromObject = {
            id: "This is a mock FromControl object",
            select: function (accountId) { selectedFromAccountId = accountId; },
        };
        Object.defineProperty(fromObject, "selectedAccount", { get: function () { return selectedFromAccountId; } });

        FromControl.FromControl = function () {
            return fromObject;
        };

        var root = createShareTargetRoot();
        root._platform = mockPlatform;
        root.append = function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                // Record that the item was appended so that it can be validated later.
                arguments[i].appended = true;
            }
        };

        root._createChildren();

        tc.isTrue(buttonObject.appended, "Button was not appended");
        tc.areEqual(buttonObject, root._shareButton, "Button was not set as local state");

        tc.isTrue(addressWellObject.appended, "AddressWell was not appended");
        tc.areEqual(addressWellObject, root._address, "AddressWell was not set as local state");
        tc.areEqual(addressWellObject.address, mockFromAccountId, "AddressWell contextual account was not set");

        tc.isTrue(fromObject.appended, "From control was not appended");
        tc.areEqual(fromObject, root._fromCtrl, "FromControl was not set as local state");
        tc.areEqual(mockFromAccountId, selectedFromAccountId, "FromControl account was not set");
    });

    opt.description = "Tests endDataLoad when the component is shut down";
    Tx.test("ShareTarget.testEndDataLoadShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var root = createShareTargetRoot();
        root.isShutdown = function () { return true; };
        root._setDataReady = function () { tc.error("Unexpected function call"); };

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;
        
        // Test is that this does not hit the assertion above.
        root._endDataLoad();
    });

    opt.description = "Test for endDataLoad";
    Tx.test("ShareTarget.testEndDataLoad", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var createChildrenCalled = false;

        var root = createShareTargetRoot();

        root._createDependentChildren = function () {
            createChildrenCalled = true;
        };

        root._endDataLoad();

        tc.isTrue(createChildrenCalled, "Expected a call to createDependentChildren");
        tc.isNull(root._dataLoadPromise, "Data load promise should have been set to null");
        tc.isTrue(root._dataReady, "DataReady should have been set to true");
    });

    opt.description = "Verifies endDataLoad, when everything else is ready, the data render happens";
    Tx.test("ShareTarget.testEndDataLoadStartsRenderData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var renderCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._createDependentChildren = function () { };
        shareTargetRoot._startRenderData = function () {
            renderCalled = true;
        };

        // This test case tests the case where the UI is ready
        shareTargetRoot._initialUIReady = true;

        tc.isFalse(shareTargetRoot._dataRenderReady(), "Invalid test setup: data render shouldn't be ready until endDataLoad is called");

        shareTargetRoot._endDataLoad();

        tc.isTrue(shareTargetRoot._dataRenderReady(), "Data render should be ready");
        tc.isTrue(renderCalled, "Expected call to _startRenderData");
    });

    opt.description = "Verifies endDataLoad, when other things are not ready, the data render doesn't happen.";
    Tx.test("ShareTarget.testEndDataLoadStartsRenderDataNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var renderCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._createDependentChildren = function () { };
        shareTargetRoot._startRenderData = function () {
            renderCalled = true;
        };

        // This test case tests the case where the UI is not ready
        shareTargetRoot._initialUIReady = false;

        shareTargetRoot._endDataLoad();

        tc.isFalse(shareTargetRoot._dataRenderReady(), "Invalid test setup: data render should not be ready");
        tc.isFalse(renderCalled, "Expected call to _startRenderData");
    });

    opt.description = "Tests endDataLoadError when the component is shut down";
    Tx.test("ShareTarget.testEndDataLoadErrorShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var assertFail = function () { tc.error("Unexpected function call"); };

        var root = createShareTargetRoot();
        root.isShutdown = function () { return true; };
        root._data = {
            recordError: assertFail
        };
        root._endDataLoad = assertFail;

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;

        // Test is that this does not hit the assertions above.
        root._endDataLoadError();
    });

    opt.description = "Tests endDataLoadError";
    Tx.test("ShareTarget.testEndDataLoadError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var errorRecorded = false;
        var endDataLoadCalled = false;

        var root = createShareTargetRoot();
        root._data = {
            errorCategory: Share.Constants.DataError.none,
            recordError: function () { errorRecorded = true; }
        };
        root._endDataLoad = function () { endDataLoadCalled = true; };

        root._endDataLoadError();

        tc.isTrue(errorRecorded, "Expected call to recordError");
        tc.isTrue(endDataLoadCalled, "Expected call to endDataLoad");
    });

    opt.description = "Tests endDataLoadError for the timeout case";
    Tx.test("ShareTarget.testEndDataLoadErrorTimeout", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var errorRecorded = false;
        var endDataLoadCalled = false;

        var root = createShareTargetRoot();
        root._data = {
            errorCategory: Share.Constants.DataError.internalError, // in the timeout case the error is already set
            recordError: function () { errorRecorded = true; }
        };
        root._endDataLoad = function () { endDataLoadCalled = true; };

        root._endDataLoadError();

        tc.isFalse(errorRecorded, "Unexpected call to recordError");
        tc.isTrue(endDataLoadCalled, "Expected call to endDataLoad");
    });

    opt.description = "Verifies that the control initializes children properly when the share data is in text mode";
    Tx.test("ShareTarget.testCreateDependentChildrenText", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockMessage = new MockMailMessage();

        var mockPlatform = {
            accountManager: {
                defaultAccount: { id: "This is the default account mock object" }
            },
            mailManager: {
                id: "This is the mail manager mock object",
                createMessage: function mockCreateMessage() {
                    return mockMessage;
                }
            }
        };

        var root = createShareTargetRoot();
        root._platform = mockPlatform;
        root._data = {
            messageHtml: "This is a Share.MailData mock object for unit testing",
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.text; }
        };

        Share.AttachmentWrapper = function () {
            tc.error("Share.AttachmentWrapper should not be constructed unless there is file data.");
        };

        root.append = function () { };

        root._createDependentChildren();

        tc.isNull(root._attachmentWrapper, "Attachments should not be initialized for non-file case");

        // Also verify that we've set the appropriate flags not to wait for links or attachments
        tc.isTrue(root._uploadCompleted, "Did not set _uploadCompleted flag");
        tc.isTrue(root._bitmapAttached, "Did not set _bitmapAttached flag");

        // Verify mail object is not committed for text
        tc.isFalse(root._data.mailMessage.committed, "mailMessage should not be committed for text");
    });

    opt.description = "Verifies that the control initializes children appropriately when the share data is in link mode";
    Tx.test("ShareTarget.testCreateDependentChildrenLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var sharedUrl = "http://www.live.com/?unitTest=5";

        var root = createShareTargetRoot();
        root._platform = new MockPlatform();
        root._data = {
            messageHtml: "This is a Share.MailData mock object for unit testing",
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink; },
            uri: sharedUrl
        };
        root.append = function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                // Record that the item was appended so that it can be validated later.
                arguments[i].appended = true;
            }
        };

        Share.AttachmentWrapper = function () {
            tc.error("Share.AttachmentWrapper should not be constructed unless there is file data.");
        };

        root._createDependentChildren();

        tc.isNull(root._attachmentWrapper, "Attachments should not be initialized for non-file case");

        // Also verify that we've set the appropriate flags not to wait for links or attachments
        tc.isTrue(root._uploadCompleted, "Did not set _uploadCompleted flag");
        tc.isTrue(root._bitmapAttached, "Did not set _bitmapAttached flag");

        // Verify mail object is not committed for text
        tc.isFalse(root._data.mailMessage.committed, "mailMessage should not be committed for link");
    });

    opt.description = "Verifies that the control initializes children properly when the share data is in files mode";
    Tx.test("ShareTarget.testCreateDependentChildrenFiles", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockMessage = new MockMailMessage();

        var mockPlatform = {
            accountManager: {
                defaultAccount: { id: "This is the default account mock object" }
            },
            mailManager: {
                id: "This is the mail manager mock object",
                createMessage: function mockCreateMessage() {
                    return mockMessage;
                }
            }
        };

        var root = createShareTargetRoot();
        root._operation = {
            id: "This is the operation"
        };
        root._platform = mockPlatform;
        root._data = {
            messageHtml: "This is a Share.MailData mock object for unit testing",
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems; },
            storageItems: "This is the mock string that represents the storageItems"
        };
        root.append = function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                // Record that the item was appended so that it can be validated later.
                arguments[i].appended = true;
            }
        };

        var attachmentObject = { id: "This is a Share.AttachmentWrapper mock object" };

        Share.AttachmentWrapper = function (storageItems, mailManager) {
            tc.areEqual(root._data.storageItems, storageItems, "Unexpected storageItems object passed to attachmentWrapper constructor");
            tc.areEqual(root._platform.mailManager, mailManager, "Unexpected mail object passed to attachmentWrapper constructor");

            return attachmentObject;
        };

        root._createDependentChildren();

        tc.isTrue(root._bitmapAttached, "Did not set _bitmapAttached flag");

        tc.isTrue(root._data.mailMessage.committed, "mailMessage should be committed for files");
        tc.isTrue(attachmentObject.appended, "AttachmentWrapper was not appended");
        tc.areEqual(attachmentObject, root._attachmentWrapper, "AttachmentWrapper was not set as local state");
        tc.areEqual(mockMessage.to, root._data.mailMessage.to, "mailMessage not set as state on data object");
    });

    opt.description = "Verifies that the control initializes children properly when the share data is in bitmap mode";
    Tx.test("ShareTarget.testCreateDependentChildrenBitmap", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockMessage = new MockMailMessage();

        var mockPlatform = {
            accountManager: {
                defaultAccount: { id: "This is the default account mock object" }
            },
            mailManager: {
                id: "This is the mail manager mock object",
                createMessage: function mockCreateMessage() {
                    return mockMessage;
                }
            }
        };

        var root = createShareTargetRoot();
        root._operation = {
            id: "This is the operation"
        };
        root._platform = mockPlatform;
        root._data = {
            messageHtml: "This is a Share.MailData mock object for unit testing",
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.bitmap; },
            bitmap: {
                openReadAsync: function () {
                    // Fake a promise
                    return {
                        then: function (fn) {
                            return fn();
                        }
                    };
                }
            }
        };
        root.append = function () {
            for (var i = 0, len = arguments.length; i < len; i++) {
                // Record that the item was appended so that it can be validated later.
                arguments[i].appended = true;
            }
        };

        var attachmentObject = { id: "This is a Share.AttachmentWrapper mock object" };

        Share.AttachmentWrapper = function (storageItems, mailManager) {
            tc.areEqual(root._data.storageItems, storageItems, "Unexpected storageItems object passed to attachmentWrapper constructor");
            tc.areEqual(root._platform.mailManager, mailManager, "Unexpected mail object passed to attachmentWrapper constructor");

            return attachmentObject;
        };

        var originalModernCanvasMail = ModernCanvas.Mail,
            createAttachmentAsyncCalled = false;
        ModernCanvas.Mail = {
            createAttachmentAsync: function () {
                createAttachmentAsyncCalled = true;

                // Fake a promise
                return {
                    done: function (fn) {
                        fn();
                    }
                };
            }
        };

        root._createDependentChildren();

        tc.isTrue(root._data.mailMessage.committed, "mailMessage should be committed for files");
        tc.isTrue(attachmentObject.appended, "AttachmentWrapper was not appended");
        tc.areEqual(attachmentObject, root._attachmentWrapper, "AttachmentWrapper was not set as local state");
        tc.areEqual(mockMessage.to, root._data.mailMessage.to, "mailMessage not set as state on data object");
        tc.isTrue(createAttachmentAsyncCalled, "Expected createAttachmentAsync to be called.");

        ModernCanvas.Mail = originalModernCanvasMail;
    });

    opt.description = "Verifies createDependentChildren when it's called after send - the mail exists";
    Tx.test("ShareTarget.testCreateDependentChildrenAfterSend", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockMessage = new MockMailMessage();

        var root = createShareTargetRoot();
        root._data = {
            mailMessage: mockMessage,
            containsShareType: function () { return false; }
        };

        root._createDependentChildren();

        // Verify we didn't overwrite the mailMessage with a new one
        tc.areEqual(mockMessage, root._data.mailMessage, "mailMessage should not have been changed");
    });

    opt.description = "Verifies that if the async callback takes too long, the render method only renders once. Tests timeout before send is clicked.";
    Tx.test("ShareTarget.testTimeoutBeforeSend", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var animateCount = 0;
        var createChildrenCount = 0;

        unitTestElement.innerHTML = '<div id="shareContentArea"></div>';

        var mockPromise = {
            then: function () {}
        };

        var root = createShareTargetRoot();
        root._data = {
            recordError: function () { this._error = 5; }
        };
        root._createDependentChildren = function () {
            createChildrenCount++;
        };
        root._renderData = function () {
            tc.error("Unexpected call to renderData");
        };
        root._initialUIReady = true;
        root._activateData = function () {};

        WinJS.UI.Animation.enterContent = function () {};
        WinJS.UI.Animation.exitContent = function () {
            animateCount++;
            return mockPromise;
        };

        // This is the expected call pattern that happens during timeout
        root._dataTimeout();
        root._endDataLoadError();

        tc.areEqual(1, animateCount, "Expected animation to happen exactly once");
        tc.areEqual(1, createChildrenCount, "Expected children to be created exactly once");
    });

    opt.description = "Verifies that if the async callback takes too long, the render method only renders once. Tests timeout after send is clicked.";
    Tx.test("ShareTarget.testTimeoutAfterSend", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var createChildrenCount = 0;
        var renderCount = 0;

        var root = createShareTargetRoot();
        root._data = {
            recordError: function () { this._error = 5; }
        };
        root._createDependentChildren = function () {
            createChildrenCount++;
        };
        root._renderData = function () {
            renderCount++;
        };
        root._initialUIReady = true;
        root._shareStarted = true;
        root._activateData = function () {};

        WinJS.UI.Animation.enterContent = function () {};
        WinJS.UI.Animation.exitContent = function () {
            tc.error("Unexpected animation");
        };

        // This is the expected call pattern that happens during timeout
        root._dataTimeout();
        root._endDataLoadError();

        tc.areEqual(1, createChildrenCount, "Expected children to be created exactly once");
        tc.areEqual(1, renderCount, "Expected exactly one render");
    });

    opt.description = "Verifies that createCanvas initializes the canvas properly";
    Tx.test("ShareTarget.testCreateCanvas", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var initialMessage = "This is the unit test's initial message for the canvas message box";
        var canvasElement = document.createElement("div");
        canvasElement.id = "shareMsgBox";

        document.body.appendChild(canvasElement);

        var addContentCount = 0;
        var cueTextIsSet = false;
        var undoCleared = false;
        var cueTextShown = false;
        var account = { id: "MockAccount" };
        var setMailAccount = { id: "setMailAccount" };
        var events = {};

        ModernCanvas.createCanvasAsync = function (htmlElement, options) {
            return WinJS.Promise.wrap(new ModernCanvas.ModernCanvas(htmlElement, options));
        };
        ModernCanvas.createUrlToStreamMapAsync = function () {
            return WinJS.Promise.wrap({});
        };
        ModernCanvas.Plugins.Indent = function () { };
        ModernCanvas.Plugins.DefaultFont = function () { };
        ModernCanvas.Plugins.DirtyTracker = function () { };
        Share.AppSettings = function () { };
        Share.AppSettings.prototype.dispose = function () { };
        ModernCanvas.Command = function () { };
        ModernCanvas.ModernCanvas = function (htmlElement, options) {
            tc.areEqual(canvasElement, htmlElement, "Unexpected HTML element passed to canvas");
            tc.areEqual("stm", options.className, "Canvas should be using 'stm' class for preset configurations");
            tc.areEqual(account, options.mailAccount, "Canvas did not receive correct mail account");

            return {
                addEventListener: function (type, listener) {
                    events[type] = listener;
                },
                addContent: function () {
                    addContentCount++;
                },
                setCueText: function() {
                    cueTextIsSet = true;
                },
                clearUndoRedo: function () {
                    undoCleared = true;
                },
                showCueText: function () {
                    cueTextShown = true;
                },
                setMailAccount: setMailAccount,
                components: {
                    commandManager: {
                        setCommand: function () {
                        },
                    }
                }
            };
        };

        var root = createShareTargetRoot();
        root._fromCtrl = {
            selectedAccount: account
        };
        root._data = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.html; },
            shareOperation: new MockShareOperation()
        };
        root._data.messageHtml = initialMessage;
        root._createCanvasAsync();

        tc.areEqual(1, addContentCount, "Canvas.addContent method should be called during createCanvas");
        tc.isTrue(cueTextIsSet, "Expected call to setCueText");
        tc.isTrue(cueTextShown, "Expected call to showCueText");
        tc.isTrue(undoCleared, "Should have cleared undo/redo stack");
        tc.isTrue(Jx.isFunction(root._fromCtrl.onAccountChanged), "Didn't set up link between from and canvas");
        tc.areEqual(events.keydown, root._canvasKeyDown, "Didn't add keydown event listener");
    });

    opt.description = "Verifies that the canvas is initialized correctly when there is no from control";
    Tx.test("ShareTarget.testCreateCanvasNoFromControl", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var account = { id: "MockAccount" };
        var canvasCreated = false;

        ModernCanvas.createCanvasAsync = function (htmlElement, options) {
            return WinJS.Promise.wrap(new ModernCanvas.ModernCanvas(htmlElement, options));
        };
        ModernCanvas.createUrlToStreamMapAsync = function () {
            return WinJS.Promise.wrap({});
        };
        ModernCanvas.Plugins.Indent = function () { };
        ModernCanvas.Plugins.DirtyTracker = function () { };
        ModernCanvas.Command = function () { };
        ModernCanvas.ModernCanvas = function (htmlElement, options) {
            tc.areEqual("stm", options.className, "Canvas should be using 'stm' class for preset configurations");
            tc.areEqual(account, options.mailAccount, "Canvas did not receive correct mail account");

            canvasCreated = true;

            return {
                addEventListener: function () { },
                addContent: function () { },
                setCueText: function () { },
                clearUndoRedo: function () { },
                showCueText: function () { },
                components: {
                    commandManager: {
                        setCommand: function () {
                        },
                    }
                }
            };
        };

        var root = createShareTargetRoot();
        root._fromCtrl = null;
        root._data = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.html; },
            shareOperation: new MockShareOperation(),
            account: account // This should be set up for the canvas when the from control is not there
        };
        root._createCanvasAsync();

        // Other validation is inside the mock canvas constructor, and also that it did not throw.
        tc.isTrue(canvasCreated, "Canvas was not constructed");
    });

    opt.description = "Verifies basic functionality in _getDataAndRemoveChildren";
    Tx.test("ShareTarget.testGetDataAndRemoveChildren", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var dataObject = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink; },
            getMailBody: MockGetMailBody,
            mailMessage: new MockMailMessage()
        };

        var mockAddresses = "mockAddresses";

        var mockAddressWell = {
            getRecipientsStringInNameEmailPairs: function () { return mockAddresses; },
            getRecipients: function () { return []; },
        };
        var mockButton = {
            id: "mockButton"
        };
        var mockFromControl = new FromControl.FromControl(); // FromControl mock set up for this test class

        // Set up mock document (will be torn down in tearDown between test cases)
        var mockSubjectElement = { removeEventListener: function () {} };
        var mockDocument = document;
        mockDocument.getElementById = function () {
            return mockSubjectElement;
        };


        var root = createShareTargetRoot();
        root._address = mockAddressWell;
        root._fromCtrl = mockFromControl;
        root._shareButton = mockButton;
        root._data = dataObject;
        root._shutdownAndRemoveChild = function (child) {
            child.hasShutdown = true;
        };

        root._getDataAndRemoveChildren();

        // Verify that data from the addressWell got into the data object
        tc.areEqual(mockAddresses, root._data.mailMessage.to, "Mail message TO should match addressWell data");

        // Verify components were shut down and set to null correctly
        tc.isTrue(mockButton.hasShutdown, "Expected button to be shut down");
        tc.isTrue(mockAddressWell.hasShutdown, "Expected AddressWell to be shut down");
        tc.isTrue(mockFromControl.hasShutdown, "Expected FromControl to be shut down");
        tc.isNull(root._shareButton, "Expected button to be set to null");
        tc.isNull(root._address, "Expected AddressWell to be set to null");
        tc.isNull(root._fromCtrl, "Expected FromControl to be set to null");
    });

    opt.description = "Verifies getting data out of the from control in _getDataAndRemoveChildren";
    Tx.test("ShareTarget.testGetDataAndRemoveChildrenFrom", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockAccount = {
            objectId: 1234567
        };

        // Set up mock document (will be torn down in tearDown between test cases)
        var mockSubjectElement = { removeEventListener: function () {} };
        var mockDocument = document;
        mockDocument.getElementById = function () {
            return mockSubjectElement;
        };

        // Set up mock appData settings
        var mockSettings = {};
        Jx.appData = {
            localSettings: function () {
                return {
                    set: function (valueName, value) { mockSettings[valueName] = value; }
                };
            }
        };

        var root = createShareTargetRoot();
        root._data = {
            mailMessage: { }
        };
        root._address = new AddressWell.Controller();
        root._fromCtrl = {
            multipleAccounts: function () { return false; },
            selectedAccount: mockAccount
        };
        root._shutdownAndRemoveChild = function () { };

        root._getDataAndRemoveChildren();

        tc.areEqual(root._data.account, mockAccount, "From control account not saved for canvas");
        tc.areEqual(mockAccount.objectId, root._data.mailMessage.accountId, "From control's account did not end up on the mail message");
        tc.areEqual(mockAccount.objectId, mockSettings.ShareToMailAccount, "From control's account did not end up in appData settings");
    });

    opt.description = "Verifies that _getDataAndRemoveChildren correctly handles the case where there is no mail message";
    Tx.test("ShareTarget.testGetDataAndRemoveChildrenNoMail", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var mockMailMessage = {
            id: "mock mail message"
        };

        // Set up mock document (will be torn down in tearDown between test cases)
        var mockSubjectElement = { removeEventListener: function () { } };
        var mockDocument = document;
        mockDocument.getElementById = function () {
            return mockSubjectElement;
        };

        var root = createShareTargetRoot();
        root._data = {};
        root._address = new AddressWell.Controller();
        root._fromCtrl = new FromControl.FromControl();
        root._shutdownAndRemoveChild = function () { };
        root._createMailMessage = function () {
            this._data.mailMessage = mockMailMessage;
        };

        root._getDataAndRemoveChildren();

        tc.areEqual(mockMailMessage, root._data.mailMessage, "Mail message creation did not happen as expected");
    });

    opt.description = "Verifies that _getDataAndRemoveDependentChildren works correctly when the share type is neither link nor file";
    Tx.test("ShareTarget.testGetDataAndRemoveDependentChildren", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var biciCalled = false;
        var message = "14890hefagfqy4398thgesdlf";
        var progressCalled = false;
        var subject = "This is the share subject";

        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var subjectElement = document.getElementById("shareSubject");
        subjectElement.value = subject;

        var dataObject = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.text; },
            getMailBody: MockGetMailBody,
            mailMessage: new MockMailMessage()
        };

        var mockCanvas = {
            getContent: function () { return { htmlString: message }; },
            getCharacterCount: function () { },
            dispose: function () { },
            removeEventListener: function () { },
            finalizeMailMessage: function () { }
        };

        var root = createShareTargetRoot();
        root._showProgress = function () { progressCalled = true; };
        root._canvas = mockCanvas;
        root._data = dataObject;
        root._recipientsCount = 3;
        root._canvasDirtyTracker = { isDirty: function () { return true; } };
        root._sendBici = function (isCustomLink, numRecipients, messageLength, isDirty) {
            biciCalled = true;

            tc.areEqual(false, isCustomLink, "isCustomLink BICI parameter didn't match");
            tc.areEqual(mockCanvas.getCharacterCount(), messageLength, "messageLength BICI parameter didn't match");
            tc.areEqual(root._recipientsCount, numRecipients, "numRecipients BICI parameter didn't match");
            tc.areEqual(root._canvasDirtyTracker.isDirty, isDirty, "isDirty BICI parameter didn't match");
        };
        root._shutdownAndRemoveChild = function (child) {
            child.hasShutdown = true;
        };

        root._getDataAndRemoveDependentChildren();

        // Verify BICI was called
        tc.isTrue(biciCalled, "Expected call to BICI");

        // Verify canvas is cleaned up
        tc.isNull(root._canvas, "Expected canvas to be set to null");

        // Verify the subject in several places
        tc.areEqual(subject, root._data.subject, "Share subject not set on data object");
        tc.areEqual(subject, root._data.mailMessage.subject, "Share subject not set on mail message");
    });

    opt.description = "Verifies that _getDataAndRemoveDependentChildren works correctly for link sharing";
    Tx.test("ShareTarget.testGetDataAndRemoveDependentChildrenLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var biciCalled = false;
        var message = "14890hefagfqy4398thgesdlf";
        var url = "http://www.live.com/?unitTest=true";

        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var dataObjectOriginal = {
            uri: url,
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.webLink; },
            description: null,
            getMailBody: MockGetMailBody,
            mailMessage: new MockMailMessage(),
        };

        var mockCanvas =  {
            getContent: function () { return { htmlString: message }; },
            getCharacterCount: function () { return 94374; },
            dispose: function () { },
            removeEventListener: function () { },
            finalizeMailMessage: function () { }
        };

        var mockDirtyTracker = {
            isDirty: function () { return true; }
        };

        var root = createShareTargetRoot();
        root._canvas = mockCanvas;
        root._canvasDirtyTracker = mockDirtyTracker;
        root._data = dataObjectOriginal;
        root._sendBici = function () {
            biciCalled = true;
        };
        root._shutdownAndRemoveChild = function (child) {
            child.hasShutdown = true;
        };

        root._getDataAndRemoveDependentChildren();

        // Verify BICI was called
        tc.isTrue(biciCalled, "Expected call to BICI");
    });

    opt.description = "Verifies that _getDataAndRemoveDependentChildren works correctly for file sharing";
    Tx.test("ShareTarget.testGetDataAndRemoveDependentChildrenFile", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var message = "14890hefagfqy4398thgesdlf";

        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var dataObjectOriginal = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.storageItems; },
            description: null,
            getMailBody: MockGetMailBody,
            mailMessage: new MockMailMessage(),
        };

        var mockCanvas = {
            getContent: function () { return { htmlString: message }; },
            getCharacterCount: function () { return 94374; },
            dispose: function () { },
            removeEventListener: function () { },
            finalizeMailMessage: function () { }
        };

        var mockAttachments = {
            attachmentWell: { }
        };

        var mockDirtyTracker = {
            isDirty: function () { return true; }
        };

        var root = createShareTargetRoot();
        root._canvas = mockCanvas;
        root._canvasDirtyTracker = mockDirtyTracker;
        root._data = dataObjectOriginal;
        root._sendBici = function () { };
        root._shutdownAndRemoveChild = function (child) {
            child.hasShutdown = true;
        };
        root._attachmentWrapper = mockAttachments;

        root._getDataAndRemoveDependentChildren();

        // Verify attachment well was shut down and set to null
        tc.isTrue(mockAttachments.hasShutdown, "Expected attachment component to be shut down");
        tc.isNull(root._attachmentWrapper, "Expected attachment component to be set to null");
    });

    opt.description = "Verifies that shareClick only starts the share once if it is called twice";
    Tx.test("ShareTarget.testShareClickTwice", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var shareClickedCount = 0;
        var shareProgressCount = 0;
        var shareGetDataCount = 0;

        window.MockShareOperation = function () {
            this.SomeProperty = "This is a unit test";
            this.reportStarted = function () { shareClickedCount++; };
            this.dismissUI = Jx.fnEmpty;
        };

        unitTestElement.innerHTML = '<div id="shareAddressError">This is an error</div>';

        var dataObject = {
            containsShareType: function (type) { return type === Windows.ApplicationModel.DataTransfer.StandardDataFormats.html; },
            getMailBody: MockGetMailBody,
            mailMessage: new MockMailMessage(),
            shareOperation: new MockShareOperation()
        };

        var root = createShareTargetRoot();
        root._showProgress = function () { shareProgressCount++; };
        root._address = new AddressWell.Controller();
        root._data = dataObject;
        root._canvas = new MockCanvas();
        root._fromCtrl = new FromControl.FromControl();
        root._shareButton = new Share.ShareButton();
        root._getDataAndRemoveChildren = function () { shareGetDataCount++; };
        root._quickLinkData = new Share.QuickLinkData();

        root._shareClick();
        root._shareClick();

        // These tests verify that things are only callled once, and verifies that the function is called during shareClick.
        tc.areEqual(1, shareClickedCount, "_shareClick should not start share more than once when called twice");
        tc.areEqual(1, shareProgressCount, "_shareClick should only switch to progress once when called twice");
        tc.areEqual(1, shareGetDataCount, "_shareClick did not call _getDataAndRemoveChildren the appropriate number of times.");

        // Verify that the address well error element text was cleared out
        tc.areEqual("", document.getElementById("shareAddressError").innerText, "Expected shareClick to remove address well error text");
    });

    opt.description = "Verifies that shareClick would show the inline error if there are invalid recipients";
    Tx.test("ShareTarget.testShareClickAddressWellError", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        // Set up mock address well controller
        var mockAddressWell = new AddressWell.Controller();
        mockAddressWell.getError = function () { return "Error"; };

        // Set up mock document (will be torn down in tearDown between test cases)
        var mockAddressWellElement = { className: "" };
        var mockDocument = document;
        mockDocument.getElementById = function () {
            return mockAddressWellElement;
        };

        // Must initialize root after setting up mock objects
        var root = createShareTargetRoot();
        root._address = mockAddressWell;
        root._canvas = new MockCanvas();

        root._shareClick();

        tc.areEqual("errorVisible", mockAddressWellElement.className.trim(), "Address well inline error should have been displayed");
    });

    opt.description = "Verifies that _shareClick calls into _beginShare if everything is ready and no quicklink is needed";
    Tx.test("ShareTarget.testShareClickCallsBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<div id="shareAddressError"></div>';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = {
            getError: function () { return null; },
            getRecipients: function () { return [1, 2, 3, 4, 5, 6]; }
        };
        shareTargetRoot._data = {
            shareOperation: {
                reportStarted: function () { },
                dismissUI: function () { }
            }
        };
        shareTargetRoot._showProgress = function () {};
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };
        shareTargetRoot._getDataAndRemoveChildren = function () { };
        shareTargetRoot._canvas = new MockCanvas();

        // This test tests the case where everything except the share button and quicklinks is ready before shareClick
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling shareClick");

        shareTargetRoot._shareClick();

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Verifies that _shareClick does not call into _beginShare if the canvas does not report as ready";
    Tx.test("ShareTarget.testShareClickWaitsForCanvasReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<div id="shareAddressError"></div>';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = {
            getError: function () { return null; },
            getRecipients: function () { return [1, 2, 3, 4, 5, 6]; }
        };
        shareTargetRoot._data = {
            shareOperation: {
                reportStarted: function () { },
                dismissUI: function () { }
            }
        };
        shareTargetRoot._showProgress = function () { };
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };
        shareTargetRoot._getDataAndRemoveChildren = function () { };
        shareTargetRoot._canvas = new MockCanvas();
        shareTargetRoot._canvas.isContentReady = function () { return false; };
        shareTargetRoot._canvas.callWhenContentReady = function () { };

        // This test tests the case where everything except the canvas is ready before _shareClick
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._quickLinkCompleted = true;

        shareTargetRoot._shareClick();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Expected _beginShare not to be called");
    });

    opt.description = "Verifies that _activateData does not call into _beginShare if everything is not ready";
    Tx.test("ShareTarget.testShareClickBeginShareNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<div id="shareAddressError"></div>';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = {
            getError: function () { return null; },
            getRecipients: function () { return [1, 2, 3, 4, 5, 6]; }
        };
        shareTargetRoot._data = {
            shareOperation: {
                reportStarted: function () { },
                dismissUI: function () { }
            }
        };
        shareTargetRoot._showProgress = function () {};
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };
        shareTargetRoot._getDataAndRemoveChildren = function () { };
        shareTargetRoot._canvas = new MockCanvas();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling shareClick");

        shareTargetRoot._shareClick();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Unexpected call to _beginShare");
    });

    opt.description = "Verifies that _activateData does not call into _beginShare if only the quicklink is not ready";
    Tx.test("ShareTarget.testShareClickQuicklinkNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<div id="shareAddressError"></div>';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = {
            getError: function () { return null; },
            getRecipients: function () { return [1]; }
        };
        shareTargetRoot._constructQuicklink = function () {
            // This function is specifically not setting shareTargetRoot._quicklinkCompleted to true
        };
        shareTargetRoot._data = {
            shareOperation: {
                reportStarted: function () { },
                dismissUI: function () { }
            }
        };
        shareTargetRoot._showProgress = function () {};
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };
        shareTargetRoot._getDataAndRemoveChildren = function () { };
        shareTargetRoot._canvas = new MockCanvas();

        // This test tests the case where everything except the share button and quicklinks is ready before shareClick
        // Quicklinks should end up not being ready, in this test.
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling shareClick");

        shareTargetRoot._shareClick();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Unexpected call to _beginShare");
    });

    opt.description = "Verifies that beginShare doesn't cause _readyForSend to be true too early";
    Tx.test("ShareTarget.testShareClickWaitsForReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var checkedReadyForSend = false;
        unitTestElement.innerHTML = '<div id="shareAddressError"></div>';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._address = new AddressWell.Controller();
        shareTargetRoot._constructQuicklink = function () {
            shareTargetRoot._quickLinkCompleted = true;
            tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send before shareClick is finished processing");
            checkedReadyForSend = true;
        };
        shareTargetRoot._data = {
            shareOperation: {
                reportStarted: function () { },
                dismissUI: function () { }
            }
        };
        shareTargetRoot._getDataAndRemoveChildren = function () { };
        shareTargetRoot._showProgress = function () { };
        shareTargetRoot._beginShare = function () { };
        shareTargetRoot._canvas = new MockCanvas();
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._dataChildrenReady = true;

        shareTargetRoot._shareClick();

        tc.isTrue(checkedReadyForSend, "Invalid test setup: never reached _constructQuicklink");
    });

    opt.description = "Verifies that _uploadComplete calls into _beginShare if everything is ready";
    Tx.test("ShareTarget.testUploadCompleteBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._attachmentWrapper = {
            attachmentWell: {
                validate: function () { return true;},
                finalizeForSend: function () { },
            },
            isReady: function () { return true; }
        };
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };
        shareTargetRoot._canvas = new MockCanvas();

        // This test tests the case where everything except files is ready before callValidate
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._shareStarted = true;
        shareTargetRoot._quickLinkCompleted = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._canvasContentReady = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling validate");

        shareTargetRoot._uploadComplete();

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Verifies that _uploadComplete does not call into _beginShare if everything is not ready";
    Tx.test("ShareTarget.testUploadCompleteBeginShareNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._attachmentWrapper = {
            attachmentWell: {
                validate: function () {return true;},
                finalizeForSend: function () {}
            }
        };
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling validate");

        shareTargetRoot._uploadComplete();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Unexpected call to _beginShare");
    });

    opt.description = "Verifies that _callValidate calls reportError in the event that attachments are not resolved properly.";
    Tx.test("ShareTarget.testCallValidateFailure", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var reportErrorCalled = false;
        var draftSaved = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._attachmentWrapper = {
            attachmentWell: {
                validate: function () {return false;},
                finalizeForSend: function () {}
            }
        };
        shareTargetRoot._data = {
            getErrorMessage: function () { return "There was an error"; },
            shareOperation: {
                reportError: function () { reportErrorCalled = true; }
            },
            mailMessage: {
                commit: function () { draftSaved = true; }
            }
        };

        // Mock share service
        Share.ShareService = function () {
            this.initiateShare = function () { tc.error("Unexpected call to initiateShare"); };
        };

        shareTargetRoot._callValidate();

        tc.isTrue(reportErrorCalled, "Expected call to reportError");
        tc.isTrue(draftSaved, "Expected draft to be saved");
    });

    opt.description = "Verifies in data timeout that the data render happens";
    Tx.test("ShareTarget.testDataTimeoutStartsRenderData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var renderCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._data = {
            recordError: function () {}
        };
        shareTargetRoot._startRenderData = function () {
            renderCalled = true;
        };
        shareTargetRoot._createDependentChildren = function () { };

        // This test case tests the case where the UI is ready
        shareTargetRoot._initialUIReady = true;

        tc.isFalse(shareTargetRoot._dataRenderReady(), "Invalid test setup: data render shouldn't be ready until dataTimeout is called");

        shareTargetRoot._dataTimeout();

        tc.isTrue(shareTargetRoot._dataRenderReady(), "Data render should be ready");
        tc.isTrue(renderCalled, "Expected call to _startRenderData");
    });

    opt.description = "Verifies that _activateData activates the correct elements";
    Tx.test("ShareTarget.testActivateData", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var canvasCreated = false;
        var attachmentActivated = false;

        var subject = "This is a test subject";

        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._createCanvasAsync = function () { canvasCreated = true; return WinJS.Promise.wrap(); };
        shareTargetRoot._beginShare = function () { };
        shareTargetRoot._attachmentWrapper = {
            activateUI: function () { attachmentActivated = true; }
        };
        shareTargetRoot._data = {
            subject: subject
        };

        shareTargetRoot._activateData();

        tc.areEqual(subject, document.getElementById("shareSubject").value, "Subject text does not match");
        tc.isTrue(canvasCreated, "Expected call to create canvas");
        tc.isTrue(attachmentActivated, "Expected attachmentWell to be activated");
    });

    opt.description = "Verifies that _activateData calls into _beginShare if everything is ready";
    Tx.test("ShareTarget.testActivateDataCallsBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._createCanvasAsync = function () { return WinJS.Promise.wrap(); };
        shareTargetRoot._canvas = new MockCanvas();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        // This test tests the case where everything except data is ready before activateData
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._shareStarted = true;
        shareTargetRoot._quickLinkCompleted = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._canvasContentReady = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling activateData");

        shareTargetRoot._activateData();

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Verifies that _activateData does not call into _beginShare if everything is not ready";
    Tx.test("ShareTarget.testActivateDataBeginShareNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;
        unitTestElement.innerHTML = '<input type="text" id="shareSubject" />';

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._createCanvasAsync = function () { return WinJS.Promise.wrap(); };
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling activateData");

        shareTargetRoot._activateData();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Unexpected call to _beginShare");
    });

    opt.description = "Verifies _showProgress";
    Tx.test("ShareTarget.testShowProgress", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var cancelSubscribed = false;
        var animated = false;

        // Set up some UI used by _showProgress
        unitTestElement.innerHTML = '<div><div id="shareFlyout"></div></div>';

        WinJS.UI.Animation.exitPage = function () {
            animated = true;

            var mockPromise = {
                then: function () { }
            };

            var nestedMockPromise = {
                then: function () { return mockPromise; }
            };

            var nestedMockPromise2 = {
                then: function () { return nestedMockPromise; }
            };

            return nestedMockPromise2;
        };

        var progressActive = false;
        Share.Progress = function () {
            this.activateUI = function () { progressActive = true; },
            this.deactivateUI = function () { progressActive = false; },
            this.addListener = function () { cancelSubscribed = true; };
            this.getParent = function () { return null; };
            this._setParent = function () { };
        };

        var root = createShareTargetRoot();

        root._showProgress();

        tc.isTrue(progressActive, "Expect progress to be active after switching to progress");

        tc.isTrue(cancelSubscribed, "Should have subscribed to cancel event");

        tc.isTrue(animated, "Expected animation did not occur");
    });

    opt.description = "Verifies that the subject UI is still around if the quicklinks aren't ready";
    Tx.test("ShareTarget.testShowProgressQuicklinkNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        // This test verifies part of the fix for WinLive bug 507480

        var innerFunction = null;

        // Set up some UI used by _showProgress
        unitTestElement.innerHTML = '<div><div id="shareFlyout"><div id="shareContentArea"><input type="text" id="shareSubject" /></div></div><div id="shareProgressHidden"></div></div>';

        var root = createShareTargetRoot();

        WinJS.UI.Animation.exitPage = function () {
            // third promise in the .then().then() call chain
            var promise3 = {
                then: function () { }
            };

            // second promise in the .then().then() call chain
            var promise2 = {
                then: function () { return promise3; }
            };

            // first promise in the .then().then() call chain
            var promise1 = {
                then: function (thenCallback) { innerFunction = thenCallback; return promise2; }
            };

            return promise1;
        };

        root._showProgress();

        tc.isNotNull(innerFunction, "Invalid test setup: did not get inner function");
        tc.isFalse(root._readyForSend(), "Invalid test setup: should not be ready to send");

        innerFunction();

        var subjectElement = document.getElementById("shareSubject");
        tc.isNotNull(subjectElement, "subject element must still be around after progress is shown");
    });

    opt.description = "Verifies that shutdownComponent performs the appropriate cleanup";
    Tx.test("ShareTarget.testShutdownComponent", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var deactivatedTimeout = false;
        var disposedPlatform = false;
        var canceledData = false;
        var disposedCanvas = false;
        var removeInputPaneEventCount = 0;

        var component = createShareTargetRoot();
        component._deactivateTimeout = function () {
            deactivatedTimeout = true;
        };
        component._platform = {
            dispose: function () { disposedPlatform = true; }
        };
        component._canvas = {
            dispose: function () { disposedCanvas = true; }
        };
        component._dataLoadPromise = {
            cancel: function () { canceledData = true; }
        };
        component._inputPane = {
            removeEventListener: function () { removeInputPaneEventCount++; }
        };

        tc.isNotNull(component._canvas, "Invalid test setup: canvas should have been set up");

        component.shutdownComponent();

        tc.isTrue(disposedCanvas, "Canvas should be disposed in shutdown");
        tc.isNull(component._canvas, "Canvas should be nulled out in shutdown");
        tc.isTrue(deactivatedTimeout, "Expected shutdown to deactivate timeout");
        tc.isTrue(disposedPlatform, "Expected shutdown to dispose platform");
        tc.isTrue(canceledData, "Expected shutdown to cancel data promise");
        tc.areEqual(2, removeInputPaneEventCount, "Expected events to be removed from the input pane");
    });

    opt.description = "Verifies that shutdownComponent works correctly when things are null";
    Tx.test("ShareTarget.testShutdownComponentNullItems", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var component = createShareTargetRoot();

        component.shutdownComponent();

        // Real test is that there are no exceptions
    });

    opt.description = "Verifies that shutdownAndRemoveComponent functions correctly";
    Tx.test("ShareTarget.testShutdownAndRemoveChild", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var deactivateCalled = false;
        var shutdownCalled = false;
        var removed = false;

        var mockComponent = {
            _setParent: function () { },
            getParent: function () { return null; },
            deactivateUI: function () { deactivateCalled = true; },
            shutdownComponent: function () { shutdownCalled = true; }
        };

        var root = createShareTargetRoot();
        root.append(mockComponent);
        root.removeChild = function (childToRemove) {
            tc.areEqual(mockComponent, childToRemove, "Unexpected child removed");
            removed = true;
        };

        root._shutdownAndRemoveChild(mockComponent);

        tc.isTrue(deactivateCalled, "Expected call to deactivateUI");
        tc.isTrue(shutdownCalled, "Expected call to shutdownComponent");
        tc.isTrue(removed, "Expected call to removeChild");
    });

    opt.description = "Test for _shareCancel";
    Tx.test("ShareTarget.testShareCancel", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareServiceCanceled = false;
        var component = createShareTargetRoot();
        var mockShareService = {
            cancelShare: function (data) {
                shareServiceCanceled = true;
                tc.areEqual(data, component._data, "Unexpected argument to cancelShare");
            }
        };
        component._shareService = mockShareService;

        component._shareCancel();

        tc.isTrue(shareServiceCanceled, "Cancel should have called cancel on the share service");
    });

    opt.description = "Test for _calculateQuicklinkName";
    Tx.test("ShareTarget.testCalculateQuicklinkName", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var recipient1 = { calculatedUIName: "Name1", emailAddress: "email1" };
        var recipient2 = {
            emailAddress: "email2",
            person: {
                firstName: null
            }
        };

        // Test recipient with CalculatedUI name
        var component = createShareTargetRoot();
        var name = component._calculateQuicklinkName(recipient1);

        tc.areEqual(name, recipient1.calculatedUIName, "The name is not equal to the calculatedUIName");


        // Test recipient with emailAddress
        name = component._calculateQuicklinkName(recipient2);

        tc.areEqual(name, recipient2.emailAddress, "The name is not equal to the firstName");
    });

    opt.description = "Test for _constructQuicklink";
    Tx.test("ShareTarget.testConstructQuickLink", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var recipient4 = { calculatedUIName: 'name4', emailAddress: "email4" };
        var recipient5 = { calculatedUIName: 'name5', emailAddress: "zemail4" };
        var recipient6 = { calculatedUIName: 'name6', emailAddress: "aemail4" };
        var recipients = [recipient4, recipient5, recipient6];

        // Setup compound string
        Jx.res = {
            getString: function (stringId) { return stringId; },
            loadCompoundString: function (string1, string2) { return string2; },
            processAll: function () { }
        };

        var component = createShareTargetRoot();
        // Mock out promise return functions so those don't do anything when they get called
        component._finishQuickLink = function () { };
        component._quicklinkFileError = function () { };
        component._quickLinkData = new Share.QuickLinkData();
        component._fromCtrl = {
            selectedAccount: {}
        };

        component._constructQuicklink(recipients);

        tc.areEqual(component._quickLink.id, "aemail4;email4;zemail4;", "The quicklink id is not alphabetized correctly");
        tc.areEqual(component._quickLink.title, recipient4.calculatedUIName, "The quicklink title is not correct");
    });

    opt.description = "Test for _constructQuicklink whith a single user with a tile";
    Tx.test("ShareTarget.testConstructQuickLinkSingleUserWithTile", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var recipient = { calculatedUIName: 'name', emailAddress: "email", person: {} };
        var recipients = [recipient];
        var calledCreateFromStream = false;

        // Setup compound string
        Jx.res = {
            getString: function (stringId) { return stringId; },
            loadCompoundString: function (string1, string2) { return string2; },
            processAll: function () { }
        };

        window.MockCreateFromStream = function () {
            calledCreateFromStream = true;
            return null;
        };

        AddressWell.getUserTileStream = function () { return "notNull"; };

        var component = createShareTargetRoot();
        component._quickLinkData = new Share.QuickLinkData();
        component._fromCtrl = {
            selectedAccount: {}
        };
        component._createFromStream = MockCreateFromStream;
        component._constructQuicklink(recipients);

        tc.isTrue(calledCreateFromStream, "Single user's tile is not being retrieved in construct quicklink");
    });

    opt.description = "Test for _constructQuicklink whith a single user without a tile";
    Tx.test("ShareTarget.testConstructQuickLinkSingleUserWithOutTile", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var recipient = { calculatedUIName: 'name', emailAddress: "email", person: {} };
        var recipients = [recipient];
        var calledCreateFromStream = false;

        // Setup compound string
        Jx.res = {
            getString: function (stringId) { return stringId; },
            loadCompoundString: function (string1, string2) { return string2; },
            processAll: function () { }
        };

        window.MockCreateFromStream = function () {
            calledCreateFromStream = true;
            return null;
        };

        AddressWell.getUserTileStream = function () { return null; };

        var component = createShareTargetRoot();
        component._quickLinkData = new Share.QuickLinkData();
        component._fromCtrl = {
            selectedAccount: {}
        };
        component._createFromStream = MockCreateFromStream;
        component._constructQuicklink(recipients);

        tc.isFalse(calledCreateFromStream, "Single user's tile should not be retrieved in this test");
    });

    opt.description = "Verifies that _quicklinkFileError works correctly when the component is shutdown";
    Tx.test("ShareTarget.testQuicklinkFileErrorShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot.isShutdown = function () { return true; };
        shareTargetRoot._readyForSend = function () { tc.error("Unexpected function call"); };

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;

        // Test is that this does not hit the assertion above
        shareTargetRoot._quicklinkFileError();
    });

    opt.description = "Verifies that _quicklinkFileError calls into _beginShare if everything is ready";
    Tx.test("ShareTarget.testQuicklinkFileErrorCallsBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        // This test tests the case where everything except quicklink is ready before quicklinkFileError
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._shareStarted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._canvasContentReady = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling quicklinkFileError");

        shareTargetRoot._quicklinkFileError();

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Verifies that _constructQuicklink does not call into _beginShare if everything is not ready";
    Tx.test("ShareTarget.testQuicklinkFileErrorBeginShareNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling quicklinkFileError");

        shareTargetRoot._quicklinkFileError();

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready for send");
        tc.isFalse(shareCalled, "Unexpected call to _beginShare");
    });

    opt.description = "Verifies that _finishQuickLink works correctly when the component is shutdown";
    Tx.test("ShareTarget.testFinishQuicklinkShutdown", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot.isShutdown = function () { return true; };
        shareTargetRoot._readyForSend = function () { tc.error("Unexpected function call"); };

        // Jx.log is not available during shutdown, setting current state to match.
        Jx.log = null;

        // Test is that this does not hit the assertion above
        shareTargetRoot._finishQuickLink();
    });

    opt.description = "Test for _finishQuickLink - verifies it calls beginShare when everything is ready for share";
    Tx.test("ShareTarget.testFinishQuickLinkCallsBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        // This test tests the case where everything except the quicklink is ready before finishQuicklink
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._shareStarted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._canvasContentReady = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling finishQuicklink");

        shareTargetRoot._finishQuickLink(null);

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Test for _finishQuickLink when the targetRoot is not ready for share";
    Tx.test("ShareTarget.testFinishQuickLinkShareNotReady", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling finishQuicklink");

        shareTargetRoot._finishQuickLink(null);

        tc.isFalse(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isFalse(shareCalled, "Expected call to _beginShare");

    });

    opt.description = "Verifies that _setQuicklinkFormats sets the correct format information on the quicklink object";
    Tx.test("ShareTarget.testSetQuicklinkFormats", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var mockQuicklink = {
            supportedFileTypes: {
                replaceAll: function (types) { this.types = types; }
            },
            supportedDataFormats: {
                replaceAll: function (formats) { this.formats = formats; }
            }
        };

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._setQuicklinkFormats(mockQuicklink);

        // Verify supportedFileTypes
        var quicklinkFileTypes = mockQuicklink.supportedFileTypes.types;
        tc.areEqual(1, quicklinkFileTypes.length, "Expected file types array to have exactly one entry");
        tc.areEqual("*", quicklinkFileTypes[0], "File types entry did not match");

        // Verify supportedDataFormats
        // Can't use areEqual because it will be placed in a new array
        var quicklinkFormatOrder = mockQuicklink.supportedDataFormats.formats;
        var originalFormatOrder = ShareUnitTestHelpers.getStandardFormatOrder();
        tc.areEqual(originalFormatOrder.length, quicklinkFormatOrder.length, "Format array lengths did not match");
        for (var i = 0; i < quicklinkFormatOrder.length; i++) {
            tc.areEqual(originalFormatOrder[i], quicklinkFormatOrder[i], "Format array entries did not match");
        }
    });

    opt.description = "Verifies _beginShare";
    Tx.test("ShareTarget.testBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var getDataCalled = false;
        var initiateShareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._getDataErrorMessage = function () { return null; };
        shareTargetRoot._getDataAndRemoveDependentChildren = function () { getDataCalled = true; };

        // Mock share service
        Share.ShareService = function () {
            this.initiateShare = function () { initiateShareCalled = true; };
        };

        shareTargetRoot._beginShare();

        tc.isTrue(getDataCalled, "Expected call to _getDataAndRemoveDependentChildren");
        tc.isTrue(initiateShareCalled, "Expected call to initiateShare");
    });

    opt.description = "Verifies the beginShare case where there was a data error, after the user clicked send.";
    Tx.test("ShareTarget.testBeginShareErrorAfterClick", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var reportErrorCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._getDataErrorMessage = function () { return "There was an error"; },
        shareTargetRoot._data = {
            shareOperation: {
                reportError: function () { reportErrorCalled = true; }
            }
        };
        shareTargetRoot._getDataAndRemoveDependentChildren = function () { tc.error("Unexpected call to _getDataAndRemoveDependentChildren"); };

        // Mock share service
        Share.ShareService = function () {
            this.initiateShare = function () { tc.error("Unexpected call to initiateShare"); };
        };

        shareTargetRoot._beginShare();

        tc.isTrue(reportErrorCalled, "Expected call to reportError");
    });

    opt.description = "Test for _canvasContentReadyCallback - verifies it calls beginShare when everything is ready for share";
    Tx.test("ShareTarget.testCanvasContentReadyCallbackCallsBeginShare", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareCalled = false;

        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._beginShare = function () {
            shareCalled = true;
        };

        // This test tests the case where everything except the quicklink is ready before finishQuicklink
        shareTargetRoot._uploadCompleted = true;
        shareTargetRoot._shareStarted = true;
        shareTargetRoot._dataChildrenReady = true;
        shareTargetRoot._bitmapAttached = true;
        shareTargetRoot._quickLinkCompleted = true;

        tc.isFalse(shareTargetRoot._readyForSend(), "Should not be ready to send until after calling _canvasContentReadyCallback");

        shareTargetRoot._canvasContentReadyCallback();

        tc.isTrue(shareTargetRoot._readyForSend(), "Should be ready for send");
        tc.isTrue(shareCalled, "Expected call to _beginShare");
    });

    opt.description = "Verifies that when the error code is E_FAIL, the generic error message is rendered.";
    Tx.test("ShareTarget.testGetDataErrorMessageGeneric", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        Jx.res = {
            getString: function (stringId) {
                return stringId;
            }
        };

        var shareTargetRoot = createShareTargetRoot();

        var dataPackage = new Windows.ApplicationModel.DataTransfer.DataPackage();
        shareTargetRoot._data = new Share.BaseData(ShareUnitTestHelpers.getShareOperation(dataPackage));

        shareTargetRoot._data.errorCategory = Share.Constants.DataError.internalError;
        shareTargetRoot._data._errorCode = Share.Constants.ErrorCode.unknownError;

        var result = shareTargetRoot._getDataErrorMessage();

        tc.isTrue(result.indexOf("Generic") >= 0, "Expected the generic string in the error message");
    });

    opt.description = "Test that handler is assign correctly";
    Tx.test("ShareTarget.testAttachDocumentListeners", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        tc.isNull(shareTargetRoot._documentKeyDown, "Handler's initial state should be null");
        var addCount = 0;
        document.addEventListener = function (name) {
            if (name === "keydown") {
                addCount++;
            } else {
                tc.error ("Unexpected event name");
            }
        };

        shareTargetRoot._attachDocumentListeners();
        shareTargetRoot._attachDocumentListeners();
        tc.areEqual(1, addCount, "Count is incorrect");
        tc.isNotNull(shareTargetRoot._documentKeyDown, "Handler should not be null");
    });

    opt.description = "Test that handler is reset";
    Tx.test("ShareTarget.testDetachDocumentListeners", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        shareTargetRoot._documentKeyDown = function () { };
        var removeCount = 0;
        document.removeEventListener = function (name) {
            if (name === "keydown") {
                removeCount++;
            } else {
                tc.error ("Unexpected event name");
            }
        };

        shareTargetRoot._detachDocumentListeners();
        shareTargetRoot._detachDocumentListeners();
        tc.areEqual(1, removeCount, "Count is incorrect");
        tc.isNull(shareTargetRoot._documentKeyDown, "Handler should be null");
    });

    opt.description = "Test for key combinations to initial share";
    Tx.test("ShareTarget.testDocumentKeyDownHandler", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);
        var shareTargetRoot = createShareTargetRoot();
        var shareClickCount = 0;
        shareTargetRoot._shareClick = function () {
            shareClickCount++;
        };

        // DOM event with no key information
        var domEvent = {};
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when event has no key information");

        // Ctrl
        domEvent = { ctrlKey: true };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when only CTRL is pressed");

        // Ctrl + "s"
        domEvent = { ctrlKey: true, key: "s" };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when CTRL + s are pressed");

        // Ctrl + Alt + "s"
        domEvent = { ctrlKey: true, altKey: true, key: "s" };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when CTRL + Alt + s are pressed");

        // Ctrl + Enter
        domEvent = { ctrlKey: true, key: "Enter" };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(1, shareClickCount, "Expect 1 when CTRL + ENTER are pressed");

        // Alt
        shareClickCount = 0;
        domEvent = { altKey: true };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when only ATL is pressed");

        // Alt + Enter
        domEvent = { altKey: true, key: "Enter" };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(0, shareClickCount, "Expect 0 when ALT + ENTER are pressed");

        // Alt + s
        domEvent = { altKey: true, key: "s" };
        shareTargetRoot._documentKeyDownHandler(domEvent);
        tc.areEqual(1, shareClickCount, "Expect 1 when ALT + s are pressed");
    });

})();
