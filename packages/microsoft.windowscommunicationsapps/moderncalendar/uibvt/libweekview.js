
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global $,WinJS,Jx,Tx,".timelineScroller", Debug.view._host,BVT,TestApplication,EventDetailsLib,UtilitiesLib*/

var WeekViewLib = function () {

    return {
        /// OWNER: t-niravn
        /// verifies if the current week view crosses the month or not
        weekViewCrossesMonth: function () {
            var currentView = CalendarLib.getCurrentView();
            var headerText = WeekViewLib.getWeek();
            var date;
            var weekText = headerText.indexOf("This week") !== -1 || headerText.indexOf("Last week") !== -1 || headerText.indexOf("Next week") !== -1;
            date = CalendarLib.getVisibleDates();
            for (i = 0; i < 7; i++) {
                if (date[i].getDate() === 1) {
                    break;
                }
            }
            Tx.log("Verifying if current view crosses month for date " + date);
            //if for loop is not broken, then there is no first day for month in that case i would be 7
            //else if we find date 1 and its not the first day in view then current week crosses month
            if (i < 7  && i !== 0) {
                return true;
            } else {
                return false;
            }
        }, //weekViewCrossesMonth

        /// OWNER: t-niravn
        /// Gives text for the day displayed based on its index
        getDayText: function (day) {
            Tx.log("Getting text for day: " + day);
            var index;
            var dayText;
            for (var i = 0; i < 7; i++) {
                var headerSunday = WeekViewLib.getHeaderDays()[i].innerText;
                if (headerSunday.indexOf("Sun") !== -1) {
                    index = i;
                    break;
                }
            }
            // based on the index of sunday it would work for any starting day
            // lets say start day for week is thursday, now if user wants a day at index 2
            // Sunday would be at index: 3, calculation would be (7 - 3 + 2) % 7 i.e. saturday
            switch ((7 - index + day) % 7) {
                case 0: {
                    dayText = "Sunday";
                    break;
                }
                case 1: {
                    dayText = "Monday";
                    break;
                }
                case 2: {
                    dayText = "Tuesday";
                    break;
                }
                case 3: {
                    dayText = "Wednesday";
                    break;
                }
                case 4: {
                    dayText = "Thursday";
                    break;
                }
                case 5: {
                    dayText = "Friday";
                    break;
                }
                case 6: {
                    dayText = "Saturday";
                    break;
                }
                default: { Tx.AssertError("Wrong entry to Day Text method"); }
            }//Switch
            return dayText;
        }, // getDayText


        /// OWNER: t-niravn
        /// Clicks on the more button present for a specific day specified
        clickOnMore: function (day) {
            var containerLength = $(".container")[day].children.length;
            return new WinJS.Promise(function (complete) {
                Tx.log("Clicking on more button");
                var morePresent = new Boolean();
                morePresent = $(".container")[day].children[containerLength - 1].classList.contains("more");
                if (morePresent) {
                    Tx.log("More button present for created events");
                    $(".container")[day].children[containerLength - 1].click();
                } else {
                    Tx.log("More button not present");
                }
                //Have to keep a timeout as the event which expands the AllDay row does not throw
                //any event for current UI, and thus we cannot catch it
                //bug filed : WinBlue:379001
                setTimeout(function () { complete(); }, 1000);
            });
        },//clickOnMore

        /// OWNER: t-niravn
        /// gets the text for month shown in weekview
        /// the string differs based on what is seen on the screen
        /// possibilities are week crosses month, week is next week or is none of the two mentioned before
        /// text can be of the form Sun, Jun 23, or June 2013 - July 2013, or July 2013
        monthTextShown: function () {
            var weekText = UtilitiesLib.removeTextMarkers(WeekViewLib.getHeaderText());
            var varWeek = (weekText.indexOf("Next week") !== -1) || (weekText.indexOf("Last week") !== -1) || (weekText.indexOf("This week") !== -1);
            var monthShown;
            if (WeekViewLib.weekViewCrossesMonth) {
                if (varWeek) {
                    monthShown = CalendarLib.getShortHand(WeekViewLib.getDateInWeek()[0].innerText.split(",")[1].split(" ")[1]);
                } else {
                    monthShown = UtilitiesLib.removeTextMarkers(WeekViewLib.getWeek().substring(19, 28));
                }
            } else {
                monthShown = UtilitiesLib.removeTextMarkers(WeekViewLib.getWeek().substring(5, 10));
            }
            return monthShown;
        },//monthTextShown

        /// OWNER: t-niravn
        /// Opens up events details page by clicking on current day and current hour
        /// Essentially shows the date and hour in event details page based on current hour
        /// if current hour is 3:04 (the time in event would be 3:00 PM
        /// if used Ctrl +N the time in event would be 3:30 PM
        clickOnDay: function (day) {
            return new WinJS.Promise(function (complete) {
                BVT.marks.once("WinJS.Scheduler:yielding(jobs exhausted),info", function () {
                    complete();
                });
                Tx.log("Clicking on day");
                $(".week:not([aria-hidden='true']) .date")[day].click();
                $(".qe-caret.win-disposable").click();
                $(".link").click();
            });
        },

        /// OWNER: t-niravn
        /// Gives the day Jquery for getting all days in a week
        getDayInWeek: function () {
            return $(".week:not([aria-hidden='true']) .days")[0].children;
        },//getDayInWeek5

        /// OWNER: t-niravn
        /// Gives the day Jquery for getting all dates in a week
        getDateInWeek: function () {
            return $(".week:not([aria-hidden='true']) .days .date");
        },//getDateinWeek

        /// OWNER: t-niravn
        /// Gives jquery for getting current week shown
        getWeek: function () {
            return $(".week:not([aria-hidden='true']")[0].innerText;
        },//getWeek

        /// OWNER: t-niravn
        /// Gives jquery for getting header of the days shown in week
        getHeaderDays: function () {
            return $(".week:not([aria-hidden='true']")[0]._headerDays;
        }, //getHeaderDays

        /// OWNER: t-niravn
        /// Gives jquery for getting Main header for the week shown
        getHeaderText: function () {
            return UtilitiesLib.removeTextMarkers($(".week:not([aria-hidden='true']) .anchorText")[0].innerText);
        }, //getHeaderDays

        /// OWNER: t-niravn
        /// Gives jquery for getting Main header for the week shown
        getWeekendDays: function () {
            return $(".week:not([aria-hidden='true']) .days .weekend");
        },

        /// OWNER: t-niravn
        /// Gives jquery for getting containers for hours shown in the week
        getContainer: function () {
            return $(".week:not([aria-hidden='true']) .grid .events .container");
        },

        /// OWNER: t-niravn
        /// Gives jquery for getting All day container for the week shown
        getAllDayContainer: function () {
            return $(".week:not([aria-hidden='true']) .container");
        },

        /// OWNER:t-niravn
        /// returns month for the day index given in current week
        /// work only for this week, last week or next week, because innerText return Sun, Jun 30
        /// but for other weeks innerText would return Sunday 30
        getMonthForIndex: function (index) {
            var str = WeekViewLib.getDayInWeek()[index].innerText.split(" ");
            return str[1];
        },

        /// OWNER: t-niravn
        /// return the date for given index in current week
        /// innerText format is Sun, Jun 30 or Sunday 30
        /// date is always at the end of string
        getDateForIndex: function (index) {
            var str = WeekViewLib.getDayInWeek()[index].innerText.split(" ");
            return parseInt(UtilitiesLib.removeTextMarkers(str[str.length - 1]), 10);
        },

        /// OWNER: t-niravn
        /// return the short hand for day at given index in current week
        /// innerText format is Sun, Jun 30 or Sunday 30
        /// day is always at the start of string
        getDayForIndex: function (index) {
            return CalendarLib.getShortHand(WeekViewLib.getDayInWeek()[index].innerText.split(" ")[0]);
        },

        /// OWNER: t-niravn
        /// Gets the text inside a grid at index specified
        getGridTextForIndex: function (index) {
            return $(".week:not([aria-hidden='true'])")[0]._grid.children[index].innerText;
        },

        /// OWNER: t-niravn
        /// Returns if a day at specified index is a weekend or not
        /// if returned true than day at index is a weekend
        dayIsWeekend: function (index) {
            return $(".week:not([aria-hidden='true'])")[0]._grid.children[index].classList.contains("weekend");
        }
    };
}();