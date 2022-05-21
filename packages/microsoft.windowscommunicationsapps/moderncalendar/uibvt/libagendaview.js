
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,WinJS,$,Windows,BVT,Microsoft,UtilitiesLib,CalendarLib,EventDetailsLib,setImmediate*/

/// Helper library for abstracting common UI functionality in Calendar for the Agenda View
var AgendaViewLib = function () {

    /// Private variables
    var _createdEvents = [];
    var _eventCards;
    var _hero;
    var _platformClient;
    var BusyStatus = Microsoft.WindowsLive.Platform.Calendar.BusyStatus;

    /// Private functions

    /// Owner: AdKell
    ///
    /// Compare two events with ordering rules:
    ///     1. Sort by start time
    ///     2. If start times are equal, sort by busy status
    ///     3. If start and busy are equal, sort by end time
    /// If the events appear in order, return a negative value, out of order, return a postive value, equal, return 0
    function compareEvents (event1, event2) {
        if (event2.isSeeMoreCard) {
            // If event2 is the see more card, that's fine because it's at the end
            return -1;
        } else if (event1.isSeeMoreCard) {
            // If event1 is the see more card, any event2 card is out of order
            Tx.log("The See More card should never appear before another card.");
            return 1;
        }

        if (event2.isNoEventCard) {
            // This is not necessarily an error if we are using this method to search
            return 1;
        }

        // Compare start time, ascending
        var startDiff = event1.startDate.getTime() - event2.startDate.getTime();

        if (startDiff !== 0) {
            if (startDiff > 0) {
                Tx.log("Start time out of order;\n  A: " + event1.startDate + "\n  B: " + event2.startDate);
            }

            return startDiff;
        }

        // Compare busy status (Out of Office (3), Busy (2), Tentative (1), Free (0))
        var busyDiff;
        if (event1.isAllDay || event2.isAllDay) {
            busyDiff = 0;
        } else {
            busyDiff = event2.busyStatus - event1.busyStatus;
        }

        if (busyDiff !== 0) {
            if (busyDiff < 0) {
                Tx.log("Busy status out of order");
            }

            return busyDiff;
        }

        // Compare end time, descending
        var endDiff = event2.endDate.getTime() - event1.endDate.getTime();
        if (endDiff < 0) {
            Tx.log("End time out of order;\n  A: " + event1.endDate + "\n  B: " + event2.endDate);
        }

        return endDiff;
    }

    /// Owner: AdKell
    ///
    /// Compare two all day events with ordering rules:
    ///     1. Any split event with a start or end time appears before a true all day event
    ///     2. Sort by start time
    ///     3. Sort by end time
    /// If the events appear in order, return a negative value, out of order, return a postive value, equal, return 0
    function compareAllDayEvents (event1, event2) {

        if (!(AgendaViewLib.isMidnight(event1.startDate) && AgendaViewLib.isMidnight(event2.startDate))) {           // If event1 shows a start time and event2 doesn't
            // Cards are in order
            return -1;
        } else if (!(AgendaViewLib.isMidnight(event2.startDate) && AgendaViewLib.isMidnight(event1.startDate))) {                   // If event2 shows a start time and event1 doesn't
            Tx.assert(false, "Any event with a start time or end time should appear before an all day event on an all day card.");
        } else {
            // Compare start time, ascending
            var startDiff = event1.startDate.getTime() - event2.startDate.getTime();

            if (startDiff !== 0) {
                if (startDiff > 0) {
                    Tx.log("All day event start times out of order;\n  A: " + event1.startDate + "\n  B: " + event2.startDate);
                }
                return startDiff;
            }

            // Compare end time, ascending
            var endDiff = event1.endDate.getTime() - event2.endDate.getTime();
            if (endDiff < 0) {
                Tx.log("All day event end times out of order;\n  A: " + event1.endDate + "\n  B: " + event2.endDate);
            }

            return endDiff;
        }
    }

    /// Owner: AdKell
    ///
    /// Looks for the first element with a specified class name and returns the innerText it if found
    function getFirstElementTextByClass (element, className, elementDescription) {
        var results = $("." + className, element);
        if (results.length < 1) {
            var msg = "Expected to find class: " + className + ", of element: " + elementDescription;
            Tx.log(msg);
            return null;
        }

        return results[0].innerText;
    }

    /// Owner: AdKell
    ///
    /// Parses the text in a Date header and returns the date
    function parseDateHeader (dateHeader) {
        var dataKey = dateHeader.getElementsByClassName('agendaheader')[0].getAttribute('data-key');
        var year = dataKey.substr(0, 4);
        var month = dataKey.substr(4, 2);
        var day = dataKey.substr(6, 2);

        Tx.assert(year && month && day, "Error parsing date header: " + dataKey);
        return new Date(year, month, day);
    }

    /// Owner: AdKell
    ///
    /// Extracts the start or end time string from the timespan shown on an event card
    function extractTimeString (timespan, isEnd) {
        timespan = UtilitiesLib.removeTextMarkers(timespan);
        var timeRangeFormat = Jx.res.getString('AgendaTimeRange');    // "%1 - %2"

        // Extract the middle of the range
        var timeRangeMiddle = timeRangeFormat.replace("%1", "").replace("%2", "");      // " - "

        // Create the regexs for finding the individual times
        var timeRangeRegex;

        if (isEnd) {
            timeRangeRegex = timeRangeFormat.replace("%1", "");      // " - %2"
            timeRangeRegex = timeRangeRegex.replace("%2", ".*");      // " - .*"
        } else {
            timeRangeRegex = timeRangeFormat.replace("%2", "");    // "%1 - "
            timeRangeRegex = timeRangeRegex.replace("%1", ".*");  // ".* - "
        }

        // Extract the time
        var timeRangeMatch = timespan.match(timeRangeRegex);

        if (!Jx.isNullOrUndefined(timeRangeMatch)) {
            return timeRangeMatch[0].replace(timeRangeMiddle, "");  // Should appear as "HH:MM <AM/PM>" or a day of the week
        } else {
            // If there's no match, it should be a zero minute event, which has no " - "
            return timespan;
        }
    }

    /// Owner: AdKell
    ///
    /// Parses a string of the format HH:MM AM/PM, HH:MM, HH AM/PM, or a day of the week
    function parseCardTime (time, date) {
        time = UtilitiesLib.removeTextMarkers(time);
        var hourStart, minuteStart;

        // If there's no colon, we should be checking for a 'dayofweek' or 'hour' format
        if (time.indexOf(":") === -1) {
            var dayFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter('dayofweek');
            var nextDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            var prevDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

            if (time.match(UtilitiesLib.removeTextMarkers(dayFormatter.format(nextDay))) !== null) {
                // Event ends sometime the next day, but this card ends at 12:00 AM on the next day
                return nextDay;
            } else if (time.match(UtilitiesLib.removeTextMarkers(dayFormatter.format(prevDay))) !== null) {
                // Event starts on the previous day, but this card starts at 12:00 AM
                return date;
            } else {
                // Look for a time of the format "6 PM"
                hourStart = parseInt(time.match("\\d{1,2}")[0], 10);   // Finds first 1 or 2 digits
                minuteStart = 0;
            }
        } else {
            // Extract the hour value
            hourStart = parseInt(time.match("\\d{1,2}:")[0].replace(":", ""), 10);   // Finds first 1 or 2 characters followed by ":" and then removes the ":"

            // Extract the minute value
            minuteStart = parseInt(time.match(":\\d{2}")[0].replace(":", ""), 10);   // Finds 2 characters following ":" and then removes the ":"
        }

        // 12:00 AM really is really 0:00
        if (hourStart == 12) {
            hourStart = 0;
        }

        // Adjust the time by 12 hours if it is 'PM'
        var dateFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter('hour minute');
        if (dateFormatter.patterns[0].match("{period.abbreviated}")) {
            var pm = UtilitiesLib.removeTextMarkers(dateFormatter.format(new Date(2013, 0, 1, 13)).split(" ")[1]);              // The localized value of "PM"
            if (time.match(pm)) {
                hourStart = hourStart + 12;
            }
        }

        var dateWithTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hourStart, minuteStart);
        return dateWithTime;
    }

    /// Get all of the event slots for an all day card
    function parseAllDayCard (card, date) {
        var eventSlots = [];
        var allDayEventElements = card.getElementsByClassName('alldayevent');

        for (var i = 0; i < allDayEventElements.length; i++) {
            var eventCard = {};

            // Get the start time if it exists
            var allDayStartTime = getFirstElementTextByClass(allDayEventElements[i], 'starttime');
            if (allDayStartTime !== null) {
                eventCard.startDate = parseCardTime(allDayStartTime, date);
            } else {
                eventCard.startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0);
            }

            eventCard.endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0);

            // Get the subject
            eventCard.subject = getFirstElementTextByClass(allDayEventElements[i], 'subject');
            Tx.assert(eventCard.subject !== null, "All day event subject not found.");

            // Get the handle
            eventCard.handle = allDayEventElements[i].getAttribute('data-handle');
            Tx.assert(eventCard.handle !== null, "All day event handle not found.");

            eventSlots.push(eventCard);
        }

        // TODO (AdKell): Check for "X More" link

        return eventSlots;
    }

    function platformClient () {
        return Jx.root._platform;
    }

    function findEventByProperties (properties) {
        var calendarManager = platformClient().calendarManager;

        // Iterate through each created event and look for a match
        for (var i = 0; i < _createdEvents.length; i++) {
            var event = calendarManager.getEventFromHandle(_createdEvents[i]);
            var foundMatch = true;

            // Check to see if this event is a match
            for (var property in properties) {
                if (property === 'startDate' || property === 'endDate') {
                    // Compare date milliseconds
                    if (event[property].getTime() !== properties[property].getTime()) {
                        foundMatch = false;
                    }
                } else {
                    if (event[property] !== properties[property]) {
                        foundMatch = false;
                        break;
                    }
                }
            }

            // If we found a match, return the event
            if (foundMatch) {
                return event;
            }
        }

        return null;
    }

    /// Owner: AdKell
    ///
    /// Recursively scrolls the list to the next group, then adds that set of events to the _eventCards array.
    function spelunkForEvents (index, groupHeaders, itemContainers) {
        return new WinJS.Promise(function (complete) {
            // Get the group header and all items within that group
            var groupHeader = groupHeaders[index];

            if (groupHeader === undefined || groupHeader.innerHTML === "") {
                // Group header has been removed from view, so shouldn't be evaluated
                complete();
                return;
            }

            var items = itemContainers[index].getElementsByClassName("event");

            // Scroll the list to the front of the group
            var promise = AgendaViewLib.scrollList(groupHeader.offsetLeft);

            // When the list view has re-rendered after scrolling, do this
            promise.done(function () {
                // Add events to _eventCards array
                for (var j = 0; j < items.length; j++) {
                    var eventCard = {};

                    // Save the date header and card html
                    eventCard.dateHeader = groupHeader;
                    eventCard.card = items[j];

                    // If the event card has certain 'info', it's a pillar card
                    var infoClassResult = eventCard.card.getElementsByClassName('info');
                    eventCard.isNoEventCard = false;
                    eventCard.isSeeMoreCard = false;
                    if (infoClassResult.length > 0) {
                        eventCard.info = infoClassResult[0].innerText;
                        var noEvents = Jx.res.getString('AgendaNoEvents');
                        var seeMore = Jx.res.getString('AgendaSeeMoreEvents');

                        if (eventCard.info === noEvents) {
                            eventCard.isNoEventCard = true;
                        } else if (eventCard.info === seeMore) {
                            eventCard.isSeeMoreCard = true;
                        } else {
                            Tx.assert(false, "Unrecognized event card info: " + eventCard.info);
                            continue;
                        }

                        _eventCards.push(eventCard);
                        continue;
                    }

                    var elementDescription = "eventCard:" + j;

                    eventCard.date = parseDateHeader(groupHeader);

                    // Special treatment for all-day cards
                    if (eventCard.card.getElementsByClassName('alldayevent').length > 0) {
                        eventCard.isAllDay = true;
                        eventCard.eventSlots = parseAllDayCard(eventCard.card, eventCard.date);
                        eventCard.startDate = new Date(eventCard.date.getFullYear(), eventCard.date.getMonth(), eventCard.date.getDate());
                        eventCard.endDate = new Date(eventCard.date.getFullYear(), eventCard.date.getMonth(), eventCard.date.getDate() + 1);
                    } else {
                        eventCard.subject = getFirstElementTextByClass(eventCard.card, 'subject', elementDescription);
                        Tx.assert(eventCard.subject !== null, "Event subject not found.");

                        eventCard.busyStatus = BusyStatus[eventCard.card.getAttribute('data-status')];
                        Tx.assert(eventCard.busyStatus !== null, "Event busy status not found.");

                        eventCard.location = getFirstElementTextByClass(eventCard.card, 'location', elementDescription);

                        // Get the timespan displayed on the card
                        var displayedTimespan = getFirstElementTextByClass(eventCard.card, 'timespan', elementDescription);
                        Tx.assert(displayedTimespan !== null, "Event timespan not found.");

                        var glyphElements = eventCard.card.getElementsByClassName('conflict');
                        if (glyphElements.length > 0) {
                            eventCard.hasConflict = true;
                            displayedTimespan = displayedTimespan.replace(glyphElements[0].innerText, "");
                        } else {
                            eventCard.hasConflict = false;
                        }

                        eventCard.isAllDay = false;
                        eventCard.startDate = parseCardTime(extractTimeString(displayedTimespan, false), eventCard.date);
                        eventCard.endDate = parseCardTime(extractTimeString(displayedTimespan, true), eventCard.date);
                        eventCard.handle = eventCard.card.getAttribute('data-handle');
                        Tx.assert(eventCard.handle !== null, "Event handle not found.");
                    }

                    _eventCards.push(eventCard);
                }

                index++;
                if (index < groupHeaders.length) {
                    spelunkForEvents(index, groupHeaders, itemContainers)
                    .then(function () { complete(); }).done();
                } else {
                    complete();
                }
            });
        });
    }

    /// Public functions
    return {
        /// Owner: AdKell
        ///
        /// Fetches all events and pushes them to the _eventCards array
        fetchAllEventCards: function () {
            return new WinJS.Promise(function (complete) {
                var groupHeaders = $(".win-groupheadercontainer");
                var itemContainers = $(".win-itemscontainer");
                var heroContainer = $(".herocontainer");

                Tx.assert(heroContainer.length === 1, "Did not find the hero!");
                _hero = {};
                _hero.card = heroContainer[0];
                _hero.isAllDay = true;
                _hero.startDate = AgendaViewLib.timeFromToday(0, 0, 0);
                _hero.eventSlots = parseAllDayCard(_hero.card, AgendaViewLib.timeFromToday(0, 0, 0));

                // Clear the _eventCards array
                _eventCards = [];

                if (_hero.eventSlots.length > 0) {
                    _eventCards.push(_hero);
                }

                var index = 0;

                // Populate the _eventCards array
                spelunkForEvents(index, groupHeaders, itemContainers)
                .done(function () { complete(); });
            });
        },

        /// Owner: AdKell
        /// 
        /// Verifies the order of every event in the agenda view by first fetching data from all events and then comparing them.
        verifyEventCardOrder: function () {
            return new WinJS.Promise(function (complete) {

                AgendaViewLib.fetchAllEventCards()
                .then(function () {
                    return new WinJS.Promise(function (complete) {

                        // Now that we have all of the events, check the order
                        for (var i = 0; i < _eventCards.length; i++) {
                            var eventCard = _eventCards[i];
                            if (eventCard.isAllDay) {

                                // All day events are sorted within the card
                                for (var j = 0; j < eventCard.eventSlots.length - 1; j++) {
                                    Tx.assert(compareAllDayEvents(eventCard.eventSlots[j], eventCard.eventSlots[j + 1]) <= 0, "All day events " + j +
                                        " and " + (j + 1) + " on card " + i + " are out of order.");
                                }
                            }

                            if (i >= _eventCards.length - 1) {
                                break;
                            }

                            Tx.assert(compareEvents(eventCard, _eventCards[i + 1]) <= 0, "Events " + i + " and " + (i + 1) + " are out of order.");
                        }
                        complete();
                    });
                })
                .done(function () { complete(); });
            });
        },

        /// Owner: AdKell
        /// 
        /// Search our list of events for a matching event
        verifyEventCardExists: function (properties, verificationProperties) {
            return new WinJS.Promise(function (complete) {
                var expectedEvent = {};

                for (var property in properties) {
                    expectedEvent[property] = properties[property];
                }

                expectedEvent.isSeeMoreCard = false;
                expectedEvent.isNoEventCard = false;
                var events;
                var duration = properties.endDate.getTime() - properties.startDate.getTime();

                if (duration < CalendarLib.DAY_IN_MILLISECONDS) {
                    events = AgendaViewLib.findRegularCards(expectedEvent);
                    if (expectedEvent.startDate.getDate() != expectedEvent.endDate.getDate()) {
                        Tx.assert(events.length > 1, "Did not find expected cards for split event \"" + properties.subject + "\" at " + properties.startDate);
                    } else {
                        Tx.assert(events.length > 0, "Did not find expected card for event \"" + properties.subject + "\" at " + properties.startDate);
                    }

                    if (Jx.isDefined(verificationProperties)) {
                        if (!Jx.isNullOrUndefined(verificationProperties.hasConflict)) {
                            Tx.assert(events[0].hasConflict === verificationProperties.hasConflict, verificationProperties.hasConflict ? "Conflict expected." : "Conflict not expected.");
                        }

                        if (!Jx.isNullOrUndefined(verificationProperties.splitCardHasConflict)) {
                            Tx.assert(events[1].hasConflict === verificationProperties.splitCardHasConflict,
                                verificationProperties.splitCardHasConflict ? "Split card conflict expected." : "Split card conflict not expected.");
                        }
                    }
                } else {
                    // Verify all day event cards
                    var daysSpanned = AgendaViewLib.daysSpanned(expectedEvent.startDate, expectedEvent.endDate);
                    Tx.log("Searching for all day event that spans " + daysSpanned + " days.");

                    events = AgendaViewLib.findAllDayCards(expectedEvent);
                    Tx.assert(events.length === daysSpanned, "All day event expected to span " + daysSpanned + ", but " +
                        events.length + " event cards were found.");

                    var startCardFound = false;
                    var otherCardsFound = 0;
                    for (var i = 0; i < daysSpanned; i++) {
                        var event = events[i];

                        for (var j = 0; j < event.eventSlots.length; j++) {
                            if (event.eventSlots[j].subject === expectedEvent.subject) {
                                if (i === 0) {
                                    // If it's the first card and the times match, we found the start card
                                    startCardFound |= event.eventSlots[j].startDate.getTime() === expectedEvent.startDate.getTime();
                                }

                                if (AgendaViewLib.isMidnight(event.eventSlots[j].startDate) && AgendaViewLib.isMidnight(event.eventSlots[j].startDate)) {
                                    // If it's a middle card and starts and ends at midnight, we found a middle card
                                    otherCardsFound++;
                                }
                            }
                        }
                    }

                    Tx.assert(startCardFound, "Start card for event not found!");
                    Tx.assert(otherCardsFound === daysSpanned - 1 || daysSpanned === 1, "Other card(s) not found. Expected: " + (daysSpanned - 1) + " Found: " + otherCardsFound);
                }

                complete();
            });
        },

        /// Owner: AdKell
        /// 
        /// Search our list of events for an event and make sure it does not exist
        verifyEventCardDoesNotExist: function (properties) {
            return new WinJS.Promise(function (complete) {
                var expectedEvent = {};
                
                for (var property in properties) {
                    expectedEvent[property] = properties[property];
                }

                expectedEvent.isSeeMoreCard = false;
                expectedEvent.isNoEventCard = false;

                var events = [];
                events = AgendaViewLib.findRegularCards(expectedEvent);
                if (events.length === 0) {
                    events = AgendaViewLib.findAllDayCards(expectedEvent);
                }

                Tx.assert(events.length === 0, "Did not expect to find event with subject: " + properties.subject);
                complete();
            });
        },

        /// Owner: AdKell
        /// 
        /// Verify the hero date
        verifyHeroDate: function (date) {
            return new WinJS.Promise(function (complete) {
                var heroContainer = $(".herocontainer");

                Tx.assert(heroContainer.length === 1, "Expected to find a hero.");
                var hero = heroContainer[0];
                var dateFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter('dayofweek month day');
                Tx.assert(getFirstElementTextByClass(hero, 'date', true, "Hero date") === dateFormatter.format(date), "Hero date did not match.");

                complete();
            });
        },

        /// Owner: AdKell
        /// 
        /// Search through non-all-day cards for the expected event
        findRegularCards: function (expectedEvent) {

            var foundCards = [];
            var duration = expectedEvent.endDate.getTime() - expectedEvent.startDate.getTime();
            var eventToPush = null;

            if (duration < CalendarLib.DAY_IN_MILLISECONDS) {
                if (expectedEvent.startDate.getDate() != expectedEvent.endDate.getDate()) {
                    // We should expect 2 split cards
                    var expectedCard = {};
                    expectedCard.isAllDay = false;
                    expectedCard.startDate = expectedEvent.startDate;
                    expectedCard.endDate = new Date(expectedEvent.endDate.getFullYear(), expectedEvent.endDate.getMonth(), expectedEvent.endDate.getDate());
                    expectedCard.subject = expectedEvent.subject;
                    expectedCard.busyStatus = expectedEvent.busyStatus;
                    expectedCard.isSeeMoreCard = false;
                    expectedCard.isNoEventCard = false;

                    // Find the first card
                    eventToPush = AgendaViewLib.findCard(expectedCard);
                    if (eventToPush !== null) {
                        foundCards.push(eventToPush);
                    }

                    // Now change the expectedCard to match the times we expect for the second card of the split event
                    expectedCard.startDate = expectedCard.endDate;
                    expectedCard.endDate = expectedEvent.endDate;

                    // Find the second card
                    var splitEventToPush = AgendaViewLib.findCard(expectedCard);
                    if (eventToPush !== null) {
                        foundCards.push(splitEventToPush);
                    }
                } else {
                    eventToPush = AgendaViewLib.findCard(expectedEvent);
                    if (eventToPush !== null) {
                        foundCards.push(eventToPush);
                    }
                }
            }

            return foundCards;
        },

        /// Owner: AdKell
        /// 
        /// Search through all-day cards for the expected event
        findAllDayCards: function (expectedEvent) {
            var foundCards = [];
            var duration = expectedEvent.endDate.getTime() - expectedEvent.startDate.getTime();

            if (duration >= CalendarLib.DAY_IN_MILLISECONDS) {
                var daysSpanned = AgendaViewLib.daysSpanned(expectedEvent.startDate, expectedEvent.endDate);

                for (var i = 0; i < daysSpanned; i++) {
                    var expectedCard = {};
                    expectedCard.isAllDay = true;
                    expectedCard.startDate = new Date(expectedEvent.startDate.getFullYear(), expectedEvent.startDate.getMonth(),
                        expectedEvent.startDate.getDate() + i);
                    expectedCard.isSeeMoreCard = false;
                    expectedCard.isNoEventCard = false;

                    var foundCard = AgendaViewLib.findCard(expectedCard);
                    if (foundCard !== null) {
                        foundCards.push(foundCard);
                    }
                }
            }

            return foundCards;
        },

        /// Owner: AdKell
        ///
        /// Does a binary search within _eventCards for the first card matching an expected card.
        findCard: function (expectedCard) {
            // Binary search for matching event
            var low = 0;
            var high = _eventCards.length - 1;
            if (high < 0) {
                return null;
            }

            while (low <= high) {
                var median = Math.floor((high - low) / 2) + low;
                var card = _eventCards[median];
                var medianDiff;

                if (card.isAllDay && expectedCard.isAllDay) {
                    // Simply check that the dates are the same
                    medianDiff = expectedCard.startDate.getTime() - card.startDate.getTime();
                } else {
                    // Check the card for a match
                    medianDiff = compareEvents(expectedCard, card);
                }

                if (medianDiff === 0 && (expectedCard.isAllDay || card.subject == expectedCard.subject)) {
                    return card;
                } else if (medianDiff > 0) {
                    low = median + 1;
                } else {
                    high = median - 1;
                }
            }

            return null;
        },

        /// Owner: AdKell
        ///
        /// Takes in a start time and end time and tells how many days it spans
        daysSpanned: function (startDate, endDate) {
            var startsOn = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            var endsOn = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            var days = (endsOn.getTime() - startsOn.getTime()) / CalendarLib.DAY_IN_MILLISECONDS;
            if (AgendaViewLib.isMidnight(endDate)) {
                return days;
            } else {
                return days + 1;
            }

        },

        /// Owner: AdKell
        ///
        /// Takes in a date and returns true if it is midnight
        isMidnight: function (time) {
            var midnight = new Date(time.getFullYear(), time.getMonth(), time.getDate());
            return time.getTime() == midnight.getTime();
        },

        /// Owner: AdKell
        ///
        /// Scrolls the list some number of pixels
        scrollList: function (pixels) {
            return new WinJS.Promise(function (complete) {
                var winViewport = $(".agendaview")[0].getElementsByClassName("win-viewport")[0];
                winViewport.scrollLeft = pixels;

                // If scroll position wouldn't change, don't try, complete immediately
                if (pixels >= winViewport.scrollWidth - winViewport.offsetWidth) {
                    setImmediate(function () { complete(); });
                } else {
                    BVT.marks.on("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function () {
                        var winViewport = $(".agendaview")[0].getElementsByClassName("win-viewport")[0];
                        if (winViewport.scrollLeft === pixels || winViewport.scrollWidth === winViewport.offsetWidth) {
                            setImmediate(function () { complete(); });
                        }
                    });
                }

            });
        },

        /// Owner: AdKell
        ///
        /// Returns a date object that is some number of days from today, at HH:MM
        timeFromToday: function (daysFromToday, hour, minute) {
            var today = new Date();
            return new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysFromToday, hour, minute);
        },

        /// Owner: AdKell
        /// 
        /// Returns a the input date with the specified number of minutes added to it
        addMinutes: function (minutes, date) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes() + minutes);
        },

        /// Owner: AdKell
        ///
        /// Searches through the list of events and gets the handle for the matching event
        getHandleForEventCard: function (expectedEvent) {
            if (_hero.handle !== null && _hero.handle !== undefined) {
                if (_hero.subject === expectedEvent.subject) {
                    return _hero.handle;
                }
            }

            var events = [];
            events = AgendaViewLib.findRegularCards(expectedEvent);
            if (events.length !== 0) {
                // It's a regular event, so push the handle
                return events[0].handle;
            } else {
                events = AgendaViewLib.findAllDayCards(expectedEvent);

                if (events.length !== 0) {
                    // It's an all-day event, so iterate the all day slots and push the handle
                    for (var i = 0; i < events[0].eventSlots.length; i++) {
                        if (events[0].eventSlots[i].subject === expectedEvent.subject) {
                            return events[0].eventSlots[i].handle;
                        }
                    }
                }
            }
        },

        /// Owner: AdKell
        ///
        /// Cleans up events that were created during the test
        cleanupEvents: function () {
            var calendarManager = platformClient().calendarManager;
            while (_createdEvents.length > 0) {
                var poppedHandle = _createdEvents.pop();
                var eventToDelete = calendarManager.getEventFromHandle(poppedHandle);

                Tx.assert(Jx.isDefined(eventToDelete), "Event (handle " + poppedHandle + ") was null or undefined upon cleanup.");
                
                eventToDelete.deleteObject();
            }
        },

        /// Owner: AdKell
        ///
        /// Find a matching event and remove it
        removeCreatedEvent: function (properties) {
            return new WinJS.Promise(function (complete) {
                var calendarManager = platformClient().calendarManager;
                var eventHandle;

                var eventToDelete = findEventByProperties(properties);

                Tx.assert(eventToDelete, "Event not found!");
                eventHandle = eventToDelete.handle;

                eventToDelete.deleteObject();
                _createdEvents.splice(_createdEvents.indexOf(eventHandle), 1);

                BVT.marks.on("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function () {
                    if (calendarManager.getEventFromHandle(eventHandle) === null) {
                        setImmediate(function () { complete(); });
                    }
                });
            });
        },

        /// Owner: AdKell
        ///
        /// Find a matching event and change properties
        changeCreatedEvent: function (matchProperties, newProperties) {
            Tx.assert(matchProperties, "Expected to find matchProperties in changeCreatedEvent()");
            Tx.assert(newProperties, "Expected to find newProperties in changeCreatedEvent()");

            return new WinJS.Promise(function (complete) {
                BVT.marks.on("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function () {
                    setImmediate(function () { complete(); });
                });

                var eventToChange = findEventByProperties(matchProperties);

                Tx.assert(eventToChange, "Event not found!");

                for (var property in newProperties) {
                    eventToChange[property] = newProperties[property];
                }

                eventToChange.commit();
            });
        },

        /// Owner: AdKell
        ///
        /// Injects an event into the calendar platform and then adds it to the _createdEvents array for cleanup later
        injectEvent: function (properties) {
            return new WinJS.Promise(function (complete) {
                var duration = properties.endDate.getTime() - properties.startDate.getTime();
                var today = AgendaViewLib.timeFromToday(0, 0, 0);
                var startsOn = new Date(properties.startDate.getFullYear(), properties.startDate.getMonth(), properties.startDate.getDate());
                var endsOn = new Date(properties.endDate.getFullYear(), properties.endDate.getMonth(), properties.endDate.getDate());

                // If the event is >= 24 hours and starts before or on today or ends after or on today, look for a hero change
                if (duration >= CalendarLib.DAY_IN_MILLISECONDS && (startsOn.getTime() === today.getTime() || endsOn.getTime() === today.getTime())) {
                    BVT.marks.once("Calendar:Agenda._updateAllDayHero,StopTM,Calendar", function () {
                        Tx.log("_updateAllDayHero completed for injectEvent.");

                        // Additionally, wait for the queue to empty so we know the view is ready
                        // i.e. has painted
                        BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                            setImmediate(function () { complete(); });
                        });
                    });
                } else {
                    BVT.marks.once("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function () {
                        Tx.log("_listViewLoadingItems completed for injectEvent.");
                        setImmediate(function () { complete(); });
                    });
                }

                var calendar = platformClient().calendarManager.defaultCalendar;

                // Create the event
                var event = calendar.createEvent();

                for (var property in properties) {
                    event[property] = properties[property];
                }

                // Save the event
                event.commit();

                _createdEvents.push(event.handle);
                Tx.log("Injected event with handle: " + event.handle);
            }); // promise
        }, //injectEvent

        /// Owner: AdKell
        ///
        /// Creates an event in app, then adds it to the _createdEvents array for cleanup later
        inAppCreateEvent: function (properties) {
            return new WinJS.Promise(function (complete) {

                CalendarLib.createEvent()
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        
                        // For each property, check that it is valid
                        if (Jx.isDefined(properties.subject)) {
                            EventDetailsLib.title(properties.subject);
                        }

                        if (Jx.isDefined(properties.location)) {
                            EventDetailsLib.location(properties.location);
                        }

                        if (Jx.isDefined(properties.startDate)) {
                            EventDetailsLib.setDateAndTime(properties.startDate, false);
                        }

                        if (Jx.isDefined(properties.endDate)) {
                            EventDetailsLib.setDateAndTime(properties.endDate, true);
                        }

                        if (Jx.isDefined(properties.busyStatus)) {
                            var eventDetailsBusyStatus;

                            // Event Details page busy status enum is different from the platform
                            switch (properties.busyStatus) {
                                case BusyStatus.free:
                                    eventDetailsBusyStatus = EventDetailsLib.busyStatusFree;
                                    break;
                                case BusyStatus.busy:
                                    eventDetailsBusyStatus = EventDetailsLib.busyStatusBusy;
                                    break;
                                case BusyStatus.tentative:
                                    eventDetailsBusyStatus = EventDetailsLib.busyStatusTentative;
                                    break;
                                case BusyStatus.outOfOffice:
                                    eventDetailsBusyStatus = EventDetailsLib.busyStatusOof;
                                    break;
                            }

                            EventDetailsLib.busyStatus(eventDetailsBusyStatus);
                        }

                        setImmediate(function () { complete(); });
                    });
                })
                .then(function () {
                    return new WinJS.Promise(function (complete) {
                        BVT.marks.once("Calendar:Agenda._listViewLoadingItems,StopTM,Calendar", function (s) {
                            Tx.log("Found event " + s);
                            setImmediate(function () { complete(s); });
                        });

                        $("#cedSave").click();
                        Tx.log("Event saved.");
                    });
                })
                .then(function () { return AgendaViewLib.fetchAllEventCards(); })
                .then(function () {
                    // We now have to get the handle of the event that was created and add it to our _createdEvents list
                    return new WinJS.Promise(function (complete) {
                        var expectedEvent = {};

                        for (var property in properties) {
                            expectedEvent[property] = properties[property];
                        }

                        expectedEvent.isSeeMoreCard = false;
                        expectedEvent.isNoEventCard = false;

                        var handle = AgendaViewLib.getHandleForEventCard(expectedEvent);
                        if (handle !== null) {
                            _createdEvents.push(handle);
                            Tx.log("Created event with handle: " + handle);
                        }

                        complete();
                    });
                })
                .done(function () { complete(); });
            });
        }
    };
}();
