
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,Microsoft*/
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "Selection", function () {
    "use strict";

    var Selection = Mail.Worker.Selection = function (platform) {
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        _markStart("ctor");
        this._platform = platform;
        this._scores = [];
        this._conversationId = null;
        this._viewId = null;
        this._accountId = null;
        this._currentScrubber = null;
        this._disposer = new Mail.Disposer();

        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    Selection.prototype = {
        dispose: function () {
            this._disposer.dispose();
            this._scores = [];
        },
        onSelectionChanged: function (evt) {
            Debug.assert(Jx.isNonEmptyString(evt.messageType));
            var oldValue, newValue = evt.message.newValue;
            var logStr = "onSelectionChanged-" + evt.messageType;
            _markStart(logStr);
            switch(evt.messageType) {
                case "accountChanged":
                    if (Jx.isNonEmptyString(newValue) && (this._accountId !== newValue)) {
                        oldValue = this._accountId;
                        this._accountId = newValue;
                        this._updateProperty("accountId", oldValue, newValue);
                    }
                    break;
                case "viewChanged":
                    if (Jx.isNonEmptyString(newValue) && (this._viewId !== newValue)) {
                        oldValue = this._viewId;
                        this._viewId = newValue;
                        this._updateViewProperty(oldValue, newValue);
                    }
                    break;
                case "messageChanged":
                    if (Jx.isNonEmptyString(newValue)) {
                        if (this._currentScrubber) {
                            this._disposer.disposeNow(this._currentScrubber);
                            this._currentScrubber = null;
                        }
                        var platform = this._platform;
                        var newMessage = platform.mailManager.loadMessage(newValue);
                        if (newMessage && !newMessage.pendingRemoval) {
                            var account = Mail.Account.load(newMessage.accountId, platform);
                            this._currentScrubber = this._disposer.add(new Mail.Worker.AsyncMessageScrubber(platform, new Mail.UIDataModel.MailMessage(newMessage, account), null, null, Mail.Priority.workerCurrentSelectionScrubber));
                            var newConversationId = newMessage.parentConversationId;
                            if (!Jx.isNonEmptyString(newConversationId)) {
                                newConversationId = null;
                            }
                            if (this._conversationId !== newConversationId) {
                                oldValue = this._conversationId;
                                this._conversationId = newConversationId;
                                this._updateProperty("parentConversationId", oldValue, newConversationId);
                            }
                        }
                    }
                    break;
                default:
                    _mark("onSelectionChanged: Unknown messageType: " + evt.messageType);
                    Debug.assert(false, "onSelectionChanged: Unknown messageType: " + evt.messageType);
                    break;
            }
            _markStop(logStr);
        },
        _updateProperty: function (property, oldValue, newValue) {
            Debug.assert(Jx.isNonEmptyString(property));
            Debug.assert(Jx.isNonEmptyString(oldValue) || Jx.isNonEmptyString(newValue));
            this._scores.forEach(function (score) {
                var scoreProperty = score[property];
                Debug.assert(Jx.isString(scoreProperty));
                if (scoreProperty == newValue) {
                    score.adjust(property, false /*old*/);
                }
                if (scoreProperty == oldValue) {
                    score.adjust(property, true /*old*/);
                }
            });
        },
        _updateViewProperty: function (oldViewId, newViewId) {
            Debug.assert(Jx.isNonEmptyString(oldViewId) || Jx.isNonEmptyString(newViewId));
            this._scores.forEach(function (score) {
                if (Jx.isNonEmptyString(newViewId) && score.message.isInView(newViewId)) {
                    score.adjust("viewId", false /*old*/);
                }
                if (Jx.isNonEmptyString(oldViewId) && score.message.isInView(oldViewId)) {
                    score.adjust("viewId", true /*old*/);
                }
            });
        },
        get viewId() { return this._viewId; },
        get accountId() { return this._accountId; },
        get parentConversationId() { return this._conversationId; },
        addScore: function (score) {
            Debug.assert(Jx.isInstanceOf(score, Mail.Worker.Score));
            this._scores.push(score);
        },
        removeScore: function (score) {
            var index = this._scores.indexOf(score);
            Debug.assert(index >= 0);
            this._scores.splice(index, 1);
        }
    };

    function _mark(s) { Jx.mark("Selection:" + s); }
    function _markStart(s) { Jx.mark("Selection." + s + ",StartTA,Selection"); }
    function _markStop(s) { Jx.mark("Selection." + s + ",StopTA,Selection"); }
    //function _markAsyncStart(s) { Jx.mark("Selection:" + s + ",StartTM,Selection"); }
    //function _markAsyncStop(s) { Jx.mark("Selection:" + s + ",StopTM,Selection"); }

});

