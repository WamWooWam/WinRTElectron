
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug*/

Jx.delayDefine(Mail, "CommandBarSelectionHelper", function () {
    "use strict";

    var Instr = Mail.Instrumentation;

    Mail.CommandBarSelectionHelper = /* @constructor*/ function () {
        /// <summary>
        /// A helper that shows/hides the app bar based on selection in compose
        /// </summary>
        this._appBar = null;

        var cmdMgr = Mail.Globals.commandManager;

        this._hooks = new Mail.Disposer(
            new Mail.EventHook(cmdMgr, Mail.Commands.Events.onAddContext, this._onAddContext, this),
            new Mail.EventHook(cmdMgr, Mail.Commands.Events.onRemoveContext, this._onRemoveContext, this)
        );

        // Since compose starts async at startup at the same time this does it could have completed before we did
        var selection = cmdMgr.getContext("composeSelection");
        if (selection) {
            this._onAddContext("composeSelection");
        }
    };

    Mail.CommandBarSelectionHelper.prototype.activate = function (appBar) {
        Debug.assert(Jx.isObject(appBar));
        this._appBar = appBar;
    };

    Mail.CommandBarSelectionHelper.prototype.dispose = function () {
        Jx.dispose(this._hooks);
        this._hooks = null;
        this._appBar = null;
    };

    Mail.CommandBarSelectionHelper.prototype._onComposeSelectionChange = function () {
        var cmdMgr = Mail.Globals.commandManager,
            selection = cmdMgr.getContext("composeSelection");
        // because composeSelection can fire on a timer it maybe gone by the time we get the message
        if (selection) {
            var state = selection.getSelectionState();
            if (state.hasNonEmptySelection) {
                cmdMgr.appBar.appBarSelectionSticky = true;
                if (this._appBar.hidden) {
                    this._appBar.show();
                    Instr.instrumentAppBarInvoke(Instr.AppBarInvokeType.composeSelection);
                }
            } else if (cmdMgr.appBar.appBarSelectionSticky) {
                this._appBar.hide();
            }
        }
    };

    Mail.CommandBarSelectionHelper.prototype._onComposeContextMenu = function (e) {
        if (this._appBar.hidden) {
            Instr.instrumentAppBarInvoke(Instr.AppBarInvokeType.rightClick);
        }
        this._appBar.toggleVisibility();
        e.preventDefault();
    };

    Mail.CommandBarSelectionHelper.prototype._onAddContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            var selection = Mail.Globals.commandManager.getContext(key);

            selection.addListener("selectionchange", this._onComposeSelectionChange, this);
            selection.addListener("contextmenu", this._onComposeContextMenu, this);
        }
    };

    Mail.CommandBarSelectionHelper.prototype._onRemoveContext = function (key) {
        /// <param name="key" type="String">a unique string to identify the context</param>

        if (key === "composeSelection") {
            var selection = Mail.Globals.commandManager.getContext(key);

            selection.removeListener("selectionchange", this._onComposeSelectionChange, this);
            selection.removeListener("contextmenu", this._onComposeContextMenu, this);
        }
    };
});
