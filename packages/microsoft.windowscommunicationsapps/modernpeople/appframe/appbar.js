
// Copyright (C) Microsoft Corporation.  All rights reserved.

/// <reference path="../Shared/JsUtil/namespace.js"/>
/// <reference path="../Shared/Navigation/UriGenerator.js"/>
/// <reference path="AppCommand.js"/>
/// <reference path="AppCommand.ref.js"/>
/// <reference path="WinJSAppbar.ref.js"/>

Jx.delayDefine(People, "CpAppBar", function () {

    /// <disable>JS2076.IdentifierIsMiscased</disable>
    var P = window.People,
        InstruID = Microsoft.WindowsLive.Instrumentation.Ids;
    /// <enable>JS2076.IdentifierIsMiscased</enable>

    P.CpAppBar = /* @constructor*/function (jobSet, host) {
        /// <summary>Constructor</summary>
        /// <param name="jobSet" type="P.JobSet" />
        /// <param name="host" type="P.CpMain" />
        Jx.log.info("People.CpAppBar");
        this._name = "People.CpAppBar";
        this.initComponent();

        this._appCommands = new P.AppCommands();
        this._jobSet = jobSet;
        this._host = host;
        this._sasCommand = /*@static_cast(P.Command)*/null;

        this._needBeforeShowHandler = false;
    };

    Jx.augment(P.CpAppBar, Jx.Component);
    P.CpAppBar.prototype._afterHideHandler = /* @static_cast(Function)*/null;

    // There's only one global command, which is the Send A Smile command.
    P.CpAppBar.globalCommandLength = 1;
    P.CpAppBar.prototype._beforeShowHandler = /* @static_cast(Function)*/null;
    P.CpAppBar.prototype._winappbar = /* @static_cast(WinJSAppBarDescriptor)*/ null;

    P.CpAppBar.prototype.deactivateUI = function () {
        /// <summary>Called on application shutdown UI.</summary>
        Jx.Component.prototype.deactivateUI.call(this);
    };

    P.CpAppBar.prototype.getWinappbar = function () {
        /// <returns type="WinJSAppBarDescriptor"/>
        Debug.assert(Jx.isObject(this._winappbar));
        return this._winappbar;
    };

    P.CpAppBar.prototype.activateUI = function () {
        /// <summary>Called after the UI is initialized. getUI has been called at this point.</summary>
        Jx.log.info("People.CpAppBar.activateUI");
        Jx.Component.prototype.activateUI.call(this);
    };

    P.CpAppBar.prototype._createAppBar = function () {
        /// <summary>Create WinJS appbar</summary>
        var appBarElement = document.createElement("div");
        appBarElement.id = "AppBarID";
        /* apply win-ui-dark style on as the back ground color is dark */
        Jx.addClass(appBarElement, "win-ui-dark");
        document.body.appendChild(appBarElement);

        var appbarControl = new WinJS.UI.AppBar(appBarElement, {commands: []});
        this._winappbar = /* @static_cast(WinJSAppBarDescriptor)*/appbarControl;

        this._afterHideHandler = this._updateCommandsAfterHide.bind(this);
        this._beforeShowHandler = this._updateCommandsBeforeShow.bind(this);

        // Make sure to add Sas at index 0 to ensure tab order.
        this._addSasButton();
    };

    P.CpAppBar.prototype._sasButtonHandler = function (layout) {
        /// <summary>Hide the SendaSmile button if snapped</summary>
        /// <param name="layout" type="People.Layout.layoutState">New layout</param>
        /// <disable>JS3092.DeclarePropertiesBeforeUse,JS3058.DeclareVariablesBeforeUse</disable>
        this.updateCommand({ commandId: "cmdid_sas",
            visible: (SasManager && SasManager.showInAppBar()) });
        /// <enable>JS3092.DeclarePropertiesBeforeUse,JS3058.DeclareVariablesBeforeUse</enable>
    };

    P.CpAppBar.prototype._addSasButton = function () {
        /// <summary>Add the command for SendaSmile</summary>

        
        if (!("isMock" in this._host.getPlatform())) {
        
            var cmdSas = this._sasCommand = new P.Command("cmdid_sas", "", null, "", true, true, null, Jx.fnEmpty);
            this._appCommands.insertCommand(cmdSas, 0);
            cmdSas.setIsLocked(true);
            this._host.getLayout().addLayoutChangedEventListener(this._sasButtonHandler, this);
        
        }
        
    };

    P.CpAppBar.prototype._initSasButton = function () {
        /// <summary>Initialize SaS</summary>

        
        if (!("isMock" in this._host.getPlatform())) {
        
            /// <disable>JS3092.DeclarePropertiesBeforeUse,JS3058.DeclareVariablesBeforeUse</disable>
            SasManager.init(Jx.res.getString("/strings/peopleAppName"), "idCmdBtn_cmdid_sas", this._host.getPlatform());
            this._sasButtonHandler(this._host.getLayout().getLayoutState());
            /// <enable>JS3092.DeclarePropertiesBeforeUse,JS3058.DeclareVariablesBeforeUse</enable>
        
        }
        
    };

    P.CpAppBar.prototype.getUI = function (ui) {
        /// <summary>Gets the UI string for the component.</summary>
        /// <param name="ui" type="Object">Returns the object which contains html and css properties.</param>
        ui.html = "";
    };

    P.CpAppBar.prototype._resetBeforeShowHandler = function () {
        /// <summary>Resets the app bar beforeShow handler</summary>
        if (this._needBeforeShowHandler) {
            this._winappbar.removeEventListener("beforeshow", this._beforeShowHandler);
            this._needBeforeShowHandler = false;
        }
    };

    P.CpAppBar.prototype.reset = function () {
        /// <summary>Resets the app bar</summary>
        Debug.assert(Jx.isObject(this._appCommands));
        this._appCommands.reset();
        if (this._winappbar) {
            this._resetBeforeShowHandler();
            this.hide();
            // No need to hide/update the commands in winappbar here as the call
            // to load/refresh force an update to the command.
        }
    };

    P.CpAppBar.prototype.load = function (sticky) {
        /// <summary>Load app bar for the page</summary>
        if (!this._winappbar) {
            if (sticky) {
                // If appbar is sticky, create it right away.
                this._createAppBar();
            } else {
                // If appbar is light dismiss mode, delay creation until later to unblock app launch.
                this._jobSet.addUIJob(this, this.refresh, null, P.Priority.appbar);
                return;
            }
        }

        Debug.assert(this._winappbar);
        this._winappbar.sticky = sticky;

        this._updateCommands();
    };

    P.CpAppBar.prototype._updateCommands = function () {
        /// <summary>Update app bar for the page</summary>
        if (this._winappbar.hidden) {
            this._updateCommandsAfterHide();
        } else {
            this._winappbar.addEventListener("afterhide", this._afterHideHandler);
            this.hide();
        }
    };

    P.CpAppBar.prototype._updateCommandsAfterHide = function () {
        /// <summary>Load/update app bar. Must be called after the appbar is hidden.</summary>
        Debug.assert(Jx.isObject(this._winappbar) && this._winappbar.hidden);
        this._setCommands();

        // Enable/Disable the app bar.
        this._enableOrDisableAppbar();
        this._initSasButton();

        if (this._winappbar.sticky) {
            if (this._havePageCommands()) {
                // Only show when there's command. This happens when the control delay
                // loads the comomands. We'll show the app bar in refresh().
                this._winappbar.show();
            }
        }

        this._winappbar.removeEventListener("afterhide", this._afterHideHandler);
    };

    P.CpAppBar.prototype.refresh = function () {
        /// <summary>Trigger the app bar to reload the commands. Should be called after commands are added.</summary>
        if (!this._winappbar) {
            this._createAppBar();
        }

        this._updateCommands();
    };

    P.CpAppBar.prototype._enableOrDisableAppbar = function () {
        /// <summary>Enable or disable app bar based on whether there're commands to be shown</summary>
        this._winappbar.disabled = this._shouldKeepHidden();
    };

    P.CpAppBar.prototype._shouldKeepHidden = function () {
        /// <summary>Should the app bar keep hidden? It should be hidden when SaS is the only command showing.
        /// The assumption for this logic is that we'll never have all the commands hidden.</summary>
        /// <returns type="Boolean"/>
        var count = this._appCommands.getCommandsLength();
        if (count === 1) {
            return this._sasCommand !== null && this._appCommands.getCommandByIndex(0).commandId === this._sasCommand.commandId;
        }
        return count === 0;
    };

    P.CpAppBar.prototype._havePageCommands = function () {
        /// <summary>Does the page have non global command?</summary>
        /// <returns type="Boolean"/>

        // Compare the array length with the number of global commands we have. If it's larger, there're page specific commands.
        return this._appCommands.getCommandsLength() > P.CpAppBar.globalCommandLength ? true : false;
    };

    P.CpAppBar.prototype.addCommand = function (command) {
        /// <summary>Adds a command at the end of the command bar. Adding existing commands (identified by commandId) will fail (do nothing).</summary>
        /// <param name="command" type="AppCommandDescriptor">Command to be added.</param>
        this._appCommands.addCommand(command);
    };

    P.CpAppBar.prototype.removeCommand = function (command) {
        /// <summary>Removes a command from the app bar</summary>
        /// <param name="command" type="AppCommandDescriptor">Command to be removed.</param>
        this._appCommands.removeCommand(command);
    };

    P.CpAppBar.prototype.insertCommand = function (command, index) {
        /// <summary>Inserts a command at the given index. Adding existing commands (identified by commandId) will do nothing.</summary>
        /// <param name="command" type="AppCommandDescriptor">Command to be inserted.</param>
        /// <param name="index" type="Integer">The index at which to insert the command.</param>
        /// <returns type="Boolean">Returns true if command is added succesfully; false otherwise.</returns>
        return this._appCommands.insertCommand(command, index);
    };

    P.CpAppBar.prototype.insertCommandBeforeLast = function (command) {
        /// <summary>Inserts a command as the 2nd last command on the command bar. Adding existing commands (identified by commandId) will do nothing.</summary>
        /// <param name="command" type="AppCommandDescriptor">Command to be inserted.</param>
        /// <returns type="Boolean">Returns true if command is added succesfully; false otherwise.</returns>
        var commands = this._appCommands;
        var index = commands.getCommandsLength() - 1;
        return commands.insertCommand(command, index < 0 ? 0 : index);
    };

    P.CpAppBar.prototype._setCommands = function () {
        /// <summary>Add commands to the app bar UI. Can only be called when app bar is hidden</summary>
        Debug.assert(this._winappbar);
        Debug.assert(this._winappbar.hidden);
        this._resetBeforeShowHandler();

        var appbarCommands = [];
        var i, command;
        var commands = this._appCommands;
        var len = commands.getCommandsLength();
        for (i = 0; i < len; i++) {
            command = commands.getCommandByIndex(i);
            if (command) {
                appbarCommands.push( {
                    id: getCmdBtnElementId(command.commandId),
                    label: command.getLabel(),
                    section: command.section,
                    icon: command.iconSymbol,
                    type: command.type === P.Command.Types.customFlyout ? P.Command.Types.button : command.type,
                    onclick: this._onClick.bind(this, command),
                    tooltip: command.getTooltip(),
                    disabled: !command.enabled,
                    selected: command.selected,
                    flyout: command.flyout
                });
            }
        }
        this._winappbar.commands = appbarCommands;

        // apply the customized changes - 1. visibility; 2. custom layout; 3. set beforeShow event handler
        for (i = 0; i < len; i++) {
            command = commands.getCommandByIndex(i);
            if (Jx.isObject(command) && (command.useCustomLayout || !command.visible)) {
                var winjsCommand = this._getCommandOnAppBar(command.commandId);
                Debug.assert(winjsCommand);
                if (!command.visible) {
                    updateCommandVisibility(winjsCommand, command);
                } else if (command.useCustomLayout) {
                    updateCommandNumber(winjsCommand, command);
                }
            }

            if (!this._needBeforeShowHandler && Jx.isObject(command) && Jx.isFunction(command.beforeShowUpdate)) {
                this._needBeforeShowHandler = true;
            }
        }

        if (this._needBeforeShowHandler) {
            // If the appbar is sticky, before show handler will not be useful.
            Debug.assert(!this._winappbar.sticky);
            this._winappbar.addEventListener("beforeshow", this._beforeShowHandler);
        }

        this._hostLoc = this._host.getLocation();
    };

    P.CpAppBar.prototype._updateCommandsBeforeShow = function () {
        /// <summary>WinJS app bar before show event handler</summary>
        if (this._needBeforeShowHandler) {
            var commands = this._appCommands;
            var len = commands.getCommandsLength();
            for (var i = 0; i < len; i++) {
                var command = commands.getCommandByIndex(i);
                if (Jx.isObject(command) && Jx.isFunction(command.beforeShowUpdate)) {
                    command.beforeShowUpdate();
                }
            }
        }
    };

    function getFlyout(/* @dynamic*/ flyout) {
        /// <summary>Get the WinJS flyout object from the given param</summary>
        /// <param name="flyout">The DOM element Id of the flyout or the flyout object.</param>
        /// <returns type="WinJS.UI.Flyout"/>
        if (flyout) {
            if (Jx.isNonEmptyString(flyout)) {
                flyout = document.getElementById(flyout);
            }
            if (flyout && !flyout.show) {
                flyout = flyout.winControl;
            }
        }
        if (flyout && flyout.show) {
            return flyout;
        } else {
            return null;
        }
    }

    P.CpAppBar.prototype._onClick = function (command) {
        /// <summary>Event handler for command button click.</summary>
        /// <param name="command" type="AppCommandDescriptor">The command for the command button being clicked.</param>
        if (command.enabled) {
            // The command can be invoked (if clicked multiple times fast enough) after user has already navigated away
            // from the page that hosts the command. So we need to check if this is still a valid invoke by checking if we
            // are still in the same location as the command is meant to be invoked from.
            if (command.isLocked || (!command.isLocked && this._host.isSameAsCurrentLocation(this._hostLoc))) {
                var invokedFlyout = null,
                    winjsCommand = /*@static_cast(WinJSCommandDescriptor)*/this._getCommandOnAppBar(command.commandId);
                if (command.type === P.Command.Types.toggle) {
                    command.selected = winjsCommand.selected;
                }
                if (command.onInvoke) {
                    try {
                        if (winjsCommand.element) {
                            // WinJS.UI.Flyout.show(anchor, placement) requires an HTML element from which to position itself, and to which to return focus.
                            invokedFlyout = command.onInvoke.call(command.context, command.commandId, winjsCommand.element, this);
                            Jx.log.info("Command + " + command.commandId + " invoked");
                        }
                    } catch (err) {
                        Jx.log.exception("Invoking command " + command.commandId + " failed.", err);
                    }
                } else if (command.link) {
                    // Navigate to the link.
                    P.Nav.navigate(command.link);
                }

                // If the appbar isn't sticky, we will dismiss the appbar after the command is invoked.
                if (!this._winappbar.sticky) {
                    var cmdType = P.Command.Types;
                    var type = command.type;

                    var flyout = (type === cmdType.flyout) ? getFlyout(command.flyout) : null;
                    if (flyout === null) {
                        flyout = getFlyout(invokedFlyout);
                    }

                    // For flyout, we'll dismiss after flyout is dismissed.
                    if (flyout) {
                        flyout.addEventListener("afterhide", this.hide.bind(this));
                    } else if (type !== cmdType.customFlyout) {
                        this.hide();
                    }
                }

                if (command.biciIndex !== -1) {
                    /// <disable>JS3092.DeclarePropertiesBeforeUse</disable>
                    Jx.bici.addToStream(InstruID.People.socialReactionUpdated, "", 0, 0, command.biciIndex);
                    /// <enable>JS3092.DeclarePropertiesBeforeUse</enable>
                }
            } else {
                Jx.log.error("Invoking command " + command.commandId + " failed. Current location is " + JSON.stringify(this._host.getLocation()) + ". Expected location is " + JSON.stringify(this._hostLoc));
            }
        }
    };

    P.CpAppBar.prototype.hideAppBar = function () {
        /// <summary>Hide the app bar</summary>
        if (this._winappbar) {
            this._winappbar.hide();
        }
    };

    P.CpAppBar.prototype.hide = function () {
        /// <summary>Hide the app bar and nav bar</summary>
        this.hideAppBar();
        // Make sure nav bar is hidden along with the app bar.
        this._host.hideNavBar();
    };

    P.CpAppBar.prototype.show = function () {
        /// <summary>Show the app bar</summary>
        if (this._winappbar) {
            this._winappbar.show();
        }
    };

    var updateCommandUIFn = {
        iconSymbol: updateCommandIcon,
        name: updateCommandName,
        formattedName: updateCommandName,
        tooltip: updateCommandTooltip,
        formattedTooltip: updateCommandTooltip,
        enabled: updateCommandDisabled,
        visible: updateCommandVisibility,
        number: updateCommandNumber,
        selected: updateCommandSelected,
        flyout: updateCommandFlyout
    };

    P.CpAppBar.prototype.updateCommand = function (/* @dynamic*/command) {
        /// <summary>Update command in the command bar(idendified by command.commandId. Updating non-existed command fails.</summary>
        /// <param name="command" type="Object">
        ///     An object that contains the command properties which need to be updated.
        ///     It can be either P.Command or literal object.
        ///     For example, to update the command label and icon, one can pass in
        ///     { commandId: "cmdId1", name: "new label", iconSymbol: "\uE104"}
        /// </param>
        Debug.assert(Jx.isObject(command), "Invalid param: command is not a valid object!");
        Debug.assert(Jx.isNonEmptyString(command.commandId), "updateCommand must be called with a given commandId!");
        Jx.log.info("People.CpAppBar.updateCommand: " + command.commandId);

        var updated = this._appCommands.updateCommand(command);
        var props = updated.props;
        Debug.assert(!Jx.isNullOrUndefined(props) && Jx.isArray(props));
        if (props.length > 0) {
            var updatedCommand = /*@static_cast(AppCommandDescriptor)*/ updated.command;
            Debug.assert(updatedCommand instanceof P.Command);
            // If the appbar gets delay loaded, this._winappbar can be null. The UI is scheduled to be updated in load() call.
            if (this._winappbar) {
                var winjsCommand = this._getCommandOnAppBar(updatedCommand.commandId);
                // If this gets called before the commands are set on the appbar, winjsCommand can be null.
                if (winjsCommand) {
                    props.forEach( function (prop) {
                        if (prop in updateCommandUIFn) {
                            updateCommandUIFn[prop].call(window, winjsCommand, updatedCommand);
                        }
                    });
                }
            }
        }
    };

    P.CpAppBar.prototype._getCommandOnAppBar = function (commandId) {
        /// <summary>get the winjs command object by command Id</summary>
        /// <param name="commandId" type="String"/>
        /// <returns type="WinJSCommandDescriptor"/>
        return this._winappbar.getCommandById(getCmdBtnElementId(commandId));
    };

    P.CpAppBar.prototype.updateCommandName = function (commandId, commandName, formattedName) {
        /// <summary>Updates the command name on the command button.</summary>
        /// <param name="commandId" type="String">Command ID of the button.</param>
        /// <param name="commandName" type="String">The resource ID of the button name string.</param>
        /// <param name="formattedName" type="String">The array of strings, the first item is resource ID for the formatted string which uses {{%n}} for replacements.
        /// The rest items are the replacement values for the formatted string.</param>
        Jx.log.info("People.CpAppBar.updateCommandName: updating commandId=" + commandId);
        this.updateCommand({commandId: commandId, name: commandName, formattedName: formattedName});
    };

    P.CpAppBar.prototype.updateCommandIcon = function (commandId, symbol) {
        /// <summary>Updates the command icon for the command button.</summary>
        /// <param name="commandId" type="String">Command id of the button</param>
        /// <param name="symbol" type="String">The symbol for the icon.</param>
        Jx.log.info("People.CpAppBar.updateCommandIcon: updating commandId=" + commandId);
        Debug.assert(Jx.isNonEmptyString(symbol));
        this.updateCommand({commandId: commandId, iconSymbol: symbol});
    };

    P.CpAppBar.prototype.updateNumberOnButton = function (commandId, /*@dynamic*/number) {
        /// <summary>Updates the number for the command.</summary>
        /// <param name="commandId" type="String">Command id of the button</param>
        /// <param name="number">Number to be updated to</param>
        Jx.log.info("People.CpAppBar.updateNumberOnButton: updating commandId=" + commandId + ",number=" + number);
        if (!Jx.isNumber(number)) {
            number = parseInt(number);
        }
        this.updateCommand({commandId: commandId, number: number});
    };

    P.CpAppBar.prototype.showCommand = function (commandId) {
        /// <summary>Show a command that was hidden in the command bar.</summary>
        /// <param name="commandId" type="String">Unique command Id for the command to be shown.</param>
        Jx.log.info("P.CpAppBar.showCommand: " + commandId);
        this.updateCommand({commandId: commandId, visible: true});
    };

    P.CpAppBar.prototype.hideCommand = function (commandId) {
        /// <summary>Hide a command that was shown in the command bar.</summary>
        /// <param name="commandId" type="String">Unique command Id for the command to be hidden.</param>
        Jx.log.info("P.CpAppBar.hideCommand: " + commandId);
        this.updateCommand({commandId: commandId, visible: false});
    };

    function getCmdBtnElementId(commandId) {
        /// <summary>Generates the element id for the command button.</summary>
        /// <param name="commandId" type="String">The id for the command.</param>
        /// <returns type="String">The element id for the command button.</returns>
        return "idCmdBtn_" + commandId;
    }

    function updateCommandName(winjsCommand, command) {
        /// <summary>Update command label in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.label = command.getLabel();
    }

    function updateCommandTooltip(winjsCommand, command) {
        /// <summary>Update command tooltip in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.tooltip = command.getTooltip();
    }

    function updateCommandIcon(winjsCommand, command) {
        /// <summary>Update command icon in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.icon = command.iconSymbol;
    }

    function updateCommandDisabled(winjsCommand, command) {
        /// <summary>Update command disabled bit in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.disabled = !command.enabled;
    }

    function updateCommandSelected(winjsCommand, command) {
        /// <summary>Update toggle command selected bit in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.selected = command.selected;
    }

    function updateCommandFlyout(winjsCommand, command) {
        /// <summary>Update command flyout in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        winjsCommand.flyout = command.flyout;
    }

    function updateCommandVisibility(winjsCommand, command) {
        /// <summary>Update command visibility in UI</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor"/>
        /// <param name="command" type="AppCommandDescriptor"/>
        showHideElement(winjsCommand.element, command.visible);
    }

    function showHideElement(element, show) {
        /// <summary>Shows or hides an element.</summary>
        /// <param name="element" type="HTMLElement"/>
        /// <param name="show" type="Boolean">True for show, false for hide.</param>
        if (element) {
            Jx.setClass(element, "hidden", !show);
        }
    }

    function updateCommandNumber(winjsCommand, command) {
        /// <summary>Updates the text overlay on the command button.</summary>
        /// <param name="winjsCommand" type="WinJSCommandDescriptor">WinJS command object</param>
        /// <param name="command" type="AppCommandDescriptor"/>
        var text = '';
        var number = parseInt(command.number);
        if (number > 0 && number < 100) {
            text = String(number);
        } else if (number > 99) {
            text = '99+';
        }

        var cmdElement = winjsCommand.element;
        var imageElement = cmdElement.querySelector(".win-commandimage");
        Debug.assert(imageElement);
        var symbol = command.iconSymbol;
        Debug.assert(Jx.isNonEmptyString(symbol));

        if (number > 0) {
           Jx.addClass(cmdElement, "show-number-on-commandimage");
           imageElement.innerHTML = '<div class="commandimage-uppernumber">' + text + '</div><div class="commandimage-lower">' + symbol + '</div>';
        } else {
           Jx.removeClass(cmdElement, "show-number-on-commandimage");
           imageElement.innerText = symbol;
        }
    };

});
