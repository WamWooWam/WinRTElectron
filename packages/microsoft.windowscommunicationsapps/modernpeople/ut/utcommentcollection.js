
// Copyright (C) Microsoft Corporation.  All rights reserved.

/*global Tx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\..\social\Model\CommentCollection.js" />
/// <reference path="..\..\social\Model\FeedEntry.js" />
/// <reference path="..\..\social\Model\Identity.js" />
/// <reference path="..\..\social\Providers\FeedProviderFactory.js" />
/// <reference path="MockFactory.js" />
/// <reference path="MockLog.js" />

Include.initializeFileScope(function () {

    // provides tests for the <see cref="T:People.RecentActivity.CommentCollection" /> class.

    function setup () {
        /// <summary>
        ///     Initializes the test cases.
        /// </summary>
        People.RecentActivity.Providers.FeedProviderFactory.instance = new People.RecentActivity.UnitTests.MockFactory();
    }

    function cleanup () {
        /// <summary>
        ///     Tears down the test cases.
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

    Tx.test("commentCollectionTests.testRefresh", function (tc) {
        /// <summary>
        ///     Tests the <see cref="M:People.RecentActivity.CommentCollection.Refresh(System.Object)" /> method.
        /// </summary>
        tc.cleanup = cleanup;
        setup();
 
        var userState = {};
        var entry = getEntry(tc);
        var comments = entry.comments;
        // ensure base count is correct.
        tc.areEqual(1, comments.count);
        tc.areEqual(2, comments.totalCount);
        tc.areEqual('COMMENT_ID_1', comments.item(0).id);
        comments.addListener("refreshcompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('CommentCollectionTests.RefreshCompleted', [ e.sender, e ]);
        });
        comments.refresh(userState);
        // validate calls into the provider.
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.RefreshComments', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(entry.objectInfo, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual('CommentCollectionTests.RefreshCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(comments, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        // validate new comments.
        tc.areEqual(2, comments.count);
        tc.areEqual(2, comments.totalCount);
        tc.areEqual('COMMENT_ID_3', comments.item(0).id);
        tc.areEqual('COMMENT_TEXT_3', comments.item(0).text);
        tc.isNotNull(comments.item(0).publisher);
        tc.areEqual('CONTACT_ID_2', comments.item(0).publisher.id);
        tc.areEqual('COMMENT_ID_2', comments.item(1).id);
        tc.areEqual('COMMENT_TEXT_2', comments.item(1).text);
        tc.isNotNull(comments.item(1).publisher);
        tc.areEqual('CONTACT_ID_2', comments.item(1).publisher.id);
    });

    Tx.test("commentCollectionTests.testAdd", function (tc) {
        /// <summary>
        ///     Tests the <see cref="M:People.RecentActivity.CommentCollection.Add(System.String,System.Object)" /> method.
        /// </summary>
        tc.cleanup = cleanup;
        setup();
 
        var userState = {};
        var entry = getEntry(tc);
        var comments = entry.comments;
        comments.addListener("addcommentcompleted", function(e) {
            People.RecentActivity.UnitTests.MockLog.add('CommentCollectionTests.AddCommentCompleted', [ e.sender, e ]);
        });
        // add the comment, go!
        comments.add('COMMENT_TEXT_4', userState);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.getCount());
        tc.areEqual('MockProvider.AddComment', People.RecentActivity.UnitTests.MockLog.get(0).name);
        tc.areEqual(3, People.RecentActivity.UnitTests.MockLog.get(0).parameters.length);
        tc.areEqual(entry.objectInfo, People.RecentActivity.UnitTests.MockLog.get(0).parameters[0]);
        tc.areEqual('COMMENT_TEXT_4', (People.RecentActivity.UnitTests.MockLog.get(0).parameters[1]).text);
        tc.areEqual('CommentCollectionTests.AddCommentCompleted', People.RecentActivity.UnitTests.MockLog.get(1).name);
        tc.areEqual(2, People.RecentActivity.UnitTests.MockLog.get(1).parameters.length);
        tc.areEqual(comments, People.RecentActivity.UnitTests.MockLog.get(1).parameters[0]);
        tc.areEqual(userState, (People.RecentActivity.UnitTests.MockLog.get(1).parameters[1]).userState);
        var args = People.RecentActivity.UnitTests.MockLog.get(1).parameters[1];
        tc.areEqual(userState, args.userState);
        tc.isNotNull(args.comment);
        tc.areEqual('COMMENT_ID_4', args.comment.id);
        tc.areEqual('COMMENT_TEXT_4', args.comment.text);
        tc.isNotNull(args.comment.publisher);
        tc.areEqual('CONTACT_ID_1', args.comment.publisher.id);
        // also make the comment was added to the collection.
        tc.areEqual(2, comments.count);
        tc.areEqual(3, comments.totalCount);
    });

});
