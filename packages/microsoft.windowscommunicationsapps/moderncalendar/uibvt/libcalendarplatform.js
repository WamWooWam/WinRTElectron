
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,Microsoft*/

var CalendarPlatformLib = function () {

    var calendarManager = Jx.root._platform.calendarManager;

    return {
    
        /// OWNER: DaLowe
        /// 
        // Add an event to the platform. If props is undefined, will use dummy values.
        addEvent : function (props) {
            var now = new Date();
            var dtNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
            var dtOne = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 13);

            Tx.log("Adding calendar");
            var calendar = calendarManager.defaultCalendar;
            Tx.assert(calendar !== null, "Failed to create calendar");

            Tx.log("Creating Event");
            var event = calendar.createEvent();
            Tx.assert(event !== null, "Failed to create event");
            Tx.assert(0 === event.id, "Event has been committed");

            var uid = event.uid;
            Tx.log("Event UID: " + uid);

            // Add some dummy values by default.
            Tx.log("Populating Event Properties");
            event.subject = "Lunch " + Date.now();
            event.location = "Commons";
            event.startDate = dtNoon;
            event.endDate = dtOne;
            event.meetingStatus = Microsoft.WindowsLive.Platform.Calendar.MeetingStatus.isAMeeting;
            event.reminder = 15;
            event.organizerName = "David";
            event.organizerEmail = "bob@notarealdomain.bang";
            event.dataType = Microsoft.WindowsLive.Platform.Calendar.DataType.mime;
            event.responseRequested = true;
            event.disallowNewTime = true;
            event.data = "Lunch time magic will live forever in this <b>test!</b>";

            // Now, let's override the dummy properties with any specified by the caller.
            if (props) {
                for (var property in props) {
                    event[property] = props[property];
                }
            }

            Tx.log("Committing Event");
            event.commit();

            Tx.assert(0 !== event.id, "Event has not been committed");
            return event;           
        }
    };
}();