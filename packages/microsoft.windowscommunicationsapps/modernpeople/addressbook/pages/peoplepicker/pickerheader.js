
// Copyright (C) Microsoft Corporation.  All rights reserved.

Jx.delayDefine(People, "PickerHeader", function () {

    var P = window.People;
    var Plat = Microsoft.WindowsLive.Platform;

    P.PickerHeader = /* @constructor*/function (basket, platform, jobSet) {
        /// <summary>Constructor</summary>
        /// <param name="basket" type="Windows.ApplicationModel.Contacts.Provider.IContactPickerUI"/>
        /// <param name="jobSet" type="Plat.Client"/>
        /// <param name="jobSet" type="P.JobSet"/>
        this._name = "People.PickerHeader";
        this._platform = platform;
        this._jobSet = jobSet;
        this._messageBarClassName = "ab-messageBar";
        this._messageBar = /*@static_cast(Chat.MessageBar)*/null;
        this._syncMessageBarPresenter = /*@static_cast(Chat.SyncMessageBarPresenter)*/null;

        this.initComponent();
    };

    Jx.augment(P.PickerHeader, Jx.Component);

    // need to have this for semantic zoom view ?
    P.PickerHeader.prototype.getMessageBar = function () {
        this._ensureMessageBar();
        return this._messageBar;
    };

    // need to have this for semantic zoom view ?
    P.PickerHeader.prototype.getFilterToggle = function () {
        return this._filterToggle;
    };

    P.PickerHeader.prototype.getUI = function (ui) {
        // empty string here is for consistancy and allows message bar to be enabled.
        ui.html = "";
    };

    P.PickerHeader.prototype.activateUI = function () {
        Jx.Component.prototype.activateUI.call(this);
        this._jobSet.addUIJob(this, this._ensureMessageBar, null, P.Priority.messageBar);
    };


    // need to have this for semantic zoom view ?
    P.PickerHeader.prototype._ensureMessageBar = function () {
        if (!this._messageBar) {
            $include("$(messageBarResources)/css/messagebar.css");
            var messageBar = this._messageBar = new Chat.MessageBar();
            var syncMessageBarPresenter = this._syncMessageBarPresenter = new Chat.SyncMessageBarPresenter();
            syncMessageBarPresenter.init(messageBar, this._platform, Plat.ApplicationScenario.people, this._messageBarClassName);
            syncMessageBarPresenter.disableCredentialMissingErrorMessage();
        }
    };

    P.PickerHeader.prototype.shutdownUI = function () {
        this._syncMessageBarPresenter.shutdown();
    };

    P.PickerHeader.prototype.deactivateUI = function () {
        var syncMessageBarPresenter = this._syncMessageBarPresenter;
        if (syncMessageBarPresenter) {
            syncMessageBarPresenter.shutdown();
        }

        this._messageBar = /* @static_cast(Chat.MessageBar)*/null;
        this._syncMessageBarPresenter = /* @static_cast(Chat.SyncMessageBarPresenter)*/null;

        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.PickerHeader.prototype.shutdownComponent = function () {
        this._connectedTo = null;
        Jx.Component.prototype.shutdownComponent.call(this);
    };

});

