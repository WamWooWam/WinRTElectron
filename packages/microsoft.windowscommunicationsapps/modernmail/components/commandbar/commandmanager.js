
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,Microsoft,SasManager*/

Jx.delayDefine(Mail.Commands, ["Events", "Manager"], function () {
    "use strict";

    Mail.Commands.Events = {
        showPreviousMessage : "Mail.Commands.Events.showPreviousMessage",
        showNextMessage : "Mail.Commands.Events.showNextMessage",
        showNextSyncStatus : "Mail.Commands.Events.showNextSyncStatus",
        onToggleSelectionMode : "Mail.Commands.Events.onToggleSelectionMode",
        allFilterApplied : "Mail.Commands.Events.allFilterApplied",
        unreadFilterApplied : "Mail.Commands.Events.unreadFilterApplied",
        reapplyFilter : "Mail.Commands.Events.reapplyFilter",
        onAddContext: "Mail.Commands.Events.onAddContext",
        onRemoveContext: "Mail.Commands.Events.onRemoveContext",
        appBarSubscription: "appBarSubscription"
    };

    Mail.Commands.Manager = function (glomManager, selection) {
        this._glomManager = glomManager;
        this._selection = selection;
        this._factory = null;
        this._shortcutManager = null;
        this._commandToHostBinding = {};
        this._contextToCommandBinding = {
            toggleContexts : {},
            enableContexts : {}
        };
        this._updateContextJob = null;
        this._updateContextPendingChanges = [];
        this._messageListeners = null;
        this._accountListeners = null;
        this._appBar = null;
        this._disables = [ "splashscreen" ];

        Debug.Events.define(this, Mail.Commands.Events.onAddContext, Mail.Commands.Events.onRemoveContext, Mail.Commands.Events.appBarSubscription);

        var appState = Mail.Globals.appState;
        Debug.assert(Jx.isObject(Mail.guiState), "The GUIState object must be initialized before the command manager");
        // Not using addContext here because these contexts are created at startup
        this._contexts = {
            appState: appState,
            guiState: Mail.guiState
        };

        this._hooks = new Mail.Disposer(
            new Mail.EventHook(selection, "messagesChanged", this._onMessagesChanged, this),
            new Mail.EventHook(selection, "navChanged", this._onNavigationChanged, this),
            new Mail.EventHook(Mail.guiState, "viewStateChanged", this._onLayoutChanged, this),
            new Mail.EventHook(Mail.guiState, "layoutChanged", this._onLayoutChanged, this),
            Mail.EventHook.createGlobalHook("isSearchingChanged", this._onSearchStateChanged, this),
            Mail.EventHook.createGlobalHook("isSelectionModeChanged", this._onSelectionModeChanged, this)
        );

        this._onMessagesChanged();
        Debug.assert(Mail.GlomManager.isChild() || Jx.isInstanceOf(appState.selectedAccount, Microsoft.WindowsLive.Platform.Account));
        if (appState.selectedAccount) {
            this._onNavigationChanged({ accountChanged: true });
        }

        var splashScreen = Mail.Globals.splashScreen;
        if (!splashScreen || !splashScreen.isShown) {
            this._onSplashScreenDismissed();
        } else {
            this._hooks.add(new Mail.EventHook(splashScreen, Mail.SplashScreen.Events.dismissed, this._onSplashScreenDismissed, this));
        }
    };

    Jx.augment(Mail.Commands.Manager, Jx.Events);

    Mail.Commands.Manager.prototype.dispose = function () {
        Jx.dispose(this._updateContextJob);
        this._updateContextJob = null;
        Jx.dispose(this._hooks);
    };

    Mail.Commands.Manager.prototype._getFactory = function () {
        if (!this._factory) {
            this._factory = new Mail.Commands.Factory(this._glomManager);
        }
        return this._factory;
    };

    Mail.Commands.Manager.prototype._getShortcutManager = function () {
        if (!this._shortcutManager) {
            this._shortcutManager = new Mail.Commands.ShortcutManager(this._selection);
        }
        return this._shortcutManager;
    };

    Mail.Commands.Manager.prototype.subscribeToAppBar = function (appBar) {
        /// <param name="appBar" type="Mail.CompCommandBar">The app bar.</param>
        this._appBar = appBar;
        this._appBar.setEnabled(this._disables.length === 0);
        this._hooks.add(new Mail.EventHook(appBar, Mail.CompCommandBar.Events.beforeshow, this._onBeforeShownAppBar, this));
        this.raiseEvent(Mail.Commands.Events.appBarSubscription, this._appBar);
    };

    Mail.Commands.Manager.prototype.subscribeToSaS = function () {
        this._hooks.add(new Mail.EventHook(SasManager, "sasenabled", this._onSaSChanged, this));
    };


    Mail.Commands.Manager.prototype.getContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>
        Debug.assert(Jx.isNonEmptyString(key), "Key must be given");

        return this._contexts[key];
    };

    Mail.Commands.Manager.prototype.addContext = function (key, context) {
        /// <param name="key" type="String">a unique string to identify the context</param>
        /// <param name="context" type="String">a unique string to identify the context</param>
        Debug.assert(Jx.isNonEmptyString(key), "Key must be given");
        Debug.assert(!this._contexts.hasOwnProperty(key), "Key not must be present in the contexts");

        this._contexts[key] = context;
        this._onAddContext(key);
        this.raiseEvent(Mail.Commands.Events.onAddContext, key);
    };

    Mail.Commands.Manager.prototype.removeContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>
        Debug.assert(Jx.isNonEmptyString(key), "Key must be given");
        Debug.assert(this._contexts.hasOwnProperty(key), "Key must be present in the contexts");

        this.raiseEvent(Mail.Commands.Events.onRemoveContext, key);
        this._onRemoveContext(key);
        delete this._contexts[key];
    };

    Mail.Commands.Manager.prototype._onAddContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            var selection = this.getContext(key);
            selection.addListener("selectionchange", this._onComposeSelectionChange, this);
            selection.addListener("aftercommand", this._onComposeSelectionChange, this);
            selection.addListener("contextmenu", this._onComposeSelectionChange, this);
        }
    };

    Mail.Commands.Manager.prototype._onRemoveContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>
        if (key === "composeSelection") {
            var selection = this.getContext(key);
            selection.removeListener("selectionchange", this._onComposeSelectionChange, this);
            selection.removeListener("aftercommand", this._onComposeSelectionChange, this);
            selection.removeListener("contextmenu", this._onComposeSelectionChange, this);
        }
    };

    Mail.Commands.Manager.prototype._onComposeSelectionChange = function () {
        this._updateContext("composeSelection");
    };

    Mail.Commands.Manager.prototype.hideAppBar = function () {
        return this._appBar.hideAppBar();
    };

    Mail.Commands.Manager.prototype.showAppBar = function () {
        return this._appBar.showAppBar();
    };

    Mail.Commands.Manager.prototype._onBeforeShownAppBar = function () {
        this._updateContext("showAppBar");
    };

    Mail.Commands.Manager.prototype.pinnedFolderChange = function () {
        this._updateContext("pinnedFolder");
    };

    Jx.augment(Mail.Commands.Manager, Jx.Attr);

    Mail.Commands.Manager.prototype._onSearchStateChanged = function () {
        this._updateContext("isSearching");
    };

    Mail.Commands.Manager.prototype._onSelectionModeChanged = function () {
        this._updateContext("selectionMode");
    };

    Mail.Commands.Manager.prototype._onNavigationChanged = function (ev) {
        if (ev.accountChanged) {
            // Replace the event hooks from the previous account with listeners for the new account
            var account = this._selection.account.platformObject;
            this._accountListeners = this._hooks.replace(this._accountListeners,
                [ new Mail.EventHook(account, "changed", this._onAccountScenarioStateChanged, this) ]);

            var resource = account.getResourceByType(Microsoft.WindowsLive.Platform.ResourceType.mail);
            if (resource) {
                this._accountListeners.push(new Mail.EventHook(resource, "changed", this._onMailResourceStateChanged, this));
            }

            this._updateContext("accountState");
            this._updateContext("resourceState");
        }

        if (ev.viewChanged) {
            this._updateContext("folderChange");
        }
    };

    Mail.Commands.Manager.prototype._onMailResourceStateChanged = function (ev) {
        /// <param name="ev" type="Event" />
        if (Mail.Validators.hasPropertyChanged(ev, "hasEverSynchronized")) {
            this._updateContext("resourceState");
        }
    };

    Mail.Commands.Manager.prototype._onAccountScenarioStateChanged = function (ev) {
        /// <param name="ev" type="Event" />
        if (Mail.Validators.hasPropertyChanged(ev, "mailScenarioState")) {
            this._updateContext("accountState");
        }
    };

    Mail.Commands.Manager.prototype._onLayoutChanged = function () {
        this._updateContext("guiState");
    };

    Mail.Commands.Manager.prototype._onMessageChanged = function (evt) {
        /// <param name="evt" type="Event" />
        if (Mail.Validators.hasPropertyChanged(evt, "read")) {
            this._updateContext("readStatus");
        }

        if (Mail.Validators.hasPropertyChanged(evt, "flagged")) {
            this._updateContext("flagStatus");
        }

        if (Mail.Validators.hasPropertyChanged(evt, "irmCannotForward") ||
            Mail.Validators.hasPropertyChanged(evt, "irmCannotReply") ||
            Mail.Validators.hasPropertyChanged(evt, "irmCannotReplyAll")) {
            this._updateContext("irm");
        }

    };

    Mail.Commands.Manager.prototype._onSaSChanged = function () {
        this._updateContext("sasStatus");
    };

    Mail.Commands.Manager.prototype._updateContext = function (contextId) {
        var logString = "_updateContext - context:" + contextId;
        _markStart(logString);
        Debug.assert(Jx.isNonEmptyString(contextId), "The contextId cannot be empty");
        Debug.assert(Jx.isArray(this._updateContextPendingChanges));
        if (this._updateContextPendingChanges.length > 0) {
            // if this context is already in the list, we can skip this
            if (this._updateContextPendingChanges.indexOf(contextId) !== -1) {
                _mark("_updateContext - already queued");
            } else {
                _mark("_updateContext - added");
                this._updateContextPendingChanges.push(contextId);
            }
        } else {
            Debug.assert(this._updateContextJob === null);
            Debug.assert(this._updateContextPendingChanges.length === 0);
            this._updateContextPendingChanges = [contextId];

            this._updateContextJob = Jx.scheduler.addJob(null,
                Mail.Priority.updateCommandContext,
                "Update command context",
                function () {
                    var localContext = this._updateContextPendingChanges.pop();
                    this._onToggleContextChanged(localContext);
                    this._onEnableContextChanged(localContext);
                    var done = this._updateContextPendingChanges.length === 0;
                    if (done) {
                        this._updateContextJob = null;
                    }
                    return Jx.Scheduler.repeat(!done);
                },
                this
            );
        }
        _markStop(logString);
    };

    Mail.Commands.Manager.prototype.completeContextUpdate = function () {
        if (this._updateContextJob) {
            this._updateContextJob.run();
        }
        Debug.assert(this._updateContextJob === null, "update context job not null");
    };

    Mail.Commands.Manager.prototype._onMessagesChanged = function () {
        _markStart("_onMessagesChanged");
        var selection = this._selection;

        _markStart("_onMessagesChanged-cleanup");
        // TODO: This can take a while if selection was very large (1000+ messages)
        // If there are perf concerns, consider disposing the listeners async.
        this._hooks.disposeNow(this._messageListeners);
        this._messageListeners = [];
        this._messageListenerIndex = 0;
        Jx.dispose(this._updateMessageListeners);
        _markStop("_onMessagesChanged-cleanup");

        var selectedCount = selection.messages.length;
        if (selectedCount > 0) {
            this._updateMessageListeners = Jx.scheduler.addJob(null,
                Mail.Priority.updateCommandContext,
                "Update _messageListeners",
                function (messages) {
                    var index = this._messageListenerIndex;
                    Debug.assert(index >= 0);
                    Debug.assert(index < messages.length);
                    this._messageListeners.push(new Mail.EventHook(messages[index], "changed", this._onMessageChanged, this));
                    this._messageListenerIndex++;
                    var done = this._messageListenerIndex === messages.length;
                    if (done) {
                        // It is possible that messages change between evaluating commands and adding listeners.
                        // We have no way to be sure, so we'll just update the selection context again.
                        this._updateContext("selection");
                    }
                    return Jx.Scheduler.repeat(!done);
                },
                this,
                [selection.messages]
            );
            // If we've only got a couple of messages, we can afford to do this synchronously.
            if (selectedCount < 3) {
                this._updateMessageListeners.run();
            }
        }

        if (selection.message) {
            this._messageListeners.push(new Mail.EventHook(selection.message, "changed", this._onMessageChanged, this));
        }
        this._hooks.add(this._messageListeners);

        this._updateContext("selection");
        _markStop("_onMessagesChanged");
    };

    Mail.Commands.Manager.prototype._onToggleContextChanged = function (contextId) {
        Debug.assert(Jx.isNonEmptyString(contextId));
        var logString = "_onToggleContextChanged-" + contextId;
        _markStart(logString);

        // First locate the list of commands affected
        var commandsAffected = this._contextToCommandBinding.toggleContexts[contextId];

        if (Jx.isArray(commandsAffected)) {
            commandsAffected.forEach(function (command) {
                /// <param name="command" type="Mail.Commands.Item"/>
                command.invalidateContextualFields();
                var affectedHosts = this._commandToHostBinding[command.id];
                affectedHosts.forEach(function (commandHost) {
                    commandHost.toggleCommand(command);
                }, this);
            }, this);
        }
        _markStop(logString);
    };

    Mail.Commands.Manager.prototype._onEnableContextChanged = function (contextId) {
        Debug.assert(Jx.isNonEmptyString(contextId));
        var logString = "_onEnableContextChanged-" + contextId;
        _markStart(logString);

        // Generate list of commands effect by all the given context ids
        var commandsAffected = [];
        var commandsForContext = this._contextToCommandBinding.enableContexts[contextId];
        if (Jx.isArray(commandsForContext)) {
            commandsForContext.forEach(function (command) {
                if (commandsAffected.indexOf(command) === -1) {
                    commandsAffected.push(command);
                }
            });
        }

        // Walk each command to see if it should be enabled
        var showHideMatrix = {},
            selection = this._selection;
        commandsAffected.forEach(function (command) {
            /// <param name="command" type="Mail.Commands.Item"/>
            var isEnabled = command.isEnabled(selection);
            var commandId = command.id;
            Debug.only(_mark("_onEnableContextChanged command <" + commandId + "> is now " + ((isEnabled) ? "enabled" : "disabled")));
            var affectedHosts = this._commandToHostBinding[commandId];
            affectedHosts.forEach(function (commandHost) {
                /// <param name="commandHost" type="Mail.Commands.Host"/>
                var hostId = commandHost.id;
                if (!showHideMatrix[hostId]) {
                    showHideMatrix[hostId] = { host: commandHost, show: [], hide: [] };
                }
                if (isEnabled) {
                    showHideMatrix[hostId].show.push(commandId);
                } else {
                    showHideMatrix[hostId].hide.push(commandId);
                }
            });
        }, this);

        // Enable/disable as appropriate
        for (var hostId in showHideMatrix) {
            var host = /*@static_cast(Mail.Commands.Host)*/ showHideMatrix[hostId].host;
            host.updateEnabledLists(showHideMatrix[hostId].show, showHideMatrix[hostId].hide);
            host.showCommands();
        }
        _markStop(logString);
    };

    Mail.Commands.Manager.prototype._registerContext = function (command, contextType) {
        /// <param name="command" type="Mail.Commands.Item"/>
        Debug.assert(Jx.isObject(command), "Why are we registering the context for a null command?");
        Debug.assert(contextType === "toggleContexts" || contextType === "enableContexts");
        if (!Jx.isArray(command[contextType])) {
            return;
        }

        command[contextType].forEach( /*@bind(Mail.Commands.Manager)*/ function (contextId) {
            Mail.Commands.Manager._addToBinding(this._contextToCommandBinding[contextType], contextId, command);
        }, this);
    };

    Mail.Commands.Manager.prototype._registerEnableContext = function (command) {
        /// <param name="command" type="Mail.Commands.Item"/>
        this._registerContext(command, "enableContexts");
    };

    Mail.Commands.Manager.prototype._registerToggleContext = function (command) {
        /// <param name="command" type="Mail.Commands.Item"/>
        if (command.type !== "toggle") {
            return;
        }
        Debug.assert(Jx.isObject(command.toggleContexts), "A toggle button must have a toggle context");
        this._registerContext(command, "toggleContexts");
    };

    Mail.Commands.Manager._addToBinding = function (binding, key, value) {
        /// <param name="binding" type="Object">The map to add the key/value pair to</param>
        /// <param name="key" type="String" />
        /// <param name="value" type="Dynamic" />
        Debug.assert(Jx.isObject(binding));
        Debug.assert(Jx.isNonEmptyString(key));
        Debug.assert(Jx.isObject(value));

        binding[key] = binding[key] || [];
        if (binding[key].indexOf(value) === -1) {
            binding[key].push(value);
        }
    };

    Mail.Commands.Manager.prototype.disableCommands = function (reason) {
        Debug.assert(Jx.isNonEmptyString(reason));
        _markStart("disableAppBar:" + reason);
        var disables = this._disables;
        Debug.assert(disables.indexOf(reason) === -1);
        disables.push(reason);
        if (disables.length === 1) {
            var shortcutManager = this._shortcutManager;
            if (shortcutManager) {
                shortcutManager.disableKeyboardListener();
            }
            var appBar = this._appBar;
            if (appBar) {
                appBar.setEnabled(false);
            }
        }
        _markStop("disableAppBar:" + reason);
    };

    Mail.Commands.Manager.prototype._onSplashScreenDismissed = function () {
        Jx.scheduler.addJob(null, Mail.Priority.commandsEnabled, "CommandManager._onSplashScreenDismissed", this.enableCommands, this, [ "splashscreen" ]);
    };

    Mail.Commands.Manager.prototype.enableCommands = function (reason) {
        Debug.assert(Jx.isNonEmptyString(reason));
        _markStart("enableAppBar:" + reason);
        var disables = this._disables,
            index = disables.indexOf(reason);
        Debug.assert(index !== -1);
        if (index !== -1) {
            disables.splice(index, 1);
            if (disables.length === 0) {
                this._getShortcutManager().enableKeyboardListener();
                var appBar = this._appBar;
                if (appBar) {
                    appBar.setEnabled(true);
                }
            }
        }

        _markStop("enableAppBar:" + reason);
    };

    Mail.Commands.Manager.prototype.onKeyDown = function (e) {
        this._getShortcutManager().onKeyDown(e);
    };

    Mail.Commands.Manager.prototype.registerCommandHost = function (commandHost) {
        /// <param name="commandHost" type="Mail.Commands.Host">The host of the commands</param>
        _markStart("registerCommandHost-" + commandHost.id);
        // input verification
        Debug.assert(Jx.isObject(commandHost));

        // Filter the command list down to those that exist in the current context.
        var commandIds = this._getFactory().filterCommands(commandHost.registeredCommandIds);
        Debug.assert(Jx.isArray(commandIds));
        Debug.assert(commandIds.length > 0);

        // fetch the list of commands
        var commands = commandIds.map(function (commandId) {
            var command = this.getCommand(commandId);
            Debug.assert(Jx.isObject(command), "No command is found with id:<" + commandId + ">");
            return command;
        }.bind(this));


        // register the shortcut for those commands, if not already
        this._getShortcutManager().register(commands);

        var commandsToShow = [];
        var commandsToHide = [];

        // register the command to host bindings
        var selection = this._selection;
        commands.forEach(function (newCommand) {
            /// <param name="newCommand" type="Mail.Commands.Item"/>
            Mail.Commands.Manager._addToBinding(this._commandToHostBinding, newCommand.id, commandHost);
            this._registerEnableContext(newCommand);
            this._registerToggleContext(newCommand);
            if (newCommand.isEnabled(selection)) {
                commandsToShow.push(newCommand.id);
            } else {
                commandsToHide.push(newCommand.id);
            }
        }, this);

        // Activate the UI, ask the host to activate the UI with the list of commands
        commandHost.activateCommands(commands);
        commandHost.updateEnabledLists(commandsToShow, commandsToHide);
        commandHost.showCommands();
        _markStop("registerCommandHost-" + commandHost.id);
    };

    Mail.Commands.Manager.prototype.registerShortcuts = function (commandIds) {
        /// <param type="Array" name="commandIds"></param>
        // fetch the list of commands
        Debug.assert(Jx.isArray(commandIds));
        commandIds = this._getFactory().filterCommands(commandIds);
        Debug.assert(commandIds.length > 0);
        var commands = commandIds.map(function (commandId) {
            var command = this.getCommand(commandId);
            Debug.assert(Jx.isObject(command), "No command is found with id:<" + commandId + ">");
            return command;
        }.bind(this));

        this._getShortcutManager().register(commands);
    };

    Mail.Commands.Manager.prototype.isValidCommandId = function (commandId) {
        /// <param name="commandId" type="String"></param>
        return Jx.isNonEmptyString(commandId) && (commandId in this._getFactory().commands);
    };

    Mail.Commands.Manager.prototype.getCommand = function (commandId) {
        /// <param name="commandId" type="String"></param>
        Debug.assert(this.isValidCommandId(commandId), "invalid commandId: " + commandId);
        return this._getFactory().commands[commandId];
    };

    Mail.Commands.Manager.prototype.executeShortcut = function (shortcut) {
        return this._getShortcutManager().executeShortcut(shortcut);
    };

    Mail.Commands.Manager.prototype.invokeCommand = function (command, uiEntryPoint, event) {
        command.onInvoke(this._selection, uiEntryPoint, event);
    };

    Object.defineProperty(Mail.Commands.Manager.prototype, "appBar", {
        enumerable: true,
        get: function () {
            return this._appBar;
        },
    });

    Mail.showPopupAsync = function (messageDialog) {
        try {
            messageDialog.showAsync();
        } catch (ex) {
            // showAsync() can fail if there is another system popup on the screen. In this case, the failure
            // is expected and the exception should have an HRESULT of E_ACCESSDENIED (-2147024891). If the exception
            // is anything other than E_ACCESSDENIED, this is a new issue that should be investigated.
            Debug.assert(ex.number === -2147024891 /*E_ACCESSDENIED*/);
            if (ex.number !== -2147024891) {
                throw (ex);
            }
        }
    };

    function _mark(s) { Jx.mark("Commands.Manager." + s); }
    function _markStart(s) { Jx.mark("Commands.Manager." + s + ",StartTA,Commands-Manager"); }
    function _markStop(s) { Jx.mark("Commands.Manager." + s + ",StopTA,Commands-Manager"); }

});