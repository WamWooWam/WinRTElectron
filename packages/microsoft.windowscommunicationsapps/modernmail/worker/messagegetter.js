
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Worker, "MessageGetter", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform;

    var MessageGetter = Mail.Worker.MessageGetter = function (platform) {
        _markStart("ctor");
        Debug.assert(Jx.isInstanceOf(platform, Plat.Client));
        this._resetPending = false;
        this._whenDirty = null;
        this._disposer = new Mail.Disposer();

        this._jobSet = this._disposer.add(Jx.scheduler.createJobSet());

        this._deferredCollection = this._disposer.add(
            new Mail.MappedDeferredCollection(
                new Mail.CappedCollection(100,
                    new Mail.QueryCollection(
                        platform.mailManager.getMessageCollectionBySanitizedVersion,
                        platform.mailManager,
                        [Plat.SanitizedVersion.notSanitized]
                    )
                ),
                this,
                function (message) {
                    if (!message || message.pendingRemoval) {
                        Debug.assert(!message || Jx.isNonEmptyString(message.objectId));
                        return null;
                    }
                    var account = Mail.Account.load(message.accountId, platform);
                    if (!account) {
                        return null;
                    }
                    return new Mail.UIDataModel.MailMessage(message, account);
                },
                this,
                "Worker:getMessageCollectionBySanitizedVersion"
            )
        );

        Debug.only(Object.seal(this));
        _markStop("ctor");
    };
    MessageGetter.prototype = {
        dispose: function () {
            _markStart("dispose");
            this._disposer.dispose();
            _markStop("dispose");
        },
        update: function (onComplete, onCompleteContext) {
            _markStart("update");
            Debug.assert(Jx.isFunction(onComplete));

            Debug.assert(this._deferredCollection);
            this._jobSet.cancelJobs();

            if (this.needsUpdate()) {
                Jx.scheduler.addJob(this._jobSet, Mail.Priority.workerMessageGetter, "MessageGetter.acceptPendingChanges", function () {
                    Debug.assert(this.needsUpdate());
                    Debug.assert(this._deferredCollection);
                    this._deferredCollection.acceptPendingChanges();
                    this._resetPending = false;
                    Debug.assert(!this.needsUpdate());
                    Jx.scheduler.addJob(this._jobSet, Mail.Priority.workerMessageGetter, "MessageGetter.re-update", this.update, this, [onComplete, onCompleteContext]);
                }, this);
            } else {
                onComplete.call(onCompleteContext);
            }
            _markStop("update");
        },
        get count() {
            Debug.assert(!this.needsUpdate());
            return this._deferredCollection.count;
        },
        item: function (index) {
            Debug.assert(!this.needsUpdate());
            _mark("item " + index + " (count: " + this.count + ")");
            return this._deferredCollection.item(index);
        },
        needsUpdate: function () {
            Debug.assert(this._deferredCollection);
            Debug.assert(Jx.isValidNumber(this._deferredCollection.pendingChangesCount));
            return this._resetPending || (this._deferredCollection.pendingChangesCount > 20);
        },
        whenDirty: function (onDirty, onDirtyContext) {
            if (onDirty === null) {
                _mark("whenDirty - null");
                this._whenDirty = null;
                return;
            }
            _markStart("whenDirty");
            Debug.assert(Jx.isFunction(onDirty));
            Debug.assert(Jx.isObject(onDirtyContext));
            Debug.assert(this._whenDirty === null);
            Debug.assert(this._deferredCollection);
            Debug.assert(Jx.isBoolean(this._deferredCollection.hasPendingChanges));
            if (this._resetPending || this._deferredCollection.hasPendingChanges) {
                this._resetPending = true;
                onDirty.call(onDirtyContext);
            } else {
                _mark("whenDirty - waiting");
                this._whenDirty = {
                    func: onDirty,
                    context: onDirtyContext
                };
            }
            _markStop("whenDirty");
        },
        // called by this._deferredCollection
        onChangesPending: function () {
            Debug.assert(this._deferredCollection);
            Debug.assert(Jx.isValidNumber(this._deferredCollection.pendingChangesCount));
            if (this._whenDirty && (this._deferredCollection.pendingChangesCount > 0)) {
                var whenDirty = this._whenDirty;
                this._whenDirty = null;
                this._resetPending = true;  // any change should cause "needsUpdate" to be true
                whenDirty.func.call(whenDirty.context);
            }
        },
        // called by this._deferredCollection
        onResetPending: function () {
            this._resetPending = true;
            this.onChangesPending();
        }
    };

    function _mark(s) { Jx.mark("MessageGetter:" + s); }
    function _markStart(s) { Jx.mark("MessageGetter." + s + ",StartTA,MessageGetter"); }
    function _markStop(s) { Jx.mark("MessageGetter." + s + ",StopTA,MessageGetter"); }
    //function _markAsyncStart(s) { Jx.mark("MessageGetter:" + s + ",StartTM,MessageGetter"); }
    //function _markAsyncStop(s) { Jx.mark("MessageGetter:" + s + ",StopTM,MessageGetter"); }

});

