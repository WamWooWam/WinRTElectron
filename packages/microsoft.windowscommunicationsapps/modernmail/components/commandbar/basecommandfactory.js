
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global  Jx, Mail, Debug, Microsoft */
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, "BaseFactory", function () {
    "use strict";
    var Commands = Mail.Commands,
        Contexts = Commands.Contexts,
        MailViewType = Microsoft.WindowsLive.Platform.MailViewType;

    Commands.BaseFactory = function () {
        /// This contains the list of the base set of commands.  The commands are declared as object literals known as ItemsOptions, see command.ref.js for details
        var commands = this.commands = {};
        commands.toggleUnread = new Commands.ToggleItem({
            id: "toggleUnread",
            icon: "\uE194",
            useCustomFont: true,
            shortcutLabel: { off: "Ctrl+U", on: "Ctrl+Q" },
            shortcutLabelId: { off: "mailCommandMarkUnreadToolTip", on: "mailCommandMarkReadToolTip" },
            labelLocId: { off: "mailCommandMarkUnreadLabel", on: "mailCommandMarkReadLabel" },
            handler: { off: Commands.Handlers.onMarkAsUnread, on: Commands.Handlers.onMarkAsRead },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            enableContext: ["guiState", "selection", "readStatus"],
            toggleContext: ["selection", "readStatus"],
            isEnabled: Contexts.canChangeReadState,
            isToggledOn: Contexts.hasUnreadMessages,
            dismissAfterInvoke: false
        });
        commands.markUnread = new Commands.Item({
            id: "markUnread",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.u }],
            type: "shortcut",
            handler: Commands.Handlers.onMarkAsUnread,
            enableContext: ["guiState", "selection", "readStatus"],
            isEnabled: function (selection) {
                return Contexts.canChangeReadState(selection) && !Contexts.hasUnreadMessages();
            }
        });
        commands.markRead = new Commands.Item({
            id: "markRead",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.q }],
            type: "shortcut",
            handler: Commands.Handlers.onMarkAsRead,
            enableContext: ["guiState", "selection", "readStatus"],
            isEnabled: function (selection) {
                return Contexts.canChangeReadState(selection) && Contexts.hasUnreadMessages();
            }
        });
        commands.deleteMessage = new Commands.Item({
            id: "deleteMessage",
            icon: "\uE107",
            shortcuts: [{ keyCode: Jx.KeyCode["delete"] }, { control: true, keyCode: Jx.KeyCode.d }],
            shortcutLabel: "Ctrl+D",
            shortcutLabelId: "mailCommandDeleteToolTip",
            labelLocId: "mailCommandDeleteOnItemTooltip",
            type: "button",
            handler: Commands.Handlers.onDeleteButton,
            enableContext: ["guiState", "selection"],
            isEnabled: function () {
                return Contexts.nonEmptySelection() &&
                    Contexts.selectionSupportMoving();
            },
            dismissAfterInvoke: true
        });
        commands.toggleFlag = new Commands.ToggleItem({
            id: "toggleFlag",
            icon: "\uE129",
            shortcutLabel: "Insert",
            shortcutLabelId: { off: "mailCommandFlagToolTip", on: "mailCommandUnflagToolTip" },
            labelLocId: { off: "mailCommandFlagLabel", on: "mailCommandUnflagLabel" },
            handler: { off: Commands.Handlers.applyFlag, on: Commands.Handlers.removeFlag },
            shortcuts: [{ keyCode: Jx.KeyCode.insert }],
            type: "toggle",
            toggleBackground: true,
            enableContext: ["guiState", "selection", "flagStatus"],
            toggleContext: ["selection", "flagStatus"],
            isEnabled: function (selection) {
                return Contexts.nonEmptySelection() &&
                    selection.view.type !== MailViewType.outbox &&
                    // In Search, it is possible to have a non-empty selection that contains non-flaggable messages
                    (Contexts.hasFlaggedMessages() || Contexts.hasUnflaggedMessages());
            },
            isToggledOn: function () {
                return Contexts.hasFlaggedMessages() && !Contexts.hasUnflaggedMessages();
            },
            dismissAfterInvoke: false
        });
        commands.respond = new Commands.Item({
            id: "respond",
            icon: "\uE172",
            shortcuts: [],
            shortcutLabel: "Ctrl+R",
            shortcutLabelId: "mailCommandRespondToolTip",
            type: "button",
            handler: Jx.fnEmpty,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function (selection) {
                return Contexts.singleSelection() &&
                        Contexts.allExceptDraftsAndOutbox(selection) &&
                        !Contexts.draftsAreSelected(selection) &&
                        Contexts.allowResponse(selection) &&
                        Contexts.irmCanRespond();
            },
            dismissAfterInvoke: true
        });
        commands.forward = new Commands.Item({
            id: "forward",
            icon: "\uE172",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.f }, { alt: true, keyCode: Jx.KeyCode.w }],
            labelLocId: "mailCommandForwardLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onForwardButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function (selection) {
                return Contexts.singleSelection() &&
                        Contexts.allExceptDraftsAndOutbox(selection) &&
                        !Contexts.draftsAreSelected(selection) &&
                        Contexts.allowResponse(selection) &&
                        Contexts.irmAllows("irmCanForward");
            },
            dismissAfterInvoke: true
        });
        commands.reply = new Commands.Item({
            id: "reply",
            icon: "\uE172",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.r }, { alt: true, keyCode: Jx.KeyCode.r }],
            labelLocId: "mailCommandReplyLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onReplyButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function (selection) {
                return Contexts.singleSelection() &&
                       Contexts.allExceptDraftsAndOutbox(selection) &&
                        !Contexts.draftsAreSelected(selection) &&
                        Contexts.allowResponse(selection) &&
                        Contexts.irmAllows("irmCanReply");
            },
            dismissAfterInvoke: true
        });
        commands.replyAll = new Commands.Item({
            id: "replyAll",
            icon: "\uE172",
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.r }, { alt: true, keyCode: Jx.KeyCode.l }],
            labelLocId: "mailCommandReplyAllLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onReplyAllButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function (selection) {
                return Contexts.singleSelection() &&
                       Contexts.allExceptDraftsAndOutbox(selection) &&
                        !Contexts.draftsAreSelected(selection) &&
                        Contexts.allowResponse(selection) &&
                        Contexts.irmAllows("irmCanReplyAll");
            },
            dismissAfterInvoke: true
        });
        commands.printMenu = new Commands.Item({
            id: "printMenu",
            icon: "\uE188",
            useCustomFont: true,
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.p }],
            shortcutLabel: "Ctrl+P",
            shortcutLabelId: "mailCommandPrintToolTip",
            labelLocId: "mailCommandPrintLabel",
            type: "button",
            handler: Commands.Handlers.print,
            enableContext: ["guiState", "selection"],
            isEnabled: Contexts.isPrintingEnabled,
            dismissAfterInvoke: true
        });

        
        commands.printDebug = new Commands.Item({
            id: "printDebug",
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.p }],
            type: "shortcut",
            handler: Commands.Handlers.printDebug,
            isEnabled: function () {
                return Contexts.isPrintingEnabled();
            }
        });
        

        commands.save = new Commands.Item({
            id: "save",
            icon: "save",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.s }],
            shortcutLabel: "Ctrl+S",
            shortcutLabelId: "mailCommandSaveToolTip",
            labelLocId: "composeAppBarSaveDraftButton",
            type: "button",
            handler: Commands.Handlers.composeSaveCommand,
            dismissAfterInvoke: true
        });
        commands.saveMoreMenu = new Commands.MenuItem(commands.save, {
            id: "saveMoreMenu"
        });
        commands.clipboardToggle = new Commands.ToggleItem({
            id: "clipboardToggle",
            icon: "paste",
            labelLocId: { off: "composeAppBarPasteLabel", on: "composeAppBarClipboardLabel" },
            shortcutLabelId: { off: "composeAppBarPasteToolTip", on: "composeAppBarClipboardLabel" },
            shortcutLabel: "Ctrl+V",
            handler: {
                off: function () { Commands.Handlers.composeCommand("paste"); },
                on: function () { Commands.FlyoutHandler.onHostButton("clipboardMenu", "clipboardToggle"); }
            },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            toggleContext: ["composeSelection"],
            isToggledOn: Contexts.copyEnabled,
            dismissAfterInvoke: { off: true, on: false }
        });
        commands.paste = new Commands.Item({
            id: "paste",
            icon: "paste",
            shortcuts: [],
            labelLocId: "composeAppBarPasteLabel",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("paste"); },
            dismissAfterInvoke: true
        });
        commands.copy = new Commands.Item({
            id: "copy",
            icon: "copy",
            shortcuts: [],
            labelLocId: "composeAppBarCopyLabel",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("copy"); },
            isEnabled: Contexts.copyEnabled,
            dismissAfterInvoke: true
        });
        commands.font = new Commands.Item({
            id: "font",
            icon: "font",
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontTooltip",
            shortcutLabel: "Ctrl+Shift+F",
            labelLocId: "composeAppBarSetFontLabel",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("fontFlyout", "font"); },
            dismissAfterInvoke: false
        });
        commands.bold = new Commands.ToggleItem({
            id: "bold",
            icon: "bold",
            shortcuts: [],
            shortcutLabelId: "composeAppBarBoldToolTop",
            shortcutLabel: "Ctrl+B",
            labelLocId: "composeAppBarBoldButton",
            type: "toggle",
            toggleBackground: true,
            handler: function () { Commands.Handlers.composeCommand("bold"); },
            toggleContext: ["composeSelection"],
            isToggledOn: function () { return Contexts.composeFormatToggle("bold"); },
            dismissAfterInvoke: false
        });
        commands.italic = new Commands.ToggleItem({
            id: "italic",
            icon: "italic",
            shortcuts: [],
            shortcutLabelId: "composeAppBarItalicToolTip",
            shortcutLabel: "Ctrl+I",
            labelLocId: "composeAppBarItalicButton",
            type: "toggle",
            toggleBackground: true,
            handler: function () { Commands.Handlers.composeCommand("italic"); },
            toggleContext: ["composeSelection"],
            isToggledOn: function () { return Contexts.composeFormatToggle("italic"); },
            dismissAfterInvoke: false
        });
        commands.underline = new Commands.ToggleItem({
            id: "underline",
            icon: "underline",
            shortcuts: [],
            shortcutLabelId: "composeAppBarUnderlineToolTip",
            shortcutLabel: "Ctrl+U",
            labelLocId: "composeAppBarUnderlineButton",
            type: "toggle",
            toggleBackground: true,
            handler: function () { Commands.Handlers.composeCommand("underline"); },
            toggleContext: ["composeSelection"],
            isToggledOn: function () { return Contexts.composeFormatToggle("underline"); },
            dismissAfterInvoke: false
        });
        commands.fontColor = new Commands.Item({
            id: "fontColor",
            icon: "\uE196",
            useCustomFont: true,
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontColorLabel",
            labelLocId: "composeAppBarSetFontColorLabel",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("fontColorFlyout", "fontColor"); },
            dismissAfterInvoke: false
        });
        commands.highlightColor = new Commands.Item({
            id: "highlightColor",
            icon: "\uE198",
            useCustomFont: true,
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontHighlightColorButton",
            labelLocId: "composeAppBarSetFontHighlightColorButton",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("highlightColorFlyout", "highlightColor"); },
            dismissAfterInvoke: false
        });
        commands.emojiCmd = new Commands.Item({
            id: "emojiCmd",
            icon: "emoji2",
            shortcuts: [],
            shortcutLabelId: "composeAppBarEmojiPickerLabel",
            labelLocId: "composeAppBarEmojiPickerLabel",
            type: "button",
            handler: Commands.Handlers.composeEmojiPicker,
            dismissAfterInvoke: false // handler does this on its own.
        });
        commands.emojiMoreMenu = new Commands.MenuItem(commands.emojiCmd, {
            id: "emojiMoreMenu"
        });
        commands.linkToggle = new Commands.ToggleItem({
            id: "linkToggle",
            icon: "link",
            labelLocId: "composeAppBarHyperlinkButton",
            shortcutLabelId: "composeAppBarHyperlinkButton",
            handler: {
                off: function () { Commands.Handlers.composeCommand("showHyperlinkControl"); },
                on: function () { Commands.FlyoutHandler.onHostButton("linkMenu", "linkToggle"); }
            },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            toggleContext: ["composeSelection"],
            isToggledOn: Contexts.composeInLink,
            dismissAfterInvoke: { off: true, on: false }
        });
        commands.addLinkMenuItem = new Commands.Item({
            id: "addLinkMenuItem",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/hyperlinkControl_completionButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("showHyperlinkControl"); },
            enableContext: ["composeSelection"],
            isEnabled: function () { return !Contexts.composeInLink(); },
            dismissAfterInvoke: true
        });
        commands.editLink = new Commands.Item({
            id: "editLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_editLink",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("showHyperlinkControl"); },
            enableContext: ["composeSelection"],
            isEnabled: Contexts.composeInLink,
            dismissAfterInvoke: true
        });
        commands.openLink = new Commands.Item({
            id: "openLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_openLink",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("openLink"); },
            enableContext: ["composeSelection"],
            isEnabled: Contexts.composeInLink,
            dismissAfterInvoke: true
        });
        commands.removeLink = new Commands.Item({
            id: "removeLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_removeLink",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("removeHyperlink"); },
            enableContext: ["composeSelection"],
            isEnabled: Contexts.composeInLink,
            dismissAfterInvoke: true
        });
        commands.editLinkMenu = new Commands.MenuItem(commands.editLink, {
            id: "editLinkMenu"
        });
        commands.openLinkMenu = new Commands.MenuItem(commands.openLink, {
            id: "openLinkMenu"
        });
        commands.removeLinkMenu = new Commands.MenuItem(commands.removeLink, {
            id: "removeLinkMenu"
        });
        commands.directionLtr = new Commands.Item({
            id: "directionLtr",
            icon: "alignleft",
            shortcuts: [],
            labelLocId: "composeAppBarDirectionLtr",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("directionLtr"); },
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage,
            dismissAfterInvoke: true
        });
        commands.directionRtl = new Commands.Item({
            id: "directionRtl",
            icon: "alignright",
            shortcuts: [],
            labelLocId: "composeAppBarDirectionRtl",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("directionRtl"); },
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage,
            dismissAfterInvoke: true
        });
        commands.directionSeperator = new Commands.Item({
            id: "directionSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage
        });
        commands.linkSeperator = new Commands.Item({
            id: "linkSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
        });
        commands.fontSeparator = new Commands.Item({
            id: "fontSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
        });
        commands.formatSeparator = new Commands.Item({
            id: "formatSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
        });
        commands.listMenu = new Commands.Item({
            id: "listMenu",
            icon: "list",
            shortcuts: [],
            shortcutLabelId: "composeAppBarListsButton",
            labelLocId: "composeAppBarListsButton",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("listMenu", "listMenu"); },
            dismissAfterInvoke: false
        });
        commands.bulletsMenuItem = new Commands.Item({
            id: "bulletsMenuItem",
            icon: "list",
            shortcuts: [],
            labelLocId: "composeAppBarBulletsButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("bullets"); },
            dismissAfterInvoke: true
        });
        commands.numberingMenuItem = new Commands.Item({
            id: "numberingMenuItem",
            icon: "list",
            shortcuts: [],
            labelLocId: "composeAppBarNumberingButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("numbers"); },
            dismissAfterInvoke: true
        });
        commands.clearFormatting = new Commands.Item({
            id: "clearFormatting",
            icon: "clear",
            shortcuts: [],
            labelLocId: "composeAppBarClearFormattingButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("clearFormatting"); },
            dismissAfterInvoke: true
        });
        commands.undo = new Commands.Item({
            id: "undo",
            icon: "undo",
            shortcuts: [],
            labelLocId: "composeAppBarUndoButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("undo"); },
            dismissAfterInvoke: true
        });
        commands.redo = new Commands.Item({
            id: "redo",
            icon: "redo",
            shortcuts: [],
            labelLocId: "composeAppBarRedoButton",
            type: "button",
            handler: function () { Commands.Handlers.composeCommand("redo"); },
            dismissAfterInvoke: true
        });
        commands.composeMoreMenu = new Commands.Item({
            id: "composeMoreMenu",
            icon: "more",
            shortcuts: [],
            labelLocId: "composeAppBarEllipseLabel",
            shortcutLabelId: "composeAppBarEllipseLabel",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("composeMoreMenu", "composeMoreMenu"); },
            dismissAfterInvoke: false
        });
        Debug.only(
            commands.debugSnapshot = new Commands.Item({
                id: "debugSnapshot",
                icon: "D",
                shortcuts: [{ control: true, keyCode: Jx.KeyCode["1"] }],
                type: "button",
                labelLocId: "mail_useingCachedLabel",
                handler: function () { return Mail.SnapshotMenu(); }, // SnapshotMenu is delay loaded, so can't reference it durring app initialization
                dismissAfterInvoke: true
            }),
            commands.debugSnapshot._cachedLabel = "Debug Menu" 
        );
    };

    /*jshint laxcomma:true*/
    Commands.BaseFactory.prototype = {
        filterCommands: function (commandArray) {
            var filteredCommands = [];
            commandArray.forEach(function (command) {
                Debug.assert(Jx.isNonEmptyString(command));
                if (this.commands[command]) {
                    filteredCommands.push(command);
                } else {
                    Mail.log("Filtering out command: " + command);
                }
            }, this);
            return filteredCommands;
        }

        
        ,_verifyCommands: function () {
            function verifyCalShortcut(shortcut) {
                if (shortcut.alt) {
                    Debug.assert(shortcut.keyCode !== Jx.KeyCode.c);
                    Debug.assert(shortcut.keyCode !== Jx.KeyCode.t);
                    Debug.assert(shortcut.keyCode !== Jx.KeyCode.d);
                }
            }
            for (var commandId in this.commands) {
                var command = /*@dynamic*/ this.commands[commandId];
                Debug.assert(commandId === command.id);
                // verify that the calendar invite shortcuts are not used here
                if (command.shortcuts) {
                    command.shortcuts.forEach(verifyCalShortcut);
                }
            }
        }
        
    };
    /*jshint laxcomma:false*/

});

