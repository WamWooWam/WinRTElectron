
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,FontSelector,MenuArrowKeyHandler,WinJS,setImmediate,SasManager*/


var Commands = Mail.Commands;

Jx.delayDefine(Mail, "CompFlyoutCommandHost", function () {
    "use strict";

    var Flyout = Mail.CompFlyoutCommandHost = function () {
        this._registeredCommandIds = ["reply", "replyAll", "forward"];
        this._label = Jx.escapeHtml(Jx.res.getString("mailCommandRespondAriaLabel"));
        Commands.MenuFlyout.call(this);
        this._uiEntryPoint = Mail.Instrumentation.UIEntryPoint.onCanvas;
    };

    Jx.inherit(Flyout, Commands.MenuFlyout);

    var prototype = Flyout.prototype;
    Object.defineProperty(prototype, "placement", { get: function () { return "bottom"; }, enumerable: true });
    Object.defineProperty(prototype, "id", { get: function () { return "mailRespondFlyout"; }, enumerable: true });

    prototype.composeCommands = function () {
        return [];
    };

    prototype.viewStateCommands = function () {
        return ["forward", "reply", "replyAll"];
    };

    prototype.addEventListener = function (eventName, handler, useCapture) {
        Debug.assert(Jx.isObject(this._flyout));
        Debug.assert(Jx.isNonEmptyString(eventName));
        Debug.assert(Jx.isFunction(handler));
        Debug.assert(Jx.isBoolean(useCapture));

        this._flyout.addEventListener(eventName, handler, useCapture);
    };

    prototype.removeEventListener = function (eventName, handler, useCapture) {
        Debug.assert(Jx.isObject(this._flyout));
        Debug.assert(Jx.isNonEmptyString(eventName));
        Debug.assert(Jx.isFunction(handler));
        Debug.assert(Jx.isBoolean(useCapture));

        this._flyout.removeEventListener(eventName, handler, useCapture);
    };

});

Jx.delayDefine(Commands, "ClipboardMenu", function () {
    "use strict";

    var ClipboardMenu = Commands.ClipboardMenu = function () {
        this._registeredCommandIds = ["copy", "paste"];
        this._label = Jx.escapeHtml(Jx.res.getString("composeAppBarClipboardLabel"));
        Commands.MenuFlyout.call(this);
    };

    Jx.inherit(ClipboardMenu, Commands.MenuFlyout);

    var prototype = ClipboardMenu.prototype;
    prototype.composeCommands = function () {
        return this.registeredCommandIds;
    };

    prototype.viewStateCommands = function () {
        return this.registeredCommandIds;
    };

    Object.defineProperty(prototype, "id", { get: function () { return "clipboardMenuFlyout"; }, enumerable: true });

});

Jx.delayDefine(Commands, "LinkMenu", function () {
    "use strict";

    var LinkMenu = Commands.LinkMenu = function () {
        this._registeredCommandIds = ["editLinkMenu", "openLinkMenu", "removeLinkMenu"];
        this._sortedRegisteredCommandsIds = [].concat(this._registeredCommandIds).sort();
        this._label = Jx.escapeHtml(Jx.res.getString("composeAppBarHyperlinkButton"));
        Commands.MenuFlyout.call(this);
    };

    Jx.inherit(LinkMenu, Commands.MenuFlyout);

    var prototype = LinkMenu.prototype;
    prototype.composeCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    prototype.viewStateCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    Object.defineProperty(prototype, "id", { get: function () { return "linkMenuFlyout"; }, enumerable: true });

});

Jx.delayDefine(Commands, "ListMenu", function () {
    "use strict";

    var ListMenu = Commands.ListMenu = function () {
        this._registeredCommandIds = ["bulletsMenuItem", "numberingMenuItem"];
        this._sortedRegisteredCommandsIds = [].concat(this._registeredCommandIds).sort();
        this._label = Jx.res.getString("composeAppBarListsButton");

        Commands.MenuFlyout.call(this);
    };

    Jx.inherit(ListMenu, Commands.MenuFlyout);

    var prototype = ListMenu.prototype;
    prototype.composeCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    prototype.viewStateCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    Object.defineProperty(prototype, "id", { get: function () { return "listMenuFlyout"; }, enumerable: true });

});

Jx.delayDefine(Commands, "MoreMenu", function () {
    "use strict";

    var MoreMenu = Commands.MoreMenu = function () {
        this._registeredCommandIds = ["folderOperationsMenu", "toggleSelectionModeMenu", "selectMenuSeperator", "moveMenu", "sweepMenu", "junkMessagesMenu", "unjunkMessagesMenu", "sweepMenuSeperator", "moveMenuSeperator", "syncMenu", "printMenu", "feedback", "debugSnapshot"];
        this._sortedRegisteredCommandsIds = [].concat(this._registeredCommandIds).sort();
        this._label = Jx.res.getString("composeAppbarEllipseLabel");
        Commands.MenuFlyout.call(this);
    };

    Jx.inherit(MoreMenu, Commands.MenuFlyout);

    var prototype = MoreMenu.prototype;
    prototype.composeCommands = function () {
        return [];
    };

    prototype.activateCommands = function (commands) {
        Commands.MenuFlyout.prototype.activateCommands.call(this, commands);
        // Initialize SendaSmile if we are not in IE
        Debug.Mail.log("MenuFlyout.activateCommands - init SAS", Mail.LogEvent.start);
        SasManager.init(Jx.res.getString("mailAppTitle"), "feedback");
        Mail.Globals.commandManager.subscribeToSaS();
        Debug.Mail.log("MenuFlyout.activateCommands - init SAS", Mail.LogEvent.stop);
    };

    prototype.viewStateCommands = function (viewState) {
        var appViewState = Jx.ApplicationView.State;
        if (viewState === appViewState.wide || viewState === appViewState.full || viewState === appViewState.large || viewState === appViewState.more || viewState === appViewState.portrait) {
            return ["debugSnapshot", "feedback", "printMenu", "syncMenu"];
        } else if (viewState === appViewState.split) {
            return ["debugSnapshot", "feedback", "printMenu", "sweepMenu", "sweepMenuSeperator", "syncMenu"];
        } else if (viewState === appViewState.less) {
            return ["debugSnapshot", "feedback", "junkMessagesMenu", "moveMenu", "moveMenuSeperator", "printMenu", "sweepMenu", "syncMenu", "unjunkMessagesMenu"];
        } else if (viewState === appViewState.snap || viewState === appViewState.minimum) {
            return ["debugSnapshot", "feedback", "folderOperationsMenu", "junkMessagesMenu", "moveMenu", "moveMenuSeperator", "printMenu", "selectMenuSeperator", "sweepMenu", "syncMenu", "toggleSelectionModeMenu", "unjunkMessagesMenu"];
        }
        Debug.assert(false, "unknown viewState");
    };

    Object.defineProperty(prototype, "id", { get: function () { return "moreMenuFlyout"; }, enumerable: true });

});

Jx.delayDefine(Commands, "ComposeMoreMenu", function () {
    "use strict";

    var ComposeMoreMenu = Commands.ComposeMoreMenu = function () {
        this._registeredCommandIds = ["directionLtr", "directionRtl", "directionSeperator", "addLinkMenuItem", "editLink", "openLink", "removeLink", "emojiMoreMenu", "linkSeperator", "saveMoreMenu", "undo", "redo", "clearFormatting"];
        this._sortedRegisteredCommandsIds = [].concat(this._registeredCommandIds).sort();
        this._label = Jx.res.getString("composeAppbarEllipseLabel");
        Commands.MenuFlyout.call(this);
    };

    Jx.inherit(ComposeMoreMenu, Commands.MenuFlyout);

    var prototype = ComposeMoreMenu.prototype;
    prototype.composeCommands = function () {
        return this._sortedRegisteredCommandsIds;
    };

    prototype.viewStateCommands = function (viewState) {
        var appViewState = Jx.ApplicationView.State;
        if (viewState === appViewState.wide || viewState === appViewState.full || viewState === appViewState.large) {
            return ["clearFormatting", "directionLtr", "directionRtl", "directionSeperator", "redo", "undo"];
        } else if (viewState === appViewState.more) {
            return ["clearFormatting", "directionLtr", "directionRtl", "directionSeperator", "redo", "saveMoreMenu", "undo"];
        } else if (viewState === appViewState.portrait) {
            return ["addLinkMenuItem", "clearFormatting", "directionLtr", "directionRtl", "directionSeperator", "editLink", "linkSeperator", "openLink", "redo", "removeLink", "saveMoreMenu", "undo"];
        } else if (viewState === appViewState.split) {
            return ["addLinkMenuItem", "clearFormatting", "directionLtr", "directionRtl", "directionSeperator", "editLink", "emojiMoreMenu", "linkSeperator", "openLink", "redo", "removeLink", "saveMoreMenu", "undo"];
        } else if (viewState === appViewState.snap || viewState === appViewState.minimum || viewState === appViewState.less) {
            return [];
        }
        Debug.assert(false, "unknown viewState");
    };

    Object.defineProperty(prototype, "id", { get: function () { return "composeMoreMenuFlyout"; }, enumerable: true });

});

Jx.delayDefine(Commands, "FontFlyout", function () {
    "use strict";

    var FontFlyout = Commands.FontFlyout = function () {
        this._pxToPtRatio = 1 / 0.75;
        this._flyout = null;
        this._id = "FontFlyout";
        this._fontNameControl = null;
        this._fontSizeControl = null;
        this._makh = null;
    };

    var prototype = FontFlyout.prototype;
    prototype.register = Jx.fnEmpty;

    prototype._createFlyoutMenu = function () {
        Debug.assert(this._flyout === null); // This function should only get called once

        // Create the flyout control
        var element = document.createElement("div");
        element.className = "fontFlyout";
        element.id = this._id;
        var appRoot = document.getElementById(Mail.CompApp.rootElementId),
            fontNameDiv = document.createElement("div"),
            fontSizeDiv = document.createElement("div");
        fontNameDiv.className = "fontNameControlContainer";
        fontSizeDiv.className = "fontSizeControlContainer";
        element.appendChild(fontNameDiv);
        element.appendChild(fontSizeDiv);
        appRoot.appendChild(element);

        this._fontNameControl = new FontSelector.NameControl({ host: element, size: 4, newOnFail: true });
        this._fontNameControl.initUI(fontNameDiv);

        this._fontSizeControl = new FontSelector.SizeControl({ host: element, size: 4 });
        this._fontSizeControl.initUI(fontSizeDiv);

        this._makh = new MenuArrowKeyHandler(element, { querySelector: "select", itemsTabbable: true });
        this._makh.activateUI();

        this._flyout = new WinJS.UI.Flyout(element, { alignment: "center", placement: "top" });
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._flyout, "contextmenu", Commands.MenuFlyout.onContextMenu, this),
            new Mail.EventHook(this._flyout,"MSPointerDown", Commands.MenuFlyout.onPointerDown),
            new Mail.EventHook(this._flyout, "aftershow", this._showFontListener, this),
            new Mail.EventHook(this._flyout, "afterhide", this._afterHide, this),
            new Mail.EventHook(this._fontNameControl, "change", this._onFontNameChange, this),
            new Mail.EventHook(this._fontSizeControl, "change", this._onFontSizeChange, this),
            new Mail.Disposable(this._fontNameControl, "shutdownUI"),
            new Mail.Disposable(this._fontSizeControl, "shutdownUI"),
            this._makh);
    };

    prototype._showFontListener = function () {
        /// <summary>Sets the font family and size before the font flyout is shown.</summary>
        // Set the font size selector
        var commandManager = Mail.Globals.commandManager,
        selection = commandManager.getContext("composeSelection");
        if (!selection) { return; }
        var selectionSyles = selection.getSelectionStyles();

        var fontSize = selectionSyles.fontSize;
        if (fontSize && (fontSize.indexOf("px") > 0)) {
            fontSize = Math.round(Number(fontSize.replace("px", "")) / this._pxToPtRatio);
        }
        this._fontSizeControl.value = fontSize;

        // Clear any temporary values from the font family selector
        this._fontNameControl.clear();

        // Set the font family selector
        var fontFamily = selectionSyles.fontFamily;
        if (fontFamily) {
            fontFamily = fontFamily.replace(/.Color.Emoji.,\s*/i, "").replace(/,.*/, "").replace(/"/g, "");
        }
        this._fontNameControl.value = fontFamily;
    };

    prototype._onFontNameChange = function (e) {
        this._executeChangeCommand("setFontFamily", e, this._fontNameControl);
    };

    prototype._onFontSizeChange = function (e) {
        this._executeChangeCommand("setFontSize", e, this._fontSizeControl);
    };

    prototype._executeChangeCommand = function (command, e, control) {
        var flyout = this._flyout,
            selection = Mail.Globals.commandManager.getContext("composeSelection"),
            keyEater;

        flyout._sticky = true;
        if (selection) {
            // If the user is mashing on the keyboard (holding down the down arrow) keyboard events start to fire in the canvas.
            // This happens because the command moves focus to the canvas while the it executes.  This will cause the selection to change which we don't want.
            // So swallow all keyboard events in the canvas until after we move the focus back to this control in the setImmediates below
            keyEater = new Mail.EventHook(selection.getCanvasDocument(), "keydown", function (e) { e.preventDefault(); e.stopImmediatePropagation(); });
        }
        Commands.Handlers.composeCommand(command, e.value);

        setImmediate(function () {
            control.focus();
        });
        setImmediate(function () {
            // We need to wait to set _sticky back to false or else focus might still be in the iframe and the flyout will go away.
            flyout._sticky = false;
            Jx.dispose(keyEater);
        });
    };

    prototype.dispose = function () {
        if (this._flyout) {
            Jx.dispose(this._hooks);
            this._flyout.hide();
            this._flyout = null;
        }
    };

    prototype.show = function (anchor) {

        Debug.assert(Jx.isHTMLElement(anchor));
        if (this._flyout === null) {
            this._createFlyoutMenu();
        }
        Debug.assert(Jx.isObject(this._flyout));
        this._flyout.show(anchor);
    };

    prototype.hide = function () {
        Debug.assert(Jx.isObject(this._flyout));
        this._flyout.hide();
    };

    prototype._afterHide = function () {
        // If a command has been executed, we need to restore focus to canvas 
        // in order to preserve the applied styling on collapsed selections
        var selection = Mail.Globals.commandManager.getContext("composeSelection"),
            state = selection.getSelectionState();

        if (state.hasSelection && !state.hasNonEmptySelection) {
            selection.focusBody();
        }
        this._activeElement = null;
    };

});

Jx.delayDefine(Commands, "ColorFlyout", function () {
    "use strict";

    var ColorFlyout = Commands.ColorFlyout = function (config) {
        this._flyout = null;
        this._fontColorControl = null;
        this._config = config;
        Debug.assert(Jx.isNonEmptyString(this._config.command), "Command is required");
        Debug.assert(Jx.isArray(this._config.colors), "Colors are required");
        Debug.assert(Jx.isNonEmptyString(this._config.selectionStyle), "Selection style required");
    };

    var prototype = ColorFlyout.prototype;
    prototype.register = Jx.fnEmpty;

    prototype._createFlyoutMenu = function () {
        Debug.assert(this._flyout === null); // This function should only get called once

        // Create the flyout control
        var element = document.createElement("div");
        element.className = "colorFlyout";
        element.id = this._id;
        var appRoot = document.getElementById(Mail.CompApp.rootElementId);
        appRoot.appendChild(element);

        this._fontColorControl = new FontSelector.ColorControl({
            host: element,
            colors: this._config.colors,
            gridLayout: this._config.gridLayout,
            label: this._config.label
        });
        this._fontColorControl.initUI(element);

        this._flyout = new WinJS.UI.Flyout(element, { alignment: "center", placement: "top" });
        this._hooks = new Mail.Disposer(
            new Mail.EventHook(this._flyout, "contextmenu", Commands.MenuFlyout.onContextMenu, this),
            new Mail.EventHook(this._flyout, "MSPointerDown", Commands.MenuFlyout.onPointerDown),
            new Mail.EventHook(this._fontColorControl, "change", this._onChange, this),
            new Mail.EventHook(this._flyout, "beforeshow", this._showFontListener, this),
            new Mail.Disposable(this._fontColorControl, "shutdownUI"));
    };

    prototype._showFontListener = function () {
        /// <summary>Sets the font family and size before the font flyout is shown.</summary>
        // Set the font size selector
        var commandManager = Mail.Globals.commandManager,
        selection = commandManager.getContext("composeSelection");
        if (!selection) { return; }
        var selectionStyles = selection.getSelectionStyles();

        var color = selectionStyles[this._config.selectionStyle];
        if (color) {
            color = color.toUpperCase();
        }
        this._fontColorControl.value = color;
    };

    prototype._onChange = function (e) {
        Commands.Handlers.composeCommand(this._config.command, e.value);
        var colors = {};
        colors[this._config.selectionStyle] = e.value;
        Jx.EventManager.fireDirect(null, "buttonColorUpdate", colors);
    };

    prototype.dispose = function () {
        if (this._flyout) {
            Jx.dispose(this._hooks);
            this._flyout.hide();
            this._flyout = null;
        }
    };

    prototype.show = function (anchor) {

        Debug.assert(Jx.isHTMLElement(anchor));
        if (this._flyout === null) {
            this._createFlyoutMenu();
        }
        Debug.assert(Jx.isObject(this._flyout));
        this._flyout.show(anchor);
    };

    prototype.hide = function () {
        Debug.assert(Jx.isObject(this._flyout));
        this._flyout.hide();
    };

});

Jx.delayDefine(Commands, "FontColorFlyout", function () {
    "use strict";

    var FontColorFlyout = Commands.FontColorFlyout = function () {
        Commands.ColorFlyout.call(this, {
            command: "setFontColor",
            selectionStyle: "fontColor",
            label: Jx.res.getString("fontSelectorColorLabel"),
            colors: [
                { value: "#833C0B", name: Jx.res.getString("darkbrown") },
                { value: "#BD1398", name: Jx.res.getString("pink") },
                { value: "#FFFFFF", name: Jx.res.getString("white") },
                { value: "#1E4E79", name: Jx.res.getString("mediumdarkblue") },
                { value: "#7232AD", name: Jx.res.getString("purple") },
                { value: "#E2C501", name: Jx.res.getString("yellow") },
                { value: "#1F3864", name: Jx.res.getString("darkblue") },
                { value: "#006FC9", name: Jx.res.getString("blue") },
                { value: "#D05C12", name: Jx.res.getString("orange") },
                { value: "#375623", name: Jx.res.getString("darkgreen") },
                { value: "#4BA524", name: Jx.res.getString("green") },
                { value: "#D03A3A", name: Jx.res.getString("red") },
                { value: "#000000", name: Jx.res.getString("black") },
                { value: "#525252", name: Jx.res.getString("darkgrey") },
                { value: "#757B80", name: Jx.res.getString("grey") }
            ],
            gridLayout: {
                columns: "50px 50px 50px",
                rows: "50px 50px 50px 50px 50px"
            }
        });
        this._id = "fontColorFlyout";
    };
    Jx.inherit(FontColorFlyout, Commands.ColorFlyout);

});

Jx.delayDefine(Commands, "HighlightColorFlyout", function () {
    "use strict";

    var HighlightColorFlyout = Commands.HighlightColorFlyout = function () {
        Commands.ColorFlyout.call(this, {
            command: "setFontHighlightColor",
            selectionStyle: "highlightColor",
            label: Jx.res.getString("composeAppBarSetFontHighlightColorButton"),
            colors: [
                { value: "#00FFFF", name: Jx.res.getString("composeAppBarHighlightColor1Button") },
                { value: "#FFFFFF", name: Jx.res.getString("composeAppBarHighlightColor2Button") },
                { value: "#0000FF", name: Jx.res.getString("composeAppBarHighlightColor3Button") },
                { value: "#99CCFF", name: Jx.res.getString("composeAppBarHighlightColor4Button") },
                { value: "#00FF00", name: Jx.res.getString("composeAppBarHighlightColor5Button") },
                { value: "#CCFFCC", name: Jx.res.getString("composeAppBarHighlightColor6Button") },
                { value: "#FF00FF", name: Jx.res.getString("composeAppBarHighlightColor7Button") },
                { value: "#FF99CC", name: Jx.res.getString("composeAppBarHighlightColor8Button") },
                { value: "#FFFF00", name: Jx.res.getString("composeAppBarHighlightColor9Button") },
                { value: "#FFFF99", name: Jx.res.getString("composeAppBarHighlightColor10Button") }
            ],
            gridLayout: {
                columns: "50px 50px",
                rows: "50px 50px 50px 50px 50px"
            }
        });
        this._id = "highlightColorFlyout";
    };
    Jx.inherit(HighlightColorFlyout, Commands.ColorFlyout);

});
