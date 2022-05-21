
//
// Copyright (C) Microsoft. All rights reserved.
//

/*jshint browser:true*/
/*global Jx,Debug*/

(function () {

    var P = window.People = {};
    P.Accounts = {};
    P.Controls = {};
    P.Grid = {};
    P.Nav = {};
    P.ShareTarget = {};

    P.RecentActivity = {
        Core: {},
        Imports: {},
        Test: {},
        Platform: {},

        Providers: {
            Sup: {}
        },
        UnitTests: {},
        UI: {
            Core: {
                UnitTests: {}
            },
            Feed: {},
            Host: {},
            Modules: {
                Feed: {}
            },
            Notifications: {},
            Photos: {},
            SelfPage: {},
            Share: {}
        }
    };

    P.Social = {};

    Debug.call(function () {
        P.MockPages = {};
        window.Mocks = window.Mocks || {};
        window.Mocks.Jx = {};
        window.TestHook = {};
        window.NoShip = window.NoShip || {};
        window.NoShip.People = {};
    });
})();

