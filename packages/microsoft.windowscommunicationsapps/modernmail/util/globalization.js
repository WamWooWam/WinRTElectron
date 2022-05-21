
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global  Jx,Windows,Microsoft,Mail,Debug */
(function () {
    "use strict";

    var Utilities = Mail.Utilities,
        Plat = Microsoft.WindowsLive.Platform,
        PlatResult = Plat.Result,
        resIds = {};

    // The calendar platform has a min valid date to help distinguish "not specified" dates
    // This is the JS equivalent of MIN_EVENT_DATETIME (JS and C++ have different int representations of time)
    // 2/1/1601, midnight UTC
    Utilities.minValidDate = -11641795200000;

    Utilities.msInOneHour = 1000 * 60 * 60;
    Utilities.msInFourHours = Utilities.msInOneHour * 4;
    Utilities.msInOneDay = Utilities.msInOneHour * 24;

    
    Utilities.shortDateFormatterSameYear = null;
    Utilities.shortTimeFormatter = null;
    Utilities.shortWeekDayFormatter = null;
    Utilities.shortDateFormatter = null;
    Utilities.verboseDateFormatter = null;
    Utilities.longDateFormatter = null;
    

    // Map HRESULTs to ResIds
    resIds[PlatResult.e_HTTP_BAD_REQUEST] = "mailSendErrorMessageTooLarge";
    resIds[PlatResult.e_HTTP_DISK_SPACE] = "mailSendErrorMessageTooLarge";
    resIds[PlatResult.e_NEXUS_STATUS_MAILBOX_SENDQUOTAEXCEEDED] = "mailSendErrorMessageTooLarge";
    resIds[PlatResult.e_NEXUS_STATUS_MESSAGE_ATTACHMENTSTOOLARGE] = "mailSendErrorMessageTooLarge";
    resIds[PlatResult.e_HTTP_REQUEST_TOO_LARGE] = "mailSendErrorMessageTooLarge";
    resIds[PlatResult.ixp_E_SMTP_552_STORAGE_OVERFLOW] = "mailSendErrorProblemWithAttachments";
    resIds[PlatResult.e_NEXUS_STATUS_MESSAGE_RECEIPIENTUNRESOLVED] = "mailSendErrorUnresolvedRecipient";
    resIds[PlatResult.e_NEXUS_STATUS_MESSAGE_HASNORECIPIENT] = "mailSendErrorUnresolvedRecipient";
    resIds[PlatResult.e_NEXUS_STATUS_MESSAGE_REPLYNOTALLOWED] = "mailSendErrorReplyNotAllowed";
    resIds[PlatResult.e_NEXUS_STATUS_ITEM_NOTFOUND] = "mailSendErrorOriginalEventDeleted";

    var initializeFormatters = function () {
        Mail.writeProfilerMark("Utilities.initializeFormatters", Mail.LogEvent.start);
        if (!Utilities.shortTimeFormatter) {
            var DTF = Windows.Globalization.DateTimeFormatting;
            Utilities.shortDateFormatterSameYear = new DTF.DateTimeFormatter(DTF.YearFormat.none, DTF.MonthFormat.abbreviated, DTF.DayFormat["default"], DTF.DayOfWeekFormat.none); // eg April 29
            Utilities.shortTimeFormatter = new DTF.DateTimeFormatter("shorttime"); // eg 3:01 PM
            Utilities.shortWeekDayFormatter = new DTF.DateTimeFormatter(DTF.YearFormat.none, DTF.MonthFormat.none, DTF.DayFormat.none, DTF.DayOfWeekFormat.abbreviated); // eg Sun
            Utilities.shortDateFormatter = DTF.DateTimeFormatter.shortDate; // eg 4/29/2012
            Utilities.abbreviatedDateFormatter = new DTF.DateTimeFormatter(DTF.YearFormat.abbreviated, DTF.MonthFormat.abbreviated, DTF.DayFormat.default, DTF.DayOfWeekFormat.abbreviated); // eg Sun, Apr 29, 12
            Utilities.abbreviatedDateFormatterSameYear = new DTF.DateTimeFormatter(DTF.YearFormat.none, DTF.MonthFormat.abbreviated, DTF.DayFormat.default, DTF.DayOfWeekFormat.abbreviated); // eg Sun, Apr 29
            Utilities.verboseDateFormatter = new DTF.DateTimeFormatter("year month dayofweek day"); // eg Sunday, April 29, 2012
            Utilities.longDateFormatter = DTF.DateTimeFormatter.longDate; // eg Sunday, April 29, 2012 (specific fields displayed vary per-market)
        }
        initializeFormatters = Jx.fnEmpty;
        Mail.writeProfilerMark("Utilities.initializeFormatters", Mail.LogEvent.stop);
    };

    Utilities.getAbbreviatedDateString = function (jsDate) {
        /// <param name="jsDate" type="Date" optional="true"></param>
        /// <returns type="String"></returns>
        if (!jsDate) {
            return " ";
        }
        initializeFormatters();
        if (isWithinAnYear(new Date(), jsDate)) {
            return Utilities.abbreviatedDateFormatterSameYear.format(jsDate);
        } else {
            return Utilities.abbreviatedDateFormatter.format(jsDate);
        }
    };

    Utilities.getVerboseDateString = function (jsDate) {
        /// <param name="jsDate" type="Date" optional="true"></param>
        /// <returns type="String"></returns>
        if (!jsDate) {
            return "";
        }
        initializeFormatters();
        return Utilities.verboseDateFormatter.format(jsDate);
    };

    Utilities.getShortTimeString = function (jsDate) {
        /// <param name="jsDate" type="Date" optional="true"></param>
        /// <returns type="String"></returns>
        if (!jsDate) {
            return "";
        }
        initializeFormatters();
        return Utilities.shortTimeFormatter.format(jsDate);
    };

    Utilities.getShortDateString = function (jsDate) {
        /// <param name="jsDate" type="Date" optional="true"></param>
        /// <returns type="String"></returns>
        if (!jsDate) {
            return "";
        }
        return Utilities._formatShortDate(new Date(), jsDate);
    };

    function isWithinAWeek(now, jsDate) {
        /// <param name="now" type="Date"></param>
        /// <param name="jsDate" type="Date"></param>
        /// <returns type="Boolean">returns true if jsDate is within a week from now</returns>
        Debug.assert(Jx.isInstanceOf(now, Date));
        Debug.assert(Jx.isInstanceOf(jsDate, Date));
        var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            endDate = new Date(startOfToday);
        endDate.setDate(endDate.getDate() - 6);
        return jsDate >= endDate;
    }

    function isWithinAnYear(now, jsDate) {
        /// <param name="now" type="Date"></param>
        /// <param name="jsDate" type="Date"></param>
        /// <returns type="Boolean">returns true if jsDate is within an year from now</returns>
        Debug.assert(Jx.isInstanceOf(now, Date));
        Debug.assert(Jx.isInstanceOf(jsDate, Date));
        // We cannot do a -364 day check as it does not account for leap year
        var startOfOneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1);
        return jsDate >= startOfOneYearAgo;
    }

    Utilities._formatShortDate = function (now, jsDate) {
        /// <param name="now" type="Date"></param>
        /// <param name="jsDate" type="Date"></param>
        /// <returns type="String"></returns>
        Debug.assert(Jx.isInstanceOf(now, Date));
        Debug.assert(Jx.isInstanceOf(jsDate, Date));
        if (!jsDate) {
            return " ";
        }
        var result = "";
        if (jsDate && jsDate.getTime() !== 0) {
            var formatter = null;

            initializeFormatters();
            if (isSameDay(now, jsDate)) {
                formatter = Utilities.shortTimeFormatter;
            } else {
                if (now > jsDate) {
                    if (isWithinAWeek(now, jsDate)) {
                        formatter = Utilities.shortWeekDayFormatter;
                    } else if (isWithinAnYear(now, jsDate)) {
                        formatter = Utilities.shortDateFormatterSameYear;
                    }
                }
                if (!formatter) {
                    formatter = Utilities.shortDateFormatter;
                }
            }
            result = formatter.format(jsDate);
        }
        return result;
    };

    function isSameDay(a, b) {
        /// <param name="a" type="Date" />
        /// <param name="b" type="Date" />
        return a.getDate()     === b.getDate()  &&
               a.getMonth()    === b.getMonth() &&
               a.getFullYear() === b.getFullYear();
    }

    Utilities.getCalendarEventTimeRange = function (account, ev) {
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        /// <param name="ev" type="Microsoft.WindowsLive.Platform.Calendar.Event" />
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        // we pull in Calendar.Event from a ref file and can't actually assert
        // it's an instanceof anything.  so we just make sure it's valid.
        Debug.assert(!Jx.isNullOrUndefined(ev));

        // get some info about the event
        var start = ev.startDate;
        var end = ev.endDate;

        // Some mail responses don't have date information specified
        if (start < Utilities.minValidDate || end < Utilities.minValidDate) {
            // We don't have anything appropriate to put in the date UI
            return "";
        }

        initializeFormatters();

        var longDate = Utilities.longDateFormatter,
            shortTime = Utilities.shortTimeFormatter;

        // if it's a recurring series, try to get a future event
        if (ev.eventType === Microsoft.WindowsLive.Platform.Calendar.EventType.series) {
            var platform = Mail.Globals.platform,
                manager  = platform.calendarManager;

            try {
                var realEv = manager.getEventFromUID(account, ev.uid),
                    nextEv = manager.getNextEvent(realEv.id);

                if (nextEv) {
                    ev = nextEv;
                }
            } catch (ex) {
                // this will fail if there's no event on our calendar.  this can
                // happen with certain providers for events that have not yet
                // been accepted.
            }
        }

        // we'll always show at least the starting date
        var range = longDate.format(start);

        // what we do depends on whether or not it's an all day event
        if (ev.allDayEvent) {
            // all-day events that end at midnight technically end on "the next day".
            // however, that's not what we want to show when building the text, so we
            // adjust the end date back by one millisecond for all-day events.  since
            // we don't use the time itself in this case, it will only affect this
            // particular scenario.
            end = new Date(end.getTime() - 1);

            // it's not the same day, so append the next date
            if (!isSameDay(start, end)) {
                range = Jx.res.loadCompoundString("DateRange", range, longDate.format(end));
            } else {
                range = Jx.res.loadCompoundString("AllDaySuffix", range);
            }
        } else {
            var startTime = shortTime.format(start).replace(/ /g, "\u00a0");

            if (start.getTime() === end.getTime()) {
                // we only show one date/time if it's a zero-duration event
                range += " " + startTime;
            } else {
                // the remaining text depends on whether or not it's the same day
                var endTime = shortTime.format(end).replace(/ /g, "\u00a0");

                if (isSameDay(start, end)) {
                    range += " " + Jx.res.loadCompoundString("TimeRange", startTime, endTime);
                } else {
                    var startTimeAndDate = range + " " + startTime;
                    var endTimeAndDate = longDate.format(end) + " " + endTime;
                    range = Jx.res.loadCompoundString("DateRange", startTimeAndDate, endTimeAndDate);
                }
            }
        }

        return range;
    };

    Utilities.isRtlScript = {
        "arab": true,   // RTL     Arabic
        "armi": true,   // RTL     Imperial Aramaic
        "avst": true,   // RTL     Avestan
        "cprt": true,   // RTL     Cypriot
        "egyd": true,   // RTL     Egyptian demotic
        "egyh": true,   // RTL     Egyptian hieratic
        "hebr": true,   // RTL     Hebrew
        "ital": true,   // RTL     Old Italic (Etruscan, Oscan, etc.)
        "khar": true,   // RTL     Kharoshthi
        "linb": true,   // RTL     Linear B
        "lydi": true,   // RTL     Lydian
        "mand": true,   // RTL     Mandaic
        "merc": true,   // RTL     Meroitic Cursive
        "nkoo": true,   // RTL     N'Ko
        "orkh": true,   // RTL     Old Turkic
        "phli": true,   // RTL     Inscriptional Pahlavi
        "phlp": true,   // RTL     Psalter Pahlavi
        "phlv": true,   // RTL     Book Pahlavi
        "phnx": true,   // RTL     Phoenician
        "prti": true,   // RTL     Inscriptional Parthian
        "samr": true,   // RTL     Samaritan
        "sarb": true,   // RTL     Old South Arabian
        "syrc": true,   // RTL     Syriac
        "syre": true,   // RTL     Syriac (Estrangelo variant)
        "syrj": true,   // RTL     Syriac (Western variant)
        "syrn": true,   // RTL     Syriac (Eastern variant)
        "thaa": true    // RTL     Thaana
    };

    Utilities._currentInputMethodLanguageTag = null;
    Utilities._currentHaveRtlLanguage = null;

    Utilities.haveRtlLanguage = function () {
        /// <summary>returns true if the user has an RTL language pack installed</summary>

        // currentInputMethodLanguageTag is a proxy for the user modifying their list of language packs.
        var currentTag = Windows.Globalization.Language.currentInputMethodLanguageTag;
        if (Utilities._currentInputMethodLanguageTag !== currentTag) {
            Mail.writeProfilerMark("Utilities.haveRtlLanguage", Mail.LogEvent.start);
            Utilities._currentInputMethodLanguageTag = currentTag;
            var languages = Windows.System.UserProfile.GlobalizationPreferences.languages;
            Utilities._currentHaveRtlLanguage = languages.some(function (language) {
                var lang = new Windows.Globalization.Language(language);
                return Utilities.isRtlScript[lang.script.toLowerCase()];
            });
            Mail.writeProfilerMark("Utilities.haveRtlLanguage", Mail.LogEvent.stop);
        }

        return Utilities._currentHaveRtlLanguage;
    };

    Utilities.getSendErrorString = function (syncStatus, account) {
        /// <param name="syncStatus" type="Number" />
        /// <param name="account" type="Microsoft.WindowsLive.Platform.IAccount" />
        Debug.assert(Jx.isValidNumber(syncStatus));
        Debug.assert(Jx.isInstanceOf(account, Microsoft.WindowsLive.Platform.Account));
        Debug.assert(syncStatus !== PlatResult.success);

        var resId = resIds[syncStatus];
        return Jx.res.loadCompoundString(Jx.isNonEmptyString(resId) ? resId : "mailSendErrorGeneric", account.emailAddress);
    };

}());
