
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "SearchAccessibility", function () {
    "use strict";

    Mail.SearchAccessibility = function (searchCollection, statusElement) {
        Debug.assert(Jx.isInstanceOf(searchCollection, Mail.SearchCollection));
        Debug.assert(Jx.isHTMLElement(statusElement));

        this._searchCollection = searchCollection;
        this._announcer = new Mail.Announcer(statusElement);

        this._onSearchStarted();

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(searchCollection, "endChanges", this._onEndChanges, this),
            new Mail.EventHook(searchCollection, "searchComplete", this._onSearchComplete, this),
            new Mail.EventHook(searchCollection, "searchError", this._onSearchError, this),
            this._announcer
        );
    };

    var MSAProto = Mail.SearchAccessibility.prototype;

    MSAProto.dispose = function () {
        this._disposer.dispose();
        this._disposer = null;
        this._statusElement = null;
        this._searchCollection = null;
        this._announcer = null;
    };

    MSAProto._onSearchStarted = function () {
        this._announcer.speak(Jx.res.getString("mailSearchProgress"));
    };

    MSAProto._onEndChanges = function () {
        var count = this._searchCollection.count;
        if (count === 0) {
            return;
        }
        var resId = count === 1 ? "mailMessageListNarratorSearchProgressSingular" : "mailMessageListNarratorSearchProgressPlural";
        this._announcer.speak(Jx.res.loadCompoundString(resId, count));
    };

    MSAProto._onSearchComplete = function () {
        var resId = null;
        var count = this._searchCollection.count;
        if (count === 0) {
            resId = "mailMessageListNarratorEmptySearch";
        } else if (count === 1) {
            resId = "mailMessageListNarratorSearchCompleteSingular";
        } else {
            resId = "mailMessageListNarratorSearchCompletePlural";
        }

        this._announcer.speak(Jx.res.loadCompoundString(resId, count));
    };

    MSAProto._onSearchError = function () {
        this._announcer.speak(Jx.res.getString("mailSearchError"));
    };

});
