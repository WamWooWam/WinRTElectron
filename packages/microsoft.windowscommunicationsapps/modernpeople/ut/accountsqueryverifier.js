
//
// Copyright (C) Microsoft. All rights reserved.
//

(function () {
    var M = Mocks;

    M.AccountsQueryVerifier = /* @constructor*/function(tc, platform) {
        Debug.assert(tc);
        Debug.assert(platform);
        this._scenario = -1;
        this._filter = -1;
        this._sort = -1;
        this._query = null;
        this._accountManager = platform._accountManager;
        this._tc = tc;

        platform.mock$setProperty("accountManager", this);
    }
    M.AccountsQueryVerifier.prototype.getConnectableAccountsByScenario = function (scenario, filter) {
        this._scenario = scenario;
        this._filter = filter;
        this._sort = -1;
        this._query = this.getConnectableAccountsByScenario;
        return this._accountManager.getConnectableAccountsByScenario(scenario, filter);
    };
    M.AccountsQueryVerifier.prototype.getConnectedAccountsByScenario = function (scenario, filter, sort) {
        this._scenario = scenario;
        this._sort = sort;
        this._filter = filter;
        this._query = this.getConnectedAccountsByScenario;
        return this._accountManager.getConnectedAccountsByScenario(scenario, filter, sort);
    };
    M.AccountsQueryVerifier.prototype.verifyLastQuery = function (query, scenario, filter, sort) {
        var tc = this._tc;
        tc.areEqual(query, this._query);
        tc.areEqual(scenario, this._scenario);
        tc.areEqual(filter, this._filter);
        tc.areEqual(sort, this._sort);
    };

})();