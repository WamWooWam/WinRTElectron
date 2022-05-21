
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\Http\HttpResponse.js" />
/// <reference path="..\Providers\Requests\FbGetNotificationsRequest.js" />
/// <reference path="..\Providers\Requests\RequestContext.js" />
/// <reference path="..\Providers\Uri.js" />
/// <reference path="FacebookData.js" />
/// <reference path="MockRequest.js" />
/// <reference path="TestData.js" />

People.RecentActivity.UnitTests.MockFbGetNotificationsRequest = function(response, requestContext) {
    /// <summary>
    ///     Provides a mock FbGetFeedRequest.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.HttpResponse">The response.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_mockRequest$3" type="People.RecentActivity.UnitTests.MockRequest"></field>
    People.RecentActivity.Providers.FbGetNotificationsRequest.call(this, 0, null, requestContext);
    this._mockRequest$3 = new People.RecentActivity.UnitTests.MockRequest(response, requestContext);
};

Jx.inherit(People.RecentActivity.UnitTests.MockFbGetNotificationsRequest, People.RecentActivity.Providers.FbGetNotificationsRequest);


People.RecentActivity.UnitTests.MockFbGetNotificationsRequest.prototype._mockRequest$3 = null;

People.RecentActivity.UnitTests.MockFbGetNotificationsRequest.prototype.onExecute = function() {
    /// <summary>
    ///     Called when the request is about to execute.
    /// </summary>
    this._mockRequest$3.execute(this.onNotificationsRetrieved.bind(this));
};

People.RecentActivity.UnitTests.MockFbGetNotificationsRequest.prototype.onCreateMoreInfoRequest = function(url, requestContext) {
    /// <summary>
    ///     Called when creating get feed info request.
    /// </summary>
    /// <param name="url" type="People.RecentActivity.Providers.Uri">The URL.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.Social.format('{ "data":[{0},{1},{2}] }', People.RecentActivity.UnitTests.FacebookData.getNotificationsContactIdPayload(People.RecentActivity.UnitTests.TestData.notifications), People.RecentActivity.UnitTests.FacebookData.getNotificationsPhotoIdPayload(People.RecentActivity.UnitTests.TestData.notifications), People.RecentActivity.UnitTests.FacebookData.getNotificationsAlbumIdPayload(People.RecentActivity.UnitTests.TestData.notifications));
    var response = new People.RecentActivity.Providers.HttpResponse(200, '', payload, null, null);
    return new People.RecentActivity.UnitTests.MockRequest(response, requestContext);
};