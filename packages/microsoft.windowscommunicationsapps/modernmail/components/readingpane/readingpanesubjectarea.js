
//
// Copyright (C) Microsoft Corporation.  All rights reserved.
//

/*global Jx,Mail,Debug,Windows,toStaticHTML*/
/*jshint browser:true*/

Jx.delayDefine(Mail, "ReadingPaneSubjectArea", function () {
    "use strict";

    Mail.ReadingPaneSubjectArea = function (selection) {
        this._message = null;
        this._messageHook = null;
        this._isCopyNested = false;
        this._selection = selection;
        this._disposer = null;
        this._host = null;
        this._subjectElement = null;
        this._flagElement = null;
    };

    Mail.ReadingPaneSubjectArea.prototype.initialize = function (host) {
        Debug.assert(Jx.isHTMLElement(host));
        Debug.assert(this._host === null, "Why are we initializing ReadingPaneSubjectArea twice?");

        this._host = host;
        this._host.innerHTML = "<div class='mailReadingPaneSubject'></div>" +
                               "<div class='mailReadingPaneFlagGlyph' role='button' tabindex='-1'>" +
                                   "<span aria-hidden='true'>&#xE129;</span>" +
                               "</div>";
        this._subjectElement = this._host.querySelector(".mailReadingPaneSubject");
        this._flagElement = this._host.querySelector(".mailReadingPaneFlagGlyph");

        this._disposer = new Mail.Disposer();
        this._disposer.addMany(
            new Mail.EventHook(this._host, "copy", this._onHostCopy, this, true /* capture */),
            new Mail.EventHook(this._flagElement, "click", this._onFlagGlyphClick, this),
            new Mail.EventHook(this._flagElement, "mouseout", this._onFlagGlyphMouseOut, this)
        );
    };

    Mail.ReadingPaneSubjectArea.prototype._onHostCopy = function (event) {
        Debug.assert(Jx.isObject(event));

        // Copy the content into the clipboard first;
        if (this._isCopyNested) {
            return;
        }

        Mail.writeProfilerMark("ReadingPaneSubjectArea._onHostCopy", Mail.LogEvent.start);
        this._isCopyNested = true;
        document.execCommand("Copy"); // Recursion.  This causes another call to this handler, which will return early because of this._isCopyNested.
        this._isCopyNested = false;

        // Get the clipboard
        var content = null,
            dataTransfer = Windows.ApplicationModel.DataTransfer;
        try {
            content = dataTransfer.Clipboard.getContent();
        } catch (ex) {
            // Exceptions from clipboard operations can happen if user Alt-tabs away from the app while it is still working on them.
            Jx.log.exception("Copy failed", ex);
            Mail.writeProfilerMark("ReadingPaneSubjectArea._onHostCopy", Mail.LogEvent.stop);
            return;
        }

        // If there is html on the clipboard
        if (content.contains(dataTransfer.StandardDataFormats.html)) {
            content.getHtmlFormatAsync().then(function (htmlContent) {
                // Strip it down to just the actual fragment
                htmlContent = dataTransfer.HtmlFormatHelper.getStaticFragment(htmlContent);

                var clipboardContent = new dataTransfer.DataPackage();
                clipboardContent.properties.applicationName = window.location.href;
                clipboardContent.setHtmlFormat(dataTransfer.HtmlFormatHelper.createHtmlFormat(htmlContent));

                // Even after clearing the style element text, IE will still claim there is a *double* carriage return
                // in between every block element.  To correct this we cut them down to single carriage returns.
                var constructedContent = document.createElement("div");
                constructedContent.innerHTML = toStaticHTML(htmlContent);
                clipboardContent.setText(constructedContent.innerText.replace(/\r\n\r\n/g, "\r\n"));

                try {
                    // Set the new clipboard content
                    dataTransfer.Clipboard.setContent(clipboardContent);
                } catch (ex) {
                    // Exceptions from clipboard operations can happen if user Alt-tabs away from the app while it is still working on them.
                    Jx.log.exception("Copy failed", ex);
                    Mail.writeProfilerMark("ReadingPaneSubjectArea._onHostCopy", Mail.LogEvent.stop);
                }
            }).done(null, function (errorObject) { Debug.assert(false, errorObject); });
        }

        // The contents of the clipboard are now modified (or will be after async completes).
        // Prevent default behavior from replacing it.
        event.preventDefault();

        Mail.writeProfilerMark("ReadingPaneSubjectArea._onHostCopy", Mail.LogEvent.stop);
    };

    Mail.ReadingPaneSubjectArea.prototype._onFlagGlyphClick = function () {
        var message = this._message,
            Instr = Mail.Instrumentation,
            cmd = message.flagged ? Instr.Commands.unflag : Instr.Commands.flag;
        this._selection.setFlagState(!message.flagged, [message]);
        this._flagElement.classList.add("pressed");
        Instr.instrumentTriageCommand(cmd, Instr.UIEntryPoint.onCanvas, this._selection);
    };

    Mail.ReadingPaneSubjectArea.prototype._onFlagGlyphMouseOut = function () {
        this._flagElement.classList.remove("pressed");
    };

    Mail.ReadingPaneSubjectArea.prototype.dispose = function () {
        Jx.dispose(this._disposer);
    };

    Mail.ReadingPaneSubjectArea.prototype.setMessage = function (message) {
        Debug.assert(message === null || Jx.isInstanceOf(message, Mail.UIDataModel.MailMessage));
        Mail.writeProfilerMark("ReadingPaneSubjectArea.setMessage", Mail.LogEvent.start);

        this._message = message;

        var hook = null;
        if (message) {
            hook = new Mail.EventHook(message, "changed", this._messageChanged, this);
            this._update();
            this._host.classList.remove("hidden");
        }
        this._messageHook = this._disposer.replace(this._messageHook, hook);

        Mail.writeProfilerMark("ReadingPaneSubjectArea.setMessage", Mail.LogEvent.stop);
    };

    Mail.ReadingPaneSubjectArea.prototype._messageChanged = function (event) {
        Debug.assert(Jx.isObject(event));
        Debug.assert(Jx.isInstanceOf(this._message, Mail.UIDataModel.MailMessage));

        var validators = Mail.Validators;
        if (validators.hasPropertyChanged(event, "subject")) {
            this._updateSubject();
        }

        if (validators.hasPropertyChanged(event, "flagged")) {
            this._updateFlagGlyph();
        }
    };

    Mail.ReadingPaneSubjectArea.prototype._update = function () {
        this._updateSubject();
        this._updateFlagGlyph();
    };

    Mail.ReadingPaneSubjectArea.prototype._updateSubject = function () {
        var message = this._message,
            subjectElement = this._subjectElement;

        Debug.assert(Jx.isNonEmptyString(message.subjectHTML));

        Mail.applyDirection(subjectElement, message.subject);
     
        subjectElement.innerHTML = this._getDraftPrefix() + message.subjectHTML;
        Jx.setClass(subjectElement, "unread", !message.read);
        Mail.setAttribute(subjectElement, "aria-label", message.subject);
        Jx.setClass(subjectElement, "mailReadingPaneSubjectSelection", message.irmCanExtractContent);
    };

    Mail.ReadingPaneSubjectArea.prototype._updateFlagGlyph = function () {
        var message = this._message,
            flagElement = this._flagElement,
            canChangeFlagState = message.canFlag,
            flagged = message.flagged,
            flagTooltipResId = null;

        if (!canChangeFlagState) { // If we cannot change the flag state
            Mail.setAttribute(flagElement, "disabled", "disabled");
            if (!flagged) {
                // Hide the flag if the message is unflagged and the user is not allowed to flag it
                flagElement.classList.add("hidden");
            }
            flagTooltipResId = "mailReadingPaneFlaggedTooltip";
        } else {
            flagElement.removeAttribute("disabled");
            flagElement.classList.remove("hidden");
            flagTooltipResId = flagged ? "mailReadingPaneUnflagTooltip" : "mailReadingPaneFlagTooltip";
        }

        Jx.setClass(flagElement, "flagged", flagged);

        var tooltip = Jx.res.getString(flagTooltipResId);
        Mail.setAttribute(flagElement, "title", tooltip);
        Mail.setAttribute(flagElement, "aria-label", tooltip);
    };

    Mail.ReadingPaneSubjectArea.prototype._getDraftPrefix = function () {
        if (!this._message.isDraft) {
            return "";
        }

        return "<span aria-hidden='true' class='hideOnReload mailReadingPaneSubjectDraftPrefix typeSize16pt'>" +
            Jx.escapeHtml(Jx.res.getString("mailMessageListDraftPrefix")) + "</span>";
    };

});
