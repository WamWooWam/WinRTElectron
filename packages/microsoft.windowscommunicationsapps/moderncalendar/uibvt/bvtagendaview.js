
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Microsoft,BVT,AgendaViewLib,CalendarLib*/

(function () {

    var options = {
        agenda: {
            feature: "Agenda",
            owner: "AdKell",
        }
    };

    // Constants
    var BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;

    // Cleanup function that cleans up after running a test.
    var cleanup = function (tc) {
        tc.start();
    };

    /// OWNER: AdKell
    ///
    /// Creates an all day hero event and verifies it
    ///
    BVT.Test("AgendaView_AllDayInHero", options.agenda, function (tc) {
        tc.stop();

        var allDayDate = AgendaViewLib.timeFromToday(0, 0, 0);
        var allDay = {
            startDate: allDayDate,
            endDate: AgendaViewLib.addMinutes(24 * 60, allDayDate),
            subject: "All Day Hero",
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(allDay); })

        // Verify the hero
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyHeroDate(allDayDate); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(allDay); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates an all day hero event in app and verifies it
    ///
    BVT.Test("AgendaView_CreateAllDayInHero", options.agenda, function (tc) {
        tc.stop();

        var allDayDate = AgendaViewLib.timeFromToday(0, 0, 0);
        var allDay = {
            startDate: allDayDate,
            endDate: AgendaViewLib.addMinutes(24 * 60, allDayDate),
            subject: "All Day Hero",
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.inAppCreateEvent(allDay); })

        // Verify the hero
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyHeroDate(allDayDate); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(allDay); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates a regular event in app and verifies it
    ///
    BVT.Test("AgendaView_CreateRegularEvent", options.agenda, function (tc) {
        tc.stop();

        var regularDate = AgendaViewLib.timeFromToday(1, 4, 0);
        var regular = {
            startDate: regularDate,
            endDate: AgendaViewLib.addMinutes(45, regularDate),
            subject: "Regular",
            location: "Redmond, WA",
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.inAppCreateEvent(regular); })

        // Verify the event
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates a split event in app and verifies it
    ///
    BVT.Test("AgendaView_CreateSplitEvent", options.agenda, function (tc) {
        tc.stop();

        var splitDate = AgendaViewLib.timeFromToday(1, 19, 0);
        var split = {
            startDate: splitDate,
            endDate: AgendaViewLib.addMinutes(10 * 60, splitDate),
            subject: "Split",
            location: "Redmond, WA",
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.inAppCreateEvent(split); })

        // Verify the event
        .then(function () { return AgendaViewLib.verifyEventCardExists(split); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies regular event card types
    ///
    BVT.Test("AgendaView_RegularEventTypes", options.agenda, function (tc) {
        tc.stop();

        var regular1Date = AgendaViewLib.timeFromToday(1, 0, 0);
        var regular1 = {
            startDate: regular1Date,
            endDate: AgendaViewLib.addMinutes(60, regular1Date),
            subject: "Regular 1",
            location: "Redmond, WA",
            busyStatus: BusyStatus.busy
        };

        var regular2Date = AgendaViewLib.timeFromToday(1, 14, 53);
        var regular2 = {
            startDate: regular2Date,
            endDate: AgendaViewLib.addMinutes(60, regular2Date),
            subject: "Regular 2", 
            location: "Tokyo, Japan", 
            duration: 13, 
            busyStatus: BusyStatus.tentative
        };

        var regular3Date = AgendaViewLib.timeFromToday(1, 3, 0);
        var regular3 = {
            startDate: regular3Date,
            endDate: AgendaViewLib.addMinutes(18 * 60, regular3Date), 
            subject: "Regular 3", 
            busyStatus: BusyStatus.free
        };

        var zeroMinuteDate = AgendaViewLib.timeFromToday(1, 18, 0);
        var zeroMinute = {
            startDate: zeroMinuteDate,
            endDate: zeroMinuteDate,
            subject: "Zero Minute", 
            location: "Portland",
            busyStatus: BusyStatus.free
        };

        var spanMidnightDate = AgendaViewLib.timeFromToday(1, 19, 0);
        var spanMidnight = {
            startDate: spanMidnightDate,
            endDate: AgendaViewLib.addMinutes(10 * 60, spanMidnightDate),
            subject: "Span Midnight",
            location: "Bilbo Baggins's Hobbit Hole, The Shire, Middle Earth",
            busyStatus: BusyStatus.outOfOffice
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(regular1); })
        .then(function () { return AgendaViewLib.injectEvent(regular2); })
        .then(function () { return AgendaViewLib.injectEvent(regular3); })
        .then(function () { return AgendaViewLib.injectEvent(zeroMinute); })
        .then(function () { return AgendaViewLib.injectEvent(spanMidnight); })

        // Verify events
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular1); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular2); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular3); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(zeroMinute); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(spanMidnight); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies conflicting events
    ///
    BVT.Test("AgendaView_ConflictingEvents", options.agenda, function (tc) {
        tc.stop();

        var regular1Date = AgendaViewLib.timeFromToday(1, 8, 0);
        var regular1 = {
            startDate: regular1Date,
            subject: "Regular 1",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(60, regular1Date),
            busyStatus: BusyStatus.busy
        };

        var regular2Date = AgendaViewLib.timeFromToday(1, 8, 30);
        var regular2 = {
            startDate: regular2Date,
            subject: "Regular 2",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(3 * 60, regular2Date),
            busyStatus: BusyStatus.busy
        };

        var regular3Date = AgendaViewLib.timeFromToday(1, 16, 0);
        var regular3 = {
            startDate: regular3Date,
            subject: "Regular 3",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(3 * 60, regular3Date),
            busyStatus: BusyStatus.busy
        };

        var regular4Date = AgendaViewLib.timeFromToday(1, 17, 0);
        var regular4 = {
            startDate: regular4Date,
            subject: "Regular 4",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(2 * 60, regular4Date),
            busyStatus: BusyStatus.busy
        };
        
        var regular5Date = AgendaViewLib.timeFromToday(1, 21, 0);
        var regular5 = {
            startDate: regular5Date,
            subject: "Regular 5",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(10, regular5Date),
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(regular4); })
        .then(function () { return AgendaViewLib.injectEvent(regular2); })
        .then(function () { return AgendaViewLib.injectEvent(regular3); })
        .then(function () { return AgendaViewLib.injectEvent(regular1); })
        .then(function () { return AgendaViewLib.injectEvent(regular5); })

        // Verify events
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular1); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular2); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular3); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular4); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(regular5); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies conflicting events with split cards
    ///
    BVT.Test("AgendaView_ConflictingSplitEvents", options.agenda, function (tc) {
        tc.stop();

        var splitNoConflictDate = AgendaViewLib.timeFromToday(1, 20, 0);
        var splitNoConflict = {
            startDate: splitNoConflictDate,
            subject: "Split NoConflict",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(8 * 60, splitNoConflictDate),
            busyStatus: BusyStatus.busy
        };

        var splitConflict1Date = AgendaViewLib.timeFromToday(2, 20, 0);
        var splitConflict1 = {
            startDate: splitConflict1Date,
            subject: "Split Card1Conflict",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(8 * 60, splitConflict1Date),
            busyStatus: BusyStatus.busy
        };

        var conflict1Date = AgendaViewLib.timeFromToday(2, 21, 0);
        var conflict1 = {
            startDate: conflict1Date,
            subject: "Conflict 1",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(60, conflict1Date),
            busyStatus: BusyStatus.busy
        };
        
        var splitConflict2Date = AgendaViewLib.timeFromToday(3, 20, 0);
        var splitConflict2 = {
            startDate: splitConflict2Date,
            subject: "Split Card2Conflict",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(8 * 60, splitConflict2Date),
            busyStatus: BusyStatus.busy
        };
        
        var conflict2Date = AgendaViewLib.timeFromToday(4, 1, 0);
        var conflict2 = {
            startDate: conflict2Date,
            subject: "Conflict 2",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(60, conflict2Date),
            busyStatus: BusyStatus.busy
        };
        
        var splitBothConflictDate = AgendaViewLib.timeFromToday(4, 20, 0);
        var splitBothConflict = {
            startDate: splitBothConflictDate,
            subject: "Split BothConflict",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(8 * 60, splitBothConflictDate),
            busyStatus: BusyStatus.busy
        };
        
        var conflict3Date = AgendaViewLib.timeFromToday(4, 21, 0);
        var conflict3 = {
            startDate: conflict3Date,
            subject: "Conflict 3",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(60, conflict3Date),
            busyStatus: BusyStatus.busy
        };
        
        var conflict4Date = AgendaViewLib.timeFromToday(5, 1, 0);
        var conflict4 = {
            startDate: conflict4Date,
            subject: "Conflict 4",
            location: "Redmond, WA",
            endDate: AgendaViewLib.addMinutes(60, conflict4Date),
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(splitNoConflict); })

        .then(function () { return AgendaViewLib.injectEvent(splitConflict1); })
        .then(function () { return AgendaViewLib.injectEvent(conflict1); })

        .then(function () { return AgendaViewLib.injectEvent(splitConflict2); })
        .then(function () { return AgendaViewLib.injectEvent(conflict2); })

        .then(function () { return AgendaViewLib.injectEvent(splitBothConflict); })
        .then(function () { return AgendaViewLib.injectEvent(conflict3); })
        .then(function () { return AgendaViewLib.injectEvent(conflict4); })

        // Verify events
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(splitNoConflict); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(splitConflict1); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(splitConflict2); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(splitBothConflict); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies sorting by busy status
    ///
    BVT.Test("AgendaView_SortingByBusyStatus", options.agenda, function (tc) {
        tc.stop();

        var date = AgendaViewLib.timeFromToday(1, 10, 0);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(30, date)
        };

        CalendarLib.agendaView()

        // Create 4 events at the same time tomorrow, 1 for each busy status
        .then(function () {
            event.busyStatus = BusyStatus.free;
            event.subject = "Free";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.tentative;
            event.subject = "Tentative";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.busy;
            event.subject = "Busy";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.outOfOffice;
            event.subject = "Out Of Office";
            return AgendaViewLib.injectEvent(event);
        })

        // Verify the event order
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies sorting all-day events by busy status
    ///
    BVT.Test("AgendaView_SortingAllDayByBusyStatus", options.agenda, function (tc) {
        tc.stop();

        var date = AgendaViewLib.timeFromToday(1, 0, 0);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(24 * 60, date)
        };

        CalendarLib.agendaView()

        // Create 4 all-day events at the same time tomorrow, 1 for each busy status
        .then(function () {
            event.busyStatus = BusyStatus.free;
            event.subject = "Free";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.tentative;
            event.subject = "Tentative";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.busy;
            event.subject = "Busy";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.busyStatus = BusyStatus.outOfOffice;
            event.subject = "Out Of Office";
            return AgendaViewLib.injectEvent(event);
        })

        // Verify the event order
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies sorting by duration
    ///
    BVT.Test("AgendaView_SortingByDuration", options.agenda, function (tc) {
        tc.stop();

        var date = AgendaViewLib.timeFromToday(1, 5, 0);
        var event = {
            startDate: date
        };

        CalendarLib.agendaView()

        // Create 4 events at the same time tomorrow, all different durations
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(60, date);
            event.subject = "1 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(2 * 60, date);
            event.subject = "2 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(3 * 60, date);
            event.subject = "3 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(4 * 60, date);
            event.subject = "4 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(3.5 * 60, date);
            event.subject = "3.5 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(2.5 * 60, date);
            event.subject = "2.5 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(1.5 * 60, date);
            event.subject = "1.5 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })
        .then(function () {
            event.endDate = AgendaViewLib.addMinutes(0.5 * 60, date);
            event.subject = "0.5 Hour Event";
            return AgendaViewLib.injectEvent(event);
        })

        // Verify the event order
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies sorting around midnight
    ///
    BVT.Test("AgendaView_SortingAroundMidnight", options.agenda, function (tc) {
        tc.stop();

        var spanning1Date = AgendaViewLib.timeFromToday(1, 5, 0);
        var spanning1 = {
            startDate: spanning1Date,
            endDate: AgendaViewLib.addMinutes(4 * 60, spanning1Date),
            subject: "Spanning (1)"
        };

        var conflicting3HrDate = AgendaViewLib.timeFromToday(2, 0, 0);
        var conflicting3Hr = {
            startDate: conflicting3HrDate,
            endDate: AgendaViewLib.addMinutes(3 * 60, conflicting3HrDate),
            subject: "Conflicting 3 Hr"
        };

        var spanning2Date = AgendaViewLib.timeFromToday(2, 22, 0);
        var spanning2 = {
            startDate: spanning2Date,
            endDate: AgendaViewLib.addMinutes(4 * 60, spanning2Date),
            subject: "Spanning (2)"
        };

        var conflicting2HrDate = AgendaViewLib.timeFromToday(2, 0, 0);
        var conflicting2HrOOF = {
            startDate: conflicting2HrDate,
            endDate: AgendaViewLib.addMinutes(2 * 60, conflicting2HrDate),
            subject: "Conflicting 2 Hr OOF",
            busyStatus: BusyStatus.outOfOffice
        };

        var conflicting2HrBusy = {
            startDate: conflicting2HrDate,
            endDate: AgendaViewLib.addMinutes(2 * 60, conflicting2HrDate),
            subject: "Conflicting 2 Hr Busy",
            busyStatus: BusyStatus.busy
        };

        CalendarLib.agendaView()

        // Create 1 event that spans midnight and 1 that starts at midnight, but is longer
        .then(function () { return AgendaViewLib.injectEvent(spanning1); })
        .then(function () { return AgendaViewLib.injectEvent(conflicting3Hr); })

        // Create 1 event that spans midnight, 2 that start at midnight, 1 is Out of Office, 1 is Busy
        .then(function () { return AgendaViewLib.injectEvent(spanning2); })
        .then(function () { return AgendaViewLib.injectEvent(conflicting2HrOOF); })
        .then(function () { return AgendaViewLib.injectEvent(conflicting2HrBusy); })

        // Verify the event order
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Verifies ordering of all-day card slots
    ///
    BVT.Test("AgendaView_AllDayCardOrdering", options.agenda, function (tc) {
        tc.stop();

        var allday28hrs = function (day, hour, subject) {
            var startDate = AgendaViewLib.timeFromToday(day, hour, 0);
            var endDate = AgendaViewLib.addMinutes(28 * 60, startDate);
            return {
                startDate: startDate,
                endDate: endDate,
                subject: subject
            };
        };

        var allday24hrs = function (day, subject) {
            var startDate = AgendaViewLib.timeFromToday(day, 0, 0);
            var endDate = AgendaViewLib.addMinutes(24 * 60, startDate);
            return {
                startDate: startDate,
                endDate: endDate,
                subject: subject
            };
        };

        CalendarLib.agendaView()

        // Create events out of order for each potential pairing
        // start/start
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(1, 8, "All day 2")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(1, 6, "All day 1")); })

        // start/end
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(4, 8, "All day 4")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(3, 6, "All day 3")); })

        // start/none
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(6, "All day 6")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(6, 8, "All day 5")); })

        // end/start
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(9, 8, "All day 8")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(8, 6, "All day 7")); })

        // end/end
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(10, 8, "All day 10")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(10, 6, "All day 9")); })

        // end/none
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(13, "All day 12")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(12, 8, "All day 11")); })

        // none/start
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(14, "All day 14")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(14, 6, "All day 13")); })

        // none/end
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(17, "All day 16")); })
        .then(function () { return AgendaViewLib.injectEvent(allday28hrs(16, 6, "All day 15")); })

        // none/none
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(18, "All day 18")); })
        .then(function () { return AgendaViewLib.injectEvent(allday24hrs(18, "All day 17")); })

        // Verify the event order
        .then(function () { return AgendaViewLib.verifyEventCardOrder(); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates an event, delete it, and verify that it is gone
    ///
    BVT.Test("AgendaView_Delete", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(60, date),
            subject: "Delete Me"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Delete the event
        .then(function () { return AgendaViewLib.removeCreatedEvent(event); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardDoesNotExist(event); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates a split event, delete it, and verify that it is gone
    ///
    BVT.Test("AgendaView_DeleteSplitEvent", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(23 * 60, date),
            subject: "Delete Me"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Delete the event
        .then(function () { return AgendaViewLib.removeCreatedEvent(event); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardDoesNotExist(event); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Creates a multi-day event, delete it, and verify that it is gone
    ///
    BVT.Test("AgendaView_DeleteMultiDayEvent", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(50 * 60, date),
            subject: "Delete Me"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Delete the event
        .then(function () { return AgendaViewLib.removeCreatedEvent(event); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardDoesNotExist(event); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create an event, manipulate it, and verify that it has changed
    ///
    BVT.Test("AgendaView_Manipulate", options.agenda, function (tc) {
        tc.stop();

        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(100, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Manipulate the event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create an event, manipulates it to be split (< 24 hrs, but spanning midnight), and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateSingleToSplit", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(23 * 60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Manipulate the event to be a split event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create a split event (< 24 hrs, but spanning midnight), manipulate it to be single-day, and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateSplitToSingle", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(23 * 60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Manipulate the event to be a split event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create an event, manipulates it to be multi-day (> 24 hrs), and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateSingleToMultiDay", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(25 * 60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Manipulate the event to be a split event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create a multi-day event (> 24 hrs), manipulate it to be single-day, and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateMultiDayToSingle", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(25 * 60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

        // Manipulate the event to be a split event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create a split event (< 24 hrs, but spanning midnight), manipulates it to be multi-day (> 24 hours), and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateSplitToMultiDay", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(23 * 60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(25 * 60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

            // Manipulate the event to be a multi-day event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });

    /// OWNER: AdKell
    ///
    /// Create a multi-day event (> 24 hours), manipulates it to be split (< 24 hrs, but spanning midnight), and verify that it has changed
    ///
    BVT.Test("AgendaView_ManipulateMultiDayToSplit", options.agenda, function (tc) {
        tc.stop();
        var date = AgendaViewLib.timeFromToday(1, 10, 17);
        var event = {
            startDate: date,
            endDate: AgendaViewLib.addMinutes(25 * 60, date),
            subject: "Change Me",
            busyStatus: BusyStatus.busy,
            location: "Redmond, WA"
        };

        var changedDate = AgendaViewLib.timeFromToday(1, 11, 40);
        var changedEvent = {
            startDate: changedDate,
            endDate: AgendaViewLib.addMinutes(23 * 60, changedDate),
            subject: "I'm changed!",
            busyStatus: BusyStatus.tentative,
            location: "Ann Arbor, MI"
        };

        CalendarLib.agendaView()
        .then(function () { return AgendaViewLib.injectEvent(event); })

            // Manipulate the event to be a multi-day event
        .then(function () { return AgendaViewLib.changeCreatedEvent(event, changedEvent); })

        // Verify the event
        .then(function () { return AgendaViewLib.fetchAllEventCards(); })
        .then(function () { return AgendaViewLib.verifyEventCardExists(changedEvent); })
        .done(function () {
            AgendaViewLib.cleanupEvents();
            cleanup(tc);
        },
        function (failure) {
            AgendaViewLib.cleanupEvents();
            tc.error(failure);
            cleanup(tc);
        });
    });
})();
