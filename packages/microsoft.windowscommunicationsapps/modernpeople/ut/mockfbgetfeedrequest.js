
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\Http\HttpResponse.js" />
/// <reference path="..\Providers\Requests\FbGetFeedRequest.js" />
/// <reference path="..\Providers\Requests\RequestContext.js" />
/// <reference path="..\Providers\Uri.js" />
/// <reference path="FacebookData.js" />
/// <reference path="MockRequest.js" />
/// <reference path="TestData.js" />

People.RecentActivity.UnitTests.MockFbGetFeedRequest = function(response, requestContext) {
    /// <summary>
    ///     Provides a mock FbGetFeedRequest.
    /// </summary>
    /// <param name="response" type="People.RecentActivity.Providers.HttpResponse">The response.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_mockRequest$3" type="People.RecentActivity.UnitTests.MockRequest"></field>
    People.RecentActivity.Providers.FbGetFeedRequest.call(this, 0, null, requestContext);
    this._mockRequest$3 = new People.RecentActivity.UnitTests.MockRequest(response, requestContext);
};

Jx.inherit(People.RecentActivity.UnitTests.MockFbGetFeedRequest, People.RecentActivity.Providers.FbGetFeedRequest);


People.RecentActivity.UnitTests.MockFbGetFeedRequest.prototype._mockRequest$3 = null;

People.RecentActivity.UnitTests.MockFbGetFeedRequest.prototype.onExecute = function() {
    /// <summary>
    ///     Called when the request is about to execute.
    /// </summary>
    this._mockRequest$3.execute(this.onFeedEntriesRetrieved.bind(this));
};

People.RecentActivity.UnitTests.MockFbGetFeedRequest.prototype.onCreateGetFeedInfoRequest = function(url, requestContext) {
    /// <summary>
    ///     Called when creating get feed info request.
    /// </summary>
    /// <param name="url" type="People.RecentActivity.Providers.Uri">The URL.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <returns type="People.RecentActivity.Providers.IRequest"></returns>
    var payload = People.Social.format('{\r\n                    "data":[\r\n                        {0},\r\n                        {1},\r\n                        {2}\r\n                    ]\r\n                }', People.RecentActivity.UnitTests.FacebookData.getAlbumResultSetPayload(People.RecentActivity.UnitTests.TestData.albums), People.RecentActivity.UnitTests.FacebookData.getPhotoResultSetPayload(People.RecentActivity.UnitTests.TestData.album1Photos.concat(People.RecentActivity.UnitTests.TestData.album2Photos)), People.RecentActivity.UnitTests.FacebookData.getContactResultSetPayload(People.RecentActivity.UnitTests.TestData.contacts));
    var response = new People.RecentActivity.Providers.HttpResponse(200, '', payload, null, null);
    return new People.RecentActivity.UnitTests.MockRequest(response, requestContext);
};