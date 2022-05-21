
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail, "WorkerOwner", function () {
    "use strict";

    var workerGlomId = "Worker";

    var WorkerOwner = Mail.WorkerOwner = function (selection) {
        _markStart("ctor");
        this._selection = selection;
        this._disposer = new Mail.Disposer();
        this._working = false;

        var Events = Jx.GlomManager.Events;
        var glomManager = Jx.glomManager;
        this._onGlomCreatedHook = this._disposer.add(new Mail.EventHook(glomManager, Events.glomCreated, this._onGlomCreated, this));
        this._disposer.add(new Mail.EventHook(glomManager, Events.glomClosed, this._onGlomClosed, this));
        var worker = glomManager.createGlom(workerGlomId, null, "/ModernMail/Worker/Worker.html" + document.location.hash);
        Debug.assert(worker === this._worker);

        this._disposer.addMany(
            new Mail.EventHook(selection, "navChanged", this._onNavChanged, this),
            new Mail.EventHook(selection, "messagesChanged", this._onMessagesChanged, this)
        );

        var splashScreen = Mail.Globals.splashScreen;
        this._isSplashScreenDismissed = !splashScreen.isShown;
        if (this._isSplashScreenDismissed) {
            this._start();
        } else {
            this._splashScreenHook = this._disposer.add(new Mail.EventHook(splashScreen, Mail.SplashScreen.Events.dismissed, this._onSplashScreenDismissed, this));
        }

        Debug.only(this._closeStack = null);
        Debug.only(Object.seal(this));
        _markStop("ctor");
    };

    WorkerOwner.prototype = {
        dispose: function () {
            // Needs to be safe for double-disposing
            // If the worker closes first, we'll dispose this object
            // and then the owning class (Frame) will also dispose it.
            _markStart("dispose");
            if (this._worker) {
                this._postMessage("shutdown");
                Debug.only(this._closeStack = Debug.callstack(2));
                this._worker = null;
            }
            this._disposer.dispose();
            _markStop("dispose");
        },
        _onGlomCreated: function (evt) {
            if (evt.glom.getGlomId() === workerGlomId) {
                _markStart("_onGlomCreated");
                Debug.assert(!this._worker);
                this._worker = evt.glom;

                Debug.assert(this._onGlomCreatedHook);
                this._disposer.disposeNow(this._onGlomCreatedHook);
                this._onGlomCreatedHook = null;

                if (this._isSplashScreenDismissed) {
                    this._start();
                }
                _markStop("_onGlomCreated");
            }
        },
        _onGlomClosed: function (evt) {
            if (evt.glom.getGlomId() === workerGlomId) {
                Debug.only(this._closeStack = Debug.callstack(2));
                _mark("glom closed");
                Debug.assert(this._worker);
                this._worker = null;
                this.dispose();
            }
        },
        _onSplashScreenDismissed: function () {
            _markStart("_onSplashScreenDismissed");
            this._isSplashScreenDismissed = true;
            Debug.assert(this._splashScreenHook);
            this._disposer.disposeNow(this._splashScreenHook);
            this._splashScreenHook = null;
            if (this._worker) {
                this._start();
            }
            _markStop("_onSplashScreenDismissed");
        },
        _start: function () {
            _markStart("start");
            Debug.assert(this._isSplashScreenDismissed);
            Debug.assert(!this._working);
            this._working = true;
            this._fireEvent("accountChanged", this._selection.account);
            var view = this._selection.view;
            this._fireEvent("viewChanged", Jx.isObject(view) ? view : null);
            this._fireEvent("messageChanged", this._selection.message);
            this._postMessage("start");
            this._onVisibilityChange();

            this._disposer.add(new Mail.EventHook(document, "msvisibilitychange", this._onVisibilityChange, this, false));
            _markStop("start");
        },
        _onVisibilityChange: function () {
            if (document.msHidden) {
                this._pause();
            } else {
                this._resume();
            }
        },
        _pause: function () {
            if (this._working) {
                this._working = false;
                this._postMessage("pause");
            }
        },
        _resume: function () {
            if (!this._working) {
                this._working = true;
                this._postMessage("resume");
            }
        },
        _postMessage: function (eventType, context) {
            Debug.assert(Jx.isNonEmptyString(eventType));
            Debug.assert(Jx.isNullOrUndefined(context) || Jx.isObject(context));
            if (this._worker) {
                _mark("sending: " + eventType);
                this._worker.postMessage(eventType, context);
            } else {
                var exception = null;
                Debug.call(function () {
                    if (this._closeStack) {
                        exception = {
                            stack: this._closeStack
                        };
                    }
                }.bind(this));
                Jx.fault("Mail.WorkerOwner", "NullWorker", exception);
                Debug.assert(false, "We're trying to send a message to worker, but its gone.");
            }
        },
        _fireEvent: function (eventType, newValue) {
            Debug.assert(Jx.isNonEmptyString(eventType));
            var log = "_fireEvent: " + eventType;
            _markStart(log);
            this._postMessage(eventType, {
                newValue: newValue ? newValue.objectId : null
            });
            _markStop(log);
        },
        _onNavChanged: function (evt) {
            if (evt.accountChanged) {
                this._fireEvent("accountChanged", evt.target.account);
            }
            if (evt.viewChanged) {
                var view = evt.target.view;
                this._fireEvent("viewChanged", Jx.isObject(view) ? view : null);
            }
        },
        _onMessagesChanged: function (evt) {
            if (evt.messageChanged) {
                this._fireEvent("messageChanged", evt.target.message);
            }
        }
    };

    function _mark(s) { Jx.mark("WorkerOwner:" + s); }
    function _markStart(s) { Jx.mark("WorkerOwner." + s + ",StartTA,WorkerOwner"); }
    function _markStop(s) { Jx.mark("WorkerOwner." + s + ",StopTA,WorkerOwner"); }

});

