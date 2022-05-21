
// Copyright (C) Microsoft. All rights reserved.

/*global Jx, Windows, Share, Tx*/

(function () {
    var _originalAppData = Jx.appData;
    var _mockContainer = null;
    var _values = null;

    // An arbitrary timestamp to represent "now" in a time independent way
    var _mockCurrentTimeStamp = 1368490286000;

    function setup () {
        /// <summary>
        /// Store global state that will be modified by tests
        /// </summary>

        _values = new Windows.Foundation.Collections.PropertySet();

        _mockContainer = {
            set: function () { },
            get: function () { return {}; },
            hasKey: function () { return true; },
            getValues: function () { return _values; }
        };

        Jx.appData = {
            localSettings: function () {
                return {
                    container: function () {
                        return _mockContainer;
                    }
                };
            }
        };
    }

    function cleanup () {
        /// <summary>
        /// Restore original state
        /// </summary>

        Jx.appData = _originalAppData;
    }

    var opt = {
        owner: "nthorn",
        priority: "0"
    };

    function _createQuickLinkData() {
        // Create a mock platform object with just enough to prevent crashing
        var mockPlatform = {
            accountManager: {
                loadAccount: function (objectId) {
                    // Return a mock account object
                    return {
                        objectId: objectId
                    };
                }
            }
        };

        var quickLinkData = new Share.QuickLinkData(mockPlatform);

        // Override _getCurrentDate so that our tests aren't time-dependent.
        quickLinkData._getCurrentDate = function () {
            // Return the same arbitrary date every time
            return new Date(_mockCurrentTimeStamp);
        };

        return quickLinkData;
    }

    opt.description = "Verify that associateFromAccount stores the from account and quick link data in the localAppSettings.";
    Tx.test("ShareTarget.QuickLinkData.testAssociateFromAccount", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var quickLinkData = _createQuickLinkData(),
            setWasCalled = false,
            quickLinkId = "someone@example.com",
            fromAccount = { objectId: "fakeobjectid" };

        // Change the "set" function so we can verify it was called properly
        _mockContainer.set = function (key, value) {
            setWasCalled = true;
            tc.areEqual(key, quickLinkId, "Expected quickLinkId to be used as the local storage key");
            tc.areEqual(value.fromAccountId, fromAccount.objectId, "Expected objectId to be in the local storage value");
        };

        // Call associateFromAccount
        quickLinkData.associateFromAccount(quickLinkId, fromAccount);

        // Verify that set was called
        tc.isTrue(setWasCalled, "Expected set to be called.");
    });

    function _createAssociation(fromAccountId, numberOfDaysAgo) {
        var timestamp = _mockCurrentTimeStamp - numberOfDaysAgo * 86400000 /*number of milliseconds in a day*/,
            association = new Windows.Storage.ApplicationDataCompositeValue();
        association.fromAccountId = fromAccountId;
        association.lastUseDate = new Date(timestamp);
        return association;
    }

    opt.description = "Verifies that getAssociatedFromAccount returns the correct account.";
    Tx.test("ShareTarget.QuickLinkData.testGetAssociatedFromAccount", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var quickLinkData = _createQuickLinkData(),
            getWasCalled = false,
            quickLinkId = "someone@example.com",
            fromAccount = { objectId: "fakeobjectid" },
            association = _createAssociation(fromAccount.objectId, 0);

        // Change the "get" function so we can verify it was called properly
        _mockContainer.get = function (key) {
            getWasCalled = true;
            tc.areEqual(key, quickLinkId, "Expected quickLinkId to be used as the local storage key");

            return association;
        };

        // Call associateFromAccount
        var returnedAccount = quickLinkData.getAssociatedFromAccount(quickLinkId);

        // Verify that the proper data was returned
        tc.isTrue(getWasCalled, "Expected get to be called.");
        tc.areEqual(returnedAccount.objectId, fromAccount.objectId, "Expected returned object ID to be the same as the one provided by the container.");
    });

    opt.description = "Verifies that clean doesn't clean anything out if nothing is very old";
    Tx.test("ShareTarget.QuickLinkData.testCleanRecentLinks", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var quickLinkData = _createQuickLinkData();
        
        // Set up the values property set
        _values.insert("someone@example0.com", _createAssociation("fakeobjectid0", 0)); // 0 days old
        _values.insert("someone@example1.com", _createAssociation("fakeobjectid1", 1)); // 1 day old
        _values.insert("someone@example2.com", _createAssociation("fakeobjectid2", 2)); // 2 days old
        _values.insert("someone@example3.com", _createAssociation("fakeobjectid3", 3)); // 3 days old
        _values.insert("someone@example4.com", _createAssociation("fakeobjectid4", 4)); // 4 days old
        _values.insert("someone@example5.com", _createAssociation("fakeobjectid5", 5)); // 5 days old

        // Call clean
        quickLinkData.clean(1 /*maxListSize*/, 5 /*daysToKeep*/);

        // Verify that the proper data was returned
        tc.isTrue(_values.hasKey("someone@example0.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example1.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example2.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example3.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example4.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example5.com"), "Key should not have been cleaned.");
    });

    opt.description = "Verifies that clean doesn't clean anything out if the list is short";
    Tx.test("ShareTarget.QuickLinkData.testCleanShortList", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var quickLinkData = _createQuickLinkData();

        // Set up the values property set
        _values.insert("someone@example0.com", _createAssociation("fakeobjectid0", 0)); // 0 days old
        _values.insert("someone@example1.com", _createAssociation("fakeobjectid1", 1)); // 1 day old
        _values.insert("someone@example2.com", _createAssociation("fakeobjectid2", 2)); // 2 days old
        _values.insert("someone@example3.com", _createAssociation("fakeobjectid3", 3)); // 3 days old
        _values.insert("someone@example4.com", _createAssociation("fakeobjectid4", 4)); // 4 days old
        _values.insert("someone@example5.com", _createAssociation("fakeobjectid5", 5)); // 5 days old

        // Call clean
        quickLinkData.clean(10 /*maxListSize*/, 1 /*daysToKeep*/);

        // Verify that the proper data was returned
        tc.isTrue(_values.hasKey("someone@example0.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example1.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example2.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example3.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example4.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example5.com"), "Key should not have been cleaned.");
    });

    opt.description = "Verifies that clean clears out old contacts when the list gets too long";
    Tx.test("ShareTarget.QuickLinkData.testClean", opt, function (tc) {
        tc.cleanup = cleanup;
        setup(tc);

        var quickLinkData = _createQuickLinkData();

        // Set up the values property set
        _values.insert("someone@example0.com", _createAssociation("fakeobjectid0", 0)); // 0 days old
        _values.insert("someone@example1.com", _createAssociation("fakeobjectid1", 1)); // 1 day old
        _values.insert("someone@example2.com", _createAssociation("fakeobjectid2", 2)); // 2 days old
        _values.insert("someone@example3.com", _createAssociation("fakeobjectid3", 3)); // 3 days old
        _values.insert("someone@example4.com", _createAssociation("fakeobjectid4", 4)); // 4 days old
        _values.insert("someone@example5.com", _createAssociation("fakeobjectid5", 5)); // 5 days old

        // Call clean
        quickLinkData.clean(1 /*maxListSize*/, 3 /*daysToKeep*/);

        // Verify that the proper data was returned
        tc.isTrue(_values.hasKey("someone@example0.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example1.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example2.com"), "Key should not have been cleaned.");
        tc.isTrue(_values.hasKey("someone@example3.com"), "Key should not have been cleaned.");
        tc.isFalse(_values.hasKey("someone@example4.com"), "Key should have been cleaned.");
        tc.isFalse(_values.hasKey("someone@example5.com"), "Key should have been cleaned.");
    });

})();
