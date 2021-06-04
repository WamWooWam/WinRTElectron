Jx.delayDefine(Mail, "WorkerOwner", function () {
    "use strict";

    function r(n) {
        Jx.mark("WorkerOwner:" + n)
    }

    function n(n) {
        Jx.mark("WorkerOwner." + n + ",StartTA,WorkerOwner")
    }

    function t(n) {
        Jx.mark("WorkerOwner." + n + ",StopTA,WorkerOwner")
    }
    var i = "Worker",
        u = Mail.WorkerOwner = function (r) {
            var f, u, o, e;
            n("ctor");
            this._selection = r;
            this._disposer = new Mail.Disposer;
            this._working = false;
            f = Jx.GlomManager.Events;
            u = Jx.glomManager;
            this._onGlomCreatedHook = this._disposer.add(new Mail.EventHook(u, f.glomCreated, this._onGlomCreated, this));
            this._disposer.add(new Mail.EventHook(u, f.glomClosed, this._onGlomClosed, this));
            o = u.createGlom(i, null, "/modernmail/Worker/Worker.html" + document.location.hash);
            this._disposer.addMany(new Mail.EventHook(r, "navChanged", this._onNavChanged, this), new Mail.EventHook(r, "messagesChanged", this._onMessagesChanged, this));
            e = Mail.Globals.splashScreen;
            this._isSplashScreenDismissed = !e.isShown;
            this._isSplashScreenDismissed ? this._start() : this._splashScreenHook = this._disposer.add(new Mail.EventHook(e, Mail.SplashScreen.Events.dismissed, this._onSplashScreenDismissed, this));
            t("ctor")
        };
    u.prototype = {
        dispose: function () {
            n("dispose");
            this._worker && (this._postMessage("shutdown"), this._worker = null);
            this._disposer.dispose();
            t("dispose")
        },
        _onGlomCreated: function (r) {
            r.glom.getGlomId() === i && (n("_onGlomCreated"), this._worker = r.glom, this._disposer.disposeNow(this._onGlomCreatedHook), this._onGlomCreatedHook = null, this._isSplashScreenDismissed && this._start(), t("_onGlomCreated"))
        },
        _onGlomClosed: function (n) {
            n.glom.getGlomId() === i && (r("glom closed"), this._worker = null, this.dispose())
        },
        _onSplashScreenDismissed: function () {
            n("_onSplashScreenDismissed");
            this._isSplashScreenDismissed = true;
            this._disposer.disposeNow(this._splashScreenHook);
            this._splashScreenHook = null;
            this._worker && this._start();
            t("_onSplashScreenDismissed")
        },
        _start: function () {
            n("start");
            this._working = true;
            this._fireEvent("accountChanged", this._selection.account);
            var i = this._selection.view;
            this._fireEvent("viewChanged", Jx.isObject(i) ? i : null);
            this._fireEvent("messageChanged", this._selection.message);
            this._postMessage("start");
            this._onVisibilityChange();
            this._disposer.add(new Mail.EventHook(document, "msvisibilitychange", this._onVisibilityChange, this, false));
            t("start")
        },
        _onVisibilityChange: function () {
            document.msHidden ? this._pause() : this._resume()
        },
        _pause: function () {
            this._working && (this._working = false, this._postMessage("pause"))
        },
        _resume: function () {
            this._working || (this._working = true, this._postMessage("resume"))
        },
        _postMessage: function (n, t) {
            if (this._worker) r("sending: " + n), this._worker.postMessage(n, t);
            else {
                var i = null;
                Jx.fault("Mail.WorkerOwner", "NullWorker", i)
            }
        },
        _fireEvent: function (i, r) {
            var u = "_fireEvent: " + i;
            n(u);
            this._postMessage(i, {
                newValue: r ? r.objectId : null
            });
            t(u)
        },
        _onNavChanged: function (n) {
            if (n.accountChanged && this._fireEvent("accountChanged", n.target.account), n.viewChanged) {
                var t = n.target.view;
                this._fireEvent("viewChanged", Jx.isObject(t) ? t : null)
            }
        },
        _onMessagesChanged: function (n) {
            n.messageChanged && this._fireEvent("messageChanged", n.target.message)
        }
    }
})