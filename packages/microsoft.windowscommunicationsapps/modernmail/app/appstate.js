
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global Mail,Jx,Windows,Debug*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "AppState", function () {
    "use strict";

    var Activation = Windows.ApplicationModel.Activation;

    var AppState = Mail.AppState = function (platform, activationEvent, defaultAccount, container) {
        _markStart("ctor");
        this._platform = platform;
        this._selectedAccount = null;
        this._selectedMessages = [];
        this._lastSelectedMessage = null;

        this._lastActivationType = activationEvent.kind;
        var settings = this._settings = container.container("AppState");
        this._restartCheck = new Mail.RestartCheck();

        var previous = activationEvent.previousExecutionState,
            ExecState = Activation.ApplicationExecutionState;
        if (previous === ExecState.notRunning || previous === ExecState.closedByUser) {
            // Clear previous hydration data
            settings.remove("selection");
        }

        // First try to load state from the initial tile or toast activation event
        var initial = this._deserialize(activationEvent.arguments);
        if (!initial) {

            // Next try to load it from hydration data
            initial = this._deserialize(settings.get("selection"));
            if (!initial) {
                // Lastly fallback to the default account
                initial = { account: defaultAccount };
                initial.view = initial.account.inboxView;
            }

            // Clear the selected folder and message across periods of inactivity
            if (this._checkForInactivity()) {
                initial.view = initial.account.inboxView;
                initial.message = null;
                initial.messageIndex = -1;
            }
        }

        Debug.assert(initial.account);
        Debug.assert(initial.view);
        this._startup = initial;

        this.setSelectedView(initial.view);
        this.setSelectedMessages(initial.message || null, initial.messageIndex, []);

        // Register for post launch tile/toast activations
        this._hook = new Mail.EventHook(Jx.activation, "activated", this._onActivation, this);
        _markStop("ctor");
    };
    var prototype = AppState.prototype;

    Jx.augment(AppState, Jx.Events);
    Debug.Events.define(prototype, "updateSelection");

    prototype._onActivation = function (ev) {
        _markStart("_onActivation");
        this._lastActivationType = ev.kind;

        if (ev.kind === Activation.ActivationKind.protocol) {
            Mail.Utilities.ComposeHelper.onProtocol(ev);
        } else {
            var selection = this._deserialize(ev.arguments);
            if (selection) {
                // Broadcast the new desired selection so that the frame and children can update
                this.raiseEvent("updateSelection", selection);
            } else {
                this._checkForInactivity();
            }
        }
        _markStop("_onActivation");
    };

    prototype._deserialize = function (json) {
        _markStart("_deserialize");
        try {
            var account, view, message, messageIndex = -1,
                platform = this._platform,
                parsed = Mail.Activation.parseArguments(platform, json);

            if (parsed) {
                // Is this account valid and mail enabled
                account = Mail.Account.load(parsed.accountId, platform);
                if (account && account.isMailEnabled) {

                    // Is this view valid and matches this account
                    view = account.loadView(parsed.viewId);
                    if (view) {

                        // It's ok if we don't have a message or fail to load it
                        if (parsed.messageId) {
                            try {
                                message = account.loadMessage(parsed.messageId);
                            } catch (e) { }

                            if (message && Jx.isNumber(parsed.messageIndex)) {
                                // Hint index so that message list can find this message faster
                                messageIndex = parsed.messageIndex;
                            }
                        }
                        // We successfully loaded the account and view (and maybe a message)
                        _markStop("_deserialize");
                        return { account: account, view: view, message: message, messageIndex: messageIndex };
                    }
                }
            }
        } catch (e) {
            // Ignore failures and report that we failed to load
            Jx.log.exception("Failed to deserialize selection", e);
        }
        _markStop("_deserialize");
        return null;
    };

    prototype.getStartupAccount = function () {
        return this._startup.account;
    };

    prototype.getStartupView = function () {
        return this._startup.view;
    };

    prototype.addRestartCheck = function (description, checkFunction, context) {
        this._restartCheck.addRestartCheck(description, checkFunction, context);
    };

    prototype.onAppVisible = function () {
        this._restartCheck.onAppVisible();
        this._checkForInactivity();
    };

    prototype.setAppInvisible = function () {
        this._settings.set("inactiveTimestamp", String(Date.now()));
    };

    prototype.setSelectedMessages = function (displayed, index, messages) {
        _markStart("setSelectedMessages");
        this._lastSelectedMessage = displayed;
        this._lastSelectedMessageId = displayed ? displayed.objectId : "";
        this._lastSelectedMessageIndex = index;
        this._selectedMessages = messages;

        // Save our hydration data
        _mark("setSelectedMessages-save");
        var json = Mail.Activation.stringifyArguments(this._selectedView, this._lastSelectedMessage);
        this._settings.set("selection", json);
        _markStop("setSelectedMessages");
    };

    prototype.setSelectedView = function (view) {
        Debug.assert(Jx.isInstanceOf(view, Mail.UIDataModel.MailView));
        _markStart("setSelectedView");

        var folder = view.folder;
        if (folder) {
            folder.ensureSyncEnabled();
        }

        this._selectedAccount = view.account;
        this._selectedView = view;
        _markStop("setSelectedView");
    };

    prototype._checkForInactivity = function () {
        _markStart("_checkForInactivity");
        var timestamp = this._settings.get("inactiveTimestamp");
        if (!Jx.isNonEmptyString(timestamp)) {
            _markStop("_checkForInactivity");
            return false;
        }
        this._settings.remove("inactiveTimestamp");

        if (Mail.Utilities.ComposeHelper.isComposeShowing) {
            _markStop("_checkForInactivity");
            return false;
        }

        if (Date.now() - Number(timestamp) > Mail.Utilities.msInOneHour) {
            // Clear the old settings but try to maintain the current account
            this._settings.remove("settings");
            this.raiseEvent("updateSelection", { account: this._selectedAccount });
            _markStop("_checkForInactivity");
            return true;
        }

        _markStop("_checkForInactivity");
        return false;
    };

    Object.defineProperty(prototype, "lastSelectedMessageId", { get: function () { return this._lastSelectedMessageId; } });
    Object.defineProperty(prototype, "lastSelectedMessageIndex", { get: function () { return this._lastSelectedMessageIndex; } });
    Object.defineProperty(prototype, "lastActivationType", { get: function () { return this._lastActivationType; } });

    Object.defineProperty(prototype, "selectedAccount", { get: function () {
        return this._selectedAccount.platformObject;
    }, enumerable: true });
    Object.defineProperty(prototype, "selectedMessages", { get: function () {
        return this._selectedMessages;
    }, enumerable: true });
    Object.defineProperty(prototype, "lastSelectedMessage", { get: function () {
        return this._lastSelectedMessage;
    }, enumerable: true });

    function _mark(s) { Jx.mark("AppState." + s); }
    function _markStart(s) { Jx.mark("AppState." + s + ",StartTA,AppState"); }
    function _markStop(s) { Jx.mark("AppState." + s + ",StopTA,AppState"); }

});

