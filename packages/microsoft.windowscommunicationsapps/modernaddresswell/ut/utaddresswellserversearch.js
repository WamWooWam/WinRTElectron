
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,Microsoft,document,Debug,setTimeout,MockPeopleManager,AddressWell*/
(function ()
{
    // Temporary variables that will be changed by the test
    var _platform;
    var _searchAgent;
    var _mockSearchReturnDelay;
    var _mockSearchSuccessValue;
    var _getQuerySet = function () { return [];};

    function GetWrappedCallback(fn) {
        return fn;
    }

    var MockPlatform = function () {
        this._peopleManager = new MockPeopleManager();
    };
    Object.defineProperty(MockPlatform.prototype, "peopleManager", { get: function () { return this._peopleManager; } });

    var MockCollection = function () {
        this._collection = _getQuerySet();
        this._changedEventListeners = [];
    };
    Object.defineProperty(MockCollection.prototype, "count", { get: function () { return this._collection.length; } });
    Object.defineProperty(MockCollection.prototype, "totalCount", { get: function () { return this._collection.length; } });

    MockCollection.prototype.addEventListener = function (event, listener) {
        if ("collectionchanged" === event) {
            this._changedEventListeners.push(listener);
        }
    };
    MockCollection.prototype.removeEventListener = function (event, listener) {
        if ("collectionchanged" === event) {
            for (var i = this._changedEventListeners.length - 1; i >= 0; i--) {
                if (this._changedEventListeners[i] === listener) {
                    this._changedEventListeners[i] = null;
                    this._changedEventListeners.length += 1;
                }
            }
        }
    };

    MockCollection.prototype.unlock = function () {
        setTimeout(function () {
            this._changedEventListeners.forEach(function (listener) {
                if (listener) {
                    listener({ eType: Microsoft.WindowsLive.Platform.CollectionChangeType.serverSearchComplete, index: _mockSearchSuccessValue });
                }
            }.bind(this));
        }.bind(this), _mockSearchReturnDelay);
    };

    MockCollection.prototype.item = function (index) {
        return this._collection[index];
    };

    var MockPeopleManager = function () {
    };
    
    MockPeopleManager.prototype.searchServer = function (searchString, maxResults, account, cache) {
        return new MockCollection();
    };

    function _createMockPerson(email, displayName) {
        return {
            mostRelevantEmail: email,
            calculatedUIName: displayName || email,
            createRecipient: function (eml) { return { email: eml }; },
            toString: function () { return this.mostRelevantEmail; }
        };
    }

    function _createServerSearchAgent(contactPlatform) {
        var platform = contactPlatform || new MockPlatform();
        return new AddressWell.ServerSearch(platform, { perf: Jx.fnEmpty }/*log*/);
    }
    
    function setup () {
        /// <summary>
        /// Constructs a default address well input copmonent, and saves variables that will be changed by the tests
        /// </summary>
        Debug.enableAssertDialog = false;

        _platform = new MockPlatform();
        _searchAgent = _createServerSearchAgent(_platform);
        _mockSearchReturnDelay = 50; // Have the MockPeopleManager wait fifty milliseconds before returning the mock results.
        _mockSearchSuccessValue = 1; 
    }
    
    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        Debug.enableAssertDialog = true;

        _platform = null;
        _searchAgent = null;
    }
   
    Tx.asyncTest("AddressWellServerSearchTests.testQueryAsync", function (tc) {
        /// <summary>
        /// Tests the queryAsync performs properly under normal conditions.
        /// </summary>
        ///<param name="signalTestCompleted">Calling this method indicates that the test is finished.</param>
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var expectedResultsSet = [_createMockPerson("john@microsoft.com", "John"), 
                                  _createMockPerson("johnD@microsoft.com", "John Doe"), 
                                  _createMockPerson("jLingo@microsoft.com", "Johnny Lingo"),
                                  _createMockPerson("johnL@microsoft.com", "John Lennon")];

        // Override the hook into our MockPeopleManager object to provide it with
        // the set of mock results to return for the serverSearch.
        _getQuerySet = function () { return expectedResultsSet; };

        _searchAgent.queryAsync("John",
                                {}/*account*/,
                                new GetWrappedCallback(function (results) {
                                    var theResults = results.map(function(contact) {
                                        return contact.recipients[0].email;
                                    });
                                    var resultsString = theResults.join();
                                    var expectedString = expectedResultsSet.join();
                                    tc.areEqual(resultsString, expectedString);
                                    tc.start();
                                }),
                                new GetWrappedCallback(function (ex) {
                                    tc.fail("An error occurred in queryAsync " + ex);
                                    tc.start();
                                }));
    });

    Tx.asyncTest("AddressWellServerSearchTests.testQueryAsyncWithServerError", function (tc) {
        /// <summary>
        /// Tests the ServerSearch object returns the expected results when the platform gives us a server error.
        /// </summary>
        ///<param name="signalTestCompleted">Calling this method indicates that the test is finished.</param>
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        _mockSearchSuccessValue = 3; /*server error*/

        _searchAgent.queryAsync("John",
                                {}/*account*/,
                                new GetWrappedCallback(function (results) {
                                    tc.fail("The success callback should not have been called.");
                                    tc.start();
                                }),
                                new GetWrappedCallback(function (error) {
                                    tc.areEqual(AddressWell.SearchErrorType.serverError, error, "The expected error code returned is wrong.");
                                    tc.start();
                                }));
    });

    Tx.asyncTest("AddressWellServerSearchTests.testQueryAsyncWithConnectionFailure", function (tc) {
        /// <summary>
        /// Tests the ServerSearch object returns the expected results when the connection failes.
        /// </summary>
        ///<param name="signalTestCompleted">Calling this method indicates that the test is finished.</param>
        tc.stop();

        tc.cleanup = cleanup;
        setup();


        _mockSearchSuccessValue = 7; /*server error*/

        _searchAgent.queryAsync("John",
                                {}/*account*/,
                                new GetWrappedCallback(function (results) {
                                    tc.fail("The success callback should not have been called.");
                                    tc.start();
                                }),
                                new GetWrappedCallback(function (error) {
                                    tc.areEqual(AddressWell.SearchErrorType.connectionError, error, "The expected error code returned is wrong.");
                                    tc.start();
                                }));
    });

    Tx.asyncTest("AddressWellServerSearchTests.testQueryAsyncWithCancellation", function (tc) {
        /// <summary>
        /// Tests the ServerSearch object returns the expected when a cancellation for the serach occurs.
        /// </summary>
        ///<param name="signalTestCompleted">Calling this method indicates that the test is finished.</param>
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var expectedResultsSet = [_createMockPerson("john@microsoft.com", "John")];

        // Override the hook into our MockPeopleManager object to provide it with
        // the set of mock results to return for the serverSearch.
        _getQuerySet = function () { return expectedResultsSet; };

        _searchAgent.queryAsync("John",
                                {}/*account*/,
                                new GetWrappedCallback(function (results) {
                                    tc.failed("The search was cancelled, no results should have been returned.");
                                    tc.start();
                                }),
                                new GetWrappedCallback(function (error) {
                                    tc.areEqual(AddressWell.SearchErrorType.cancelled, error, "The expected error code returned is wrong.");
                                    tc.start();
                                }));
        _searchAgent.cancel();

    });
    
})();
