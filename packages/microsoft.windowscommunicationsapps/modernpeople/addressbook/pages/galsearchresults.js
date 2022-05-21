
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ViewportPage.js" />

Jx.delayDefine(People, "GALSearchResultsPage", function () {

    var P = window.People;

    P.GALSearchResultsPage = /* @constructor*/function (host, options) {
        ///<summary>Creates the search results page.</summary>
        ///<param name="host" type="P.CpMain">The object that hosts search.</param>
        ///<param name="options" type="Object" optional="true">Unused</param>
        P.ViewportPage.call(this, host, options);
    };
    Jx.inherit(P.GALSearchResultsPage, P.ViewportPage);

    P.GALSearchResultsPage.prototype._createViewportChild = function (query, accountEmail) {
        ///<summary>Populate the viewport with the search results section</summary>
        ///<param name="query">The search query</param>
        ///<param name="accountEmail"/>The email address of the account associated with this query</param>
        var host = this._host;
        return new P.SearchResultsSection(host.getPlatform(), query, accountEmail, host.getHeader(), true);
    };

    P.GALSearchResultsPage.prototype._initViewportChild = Jx.fnEmpty;
});