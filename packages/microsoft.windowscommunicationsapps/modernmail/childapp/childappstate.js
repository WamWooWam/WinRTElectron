
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail, "AppState", function () {
    "use strict";

    Mail.AppState = /* @constructor*/function (platform) {
        Debug.Mail.log("Mail.AppState Constructor Begin ");
        this._platform = platform;
        this._selectedAccount = null;
        this._selectedView = null;
        this._selectedMessages = [];
        this._lastSelectedMessage = null;
        Debug.Mail.log("Mail.AppState Constructor End ");
    };

    var proto = Mail.AppState.prototype;

    proto.getStartupAccount = function () {
        return null;
    };

    proto.getStartupView = function () {
        return null;
    };

    proto.addRestartCheck = function () {
        // Child windows don't have restart checks
    };

    proto.setSelectedMessages = function (displayed, index, messages) {
        this._lastSelectedMessage = displayed;
        this._selectedMessages = messages;
    };

    proto.setSelectedView = function (view) {
        this._selectedView = view;
        this._selectedAccount = view ? view.account : null;
    };

    Object.defineProperty(proto, "lastSelectedMessageId", {
        get: function () { return this._lastSelectedMessageId; }, enumerable: true
    });
    Object.defineProperty(proto, "lastSelectedMessageIndex", {
        get: function () {
            var lastIndex = this._lastSelectedMessageIndex;
            return Jx.isNumber(lastIndex) ? lastIndex : -1;
        }, enumerable: true
    });

    Object.defineProperty(proto, "selectedAccount", {
        get: function () {
            return this._selectedAccount ? this._selectedAccount.platformObject : null;
        }, enumerable: true
    });
    Object.defineProperty(proto, "selectedMessages", {
        get: function () {
            return this._selectedMessages;
        }, enumerable: true
    });
    Object.defineProperty(proto, "lastSelectedMessage", {
        get: function () {
            return this._lastSelectedMessage;
        }, enumerable: true
    });

});
