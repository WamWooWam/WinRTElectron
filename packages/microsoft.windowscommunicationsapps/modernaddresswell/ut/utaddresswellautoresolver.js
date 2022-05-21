
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,Jx,WinJS,Microsoft,setTimeout,clearTimeout,msSetImmediate,AddressWell*/

(function () {
    var _originalJxRes;
    var _originalJxBici = Jx.bici;
    var _originalJxFault;
    var _originalJxHasClass;
    var _originalJxRtl = Jx.isRtl;
    var _originalGetUserTile;
    var _originalServerSearch;

    function GetWrappedCallback(fn) {
        return fn;
    }

    function _makeRecipient(initObject, index, initialState) {
        var recipient = new AddressWell.Recipient(initObject, initialState);
        if (Jx.isNumber(index)) {
            recipient.setId(String(index));
            recipient.generateHTMLElement(index, false);
        }
        return recipient;
    }

    function _makeSingleRecipientContact(email) {
        return { recipients: [{ emailAddress: email, person: {} }], person: {} };
    }

    function _makeAutoResolver() {
        return new AddressWell.AutoResolver({}, null);
    }

    var _getNextQuerySet = function(index) { return []; };
    var _searchComplete = Jx.fnEmpty;
    var _searchStarted = Jx.fnEmpty;

    var MockServerSearchAgent = function () {
        this._onComplete = null;
        this._onError = null;
        this._lvInput = null;
        this._searchPromise = null;
        this._searchTimeoutId = null;
        this._queryCount = 0;
    };

    MockServerSearchAgent.prototype.queryAsync = function (input, connectedAccount, onComplete, onError) {
        this._onComplete = onComplete;
        this._onError = onError;
        this._lvInput = input;
        this._results = [];
        var count = this._queryCount;

        var possibleTimeouts = [10, 15, 7, 21, 17];

        _searchStarted(input);

        this._searchPromise = new WinJS.Promise(function () {
            timeout = possibleTimeouts[Math.floor(Math.random() * possibleTimeouts.length)];
            this._searchTimeoutId = setTimeout(function () {
                onComplete(_getNextQuerySet(count));
                this._searchPromise = null;
                _searchComplete();
            }.bind(this),
            timeout);
        }.bind(this), function () {
            onError(AddressWell.SearchErrorType.none);
            this._searchPromise = null;
            _searchComplete();
        }.bind(this));

        this._searchPromise.done();

        this._queryCount++;
    };

    MockServerSearchAgent.prototype.cancel = function () {
        if (this._searchTimeoutId) {
            clearTimeout(this._searchTimeoutId);
            this._searchTimeoutId = null;
        }
        if (this._searchPromise) {
            this._searchPromise.cancel();
        }
    };

    function setup () {
        /// <summary>
        /// Constructs a default address well input copmonent, and saves variables that will be changed by the tests
        /// </summary>
        
        _originalJxBici = Jx.bici;
        _originalJxFault = Jx.fault;
        _originalJxHasClass = Jx.hasClass;
        _originalJxRes = Jx.res;
        _originalGetUserTile = AddressWell.getUserTileUrl;
        _originalServerSearch = AddressWell.ServerSearch;

        Jx.res = {};
        Jx.res.processAll = function () { };
        Jx.res.getString = function (id) { return "string"; };
        Jx.res.loadCompoundString = function (id) { return "string"; };

        Jx.bici = {
            addToStream: function () { }
        };

        Jx.hasClass = function (el, cls) {
            return Boolean(el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)')));
        };

        Jx.fault = function () { };

        AddressWell.getUserTileUrl = function () { return ""; };
        AddressWell.ServerSearch = MockServerSearchAgent;
    }

    function cleanup () {
        /// <summary>
        /// Restores variables that were changed by the tests
        /// </summary>
        Jx.bici = _originalJxBici;
        Jx.hasClass = _originalJxHasClass;
        Jx.fault = _originalJxFault;
        Jx.isRtl = _originalJxRtl;
        Jx.res = _originalJxRes;
        AddressWell.getUserTileUrl = _originalGetUserTile;
        AddressWell.ServerSearch = _originalServerSearch;
    }

    Tx.test("AddressWellAutoResolverTests.testResolveAgainstCurrentResults", function (tc) {
        /// <summary>
        /// Tests properties when invoking the constructor
        /// </summary>
        tc.cleanup = cleanup;
        setup();

        var autoResolver = _makeAutoResolver();
        // NOTE: the last two recipients have an expected final state of 'unresolved'. Because we're simulating a wordwheel search match, the
        // state will not go to 'unresovable' if no match is found, since in the real-world scenario a server-search would be attempted next.
        var recipients = [{recipient: _makeRecipient({ emailAddress: "resolvable" }, 0), expectedState: AddressWell.RecipientState.resolved},
                          {recipient: _makeRecipient({ emailAddress: "unresolvable" }, 1), expectedState: AddressWell.RecipientState.unresolved},
                          {recipient: _makeRecipient({ emailAddress: "ambiguous" }, 2), expectedState: AddressWell.RecipientState.unresolvable}];

        var resultSet = [_makeSingleRecipientContact("resolvable.somewhere@outlook.com"),
                         _makeSingleRecipientContact("resolvable@outlook.com"),
                         _makeSingleRecipientContact("ambiguous@outlook.com"),
                         _makeSingleRecipientContact("ambiguous@yahoo.com"),
                         _makeSingleRecipientContact("random@email.com")];


        recipients.forEach(function (recipientData) {
            tc.areEqual(recipientData.recipient.state, AddressWell.RecipientState.unresolved, "The starting recipient state should be 'unresolved'");

            autoResolver.resolveAgainstCurrentResults(recipientData.recipient, resultSet);

            tc.areEqual(recipientData.recipient.state, recipientData.expectedState, "The expected state of the recipient is incorrect");
        });
    });

    Tx.asyncTest("AddressWellAutoResolverTests.testResolveAgainstServerAsync", function (tc) {
        /// <summary>
        /// Tests auto-resolving a set of recipients.
        /// </summary>
        
        // Async test should call tc.stop first.  
        tc.stop();
 
        tc.cleanup = cleanup;
        setup();

        var autoResolver = _makeAutoResolver();

        var recipients = [{ recipient: _makeRecipient({ emailAddress: "resolvable" }, 0), expectedState: AddressWell.RecipientState.resolved },
                          { recipient: _makeRecipient({ emailAddress: "unresolvable" }, 1), expectedState: AddressWell.RecipientState.unresolvable },
                          { recipient: _makeRecipient({ emailAddress: "nothing" }, 2), expectedState: AddressWell.RecipientState.unresolvable }];

        var resultsSets = [[_makeSingleRecipientContact("resolvable.somewhere@microsoft.com"),
                            _makeSingleRecipientContact("res.ol.vable@microsoft.com"),
                            _makeSingleRecipientContact("resolvable@microsoft.com")],
                           [_makeSingleRecipientContact("unresolvable.email@microsoft.com"),
                           _makeSingleRecipientContact("email.unresolvable@microsoft.com"),
                           _makeSingleRecipientContact("veryunresolvable@microsoft.com")],
                           []];

        // Override the hook into our MockServerSearch object to provide it with
        // the next set of mock results to return for the current search.
        _getNextQuerySet = function(index) {
            return resultsSets[index];
        };

        var searchCompleteCounter = 0;
        // Override the hook into our MockServerSearch object which informs
        // that a search has completed (success or failure.)
        _searchComplete = GetWrappedCallback(function () {
            searchCompleteCounter++;
            // Once all the searches have completed, check all the results
            if (searchCompleteCounter === recipients.length) {
                // Verify the final states of all the recipients
                recipients.forEach(function (recipientData, index) {
                    tc.areEqual(recipientData.recipient.state, recipientData.expectedState, "The expected state of the recipient is incorrect");
                });
                _searchComplete = Jx.fnEmpty;
                tc.isFalse(autoResolver.workPending, "Ensure there is no pending work for the auto-resolver");
                tc.start();
            }
        });

        var connectedAccount = { peopleSearchScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.connected };

        // Enqueue all the search requests.
        recipients.forEach(function (recipientData, index) {
            tc.areEqual(recipientData.recipient.state, AddressWell.RecipientState.unresolved, "The starting recipient state should be 'unresolved'");
            autoResolver.resolveAgainstServerAsync(recipientData.recipient, connectedAccount);
        });
    });

    Tx.asyncTest("AddressWellAutoResolverTests.testResolveAgainstServerAsyncCancellation", function (tc) {
        /// <summary>
        /// Tests auto-resolving a set of recipients with cancellation.
        /// </summary>
        // Async test should call tc.stop first.  
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var autoResolver = _makeAutoResolver();

        // NOTE: the last two recipients have an expected final state of 'unresolve', as opposed to 'unresolvable' since we plan
        // to cancel the search before these two are processed, so their state shouldn't change.
        var recipients = [{ recipient: _makeRecipient({ emailAddress: "unresolvable" }, 0), expectedState: AddressWell.RecipientState.unresolvable },
                          { recipient: _makeRecipient({ emailAddress: "cancellme" }, 1), expectedState: AddressWell.RecipientState.unresolved },
                          { recipient: _makeRecipient({ emailAddress: "cancellmetoo" }, 2), expectedState: AddressWell.RecipientState.unresolved }];

        var resultsSets = [[_makeSingleRecipientContact("unresolvable.somewhere@microsoft.com")], [], []];

        // Override the hook into our MockServerSearch object to provide it with
        // the next set of mock results to return for the current search.
        _getNextQuerySet = function (index) {
            return resultsSets[index];
        };

        // Override the hook into our MockServerSearch object which informs
        // that a search has completed (success or failure.)
        var canceled = false;
        _searchComplete = GetWrappedCallback(function () {
            msSetImmediate(function () {
                autoResolver.cancel();
                canceled = true;

                // Verify the final states of all the recipients
                recipients.forEach(function (recipientData, index) {
                    tc.areEqual(recipientData.recipient.state, recipientData.expectedState, "The expected state of the recipient is incorrect");
                });
                tc.isFalse(autoResolver.workPending, "Ensure there is no pending work for the auto-resolver");
                tc.start();
            });
            _searchComplete = Jx.fnEmpty;
        });

        var connectedAccount = { peopleSearchScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.connected };

        // Enqueue all the search requests.
        recipients.forEach(function (recipientData, index) {
            tc.areEqual(recipientData.recipient.state, AddressWell.RecipientState.unresolved, "The starting recipient state should be 'unresolved'");
            autoResolver.resolveAgainstServerAsync(recipientData.recipient, connectedAccount);
        });
    });

    Tx.asyncTest("AddressWellAutoResolverTests.testResolveAgainstServerAsyncWithRecipientDeletion", function (tc) {
        /// <summary>
        /// Tests the case where the idPrefix parameter is null
        /// </summary>
        tc.stop();

        tc.cleanup = cleanup;
        setup();

        var autoResolver = _makeAutoResolver();

        // NOTE: the last two recipients have an expected final state of 'unresolve', as opposed to 'unresolvable' since we plan
        // to cancel the search before these two are processed, so their state shouldn't change.
        var recipients = [{ recipient: _makeRecipient({ emailAddress: "deletedWhilePending" }, 0), expectedState: AddressWell.RecipientState.deleted },
                          { recipient: _makeRecipient({ emailAddress: "resolvable" }, 1), expectedState: AddressWell.RecipientState.resolved },
                          { recipient: _makeRecipient({ emailAddress: "deletedInQueue" }, 1), expectedState: AddressWell.RecipientState.deleted },
                          { recipient: _makeRecipient({ emailAddress: "resolvabletoo" }, 2), expectedState: AddressWell.RecipientState.resolved }];

        var resultsSets = [[_makeSingleRecipientContact("deletedWhilePending@microsoft.com")],
                           [_makeSingleRecipientContact("resolvable@microsoft.com")],
                           [_makeSingleRecipientContact("resolvabletoo@microsoft.com")]];

        // Override the hook into our MockServerSearch object to provide it with
        // the next set of mock results to return for the current search.
        _getNextQuerySet = function (index) {
            return resultsSets[index];
        };

        // Hook the search-started function of our MockServerSearch object.
        _searchStarted = function (input) {
            if (input === "deletedWhilePending") {
                msSetImmediate(function () {
                    // Delete the "deletedWhilePending" recipient.
                    recipients[0].recipient.setDeleted();
                    // Delete the "deletedInQueue" recipient, too.
                    recipients[2].recipient.setDeleted();
                });
            }
        };

        var searchCompleteCounter = 0;
        // Override the hook into our MockServerSearch object which informs
        // that a search has completed (success or failure.)
        _searchComplete = GetWrappedCallback(function () {
            searchCompleteCounter++;
            // Once all the searches have completed, check all the results
            if (searchCompleteCounter === recipients.length-1) {
                // Verify the final states of all the recipients
                recipients.forEach(function (recipientData, index) {
                    tc.areEqual(recipientData.recipient.state, recipientData.expectedState, "The expected state of the recipient is incorrect");
                });
                _searchComplete = Jx.fnEmpty;
                tc.isFalse(autoResolver.workPending, "Ensure there is no pending work for the auto-resolver");
                tc.start();
            }
        });

        var connectedAccount = { peopleSearchScenarioState: Microsoft.WindowsLive.Platform.ScenarioState.connected };

        // Enqueue all the search requests.
        recipients.forEach(function (recipientData, index) {
            tc.areEqual(recipientData.recipient.state, AddressWell.RecipientState.unresolved, "The starting recipient state should be 'unresolved'");
            autoResolver.resolveAgainstServerAsync(recipientData.recipient, connectedAccount);
        });
    });

})();
