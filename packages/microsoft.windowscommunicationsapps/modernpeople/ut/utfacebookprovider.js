
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
/// <reference path="TestData.js" />
/// <reference path="TestUtils.js" />

Include.initializeFileScope(function () {
    // Contains positive tests for <see cref="T:People.RecentActivity.Providers.FacebookProvider" />

    People.RecentActivity.UnitTests.FacebookProviderTests = function () {
        People.RecentActivity.UnitTests.FeedProviderTestBase.call(this);
    };
    Jx.inherit(People.RecentActivity.UnitTests.FacebookProviderTests, People.RecentActivity.UnitTests.FeedProviderTestBase);

    var fbProviderTests = new People.RecentActivity.UnitTests.FacebookProviderTests();

    function setup () {
        /// <summary>
        ///     Sets up the test.
        /// </summary>
        Jx.root = {
            getJobSet: function () {  return new MockJobSet(); }
        };
        fbProviderTests.baseSetUp(People.RecentActivity.Core.NetworkId.facebook, true);
        fbProviderTests.testFeedProvider.requestFactory = new People.RecentActivity.UnitTests.MockFacebookRequestFactory(true);
        new People.RecentActivity.Providers.SocialCache(People.RecentActivity.Core.NetworkId.facebook).getContact(People.RecentActivity.UnitTests.TestUtils.getUserContactInfo().id);
    }

    function cleanup () {
        /// <summary>
        ///     Tears down the test.
        /// </summary>
        fbProviderTests.baseTearDown(People.RecentActivity.Core.NetworkId.facebook);
        fbProviderTests.testFeedProvider.requestFactory = new People.RecentActivity.Providers.FacebookRequestFactory();
    }

    Tx.test("facebookProviderTests.testRefreshFeedEntries", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshFeedEntries(System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshFeedEntries(tc);
    });

    Tx.test("facebookProviderTests.testRefreshAlbums", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbums(System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshAlbums(tc);
    });

    Tx.test("facebookProviderTests.testRefreshAlbum", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshAlbum(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshAlbum(tc);
    });

    Tx.test("facebookProviderTests.testRefreshPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshPhoto(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshPhoto(tc);
    });

    Tx.test("facebookProviderTests.testRefreshComment", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshComments(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshComment(tc);
    });

    Tx.test("facebookProviderTests.testRefreshReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshReactions(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshReaction(tc);
    });

    Tx.test("facebookProviderTests.testRefreshPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.getFeedEntry(tc);
    });

    Tx.test("facebookProviderTests.testGetAlbum", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.getAlbum(tc);
    });

    Tx.test("facebookProviderTests.testGetPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.getPhoto(tc);
    });

    Tx.test("facebookProviderTests.testGetCachedFeedEntry", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.getCachedFeedEntry(tc);
        fbProviderTests.feedCache.addCacheEntry(fbProviderTests.testFeedProvider.contactId, [ People.RecentActivity.UnitTests.TestData.textEntries[0] ]);
        var info = People.RecentActivity.Core.create_feedObjectInfo('TextEntry1_ID', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.entry, null, null, 0, null, null, null, null);
        fbProviderTests.testFeedProvider.getCachedFeedObject(info, null);
    });

    Tx.test("facebookProviderTests.testGetCachedAlbum", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.getCachedAlbum(tc);
        fbProviderTests.albumCache.addCacheEntry(fbProviderTests.testFeedProvider.contactId, [ People.RecentActivity.UnitTests.TestData.albums[0] ]);
        var info = People.RecentActivity.Core.create_feedObjectInfo('Album1_Id', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photoAlbum, null, null, 0, null, null, null, null);
        fbProviderTests.testFeedProvider.getCachedFeedObject(info, null);
    });

    Tx.test("facebookProviderTests.testGetCachedPhoto", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetCachedFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.getCachedPhoto(tc);
        fbProviderTests.albumCache.addCacheEntry(fbProviderTests.testFeedProvider.contactId, [ People.RecentActivity.UnitTests.TestData.albums[1] ]);
        var info = People.RecentActivity.Core.create_feedObjectInfo('Photo4_Id', People.RecentActivity.Core.NetworkId.facebook, People.RecentActivity.Core.FeedObjectInfoType.photo, null, null, 0, null, null, null, null);
        fbProviderTests.testFeedProvider.getCachedFeedObject(info, null);
    });

    Tx.test("facebookProviderTests.testRemoveReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RemoveReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.removeReaction(tc);
    });

    Tx.test("facebookProviderTests.testAddComment", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddComment(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.CommentInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.addComment(tc);
    });

    Tx.test("facebookProviderTests.testAddReaction", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddReaction(People.RecentActivity.Core.FeedObjectInfo,People.RecentActivity.Core.ReactionInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.addReaction(tc);
    });

    Tx.test("facebookProviderTests.testRefreshNotifications", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.RefreshNotifications(System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.refreshNotifications(tc);
    });

    Tx.test("facebookProviderTests.testMarkNotificationsRead", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.MarkNotificationsRead(People.RecentActivity.Core.NotificationInfo[],System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.markNotificationsRead(tc);
    });

    Tx.test("facebookProviderTests.testGetUnreadNotificationsCount", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.GetUnreadNotificationsCount(System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();
        
        fbProviderTests.getUnreadNotificationsCount(tc);
    });

    Tx.test("facebookProviderTests.testAddFeedObject", function (tc) {
        /// <summary>
        ///     Tests <see cref="M:People.RecentActivity.Providers.FeedProvider.AddFeedObject(People.RecentActivity.Core.FeedObjectInfo,System.Object)" /> on success.
        /// </summary>
        /// <param name="tc" type="Tx.TestContext"/>
        this.cleanup = cleanup;
        setup();

        fbProviderTests.addFeedObject(tc);
    });
});