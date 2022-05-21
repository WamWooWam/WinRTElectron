
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Windows,createMockPlatformCollection*/

var ProviderUTHelper = {

    secondsToMilliSeconds:  1000,
    minutesToMilliSeconds:  60 * 1000,
    hoursToMilliSeconds:    60 * 60 * 1000,
    daysToMilliSeconds:     24 * 60 * 60 * 1000,

    defaultOrganizer: "currentUser@contoso.com",

    appointmentVerb: {
        add: "Windows.AppointmentsProvider.AddAppointment",
        remove: "Windows.AppointmentsProvider.RemoveAppointment",
        replace: "Windows.AppointmentsProvider.ReplaceAppointment",
    },

    _getMockAppointmentOperation: function () {
        /// <summary>Returns a mock AppointmentOperation with values common to various appointment verbs</summary>

        return {
            sourcePackageFamilyName: "packageName",
            reportCompleted: function (itemId) { this.completedItemId = itemId; },
            reportCanceled: function () { this.canceled = true; },
            reportError: function (value) { this.errorValue = value; },
            dismissUI: function () { this.dismissed = true; },
        };
    },

    getMockAddActivationArgs: function (appointment) {
        /// <summary>Returns a mock activation object that contains the given appointment</summary>

        var activationArgs = {
            kind: Windows.ApplicationModel.Activation.ActivationKind.appointmentsProvider,
            verb: ProviderUTHelper.appointmentVerb.add,
            addAppointmentOperation: ProviderUTHelper._getMockAppointmentOperation()
        };

        activationArgs.addAppointmentOperation.appointmentInformation = appointment;

        return activationArgs;
    },

    getMockReplaceActivationArgs: function (appointment, appointmentId, instanceStartDate) {
        /// <summary>Returns a mock activation object that contains the given appointment</summary>
        /// <param name="appointment" type="Windows.ApplicationModel.Appointments.Appointment">Appointment to include in args</param>
        /// <param name="appointmentId" type="String">appointmentId to include in args</param>
        /// <param name="instanceStartDate" type="Date" optional="true">instanceStartDate to include in args</param>
        /// <returns type="Windows.ApplicationModel.Appointments.IAppointmentsProviderReplaceAppointmentActivatedEventArgs" />

        var activationArgs = {
            kind: Windows.ApplicationModel.Activation.ActivationKind.appointmentsProvider,
            verb: ProviderUTHelper.appointmentVerb.replace,
            replaceAppointmentOperation: ProviderUTHelper._getMockAppointmentOperation()
        };

        activationArgs.replaceAppointmentOperation.appointmentInformation = appointment;
        activationArgs.replaceAppointmentOperation.appointmentId = appointmentId;
        if (instanceStartDate) {
            activationArgs.replaceAppointmentOperation.instanceStartDate = instanceStartDate;
        } else {
            activationArgs.replaceAppointmentOperation.instanceStartDate = null;
        }

        return activationArgs;
    },

    getMockRemoveActivationArgs: function (appointmentId, instanceStartDate) {
        /// <summary>Returns a mock activation object that contains the given appointment ID</summary>
        /// <param name="appointmentId" type="String">appointmentId to include in args</param>
        /// <param name="instanceStartDate" type="Date" optional="true">instanceStartDate to include in args</param>
        /// <returns type="Windows.ApplicationModel.Appointments.IAppointmentsProviderRemoveAppointmentActivatedEventArgs" />

        var activationArgs = {
            kind: Windows.ApplicationModel.Activation.ActivationKind.appointmentsProvider,
            verb: ProviderUTHelper.appointmentVerb.remove,
            removeAppointmentOperation: ProviderUTHelper._getMockAppointmentOperation()
        };
        
        activationArgs.removeAppointmentOperation.appointmentId = appointmentId;
        if (instanceStartDate) {
            activationArgs.removeAppointmentOperation.instanceStartDate = instanceStartDate;
        } else {
            activationArgs.removeAppointmentOperation.instanceStartDate = null;
        }

        return activationArgs;
    },

    setupProviderPage: function (activationArgs) {
        /// <summary>Creates the provider page, passing the given activation args.</summary>
        /// <param name="activationArgs">Activation arguments to be passed to the provider page</param>
        /// <returns type="Calendar.ProviderPage" />

        // This mimics code in Provider.htm
        Jx.app = new Jx.Application(Jx.AppId.calendar, true);

        // We don't want to call into the real BICI code in unit tests
        Jx.bici = {
            addToStream: function () { },
            endExperience: function () { },
            dispose: function () { },
        };

        Jx.root = new Calendar.ProviderPage();

        // Activate the app
        Jx.activation._activated(activationArgs);

        return Jx.root;
    },

    getAppointment: function (hasRecurrence) {
        /// <summary>Provides an appointment with good default values</summary>
        /// <returns type="Windows.ApplicationModel.Appointments.Appointment" />

        var appointment = new Windows.ApplicationModel.Appointments.Appointment();
        appointment.startTime = new Date(2015, 5, 1);
        appointment.duration = ProviderUTHelper.hoursToMilliSeconds;

        if (hasRecurrence) {
            appointment.recurrence = new Windows.ApplicationModel.Appointments.AppointmentRecurrence();
        }

        return appointment;
    },

    getMockEvent: function () {
        /// <summary>Creates mock event with good default properties</summary>

        var mockEvent = {
            _attendeeList: [],
            calendar: this.getMockCalendar(),
            data: "",
            handle: "utEventHandle",
            location: "",
            organizerEmail: ProviderUTHelper.defaultOrganizer, // The platform populates this field on event creation
            organizerName: "",
            isOrganizer: true,
            sensitivity: 0,
            subject: "",
            validate: function () { return 0; },
            _committed: false,
            commit: function () { this._committed = true; },
            deleteObject: function () { this._deleted = true; },
            uid: Math.random().toString(),
            recurrence: null,
            startDate: new Date(),
            endDate: new Date(),
            getAttendees: function () {
                return createMockPlatformCollection(this._attendeeList);
            },
            getOccurrenceByExceptionStart: function () {
                if (this._occurrenceResult) {
                    return this._occurrenceResult;
                } else {
                    throw new Error("Unit test getOccurrenceByExceptionStart failure");
                }
            },
            setMockGetOccurrenceResults: function (result) {
                // Allow for changing the "getOccurrenceByExceptionStart" behavior
                this._occurrenceResult = result;
            },
            setMockAttendees: function (attendeeList) {
                this._attendeeList = attendeeList;
            },
            addAttendee: function () { return {}; },
        };

        // Mock platform behavior that changes the "recurrence" property when recurring is changed
        var recurring = false;
        Object.defineProperty(mockEvent, "recurring", {
            get: function () { return recurring; },
            set: function (newValue) {
                recurring = newValue;
                if (recurring && !this.recurrence) {
                    this.recurrence = {};
                } else if (!recurring) {
                    this.recurrence = null;
                }
            }
        });

        return mockEvent;
    },

    getMockCalendar: function (createdEvent) {
        var mockCalendar = {
            createEvent: function () { return createdEvent; },
            account: {}
        };

        Object.defineProperty(mockCalendar.account, "allEmailAddresses", {
            get: function () {
                return [ProviderUTHelper.defaultOrganizer];
            }
        });

        return mockCalendar;
    },

    getMockPlatform: function (createdEvent) {
        /// <summary>Mock platform that is able to create an event on the default calendar</summary>
        /// <param name="createdEvent" type="IEvent">Event returned from defaultCalendar.createEvent</param>

        var emptyCollection = createMockPlatformCollection([]);

        var mockPlatform = {
            calendarManager: {
                defaultCalendar: this.getMockCalendar(createdEvent),
                _eventUidCollection: emptyCollection,
                setMockGetEventsResults: function (getfromUidResults) {
                    this._eventUidCollection = createMockPlatformCollection(getfromUidResults);
                },
                getEventsFromUID: function () {
                    return this._eventUidCollection;
                }
            },
            invitesManager: {
            },
        };

        mockPlatform.calendarManager.defaultCalendar.id = 1234567;

        if (createdEvent) {
            createdEvent.calendar = mockPlatform.calendarManager.defaultCalendar;
        }

        return mockPlatform;
    },

    getMockMailMessage: function () {
        return {
            isInOutbox: false,
            isCommitted: false,
            moveToOutbox: function () { this.isInOutbox = true; },
            commit: function () { this.isCommitted = true; },
        };
    },
};
