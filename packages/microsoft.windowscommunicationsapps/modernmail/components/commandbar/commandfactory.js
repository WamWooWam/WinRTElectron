
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global  Jx,Mail,Debug,Microsoft,SasManager*/
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, ["Factory", "ParentFactory"], function () {
    "use strict";
    var Commands = Mail.Commands,
        Contexts = Commands.Contexts,
        MailViewType = Microsoft.WindowsLive.Platform.MailViewType;

    Commands.Factory = /* @constructor*/function (glomManager) {
        Debug.assert(Jx.isInstanceOf(glomManager, Mail.GlomManager));
        Commands.BaseFactory.call(this);
        /// This contains the list of all possible commands.  The commands are declared as object literals known as ItemsOptions, see command.ref.js for details
        var commands = this.commands;
        commands.compose = new Commands.Item({
            id: "compose",
            icon: "\uE109",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.n }],
            shortcutLabel: "Ctrl+N",
            shortcutLabelId: "mailCommandComposeToolTip",
            type: "button",
            handler: function (selection, uiEntryPoint) { Mail.Utilities.ComposeHelper.onNewButton(uiEntryPoint); },
            enableContext: ["accountState", "selection"],
            isEnabled: Contexts.doesAccountSupportMail,
            dismissAfterInvoke: true
        });
        commands.move = new Commands.Item({
            id: "move",
            icon: "\uE19C",
            shortcuts: [],
            shortcutLabel: "Ctrl+M",
            shortcutLabelId: "mailCommandMoveToolTip",
            labelLocId: "mailCommandMoveLabel",
            type: "flyout",
            handler: function (selection, uiEntryPoint) { Commands.Handlers.onMoveButton(selection, uiEntryPoint, "move"); },
            enableContext: ["selection", "guiState"],
            isEnabled: function (selection) {
                return Contexts.nonEmptySelection() &&
                    Mail.ViewCapabilities.canMoveFrom(selection.view) &&
                    Contexts.selectionSupportMoving();
            },
            dismissAfterInvoke: false
        });
        commands.moveShortcut = new Commands.Item({
            id: "moveShortcut",
            type: "shortcut",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.m }, { control: true, shift: true, keyCode: Jx.KeyCode.v }],
            handler: function (selection, uiEntryPoint) { Commands.Handlers.onMoveButton(selection, uiEntryPoint, "move"); },
            isEnabled: function (selection) {
                return !Contexts.composeInFocus() && commands.move.isEnabled(selection);
            },
        });
        commands.moveMenu = new Commands.MenuItem(commands.move, {
            id: "moveMenu",
            handler: function (selection, uiEntryPoint) { Commands.Handlers.onMoveButton(selection, uiEntryPoint, "moreMenu"); },
        });
        commands.sweep = new Commands.Item({
            id: "sweep",
            icon: "\uE18D",
            useCustomFont: true,
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.s }],
            shortcutLabel: "Ctrl+Shift+S",
            shortcutLabelId: "mailCommandSweepToolTip",
            labelLocId: "mailCommandSweepLabel",
            type: "flyout",
            handler: Mail.SweepFlyout.onSweepButton,
            enableContext: ["selection", "guiState", "isSearching"],
            isEnabled: function (selection) {
                return Contexts.selectedMessagesSupportSweep(selection) &&
                    Mail.ViewCapabilities.supportsSweep(selection.view) &&
                    !Mail.SearchHandler.isSearchingAllViews;
            },
            dismissAfterInvoke: false
        });
        commands.sweepMenu = new Commands.MenuItem(commands.sweep, {
            id: "sweepMenu"
        });
        commands.folderOperations = new Commands.Item({
            id: "folderOperations",
            icon: "\uE19A",
            useCustomFont: true,
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.e }],
            shortcutLabel: "Ctrl+Shift+E",
            shortcutLabelId: "mailCommandFolderOperationsToolTip",
            labelLocId: "mailCommandFolderOperationsLabel",
            type: "flyout",
            handler: function (selection) { Commands.FolderOperations.onFolderOptionsButton("folderOperations", selection); },
            enableContext: ["resourceState", "guiState", "isSearching", "folderChange"],
            isEnabled: Commands.FolderOperations.folderOperationsEnabled,
            dismissAfterInvoke: false
        });
        commands.folderOperationsMenu = new Commands.MenuItem(commands.folderOperations, {
            id: "folderOperationsMenu",
            handler: function (selection) { Commands.FolderOperations.onFolderOptionsButton("moreMenu", selection); }
        });
        commands.syncMenu = new Commands.Item({
            id: "syncMenu",
            icon: "\uE117",
            shortcuts: [{ keyCode: Jx.KeyCode.f5 }],
            shortcutLabel: "F5",
            shortcutLabelId: "mailCommandSyncToolTip",
            labelLocId: "mailCommandSyncLabel",
            type: "button",
            handler: Commands.Handlers.onSyncButton,
            dismissAfterInvoke: false
        });
        commands.toggleSelectionMode = new Commands.ToggleItem({
            id: "toggleSelectionMode",
            icon: Jx.isRtl() ? "\uE1EF" : "\uE133",
            shortcuts: [], // No shortcut spec'ed
            shortcutLabelId: { off: "mailCommandEnterSelectionModeToolTip", on: "mailCommandExitSelectionModeToolTip" },
            labelLocId: "mailCommandSelectionModeLabel",
            handler: Commands.Handlers.onToggleSelectionMode,
            type: "toggle",
            toggleBackground: true,
            toggleContext: ["selectionMode"],
            enableContext: ["selection", "isSearching", "guiState"],
            isEnabled: function () {
                return Contexts.nonEmptySelection() &&
                    Contexts.supportMultiSelect() &&
                    Contexts.isMessageListActive();
            },
            isToggledOn: function () {
                return Mail.SelectionHandler.isSelectionMode;
            },
            dismissAfterInvoke: false
        });
        commands.toggleSelectionModeMenu = new Commands.ToggleMenuItem(commands.toggleSelectionMode, {
            id: "toggleSelectionModeMenu"
        });
        commands.pinFolder = new Commands.Item({
            id: "pinFolder",
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode["!"] }],
            type: "shortcut",
            handler: Commands.Handlers.onPinFolder,
            isEnabled: function (selection) {
                return !Contexts.composeInFocus() &&
                    Contexts.showPin(selection) &&
                    Contexts.allowFolderOperations(selection);
            },

            enableContext: ["showAppBar", "folderChange", "pinnedFolder", "guiState"]
        });
        commands.nextMessage = new Commands.Item({
            id: "nextMessage",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.period }],
            type: "shortcut",
            handler: Commands.Handlers.showNextMessage
        });
        commands.prevMessage = new Commands.Item({
            id: "prevMessage",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode[","] }],
            type: "shortcut",
            handler: Commands.Handlers.showPreviousMessage
        });
        commands.applyAllFilter = new Commands.Item({
            id: "applyAllFilter",
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.a }],
            type: "shortcut",
            handler: Commands.Handlers.applyAllFilter,
            isEnabled: Contexts.allowFilterSwitch
        });
        commands.applyUnreadFilter = new Commands.Item({
            id: "applyUnreadFilter",
            shortcuts: [{ control: true, shift: true, keyCode: Jx.KeyCode.u }],
            type: "shortcut",
            handler: Commands.Handlers.applyUnreadFilter,
            isEnabled: Contexts.allowFilterSwitch
        });
        commands.reapplyFilter = new Commands.Item({
            id: "reapplyFilter",
            shortcuts: [{ keyCode: Jx.KeyCode.f5 }],
            type: "shortcut",
            handler: Commands.Handlers.reapplyFilter,
            isEnabled: Contexts.allowFilterSwitch
        });
        commands.enterSearch = new Commands.Item({
            id: "enterSearch",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.e }],
            shortcutLabel: "Ctrl+E",
            shortcutLabelId: "mailMessageListStartSearchTooltip",
            type: "shortcut",
            handler: Mail.SearchHandler.enterSearch,
            isEnabled: function () {
                return !Mail.SearchHandler.isSearching && !Mail.SearchHandler.isSearchHeaderVisible;
            }
        });
        commands.dismissSearch = new Commands.Item({
            id: "dismissSearch",
            shortcuts: [{ keyCode: Jx.KeyCode.escape }],
            shortcutLabel: "Escape",
            shortcutLabelId: "mailMessageListCancelSearchTooltip",
            type: "shortcut",
            handler: Mail.SearchHandler.dismissSearch,
            isEnabled: function () {
                return Mail.SearchHandler.isSearching || Mail.SearchHandler.isSearchHeaderVisible;
            }
        });
        commands.exitSelectionMode = new Commands.Item({
            id: "exitSelectionMode",
            shortcuts: [{ keyCode: Jx.KeyCode.escape }],
            type: "shortcut",
            handler: Mail.SelectionHandler.exitSelectionMode,
            isEnabled: function () {
                return Mail.SelectionHandler.isSelectionMode;
            }
        });
        commands.back = new Commands.Item({
            id: "back",
            icon: "\uE0D5",
            shortcuts: [{ alt: true, keyCode: (Jx.isRtl() ? Jx.KeyCode.rightarrow : Jx.KeyCode.leftarrow) }, { keyCode: Jx.KeyCode.browserback }, { keyCode: Jx.KeyCode.backspace }, { keyCode: Jx.KeyCode.escape }],
            shortcutLabel: (Jx.isRtl() ? "Alt + RightArrow" : "Alt + LeftArrow"),
            shortcutLabelId: "composeAppBarBackTooltip",
            labelLocId: "mailCommandBackLabel",
            type: "button",
            handler: Mail.Globals.animator.animateNavigateBack,
            dismissAfterInvoke: true
        });
        Debug.assert(Jx.isFunction(glomManager.handleCommandBarNewChild));
        commands.newChildWindow = new Commands.Item({
            id: "newChildWindow",
            icon: "\uE17C",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.o }],
            shortcutLabel: "Ctrl+O",
            shortcutLabelId: "mailNewChildWindowButtonTooltip",
            labelLocId: "mailNewChildWindowButton",
            type: "button",
            handler: function (selection) { Mail.Commands.Handlers.newChildWindow(selection, glomManager.handleCommandBarNewChild.bind(glomManager)); },
            enableContext: ["selection", "guiState"],
            isEnabled: Contexts.singleSelection,
            dismissAfterInvoke: true,
            noAnimationOnDismiss: true // BLUE:488066 - The resize reflow causes animation gliches in appbar
        });
        commands.edit = new Commands.Item({
            id: "edit",
            icon: "\uE104",
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.t }],
            shortcutLabel: "Ctrl+T",
            shortcutLabelId: "mailCommandEditToolTip",
            type: "button",
            handler: function (selection) { Commands.Handlers.edit(selection, glomManager); },
            enableContext: ["guiState", "selection"],
            isEnabled: function () {
                return Contexts.singleSelection() &&
                       Contexts.selectionSupportsEditCommand() &&
                       Contexts.isReadingPaneActive();
            },
            dismissAfterInvoke: true
        });
        commands.selectMenuSeperator = new Commands.Item({
            id: "selectMenuSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["resourceState", "guiState", "isSearching", "folderChange", "selection"],
            isEnabled: function (selection) {
                return this.commands.folderOperationsMenu.isEnabled(selection) ||
                    this.commands.toggleSelectionModeMenu.isEnabled(selection);
            }.bind(this)
        });
        commands.moveSeparator = new Commands.Item({
            id: "moveSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["selection", "guiState"],
            isEnabled: function (selection) {
                return this.commands.move.isEnabled(selection) ||
                    this.commands.sweep.isEnabled(selection) ||
                    this.commands.unjunkMessages.isEnabled(selection) ||
                    this.commands.junkMessages.isEnabled(selection);
            }.bind(this)
        });
        commands.moveMenuSeperator = new Commands.MenuItem(commands.moveSeparator, {
            id: "moveMenuSeperator",
        });
        commands.sweepMenuSeperator = new Commands.Item({
            id: "sweepMenuSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["selection", "guiState"],
            isEnabled: function (selection) {
                return this.commands.sweep.isEnabled(selection);
            }.bind(this)
        });
        commands.junkMessages = new Commands.Item({
            id: "junkMessages",
            icon: "\uE189",
            useCustomFont: true,
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.j }],
            labelLocId: "mailCommandJunkLabel",
            shortcutLabel: "Ctrl+J",
            shortcutLabelId: "mailCommandJunkToolTip",
            type: "button",
            handler: Commands.Handlers.onJunkButton,
            enableContext: ["guiState", "selection"],
            isEnabled: function (selection) {
                return Contexts.nonEmptySelection() &&
                    Contexts.folderSupportsJunkCommand(selection) &&
                    Contexts.selectionSupportMoving() &&
                    !Contexts.draftsAreSelected(selection);
            },
            dismissAfterInvoke: true
        });
        commands.unjunkMessages = new Commands.Item({
            id: "unjunkMessages",
            icon: "\uE18A",
            useCustomFont: true,
            shortcuts: [{ control: true, keyCode: Jx.KeyCode.j }],
            shortcutLabel: "Ctrl+J",
            shortcutLabelId: "mailCommandUnjunkToolTip",
            labelLocId: "mailCommandUnjunkLabel",
            type: "button",
            handler: Commands.Handlers.onUnjunkButton,
            enableContext: ["guiState", "selection"],
            isEnabled: function (selection) {
                return Contexts.nonEmptySelection() &&
                    selection.view.type === MailViewType.junkMail &&
                    Contexts.isMessageListActive() &&
                    Contexts.selectionSupportMoving() &&
                    !Contexts.draftsAreSelected(selection);
            },
            dismissAfterInvoke: true
        });
        commands.junkMessagesMenu = new Commands.MenuItem(commands.junkMessages, {
            id: "junkMessagesMenu"
        });
        commands.unjunkMessagesMenu = new Commands.MenuItem(commands.unjunkMessages, {
            id: "unjunkMessagesMenu"
        });
        commands.feedback = new Commands.Item({
            id: "feedback",
            icon: "\uE19D", // This will be overridden when SasManager.init is called
            labelLocId: "/strings/sasSurveyHeader", // This will be overridden when SasManager.init is called
            shortcuts: [],
            type: "button",
            handler: function () { },
            enableContext: ["sasStatus"],
            isEnabled: SasManager.commandShown,
            dismissAfterInvoke: true
        });
        commands.moreMenu = new Commands.Item({
            id: "moreMenu",
            icon: "more",
            shortcuts: [],
            labelLocId: "composeAppBarEllipseLabel",
            shortcutLabelId: "composeAppBarEllipseLabel",
            type: "flyout",
            handler: function () { Commands.FlyoutHandler.onHostButton("moreMenu", "moreMenu"); },
            dismissAfterInvoke: false
        });
        commands.messageSeparator = new Commands.Item({
            id: "messageSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["guiState", "selection", "flagStatus", "readStatus"],
            isEnabled: function (selection) {
                return this.commands.toggleUnread.isEnabled(selection) ||
                    this.commands.deleteMessage.isEnabled(selection) ||
                    this.commands.toggleFlag.isEnabled(selection);
            }.bind(this)
        });
        Debug.only(this._verifyCommands());
    };
    Jx.mix(Commands.Factory.prototype, Commands.BaseFactory.prototype);

    // Enable unit testing by giving factory a second name
    Mail.Commands.ParentFactory = Mail.Commands.Factory;
});
