
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,WinJS,Tx*/

(function () {

    var sandbox,
        commandExecuted,
        commandValue,
        composeCommandMock;

    function setup(tc) {
        Mail.guiState = {
            addListener: Jx.fnEmpty,
            removeListener: Jx.fnEmpty
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
            }
        };
        sandbox = document.createElement("div");
        document.body.appendChild(sandbox);
        sandbox.innerHTML = "<div id='idCompApp'><button id='flyoutButton'></button></div>";
        commandExecuted = null;
        commandValue = null;
        WinJS.UI.disableAnimations();
        composeCommandMock = Mail.Commands.Handlers.composeCommand;
        Mail.Commands.Handlers.composeCommand = function (command, value) {
            commandExecuted = command;
            commandValue = value;
        };
        tc.cleanup = function () {
            sandbox.removeNode(true);
            sandbox = null;
            Mail.Commands.Handlers.composeCommand = composeCommandMock;
            WinJS.UI.enableAnimations();
        };
    }

    Tx.test("ComposeFlyouts.testFontColorFlyout", function (tc) {
        setup(tc);
        var flyout = Mail.Commands.FlyoutHandler.ensureFlyout("fontColorFlyout");
        Mail.Commands.FlyoutHandler.onHostButton("fontColorFlyout", "flyoutButton", true);
        var whiteButton = document.querySelector('.whiteButton').parentNode;
        flyout._fontColorControl.value = "#000000";
        flyout._fontColorControl._onClick({ target: whiteButton });
        flyout._fontColorControl._onMutation([{ target: flyout._fontColorControl._selectedButton }, { target: whiteButton }]);
        tc.areEqual(commandExecuted, "setFontColor", "command");
        tc.areEqual(commandValue, "#FFFFFF", "value");
    });

    Tx.test("ComposeFlyouts.testFontFlyout", function (tc) {
        setup(tc);

        var flyout = Mail.Commands.FlyoutHandler.ensureFlyout("fontFlyout"),
            _showFontListener = flyout._showFontListener;

        flyout._showFontListener = Jx.fnEmpty;

        Mail.Commands.FlyoutHandler.onHostButton("fontFlyout", "flyoutButton", true);
        _showFontListener.apply(flyout);
        tc.areEqual(flyout._fontNameControl.value, "Fun times", "init value");
        tc.areEqual(flyout._fontSizeControl.value, "14pt", "init value");

        flyout._fontSizeControl.value = 36;
        flyout._fontSizeControl._onChange({});

        tc.areEqual(commandExecuted, "setFontSize", "command");
        tc.areEqual(commandValue, "36pt", "value");
    });

    Tx.test("ComposeFlyouts.testComposeMoreMenu", function (tc) {
        setup(tc);
        var flyout = Mail.Commands.FlyoutHandler.ensureFlyout("composeMoreMenu");
        Mail.Commands.FlyoutHandler.onHostButton("composeMoreMenu", "flyoutButton", true);
        document.getElementById('addLinkMenuItem').click();
        flyout._afterHide();
        tc.areEqual(commandExecuted, "addLinkMenuItem", "command");
    });

})();
