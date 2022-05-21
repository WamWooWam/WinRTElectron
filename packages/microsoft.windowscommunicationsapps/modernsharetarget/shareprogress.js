
//
// Copyright (C) Microsoft. All rights reserved.
//

/// <reference path="ShareTarget.ref.js" />

Share.Progress = /* @constructor*/function () {
    ///<summary>
    /// ShareProgress constructor.  Call using new.
    /// ShareProgress handles the UI and user interaction for the sharing progress area.
    /// ShareProgress also fires the following events: "cancel"
    ///</summary>

    this.initComponent();

    Debug.Events.define(this, "cancel");
};

Jx.augment(Share.Progress, Jx.Component);
Jx.augment(Share.Progress, Jx.Events);

Share.Progress.prototype.activateUI = function () {
    /// <summary>
    /// activateUI contains initialization that occurs after the UI is present
    /// </summary>

    Jx.Component.prototype.activateUI.call(this);

    if (!this._uiInitialized) {

        // Hook up to button events

        var elButton = document.getElementById("shareCancel");
        var that = this;

        var doCancel = function cancel() {
            Jx.log.info("Cancel button clicked");
            that.raiseEvent("cancel");
        };

        elButton.addEventListener("click", doCancel, false);

        var networkInformation = Windows.Networking.Connectivity.NetworkInformation;

        // Hook up to the network change event
        networkInformation.addEventListener("networkstatuschanged", this._networkChange);

        // Set up event removal function
        this._removeEvents = function removeEvents() {
            elButton.removeEventListener("click", doCancel, false);
            networkInformation.removeEventListener("networkstatuschanged", that._networkChange);
        };

        this._uiInitialized = true;
    }
};

Share.Progress.prototype.animateUI = function () {
    /// <summary>
    /// Provides an opportunity for the progress UX to perform behavior after it has finished animating in
    /// </summary>

    this._networkChange();
};

Share.Progress.prototype.deactivateUI = function () {
    /// <summary>
    /// deactivateUI unhooks the js from any HTML
    /// </summary>

    if (this._uiInitialized) {
        this._removeEvents();
        this._removeEvents = null;

        this._uiInitialized = false;
    };
};

Share.Progress.prototype.getUI = function (ui) {
    ///<summary>
    /// Retrieves HTML associated with the progress area
    ///</summary>
    /// <param name="ui" type="Object">Object container for html/css</param>
    /// <returns>UI object</returns>

    ui.html = ShareTarget.Templates.shareProgress();

    // Note that a hard-codeds IDs are included in the template.
    // This does mean that there can only be one Share.Progress on the page at a time.
};

Share.Progress.prototype._networkChange = function () {
    ///<summary>
    /// Handles network change event, examines current network properties and shows/hides button appropriately.
    ///</summary>

    var currentProfile = Windows.Networking.Connectivity.NetworkInformation.getInternetConnectionProfile();
    var isConnected = /*@static_cast(Boolean)*/currentProfile && /*@static_cast(Number)*/currentProfile.getNetworkConnectivityLevel() === Windows.Networking.Connectivity.NetworkConnectivityLevel.internetAccess;

    Share.Progress.prototype._showHideButton(isConnected);
};

Share.Progress.prototype._showHideButton = function (isConnected) {
    ///<summary>
    /// Determines whether to show or hide the button based on the passed-in connected state
    ///</summary>
    ///<param name="isConnected" type="Boolean">Indicates whether the user is currently connected</param>

    var elButton = document.getElementById("shareCancel");

    // The fade animation sets the opacity of the element; also set display for accessibility reasons.
    if (isConnected) {
        WinJS.UI.Animation.fadeOut(elButton).then(function () {
            elButton.style.display = "none";
        });
    } else {
        elButton.style.display = "inline";
        WinJS.UI.Animation.fadeIn(elButton);
    }
};

Share.Progress.prototype._uiInitialized = false; // Indicates whether activateUI has been called
Share.Progress.prototype._removeEvents = /*@static_cast(Function)*/null; 