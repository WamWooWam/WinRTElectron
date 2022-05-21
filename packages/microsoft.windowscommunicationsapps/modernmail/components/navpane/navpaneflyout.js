
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,WinJS*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "NavPaneFlyout", function () {
    "use strict";

    var sizes = { // To avoid layout, these are duplicated from the CSS
        people:   { width: 320, crossover: 540, skinny: 200 },
        folders:  { width: 320, crossover: 540, skinny: 200 },
        accounts: { width: 260, crossover: 380, skinny: 200 }
    };

    var NavPaneFlyout = Mail.NavPaneFlyout = function (host, content, type) {
        ///<summary>Displays a light-dismiss next to the nav pane with the specified content</summary>
        ///<param name="host">The hosting component, provides sizing information</param>
        ///<param name="content" type="Jx.Component">The UI to be rendered in this flyout</param>
        ///<param name="type" type="String">A key from the sizes array above</param>
        Debug.assert(Jx.isObject(host));
        Debug.assert(Jx.isObject(content));
        Debug.assert(Jx.isObject(sizes[type]));

        this.initComponent();

        this._host = host;
        this._content = content;
        this._type = type;
        this.append(content);

        this._backgroundElement = this._contentElement = null;
        this._isVisible = this._desiredVisibility = false;
        this._hooks = null;
        this._entryPointHooks = null;
    };
    Jx.augment(NavPaneFlyout, Jx.Component);
    var prototype = NavPaneFlyout.prototype;

    prototype.getUI = function (ui) {
        ui.html =
            "<div" +
                " id='" + this._id + "'" +
                " class='navPaneFlyout invisible'" +
                " role='menuitem'" +
                " aria-label='" + Jx.escapeHtml(Jx.res.getString("mailCloseFlyout")) + "'" +
            ">" +
                "<div tabIndex='0' aria-hidden='true'></div>" + // This node and the one below are focus traps, used to cycle tab through the flyout
                "<div id='content" + this._id + "' class='navPaneFlyoutContent " + this._type + " hidden' role='menu' aria-flowto='" + this._id + "'>" +
                    Jx.getUI(this._content).html +
                "</div>" +
                "<div tabIndex='0' aria-hidden='true'></div>" +
            "</div>";
    };

    prototype.activateUI = function () {
        _markStart("activateUI");
        var backgroundElement = this._backgroundElement = document.getElementById(this._id);
        this._contentElement = backgroundElement.querySelector(".navPaneFlyoutContent");

        this._hooks = new Mail.Disposer(
            new Mail.EventHook(backgroundElement, "focusout", this._onFocusOut, this),
            new Mail.EventHook(backgroundElement, "keydown", this._onKeyDown, this),
            new Mail.EventHook(backgroundElement, "click", this._onClick, this),
            new Mail.EventHook(backgroundElement.firstChild, "focus", this._onFirstFocus, this),
            new Mail.EventHook(backgroundElement.lastChild, "focus", this._onLastFocus, this),
            Mail.EventHook.createEventManagerHook(this, "contentUpdated", this._onContentUpdated, this)
        );

        Jx.Component.prototype.activateUI.call(this);
        _markStop("activateUI");
    };

    prototype.deactivateUI = function () {
        _markStart("deactivateUI");
        Jx.Component.prototype.deactivateUI.call(this);

        if (this._animation) {
            this._animation.cancel();
        }

        Jx.dispose(this._hooks);
        this._hooks = null;

        _markStop("deactivateUI");
    };

    prototype.setEntryPoint = function (element) {
        ///<summary>The "entry point" element is the HTML element that is clicked to launch this flyout.  Passing it here allows the flyout to override the click handler and toggle the
        ///flyout closed on a repeated click.</summary>
        Debug.assert(Jx.isNullOrUndefined(element) || Jx.isHTMLElement(element));
        if (this._entryPoint !== element) {
            this._entryPoint = element;

            var newHooks = null;
            if (element) {
                var parentElement = element.parentElement; // To intercept properly, a routed handler needs to be above the target node
                newHooks = [
                    new Mail.EventHook(parentElement, "click", this._onEntryPointClick, this, true),
                    new Mail.EventHook(parentElement, "MSPointerDown", this._onEntryPointPointerDown, this, true)
                ];
            }
            this._entryPointHooks = this._hooks.replace(this._entryPointHooks, newHooks);
        }
    };

    prototype._onEntryPointPointerDown = function (ev) {
        ///<summary>Event hook - called when the entry point to the flyout starts getting a tap.  We'll need to prevent
        ///the focus change at this point, so that we can intercept the click and toggle visibility</summary>
        if (this._isVisible && Mail.isElementOrDescendant(ev.target, this._entryPoint)) {
            _markInfo("inhibited pointer down");
            ev.preventDefault();
        }
    };

    prototype._onEntryPointClick = function (ev) {
        ///<summary>Event hook - called when the entry point to the flyout is clicked.  We'll intercept that click, to
        ///enable toggle behavior</summary>
        if (this._isVisible && Mail.isElementOrDescendant(ev.target, this._entryPoint)) {
            _markInfo("entry point clicked");
            Jx.safeSetActive(this._entryPoint);
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    prototype._onKeyDown = function (ev) {
        ///<summary>Event hook - called when a keystroke bubbles up to the click-eating background element</summary>
        if (ev.key === "Esc") {
            _markInfo("escape pressed");
            var entryPoint = this._entryPoint;
            if (entryPoint) {
                entryPoint.focus();
            }
            this.hide();
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    prototype._onClick = function (ev) {
        ///<summary>Event hook - called when the click-eating backgroundElement is clicked</summary>
        if (ev.target === this._backgroundElement) {
            _markInfo("background clicked");
            var entryPoint = this._entryPoint;
            if (entryPoint) {
                Jx.safeSetActive(entryPoint);
            }
            this.hide();
            ev.stopPropagation();
            ev.preventDefault();
        }
    };

    prototype._onFocusOut = function (ev) {
        ///<summary>Event hook - called when the flyout moves.  If focus is leaving the flyout, this generally
        ///indicates a click outside the flyout, an app switch, or some kind of system/flyout UX.</summary>
        var newFocus = ev.relatedTarget,
            flyout = this._backgroundElement,
            options = this._options;
        if (!options || !options.sticky) {
            if (!newFocus || !Mail.isElementOrDescendant(newFocus, flyout)) {
                _markInfo("lost focus to " + (newFocus ? (newFocus.id + " " + newFocus.className) : "null"));
                if (!newFocus) { // Focus went away completely (app switch), set it to the entry point
                    var entryPoint = this._entryPoint;
                    if (entryPoint) {
                        Jx.safeSetActive(entryPoint);
                    }
                }
                this.hide();
            }
        }
    };

    prototype._onContentUpdated = function (ev) {
        ///<summary>Event hook - called when the content within the flyout changes.  It is possible, by removing nodes,
        /// for focus to be lost without any focusOut event.  We should restore focus in this case.</summary>
        if (ev.stage === Jx.EventManager.Stages.bubbling && // Give our content first crack at remedying the situation
            document.activeElement === null) {
            this._setFocus(true /* from top */, false /* not via keyboard */);
        }
    };

    prototype.show = function (options) {
        ///<summary>Called externally to show the flyout</summary>
        ///<returns type="WinJS.Promise">A promise that complete when the flyout finishes showing</returns>
        this._options = options;
        return this._showHide(true /* show */);
    };

    prototype.hide = function () {
        ///<summary>Called externally to dismiss the flyout - not called by light-dismiss</summary>
        ///<returns type="WinJS.Promise">A promise that complete when the flyout finishes hiding</returns>
        this._options = null;
        return this._showHide(false /* hide */);
    };

    prototype._showHide = function (desiredVisibility) {
        _markInfo("requested " + (desiredVisibility ? "show" : "hide"));
        Debug.assert(Jx.isBoolean(desiredVisibility));

        var animation;
        var oldVisibility = this._desiredVisibility;
        if (oldVisibility !== desiredVisibility) {
            this._desiredVisibility = desiredVisibility;

            animation = this._animation;
            if (!animation) {
                animation = this._animation = this._runAnimation();
                var cleanup = function () { this._animation = null; }.bind(this);
                animation.done(cleanup, cleanup);
            }
        }
        return Jx.Promise.fork(animation);
    };

    prototype._runAnimation = function () {
        var desiredVisibility = this._desiredVisibility;
        if (desiredVisibility === this._isVisible) {
            return null;
        }

        _markAsyncStart(desiredVisibility ? "show" : "hide");
        var backgroundElement = this._backgroundElement,
            contentElement = this._contentElement,
            animation;

        Jx.setClass(backgroundElement, "invisible", !desiredVisibility);
        if (desiredVisibility) {
            contentElement.classList.remove("hidden");
            this._isVisible = true;
            this._beforeShow();
        }

        var width = this._getWidth();
        var offset = {
            left: (Jx.isRtl() ? width : -width) + "px",
            top: "0px"
        };

        backgroundElement.style.overflow = ""; // Remove BLUE:332609 workaround
        if (desiredVisibility) {
            animation = WinJS.UI.Animation.showEdgeUI(contentElement, offset, { mechanism: "transition" });
        } else {
            // hideEdgeUI will clean off its temporary styles before asynchronously calling us back, causing
            // the flyout to flicker back into view.  Set the desired transform ourselves.
            contentElement.style.transform = "translate(" + offset.left + ", " + offset.top + ")";
            animation = WinJS.UI.Animation.hideEdgeUI(contentElement, offset, { mechanism: "transition" });
        }

        return Jx.Promise.cancelable(animation).then(function () {
            backgroundElement.style.overflow = "visible"; // Workaround BLUE:332609 (background does not paint during content animations with overflow:hidden set)
            if (!desiredVisibility) {
                contentElement.style.transform = "";
                backgroundElement.style.overflow = "";
                contentElement.classList.add("hidden");
                this._isVisible = false;
                this._afterHide();
            }
            _markAsyncStop(desiredVisibility ? "show" : "hide");
            return this._runAnimation();
        }.bind(this));
    };

    prototype._getWidth = function () {
        ///<summary>Reports the width of the flyout.  To avoid a layout pass, we'll duplicate the logic from the CSS.</summary>
        var windowWidth = this._host.windowWidth,
            size = sizes[this._type];
        if (windowWidth >= size.crossover) {
            return size.width;
        } else {
            return size.skinny;
        }
    };

    Object.defineProperty(prototype, "isVisible", { get: function () {
        return this._desiredVisibility;
    }});

    prototype._beforeShow = function () {
        _markInfo("beforeShow");
        ///<summary>Called when the flyout is about to be animated into view</summary>
        this._content.beforeShow();

        var options = this._options;
        this._placeAbovePeekBar(options && options.abovePeekBar);
        this._setFocus(true /* from top */, options && options.viaKeyboard);
    };

    prototype._afterHide = function () {
        _markInfo("afterHide");
        this._placeAbovePeekBar(false);
        this._content.afterHide();
    };

    prototype._onFirstFocus = function () {
        ///<summary>The user has shift+tabbed to the top of the flyout</summary>
        _markInfo("onFirstFocus");
        this._setFocus(false /* from bottom */, true /* via keyboard */);
    };

    prototype._onLastFocus = function () {
        ///<summary>The user has shift+tabbed to the top of the flyout</summary>
        _markInfo("onLastFocus");
        this._setFocus(true /* from top */, true /* via keyboard */);
    };

    prototype._setFocus = function (fromTop, viaKeyboard) {
        ///<summary>Sets focus to an element in the flyout, or the flyout itself if none is available</summary>
        ///<param name="fromTop" type="Boolean">True if the first element should be focused, false if the last</param>
        ///<param name="viaKeyboard" type="Boolean" optional="true">Whether focus is being set using the keyboard or not, to control display of the focus rect</param>
        Debug.assert(Jx.isBoolean(fromTop));
        Debug.assert(Jx.isNullOrUndefined(viaKeyboard) || Jx.isBoolean(viaKeyboard));
        Debug.assert(Array.prototype.every.call(this._contentElement.querySelector("[tabIndex]") || [], function (element) {
            return element.tabIndex === -1 || element.tabIndex === 0; // We don't support non-zero tabIndex.
        }));

        var elements = this._contentElement.querySelectorAll("[tabIndex='0']");
        if (elements) {
            for (var i = 0, len = elements.length; i < len; i++) {
                var element = elements[fromTop ? i : len - i - 1];
                _markInfo("setting focus to " + element.id + " " + element.className);
                if (viaKeyboard) {
                    element.focus();
                } else {
                    Jx.safeSetActive(element);
                }

                if (element === document.activeElement) {
                    return;
                }
            }
        }

        _markInfo("nothing to focus");
        this._contentElement.focus();
    };

    prototype._placeAbovePeekBar = function (placeAbovePeekBar) {
        Debug.assert(placeAbovePeekBar === undefined || Jx.isBoolean(placeAbovePeekBar));
        Jx.setClass(this._backgroundElement, "abovePeekBar", placeAbovePeekBar);

        Debug.call(function () {
            var backgroundElementZIndex = window.getComputedStyle(this._backgroundElement).zIndex;
            var peekBarZIndex = window.getComputedStyle(document.querySelector(".peekbar")).zIndex;
            Debug.assert(backgroundElementZIndex !== peekBarZIndex && (backgroundElementZIndex > peekBarZIndex === Boolean(placeAbovePeekBar)));
        }, this);
    };

    prototype.dispose = function () {
        ///<summary>Called externally to destroy the flyout - removes it from the UX and the component tree</summary>
        var parentComponent = this.getParent();
        if (parentComponent) {
            parentComponent.removeChild(this);
        }

        this.shutdownUI();
        this.shutdownComponent();
    };

    function _markStart(str) {
        Jx.mark("Mail.NavPaneFlyout." + str + ",StartTA,Mail");
    }
    function _markStop(str) {
        Jx.mark("Mail.NavPaneFlyout." + str + ",StopTA,Mail");
    }
    function _markAsyncStart(str) {
        Jx.mark("Mail.NavPaneFlyout." + str + ",StartTM,Mail");
    }
    function _markAsyncStop(str) {
        Jx.mark("Mail.NavPaneFlyout." + str + ",StopTM,Mail");
    }
    function _markInfo(str) {
        Debug.only(Jx.log.info("Mail.NavPaneFlyout: " + str)); // NOT FOR CHECKIN
        Mail.writeProfilerMark("Mail.NavPaneFlyout: " + str);
    }

});
