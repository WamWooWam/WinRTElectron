
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global window,Tx*/

// TODO: pass runner as param
Tx.ShortcutKeys = function (enable) {
    Tx.chkNew(this, Tx.ShortcutKeys);
    Tx.chkIf(Tx.isMain);

    this._callbacks = new Tx.Callbacks();

    if (enable) {
        this._callbacks.ael(window, "keydown", function (ev) {
            var key = ev.key,
                shift = ev.shiftKey, 
                ctrl = ev.ctrlKey, 
                alt = ev.altKey;

            if (key === "F2" && !alt && !shift && !ctrl) {
                Tx.runner.commands.goHome();
            } else if (key === "F3" && !alt && !shift && !ctrl) {
                Tx.runner.commands.runAll();
            } else if (key === "F4" && !alt && !shift && !ctrl) {
                Tx.runner.commands.close();
            } else if (Tx.isWWA && key === "F5" && !alt && !shift && !ctrl) {
                Tx.runner.commands.reload();
            } else if (key === "F8" && !alt && !shift && !ctrl) {
                Tx.runner.commands.goNextPage();
            }
        });
    }
};

Tx.ShortcutKeys.prototype = {
    dispose: function () {
        this._callbacks.dispose();
        this._callbacks = null;
    }
};
