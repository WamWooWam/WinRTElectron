
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Social\Model\FeedEntry.js" />
/// <reference path="..\..\Social\Model\Identity.js" />
/// <reference path="..\..\Social\Model\ReactionCollection.js" />
/// <reference path="..\..\Social\Providers\FeedProviderFactory.js" />
/// <reference path="MockFactory.js" />
/// <reference path="MockLog.js" />

Include.initializeFileScope(function () {
    // Provides tests for the <see cref="T:People.RecentActivity.ReactionCollection" /> class.

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

    function getEntry (tc) {
        /// <returns type="People.RecentActivity.FeedEntry"></returns>
        var person = People.RecentActivity.Identity.createIdentity('PERSON_ID');
        tc.areEqual(1, person.networks.count);
        var network = person.networks.item(0);
        tc.isNotNull(network.feed);
        var feed = network.feed;
        feed.initialize();
        feed.refresh();
        tc.areEqual(2, feed.entries.count);
        // make sure to remove any old log entries.
        People.RecentActivity.UnitTests.MockLog.reset();
        // the first entry is the one with the comments.
        return feed.entries.item(feed.entries.count - 1);
    }

    Tx.test("reactionCollectionTests.testRefresh", function (tc) {
        /// <summary>
        ///     Refreshes the reactions.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        var userState = {};
        var entry = getEntry(tc);
        var reactions = entry.reactions;
        // check the reaction count first.
        tc.areEqual(1, reactions.item(0).count);
        tc.areEqual(1, reactions.item(0).totalCount);
        reactions.addListener("refreshcompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('ReactionCollectionTests.RefreshCompleted', [ e.sender, e ]);
        });
        reactions.refresh(userState);
        // make sure the appropriate calls were made.
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.RefreshReactions', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(entry.objectInfo, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual('ReactionCollectionTests.RefreshCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(reactions, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        // make sure the first reaction was removed, the second was added.
        tc.areEqual(1, reactions.item(0).count);
        tc.areEqual(1, reactions.item(0).totalCount);
        tc.isNotNull(reactions.item(0).type);
        tc.areEqual('CONTACT_ID_2', reactions.item(0).item(0).publisher.id);
    });

    Tx.test("reactionCollectionTests.testAddReaction", function (tc) {
        /// <summary>
        ///     Adds a reaction.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        var userState = {};
        var entry = getEntry(tc);
        var reactions = entry.reactions.item(0);
        var reactionTypes = entry.network.capabilities.reactions;
        // do some prelim checks.
        tc.areEqual(1, reactions.count);
        tc.areEqual(1, reactions.totalCount);
        tc.areEqual(1, reactionTypes.length);
        reactions.addListener("addreactioncompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('ReactionCollectionTests.AddReactionCompleted', [ e.sender, e ]);
        });
        // remove the existing reaction before adding a new one.
        reactions.remove(reactionTypes[0]);
        tc.areEqual(0, reactions.count);
        People.RecentActivity.UnitTests.MockLog.reset();
        // add the new reaction.
        reactions.add(userState);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.AddReaction', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(3, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(entry.objectInfo, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual(reactionTypes[0].info, (People.RecentActivity.UnitTests.MockLog.get(0).parameters[1]).type);
        tc.areEqual('ReactionCollectionTests.AddReactionCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(reactions, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        var args = People.RecentActivity.UnitTests.MockLog.get(1).parameters[1];
        tc.areEqual(userState, args.userState);
        tc.isNotNull(args.reaction);
        // validate the reaction we just added.
        tc.areEqual(1, reactions.count);
        tc.areEqual(1, reactions.totalCount);
        tc.areEqual(reactions.item(0), args.reaction);
        tc.areEqual('CONTACT_ID_1', reactions.item(0).publisher.id);
    });

    Tx.test("reactionCollectionTests.testRemoveReaction", function (tc) {
        /// <summary>
        ///     Removes a reaction.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        var userState = {};
        var entry = getEntry(tc);
        var reactions = entry.reactions.item(0);
        var reactionTypes = entry.network.capabilities.reactions;
        // validate the base state.
        tc.areEqual(1, reactions.count);
        tc.areEqual(1, reactions.totalCount);
        reactions.addListener("removereactioncompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('ReactionCollectionTests.RemoveReactionCompleted', [ e.sender, e ]);
        });
        // remove the reaction.
        reactions.remove(userState);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.RemoveReaction', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(3, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(entry.objectInfo, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual(reactionTypes[0].info, (People.RecentActivity.UnitTests.MockLog.get(0).parameters[1]).type);
        tc.areEqual('ReactionCollectionTests.RemoveReactionCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(reactions, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        var args = People.RecentActivity.UnitTests.MockLog.get(1).parameters[1];
        tc.areEqual(userState, args.userState);
        tc.isNotNull(args.reaction);
        // validate count.
        tc.areEqual(0, reactions.count);
        tc.areEqual(0, reactions.totalCount);
    });
});