
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "CompCanvasCommandBar", function () {

    Mail.CompCanvasCommandBar = /* @constructor*/function (rootElement, elementMapping) {
        /// <param name="elementMapping" type="Dynamic"/>
        Debug.assert(Jx.isObject(elementMapping), "The elementMapping is a required attribute for the command host");

        var commandManager = Mail.Globals.commandManager;
        for (var commandId in elementMapping) {
            if (!commandManager.isValidCommandId(commandId)) {
                // Command does not exist in this context.  
                // Delete reference to it.
                Mail.log("CanvasCommandBar: Command " + commandId + " ignored.");
                delete elementMapping[commandId];
            }
        }
        Debug.call(Mail.CompCanvasCommandBar._validateElementMappings, this, elementMapping);

        this._rootElement = rootElement;
        this._elementMapping = elementMapping;
        this._id = String(Jx.uid());
        this._disposer = new Mail.Disposer();

        Mail.Commands.Host.call(this);
        Mail.Commands.Host.prototype.activateUI.call(this);
    };

    Jx.inherit(Mail.CompCanvasCommandBar, Mail.Commands.Host);

    
    Mail.CompCanvasCommandBar._validateElementMappings = function (elementMapping) {
        /// <param name="elementMapping" type="Dynamic"/>
        var commandManager = /*@static_cast(Mail.Commands.Manager)*/ Mail.Globals.commandManager;
        for (var commandId in elementMapping) {
            Debug.assert(commandManager.isValidCommandId(commandId), "Invalid commandId " + commandId + "detected");
            Debug.assert(Jx.isNonEmptyString(elementMapping[commandId]));
        }
    };
    

    Mail.CompCanvasCommandBar.prototype.dispose = function () {
        this._rootElement = null;
        this._disposer.dispose();
        Mail.Commands.Host.prototype.deactivateUI.call(this);
    };

    Mail.CompCanvasCommandBar.prototype.activateCommands = function (commandOptions) {
        /// <summary>This function is called by the commandManager when the commandHost is registered
        /// The command Host is given the list of commandItems that it registered for so that it can
        /// register, event listeners, fixed up tooltips, etc
        ///</summary>
        /// <param name="commandOptions" type="Array"></param>

        Debug.assert(Jx.isArray(commandOptions));

        /// Register the click handlers for the commands
        commandOptions.forEach( /*@bind( Mail.CompCanvasCommandBar)*/ function (command) {
            /// <param name="command" type="Mail.Commands.Item"/>
            var domSelector = this._elementMapping[command.id],
                button = this._rootElement.querySelector(domSelector);

            button.title = command.tooltip;

            Debug.assert(Jx.isFunction(command.onInvoke));
            if (command.id === "respond") {
                this._ensureFlyoutHost(button);

                var observer = Jx.observeAttribute(button, "aria-expanded", function () {
                    if (button.getAttribute("aria-expanded") === "true") {
                        Mail.Commands.FlyoutHandler.onHostButton("compFlyoutCommandHost", button, true);
                    }
                });

                this._disposer.add(new Mail.Disposable(observer, "disconnect"));
            } else {
                var mgr = Mail.Globals.commandManager,
                    handler = function (ev) { mgr.invokeCommand(command, Mail.Instrumentation.UIEntryPoint.onCanvas, ev); };

                button.addEventListener("click", handler, false); // These event listeners don't get manually removed. Their lifetime is the duration of the app.
            }
        }, this);
    };

    Mail.CompCanvasCommandBar.prototype._ensureFlyoutHost = function (respondButton) {
        Debug.assert(Jx.isHTMLElement(respondButton));

        if (!this._respondFlyout) {
            var respondFlyout = Mail.Commands.FlyoutHandler.ensureFlyout('compFlyoutCommandHost');

            var setAriaExpanded = Mail.setAttribute.bind(null, respondButton, "aria-expanded", "true"),
                resetAriaExpanded = Mail.setAttribute.bind(null, respondButton, "aria-expanded", "false");
            this._disposer.add(new Mail.EventHook(respondFlyout, "aftershow", setAriaExpanded));
            this._disposer.add(new Mail.EventHook(respondFlyout, "afterhide", resetAriaExpanded));

            respondButton.addEventListener("click", function () {
                if (respondButton.getAttribute("aria-expanded") === "true") {
                    resetAriaExpanded();
                } else {
                    setAriaExpanded();
                }
            }, false);
        }
    };

    Mail.CompCanvasCommandBar.prototype.showCommands = function () {
        this._showCommands(this.commandsToShow(), true);
        this._showCommands(this.commandsToHide(), false);
    };

    Mail.CompCanvasCommandBar.prototype._showCommands = function (commandIds, fShow) {
        /// <param name="commandIds" type="Array"/>
        /// <param name="fShow" type="Boolean"/>
        Debug.assert(Jx.isArray(commandIds));
        Debug.assert(Jx.isBoolean(fShow));

        commandIds.forEach( /*@bind( Mail.CompCanvasCommandBar)*/ function (commandId) {
            var domSelector = this._elementMapping[commandId];
            Jx.setClass(this._rootElement.querySelector(domSelector), "hidden", !fShow);
        }, this);
    };

    Mail.CompCanvasCommandBar.prototype.composeCommands = function () {
        return ['compose', 'delete'];
    };
    Mail.CompCanvasCommandBar.prototype.consumeCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };
    Mail.CompCanvasCommandBar.prototype.viewStateCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    Object.defineProperty(Mail.CompCanvasCommandBar.prototype, "registeredCommandIds", { get: function () { return Object.keys(this._elementMapping);}, enumerable: true });
    Object.defineProperty(Mail.CompCanvasCommandBar.prototype, "id", { get: function () { return this._id;}, enumerable: true });
});
