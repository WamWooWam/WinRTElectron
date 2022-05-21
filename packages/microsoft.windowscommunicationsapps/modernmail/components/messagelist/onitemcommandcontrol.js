
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Microsoft,Debug,Jx*/

Jx.delayDefine(Mail, "OnItemCommandControl", function () {
    "use strict";

    var ViewType = Microsoft.WindowsLive.Platform.MailViewType,
        Instrumentation = Mail.Instrumentation;

    Mail.OnItemCommandControl = function (mailItem, selection, listItemElement) {
        markStart("constructor");
        Debug.assert(Jx.isInstanceOf(mailItem, Mail.UIDataModel.MailItem));
        Debug.assert(Jx.isHTMLElement(listItemElement));

        this._mailItem = mailItem;
        this._selection = selection;
        this._listItemElement = listItemElement;

        // Find the command container and the four buttons inside it
        var commandContainer = listItemElement.querySelector(".mailMessageListItemCommandContainer");
        Debug.assert(Jx.isHTMLElement(commandContainer));
        this._flagCommandButton = commandContainer.querySelector(".commandFlag");
        Debug.assert(Jx.isHTMLElement(this._flagCommandButton));
        this._markReadUnreadCommandButton = commandContainer.querySelector(".commandMarkAsReadUnread");
        Debug.assert(Jx.isHTMLElement(this._markReadUnreadCommandButton));
        this._deleteCommandButton = commandContainer.querySelector(".commandDelete");
        Debug.assert(Jx.isHTMLElement(this._deleteCommandButton));

        this._updateAllCommands();
        this._disposer = new Mail.Disposer(
            new Mail.EventHook(commandContainer, "click", this._onClicked, this),
            new Mail.EventHook(commandContainer, "MSPointerDown", this._onPointerDown, this)
        );
        markStop("constructor");
    };

    Mail.OnItemCommandControl.prototype.dispose = function () {
        markStart("dispose");
        Jx.dispose(this._disposer);
        this._disposer = null;
        markStop("dispose");
    };

    var flagProps = ["flagged", "canFlag"],
        readProps = ["read", "canMarkAsRead"],
        deleteProps = ["canMove"],
        commandsEnabledProps = ["canFlag", "canMarkAsRead", "canMove"];

    Mail.OnItemCommandControl.prototype.onItemChanged = function (evt) {
        markStart("onMailItemChanged");
        if (Mail.Validators.havePropertiesChanged(evt, flagProps)) {
            this._updateFlagCommand();
        }
        if (Mail.Validators.havePropertiesChanged(evt, readProps)) {
            this._updateReadCommands();
        }
        if (Mail.Validators.havePropertiesChanged(evt, deleteProps)) {
            this._updateDeleteCommand();
        }
        if (Mail.Validators.havePropertiesChanged(evt, commandsEnabledProps)) {
            this._checkCommandsEnabled();
        }
        markStop("onMailItemChanged");
    };

    Mail.OnItemCommandControl.prototype._onClicked = function (evt) {
        markStart("onClicked");
        var classes = evt.target.classList;
        if (classes.contains("commandFlag")) {
            this._toggleFlag();
        } else if (classes.contains("commandMarkAsReadUnread")) {
            this._toggleReadState();
        } else if (classes.contains("commandDelete")) {
            this._deleteMailItem();
        }
        markStop("onClicked");
    };

    Mail.OnItemCommandControl.prototype._onPointerDown = function (evt) {
        Debug.assert(Jx.isObject(evt));
        if (evt.pointerType === "mouse" && evt.currentPoint.properties.isRightButtonPressed) {
            // Do not call stopPropagation on right click as we want right click to bring up the app bar
            return;
        }
        // Call stopPropagation on left click as we don't want the left clicking on the on item control to
        // 1. play the pressed animation
        // 2. select/invoke the item
        evt.stopPropagation();
    };

    Mail.OnItemCommandControl.prototype._updateAllCommands = function () {
        markStart("updateAllCommands");
        this._updateFlagCommand();
        this._updateReadCommands();
        this._updateDeleteCommand();
        this._checkCommandsEnabled();
        markStop("updateAllCommands");
    };

    Mail.OnItemCommandControl.prototype._updateFlagCommand = function () {
        markStart("updateFlagCommand");
        var flagCommandButton = this._flagCommandButton,
            classList = flagCommandButton.classList;
        if (this._mailItem.canFlag && this._selection.view.type !== ViewType.outbox) {
            classList.remove("hidden");
            if (this._mailItem.flagged) {
                classList.add("flaggedMessage");
                flagCommandButton.title = Jx.res.getString("mailCommandUnflagLabel");
            } else {
                classList.remove("flaggedMessage");
                flagCommandButton.title = Jx.res.getString("mailCommandFlagLabel");
            }
        } else {
            classList.add("hidden");
        }
        markStop("updateFlagCommand");
    };

    Mail.OnItemCommandControl.prototype._updateReadCommands = function () {
        markStart("updateReadCommands");
        if (this._mailItem.canMarkRead && this._selection.view.type !== ViewType.outbox) {
            this._markReadUnreadCommandButton.classList.remove("hidden");
            if (this._mailItem.read) {
                this._markReadUnreadCommandButton.title = Jx.res.getString("mailCommandMarkUnreadLabel");
            }
            else {
                this._markReadUnreadCommandButton.title = Jx.res.getString("mailCommandMarkReadLabel");
            }
        }
        else {
            this._markReadUnreadCommandButton.classList.add("hidden");
        }
        markStop("updateReadCommands");
    };

    Mail.OnItemCommandControl.prototype._updateDeleteCommand = function () {
        markStart("updateDeleteCommand");
        if (this._mailItem.canMove) {
            this._deleteCommandButton.classList.remove("hidden");
        } else {
            this._deleteCommandButton.classList.add("hidden");
        }
        markStop("updateDeleteCommand");
    };

    Mail.OnItemCommandControl.prototype._checkCommandsEnabled = function () {
        markStart("checkCommandsEnabled");
        var commandsEnabled = this._mailItem.canFlag || this._mailItem.canMarkRead || this._mailItem.canMove;

        if (commandsEnabled) {
            this._listItemElement.classList.add("hasEnabledCommands");
        } else {
            this._listItemElement.classList.remove("hasEnabledCommands");
        }
        markStop("checkCommandsEnabled");
    };

    Mail.OnItemCommandControl.prototype._toggleFlag = function () {
        markStart("toggleFlag");
        var newFlagState = !this._mailItem.flagged,
            Commands = Instrumentation.Commands,
            command = newFlagState ? Commands.flag : Commands.unflag;

        Instrumentation.instrumentTriageCommand(command, Instrumentation.UIEntryPoint.onMessage, this._selection);
        this._selection.setFlagState(newFlagState, [this._mailItem]);
        markStop("toggleFlag");
    };

    Mail.OnItemCommandControl.prototype._toggleReadState = function () {
        markStart("toggleReadState");
        var newReadState = !this._mailItem.read,
            Commands = Instrumentation.Commands,
            command = newReadState ? Commands.markAsRead : Commands.markAsUnread;

        Instrumentation.instrumentTriageCommand(command, Instrumentation.UIEntryPoint.onMessage, this._selection);
        this._selection.setReadState(newReadState, [this._mailItem]);
        markStop("toggleReadState");
    };

    Mail.OnItemCommandControl.prototype._deleteMailItem = function () {
        markStart("deleteMailItem");
        var doDelete = function () {
                this._selection.deleteItems([this._mailItem]);
            }.bind(this);
        Mail.Commands.Handlers.deleteMessages(this._mailItem.hasDraft ? 1 : 0, doDelete, Instrumentation.UIEntryPoint.onMessage, this._selection);
        markStop("deleteMailItem", Mail.LogEvent.stop);
    };

    function markStart(s) {
        Jx.mark("OnItemCommandControl." + s + ",StartTA,Mail");
    }
    function markStop(s) {
        Jx.mark("OnItemCommandControl." + s + ",StopTA,Mail");
    }

});

