
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Microsoft,window*/

var TestCore = {};

TestCore.platform = null;
TestCore.calendarManager = null;
TestCore.accountManager = null;
TestCore.defaultAccount = null;
TestCore.verbose = false;
TestCore.tc = null;
TestCore.cachePaused = false;

TestCore.defaultWait = 30000;

TestCore.log = function (message) {
    if (TestCore.tc !== null) {
        TestCore.tc.log(message);
    }
};

TestCore.logVerbose = function (message) {
    if (TestCore.verbose) {
        TestCore.log(message);
    }
};

TestCore._jx = null;
TestCore.etw = function (name) {
    if (!TestCore._jx) {
        TestCore._jx = new Microsoft.WindowsLive.Jx();
    }

    TestCore._jx.etw(name);
};

TestCore.isHostedInWwa = function () {
    return window.hasOwnProperty("Windows");
};

TestCore.verifyHostedInWwa = function () {
    TestCore.logVerbose("Checking for WWAHost");

    var hosted = TestCore.isHostedInWwa();

    if (!hosted) {
        TestCore.log("Test requires WWAHost, skipping");
    }

    return hosted;
};

TestCore.verifyIsPST = function () {
    TestCore.logVerbose("Checking for PST");

    var Jan1Local = new Date(2011, 0, 1);
    var Jun1Local = new Date(2011, 5, 1);

    var Jan1UTC = new Date(0);
    Jan1UTC.setUTCFullYear(2011);
    Jan1UTC.setUTCMonth(0);
    Jan1UTC.setUTCDate(1);

    var Jun1UTC = new Date(0);
    Jun1UTC.setUTCFullYear(2011);
    Jun1UTC.setUTCMonth(5);
    Jun1UTC.setUTCDate(1);

    var msPerHour = 1000 * 60 * 60;

    var JanDiff = (Jan1UTC.getTime() - Jan1Local.getTime()) / msPerHour;
    var JunDiff = (Jun1UTC.getTime() - Jun1Local.getTime()) / msPerHour;

    TestCore.logVerbose("Offset in January: " + JanDiff);
    TestCore.logVerbose("Offset in June: " + JunDiff);

    if (JanDiff != -8 || JunDiff != -7) {
        TestCore.log("Test Requires Local Timezone of PST, skipping");
        return false;
    }

    return true;

};

TestCore.cleanupAfterTests = function () {

    if (TestCore.calendarManager != null) {
        TestCore.dumpStore();
        TestCore.calendarManager.enableTileScheduling(true);

        if (TestCore.cachePaused) {
            TestCore.calendarManager.resumeCache();
        }
    }
        
    if (TestCore.platform !== null) {
        TestCore.platform.dispose();
        TestCore.platform = null;
    }

    if (TestCore._jx) {
        TestCore._jx = null;
    }
};

TestCore.cleanupTest = function () {

    TestCore.logVerbose("Entering cleanupTest");

    if (TestCore.isHostedInWwa()) {

        // Dump any accounts we created
        TestCore.logVerbose("Getting Accounts");
        var accounts = TestCore.platform.store.getCollection(Microsoft.WindowsLive.Platform.Test.StoreTableIdentifier.account);
        accounts.lock();
        var count = accounts.count;

        for (var i = 0; i < count; i++) {

            TestCore.logVerbose("Examining account " + i);
            var account = accounts.item(i);
            if (account.emailAddress.indexOf("@calendarmanager.test") >= 0) {

                if (account.canDelete) {
                    TestCore.logVerbose("Deleting account " + account.emailAddress);
                    account.deleteObject();
                }
                else {
                    TestCore.logVerbose("Ignoring undeletable account " + account.emailAddress);
                }
            }
        }
        accounts.dispose();
    }

    TestCore.logVerbose("Leaving cleanupTest");
    TestCore.tc = null;
};

TestCore.setupTest = function (tc, requiresCache) {

    TestCore.tc = tc;
    TestCore.logVerbose("Entering setupTest");

    if (TestCore.isHostedInWwa()) {

        if (TestCore.platform === null) {
            TestCore.logVerbose("Retrieving Platform");
            var wlt = Microsoft.WindowsLive.Platform.Test;
            TestCore.platform = new wlt.ClientTestHarness("calendarTest", wlt.PluginsToStart.defaultPlugins, "account@calendarmanager.default");
            TestCore.logVerbose("Retrieving Calendar Manager");
            TestCore.calendarManager = TestCore.platform.client.calendarManager;
            TestCore.calendarManager.enableTileScheduling(false);
            TestCore.logVerbose("Retrieving Account Manager");
            TestCore.accountManager = TestCore.platform.client.accountManager;
            TestCore.logVerbose("Retrieving Default Account");
            TestCore.defaultAccount = TestCore.accountManager.defaultAccount;
            TestCore.logVerbose("Adding cleanupAfterTests");
            window.addEventListener("beforeunload", TestCore.cleanupAfterTests);
        }

        TestCore.dumpStore();

        if (requiresCache) {
            if (TestCore.cachePaused) {
                TestCore.calendarManager.resumeCache();
                TestCore.cachePaused = false;
            }
        } else if (!TestCore.cachePaused) {
            TestCore.calendarManager.pauseCache();
            TestCore.cachePaused = true;
        }
        
        tc.cleanup = TestCore.cleanupTest;

    }

    TestCore.logVerbose("Leaving setupTest");
};

TestCore.verifyCalendars = function (iterator, names) {
    TestCore.waitForCollectionCount(TestCore.defaultWait, iterator, names.length, true);

    var actual = [];
    var count = iterator.count;

    for (var i = 0; i < count; i++) {
        actual.push(iterator.item(i).name);
    }

    TestCore.verifyArrays("calendar", actual, names);
    iterator.dispose();
};

TestCore.verifyAttendees = function (iterator, attendees) {
    var actual = [];
    var count = iterator.count;

    for (var i = 0; i < count; i++) {
        var item = iterator.item(i);
        actual.push({
            name: item.name,
            email: item.email,
            responseType: item.responseType,
            attendeeType: item.attendeeType
        });
    }

    TestCore.verifyArrays("attendee", actual, attendees);
};

TestCore.verifyObjectsByOrder = function (objectName, iterator, properties, values) {

    var errors = 0;

    if (iterator.count !== values.length) {
        TestCore.log("ERROR: Expected " + values.length + " " + objectName + "(s), received " + iterator.count);
        errors++;
    }

    var max = (iterator.count < values.length) ? iterator.count : values.length;

    for (var i = 0; i < max; i++) {

        var item = iterator.item(i);

        for (var j = 0; j < properties.length; j++) {

            // If we haven't seen an error, it's okay to wait for the property value.  Once we
            // have a failure, there's no longer any reason to wait
            if (errors === 0) {

                TestCore.waitForPropertyValue(TestCore.defaultWait, item, properties[j], values[i][j]);
            }

            var actual = item[properties[j]];
            var expected = values[i][j];

            if (actual !== expected) {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    TestCore.log("ERROR: " + objectName + " " + i + " " + properties[j] + ", expected " + expected + ", actual " + actual);
                    errors++;
                }
            }

        }
    }

    if (errors > 0) {
        TestCore.tc.error("" + errors + " error(s) found verifing " + objectName + " order");
    }
};

TestCore.verifyEventsByOrder = function (iterator, properties, values) {
    TestCore.verifyObjectsByOrder("Event", iterator, properties, values);
};

TestCore.verifyRangesByOrder = function (iterator, properties, values) {
    TestCore.verifyObjectsByOrder("Range", iterator, properties, values);
};

TestCore.verifyCalendarsByOrder = function (iterator, properties, values) {
    TestCore.verifyObjectsByOrder("Calendar", iterator, properties, values);
};

TestCore.verifyDates = function (dateCollection, expectedDates) {
    var errors = 0;

    if (dateCollection.count !== expectedDates.length) {
        TestCore.log("ERROR: Expected " + expectedDates.length + " dates(s), received " + dateCollection.count);
        errors++;
    }

    var max = (dateCollection.count < expectedDates.length) ? dateCollection.count : expectedDates.length;

    for (var i = 0; i < max; i++) {
        var actualDate = dateCollection.item(i);
        if (actualDate.getTime() != expectedDates[i].getTime()) {
            TestCore.log("ERROR: Date " + i + ", expected \"" + expectedDates[i] + "\", actual \"" + actualDate + "\"");
            errors++;
        }
    }

    TestCore.tc.areEqual(0, errors, "Errors found verifing dates");
};

TestCore.verifyArrays = function (name, actual, expected) {
    var errors = 0;

    if (actual.length !== expected.length) {
        TestCore.log("ERROR: Expected " + expected.length + " " + name + "(s), received " + actual.length);
        errors++;
    }

    for (var i = 0; i < actual.length; i++) {
        var found = false;

        for (var j = 0; j < expected.length && !found; j++) {
            if (actual[i] === expected[j]) {
                found = true;
            }
            else if (JSON.stringify(actual[i]) === JSON.stringify(expected[j])) {
                found = true;
            }

            if (found) {
                expected.splice(j, 1);
            }
        }

        if (!found) {
            TestCore.log("ERROR: Found unexpected " + name + ": " + JSON.stringify(actual[i]));
            errors++;
        }
    }

    for (i = 0; i < expected.length; i++) {
        TestCore.log("ERROR: Did not find expected " + name + ": " + JSON.stringify(expected[i]));
        errors++;
    }

    if (errors > 0) {
        TestCore.tc.error("" + errors + " error(s) found verifing " + name + "s");
    }
};

TestCore.verifyObject = function (object, properties, expected) {

    TestCore.tc.isNotNull(object, "verifyObject requires an object");
    TestCore.tc.isNotNull(properties, "verifyObject requires properties");
    TestCore.tc.isNotNull(expected, "verifyObject requires expected");
    TestCore.tc.areEqual(properties.length, expected.length, "verifyObject expects a value for each property");

    var errors = 0;

    for (var i = 0; i < properties.length; i++) {

        var actualValue = object[properties[i]];
        var expectedValue = expected[i];

        if (actualValue.hasOwnProperty("UniversalTime")) {
            actualValue = new Date().fromDateTime(actualValue);
        }

        if (expectedValue.hasOwnProperty("UniversalTime")) {
            expectedValue = new Date().fromDateTime(expectedValue);
        }

        if (actualValue !== expectedValue) {

            // It's possible we're dealing with objects, so try compare the string representations
            if (JSON.stringify(actualValue) !== JSON.stringify(expectedValue)) {
                TestCore.log("ERROR: " + properties[i] + " expected " + JSON.stringify(expectedValue) + ", actually " + JSON.stringify(actualValue));
                errors++;
            }
        }
    }

    if (errors > 0) {
        TestCore.tc.error("" + errors + " error(s) found verifing object");
    }
};

TestCore.verifyComponentProperty = function (iCalendar, property, value, params, paramValues) {
    var line = property;
    if (params) {
        var i,
            len;
        for (i = 0, len = params.length; i < len; i++) {
            line += ";" + params[i] + "=" + paramValues[i];
        }
    }
    line += ":";
    var index = iCalendar.indexOf(line);
    TestCore.tc.isTrue(index > -1, "Property " + property + (params ? " with params" : "") + " not found");

    index += line.length;
    // We expect a \r\n after the value, so remove the final \r\n if present
    var actualValue = iCalendar.substring(index, index + value.length + 2)
                               .replace(/\r\n$/, "");
    TestCore.tc.areEqual(value, actualValue, "Property " + property + " expected " + value + ", actually " + actualValue);
};

TestCore.verifyComponentDate = function (iCalendar, property, date) {
    var timezone = true;
    var i = iCalendar.indexOf(property + ";TZID");
    if (i > -1) {
        iCalendar = iCalendar.substring(i);
        i = iCalendar.indexOf(":") + 1;
    } else {
        timezone = false;
        i = iCalendar.indexOf(property + ":");
        TestCore.tc.isTrue(i > -1, "Property " + property + " not found");
        iCalendar = iCalendar.substring(i);
        i = property.length + 1;
    }

    var expectedValue = "";

    if (timezone) {

        // Since we have a timezone, we expect a timezone formatted
        // time
        expectedValue = date.getFullYear() + "";
        if (date.getMonth() < 9) {
            expectedValue += "0";
        }
        expectedValue += date.getMonth() + 1;
        if (date.getDate() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getDate() + "T";
        if (date.getHours() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getHours();
        if (date.getMinutes() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getMinutes();
        if (date.getSeconds() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getSeconds();
    } else {
        // In the absence of a timezone, we expect a UTC formatted
        // time

        expectedValue = date.getUTCFullYear() + "";
        if (date.getUTCMonth() < 9) {
            expectedValue += "0";
        }
        expectedValue += date.getUTCMonth() + 1;
        if (date.getUTCDate() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getUTCDate() + "T";
        if (date.getUTCHours() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getUTCHours();
        if (date.getUTCMinutes() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getUTCMinutes();
        if (date.getUTCSeconds() < 10) {
            expectedValue += "0";
        }
        expectedValue += date.getUTCSeconds() + "Z";
    }


    // We expect a \r\n after the value, so remove the final \r\n if present
    var actualValue = iCalendar.substring(i, i + expectedValue.length + 2)
                               .replace(/\r\n$/, "");
    TestCore.tc.areEqual(expectedValue, actualValue, "Property " + property + " expected " + expectedValue + ", actually " + actualValue);
};

TestCore.waitForPropertyValueCore = function (timeout, object, property, value, failOnFailure) {
    var found = false;
    var waited = 0;

    if (object[property] === value || JSON.stringify(object[property]) === JSON.stringify(value)) {
        found = true;
    }
    else {
        if (timeout > 0) {
            var start = new Date();
            TestCore.waitForIdle(timeout);
            waited = new Date().getTime() - start.getTime();

            if (waited === 0) {
                waited = 1;
            }

            if (object[property] === value || JSON.stringify(object[property]) === JSON.stringify(value)) {
                found = true;
            }
        }
    }

    if (waited > 0) {
        if (!found) {
            var comment = "Failed to find expected " + property + "after " + waited + "ms , expected: " + JSON.stringify(value) + ", actual: " + JSON.stringify(object[property]);
            if (failOnFailure) {
                TestCore.tc.error(comment);
            }
            else {
                TestCore.log(comment);
            }
        }
        else {
            TestCore.log("Waited " + waited + "ms");
        }
    }
};

TestCore.waitForPropertyValue = function (timeout, object, property, value) {
    TestCore.waitForPropertyValueCore(timeout, object, property, value, false);
};

TestCore.verifyPropertyValue = function (timeout, object, property, value) {
    TestCore.waitForPropertyValueCore(timeout, object, property, value, true);
};

TestCore.waitForArrayLength = function (timeout, array, length) {
    TestCore.waitForPropertyValue(timeout, array, "length", length);
};

TestCore.waitForCollectionCount = function (timeout, collection, count, unlock) {

    if (unlock) {
        collection.unlock();
    }

    TestCore.waitForPropertyValue(timeout, collection, "count", count);
};

TestCore.ignoreValue = -1;

TestCore.verifyNotifications = function (collection, addExpected, changeExpected, removeExpected, callback) {

    var addActual = 0;
    var changeActual = 0;
    var removeActual = 0;
    var done = false;

    var collectionChanged = function (ev) {

        var args = ev.detail[0];

        switch (args.eType) {
            case Microsoft.WindowsLive.Platform.CollectionChangeType.itemAdded:
                addActual++;
                break;

            case Microsoft.WindowsLive.Platform.CollectionChangeType.itemChanged:
                changeActual++;
                break;

            case Microsoft.WindowsLive.Platform.CollectionChangeType.itemRemoved:
                removeActual++;
                break;
        }

        if (callback && !done) {
            if ((addExpected == TestCore.ignoreValue || addActual >= addExpected) && (changeExpected == TestCore.ignoreValue || changeActual >= changeExpected) && (removeExpected == TestCore.ignoreValue || removeActual >= removeExpected)) {

                done = true;
                callback();
            }
        }
    };

    if (addExpected != TestCore.ignoreValue || changeExpected != TestCore.ignoreValue || removeExpected != TestCore.ignoreValue) {

        collection.addEventListener("collectionchanged", collectionChanged);
        collection.unlock();

        TestCore.waitForIdle(TestCore.defaultWait);

        collection.lock();
        collection.removeEventListener("collectionchanged", collectionChanged);

        var errors = 0;

        if (addExpected != TestCore.ignoreValue && addExpected != addActual) {
            errors++;
            TestCore.log("Adds Incorrect, Expected " + addExpected + ", Actual " + addActual);
        }

        if (changeExpected != TestCore.ignoreValue && changeExpected != changeActual) {
            errors++;
            TestCore.log("Changes Incorrect, Expected " + changeExpected + ", Actual " + changeActual);
        }

        if (removeExpected != TestCore.ignoreValue && removeExpected != removeActual) {
            errors++;
            TestCore.log("Removes Incorrect, Expected " + removeExpected + ", Actual " + removeActual);
        }

        TestCore.tc.areEqual(0, errors, "Errors encountered");
    }
};

TestCore.waitForIdle = function (timeout) {

    var start = new Date();
    
    TestCore.platform.waitForPlatformIdle(timeout);

    var diff = (new Date()).getTime() - start.getTime();

    if (diff > 50) {
        TestCore.log("WARNING: waitForPlatformIdle(" + timeout + ") waited for " + diff + " ms");
    }
        
};

TestCore.dumpStore = function() {
    TestCore.logVerbose("Dumping Store");

    var start = new Date();
    
    TestCore.calendarManager.dumpStore();

    var diff = (new Date()).getTime() - start.getTime();

    if (diff > 50) {
        TestCore.log("WARNING: calendarManager.dumpStore() took " + diff + " ms");
    }
};
