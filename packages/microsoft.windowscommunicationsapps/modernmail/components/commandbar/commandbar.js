
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Mail,Jx,Debug,Windows*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "CompCommandBar", function () {
    "use strict";

    var Instr = Mail.Instrumentation;

    var CommandBar = Mail.CompCommandBar = function (commandManager) {
        Mail.log("CommandBar.Ctor", Mail.LogEvent.start);
        this._commandManager = commandManager;
        this._commandIDs = [
                // consume commands
                "folderOperations",
                "toggleSelectionMode",
                "move",
                "sweep",
                "junkMessages",
                "unjunkMessages",
                "moveSeparator",
                "print",
                "toggleFlag",
                "toggleUnread",
                "deleteMessage",
                "messageSeparator",
                // compose commands
                "save",
                "clipboardToggle",
                "font",
                "fontColor",
                "highlightColor",
                "fontSeparator",
                "bold",
                "italic",
                "underline",
                "formatSeparator",
                "listMenu",
                "emojiCmd",
                "linkToggle",
                // other commands
                "newChildWindow",
                "composeMoreMenu",
                "moreMenu"];

        // this._commandIDs must be initialized before Mail.Commands.Host is called.
        Mail.Commands.Host.call(this);
        this._selectionHelper = null;
        this._isActivated = false;
        this._lightDismissEventHook = null;
        this._composeSelectionHook = null;
        this._contextHooks = null;
        this._hooks = null;
        this._composeSelection = null;
        this._observer = null;

        this._name = "Mail.CompCommandBar";
        this._appBar = null;
        this._appBarSelectionSticky = false;
        this._edgyHappening = false;

        this._buttonColor = {
            fontColor: "#D03A3A", // default red
            highlightColor: "#FFFF00" // default yellow
        };

        this._peekBar = new Jx.PeekBar("bottom");
        this.append(this._peekBar);

        Mail.log("CommandBar.Ctor_InitComp", Mail.LogEvent.start);
        this.initComponent();
        Mail.log("CommandBar.Ctor_InitComp", Mail.LogEvent.stop);
        Mail.log("CommandBar.Ctor", Mail.LogEvent.stop);
    };

    Jx.inherit(CommandBar, Mail.Commands.Host);
    Jx.augment(CommandBar, Jx.Events);
    Jx.augment(CommandBar, Jx.Component);

    CommandBar.Events = {
        beforeshow: "beforeshow",
        afterhide: "afterhide",
        aftershow: "aftershow"
    };

    var proto = CommandBar.prototype;
    Debug.Events.define(proto, CommandBar.Events.beforeshow, CommandBar.Events.aftershow, CommandBar.Events.afterhide);

    CommandBar.appBarElementId = "mailAppBar";

    proto.getUI = function (ui) {
        ui.html = Jx.getUI(this._peekBar).html + '<div id="mailAppBar" class="win-ui-dark"></div>';
    };

    proto.setEnabled = function (isEnabled) {
        Debug.assert(Jx.isObject(this._appBar));
        this._appBar.setEnabled(isEnabled);
        if (isEnabled) {
            this._peekBar.show();
        } else {
            this._peekBar.hide();
        }
    };

    proto.hideAppBar = function () {
        if (!this._appBar) {
            this.register();
        }

        return this._appBar.hideAsync();
    };

    proto.showAppBar = function (skipCommandUpdate) {
        Debug.assert(Jx.isUndefined(skipCommandUpdate) || Jx.isBoolean(skipCommandUpdate));
        if (!skipCommandUpdate) {
            this._commandManager.completeContextUpdate();
        }
        if (!this._appBar) {
            this.register();
        }

        return this._appBar.showAsync();
    };

    proto.toggleVisibility = function () {
        this._commandManager.completeContextUpdate();
        if (!this._appBar) {
            this.register();
        }

        return this._appBar.toggleVisibility();
    };

    proto.activateUI = function () {
        Mail.Commands.Host.prototype.activateUI.call(this);
        this._peekBar.hide();
    };

    proto.register = function () {
        /// <summary>This function creates the app bar.  It is called by the frame in the post start up queue so that
        /// our app can start faster
        /// </summary>
        if (!this._isActivated) {
            this.register = Jx.fnEmpty; // only need to do this once
            Mail.log("CommandBar.register", Mail.LogEvent.start);
            this._isActivated = true;
            Jx.Component.prototype.activateUI.call(this);
            var cmdManager = this._commandManager,
                shortcuts = ["prevMessage", "nextMessage", "applyAllFilter", "applyUnreadFilter", "reapplyFilter", "markUnread", "markRead", "pinFolder", "moveShortcut"];
            cmdManager.registerCommandHost(/*@static_cast(Mail.Commands.Host)*/this);
            Debug.assert(Jx.isArray(shortcuts) && shortcuts.length > 0);
            cmdManager.registerShortcuts(shortcuts);
            this._contextHooks = new Mail.Disposer(
                new Mail.EventHook(cmdManager, Mail.Commands.Events.onAddContext, this._onAddContext, this),
                new Mail.EventHook(cmdManager, Mail.Commands.Events.onRemoveContext, this._onRemoveContext, this));
            // Since compose starts async at startup at the same time this does it could have completed before we did
            var selection = cmdManager.getContext("composeSelection");
            if (selection) {
                this._onAddContext("composeSelection");
            }
            Mail.log("CommandBar.register", Mail.LogEvent.stop);
        }
    };

    proto.deactivateUI = function () {
        if (this._isActivated) {
            Jx.Component.prototype.deactivateUI.call(this);
            Jx.dispose(this._selectionHelper);
            this._selectionHelper = null;
            this._deactivateLightDismiss();
            Jx.Component.deactivateUI.call(this);
            Jx.dispose(this._contextHooks);
            Jx.dispose(this._hooks);
            this._observer.disconnect();
            this._observer = null;
            Mail.Commands.Host.prototype.deactivateUI.call(this);
        }
    };

    proto._onAddContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            this._composeSelection = this._commandManager.getContext(key);
            if (this._lightDismissEventHook) {
                this._hookComposeSelection();
            }
        }
    };

    proto._onRemoveContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            this._composeSelection = null;

            if (this._lightDismissEventHook && this._composeSelectionHook) {
                this._lightDismissEventHook.disposeNow(this._composeSelectionHook);
                this._composeSelectionHook = null;
            }
        }
    };

    proto._activateLightDismiss = function () {
        /// <summary>
        /// The default light dismiss model of the app Bar is implemented by a clickEatingDiv that swallows all click event.
        /// As a result, when the app bar is up, clicking on a folder in the folder list only dismisses the appBar,
        /// but it will not select the new folder.  This is bad user experience.
        /// To workaround it, we put the appBar on hard dismiss model and implements our own light dismiss model
        /// via the following
        /// 1. Implement a click listener on the mailFrameWrapper, the top level div container, to dismiss the app bar
        /// 2. The reading Frame iframe does not automatically forward the click event to the mailFrameWrapper, so we need
        ///    another click handler
        /// 3. Stop the click event propagation from the messageList. See comments below
        /// 4. Hide the appbar when the escape key is pressed
        /// </summary>

        var EventHook = Mail.EventHook,
            frameElement = document.getElementById(Mail.CompFrame.frameElementId);

        /// Use the frame element as our own click eating div
        this._lightDismissEventHook = new Mail.Disposer(
            new EventHook(frameElement, "MSPointerDown", this._onClick, this),
            EventHook.createGlobalHook(Mail.ReadingPaneBody.Events.frameClicked, this._onClick, this),
            EventHook.createGlobalHook("mail-messageList-clicked", this._onMessageListClicked, this));

        if (this._composeSelection) {
            this._hookComposeSelection();
        }
    };

    proto._hookComposeSelection = function () {
        if (!this._composeSelectionHook) {
            this._composeSelectionHook = new Mail.EventHook(this._composeSelection, "mspointerdown", this._onClick, this);
        }
        Debug.assert(this._lightDismissEventHook);
        this._lightDismissEventHook.add(this._composeSelectionHook);
    };

    proto._deactivateLightDismiss = function () {
        /// Use the frame element as our own click eating div
        Jx.dispose(this._lightDismissEventHook);
        this._lightDismissEventHook = null;
        this._composeSelectionHook = null;
    };

    proto._onClick = function (/*@dynamic*/ evt) {
        if (!evt.fromMessageList && (evt.pointerType !== "mouse" || evt.button !== 2)) {
            Debug.assert(Jx.isObject(this._appBar));
            this._appBar.hide();
        }
    };

    proto._onPeekBarShow = function (ev) {
        Debug.assert(ev && ev.data, "Invalid peekBar event data");
        this._appBar.show();
        ev.cancel = true;
        var AppBarInvokeType = Instr.AppBarInvokeType;
        Instr.instrumentAppBarInvoke(ev.data.pointerType === "touch" ? AppBarInvokeType.peekBarTouch : AppBarInvokeType.peekBarMouse);
    };

    proto._onMutation = function (records) {
        // This function is called when the aria-checked attribute is changed on toggle menu commands.
        // The UI Automation spec defines that toggles only modify this attribute instead of firing a click event.
        // UI Automation is what drives Narrator's behavior. http://msdn.microsoft.com/en-us/library/windows/apps/hh700529.aspx
        Debug.assert(records && records.length === 1);
        records[0].target.winControl.onclick(records[0]);
    };

    proto._onMessageListClicked = function (/*@dynamic*/ evt) {
        // When the user clicks on a message, the listView will fire a selection changed event, in which
        // we may show/hide the app bar.  Therefore, we want to set a flag on that click event so that our
        // click eating div, mailFrameWrapper, won't handle that event if the click comes from the message list.
        // To be more specific, we don't want the click eating div to hide the app bar when the user multi-select with shift-click
        // or ctrl-click as when we are supposed to show the appbar on multi-selection.
        // We can't call e.stopPropagation as touch narrator listens to click event.  If we stop the click event from
        // propagating, a blind user would not be able to select the message with touch narrator.
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isObject(evt.data));
        var domEvent = /*@static_cast(Event)*/ evt.data;
        domEvent.fromMessageList = true;
    };

    proto._hideAppBarAndInvoke = function (callback, noAnimation) {
        /// <param name="callback" type="Function">function to call when the appbar is hidden.</param>
        /// <param name="noAnimation" type="Boolean">if true then the appbar hide animation will be disabled before it's hidden.</param>
        /// <summary>This function serves two purpose
        /// It forces the app bar to close to workaround an App Bar bug
        /// It makes the command handling asynchronous so that commands that a while to complete cannot block the UI thread
        /// </summary>
        return function (event) {
            Jx.log.info("Mail.CompCommandBar.prototype._hideAppBarAndInvoke - begin invoking callback");
            Jx.scheduler.addJob(null, Mail.Priority.postHideAppBar, "post-hide-app-bar callback", callback, null, [event]);
            Jx.log.info("Mail.CompCommandBar.prototype._hideAppBarAndInvoke - end invoking callback");
            Debug.assert(Jx.isObject(this._appBar));
            var suppressor = noAnimation ? new Mail.WinJSAnimationSuppressor() : null;
            this._appBar.hideAsync().done(function () { Jx.dispose(suppressor); });
        }.bind(this);
    };

    proto.activateCommands = function (commandOptions) {
        /// <summary>Implements the CommandHost interface.
        /// This function is called by the CommandManager when the CommandHost register itself.
        /// The Command host should initialize the UI here.
        /// </summary>
        /// <param name="commandOptions" type="Array">The list of commands that are registered by this host</param>
        Mail.log("CommandBar.activateCommands", Mail.LogEvent.start);
        var appBarElement = document.getElementById(Mail.CompCommandBar.appBarElementId);
        Debug.assert(Jx.isHTMLElement(appBarElement));
        Debug.assert(Jx.isArray(commandOptions));

        var leftPanelCommands = [
            "folderOperations",
            "toggleSelectionMode",
            "save",
            "clipboardToggle"],
            options = commandOptions.map(function (commandItem) {
                /// <param type="Mail.Commands.Item" name="commandItem"></param>
                Debug.assert(Jx.isInstanceOf(commandItem, Mail.Commands.Item));

                var option = commandItem.getOption();
                option.onclick = this._invokeCommand.bind(this, commandItem);
                if (commandItem.dismissAfterInvoke) {
                    // Hide the app bar after invoking the command handler, except for mark as read and unread
                    option.onclick = this._hideAppBarAndInvoke(option.onclick, commandItem.noAnimationOnDismiss);
                }

                if (leftPanelCommands.indexOf(commandItem.id) !== -1) {
                    option.section = "selection";
                }

                if (commandItem.useCustomFont) {
                    option.extraClass = "useCustomFont";
                }

                // More menu needs some time to get things ready plus it has global shortcuts we want added
                if (commandItem.id === "moreMenu") {
                    Jx.scheduler.addJob(null, Mail.Priority.createMoreMenu, "create the more menu", function () {
                        Mail.Commands.FlyoutHandler.ensureFlyout("moreMenu");
                    });
                }

                if (option.type === "toggle") {
                    option.selected = commandItem.showAsSelected;
                }

                return option;
            }, this);

        this._appBar = new Mail.AppBar(appBarElement, {
            commands: options,
            sticky: true
        });
        // content editable treats selection changes specially in the springloader (and maybe others) if the attribute values unselectable=on is present.
        ['bold', 'underline', 'italic', 'fontColor'].forEach(function (id) {
            var element = document.getElementById(id);
            if (Jx.isHTMLElement(element)) {
                element.setAttribute("unselectable", "on");
            }
        });
        // fix up aria role for commands that are toggles between button and menu flyout
        ['clipboardToggle', 'linkToggle'].forEach(function (id) {
            var element = document.getElementById(id);
            if (Jx.isHTMLElement(element)) {
                element.setAttribute("role", "menuitem");
            }
        });

        // modify the fontColor and highlight buttons to allow changing the color of the color bar
        var cmdImage = document.querySelector('#fontColor .win-commandimage');
        Debug.assert(Jx.isHTMLElement(cmdImage), "fontColor win-commandimage span missing");
        cmdImage.innerHTML = "<span id='fontColor-colorBar' style='color:" + this._buttonColor.fontColor + "'>&#xE195;</span>&#xE196;";
        cmdImage = document.querySelector('#highlightColor .win-commandimage');
        Debug.assert(Jx.isHTMLElement(cmdImage), "highlightColor win-commandimage span missing");
        cmdImage.innerHTML = "<span id='highlightColor-colorBar' style='color:" + this._buttonColor.highlightColor + "'>&#xE197;</span>&#xE198;";

        this._peekBar.show();
        this._observer = Jx.observeMutation(appBarElement, {
            attributes: true,
            subtree: true,
            attributeFilter: ["aria-checked"]
        }, this._onMutation, this);
        var commandManager = this._commandManager,
            commandUI = Windows.UI.Input.EdgeGesture.getForCurrentView(),
            EventHook = Mail.EventHook;
        this._hooks = new Mail.Disposer(
            new EventHook(this._appBar, "beforeshow", function (evt) {
                this._peekBar.hide();
                this.raiseEvent("beforeshow", evt);
            }, this, false),
            new EventHook(this._appBar, "beforehide", function () {
                this._peekBar.show();
            }, this, false),
            new EventHook(this._appBar, "afterhide", function (evt) {
                this.raiseEvent("afterhide", evt);
            }, this, false),
            new EventHook(this._appBar, "aftershow", function (evt) {
                this.raiseEvent("aftershow", evt);
            }, this, false),
            new EventHook(commandUI, "starting", this._startingEdgy, this, false),
            new EventHook(commandUI, "completed", this._completedEdgy, this, false),
            new EventHook(commandUI, "canceled", this._canceledEdgy, this, false),
                // The keydown handler for shortcuts are registered on the container Div of the app.
                // Since the command bar lives in a separate DOM tree, we need to route the keydown events to the
                // command manager so that shortcuts will work when the command bar has focus
            new EventHook(appBarElement, "keydown", commandManager.onKeyDown, commandManager, false),
            new EventHook(this._appBar, "afterhide", this._clearAppBarSticky, this, false),
            new EventHook(document.getElementById(Mail.CompMessageList.defaultElementId), "mailitemdragstart", this.hideAppBar, this),
            EventHook.createEventManagerHook(this, "peekBarShow", this._onPeekBarShow, this),
            EventHook.createGlobalHook("buttonColorUpdate", function (ev) { this._updateButtonColors(ev.data); }, this),
            EventHook.createGlobalHook("composeVisibilityChanged", function () {  this._updateButtonColors(this._buttonColor); }, this)
        );

        commandManager.subscribeToAppBar(this);

        if (!this._selectionHelper) {
            this._selectionHelper = new Mail.CommandBarSelectionHelper();
        }
        this._selectionHelper.activate(this._appBar);
        this._activateLightDismiss();
        Mail.log("CommandBar.activateCommands", Mail.LogEvent.stop);
    };

    proto._completedEdgy = function (e) {
        if (this._edgyHappening) {
            // Edgy was happening, just skip it
            this._edgyHappening = false;
        } else if (!this._appBar.hidden) { // WinJS hooks before us always so we're always opposite
            // Edgy wasn't happening, so count it
            var appBarInvokeType = Instr.AppBarInvokeType,
                invokeType = appBarInvokeType.edgyTouch,
                gestureKind = Windows.UI.Input.EdgeGestureKind,
                kind = e.kind;
            if (kind === gestureKind.keyboard) {
                invokeType = appBarInvokeType.edgyKeyboard;
            } else if (kind === gestureKind.mouse) {
                invokeType = appBarInvokeType.rightClick;
            }
            Instr.instrumentAppBarInvoke(invokeType);
        }
    };

    proto._startingEdgy = function () {
        this._edgyHappening = true;
        if (!this._appBar.hidden) { // WinJS hooks before us always so we're always opposite
            // Only touch fires the startEdgy event.
            Instr.instrumentAppBarInvoke(Instr.AppBarInvokeType.edgyTouch);
        }
    };

    proto._canceledEdgy = function () {
        this._edgyHappening = false;
    };

    proto._updateButtonColors = function (colors) {
        Object.keys(colors).forEach(function (key) {
            var element = document.getElementById(key + "-colorBar");
            if (element) {
                element.style.color = colors[key];
            }
        }, this);
    };

    proto.showCommands = function () {
        /// <summary>Implements the CommandHost interface.  This function is called by the CommandManager when a context is enabled</summary>
        Mail.log("CommandBar.showCommands", Mail.LogEvent.start);
        // We may call ourselves before the appbar has been created.
        if (this._appBar) {
            this._appBar.showOnlyCommands(this.commandsToShow());
        }
        Mail.log("CommandBar.showCommands", Mail.LogEvent.stop);
    };

    proto.toggleCommand = function (command) {
        /// <summary>Implements the CommandHost interface.
        /// This function is called by the CommandManager when a toggle button should be toggled on due to a change of context.
        /// </summary>
        /// <param name="command" type="Mail.Commands.ToggleItem" />
        Debug.assert(Jx.isInstanceOf(command, Mail.Commands.ToggleItem));

        var appBarCommandItem = this._appBar.getCommandById(command.id);
        Debug.assert(Jx.isObject(appBarCommandItem), "Why are we toggling a command <" + command.id + "> that is not registered?");
        appBarCommandItem.selected = command.showAsSelected;
        appBarCommandItem.icon = command.icon;
        appBarCommandItem.label = command.label;
        appBarCommandItem.tooltip = command.tooltip;
        appBarCommandItem.onclick = this._invokeCommand.bind(this, command);
        this._observer.takeRecords();
    };

    proto._invokeCommand = function (command, event) {
        /// <summary>Runs the specified command in response to a click, etc</summary>
        this._commandManager.invokeCommand(command, Mail.Instrumentation.UIEntryPoint.appBar, event);
        this._observer.takeRecords();
    };

    proto.focus = function () {
        /// <summary>Sets focus on the first command in the app bar.</summary>
        Debug.assert(Jx.isObject(this._appBar));
        this._appBar.focus();
    };

    proto._clearAppBarSticky = function () {
        this._appBarSelectionSticky = false;
    };

    Object.defineProperty(proto, "id", { get: function () { return "appBar"; }, enumerable: true });

    Object.defineProperty(proto, "registeredCommandIds", {
        get: function () {
            Debug.assert(Jx.isArray(this._commandIDs));
            return this._commandIDs;
        }, enumerable: true
    });

    proto.composeCommands = function () {
        return ["bold", "clipboardToggle", "composeMoreMenu", "emojiCmd", "font", "fontColor", "fontSeparator", "formatSeparator", "highlightColor", "italic", "linkToggle", "listMenu", "newChildWindow", "save", "underline"];
    };

    proto.consumeCommands = function () {
        return ["deleteMessage", "folderOperations", "junkMessages", "messageSeparator", "moreMenu", "move", "moveSeparator", "newChildWindow", "print", "sweep", "toggleFlag", "toggleSelectionMode", "toggleUnread", "unjunkMessages"];
    };

    proto.viewStateCommands = function (viewState) {
        if (this._composeSelection && !this._composeSelection.canvasInFocus && this._composeSelection.composeInFocus) {
            return ["newChildWindow", "save"];
        }
        var appViewState = Jx.ApplicationView.State;
        if (viewState === appViewState.wide || viewState === appViewState.full || viewState === appViewState.large) {
            return ["bold", "clipboardToggle", "composeMoreMenu", "deleteMessage", "emojiCmd", "folderOperations", "font", "fontColor", "fontSeparator", "formatSeparator", "highlightColor", "italic", "junkMessages", "linkToggle", "listMenu", "messageSeparator", "moreMenu", "move", "moveSeparator", "newChildWindow", "print", "save", "sweep", "toggleFlag", "toggleSelectionMode", "toggleUnread", "underline", "unjunkMessages"];
        } else if (viewState === appViewState.more) {
            return ["bold", "clipboardToggle", "composeMoreMenu", "deleteMessage", "emojiCmd", "folderOperations", "font", "fontColor", "fontSeparator", "formatSeparator", "highlightColor", "italic", "junkMessages", "linkToggle", "listMenu", "messageSeparator", "moreMenu", "move", "moveSeparator", "newChildWindow", "print", "sweep", "toggleFlag", "toggleSelectionMode", "toggleUnread", "underline", "unjunkMessages"];
        } else if (viewState === appViewState.portrait) {
            return ["bold", "clipboardToggle", "composeMoreMenu", "deleteMessage", "emojiCmd", "folderOperations", "font", "fontColor", "fontSeparator", "formatSeparator", "highlightColor", "italic", "junkMessages", "listMenu", "messageSeparator", "moreMenu", "move", "moveSeparator", "newChildWindow", "print", "sweep", "toggleFlag", "toggleSelectionMode", "toggleUnread", "underline", "unjunkMessages"];
        } else if (viewState === appViewState.split) {
            return ["bold", "clipboardToggle", "composeMoreMenu", "deleteMessage", "folderOperations", "font", "fontColor", "highlightColor", "italic", "junkMessages", "listMenu", "messageSeparator", "moreMenu", "move", "moveSeparator", "newChildWindow", "print", "toggleFlag", "toggleSelectionMode", "toggleUnread", "underline", "unjunkMessages"];
        } else if (viewState === appViewState.less) {
            return ["bold", "clipboardToggle", "deleteMessage", "folderOperations", "font", "italic", "messageSeparator", "moreMenu", "newChildWindow", "print", "save", "toggleFlag", "toggleSelectionMode", "toggleUnread", "underline"];
        } else if (viewState === appViewState.snap || viewState === appViewState.minimum) {
            return ["clipboardToggle", "deleteMessage", "moreMenu", "newChildWindow", "print", "save", "toggleFlag", "toggleUnread"];
        }
        Debug.assert(false, "unknown viewState");
    };

    proto.applyReducedClass = function (canvasInFocus, viewState, composeStateChange) {
        if (this._appBar) {
            this._appBar.reduce = (viewState !== Jx.ApplicationView.State.wide && viewState !== Jx.ApplicationView.State.full) || canvasInFocus;
            if (composeStateChange) {
                this._appBar.hide();
            }
        }
    };

    Object.defineProperty(proto, "hidden", {
        get: function () {
            return this._appBar ? this._appBar.hidden : true;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "offsetHeight", {
        get: function () {
            return this._appBar ? this._appBar.offsetHeight : 0;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "winAnimating", {
        get: function () {
            return this._appBar ? this._appBar.winAnimating : null;
        },
        enumerable: true
    });

    Object.defineProperty(proto, "lightDismiss", {
        set: function (lightDismiss) {
            if (this.lightDismiss === lightDismiss) {
                return;
            }

            if (lightDismiss) {
                this._activateLightDismiss();
            } else {
                this._deactivateLightDismiss();
            }
        },
        get : function () {
            return Boolean(this._lightDismissEventHook);
        },
        enumerable: true
    });

    Object.defineProperty(proto, "appBarSelectionSticky", {
        /// <summary>This is set by CommandBarSelectionHelper when a non-Empty selection is made in cavas.
        //  It is used to preserve the shown state of the appbar when it would otherwise change from changing selection.</summary>
        enumerable: true,
        get: function () {
            return this._appBarSelectionSticky;
        },
        set: function (value) {
            this._appBarSelectionSticky = value;
        }
    });
});
