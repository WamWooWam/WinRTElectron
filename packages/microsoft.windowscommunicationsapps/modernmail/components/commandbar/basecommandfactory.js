Jx.delayDefine(Mail.Commands, "BaseFactory", function() {
    "use strict";
    var n = Mail.Commands
      , t = n.Contexts
      , i = Microsoft.WindowsLive.Platform.MailViewType;
    n.BaseFactory = function() {
        var r = this.commands = {};
        r.toggleUnread = new n.ToggleItem({
            id: "toggleUnread",
            icon: "",
            useCustomFont: true,
            shortcutLabel: {
                off: "Ctrl+U",
                on: "Ctrl+Q"
            },
            shortcutLabelId: {
                off: "mailCommandMarkUnreadToolTip",
                on: "mailCommandMarkReadToolTip"
            },
            labelLocId: {
                off: "mailCommandMarkUnreadLabel",
                on: "mailCommandMarkReadLabel"
            },
            handler: {
                off: n.Handlers.onMarkAsUnread,
                on: n.Handlers.onMarkAsRead
            },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            enableContext: ["guiState", "selection", "readStatus"],
            toggleContext: ["selection", "readStatus"],
            isEnabled: t.canChangeReadState,
            isToggledOn: t.hasUnreadMessages,
            dismissAfterInvoke: false
        });
        r.markUnread = new n.Item({
            id: "markUnread",
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.u
            }],
            type: "shortcut",
            handler: n.Handlers.onMarkAsUnread,
            enableContext: ["guiState", "selection", "readStatus"],
            isEnabled: function(n) {
                return t.canChangeReadState(n) && !t.hasUnreadMessages()
            }
        });
        r.markRead = new n.Item({
            id: "markRead",
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.q
            }],
            type: "shortcut",
            handler: n.Handlers.onMarkAsRead,
            enableContext: ["guiState", "selection", "readStatus"],
            isEnabled: function(n) {
                return t.canChangeReadState(n) && t.hasUnreadMessages()
            }
        });
        r.deleteMessage = new n.Item({
            id: "deleteMessage",
            icon: "",
            shortcuts: [{
                keyCode: Jx.KeyCode["delete"]
            }, {
                control: true,
                keyCode: Jx.KeyCode.d
            }],
            shortcutLabel: "Ctrl+D",
            shortcutLabelId: "mailCommandDeleteToolTip",
            labelLocId: "mailCommandDeleteOnItemTooltip",
            type: "button",
            handler: n.Handlers.onDeleteButton,
            enableContext: ["guiState", "selection"],
            isEnabled: function() {
                return t.nonEmptySelection() && t.selectionSupportMoving()
            },
            dismissAfterInvoke: true
        });
        r.toggleFlag = new n.ToggleItem({
            id: "toggleFlag",
            icon: "",
            shortcutLabel: "Insert",
            shortcutLabelId: {
                off: "mailCommandFlagToolTip",
                on: "mailCommandUnflagToolTip"
            },
            labelLocId: {
                off: "mailCommandFlagLabel",
                on: "mailCommandUnflagLabel"
            },
            handler: {
                off: n.Handlers.applyFlag,
                on: n.Handlers.removeFlag
            },
            shortcuts: [{
                keyCode: Jx.KeyCode.insert
            }],
            type: "toggle",
            toggleBackground: true,
            enableContext: ["guiState", "selection", "flagStatus"],
            toggleContext: ["selection", "flagStatus"],
            isEnabled: function(n) {
                return t.nonEmptySelection() && n.view.type !== i.outbox && (t.hasFlaggedMessages() || t.hasUnflaggedMessages())
            },
            isToggledOn: function() {
                return t.hasFlaggedMessages() && !t.hasUnflaggedMessages()
            },
            dismissAfterInvoke: false
        });
        r.respond = new n.Item({
            id: "respond",
            icon: "",
            shortcuts: [],
            shortcutLabel: "Ctrl+R",
            shortcutLabelId: "mailCommandRespondToolTip",
            type: "button",
            handler: Jx.fnEmpty,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function(n) {
                return t.singleSelection() && t.allExceptDraftsAndOutbox(n) && !t.draftsAreSelected(n) && t.allowResponse(n) && t.irmCanRespond()
            },
            dismissAfterInvoke: true
        });
        r.forward = new n.Item({
            id: "forward",
            icon: "",
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.f
            }, {
                alt: true,
                keyCode: Jx.KeyCode.w
            }],
            labelLocId: "mailCommandForwardLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onForwardButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function(n) {
                return t.singleSelection() && t.allExceptDraftsAndOutbox(n) && !t.draftsAreSelected(n) && t.allowResponse(n) && t.irmAllows("irmCanForward")
            },
            dismissAfterInvoke: true
        });
        r.reply = new n.Item({
            id: "reply",
            icon: "",
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.r
            }, {
                alt: true,
                keyCode: Jx.KeyCode.r
            }],
            labelLocId: "mailCommandReplyLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onReplyButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function(n) {
                return t.singleSelection() && t.allExceptDraftsAndOutbox(n) && !t.draftsAreSelected(n) && t.allowResponse(n) && t.irmAllows("irmCanReply")
            },
            dismissAfterInvoke: true
        });
        r.replyAll = new n.Item({
            id: "replyAll",
            icon: "",
            shortcuts: [{
                control: true,
                shift: true,
                keyCode: Jx.KeyCode.r
            }, {
                alt: true,
                keyCode: Jx.KeyCode.l
            }],
            labelLocId: "mailCommandReplyAllLabel",
            type: "button",
            handler: Mail.Utilities.ComposeHelper.onReplyAllButton,
            enableContext: ["guiState", "selection", "irm"],
            isEnabled: function(n) {
                return t.singleSelection() && t.allExceptDraftsAndOutbox(n) && !t.draftsAreSelected(n) && t.allowResponse(n) && t.irmAllows("irmCanReplyAll")
            },
            dismissAfterInvoke: true
        });
        r.printMenu = new n.Item({
            id: "printMenu",
            icon: "",
            useCustomFont: true,
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.p
            }],
            shortcutLabel: "Ctrl+P",
            shortcutLabelId: "mailCommandPrintToolTip",
            labelLocId: "mailCommandPrintLabel",
            type: "button",
            handler: n.Handlers.print,
            enableContext: ["guiState", "selection"],
            isEnabled: t.isPrintingEnabled,
            dismissAfterInvoke: true
        });
        r.save = new n.Item({
            id: "save",
            icon: "save",
            shortcuts: [{
                control: true,
                keyCode: Jx.KeyCode.s
            }],
            shortcutLabel: "Ctrl+S",
            shortcutLabelId: "mailCommandSaveToolTip",
            labelLocId: "composeAppBarSaveDraftButton",
            type: "button",
            handler: n.Handlers.composeSaveCommand,
            dismissAfterInvoke: true
        });
        r.saveMoreMenu = new n.MenuItem(r.save,{
            id: "saveMoreMenu"
        });
        r.clipboardToggle = new n.ToggleItem({
            id: "clipboardToggle",
            icon: "paste",
            labelLocId: {
                off: "composeAppBarPasteLabel",
                on: "composeAppBarClipboardLabel"
            },
            shortcutLabelId: {
                off: "composeAppBarPasteToolTip",
                on: "composeAppBarClipboardLabel"
            },
            shortcutLabel: "Ctrl+V",
            handler: {
                off: function() {
                    n.Handlers.composeCommand("paste")
                },
                on: function() {
                    n.FlyoutHandler.onHostButton("clipboardMenu", "clipboardToggle")
                }
            },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            toggleContext: ["composeSelection"],
            isToggledOn: t.copyEnabled,
            dismissAfterInvoke: {
                off: true,
                on: false
            }
        });
        r.paste = new n.Item({
            id: "paste",
            icon: "paste",
            shortcuts: [],
            labelLocId: "composeAppBarPasteLabel",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("paste")
            },
            dismissAfterInvoke: true
        });
        r.copy = new n.Item({
            id: "copy",
            icon: "copy",
            shortcuts: [],
            labelLocId: "composeAppBarCopyLabel",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("copy")
            },
            isEnabled: t.copyEnabled,
            dismissAfterInvoke: true
        });
        r.font = new n.Item({
            id: "font",
            icon: "font",
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontTooltip",
            shortcutLabel: "Ctrl+Shift+F",
            labelLocId: "composeAppBarSetFontLabel",
            type: "flyout",
            handler: function() {
                n.FlyoutHandler.onHostButton("fontFlyout", "font")
            },
            dismissAfterInvoke: false
        });
        r.bold = new n.ToggleItem({
            id: "bold",
            icon: "bold",
            shortcuts: [],
            shortcutLabelId: "composeAppBarBoldToolTop",
            shortcutLabel: "Ctrl+B",
            labelLocId: "composeAppBarBoldButton",
            type: "toggle",
            toggleBackground: true,
            handler: function() {
                n.Handlers.composeCommand("bold")
            },
            toggleContext: ["composeSelection"],
            isToggledOn: function() {
                return t.composeFormatToggle("bold")
            },
            dismissAfterInvoke: false
        });
        r.italic = new n.ToggleItem({
            id: "italic",
            icon: "italic",
            shortcuts: [],
            shortcutLabelId: "composeAppBarItalicToolTip",
            shortcutLabel: "Ctrl+I",
            labelLocId: "composeAppBarItalicButton",
            type: "toggle",
            toggleBackground: true,
            handler: function() {
                n.Handlers.composeCommand("italic")
            },
            toggleContext: ["composeSelection"],
            isToggledOn: function() {
                return t.composeFormatToggle("italic")
            },
            dismissAfterInvoke: false
        });
        r.underline = new n.ToggleItem({
            id: "underline",
            icon: "underline",
            shortcuts: [],
            shortcutLabelId: "composeAppBarUnderlineToolTip",
            shortcutLabel: "Ctrl+U",
            labelLocId: "composeAppBarUnderlineButton",
            type: "toggle",
            toggleBackground: true,
            handler: function() {
                n.Handlers.composeCommand("underline")
            },
            toggleContext: ["composeSelection"],
            isToggledOn: function() {
                return t.composeFormatToggle("underline")
            },
            dismissAfterInvoke: false
        });
        r.fontColor = new n.Item({
            id: "fontColor",
            icon: "",
            useCustomFont: true,
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontColorLabel",
            labelLocId: "composeAppBarSetFontColorLabel",
            type: "flyout",
            handler: function() {
                n.FlyoutHandler.onHostButton("fontColorFlyout", "fontColor")
            },
            dismissAfterInvoke: false
        });
        r.highlightColor = new n.Item({
            id: "highlightColor",
            icon: "",
            useCustomFont: true,
            shortcuts: [],
            shortcutLabelId: "composeAppBarSetFontHighlightColorButton",
            labelLocId: "composeAppBarSetFontHighlightColorButton",
            type: "flyout",
            handler: function() {
                n.FlyoutHandler.onHostButton("highlightColorFlyout", "highlightColor")
            },
            dismissAfterInvoke: false
        });
        r.emojiCmd = new n.Item({
            id: "emojiCmd",
            icon: "emoji2",
            shortcuts: [],
            shortcutLabelId: "composeAppBarEmojiPickerLabel",
            labelLocId: "composeAppBarEmojiPickerLabel",
            type: "button",
            handler: n.Handlers.composeEmojiPicker,
            dismissAfterInvoke: false
        });
        r.emojiMoreMenu = new n.MenuItem(r.emojiCmd,{
            id: "emojiMoreMenu"
        });
        r.linkToggle = new n.ToggleItem({
            id: "linkToggle",
            icon: "link",
            labelLocId: "composeAppBarHyperlinkButton",
            shortcutLabelId: "composeAppBarHyperlinkButton",
            handler: {
                off: function() {
                    n.Handlers.composeCommand("showHyperlinkControl")
                },
                on: function() {
                    n.FlyoutHandler.onHostButton("linkMenu", "linkToggle")
                }
            },
            shortcuts: [],
            type: "toggle",
            toggleBackground: false,
            toggleContext: ["composeSelection"],
            isToggledOn: t.composeInLink,
            dismissAfterInvoke: {
                off: true,
                on: false
            }
        });
        r.addLinkMenuItem = new n.Item({
            id: "addLinkMenuItem",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/hyperlinkControl_completionButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("showHyperlinkControl")
            },
            enableContext: ["composeSelection"],
            isEnabled: function() {
                return !t.composeInLink()
            },
            dismissAfterInvoke: true
        });
        r.editLink = new n.Item({
            id: "editLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_editLink",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("showHyperlinkControl")
            },
            enableContext: ["composeSelection"],
            isEnabled: t.composeInLink,
            dismissAfterInvoke: true
        });
        r.openLink = new n.Item({
            id: "openLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_openLink",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("openLink")
            },
            enableContext: ["composeSelection"],
            isEnabled: t.composeInLink,
            dismissAfterInvoke: true
        });
        r.removeLink = new n.Item({
            id: "removeLink",
            icon: "link",
            shortcuts: [],
            labelLocId: "/modernCanvas/canvasCommand_removeLink",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("removeHyperlink")
            },
            enableContext: ["composeSelection"],
            isEnabled: t.composeInLink,
            dismissAfterInvoke: true
        });
        r.editLinkMenu = new n.MenuItem(r.editLink,{
            id: "editLinkMenu"
        });
        r.openLinkMenu = new n.MenuItem(r.openLink,{
            id: "openLinkMenu"
        });
        r.removeLinkMenu = new n.MenuItem(r.removeLink,{
            id: "removeLinkMenu"
        });
        r.directionLtr = new n.Item({
            id: "directionLtr",
            icon: "alignleft",
            shortcuts: [],
            labelLocId: "composeAppBarDirectionLtr",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("directionLtr")
            },
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage,
            dismissAfterInvoke: true
        });
        r.directionRtl = new n.Item({
            id: "directionRtl",
            icon: "alignright",
            shortcuts: [],
            labelLocId: "composeAppBarDirectionRtl",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("directionRtl")
            },
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage,
            dismissAfterInvoke: true
        });
        r.directionSeperator = new n.Item({
            id: "directionSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty,
            enableContext: ["composeSelection"],
            isEnabled: Mail.Utilities.haveRtlLanguage
        });
        r.linkSeperator = new n.Item({
            id: "linkSeperator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty
        });
        r.fontSeparator = new n.Item({
            id: "fontSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty
        });
        r.formatSeparator = new n.Item({
            id: "formatSeparator",
            shortcuts: [],
            type: "separator",
            handler: Jx.fnEmpty
        });
        r.listMenu = new n.Item({
            id: "listMenu",
            icon: "list",
            shortcuts: [],
            shortcutLabelId: "composeAppBarListsButton",
            labelLocId: "composeAppBarListsButton",
            type: "flyout",
            handler: function() {
                n.FlyoutHandler.onHostButton("listMenu", "listMenu")
            },
            dismissAfterInvoke: false
        });
        r.bulletsMenuItem = new n.Item({
            id: "bulletsMenuItem",
            icon: "list",
            shortcuts: [],
            labelLocId: "composeAppBarBulletsButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("bullets")
            },
            dismissAfterInvoke: true
        });
        r.numberingMenuItem = new n.Item({
            id: "numberingMenuItem",
            icon: "list",
            shortcuts: [],
            labelLocId: "composeAppBarNumberingButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("numbers")
            },
            dismissAfterInvoke: true
        });
        r.clearFormatting = new n.Item({
            id: "clearFormatting",
            icon: "clear",
            shortcuts: [],
            labelLocId: "composeAppBarClearFormattingButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("clearFormatting")
            },
            dismissAfterInvoke: true
        });
        r.undo = new n.Item({
            id: "undo",
            icon: "undo",
            shortcuts: [],
            labelLocId: "composeAppBarUndoButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("undo")
            },
            dismissAfterInvoke: true
        });
        r.redo = new n.Item({
            id: "redo",
            icon: "redo",
            shortcuts: [],
            labelLocId: "composeAppBarRedoButton",
            type: "button",
            handler: function() {
                n.Handlers.composeCommand("redo")
            },
            dismissAfterInvoke: true
        });
        r.composeMoreMenu = new n.Item({
            id: "composeMoreMenu",
            icon: "more",
            shortcuts: [],
            labelLocId: "composeAppBarEllipseLabel",
            shortcutLabelId: "composeAppBarEllipseLabel",
            type: "flyout",
            handler: function() {
                n.FlyoutHandler.onHostButton("composeMoreMenu", "composeMoreMenu")
            },
            dismissAfterInvoke: false
        })
    }
    ;
    n.BaseFactory.prototype = {
        filterCommands: function(n) {
            var t = [];
            return n.forEach(function(n) {
                this.commands[n] ? t.push(n) : Mail.log("Filtering out command: " + n)
            }, this),
            t
        }
    }
})
