
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,Jx,Tx,Windows,runSync*/

(function () {

    var _oldJxRes;
    var _oldShowFlyout;
    var _oldLaunchUri;
    var _oldSimpleTimeMinutes;
    var _oldSimpleTimeNoMinutes;
    var _result;
    var Helpers = Calendar.Helpers;

    function setup() {
        Helpers.ensureFormats();

        _oldJxRes = Jx.res;
        _oldShowFlyout = Helpers.showFlyout;
        _oldLaunchUri = Helpers._launchUriAsync;
        _oldSimpleTimeMinutes = Helpers.simpleTimeWithMinutes;
        _oldSimpleTimeNoMinutes = Helpers.simpleTimeWithoutMinutes;
        _result = {};

        Jx.res = {
            getString: function (id) { return id; }
        };
    }

    function cleanup() {
        Helpers.showFlyout = _oldShowFlyout;
        Helpers._launchUriAsync = _oldLaunchUri;
        Helpers.simpleTimeWithMinutes = _oldSimpleTimeMinutes;
        Helpers.simpleTimeWithoutMinutes = _oldSimpleTimeNoMinutes;
        Jx.res = _oldJxRes;
    }

    function setupTestEditEvent(tc, loadedEvent, loadedSeriesEvent) {
        /// <summary>
        /// Unit test helper for testEditEvent*
        /// </summary>
        /// <param name="loadedEvent">Event that should be returned from platform when a series is not requested</param>
        /// <param name="loadedSeriesEvent" optional="true">Event that should be returned from platform when a series is requested</param>
        /// <returns>Context item</returns>

        var platform = {
            calendarManager: {
                getEventFromHandle: function () {
                    return loadedEvent;
                }
            }
        };

        if (loadedEvent) {
            loadedEvent.getSeries = function () {
                _result.loadedSeries = true;
                if (!loadedSeriesEvent) {
                    throw new Error("Mock error: No series found");
                }
                return loadedSeriesEvent;
            };
        }

        Helpers.showFlyout = function (flyoutSettings) {
            _result.flyoutSettings = flyoutSettings;
        };

        var context = {
            fire: function (action, stuff) {
                if (action === "getPlatform") {
                    stuff.platform = platform;
                } else if (action === "editEvent") {
                    _result.editEvent = stuff.event;
                } else {
                    tc.fail("Unexpected event for context: " + action);
                }
            }
        };

        return context;
    }

    Tx.test("HelpersTests.testEditEventNotExist", function (tc) {
        /// <summary>
        /// Verifies that editEvent shows the "Can't open event" dialog when the event doesn't exist
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var context = setupTestEditEvent(tc, null);

        runSync(function () {
            Helpers.editEvent(context, "12345", {});
        });

        tc.isTrue(!!_result.flyoutSettings, "Expected flyout to be shown");
        tc.areEqual("CantOpenEvent", _result.flyoutSettings.message, "Expected can't open event message to be shown");
        tc.isFalse(!!_result.editEvent, "Unexpectedly edited event without flyout");
    });

    Tx.test("HelpersTests.testEditEventLoadsInstance", function (tc) {
        /// <summary>
        /// Verifies that editEvent edits the instance when requested
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var loadedEvent = {
            info: "loaded instance",
            recurring: true,
            calendar: {}
        };

        var context = setupTestEditEvent(tc, loadedEvent);

        runSync(function () {
            Helpers.editEvent(context, "12354", {});
        });

        tc.isTrue(!!_result.flyoutSettings, "Invalid test setup: Expected one / series flyout");
        tc.areEqual("EventRecurringChoice", _result.flyoutSettings.message, "Invalid test setup: Expected one / series flyout");

        // User chooses instance
        _result.flyoutSettings.commands[0].onclick();
        tc.areEqual(loadedEvent, _result.editEvent, "Expected instance event to be edited");
    });

    Tx.test("HelpersTests.testEditEventInstanceNotExist", function (tc) {
        /// <summary>
        /// Verifies that editEvent shows the "Can't open event" dialog when the instance doesn't exist
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var context = setupTestEditEvent(tc, null);

        runSync(function () {
            Helpers.editEvent(context, "12345", {});
        });

        tc.isTrue(!!_result.flyoutSettings, "Expected flyout to be shown");
        tc.areEqual("CantOpenEvent", _result.flyoutSettings.message, "Expected can't open event message to be shown");
        tc.isFalse(!!_result.editEvent, "Unexpectedly edited event without flyout");
    });

    Tx.test("HelpersTests.testEditEventLoadsSeries", function (tc) {
        /// <summary>
        /// Verifies that editEvent edits the series when requested
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var loadedEvent = {
            info: "loaded instance",
            recurring: true,
            calendar: {}
        };
        var loadedSeriesEvent = {
            info: "loaded series",
            calendar: {}
        };

        var context = setupTestEditEvent(tc, loadedEvent, loadedSeriesEvent);

        runSync(function () {
            Helpers.editEvent(context, "12354", {});
        });

        tc.isTrue(!!_result.flyoutSettings, "Invalid test setup: Expected one / series flyout");
        tc.areEqual("EventRecurringChoice", _result.flyoutSettings.message, "Invalid test setup: Expected one / series flyout");

        // User chooses series
        _result.flyoutSettings.commands[1].onclick();

        tc.isTrue(_result.loadedSeries, "Invalid test setup: expected to try to load series event");
        tc.areEqual(loadedSeriesEvent, _result.editEvent, "Expected instance event to be edited");
    });

    Tx.test("HelpersTests.testEditEventLoadsSingle", function (tc) {
        /// <summary>
        /// Verifies that editEvent loads a single event without a series/instance dialog
        /// </summary>

        tc.cleanup = cleanup;
        setup();

        var loadedEvent = {
            info: "loaded event",
            calendar: {}
        };

        var context = setupTestEditEvent(tc, loadedEvent);

        runSync(function () {
            Helpers.editEvent(context, "12345", {});
        });

        tc.isFalse(!!_result.loadedSeries, "Invalid test setup: Unexpected instance load");
        tc.isFalse(!!_result.flyoutSettings, "Did not expect any flyout");
        tc.areEqual(loadedEvent, _result.editEvent, "Event passed to edit page did not match");
    });

    Tx.test("HelpersTests.testEditReadOnlyEvent", function (tc) {
        /// <summary>
        /// Verifies that editEvent loads a read-only series without a dialog (e.g. birthday calendar)
        /// <summary>

        tc.cleanup = cleanup;
        setup();

        var loadedEvent = {
            info: "instance",
            recurring: true,
            calendar: {
                readOnly: true
            }
        };

        var context = setupTestEditEvent(tc, loadedEvent);

        runSync(function () {
            Helpers.editEvent(context, "12354", {});
        });

        tc.isFalse(!!_result.flyoutSettings, "Did not expect any flyout");
        tc.areEqual(loadedEvent, _result.editEvent, "Event passed to edit page did not match");
    });

    function parseQuerystring(uri) {
        /// <summary>Given a URI, returns an associative array of params</summary>

        // There are some problems with queryParsed, so we'll create our own.
        // - it's not a dictionary
        // - it throws exceptions if you try to retrieve a param via name that's not there
        var uriParams = uri.queryParsed;
        var parsedParams = {};

        for (var i = 0; i < uriParams.size; i++) {
            parsedParams[uriParams[i].name] = uriParams[i].value;
        }

        return parsedParams;
    }

    Tx.test("HelpersTests.testLaunchMailWithInstance", function (tc) {
        /// <summary>Verifies that correct parameters are sent to mail for an instance event</summary>

        tc.cleanup = cleanup;
        setup();

        var event = {
            handle: 5476730
        };

        var launchedUri = null;
        Helpers._launchUriAsync = function (uri) {
            launchedUri = uri;
        };

        Helpers.launchMail(Calendar.MailAction.forward, event);

        tc.isNotNull(launchedUri, "Invalid test setup: no URI launched");

        var params = parseQuerystring(launchedUri);
        tc.areEqual("calendar", params.action, "Unexpected launch action");
        tc.areEqual(event.handle.toString(), params.eventhandle, "EventID did not match");
        tc.areEqual(Calendar.MailAction.forward, params.calendaraction, "Calendar action did not match");
    });

    Tx.test("HelpersTests.testLaunchMailWithSeries", function (tc) {
        /// <summary>Verifies that correct parameters are sent to mail for a series event</summary>

        tc.cleanup = cleanup;
        setup();

        var event = {
            handle: 999374
        };

        var launchedUri = null;
        Helpers._launchUriAsync = function (uri) {
            launchedUri = uri;
        };

        Helpers.launchMail(Calendar.MailAction.accept, event);

        tc.isNotNull(launchedUri, "Invalid test setup: no URI launched");

        var params = parseQuerystring(launchedUri);
        tc.areEqual("calendar", params.action, "Unexpected launch action");
        tc.areEqual(event.handle.toString(), params.eventhandle, "EventID did not match");
        tc.areEqual(Calendar.MailAction.accept, params.calendaraction, "Calendar action did not match");
    });

    Tx.test("HelpersTests.testSimpleTimeFormat", function (tc) {
        /// <summary>A test to make sure simpleTime formatter doesn't use minutes if there are no minutes to display</summary>

        var usedTimeWithMinutes = false;
        var usedTimeWithoutMinutes = false;

        Helpers.simpleTimeWithMinutes = {
            format: function () {
                usedTimeWithMinutes = true;
                return "";
            }
        };

        Helpers.simpleTimeWithoutMinutes = {
            format: function () {
                usedTimeWithoutMinutes = true;
                return "";
            }
        };

        function verifySimpleTimeFormat (date, shouldDisplayMinutes) {
            usedTimeWithMinutes = false;
            usedTimeWithoutMinutes = false;

            Helpers.simpleTime.format(date);

            tc.isTrue(usedTimeWithMinutes || usedTimeWithoutMinutes, "Didn't call into time formatter as expected: " + String(date));
            tc.areEqual(shouldDisplayMinutes, usedTimeWithMinutes, "Did not format time correctly: " + String(date));
        }

        verifySimpleTimeFormat(new Date(1985, 10, 26, 0), false);
        verifySimpleTimeFormat(new Date(1985, 10, 26, 0, 1), true);
        verifySimpleTimeFormat(new Date(1985, 10, 26, 12), false);
        verifySimpleTimeFormat(new Date(1985, 10, 26, 12, 1), true);
        verifySimpleTimeFormat(new Date(1985, 10, 26, 8, 18), true);
    });

    function runFunctionInAllLanguages(testFunction) {
        /// <summary>Runs a test in all supported languages.  Function should take language as a parameter.</summary>

        var originalIsRtl = Jx.isRtl;

        var languages = [
            "am-et",
            "as-in",
            "bn-bd",
            "bn-in",
            "chr-cher-us",
            "el-gr",
            "gu-in",
            "he-il",
            "hi-in",
            "hy-am",
            "ja-jp",
            "ka-ge",
            "km-kh",
            "kn-in",
            "ko-kr",
            "kok-in",
            "ml-in",
            "mr-in",
            "ne-np",
            "or-in",
            "qps-plocm",
            "si-lk",
            "ta-in",
            "te-in",
            "th-th",
            "ti-et",
            "ug-cn",
            "af-za", "az-latn-az", "bs-latn-ba", "ca-es", "ca-es-valencia", "cs-cz", "cy-gb", "da-dk", "de-de", "en-gb", "en-us", "es-es", "et-ee", "eu-es", "fi-fi", "fil-ph", "fr-fr", "ga-ie", "gd-gb", "gl-es", "ha-latn-ng", "hr-hr", "hu-hu", "id-id", "ig-ng", "is-is", "it-it", "lb-lu", "lt-lt", "lv-lv", "mi-nz", "mk-mk", "ms-my", "mt-mt", "nb-no", "nl-nl", "nn-no", "nso-za", "pl-pl", "pt-br", "pt-pt", "qut-gt", "quz-pe", "ro-ro", "rw-rw", "sk-sk", "sl-si", "sq-al", "sr-latn-rs", "sv-se", "sw-ke", "tk-tm", "tn-za", "tr-tr", "uz-latn-uz", "wo-sn", "xh-za", "yo-ng", "zu-za", "qps-ploc",
            "ar-sa", "fa-ir", "ku-arab-iq", "pa-arab-pk", "prs-af", "sd-arab-pk", "ur-pk",
            "pa-in",
            "be-by", "bg-bg", "kk-kz", "ky-kg", "mn-mn", "ru-ru", "sr-cyrl-ba", "sr-cyrl-rs", "tg-cyrl-tj", "tt-ru", "uk-ua",
            "vi-vn",
            "zh-tw",
            "zh-hk",
            "zh-cn"];

        var RTLLanguages = [
            "qps-plocm",
            "ug-cn",
            "ar-sa",
            "fa-ir",
            "ku-arab-iq",
            "pa-arab-pk",
            "prs-af",
            "sd-arab-pk",
            "ur-pk"
        ];

        try {
            function rtlYes() { return true; }
            function rtlNo() { return false; }

            for (var i = 0; i < languages.length; i++) {
                if (RTLLanguages.indexOf(languages[i]) >= 0) {
                    Jx.isRtl = rtlYes;
                } else {
                    Jx.isRtl = rtlNo;
                }

                testFunction(languages[i]);
            }
        } finally {
            Jx.isRtl = originalIsRtl;
        }
    }

    Tx.test("HelpersTests.verifyDateTimeOrderAssumption", function verifyDateTimeOrderAssumption(tc) {

        // In Helpers.dateAndTime, and Helpers.shortDateAndTime, the code assumes that date always comes before time and concatenates the strings together.
        // This test verifies that assumption.  If this test starts to fail, then we will need to do something more complicated to figure out which should go first.
        // There is also code in ProviderEventView (_formatEventDate), Mail's Globalization.js (getCalendarEventTimeRange), FreeBusy (Worker.js - _formatScheduleBlock)
        // that rely on this same assumption.

        tc.cleanup = function () {
            // Clean out any cached formatters
            Jx.DTFormatter._setFormatters({});
        };

        function verifyHardcodedDateFormatter(language) {
            Jx.DTFormatter._setFormatters({
                shortDate: new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate", [language]),
                shortTime: new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shorttime", [language])
            });

            var bothFormatter = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shortdate shorttime", [language]);

            var date = new Date();

            var result = Helpers.shortDateAndTime.format(date);

            tc.areEqual(bothFormatter.format(date), result, language);
        }

        runFunctionInAllLanguages(verifyHardcodedDateFormatter);
    });

})();