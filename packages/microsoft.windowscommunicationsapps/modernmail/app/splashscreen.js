
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global  Jx, Mail, Debug, Windows */
/*jshint browser:true*/

Jx.delayDefine(Mail, "SplashScreen", function () {
    "use strict";

    var SplashScreen = Mail.SplashScreen = function () {
        this._isShown = true;           // splash screen is shown by default in the html
        this._isSpinnerShown = false;   // spinner is not shown by default in the html
        this._splashScreen = null;
        this._deferral = null;
        this._dismissJob = null;
        this._spinnerTimer = null;

        this._resizeHook = new Mail.EventHook(window, "resize", this._onResize, this, false);
        this._activationHook = new Mail.EventHook(Jx.activation, Jx.activation.activated, this._onActivation, this);

        this._updatePosition();

        Jx.scheduler.setTimeSlice(200);
    };

    var prototype = SplashScreen.prototype;
    Object.defineProperty(prototype, "isShown", { get: function () { return this._isShown; }, enumerable: true });

    SplashScreen.Events = {
        dismissed : "dismissed"
    };
    Debug.Events.define(prototype, SplashScreen.Events.dismissed);

    Jx.augment(SplashScreen, Jx.Events);

    SplashScreen._timeTillSpinner = 3000;

    prototype._onActivation = function (evt) {
        /// <param name="evt" type="Windows.ApplicationModel.Activation.IActivatedEventArgs" optional="true">Activated event object.</param>
        Debug.assert(this._isShown);
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isNumber(evt.kind));
        if (evt.kind === Windows.ApplicationModel.Activation.ActivationKind.launch) {
            Debug.assert(this._deferral === null);
            this._deferral = evt.activatedOperation.getDeferral();
        }
        Debug.assert(Jx.isObject(evt.detail));
        Debug.assert(Jx.isObject(evt.detail[0].splashScreen));
        this._splashScreen = evt.detail[0].splashScreen;

        // The app could be activated twice if the user clicks on the tile twice, and in this case we only want to handle the event once
        this._activationHook.dispose();

        this._updatePosition();

        var startOfTime = window.performance.timing.navigationStart;
        Debug.assert(Jx.isNumber(startOfTime));
        var timeTillSpinner = SplashScreen._timeTillSpinner - Date.now() + startOfTime;
        _mark("_onActivation - timeTillSpinner: " + String(timeTillSpinner));
        if (timeTillSpinner < 50) { // no point in a very short timer
            this._showSpinner();
        } else {
            this._spinnerTimer = new Jx.Timer(timeTillSpinner, this._showSpinner, this);
        }
    };

    prototype._showSpinner = function () {
        Debug.assert(!this._isSpinnerShown);
        if (!this._isSpinnerShown && this._isShown) {
            _mark("_showSpinner");
            document.getElementById("splashScreenProgressWrapper").classList.remove("hidden");
            this._dismissDeferredSplashScreen();
            this._isSpinnerShown = true;
        }
    };

    prototype._dismissDeferredSplashScreen = function () {
        if (this._deferral) {
            _markStart("_dismissDeferredSplashScreen");
            Debug.assert(Jx.isFunction(this._deferral.complete));
            this._deferral.complete();
            this._deferral = null;
            _markStop("_dismissDeferredSplashScreen");
        }
    };

    prototype._onResize = function () {
        _mark("_onResize");
        this._updatePosition();
    };

    prototype._getImageLocation = function () {
        if (Jx.isObject(this._splashScreen)) {
            Debug.assert(Jx.isObject(this._splashScreen.imageLocation));
            return this._splashScreen.imageLocation;
        }
        var img = document.getElementById("splashScreenImage");
        return {
            width: img.width,
            height: img.height,
            x: Math.round((window.outerWidth - img.width) / 10) * 5,  // round to the nearest 5 pixels to match CSplashScreenElement::_SelfLayoutDoLayout
            y: Math.round((window.outerHeight - img.height) / 10) * 5
        };
    };

    prototype._updatePosition = function () {
        if (this._isShown) {
            _markStart("_updatePosition");
            var imgLocation = this._getImageLocation();
            Debug.assert(Jx.isNumber(imgLocation.x));
            Debug.assert(Jx.isNumber(imgLocation.y));
            Debug.assert(Jx.isNumber(imgLocation.width));
            Debug.assert(Jx.isNumber(imgLocation.height));

            var img = document.getElementById("splashScreenImage");
            Debug.assert(Jx.isHTMLElement(img));
            var content = document.getElementById("splashScreenContent");
            Debug.assert(Jx.isHTMLElement(content));
            _mark("_updatePosition - pos: (" + String(imgLocation.x) + ", " + String(imgLocation.y) + ") size: (" + String(imgLocation.width) + ", " + String(imgLocation.height) + ")");
            img.style.left = String(imgLocation.x) + "px";
            img.style.width = String(imgLocation.width) + "px";
            img.style.top = String(imgLocation.y) + "px";
            img.style.height = String(imgLocation.height) + "px";
            content.style.top = String(imgLocation.y + imgLocation.height + 20) + "px";
            _markStop("_updatePosition");
        }
    };

    prototype.dismiss = function () {
        if (!this._isShown) {
            _mark("dismiss - ignoring call because we're already not shown");
            return;
        }

        if (this._dismissJob === null) {
            this._dismissJob = Jx.scheduler.addJob(null, Mail.Priority.dismissSplashScreen, "dismiss splash screen", this._synchronousDismiss, this);
            _mark("dismiss - scheduled");
        }
    };

    prototype._synchronousDismiss = function () {
        if (!this._isShown) {
            _mark("_synchronousDismiss - ignoring call because we're already not shown");
            return;
        }

        _markStart("_synchronousDismiss");
        this._isShown = false;
        this._splashScreen = null;
        Jx.dispose(this._resizeHook);
        Jx.dispose(this._activationHook);
        Jx.dispose(this._spinnerTimer);

        // IE has a tendency to continue to animate elements even after they are hidden.
        // To avoid this issue, we're just going to remove the spinner entirely.
        document.getElementById("splashScreenProgress").removeNode(true);
        Debug.assert(Jx.isNullOrUndefined(document.getElementById("splashScreenProgress")));

        // Hide the splash screen element and show the app body
        document.getElementById("splashScreen").classList.add("hidden");
        document.getElementById("appBody").classList.remove("invisible");

        var scheduler = Jx.scheduler;
        scheduler.setTimeSlice();    // resets the timeslice to the default value
        scheduler.yield();

        this.raiseEvent(SplashScreen.Events.dismissed);

        // This call tells the OS that our initial UI and is ready to be displayed. It needs to be
        // called after UI components have had a chance to process the dismiss event.
        this._dismissDeferredSplashScreen();

        Mail.log("SplashScreen_dismiss");
        var lastActivationKind = Jx.activation.lastKind;
        if (lastActivationKind !== Jx.Activation.neverActivated) {
            Jx.ptStopLaunch(Jx.TimePoint.responsive, lastActivationKind);
        }
        _markStop("_synchronousDismiss");
    };

    prototype.prepareForRestart = function () {
        // Show the splash screen again so that the user sees
        // that while restarting instead of the old ui.
        _markStart("prepareForRestart");
        this._isShown = true;
        this._updatePosition();
        var splash = document.getElementById("splashScreen");
        Debug.assert(Jx.isHTMLElement(splash));
        splash.removeAttribute("style");    // remove any manual styles applied by previous animations
        splash.classList.remove("hidden");
        _markStop("prepareForRestart");
    };

    function _mark(s) { Jx.mark("Mail.SplashScreen." + s); }
    function _markStart(s) { Jx.mark("Mail.SplashScreen." + s + ",StartTA,Mail,SplashScreen"); }
    function _markStop(s) { Jx.mark("Mail.SplashScreen." + s + ",StopTA,Mail,SplashScreen"); }
});
