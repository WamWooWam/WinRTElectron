
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

// ScrubHelper UTs

/*global Jx, Mail, Microsoft, Tx */
/*jshint browser:true*/

(function () {

    var Plat = Microsoft.WindowsLive.Platform;

    var scores,
        messages,
        platform = {
            mockedType: Plat.Client
        },
        messageGetter,
        selection;

    var updateThreshold = 4;
    function setup(tc) {
        scores = [];
        messages = [];
        messageGetter = {
            _needUpdateCalls: 0,
            needsUpdate: function () {
                return this._needUpdateCalls++ > updateThreshold;
            },
            update: function (onComplete, onCompleteContext) {
                Jx.scheduler.addJob(null, Mail.Priority.workerMessageGetter, null, function () {
                    this._needUpdateCalls = 0;
                    updateThreshold *= 2;
                    onComplete.call(onCompleteContext);
                }, this);
            },
            item: function (index) {
                tc.isTrue(this.count === messages.length);
                tc.isTrue(index >= 0);
                tc.isTrue(index < messages.length);
                return messages[index];
            },
            mockedType: Mail.Worker.MessageGetter
        };
        selection = {
            mockedType: Mail.Worker.Selection
        };

        var origWorkerScore = Mail.Worker.Score;
        Mail.Worker.Score = function (platformArg, message, selectionArg, onUpdate) {
            tc.isTrue(Jx.isInstanceOf(platformArg, Plat.Client));
            tc.areEqual(platformArg, platform);
            tc.isTrue(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            tc.isTrue(Jx.isValidNumber(message.score));
            tc.isTrue(Jx.isInstanceOf(selectionArg, Mail.Worker.Selection));
            tc.areEqual(selectionArg, selection);
            tc.isTrue(Jx.isFunction(onUpdate));
            scores.push(this);
            this.dispose = function () {
                var index = scores.indexOf(this);
                tc.isTrue(index >= 0);
                scores.splice(index, 1);
            };
            Object.defineProperty(this, "message", {
                get: function () { return message; }
            });
            Object.defineProperty(this, "score", {
                get: function () { return message.score; }
            });
        };
        tc.addCleanup(function () {
            tc.isTrue(scores.length === 0);
            Mail.Worker.Score = origWorkerScore;
        });
        Mail.Worker.Score.compare = function (scoreA, scoreB) {
            tc.isTrue(Jx.isInstanceOf(scoreA, Mail.Worker.Score));
            tc.isTrue(Jx.isValidNumber(scoreA.message.score));
            tc.isTrue(Jx.isInstanceOf(scoreB, Mail.Worker.Score));
            tc.isTrue(Jx.isValidNumber(scoreB.message.score));
            return (scoreB.message.score - scoreA.message.score);
        };
    }

    Tx.asyncTest("Rater.noMessages", function (tc) {
        tc.stop();
        setup(tc);
        messages = [];
        messageGetter.count = messages.length;

        var rater = new Mail.Worker.Rater(platform, selection);
        rater.getBestMessage(messageGetter, function (message) {
            tc.isTrue(message === null);
            rater.dispose();
            tc.start();
        });
    });

    Tx.asyncTest("Rater.oneMessage", function (tc) {
        tc.stop();
        setup(tc);
        messages = [{
            score: 0,
            mockedType: Mail.UIDataModel.MailMessage
        }];
        messageGetter.count = messages.length;

        var rater = new Mail.Worker.Rater(platform, selection);
        rater.getBestMessage(messageGetter, function (message) {
            tc.isTrue(message.mockedType === Mail.UIDataModel.MailMessage);
            rater.dispose();
            tc.start();
        });
    });

    Tx.asyncTest("Rater.severalMessage", function (tc) {
        tc.stop();
        setup(tc);
        var scoreValues = [10, 30, 20, 40, 50, 10, 20, 40, 60, 20, 70, 20];
        //                  0   1   2   3   4   5   6   7   8   9  10  11
        var expectedOrder = [10, 8, 4, 3, 7, 1, 2, 6, 9, 11, 0, 5];
        tc.areEqual(scoreValues.length, expectedOrder.length);
        messages = [];
        scoreValues.forEach(function (value, index) {
            messages.push({
                objectId: "message-id-" + index,
                score: value,
                mockedType: Mail.UIDataModel.MailMessage
            });
        });
        messageGetter.count = messages.length;
        var expectedMessages = expectedOrder.map(function (index) {
            return messages[index];
        });

        var nextIndex = 0;
        var rater = new Mail.Worker.Rater(platform, selection);
        function onBestMessage(message) {
            if (message === null) {
                tc.isTrue(nextIndex === expectedOrder.length);
                tc.isTrue(messages.length === 0);
                rater.dispose();
                tc.start();
                return;
            }
            tc.isTrue(message.mockedType === Mail.UIDataModel.MailMessage);
            tc.areEqual(message, expectedMessages[nextIndex++]);

            // Scrubbing a message should cause it to be removed from the query of un-scrubbed messages.
            // This replicates that behavior.
            var index = messages.indexOf(message);
            tc.isTrue(index >= 0);
            tc.isTrue(index < messages.length);
            messages.splice(index, 1);
            messageGetter.count = messages.length;

            rater.getBestMessage(messageGetter, onBestMessage);
        }
        rater.getBestMessage(messageGetter, onBestMessage);

    });

})();

