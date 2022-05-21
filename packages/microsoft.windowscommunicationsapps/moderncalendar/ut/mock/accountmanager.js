
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Calendar,createMockPlatformCollection*/

(function() {

//
// Namespaces
//

var Mock = Calendar.Mock;

//
// AccountManager
//
var _lastId = 0;

var AccountManager = Mock.AccountManager = function () {
    this._accounts = [this.defaultAccount];
};

//
// Public
//

AccountManager.prototype.defaultAccount = 
{
    emailAddress: "foo@bar.com"
};

AccountManager.prototype.getConnectedAccountsByScenario = function () {
    
    return createMockPlatformCollection(this._accounts);
};

AccountManager.prototype.generateNewAccount = function () {

    // Allows the calendar manager or other mocks to create new accounts which will be known by the account manager.
    // If any account needs to be added to the getConnectedAccountsByScenario collection, generate it this way.

    var account = {
        objectId: _lastId++,
        emailAddress: "fake@fake.com"
    };

    this._accounts.push(account);

    return account;
};

})();

