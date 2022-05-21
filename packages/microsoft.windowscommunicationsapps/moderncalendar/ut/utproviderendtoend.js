
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global $,BVT,Calendar,Debug,Jx,ProviderUTHelper,Tx,Windows,runSync*/

(function () {

    var asyncDebugOverride = 0; // Set this to a large number to avoid async timeouts while debugging

    var _helper = ProviderUTHelper;
    var _originalCreatePlatform = Calendar.ProviderPage.prototype._createPlatform;

    var _mockPlatform;

    function getRoot() {
        return document.getElementById("providerRoot");
    }

    function cleanup() {

        if (Jx.app) {
            Jx.app.shutdown();
        }

        // Clean up any UI added for the provider
        getRoot().innerHTML = "";

        Calendar.ProviderPage.prototype._createPlatform = _originalCreatePlatform;
    }

    function initialize(tc) {
        /// <summary>Initializes test cases, cleanup</summary>

        tc.cleanup = cleanup;

        Debug.throwOnAssert = true;

        _mockPlatform = new Calendar.Mock.Platform();
        _mockPlatform.dispose = function () {
            this._disposed = true;
        };

        // Remove any previously created mock events
        var manager = _mockPlatform.calendarManager;
        manager.dumpStore();

        // Prepare the test calendar
        var mockCalendar = manager.addCalendar(_mockPlatform.accountManager.defaultAccount, "testCalendar");
        mockCalendar.name = "Provider EndToEnd UT";
        manager.defaultCalendar = mockCalendar;

        // E2E tests could use the real platform, but I don't have code to set up an account/etc.
        Calendar.ProviderPage.prototype._createPlatform = function () {
            this._platform = _mockPlatform;
        };
    }

    Tx.test("CalendarProviderEndToEnd.testSubject", function testSubjectTest (tc) {
        /// <summary>Example end-to-end test creates a provider page and locates the subject element</summary>

        initialize(tc);

        // Set up appointment object 
        var testSubject = "Test end to end subject";
        var appointment = new Windows.ApplicationModel.Appointments.Appointment();
        appointment.subject = testSubject;

        // initialize the page
        var args = _helper.getMockAddActivationArgs(appointment);
        var page = _helper.setupProviderPage(args);

        // Page is now initialized, we can look at the initial HTML or perform actions on it

        var subjectElement = document.getElementById("provSubject");

        tc.areEqual(testSubject, subjectElement.innerText, "Subject did not match");
    });

    Tx.test("CalendarProviderEndToEnd.testBadHtml", function testBadHtml (tc) {
        /// <summary>Verifies that input containing bad HTML doesn't crash or run script</summary>

        initialize(tc);

        var appointment = new Windows.ApplicationModel.Appointments.Appointment();
        appointment.details = '<script>window.testValue = 1;</script><div>Content!</div>';

        var args = _helper.getMockAddActivationArgs(appointment);
        _helper.setupProviderPage(args);

        tc.areEqual(undefined, window.testValue, "testValue was unexpectedly set by appointment details script");
    });

    Tx.test("CalendarProviderEndToEnd.testMultiRemove", function testMultiRemove (tc) {
        /// <summary>Verifies multi-delete UI renders correctly</summary>

        initialize(tc);

        // Set up a couple of events with the same UID
        var uid = "abc123";

        var mockEvent = _mockPlatform.calendarManager.defaultCalendar.createEvent();
        mockEvent.subject = "Default calendar event";
        mockEvent.uid = uid;
        mockEvent.commit();

        var mockCalendar2 = _mockPlatform.calendarManager.addCalendar(_mockPlatform.accountManager.defaultAccount, "testCalendar2");
        var mockEvent2 = mockCalendar2.createEvent();
        mockEvent2.subject = "Calendar 2 event";
        mockEvent2.uid = uid;
        mockEvent2.commit();

        var args = _helper.getMockRemoveActivationArgs(uid);
        runSync(function setupProviderPageSync () {
            _helper.setupProviderPage(args);
        });

        // Make sure the UI is present
        tc.areEqual(1, $("#provInfo").length, "Could not find info text element");
        tc.areEqual(1, $(".calendarSelector").length, "Could not find calendar selector");
        tc.areEqual(1, $("#provSubject").length, "Could not find event title");
    });

    function verifyErrorUI (tc) {
        /// <summary>Helps verify that the error UI is correct for testSaveError tests</summary>
        
        tc.areEqual(1, $(".provError").length, "Unable to find error text");
    }

    Tx.asyncTest("CalendarProviderEndToEnd.testSaveErrorNoCalendars", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function testSaveErrorNoCalendars (tc) {
        /// <summary>Verifies that the provider behaves correctly when there is a save error and no calendar picker</summary>

        initialize(tc);

        // Set up the provider page 
        var appointment = new Windows.ApplicationModel.Appointments.Appointment();
        var args = _helper.getMockAddActivationArgs(appointment);
        var page = _helper.setupProviderPage(args);
        page._model._event.commit = function () { throw new Error("Unit test failure to commit event"); };

        BVT.marks.once("Calendar.ProviderModel.doReport,Info,Calendar,App", function () {
            tc.error("Unexpected successful doReport");
            tc.start();
        });

        BVT.marks.once("Calendar.ProviderEventView.activateUI,StopTA,Calendar,App", function () {
            verifyErrorUI(tc);
            tc.start();
        });

        tc.stop();

        $.id("provButton").click();
    });

    Tx.asyncTest("CalendarProviderEndToEnd.testSaveErrorCalendars", { timeoutMs: (asyncDebugOverride ? asyncDebugOverride : 500) }, function testSaveErrorCalendars (tc) {
        /// <summary>Verifies that the provider behaves correctly when there is a save error with the calendar picker</summary>

        initialize(tc);

        // Set up an additional calendar to show the calendar picker
        _mockPlatform.calendarManager.addCalendar();

        var appointment = new Windows.ApplicationModel.Appointments.Appointment();
        var args = _helper.getMockAddActivationArgs(appointment);
        var page = _helper.setupProviderPage(args);
        page._model._event.commit = function () { throw new Error("Unit test failure to commit event"); };

        BVT.marks.once("Calendar.ProviderModel.doReport,Info,Calendar,App", function () {
            tc.error("Unexpected successful doReport");
            tc.start();
        });

        BVT.marks.once("Calendar.ProviderEventView.activateUI,StopTA,Calendar,App", function () {
            verifyErrorUI(tc);
            tc.start();
        });

        tc.stop();

        $.id("provButton").click();
    });

})();