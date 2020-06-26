Jx.delayDefine(Mail, "SplashScreen", function() {
    "use strict";

    function t(n) {
        Jx.mark("Mail.SplashScreen." + n)
    }

    function r(n) {
        Jx.mark("Mail.SplashScreen." + n + ",StartTA,Mail,SplashScreen")
    }

    function u(n) {
        Jx.mark("Mail.SplashScreen." + n + ",StopTA,Mail,SplashScreen")
    }
    var i = Mail.SplashScreen = function() {
            this._isShown = true;
            this._isSpinnerShown = false;
            this._splashScreen = null;
            this._deferral = null;
            this._dismissJob = null;
            this._spinnerTimer = null;
            this._resizeHook = new Mail.EventHook(window, "resize", this._onResize, this, false);
            this._activationHook = new Mail.EventHook(Jx.activation, Jx.activation.activated, this._onActivation, this);
            this._updatePosition();
            Jx.scheduler.setTimeSlice(200)
        },
        n = i.prototype;
    Object.defineProperty(n, "isShown", {
        get: function() {
            return this._isShown
        },
        enumerable: true
    });
    i.Events = {
        dismissed: "dismissed"
    };
    Jx.augment(i, Jx.Events);
    i._timeTillSpinner = 3e3;
    n._onActivation = function(n) {
        var u, r;
        n.kind === Windows.ApplicationModel.Activation.ActivationKind.launch && (this._deferral = n.activatedOperation.getDeferral());
        this._splashScreen = n.detail[0].splashScreen;
        this._activationHook.dispose();
        this._updatePosition();
        u = window.performance.timing.navigationStart;
        r = i._timeTillSpinner - Date.now() + u;
        t("_onActivation - timeTillSpinner: " + String(r));
        r < 50 ? this._showSpinner() : this._spinnerTimer = new Jx.Timer(r, this._showSpinner, this)
    };
    n._showSpinner = function() {
        !this._isSpinnerShown && this._isShown && (t("_showSpinner"),
            document.getElementById("splashScreenProgressWrapper").classList.remove("hidden"),
            this._dismissDeferredSplashScreen(),
            this._isSpinnerShown = true)
    };
    n._dismissDeferredSplashScreen = function() {
        this._deferral && (r("_dismissDeferredSplashScreen"),
            this._deferral.complete(),
            this._deferral = null,
            u("_dismissDeferredSplashScreen"))
    };
    n._onResize = function() {
        t("_onResize");
        this._updatePosition()
    };
    n._getImageLocation = function() {
        if (Jx.isObject(this._splashScreen))
            return this._splashScreen.imageLocation;
        var n = document.getElementById("splashScreenImage");
        return {
            width: n.width,
            height: n.height,
            x: Math.round((window.innerWidth - n.width) / 10) * 5,
            y: Math.round((window.innerHeight - n.height) / 10) * 5
        }
    };
    n._updatePosition = function() {
        var n, i, f;
        this._isShown && (r("_updatePosition"),
            n = this._getImageLocation(),
            i = document.getElementById("splashScreenImage"),
            f = document.getElementById("splashScreenContent"),
            t("_updatePosition - pos: (" + String(n.x) + ", " + String(n.y) + ") size: (" + String(n.width) + ", " + String(n.height) + ")"),
            i.style.left = String(n.x) + "px",
            i.style.top = String(n.y) + "px",
            f.style.top = String(n.y + n.height + 20) + "px",
            u("_updatePosition"))
    };
    n.dismiss = function() {
        if (!this._isShown) {
            t("dismiss - ignoring call because we're already not shown");
            return
        }
        this._dismissJob === null && (this._dismissJob = Jx.scheduler.addJob(null, Mail.Priority.dismissSplashScreen, "dismiss splash screen", this._synchronousDismiss, this),
            t("dismiss - scheduled"))
    };
    n._synchronousDismiss = function() {
        var n, f;
        if (!this._isShown) {
            t("_synchronousDismiss - ignoring call because we're already not shown");
            return
        }
        r("_synchronousDismiss");
        this._isShown = false;
        this._splashScreen = null;
        Jx.dispose(this._resizeHook);
        Jx.dispose(this._activationHook);
        Jx.dispose(this._spinnerTimer);
        document.getElementById("splashScreenProgress").remove();
        document.getElementById("splashScreen").classList.add("hidden");
        document.getElementById("appBody").classList.remove("invisible");
        n = Jx.scheduler;
        n.setTimeSlice();
        n.yield();
        this.raiseEvent(i.Events.dismissed);
        this._dismissDeferredSplashScreen();
        Mail.log("SplashScreen_dismiss");
        f = Jx.activation.lastKind;
        f !== Jx.Activation.neverActivated && Jx.ptStopLaunch(Jx.TimePoint.responsive, f);
        u("_synchronousDismiss")
    };
    n.prepareForRestart = function() {
        r("prepareForRestart");
        this._isShown = true;
        this._updatePosition();
        var n = document.getElementById("splashScreen");
        n.removeAttribute("style");
        n.classList.remove("hidden");
        u("prepareForRestart")
    }
})