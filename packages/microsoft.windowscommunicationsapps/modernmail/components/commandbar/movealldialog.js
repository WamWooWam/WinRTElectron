
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,People,Jx,Debug,Microsoft */

Jx.delayDefine(Mail, "showMoveAllDialog", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        SweepRules = Mail.SweepRules;

    var MoveAllDialogContent = function (selection, senders) {
        Mail.writeProfilerMark("MoveAllDialogContent_constructor", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(selection));
        Debug.assert(Jx.isArray(senders));

        this._selection = selection;
        this._senders = senders;
        this._chosenView = null;
        this._confirmButton = null;

        this._chooseFolderLink = null;
        this._onChooseFolder = this._onChooseFolder.bind(this);

        this.initComponent();
        Debug.only(Object.seal(this));
        Mail.writeProfilerMark("MoveAllDialogContent_constructor", Mail.LogEvent.stop);
    };
    Jx.augment(MoveAllDialogContent, Jx.Component);

    MoveAllDialogContent.prototype._getDescription = function () {
        var senders = this._senders,
            description;
        Debug.assert(senders.length > 0);

        if (senders.length === 1) {
            var sender = senders[0];
            description = Jx.escapeHtmlToSingleLine(Jx.res.loadCompoundString("mailMoveAllDialogMessage",
                sender.calculatedUIName,
                sender.emailAddress));
        } else {
            description = Jx.escapeHtml(Jx.res.getString("mailMoveAllDialogMessagePlural"));
        }

        return description;
    };

    MoveAllDialogContent.prototype.getUI = function (ui) {
        var description = this._getDescription(),
            chooseFolderLinkText = Jx.escapeHtml(Jx.res.getString("mailMoveAllDialogNoFolder")),
            folderLinkHtml = "<button id='moveAllChooseFolderLink'>" + chooseFolderLinkText + "</button>",
            scopeFolder = SweepRules.getScopeFolder(Plat.MailRuleActionType.move, SweepRules.sweepType.moveAll, this._selection.view),
            moveAllLabel,
            moveAllFutureLabel;

        if (scopeFolder) {
            var scopeFolderName = Mail.UIDataModel.MailFolder.getName(scopeFolder);

            moveAllLabel = Jx.res.loadCompoundString("mailMoveAllDialogMoveAllInFolder", scopeFolderName);
            moveAllFutureLabel = Jx.res.loadCompoundString("mailMoveAllDialogMoveAllFutureInFolder", scopeFolderName);
        } else {
            moveAllLabel = Jx.res.getString("mailMoveAllDialogMoveAllInAccount");
            moveAllFutureLabel = Jx.res.getString("mailMoveAllDialogMoveAllFutureInAccount");
        }


        ui.html =
            "<div id='moveAllDialogRoot'>" +
                "<div id='dlgDescription' class='moveAllDialogDescription' role='heading'>" +
                     /* Escaped in _getDescription() */ description +
                "</div>" +
                "<label class='mailMoveAllTypeOption' >" +
                    "<input id='mailMoveAllFirstOption' type='radio' value='moveAll' class='mailMoveAllRadio' checked='true' >" +
                        Jx.escapeHtmlToSingleLine(moveAllLabel) +
                "</label>" +
                "<label class='mailMoveAllTypeOption' >" +
                    "<input type='radio' value='moveAllFuture' class='mailMoveAllRadio' >" +
                        Jx.escapeHtmlToSingleLine(moveAllFutureLabel) +
                "</label>" +
                "<label class='mailMoveAllTypeOption' >" +
                    "<input type='radio' value='moveNotMostRecent' class='mailMoveAllRadio' >" +
                        Jx.escapeHtmlToSingleLine(Jx.res.getString("mailMoveAllDialogMoveNotMostRecentInAccount")) +
                "</label>" +
                "<label class='mailMoveAllTypeOption' >" +
                    "<input type='radio' value='moveTenDays' class='mailMoveAllRadio' >" +
                        Jx.escapeHtmlToSingleLine(Jx.res.getString("mailMoveAllDialogMoveOlderInAccount")) +
                "</label>" +
                "<div class='mailMoveAllChooseFolder'>" +
                    Jx.res.loadCompoundString("mailMoveAllDialogFolderChooserWrapper", folderLinkHtml) +
                "</div>" +
            "</div>";
    };

    MoveAllDialogContent.prototype.activateUI = function () {
        Mail.writeProfilerMark("MoveAllDialogContent_activateUI", Mail.LogEvent.start);
        this._chooseFolderLink = document.getElementById("moveAllChooseFolderLink");
        this._chooseFolderLink.addEventListener("click", this._onChooseFolder);

        // Add the name attribute to all the radio inputs so they behave correctly as a group. This can't be done in getUI()
        // because IE considers the name attribute to be unsafe so it can't be manipulated by using innerHTML.
        Array.prototype.forEach.call(document.querySelectorAll(".mailMoveAllRadio"), function (radio) {
            radio.name = "moveType";
        });

        var firstOption = document.getElementById("mailMoveAllFirstOption");
        Jx.safeSetActive(firstOption);

        Jx.Component.prototype.activateUI.call(this);
        Mail.writeProfilerMark("MoveAllDialogContent_activateUI", Mail.LogEvent.stop);
    };

    MoveAllDialogContent.prototype.deactivateUI = function () {
        Mail.writeProfilerMark("MoveAllDialogContent_deactivateUI", Mail.LogEvent.start);
        if (this._chooseFolderLink) {
            this._chooseFolderLink.removeEventListener("click", this._onChooseFolder);
        }

        Jx.Component.prototype.deactivateUI.call(this);
        Mail.writeProfilerMark("MoveAllDialogContent_deactivateUI", Mail.LogEvent.stop);
    };

    MoveAllDialogContent.prototype._onChooseFolder = function (evt) {
        Mail.writeProfilerMark("MoveAllDialogContent_onChooseFolder", Mail.LogEvent.start);
        evt.preventDefault();

        var dialog = document.getElementById("moveAllDialogRoot");
        Mail.MoveFlyout.showMoveAllChooserFlyout(dialog, this, this._selection);
        Mail.writeProfilerMark("MoveAllDialogContent_onChooseFolder", Mail.LogEvent.stop);
    };

    Object.defineProperty(MoveAllDialogContent.prototype, "chosenView", {
        get: function () { return this._chosenView; },
        set: function (view) {
            this._chosenView = view;
            this._chooseFolderLink.innerText = view.name;
            if (this._confirmButton) {
                this._confirmButton.disabled = "";
            }
        },
        enumerable: true
    });

    Object.defineProperty(MoveAllDialogContent.prototype, "chosenSweepType", {
        get: function () {
            var selectedTypeRadio = document.querySelector(".mailMoveAllRadio:checked");
            Debug.assert(Jx.isHTMLElement(selectedTypeRadio));

            if (selectedTypeRadio) {
                var sweepType = SweepRules.sweepType[selectedTypeRadio.value];

                Debug.assert(Jx.isNumber(sweepType));

                return sweepType;
            } else {
                return SweepRules.sweepType.moveAll;
            }

        },
        enumerable: true
    });

    Object.defineProperty(MoveAllDialogContent.prototype, "confirmButton", {
        get: function () { return this._confirmButton; },
        set: function (button) {
            this._confirmButton = button;
        },
        enumerable: true
    });

    function onMoveAll(senders, sourceView, chosenView, sweepType) {
        Mail.writeProfilerMark("MoveAllDialog_onMoveAll", Mail.LogEvent.start);
        Debug.assert(Jx.isArray(senders));
        Debug.assert(Jx.isInstanceOf(sourceView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isInstanceOf(chosenView, Mail.UIDataModel.MailView));
        Debug.assert(Jx.isNumber(sweepType));

        senders.forEach(function (sender) {
            Mail.SweepRules.runMoveAllRule(sender.emailAddress, sourceView, chosenView, sweepType);
        });
        Mail.writeProfilerMark("MoveAllDialog_onMoveAll", Mail.LogEvent.stop);
    }

    Mail.showMoveAllDialog = function (selection) {
        Mail.writeProfilerMark("MoveAllDialog_showMoveAllDialog", Mail.LogEvent.start);
        // Create the dialog content.
        var senders = SweepRules.getSenders(selection),
            dialogContent = new MoveAllDialogContent(selection, senders);

        // Create the dialog and set the title and content.
        var dialog = new People.Dialog(Jx.res.getString("mailMoveAllDialogTitle"), dialogContent);

        // Setup the buttons
        var confirmButton = new People.DialogButton("idMoveAllConfirm", Jx.res.getString("mailMoveAllDialogConfirm"), "submit");
        confirmButton.addListener("click", function () {
            var chosenView = dialogContent.chosenView,
                sweepType = dialogContent.chosenSweepType;

            dialog.close(); // Force the dialog to close.
            onMoveAll(senders, selection.view, chosenView, sweepType);
        });
        dialog.buttons.push(confirmButton);
        dialogContent.confirmButton = confirmButton;

        dialog.buttons.push(new People.CloseButton("idMoveAllCancel", Jx.res.getString("mailMoveAllDialogCancel"), dialog));

        if (dialog.show(true/*escapable*/)) {
            confirmButton.disabled = "disabled";
        }
        Mail.writeProfilerMark("MoveAllDialog_showMoveAllDialog", Mail.LogEvent.stop);
    };

});
