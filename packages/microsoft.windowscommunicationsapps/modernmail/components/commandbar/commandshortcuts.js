
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global  Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, "ShortcutManager", function () {
    "use strict";

    Mail.Commands.ShortcutManager = function (selection) {
        this._selection = selection;

        // Register the global keyHandler in the mail App
        this._shortcuts = {}; // A map, with the key being the index and the value as a [{shortCutKey, command}, ... ]
        var appRoot = document.getElementById(Mail.CompApp.rootElementId);
        Debug.assert(Jx.isHTMLElement(appRoot), "Cannot locate the HTML Element<idCompApp> to register the keyboard handler to");

        this._disposer = new Mail.Disposer(
            new Mail.EventHook(appRoot, "keydown", this.onKeyDown, this),
            new Mail.EventHook(appRoot, "MSPointerUp", this._onMSPointerUp, this),
            Mail.EventHook.createGlobalHook("mail-messageList-keydown", this._onListViewKeyDown, this)
        );

        this._isEnabled = true;

        Debug.only(Object.seal(this));
    };

    Mail.Commands.ShortcutManager.prototype.dispose  = function () {
        this._disposer.dispose();
        this._disposer = null;
    };

    Mail.Commands.ShortcutManager.prototype._onMSPointerUp = function (pointerEvent) {
        /// <summary>
        /// This function exist to hook the mouse back button, which is exposed by HIP as event.button === 3
        /// on the MSPointerUp Event.  Upon the back button is clicked, we translate it to a browserBack shortcutItem
        /// </summary>
        if (pointerEvent.button === 3 /* The mouse back button*/) {
            var shortcutItem =  {
                control : false,
                shift : false,
                keyCode : Jx.KeyCode.browserback,
                alt : false
            };
            this.executeShortcut(shortcutItem, pointerEvent);
            pointerEvent.preventDefault();
            pointerEvent.stopPropagation();
            pointerEvent.stopImmediatePropagation();
        }
    };

    Mail.Commands.ShortcutManager.prototype._onListViewKeyDown = function (/*@dynamic*/ evt) {
        Debug.assert(Jx.isObject(evt));
        Debug.assert(Jx.isObject(evt.data));
        Debug.assert(Jx.isValidNumber(evt.data.keyCode));
        this.onKeyDown(evt.data);
    };

    Mail.Commands.ShortcutManager.prototype.enableKeyboardListener = function () {
        this._isEnabled = true;
    };

    Mail.Commands.ShortcutManager.prototype.disableKeyboardListener = function () {
        this._isEnabled = false;
    };

    Mail.Commands.ShortcutManager.prototype.register = function (newCommands) {
        /// <param name="newCommands" type="Array">List of newCommands to register</param>
        Debug.assert(Jx.isArray(newCommands));
        newCommands.forEach(/*@bind(Mail.Commands.ShortcutManager)*/ function (/*@type(Mail.Commands.Item)*/ newCommand) {
            var newShortcuts = /*@static_cast(Array)*/ newCommand.shortcuts;
            newShortcuts.forEach( /*@bind(Mail.Commands.ShortcutManager)*/ function (/*@type(Mail.Commands.ShortcutItem)*/ newShortcut) {
                var newShortcutKeyCode = newShortcut.keyCode;
                // normalize the shift/ctrl/alt modifiers
                newShortcut.shift = Boolean(newShortcut.shift);
                newShortcut.control = Boolean(newShortcut.control);
                newShortcut.alt = Boolean(newShortcut.alt);

                if (!(newShortcutKeyCode in this._shortcuts)) {
                    // Create the entry if it does not exist yet
                    this._shortcuts[newShortcutKeyCode] = [];
                }

                /// Check for duplicates
                var existingEntries = /*@static_cast(Array)*/this._shortcuts[newShortcutKeyCode];
                Debug.assert(Jx.isArray(existingEntries));
                var isUnique = existingEntries.every(function (existingEntry) {
                    /// <param name="existingEntry" type="Mail.Commands.ShortcutEntry"/>
                    var existingCommand = /*@static_cast(Mail.Commands.Item)*/existingEntry.command;

                    if (Mail.Commands.ShortcutManager._areModifiersEqual(existingEntry.shortcut, newShortcut) &&
                        (newCommand.id === existingCommand.id)) {
                        Debug.Mail.log("Not registering the shortcut for command:" + newCommand.id + " because it is already registered");
                        return false;
                    }
                    return true;
                });
                if (isUnique) {
                    this._shortcuts[newShortcutKeyCode].push({ shortcut: newShortcut, command: newCommand });
                }
            }, this);
        }, this);
    };

    Mail.Commands.ShortcutManager.prototype._findCommandsByShortcut = function (shortcutItem) {
        /// <param name="shortcutItem" type="Mail.Commands.ShortcutItem"/>
        /// <return type="Array">An array of Mail.Commands.Items that are registered with shortcutItem</return>
        Debug.assert(Jx.isObject(shortcutItem));
        var matchingCandidates = /*@static_cast(Array)*/this._shortcuts[shortcutItem.keyCode];
        var matchedCommands = [];
        if (Jx.isArray(matchingCandidates)) {
            matchingCandidates.forEach(function (shortcutEntry) {
                /// <param name="shortcutEntry" type="Mail.Commands.ShortcutEntry"/>
                var shortcut = shortcutEntry.shortcut;
                Debug.assert(Jx.isObject(shortcut), "The shortcut property of the shortcutEntry cannot be null");
                Debug.assert(shortcutItem.keyCode === shortcut.keyCode, "The shortcut key should match here");

                if (Mail.Commands.ShortcutManager._areModifiersEqual(shortcut, shortcutItem)) {
                    var command = shortcutEntry.command;
                    Debug.assert(Jx.isObject(command));
                    matchedCommands.push(command);
                }
            });
        }
        return matchedCommands;
    };

    function ignoreShortcutInEditableFields(e) {
        ///<summary>
        /// Ignore keyboard shortcuts without modifiers when the focus is on an editable field.
        /// When the user hits the delete key in an editable field (e.g. new folder flyout or address well), we don't want to execute the shortcut to delete the selected message.
        /// However, we would still want shortcuts like Ctrl+O or Ctrl+D to work
        ///</summary>
        ///<returns>True if the shortcut should be ignored</returns>
        Debug.assert(Jx.isObject(e));
        if (e.altKey || e.shiftKey || e.ctrlKey) {
            // If the keydown event has modifiers, do not ignore the event
            return false;
        }
        var activeElement = document.activeElement;
        if (!activeElement) {
            return false;
        }
        return Mail.isElementEditable(activeElement);
    }

    Mail.Commands.ShortcutManager.prototype.onKeyDown = function (e) {
        /// <param name="e" type="Event" />
        if (!this._isEnabled) {
            return;
        }

        // Ignore state changes in modifier keys
        if ((e.keyCode === Jx.KeyCode.alt) || (e.keyCode === Jx.KeyCode.shift) || (e.keyCode === Jx.KeyCode.ctrl)) {
            return;
        }

        // Ignore keyboard shortcuts without modifiers when the focus is on an editable field
        if (ignoreShortcutInEditableFields(e)) {
            return;
        }

        Debug.assert(Jx.isObject(e), "Why the keyboard event empty?");
        var shortcutItem = Mail.Commands.ShortcutManager.mapKeyEvents(e);
        if (this.executeShortcut(shortcutItem, e)) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

        }
    };

    Mail.Commands.ShortcutManager.prototype.executeShortcut = function (shortcutItem, event) {
        /// <return type="Boolean">Return true if any of the commands triggered by the shortcut is handled</return>
        Debug.assert(Jx.isObject(shortcutItem));

        if (!this._isEnabled) {
            return false;
        }

        var commands = this._findCommandsByShortcut(shortcutItem),
            isHandled = false;

        for (var i = 0, iMax = commands.length; i < iMax; i++) {
            var command = /*@static_cast(Mail.Commands.Item)*/commands[i];
            if (command.isEnabled(this._selection)) {
                Debug.Mail.log("Executing command : " + command.id);
                try {
                    command.onInvoke(this._selection, Mail.Instrumentation.UIEntryPoint.keyboardShortcut, event);
                } catch (e) {
                    var message = "Error in executing command " + String(command.id) + " due to " + e.message;
                    Debug.assert(false, message);
                    Jx.log.exception(message, e);
                }

                /// regardless of whether we succeeded or failed, we are the one that is responsible for handling the command
                isHandled = true;
            }
        }

        return isHandled;
    };

    Mail.Commands.ShortcutManager._areModifiersEqual = function (shortcut1, shortcut2) {
        /// <param name="shortcut1" type="Mail.Commands.ShortcutItem"></param>
        /// <param name="shortcut2" type="Mail.Commands.ShortcutItem"></param>
        /// <return type="Boolean">return true if the modifiers are equal</return>
        return shortcut1.shift === shortcut2.shift && shortcut1.control === shortcut2.control && shortcut1.alt === shortcut2.alt;
    };

    Mail.Commands.ShortcutManager.mapKeyEvents = function (e) {
        /// <summary>
        /// Since the iframe in the reading pane swallows all keyboard events, we create an event handler in the iframe and re-raise the event every time we get a key up event
        /// However, due to a trident bug, the keyCode is often set incorrectly when the event is re-raised.
        /// This function maps the DOM keydown event into our custom struct to workaround the trident bug
        ///</summary>
        /// <param name="e" type="Event" />
        /// <return type="Mail.Commands.ShortcutItem"/>
        Debug.assert(Jx.isObject(e), "Why the keyboard event empty?");
        if (Jx.isNonEmptyString(e.key)) {
            Debug.assert(e.keyCode !== 0);
        }

        return {shift: e.shiftKey, control: e.ctrlKey, keyCode: e.keyCode, alt : e.altKey};
    };
});
