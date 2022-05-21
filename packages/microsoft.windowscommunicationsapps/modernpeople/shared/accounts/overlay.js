
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="../JSUtil/Include.js"/>
/// <disable>JS2076.IdentifierIsMiscased</disable>

Jx.delayDefine(People, "Overlay", function () {

    var P = window.People;

    var Overlay = P.Overlay = function (content) {
        ///<summary>Class for hosting a JX component as a fullscreen overlay</summary>
        ///<param name="content" type="Jx.Component">The UI to show as an overlay</param>
        this._restore = [];
        this._content = content;
        this._setImmediateHandle = null;
        this._onNodeInsertedListener = this._onNodeAdded.bind(this);
    };
    Jx.inherit(Overlay, Jx.Events);
    Debug.Events.define(Overlay.prototype, "keyup");

    // Used to prevent overlays ontop of overlays.
    Overlay._activeOverlay = null;
    Overlay._reservedOverlay = null;

    Overlay._trap = function (ev) {
        ev.stopPropagation();
    };

    Overlay.prototype.show = function (forceShow) {
        ///<summary>Adds the overlay into the DOM and disables the element being overlaid</summary>
        ///<param name="forceShow" type="Boolean" optional="true">If true will force any current overlays to dismiss so this one can be displayed.</param>
        ///<return type="Boolean">Returns true if no other overlays are currently showing</return>
        if (Overlay._reservedOverlay && this !== Overlay._reservedOverlay) {
            Jx.log.warning("Failing to show overlay. A different overlay has already reserved next showing.");
            return false;
        }

        if (Overlay._activeOverlay) {
            if (forceShow) {
                if (!this.closeActive()) {
                    return false;
                }
            } else {
                Jx.log.warning("Failing to show overlay. One is already active.");
                return false;
            }
        }
        Overlay._reservedOverlay = null;
        Overlay._activeOverlay = this;
        var root = this._root = document.createElement("div"),
        fill = document.createElement("div"),
        overlaid = document.body.firstElementChild;

        root.className = "overlay-root";
        fill.className = "overlay-fill";
        fill.style.zIndex = zIndexMax(document.body, 10) + 1; //make sure zIndex is larger than Mail upsell phase1 z-index.
        root.appendChild(fill);

        // Disable the other children of body so that they don't take part in things like
        // tab-order while an overlay is visible. Do this asynchronously, so that controls
        // like the WinJs.UI.SettingsFlyout can have time to dismiss before their events
        // are disabled.
        this._setImmediateHandle = setImmediate(function () {
            while (overlaid !== null) {
                if (!overlaid.disabled && root !== overlaid) {
                    overlaid.disabled = true;
                    this._restore.push(overlaid);
                }
                overlaid = overlaid.nextElementSibling;
            }

            // Listen for the addition of new nodes to anything overlaid and ensure they are
            // also disabled.
            document.body.addEventListener("DOMNodeInserted", this._onNodeInsertedListener, true);

        } .bind(this));

        this._keyupListener = this._onKeyupHandler.bind(this);

        // Prevent keydown and contextmenu events from bubbling since some apps handle this 
        // at the window level for navigation and we don't want the overlaid content to change.
        document.documentElement.addEventListener("keydown", Overlay._trap, false);
        document.documentElement.addEventListener("keyup", this._keyupListener, false);
        document.documentElement.addEventListener("contextmenu", Overlay._trap, false);

        document.body.appendChild(root);
        this._content.initUI(fill);
        return true;
    };

    Overlay.prototype.close = function () {
        ///<summary>Removes the overlay from the DOM and reenables the overlaid element</summary>
        if (Overlay._activeOverlay === this) {
            if (this._setImmediateHandle) {
                clearImmediate(this._setImmediateHandle);
                this._setImmediateHandle = null;
            }

            this._content.shutdownUI();
            document.body.removeChild(this._root);

            document.documentElement.removeEventListener("keydown", Overlay._trap, false);
            if (Jx.isFunction(this._keyupListener)) {
                document.documentElement.removeEventListener("keyup", this._keyupListener, false);
                this._keyupListener = null;
            }
            document.documentElement.removeEventListener("contextmenu", Overlay._trap, false);
            document.body.removeEventListener("DOMNodeInserted", this._onNodeInsertedListener, true);
            this._restore.forEach(function (overlaid) {
                overlaid.disabled = false;
            });
            Debug.assert(Overlay._activeOverlay === this);
            Overlay._activeOverlay = null;
        }
    };

    Overlay.prototype.isShowing = function () {
        ///<summary>Checks if this overlay is the active (i.e. visible) one.</summary>
        ///<return type="Boolean"/>
        return !Jx.isNullOrUndefined(Overlay._activeOverlay) && (Overlay._activeOverlay === this);
    };

    Overlay.prototype.canShow = function () {
        ///<summary>Checks to see if there are any active overlays that would prevent this one from showing.</summary>
        ///<return type="Boolean"/>
        return Jx.isNullOrUndefined(Overlay._activeOverlay) && (Jx.isNullOrUndefined(Overlay._reservedOverlay) || (Overlay._reservedOverlay === this));
    };

    Overlay.prototype.reserveNextShowing = function () {
        ///<summary>As long as there is no active dialog, and it is not already reserved,
        ///block any overlay but this one from showing next.</summary>
        ///<return type="Boolean"/>
        if (Jx.isNullOrUndefined(Overlay._activeOverlay) && Jx.isNullOrUndefined(Overlay._reservedOverlay)) {
            Overlay._reservedOverlay = this;
            return true;
        }
        return false;
    };

    Overlay.prototype.cancelReservation = function () {
        ///<summary>Cancels the reservation for next showing, provided this overlay has that reservation.</summary>
        if (Overlay._reservedOverlay === this) {
            Overlay._reservedOverlay = null;
        }
    };

    Overlay.prototype.closeActive = function () {
        ///<summary>Attemps to close any active overlay.</summary>
        ///<return type="Boolean">Returns true if successful</return>
        Jx.log.info("Forcing current overlay to dismiss.");
        if (Overlay._activeOverlay) {
            try {
                Overlay._activeOverlay.close();
                Overlay._activeOverlay = null;
            } catch (e) {
                Jx.log.exception("Failed attempting to close overlay. Likely already closed", e);
                return false;
            }
        }
        return true;
    };

    Overlay.prototype._onKeyupHandler = function (ev) {
        ///<summary>Keyup even handler</summary>
        this.raiseEvent("keyup", ev);
        ev.stopPropagation();
    };

    Overlay.prototype._onNodeAdded = function (ev) {
        ///<summary>Handler for the DOMNodeInserted event.</summary>
        ///<param name="ev" type="HTMLEvent"/>
        // We can safely ignore any nodes not being directly added to the doucument.body,
        // as any subtree elements will be disabled automatically based on their root.
        var target = ev.target;
        if (target.parentElement === document.body) {
            
            if (Jx.hasClass(target, "debugConsoleRoot")) {
                return;
            }
            
            if (!target.disabled) {
                this._restore.push(target);
                target.disabled = true;
            }
        }
    };

    var zIndexMax = function (node, max) {
        // Math.max returns null if zIndex is "auto"
        max = Math.max(getComputedStyle(node).zIndex, max) || max;
        var children = node.children || [];
        for (var i = 0, len = children.length; i < len; i++) {
            max = zIndexMax(children[i], max);
        }
        return max;
    };

});

