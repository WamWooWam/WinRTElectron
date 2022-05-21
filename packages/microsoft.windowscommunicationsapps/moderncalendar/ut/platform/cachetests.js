
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft,Windows*/

(function () {

    Tx.test("CacheTests.testPrimaryRangeCalc", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Waiting for idle and dumping store to ensure cache in good state");
            TestCore.waitForIdle(TestCore.defaultWait);
            TestCore.dumpStore();
        
            TestCore.log("Getting Ranges");
            var ranges = TestCore.calendarManager.cacheRanges;
            tc.areEqual(ranges.count, 0, "Should start the test with no ranges");

            var tests = [
                            [new Date("1/1/2011"),   new Date("10/1/2010"), new Date("8/1/2012")],
                            [new Date("1/15/2011"),  new Date("10/1/2010"), new Date("8/1/2012")],
                            [new Date("1/31/2011"),  new Date("10/1/2010"), new Date("8/1/2012")],
                            [new Date("7/1/2011"),   new Date("4/1/2011"),  new Date("2/1/2013")],
                            [new Date("7/15/2011"),  new Date("4/1/2011"),  new Date("2/1/2013")],
                            [new Date("7/31/2011"),  new Date("4/1/2011"),  new Date("2/1/2013")],
                            [new Date("12/1/2011"),  new Date("9/1/2011"),  new Date("7/1/2013")],
                            [new Date("12/15/2011"), new Date("9/1/2011"),  new Date("7/1/2013")],
                            [new Date("12/31/2011"), new Date("9/1/2011"),  new Date("7/1/2013")]
                        ];

            for (var i = 0; i < tests.length; i++) {

                TestCore.log("Setting \"Now\" to " + tests[i][0].toDateString() + ", expecting range of " + tests[i][1].toDateString() + " to " + tests[i][2].toDateString());

                TestCore.calendarManager.setCacheNowDate(tests[i][0]);
                TestCore.calendarManager.setCacheForeground(false);
                TestCore.calendarManager.setCacheForeground(true); 
                TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
                var defaultRange = ranges.item(0);
                TestCore.verifyPropertyValue(TestCore.defaultWait, defaultRange, "start", tests[i][1]);
                TestCore.verifyPropertyValue(TestCore.defaultWait, defaultRange, "end", tests[i][2]);

                TestCore.dumpStore();
                TestCore.verifyNotifications(ranges, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            }
        }
    });

    Tx.test("CacheTests.testPrimaryRangeMove", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Getting Ranges");
            var ranges = TestCore.calendarManager.cacheRanges;
            tc.areEqual(ranges.count, 0, "Should start the test with no ranges");

            var tests = [
                            [new Date("1/1/2011"),  new Date("10/1/2010"), new Date("8/1/2012"),  1,                    TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("1/15/2011"), new Date("10/1/2010"), new Date("8/1/2012"),  TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("1/31/2011"), new Date("10/1/2010"), new Date("8/1/2012"),  TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("2/15/2011"), new Date("11/1/2010"), new Date("9/1/2012"),  TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("2/28/2011"), new Date("11/1/2010"), new Date("9/1/2012"),  TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("3/31/2011"), new Date("12/1/2010"), new Date("10/1/2012"), TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("6/30/2011"), new Date("3/1/2011"),  new Date("1/1/2013"),  TestCore.ignoreValue, TestCore.ignoreValue, TestCore.ignoreValue],
                            [new Date("4/30/2011"), new Date("1/1/2011"),  new Date("11/1/2012"), 1,                    TestCore.ignoreValue, 1],
                            [new Date("4/30/2013"), new Date("1/1/2013"),  new Date("11/1/2014"), 1,                    TestCore.ignoreValue, 1]
                        ];

            for (var i = 0; i < tests.length; i++) {

                TestCore.log("Setting \"Now\" to " + tests[i][0].toDateString() + ", expecting range of " + tests[i][1].toDateString() + " to " + tests[i][2].toDateString());

                ranges.dispose();
                ranges = TestCore.calendarManager.cacheRanges;

                TestCore.calendarManager.setCacheNowDate(tests[i][0]);
                TestCore.calendarManager.setCacheForeground(false);
                TestCore.calendarManager.setCacheForeground(true); 

                if (tests[i][3] != TestCore.ignoreValue || tests[i][4] != TestCore.ignoreValue || tests[i][5] != TestCore.ignoreValue) {
                    TestCore.verifyNotifications(ranges, tests[i][3], tests[i][4], tests[i][5]);
                }

                TestCore.verifyRangesByOrder(ranges,
                                             ["start", "end"],
                                             [
                                                [tests[i][1], tests[i][2]]
                                             ]);
                
            }

            ranges.dispose();
        }
    });

    Tx.test("CacheTests.testSecondaryRangeLifetime", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Getting Ranges");
            var ranges = TestCore.calendarManager.cacheRanges;
            tc.areEqual(ranges.count, 0, "Should start the test with no ranges");

            var rangeType = Microsoft.WindowsLive.Platform.Calendar.RangeType;
            var dtNow = new Date("6/30/2011");
            var dtDefaultStart = new Date("3/1/2011");
            var dtDefaultEnd = new Date("1/1/2013");

            TestCore.log("Creating Default Range");

            TestCore.calendarManager.setCacheNowDate(dtNow);
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true); 

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary, dtDefaultStart, dtDefaultEnd]
                                         ]);

            TestCore.log("Adding Secondary Range within Default Range");
            var events1 = TestCore.calendarManager.getEvents(new Date("8/1/2011"), new Date("9/1/2011"));

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary,     dtDefaultStart,         dtDefaultEnd],
                                            [rangeType.secondary,   new Date("8/1/2011"),   new Date("9/1/2011")]
                                         ]);

            TestCore.log("Bumping Reference Count On Secondary Range");
            var events2 = TestCore.calendarManager.getEvents(new Date("8/1/2011"), new Date("9/1/2011"));

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary,     dtDefaultStart,         dtDefaultEnd],
                                            [rangeType.secondary,   new Date("8/1/2011"),   new Date("9/1/2011")],
                                            [rangeType.secondary,   new Date("8/1/2011"),   new Date("9/1/2011")]
                                         ]);

            TestCore.log("Dropping Reference Count On Secondary Range");
            events1.dispose();

            TestCore.verifyNotifications(ranges, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary,     dtDefaultStart,         dtDefaultEnd],
                                            [rangeType.secondary,   new Date("8/1/2011"),   new Date("9/1/2011")]
                                         ]);

            TestCore.log("Releasing Secondary Range");
            events2.dispose();

            TestCore.verifyNotifications(ranges, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary,     dtDefaultStart,         dtDefaultEnd]
                                         ]);

            TestCore.log("Adding multiple ranges (early, late, and exact)");
            var events3 = TestCore.calendarManager.getEvents(new Date("1/1/2010"), new Date("2/1/2010"));
            var events4 = TestCore.calendarManager.getEvents(new Date("1/1/2014"), new Date("2/1/2014"));
            var events5 = TestCore.calendarManager.getEvents(dtDefaultStart, dtDefaultEnd);

            TestCore.verifyNotifications(ranges, 3, TestCore.ignoreValue, TestCore.ignoreValue);
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary,     dtDefaultStart,         dtDefaultEnd],
                                            [rangeType.secondary,   new Date("1/1/2010"),   new Date("2/1/2010")],
                                            [rangeType.secondary,   new Date("1/1/2014"),   new Date("2/1/2014")],
                                            [rangeType.secondary,   dtDefaultStart,         dtDefaultEnd]
                                         ]);
            
            TestCore.log("Release Ranges");
            events3.dispose();
            events4.dispose();
            events5.dispose(); 
            TestCore.verifyNotifications(ranges, TestCore.ignoreValue, TestCore.ignoreValue, 3);
            TestCore.verifyRangesByOrder(ranges,
                                         ["rangeType", "start", "end"],
                                         [
                                            [rangeType.primary, dtDefaultStart, dtDefaultEnd]
                                         ]);

            ranges.dispose();
            
        }
    });

    Tx.test("CacheTests.testRangePopulation", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
            
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("1/1/2010"), new Date("1/1/2014"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("6/30/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("3/1/2011"), new Date("1/1/2013")]
                                         ]);

            TestCore.log("Creating Events");
            var event1 = TestCore.calendarManager.defaultCalendar.createEvent();
            event1.subject = "Event 1";
            event1.startDate = new Date("3/15/2011 2:00 PM");
            event1.endDate = new Date("3/15/2011 3:00 PM");
            event1.fastInsert = false; // Disable fast insert on this event.  We'll test that later
            event1.commit();

            var event2 = TestCore.calendarManager.defaultCalendar.createEvent();
            event2.subject = "Event 2";
            event2.startDate = new Date("1/15/2013 2:00 PM");
            event2.endDate = new Date("1/15/2013 3:00 PM");
            event2.fastInsert = false; // Disable fast insert on this event.  We'll test that later
            event2.commit();

            var event3 = TestCore.calendarManager.defaultCalendar.createEvent();
            event3.subject = "Event 3";
            event3.startDate = new Date("3/1/2011 2:00 PM");
            event3.endDate = new Date("3/1/2011 3:00 PM");
            event3.recurring = true;
            event3.recurrence.recurrenceType = wlc.RecurrenceType.monthly;
            event3.recurrence.dayOfMonth = 1;
            event3.recurrence.interval = 4;
            event3.commit();

            TestCore.verifyNotifications(events, 7, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Event 1", new Date("3/15/2011 2:00PM"), new Date("3/15/2011 3:00PM")],
                                            ["Event 3", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);

            TestCore.log("Moving default range");
            TestCore.calendarManager.setCacheNowDate(new Date("7/1/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 1, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("4/1/2011"), new Date("2/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, 2);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")]
                                         ]);

            TestCore.log("Moving default range again");
            TestCore.calendarManager.setCacheNowDate(new Date("9/1/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 1, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("6/1/2011"), new Date("4/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Getting Early Secondary Range");
            var events1 = TestCore.calendarManager.getEvents(new Date("3/1/2011"), new Date("4/1/2011"));

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 2, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("6/1/2011"), new Date("4/1/2013")],
                                            [new Date("3/1/2011"), new Date("4/1/2011")]
                                         ]);

            TestCore.verifyNotifications(events, 2, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Event 1", new Date("3/15/2011 2:00PM"), new Date("3/15/2011 3:00PM")],
                                            ["Event 3", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Getting Late Secondary Range");
            var events2 = TestCore.calendarManager.getEvents(new Date("7/1/2013"), new Date("8/1/2013"));

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 3, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("6/1/2011"), new Date("4/1/2013")],
                                            [new Date("3/1/2011"), new Date("4/1/2011")],
                                            [new Date("7/1/2013"), new Date("8/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Event 1", new Date("3/15/2011 2:00PM"), new Date("3/15/2011 3:00PM")],
                                            ["Event 3", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")],
                                            ["Event 3", new Date("7/1/2013 2:00PM"),  new Date("7/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Getting Range Within Default");
            var events3 = TestCore.calendarManager.getEvents(new Date("7/1/2011"), new Date("8/1/2011"));

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 4, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("6/1/2011"), new Date("4/1/2013")],
                                            [new Date("3/1/2011"), new Date("4/1/2011")],
                                            [new Date("7/1/2013"), new Date("8/1/2013")],
                                            [new Date("7/1/2011"), new Date("8/1/2011")]
                                         ]);
            
            

            TestCore.log("Moving default range yet again");
            TestCore.calendarManager.setCacheNowDate(new Date("11/1/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 4, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("8/1/2011"), new Date("6/1/2013")],
                                            [new Date("3/1/2011"), new Date("4/1/2011")],
                                            [new Date("7/1/2013"), new Date("8/1/2013")],
                                            [new Date("7/1/2011"), new Date("8/1/2011")]
                                         ]);
            
            

            TestCore.log("Disposing Secondary Range (the middle one)");
            events3.dispose();
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 3, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("8/1/2011"), new Date("6/1/2013")],
                                            [new Date("3/1/2011"), new Date("4/1/2011")],
                                            [new Date("7/1/2013"), new Date("8/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Event 1", new Date("3/15/2011 2:00PM"), new Date("3/15/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")],
                                            ["Event 3", new Date("7/1/2013 2:00PM"),  new Date("7/1/2013 3:00PM")]
                                         ]);

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;

            TestCore.log("Forcing Time Zone Change (full rebuild)");
            TestCore.calendarManager.forceCacheTimezoneChange();

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, 3);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("8/1/2011"), new Date("6/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, 6, TestCore.ignoreValue, 9);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Creating Exceptions (one in range and one not)");
            var occur1 = event3.getOccurrence(new Date("7/1/2012 2:00PM"));
            occur1.subject = "Event-3";
            occur1.commit();
            var occur2 = event3.getOccurrence(new Date("7/1/2013 2:00PM"));
            occur2.subject = "Event_3";
            occur2.commit();

            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event-3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Creating secondary range containing second exception");
            var events4 = TestCore.calendarManager.getEvents(new Date("7/1/2013"), new Date("8/1/2013"));

            ranges.dispose();
            ranges = TestCore.calendarManager.cacheRanges;
            TestCore.waitForCollectionCount(TestCore.defaultWait, ranges, 2, true);
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("8/1/2011"), new Date("6/1/2013")],
                                            [new Date("7/1/2013"), new Date("8/1/2013")]
                                         ]);

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event-3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")],
                                            ["Event_3", new Date("7/1/2013 2:00PM"),  new Date("7/1/2013 3:00PM")]
                                         ]);

            TestCore.log("Pausing Cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Adding FastInsert events while the cache is paused (should populate anyway)");

            var event4 = TestCore.calendarManager.defaultCalendar.createEvent();
            TestCore.log("Adding Event Before Ranges");
            event4.subject = "Event 4";
            event4.startDate = new Date("6/1/2011 2:00PM");
            event4.endDate = new Date("6/1/2011 3:00PM");
            event4.commit();

            var event5 = TestCore.calendarManager.defaultCalendar.createEvent();
            TestCore.log("Adding Event Within Ranges");
            event5.subject = "Event 5";
            event5.startDate = new Date("8/1/2012 2:00PM");
            event5.endDate = new Date("8/1/2012 3:00PM");
            event5.commit();

            var event6 = TestCore.calendarManager.defaultCalendar.createEvent();
            TestCore.log("Adding Event After Ranges");
            event6.subject = "Event 6";
            event6.startDate = new Date("10/1/2013 2:00PM");
            event6.endDate = new Date("10/1/2013 3:00PM");
            event6.commit();

            TestCore.verifyNotifications(events, 3, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 4", new Date("6/1/2011 2:00PM"), new Date("6/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Event-3", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Event 5", new Date("8/1/2012 2:00PM"), new Date("8/1/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")],
                                            ["Event 2", new Date("1/15/2013 2:00PM"), new Date("1/15/2013 3:00PM")],
                                            ["Event 3", new Date("3/1/2013 2:00PM"),  new Date("3/1/2013 3:00PM")],
                                            ["Event_3", new Date("7/1/2013 2:00PM"),  new Date("7/1/2013 3:00PM")],
                                            ["Event 6", new Date("10/1/2013 2:00PM"), new Date("10/1/2013 3:00PM")]
                                         ]);
                
            TestCore.log("Resuming Cache");
            TestCore.calendarManager.resumeCache();

            TestCore.verifyNotifications(events, 0, 0, 0);

            ranges.dispose();
            events.dispose();
            events1.dispose();
            events2.dispose();
            events4.dispose();
        }
    });

    Tx.test("CacheTests.testDeletedExceptions", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("1/1/2010"), new Date("1/1/2014"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("6/30/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("3/1/2011"), new Date("1/1/2013")]
                                         ]);

            TestCore.log("Creating Recurring Event");
            var recurring = TestCore.calendarManager.defaultCalendar.createEvent();
            recurring.subject = "Recurring Event";
            recurring.startDate = new Date("3/1/2011 2:00 PM");
            recurring.endDate = new Date("3/1/2011 3:00 PM");
            recurring.recurring = true;
            recurring.recurrence.recurrenceType = wlc.RecurrenceType.monthly;
            recurring.recurrence.dayOfMonth = 1;
            recurring.recurrence.interval = 4;
            recurring.commit();

            TestCore.verifyNotifications(events, 6, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Recurring Event", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);

            TestCore.log("Creating Subject Exception");
            var occur = recurring.getOccurrence(new Date("7/1/2011 2:00PM"));
            occur.subject = "Subject Exception";
            occur.commit();

            TestCore.log("Creating DateTime Exception");
            occur = recurring.getOccurrence(new Date("11/1/2011 2:00PM"));
            occur.startDate = new Date("11/1/2011 3:00PM");
            occur.endDate = new Date("11/1/2011 4:00PM");
            occur.commit();

            TestCore.log("Creating Deletion Exception");
            occur = recurring.getOccurrence(new Date("3/1/2012 2:00PM"));
            occur.deleteObject();
            occur = null;

            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 1);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Recurring Event",   new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Subject Exception", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Recurring Event",   new Date("11/1/2011 3:00PM"), new Date("11/1/2011 4:00PM")],
                                            ["Recurring Event",   new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Recurring Event",   new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);

            TestCore.log("Removing Subject Exception");
            var except = recurring.getException(new Date("7/1/2011 2:00PM"));
            except.deleteObject();
            recurring.commit();
            except = null;

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, 1);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Recurring Event", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2011 3:00PM"), new Date("11/1/2011 4:00PM")],
                                            ["Recurring Event", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);

            TestCore.log("Removing DateTime Exception");
            except = recurring.getException(new Date("11/1/2011 2:00PM"));
            except.deleteObject();
            recurring.commit();
            except = null;

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, 1);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Recurring Event", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);

            TestCore.log("Removing Deletion Exception");
            except = recurring.getException(new Date("3/1/2012 2:00PM"));
            except.deleteObject();
            recurring.commit();
            except = null;

            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Recurring Event", new Date("3/1/2011 2:00PM"),  new Date("3/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2011 2:00PM"),  new Date("7/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2011 2:00PM"), new Date("11/1/2011 3:00PM")],
                                            ["Recurring Event", new Date("3/1/2012 2:00PM"),  new Date("3/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("7/1/2012 2:00PM"),  new Date("7/1/2012 3:00PM")],
                                            ["Recurring Event", new Date("11/1/2012 2:00PM"), new Date("11/1/2012 3:00PM")]
                                         ]);
            
            ranges.dispose();
            events.dispose();
            
        }
    });
    
    Tx.test("CacheTests.testHiddenCalendar", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var day = dtNow.getDate();
            
            TestCore.log("Getting Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, day), new Date(year, month, day + 7), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);

            TestCore.log("Getting Calendars");
            var calendar1 = TestCore.calendarManager.defaultCalendar;
            var calendar2 = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "calendar2");

            TestCore.log("Creating Events");
            var event = calendar1.createEvent();
            event.subject = "Calendar1 Event";
            event.startDate = new Date(year, month, day, 12);
            event.endDate = new Date(year, month, day, 13);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();

            event = calendar2.createEvent();
            event.subject = "Calendar2 Event";
            event.startDate = new Date(year, month, day, 14);
            event.endDate = new Date(year, month, day, 15);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();
        
            TestCore.verifyNotifications(events, 14, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Hiding Calendar2");
            calendar2.hidden = true;
            calendar2.commit();

            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 7);

            TestCore.log("Adding Event to Hidden Calendar");

            event = calendar2.createEvent();
            event.subject = "Another Calendar2 Event";
            event.startDate = new Date(year, month, day, 15);
            event.endDate = new Date(year, month, day, 16);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();

            TestCore.waitForIdle(TestCore.defaultWait);
            TestCore.verifyNotifications(events, 0, 0, 0);

            TestCore.log("Showing Calendar2");

            calendar2.hidden = false;
            calendar2.commit();

            TestCore.verifyNotifications(events, 14, TestCore.ignoreValue, TestCore.ignoreValue);

            events.dispose();
            
        }
    });

    Tx.test("CacheTests.testConsumeAtStartup", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("1/1/2010"), new Date("1/1/2014"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            var changeTable = TestCore.calendarManager.changeTable;
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);
            tc.areEqual(0, changeTable.count, "changeTable isn't empty");

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("6/30/2011"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("3/1/2011"), new Date("1/1/2013")]
                                         ]);

            TestCore.log("Pausing Cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating Events");
            var event1 = TestCore.calendarManager.defaultCalendar.createEvent();
            event1.subject = "Event 1";
            event1.startDate = new Date("3/15/2011 2:00 PM");
            event1.endDate = new Date("3/15/2011 3:00 PM");
            event1.commit();

            var event2 = TestCore.calendarManager.defaultCalendar.createEvent();
            event2.subject = "Event 2";
            event2.startDate = new Date("10/15/2012 2:00 PM");
            event2.endDate = new Date("10/15/2012 3:00 PM");
            event2.commit();

            var event3 = TestCore.calendarManager.defaultCalendar.createEvent();
            event3.subject = "Event 3";
            event3.startDate = new Date("3/1/2011 2:00 PM");
            event3.endDate = new Date("3/1/2011 3:00 PM");
            event3.recurring = true;
            event3.recurrence.recurrenceType = wlc.RecurrenceType.monthly;
            event3.recurrence.dayOfMonth = 1;
            event3.recurrence.interval = 4;
            event3.commit();
            
            
            TestCore.verifyNotifications(changeTable, 4, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Process Change Table to generate consumes");
            TestCore.calendarManager.resumeCacheProcessOnly();
            
            TestCore.verifyNotifications(changeTable, 5, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Process Change Table to simulate startup with/data and consumes");
            TestCore.calendarManager.resumeCacheProcessOnly();
            
            TestCore.verifyNotifications(changeTable, 5, TestCore.ignoreValue, 5);

            TestCore.log("Resume Cache to Simulate Startup with Data");
            TestCore.calendarManager.resumeCache();

            TestCore.log("Verifying Events");
            TestCore.verifyNotifications(events, 8, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Event 3", new Date("3/1/2011 2:00PM"),   new Date("3/1/2011 3:00PM")],
                                            ["Event 1", new Date("3/15/2011 2:00PM"),  new Date("3/15/2011 3:00PM")],
                                            ["Event 3", new Date("7/1/2011 2:00PM"),   new Date("7/1/2011 3:00PM")],
                                            ["Event 3", new Date("11/1/2011 2:00PM"),  new Date("11/1/2011 3:00PM")],
                                            ["Event 3", new Date("3/1/2012 2:00PM"),   new Date("3/1/2012 3:00PM")],
                                            ["Event 3", new Date("7/1/2012 2:00PM"),   new Date("7/1/2012 3:00PM")],
                                            ["Event 2", new Date("10/15/2012 2:00PM"), new Date("10/15/2012 3:00PM")],
                                            ["Event 3", new Date("11/1/2012 2:00PM"),  new Date("11/1/2012 3:00PM")]
                                         ]);

            ranges.dispose();
            events.dispose();
            
        }
    });

    Tx.test("CacheTests.testOutOfOrder", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("6/1/2012"), new Date("7/1/2012"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("6/11/2012"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("3/1/2012"), new Date("1/1/2014")]
                                         ]);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating add after update event");
            var event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add After Update";
            event.location = "Here";
            event.startDate = new Date("6/15/2012 2:00 PM");
            event.endDate = new Date("6/15/2012 3:00 PM");
            event.commit();

            event.location = "There";
            event.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.location);
            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "startDate", "endDate"],
                                         [["Add After Update", "There", new Date("6/15/2012 2:00 PM"), new Date("6/15/2012 3:00 PM")]]
                                         );

            TestCore.log("Writing insert, expecting no change");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating add after update event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add After Update Recurring";
            event.location = "Here";
            event.startDate = new Date("6/4/2012 2:00 PM");
            event.endDate = new Date("6/4/2012 3:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();

            event.location = "Everywhere";
            event.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.location);
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "startDate", "endDate"],
                                         [
                                            ["Add After Update Recurring", "Everywhere", new Date("6/4/2012 2:00 PM"),  new Date("6/4/2012 3:00 PM")],
                                            ["Add After Update Recurring", "Everywhere", new Date("6/11/2012 2:00 PM"), new Date("6/11/2012 3:00 PM")],
                                            ["Add After Update Recurring", "Everywhere", new Date("6/18/2012 2:00 PM"), new Date("6/18/2012 3:00 PM")],
                                            ["Add After Update Recurring", "Everywhere", new Date("6/25/2012 2:00 PM"), new Date("6/25/2012 3:00 PM")]
                                         ]);

            TestCore.log("Writing insert, expecting no change");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 4);

            TestCore.log("Creating update after update event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Update After Update";
            event.location = "Here";
            event.busyStatus = wlc.BusyStatus.tentative;
            event.meetingStatus = wlc.MeetingStatus.notAMeeting;
            event.startDate = new Date("6/15/2012 2:00 PM");
            event.endDate = new Date("6/15/2012 3:00 PM");
            event.commit();
            
            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [["Update After Update", "Here", wlc.BusyStatus.tentative, wlc.MeetingStatus.notAMeeting, new Date("6/15/2012 2:00 PM"), new Date("6/15/2012 3:00 PM")]]
                                         );

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            event.subject = "First Update";
            event.location = "Somewhere";
            event.commit();
            
            event.busyStatus = wlc.BusyStatus.busy;
            event.meetingStatus = wlc.MeetingStatus.isAMeeting;
            event.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing second update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.busystatus | wlc.FieldFlags.meetingstatus);
            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [["Update After Update", "Here", wlc.BusyStatus.busy, wlc.MeetingStatus.isAMeeting, new Date("6/15/2012 2:00 PM"), new Date("6/15/2012 3:00 PM")]]
                                         );

            TestCore.log("Writing first update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.subject | wlc.FieldFlags.location);
            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [["First Update", "Somewhere", wlc.BusyStatus.busy, wlc.MeetingStatus.isAMeeting, new Date("6/15/2012 2:00 PM"), new Date("6/15/2012 3:00 PM")]]
                                         );

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 1);

            TestCore.log("Creating update after update recurring event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Update After Update Recurring";
            event.location = "Here";
            event.busyStatus = wlc.BusyStatus.tentative;
            event.meetingStatus = wlc.MeetingStatus.notAMeeting;
            event.startDate = new Date("6/4/2012 2:00 PM");
            event.endDate = new Date("6/4/2012 3:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();
            
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.tentative, wlc.MeetingStatus.notAMeeting, new Date("6/4/2012 2:00 PM"),  new Date("6/4/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.tentative, wlc.MeetingStatus.notAMeeting, new Date("6/11/2012 2:00 PM"), new Date("6/11/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.tentative, wlc.MeetingStatus.notAMeeting, new Date("6/18/2012 2:00 PM"), new Date("6/18/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.tentative, wlc.MeetingStatus.notAMeeting, new Date("6/25/2012 2:00 PM"), new Date("6/25/2012 3:00 PM")]
                                         ]);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            event.subject = "First Update Recurring";
            event.location = "Where else";
            event.commit();
            
            event.busyStatus = wlc.BusyStatus.free;
            event.meetingStatus = wlc.MeetingStatus.meetingCanceled;
            event.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing second update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.busystatus | wlc.FieldFlags.meetingstatus);
            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/4/2012 2:00 PM"),  new Date("6/4/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/11/2012 2:00 PM"), new Date("6/11/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/18/2012 2:00 PM"), new Date("6/18/2012 3:00 PM")],
                                            ["Update After Update Recurring", "Here", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/25/2012 2:00 PM"), new Date("6/25/2012 3:00 PM")]
                                         ]);

            TestCore.log("Writing first update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.subject | wlc.FieldFlags.location);
            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "location", "busyStatus", "meetingStatus", "startDate", "endDate"],
                                         [
                                            ["First Update Recurring", "Where else", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/4/2012 2:00 PM"),  new Date("6/4/2012 3:00 PM")],
                                            ["First Update Recurring", "Where else", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/11/2012 2:00 PM"), new Date("6/11/2012 3:00 PM")],
                                            ["First Update Recurring", "Where else", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/18/2012 2:00 PM"), new Date("6/18/2012 3:00 PM")],
                                            ["First Update Recurring", "Where else", wlc.BusyStatus.free, wlc.MeetingStatus.meetingCanceled, new Date("6/25/2012 2:00 PM"), new Date("6/25/2012 3:00 PM")]
                                         ]);

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 4);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating add after delete event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add After Delete";
            event.startDate = new Date("6/15/2012 2:00 PM");
            event.endDate = new Date("6/15/2012 3:00 PM");
            event.commit();

            var id = event.id;

            event.deleteObject();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing delete");
            /*jshint es5:true*/
            TestCore.calendarManager.writeChange(id, wlc.ChangeType.delete, wlc.FieldFlags.none);
            /*jshint es5:false*/
            

            TestCore.log("Writing add");
            TestCore.calendarManager.writeChange(id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating add after delete recurring event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add After Delete Recurring";
            event.startDate = new Date("6/4/2012 2:00 PM");
            event.endDate = new Date("6/4/2012 3:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();

            id = event.id;

            event.deleteObject();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing delete");
            /*jshint es5:true*/
            TestCore.calendarManager.writeChange(id, wlc.ChangeType.delete, wlc.FieldFlags.none);
            /*jshint es5:false*/
            

            TestCore.log("Writing add");
            TestCore.calendarManager.writeChange(id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            ranges.dispose();
            events.dispose();
            
        }
    });

    Tx.test("CacheTests.testOutOfOrderExceptions", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("6/1/2012"), new Date("7/1/2012"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("6/11/2012"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("3/1/2012"), new Date("1/1/2014")]
                                         ]);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating Add Event After Exception event");
            var event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add Event After Exception";
            event.startDate = new Date("6/4/2012 2:00 PM");
            event.endDate = new Date("6/4/2012 3:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();

            var exc = event.getOccurrence(new Date("6/11/2012 2:00 PM"));
            exc.subject = "Subject Exception";
            exc.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing exception add");
            TestCore.calendarManager.writeChange(exc.exceptionId, wlc.ChangeType.insert, wlc.FieldFlags.none);
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Add Event After Exception", new Date("6/4/2012 2:00 PM"),  new Date("6/4/2012 3:00 PM")],
                                            ["Subject Exception",         new Date("6/11/2012 2:00 PM"), new Date("6/11/2012 3:00 PM")],
                                            ["Add Event After Exception", new Date("6/18/2012 2:00 PM"), new Date("6/18/2012 3:00 PM")],
                                            ["Add Event After Exception", new Date("6/25/2012 2:00 PM"), new Date("6/25/2012 3:00 PM")]
                                         ]);

            TestCore.log("Writing event add");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 4);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            TestCore.log("Creating Add Event After Update Exception event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Add Event After Update Exception";
            event.startDate = new Date("6/4/2012 1:00 PM");
            event.endDate = new Date("6/4/2012 2:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();

            exc = event.getOccurrence(new Date("6/11/2012 1:00 PM"));
            exc.subject = "Subject Exception";
            exc.commit();

            exc.subject = "Subject Exception 2";
            exc.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing exception update");
            TestCore.calendarManager.writeChange(exc.exceptionId, wlc.ChangeType.update, wlc.FieldFlags.subject);
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Add Event After Update Exception", new Date("6/4/2012 1:00 PM"),  new Date("6/4/2012 2:00 PM")],
                                            ["Subject Exception 2",              new Date("6/11/2012 1:00 PM"), new Date("6/11/2012 2:00 PM")],
                                            ["Add Event After Update Exception", new Date("6/18/2012 1:00 PM"), new Date("6/18/2012 2:00 PM")],
                                            ["Add Event After Update Exception", new Date("6/25/2012 1:00 PM"), new Date("6/25/2012 2:00 PM")]
                                         ]);

            TestCore.log("Writing event add");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.insert, wlc.FieldFlags.none);
            

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 4);

            TestCore.log("Creating Delete Exception After Update Event After Add Exception event");
            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Multi Step Event";
            event.startDate = new Date("6/4/2012 12:00 PM");
            event.endDate = new Date("6/4/2012 1:00 PM");
            event.recurring = true;
            event.recurrence.recurrenceType = wlc.RecurrenceType.weekly;
            event.recurrence.dayOfWeek = wlc.DayOfWeek.monday;
            event.commit();
            
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Multi Step Event", new Date("6/4/2012 12:00 PM"),  new Date("6/4/2012 1:00 PM")],
                                            ["Multi Step Event", new Date("6/11/2012 12:00 PM"), new Date("6/11/2012 1:00 PM")],
                                            ["Multi Step Event", new Date("6/18/2012 12:00 PM"), new Date("6/18/2012 1:00 PM")],
                                            ["Multi Step Event", new Date("6/25/2012 12:00 PM"), new Date("6/25/2012 1:00 PM")]
                                         ]);

            TestCore.log("Creating Exception");
            var exc1 = event.getOccurrence(new Date("6/11/2012 12:00 PM"));
            exc1.subject = "Subject Exception 1";
            exc1.commit();

            
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Multi Step Event",    new Date("6/4/2012 12:00 PM"),  new Date("6/4/2012 1:00 PM")],
                                            ["Subject Exception 1", new Date("6/11/2012 12:00 PM"), new Date("6/11/2012 1:00 PM")],
                                            ["Multi Step Event",    new Date("6/18/2012 12:00 PM"), new Date("6/18/2012 1:00 PM")],
                                            ["Multi Step Event",    new Date("6/25/2012 12:00 PM"), new Date("6/25/2012 1:00 PM")]
                                         ]);

            TestCore.log("Pausing cache");
            TestCore.calendarManager.pauseCache();

            var id1 = exc1.exceptionId;

            event.deleteExceptions();
            event.startDate = new Date("6/4/2012 12:30 PM");
            event.endDate = new Date("6/4/2012 1:30 PM");
            event.commit();

            var exc2 = event.getOccurrence(new Date("6/11/2012 12:30 PM"));
            exc2.subject = "Subject Exception 2";
            exc2.commit();

            TestCore.log("Clearing change table and resuming cache");
            TestCore.calendarManager.clearChangeTable();
            TestCore.calendarManager.resumeCache();
            

            TestCore.log("Writing exception add");
            TestCore.calendarManager.writeChange(exc2.exceptionId, wlc.ChangeType.insert, wlc.FieldFlags.none);
            TestCore.verifyNotifications(events, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Multi Step Event",    new Date("6/4/2012 12:00 PM"),  new Date("6/4/2012 1:00 PM")],
                                            ["Subject Exception 1", new Date("6/11/2012 12:00 PM"), new Date("6/11/2012 1:00 PM")],
                                            ["Subject Exception 2", new Date("6/11/2012 12:30 PM"), new Date("6/11/2012 1:30 PM")],
                                            ["Multi Step Event",    new Date("6/18/2012 12:00 PM"), new Date("6/18/2012 1:00 PM")],
                                            ["Multi Step Event",    new Date("6/25/2012 12:00 PM"), new Date("6/25/2012 1:00 PM")]
                                         ]);

            TestCore.log("Writing event update");
            TestCore.calendarManager.writeChange(event.id, wlc.ChangeType.update, wlc.FieldFlags.start);
            TestCore.verifyNotifications(events, 4, TestCore.ignoreValue, 5);
            TestCore.verifyEventsByOrder(events,
                                         ["subject", "startDate", "endDate"],
                                         [
                                            ["Multi Step Event",    new Date("6/4/2012 12:30 PM"),  new Date("6/4/2012 1:30 PM")],
                                            ["Subject Exception 2", new Date("6/11/2012 12:30 PM"), new Date("6/11/2012 1:30 PM")],
                                            ["Multi Step Event",    new Date("6/18/2012 12:30 PM"), new Date("6/18/2012 1:30 PM")],
                                            ["Multi Step Event",    new Date("6/25/2012 12:30 PM"), new Date("6/25/2012 1:30 PM")]
                                         ]);

            TestCore.log("Writing exception delete");
            /*jshint es5:true*/
            TestCore.calendarManager.writeChange(id1, wlc.ChangeType.delete, wlc.FieldFlags.none);
            /*jshint es5:false*/
            

            TestCore.log("Deleting event");
            event.deleteObject();
            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 4);
            
            ranges.dispose();
            events.dispose();
            
        }
    });

    Tx.test("CacheTests.testCacheErrors", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;

            var settings = Windows.Storage.ApplicationData.current.localSettings.values;
            var errorCount = "Microsoft.WindowsLive.Calendar.UnitTest.ErrorCount";
            var errorComplete = "Microsoft.WindowsLive.Calendar.UnitTest.ErrorComplete";
            var testErrors = 1000;

            TestCore.log("Sending request to error 3 times");
            settings[errorCount] = 0;
            settings[errorComplete] = false;
            TestCore.calendarManager.writeChange(testErrors, wlc.ChangeType.notify, 3);
            TestCore.waitForPropertyValue(TestCore.defaultWait, settings, errorComplete, true, true);
            tc.areEqual(settings[errorCount], 3, "Should have handled 3 errors");

            TestCore.log("Sending request to error 8 times");
            settings[errorCount] = 0;
            settings[errorComplete] = false;
            TestCore.calendarManager.writeChange(testErrors, wlc.ChangeType.notify, 8);
            TestCore.waitForPropertyValue(TestCore.defaultWait, settings, errorComplete, true, true);
            tc.areEqual(settings[errorCount], 8, "Should have handled 8 errors");

            TestCore.log("Sending request to error 15 times (10 is max)");
            settings[errorCount] = 0;
            settings[errorComplete] = false;
            TestCore.calendarManager.writeChange(testErrors, wlc.ChangeType.notify, 15);
            TestCore.waitForPropertyValue(TestCore.defaultWait, settings, errorCount, 10, true);

            TestCore.waitForIdle(TestCore.defaultWait);

            tc.isFalse(settings[errorComplete], "Should not have completed error processing");
            tc.areEqual(settings[errorCount], 10, "Should have handled 10 errors, and no more");
            
        }
    });
    
    Tx.test("CacheTests.testDeletedCalendar", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            var dtNow = new Date();
            var year = dtNow.getFullYear();
            var month = dtNow.getMonth();
            var day = dtNow.getDate();
            
            TestCore.log("Getting Events");
            var events = TestCore.calendarManager.getEvents(new Date(year, month, day), new Date(year, month, day + 7), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);

            TestCore.log("Getting Calendars");
            var calendar1 = TestCore.calendarManager.defaultCalendar;
            var calendar2 = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "calendar2");

            TestCore.log("Creating Events");
            var event = calendar1.createEvent();
            event.subject = "Calendar1 Event";
            event.startDate = new Date(year, month, day, 12);
            event.endDate = new Date(year, month, day, 13);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();

            event = calendar2.createEvent();
            event.subject = "Calendar2 Event";
            event.startDate = new Date(year, month, day, 14);
            event.endDate = new Date(year, month, day, 15);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();
        
            TestCore.verifyNotifications(events, 14, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Deleting Calendar2");
            calendar2.underDeletedItems = true;
            calendar2.commit();

            TestCore.verifyNotifications(events, TestCore.ignoreValue, TestCore.ignoreValue, 7);

            TestCore.log("Adding Event to Deleted Calendar");

            event = calendar2.createEvent();
            event.subject = "Another Calendar2 Event";
            event.startDate = new Date(year, month, day, 15);
            event.endDate = new Date(year, month, day, 16);
            event.recurring = true;
            event.recurrence.until = new Date(year, month, day + 7);
            event.commit();

            TestCore.verifyNotifications(events, 0, 0, 0);

            TestCore.log("Make an exception in Deleted Calendar");
            var except = event.getOccurrence(new Date(year, month, day + 1, 15));
            TestCore.log("Got exception in Deleted Calendar");
            except.subject = "Exception to deleted recurring event";
            TestCore.log("Committing exception in Deleted Calendar");
            except.commit();
            TestCore.log("Verifying exception in Deleted Calendar");
            TestCore.verifyNotifications(events, 0, 0, 0);

            TestCore.log("Adding Single Instance Event to Deleted Calendar");
            event = calendar2.createEvent();
            event.subject = "Single Instance Calendar2 Event";
            event.startDate = new Date(year, month, day, 15);
            event.endDate = new Date(year, month, day, 16);
            event.recurring = false;
            event.commit();

            TestCore.verifyNotifications(events, 0, 0, 0);

            TestCore.log("Un-deleting Calendar2");

            calendar2.underDeletedItems = false;
            calendar2.commit();

            TestCore.verifyNotifications(events, 15, TestCore.ignoreValue, TestCore.ignoreValue);

            events.dispose();
            
        }
    });

    Tx.test("CacheTests.testGetNextEvent", function (tc) {

        TestCore.setupTest(tc, true);

        if (TestCore.verifyHostedInWwa()) {
        
            var wlc = Microsoft.WindowsLive.Platform.Calendar;
            
            TestCore.log("Getting Ranges and Events");
            var ranges = TestCore.calendarManager.cacheRanges; 
            var events = TestCore.calendarManager.getEvents(new Date("7/1/2012"), new Date("8/1/2012"), wlc.EventSortOrder.defaultSort, wlc.GetEventsOptions.noCreateRange);
            
            TestCore.verifyRangesByOrder(ranges, [], []);
            TestCore.verifyEventsByOrder(events, [], []);

            TestCore.log("Creating default range");
            TestCore.calendarManager.setCacheNowDate(new Date("7/16/2012"));
            TestCore.calendarManager.setCacheForeground(false);
            TestCore.calendarManager.setCacheForeground(true);

            TestCore.verifyNotifications(ranges, 1, TestCore.ignoreValue, TestCore.ignoreValue);
            
            
            TestCore.verifyRangesByOrder(ranges,
                                         ["start", "end"],
                                         [
                                            [new Date("4/1/2012"), new Date("2/1/2014")]
                                         ]);

            TestCore.log("Creating Events");
            var event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Recurring Event";
            event.startDate = new Date("7/1/2012 2:00PM");
            event.endDate = new Date("7/1/2012 3:00PM");
            event.recurring = true;
            event.recurrence.until = new Date("8/1/2012");
            event.commit();
            var recurId = event.id;

            event = TestCore.calendarManager.defaultCalendar.createEvent();
            event.subject = "Single Event";
            event.startDate = new Date("7/15/2012 1:00PM");
            event.endDate = new Date("7/15/2012 2:00PM");
            event.commit();
            var singleId = event.id;

            TestCore.verifyNotifications(events, 32, TestCore.ignoreValue, TestCore.ignoreValue);

            TestCore.log("Getting Recurring Event on 2nd from 1st");
            TestCore.verifyObject(TestCore.calendarManager.getNextEvent(recurId, new Date("7/1/2012 3:00PM")),
                                  ["startDate", "subject"],
                                  [new Date("7/2/2012 2:00PM"), "Recurring Event"]);

            TestCore.log("Getting Recurring Event on 3rd from 3rd");
            TestCore.verifyObject(TestCore.calendarManager.getNextEvent(recurId, new Date("7/3/2012 1:00PM")),
                                  ["startDate", "subject"],
                                  [new Date("7/3/2012 2:00PM"), "Recurring Event"]);

            TestCore.log("Getting Recurring Event on 4th from during");
            TestCore.verifyObject(TestCore.calendarManager.getNextEvent(recurId, new Date("7/4/2012 2:30PM")),
                                  ["startDate", "subject"],
                                  [new Date("7/4/2012 2:00PM"), "Recurring Event"]);

            TestCore.log("Getting Recurring Event on 15th from before single event");
            TestCore.verifyObject(TestCore.calendarManager.getNextEvent(recurId, new Date("7/15/2012 12:00PM")),
                                  ["startDate", "subject"],
                                  [new Date("7/15/2012 2:00PM"), "Recurring Event"]);

            TestCore.log("Getting Single Event on 15th from the 1st");
            TestCore.verifyObject(TestCore.calendarManager.getNextEvent(singleId, new Date("7/1/2012 12:00PM")),
                                  ["startDate", "subject"],
                                  [new Date("7/15/2012 1:00PM"), "Single Event"]);

            ranges.dispose();
            events.dispose();
            
        }
    });
    
})();