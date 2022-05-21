
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,WinJS,Tx,Microsoft*/

(function () {

    var sandbox,
        commandExecuted,
        commandValue,
        selection,
        glomManager,
        mockOnEdit;
    
    function setup(tc) {
        Mail.guiState = {
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            ensureNavMessageList: Jx.fnEmpty
        };
        Jx.bici = {
            addToStream: Jx.fnEmpty
        };
        Mail.Globals.commandManager = {
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty,
            getContext: function () {
                return {
                    getSelectionStyles: function () {
                        return {
                            fontSize: "18px",
                            fontFamily: '"Color Emoji", "Fun times"'
                        };
                    },
                    fireCommandEvent: Jx.fnEmpty,
                    getCanvasDocument: function () { return document; },
                    addListener: Jx.fnEmpty
                };
            },
            invokeCommand: function (command) {
                commandExecuted = command.id;
            },
            registerCommandHost: function (cmdHost) {

                var commandIds = cmdHost.registeredCommandIds;
                tc.isTrue(Jx.isArray(commandIds));
                tc.isTrue(commandIds.length > 0);

                var commands = commandIds.map(function (commandId) {
                    tc.isTrue(Jx.isNonEmptyString(commandId));
                    var command = { id: commandId, getOption: function () { return { id: commandId }; } };
                    return command;
                });

                cmdHost.activateCommands(commands);
                cmdHost.updateEnabledLists(commandIds, []);
                cmdHost.showCommands();
            },
            showAppBar: function () {
                return WinJS.Promise.wrap(null);
            },
            hideAppBar: Jx.fnEmpty,
        };
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);
        sandbox.innerHTML = "<div id='idCompApp'><button id='flyoutButton'></button></div>";
        selection = {
            message: { 
                isDraft: false,
                hasDraft: false,
                canMoveFromOutboxToDrafts: true,
                moveFromOutboxToDraftsAndCommit: Jx.fnEmpty,
            },
            account: {
                draftsView: null,
                platformObject: {
                    displayName: "displayName",
                    mockedType: Microsoft.WindowsLive.Platform.Account,
                    iconType: 1,
                    getServerByType: function () {
                        return { server: "live.com" };
                    }
                }
            },
            updateNav: Jx.fnEmpty,
            view: {
                getLaunchArguments: function () {
                    return JSON.stringify({ type: 4, viewType: 2});
                },
                name: "viewName"
            },
            deleteItems: function (value) {
                commandExecuted = "deleteItems";
                commandValue = value;
            }
        };
        selection.messages = [selection.message];
        glomManager = {
            handleCommandBarNewChild: function () {
                commandExecuted = "handleCommandBarNewChild";
                commandValue = null;
            }
        };
        commandExecuted = null;
        commandValue = null;
        mockOnEdit = Mail.Utilities.ComposeHelper.onEdit;
        Mail.Utilities.ComposeHelper.onEdit = function (message) {
            commandExecuted = "onEdit";
            commandValue = message;
        };
        WinJS.UI.disableAnimations();
        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            Mail.Utilities.ComposeHelper.onEdit = mockOnEdit;
            WinJS.UI.enableAnimations();
        };
    }

    Tx.test("CommandsHandlers.edit", function (tc) {
        setup(tc);

        Mail.Commands.Handlers.edit(selection, glomManager);
        tc.areEqual(commandExecuted, "onEdit", "command");
        tc.areEqual(commandValue, selection.message, "value");

        selection.message.isDraft = true;
        Mail.Commands.Handlers.edit(selection, glomManager);

        tc.areEqual(commandExecuted, "handleCommandBarNewChild", "command");
        tc.areEqual(commandValue, null, "value");
    });

    Tx.test("CommandsHandlers.onPinFolder", function (tc) {
        setup(tc);

        // Just execute these to check for exceptions
        Mail.Commands.Handlers.onPinFolder(selection, "flyoutButton");
        Mail.Commands.Handlers.unpinFolder("4_2", "flyoutButton");
    });

    Tx.test("CommandsHandlers.onDeleteButton", function (tc) {
        setup(tc);

        // Just execute these to check for exceptions
        Mail.Commands.Handlers.onDeleteButton(selection, 1);

        tc.areEqual(commandExecuted, "deleteItems", "command");
        tc.areEqual(commandValue, selection.messages, "value");
    });

})();
