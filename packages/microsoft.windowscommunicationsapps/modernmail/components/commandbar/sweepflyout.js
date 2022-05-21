
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*jshint browser:true*/
/*global Mail,Jx,Debug,WinJS,Microsoft */

Jx.delayDefine(Mail, "SweepFlyout", function () {
    "use strict";

    var Plat = Microsoft.WindowsLive.Platform,
        SweepRules = Mail.SweepRules;

    Mail.SweepFlyout = function (selection) {
        Mail.writeProfilerMark("SweepFlyout_constructor", Mail.LogEvent.start);
        Debug.assert(Jx.isObject(selection));

        this._account = selection.account.platformObject;
        this._senders = SweepRules.getSenders(selection);
        this._view = selection.view;

        this._appRoot = document.getElementById(Mail.CompApp.rootElementId);
        this._flyoutContainer = null;
        this._flyout = null;
        this._form = null;
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._onSweepSubmitted = this._onSweepSubmitted.bind(this);
        this._afterHide = this._afterHide.bind(this);
        Mail.writeProfilerMark("SweepFlyout_constructor", Mail.LogEvent.stop);
    };
    Jx.augment(Mail.SweepFlyout, Jx.Component);

    Mail.SweepFlyout._flyoutId = "mailSweepFlyout";

    Mail.SweepFlyout.prototype._getFlyoutHeading = function () {
        var senders = this._senders,
            heading;
        Debug.assert(senders.length > 0);

        if (senders.length === 1) {
            var sender = senders[0],
                senderName = Jx.escapeHtmlToSingleLine(sender.calculatedUIName),
                senderEmail = Jx.escapeHtmlToSingleLine(Jx.res.loadCompoundString("mailSweepFlyoutSenderEmail", sender.emailAddress));
                heading =
                    "<div class='mailSweepHeading' role='heading' aria-labelledby='mailSweepFlyoutHeader, mailSweepSenderName, mailSweepSenderEmail'>" +
                        "<div id='mailSweepFlyoutHeader'>" + Jx.escapeHtml(Jx.res.getString("mailSweepFlyoutMessagesFrom")) + "</div>" +
                        "<div>" +
                            "<span id='mailSweepSenderName'>" + senderName + "</span> <span id='mailSweepSenderEmail' class='mailSweepSenderEmail'>" + senderEmail + "</span>" +
                        "</div>" +
                    "</div>";
        } else {
            heading =
                "<div class='mailSweepHeading' role='heading' aria-labelledby='mailSweepFlyoutHeader'>" +
                    "<div id='mailSweepFlyoutHeader'>" + Jx.escapeHtml(Jx.res.getString("mailSweepFlyoutMessagesFromPlural")) + "</div>" +
                "</div>";
        }

        return heading;
    };

    Mail.SweepFlyout.prototype.getUI = function (ui) {
        Mail.writeProfilerMark("SweepFlyout_getUI", Mail.LogEvent.start);
        var heading = this._getFlyoutHeading(),
            scopeFolder = SweepRules.getScopeFolder(Plat.MailRuleActionType.move, SweepRules.sweepType.moveAll, this._view),
            moveAllLabel,
            moveAllFutureLabel;

        if (scopeFolder) {
            var scopeFolderName = Mail.UIDataModel.MailFolder.getName(scopeFolder);

            moveAllLabel = Jx.res.loadCompoundString("mailSweepFlyoutDeleteAllInFolder", scopeFolderName);
            moveAllFutureLabel = Jx.res.loadCompoundString("mailSweepFlyoutDeleteAllInFolderAndBlock", scopeFolderName);
        } else {
            moveAllLabel = Jx.res.getString("mailSweepFlyoutDeleteAllInAccount");
            moveAllFutureLabel = Jx.res.getString("mailSweepFlyoutDeleteAllInAccountAndBlock");
        }

        ui.html =
            "<div class='mailFolderDialog'>" +
                "<form class='mailSweepForm'>" +
                    heading +
                    "<label class='mailSweepTypeOption' >" +
                        "<input type='radio' value='moveAll' class='mailSweepRadio' checked='true' >" +
                        Jx.escapeHtmlToSingleLine(moveAllLabel) +
                    "</label>" +
                    "<label class='mailSweepTypeOption' >" +
                        "<input type='radio' value='moveAllFuture' class='mailSweepRadio'  >" +
                        Jx.escapeHtmlToSingleLine(moveAllFutureLabel) +
                    "</label>" +
                    "<label class='mailSweepTypeOption' >" +
                        "<input type='radio' value='moveNotMostRecent' class='mailSweepRadio' >" +
                        Jx.escapeHtmlToSingleLine(Jx.res.getString("mailSweepFlyoutDeleteNotMostRecentInAccount")) +
                    "</label>" +
                    "<label class='mailSweepTypeOption' >" +
                        "<input type='radio' value='moveTenDays' class='mailSweepRadio' >" +
                        Jx.escapeHtmlToSingleLine(Jx.res.getString("mailSweepFlyoutDeleteOlderInAccount")) +
                    "</label>" +
                    "<button id='mailSweepConfirmButton'>" + Jx.res.getString("mailSweepFlyoutButton") + "</button>" +
                "</form>" +
            "</div>";
        Mail.writeProfilerMark("SweepFlyout_getUI", Mail.LogEvent.stop);
    };

    Mail.SweepFlyout.prototype.activateUI = function () {
        Mail.writeProfilerMark("SweepFlyout_activateUI", Mail.LogEvent.start);

        var existingFlyout = document.getElementById(Mail.SweepFlyout._flyoutId),
            sweepButton = document.getElementById("sweep");

        if (existingFlyout) {
            // If an existing flyout is in the DOM, just return. We can't do anything
            // as the last flyout hasn't finished cleaning up yet. This can happen by
            // repeatedly clicking the sweep button with animations enabled.
            return;
        }

        this._flyoutContainer = document.createElement("div");
        this._flyoutContainer.innerHTML = Jx.getUI(this).html;
        this._flyoutContainer.id = Mail.SweepFlyout._flyoutId;
        this._flyout = new WinJS.UI.Flyout(this._flyoutContainer, {});

        this._appRoot.appendChild(this._flyoutContainer);

        this._form = this._flyoutContainer.querySelector(".mailSweepForm");

        // Add the name attribute to all the radio inputs so they behave correctly as a group. This can't be done in getUI()
        // because IE considers the name attribute to be unsafe so it can't be manipulated by using innerHTML.
        Array.prototype.forEach.call(this._flyoutContainer.querySelectorAll(".mailSweepRadio"), function (radio) {
            radio.name = "sweepType";
        });

        this._form.addEventListener("keydown", this._handleKeyDown, true);
        this._form.addEventListener("submit", this._onSweepSubmitted);
        this._flyout.addEventListener("afterhide", this._afterHide, true);

        this._flyout.show(sweepButton, "top", "center");
        Mail.writeProfilerMark("SweepFlyout_activateUI", Mail.LogEvent.stop);
    };

    Mail.SweepFlyout.prototype._handleKeyDown = function (ev) {
        if (event.key === "Enter") {
            this._onSweepSubmitted(ev);
        }
    };

    Mail.SweepFlyout.prototype._onSweepSubmitted = function (ev) {
        Mail.writeProfilerMark("SweepFlyout_onSweepSubmitted", Mail.LogEvent.start);
        ev.preventDefault();
        this._flyout.hide();

        var view = this._view,
            selectedTypeRadio = this._flyoutContainer.querySelector(".mailSweepRadio:checked"),
            sweepType = SweepRules.sweepType[selectedTypeRadio.value];

        Debug.assert(Jx.isNumber(sweepType));

        this._senders.forEach(function (sender) {
            SweepRules.runSweepRule(sender.emailAddress, view, sweepType);
        });
        Mail.writeProfilerMark("SweepFlyout_onSweepSubmitted", Mail.LogEvent.stop);
    };

    Mail.SweepFlyout.prototype._afterHide = function () {
        if (this._flyout) {
            this._flyout.removeEventListener("afterhide", this._afterHide);
        }
        if (this._form) {
            this._form.removeEventListener("keydown", this._handleKeyDown);

            this._form.removeEventListener("submit", this._onSweepSubmitted);
        }
        this._appRoot.removeChild(this._flyoutContainer);
    };

    Mail.SweepFlyout.onSweepButton = function (selection) {
        Mail.writeProfilerMark("SweepFlyout_onSweepButton", Mail.LogEvent.start);
        var sweepFlyout = new Mail.SweepFlyout(selection);
        Mail.Globals.commandManager.showAppBar().then(function () {
            sweepFlyout.activateUI();
        });
        Mail.writeProfilerMark("SweepFlyout_onSweepButton", Mail.LogEvent.stop);
    };
});
