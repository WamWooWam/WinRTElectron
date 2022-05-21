
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

(function () {
    "use strict";

    Mail.synchronousScrub = function (platform, message) {
        Jx.mark("Mail.synchronousScrub,StartTA,getScrubbedDocument");
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        var scrubber = Mail.Worker._Scrubber.scrubSynchronously(platform, message);
        scrubber.dispose();
        Jx.mark("Mail.synchronousScrub,StopTA,getScrubbedDocument");
    };

    Mail.getScrubbedDocument = function (platform, message) {
        Jx.mark("Mail.getScrubbedDocument,StartTA,getScrubbedDocument");
        Debug.assert(Jx.isInstanceOf(platform, Microsoft.WindowsLive.Platform.Client));
        Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        var scrubber = Mail.Worker._Scrubber.scrubSynchronously(platform, message, {scrubDrafts: true});
        var doc = scrubber.getDocument();
        scrubber.dispose();
        var writer = new Mail.BodyWriter(message, doc, {skipWriting: true, sanitizedBody: scrubber.getSanitizedBody()});
        writer.runSynchronous();
        writer.dispose();
        Debug.assert(doc.body);
        Debug.assert(doc.head);
        Debug.assert(Jx.isNonEmptyString(doc.documentElement.outerHTML));
        Jx.mark("Mail.getScrubbedDocument,StopTA,getScrubbedDocument");
        return doc;
    };

    Jx.delayDefine(Mail.Worker, "AsyncMessageScrubber", function () {

        var Platform = Microsoft.WindowsLive.Platform,
            MailBodyType = Platform.MailBodyType;

        var AsyncMessageScrubber = Mail.Worker.AsyncMessageScrubber = function (platform, message, onComplete, onCompleteContext, priority) {
            _markStart("ctor");
            Debug.assert(Jx.isInstanceOf(platform, Platform.Client));
            Debug.assert(Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
            Debug.assert(Jx.isNullOrUndefined(onComplete) || Jx.isFunction(onComplete));
            Debug.assert(Jx.isNullOrUndefined(priority) || Jx.scheduler.isValidPriority(priority));
            this._platform = platform;
            this._message = message;
            this._onComplete = onComplete;
            this._onCompleteContext = onCompleteContext;
            this._priority = priority;

            _mark("objectId = " + message.objectId);

            this._disposer = new Mail.Disposer();
            this._scrubber = null;
            this._bodyHook = null;
            this._completedSanitizedVersion = this._message.sanitizedVersion;

            this._disposer.add(new Mail.EventHook(message.platformMailMessage, "changed", this._onMessageChanged, this));

            Debug.only(Object.seal(this));

            this._startScrubbing();
            _markStop("ctor");
        };

        AsyncMessageScrubber.prototype = {
            dispose: function () {
                this._disposer.dispose();
            },
            getObjectId: function () {
                return this._message.objectId;
            },
            _startScrubbing: function (htmlBody) {
                _markStart("_startScrubbing");
                var message = this._message;
                if (htmlBody) {
                    Debug.assert(Jx.isInstanceOf(htmlBody, Platform.MailBody));
                    Debug.assert(htmlBody.type === MailBodyType.html);
                } else {
                    htmlBody = message.getBodyByType(MailBodyType.html);
                }
                if (htmlBody) {
                    Debug.assert(!this._bodyHook);
                    this._bodyHook = this._disposer.add(new Mail.EventHook(htmlBody, "changed", this._onBodyChanged, this));
                }
                _markAsyncStart("scrubbing");
                Debug.assert(!this._scrubber);
                var options = {
                    onComplete: this.onScrubbingComplete,
                    onCompleteContext: this,
                    priority: this._priority
                };
                this._scrubber = this._disposer.add(new Mail.Worker._Scrubber(this._platform, message, options));
                _markStop("_startScrubbing");
            },
            _cleanupScrubber: function () {
                _markAsyncStop("scrubbing");

                Debug.assert(this._scrubber);
                this._disposer.disposeNow(this._scrubber);
                this._scrubber = null;

                this._disposer.disposeNow(this._bodyHook);
                this._bodyHook = null;
            },
            onScrubbingComplete: function () {
                _markStart("onScrubbingComplete");
                this._cleanupScrubber();
                if (this._onComplete) {
                    this._onComplete.call(this._onCompleteContext);
                }
                this._completedSanitizedVersion = this._message.sanitizedVersion;
                _markStop("onScrubbingComplete");
            },
            _onMessageChanged: function (evt) {
                if (Mail.Validators.hasPropertyChanged(evt, "sanitizedVersion")) {
                    // If the sanitized version changed and we aren't scrubbing, then we should start.
                    // (The scrubber will bail out if we're already scrubbed.)
                    if (!this._scrubber && this._completedSanitizedVersion !== this._message.sanitizedVersion) {
                        _mark("_onMessageChanged - sanitizedVersion changed after scrubbing");
                        this._startScrubbing();
                    }
                } else if (Mail.Validators.hasPropertyChanged(evt, "allowExternalImages")) {
                    if (this._scrubber) {
                        _mark("_onMessageChanged - sanitizedVersion changed while scrubbing");
                        this._cleanupScrubber();
                    }
                    this._startScrubbing();
                }
            },
            _onBodyChanged: function () {
                if (this._scrubber) {
                    var newHtmlBody = this._message.platformMailMessage.getBody(MailBodyType.html);
                    if (!this._scrubber.isSameHtmlBody(newHtmlBody)) {
                        _mark("_onBodyChanged - while scrubbing");
                        this._cleanupScrubber();
                        this._startScrubbing(newHtmlBody);
                    }
                }
            }
        };

        function _mark(s) { Jx.mark("AsyncMessageScrubber." + s); }
        function _markStart(s) { Jx.mark("AsyncMessageScrubber." + s + ",StartTA,AsyncMessageScrubber"); }
        function _markStop(s) { Jx.mark("AsyncMessageScrubber." + s + ",StopTA,AsyncMessageScrubber"); }
        function _markAsyncStart(s) { Jx.mark("AsyncMessageScrubber:" + s + ",StartTM,AsyncMessageScrubber"); }
        function _markAsyncStop(s) { Jx.mark("AsyncMessageScrubber:" + s + ",StopTM,AsyncMessageScrubber"); }

    });

})();