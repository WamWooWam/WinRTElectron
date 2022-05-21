
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Microsoft,Tx*/

(function () {

    var _originalCalendarModel = Calendar.ProviderModel;
    var _originalCalendarView = Calendar.ProviderEventView;
    var _originalActivation;
    var _originalCreatePlatform = Calendar.ProviderPage.prototype._createPlatform;

    function getMockModel() {
        return {
            dispose: function () {
                this.isDisposed = true;
            }
        };
    }

    function cleanup() {
        /// <summary>Restores various globals that may be affected by unit tests</summary>

        Calendar.ProviderModel = _originalCalendarModel;
        Calendar.ProviderEventView = _originalCalendarView;
        Jx.activation = _originalActivation;

        Calendar.ProviderPage.prototype._createPlatform = _originalCreatePlatform;
    }

    function initialize(tc) {
        /// <summary>Initializes test cases, cleanup</summary>

        tc.cleanup = cleanup;

        _originalActivation = Jx.activation;

        Jx.activation = {
            addListener: function () { }
        };

        Calendar.ProviderPage.prototype._createPlatform = function () {};
    }
    
    Tx.test("CalendarProviderPage.testClose", function (tc) {
        /// <summary>Verifies that close disposes the model</summary>

        initialize(tc);

        var mockModel = getMockModel();

        var page = new Calendar.ProviderPage();
        page._model = mockModel;

        page._close();

        tc.isTrue(mockModel.isDisposed, "Failed to dispose model");
    });

    Tx.test("CalendarProviderPage.testCloseWithoutActivate", function (tc) {
        /// <summary>Verifies that close does not throw when the model is null</summary>

        initialize(tc);

        var page = new Calendar.ProviderPage();

        tc.isNull(page._model, "Invalid test setup: model should be null");

        // Test verifies that this does not throw.
        page._close();
    });

    Tx.test("CalendarProviderPage.activation", function (tc) {
        /// <summary>Verifies the activation code path</summary>

        initialize(tc);

        var page;

        // Make sure the right params are passed to the view and model.
        var mockActivation = {
            mockedType: "Windows.ApplicationModel.Activation.IAppointmentsProviderActivatedEventArgs"
        };

        
        function createMockView() {
            var mockView = { };
            Jx.mix(mockView, Jx.Component);
            mockView.activateUI = function () {
                this.isActivated = true;
            };
            mockView.getUI = function (ui) {
                ui.html = "mock html";
            };
            return mockView;
        }

        var mockView = createMockView();
        var mockModel = getMockModel();
        mockModel.initialize = function (activationArgs) {
            tc.areEqual(mockActivation, activationArgs, "Unexpected value passed as activation args");
            this.isInitialized = true;
        };
        Calendar.ProviderModel = function () {
            return mockModel;
        };
        Calendar.ProviderEventView = function (model) {
            tc.areEqual(mockModel, model, "Unexpected value passed for model");
            return mockView;
        };
        
        tc.log("Successful activation");
        page = new Calendar.ProviderPage();
        page._onAppActivate(mockActivation);

        tc.areEqual(mockModel, page._model, "Model was not initialized");
        tc.areEqual(mockView, page._view, "View was not initialized");
        tc.isTrue(mockModel.isInitialized, "Did not call initialize on model");

        tc.isTrue(mockView.isActivated, "Did not activate UI");


        tc.log("Activation with platform error");
        page = new Calendar.ProviderPage();
        page._platformError = -134857;
        mockView = createMockView();
        mockModel = getMockModel();
        mockModel.initialize = function (activationArgs, platform, platformError) {
            tc.areEqual(mockActivation, activationArgs, "Unexpected value passed as activation args");
            tc.isNull(platform, "Unexpected platform");
            tc.areEqual(page._platformError, platformError, "Platform error did not match");
            this.isInitialized = true;
        };
        page._onAppActivate(mockActivation);

        tc.isTrue(mockModel.isInitialized, "Did not call initialize on model");
        tc.isTrue(mockView.isActivated, "Did not activate UI");
    });

    Tx.test("CalendarProviderPage.onRestartNeeded", function onRestartNeeded (tc) {
        /// <summary>Test for onRestartNeeded</summary>

        initialize(tc);

        var page;

        tc.log("onRestartNeeded after close");
        page = new Calendar.ProviderPage();
        page._createPlatform = function () { tc.error("Unexpected call to createPlatform"); };
        page._close();

        // Test is mostly that this doesn't throw or hit the above tc.error
        page._onRestartNeeded({});


        tc.log("onRestartNeeded before activation");
        page = new Calendar.ProviderPage();
        page._createPlatform = function () { this.platformCreated = true; };

        tc.isNull(page._model, "Invalid test setup: model should not be defined");
        page._onRestartNeeded({});
        tc.isTrue(page.platformCreated, "Did not recreate platform");


        tc.log("onRestartNeeded after activation");
        var restartNeededArgs = {
            reason: Microsoft.WindowsLive.Platform.RestartNeededReason.accountDisconnected
        };
        page = new Calendar.ProviderPage();
        page._createPlatform = function () { tc.error("Unexpected call to createPlatform"); };
        page._model = {
            setPlatformError: function (hresult) {
                this._platformError = hresult;
            },
            dispose: function () { }
        };
        page._view = {
            displayErrorUI: function () {
                this.errorUI = true;
            }
        };

        page._onRestartNeeded(restartNeededArgs);

        tc.areEqual(Microsoft.WindowsLive.Platform.Result.forceSignIn, page._model._platformError, "hresult did not match");
        tc.isTrue(page._view.errorUI, "View did not switch to error UI");
    });

})();