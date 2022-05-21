
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Tx,TestCore,Microsoft*/

(function () {

    // testRetrieval simply verifies that we have successfully retrieved the platform objects
    // we require for the other tests, namely the Platform.Client object, the CalendarManager, and
    // the AccountManager
    Tx.test("CalendarTests.testRetrieval", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
        
            TestCore.log("Verifying Platform");
            tc.isNotNull(TestCore.platform, "Failed to retrieve Platform.Client object");
            
            TestCore.log("Verifying CalendarManager");
            tc.isNotNull(TestCore.calendarManager, "Failed to retrieve CalendarManager object");
            
            TestCore.log("Verifying AccountManager");
            tc.isNotNull(TestCore.accountManager, "Failed to retrieve AccountManager object");

            TestCore.log("Verifying Default Account");
            tc.isNotNull(TestCore.defaultAccount, "Failed to retrieve Default Account");
        }   
    });

    // testSimpleCalendars verifies we can create and retrieve calendars for a single account
    Tx.test("CalendarTests.testSimpleCalendars", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding calendar");
            var calendar = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar");
            tc.isNotNull(calendar, "Failed to create calendar");
            tc.isTrue(calendar.canEdit, "Calendar should be edittable");
            tc.isFalse(calendar.canDelete, "Calendar should not be deletable");

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar"]);        

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should be Null");

            TestCore.log("Adding second calendar");
            var calendar2 = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar2");
            tc.isNotNull(calendar2, "Failed to create calendar");

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar", "Calendar2"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should be Null");

            TestCore.log("Adding default calendar");
            var calendar3 = TestCore.calendarManager.addDefaultCalendar(TestCore.defaultAccount, "Default Calendar");
            tc.isNotNull(calendar3, "Failed to create calendar");

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            var defaultCalendar = TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount);
            tc.isNotNull(defaultCalendar, "Default Calendar should not be null");
            tc.areEqual("Default Calendar", defaultCalendar.name, "Default Calendar should be the default calendar");
            tc.isTrue(defaultCalendar.isDefault, "Default Calendar should be marked as default");
            
        }        
    });

    // testDefaultCalendar verifies we create the application default calendar appropriately on demand
    Tx.test("CalendarTests.testDefaultCalendar", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), []);        

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), []);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default calendar should not be null");

            TestCore.log("Getting Default Calendar");
            var defaultCalendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(defaultCalendar, "Failed to retieve default calendar");

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), [""]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), [""]);

            TestCore.log("Verifying defaultCalendarForAccount");
            var retrievedCalendar = TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount);
            tc.isNotNull(retrievedCalendar, "Default calendar should not be null");
            tc.areEqual(defaultCalendar.id, retrievedCalendar.id, "Default for account is not the same as default");

            TestCore.log("Getting Default Calendar (Again)");
            var defaultCalendar2 = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(defaultCalendar2, "Default calendar should not be null");
            tc.areEqual(defaultCalendar.id, defaultCalendar2.id, "New default is not the same as original default");
            
        }        
    });

    // testMultipleAccounts verifies that we can create and retrieve account specific calendars for multiple accounts
    /* Disabled due to intermittent failures, PS 474256 

    Tx.test("CalendarTests.testMultipleAccounts", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {
                        
            TestCore.log("Creating Account 1");
            var account1 = TestCore.accountManager.getAccountBySourceId("LOCAL", "").createConnectedAccount("account1@calendarmanager.test");
            tc.isNotNull(account1, "Failed to create Account 1");
            account1.commit();

            TestCore.log("Creating Account 2");
            var account2 = TestCore.accountManager.getAccountBySourceId("LOCAL", "").createConnectedAccount("account2@calendarmanager.test");
            tc.isNotNull(account2, "Failed to create Account 2");
            account2.commit();

            TestCore.log("Adding Calendar1 for Account1");
            var calendar1 = TestCore.calendarManager.addCalendar(account1, "Calendar1");
            tc.isNotNull(calendar1, "Failed to create Calendar1");

            TestCore.log("Adding Calendar2 for Account2");
            var calendar2 = TestCore.calendarManager.addCalendar(account2, "Calendar2");
            tc.isNotNull(calendar2, "Failed to create Calendar2");

            TestCore.log("Adding Default Calendar for Account1");
            var default1 = TestCore.calendarManager.addDefaultCalendar(account1, "DefaultCalendar1");
            tc.isNotNull(default1, "Failed to create DefaultCalendar1");

            TestCore.log("Adding Default Calendar for Account2");
            var default2 = TestCore.calendarManager.addDefaultCalendar(account2, "DefaultCalendar2");
            tc.isNotNull(default1, "Failed to create DefaultCalendar2");

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar1", "Calendar2", "DefaultCalendar1", "DefaultCalendar2"]);        

            TestCore.log("Verifying allCalendarsForAccount for default account");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), []);

            TestCore.log("Verifying allCalendarsForAccount for Account1");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(account1), ["Calendar1", "DefaultCalendar1"]);

            TestCore.log("Verifying allCalendarsForAccount for Account2");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(account2), ["Calendar2", "DefaultCalendar2"]);

            TestCore.log("Verifying Default Calendar for Account1");
            default1 = TestCore.calendarManager.getDefaultCalendarForAccount(account1);
            tc.isNotNull(default1, "Failed to retrieve default calendar for account1");
            tc.areEqual("DefaultCalendar1", default1.name, "Name should be DefaultCalendar1");
            tc.isTrue(default1.isDefault, "DefaultCalendar1 should be marked default");
            
            TestCore.log("Verifying Default Calendar for Account2");
            default1 = TestCore.calendarManager.getDefaultCalendarForAccount(account2);
            tc.isNotNull(default2, "Failed to retrieve default calendar for account2");
            tc.areEqual("DefaultCalendar2", default2.name, "Name should be DefaultCalendar2");
            tc.isTrue(default2.isDefault, "DefaultCalendar2 should be marked default");
            
        }
    });*/

    // testCalendarCapabilities verifies that we receive the expected set of capabilities for each server version
    Tx.test("CalendarTests.testCalendarCapabilities", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Getting Default Calendar");
            var defaultCalendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(defaultCalendar, "Failed to retieve default calendar");

            TestCore.log("Retrieving Server Version to restore at end of test");
            var oldVersion = defaultCalendar.getServerVersion();
            TestCore.log("Old Version: " + oldVersion);

            var expected = Microsoft.WindowsLive.Platform.Calendar.ServerCapability.canRespond | 
                           Microsoft.WindowsLive.Platform.Calendar.ServerCapability.canCancel;

            TestCore.log("Verifying with no version");
            defaultCalendar.setServerVersion("");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"no version\"");

            TestCore.log("Verifying with \"2.5\"");
            defaultCalendar.setServerVersion("2.5");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"2.5\"");

            expected = expected | 
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.htmlBody |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.attendeeType |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.attendeeStatus;

            TestCore.log("Verifying with \"12.0\"");
            defaultCalendar.setServerVersion("12.0");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"12.0\"");

            TestCore.log("Verifying with \"12.1\"");
            defaultCalendar.setServerVersion("12.1");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"12.1\"");

            expected = expected | 
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.calendarType |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.leapMonth |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.responseRequested |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.disallowNewTimeProposal |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.appointmentReplyTime |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.responseType |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.attendeesInExceptions;

            TestCore.log("Verifying with \"14.0\"");
            defaultCalendar.setServerVersion("14.0");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"14.0\"");

            expected = expected |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.firstDayOfWeek |
                       Microsoft.WindowsLive.Platform.Calendar.ServerCapability.meetingResponseCommandOnEvent;

            TestCore.log("Verifying with \"14.1\"");
            defaultCalendar.setServerVersion("14.1");
            TestCore.waitForPropertyValue(TestCore.defaultWait,
                                          defaultCalendar,
                                          "capabilities",
                                          expected);
            tc.areEqual(expected, defaultCalendar.capabilities, "Unexpected capabilities on \"14.1\"");

            TestCore.log("Restoring Original Server Version");
            defaultCalendar.setServerVersion(oldVersion);
            
        }
    });

    // testCalendarCapabilities verifies that we receive the expected set of capabilities for each server version
    Tx.test("CalendarTests.testCalendarReadOnly", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Getting Default Calendar");
            var defaultCalendar = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(defaultCalendar, "Failed to retieve default calendar");

            tc.areEqual("", defaultCalendar.permission, "Permission should be empty by default");
            tc.isFalse(defaultCalendar.readOnly, "Empty permission should not be read only");

            TestCore.log("FreeBusy (0)");
            defaultCalendar.permission = "0";
            tc.isTrue(defaultCalendar.readOnly, "FreeBusy (0) should be ready only");

            TestCore.log("LimitedDetails (10)");
            defaultCalendar.permission = "10";
            tc.isTrue(defaultCalendar.readOnly, "LimitedDetails should be ready only");

            TestCore.log("Read (20)");
            defaultCalendar.permission = "20";
            tc.isTrue(defaultCalendar.readOnly, "Read (20) should be ready only");

            TestCore.log("ReadWrite (30)");
            defaultCalendar.permission = "30";
            tc.isFalse(defaultCalendar.readOnly, "ReadWrite (30) should not be ready only");

            TestCore.log("CoOwner (40)");
            defaultCalendar.permission = "40";
            tc.isFalse(defaultCalendar.readOnly, "CoOwner (40) should not be ready only");

            TestCore.log("Owner (50)");
            defaultCalendar.permission = "50";
            tc.isFalse(defaultCalendar.readOnly, "Owner (50) should not be ready only");
        }
    });

    // testEnumerateAllCalendars verifies enumeration behavior even when calendars are marked as deleted
    Tx.test("CalendarTests.testEnumerateAllCalendars", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding test calendars");
            var calendar = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar2");
            TestCore.calendarManager.addDefaultCalendar(TestCore.defaultAccount, "Default Calendar");
            var defaultCalendar = TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount);
            
            // 3 calendars, the third of which is the default
            // make the first 1 hidden and make sure it vanishes from both common enum calls
            TestCore.log("Delete Calendar");
            calendar.underDeletedItems = true;
            calendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount, true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNotNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should NOT be Null");

            // unhide it and see if it returns
            TestCore.log("Un-delete Calendar");
            calendar.underDeletedItems = false;
            calendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount, true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNotNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should NOT be Null");

            // hide the default. it should not enumerate, but it should be retrievable
            TestCore.log("Delete Default Calendar");
            defaultCalendar.underDeletedItems = true;
            defaultCalendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount, true), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Query method should return null");
            var default2 = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(default2, "Property access must not return null");
            tc.isTrue(defaultCalendar.id == default2.id, "Returned calendar must be the same instance");

            // let the default be visible again (otherwise tests can't clean up)
            // TestCore.log("Un-delete Default Calendar");
            // defaultCalendar.underDeletedItems = false;
            // defaultCalendar.commit();
            // TestCore.log("Verifying allCalendars");
            // TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2", "Default Calendar"]);
            
        }        
    });

    // testEnumerateDeletedCalendars verifies enumeration behavior for when calendars are deleted via Deleted Items
    Tx.test("CalendarTests.testEnumerateDeletedCalendars", function (tc) {

        TestCore.setupTest(tc);

        if (TestCore.verifyHostedInWwa()) {

            TestCore.log("Adding test calendars");
            var calendar = TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar");
            TestCore.calendarManager.addCalendar(TestCore.defaultAccount, "Calendar2");
            TestCore.calendarManager.addDefaultCalendar(TestCore.defaultAccount, "Default Calendar");
            var defaultCalendar = TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount);
            
            // 3 calendars, the third of which is the default
            // make the first 1 hidden and make sure it vanishes from both common enum calls
            TestCore.log("Delete Calendar");
            calendar.underDeletedItems = true;
            calendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNotNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should NOT be Null");

            // unhide it and see if it returns
            TestCore.log("Un-delete Calendar");
            calendar.underDeletedItems = false;
            calendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar", "Calendar2", "Default Calendar"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNotNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Default Calendar Should NOT be Null");

            // hide the default. it should not enumerate, but it should be retrievable
            TestCore.log("Delete Default Calendar");
            defaultCalendar.underDeletedItems = true;
            defaultCalendar.commit();

            TestCore.log("Verifying allCalendars");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2"]);

            TestCore.log("Verifying allCalendarsForAccount");
            TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendarsForAccount(TestCore.defaultAccount), ["Calendar", "Calendar2"]);

            TestCore.log("Verifying defaultCalendarForAccount");
            tc.isNull(TestCore.calendarManager.getDefaultCalendarForAccount(TestCore.defaultAccount), "Query method should return null");
            var default2 = TestCore.calendarManager.defaultCalendar;
            tc.isNotNull(default2, "Property access must not return null");
            tc.isTrue(defaultCalendar.id == default2.id, "Returned calendar must be the same instance");

            // let the default be visible again (otherwise tests can't clean up)
            // TestCore.log("Un-delete Default Calendar");
            // defaultCalendar.underDeletedItems = false;
            // defaultCalendar.commit();
            // TestCore.log("Verifying allCalendars");
            // TestCore.verifyCalendars(TestCore.calendarManager.getAllCalendars(), ["Calendar", "Calendar2", "Default Calendar"]);
            
        }        
    });

    
})();