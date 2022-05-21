
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/// <reference path="ShareTarget.dep.js" />

Share.ShareButton = /* @constructor */function () {
    ///<summary>
    /// ShareButton constructor.  Call using new.
    /// ShareButton handles the UI and user interaction for the share button.
    /// ShareButton also fires the following events: "share"
    ///</summary>

    // Verify that "this" is an object of the correct type
    if (/* @static_cast(Function) */this.constructor !== Share.ShareButton) {
        throw new Error("Share.ShareButton is a constructor; it must be called using new.");
    }

    this.initComponent();

    Debug.Events.define(this, "share");
};

Jx.augment(Share.ShareButton, Jx.Component);
Jx.augment(Share.ShareButton, Jx.Events);

Share.ShareButton.prototype.activateUI = function () {
    /// <summary>
    /// activateUI contains initialization that occurs after the UI is present
    /// </summary>

    // Verify that "this" is an object of the correct type before use
    if (this.constructor !== Share.ShareButton) {
        throw new Error("activateUI references this; use bind if you cache this method.");
    }

    Jx.Component.prototype.activateUI.call(this);

    if (!this._uiInitialized) {

        this._elButton = document.getElementById("shareButton");

        var shareThis = this._share.bind(this);
        this._elButton.addEventListener("click", shareThis, false);

        this._removeEvents = function removeEvents() {
            this._elButton.removeEventListener("click", shareThis, false);
        };

        this._uiInitialized = true;
    }
};

Share.ShareButton.prototype.deactivateUI = function () {
    /// <summary>
    /// deactivateUI is used to detach the component from any UI interaction
    /// </summary>

    // Verify that "this" is an object of the correct type before use
    if (this.constructor !== Share.ShareButton) {
        throw new Error("deactivateUI references this; use bind if you cache this method.");
    }

    Jx.Component.prototype.deactivateUI.call(this);

    if (this._uiInitialized) {

        this._removeEvents();
        this._removeEvents = null;

        this._uiInitialized = false;
    }
};

Share.ShareButton.prototype.getUI = function (ui) {
    /// <summary>
    /// Retrieves HTML associated with button
    /// </summary>
    /// <param name="ui" type="Object">Object container for html/css</param>
    /// <returns>UI object</returns>

    ui.html = ShareTarget.Templates.shareButton();

    // Note that a hard-codeds IDs are included in the template.
    // This does mean that there can only be one ShareButton on the page at a time.
};

Share.ShareButton.prototype.focus = function () {
    /// <summary>
    /// Moves focus to this button.
    /// </summary>
    this._elButton.focus();
};

Share.ShareButton.prototype.shutdownComponent = function () {
    /// <summary>
    /// Cleanup associated with permanent end of this object
    /// </summary>

    Jx.Component.prototype.shutdownComponent.call(this);

    this.disposeEvents();
};

Share.ShareButton.prototype._share = function () {
    ///<summary>
    /// Event handler for button click
    ///</summary>

    this.raiseEvent("share");
};

Share.ShareButton.prototype._uiInitialized = false; // Indicates whether the UI is available.
Share.ShareButton.prototype._removeEvents = /* @static_cast(Function) */null;
Share.ShareButton.prototype._elButton = /* @static_cast(HTMLElement) */null; // The button element