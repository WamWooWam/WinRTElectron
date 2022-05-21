
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS*/

Jx.delayDefine(Mail.Commands, "MenuFlyout", function () {
    "use strict";

    Mail.Commands.MenuFlyout = /* @constructor*/function () {
        this._flyout = /*@static_cast(WinJS.UI.Menu)*/ null;
        this._commandToExecute = /*@static_cast(Mail.Commands.Item)*/ null;
        this._registeredCommandIds = this._registeredCommandIds || [];
        this._label = this._label || null;
        this._commands = null;
        this._observer = null;
        this._uiEntryPoint = Mail.Instrumentation.UIEntryPoint.appBar;
        Mail.Commands.Host.call(this);
        Mail.Commands.Host.prototype.activateUI.call(this);
    };
    Jx.inherit(Mail.Commands.MenuFlyout, Mail.Commands.Host);

    Object.defineProperty(Mail.Commands.MenuFlyout.prototype, "placement", { get: function () { return "top"; }, enumerable: true });
    Object.defineProperty(Mail.Commands.MenuFlyout.prototype, "alignment", { get: function () { return "center"; }, enumerable: true });
    Object.defineProperty(Mail.Commands.MenuFlyout.prototype, "registeredCommandIds", { get: function () { return this._registeredCommandIds; }, enumerable: true });
    Object.defineProperty(Mail.Commands.MenuFlyout.prototype, "id", { get: function () { Debug.assert("Child class must define id"); }, enumerable: true });

    Mail.Commands.MenuFlyout.onPointerDown = function (evt) {
        /// <summary> 
        /// This is part of the 2 step process to no-oping right clicks for
        /// the appbar flyouts. This prevents right click from moving focus.
        /// If the right click moves focus, then canvas loses the selection it had before.
        /// </summary>
        if (evt.button === 2 /*right click*/) {
            evt.preventDefault();
        }
    };

    Mail.Commands.MenuFlyout.onContextMenu = function (evt) {
        /// <summary>
        /// This is the second part of no-oping right clicks. Since
        /// the contextmenu can't be prevented by pointer events, we have
        /// to handle it separately. This prevents the context menu from
        /// coming up and dismisses the flyout. 
        /// </summary>
        evt.preventDefault();
        this.hide();
    };

    Mail.Commands.MenuFlyout.prototype.register = function () {
        Mail.Globals.commandManager.registerCommandHost(this);
    };

    Mail.Commands.MenuFlyout.prototype.activateCommands = function (commands) {
        /// <summary>This function is called by the commandManager when the commandHost is registered
        /// The command Host is given the list of commandItems that it registered for so that it can
        /// register, event listeners, fixed up tooltips, etc
        ///</summary>
        /// <param name="commandOptions" type="Array"></param>
        this._commands = commands;
        commands = commands.map(/*@Mail.Commands.MenuFlyout*/ function (commandItem) {
            /// <param type="Mail.Commands.Item" name="commandItem"></param>
            var commandOption = commandItem.getOption();
            commandOption.onclick = /*@Mail.Commands.MenuFlyout*/ function () {
                // To avoid stealing focus, we only want to execute a command after the
                // flyout is closed, store the command to execute upon clicking in this._commandToExecute
                this._commandToExecute = commandItem;
                this._observer.takeRecords();
            }.bind(this);
            return commandOption;
        }.bind(this));

        this._createFlyoutMenu(commands);
    };

    Mail.Commands.MenuFlyout.prototype._createFlyoutMenu = function (commands) {
        Debug.assert(Jx.isArray(commands));
        Debug.assert(this._flyout === null); // This function should only get called once

        // Create the flyout control
        var element = document.createElement("div");
        element.className = "commandMenuFlyout";
        element.id = this.id;
        if (this._label) {
            element.setAttribute("aria-label", this._label);
        }

        var appRoot = document.getElementById(Mail.CompApp.rootElementId);
        appRoot.appendChild(element);

        this._flyout = new WinJS.UI.Menu(element, { commands: commands, sticky: true, placement: this.placement, alignment: this.alignment });
        this._observer = Jx.observeMutation(element, {
            attributes: true,
            subtree: true,
            attributeFilter: ["aria-checked"]
        }, this._onMutation, this);


        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._flyout, "MSPointerDown", Mail.Commands.MenuFlyout.onPointerDown),
            new Mail.EventHook(this._flyout, "contextmenu", Mail.Commands.MenuFlyout.onContextMenu, this),
            new Mail.EventHook(this._flyout, "afterhide", this._afterHide, this),
            new Mail.Disposable(this._observer, "disconnect"));
    };

    Mail.Commands.MenuFlyout.prototype._onMutation = function (records) {
        // This function is called when the aria-checked attribute is changed on toggle menu commands.
        // The UI Automation spec defines that toggles only modify this attribute instead of firing a click event.
        // UI Automation is what drives Narrator's behavior. http://msdn.microsoft.com/en-us/library/windows/apps/hh700529.aspx
        Debug.assert(records && records.length === 1);
        records[0].target.winControl.onclick(records[0]);
        this._flyout.hide();
    };

    Mail.Commands.MenuFlyout.prototype._afterHide = function (ev) {
        var commandToExecute = this._commandToExecute;
        if (commandToExecute) {
            var commandManager = Mail.Globals.commandManager,
                uiEntryPoint = this._uiEntryPoint,
                appBar = commandManager.appBar;
            if (commandToExecute.dismissAfterInvoke && appBar && !appBar.appBarSelectionSticky) {
                // Hide the app bar before invoking the command handler
                // unless the appbar is sticky from the canvas selection
                commandManager.hideAppBar().then(function () {
                    commandManager.invokeCommand(commandToExecute, uiEntryPoint, ev);
                });
            } else {
                commandManager.invokeCommand(commandToExecute, uiEntryPoint, ev);
            }
        }
        this._commandToExecute = null;
    };

    Mail.Commands.MenuFlyout.prototype.dispose = function () {
        if (this._flyout) {
            Jx.dispose(this._hooks);
            this._flyout.hide();
            this._flyout = null;
        }
        Mail.Commands.Host.prototype.deactivateUI.call(this);
    };

    Mail.Commands.MenuFlyout.prototype.show = function (anchor) {
        Debug.assert(Jx.isObject(this._flyout));
        Debug.assert(Jx.isHTMLElement(anchor));
        this._flyout.show(anchor);
    };

    Mail.Commands.MenuFlyout.prototype.hide = function () {
        Debug.assert(Jx.isObject(this._flyout));
        this._flyout.hide();
    };

    Mail.Commands.MenuFlyout.prototype.showCommands = function () {
        /// <summary>Implements the CommandHost interface.  This function is called by the CommandManager when a context is enabled</summary>
        this._flyout.showOnlyCommands(this.commandsToShow());
    };

    Mail.Commands.MenuFlyout.prototype.toggleCommand = function (command) {
        Debug.assert(Jx.isInstanceOf(command, Mail.Commands.ToggleItem));

        var commandItem = this._flyout.getCommandById(command.id);
        Debug.assert(Jx.isObject(commandItem), "Why are we toggling a command <" + command.id + "> that is not registered?");
        commandItem.selected = command.showAsSelected;
        commandItem.icon = command.icon;
        commandItem.label = command.label;
        commandItem.tooltip = command.tooltip;
        this._observer.takeRecords();
    };

    Mail.Commands.MenuFlyout.prototype.isEnabled = function (selection) {
        /// <summary>A flyout menu is enabled if we have more than one menu item. Flyout menus with one item should be replaced with a button.</summary>
        var count = 0;
        this._commands.forEach(/*@bind(Mail.Commands.MenuFlyout)*/ function (command) {
            if (command.isEnabled(selection)) {
                count++;
            }
        }, this);
        
        return count > 1;
    };
});

Jx.delayDefine(Mail.Commands, "FlyoutHandler", function () {
  
    Mail.Commands.FlyoutHandler = {
        _instances: {},
        _constructors: {
            clipboardMenu: Mail.Commands.ClipboardMenu,
            compFlyoutCommandHost: Mail.CompFlyoutCommandHost,
            moreMenu: Mail.Commands.MoreMenu,
            composeMoreMenu: Mail.Commands.ComposeMoreMenu,
            fontFlyout: Mail.Commands.FontFlyout,
            fontColorFlyout: Mail.Commands.FontColorFlyout,
            highlightColorFlyout: Mail.Commands.HighlightColorFlyout,
            linkMenu: Mail.Commands.LinkMenu,
            listMenu: Mail.Commands.ListMenu
        }
    };

    Mail.Commands.FlyoutHandler.ensureFlyout = function (flyoutName) {
        Debug.assert(Jx.isNonEmptyString(flyoutName), "Must provide a name.");
        var instance = Mail.Commands.FlyoutHandler._instances[flyoutName];
        if (!Jx.isObject(instance)) {
            var constructor = Mail.Commands.FlyoutHandler._constructors[flyoutName];
            Debug.assert(Jx.isFunction(constructor), "Flyout constructor not mapped");

            instance = new constructor();
            instance.register();            
            Mail.Commands.FlyoutHandler._instances[flyoutName] = instance;            
        }
        Debug.assert(Jx.isObject(instance), "flyout instance not created");
        return instance;
    };

    Mail.Commands.FlyoutHandler.isEnabled = function (flyoutName, selection) {
        var flyout = Mail.Commands.FlyoutHandler.ensureFlyout(flyoutName);
        return flyout.isEnabled(selection);
    };

    Mail.Commands.FlyoutHandler.onHostButton = function (flyoutName, anchor, leaveAppBarState) {
        var flyout = Mail.Commands.FlyoutHandler.ensureFlyout(flyoutName);
        
        if (!Jx.isHTMLElement(anchor)) {
            anchor = document.getElementById(anchor);
        }
        Debug.assert(Jx.isHTMLElement(anchor), "anchor not found");

        if (leaveAppBarState) {
            flyout.show(anchor);
        } else {
            // Make sure the app bar is shown.  If it is already shown this will complete right away
            var commandManager = /*@static_cast(Mail.Commands.Manager)*/Mail.Globals.commandManager;
            commandManager.showAppBar().then(flyout.show(anchor));
        }
    };

});
