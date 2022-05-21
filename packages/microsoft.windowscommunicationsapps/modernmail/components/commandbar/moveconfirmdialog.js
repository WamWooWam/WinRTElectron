
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,People,Jx,Debug*/

Jx.delayDefine(Mail, "moveWithConfirmation", function () {
    "use strict";

     var MoveConfirmDialogContent = function (selection, destination, senders) {
         Mail.writeProfilerMark("MoveConfirmDialogContent_constructor", Mail.LogEvent.start);
         Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
         Debug.assert(Jx.isInstanceOf(destination, Mail.UIDataModel.MailView));
         Debug.assert(Jx.isArray(senders));

         this._selection = selection;
         this._destination = destination;
         this._senders = senders;

         this.initComponent();
         Debug.only(Object.seal(this));
         Mail.writeProfilerMark("MoveConfirmDialogContent_constructor", Mail.LogEvent.stop);
    };
    Jx.augment(MoveConfirmDialogContent, Jx.Component);

    MoveConfirmDialogContent.prototype.getUI = function (ui) {
        var viewNameHtml =
            "<span class='moveConfirmViewName'>" +
                Jx.escapeHtmlToSingleLine(this._destination.name) +
            "</span>",
            messageHtml = null;

        if (this._senders.length === 1) {
            var sender = this._senders[0];
            messageHtml = Jx.res.loadCompoundString("mailMoveConfirmDialogMessageSingular",
                Jx.escapeHtmlToSingleLine(sender.calculatedUIName),
                Jx.escapeHtmlToSingleLine(sender.emailAddress),
                viewNameHtml
            );
        } else {
            messageHtml = Jx.res.loadCompoundString("mailMoveConfirmDialogMessagePlural", viewNameHtml);
        }

        ui.html =
            "<div id='moveConfirmDialogRoot'>" +
                "<div id='dlgDescription' class='moveConfirmDescription' role='heading'>" +
                    messageHtml +
                "</div>" +
            "</div>";
    };

    MoveConfirmDialogContent.prototype.activateUI = function () {
        Mail.writeProfilerMark("MoveConfirmDialogContent_activateUI", Mail.LogEvent.start);
        var cancelButton = document.getElementById("idMoveConfirmMove");

        Jx.safeSetActive(cancelButton);

        Jx.Component.prototype.activateUI.call(this);
        Mail.writeProfilerMark("MoveConfirmDialogContent_activateUI", Mail.LogEvent.stop);
    };

    MoveConfirmDialogContent.prototype.deactivateUI = function () {
        Mail.writeProfilerMark("MoveConfirmDialogContent_deactivateUI", Mail.LogEvent.start);
        Jx.Component.prototype.deactivateUI.call(this);
        Mail.writeProfilerMark("MoveConfirmDialogContent_deactivateUI", Mail.LogEvent.stop);
    };

    function onCreateRule(selection, senders, destinationView) {
        Mail.writeProfilerMark("MoveConfirmDialog_onCreateRule", Mail.LogEvent.start);

        var sourceView = selection.view;

        senders.forEach(function (sender) {
            Mail.SweepRules.runMoveAllRule(sender.emailAddress, sourceView, destinationView, Mail.SweepRules.sweepType.moveAllFuture);
        });

        Mail.writeProfilerMark("MoveConfirmDialog_onCreateRule", Mail.LogEvent.stop);
    }

    function showMoveConfirmationDialog (selection, destination, items) {
        // Get the list of unique senders
        var senders = Mail.SweepRules.getSenders(selection, items);
        if (senders.length === 0) {
            // If we couldn't find any selected messages with a sender email address,
            // we can't run a sweep. Don't show the dialog and just move the messages directly.
            selection.moveItemsTo(destination, items);
            return;
        }

        // Create the dialog content.
        var confirmMoveLabel = (selection.messages.length === 1) ?  "mailMoveConfirmMoveButtonSingular" : "mailMoveConfirmMoveButtonPlural",
            titleResource = (senders.length === 1) ? "mailMoveConfirmDialogTitleSingleSender" : "mailMoveConfirmDialogTitleMultipleSenders",
            dialogContent = new MoveConfirmDialogContent(selection, destination, senders);

        // Create the dialog and set the title and content.
        var dialog = new People.Dialog(Jx.res.getString(titleResource), dialogContent);

        // Setup the buttons
        var moveButton = new People.DialogButton("idMoveConfirmMove", Jx.res.getString(confirmMoveLabel), "button");
        moveButton.addListener("click", function () {
            // If the "just this message" button is clicked, we want to just move the items to the destination view like normal
            dialog.close(); // Force the dialog to close.
            selection.moveItemsTo(destination, items);
        });
        dialog.buttons.push(moveButton);

        var createRuleButton = new People.DialogButton("idMoveConfirmCreateRule", Jx.res.getString("mailMoveConfirmCreateRuleButton"), "button");
        createRuleButton.addListener("click", function () {
            // If the "move all" button is clicked, we want to create rules to move everything from these senders to
            // the destination view.
            dialog.close(); // Force the dialog to close.
            onCreateRule(selection, senders, destination);
        });
        dialog.buttons.push(createRuleButton);

        dialog.show(false/*escapable*/);
    }

    Mail.moveWithConfirmation = function (selection, destination, items) {
        Mail.writeProfilerMark("MoveConfirmDialog_moveWithConfirmation", Mail.LogEvent.start);
        // Moves the given items to the destination view. If the destination view is
        // the newsletter or social updates view, a confirmation dialog is shown. The dialog
        // asks if the user intended to create a rule to move all items from the sender instead.
        Debug.assert(Jx.isInstanceOf(selection, Mail.Selection));
        Debug.assert(Jx.isInstanceOf(destination, Mail.UIDataModel.MailView));

        var requiresMoveConfirmationDialog = Mail.ViewCapabilities.requiresMoveConfirmationDialog;

        // We only want to show a dialog if the source or destination is the newsletter or social updates view
        if (requiresMoveConfirmationDialog(selection.view) ||
            requiresMoveConfirmationDialog(destination)) {
            showMoveConfirmationDialog(selection, destination, items);
        } else {
            selection.moveItemsTo(destination, items);
            Jx.EventManager.fireDirect(null, "exitSelectionMode");
        }
        Mail.writeProfilerMark("MoveConfirmDialog_moveWithConfirmation", Mail.LogEvent.stop);
    };

});

