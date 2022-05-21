
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "Score", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var Score = Mail.Worker.Score = function (platform, message, selection, onUpdate, onUpdateContext) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Worker.Selection));
        Debug.assert(Jx.isFunction(onUpdate));
        this._platform = platform;
        this._message = message;
        this._selection = selection;
        this._onUpdate = { func: onUpdate, context: onUpdateContext };
        this._selection.addScore(this);
        this._score = 0;
        this.update();
        Debug.only(Object.seal(this));
        _markStop("ctor");
    };
    Score.compare = function (scoreA, scoreB) {
        Debug.assert(Jx.isInstanceOf(scoreA, Score));
        Debug.assert(Jx.isInstanceOf(scoreB, Score));
        return (scoreB.score - scoreA.score) || (scoreB.message.bestDate - scoreA.message.bestDate);
    };
    var Factors = Score.Factors = {
        currentConversation: 100,
        currentView: 100,
        currentAccount: 50,
        inInbox: 30,
        inSentItems: 20,
        inOutbox: -500,
        isDeleted: -10,
        isJunk: -250,
        isDraft: -500,
        isFlagged: 30,
        isFromPinnedPerson: 25,
        isInPinnedFolderView: 20,
        isUnread: 75
    };
    var AdjustmentReason = Score.AdjustmentReason = {
        "accountId": Factors.currentAccount,
        "viewId": Factors.currentView,
        "parentConversationId": Factors.currentConversation
    };
    Score.prototype = {
        dispose: function () {
            this._selection.removeScore(this);
            this._message = null;
            this._onUpdate = null;
        },
        get accountId() {
            return this._message.accountId;
        },
        get parentConversationId() {
            return this._message.parentConversationId;
        },
        get score() {
            return this._score;
        },
        get message() {
            return this._message;
        },
        adjust: function (reason, old) {
            Debug.assert(Jx.isValidNumber(AdjustmentReason[reason]));
            Debug.assert(Jx.isBoolean(old));
            var adjustment = AdjustmentReason[reason];
            if (old) {
                adjustment *= -1;
            }
            this._score += adjustment;
            this._onUpdate.func.call(this._onUpdate.context);
        },
        _calculateScore: function () {
            _markStart("_calculateScore");
            var score = 0;
            [   this._currentConversation,
                this._currentView,
                this._currentAccount,
                this._inInbox,
                this._inSentItems,
                this._inOutbox,
                this._isDeleted,
                this._isJunk,
                this._isDraft,
                this._isFlagged,
                this._isFromPinnedPerson,
                this._isInPinnedFolderView,
                this._isUnread
            ].forEach(function (func) {
                    score += func.call(this);
                }, this);
            _markStop("_calculateScore");
            return score;
        },
        update: function () {
            if (this._message.pendingRemoval) {
                this._score = -100000;
                return;
            }
            _markStart("update");
            this._score = this._calculateScore();
            _markStop("update");
        },
        _currentConversation: function () {
            var applies = (this._message.parentConversationId === this._selection.parentConversationId);
            return applies ? Factors.currentConversation : 0;
        },
        _currentView: function () {
            var applies = (Jx.isNonEmptyString(this._selection.viewId) && this._message.isInView(this._selection.viewId));
            return applies ? Factors.currentView : 0;
        },
        _currentAccount: function () {
            var applies = (this._message.accountId === this._selection.accountId);
            return applies ? Factors.currentAccount : 0;
        },
        _inInbox: function () {
            return this._message.isInInbox ? Factors.inInbox : 0;
        },
        _inSentItems: function () {
            return this._message.isInSentItems ? Factors.inSentItems : 0;
        },
        _inOutbox: function () {
            var applies = this._message.isInOutbox;
            return applies ? Factors.inOutbox : 0;
        },
        _isDeleted: function () {
            return this._message.isInDeletedItems ? Factors.isDeleted : 0;
        },
        _isJunk: function () {
            var applies = this._message.isJunk;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isJunk : 0;
        },
        _isDraft: function () {
            var applies = this._message.isDraft;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isDraft : 0;
        },
        _isFlagged: function () {
            var applies = this._message.flagged;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isFlagged : 0;
        },
        _isFromPinnedPerson: function () {
            var applies = this._message.isFromPersonPinned;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isFromPinnedPerson : 0;
        },
        _isInPinnedFolderView: function () {
            var folder = this._message.folder;
            var applies = Jx.isObject(folder) && folder.isInPinnedFolderView;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isInPinnedFolderView : 0;
        },
        _isUnread: function () {
            var applies = !this._message.read;
            Debug.assert(Jx.isBoolean(applies));
            return applies ? Factors.isUnread : 0;
        }
    };

    //function _mark(s) { Jx.mark("Score." + s); }
    function _markStart(s) { Jx.mark("Score." + s + ",StartTA,Score"); }
    function _markStop(s) { Jx.mark("Score." + s + ",StopTA,Score"); }
    //function _markAsyncStart(s) { Jx.mark("Score:" + s + ",StartTM,Score"); }
    //function _markAsyncStop(s) { Jx.mark("Score:" + s + ",StopTM,Score"); }

});

