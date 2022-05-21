
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//
/*global  Jx, Mail, Debug */
/*jshint browser:true*/

Jx.delayDefine(Mail.Commands, ["Factory", "ChildFactory"], function () {
    "use strict";
    var Commands = Mail.Commands;

    Commands.Factory = /* @constructor*/function (glomManager) {
        Commands.BaseFactory.call(this);
        /// This contains the list of all possible commands.  The commands are declared as object literals known as ItemsOptions, see command.ref.js for details
        var commands = this.commands;
        commands.back = new Commands.Item({
            id: "back",
            icon: "\uE0D5",
            shortcuts: [{ alt: true, keyCode: (Jx.isRtl() ? Jx.KeyCode.rightarrow : Jx.KeyCode.leftarrow) }, { keyCode: Jx.KeyCode.browserback }, { keyCode: Jx.KeyCode.backspace }, { keyCode: Jx.KeyCode.escape }],
            shortcutLabel: (Jx.isRtl() ? "Alt + RightArrow" : "Alt + LeftArrow"),
            shortcutLabelId: "composeAppBarBackTooltip",
            labelLocId: "mailCommandBackLabel",
            type: "button",

            handler: glomManager.handleHomeButton.bind(glomManager),
            dismissAfterInvoke: true
        });
        commands.print = new Commands.MenuItem(commands.printMenu, {
            id: "print"
        });

        Debug.only(this._verifyCommands());
    };
    // Enable unit testing by giving factory a second name
    Mail.Commands.ChildFactory = Mail.Commands.Factory;
    Jx.mix(Commands.Factory.prototype, Commands.BaseFactory.prototype);
});
