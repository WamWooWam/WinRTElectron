
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*global Mail, Tx*/
/*jshint browser:true*/
(function () {

    function setup(tc) {
        tc.cleanup = Mail.UnitTest.restoreJx;
        Mail.UnitTest.stubJx(tc, "appData");
    }

    Tx.test("AppSettings.basics", function (tc) {
        setup(tc);

        var eventFireCount = 0;
        var appSettings = new Mail.AppSettings();
        appSettings.addListener(Mail.AppSettings.Events.threadingOptionChanged, function () {
            eventFireCount++;
        }, null);

        var defaultValue = true;
        tc.areEqual(appSettings.isThreadingEnabled, defaultValue); // Should start with the default value

        for (var i = 0; i < 10; i++) {
            appSettings.isThreadingEnabled = defaultValue;
            tc.areEqual(appSettings.isThreadingEnabled, defaultValue); // Should remember the value
            tc.areEqual(eventFireCount, 0); // Sequential sets of the same value should not trigger events
        }

        appSettings.isThreadingEnabled = !defaultValue;
        tc.areEqual(appSettings.isThreadingEnabled, !defaultValue); // Should remember the value
        tc.areEqual(eventFireCount, 1); // Setting to a different value should fire an event

        for (i = 0; i < 10; i++) {
            appSettings.isThreadingEnabled = !defaultValue;
            tc.areEqual(appSettings.isThreadingEnabled, !defaultValue);  // Should remember the value
            tc.areEqual(eventFireCount, 1); // Sequential sets of the same value should not trigger events
        }

        for (i = 0; i < 20; i++) { // Back and forth...
            var oldEventFireCount = eventFireCount;
            var oldIsThreadingEnabled = appSettings.isThreadingEnabled;
            appSettings.isThreadingEnabled = !appSettings.isThreadingEnabled;
            tc.areEqual(eventFireCount, oldEventFireCount + 1); // Setting to a different value should fire an event
            tc.isTrue(oldIsThreadingEnabled !== appSettings.isThreadingEnabled); // Should have flipped the value
        }

        appSettings.dispose();
    });

    Tx.test("AppSettings.fontSettings", function (tc) {
        setup(tc);
        var appSettings = new Mail.AppSettings(),
            eventsFired = 0;

        appSettings.addListener(Mail.AppSettings.Events.fontSettingChanged, function () {
            eventsFired++;
        });

        tc.areEqual(appSettings.composeFontFamily, null);
        tc.areEqual(appSettings.composeFontColor, null);
        tc.areEqual(appSettings.composeFontSize, null);

        // Make sure the values can be defined
        appSettings.composeFontColor = "#FFFFFF";
        tc.areEqual(appSettings.composeFontColor, "#FFFFFF");
        tc.areEqual(eventsFired, 1);

        appSettings.composeFontFamily = "Calibri";
        tc.areEqual(appSettings.composeFontFamily, "Calibri");
        tc.areEqual(eventsFired, 2);

        appSettings.composeFontSize = "12pt";
        tc.areEqual(appSettings.composeFontSize, "12pt");
        tc.areEqual(eventsFired, 3);

        // Change the value a few times
        for (var i = 0; i < 10; i++) {
            appSettings.composeFontColor = i.toString();
            tc.areEqual(eventsFired, 4 + (i * 3));

            appSettings.composeFontFamily = i.toString();
            tc.areEqual(eventsFired, 5 + (i * 3));

            appSettings.composeFontSize = i.toString();
            tc.areEqual(eventsFired, 6 + (i * 3));
        }

        appSettings.dispose();
    });

    Tx.test("AppSettings.BooleanConvertor", {owner: "kepoon", priority: 0}, function (tc) {
        var testCases = [
            { defaultValue: true, setting: "1", expected: true },
            { defaultValue: true, setting: 1,   expected: true },
            { defaultValue: true, setting: "xyzasdf", expected: true },
            { defaultValue: true, setting: null, expected: true },
            { defaultValue: true, setting: "0", expected: false },
            { defaultValue: true, setting: 0, expected: false},
            { defaultValue: false, setting: "1", expected: true },
            { defaultValue: false, setting: 1, expected: true },
            { defaultValue: false, setting: "xyzasdf", expected: false },
            { defaultValue: false, setting: "0", expected: false},
            { defaultValue: false, setting: null, expected: false },
            { defaultValue: false, setting: 0, expected: false },
        ];

        testCases.forEach(function (testcase) {
            tc.areEqual(Mail.AppSettings.BooleanConverter.fromSetting(testcase.setting, testcase.defaultValue), testcase.expected);
        });
    });

    Tx.test("AppSettings.ReadingDirection", { owner: "andrha" }, function (tc) {
        setup(tc);

        var appSettings = new Mail.AppSettings(),
            eventsFired = 0,
            dir = Mail.AppSettings.Direction;

        var f = function (value) {
            appSettings.readingDirection = dir[value];
            tc.areEqual(appSettings.readingDirection, dir[value]);
        },
        keys = Object.keys(dir);

        for (var i = 0; i < 10; i++) {
            keys.forEach(f);
        }
    });
})();
