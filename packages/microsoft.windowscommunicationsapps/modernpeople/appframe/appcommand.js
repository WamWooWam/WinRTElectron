
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="Main.js"/>
/// <reference path="../Shared/Navigation/UriGenerator.js"/>

Jx.delayDefine(People, ["AppCommands", "Command"], function () {

    var P = window.People;

    P.Command = /* @constructor*/function (commandId, labelId, tooltipId, iconSymbol, enabled, visible, 
                                            /* @dynamic */context, onInvoke, link, useCustomLayout, positionLeft, beforeShowUpdate) {
        /// <summary>Constructor for command.</summary>
        /// <param name="commandId" type="String">Unique id for the command.</param>
        /// <param name="labelId" type="String">The resource id for the display string of the command.</param>
        /// <param name="tooltipId" type="String">The resource id for the tooltip string of the command.</param>
        /// <param name="iconSymbol" type="String">The symbol used for icon.</param>
        /// <param name="enabled" type="Boolean">Is the command enabled.</param>
        /// <param name="visible" type="Boolean">Is the command visible in the UI.</param>
        /// <param name="context">The execution context for calling onInvoke.</param>
        /// <param name="onInvoke" type="Function">The callback function when the command is executed. To be used exclusively with 'link' param.</param>
        /// <param name="link" type="String" optional="true">The link to be navigated to when the command is executed. To be used exclusively with 'onInvoke' param..</param>
        /// <param name="useCustomLayout" type="Boolean" optional="true">Does the command button use custome layout? Custom layout shows text on the button.</param>
        /// <param name="positionLeft" type="Boolean" optional="true">Is the command button positioned on the left of tha bar?</param>
        /// <param name="beforeShowUpdate" type="Function" optional="true">Called before the app bar is shown. Returns the command literal object with updated fields.
        ///  To be used for button bound to dynamic data on transient appbar.</param>

        this.commandId = commandId;
        this.name = labelId;
        this.tooltip = tooltipId;
        this.iconSymbol = iconSymbol;
        this.enabled = enabled;
        this.visible = visible;
        this.context = context;
        this.onInvoke = onInvoke;
        this.link = link ? link : null;
        this.useCustomLayout = useCustomLayout ? true : false;
        this.section = positionLeft ? "selection" : "global";
        this.beforeShowUpdate = beforeShowUpdate ? beforeShowUpdate : null;    

        // Default property values
        this.formattedName = [];
        this.formattedTooltip = [];
        this.isLocked = false;
        this.number = '0';
        this.type = cmdType.button;
        this.selected = false;
        this.flyout = /* @dynamic*/null;
        this.biciIndex = -1;
    };

    var cmdType = P.Command.Types = {
        button: "button",
        toggle: "toggle",
        flyout: "flyout",
        seperator: "seperator",
        customFlyout: "customFlyout"
    };

    P.Command.prototype.setSelected = function (selected) {
        /// <summary>Sets the selected state of the command.</summary>
        /// <param name="selected" type="Boolean">The selected state</param>
        this.selected = selected;
    };

    P.Command.prototype.getSelected = function () {
        /// <summary>Gets the selected state of the command.</summary>
        return this.selected;
    };

    P.Command.prototype.setFlyout = function (/* @dynamic*/flyout) {
        /// <summary>Make the command button a flyout button and set flyout</summary>
        /// <param name="flyout">Can be either the resid for the flyout element or the WinJS flyout object</param>
        this.type = cmdType.flyout;
        this.flyout = flyout;
    };

    P.Command.prototype.setCustomFlyout = function (isCustomFlyout) {
        /// <summary>Make the command button a custom flyout button</summary>
        /// <param name="isCustomFlyout" type="Boolean"/>
        if (isCustomFlyout) {
            this.type = cmdType.customFlyout;
        } else {
            this.type = cmdType.button;
        }
    };

    P.Command.prototype.setBiciIndex = function (biciIndex) {
        /// <summary>Set the bici index point for logging command invoke</summary>
        /// <param name="biciIndex" type="Number"/>
        Debug.assert(Jx.isNumber(biciIndex));
        if (biciIndex >= 0) {
            this.biciIndex = biciIndex;
        }
    };
 
    P.Command.prototype.getLabel = function () {
        /// <summary>Get the label for the command button</summary>
        /// <returns type="String"/>
        return this._loadString(this.name, this.formattedName);
    };

    P.Command.prototype.getTooltip = function () {
        /// <summary>Get the tooltip for the command button</summary>
        /// <returns type="String"/>
        var tooltip = this._loadString(this.tooltip, this.formattedTooltip);
        if (!Jx.isNonEmptyString(tooltip)) {
            tooltip = this.getLabel();
        }
        return tooltip;
    };

    P.Command.prototype._loadString = function (resId, formattedRes) {
        /// <summary>Load string from resource</summary>
        /// <param name="resId" type="String">Res Id for the string</param>
        /// <param name="formattedRes" type="Array">Array for formatted string. See setFormattedName.</param>
        /// <returns type="String"/>
        var string = "";
        if (Jx.isNonEmptyString(resId)) {
            string = Jx.res.getString(resId);
        } else if (Jx.isArray(formattedRes) && Jx.isNonEmptyString(formattedRes[0])) {
            string = Jx.res.loadCompoundString.apply(Jx.res, formattedRes);
        }
        return string;
    };
 
    P.Command.prototype.setFormattedName = /*@varargs*/function (resourceId) {
        /// <summary>Load a resource string and replace the {%#} with the values passed in. 
        /// The params are passed to Jx.res.loadCompoundString. For example, imagine you have a
        /// string resource "{{%1}} is connected to {{%2}} networks(s)" whose id is idStrConnections,
        /// setFormattedName("idStrConnections", "Kerrigan", "3") will give you the command name as
        /// "Kerrigan is connected to 3 networks(s)".</summary>
        /// <param name="resourceId" type="String">The resource id for the resource string</param>
        var args = null;

        if (arguments.length > 0 && Jx.isNonEmptyString(arguments[0])) {
            args = Array.prototype.slice.apply(arguments);
        }

        this.formattedName = args;
    };

    P.Command.prototype.setFormattedTooltip = /*@varargs*/function (resourceId) {
        /// <summary>Load a resource string and replace the {%#} with the values passed in. 
        /// The params are passed to Jx.res.loadCompoundString. For example, imagine you have a
        /// string resource "{{%1}} is connected to {{%2}} networks(s)" whose id is idStrConnections,
        /// setFormattedName("idStrConnections", "Kerrigan", "3") will give you the command name as
        /// "Kerrigan is connected to 3 networks(s)".</summary>
        /// <param name="resourceId" type="String">The resource id for the resource string</param>
        var args = null;

        if (arguments.length > 0 && Jx.isNonEmptyString(arguments[0])) {
            args = Array.prototype.slice.apply(arguments);
        }

        this.formattedTooltip = args;
    };

    P.Command.prototype.setIsLocked = function (isLocked) {
        /// <summary>Sets whether a command is locked. A locked command will not be removed when 
        /// this.reset() is called. This is useful for commands that should always be on the command bar
        /// such as SAS.</summary>
        /// <param name="isLocked" type="Boolean">true if the command should be locked; false otherwise.</param>
        this.isLocked = isLocked;
    };

    P.Command.prototype.update = function (command) {
        /// <summary>Update the command properties based on the passed in command.</summary>
        /// <param name="command" type="P.Command">The new command.</param>
        /// <returns type="Array">Returns an array that contains the names of updated properties.</returns>
        Debug.assert(this.commandId === command.commandId);
        // Updating command to a different type is not supported.
        Debug.assert(Jx.isUndefined(command.type) || this.type === command.type);
        // Updating command to use different layout is not supported.
        Debug.assert(Jx.isUndefined(command.useCustomLayout) || this.useCustomLayout === command.useCustomLayout);
        Debug.assert(!Jx.isNonEmptyString(command.section) || this.section === command.section);
        
        var props = [];
        for (var prop in command) {
            if (!Jx.isFunction(command[prop]) && this.hasOwnProperty(prop) && this[prop] !== command[prop]) {
                this[prop] = command[prop];
                props.push(prop);
            }
        }
        return props;
    };

    P.AppCommands = /* @constructor*/function () {
        /// <summary>Constructor</summary>
        /// <param name="id" type="String">Element id for the command bar</param>
        Jx.log.info("People.AppCommands");
        this._name = "People.AppCommands";
        this._commands = [];
    };

    P.AppCommands.prototype.getCommandsLength = function () {
        /// <summary>Get the length of the commands array</summary>
        /// <returns type="Number"/>
        return this._commands.length;
    };

    P.AppCommands.prototype.getCommandByIndex = function (index) {
        /// <summary>Get the command in the array by index</summary>
        /// <param name="index" type="Number"/>
        /// <returns type="P.Command"/>
        Debug.assert(index >= 0 && index < this._commands.length);
        var command = null;
        if (index >= 0 && index < this._commands.length) {
            command = this._commands[index];
        }
        return command;
    };

    function checkCommand(command) {
        /// <summary>Sanity check for the command.</summary>
        /// <param name="command" type="P.Command">Command to be added.</param>
        /// <returns type="Boolean">True if check passes; false otherwise.</returns>
        var result = true;

        // Command must have commandId. If it's button type, it must have either onInvoke or link for command execution.
        if (!(!!command.commandId && (!!command.onInvoke || !!command.link || command.type !== cmdType.button))) {
            var errMessage = "People.AppCommands.checkCommand: Invalid command! command.commandId=" + command.commandId +
                        ",command.onInvoke=" + String(command.onInvoke) + ",command.link=" + command.link;
            Jx.log.error(errMessage);
            Debug.assert(false, errMessage);
            result = false;
        }
        return result;
    }

    P.AppCommands.prototype.addCommand = function (command) {
        /// <summary>Adds a command at the end of the command bar. Adding existing commands (identified by commandId) will fail (do nothing).</summary>
        /// <param name="command" type="P.Command">Command to be added.</param>
        /// <returns type="Boolean">Returns true if added successfully; false if failed.</returns>
        this.insertCommand(command, this._commands.length);
    };

    P.AppCommands.prototype.removeCommand = function (command) {
        /// <summary>Removes the command from command bar</summary>
        /// <param name="command" type="P.Command">Command to be removed</param>
        this._removeCommand(command.commandId);
    };

    P.AppCommands.prototype.insertCommand = function (command, index) {
        /// <summary>Isnerts a command at the given index. Adding existing commands (identified by commandId) will do nothing.</summary>
        /// <param name="command" type="P.Command">Command to be inserted.</param>
        /// <param name="index" type="Integer">The index at which to insert the command.</param>
        /// <returns type="Boolean">Returns true if command is added succesfully; false otherwise.</returns>
        Debug.assert(Jx.isObject(command), "Invalid param: command is not a valid object!");

        if (!(checkCommand(command))) {
            return false;
        }

        // Check if the command id already exists in the array.
        if (this._findCommand(command.commandId) !== -1) {
            Jx.log.error("People.AppCommands.insertCommand: Failed to add command " + command.commandId + " as the id already exists.");
            return false;
        }

        // Add it to the command array.
        this._commands.splice(index, 0, command);
 
        Jx.log.info("People.AppCommands.insertCommand: Added command with commandId=" + command.commandId);

        return true;
    };

    P.AppCommands.prototype.updateCommand = function (command) {
        /// <summary>Update command in the command bar(idendified by command.commandId. Updating non-existed command fails.</summary>
        /// <param name="command" type="AppCommandDescriptor">An object that contains the command properties which need to be updated.</param>
        /// <returns type="AppCommandUpdateLiteralDescriptor">Returns an object with an array that contains the names of updated properties, and the updated command.</returns>
        Debug.assert(Jx.isObject(command), "Invalid param: command is not a valid object!");
        var updatedProps = [];
        var updatedCommand = null;

        if (checkCommand(command)) {
            var index = this._findCommand(command.commandId);
            if (index !== -1) {
                // Update the command in the array.          
                updatedProps = this._commands[index].update(command);
                updatedCommand = this._commands[index];
            } else {
                /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                Jx.log.warning("People.AppCommands.updateCommand: Failed. Didn't find command " + command.commandId);
                /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
            }
        }

        return {props: updatedProps, command: updatedCommand};
    };

    P.AppCommands.prototype._removeCommand = function (commandId) {
        /// <summary>Removes a command from the bar.</summary>
        /// <param name="commandId" type="String">Unique command Id for the command to be removed.</param>
        /// <returns type="Boolean">Returns true if successfully removed; false if the command is not found.</returns>
        var removed = false;
        var index = this._findCommand(commandId);
        if (index !== -1) {
            Debug.assert(!this._commands[index].isLocked, "Command " + commandId + " is locked and should not be removed!");

            // Remove it from the array
            this._commands.splice(index, 1);

            removed = true;
            Jx.log.info("People.AppCommands._removeCommand: Removed command with commandId=" + commandId);
        } else {
            Jx.log.warning("People.AppCommands._removeCommand: Failed. Didn't find command " + commandId);
        }
        return removed;
    };

    P.AppCommands.prototype.reset = function () {
        /// <summary>Removes all the commands in the command bar, except for commands that have been locked.</summary>
        for (var i = this._commands.length - 1; i >= 0; i--) {
            var /*@type(P.Command)*/ command = this._commands[i];
            if (!command.isLocked) {
                this._removeCommand(command.commandId);
            }
        }
    };

    P.AppCommands.prototype._findCommand = function (commandId) {
        /// <summary>Find the command from the command array by comparing command id.</summary>
        /// <param name="commandId" type="String">Id for the command.</param>
        /// <returns type="Number">Returns -1 if the command doesn't exist in the array. Otherwise returns the index.</returns>
        var index = -1;
        for (var i = 0, len = this._commands.length; i < len; i++) {
            if (commandId === this._commands[i].commandId) {
                index = i;
                break;
            }
        }
        return index;
    };

});
