
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Social\Model\Identity.js" />
/// <reference path="..\..\Social\Providers\FeedProviderFactory.js" />
/// <reference path="MockFactory.js" />
/// <reference path="MockLog.js" />

Include.initializeFileScope(function () {
    // Provides tests for the <see cref="T:People.RecentActivity.Identity" /> class.

    function setup () {
        /// <summary>
        ///     Sets up the test.
        /// </summary>
        People.RecentActivity.Providers.FeedProviderFactory.instance = new People.RecentActivity.UnitTests.MockFactory();
    }

    function cleanup () {
        /// <summary>
        ///     Tears down the test.
        /// </summary>
        People.RecentActivity.Providers.FeedProviderFactory.instance = new People.RecentActivity.Providers.FeedProviderFactory();
    }

    Tx.test("personTests.testConstructor", function (tc) {
        /// <summary>
        ///     Tests the constructor.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        People.RecentActivity.UnitTests.MockLog.reset();
        var person = People.RecentActivity.Identity.createIdentity('PERSON_ID');
        tc.areEqual(0, People.RecentActivity.UnitTests.MockLog.getCount());
        var networks = person.networks;
        tc.areEqual('PERSON_ID', person.id);
        tc.areEqual(1, networks.count);
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockFactory.GetNetworks', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual('PERSON_ID', People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
    });

    Tx.test("personTests.testUnknownPerson", function (tc) {
        /// <summary>
        ///     Tests an unknown person.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        People.RecentActivity.UnitTests.MockLog.reset();
        var person = People.RecentActivity.Identity.createIdentity('PERSON_UNKNOWN_ID');
        tc.areEqual(0, People.RecentActivity.UnitTests.MockLog.getCount());
        var networks = person.networks;
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual(0, person.networks.count);
    });
});