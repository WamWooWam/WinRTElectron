
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*globals FromControl, Tx, Jx*/
/*jshint browser:true*/
(function () {
    var MockAccount;

    // disable $include
    window.$include = Jx.fnEmpty;


    function makeVectorView(emailAddresses) {
        /// <param name="emailAddresses" type="Array" />
        Object.defineProperty(emailAddresses, "size", { get: function () { return this.length; } });

        return emailAddresses;
    }

    function setUp() {
        var ma = MockAccount = {};

        ma.MockAccount = function (displayName, emailAddresses, preferredIndex) {
            /// <param name="displayName" type="String" />
            /// <param name="emailAddresses" type="Array" />
            /// <param name="preferredIndex" type="Number" />
            this.displayName = displayName;
            this.sendAsAddresses = makeVectorView(emailAddresses);
            this.preferredSendAsAddress = this.sendAsAddresses[preferredIndex];
            this.emailAddress = this.preferredSendAsAddress;
        };

        ma.MockPeopleManager = /*@constructor*/function () { };

        ma.MockPeopleManager.prototype.loadRecipientByEmail = function () {
            return null;
        };

        ma.MockAccountManager = /*@constructor*/function (accounts) {
            /// <param name="accounts" type="Array" />
            this._accountCollection = new ma.MockAccountCollection(accounts);
        };

        ma.MockAccountManager.prototype.getConnectedAccountsByScenario = function () {
            return this._accountCollection;
        };

        ma.MockAccountCollection = /*@constructor*/function (accounts) {
            /// <param name="accounts" type="Array" />

            this._accounts = accounts;
        };

        Object.defineProperty(ma.MockAccountCollection.prototype, "count", { get: function () { return this._accounts.length; }, enumerable: true });

        ma.MockAccountCollection.prototype.item = function (index) {
            /// <param name="index" type="Number" />
            return this._accounts[index];
        };


    }

    Tx.test("FromControl.testSingleAccountSingleEmail", function (tc) {
        setUp();

        var account = new MockAccount.MockAccount("Test", ["test@live.com"], 0);
        var accountManager = new MockAccount.MockAccountManager([account]);
        var peopleManager = new MockAccount.MockPeopleManager();
        var fromControl = new FromControl.FromControl(accountManager, peopleManager);

        // Initially the from control should have this one account and email selected
        var selectedAccount = fromControl.selectedAccount;
        tc.areEqual("Test", selectedAccount.displayName, "Incorrect account selected");

        var selectedEmail = fromControl.selectedEmailAddress;
        tc.areEqual("test@live.com", selectedEmail, "Incorrect email selected");

        // Selecting an email address that doesn't match this account not be ignored
        fromControl.selectAccount(account, "not-test@live.com");
        selectedAccount = fromControl.selectedAccount;
        tc.areEqual("Test", selectedAccount.displayName, "Incorrect account selected");

        selectedEmail = fromControl.selectedEmailAddress;
        tc.areEqual("test@live.com", selectedEmail, "Incorrect email selected");

    });

    Tx.test("testSingleAccountAliases", function (tc) {
        setUp();

        var account = new MockAccount.MockAccount("Test", ["test@live.com", "preferred@live.com", "other@live.com"], 1);
        var accountManager = new MockAccount.MockAccountManager([account]);
        var peopleManager = new MockAccount.MockPeopleManager();
        var fromControl = new FromControl.FromControl(accountManager, peopleManager);

        // Initially the preferred email address should be selected
        var preferredEmail = account.preferredSendAsAddress;
        var selectedEmail = fromControl.selectedEmailAddress;
        tc.areEqual(preferredEmail, selectedEmail, "Incorrect email selected");

        // Setting another email address should work when given a valid send as address
        var otherEmail = "other@live.com";
        fromControl.selectAccount(account, otherEmail);
        selectedEmail = fromControl.selectedEmailAddress;
        tc.areEqual(otherEmail, selectedEmail, "Incorrect email selected");

        // Calling selectAccount() with an invalid email address should lead to the primary
        // email address being selected. Note that the primary and preferred email addresses
        // may not be the same thing.
        var primaryEmail = account.emailAddress;
        fromControl.selectAccount(account, "invalid");
        selectedEmail = fromControl.selectedEmailAddress;
        tc.areEqual(primaryEmail, selectedEmail, "Incorrect email selected");
    });


})();
