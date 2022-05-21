
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\Social\Model\ContactCache.js" />
/// <reference path="..\..\Social\Model\Feed.js" />
/// <reference path="..\..\Social\Model\FeedEntry.js" />
/// <reference path="..\..\Social\Model\FeedEntryType.js" />
/// <reference path="..\..\Social\Model\Identity.js" />
/// <reference path="..\..\Social\Providers\FeedProviderFactory.js" />
/// <reference path="MockFactory.js" />
/// <reference path="MockLog.js" />

Include.initializeFileScope(function () {
    //Tests for the <see cref="T:People.RecentActivity.Feed" /> class.
    
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

    function getFeed (tc) {
        /// <returns type="People.RecentActivity.Feed"></returns>
        var person = People.RecentActivity.Identity.createIdentity('PERSON_ID');
        tc.areEqual(1, person.networks.count);
        var network = person.networks.item(0);
        tc.isNotNull(network.feed);
        People.RecentActivity.UnitTests.MockLog.reset();
        return network.feed;
    }

    Tx.test("feedTests.testConstructor", function (tc) {
        /// <summary>
        ///     Tests the basic constructor.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        var feed = getFeed(tc);
        tc.isNotNull(feed.entries);
        tc.isNotNull(feed.network);
    });

    function validateEntry (tc, entry, id, type, publisher, timestamp, via, commentCount, reactionCount) {
        /// <param name="entry" type="People.RecentActivity.FeedEntry"></param>
        /// <param name="id" type="String"></param>
        /// <param name="type" type="People.RecentActivity.FeedEntryType"></param>
        /// <param name="publisher" type="String"></param>
        /// <param name="timestamp" type="Date"></param>
        /// <param name="via" type="String"></param>
        /// <param name="commentCount" type="Number" integer="true"></param>
        /// <param name="reactionCount" type="Number" integer="true"></param>
        tc.isNotNull(entry.entryInfo);
        // validate basic information
        tc.areEqual(id, entry.id);
        tc.areEqual(type, entry.entryType);
        tc.areEqual(timestamp.getTime(), entry.timestamp.getTime());
        tc.areEqual(via, entry.via);
        // validate type of data
        tc.isNotNull(entry.data);
        // validate comment/reaction counts.
        tc.areEqual(commentCount, entry.comments.totalCount);
        tc.areEqual(reactionCount, entry.reactions.item(0).totalCount);
        // validate publisher.
        tc.areEqual('CONTACT_ID_' + publisher, entry.publisher.id);
        tc.areEqual('CONTACT_SOURCE_' + publisher, entry.publisher.sourceId);
        tc.areEqual('CONTACT_NAME_' + publisher, entry.publisher.name);
        tc.areEqual('http://picture-' + publisher, entry.publisher.picture);
    }

    Tx.test("feedTests.testInitialization", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Feed.Initialize(System.Object)" />
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        People.RecentActivity.ContactCache.clear();
        var feed = getFeed(tc);
        feed.initialize();
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.RefreshFeedEntries', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(2, feed.entries.count);
        // validate the entries we received.
        validateEntry(tc, feed.entries.item(1), 'ENTRY_ID_1', 1, '1', new Date(2011, 2, 18, 13, 37), 'VIA_1', 1, 1);
        validateEntry(tc, feed.entries.item(0), 'ENTRY_ID_2', 2, '2', new Date(2011, 2, 18, 23, 59), 'VIA_2', 0, 0);
    });

    Tx.test("feedTests.testInitializationHydration", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Feed.Initialize(System.Object)" /> for hydration.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        People.RecentActivity.ContactCache.clear();
        var feed = getFeed(tc);
        feed.initializeFromHydration();
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.GetCachedFeedEntries', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(1, feed.entries.count);
        // validate the entries we received.
        validateEntry(tc, feed.entries.item(0), 'ENTRY_ID_1', 1, '1', new Date(2011, 2, 18, 13, 37), 'VIA_1', 1, 1);
    });

    Tx.test("feedTests.testRefresh", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Feed.Refresh(System.Object)" />
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        People.RecentActivity.ContactCache.clear();
        var feed = getFeed(tc);
        feed.initialize();
        // make sure there are no old log entries.
        People.RecentActivity.UnitTests.MockLog.reset();
        var userState = {};
        feed.addListener("refreshcompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('FeedTests.RefreshCompleted', [ e.sender, e ]);
        });
        feed.refresh(userState);
        // ensure we made the proper calls
        tc.areEqual('MockProvider.RefreshFeedEntries', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(1, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(userState, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual('FeedTests.RefreshCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(feed, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        // there were two entries before. we should've gotten one new one, one updated, and one removed.
        tc.areEqual(2, feed.entries.count);
        validateEntry(tc, feed.entries.item(1), 'ENTRY_ID_1', 1, '1', new Date(2011, 2, 18, 13, 37), 'VIA_1', 2, 1);
        validateEntry(tc, feed.entries.item(0), 'ENTRY_ID_3', 1, '1', new Date(2011, 2, 28, 12, 15), 'VIA_3', 0, 2);
    });

});