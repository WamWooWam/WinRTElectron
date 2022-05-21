
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*jshint browser:true*/
/*global Mail, Jx, Tx, Windows, Microsoft*/

(function () {
    var host = null,
        area = null;

    var globals   = null,
        dataModel = null;

    var message   = null,
        mailResponse    = null,
        meetingResponse = null,
        mail      = null,
        committed = false,
        deleted   = false,
        moved     = false;

    function setup (tc) {
        // save globals and data model
        globals   = Mail.Globals;
        dataModel = Mail.UIDataModel;

        // This line ensures that the mail date formatting functions (Mail.Utilities.shortTimeFormatter, etc) are initialized
        Mail.Utilities.getAbbreviatedDateString(new Date());

        Mail.Utilities.ComposeHelper._selection = {
            account: {inboxView: {}, deletedView: {}},
            moveItemsFrom: function (source, target, messages) {
                Tx.log("moveItemsToDeletedFolder");
                tc.isTrue(Jx.isObject(messages[0]));
                moved = true;
            }
        };

        var originalShortTimeFormatter = Mail.Utilities.shortTimeFormatter,
            originalLongDateFormatter = Mail.Utilities.longDateFormatter;

        tc.cleanup = function () {
            // clean up the invite area
            area.shutdown();
            area = null;

            // clean up the host
            document.body.removeChild(host);
            host = null;

            // restore jx
            Mail.UnitTest.restoreJx();

            // restore globals
            Mail.UIDataModel = dataModel;
            Mail.Globals = globals;

            Mail.Utilities.shortTimeFormatter = originalShortTimeFormatter;
            Mail.Utilities.longDateFormatter = originalLongDateFormatter;
        };

        // mock globals
        Mail.Globals = {
            platform: {
                accountManager: {
                    loadAccount: function(accountId) {
                        Tx.log("loadAccount");
                        tc.areEqual("mockAccountId", accountId, "ID");

                        return {
                            mockedType: Microsoft.WindowsLive.Platform.Account,
                            name:       "mockAccount"
                        };
                    }
                },
                calendarManager: {
                    getEventFromUID: function(account, uid) {
                        Tx.log("getEventFromUID");
                        tc.areEqual("mockAccount", account.name, "Account");

                        if (!uid) {
                            return null;
                        }

                        tc.areEqual("mockUid", uid, "UID");

                        return {
                            commit: function() {},
                            deleteObject: function() {
                                deleted = true;
                            }
                        };
                    }
                },
                invitesManager: {
                    sendMeetingResponse: function (ev, msg, responseReceived, account) {
                        Tx.log("createResponseMail");
                        tc.areEqual(message.calendarEvent, ev, "Event");
                        tc.areEqual("mockAccount", account.name, "Account");

                        meetingResponse = responseReceived;
                    },
                    createResponseMail: function (ev, msg, responseReceived, account) {
                        Tx.log("createResponseMail");
                        tc.areEqual(message.calendarEvent, ev, "Event");
                        tc.areEqual("mockAccount", account.name, "Account");

                        mailResponse = responseReceived;

                        mail = {
                            to: "senderEmail",
                            movedToOutbox: false,
                            commit: function () {
                                committed = true;
                            },
                            moveToOutbox: function () {
                                this.movedToOutbox = true;
                            }
                        };
                        return mail;
                    }
                }
            }
        };

        var selection = {
            deleteItems: function (messages) {
                Tx.log("moveItemsToDeletedFolder");
                tc.isTrue(Jx.isObject(messages[0]));
                moved = true;
            }
        };

        // set up stubs
        Mail.UnitTest.stubJx(tc, "res");
        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "bici");
        Mail.UnitTest.setupStubs();
        Mail.UnitTest.setupFormatStubs();
        Mail.UnitTest.setupCalendarStubs();

        // This code forces the DateTime formatters to use expected settings so that we can verify results
        var DateTimeFormatter = Windows.Globalization.DateTimeFormatting.DateTimeFormatter;
        var CalendarIdentifiers = Windows.Globalization.CalendarIdentifiers;
        var ClockIdentifiers = Windows.Globalization.ClockIdentifiers;

        Mail.Utilities.shortTimeFormatter = new DateTimeFormatter("shorttime", ["en-US"], "US", CalendarIdentifiers.gregorian, ClockIdentifiers.twelveHour);
        Mail.Utilities.longDateFormatter = new DateTimeFormatter("{dayofweek.full}, {month.full} {day.integer(1)}, {year.full}", ["en-US"], "US", CalendarIdentifiers.gregorian, ClockIdentifiers.twelveHour);

        // set up our host
        host = document.createElement("div");
        host.classList.add("hidden");
        document.body.appendChild(host);

        // set up the invite area
        area = new Mail.CalendarInviteArea(selection);
        area.initialize(host, []);
   }

    Tx.test("CalendarInviteArea_UnitTest.test_Shown", function (tc) {
        /// <summary>
        /// Verifies whether the entire calendar invite area is shown for various types of messages
        /// </summary>
        setup(tc);

        var CalendarMessageType = Microsoft.WindowsLive.Platform.CalendarMessageType;
        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                startDate: new Date(),
                endDate:   new Date()
            }
        };

        var i = 0;

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.none;
        area.setMessage(message);

        tc.isTrue(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.request;
        area.setMessage(message);

        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.responseAccepted;
        area.setMessage(message);

        Tx.log(message.calendarMessageType.toString());
        Tx.log(host.className);
        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.responseTentative;
        area.setMessage(message);

        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.responseDeclined;
        area.setMessage(message);

        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.cancelled;
        area.setMessage(message);

        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarMessageType = CalendarMessageType.request;
        message.isOutboundFolder    = true;
        area.setMessage(message);

        tc.isFalse(host.classList.contains("hidden"), (i++).toString());

        host.classList.add("hidden");
        message.calendarEvent = null;
        area.setMessage(message);

        tc.isTrue(host.classList.contains("hidden"), (i++).toString());
    });

    Tx.test("CalendarInviteArea_UnitTest.test_Where", function (tc) {
        setup(tc);

        var label = host.querySelector(".calendarInviteWhereContent");
        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                startDate: new Date(),
                endDate:   new Date()
            }
        };

        message.calendarEvent.location = "In My Office";
        area.setMessage(message);

        tc.areEqual(message.calendarEvent.location, label.innerText);

        message.calendarEvent.location = "Over There";
        area.setMessage(message);

        tc.areEqual(message.calendarEvent.location, label.innerText);
    });

    function stripLtrMarkers(s) {
        return s.replace(/\u200E/g, "");
    }

    Tx.test("CalendarInviteArea_UnitTest.test_When", function (tc) {
        setup(tc);

        var label = host.querySelector(".calendarInviteWhenContent");
        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event
            }
        };

        message.calendarEvent.startDate = new Date("8/8/2012");
        message.calendarEvent.endDate = new Date("8/9/2012");
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 12:00 AM to Thursday, August 9, 2012 12:00 AM", stripLtrMarkers(label.innerText));

        message.calendarEvent.allDayEvent = true;
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 All day", stripLtrMarkers(label.innerText));

        message.calendarEvent.endDate = new Date("8/9/2012 12:00pm");
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 to Thursday, August 9, 2012", stripLtrMarkers(label.innerText));

        message.calendarEvent.allDayEvent = false;
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 12:00 AM to Thursday, August 9, 2012 12:00 PM", stripLtrMarkers(label.innerText));

        message.calendarEvent.endDate = new Date("8/8/2012 12:00pm");
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 12:00 AM - 12:00 PM", stripLtrMarkers(label.innerText));

        message.calendarEvent.startDate = new Date("8/8/2012 12:00pm");
        area.setMessage(message);

        tc.areEqual("Wednesday, August 8, 2012 12:00 PM", stripLtrMarkers(label.innerText));
    });

    Tx.test("CalendarInviteArea_UnitTest.test_Recurrence", function (tc) {
        setup(tc);

        var icon = host.querySelector(".calendarInviteRecurrence");
        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                startDate: new Date(),
                endDate:   new Date()
            }
        };

        Tx.log("Not Recurring");
        area.setMessage(message);

        tc.isTrue(icon.classList.contains("hidden"), "Icon");

        Tx.log("Recurring");
        message.calendarEvent.recurring = true;
        area.setMessage(message);

        tc.isFalse(icon.classList.contains("hidden"), "Icon");
    });

    Tx.test("CalendarInviteArea_UnitTest.test_ButtonsShown", function (tc) {
        /// <summary>
        /// Verifies that the correct buttons are shown for various types of messages
        /// </summary>
        setup(tc);

        var CalendarMessageType = Microsoft.WindowsLive.Platform.CalendarMessageType,
            MeetingMessageType  = Microsoft.WindowsLive.Platform.Calendar.MeetingMessageType,
            buttons             = host.querySelector(".calendarInviteButtons");

        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                startDate: new Date(),
                endDate:   new Date(),
                responseRequested: true,
                meetingMessageType: MeetingMessageType.none,
            }
        };

        Tx.log("Request");
        message.calendarMessageType = CalendarMessageType.request;
        area.setMessage(message);

        tc.isFalse(buttons.classList.contains("hidden"), "Buttons");

        Tx.log("Junk");
        message.isJunk = true;
        area.setMessage(message);

        tc.isTrue(buttons.classList.contains("hidden"), "Buttons");

        Tx.log("Outbound");
        message.isJunk           = false;
        message.isOutboundFolder = true;
        area.setMessage(message);

        tc.isTrue(buttons.classList.contains("hidden"), "Buttons");

        var accept    = host.querySelector(".calendarInviteAccept"),
            tentative = host.querySelector(".calendarInviteTentative"),
            decline   = host.querySelector(".calendarInviteDecline"),
            respond   = host.querySelector(".calendarInviteRespond"),
            remove    = host.querySelector(".calendarInviteRemove"),
            status    = host.querySelector(".calendarInviteStatus");

        Tx.log("Not Junk, Not Outbound");
        message.isJunk           = false;
        message.isOutboundFolder = false;
        area.setMessage(message);

        tc.isFalse(accept.classList.contains("hidden"), "Accept");
        tc.isFalse(tentative.classList.contains("hidden"), "Tentative");
        tc.isFalse(decline.classList.contains("hidden"), "Decline");
        tc.isFalse(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Initial Request");
        message.calendarEvent.meetingMessageType = MeetingMessageType.initialRequest;
        area.setMessage(message);

        tc.isFalse(accept.classList.contains("hidden"), "Accept");
        tc.isFalse(tentative.classList.contains("hidden"), "Tentative");
        tc.isFalse(decline.classList.contains("hidden"), "Decline");
        tc.isFalse(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Full Update");
        message.calendarEvent.meetingMessageType = MeetingMessageType.fullUpdate;
        area.setMessage(message);

        tc.isFalse(accept.classList.contains("hidden"), "Accept");
        tc.isFalse(tentative.classList.contains("hidden"), "Tentative");
        tc.isFalse(decline.classList.contains("hidden"), "Decline");
        tc.isFalse(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Informational Update");
        message.calendarEvent.meetingMessageType = MeetingMessageType.informationalUpdate;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isFalse(status.classList.contains("hidden"), "Status");
        tc.areEqual("Event details updated. No response needed.", status.innerText, "Status");

        Tx.log("Outdated");
        message.calendarEvent.meetingMessageType = MeetingMessageType.outdated;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isFalse(status.classList.contains("hidden"), "Status");
        tc.areEqual("This invitation is outdated.", status.innerText, "Status");

        Tx.log("Delegator Copy");
        message.calendarEvent.meetingMessageType = MeetingMessageType.delegatorCopy;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isFalse(status.classList.contains("hidden"), "Status");
        tc.areEqual("This invitation was also sent to your delegate.", status.innerText, "Status");

        Tx.log("Delegate Copy");
        message.calendarEvent.meetingMessageType = MeetingMessageType.delegateCopy;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isFalse(status.classList.contains("hidden"), "Status");
        tc.areEqual("This is a delegated invitation.", status.innerText, "Status");

        Tx.log("No Response");
        message.calendarEvent.meetingMessageType = MeetingMessageType.none;
        message.calendarEvent.responseRequested = false;
        area.setMessage(message);

        tc.isFalse(accept.classList.contains("hidden"), "Accept");
        tc.isFalse(tentative.classList.contains("hidden"), "Tentative");
        tc.isFalse(decline.classList.contains("hidden"), "Decline");
        tc.isFalse(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isFalse(status.classList.contains("hidden"), "Status");
        tc.areEqual("The organizer hasn't requested a response.", status.innerText, "Status");

        message.calendarEvent.responseRequested = true;

        Tx.log("Accept");
        message.calendarMessageType = CalendarMessageType.responseAccept;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Tentative");
        message.calendarMessageType = CalendarMessageType.responseTentative;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Decline");
        message.calendarMessageType = CalendarMessageType.responseDecline;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isTrue(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("Cancel");
        message.calendarMessageType = CalendarMessageType.cancelled;
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isFalse(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");

        Tx.log("With UID");
        message.calendarEvent.uid = "mockUid";
        area.setMessage(message);

        tc.isTrue(accept.classList.contains("hidden"), "Accept");
        tc.isTrue(tentative.classList.contains("hidden"), "Tentative");
        tc.isTrue(decline.classList.contains("hidden"), "Decline");
        tc.isTrue(respond.classList.contains("hidden"), "Respond");
        tc.isFalse(remove.classList.contains("hidden"), "Remove");
        tc.isTrue(status.classList.contains("hidden"), "Status");
    });

    Tx.test("CalendarInviteArea_UnitTest.test_Actions", function (tc) {
        /// <summary>
        /// Verifies behavior for the various button clicks / menu items
        /// </summary>
        setup(tc);

        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                uid: "mockUid",
                startDate: new Date(),
                endDate:   new Date(),
                organizerEmail: "organizer@email.com",
                isEventTypeValid: true
            }
        };

        Mail.UIDataModel = {
            FolderCache: {
                getPlatformFolder: function(account, folderType) {
                    Tx.log("getPlatformSpecialFolder");
                    tc.areEqual("mockAccount", account.name, "Account");

                    return {
                        specialMailFolderType: folderType
                    };
                }
            }
        };
        var ResponseType = Microsoft.WindowsLive.Platform.Calendar.ResponseType;

        area.setMessage(message);

        Tx.log("Accept, Don't Send");
        committed = false;
        deleted = false;
        moved = false;
        area._respondToInvite(ResponseType.accepted, false);

        tc.areEqual(ResponseType.accepted, meetingResponse, "meetingResponse");
        tc.isNull(mailResponse, "mailResponse");
        tc.isFalse(committed, "Committed");
        tc.isFalse(deleted, "Deleted");
        tc.isTrue(moved, "Moved");

        Tx.log("Tentative, Don't Send");
        committed = false;
        deleted = false;
        moved = false;
        area._respondToInvite(ResponseType.tentative, false);

        tc.areEqual(ResponseType.tentative, meetingResponse, "meetingResponse");
        tc.isNull(mailResponse, "mailResponse");
        tc.isFalse(committed, "Committed");
        tc.isFalse(deleted, "Deleted");
        tc.isTrue(moved, "Moved");

        Tx.log("Declined, Don't Send");
        committed = false;
        deleted = false;
        moved = false;
        area._respondToInvite(ResponseType.declined, false);

        tc.areEqual(ResponseType.declined, meetingResponse, "meetingResponse");
        tc.isNull(mailResponse, "mailResponse");
        tc.isFalse(committed, "Committed");
        tc.isTrue(deleted, "Deleted");
        tc.isTrue(moved, "Moved");

        Tx.log("Tentative, Send");
        committed = false;
        deleted = false;
        moved = false;
        area._respondToInvite(ResponseType.tentative, true);

        tc.areEqual(ResponseType.tentative, meetingResponse, "meetingResponse");
        tc.areEqual(ResponseType.tentative, mailResponse, "mailResponse");
        tc.isTrue(mail.movedToOutbox, "Mail Folder");
        tc.isTrue(committed, "Committed");
        tc.isFalse(deleted, "Deleted");
        tc.isTrue(moved, "Moved");

        Tx.log("Accept, Send, no response requested");
        mailResponse = null;
        committed = false;
        deleted = false;
        moved = false;
        area._respondToInvite(ResponseType.accepted, true);

        tc.areEqual(ResponseType.accepted, meetingResponse, "meetingResponse");
        tc.isFalse(deleted, "Deleted");

        Tx.log("Remove");
        committed = false;
        deleted = false;
        moved = false;
        area._onRemove();

        tc.isFalse(committed, "Committed");
        tc.isTrue(deleted, "Deleted");
        tc.isTrue(moved, "Moved");
    });

    Tx.test("CalendarInviteArea_UnitTest.test_ViewCalendar", function (tc) {
        setup(tc);

        var start = new Date("8/8/2012 8:00am"),
            end   = new Date("8/8/2012 8:00pm"),
            nextStart = new Date("9/9/2012 9:00am"),
            nextEnd   = new Date("9/9/2012 9:00pm");

        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.cancelled,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                uid: "mockUid",
                startDate:   start,
                endDate:     end,
                allDayEvent: false
            }
        };

        area.setMessage(message);

        // mock out the launch function
        var launchUri = area._launchUri,
            uri;

        area._launchUri = function(receivedUri) {
            uri = receivedUri;
        };

        // call the view calendar code
        area._onViewCalendar();
        
        tc.areEqual("wlcalendar://focusEvent/?start=" + start.getTime() + "&end=" + end.getTime() + "&allDay=false", uri.rawUri);

        Mail.Globals.platform.calendarManager.getEventFromUID = function() {
            return {id:"testID"};
        };
        Mail.Globals.platform.calendarManager.getNextEvent = function (id) {
            tc.areEqual(id, "testID");
            return {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                uid: "mockUid",
                startDate:   nextStart,
                endDate:     nextEnd,
                allDayEvent: false
            };
        };
        area._message.calendarEvent.eventType = Microsoft.WindowsLive.Platform.Calendar.EventType.series;

        // call the view calendar code
        area._onViewCalendar();
        area._launchUri = launchUri;
        
        tc.areEqual("wlcalendar://focusEvent/?start=" + nextStart.getTime() + "&end=" + nextEnd.getTime() + "&allDay=false", uri.rawUri);
    });


    Tx.test("CalendarInviteArea_UnitTest.test_getRealEvent", function (tc) {
        setup(tc);

        var oldPlatform = Mail.Globals.platform;

        Mail.Globals.platform = {
            calendarManager:{
                getEventFromUID: function (account, uid) {
                    if (uid === "testUID") {
                        return {
                            getOccurrence:function(startDate) {
                                return startDate === "TestStartDate";
                            }
                        };
                    } else {
                        return null;
                    }
                } 
            }
        };

        // This one statement verifies that _getRealEvent got the "real" event from the platform and then returned that event's occurance.
        tc.isTrue(area._getRealEvent(
            {mockedType:Microsoft.WindowsLive.Platform.Account},
            {mockedType:Microsoft.WindowsLive.Platform.Calendar.Event, uid:"testUID", startDate:"TestStartDate", eventType:Microsoft.WindowsLive.Platform.Calendar.EventType.instanceOfSeries, isEventTypeValid:true}));

        Mail.Globals.platform = oldPlatform;
    });

    Tx.test("CalendarInviteArea_UnitTest.test_getRealEventWithInvalidEventType", function (tc) {
        setup(tc);

        var oldPlatform = Mail.Globals.platform;

        // make sure that if the event type is determined to be invalid (not specified by server), that
        // we return null instead of an actual event
        tc.isNull(area._getRealEvent(
            { mockedType:Microsoft.WindowsLive.Platform.Account },
            { mockedType:Microsoft.WindowsLive.Platform.Calendar.Event, uid:"testUID", startDate:"TestStartDate", eventType:Microsoft.WindowsLive.Platform.Calendar.EventType.single, isEventTypeValid:false }));

        Mail.Globals.platform = oldPlatform;
    });

    Tx.test("CalendarInviteArea_UnitTest.test_onRespond", function (tc) {
        setup(tc);

        var start = new Date("8/8/2012 8:00am"),
            end   = new Date("8/8/2012 8:00pm");

        message = {
            mockedType: Mail.UIDataModel.MailMessage,
            accountId: "mockAccountId",
            account: {
                mockedType: Mail.Account,
                platformObject: Mail.Globals.platform.accountManager.loadAccount("mockAccountId")
            },
            calendarMessageType: Microsoft.WindowsLive.Platform.CalendarMessageType.request,
            calendarEvent: {
                mockedType: Microsoft.WindowsLive.Platform.Calendar.Event,
                uid: "mockUid",
                responseRequested:true,
                startDate:   start,
                endDate:     end
            },
            folderId: "mockFolderId"
        };

        area.setMessage(message);
        var respondCalled = false,
            showFlyoutCalled = false;

        area._showResponseFlyout = function() {respondCalled = true;};
        area._respondToInvite = function() {showFlyoutCalled = true;};
        
        var evt = document.createEvent("KeyboardEvent");
        
        area._onTentative(evt);
        tc.isTrue(respondCalled, "_onTenative, with responseRequested, did not set respondCalled");
        tc.isFalse(showFlyoutCalled, "_onTenative, with responseRequested, set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._onDecline(evt);
        tc.isTrue(respondCalled, "_onDecline, with responseRequested, did not set respondCalled");
        tc.isFalse(showFlyoutCalled, "_onDecline, with responseRequested, set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._message.calendarEvent.responseRequested = false;

        area._onTentative(evt);
        tc.isFalse(respondCalled, "_onTenative, without responseRequested, set respondCalled");
        tc.isTrue(showFlyoutCalled, "_onTenative, without responseRequested, did not set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._onDecline(evt);
        tc.isFalse(respondCalled, "_onDecline, without responseRequested, set respondCalled");
        tc.isTrue(showFlyoutCalled, "_onDecline, without responseRequested, did not set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        var oldGuiState = Mail.guiState;
        Mail.guiState = {
            isThreePane:true,
            isReadingPaneVisible:true
        };

        area._onKeyDown({altKey:true, key:"c"});
        tc.isTrue(respondCalled, "alt+c did not set responseCalled");
        tc.isFalse(showFlyoutCalled, "alt+c set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._onKeyDown({altKey:true, key:"t"});
        tc.isTrue(respondCalled, "alt+t did not set responseCalled");
        tc.isFalse(showFlyoutCalled, "alt+t set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._onKeyDown({altKey:true, key:"d"});
        tc.isTrue(respondCalled, "alt+d did not set responseCalled");
        tc.isFalse(showFlyoutCalled, "alt+d set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        area._onKeyDown({altKey:true, key:"e"});
        tc.isFalse(respondCalled, "alt+e set responseCalled");
        tc.isFalse(showFlyoutCalled, "alt+e set showFlyoutCalled");
        respondCalled = false;
        showFlyoutCalled = false;

        Mail.guiState = oldGuiState;
    });

})();
