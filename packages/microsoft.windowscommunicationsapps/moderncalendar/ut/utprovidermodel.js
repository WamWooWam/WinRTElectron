
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Microsoft,ProviderUTHelper,Tx,Windows,runSync*/

(function () {

    var _nowDate = Date.now();
    var _helper = ProviderUTHelper;

    var _originalProviderConverter;
    var _originalCalendarSelector;
    var _originalNowDate;

    var MeetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus;
    var ProviderAction = Calendar.ProviderAction;
    var Helpers = Calendar.Helpers;

    function setup(tc, paramOptions) {
        /// <summary>Mocks common items.  Optionally mocks the ProviderConverter.</summary>
        /// <param name="paramOptions" optional="true">
        /// Optional param with properties indicating which optional mocks should be set up
        /// mockConverter: Indicates whether the converter should be mocked out
        /// mockDate: Indicates whether Date should be mocked out
        /// </param>

        _originalCalendarSelector = Calendar.Views.CalendarSelector;
        _originalProviderConverter = Calendar.ProviderConverter;
        _originalNowDate = Helpers.getNowDate;

        var options = paramOptions || {};

        function restore() {
            Calendar.Views.CalendarSelector = _originalCalendarSelector;

            if (options.mockConverter) {
                Calendar.ProviderConverter = _originalProviderConverter;
            }

            if (options.mockNowDate) {
                Helpers.getNowDate = _originalNowDate;
            }
        }

        Calendar.Views.CalendarSelector = {
            createCalendarOption: function (calendar) {
                return {
                    id: calendar.id
                };
            },
            getCalendarsForSelector: function () {
                return [];
            }
        };

        if (options.mockConverter) {
            Calendar.ProviderConverter = function () { };
            Calendar.ProviderConverter.prototype.convertToEvent = function (appointment, calendar) {
                return {
                    event: calendar.createEvent()
                };
            };
            Calendar.ProviderConverter.prototype.updateBeforeSave = function () { };
            Calendar.ProviderConverter.prototype.getNumAttendees = function () {
                return 0;
            };
        }

        if (options.mockNowDate) {
            Helpers.getNowDate = function () { return _nowDate; };
        }

        // We don't want to call into the real BICI code in unit tests
        Jx.bici = {
            addToStream: function () { }
        };

        tc.cleanup = restore;
    }

    Tx.test("CalendarProviderModel.testInitializeAdd", function (tc) {
        /// <summary>Verifies that the constructor functions correctly</summary>

        setup(tc);

        var appointment = _helper.getAppointment();
        appointment.subject = "testSubject";

        var mockEvent = _helper.getMockEvent();

        var mockPlatform = _helper.getMockPlatform(mockEvent);

        var args = _helper.getMockAddActivationArgs(appointment);

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        // Verify at least one field on the model to make sure that it was converted
        var resultEvent = model.getEvent();
        tc.isNotNull(resultEvent, "Did not successfully convert event");
        tc.areEqual(appointment.subject, resultEvent.subject, "Did not successfully convert event subject");
        tc.areEqual(ProviderAction.add, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.testInitializeAddFailure", function (tc) {
        /// <summary>Verifies that the constructor functions correctly for add when the conversion fails</summary>

        setup(tc);

        var appointment = _helper.getAppointment();
        appointment.startTime = new Date(0, 0, 0);

        var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
        var args = _helper.getMockAddActivationArgs(appointment);

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        // Make sure the event failed to convert
        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "Invalid test setup: expected an error result");
        tc.areEqual(ProviderAction.closeError, model.getAction(), "Action did not match");
        tc.isNull(model.getEvent(), "Unexpected event");
    });

    Tx.test("CalendarProviderModel.testInitializeReplace", function testConstructorReplace (tc) {
        /// <summary>Verifies that the constructor functions correctly for replace</summary>

        setup(tc);

        var appointment = _helper.getAppointment();
        appointment.subject = "testSubject";

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        mockEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent]);

        var args = _helper.getMockReplaceActivationArgs(appointment, "appointmentId");

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        // Verify at least one field on the model to make sure that it was converted
        var resultEvent = model.getEvent();
        tc.isNotNull(resultEvent, "Did not successfully convert event");
        tc.areEqual(appointment.subject, resultEvent.subject, "Did not successfully convert event subject");
        tc.areEqual(ProviderAction.replace, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.testInitializeReplaceNotFound", function testConstructorReplaceNotFound (tc) {
        /// <summary>Verifies Replace behavior where the event to replace was not found</summary>

        setup(tc);

        var appointment = _helper.getAppointment();
        appointment.subject = "testSubject";

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        mockPlatform.calendarManager.setMockGetEventsResults([]);

        var args = _helper.getMockReplaceActivationArgs(appointment, "appointmentId");

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        tc.isNotNull(model.getEvent(), "Did not successfully convert event");
        // Should fall back to add if the event was not found
        tc.areEqual(ProviderAction.add, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.testInitializeReplaceError", function testConstructorReplaceError(tc) {
        /// <summary>Verifies that the constructor functions correctly if there was an error converting the event during replace</summary>

        setup(tc);

        var appointment = _helper.getAppointment();
        appointment.startTime = new Date(0, 0, 0);

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        mockEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent]);
        var args = _helper.getMockReplaceActivationArgs(appointment, "appointmentId");

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        // Make sure the event failed to convert
        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "Invalid test setup: expected an error result");
        tc.areEqual(ProviderAction.closeError, model.getAction(), "Action did not match");
        tc.isNull(model.getEvent(), "Unexpected event");
    });

    Tx.test("CalendarProviderModel.testInitializeReplaceInstance", function testConstructorReplaceInstance (tc) {
        /// <summary>Verifies replacing an instance</summary>

        setup(tc);

        var appointment = _helper.getAppointment(true);
        appointment.subject = "testSubject";
        // Set up some recurrence fields to make sure they're not converted
        appointment.recurrence.interval = 4;

        var mockLoadedEvent = _helper.getMockEvent();
        mockLoadedEvent.recurring = true;
        var mockInstance = _helper.getMockEvent();
        mockInstance.recurring = true;
        var mockCreatedEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockCreatedEvent);
        mockLoadedEvent.calendar = mockInstance.calendar = mockCreatedEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockLoadedEvent]);

        tc.log("Test: successfully loaded instance");
        mockLoadedEvent.setMockGetOccurrenceResults(mockInstance);
        var args = _helper.getMockReplaceActivationArgs(appointment, "appointmentId", new Date());

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        var resultEvent = model.getEvent();
        tc.isNotNull(resultEvent, "Did not successfully convert event");
        tc.areEqual(appointment.subject, resultEvent.subject, "Subject");
        tc.isNull(resultEvent.recurrence, "Recurrence was unexpectedly set on event");
        tc.areEqual(ProviderAction.replace, model.getAction(), "Action did not match");

        tc.log("Test: successfully loaded event, failed to load instance");
        mockLoadedEvent.setMockGetOccurrenceResults(null);
        model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        resultEvent = model.getEvent();
        tc.isNotNull(resultEvent, "Did not successfully convert event");
        tc.areEqual(appointment.subject, resultEvent.subject, "Subject");
        tc.isNull(resultEvent.recurrence, "Recurrence was unexpectedly set on event");
        tc.areEqual(ProviderAction.add, model.getAction(), "Action did not match");

        tc.log("Test: parent event was not a recurrence and so instance was not found");
        mockLoadedEvent.recurring = false;
        model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        resultEvent = model.getEvent();

        tc.isNotNull(resultEvent, "Did not successfully convert event");
        tc.areEqual(appointment.subject, resultEvent.subject, "Subject");
        tc.isNull(resultEvent.recurrence, "Recurrence was unexpectedly set on event");
        tc.areEqual(ProviderAction.add, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.testInitializeRemove", function testConstructorRemove (tc) {
        /// <summary>Verifies that the constructor functions correctly for remove</summary>

        setup(tc);

        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(null);
        mockEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent]);
        var args = _helper.getMockRemoveActivationArgs("appointmentId");

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        tc.areEqual(ProviderAction.remove, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.testInitializeRemoveNotFound", function (tc) {
        /// <summary>Verifies that the constructor functions correctly when the event to remove was not found</summary>

        setup(tc);

        var mockPlatform = _helper.getMockPlatform();
        var args = _helper.getMockRemoveActivationArgs("appointmentId");

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "There should be error text associated with this case");
        tc.areEqual(ProviderAction.closeSuccess, model.getAction(), "Action did not match");
        tc.isNull(model.getEvent(), "Unexpected event");
    });

    Tx.test("CalendarProviderModel.testInitializeRemoveInstance", function testConstructorRemoveInstance (tc) {
        /// <summary>Verifies removing an instance</summary>

        setup(tc);

        var mockLoadedEvent = _helper.getMockEvent();
        mockLoadedEvent.recurring = true;
        var mockInstance = _helper.getMockEvent();
        mockInstance.recurring = true;
        var mockPlatform = _helper.getMockPlatform(null);
        mockLoadedEvent.calendar = mockInstance.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockLoadedEvent]);

        tc.log("Test: successfully loaded instance");
        mockLoadedEvent.setMockGetOccurrenceResults(mockInstance);
        var args = _helper.getMockRemoveActivationArgs("appointmentId", new Date());
        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        tc.areEqual(ProviderAction.remove, model.getAction(), "Action");

        tc.log("Test: unable to find instance");
        mockLoadedEvent.setMockGetOccurrenceResults(null);
        model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "There should be error text associated with this case");
        tc.areEqual(ProviderAction.closeSuccess, model.getAction(), "Action did not match");

        tc.log("Test: parent event was not recurring, so unable to find instance");
        mockLoadedEvent.recurring = false;
        model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "There should be error text associated with this case");
        tc.areEqual(ProviderAction.closeSuccess, model.getAction(), "Action did not match");
    });

    Tx.test("CalendarProviderModel.setError", function (tc) {
        /// <summary>Verifies setError</summary>

        setup(tc);

        var errorText = "errorText";
        var errorDetails = "errorDetails";

        var model = new Calendar.ProviderModel();

        model.setError(errorText, errorDetails);

        tc.areEqual(errorText, model.getErrorText(), "Error text did not match");
    });

    Tx.test("CalendarProviderModel.setPlatformError", function setPlatformError (tc) {
        /// <summary>Verifies setPlatformError</summary>

        setup(tc);

        var model;
        var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
        var args = _helper.getMockAddActivationArgs(_helper.getAppointment());

        function initializeModel(platform, platformError) {
            model = new Calendar.ProviderModel();
            model.initialize(args, platform, platformError);
        }


        tc.log("Initialize platform sign in error");
        initializeModel(null, Microsoft.WindowsLive.Platform.Result.accountSuspendedCompromise);

        tc.areEqual(Jx.res.getString("ProviderErrorSignIn"), model._errorText, "Error text");
        tc.areEqual(Jx.res.getString("ProviderErrorSignIn"), model._errorDetails, "_errorDetails");
        tc.areEqual(ProviderAction.signIn, model.getAction(), "action");
        tc.areEqual(Microsoft.WindowsLive.Platform.Result.accountSuspendedCompromise, model._errorHresult, "_errorHresult");


        tc.log("Initialize platform unknown error");
        initializeModel(null, -2);

        tc.areEqual(Jx.res.getString("ProviderStartErrorGeneric"), model._errorText, "_errorText");
        tc.areEqual(Jx.res.getString("ProviderStartErrorGeneric"), model._errorDetails, "_errorDetails");
        tc.areEqual(ProviderAction.closeError, model.getAction(), "action");
        tc.areEqual(-2, model._errorHresult, "_errorHresult");


        // an onRestartNeeded scenario
        tc.log("null error after init complete");
        initializeModel(mockPlatform);
        model.setPlatformError(null);
        tc.areEqual(ProviderAction.closeError, model.getAction(), "action");
        tc.areEqual(Jx.res.getString("ProviderStartErrorGeneric"), model._errorText, "_errorText");
        tc.areEqual(Jx.res.getString("ProviderStartErrorGeneric"), model._errorDetails, "_errorDetails");
    });

    Tx.test("CalendarProviderModel.reportError", function (tc) {
        /// <summary>Verifies reportWithoutSave in the error case</summary>

        setup(tc);

        var errorText = "errorText";
        var errorDetails = "errorDetails";

        var reportErrorCalled = false;

        var mockAppointment = _helper.getAppointment();
        var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
        var args = _helper.getMockAddActivationArgs(mockAppointment);
        args.addAppointmentOperation.reportError = function (error) {
            reportErrorCalled = true;
            tc.areEqual(errorDetails, error, "Unexpected error reported");
        };

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        model.setError(errorText, errorDetails);
        runSync(function reportErrorSync() {
            model.reportWithoutSave();
        });

        // Most relevant test assert is in the reportError function
        tc.isTrue(reportErrorCalled, "Unable to test reportError since it was not called");
    });

    Tx.test("CalendarProviderModel.signInError", function (tc) {

        setup(tc);

        var args = _helper.getMockAddActivationArgs();

        var model = new Calendar.ProviderModel();
        model.initialize(args, null, Microsoft.WindowsLive.Platform.Result.accountSuspendedCompromise);

        tc.areEqual(ProviderAction.signIn, model.getAction(), "Invalid test setup: should be signIn action");

        runSync(function testSignInSync() {
            model.reportWithoutSave();
        });

        tc.isTrue(args.addAppointmentOperation.dismissed, "Did not dismissUI");
        tc.isTrue(args.addAppointmentOperation.canceled, "Should have reported as canceled");
    });

    Tx.test("CalendarProviderModel.reportCloseSuccess", function (tc) {
        /// <summary>Verifies reportWithoutSave in the closeSuccess case</summary>

        setup(tc);

        var reportCompletedCalled = false;

        var mockPlatform = _helper.getMockPlatform(null);
        var args = _helper.getMockRemoveActivationArgs("appointmentId");
        args.removeAppointmentOperation.reportCompleted = function () {
            reportCompletedCalled = true;
        };

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);

        model._action = ProviderAction.closeSuccess;

        runSync(function reportCloseSuccessSync() {
            model.reportWithoutSave();
        });

        tc.isTrue(reportCompletedCalled, "ReportCompleted was successfully called");
    });

    Tx.test("CalendarProviderModel.testSaveEvent", function testSaveEvent (tc) {
        /// <summary>Verifies saveEvent</summary>

        setup(tc, 
            { mockConverter: true }
        );

        var calledReportCompleted;
        var calledUpdateBeforeSave;
        var calledDeleteExceptions;
        var result;

        var mockAppointment = _helper.getAppointment();
        var mockEvent = _helper.getMockEvent();
        mockEvent.deleteExceptions = function () {
            calledDeleteExceptions = true;
        };
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        var args = _helper.getMockAddActivationArgs(mockAppointment);
        args.addAppointmentOperation.reportCompleted = function () {
            calledReportCompleted = true;
        };
        Calendar.ProviderConverter.prototype.updateBeforeSave = function () {
            calledUpdateBeforeSave = true;
            return mockEvent;
        };
        mockEvent.calendar = mockPlatform.calendarManager.defaultCalendar;

        var model;

        function reset() {
            calledReportCompleted = false;
            calledUpdateBeforeSave = false;
            calledDeleteExceptions = false;

            result = null;
            model = new Calendar.ProviderModel();
            model.initialize(args, mockPlatform);
            tc.isNotNull(model.getEvent(), "Invalid test setup: no event");
        }

        tc.log("Commit event succeeds");
        reset();
        runSync(function () {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isTrue(result, "Save function should have reported success");
        tc.isTrue(calledReportCompleted, "Expected call to reportCompleted");
        tc.isTrue(calledUpdateBeforeSave, "Expected call to updateBeforeSave");
        tc.isFalse(calledDeleteExceptions, "Unexpected call to deleteExceptions");

        tc.log("Commit event fails");
        mockEvent.commit = function () {
            throw new Error("Unit test error during commit");
        };
        reset();
        runSync(function () {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isFalse(result, "Save function incorrectly reported success");
        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "Expected error text after a failed save");
        tc.isTrue(calledUpdateBeforeSave, "Expected call to updateBeforeSave");
        tc.isFalse(calledReportCompleted, "Unexpected call to reportCompleted");

        tc.log("Event requires deleteExceptions");
        mockEvent.validate = function () {
            return Microsoft.WindowsLive.Platform.Calendar.Status.errorEventExceptionDeleteRequired;
        };
        mockEvent.commit = function () { };
        reset();
        runSync(function () {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isTrue(result, "Save function should have reported success");
        tc.isTrue(calledReportCompleted, "Expected call to reportCompleted");
        tc.isTrue(calledDeleteExceptions, "Expected call to deleteExceptions");
    });

    Tx.test("CalendarProviderModel.testSaveEventWithAttendes", function testSaveEventWithAttendes(tc) {
        /// <summary>Verifies attendees scenarios</summary>

        setup(tc);

        var calledReportCompleted;
        var createdMailMessage;
        var result;
        var model;

        var mockMailMessage;
        var mockAppointment = _helper.getAppointment();
        var mockEvent = _helper.getMockEvent();
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent]);
        mockPlatform.invitesManager.mailFromEvent = function (event, account, attendees) {

            createdMailMessage = true;

            tc.isTrue((event.meetingStatus & MeetingStatus.isCanceled) === 0, "meetingStatus");
            tc.isTrue(Jx.isNullOrUndefined(attendees), "Unexpected value for attendees");

            return mockMailMessage;
        };

        var args = _helper.getMockReplaceActivationArgs(mockAppointment);
        args.replaceAppointmentOperation.reportCompleted = function () {
            calledReportCompleted = true;
        };

        var mockAttendees = [{
            name: "",
            email: "testEmail2@fabrikam.com",
        }];

        function reset() {
            calledReportCompleted = false;
            createdMailMessage = false;

            mockMailMessage = _helper.getMockMailMessage();

            result = null;
            model = new Calendar.ProviderModel();
            model.initialize(args, mockPlatform);
            tc.isNotNull(model.getEvent(), "Invalid test setup: no event");
            tc.areEqual(ProviderAction.replace, model.getAction(), "Invalid test setup: action should have been replace");
        }

        tc.log("Replace event with no attendees");
        reset();
        runSync(function saveEventSync() {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isTrue(result, "Save should have succeeded.");
        tc.isFalse(createdMailMessage, "createdMailMessage");
        tc.isTrue(calledReportCompleted, "calledReportCompleted");

        tc.log("Replace event with attendees");
        reset();
        mockEvent.setMockAttendees(mockAttendees);
        runSync(function saveEventSync() {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isTrue(result, "Save should have succeeded.");
        tc.isTrue(createdMailMessage, "createdMailMessage");
        tc.isTrue(calledReportCompleted, "calledReportCompleted");

        tc.log("Replace event with attendees but not organizer");
        mockAppointment.organizer = new Windows.ApplicationModel.Appointments.AppointmentOrganizer();
        mockAppointment.organizer.address = "not-current-user@fabrikam.com";
        reset();
        mockEvent.isOrganizer = false;
        mockEvent.organizerEmail = "not-current-user@fabrikam.com";
        runSync(function saveEventSync() {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });
        tc.isTrue(result, "Save should have succeeded.");
        tc.isFalse(createdMailMessage, "createdMailMessage");
        tc.isTrue(calledReportCompleted, "calledReportCompleted");
    });

    Tx.test("CalendarProviderModel.testReplaceSaveEventCalendars", function testReplaceSaveEventCalendars(tc) {
        /// <summary>Verifies that when replacing events, the events are replaced on the correct calendar</summary>

        setup(tc);

        var mockEvent1 = _helper.getMockEvent();
        mockEvent1.calendar.id = 1001;
        var mockEvent2 = _helper.getMockEvent();
        mockEvent2.calendar.id = 1002;
        var mockEvent3 = _helper.getMockEvent();
        mockEvent3.calendar.id = 1003;
        var mockEvent4 = _helper.getMockEvent();
        mockEvent4.calendar.id = 1004;

        var mockAppointment = _helper.getAppointment();
        var mockPlatform = _helper.getMockPlatform(mockEvent1);
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent1, mockEvent2, mockEvent3, mockEvent4]);
        var args = _helper.getMockReplaceActivationArgs(mockAppointment, "abc123");

        var result;
        var model;

        // make sure we saved the correct event
        model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        runSync(function saveEventCalendarsSync() {
            result = model.saveEvent(mockEvent3.calendar);
        });
        tc.isTrue(result, "result");
        tc.isFalse(mockEvent1._committed, "mockEvent1");
        tc.isFalse(mockEvent2._committed, "mockEvent2");
        tc.isFalse(mockEvent4._committed, "mockEvent4");
        tc.isTrue(mockEvent3._committed, "mockEvent3");
    });

    Tx.test("CalendarProviderModel.testAddSaveReportCompleted", function testAddSaveReportCompleted (tc) {
        /// <summary>Verifies saveEvent sends the right thing to the windows api</summary>

        setup(tc);

        var uid = "12357sdfkljsdjhbh";
        var calledReportCompleted = false;
        var returnedUid = null;

        var mockAppointment = _helper.getAppointment();
        var mockEvent = _helper.getMockEvent();
        mockEvent.uid = uid;
        var mockPlatform = _helper.getMockPlatform(mockEvent);
        mockEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        var args = _helper.getMockAddActivationArgs(mockAppointment);
        args.addAppointmentOperation.reportCompleted = function (itemId) {
            calledReportCompleted = true;
            returnedUid = itemId;
        };

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        var result;

        // Verifies that the UID is returned for Add
        tc.areEqual(ProviderAction.add, model.getAction(), "Invalid test setup: incorrect action");
        runSync(function addSaveEventSync() {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });

        tc.isTrue(result, "Save should have succeeded");
        tc.isTrue(mockEvent._committed, "Failed to save event");
        tc.isTrue(calledReportCompleted, "ReportCompleted was not called");
        tc.areEqual(uid, returnedUid, "UID did not match");
    });

    Tx.test("CalendarProviderModel.testReplaceSaveReportCompleted", function testReplaceSaveReportCompleted(tc) {
        /// <summary>Verifies saveEvent sends the right thing to the windows API when replacing the event (should send loaded event's UID)</summary>

        setup(tc);

        var uid = "testUID";
        var calledReportCompleted = false;
        var returnedUid = null;

        var mockAppointment = _helper.getAppointment();
        // We create one event for validation, and then later may create a new event in the correct calendar (once the user has chosen a calendar) to actually save.  We should not save the created event.
        var mockCreatedEvent = _helper.getMockEvent();
        var mockLoadedEvent = _helper.getMockEvent();
        mockCreatedEvent.uid = "This UID should not be the UID that is saved";
        mockLoadedEvent.uid = uid;
        var mockPlatform = _helper.getMockPlatform(mockCreatedEvent);
        mockLoadedEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        mockPlatform.calendarManager.setMockGetEventsResults([mockLoadedEvent]);
        var args = _helper.getMockReplaceActivationArgs(mockAppointment, "appointmentId");
        args.replaceAppointmentOperation.reportCompleted = function (itemId) {
            calledReportCompleted = true;
            returnedUid = itemId;
        };

        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        var result;

        tc.areEqual(ProviderAction.replace, model.getAction(), "Invalid test setup: incorrect action");
        runSync(function replaceSaveSync() {
            result = model.saveEvent(mockPlatform.calendarManager.defaultCalendar);
        });

        tc.isTrue(result, "Save should have succeeded");
        tc.isFalse(mockCreatedEvent._committed, "Saved the wrong event");
        tc.isTrue(mockLoadedEvent._committed, "Did not save the loaded event");
        tc.isTrue(calledReportCompleted, "ReportCompleted was not called");
        tc.areEqual(uid, returnedUid, "UID did not match");
    });

    Tx.test("CalendarProviderModel.testDeleteEvent", function testDeleteEvent(tc) {
        /// <summary>Verifies deleteEvent</summary>

        setup(tc);

        var nowDate = new Date();
        var futureDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() + 5);
        var pastDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate() - 5);
        
        var calledReportCompleted = false;
        var createdMailMessage = false;

        var mockEvent1 = _helper.getMockEvent();
        mockEvent1.calendar.id = 1001;
        var mockEvent2 = _helper.getMockEvent();
        mockEvent2.calendar.id = 1002;
        var mockEvent3 = _helper.getMockEvent();
        mockEvent3.calendar.id = 1003;
        var mockEventDeleteError = _helper.getMockEvent();
        mockEventDeleteError.calendar.id = 1004;
        mockEventDeleteError.deleteObject = function () {
            throw new Error("Unit test error deleting event");
        };

        var mockAttendees = [{
            name : "",
            email: "testEmail2@fabrikam.com",
        }];

        var mockMailMessage;

        var mockPlatform = _helper.getMockPlatform(null);
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent1, mockEvent2, mockEvent3, mockEventDeleteError]);
        mockPlatform.invitesManager.mailFromEvent = function (event, account, attendees) {

            createdMailMessage = true;

            tc.areEqual(MeetingStatus.meetingCanceled, event.meetingStatus, "meetingStatus");
            tc.isTrue(Jx.isNullOrUndefined(attendees), "Unexpected value for attendees");

            return mockMailMessage;
        };

        var args = _helper.getMockRemoveActivationArgs("appointmentId");
        args.removeAppointmentOperation.reportCompleted = function () {
            calledReportCompleted = true;
        };

        var model;
        var result;

        function reset() {
            mockMailMessage = _helper.getMockMailMessage();

            createdMailMessage = false;
            calledReportCompleted = false;
            mockEvent1._deleted = false;
            mockEvent2._deleted = false;
            mockEvent3._deleted = false;
            mockEvent1.setMockAttendees([]);
            mockEvent2.setMockAttendees([]);
            mockEvent3.setMockAttendees([]);
            mockEventDeleteError.setMockAttendees([]);

            model = new Calendar.ProviderModel();
            model.initialize(args, mockPlatform);
            tc.areEqual(ProviderAction.remove, model.getAction(), "invalid test setup: incorrect action");
        }
        
        tc.log("Delete succeeds");
        reset();
        runSync(function () {
            result = model.deleteEvent(mockEvent3.calendar);
        });

        tc.isTrue(result, "deleteEvent should have succeeded");
        tc.isTrue(mockEvent3._deleted, "Failed to delete event");
        tc.isTrue(calledReportCompleted, "Did not call reportCompleted");
        tc.isFalse(createdMailMessage, "createdMailMessage");


        tc.log("Delete fails");
        reset();
        runSync(function () {
            result = model.deleteEvent(mockEventDeleteError.calendar);
        });

        tc.isFalse(result, "deleteEvent should have failed");
        tc.areEqual(ProviderAction.closeError, model.getAction(), "Incorrect action after delete failure");
        tc.isTrue(Jx.isNonEmptyString(model.getErrorText()), "Expected error text after failed delete");
        tc.isFalse(calledReportCompleted, "Unexpected call to reportCompleted after failure");
        tc.isFalse(createdMailMessage, "createdMailMessage");

        
        tc.log("Delete event with attendees");
        reset();
        mockEvent2.setMockAttendees(mockAttendees);
        mockEvent2.startDate = futureDate;
        mockEvent2.endDate = futureDate;
        runSync(function () {
            result = model.deleteEvent(mockEvent2.calendar);
        });

        tc.isTrue(result, "deleteEvent should have suceeded.");
        tc.isTrue(mockEvent2._deleted, "Failed to delete event.");
        tc.isTrue(createdMailMessage, "createdMailMessage");
        tc.isTrue(Jx.isNonEmptyString(mockMailMessage.to), "mailMessage.to");
        tc.isTrue(mockMailMessage.isInOutbox, "isInOutbox");
        tc.isTrue(mockMailMessage.isCommitted, "isCommitted");

        tc.log("Delete event in the past with attendees");
        reset();
        mockEvent2.setMockAttendees(mockAttendees);
        mockEvent2.startDate = pastDate;
        mockEvent2.endDate = pastDate;
        runSync(function () {
            result = model.deleteEvent(mockEvent2.calendar);
        });

        tc.isTrue(result, "deleteEvent should have succeeded");
        tc.isTrue(mockEvent2._deleted, "Failed to delete event");
        tc.isTrue(calledReportCompleted, "Did not call reportCompleted");
        tc.isFalse(createdMailMessage, "createdMailMessage");

        tc.log("Delete event with attendees but not the organizer");
        reset();
        mockEvent1.setMockAttendees(mockAttendees);
        mockEvent1.isOrganizer = false;
        mockEvent1.startDate = futureDate;
        mockEvent1.endDate = futureDate;
        runSync(function () {
            result = model.deleteEvent(mockEvent1.calendar);
        });

        tc.isTrue(result, "deleteEvent should have succeeded");
        tc.isFalse(createdMailMessage, "createdMailMessage");

        
    });

    Tx.test("CalendarProviderModel.testGetOriginalEvent", function testGetOriginalEvent (tc) {
        /// <summary>Verify getOriginalEvent</summary>

        setup(tc);

        var mockEvent1 = _helper.getMockEvent();
        mockEvent1.calendar.id = 1001;
        var mockEvent2 = _helper.getMockEvent();
        mockEvent2.calendar.id = 1002;
        var mockEvent3 = _helper.getMockEvent();
        mockEvent3.calendar.id = 1003;
        var mockEvent4 = _helper.getMockEvent();
        mockEvent4.calendar.id = 1004;

        var mockPlatform = _helper.getMockPlatform(null);
        mockPlatform.calendarManager.setMockGetEventsResults([mockEvent1, mockEvent2, mockEvent3, mockEvent4]);
        var args = _helper.getMockRemoveActivationArgs("appointmentId");
        var model = new Calendar.ProviderModel();
        model.initialize(args, mockPlatform);
        var result;

        result = model.getOriginalEvent(mockEvent2.calendar.id);
        tc.areEqual(mockEvent2, result, "mockEvent2");
        result = model.getOriginalEvent(mockEvent3.calendar.id);
        tc.areEqual(mockEvent3, result, "mockEvent3");
        result = model.getOriginalEvent(mockEvent1.calendar.id);
        tc.areEqual(mockEvent1, result, "mockEvent1");
        result = model.getOriginalEvent(mockEvent4.calendar.id);
        tc.areEqual(mockEvent4, result, "mockEvent4");
    });

    Tx.test("CalendarProviderModel.testformatHresult", function testformatHresult(tc) {
        /// <summary>Verifies formatHresult</summary>

        var model = new Calendar.ProviderModel();

        var Status = Microsoft.WindowsLive.Platform.Calendar.Status;

        tc.areEqual("0x85550206", model._formatHresult(Status.errorOccurrencesTooSmall), "errorOccurrencesTooSmall");
        tc.areEqual("0x80004005", model._formatHresult(-2147467259), "0x80004005, E_FAIL");
        tc.areEqual("0x00000005", model._formatHresult(5), "5"); // just because there's code for it, not that positive numbers are likely to come up
    });

    Tx.test("CalendarProviderModel.testWillEmailAttendees", function testWillEmailAttendees (tc) {
        /// <summary>Verifies willEmailAttendees behavior</summary>

        setup(tc);

        var now = new Date();
        var futureStartDate = new Date(now.getFullYear(), now.getMonth() + 2, 5);
        var futureEndDate = new Date(now.getFullYear(), now.getMonth() + 2, 6);
        var pastStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 5);
        var pastEndDate = new Date(now.getFullYear(), now.getMonth() - 2, 6);
        
        var zeroAttendeesCollection = [];
        var hasAttendeesCollection = [1, 2, 3]; // attendees just need to be present, code doesn't check them at all.

        var mockEvent = _helper.getMockEvent();
        mockEvent.startDate = pastStartDate;
        mockEvent.endDate = pastEndDate;
        var model;

        function initialize(action) {
            model = new Calendar.ProviderModel();
            model._action = action;
        }

        var EventType = Microsoft.WindowsLive.Platform.Calendar.EventType;

        tc.log("Replace Event with no attendees");
        initialize(ProviderAction.replace);
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Replace event with attendees as organizer");
        initialize(ProviderAction.replace);
        mockEvent.setMockAttendees(hasAttendeesCollection);
        mockEvent.isOrganizer = true;
        tc.isTrue(model.willEmailAttendees(mockEvent));

        tc.log("Replace event with attendees when not organizer");
        initialize(ProviderAction.replace);
        mockEvent.setMockAttendees(hasAttendeesCollection);
        mockEvent.isOrganizer = false;
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Remove single event with no attendees");
        initialize(ProviderAction.remove);
        mockEvent.setMockAttendees(zeroAttendeesCollection);
        mockEvent.isOrganizer = true;
        mockEvent.startDate = futureStartDate;
        mockEvent.endDate = futureEndDate;
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Remove single event with attendees as organizer");
        initialize(ProviderAction.remove);
        mockEvent.setMockAttendees(hasAttendeesCollection);
        mockEvent.isOrganizer = true;
        mockEvent.startDate = futureStartDate;
        mockEvent.endDate = futureEndDate;
        tc.isTrue(model.willEmailAttendees(mockEvent));

        tc.log("Remove single event with attendees when not organizer");
        initialize(ProviderAction.remove);
        mockEvent.isOrganizer = false;
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Remove single past event with attendees as organizer");
        initialize(ProviderAction.remove);
        mockEvent.setMockAttendees(hasAttendeesCollection);
        mockEvent.isOrganizer = true;
        mockEvent.startDate = pastStartDate;
        mockEvent.endDate = pastEndDate;
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Remove series in the past");
        initialize(ProviderAction.remove);
        mockEvent.recurring = true;
        mockEvent.eventType = EventType.series;
        mockEvent.recurrence = {
            until: pastEndDate
        };
        tc.isFalse(model.willEmailAttendees(mockEvent));

        tc.log("Remove unbounded series");
        initialize(ProviderAction.remove);
        mockEvent.recurrence.until = -11644473600000; // JS equivalent of C++ '0' date value
        tc.isTrue(model.willEmailAttendees(mockEvent));

        tc.log("Remove series starting in past and ending in future");
        initialize(ProviderAction.remove);
        mockEvent.recurrence.until = futureEndDate;
        tc.isTrue(model.willEmailAttendees(mockEvent));
    });

    Tx.test("CalendarProviderModel.testBici", function testBici (tc) {
        /// <summary>Verifies that BICI data is recorded correctly</summary>
        
        var appointment = _helper.getAppointment();

        setup(tc, { mockNowDate: true });

        var expectedIsRecurring = false;
        var expectedLocation = false;
        var expectedNotes = false;
        var expectedTimeCategory = 0;
        var expectedAttendees = 0;

        var recordedBici;

        _nowDate = new Date("9/9/2013 4:00pm");
        var pastDate = new Date("9/1/2013");
        var pastDateToday = new Date("9/9/2013 1:00pm");
        var tomorrowDate = new Date("9/10/2013 3:00pm");
        var futureDateToday = new Date("9/9/2013 7:00pm");
        var twoDaysDate = new Date("9/11/2013 7:00am");
        var threeDaysDate = new Date("9/12/2013 6:00pm");
        var oneMonthDate = new Date("10/9/2013 1:00pm");

        var mockEvent = _helper.getMockEvent();

        Jx.bici.addToStream = function (biciEventId, isRecurring, hasLocation, hasNotes, timeCategory, numAttendees) {

            tc.areEqual(Microsoft.WindowsLive.Instrumentation.Ids.Calendar.calendarProviderCreateEvent, biciEventId, "Event ID did not match");
            tc.areEqual(expectedIsRecurring ? 1 : 0, isRecurring, "Recurring did not match");
            tc.areEqual(expectedLocation ? 1 : 0, hasLocation, "Location did not match");
            tc.areEqual(expectedNotes ? 1 : 0, hasNotes, "Notes did not match");
            tc.areEqual(expectedTimeCategory, timeCategory, "Time category did not match");
            tc.areEqual(expectedAttendees, numAttendees, "Attendees did not match");

            recordedBici = true;
        };

        function createAttendee() {
            var attendee = new Windows.ApplicationModel.Appointments.AppointmentInvitee();
            attendee.address = "fakeAddress@fabrikam.com";
        }

        function runTest() {
            recordedBici = false;

            var mockPlatform = _helper.getMockPlatform(_helper.getMockEvent());
            var args = _helper.getMockAddActivationArgs(appointment);
            var model = new Calendar.ProviderModel();
            model.initialize(args, mockPlatform);

            model._logEventData(mockEvent);

            // Most of the relevant asserts are in addToStream
            tc.isTrue(recordedBici, "Did not record BICI data");
        }

        tc.log("Record event in the past");
        mockEvent.startDate = pastDate;
        expectedTimeCategory = 0;
        runTest();

        tc.log("Record event today in the past");
        mockEvent.startDate = pastDateToday;
        expectedTimeCategory = 0;
        runTest();

        tc.log("Record event today in the future");
        mockEvent.startDate = futureDateToday;
        expectedTimeCategory = 1;
        runTest();

        tc.log("Record event tomorrow");
        mockEvent.startDate = tomorrowDate;
        expectedTimeCategory = 2;
        runTest();

        tc.log("Record event in two days");
        mockEvent.startDate = twoDaysDate;
        expectedTimeCategory = 3;
        runTest();

        tc.log("Record event in three days");
        mockEvent.startDate = threeDaysDate;
        expectedTimeCategory = 4;
        runTest();

        tc.log("Record event in a month");
        mockEvent.startDate = oneMonthDate;
        expectedTimeCategory = 31;
        runTest();


        tc.log("Record event with location");
        mockEvent.location = "abc";
        expectedLocation = true;
        runTest();


        tc.log("Record event with one attendee");
        appointment.invitees.append(createAttendee());
        expectedAttendees = 1;
        runTest();

        tc.log("Record event with multiple attendees");
        expectedAttendees = 11;
        while (appointment.invitees.size < expectedAttendees) {
            appointment.invitees.append(createAttendee());
        }
        runTest();

        tc.log("Record event with recurrence");
        mockEvent.recurring = true;
        expectedIsRecurring = true;
        runTest();
    });
})();