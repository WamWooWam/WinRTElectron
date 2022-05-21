
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Core\FeedObjectInfoType.js" />
/// <reference path="..\Providers\Http\HttpResponse.js" />
/// <reference path="..\Providers\Requests\RequestContext.js" />
/// <reference path="FacebookData.js" />
/// <reference path="MockFbGetFeedRequest.js" />
/// <reference path="MockFbGetNotificationsRequest.js" />
/// <reference path="MockRequest.js" />
/// <reference path="TestData.js" />

People.RecentActivity.UnitTests.MockFacebookRequestFactory = function(success) {
    /// <summary>
    ///     Provides a mock request factory for unit test.
    /// </summary>
    /// <param name="success" type="Boolean">The requests created will be successful if set to <c>true</c>, otherwise <c>false</c>.</param>
    /// <field name="_success" type="Boolean"></field>
    this._success = success;
};


People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype._success = false;

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetFeedRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var entries = [ People.RecentActivity.UnitTests.TestData.linkEntries[0], People.RecentActivity.UnitTests.TestData.textEntries[0], People.RecentActivity.UnitTests.TestData.videoEntries[0], People.RecentActivity.UnitTests.TestData.albumEntries[0], People.RecentActivity.UnitTests.TestData.photoEntries[0] ];
    var payload = People.RecentActivity.UnitTests.FacebookData.getFeedPayload(entries);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockFbGetFeedRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetAlbumsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get albums.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.refreshAlbumsPayload(People.RecentActivity.UnitTests.TestData.albums);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createRefreshAlbumRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh album.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var album = People.RecentActivity.UnitTests.TestData.albums[0];
    album.data.totalCount = 2;
    
    var payload = People.RecentActivity.UnitTests.FacebookData.refreshAlbumPayload(album, [ People.RecentActivity.UnitTests.TestData.album1Photos[2], People.RecentActivity.UnitTests.TestData.album1Photos[0] ]);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createRefreshPhotoRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to refresh photo.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.refreshPhotoPayload(People.RecentActivity.UnitTests.TestData.album2Photos[0], People.RecentActivity.UnitTests.TestData.photoTags);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get a feed object.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = null;
    switch (requestContext.feedObject.type) {
        case People.RecentActivity.Core.FeedObjectInfoType.entry:
            payload = People.RecentActivity.UnitTests.FacebookData.getFeedPayload([ People.RecentActivity.UnitTests.TestData.linkEntries[0] ]);
            requestContext.expectedResponse = 1;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photoAlbum:
            payload = People.RecentActivity.UnitTests.FacebookData.getAlbumsPayload([ People.RecentActivity.UnitTests.TestData.albums[0] ]);
            requestContext.expectedResponse = 7;
            break;
        case People.RecentActivity.Core.FeedObjectInfoType.photo:
            payload = People.RecentActivity.UnitTests.FacebookData.getPhotosPayload(People.RecentActivity.UnitTests.TestData.album2Photos);
            requestContext.expectedResponse = 8;
            break;
    }

    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    if (requestContext.feedObject.type === People.RecentActivity.Core.FeedObjectInfoType.entry) {
        return new People.RecentActivity.UnitTests.MockFbGetFeedRequest(mockResponse, requestContext);
    }

    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createAddFeedObjectRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a new feed object to the current feed.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.getFeedObjectPayload(People.RecentActivity.UnitTests.TestData.addFeedObject);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetCommentsRequest = function(requestContext) {
    /// <summary>
    ///     Create a request to get comments for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.getCommentsPayload(People.RecentActivity.UnitTests.TestData.comments);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetReactionsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get reactions for a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.getLikesPayload(People.RecentActivity.UnitTests.TestData.reactions);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createAddCommentRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a comment to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.getCommentAddedPayload(People.RecentActivity.UnitTests.TestData.comments[0]);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? payload : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createAddReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to add a reaction to a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? 'true' : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createRemoveReactionRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to remove a reaction from a feed entry.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var mockResponse = new People.RecentActivity.Providers.HttpResponse((this._success) ? 200 : 500, '', (this._success) ? 'true' : '', null, null);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createRefreshNotificationsRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's notifications.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.RecentActivity.UnitTests.FacebookData.getNotificationsPayload(People.RecentActivity.UnitTests.TestData.notifications);
    var mockResponse = new People.RecentActivity.Providers.HttpResponse(200, '', (this._success) ? payload : '{ "error":{"code":190,"type":"OAuthException","message":"Error validating access token: Session has expired at unix time 1307127600. The current unix time is 1308183485."} }', null, requestContext.userState);
    return new People.RecentActivity.UnitTests.MockFbGetNotificationsRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createMarkNotificationsReadRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to mark the user's notifications read.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var mockResponse = new People.RecentActivity.Providers.HttpResponse(200, '', (this._success) ? 'true' : '{"error_code":114,"error_msg":"param notification_ids must be an array.","request_args":[{"key":"method","value":"notifications.markRead"},{"key":"access_token","value":"30713015083|9daa6ff219d96acff311315e-24400060|XtnsqW1ExB0Y16XyH4Jx9Nof1_c"},{"key":"format","value":"json"},{"key":"notification_ids","value":"[object Object]"}]}', null, requestContext.userState);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};

People.RecentActivity.UnitTests.MockFacebookRequestFactory.prototype.createGetUnreadNotificationsCountRequest = function(requestContext) {
    /// <summary>
    ///     Creates a request to get the user's unread notifications count.
    /// </summary>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = '{ "data":[{"anon":""},{"anon":""},{"anon":""},{"anon":""},{"anon":""},{"anon":""},{"anon":""},{"anon":""},{"anon":""}] }';
    var error = '{ "error":{"code":190,"type":"OAuthException","message":"Error validating access token: Session has expired at unix time 1307127600. The current unix time is 1308183485."} }';
    var mockResponse = new People.RecentActivity.Providers.HttpResponse(200, '', (this._success) ? payload : error, null, requestContext.userState);
    return new People.RecentActivity.UnitTests.MockRequest(mockResponse, requestContext);
};