
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="..\..\Shared\JSUtil\Namespace.js" />

/// <reference path="..\Providers\Http\HttpResponse.js" />
/// <reference path="..\Providers\Requests\RequestContext.js" />
/// <reference path="..\Providers\Requests\SocialHttpRequest.js" />

People.RecentActivity.UnitTests.MockRequest = function(mockResponse, requestContext) {
    /// <summary>
    ///     Mock Request for unit test.
    /// </summary>
    /// <param name="mockResponse" type="People.RecentActivity.Providers.HttpResponse">The mock response.</param>
    /// <param name="requestContext" type="People.RecentActivity.Providers.RequestContext">The request context.</param>
    /// <field name="_mockResponse$1" type="People.RecentActivity.Providers.HttpResponse"></field>
    People.RecentActivity.Providers.SocialHttpRequest.call(this, 1, null, requestContext);
    Debug.assert(mockResponse != null, 'mockResponse');
    this._mockResponse$1 = mockResponse;
};

Jx.inherit(People.RecentActivity.UnitTests.MockRequest, People.RecentActivity.Providers.SocialHttpRequest);


People.RecentActivity.UnitTests.MockRequest.prototype._mockResponse$1 = null;

People.RecentActivity.UnitTests.MockRequest.prototype.execute = function(callback) {
    /// <summary>
    ///     Executes the request.
    /// </summary>
    /// <param name="callback" type="Function">The callback.</param>
    this._mockResponse$1.userState = callback;
    this.onResponseReceived(this._mockResponse$1);
};