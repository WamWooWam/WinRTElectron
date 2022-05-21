
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail, ["MessageListProgressRing", "WinJSAnimationSuppressor"], function () {
    "use strict";

    var ProgressRing = Mail.MessageListProgressRing = function (progressRingElement) {
        /// <summary>Shows/hides the progress ring (aka spinning dots) while we are syncing.
        /// It also disables the animation upon initial folder sync and turns it on when the sync is completed or when we switch folder.
        /// This logic is separated in its own class according to the open/close principle
        /// </summary>
        Debug.assert(Jx.isHTMLElement(progressRingElement));
        this._progressRingElement = progressRingElement;

        this._timer = null;
        this._suppressor = null;

        this._oldShowProgress = false;
        this._setRingVisibility(false);

        this._disposer = new Mail.Disposer();
    };

    ProgressRing.prototype._setRingVisibility = function (visible) {
        Mail.writeProfilerMark("MessageListProgressRing - " + (visible ? "showing" : "hiding") + " the messageList Progress Ring");
        Jx.setClass(this._progressRingElement, "hidden", !visible);
    };

    ProgressRing.prototype.adjustVisibilityForSyncStatus = function (showProgress) {
        if (showProgress) {
            // Disable animations upon initial folder sync to workaround poor listview insert animations
            this._suppressor = this._disposer.replace(this._suppressor, new Mail.WinJSAnimationSuppressor());
        }

        this._setRingVisibility(showProgress);

        if (this._oldShowProgress && !showProgress) { // If sync is now complete
            this._timer = this._disposer.replace(
                this._timer,
                new Jx.Timer(1000, function () {
                    this._disposer.disposeNow(this._suppressor);
                    this._suppressor = null;
                }, this)
            );
        }

        this._oldShowProgress = showProgress;
    };

    ProgressRing.prototype.dispose = function () {
        this._disposer.dispose();
    };

    var WinJSUI = WinJS.UI;
    Mail.WinJSAnimationSuppressor = function () {
        WinJSUI.disableAnimations();
    };

    Mail.WinJSAnimationSuppressor.prototype.dispose = function () {
        WinJSUI.enableAnimations();
    };

});