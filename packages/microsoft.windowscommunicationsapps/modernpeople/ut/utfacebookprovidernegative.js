
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Tx,Jx,People,Include*/

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\CommentInfo.js" />
/// <reference path="..\Core\FeedObjectInfo.js" />
/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Core\NetworkId.js" />
/// <reference path="..\Core\NotificationInfo.js" />
/// <reference path="..\Core\ReactionInfo.js" />
/// <reference path="..\Providers\Cache\SocialCache.js" />
/// <reference path="..\Providers\Providers\FacebookProvider.js" />
/// <reference path="..\Providers\RequestFactories\FacebookRequestFactory.js" />
/// <reference path="FeedProviderTestBase.js" />
/// <reference path="MockFacebookRequestFactory.js" />
/// <reference path="TestUtils.js" />

Include.initializeFileScope(function () {
    //Contains negative tests for <see cref="T:People.RecentActivity.Providers.FacebookProvider" />

    People.RecentActivity.UnitTests.FacebookProviderNegativeTests = function () {
        People.RecentActivity.UnitTests.FeedProviderTestBase.call(this);
    };
    Jx.inherit(People.RecentActivity.UnitTests.FacebookProviderNegativeTests, People.RecentActivity.UnitTests.FeedProviderTestBase);

    var fbProviderNegativeTests = new People.RecentActivity.UnitTests.FacebookProviderNegativeTests();
    
    function setup () {
        /// <summary>
        ///     Sets up the test.
        /// </summary>
        Jx.root = {
            getJobSet: function () {  return new MockJobSet(); }
        };
        fbProviderNegativeTests.baseSetUp(People.RecentActivity.Core.NetworkId.facebook, false);
        fbProviderNegativeTests.testFeedProvider.requestFactory = new People.RecentActivity.UnitTests.MockFacebookRequestFactory(false);
        new People.RecentActivity.Providers.SocialCache(People.RecentActivity.Core.NetworkId.facebook).getContact(People.RecentActivity.UnitTests.TestUtils.getUserContactInfo().id);
    }

    function cleanup () {
        /// <summary>
        ///     Tears down the test.
        /// </summary>
        fbProviderNegativeTests.baseTearDown(People.RecentActivity.Core.NetworkId.facebook);
        fbProviderNegativeTests.testFeedProvider.requestFactory = new People.RecentActivity.Providers.FacebookRequestFactory();
    }

    Tx.test("facebookProviderNegativeTests.testRefreshFeedEntries", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshFeedEntries(System.Object)" /> on failure.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshFeedEntries(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshAlbums", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbums(System.Object)" /> on failure.
        /// </summary>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshAlbums(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshAlbum", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbum(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        this.cleanup = cleanup;
        setup();

        fbProviderNegativeTests.refreshAlbum(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshPhoto(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshPhoto(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshComment", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshComments(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshComment(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshReactions(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshReaction(tc);
    });

    Tx.test("facebookProviderNegativeTests.testGetFeedEntry", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.getFeedEntry(tc);
    });

    Tx.test("facebookProviderNegativeTests.testGetAlbum", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.getAlbum(tc);
    });

    Tx.test("facebookProviderNegativeTests.testGetPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.getPhoto(tc);
    });

    Tx.test("facebookProviderNegativeTests.testGetCachedFeedEntry", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.getCachedFeedEntry(tc);
        var info = People.RecentActivity.Core.create_feedObjectInfo('TextEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, null, null, 0, null, null, null, null);
        fbProviderNegativeTests.testFeedProvider.getCachedFeedObject(info, null);
    });

    Tx.test("facebookProviderNegativeTests.testRemoveReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RemoveReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.removeReaction(tc);
    });

    Tx.test("facebookProviderNegativeTests.testAddComment", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddComment(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.CommentInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.addComment(tc);
    });

    Tx.test("facebookProviderNegativeTests.testAddReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.addReaction(tc);
    });

    Tx.test("facebookProviderNegativeTests.testRefreshNotifications", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshNotifications(System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.refreshNotifications(tc);
    });

        this.cleanup = cleanup;
        setup();
        
    Tx.test("facebookProviderNegativeTests.testMarkNotificationsRead", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.MarkNotificationsRead(People.RecentActivity.Core.NotificationInfo[],System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        fbProviderNegativeTests.markNotificationsRead(tc);
    });

    Tx.test("facebookProviderNegativeTests.testGetUnreadNotificationsCount", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetUnreadNotificationsCount(System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.getUnreadNotificationsCount(tc);
    });

    Tx.test("facebookProviderNegativeTests.testAddFeedObject", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on failure.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderNegativeTests.addFeedObject(tc);
    });
});
