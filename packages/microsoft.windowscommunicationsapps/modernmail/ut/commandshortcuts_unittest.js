
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
//

/*global Mail, Tx, Jx */
(function () {

    function setup(tc) {
        var controls = ["idCompApp"]; // For registering the shortcuts
        tc.cleanup = function () {
            Mail.UnitTest.disposeGlobals();
            Mail.UnitTest.restoreJx();
            Mail.UnitTest.removeElements(controls);
        };

        Mail.UnitTest.stubJx(tc, "activation");
        Mail.UnitTest.stubJx(tc, "appData");
        Mail.UnitTest.initGlobals(tc);
        Mail.UnitTest.addElements(tc, controls);
        Mail.CompApp = Mail.CompApp || {};
        Mail.CompApp.rootElementId = Mail.CompApp.rootElementId || "idCompApp";
    }

    Tx.test("CommandShortcuts_UnitTest.findShortcutByCommand", { owner: "jamima"}, function (tc) {
        setup(tc);

        /// Test our custom shortcut mapping
        var factory = new Mail.Commands.Factory(new Mail.MockGlomManager()),
            shortcutManager = new Mail.Commands.ShortcutManager(),
            commands = [];

        /// Create an array that contains all commands in the factory
        for (var id in factory.commands) {
            commands.push(factory.commands[id]);
        }

        /// check for the unknown commands when no commands have be registered yet
        var markAsRead = shortcutManager._findCommandsByShortcut({control: true, shift: false, key: "Q"});
        tc.areEqual(markAsRead.length, 0, "FindCommandByShortcut should return null when no commands have been registered yet");


        /// Register those to the command factory
        shortcutManager.register(commands);

        function printShortcut(shortcut) {
            var result = [];
            if (shortcut.control) {
                result.push("Ctrl");
            }

            if (shortcut.shift) {
                result.push("Shift");
            }

            result.push(shortcut.key);
            return result.join("+");
        }

        function compareShortcuts(shortcut1, shortcut2) {
            return (shortcut1.shift === shortcut2.shift) &&
                   (shortcut1.alt === shortcut2.alt) &&
                   (shortcut1.control === shortcut2.control) &&
                   (shortcut1.keyCode === shortcut2.keyCode);
        }

        var ctrlJ = {
                shift: false,
                alt: false,
                control: true,
                keyCode: 74
            },
            f5 = {
                shift: false,
                alt: false,
                control: false,
                keyCode: 116
            },
            escape = {
                shift: false,
                alt: false,
                control: false,
                keyCode: 27
            };

        /// for each command, try to find it by shortcut
        commands.forEach(function(command) {
            var shortcuts = command.shortcuts;
            tc.isTrue(Jx.isArray(command.shortcuts) || Jx.isNullOrUndefined(command.shortcuts));
            if (Jx.isArray(shortcuts)) {
                shortcuts.forEach(function(shortcutItem) {
                    var commandsFound = shortcutManager._findCommandsByShortcut(shortcutItem),
                        found = false;
                    commandsFound.forEach(function (commandFound) {
                        if (commandFound.id === command.id) {
                            found = true;
                        }
                    });

                    if (commandsFound.length > 1) {
                        tc.isTrue(
                            compareShortcuts(shortcutItem, ctrlJ) ||
                            compareShortcuts(shortcutItem, f5) ||
                            compareShortcuts(shortcutItem, escape),
                            "Before you add new overloaded shortcuts, please let the Mail app dev team know."
                        );
                    }

                    tc.isTrue(found, "Cannot map shortcut " + printShortcut(shortcutItem) + " to the command " + command.id);
                });
            }
        });

        /// check for the unknown commands
        var unknown = shortcutManager._findCommandsByShortcut({control: true, shift: true, key: "J"});
        tc.areEqual(unknown.length, 0, "FindCommandByShortcut should return null for unknown shortcuts");

    });

})();
