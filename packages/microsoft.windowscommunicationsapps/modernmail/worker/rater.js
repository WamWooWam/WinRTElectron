
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "Rater", function () {
    "use strict";

    var Rater = Mail.Worker.Rater = function (platform, selection) {
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(selection, Mail.Worker.Selection));
        _markStart("ctor");
        this._platform = platform;
        this._selection = selection;
        this._done = false;
        this._nextToRate = null;
        this._scores = {};
        this._sorted = [];
        this._needsResort = true;

        this._disposer = new Mail.Disposer();
        this._jobSet = this._disposer.add(Jx.scheduler.createJobSet());

        Debug.only(Object.seal(this));
        _markStop("ctor");
    };
    Rater.prototype = {
        dispose: function () {
            _markStart("dispose");
            this._disposer.dispose();
            _markStop("dispose");
        },
        getBestMessage: function (messageGetter, onComplete, onCompleteContext) {
            Debug.assert(Jx.isFunction(onComplete));
            Debug.assert(Jx.isInstanceOf(messageGetter, Mail.Worker.MessageGetter));
            if (messageGetter.needsUpdate()) {
                _mark("getBestMessage - calling update");
                messageGetter.update(function () {
                    this._startRating(messageGetter, onComplete, onCompleteContext);
                }, this);
                return;
            }

            if (this._nextToRate === null) {    // If we've never rated anything
                _mark("getBestMessage - calling _startRating");
                this._startRating(messageGetter, onComplete, onCompleteContext);
                return;
            }

            Debug.assert(Jx.isValidNumber(this._sorted.length));
            if (this._sorted.length === 0) {
                _mark("getBestMessage - retuning null");
                onComplete.call(onCompleteContext, null);
                return;
            }

            if (this._needsResort) {
                Jx.scheduler.addJob(this._jobSet, Mail.Priority.workerRater, "Rater.getBestMessage.resort", function () {
                    _mark("getBestMessage - restoring");
                    this._sort();
                    this.getBestMessage(messageGetter, onComplete, onCompleteContext);
                }, this);
                return;
            }

            var score = this._sorted.splice(0, 1)[0];
            var message = score.message;
            score.dispose();

            _mark("getBestMessage - retuning " + message.objectId);
            onComplete.call(onCompleteContext, message);
        },
        _disposeAllScores: function () {
            _markStart("_disposeAllScores");
            this._sorted.forEach(function (score) {score.dispose();});
            this._sorted = [];
            _markStop("_disposeAllScores");
        },
        _startRating: function (messageGetter, onComplete, onCompleteContext) {
            Debug.assert(Jx.isInstanceOf(messageGetter, Mail.Worker.MessageGetter));
            Debug.assert(Jx.isFunction(onComplete));
            Debug.assert(Jx.isObject(onCompleteContext) || Jx.isNullOrUndefined(onCompleteContext));
            Debug.assert(!messageGetter.needsUpdate());
            Debug.assert(Jx.isValidNumber(messageGetter.count));
            this._done = (messageGetter.count === 0);
            this._nextToRate = this._done ? -1 : 0;
            this._disposeAllScores();
            if (this._done) {
                _mark("_startRating - retuning null");
                onComplete.call(onCompleteContext, null);
            } else {
                Jx.scheduler.addJob(this._jobSet, Mail.Priority.workerRater, "Rater._rateSome", this._rateSome, this, [messageGetter, onComplete, onCompleteContext]);
            }
        },
        _rateSome: function (messageGetter, onComplete, onCompleteContext) {
            _markStart("_rateSome");
            Debug.assert(Jx.isInstanceOf(messageGetter, Mail.Worker.MessageGetter));
            Debug.assert(Jx.isFunction(onComplete));
            Debug.assert(Jx.isObject(onCompleteContext) || Jx.isNullOrUndefined(onCompleteContext));
            Debug.assert(!this._done);
            if (messageGetter.needsUpdate()) {
                _mark("_rateSome - needs update");
                messageGetter.update(function () {
                    this._startRating(messageGetter, onComplete, onCompleteContext);
                }, this);
                _markStop("_rateSome");
                return Jx.Scheduler.repeat(false);
            }
            var message = messageGetter.item(this._nextToRate++);
            if (message) {
                this._sorted.push(new Mail.Worker.Score(this._platform, message, this._selection, function () { this._needsResort = true; }, this));
            }
            Debug.assert(this._nextToRate <= messageGetter.count);
            this._done = (this._nextToRate === messageGetter.count);
            if (this._done) {
                Debug.assert(this._sorted.length <= messageGetter.count);
                this._sort();
                this.getBestMessage(messageGetter, onComplete, onCompleteContext);
            }
            _markStop("_rateSome");
            return Jx.Scheduler.repeat(!this._done);
        },
        _sort: function () {
            this._sorted.sort(Mail.Worker.Score.compare);
            Debug.call(function () {
                for (var ii = 0, iiMax = this._sorted.length - 1; ii < iiMax; ii++) {
                    Debug.assert(this._sorted[ii].score >= this._sorted[ii+1].score);
                }
            }.bind(this));
            this._needsResort = false;
        }
    };

    function _mark(s) { Jx.mark("Rater." + s); }
    function _markStart(s) { Jx.mark("Rater." + s + ",StartTA,Rater"); }
    function _markStop(s) { Jx.mark("Rater." + s + ",StopTA,Rater"); }
    //function _markAsyncStart(s) { Jx.mark("Rater:" + s + ",StartTM,Rater"); }
    //function _markAsyncStop(s) { Jx.mark("Rater:" + s + ",StopTM,Rater"); }

});

