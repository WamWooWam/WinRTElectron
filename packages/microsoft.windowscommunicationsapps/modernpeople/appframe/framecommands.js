
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="AppCommand.js"/>
/// <reference path="AppCommand.ref.js"/>

Jx.delayDefine(People, "FrameCommands", function () {

    var P = window.People;

    P.FrameCommands = /*@constructor*/ function (jobSet) {
        /// <summary>Host static commands. Commands have to be added during load() function call and cannot be updated once added.
        /// Ignore command's options like labelId, useCustomLayout, positionLeft, beforeShowUpdate as they do not apply for FrameCommands. </summary>
        /// <param name="jobSet" type="P.JobSet" />
        this._jobSet = jobSet;
        this._element = null;
        this._keyboardNavigation = null;
        this._focusOutListener = this._onFocusOut.bind(this);
        this._commands = new P.AppCommands();
        this.initComponent();
    };
    Jx.inherit(P.FrameCommands, Jx.Component);

    P.FrameCommands.prototype.hasCommands = function () {
        return this._commands.getCommandsLength() != 0;
    }

    P.FrameCommands.prototype.addCommand = function (command) {
        /// <summary>Adds a command at the end of the frame commands. Adding existing commands (identified by commandId) will fail (do nothing).</summary>
        /// <param name="command" type="AppCommandDescriptor">Command to be added.</param>
        this._commands.addCommand(command);
    };

    P.FrameCommands.prototype.getUI = function (ui) {
        /// <summary> Gets the UI string for the component.</summary>
        /// <param name="ui" type="JxUI">Returns the object which contains html and css properties.</param>
        ui.html = '<div class="grid-header-frameCommands"></div>';
    };

    P.FrameCommands.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        this._element = document.querySelector(".grid-header-frameCommands");
    };

    P.FrameCommands.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.dispose(this._keyboardNavigation);
        this._keyboardNavigation = null;
    };

    P.FrameCommands.prototype.getElement = function () {
        /// <summary>Get the frame command container.</summary>
        /// <returns type="HTMLElement"/>
        return this._element;
    };

    P.FrameCommands.prototype.reset = function () {
        /// <summary>Reset the frame commands by removing all existing commands.</summary>
        Debug.assert(Jx.isObject(this._commands));
        this._commands.reset();
    };

    P.FrameCommands.prototype.update = function () {
        /// <summary>Update frame command UI. </summary>
        var commands = this._commands;
        var element = this._element;

        // remove previous leftover buttons
        for (var i = element.childNodes.length - 1; i >= 0; i--) {
            element.removeChild(element.childNodes[i]);
        }

        // add command buttons
        for (var j = 0; j < commands.getCommandsLength() ; j++) {
            var command = commands.getCommandByIndex(j);
            if (command.visible) {
                element.appendChild(this._createCommandButton(command));
            }
        };

        Jx.dispose(this._keyboardNavigation);
        this._keyboardNavigation = new Jx.KeyboardNavigation(element, "horizontal");
    };

    P.FrameCommands.prototype._createCommandButton = function (command) {
        /// <param name="command" type="AppCommandDescriptor"/>
        var button = document.createElement("button");
        button.id = command.commandId;
        button.disabled = !command.enabled;
        button.tabIndex = -1;

        if (!Jx.isNullOrUndefined(command.tooltip)) {
            button.title = Jx.res.getString(command.tooltip);
            button.setAttribute("aria-label", button.title);
        }

        Jx.addClass(button, "win-command");
        Jx.addClass(button, "win-hidefocus");
        Jx.setClass(button, "hidden", !command.visible);

        button.addEventListener("keyup", this._onKeyup.bind(this), false);
        button.addEventListener("click", this._onClick.bind(this, command), false);

        button.innerHTML = "<span class='win-commandicon win-commandring' aria-hidden='true'>" +
                                "<span class='win-commandimage' aria-hidden='true'>" + command.iconSymbol + "</span>" +
                           "</span>";

        return button;
    };

    P.FrameCommands.prototype._onKeyup = function (ev) {
        /// <summary>Event handler for hiding focus when mouse-clicking or tapping on the command button.</summary>
        /// <param name="ev" type="Event"/>
        var button = ev.target;
        Jx.removeClass(button, "win-hidefocus");
        button.addEventListener("focusout", this._focusOutListener, false);
    };

    P.FrameCommands.prototype._onFocusOut = function (ev) {
        /// <param name="ev" type="Event"/>
        var button = ev.target;
        Jx.addClass(button, "win-hidefocus");
        button.removeEventListener("focusout", this._focusOutListener, false);
    };

    P.FrameCommands.prototype._onClick = function (command) {
        /// <summary>Event handler for command button click.</summary>
        /// <param name="command" type="AppCommandDescriptor">The command for the command button being clicked.</param>
        if (command.enabled) {
            var invokedFlyout = null;
            if (command.onInvoke) {
                try {
                    invokedFlyout = command.onInvoke.call(command.context, command.commandId, event.srcElement, this);
                    Jx.log.info("Command + " + command.commandId + " invoked");
                } catch (err) {
                    Jx.log.exception("Invoking command " + command.commandId + " failed.", err);
                }
            } else if (command.link) {
                // Navigate to the link.
                P.Nav.navigate(command.link);
            }
        } else {
            Jx.log.error("Invoking command " + command.commandId + " failed.");
        }
    };
});
