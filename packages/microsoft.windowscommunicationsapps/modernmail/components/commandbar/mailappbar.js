
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,WinJS,Jx,Debug*/

Jx.delayDefine(Mail, "AppBar", function () {
    "use strict";

    var AppBar = Mail.AppBar = /*@constructor*/ function (appBarElement, options) {
        /// <summary>
        /// This class serves as a middle man between the command bar and WinJS.UI.AppBar.
        /// The intent is to marshall the app bar API to what our UI expects and hide all the workarounds in one spot
        /// so that our UI code would not be scattered with workarounds.
        /// The two major workarounds are
        /// 1. It returns a promise after the appbar is hidden/shown, so that the folder pinning code would know when to show the tile pinning
        ///    flyout
        /// 2. It checks the current visibility of the appbar before changing it.  This will save around 5ms per show/hide
        /// </summary>
        /// <param name="appBarElement" type="HTMLElement"></param>
        /// <param name="options" type="Object" optional="true"></param>
        Debug.assert(Jx.isHTMLElement(appBarElement));
        this._currentReduce = false;
        this._element = appBarElement;
        this._appBar = new WinJS.UI.AppBar(appBarElement, options);
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._appBar, "afterhide", function () {
                appBarElement.style.display = "none";
                this._completeReduce();
            }, this, false),
            new Mail.EventHook(this._appBar, "MSPointerDown", function (evt) {
                if (evt.button === 2 /*right click*/) {
                    evt.preventDefault();
                }
            }),
            new Mail.EventHook(this._appBar, "contextmenu", function (evt) {
                evt.preventDefault();
                this._appBar.hide();
            }, this, false),
            new Mail.EventHook(this._appBar, "MSHoldVisual", function (evt) {
                evt.preventDefault();
            }, this, false)
        );

        // allow us to listen for command animation completion 
        Debug.assert(this._appBar._endAnimateCommands, "AppBar internal function _endAnimateCommands doesn't exist.");
        var appBarEndAnimateCommands = this._appBar._endAnimateCommands;
        this._appBar._endAnimateCommands = this._getEndAnimateCommands(appBarEndAnimateCommands);

        // forwarding methods
        this.showOnlyCommands = this._appBar.showOnlyCommands.bind(this._appBar);
        this.showCommands = this._appBar.showCommands.bind(this._appBar);
        this.hideCommands = this._appBar.hideCommands.bind(this._appBar);
        this.getCommandById = this._appBar.getCommandById.bind(this._appBar);
        this.addEventListener = this._appBar.addEventListener.bind(this._appBar);
        this.removeEventListener = this._appBar.removeEventListener.bind(this._appBar);
    };

    var proto = AppBar.prototype;

    proto._getEndAnimateCommands = function (appBarEndAnimateCommands) {
        return function () {
            appBarEndAnimateCommands.apply(this._appBar, arguments);
            this._completeReduce();
        }.bind(this);
    };

    proto._setVisibility = function (newVisibility) {
        /// <param name="name" type="Boolean"></param>
        // if the app bar already has the desired visibility
        Debug.assert(Jx.isBoolean(newVisibility));
        if (newVisibility !== this._appBar.hidden) {
            return;
        }
        if (newVisibility) {
            this._appBar.show();
        } else {
            this._appBar.hide();
        }
    };

    proto._setVisibilityAsync = function (newVisibility) {
        /// <param name="name" type="Boolean"></param>
        /// <returns type="WinJS.Promise">Returns a promise that would be fulfilled when the appBar is fully shown</returns>
        Debug.assert(Jx.isBoolean(newVisibility));
        Debug.assert(Jx.isObject(this._appBar));
        var animationCompleteEventName = newVisibility ? "aftershow" : "afterhide",
            appBar = this._appBar,
            command = newVisibility ? appBar.show : appBar.hide;

        if (appBar.hidden !== newVisibility) {
            return WinJS.Promise.as();
        }

        return Jx.Promise.schedule(null, Mail.Priority.showAppBar, null).then(function () {
            // if the app bar already has the desired visibility
            if (appBar.hidden === newVisibility) {
                command.call(appBar);
                return Mail.Promises.waitForEvent(appBar, animationCompleteEventName);
            }
        });
    };

    proto.showAsync = function () {
        return this._setVisibilityAsync(true /*showAppBar*/);
    };

    proto.hideAsync = function () {
        return this._setVisibilityAsync(false /*showAppBar*/);
    };

    proto.show = function () {
        this._setVisibility(true /*showAppBar*/);
    };

    proto.hide = function () {
        this._setVisibility(false /*showAppBar*/);
    };

    proto.toggleVisibility = function () {
        this._setVisibility(this._appBar.hidden);
    };

    proto.setEnabled = function (isEnabled) {
        /// <param name="isEnabled" type="Boolean"></param>
        Debug.assert(Jx.isBoolean(isEnabled));
        this._appBar.disabled = !isEnabled;
    };

    proto.focus = function () {
        /// <summary>Sets focus on the first command in the app bar.</summary>
        Debug.assert(this._appBar._focusOnFirstFocusableElementOrThis, "AppBar internal function _focusOnFirstFocusableElementOrThis doesn't exist.");
        Debug.assert(WinJS.UI.AppBar.hasOwnProperty("_ElementWithFocusPreviousToAppBar"), "AppBar internal element _ElementWithFocusPreviousToAppBar doesn't exist");
        WinJS.UI.AppBar._ElementWithFocusPreviousToAppBar = document.activeElement;
        this._appBar._focusOnFirstFocusableElementOrThis();
    };

    proto._completeReduce = function () {
        if (!this._element.winAnimating) {
            this.reduce = this._currentReduce;
        }
    };

    Object.defineProperty(proto, "reduce", {
        enumerable: true,
        set: function (value) {
            Debug.assert(this._appBar._scaleAppBarHelper, "AppBar internal function _scaleAppBarHelper doesn't exist.");
            Debug.assert(this._appBar.hasOwnProperty("_appBarTotalKnownWidth"), "AppBar internal element _appBarTotalKnownWidth doesn't exist");
            this._currentReduce = value;
            if (!this._element.winAnimating) {
                if (this._currentReduce) {
                    this._appBar._appBarTotalKnownWidth = null;
                    this._appBar._scaleAppBarHelper = function () { return 1; };
                    this._element.classList.add("win-reduced");
                } else {
                    this._appBar._appBarTotalKnownWidth = null;
                    this._appBar._scaleAppBarHelper = function () { return Number.POSITIVE_INFINITY; };
                    this._element.classList.remove("win-reduced");
                }
            }
        }
    });

    Object.defineProperty(proto, "hidden", {
        enumerable: true,
        get: function () {
            return this._appBar.hidden;
        }
    });

    Object.defineProperty(proto, "offsetHeight", {
        enumerable: true,
        get: function () {
            return this._element.offsetHeight;
        }
    });

    Object.defineProperty(proto, "winAnimating", {
        enumerable: true,
        get: function () {
            return this._element.winAnimating;
        }
    });

});
