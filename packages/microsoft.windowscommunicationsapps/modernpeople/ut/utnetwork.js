
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Social\Core\NetworkReactionInfo.js" />
/// <reference path="..\..\Social\Core\NetworkReactionInfoType.js" />
/// <reference path="..\..\Social\Model\Identity.js" />
/// <reference path="..\..\Social\Model\Network.js" />
/// <reference path="..\..\Social\Model\NetworkCapabilities.js" />
/// <reference path="..\..\Social\Providers\FeedProviderFactory.js" />
/// <reference path="MockFactory.js" />

Include.initializeFileScope(function () {
    // Provides tests for the <see cref="T:People.RecentActivity.Network" /> class.

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

    function getNetwork (tc) {
        /// <returns type="People.RecentActivity.Network"></returns>
        var person = People.RecentActivity.Identity.createIdentity('PERSON_ID');
        tc.areEqual(1, person.networks.count);
        return person.networks.item(0);
    }

    function getCapabilities (tc, commentsEnabled, reactions) {
        /// <param name="commentsEnabled" type="Boolean"></param>
        /// <param name="reactions" type="Array" elementType="networkReactionInfo"></param>
        /// <returns type="People.RecentActivity.NetworkCapabilities"></returns>
        var factory = People.RecentActivity.Providers.FeedProviderFactory.instance;
        factory.commentsEnabled = commentsEnabled;
        factory.reactions = reactions;
        var person = People.RecentActivity.Identity.createIdentity('PERSON_ID');
        tc.areEqual(1, person.networks.count);
        var network = person.networks.item(0);
        tc.isNotNull(network.capabilities);
        return network.capabilities;
    }

    Tx.test("networkTests.testConstructor", function (tc) {
        /// <summary>
        ///     Tests the constructor.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        var network = getNetwork(tc);
        tc.isNotNull(network.feed);
        tc.isNotNull(network.info);
        tc.isNotNull(network.capabilities);
        tc.areEqual('NETWORK_ID', network.info.id);
        tc.areEqual('NETWORK_NAME', network.name);
        tc.areEqual(network, network.feed.network);
    });

    Tx.test("networkTests.testCapabilities", function (tc) {
        /// <summary>
        ///     Tests the network capabilities.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        var capabilities = getCapabilities(tc, true, null);
        tc.isTrue(capabilities.commentsEnabled);
        tc.areEqual(1, capabilities.reactions.length);
        var reaction = capabilities.reactions[0];
        tc.isNotNull(reaction.info);
        tc.areEqual('REACTIONTYPE_ID_1', reaction.id);
        tc.areEqual('REACTIONTYPE_NAME_1', reaction.stringId);
        tc.areEqual('feed-icon', reaction.iconFeed);
        tc.areEqual('selfpage-icon', reaction.iconSelfPage);
    });

    Tx.test("networkTests.testCapabilitiesCommentsDisabled", function (tc) {
        /// <summary>
        ///     Tests the network capabilities, when comments are disabled.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        var capabilities = getCapabilities(tc, false, null);
        tc.isFalse(capabilities.commentsEnabled);
    });

    Tx.test("networkTests.testCapabilitiesNoReactions", function (tc) {
        /// <summary>
        ///     Test the network capabilities, no reactions.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        var capabilities = getCapabilities(tc, false, new Array(0));
        tc.areEqual(capabilities.reactions.length, 0);
    });

    Tx.test("networkTests.testCapabilitiesTwoReactions", function (tc) {
        /// <summary>
        ///     Test the network capabilities, two reactions.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        var reactions = [ People.RecentActivity.Core.create_networkReactionInfo('NWID_1', People.RecentActivity.Core.NetworkReactionInfoType.like, 'NWNAME_1', 'icon-feed', 'icon-selfpage', 'css-class', false, false), People.RecentActivity.Core.create_networkReactionInfo('NWID_2', People.RecentActivity.Core.NetworkReactionInfoType.like, 'NWNAME_2', 'icon-feed', 'icon-selfpage', 'css-class', false, false) ];
        var capabilities = getCapabilities(tc, false, reactions);
        tc.areEqual(2, capabilities.reactions.length);
        var nw1 = capabilities.reactions[0];
        tc.areEqual(reactions[0], nw1.info);
        tc.areEqual('NWID_1', nw1.id);
        tc.areEqual('NWNAME_1', nw1.stringId);
        tc.areEqual('icon-feed', nw1.iconFeed);
        tc.areEqual('icon-selfpage', nw1.iconSelfPage);
        var nw2 = capabilities.reactions[1];
        tc.areEqual(reactions[1], nw2.info);
        tc.areEqual('NWID_2', nw2.id);
        tc.areEqual('NWNAME_2', nw2.stringId);
        tc.areEqual('icon-feed', nw2.iconFeed);
        tc.areEqual('icon-selfpage', nw2.iconSelfPage);
    });
});